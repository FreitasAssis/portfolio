/**
 * Os contatos reais, num lugar só.
 *
 * Estavam escritos à mão dentro do `ContactBlock` e do `Footer`. Com o
 * `/contato` nascendo, passariam a existir em três arquivos — e copiar contato é
 * a forma mais silenciosa de publicar um endereço desatualizado. Aqui é o dado;
 * quem apresenta decide a forma.
 */

export const EMAIL = 'luiz_dev@outlook.com';
export const GITHUB = 'https://github.com/FreitasAssis';
export const LINKEDIN = 'https://www.linkedin.com/in/luiz-dev';

/**
 * O CV em PDF (§7): "com data no nome do arquivo ou no rodapé do PDF".
 *
 * A data está no nome porque é o único dos dois que o visitante vê antes de
 * abrir, e porque o arquivo baixado continua datado na pasta de Downloads de
 * quem recebeu. O PDF é gerado a partir de `docs/cv/luiz-freitas.html`, que é
 * versionado; o binário fonte fica em `docs/private/` (fora do git) e a cópia
 * publicada mora em `public/cv/`, que o Cloudflare Pages serve direto do repo.
 *
 * Conferido antes de publicar (o repo é público e o PDF vai junto): uma página,
 * `/XObject` vazio — nenhuma imagem embutida, portanto nenhuma foto de
 * documento —, nenhum CPF, RG, telefone, endereço nem data de nascimento, e os
 * únicos links são luizfreitas.com.br, o LinkedIn e o GitHub.
 *
 * Quando o CV for reemitido: troque o arquivo em `public/cv/` **com a data
 * nova** e atualize esta constante. `tests/unit/contato.test.tsx` confere que o
 * nome carrega a data e que o arquivo existe no disco — link de download
 * quebrado não dá sintoma nenhum no build estático.
 */
export const CV = {
  href: '/cv/luiz-freitas-2026-07.pdf',
  label: 'Baixar o CV em PDF',
  /** Vira o nome do arquivo salvo por quem baixa. */
  filename: 'luiz-freitas-2026-07.pdf',
} as const;

export type ContactLink = {
  href: string;
  /** O texto do link. Para e-mail é o endereço por extenso — ver §3.4. */
  label: string;
  external?: boolean;
  download?: boolean;
};

/**
 * Os quatro canais do §3.4, **nesta ordem**, que é a ordem do brief: "e-mail em
 * texto copiável, LinkedIn, GitHub e o CV em PDF".
 *
 * ## Por que não existem mais os dois caminhos
 *
 * Até esta revisão o `/contato` bifurcava em "Tenho uma vaga" e "Tenho um
 * projeto". O §3.4 tirou os dois, com o motivo escrito: eles **pressupunham
 * venda ativa**, e o §1 passou a dizer que a finalidade do site não é converter
 * — é existir e ser encontrável. Um visitante que precisa se classificar antes
 * de achar um endereço está numa triagem de funil, não numa página de contato.
 *
 * O que a bifurcação escondia, e que esta lista resolve de graça: o CV vivia
 * **só** dentro da caixa "Tenho uma vaga". Quem se lesse como cliente nunca via
 * o currículo, embora o §3.4 sempre tenha pedido o CV no `/contato` sem
 * qualificar para quem. Numa lista única não há caixa onde um link possa se
 * esconder.
 *
 * ## O WhatsApp saiu daqui
 *
 * Havia um `WHATSAPP: ContactLink | null = null` neste arquivo, com um teste
 * travando o `null`, porque o §12 listava "decidir se expõe WhatsApp" como
 * pendência do Luiz. **O §12 não lista mais** — e o caminho "Tenho um projeto",
 * que era o único lugar onde o número entraria, deixou de existir. Uma constante
 * nula guardando uma decisão que ninguém está tomando é andaime que envelhece
 * como se fosse trabalho pendente (§2).
 *
 * O que ficou no lugar não é menos: o teste que importava nunca foi
 * `expect(WHATSAPP).toBeNull()` — tautologia sobre uma constante —, e sim o que
 * varre o DOM procurando `wa.me`, telefone e a palavra "WhatsApp". Esse
 * continua, na home e no `/contato`, porque publicar um número é irreversível e
 * a proteção vale mesmo sem pendência aberta.
 */
export const CONTACT_LINKS: readonly ContactLink[] = [
  { href: `mailto:${EMAIL}`, label: EMAIL },
  { href: LINKEDIN, label: 'linkedin.com/in/luiz-dev', external: true },
  { href: GITHUB, label: 'github.com/FreitasAssis', external: true },
  { href: CV.href, label: CV.label, download: true },
] as const;
