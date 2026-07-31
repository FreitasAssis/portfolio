'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const CHANGE_EVENT = 'portfolio:themechange';

/**
 * O `<html>` é a fonte de verdade do tema, e não o `localStorage`: o script
 * anti-flash do layout já resolveu escolha salva × preferência do sistema e
 * escreveu o resultado ali antes deste componente montar.
 */
function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Snapshot de servidor: em build time não existe DOM, e `null` é o único valor
 *  que não divergir na hidratação — 'light' mentiria para quem chega no escuro. */
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
    // Gravar 'light' explicitamente, nunca `removeItem`: sem a chave, o script
    // anti-flash cai de novo na preferência do sistema no próximo load e quem usa
    // o sistema no escuro nunca consegue fixar o claro.
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Safari em navegação privada nega o storage. A troca já valeu para esta
    // sessão; perder a persistência é degradação aceitável.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Toggle manual de tema. O tema é estado externo ao React (vive num atributo do
 * `<html>`), então quem o lê é o `useSyncExternalStore`, que aceita um snapshot
 * de servidor separado. O que o usuário vê não espera pela hidratação: os dois
 * ícones vão no HTML e quem aparece é decidido por CSS.
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
      // Nome FIXO, com o estado só no aria-pressed: trocar o nome junto com o
      // estado faz o leitor de tela ler duas mudanças onde houve uma.
      aria-label="Tema escuro"
      aria-pressed={theme === null ? undefined : theme === 'dark'}
      className="-m-2 cursor-pointer p-2 text-ink-2 hover:text-ink"
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  );
}

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
