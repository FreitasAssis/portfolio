'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'portfolio:themechange';

/**
 * O `<html>` é a fonte de verdade do tema, e não o `localStorage`: quando este
 * componente monta, o script anti-flash do layout já resolveu escolha salva ×
 * preferência do sistema e escreveu o resultado ali. Ler o DOM dá a resposta
 * certa nos dois casos sem repetir a regra.
 */
function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Em build time não existe DOM, logo o tema é desconhecido — e é exatamente
 *  isso que o HTML estático precisa dizer, sob pena de divergir na hidratação. */
function unknownTheme(): null {
  return null;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    // Gravar 'light' explicitamente é obrigatório, não simetria estética: se a
    // volta ao claro apenas apagasse a chave, o script anti-flash cairia de novo
    // na preferência do sistema no próximo load e desfaria a escolha — quem usa
    // o sistema no escuro nunca conseguiria fixar o claro.
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Safari em navegação privada nega o storage. A troca já valeu para esta
    // sessão; perder a persistência é degradação aceitável.
  }
  // Evento síncrono: quem estiver lendo o tema re-renderiza no mesmo tick.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Toggle manual de tema (§9). Botão de verdade, alcançável por teclado, com o
 * anel de foco vindo do `globals.css`.
 *
 * Hidratação: sob `output: 'export'` este componente é renderizado em build
 * time, onde não existe `localStorage` nem `matchMedia`. O tema é estado
 * externo ao React (vive num atributo do `<html>`), então quem o lê é o
 * `useSyncExternalStore` — que aceita um snapshot de servidor separado. O HTML
 * do build sai com `null` e a hidratação bate por construção; logo depois o
 * React troca para o valor lido do DOM.
 *
 * O que o usuário VÊ não espera por isso: os dois ícones vão no HTML e quem
 * aparece é decidido por CSS (variante `dark:`, que lê o mesmo `data-theme`
 * que o script anti-flash já escreveu antes da primeira pintura).
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, unknownTheme);

  function toggle() {
    applyTheme((theme ?? readTheme()) === 'dark' ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Nome fixo + estado no aria-pressed: é assim que um botão de alternância
      // se anuncia. Trocar o nome junto com o estado faz o leitor de tela ler
      // duas mudanças onde houve uma.
      aria-label="Tema escuro"
      // Antes de montar não sabemos o estado — e afirmar "não pressionado"
      // mentiria para quem chega no escuro. Ausente é o único valor honesto.
      aria-pressed={theme === null ? undefined : theme === 'dark'}
      className="-m-2 cursor-pointer p-2 text-ink-2 hover:text-ink"
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  );
}

/* Ícones desenhados em traço, herdando currentColor e o tamanho da fonte. Não
   são imagem no sentido do §6.5 (que trata do conteúdo da página: prints e
   retrato) — são a affordance do controle, e o §6.4 pede exatamente isso:
   discrição. */

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
    </svg>
  );
}
