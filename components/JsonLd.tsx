import { GITHUB, LINKEDIN } from '@/content/contact';
import { ADDRESS, AUTHOR, JOB_TITLE, SITE_URL } from '@/content/site';

/**
 * O `Person` do §8: *"é o que faz o Google entender que o site é sobre uma
 * pessoa específica"* — que é o quarto item da lista do §1 do que o site
 * precisa provar ("ele é uma pessoa específica, não um currículo genérico").
 *
 * Os valores **não são redigitados**: `sameAs` sai de `content/contact.ts`, os
 * mesmos links que o rodapé e o `/contato` mostram, e nome, cargo e cidade saem
 * de `content/site.ts`. Um perfil de LinkedIn copiado para cá envelheceria em
 * silêncio: JSON-LD não aparece na tela, então ninguém nota o link errado.
 *
 * Exportado como dado, e não só renderizado, para que o teste valide o objeto
 * campo a campo — bloco de JSON-LD malformado é invisível até alguém rodar um
 * validador.
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
 * `<` vira `<` antes de entrar no `<script>`.
 *
 * Nenhum valor atual contém o caractere, mas o dia em que um contiver — um
 * `sameAs` novo, um cargo com marcação — o navegador fecharia a tag no meio do
 * JSON e o resto do bloco viraria conteúdo da página. O escape é JSON válido e
 * custa uma linha.
 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Só na home (§8). O `Person` descreve o site inteiro; repeti-lo por rota não
 *  acrescenta nada e multiplica um dado que precisa ser único. */
export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      // Conteúdo estático montado no servidor a partir de constantes do repo —
      // não há entrada de usuário em lugar nenhum deste caminho.
      dangerouslySetInnerHTML={{ __html: safeJson(PERSON) }}
    />
  );
}
