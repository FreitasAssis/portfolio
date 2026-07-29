import { Container } from '@/components/Container';
import { formatPeriod } from '@/components/TimelineCondensed';
import { type Experience, experience } from '@/content/experience';

/**
 * A trajetória com conteúdo (§3.2 → §4.5): as cinco posições com `built`,
 * `impact` e `stack`, datas em mono (§6.3).
 *
 * Nenhuma palavra sobre a carreira nasce aqui. Tudo o que este arquivo escreve
 * são **rótulos de interface** — `em paralelo`, `fio contínuo` e o separador —,
 * e cada um deles está listado em tests/unit/projetos.test.tsx, que remonta o
 * texto da seção inteira a partir de `content/experience.ts` e compara. Frase
 * de carreira escrita à mão quebra lá. A regra não é purismo: foi assim que a
 * imprecisão entrou uma vez ("a plataforma da Analytica nasceu na Opah IT"
 * achatava três projetos em três times a um só).
 *
 * ---
 *
 * ## As duas marcas, e por que elas não podem se parecer
 *
 * A seção carrega dois sinais que são **opostos** e que se encontram na mesma
 * posição — a Opah IT tem os dois:
 *
 * - **sobreposição** (`em paralelo`) = duas coisas DIFERENTES ao mesmo tempo.
 *   Simultaneidade. Sem o rótulo parece erro de data; com ele, é capacidade
 *   (§4.5).
 * - **fio contínuo** (`thread`) = a MESMA coisa atravessando duas posições no
 *   tempo. Continuidade. É o ativo mais forte da timeline: a plataforma nasce
 *   na Opah e continua até hoje, quase cinco anos no mesmo produto.
 *
 * Se as duas usarem linguagem visual parecida, elas se anulam — e isso já
 * aconteceu de verdade: numa versão anterior, na home, uma régua vertical sem
 * legenda abraçava Analytica + Opah e um leitor real perguntou se aquilo era a
 * sobreposição. Era o fio.
 *
 * Então elas divergem em quatro eixos independentes, nenhum deles cor (§9
 * proíbe depender de cor, e §6.4 raciona movimento e ornamento — a solução é
 * tipográfica e estrutural):
 *
 * | | sobreposição | fio contínuo |
 * |---|---|---|
 * | forma | caixa FECHADA (borda nos quatro lados) | régua ABERTA, só à esquerda |
 * | eixo | horizontal, uma linha | vertical, ao lado de um parágrafo |
 * | lugar | no cabeçalho, junto das DATAS — é nota sobre o tempo | no corpo, colado ao `impact` — é nota sobre o TRABALHO |
 * | quantidade | uma por posição, texto diferente em cada | duas, idênticas, em posições vizinhas, apontando uma para a outra |
 *
 * A seta é o que resolve o "sem legenda": duas marcas iguais, uma apontando
 * para baixo e a outra para cima, no mesmo eixo vertical, leem como as duas
 * pontas de uma coisa só. A caixa não aponta para lugar nenhum — ela se fecha.
 *
 * Em 360px nada disso depende de margem lateral: a caixa é inline e quebra
 * linha dentro da coluna, e a régua custa 1rem de recuo do texto que ela marca.
 */

/**
 * Onde está, NA PÁGINA, a outra ponta do fio — `↓` se abaixo, `↑` se acima.
 *
 * Derivado da ordem do dado, não escrito à mão: se a lista mudar de ordem, as
 * setas viram junto. `null` quando a posição não tem fio (ou quando o fio ficou
 * com uma ponta só, o que tests/unit/experience.test.ts não deixa acontecer).
 */
export function threadArrow(index: number, items: readonly Experience[] = experience): '↑' | '↓' | null {
  const item = items[index];
  if (!item?.thread) return null;
  const outra = items.findIndex((e, i) => i !== index && e.thread === item.thread);
  if (outra === -1) return null;
  return outra > index ? '↓' : '↑';
}

/** Rótulos de interface desta seção. Exportados porque o teste que remonta o
 *  texto precisa saber exatamente quais palavras não vêm do dado. */
export const CHROME = {
  parallel: 'em paralelo',
  thread: 'fio contínuo',
  separator: ' · ',
} as const;

/**
 * A sobreposição do §4.5 — caixa fechada, no cabeçalho, junto das datas.
 *
 * O texto nomeia a contraparte porque é isso que o dado carrega ("ez.devs e
 * Opah IT, de mar a dez/2021"): rotular sem dizer com quem só troca uma dúvida
 * por outra.
 */
function Parallel({ value }: { value: string }) {
  return (
    <p className="mt-3 inline-block border border-ink-2 px-2.5 py-1 font-mono text-xs text-ink-2">
      <span className="tracking-[0.08em] uppercase">{CHROME.parallel}</span>
      {CHROME.separator}
      {value}
    </p>
  );
}

/**
 * O `impact` da posição. Com fio, ele ganha a régua e o rótulo; sem fio, é um
 * parágrafo como qualquer outro.
 *
 * **O marcador SINALIZA; quem narra é o `impact`.** A narrativa do fio já está
 * curada no §4.5 e não precisa de frase nova: o `impact` da Opah diz "o
 * terceiro projeto é o mesmo em que sigo até hoje, já no time próprio do
 * cliente" e o da Analytica diz "acompanho o produto desde a concepção". Juntos
 * dão as duas pontas e a continuidade — e preservam que na Opah houve **três**
 * projetos em times distintos, que é onde a frase inventada errou.
 */
function Impact({ item, arrow }: { item: Experience; arrow: '↑' | '↓' | null }) {
  if (arrow === null) return <p className="mt-4 leading-relaxed">{item.impact}</p>;

  return (
    // A régua é `border-ink` (e não o cinza do `rule`) porque ela precisa ser o
    // elemento mais escuro da entrada: é o único lugar da seção onde o §4.5
    // manda destacar. `pl-4` são 16px de recuo — cabe em 360px sem apertar a
    // medida (a coluna de leitura entrega ~66 caracteres aqui, dentro da faixa
    // do §6.3).
    <div className="mt-4 border-l-2 border-ink pl-4">
      <p className="font-mono text-xs text-ink">
        {CHROME.thread} <span aria-hidden="true">{arrow}</span>
      </p>
      <p className="mt-2 leading-relaxed">{item.impact}</p>
    </div>
  );
}

export function Timeline() {
  return (
    // `id` é alvo da âncora vinda da Trajetória condensada da home: quem clica em
    // "Ver detalhe de cada posição" quer as posições, não o topo da página.
    // `scroll-mt-8` evita que o h2 encoste na borda superior da viewport no salto.
    <Container as="section" width="reading" id="experiencia" className="scroll-mt-8 py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Experiência profissional</h2>

      <ul className="mt-10">
        {experience.map((item, i) => (
          <li key={item.company} className="border-t border-rule py-10 first:border-t-0 first:pt-0">
            {/* §6.3: mono é para metadado — datas, modalidade, stack. */}
            <p className="font-mono text-xs text-ink-2">
              {formatPeriod(item)}
              {CHROME.separator}
              {item.mode}
            </p>

            <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
              {item.company}
              <span className="font-normal text-ink-2">
                {CHROME.separator}
                {item.role}
              </span>
            </h3>

            {item.parallel && <Parallel value={item.parallel} />}

            <p className="mt-5 leading-relaxed">{item.built}</p>

            <Impact item={item} arrow={threadArrow(i)} />

            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-ink-2">
              {item.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Container>
  );
}
