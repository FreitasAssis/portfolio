/**
 * Carregador dos cases em `content/projects/*.mdx`.
 *
 * Adicionar um projeto é criar um arquivo, sem mexer em código — e é a validação
 * dura daqui que torna isso seguro: um arquivo torto quebra o build citando o
 * arquivo e o campo, em vez de publicar um case sem decisões, um botão que aponta
 * pro vazio ou um print sem alt.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

import { ACCENTS, type Accent } from '@/components/AccentZone';

const CONTENT_DIR = join(process.cwd(), 'content/projects');

/** Um print que ainda não existe: `{{ }}` no lugar do arquivo, e sem dimensão. */
export type PendingShot = { src: string; alt: string; width: null; height: null };

/** Um print de verdade, com a dimensão do arquivo declarada. */
export type ReadyShot = { src: string; alt: string; width: number; height: number };

export type Shot = PendingShot | ReadyShot;

export type StackItem = { name: string; why: string | null };

/**
 * Uma decisão: *"escolhi X em vez de Y, porque Z"*. As três partes são campos
 * separados para que o "em vez de" — a parte que prova que houve escolha, e não
 * só adoção — não derreta no primeiro case escrito com pressa.
 */
export type Decision = {
  chose: string;
  insteadOf: string;
  /** Prosa em MDX: parágrafos e marcação inline, compilados em build time. */
  because: string;
};

export type Project = {
  /** Também é o acento: o slug é a chave de `[data-accent='…']` no CSS. */
  slug: Accent;
  name: string;
  tagline: string;
  /**
   * A `<meta name="description">` do case. Não é a `tagline`: a tagline é lida
   * DENTRO da página, ao lado do nome e sobre a cor do projeto; a descrição é
   * lida FORA, sozinha, num resultado de busca. Derivar uma da outra faz o
   * snippet depender de um contexto que ele não tem.
   */
  description: string;
  kind: 'own' | 'work';
  status: 'live' | 'wip' | 'archived';
  liveUrl: string;
  /** `null` quando o repo é privado. */
  repoUrl: string | null;
  accent: string;
  accentDark: string;
  stack: StackItem[];
  cover: Shot;
  /**
   * O print do CARD (home e `/projetos`), que não é necessariamente a capa: no
   * card os dois projetos são vistos no mesmo instante, e um celular alto ao lado
   * de um cartão largo lê como duas categorias de coisa em vez de duas ofertas
   * paralelas. Daí a exigência de retrato, validada abaixo. Omitir no frontmatter
   * é dizer "a capa serve"; não é opcional no tipo porque quem renderiza o card
   * nunca precisa saber de onde veio a imagem.
   */
  cardShot: Shot;
  shots: Shot[];
  decisions: Decision[];
  order: number;
  /** Corpo MDX cru, sem o frontmatter. Compilado na página do case. */
  body: string;
};

/**
 * Predicado de tipo: no ramo falso quem chamou recebe `ReadyShot`, com `width` e
 * `height` garantidos como número — é o que deixa o `next/image` receber dimensão
 * sem `!` nem `?? 0` na página.
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
 * Piso e teto do que uma frase precisa ter para funcionar sozinha — não o número
 * mágico de nenhum buscador, que corta por pixel. A mesma trava existe em
 * `content/site.ts`; repete aqui porque o frontmatter não passa por lá.
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
 * `because` e `why` são compilados como MDX, e MDX aceita qualquer coisa: um `##`
 * dentro de um `because` entraria na lista de `<h2>` da página e quebraria o
 * índice fixo do case sem erro nenhum. Bloco é recusado por nome, no build.
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
 * `alt` preguiçoso é a regressão mais fácil que existe — ninguém revisa alt, e
 * "print da tela" passa em qualquer revisão. Então o piso é mecânico: uma frase,
 * que não comece pelo nome do suporte.
 */
const ALT_PREGUICOSO = /^(print|screenshot|imagem|foto|captura)\b/i;

/**
 * Dimensão do print, em pixels do arquivo. Vem do frontmatter e não é lida do
 * `.webp`: medir o arquivo aqui amarraria `parseProject` ao disco. Que o número
 * declarado bate com o arquivo é `tests/unit/projects.test.ts` quem garante, lendo
 * o cabeçalho de cada `.webp`.
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

  // Print pendente não tem arquivo, logo não tem medida: um número inventado aqui
  // vira reserva de espaço errada no dia em que o arquivo chegar.
  if (src.trim().startsWith('{{')) {
    if (item.width !== undefined || item.height !== undefined) {
      fail(file, `${where}: print pendente (\`{{ }}\`) não declara \`width\`/\`height\``);
    }
    return { src, alt, width: null, height: null };
  }

  if (!src.startsWith('/') || !src.endsWith('.webp')) {
    // Absoluto porque é servido de `public/`: um caminho relativo quebraria só nas
    // rotas aninhadas, e não na página que quem editou estava olhando.
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
    // `chose` e `insteadOf` são a FÓRMULA em volta da qual o componente monta a
    // frase, não prosa: parágrafo no meio dela a desmancharia.
    chose: field(file, item, 'chose', where),
    insteadOf: field(file, item, 'insteadOf', where),
    because: prosa(file, item, 'because', where),
  };
}

/* ------------------------------ corpo do case ----------------------------- */

/**
 * O template do case é fixo, e a ordem faz parte dele. `<Decisoes />` e
 * `<Stack />` são os dois pontos onde o corpo em prosa dá lugar ao dado
 * estruturado do frontmatter: o MDX diz onde, o template diz como.
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
 * possa exercitar arquivo torto sem escrever arquivo torto no repo.
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
    fail(file, `\`shots\` aceita no máximo 3 além da capa (§4.7), veio com ${shots.length}`);
  }

  checkBody(file, content);

  const cover = shot(file, frontmatter.cover, 'cover');
  const cardShot =
    frontmatter.cardShot === undefined ? cover : shot(file, frontmatter.cardShot, 'cardShot');
  if (!isShotPending(cardShot) && cardShot.width >= cardShot.height) {
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

/** Todos os cases, ordenados por `order`. */
export async function getAllProjects(): Promise<Project[]> {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  const projects = files.map((file) => parseProject(readFileSync(join(CONTENT_DIR, file), 'utf8'), file));

  // Ordem empatada é ordem indefinida, e a ordem é conteúdo aqui.
  const orders = new Set(projects.map((p) => p.order));
  if (orders.size !== projects.length) {
    throw new Error('content/projects: dois projetos com o mesmo `order` (§4.6 fixa a ordem)');
  }

  return projects.sort((a, b) => a.order - b.order);
}

/**
 * O case seguinte na ordem, ou `null` quando o slug é o último.
 *
 * Derivado do `order`, nunca de um par escrito à mão: com
 * `slug === 'asafe' ? 'eaifez' : '/projetos'`, um terceiro `.mdx` nasce com página
 * e o link continua apontando para o segundo case, sem nada reclamar. A ordenação
 * acontece aqui dentro, então o resultado não depende de quem chamou.
 */
export function nextProject(projects: readonly Project[], slug: string): Project | null {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error(`content/projects: não existe projeto com slug "${slug}"`);
  return ordered[index + 1] ?? null;
}

export async function getProject(slug: string): Promise<Project> {
  const all = await getAllProjects();
  const project = all.find((p) => p.slug === slug);
  if (!project) throw new Error(`content/projects: não existe projeto com slug "${slug}"`);
  return project;
}
