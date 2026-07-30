/**
 * Identidade do site e o dicionário de metadados por rota.
 *
 * Os pares título/descrição ficam lado a lado aqui de propósito: espalhados por
 * um `<Head>` em cada página, ninguém compara, e foi assim que o site antigo
 * terminou com a mesma descrição nas quatro. `tests/unit/site.test.ts` falha se
 * dois títulos ou duas descrições coincidirem.
 *
 * As descrições dos cases não estão aqui — moram no frontmatter de cada
 * `content/projects/*.mdx`, para que um case novo seja só um arquivo.
 */

/**
 * A base absoluta de canonical, sitemap e OG. **Fonte única, e sem barra no
 * fim:** tudo o que consome isto compõe caminhos que já começam com `/`, e a
 * barra dupla quebra o canonical em silêncio (`//projetos` é outra URL).
 */
export const SITE_URL = 'https://luizfreitas.com.br';

export const AUTHOR = 'Luiz Freitas';

/** O mesmo `lang` que está no `<html>`. */
export const LOCALE = 'pt-BR';

/** O que o Open Graph chama de locale — sublinhado, não hífen. Não é o `LOCALE`. */
export const OG_LOCALE = 'pt_BR';

/**
 * `jobTitle` do JSON-LD e do `title` da home. É a mesma palavra do eyebrow do
 * hero e do `role` da posição atual em `content/experience.ts`.
 */
export const JOB_TITLE = 'Desenvolvedor full stack sênior';

/**
 * O `address` do JSON-LD `Person`. Cidade e estado, nada abaixo disso:
 * logradouro e CEP são dado pessoal, e este bloco vai para um indexador.
 */
export const ADDRESS = {
  locality: 'Natal',
  region: 'RN',
  country: 'BR',
} as const;

export type RouteMeta = {
  /** O `<title>` inteiro, sem template. */
  readonly title: string;
  /** A `<meta name="description">`. Escrita à mão e factual. */
  readonly description: string;
};

/**
 * O par título/descrição das quatro rotas fixas.
 *
 * **Sem `title.template`.** São dois sufixos diferentes (`— Luiz Freitas` nas
 * páginas do site, `— projeto de Luiz Freitas` nos cases) e a home não tem
 * nenhum: com template, metade das rotas precisaria de `absolute:` para escapar
 * dele e nenhum título seria legível neste arquivo.
 *
 * Nenhuma descrição aqui depende do fim para fazer sentido — o dado está na
 * primeira oração, e o corte do buscador só tira detalhe. É isso que
 * `tests/unit/site.test.ts` mede, não um limite mágico de caracteres.
 */
export const META = {
  home: {
    title: 'Luiz Freitas — desenvolvedor full stack',
    description:
      'Desenvolvedor full stack sênior em Natal, RN. Construo, na Analytica Ensino, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  },

  /**
   * **"desde 2017", nunca uma contagem de anos.** Esta frase vai para o snippet
   * do buscador, dentro de um cache que ninguém revisa: um "nove anos" aqui vira
   * mentira no aniversário seguinte. Há teste.
   */
  projetos: {
    title: 'Projetos e experiência — Luiz Freitas',
    description:
      'Os dois apps que construí por conta própria, Asafe e E aí, fez?, e a trajetória desde 2017: IFRN, startup, consultoria e educação.',
  },

  /** Cada informação daqui está, com estas palavras, em `content/about.ts`. */
  sobre: {
    title: 'Sobre — Luiz Freitas',
    description:
      'Santista morando em Natal (RN), casado e músico nas horas vagas. Programo profissionalmente desde 2017 e hoje sou desenvolvedor full stack sênior na Analytica Ensino.',
  },

  /**
   * O nome e o cargo entram porque esta é a rota que alguém abre depois de
   * procurar "Luiz Freitas desenvolvedor". O "sem formulário" é decisão, não
   * falta.
   */
  contato: {
    title: 'Contato — Luiz Freitas',
    description:
      'Como falar com Luiz Freitas, desenvolvedor full stack em Natal (RN): e-mail escrito por extenso, LinkedIn, GitHub e o currículo em PDF. Sem formulário.',
  },
} as const satisfies Record<string, RouteMeta>;

/**
 * O título de um case, a partir do nome no frontmatter. É função, e não entrada
 * no `META`, porque um dicionário com uma chave por case quebraria em silêncio:
 * o `.mdx` novo nasceria com página e só o título estaria errado.
 */
export function caseTitle(name: string): string {
  return `${name} — projeto de ${AUTHOR}`;
}

/**
 * A manchete e a linha de apoio do card de OG das quatro rotas fixas. Os dois
 * cases não estão aqui: o card deles é `name` + `tagline` do frontmatter, como
 * a capa da própria página.
 *
 * **A `tagline` é sempre um trecho literal da `description` da rota.** A
 * description inteira não cabe num card lido em miniatura, e escrever uma frase
 * nova aqui criaria uma segunda versão da mesma promessa, num arquivo que
 * ninguém abre ao editar a primeira. `tests/unit/og.test.ts` falha quando ela
 * deixa de aparecer na description, e quando a `headline` deixa de abrir o
 * `title`.
 */
export const OG_CARDS = {
  home: {
    headline: AUTHOR,
    tagline: 'Desenvolvedor full stack sênior em Natal, RN.',
  },
  projetos: {
    headline: 'Projetos e experiência',
    tagline: 'Os dois apps que construí por conta própria, Asafe e E aí, fez?',
  },
  sobre: {
    headline: 'Sobre',
    tagline: 'Santista morando em Natal (RN), casado e músico nas horas vagas.',
  },
  contato: {
    headline: 'Contato',
    tagline: 'E-mail escrito por extenso, LinkedIn, GitHub e o currículo em PDF.',
  },
} as const satisfies Record<keyof typeof META, { headline: string; tagline: string }>;
