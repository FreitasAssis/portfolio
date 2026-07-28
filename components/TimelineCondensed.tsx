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

/** Exportado porque o `/projetos` (Task 7) formata os mesmos períodos, e duas
 *  implementações do mesmo formato divergem na primeira edição. */
export function formatPeriod(item: Experience): string {
  return `${formatMonth(item.start)} — ${item.end ? formatMonth(item.end) : 'atual'}`;
}

/**
 * Trajetória condensada da home (§3.1): **uma linha por posição**, datas em mono
 * (§6.3), e o link para o detalhe.
 *
 * O esboço do §3.1 é literal — "TRAJETÓRIA (condensada, 5 linhas)", com
 * `2021—2023 Opah IT · Full Stack Pl` e um `[ver detalhe]` no canto. Este bloco
 * é **índice**, não conteúdo: fica entre os cards de projeto e o "Como eu
 * trabalho", que são dois blocos densos, e o trabalho dele na página é ser
 * respiro entre os dois.
 *
 * Por isso `built`, `impact`, `stack`, modalidade, a etiqueta `em paralelo` e o
 * fio contínuo **não entram aqui** — são do `/projetos` (§3.2 → §4.5). Uma
 * versão anterior mostrava três linhas e uma régua vertical por posição: quinze
 * linhas onde o brief pede cinco, e o aparato ficou tão fora de escala para um
 * índice que um leitor real achou que a régua era bug. O dado continua completo
 * em `content/experience.ts`, com os invariantes travados em
 * tests/unit/experience.test.ts; o que saiu foi só a exibição.
 *
 * O fio contínuo em especial saiu por um motivo mais duro que o de espaço. Ele
 * só pode ser **sinalizado sobre o texto curado do §4.5**, nunca narrado por
 * uma frase nova: o `impact` da Opah já diz "o terceiro projeto é o mesmo em
 * que sigo até hoje", que carrega o fio inteiro e preserva que na Opah houve
 * **três** projetos em times distintos. Num índice sem `built`/`impact` não há
 * texto curado para sinalizar, então qualquer marcador aqui seria prosa
 * inventada — e a primeira tentativa ("a plataforma da Analytica nasceu na Opah
 * IT") já achatava a Opah a um projeto só, apagando um argumento de senioridade.
 * O fio vive no `/projetos`, onde o texto que o sustenta existe.
 *
 * Nenhuma palavra sobre experiência profissional nasce neste componente: o
 * bloco renderiza `company`, `role` e as datas, e nada mais. Travado em
 * tests/unit/home.test.tsx, que remonta o texto da seção a partir do dado.
 */
export function TimelineCondensed() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Trajetória</h2>

      <ul className="mt-8 space-y-4">
        {experience.map((item) => (
          // Duas colunas a partir de sm; em 360px a data sobe e a empresa desce,
          // que ainda é uma entrada, não duas.
          // A coluna de data é fixa em 9,5rem (171px): a data mais longa
          // ("set/2021 — mar/2023") mede 148px na JetBrains Mono em 12,96px, e a
          // sobra evita que uma data futura mais larga empurre o cargo.
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
        <Link href="/projetos" className="text-accent-text underline underline-offset-4">
          Ver detalhe de cada posição
        </Link>
      </p>
    </Container>
  );
}
