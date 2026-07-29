'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Container } from '@/components/Container';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * As rotas do §3. `/notas` está previsto no roteamento mas fora de escopo
 * (§11): não existe página e, enquanto não existir, não pode ser linkado —
 * link para 404 é pior que ausência. Quando a rota nascer, entra aqui.
 */
const ROUTES = [
  { href: '/projetos', label: 'Projetos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
] as const;

/** Um case (`/projetos/asafe`) ainda é "Projetos" para quem está se localizando. */
function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Cliente por causa do `usePathname`, que marca a rota atual. O ThemeToggle já
 * traria JS para cá de qualquer forma.
 *
 * Tipografia: cabeçalho inteiro em mono. O §6.3 reserva a display para h1/h2, e
 * nav e assinatura são metadado — a mesma família das datas da timeline e dos
 * nomes de stack.
 */
export function Header() {
  const pathname = usePathname() ?? '/';

  return (
    // `id="topo"` é o alvo do "Voltar ao topo" do fim de um case
    // (`components/CaseEndNav.tsx`). Fica aqui, e não num `href="#"` vazio, por
    // uma razão de teclado: seguir um fragmento NOMEADO move o ponto de partida
    // da navegação sequencial para o elemento alvo, então o próximo Tab
    // continua a partir do cabeçalho — que é onde a navegação do site está, e é
    // exatamente o que quem pediu o topo quer. Com `#`, a página rola e o foco
    // fica para trás, no rodapé.
    // O elo é uma string dos dois lados, como o `#experiencia` da Timeline;
    // quem impede a quebra silenciosa é o e2e, que CLICA e mede onde parou.
    <header id="topo" className="border-b border-rule">
      {/* flex-wrap em vez de menu: em 360px a nav cai para a linha de baixo e
          continua uma linha de links, sem hambúrguer e sem animação (§6.4). */}
      <Container
        width="wide"
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 font-mono"
      >
        <Link href="/" className="text-sm font-medium text-ink hover:text-accent-text">
          Luiz Freitas
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label="Principal">
            <ul className="flex items-center gap-4 text-xs sm:gap-6 sm:text-sm">
              {ROUTES.map(({ href, label }) => {
                const current = isCurrent(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={current ? 'page' : undefined}
                      className={
                        current
                          ? 'text-ink underline decoration-accent-text decoration-2 underline-offset-4'
                          : 'text-ink-2 hover:text-ink'
                      }
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
