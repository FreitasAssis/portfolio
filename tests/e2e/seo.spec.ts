import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { expect, test } from '@playwright/test';

/**
 * §8 contra o artefato publicado.
 *
 * ## Por que aqui, e não num teste unitário
 *
 * `tests/unit/site.test.ts` já checa o dicionário na origem. O que ele não pode
 * checar é se o texto **chegou ao HTML**: uma rota que esqueça de exportar
 * `metadata`, um `title.template` que engula o valor, um `metadataBase` ausente
 * que faça o canonical apontar para `localhost` — nada disso aparece no
 * dicionário, e todos apareceriam no `out/`.
 *
 * Este arquivo mora no Playwright porque é ele que já roda contra o build de
 * produção: o `webServer` de `playwright.config.ts` executa `npm run build`
 * antes do primeiro teste, então o `out/` existe e é o mesmo que vai ao ar. Um
 * teste equivalente no Vitest precisaria de um `out/` que `npm run test` não
 * garante — e passaria lendo o build da semana passada.
 *
 * A maior parte não abre o navegador: lê o arquivo. É de propósito — o alvo é o
 * byte publicado, não o DOM depois da hidratação.
 */

const OUT = fileURLToPath(new URL('../../out/', import.meta.url));

/**
 * O domínio, escrito à mão de propósito.
 *
 * Importar `SITE_URL` de `content/site.ts` faria o teste concordar consigo
 * mesmo: se alguém trocasse a constante por engano, as duas pontas mudariam
 * juntas e nada falharia. Aqui o valor é a expectativa externa — o endereço em
 * que o site vai ao ar — e trocar de domínio deve, sim, exigir tocar neste
 * arquivo.
 */
const SITE = 'https://luizfreitas.com.br';

/** As seis rotas do §8, com o arquivo que cada uma produz no export. */
const ROTAS = [
  { path: '/', file: 'index.html' },
  { path: '/projetos', file: 'projetos.html' },
  { path: '/projetos/asafe', file: 'projetos/asafe.html' },
  { path: '/projetos/eaifez', file: 'projetos/eaifez.html' },
  { path: '/sobre', file: 'sobre.html' },
  { path: '/contato', file: 'contato.html' },
] as const;

function html(file: string): string {
  return readFileSync(OUT + file, 'utf8');
}

/** O conteúdo de uma `<meta>` por `name` ou `property`, com entidades resolvidas. */
function metaContent(source: string, key: string): string {
  const pattern = new RegExp(
    `<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"|<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key}"`,
  );
  const match = pattern.exec(source);
  return decode(match?.[1] ?? match?.[2] ?? '');
}

/** O Next escapa o texto ao serializar; comparar sem desfazer isso mede o escape. */
function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * As leituras acontecem DENTRO de cada teste, e não no corpo do `describe`.
 *
 * O Playwright carrega os arquivos de teste para descobrir os casos antes de o
 * `webServer` rodar `npm run build`. Um `readFileSync` no topo leria, na melhor
 * hipótese, o `out/` de um build anterior — e o teste passaria medindo o
 * artefato errado, que é a única falha pior do que não ter teste.
 */
function titles(): string[] {
  return ROTAS.map(({ file }) => decode(/<title>(.*?)<\/title>/.exec(html(file))?.[1] ?? ''));
}

function descriptions(): string[] {
  return ROTAS.map(({ file }) => metaContent(html(file), 'description'));
}

