/**
 * O texto do `/sobre`. §4.3 do brief, **literal**.
 *
 * Está aqui como dado, e não escrito dentro do componente, por um motivo só: o
 * §4.3 é texto curado e o teste precisa de um lugar onde comparar palavra por
 * palavra. A regra do repo é a mesma que já vale para `content/experience.ts` —
 * "texto curado e texto inventado não convivem sem rótulo". Ninguém reescreve
 * estes parágrafos para "melhorar o ritmo": o registro do §4 é primeira pessoa,
 * específico, sem adjetivo de venda.
 *
 * ## Os dois últimos parágrafos chegaram
 *
 * Até esta revisão eram três, e o §4.3 pedia **não gerar** o final — a única
 * parte do site que não se inferia do CV nem do histórico. O Luiz escreveu os
 * dois no brief, e o §12 fechou com *"todo o texto do site está escrito; o que
 * falta é imagem e código"*. Estão copiados daqui de baixo verbatim, incluindo
 * pontuação e travessão.
 *
 * **Calibragem do último parágrafo — não mexer sem intenção.** O §4.3 anexa uma
 * nota a ele: *"Ele não declara disponibilidade **nem** indisponibilidade. Se o
 * site dissesse que o Luiz não sai de lá, ninguém o guardaria — e ser guardado é
 * justamente a função da página no cenário em que ela precisa servir (§1). Porta
 * encostada, não trancada nem escancarada."* A temperatura foi ajustada de
 * propósito: "se um dia aparecer" é condicional, não convite; "gosto de onde
 * estou", no parágrafo anterior, é o contrapeso que impede a leitura de
 * disponibilidade. Qualquer reescrita que soe mais quente vira "disponível para
 * oportunidades", que o §1 proíbe por nome; qualquer uma que soe mais fria
 * fecha a porta que a página existe para deixar encostada.
 *
 * O tipo é uma **tupla de cinco**, não `string[]`. Isso é proposital: um sexto
 * elemento não compila. A trava mudou de tamanho, não de natureza — antes
 * impedia gerar o parágrafo que faltava, agora impede acrescentar prosa a um
 * texto que o §12 declara terminado. A segunda trava é o teste que compara os
 * cinco parágrafos renderizados, um a um.
 */
export const ABOUT_PARAGRAPHS: readonly [string, string, string, string, string] = [
  'Sou santista — nascido em Santos e torcedor do Peixe — e nordestino de coração: moro em Natal, no Rio Grande do Norte. Casado, e músico nas horas vagas.',
  'Programo profissionalmente desde 2017, quando comecei desenvolvendo web no IFRN, como bolsista no campus de Educação a Distância. De lá pra cá passei por startup, consultoria e educação, e hoje sou desenvolvedor full stack sênior na Analytica Ensino — onde acompanho, desde a concepção, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  'A parte de músico não é hobby desencontrado do resto, já tocava na igreja antes mesmo de programar, inclusive o Asafe veio daqui. Passei anos organizando repertório de Missa em drive, planilha e caderno, e resolvi construir a ferramenta que eu queria ter há tempos, a que torna prático esse trabalho e que se tornou o meu xodó.',
  'Estou na Analytica desde 2023 e gosto de onde estou. Esse portfólio é uma forma de deixar registrado o que construí, e de ser facilmente encontrado.',
  'Se um dia aparecer um próximo desafio, o que me atrai é problema com regra própria — onde entender o domínio é metade do trabalho, ou até mais. Gosto de coisa bem planejada, de participar da decisão quando posso, e de time onde ajudar quem está ao lado é rotina.',
] as const;

/**
 * §4.3: "Formação, se for exibida em algum canto".
 *
 * Exibida, e só isso: **sem foto de documento, sem data de nascimento, sem RG** —
 * a proibição do §4.3 vale para a página tanto quanto para o CV. O que está aqui
 * é o que está no `docs/cv/luiz-freitas.html`, com as mesmas palavras (§4.5).
 */
export const EDUCATION = {
  degree: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
  institution: 'Universidade Potiguar (UnP)',
  conclusion: 'conclusão em dezembro de 2022',
} as const;
