/**
 * Carregador dos cases em `content/projects/*.mdx` (§5).
 *
 * O §2 promete: "adicionar projeto novo = criar um arquivo. Zero mexida em
 * código." Essa promessa só é segura com validação dura — um arquivo torto
 * precisa quebrar o build citando o arquivo e o campo, e não publicar um case
 * sem decisões, um botão que aponta pro vazio ou um print sem alt. Tudo o que
 * este módulo faz de mais rígido está a serviço disso.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

import { ACCENTS, type Accent } from '@/components/AccentZone';

const CONTENT_DIR = join(process.cwd(), 'content/projects');

/**
 * Um print que ainda não existe: o `{{ }}` do §0 no lugar do arquivo.
 * Sem arquivo não há dimensão, então os dois campos são `null` — e o tipo diz
 * isso, em vez de deixar `number | null` vazando para quem renderiza.
 */
export type PendingShot = { src: string; alt: string; width: null; height: null };

/** Um print de verdade, com a dimensão declarada que o §9 exige. */
export type ReadyShot = { src: string; alt: string; width: number; height: number };

/** Um print. `alt` é obrigatório e descritivo — §9 não negocia. */
export type Shot = PendingShot | ReadyShot;

/** §3.3: a stack vem "com o porquê de cada escolha não-óbvia". Escolha óbvia
 *  não precisa de porquê, então `why` é opcional — mas é um campo, não um
 *  parágrafo solto. */
export type StackItem = { name: string; why: string | null };

/**
 * Uma decisão no formato do §3.3: *"escolhi X em vez de Y, porque Z"*.
 *
 * As três partes são campos separados de propósito. Em prosa livre, a forma
 * derrete no primeiro case escrito com pressa — some o "em vez de", que é
 * justamente a parte que prova que houve escolha, e o case volta a ser vitrine.
 */
export type Decision = {
  chose: string;
  insteadOf: string;
  /**
   * Prosa em MDX: parágrafos e marcação inline, compilados em build time.
   * Use `|-` no YAML, não `>-` — o escalar dobrado transforma linha em branco
   * em UM `\n`, que markdown lê como quebra leve dentro do mesmo parágrafo, e
   * o campo volta a ser o bloco único que essa mudança veio desfazer.
   */
  because: string;
};

export type Project = {
  /** Também é o acento: o slug é a chave de `[data-accent='…']` no CSS (§6.1). */
  slug: Accent;
  name: string;
  tagline: string;
  /**
   * A `<meta name="description">` do case (§8), escrita à mão e factual.
   *
   * Mora no frontmatter, e não num dicionário de metadados, porque o §8 quer
   * descrição "escrita à mão" e o §2 quer "adicionar projeto novo = criar um
   * arquivo". Um dicionário com uma chave por slug satisfaria o primeiro e
   * quebraria o segundo, no lugar mais silencioso possível: o case novo
   * nasceria publicado e sem descrição.
   *
   * Não é a `tagline`. A tagline é uma frase de capa, feita para ser lida
   * **dentro** da página, ao lado do nome do projeto e sobre a cor dele
   * ("Organizar a música da Missa sem planilha e caderno"); a descrição é lida
   * **fora**, sozinha, num resultado de busca ou num card do LinkedIn, onde
   * nada do contexto da página está presente. Derivar uma da outra faria o
   * snippet do Google depender de um contexto que ele não tem.
   */
  description: string;
  kind: 'own' | 'work';
  status: 'live' | 'wip' | 'archived';
  liveUrl: string;
  /** `null` quando o repo é privado — o "E aí, fez?" é (§4.6). */
  repoUrl: string | null;
  accent: string;
  accentDark: string;
  stack: StackItem[];
  cover: Shot;
  /**
   * O print que representa o projeto no CARD (home e `/projetos`), que não é
   * necessariamente a capa.
   *
   * A capa é o artefato honesto de cada case e cada uma tem a orientação que
   * lhe cabe: a do Asafe é retrato (uma tela de repertório), a do "E aí, fez?"
   * é a imagem OG do app, 1200×630, porque é "o único elemento projetado para
   * ser visto fora do app" (§4.7). Lidas em sequência, nas páginas de case,
   * essa diferença é correta e fica.
   *
   * No card, não: ali os dois são vistos no MESMO instante oferecendo a mesma
   * coisa, e um celular alto ao lado de um cartão largo faz o olho ler duas
   * *categorias* de coisa em vez de duas ofertas paralelas — some o paralelismo,
   * que é o que faz o bloco funcionar. Por isso o card exige retrato, e a
   * exigência é validada aqui: um `cardShot` paisagem derruba o build.
   *
   * Omitir o campo é dizer "a capa serve" — e serve mesmo, desde que seja
   * retrato. Não é opcional no tipo de propósito: quem renderiza o card nunca
   * precisa saber de onde veio a imagem.
   */
  cardShot: Shot;
  shots: Shot[];
  decisions: Decision[];
  order: number;
  /** Corpo MDX cru, sem o frontmatter. Compilado na página do case. */
  body: string;
};

