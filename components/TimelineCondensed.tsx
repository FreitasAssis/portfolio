import Link from 'next/link';

import { Container } from '@/components/Container';
import { type Experience, experience } from '@/content/experience';

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

/** "2023-03" → "mar/2023". Formatação à mão em vez de `Intl`: o dado é ano-mês,
 *  não um instante, e `new Date('2023-03')` traz fuso junto — em UTC-3 vira
 *  fevereiro. */
function formatMonth(iso: string): string {
  const [year, month] = iso.split('-');
  return `${MONTHS[Number(month) - 1]}/${year}`;
}

function formatPeriod(item: Experience): string {
  return `${formatMonth(item.start)} — ${item.end ? formatMonth(item.end) : 'atual'}`;
}

/**
 * §4.5: "o fio contínuo é o ativo mais forte da timeline... se a timeline
 * mostrar Opah e Analytica como blocos sem relação, o melhor argumento do
 * currículo desaparece." Uma linha em cada posição, e o texto nomeia a outra
 * ponta — sem isso o leitor precisa deduzir a ligação.
 */
function threadNote(item: Experience): string | null {
  if (!item.thread) return null;
  const others = experience
    .filter((e) => e.thread === item.thread && e.company !== item.company)
    .map((e) => e.company)
    .join(' e ');
  const verb = item.end === null ? 'nasceu na' : 'continua na';
  return `Mesma plataforma, desde a concepção — ${verb} ${others}.`;
}

/**
 * Trajetória condensada da home (§3.1): cinco linhas, datas em mono (§6.3), e o
 * detalhe com `built` / `impact` em /projetos (§3.2). Aqui só o suficiente para
 * quem lê só a home saber que a progressão existe (§2).
 *
 * A régua vertical contínua marca visualmente o fio da plataforma: as duas
 * posições são vizinhas na lista, então as bordas se encostam e viram uma linha
 * só. As demais recebem a mesma borda em `transparent` para não deslocar o
 * texto — sem isso, as linhas com fio nasceriam indentadas em relação às outras.
 */
export function TimelineCondensed() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Trajetória</h2>

      <ul className="mt-8">
        {experience.map((item) => {
          const thread = threadNote(item);
          return (
            <li
              key={item.company}
              className={`border-l-2 py-5 pl-4 ${thread ? 'border-ink-2' : 'border-transparent'}`}
            >
              <p className="font-mono text-xs text-ink-2">
                {formatPeriod(item)} · {item.mode}
              </p>
              <p className="mt-1.5">
                <span className="font-medium text-ink">{item.company}</span>
                <span className="text-ink-2"> · {item.role}</span>
              </p>
              {item.parallel ? (
                <p className="mt-1.5 font-mono text-xs text-ink-2">
                  em paralelo com {item.parallel}
                </p>
              ) : null}
              {thread ? <p className="mt-1.5 text-sm text-ink-2 italic">{thread}</p> : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-8 font-mono text-xs">
        <Link href="/projetos" className="text-accent-text underline underline-offset-4">
          Ver detalhe de cada posição
        </Link>
      </p>
    </Container>
  );
}
