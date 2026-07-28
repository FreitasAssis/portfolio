import type { MDXComponents } from 'mdx/types';

import type { Decision, StackItem } from '@/lib/projects';

/**
 * O mapa de elementos do corpo do case para os tokens do §6.
 *
 * Nada de plugin de tipografia: são doze elementos e a escala já está no
 * `globals.css`. A medida de leitura (65–75 caracteres, §6.3) não é imposta
 * aqui elemento a elemento — ela vem do contêiner que envolve o corpo, senão
 * cada regra nova teria que lembrar de repeti-la.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-16 font-display text-xl font-bold tracking-tight text-ink" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-10 font-display text-lg font-semibold tracking-tight text-ink" {...props} />
  ),
  // O corpo herda --font-body do <html> (§6.3: serifa no corpo, não no display).
  p: (props) => <p className="mt-5 leading-relaxed text-ink" {...props} />,
  ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-5 text-ink" {...props} />,
  ol: (props) => <ol className="mt-5 list-decimal space-y-2 pl-5 text-ink" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    // §6.2: --accent-text é o único token permitido em texto e link.
    <a className="text-accent-text underline underline-offset-4" {...props} />
  ),
  strong: (props) => <strong className="font-semibold" {...props} />,
  code: (props) => (
    <code className="bg-paper-2 px-1.5 py-0.5 font-mono text-sm text-ink" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 border-accent pl-4 text-ink-2 italic" {...props} />
  ),
  hr: () => <hr className="mt-12 border-rule" />,
};

/**
 * A seção que carrega o site (§2). Ela é a única coisa que prova senioridade
 * num formato que recrutador e cliente entendem igual, e o §3.3 avisa: sem
 * ela, o case é vitrine.
 *
 * Por isso ela tem peso tipográfico acima das irmãs — h2 um degrau maior, régua
 * na cor do projeto em vez da régua neutra, e cada item numerado em mono. A
 * frase de cada item é montada aqui, não escrita no conteúdo: é o que garante
 * que o "em vez de" — a parte que prova que houve escolha, e não só adoção —
 * sobreviva a todo case futuro.
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
              <p className="mt-3 leading-relaxed text-ink-2">{decision.because}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * §3.3: a stack vem "com o porquê de cada escolha não-óbvia" — e o §2 manda a
 * tecnologia aparecer sempre grudada num projeto, nunca flutuando sozinha.
 * Nome em mono (metadado, §6.3), porquê no corpo serifado.
 */
export function Stack({ items }: { items: readonly StackItem[] }) {
  return (
    <section aria-labelledby="stack" className="mt-16 border-t border-rule pt-8">
      <h2 id="stack" className="font-display text-xl font-bold tracking-tight text-ink">
        Stack
      </h2>
      <dl className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.name} className="sm:grid sm:grid-cols-[11rem_1fr] sm:gap-x-4">
            <dt className="font-mono text-sm text-ink">{item.name}</dt>
            <dd className="leading-relaxed text-ink-2">{item.why ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
