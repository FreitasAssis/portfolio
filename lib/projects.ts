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

/** Um print. `alt` é obrigatório e descritivo — §9 não negocia. */
export type Shot = {
  /** Caminho do `.webp`, ou o placeholder `{{ }}` enquanto o print não existe. */
  src: string;
  alt: string;
};

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
export type Decision = { chose: string; insteadOf: string; because: string };

export type Project = {
  /** Também é o acento: o slug é a chave de `[data-accent='…']` no CSS (§6.1). */
  slug: Accent;
  name: string;
  tagline: string;
  kind: 'own' | 'work';
  status: 'live' | 'wip' | 'archived';
  liveUrl: string;
  /** `null` quando o repo é privado — o "E aí, fez?" é (§4.6). */
  repoUrl: string | null;
  accent: string;
  accentDark: string;
  stack: StackItem[];
  cover: Shot;
  shots: Shot[];
  decisions: Decision[];
  order: number;
  /** Corpo MDX cru, sem o frontmatter. Compilado na página do case. */
  body: string;
};

/** Enquanto o arquivo do print não existe (Task 6), o `src` é o `{{ }}` do §0. */
export function isShotPending(shot: Shot): boolean {
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
 * `alt` preguiçoso é a regressão mais fácil do §9 — ninguém revisa alt, e
 * "print da tela" passa em qualquer revisão de PR. Então o piso é mecânico:
 * precisa ser uma frase, e não pode começar pelo nome do suporte ("print de…",
 * "screenshot de…"). O exemplo do §4.7 é o alvo: "tela de liturgia do dia do
 * Asafe, com as leituras e as músicas sugeridas".
 */
const ALT_PREGUICOSO = /^(print|screenshot|imagem|foto|captura)\b/i;

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
  return { src, alt };
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
  const why = item.why === undefined || item.why === null ? null : field(file, item, 'why', where);
  return { name, why };
}

function decision(file: string, raw: unknown, index: number): Decision {
  const where = `decisions[${index}]`;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail(file, `${where}: precisa ser { chose, insteadOf, because } — "escolhi X em vez de Y, porque Z" (§3.3)`);
  }
  const item = raw as Data;
  return {
    chose: field(file, item, 'chose', where),
    insteadOf: field(file, item, 'insteadOf', where),
    because: field(file, item, 'because', where),
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

  return {
    slug: slug as Accent,
    name: str(file, frontmatter, 'name'),
    tagline: str(file, frontmatter, 'tagline'),
    kind: oneOf(file, frontmatter, 'kind', ['own', 'work'] as const),
    status: oneOf(file, frontmatter, 'status', ['live', 'wip', 'archived'] as const),
    liveUrl: httpsUrl(file, frontmatter, 'liveUrl'),
    repoUrl: repoUrl === null ? null : httpsUrl(file, frontmatter, 'repoUrl'),
    accent: hex(file, frontmatter, 'accent'),
    accentDark: hex(file, frontmatter, 'accentDark'),
    stack: list(file, frontmatter, 'stack').map((raw, i) => stackItem(file, raw, i)),
    cover: shot(file, frontmatter.cover, 'cover'),
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
