/**
 * As camadas de tecnologia do §4.4. Peso visual decrescente, **sem ícone
 * colorido em nenhuma delas** — "texto e tipografia bastam, e ficam melhor"
 * (§4.4), e o §6.5 já limita o site a duas fontes de imagem, nenhuma delas
 * logotipo de linguagem.
 *
 * ---
 *
 * ## A divergência da camada 1, e como ela foi resolvida
 *
 * O §4.4 lista a camada 1 como `TypeScript` `Next.js / React` `Node.js`
 * `PostgreSQL` `Docker` `AWS`, e põe `React Native / Expo` na camada 2. O
 * `docs/cv/luiz-freitas.html` faz o contrário: "Uso hoje: TypeScript,
 * Next.js / React, **React Native / Expo**, Node.js, PostgreSQL, Docker, AWS", e
 * não repete React Native na linha de "já entreguei em produção".
 *
 * O §4.5 manda o site e o CV contarem a mesma história com as mesmas palavras —
 * então uma das duas pontas tinha que ceder. Cedeu o §4.4, por três razões:
 *
 * 1. **O dado do próprio site desmente a camada 2.** A stack da Analytica em
 *    `content/experience.ts` (posição atual, renderizada em `/projetos`) inclui
 *    React Native, e o frontmatter do Asafe inclui Expo. Deixar React Native
 *    fora de "uso hoje" faria a mesma página afirmar e negar a mesma coisa a
 *    dois blocos de distância — e o §2 diz que a stack aparece grudada no
 *    projeto justamente para não virar declaração solta.
 * 2. **A frase da camada 2 não caberia.** Ela diz "as de cima são as que eu
 *    escolheria hoje pra começar um projeto novo". O Asafe é o projeto novo mais
 *    recente dele e o mobile é Expo — a escolha já foi feita, e foi essa.
 * 3. **O custo da correção contrária seria alto e errado.** Alinhar o CV ao
 *    §4.4 significaria editar `docs/cv/luiz-freitas.html` para contradizer as
 *    stacks das próprias vagas que ele descreve, e reemitir o PDF já publicado.
 *    Alinhar o site ao CV é uma linha, e a linha fica verdadeira.
 *
 * A ordem dos termos da camada 1 é a do CV, letra por letra, para que quem abrir
 * os dois documentos lado a lado não encontre nem uma vírgula de diferença.
 *
 * O que **não** foi importado do CV: `MySQL`, `Nuxt` e `Sidekiq`, que aparecem
 * lá na linha de produção e não na do §4.4. A camada 2 do brief é uma curadoria
 * mais curta de propósito ("bloco secundário, menor, um parágrafo") e encurtar
 * uma lista não conta a história errada — mover um item de camada, sim.
 */
export const LAYER_1 = [
  'TypeScript',
  'Next.js / React',
  'React Native / Expo',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'AWS',
] as const;

/**
 * Camada 2 do §4.4, menos o `React Native / Expo` que subiu para a camada 1
 * (ver acima). O restante é a lista do brief, na ordem do brief.
 */
export const LAYER_2 = [
  'Ruby on Rails',
  'Vue.js',
  'Python / Django',
  'MongoDB',
  'Firebase',
  'GCP',
  'CI/CD',
  'Microserviços',
  'Scrum',
] as const;

/** Frase do §4.4, literal: "pra ser honesto sem parecer inflado". */
export const LAYER_2_CAVEAT =
  'Passei por todas essas em produção, em momentos diferentes da carreira. As de cima são as que eu escolheria hoje pra começar um projeto novo.';

/**
 * Camada 3 do §4.4: **não se lista.** HTML, CSS, Git e Bootstrap saíram do site
 * inteiro — "é como um chef listar 'sei usar faca'".
 *
 * A lista existe aqui só para o teste que garante que nenhum desses termos
 * reapareça no `/sobre`. Não a renderize. `Git` usa fronteira de palavra no
 * teste, senão `GitHub` casaria.
 */
export const LAYER_3_NEVER = ['HTML', 'CSS', 'Git', 'Bootstrap'] as const;