test.describe('metadados por rota (§8)', () => {
  test('nenhuma das seis rotas fica sem title', () => {
    for (const [i, title] of titles().entries()) {
      expect(title, `sem <title> em ${ROTAS[i].path}`).not.toBe('');
    }
  });

  test('nenhum title se repete — o bug do site antigo', () => {
    const lista = titles();
    expect(new Set(lista).size, `títulos: ${JSON.stringify(lista)}`).toBe(lista.length);
  });

  test('nenhuma description se repete', () => {
    const lista = descriptions();
    expect(new Set(lista).size, `descrições: ${JSON.stringify(lista)}`).toBe(lista.length);
  });

  test('nenhuma rota fica sem description', () => {
    for (const [i, description] of descriptions().entries()) {
      expect(description, `sem description em ${ROTAS[i].path}`).not.toBe('');
    }
  });

  test('a description do site antigo não sobreviveu em lugar nenhum (§8)', () => {
    for (const { path, file } of ROTAS) {
      const source = html(file).toLowerCase();
      expect(source, `em ${path}`).not.toContain('transformando ideias');
      expect(source, `em ${path}`).not.toContain('impulsionar seu negócio');
    }
  });

  test('cada rota tem canonical absoluto e apontando para si mesma', () => {
    for (const { path, file } of ROTAS) {
      const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html(file))?.[1];
      const esperado = path === '/' ? SITE : `${SITE}${path}`;
      expect(canonical, `canonical de ${path}`).toBe(esperado);
    }
  });

  test('nenhum canonical vazou para localhost — o risco do metadataBase no export', () => {
    for (const { path, file } of ROTAS) {
      expect(html(file), `em ${path}`).not.toContain('localhost:3000');
    }
  });

  test('o título do case sai do nome no frontmatter (§2 + §8)', () => {
    const lista = titles();
    expect(lista[ROTAS.findIndex((r) => r.path === '/projetos/asafe')]).toBe(
      'Asafe — projeto de Luiz Freitas',
    );
    expect(lista[ROTAS.findIndex((r) => r.path === '/projetos/eaifez')]).toBe(
      'E aí, fez? — projeto de Luiz Freitas',
    );
  });

  test('o Open Graph está montado em toda rota', () => {
    for (const { path, file } of ROTAS) {
      const source = html(file);
      expect(metaContent(source, 'og:title'), `og:title de ${path}`).not.toBe('');
      expect(metaContent(source, 'og:description'), `og:description de ${path}`).not.toBe('');
      expect(metaContent(source, 'og:locale'), `og:locale de ${path}`).toBe('pt_BR');
      expect(metaContent(source, 'og:site_name'), `og:site_name de ${path}`).toBe('Luiz Freitas');
    }
  });

  test('o lang do §8 sobreviveu em toda rota', () => {
    for (const { path, file } of ROTAS) {
      expect(html(file), `em ${path}`).toContain('lang="pt-BR"');
    }
  });
});

test.describe('§2 — baixa manutenção, no artefato publicado', () => {
  /**
   * A contagem de anos escrita à mão, varrida do HTML que vai ao ar.
   *
   * `tests/unit/manutencao.test.ts` já cobre o texto curado na origem. Este
   * teste existe porque a origem não é o único caminho até o `out/`: o corpo
   * dos cases passa por MDX, o metadado passa pelo Next, e uma string escrita
   * dentro de um componente não aparece em `content/` nenhum — que é
   * exatamente onde o "Nove anos construindo software" morava, na h1 de
   * `components/Hero.tsx`.
   *
   * Varre o HTML cru, e não o texto visível, de propósito: o payload do RSC
   * embutido em `<script>` carrega as mesmas strings, e uma frase que sobreviva
   * lá sobrevive na hidratação.
   */
  const CONTAGEM_DE_ANOS =
    /\b(\d+|um|uma|dois|duas|tr[êe]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quinze|vinte)\s+anos?\b/i;

  test('nenhuma rota publica uma contagem de anos', () => {
    for (const { path, file } of ROTAS) {
      const achado = CONTAGEM_DE_ANOS.exec(html(file));
      expect(
        achado?.[0],
        `${path} publica "${achado?.[0]}" — o §2 proíbe contagem de anos à mão, ` +
          'porque ela erra sozinha e ninguém percebe. Ancore no ano ("desde 2017").',
      ).toBeUndefined();
    }
  });

  test('"nove anos" não sobreviveu em canto nenhum do export', () => {
    // O caso concreto que originou a regra, nomeado no §2 e no §4.1. Vale para
    // o sitemap e o robots também: eles saem do mesmo dicionário.
    for (const file of [...ROTAS.map((r) => r.file), 'sitemap.xml', 'robots.txt']) {
      expect(html(file).toLowerCase(), `em ${file}`).not.toContain('nove anos');
    }
  });

  test('a âncora do §4.1 chegou à home e ao /projetos', () => {
    // A proibição não pode ser cumprida apagando o dado. "Desde 2017" é o que
    // fica no lugar da contagem, e o §1 põe a description entre as coisas mais
    // importantes do site.
    expect(html('index.html')).toContain('Construo software desde 2017');
    expect(metaContent(html('projetos.html'), 'description')).toContain('desde 2017');
  });
});