/**
 * Enquanto o arquivo do print não existe (Task 6b), o `src` é o `{{ }}` do §0.
 *
 * É predicado de tipo: quem passar por aqui recebe `ReadyShot` no ramo de
 * baixo, com `width` e `height` já garantidos como número. É o que deixa o
 * `next/image` receber dimensão sem `!` nem `?? 0` na página.
 */
export function isShotPending(shot: Shot): shot is PendingShot {
  return shot.src.trim().startsWith('{{');
}

/* --------------------------------- erros --------------------------------- */

function fail(file: string, message: string): never {
  throw new Error(`content/projects/${file}: ${message}`);
}

/* ------------------------------- validadores ------------------------------ */

type Data = Record<string, unknown>;

function str(file: string, data: Data, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(file, `campo \`${key}\` faltando ou vazio (§5)`);
  }
  return value;
}

function hex(file: string, data: Data, key: string): string {
  const value = str(file, data, key);
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    fail(file, `campo \`${key}\` precisa ser hex de 6 dígitos, veio "${value}" (§6.2)`);
  }
  return value;
}

function oneOf<T extends string>(file: string, data: Data, key: string, allowed: readonly T[]): T {
  const value = str(file, data, key);
  if (!allowed.includes(value as T)) {
    fail(file, `campo \`${key}\` só aceita ${allowed.join(' | ')}, veio "${value}" (§5)`);
  }
  return value as T;
}

function httpsUrl(file: string, data: Data, key: string): string {
  const value = str(file, data, key);
  if (!value.startsWith('https://')) {
    fail(file, `campo \`${key}\` precisa ser uma URL https, veio "${value}"`);
  }
  return value;
}

/**
 * Limites da `description` (§8).
 *
 * Não são o número mágico de nenhum buscador — o Google corta o snippet por
 * pixel, não por caractere, e o corte varia com o dispositivo. São o piso e o
 * teto do que uma frase precisa ter para funcionar sozinha: abaixo de 60 ela
 * não diz o que o projeto é, e acima de 200 quem a escreveu está contando com
 * um fim de frase que ninguém vai ler. É a mesma trava do dicionário do §8 em
 * `content/site.ts`; existe aqui de novo porque o frontmatter não passa por lá.
 */
const DESCRIPTION_MIN = 60;
const DESCRIPTION_MAX = 200;

function description(file: string, data: Data): string {
  const value = str(file, data, 'description').trim();
  if (value.length < DESCRIPTION_MIN || value.length > DESCRIPTION_MAX) {
    fail(
      file,
      `campo \`description\` tem ${value.length} caracteres — precisa ficar entre ${DESCRIPTION_MIN} e ${DESCRIPTION_MAX} (§8: é a meta description do case, lida fora da página)`,
    );
  }
  return value;
}

function num(file: string, data: Data, key: string): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(file, `campo \`${key}\` precisa ser um número (§5)`);
  }
  return value;
}

function list(file: string, data: Data, key: string): unknown[] {
  const value = data[key];
  if (!Array.isArray(value) || value.length === 0) {
    fail(file, `campo \`${key}\` precisa ser uma lista não vazia (§5)`);
  }
  return value;
}

