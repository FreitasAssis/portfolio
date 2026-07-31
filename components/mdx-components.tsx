import type { MDXComponents } from 'mdx/types';
import { MDXRemote } from 'next-mdx-remote/rsc';

import type { Decision, StackItem } from '@/lib/projects';

/**
 * O mapa de elementos do corpo do case. A medida de leitura não é imposta aqui
 * elemento a elemento: ela vem do contêiner que envolve o corpo.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-16 font-display text-xl font-bold tracking-tight text-ink" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-10 font-display text-lg font-semibold tracking-tight text-ink" {...props} />
  ),
  p: (props) => <p className="mt-5 leading-relaxed text-ink" {...props} />,
  ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-5 text-ink" {...props} />,
  ol: (props) => <ol className="mt-5 list-decimal space-y-2 pl-5 text-ink" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a className="text-accent-text underline underline-offset-4" {...props} />
  ),
  strong: (props) => <strong className="font-semibold" {...props} />,
  code: (props) => (
    <code
      className="bg-paper-2 px-1.5 py-0.5 font-mono text-sm text-ink [overflow-wrap:anywhere]"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 border-accent pl-4 text-ink-2 italic" {...props} />
  ),
  hr: () => <hr className="mt-12 border-rule" />,
};

/**
 * O mapa restrito para a prosa que mora no FRONTMATTER — o `because` de cada
 * decisão e o `why` de cada item da stack. Restrito e não o `mdxComponents`
 * inteiro porque esses campos são parágrafos, não documentos; quem recusa
 * construção de bloco neles é o `parseProject`.
 */
const prosaComponents: MDXComponents = {
  p: (props) => <p className="leading-relaxed" {...props} />,
  // `overflow-wrap:anywhere` e não `break-words`: os dois quebram a palavra, mas
  // só `anywhere` conta a quebra no cálculo de min-content — e é o min-content que
  // dimensiona a trilha `1fr` da grade de cada decisão. Com `break-words`,
  // `repertoire.liturgical_snapshot` estoura a trilha e a página ganha 26px de
  // rolagem horizontal a 360px.
  code: (props) => (
    <code
      className="bg-paper-2 px-1.5 py-0.5 font-mono text-sm text-ink [overflow-wrap:anywhere]"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  a: (props) => (
    <a className="text-accent-text underline underline-offset-4" {...props} />
  ),
};

/** Um campo de prosa do frontmatter, compilado como MDX em tempo de build. */
function Prosa({ source, className = '' }: Readonly<{ source: string; className?: string }>) {
  return (
    <div className={`space-y-4 ${className}`}>
      <MDXRemote source={source} components={prosaComponents} />
    </div>
  );
}

/**
 * A frase de cada decisão é montada aqui, e não escrita no conteúdo: é o que
 * garante que o "em vez de" — a parte que prova que houve escolha, e não só
 * adoção — sobreviva a qualquer case futuro.
 */
export function Decisoes({ items }: { items: readonly Decision[] }) {
  return (
    <section aria-labelledby="decisoes" className="mt-16 border-t-2 border-accent pt-8">
      <h2 id="decisoes" className="font-display text-2xl font-bold tracking-tight text-ink">
        Decisões
      </h2>
      <ol className="mt-8 space-y-10">
        {items.map((decision, index) => (
          <li key={decision.chose} className="grid grid-cols-[2.5rem_1fr] gap-x-2">
            <span aria-hidden className="pt-1.5 font-mono text-sm text-accent-text">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="font-display text-lg leading-snug font-semibold tracking-tight text-ink">
                Escolhi <span className="text-accent-text">{decision.chose}</span> em vez de{' '}
                {decision.insteadOf}.
              </p>
              <Prosa source={decision.because} className="mt-3 text-ink-2" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Sem `why`, o item é só o nome e a grade de duas colunas não chega a existir na
 * linha: um traço na coluna vazia leria como campo por preencher. É `ul` e não
 * `dl` por isso — um `dt` sem `dd` é `dl` inválido.
 */
export function Stack({ items }: { items: readonly StackItem[] }) {
  return (
    <section aria-labelledby="stack" className="mt-16 border-t border-rule pt-8">
      <h2 id="stack" className="font-display text-xl font-bold tracking-tight text-ink">
        Stack
      </h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li
            key={item.name}
            className={item.why ? 'sm:grid sm:grid-cols-[11rem_1fr] sm:gap-x-4' : undefined}
          >
            <span className="font-mono text-sm text-ink">{item.name}</span>
            {item.why && <Prosa source={item.why} className="text-ink-2" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
