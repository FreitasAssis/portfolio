import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ACCENTS } from '@/components/AccentZone';
import { getAllProjects, getProject, isShotPending, parseProject } from '@/lib/projects';

import { accentSlugsInCss, resolveTokens, token } from '../helpers/globals-css';

/* ------------------------------------------------------------------------- *
 * O conteúdo real em content/projects/*.mdx
 * ------------------------------------------------------------------------- */

describe('carregador de projetos', () => {
  it('lê os projetos do diretório de conteúdo', async () => {
    const all = await getAllProjects();
    expect(all.map((p) => p.slug)).toContain('asafe');
  });

  it('ordena pelo campo order — o Asafe abre a seção (§4.6)', async () => {
    const all = await getAllProjects();
    expect(all[0].slug).toBe('asafe');
  });

  it('rejeita frontmatter incompleto', async () => {
    await expect(getProject('nao-existe')).rejects.toThrow();
  });

  it('valida que o accent é hex de 6 dígitos', async () => {
    const p = await getProject('asafe');
    expect(p.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('traz os dois cases do §4.6, e só eles', async () => {
    const all = await getAllProjects();
    expect(all.map((p) => p.slug)).toEqual(['asafe', 'eaifez']);
  });

  it('o repo do "E aí, fez?" é privado — repoUrl vem nulo (§4.6)', async () => {
    // O template não pode renderizar um botão morto para o GitHub.
    expect((await getProject('eaifez')).repoUrl).toBeNull();
    expect((await getProject('asafe')).repoUrl).toBe('https://github.com/FreitasAssis/Asafe');
  });

  it('todo projeto aponta para um app no ar (§4.6)', async () => {
    for (const p of await getAllProjects()) {
      expect(p.liveUrl).toMatch(/^https:\/\//);
      expect(p.status).toBe('live');
    }
  });
});

/* ------------------------------------------------------------------------- *
 * Validação: é o que faz "adicionar projeto = criar um arquivo" ser seguro.
 * Um arquivo malformado tem que quebrar o build citando arquivo e campo, não
 * publicar uma página torta. Os testes abaixo usam `parseProject` com fontes
 * sintéticas — é a mesma função que o carregador roda em cada arquivo.
 * ------------------------------------------------------------------------- */

const FRONTMATTER = `---
slug: asafe
name: Asafe
tagline: Organizar a música da Missa sem planilha e caderno.
kind: own
status: live
liveUrl: https://asafe.mus.br
repoUrl: https://github.com/FreitasAssis/Asafe
accent: '#2F3A5E'
accentDark: '#8E9AC4'
order: 1
stack:
  - Next.js
  - name: Supabase
    why: banco, auth e RLS num serviço só
cover:
  src: '{{ }}'
  alt: repertório do Asafe montado na ordem do rito, um bloco por momento da celebração
shots:
  - src: '{{ }}'
    alt: tela de liturgia do dia do Asafe, com as leituras e as músicas sugeridas
decisions:
  - chose: AGPL-3.0
    insteadOf: MIT
    because: '{{ }}'
  - chose: busca por dois eixos
    insteadOf: um eixo só
    because: '{{ }}'
  - chose: licença de uso
    insteadOf: cessão de direitos
    because: '{{ }}'
---
`;

const BODY = `
## O problema

{{ }}

## O que é

{{ }}

<Decisoes />

<Stack />

## Estado

{{ }}
`;

const VALIDO = FRONTMATTER + BODY;

/** Remove a linha do campo, como faria quem esqueceu de escrevê-lo. */
function sem(campo: string): string {
  return VALIDO.replace(new RegExp(`^${campo}:.*\\n`, 'm'), '');
}

describe('validação do frontmatter (§5)', () => {
  it('aceita o arquivo bem formado', () => {
    const p = parseProject(VALIDO, 'asafe.mdx');
    expect(p.name).toBe('Asafe');
    expect(p.order).toBe(1);
  });

  it.each(['name', 'tagline', 'kind', 'status', 'liveUrl', 'accent', 'accentDark', 'order'])(
    'sem %s, o erro cita o arquivo e o campo',
    (campo) => {
      expect(() => parseProject(sem(campo), 'asafe.mdx')).toThrow(
        new RegExp(`asafe\\.mdx.*${campo}`),
      );
    },
  );

  it('repoUrl ausente não é o mesmo que repoUrl nulo — a ausência é erro', () => {
    // `repoUrl: null` é uma afirmação ("o repo é privado"); a ausência é
    // esquecimento, e o esquecimento não pode virar um botão que some sozinho.
    expect(() => parseProject(sem('repoUrl'), 'asafe.mdx')).toThrow(/repoUrl/);
    expect(parseProject(VALIDO.replace(/^repoUrl:.*$/m, 'repoUrl: null'), 'asafe.mdx').repoUrl).toBeNull();
  });

  it('rejeita accent que não é hex de 6 dígitos', () => {
    expect(() => parseProject(VALIDO.replace("'#2F3A5E'", 'indigo'), 'asafe.mdx')).toThrow(
      /accent/,
    );
    expect(() => parseProject(VALIDO.replace("'#2F3A5E'", "'#2F3'"), 'asafe.mdx')).toThrow(
      /accent/,
    );
  });

  it('rejeita kind e status fora do vocabulário do §5', () => {
    expect(() => parseProject(VALIDO.replace('kind: own', 'kind: pessoal'), 'asafe.mdx')).toThrow(
      /kind/,
    );
    expect(() => parseProject(VALIDO.replace('status: live', 'status: no ar'), 'asafe.mdx')).toThrow(
      /status/,
    );
  });

  it('rejeita slug que não bate com o nome do arquivo', () => {
    expect(() => parseProject(VALIDO, 'outro.mdx')).toThrow(/slug/);
  });

  it('rejeita slug sem bloco [data-accent] correspondente no CSS', () => {
    // A cor injetada mora no globals.css (§6.2). Um case cujo slug não tem
    // bloco lá renderiza a capa em cinza e o texto em cinza, sem erro nenhum.
    const outro = VALIDO.replace('slug: asafe', 'slug: novoapp');
    expect(() => parseProject(outro, 'novoapp.mdx')).toThrow(/data-accent/);
  });

  it('rejeita stack vazia — a stack é legenda do projeto (§2)', () => {
    expect(() => parseProject(VALIDO.replace(/stack:\n(  - .*\n|    .*\n)+/, 'stack: []\n'), 'asafe.mdx')).toThrow(
      /stack/,
    );
  });
});

describe('validação do corpo — o template do §3.3 é fixo', () => {
  it('cobra a seção que faltar', () => {
    expect(() => parseProject(VALIDO.replace('## Estado', '## Situação'), 'asafe.mdx')).toThrow(
      /asafe\.mdx.*Estado/,
    );
  });

  it('cobra o lugar das Decisões e da Stack', () => {
    expect(() => parseProject(VALIDO.replace('<Decisoes />', ''), 'asafe.mdx')).toThrow(
      /Decisoes/,
    );
    expect(() => parseProject(VALIDO.replace('<Stack />', ''), 'asafe.mdx')).toThrow(/Stack/);
  });

  it('cobra a ordem do §3.3, não só a presença', () => {
    // Decisões depois de Estado é um case que vira vitrine com apêndice.
    const trocado = FRONTMATTER + BODY.replace('<Decisoes />\n\n<Stack />\n\n## Estado', '## Estado\n\n<Decisoes />\n\n<Stack />');
    expect(() => parseProject(trocado, 'asafe.mdx')).toThrow(/ordem/i);
  });
});

/* ------------------------------------------------------------------------- *
 * Decisões — o ativo principal do site (§2). O formato é o que prova
 * senioridade; se ele derreter em prosa solta, o case vira vitrine (§3.3).
 * ------------------------------------------------------------------------- */

describe('decisões (§3.3)', () => {
  it('cada case traz de 3 a 5 decisões', async () => {
    for (const p of await getAllProjects()) {
      expect(p.decisions.length).toBeGreaterThanOrEqual(3);
      expect(p.decisions.length).toBeLessThanOrEqual(5);
    }
  });

  it('toda decisão carrega as três partes de "escolhi X em vez de Y, porque Z"', async () => {
    for (const p of await getAllProjects()) {
      for (const d of p.decisions) {
        expect(d.chose.length).toBeGreaterThan(0);
        expect(d.insteadOf.length).toBeGreaterThan(0);
        expect(d.because.length).toBeGreaterThan(0);
      }
    }
  });

  it('rejeita decisão sem a alternativa ou sem o porquê', () => {
    const semAlternativa = VALIDO.replace('    insteadOf: MIT\n', '');
    expect(() => parseProject(semAlternativa, 'asafe.mdx')).toThrow(/insteadOf/);
    const semPorque = VALIDO.replace("    because: '{{ }}'\n", '');
    expect(() => parseProject(semPorque, 'asafe.mdx')).toThrow(/because/);
  });

  it('rejeita menos de 3 decisões — o §3.3 não deixa o case ficar raso', () => {
    const duas = VALIDO.replace(
      "  - chose: licença de uso\n    insteadOf: cessão de direitos\n    because: '{{ }}'\n",
      '',
    );
    expect(() => parseProject(duas, 'asafe.mdx')).toThrow(/decisions/);
  });
});

/* ------------------------------------------------------------------------- *
 * `because` e `why` são compilados como MDX, para que a decisão respire em
 * parágrafos e chame `song_content` de `song_content`. O preço disso é que MDX
 * aceita qualquer coisa: um `##` aqui dentro entra na lista de `<h2>` da página
 * e quebra o índice fixo do §3.3, sem erro nenhum. Estes testes são a porta
 * fechada — o mapa restrito de componentes só estiliza o que passar por aqui.
 * ------------------------------------------------------------------------- */

describe('prosa do frontmatter', () => {
  const comBecause = (valor: string) => VALIDO.replace("    because: '{{ }}'", `    because: ${valor}`);

  it('aceita parágrafos e marcação inline', () => {
    const p = parseProject(comBecause('"Primeiro `code` e **forte**.\\n\\nSegundo."'), 'asafe.mdx');
    expect(p.decisions[0].because).toBe('Primeiro `code` e **forte**.\n\nSegundo.');
  });

  it.each([
    ['título', '"## Título"'],
    ['lista', '"- um item"'],
    ['lista', '"1. um item"'],
    ['citação', '"> citando"'],
    ['régua', '"---"'],
    ['bloco de código', '"```js"'],
    ['tabela', '"| a | b |"'],
    ['imagem', '"![alt](/x.webp)"'],
    ['HTML ou JSX', '"<Decisoes />"'],
  ])('recusa %s no `because`, citando o campo', (nome, valor) => {
    expect(() => parseProject(comBecause(valor), 'asafe.mdx')).toThrow(
      new RegExp(`decisions\\[0\\].*because.*${nome}`),
    );
  });

  it('vale também para o `why` da stack', () => {
    const torto = VALIDO.replace(
      "    why: banco, auth e RLS num serviço só",
      '    why: "## banco"',
    );
    expect(() => parseProject(torto, 'asafe.mdx')).toThrow(/stack\[1\].*why.*título/);
  });

  it('decisão longa quebra em parágrafos, em vez de virar um bloco só', async () => {
    // O motivo de a compilação em MDX existir. A decisão dos dois eixos do
    // Asafe chegou a 171 palavras num `<p>` único: o item que mais precisa ser
    // lido era o que mais convidava a desistir no meio.
    //
    // O teto é por PARÁGRAFO, não pelo campo — o campo pode (e deve) ser longo
    // quando a decisão é densa; o que não pode é não respirar. 90 palavras já
    // são ~9 linhas na coluna de 68 caracteres do §6.3.
    //
    // Isto também pega o erro de YAML mais fácil de cometer aqui: escrever o
    // campo com `>-` em vez de `|-`. O escalar dobrado transforma linha em
    // branco em UM `\n`, que o markdown lê como quebra leve dentro do mesmo
    // parágrafo — os parágrafos somem e o bloco único volta, sem erro nenhum.
    for (const p of await getAllProjects()) {
      for (const d of p.decisions) {
        for (const paragrafo of d.because.split(/\n\s*\n/)) {
          const palavras = paragrafo.trim().split(/\s+/).length;
          expect(palavras, `${p.slug} — "${d.chose}"`).toBeLessThanOrEqual(90);
        }
      }
    }
  });
});

/* ------------------------------------------------------------------------- *
 * Prints (§4.7 e §9)
 * ------------------------------------------------------------------------- */

const ALT_PREGUIÇOSO = /^(print|screenshot|imagem|foto|captura)$/i;

describe('prints (§9)', () => {
  it('todo print tem alt descritivo, não "print"', async () => {
    for (const p of await getAllProjects()) {
      for (const shot of [p.cover, ...p.shots]) {
        expect(shot.alt.length).toBeGreaterThan(20);
        expect(shot.alt).not.toMatch(ALT_PREGUIÇOSO);
      }
    }
  });

  it('rejeita alt curto ou genérico no arquivo', () => {
    const curto = VALIDO.replace(/alt: tela de liturgia.*/, 'alt: print');
    expect(() => parseProject(curto, 'asafe.mdx')).toThrow(/alt/);
    const generico = VALIDO.replace(
      /alt: tela de liturgia.*/,
      'alt: screenshot do aplicativo Asafe',
    );
    expect(() => parseProject(generico, 'asafe.mdx')).toThrow(/alt/);
  });

  it('a capa também é um print, e também precisa de alt (§4.7)', async () => {
    const p = await getProject('asafe');
    expect(p.cover.alt.length).toBeGreaterThan(20);
  });

  it('no máximo 3 prints além da capa (§4.7)', async () => {
    for (const p of await getAllProjects()) {
      expect(p.shots.length).toBeGreaterThanOrEqual(1);
      expect(p.shots.length).toBeLessThanOrEqual(3);
    }
  });
});

/* ------------------------------------------------------------------------- *
 * Dimensão declarada (§9: "Imagens em .webp, com next/image e dimensões
 * declaradas").
 *
 * O número mora no frontmatter porque `parseProject` é puro e não lê disco. O
 * preço disso é que ele pode mentir sobre o arquivo — e dimensão errada é pior
 * que dimensão ausente: reserva o espaço errado e o layout pula do mesmo jeito,
 * só que agora com a aparência de resolvido. Este bloco é o que fecha o buraco:
 * lê o cabeçalho de cada `.webp` e compara com o declarado.
 * ------------------------------------------------------------------------- */

/**
 * Largura e altura pelo cabeçalho do arquivo — os primeiros 30 bytes bastam.
 *
 * À mão em vez de uma dependência: são três variantes de contêiner (`VP8 `
 * lossy, `VP8L` lossless, `VP8X` estendido) e vinte linhas, e a alternativa
 * seria puxar um pacote inteiro para um teste. Mesma conta que o
 * `tests/e2e/static-server.mjs` já fez.
 */
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`${file}: não é um WebP`);
  }
  const formato = b.toString('ascii', 12, 16);
  if (formato === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (formato === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (formato === 'VP8X') {
    const ler24 = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
    return { width: ler24(24) + 1, height: ler24(27) + 1 };
  }
  throw new Error(`${file}: contêiner WebP desconhecido (${formato})`);
}

describe('dimensão dos prints (§9)', () => {
  it('a medida declarada é a medida do arquivo', async () => {
    let conferidos = 0;
    for (const p of await getAllProjects()) {
      for (const shot of [p.cover, ...p.shots]) {
        if (isShotPending(shot)) continue;
        const file = join(process.cwd(), 'public', shot.src);
        expect(existsSync(file), `${p.slug}: ${shot.src} não existe em public/`).toBe(true);
        expect(webpSize(file), `${p.slug}: ${shot.src}`).toEqual({
          width: shot.width,
          height: shot.height,
        });
        conferidos += 1;
      }
    }
    // Se um dia todo mundo virar `{{ }}` de novo, o laço acima passa vazio e o
    // teste vira decoração. Os quatro do "E aí, fez?" são o piso de hoje.
    expect(conferidos).toBeGreaterThanOrEqual(4);
  });

  it('convivem um case com print de verdade e outro ainda pendente (§0)', async () => {
    // O carregador não pode exigir que os dois cases estejam no mesmo estado —
    // é exatamente a situação enquanto o Asafe é capturado. Quando os prints
    // dele entrarem, este teste continua valendo: ele afirma a regra por print,
    // não o placar entre os projetos.
    const todos = await getAllProjects();
    for (const p of todos) {
      for (const shot of [p.cover, ...p.shots]) {
        if (isShotPending(shot)) {
          expect(shot.width, `${p.slug}: pendente não declara medida`).toBeNull();
          expect(shot.height).toBeNull();
        } else {
          expect(shot.width, `${p.slug}: ${shot.src}`).toBeGreaterThan(0);
          expect(shot.height).toBeGreaterThan(0);
        }
      }
    }
    // E o estado de hoje, para que a virada do Asafe seja uma mudança visível
    // aqui, e não um silêncio: um case inteiro pronto, um case inteiro pendente.
    const pendentesPorCase = todos.map(
      (p) => [p.cover, ...p.shots].filter(isShotPending).length,
    );
    expect(pendentesPorCase.some((n) => n === 0)).toBe(true);
  });

  it('exige a medida quando o print é de verdade', () => {
    const real = VALIDO.replace(
      "cover:\n  src: '{{ }}'",
      'cover:\n  src: /projects/asafe/cover.webp',
    );
    expect(() => parseProject(real, 'asafe.mdx')).toThrow(/cover.*width/);
  });

  it('recusa medida em print ainda pendente', () => {
    const comMedida = VALIDO.replace("cover:\n  src: '{{ }}'", "cover:\n  width: 1200\n  src: '{{ }}'");
    expect(() => parseProject(comMedida, 'asafe.mdx')).toThrow(/cover.*pendente/);
  });

  it('recusa medida que não é pixel inteiro e positivo', () => {
    const base = VALIDO.replace(
      "cover:\n  src: '{{ }}'",
      'cover:\n  src: /projects/asafe/cover.webp\n  width: 1200\n  height: 630',
    );
    expect(() => parseProject(base.replace('height: 630', 'height: 0'), 'asafe.mdx')).toThrow(
      /cover.*height/,
    );
    expect(() => parseProject(base.replace('height: 630', 'height: 630.5'), 'asafe.mdx')).toThrow(
      /cover.*height/,
    );
  });

  it('recusa src que não é .webp em public/ (§9)', () => {
    const png = VALIDO.replace(
      "cover:\n  src: '{{ }}'",
      'cover:\n  src: /projects/asafe/cover.png\n  width: 1200\n  height: 630',
    );
    expect(() => parseProject(png, 'asafe.mdx')).toThrow(/cover.*webp/);
  });
});

/* ------------------------------------------------------------------------- *
 * O acordo de três pontas: conteúdo, união `Accent` e globals.css.
 * A união não pode ser derivada do sistema de arquivos em tempo de tipo, então
 * o que sincroniza as três listas é este teste — mais o `parseProject`, que
 * derruba o build quando um slug novo não tem cor definida.
 * ------------------------------------------------------------------------- */

describe('acento (§6.1)', () => {
  it('os slugs do conteúdo, a união Accent e o CSS falam dos mesmos acentos', async () => {
    const doConteudo = (await getAllProjects()).map((p) => p.slug).sort();
    expect([...ACCENTS].sort()).toEqual(doConteudo);
    expect(accentSlugsInCss()).toEqual(doConteudo);
  });

  it.each(['asafe', 'eaifez'])('o hex do frontmatter de %s é o hex do CSS', async (slug) => {
    // Divergir aqui renderiza a capa numa cor e o texto do case em outra, sem
    // nenhum erro: o frontmatter alimenta a capa e o CSS alimenta os tokens.
    const p = await getProject(slug);
    expect(p.accent.toLowerCase()).toBe(token(resolveTokens('claro', slug), '--accent'));
    expect(p.accentDark.toLowerCase()).toBe(
      token(resolveTokens('escuro', slug), '--accent-text'),
    );
  });
});

/* ------------------------------------------------------------------------- *
 * Stack (§3.3: "com o porquê de cada escolha não-óbvia")
 * ------------------------------------------------------------------------- */

describe('stack', () => {
  it('aceita o item simples do §5 e o item com porquê', () => {
    const p = parseProject(VALIDO, 'asafe.mdx');
    expect(p.stack[0]).toEqual({ name: 'Next.js', why: null });
    expect(p.stack[1]).toEqual({ name: 'Supabase', why: 'banco, auth e RLS num serviço só' });
  });

  it('a stack do Asafe é a mesma do CV (§4.5: as mesmas palavras)', async () => {
    const p = await getProject('asafe');
    expect(p.stack.map((s) => s.name)).toEqual([
      'Next.js',
      'Expo',
      'TypeScript',
      'Supabase',
      'Drizzle ORM',
      'Cloudflare Workers',
    ]);
  });
});