function field(file: string, item: Data, key: string, where: string): string {
  const value = item[key];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(file, `${where}: falta \`${key}\``);
  }
  return value;
}

/**
 * Os campos de prosa do frontmatter (`because` e `why`) são compilados como
 * MDX, para que a decisão possa respirar em parágrafos e chamar `song_content`
 * de `song_content`. Isso abre uma porta que precisa ser fechada aqui: MDX
 * aceita qualquer coisa, e um `##` dentro de um `because` entraria na lista de
 * `<h2>` da página e quebraria o índice fixo do §3.3 — sem erro nenhum, só uma
 * página torta em produção.
 *
 * Então o campo aceita só o que ele é: parágrafos de marcação inline. Bloco é
 * recusado por nome, na hora do build, citando o arquivo e o campo. O mapa
 * restrito de `components/mdx-components.tsx` estiliza; quem garante é isto.
 */
const BLOCOS_PROIBIDOS = [
  { teste: /^\s{0,3}#{1,6}\s/m, nome: 'título' },
  { teste: /^\s{0,3}([-*+]|\d+[.)])\s/m, nome: 'lista' },
  { teste: /^\s{0,3}>/m, nome: 'citação' },
  { teste: /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/m, nome: 'régua' },
  { teste: /^\s{0,3}(```|~{3,})/m, nome: 'bloco de código' },
  { teste: /^\s{0,3}\|/m, nome: 'tabela' },
  { teste: /!\[/, nome: 'imagem' },
  { teste: /<[A-Za-z/]/, nome: 'HTML ou JSX' },
] as const;

function prosa(file: string, item: Data, key: string, where: string): string {
  const value = field(file, item, key, where);
  for (const { teste, nome } of BLOCOS_PROIBIDOS) {
    if (teste.test(value)) {
      fail(
        file,
        `${where}: \`${key}\` aceita parágrafos e marcação inline (\`code\`, **forte**, [link]) — veio com ${nome} (§3.3)`,
      );
    }
  }
  return value;
}

/**
 * `alt` preguiçoso é a regressão mais fácil do §9 — ninguém revisa alt, e
 * "print da tela" passa em qualquer revisão de PR. Então o piso é mecânico:
 * precisa ser uma frase, e não pode começar pelo nome do suporte ("print de…",
 * "screenshot de…"). O exemplo do §4.7 é o alvo: "tela de liturgia do dia do
 * Asafe, com as leituras e as músicas sugeridas".
 */
const ALT_PREGUICOSO = /^(print|screenshot|imagem|foto|captura)\b/i;

/**
 * Dimensão do print, em pixels do arquivo.
 *
 * Por que o número vem do frontmatter e não é lido do `.webp` em build time:
 * `parseProject` é puro de propósito — "separado da leitura em disco para que
 * o teste possa exercitar arquivo torto sem precisar escrever arquivo torto no
 * repo". Medir o arquivo aqui dentro amarraria a validação ao disco e mataria
 * essa separação.
 *
 * O risco óbvio do número escrito à mão é ele mentir sobre o arquivo — e aí a
 * reserva de espaço fica errada, que é justamente o problema de CLS que o §9
 * manda resolver. Esse buraco é fechado por teste: `tests/unit/projects.test.ts`
 * lê o cabeçalho de cada `.webp` e compara com o declarado. É o mesmo padrão
 * que já vale para o hex do acento (frontmatter × globals.css) e para a stack
 * (frontmatter × CV): a declaração é explícita, e um teste a amarra à realidade.
 */
function dimensao(file: string, item: Data, key: string, where: string): number {
  const value = item[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    fail(
      file,
      `${where}: \`${key}\` precisa ser a medida do arquivo em pixels, inteira e positiva — o §9 exige dimensão declarada em toda imagem`,
    );
  }
  return value;
}

