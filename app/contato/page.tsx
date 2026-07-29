import type { Metadata } from 'next';

import { ContactPaths } from '@/components/ContactPaths';
import { Container } from '@/components/Container';
import { Portrait } from '@/components/Portrait';
import { EMAIL, GITHUB, LINKEDIN } from '@/content/contact';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.contato, path: '/contato' });

/**
 * `/contato` (§3.4): os dois caminhos do §3.4 em tamanho de página, mais o
 * "e-mail em texto copiável, GitHub, LinkedIn" que o brief pede em seguida.
 *
 * **Sem formulário.** §3.4 e §11 concordam: "formulário some no spam e não dá
 * confirmação; `mailto:` e link direto convertem melhor e não precisam de
 * backend". Não existe `<form>` nesta página, e há teste que falha se nascer um.
 *
 * **O retrato está aqui, e não na home** (§6.5: "no /sobre e em versão pequena
 * no bloco de contato"). Esta página é o bloco de contato em tamanho inteiro; o
 * da home é o eco condensado dele, e é onde a economia da tese pesa mais. Se o
 * Luiz preferir a leitura contrária, é uma linha: um `<Portrait size="inline"/>`
 * dentro do `ContactBlock`.
 *
 * A linha "de qualquer forma" existe para quem não se reconhece em nenhum dos
 * dois caminhos: sem ela, um terceiro tipo de visitante teria que escolher uma
 * caixa errada para achar o endereço. É a mesma lista do rodapé, dita uma vez
 * onde a pessoa veio procurar.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */

const ANYWAY = [
  { href: `mailto:${EMAIL}`, label: EMAIL, external: false },
  { href: GITHUB, label: 'github.com/FreitasAssis', external: true },
  { href: LINKEDIN, label: 'linkedin.com/in/luiz-dev', external: true },
] as const;

export default function ContatoPage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Contato</h1>
        <p className="prose-measure mt-6 text-ink">
          Escolha o caminho que descreve você. Os dois chegam no mesmo e-mail.
        </p>
      </Container>

      <Container as="section" className="pt-10">
        <ContactPaths as="h2" />
      </Container>

      <Container as="section" className="pt-14">
        <h2 className="font-display text-xl font-bold tracking-tight">De qualquer forma</h2>
        <div className="mt-6 flex flex-wrap items-start gap-x-10 gap-y-6">
          <ul className="space-y-2 font-mono text-xs">
            {ANYWAY.map(({ href, label, external }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-accent-text underline underline-offset-4"
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {/* §6.5: "em versão pequena no bloco de contato". Pequena de verdade —
              é sinal de que existe uma pessoa do outro lado, não um retrato de
              galeria. O grande vive no /sobre. */}
          <Portrait size="inline" />
        </div>
      </Container>
    </>
  );
}
