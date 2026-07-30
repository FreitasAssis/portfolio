/** Os contatos reais, num lugar só: copiar contato é a forma mais silenciosa de
 *  publicar um endereço desatualizado. */

export const EMAIL = 'luiz_dev@outlook.com';
export const GITHUB = 'https://github.com/FreitasAssis';
export const LINKEDIN = 'https://www.linkedin.com/in/luiz-dev';

/**
 * O CV em PDF, gerado a partir de `docs/cv/luiz-freitas.html`.
 *
 * Quando for reemitido: troque o arquivo em `public/cv/` **com a data nova** e
 * atualize esta constante. `tests/unit/contato.test.tsx` confere que o nome
 * carrega a data e que o arquivo existe no disco — link de download quebrado não
 * dá sintoma nenhum num build estático.
 */
export const CV = {
  href: '/cv/luiz-freitas-2026-07.pdf',
  label: 'Baixar o CV em PDF',
  /** Vira o nome do arquivo salvo por quem baixa. */
  filename: 'luiz-freitas-2026-07.pdf',
} as const;

export type ContactLink = {
  href: string;
  /** O texto do link. Para e-mail é o endereço por extenso, para ser copiável. */
  label: string;
  external?: boolean;
  download?: boolean;
};

/**
 * Os quatro canais do `/contato`, **nesta ordem**.
 *
 * Não há telefone nem WhatsApp aqui, e há teste varrendo o DOM da home e do
 * `/contato` por `wa.me`, `tel:` e a palavra "WhatsApp": publicar um número é
 * irreversível. Se um dia entrar, é link novo nesta lista e os dois testes falham.
 */
export const CONTACT_LINKS: readonly ContactLink[] = [
  { href: `mailto:${EMAIL}`, label: EMAIL },
  { href: LINKEDIN, label: 'linkedin.com/in/luiz-dev', external: true },
  { href: GITHUB, label: 'github.com/FreitasAssis', external: true },
  { href: CV.href, label: CV.label, download: true },
] as const;
