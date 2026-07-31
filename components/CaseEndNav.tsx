import { Link } from '@/components/Link';

import { EndNav } from '@/components/EndNav';
import type { Project } from '@/lib/projects';

/**
 * Fim do case: o próximo case e o caminho de volta ao topo. A forma mora em
 * `EndNav`; o que é específico do case é o link do próximo.
 *
 * **Precisa continuar DENTRO da `AccentZone` do case.** Com o bloco dentro, no
 * fim da página a zona cobre 76,0% da viewport em 1440×900 e 59,6% em 360×740;
 * com ele fora, 63,3% e 39,4% — a 4,4 pontos do limiar de 35% do
 * `AccentTracker`. Uma linha a mais no bloco, ou uma tela mais baixa, e o acento
 * se apaga no fim do case.
 */
export function CaseEndNav({ next }: { readonly next: Project | null }) {
  return (
    <EndNav label="Fim do case">
      <p className="text-sm">
        {next ? (
          <Link
            href={`/projetos/${next.slug}`}
            className="text-accent-text underline underline-offset-4"
          >
            Próximo case: {next.name}
          </Link>
        ) : (
          <Link href="/projetos" className="text-accent-text underline underline-offset-4">
            Ver todos os projetos
          </Link>
        )}
      </p>
    </EndNav>
  );
}
