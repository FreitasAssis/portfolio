/**
 * Identidade do site e o dicionário de metadados por rota (§8).
 *
 * ## Por que este arquivo existe
 *
 * O §8 abre com o diagnóstico do site antigo: **o mesmo `title` e a mesma
 * `description` nas quatro páginas**. O bug não nasceu de desleixo — nasceu de
 * os metadados morarem espalhados, um `<Head>` por página, longe uns dos
 * outros, onde ninguém compara. Aqui eles ficam **lado a lado**, e a comparação
 * vira teste: `tests/unit/site.test.ts` falha se dois títulos ou duas
 * descrições coincidirem.
 *
 * ## Por que em `content/`, e por que não se chama `strings.ts`
 *
 * `content/*.ts` já é o padrão do repo para texto curado como dado tipado
 * (`about.ts`, `experience.ts`, `contact.ts`): texto que alguém escreveu com
 * intenção, que um teste compara palavra por palavra, e que não se reescreve
 * "para melhorar o ritmo". Descrição de meta é exatamente isso — o §8 pede
 * "escrita à mão, **factual**" e o §4 fixa o registro. Então ela entra no
 * padrão em vez de inventar um terceiro lugar.
 *
 * O nome é `site.ts` e não `strings.ts` de propósito. Um arquivo chamado
 * `strings` é um convite para toda string da interface migrar para cá, e isso é
 * máquina de i18n construída por acúmulo — que o §11 proíbe agora ("versão em
 * inglês: strings já isoladas; ligar depois é barato", não "faça o i18n").
 * O escopo aqui é fechado: a identidade do site e o par título/descrição de
 * cada rota. Quando o inglês entrar, este arquivo ganha um irmão e um seletor;
 * nada mais precisa se mexer.
 *
 * As descrições dos **cases** não estão aqui: elas moram no frontmatter de cada
 * `content/projects/*.mdx`, junto do resto do case. É o §2 — "adicionar projeto
 * novo = criar um arquivo, zero mexida em código" — e uma descrição de case
 * escrita neste dicionário seria a única parte do case fora do arquivo do case.
 */

/**
 * A base absoluta de canonical, sitemap e OG. **Fonte única.**
 *
 * Sem protocolo relativo e sem barra no fim: tudo o que consome isto compõe
 * caminhos que já começam com `/`, e a barra dupla quebra o canonical em
 * silêncio (o Google trata `//projetos` como outra URL).
 *
 * Vira `metadataBase` em `app/layout.tsx`. Sob `output: 'export'` não há
 * requisição para inferir o host, então **sem esta constante o Next resolveria
 * canonical e OG contra `localhost:3000`** e o site publicaria links para a
 * máquina de quem buildou.
 */
export const SITE_URL = 'https://luizfreitas.com.br';

export const AUTHOR = 'Luiz Freitas';

/** O mesmo `lang` que está no `<html>` (§8). */
export const LOCALE = 'pt-BR';

/** O que o Open Graph chama de locale — sublinhado, não hífen. */
export const OG_LOCALE = 'pt_BR';

/**
 * `jobTitle` do JSON-LD e do `title` da home. É a mesma palavra do eyebrow do
 * §4.1 e do `role` da posição atual em `content/experience.ts` — o §4.5 manda o
 * site contar a mesma história com as mesmas palavras em todo lugar, e o
 * cartão do Google é mais um lugar.
 */
export const JOB_TITLE = 'Desenvolvedor full stack sênior';

/**
 * O `address` que o §8 pede no JSON-LD `Person`: Natal/RN.
 *
 * Cidade e estado, nada abaixo disso. Logradouro e CEP são dado pessoal e a
 * mesma proibição do §4.3 que tirou RG, CPF e data de nascimento do CV vale
 * aqui — a diferença é que este bloco vai para um indexador.
 */
export const ADDRESS = {
  locality: 'Natal',
  region: 'RN',
  country: 'BR',
} as const;

export type RouteMeta = {
  /** O `<title>` inteiro, sem template. Ver a nota abaixo. */
  readonly title: string;
  /** A `<meta name="description">`. Escrita à mão, factual (§8). */
  readonly description: string;
};

