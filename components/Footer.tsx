import { Container } from '@/components/Container';

/** O e-mail aparece por extenso para ser copiável: um link escrito "e-mail" não
 *  se copia. */
const LINKS = [
  { href: 'mailto:luiz_dev@outlook.com', label: 'luiz_dev@outlook.com', external: false },
  { href: 'https://github.com/FreitasAssis', label: 'github.com/FreitasAssis', external: true },
  {
    href: 'https://www.linkedin.com/in/luiz-dev',
    label: 'linkedin.com/in/luiz-dev',
    external: true,
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <Container
        width="wide"
        className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-10 font-mono text-xs text-ink-2"
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map(({ href, label, external }) => (
            <li key={href}>
              <a
                href={href}
                className="hover:text-ink"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p>© {new Date().getFullYear()} Luiz Freitas</p>
      </Container>
    </footer>
  );
}
