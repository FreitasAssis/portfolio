import { AssetPlaceholder } from '@/components/AssetPlaceholder';

/**
 * O retrato do §6.5 — a **segunda e última** fonte de imagem do site.
 *
 * "Uma foto, no /sobre e em versão pequena no bloco de contato — nunca no hero,
 * que pertence à tese." Ela importa mais do que importaria antes: sem a página
 * de depoimentos, é a única presença humana do site, e é o que sustenta a
 * confiança do público cliente, que está decidindo sobre alguém que nunca viu.
 *
 * **O arquivo não existe ainda** (§12: "Retrato do Luiz"). Até existir, o lugar
 * dele fica ocupado por um `AssetPlaceholder` — mesma linguagem dos buracos de
 * print, na proporção real, com o enquadramento pedido escrito por extenso, para
 * que quem for tirar a foto leia a restrição sem abrir o brief.
 *
 * **4:5 é premissa deste componente, não do brief.** O §6.5 não fixa proporção;
 * 4:5 é o retrato vertical padrão de câmera de celular e é o que cabe ao lado de
 * uma coluna de leitura sem empurrar o texto. Se a foto vier em outra proporção,
 * é aqui que se muda — e só aqui, porque as duas chamadas passam pelo mesmo
 * componente.
 *
 * **Quando a foto chegar:** salvar em `public/sobre/retrato.webp` com dimensões
 * declaradas (§9), trocar o `AssetPlaceholder` por um `next/image` com `alt`
 * real — descritivo, no espírito do §9 ("tela de check-in diário do E aí, fez?",
 * não "print"): algo como "Luiz Freitas com o violão, em Natal". `sizes` precisa
 * cobrir as duas escalas de uso abaixo.
 */

/** O que a foto tem que mostrar, e o que ela não pode ser. Direto do §6.5. */
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
    // O rótulo é mais curto que o da versão grande de propósito: a caixa tem
    // 160px e o briefing inteiro viraria seis linhas empilhadas dentro dela. O
    // enquadramento está escrito por extenso no /sobre, que é onde a foto manda.
    <AssetPlaceholder
      label="retrato"
      spec="§6.5 · versão pequena"
      aspect="aspect-[4/5]"
      width="max-w-[10rem]"
    />
  );
}