/**
 * O par título/descrição das quatro rotas fixas.
 *
 * ## Sem `title.template`
 *
 * O Next oferece `title: { template: '%s — Luiz Freitas' }` no layout, e seria
 * tentador. Não usamos: o §8 dá **dois** sufixos diferentes
 * (`— Luiz Freitas` para as páginas do site, `— projeto de Luiz Freitas` para
 * os cases) e a home não tem sufixo nenhum. Com template, metade das rotas
 * precisaria de `absolute:` para escapar dele, e o título de cada página
 * deixaria de ser legível neste arquivo — que é justamente o que o §8 quer
 * consertar. Cada título está aqui inteiro, e a comparação entre eles é direta.
 *
 * ## Sobre o tamanho das descrições
 *
 * O Google corta o snippet perto de 155 caracteres e o LinkedIn perto de 200.
 * Nenhuma frase aqui depende do fim para fazer sentido: o dado que carrega cada
 * página está na **primeira** oração, e o corte só tira detalhe. É por isso que
 * `tests/unit/site.test.ts` mede o comprimento — não para caber num limite
 * mágico, mas para que ninguém escreva uma descrição cujo argumento só aparece
 * no caractere 190.
 *
 * NÃO REESCREVA sem ler o §4: primeira pessoa onde couber, específico, sem
 * adjetivo de venda. As palavras proibidas por nome ("soluções", "experiências
 * digitais", "impulsionar", "inovador", "excepcional") estão travadas em teste,
 * junto com a descrição inteira do site antigo, que o §8 manda tirar.
 */
export const META = {
  /**
   * Home. O §8 fixa este título literalmente. A descrição é a tese do §4.1 com
   * o número: "é o dado mais forte do currículo e a única coisa da página que
   * não pode ser dita por qualquer outro dev". As palavras são as do
   * `components/Hero.tsx` — "alunos, professores e gestores", os três, como no
   * §4.3, no §4.5 e no CV.
   */
  home: {
    title: 'Luiz Freitas — desenvolvedor full stack',
    description:
      'Desenvolvedor full stack sênior em Natal, RN. Construo, na Analytica Ensino, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  },

  /**
   * `/projetos`. O título é o `<h1>` da página, que cobre as duas seções do
   * §3.2 — "uma mostra iniciativa, a outra mostra experiência". A descrição diz
   * a mesma divisão, e os quatro degraus da trajetória são os do §4.3
   * ("passei por startup, consultoria e educação"), com o IFRN de onde ela sai.
   */
  projetos: {
    title: 'Projetos e experiência — Luiz Freitas',
    description:
      'Os dois apps que construí por conta própria, Asafe e E aí, fez?, e nove anos de trajetória: IFRN, startup, consultoria e educação.',
  },

  /**
   * `/sobre`. Condensa os três parágrafos do §4.3 sem inventar frase: cada
   * informação daqui está, com estas palavras, em `content/about.ts`.
   */
  sobre: {
    title: 'Sobre — Luiz Freitas',
    description:
      'Santista morando em Natal (RN), casado e músico nas horas vagas. Programo profissionalmente desde 2017 e hoje sou desenvolvedor full stack sênior na Analytica Ensino.',
  },

  /**
   * `/contato`. A bifurcação do §3.4 e a ausência de formulário, que é decisão
   * e não falta ("formulário some no spam e não dá confirmação"). Os canais
   * listados são os que a página de fato mostra — se o WhatsApp for ligado um
   * dia (§12), esta frase entra na conta.
   */
  contato: {
    title: 'Contato — Luiz Freitas',
    description:
      'Dois caminhos, tenho uma vaga ou tenho um projeto, e os dois chegam no mesmo e-mail. Sem formulário: e-mail, LinkedIn, GitHub e o CV em PDF.',
  },
} as const satisfies Record<string, RouteMeta>;

/**
 * O título de um case, a partir do nome no frontmatter (§8:
 * `Asafe — projeto de Luiz Freitas`).
 *
 * É função, e não entrada no `META`, porque o §2 promete que um `.mdx` novo em
 * `content/projects/` vira rota sem tocar em código. Um dicionário com uma
 * chave por case quebraria a promessa no lugar mais silencioso possível: a
 * página nasceria, e só o título ficaria errado.
 */
export function caseTitle(name: string): string {
  return `${name} — projeto de ${AUTHOR}`;
}
