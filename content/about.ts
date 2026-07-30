/**
 * O texto do `/sobre`, curado e verbatim. Mora aqui como dado, e não dentro do
 * componente, porque há teste que o compara palavra por palavra — ninguém
 * reescreve estes parágrafos "para melhorar o ritmo".
 *
 * **A temperatura do último parágrafo é calibrada:** ele não declara
 * disponibilidade nem indisponibilidade. Porta encostada. Há teste que falha se
 * alguém o esquentar ("disponível para", "aberto a propostas") ou esfriar ("não
 * pretendo sair").
 */
export const ABOUT_PARAGRAPHS: readonly [string, string, string, string, string] = [
  'Sou santista — nascido em Santos e torcedor do Peixe — e nordestino de coração: moro em Natal, no Rio Grande do Norte. Casado, e músico nas horas vagas.',
  'Programo profissionalmente desde 2017, quando comecei desenvolvendo web no IFRN, como bolsista no campus de Educação a Distância. De lá pra cá passei por startup, consultoria e educação, e hoje sou desenvolvedor full stack sênior na Analytica Ensino — onde acompanho, desde a concepção, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  'A parte de músico não é hobby desencontrado do resto, já tocava na igreja antes mesmo de programar, inclusive o Asafe veio daqui. Passei anos organizando repertório de Missa em drive, planilha e caderno, e resolvi construir a ferramenta que eu queria ter há tempos, a que torna prático esse trabalho e que se tornou o meu xodó.',
  'Estou na Analytica desde 2023 e gosto de onde estou. Esse portfólio é uma forma de deixar registrado o que construí, e de ser facilmente encontrado.',
  'Se um dia aparecer um próximo desafio, o que me atrai é problema com regra própria — onde entender o domínio é metade do trabalho, ou até mais. Gosto de coisa bem planejada, de participar da decisão quando posso, e de time onde ajudar quem está ao lado é rotina.',
] as const;

/**
 * A formação, e só ela: sem foto de documento, sem data de nascimento, sem RG. O
 * que está aqui é o que está no `docs/cv/luiz-freitas.html`, com as mesmas
 * palavras.
 */
export const EDUCATION = {
  degree: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
  institution: 'Universidade Potiguar (UnP)',
  conclusion: 'conclusão em dezembro de 2022',
} as const;