/**
 * O PNG lido do byte, sem biblioteca: assinatura, IHDR e o primeiro pixel.
 *
 * Conferir o nome do arquivo não prova nada — o export escreve as OG images sem
 * extensão, e um HTML de erro gravado no lugar do PNG passaria por qualquer
 * checagem de caminho. O pixel do canto superior esquerdo é o preenchimento do
 * card, que é onde a cor emprestada aparece.
 *
 * O primeiro pixel da primeira linha sai cru em qualquer um dos cinco filtros do
 * PNG: todos os vizinhos de que eles dependem (esquerda, acima) estão fora da
 * imagem e valem zero.
 */
function png(file: string): { width: number; height: number; fill: string } {
  const bytes = readFileSync(OUT + file);
  const assinatura = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  expect(bytes.subarray(0, 8).equals(assinatura), `${file} não é PNG`).toBe(true);

  const idat: Buffer[] = [];
  for (let i = 8; i + 8 <= bytes.length; ) {
    const length = bytes.readUInt32BE(i);
    const type = bytes.toString('ascii', i + 4, i + 8);
    if (type === 'IDAT') idat.push(bytes.subarray(i + 8, i + 8 + length));
    i += length + 12;
  }

  const pixel = inflateSync(Buffer.concat(idat)).subarray(1, 4);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    fill: `#${pixel.toString('hex').toUpperCase()}`,
  };
}

