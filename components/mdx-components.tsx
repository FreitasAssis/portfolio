import type { MDXComponents } from 'mdx/types';
import { MDXRemote } from 'next-mdx-remote/rsc';

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
 * decisão e o `why` de cada item da stack.
 *
 * Por que existe um segundo mapa: o `because` é o texto mais importante do
 * site e ele estava saindo como texto puro, num `<p>` só. Isso custava duas
 * coisas concretas. Sem parágrafo, a decisão dos dois eixos do Asafe virou um
 * bloco de 171 palavras — o item que mais precisa ser lido é o que mais
 * convida a desistir no meio. E sem `code`, `song_content` e
 * `rounds.loser_unit_ids` saíam em serifada no meio da frase, justamente nos
 * dois cases cujo argumento é modelagem de dados.
 *
 * Por que restrito e não o `mdxComponents` inteiro: o `because` não é um
 * documento, é um parágrafo (ou três). Um `##` aqui dentro entraria na lista
 * de `<h2>` da página e quebraria o índice do §3.3; uma lista ou uma imagem
 * quebrariam o ritmo da seção. Quem fecha essa porta de verdade é o
 * `parseProject`, que recusa construção de bloco no campo — este mapa só
 * estiliza o que sobrou.
 */
const prosaComponents: MDXComponents = {
  p: (props) => <p className="leading-relaxed" {...props} />,
  // `text-ink` sobre a prosa em `text-ink-2`: o identificador ganha o mesmo
  // degrau de contraste que tem no corpo do case.
  //
  // `overflow-wrap:anywhere` e não `break-words`: os dois deixam a palavra
  // quebrar, mas só `anywhere` conta a quebra no cálculo de min-content — e é
  // o min-content que dimensiona a trilha `1fr` da grade de cada decisão. Com
  // `break-word`, `repertoire.liturgical_snapshot` (30 caracteres em mono, sem
  // ponto de quebra natural) estourava a trilha e a página inteira ganhava
  // 26px de rolagem horizontal a 360px, contra o §9.
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

/**
 * Um campo de prosa do frontmatter, compilado como MDX em tempo de build.
 *
 * O `space-y-4` mora aqui e não no mapa porque é o espaço ENTRE parágrafos: no
 * mapa ele viraria margem do primeiro também, e o campo deixaria de encostar
 * no que vem acima dele.
 */
function Prosa({ source, className = '' }: Readonly<{ source: string; className?: string }>) {
  return (
    <div className={`space-y-4 ${className}`}>
      <MDXRemote source={source} components={prosaComponents} />
    </div>
  );
}

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
              <Prosa source={decision.because} className="mt-3 text-ink-2" />
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
 *
 * CUIDADO AO EDITAR — escolha óbvia não ganha um traço no lugar do porquê. A
 * versão anterior punha `—` na segunda coluna quando `why` era `null`, e as
 * duas primeiras linhas do Asafe (Next.js, TypeScript) liam como campo que
 * ficou por preencher, e não como "não há o que explicar aqui". Sem porquê, o
 * item é só o nome, e a grade de duas colunas nem chega a existir naquela
 * linha — o que some é a coluna vazia, não a tecnologia.
 *
 * É `ul` e não `dl` por causa disso: um `dt` sem `dd` é `dl` inválido, e
 * inventar um `dd` vazio só para satisfazer a marcação traz o buraco de volta.
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
