import { Link } from '@/components/Link';

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

/** "2023-03" → "mar/2023". À mão, e não via `Date`/`Intl`: o dado é ano-mês, não
 *  um instante, e `new Date('2023-03')` é UTC — em UTC-3 vira fevereiro. */
function formatMonth(iso: string): string {
  const [year, month] = iso.split('-');
  return `${MONTHS[Number(month) - 1]}/${year}`;
}

/** Exportado porque a `Timeline` do `/projetos` formata os mesmos períodos. */
export function formatPeriod(item: Experience): string {
  return `${formatMonth(item.start)} — ${item.end ? formatMonth(item.end) : 'atual'}`;
}

/**
 * Trajetória condensada da home: uma linha por posição, e o link para o detalhe.
 * É índice, não conteúdo — `built`, `impact`, `stack`, `em paralelo` e o fio
 * contínuo são da `Timeline` do `/projetos`.
 *
 * O fio em especial só pode ser SINALIZADO sobre o texto curado do `impact`,
 * nunca narrado por frase nova. Aqui não há esse texto, então qualquer marcador
 * seria prosa inventada — e `tests/unit/home.test.tsx` remonta a seção a partir
 * do dado justamente para pegar isso.
 */
export function TimelineCondensed() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Trajetória</h2>

      <ul className="mt-8 space-y-4">
        {experience.map((item) => (
          // A coluna de data é fixa em 9,5rem (171px): a data mais longa
          // ("set/2021 — mar/2023") mede 148px na JetBrains Mono em 12,96px, e a
          // sobra evita que uma data mais larga empurre o cargo.
          <li key={item.company} className="sm:flex sm:gap-6">
            <p className="font-mono text-xs text-ink-2 sm:w-[9.5rem] sm:shrink-0 sm:pt-1.5">
              {formatPeriod(item)}
            </p>
            <p>
              <span className="font-medium text-ink">{item.company}</span>
              <span className="text-ink-2"> · {item.role}</span>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-mono text-xs">
        {/* Âncora, não o topo: o link promete "detalhe de cada posição", e o topo
            do /projetos são os cards grandes antes disso. */}
        <Link href="/projetos#experiencia" className="text-accent-text underline underline-offset-4">
          Ver detalhe de cada posição
        </Link>
      </p>
    </Container>
  );
}
