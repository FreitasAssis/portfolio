/**
 * Os contatos reais e a bifurcação do §3.4, num lugar só.
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
 * **Pendência do §12: "decidir se expõe WhatsApp no /contato".**
 *
 * Expor número de telefone é irreversível — sai de indexador, de print, de
 * encaminhamento — e a decisão é do Luiz, não do build. Enquanto for `null`, o
 * caminho "Tenho um projeto" fica com e-mail e GitHub, que já convertem sem
 * backend (§3.4).
 *
 * **A edição, quando ele decidir:** trocar `null` por
 * `{ href: 'https://wa.me/55DDDNÚMERO', label: 'WhatsApp', external: true }`.
 * É só isso — o caminho abaixo já espalha o valor na lista de links, e
 * `tests/unit/contato.test.tsx` tem um teste que falha enquanto isto for `null`
 * dizendo por quê, para que ligar o WhatsApp seja uma decisão registrada e não
 * um efeito colateral.
 */
export const WHATSAPP: ContactLink | null = null;

const emailLink: ContactLink = { href: `mailto:${EMAIL}`, label: EMAIL };

/**
 * Os dois caminhos do §3.4, "lado a lado, com a mesma dignidade visual".
 *
 * Mesma forma de dado para os dois — mesmo título, mesmo parágrafo, mesma lista
 * de links — porque é o que impede que um ganhe peso do outro por descuido. É a
 * única bifurcação do site, e ela existe porque os dois públicos do §1 convergem
 * em tudo menos no fim da jornada.
 */
export const CONTACT_PATHS = [
  {
    id: 'vaga',
    title: 'Tenho uma vaga',
    blurb:
      'Remoto, a partir de Natal (RN). CLT ou PJ. O currículo conta a mesma coisa que este site, em uma página.',
    links: [
      emailLink,
      { href: LINKEDIN, label: 'linkedin.com/in/luiz-dev', external: true },
      { href: CV.href, label: CV.label, download: true },
    ] as ContactLink[],
  },
  {
    id: 'projeto',
    title: 'Tenho um projeto',
    blurb:
      'Me escreva contando o que você quer construir. Respondo com o que dá pra fazer, em que ordem, e o que eu deixaria de fora da primeira versão.',
    links: [
      emailLink,
      { href: GITHUB, label: 'github.com/FreitasAssis', external: true },
      ...(WHATSAPP ? [WHATSAPP] : []),
    ] as ContactLink[],
  },
] as const;