function shot(file: string, raw: unknown, where: string): Shot {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(file, `${where}: precisa ser um objeto { src, alt } (§9 exige alt em todo print)`);
  }
  const item = raw as Data;
  const src = field(file, item, 'src', where);
  const alt = field(file, item, 'alt', where);
  if (alt.trim().length <= 20 || ALT_PREGUICOSO.test(alt.trim())) {
    fail(file, `${where}: \`alt\` precisa descrever a tela, não o suporte — veio "${alt}" (§9)`);
  }

  // Print pendente não tem arquivo, logo não tem medida. Declarar uma seria
  // inventar número — e número inventado aqui vira reserva de espaço errada no
  // dia em que o arquivo chegar com outro tamanho.
  if (src.trim().startsWith('{{')) {
    if (item.width !== undefined || item.height !== undefined) {
      fail(file, `${where}: print pendente (\`{{ }}\`) não declara \`width\`/\`height\``);
    }
    return { src, alt, width: null, height: null };
  }

  if (!src.startsWith('/') || !src.endsWith('.webp')) {
    // §9: "Imagens em .webp". O caminho é absoluto porque é servido de
    // `public/` — relativo quebraria só nas rotas aninhadas, que é o pior tipo
    // de quebra: a que não aparece na página que você estava olhando.
    fail(file, `${where}: \`src\` precisa ser um caminho absoluto \`.webp\` em public/, veio "${src}" (§9)`);
  }

  return {
    src,
    alt,
    width: dimensao(file, item, 'width', where),
    height: dimensao(file, item, 'height', where),
  };
}

function stackItem(file: string, raw: unknown, index: number): StackItem {
  const where = `stack[${index}]`;
  if (typeof raw === 'string') {
    if (raw.trim() === '') fail(file, `${where}: nome vazio`);
    return { name: raw, why: null };
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(file, `${where}: precisa ser um nome ou { name, why } (§3.3)`);
  }
  const item = raw as Data;
  const name = field(file, item, 'name', where);
  const why = item.why === undefined || item.why === null ? null : prosa(file, item, 'why', where);
  return { name, why };
}

function decision(file: string, raw: unknown, index: number): Decision {
  const where = `decisions[${index}]`;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(file, `${where}: precisa ser { chose, insteadOf, because } — "escolhi X em vez de Y, porque Z" (§3.3)`);
  }
  const item = raw as Data;
  return {
    // `chose` e `insteadOf` são a FÓRMULA, não prosa: o componente monta a
    // frase "Escolhi X em vez de Y" em volta deles. Continuam texto simples,
    // e é de propósito — parágrafo no meio da fórmula a desmancharia.
    chose: field(file, item, 'chose', where),
    insteadOf: field(file, item, 'insteadOf', where),
    because: prosa(file, item, 'because', where),
  };
}

/* ------------------------------ corpo do case ----------------------------- */

/**
 * O template do §3.3 é fixo, e a ordem faz parte dele: as decisões vêm antes
 * do estado, porque é a seção que carrega o site (§2). `<Decisoes />` e
 * `<Stack />` são os dois pontos onde o corpo em prosa dá lugar ao dado
 * estruturado do frontmatter — o MDX diz onde, o template diz como.
 */
