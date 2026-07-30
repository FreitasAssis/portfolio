import { GITHUB, LINKEDIN } from '@/content/contact';
import { ADDRESS, AUTHOR, JOB_TITLE, SITE_URL } from '@/content/site';

/**
 * O `Person` do JSON-LD. Nenhum valor é redigitado aqui: JSON-LD não aparece na
 * tela, então um link copiado envelheceria sem sintoma. Exportado como dado para
 * que o teste valide o objeto campo a campo.
 */
export const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: AUTHOR,
  jobTitle: JOB_TITLE,
  url: SITE_URL,
  sameAs: [GITHUB, LINKEDIN],
  address: {
    '@type': 'PostalAddress',
    addressLocality: ADDRESS.locality,
    addressRegion: ADDRESS.region,
    addressCountry: ADDRESS.country,
  },
} as const;

/**
 * `<` vira `<` antes de entrar no `<script>`. Nenhum valor atual contém o
 * caractere, mas o dia em que um contiver o navegador fecha a tag no meio do JSON
 * e o resto do bloco vira conteúdo da página.
 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Só na home: o `Person` descreve o site inteiro e precisa ser único. */
export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      // Conteúdo estático montado a partir de constantes do repo — não há entrada
      // de usuário em lugar nenhum deste caminho.
      dangerouslySetInnerHTML={{ __html: safeJson(PERSON) }}
    />
  );
}
