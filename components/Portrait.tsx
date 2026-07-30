import { AssetPlaceholder } from '@/components/AssetPlaceholder';

/**
 * O retrato, enquanto o arquivo não existe. As duas escalas de uso passam por
 * aqui, então a proporção 4:5 — que é premissa deste componente, não do brief —
 * se troca num lugar só.
 */

/** O que a foto tem que mostrar, e o que ela não pode ser. */
const BRIEFING =
  'com o instrumento ou em Natal · luz natural · leve dessaturação · não headshot corporativo';

export function Portrait({
  /** `page` no /sobre; `inline` no bloco de contato, onde ela é "versão pequena". */
  size = 'page',
}: {
  readonly size?: 'page' | 'inline';
}) {
  return size === 'page' ? (
    <AssetPlaceholder
      label="retrato do Luiz (§6.5)"
      spec={BRIEFING}
      aspect="aspect-[4/5]"
      width="max-w-[16rem]"
    />
  ) : (
    // Rótulo mais curto que o da versão grande: a caixa tem 160px e o briefing
    // inteiro viraria seis linhas empilhadas dentro dela.
    <AssetPlaceholder
      label="retrato"
      spec="§6.5 · versão pequena"
      aspect="aspect-[4/5]"
      width="max-w-[10rem]"
    />
  );
}
