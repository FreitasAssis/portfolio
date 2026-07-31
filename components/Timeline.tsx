import { Container } from '@/components/Container';
import { formatPeriod } from '@/components/TimelineCondensed';
import { type Experience, experience } from '@/content/experience';

/**
 * Nenhuma palavra sobre a carreira nasce aqui: tudo o que este arquivo escreve
 * são os rótulos de interface do `CHROME` abaixo, e
 * `tests/unit/projetos.test.tsx` remonta a seção inteira a partir de
 * `content/experience.ts` — frase de carreira escrita à mão quebra lá.
 *
 * As duas marcas da seção são opostas (`em paralelo` = duas coisas diferentes ao
 * mesmo tempo; `fio contínuo` = a mesma coisa atravessando duas posições) e a
 * Opah IT tem as duas. Se ficarem parecidas, se anulam — daí divergirem em forma,
 * eixo, lugar e direção, e em nenhum deles cor.
 */

/**
 * Onde está, NA PÁGINA, a outra ponta do fio — `↓` se abaixo, `↑` se acima.
 * Derivado da ordem do dado, então as setas viram junto se a lista reordenar.
 */
export function threadArrow(index: number, items: readonly Experience[] = experience): '↑' | '↓' | null {
  const item = items[index];
  if (!item?.thread) return null;
  const outra = items.findIndex((e, i) => i !== index && e.thread === item.thread);
  if (outra === -1) return null;
  return outra > index ? '↓' : '↑';
}

/** Rótulos de interface desta seção — as únicas palavras daqui que não vêm do
 *  dado. Exportados para o teste que remonta o texto. */
export const CHROME = {
  parallel: 'em paralelo',
  thread: 'fio contínuo',
  separator: ' · ',
} as const;

/** A sobreposição: caixa fechada, no cabeçalho, junto das datas. */
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
 * O marcador SINALIZA; quem narra é o `impact`, que já é texto curado. Nada de
 * frase nova ao lado dele.
 */
function Impact({ item, arrow }: { item: Experience; arrow: '↑' | '↓' | null }) {
  if (arrow === null) return <p className="mt-4 leading-relaxed">{item.impact}</p>;

  return (
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
    // `id` é o alvo da âncora vinda da Trajetória condensada da home;
    // `scroll-mt-8` evita que o h2 encoste no topo da viewport no salto.
    <Container as="section" width="reading" id="experiencia" className="scroll-mt-8 py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Experiência profissional</h2>

      <ul className="mt-10">
        {experience.map((item, i) => (
          <li key={item.company} className="border-t border-rule py-10 first:border-t-0 first:pt-0">
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