const SECOES = [
  { nome: '## O problema', teste: /^##\s+O problema\s*$/m },
  { nome: '## O que é', teste: /^##\s+O que é\s*$/m },
  { nome: '<Decisoes />', teste: /<Decisoes\s*\/>/ },
  { nome: '<Stack />', teste: /<Stack\s*\/>/ },
  { nome: '## Estado', teste: /^##\s+Estado\s*$/m },
] as const;

function checkBody(file: string, body: string): void {
  let anterior = -1;
  let anteriorNome = '';
  for (const { nome, teste } of SECOES) {
    const match = teste.exec(body);
    if (match === null) fail(file, `falta a seção \`${nome}\` no corpo (§3.3)`);
    if (match.index < anterior) {
      fail(file, `\`${nome}\` aparece antes de \`${anteriorNome}\` — a ordem do §3.3 é fixa`);
    }
    anterior = match.index;
    anteriorNome = nome;
  }
}

/* -------------------------------- carregador ------------------------------ */

/**
 * Valida e normaliza um arquivo. Separado da leitura em disco para que o teste
 * possa exercitar arquivo torto sem precisar escrever arquivo torto no repo.
 */
export function parseProject(source: string, file: string): Project {
  const { data, content } = matter(source);
  const frontmatter = data as Data;

  const slug = str(file, frontmatter, 'slug');
  const esperado = file.replace(/\.mdx$/, '');
  if (slug !== esperado) {
    fail(file, `campo \`slug\` é "${slug}" mas o arquivo se chama "${esperado}"`);
  }
  if (!ACCENTS.includes(slug as Accent)) {
    fail(
      file,
      `o slug "${slug}" não tem cor: falta o bloco \`[data-accent='${slug}']\` em app/globals.css e a entrada em ACCENTS (§6.2)`,
    );
  }

  const repoUrl = 'repoUrl' in frontmatter ? frontmatter.repoUrl : undefined;
  if (repoUrl === undefined) {
    fail(file, 'campo `repoUrl` faltando — use `repoUrl: null` quando o repo for privado (§4.6)');
  }

  const decisions = list(file, frontmatter, 'decisions').map((raw, i) => decision(file, raw, i));
  if (decisions.length < 3 || decisions.length > 5) {
    fail(file, `\`decisions\` precisa ter de 3 a 5 itens (§3.3), veio com ${decisions.length}`);
  }

  const shots = list(file, frontmatter, 'shots').map((raw, i) => shot(file, raw, `shots[${i}]`));
  if (shots.length > 3) {
    // §4.7: "capa + 3 no case. Além disso ninguém olha, e o quinto print é
    // sempre o mais fraco — é ele que puxa a percepção do conjunto pra baixo."
    fail(file, `\`shots\` aceita no máximo 3 além da capa (§4.7), veio com ${shots.length}`);
  }

  checkBody(file, content);

  const cover = shot(file, frontmatter.cover, 'cover');
  const cardShot =
    frontmatter.cardShot === undefined ? cover : shot(file, frontmatter.cardShot, 'cardShot');
  if (!isShotPending(cardShot) && cardShot.width >= cardShot.height) {
    // O erro nomeia a saída, porque o caso real é justamente este: a capa do
    // "E aí, fez?" é paisagem, e sem `cardShot` o arquivo cairia aqui.
    fail(
      file,
      `\`cardShot\` precisa ser retrato (veio ${cardShot.width}×${cardShot.height}) — no card os dois projetos são vistos lado a lado e uma paisagem ao lado de um retrato lê como outra categoria de coisa. Declare \`cardShot\` com um print retrato quando a capa for paisagem.`,
    );
  }

  return {
    slug: slug as Accent,
    name: str(file, frontmatter, 'name'),
    tagline: str(file, frontmatter, 'tagline'),
    description: description(file, frontmatter),
    kind: oneOf(file, frontmatter, 'kind', ['own', 'work'] as const),
    status: oneOf(file, frontmatter, 'status', ['live', 'wip', 'archived'] as const),
    liveUrl: httpsUrl(file, frontmatter, 'liveUrl'),
    repoUrl: repoUrl === null ? null : httpsUrl(file, frontmatter, 'repoUrl'),
    accent: hex(file, frontmatter, 'accent'),
    accentDark: hex(file, frontmatter, 'accentDark'),
    stack: list(file, frontmatter, 'stack').map((raw, i) => stackItem(file, raw, i)),
    cover,
    cardShot,
    shots,
    decisions,
    order: num(file, frontmatter, 'order'),
    body: content,
  };
}

/** Todos os cases, na ordem do §4.6 — o Asafe abre a seção. */
export async function getAllProjects(): Promise<Project[]> {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  const projects = files.map((file) => parseProject(readFileSync(join(CONTENT_DIR, file), 'utf8'), file));

  // Ordem empatada é ordem indefinida, e a ordem é conteúdo aqui (§4.6).
  const orders = new Set(projects.map((p) => p.order));
  if (orders.size !== projects.length) {
    throw new Error('content/projects: dois projetos com o mesmo `order` (§4.6 fixa a ordem)');
  }

  return projects.sort((a, b) => a.order - b.order);
}

export async function getProject(slug: string): Promise<Project> {
  const all = await getAllProjects();
  const project = all.find((p) => p.slug === slug);
  if (!project) throw new Error(`content/projects: não existe projeto com slug "${slug}"`);
  return project;
}
