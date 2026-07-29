/**
 * O texto do `/sobre`. §4.3 do brief, **literal**.
 *
 * Está aqui como dado, e não escrito dentro do componente, por um motivo só: o
 * §4.3 é texto curado e o teste precisa de um lugar onde comparar palavra por
 * palavra. A regra do repo é a mesma que já vale para `content/experience.ts` —
 * "texto curado e texto inventado não convivem sem rótulo". Ninguém reescreve
 * estes três parágrafos para "melhorar o ritmo": o registro do §4 é primeira
 * pessoa, específico, sem adjetivo de venda.
 *
 * O tipo é uma **tupla de três**, não `string[]`. Isso é proposital: acrescentar
 * um quarto elemento aqui não compila. É a primeira das duas travas do parágrafo
 * que falta (a segunda é o teste que conta os parágrafos renderizados).
 */
export const ABOUT_PARAGRAPHS: readonly [string, string, string] = [
  'Sou santista — nascido em Santos e torcedor do Peixe — e nordestino de coração: moro em Natal, no Rio Grande do Norte. Casado, e músico nas horas vagas.',
  'Programo profissionalmente desde 2017, quando comecei desenvolvendo web no IFRN, como bolsista no campus de Educação a Distância. De lá pra cá passei por startup, consultoria e educação, e hoje sou desenvolvedor full stack sênior na Analytica Ensino — onde acompanho, desde a concepção, uma plataforma educacional usada por cerca de 400 mil alunos, professores e gestores da rede pública do Paraná.',
  'A parte de músico não é hobby desencontrado do resto: é de onde saiu o Asafe. Passei anos organizando repertório de Missa em planilha e caderno, e resolvi construir a ferramenta que eu queria ter.',
] as const;

/**
 * O quarto parágrafo do §4.3 — "2 ou 3 frases sobre o que ele procura hoje,
 * tipo de time, tipo de problema".
 *
 * **Continua `null`, e isso não é um esquecimento.** O brief é explícito e
 * repete: *"Última pendência de texto do site. O parágrafo final é a única parte
 * que não se infere do CV nem do histórico. **Não gerar.** Se estiver vazio na
 * hora do build, omita o parágrafo — a página funciona sem ele."*
 *
 * A diferença entre este caso e um print que falta: um buraco de imagem tem que
 * **aparecer** inacabado (é o que faz alguém produzir o arquivo). Um parágrafo
 * inventado, não — texto plausível na voz de outra pessoa não se distingue do
 * texto verdadeiro depois de publicado, e um "{{ em breve }}" no fim da página
 * sobre uma pessoa lê como abandono. Por isso a ausência aqui é silenciosa na
 * tela e barulhenta no código.
 *
 * **Quando o Luiz mandar as frases:** trocar `null` pelo texto, e só. O
 * componente já renderiza o parágrafo quando o valor existe. O teste
 * "os três parágrafos do §4.3, verbatim — e nada além" vai falhar, de propósito:
 * é o pedágio que garante que o quarto parágrafo entrou por decisão dele e não
 * por geração. Atualize o teste junto, com o texto que ele enviou.
 */
export const ABOUT_SEEKING: string | null = null;

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
