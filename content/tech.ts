/**
 * A camada 1 do `/sobre`: "uso hoje e defendo em profundidade".
 *
 * A ordem dos termos é a do `docs/cv/luiz-freitas.html`, letra por letra, para que
 * quem abrir os dois lado a lado não encontre nem uma vírgula de diferença.
 * Mover um item entre camadas conta uma história diferente da do CV; encurtar uma
 * lista, não.
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

/** Camada 2: "já entreguei em produção". */
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

export const LAYER_2_CAVEAT =
  'Passei por todas essas em produção, em momentos diferentes da carreira. As de cima são as que eu escolheria hoje pra começar um projeto novo.';

/**
 * **Não renderizar.** Esta lista existe só para o teste que garante que nenhum
 * destes termos apareça no `/sobre` — listá-los "é como um chef listar 'sei usar
 * faca'". Não vale para stack de posição em `content/experience.ts`, que é
 * registro do que foi usado.
 */
export const LAYER_3_NEVER = ['HTML', 'CSS', 'Git', 'Bootstrap'] as const;