test.describe('OG image por rota', () => {
  /** O caminho da imagem dentro do `out/`, a partir da URL publicada. */
  function arquivoDaImagem(file: string): string {
    const url = metaContent(html(file), 'og:image');
    expect(url, `og:image de ${file}`).toContain(SITE);
    return new URL(url).pathname.replace(/^\//, '');
  }

  test('nenhuma das seis rotas fica sem og:image', () => {
    for (const { path, file } of ROTAS) {
      expect(metaContent(html(file), 'og:image'), `og:image de ${path}`).not.toBe('');
    }
  });

  test('nenhuma rota compartilha a imagem de outra', () => {
    const urls = ROTAS.map(({ file }) => arquivoDaImagem(file));
    expect(new Set(urls).size, `imagens: ${JSON.stringify(urls)}`).toBe(urls.length);
  });

  test('cada og:image aponta para um arquivo que existe, e é PNG de 1200×630', () => {
    // Um og:image em 404 é pior que nenhum: a plataforma mostra o card
    // quebrado, e o `<meta>` presente esconde o problema de qualquer varredura
    // que só conte tags.
    for (const { path, file } of ROTAS) {
      const imagem = png(arquivoDaImagem(file));
      expect(imagem.width, `largura da imagem de ${path}`).toBe(1200);
      expect(imagem.height, `altura da imagem de ${path}`).toBe(630);
    }
  });

  test('o card de cada case carrega o hex da marca do projeto', () => {
    // A mecânica de cor emprestada saindo do site: o preenchimento do card é o
    // mesmo `accent` do frontmatter, e não uma cor escrita à mão aqui.
    expect(png(arquivoDaImagem('projetos/asafe.html')).fill).toBe('#2F3A5E');
    expect(png(arquivoDaImagem('projetos/eaifez.html')).fill).toBe('#A83C55');
  });

  test('as quatro rotas sem projeto ficam na base neutra', () => {
    for (const file of ['index.html', 'projetos.html', 'sobre.html', 'contato.html']) {
      expect(png(arquivoDaImagem(file)).fill, `preenchimento de ${file}`).toBe('#14161A');
    }
  });

  test('cada imagem é alcançável e chega como image/png', async ({ request }) => {
    // Ler o arquivo prova que ele existe; buscar prova que ele chega ao crawler
    // no caminho e com o tipo que ele exige. O servidor do teste aplica o mesmo
    // `_headers` do deploy, então é a regra de produção que está sendo medida.
    for (const { path, file } of ROTAS) {
      const resposta = await request.get(`/${arquivoDaImagem(file)}`);
      expect(resposta.status(), `GET da imagem de ${path}`).toBe(200);
      expect(resposta.headers()['content-type'], `tipo da imagem de ${path}`).toBe('image/png');
    }
  });

  test('o _headers cobre toda OG image com Content-Type de PNG', () => {
    // O export escreve os cards sem extensão no nome, e hospedagem estática
    // deduz o tipo do nome: sem uma regra que case, o arquivo sai como
    // application/octet-stream e o crawler recusa a imagem.
    const regras = readFileSync(OUT + '_headers', 'utf8')
      .split(/\n(?=\/)/)
      .filter((bloco) => /content-type:\s*image\/png/i.test(bloco))
      .map((bloco) => {
        const padrao = bloco.split('\n')[0].trim();
        return new RegExp(`^${padrao.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
      });

    for (const { path, file } of ROTAS) {
      const caminho = `/${arquivoDaImagem(file)}`;
      expect(
        regras.some((regra) => regra.test(caminho)),
        `nenhuma regra de _headers casa com ${caminho} (og:image de ${path})`,
      ).toBe(true);
    }
  });
});

test.describe('sitemap e robots (§8)', () => {
  test('o export estático emite os dois arquivos', () => {
    expect(() => html('sitemap.xml')).not.toThrow();
    expect(() => html('robots.txt')).not.toThrow();
  });

  test('o sitemap é XML bem formado e lista as seis rotas', () => {
    const xml = html('sitemap.xml');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');

    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      'https://luizfreitas.com.br',
      'https://luizfreitas.com.br/projetos',
      'https://luizfreitas.com.br/projetos/asafe',
      'https://luizfreitas.com.br/projetos/eaifez',
      'https://luizfreitas.com.br/sobre',
      'https://luizfreitas.com.br/contato',
    ]);
    // Um `<url>` por `<loc>`: se o Next mudar a forma do documento, a contagem
    // divergir é o sinal.
    expect([...xml.matchAll(/<url>/g)]).toHaveLength(locs.length);
  });

  test('o robots libera tudo e aponta o sitemap', () => {
    const txt = html('robots.txt');
    expect(txt).toContain('User-Agent: *');
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Sitemap: https://luizfreitas.com.br/sitemap.xml');
  });

  test('os dois são servidos pela mesma regra de URL do deploy', async ({ request }) => {
    // Ler o arquivo prova que ele existe; buscar prova que ele é alcançável no
    // caminho que o rastreador vai pedir.
    for (const path of ['/sitemap.xml', '/robots.txt']) {
      expect((await request.get(path)).status(), `GET ${path}`).toBe(200);
    }
  });
});

test.describe('JSON-LD Person (§8)', () => {
  /** O bloco da home, extraído do HTML publicado. */
  function blocos(file: string): string[] {
    return [
      ...html(file).matchAll(
        /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => m[1]);
  }

  test('existe exatamente um bloco, na home', () => {
    expect(blocos('index.html')).toHaveLength(1);
    for (const { path, file } of ROTAS.filter((r) => r.path !== '/')) {
      expect(blocos(file), `em ${path}`).toHaveLength(0);
    }
  });

  test('o bloco faz parse e carrega os campos do §8', () => {
    const person = JSON.parse(blocos('index.html')[0]);
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Luiz Freitas');
    expect(person.jobTitle).toBe('Desenvolvedor full stack sênior');
    expect(person.url).toBe('https://luizfreitas.com.br');
    expect(person.sameAs).toEqual([
      'https://github.com/FreitasAssis',
      'https://www.linkedin.com/in/luiz-dev',
    ]);
    expect(person.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Natal',
      addressRegion: 'RN',
      addressCountry: 'BR',
    });
  });
});
