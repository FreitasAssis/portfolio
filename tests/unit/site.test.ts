import { describe, expect, it } from 'vitest';

import { PERSON } from '@/components/JsonLd';
import { GITHUB, LINKEDIN } from '@/content/contact';
import { ADDRESS, AUTHOR, JOB_TITLE, META, SITE_URL, caseTitle } from '@/content/site';
import { getAllProjects } from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';
import robots from '@/app/robots';
import sitemap, { STATIC_ROUTES } from '@/app/sitemap';

/**
 * §8, na origem: o par título/descrição de cada rota, antes de virar HTML.
 *
 * O teste que prova que isso chegou ao artefato publicado é
 * `tests/e2e/seo.spec.ts`, que lê o `out/`. Os dois existem e não se
 * substituem: aqui a falha aponta a linha do texto errado; lá ela aponta a rota
 * que não recebeu metadado nenhum.
 */

/** As seis rotas do site, com o par de cada uma. Os cases vêm do conteúdo. */
async function todasAsRotas(): Promise<{ path: string; title: string; description: string }[]> {
  const projects = await getAllProjects();
  return [
    { path: '/', ...META.home },
    { path: '/projetos', ...META.projetos },
    ...projects.map((p) => ({
      path: `/projetos/${p.slug}`,
      title: caseTitle(p.name),
      description: p.description,
    })),
    { path: '/sobre', ...META.sobre },
    { path: '/contato', ...META.contato },
  ];
}

describe('dicionário de metadados (§8)', () => {
  it('cobre as seis rotas do site', async () => {
    expect((await todasAsRotas()).map((r) => r.path)).toEqual([
      '/',
      '/projetos',
      '/projetos/asafe',
      '/projetos/eaifez',
      '/sobre',
      '/contato',
    ]);
  });

  it('nenhum título se repete — o bug do site antigo', async () => {
    const titles = (await todasAsRotas()).map((r) => r.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('nenhuma descrição se repete — a outra metade do mesmo bug', async () => {
    const descriptions = (await todasAsRotas()).map((r) => r.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('segue os três padrões de título do §8', async () => {
    expect(META.home.title).toBe('Luiz Freitas — desenvolvedor full stack');
    expect(META.sobre.title).toBe('Sobre — Luiz Freitas');
    expect(caseTitle('Asafe')).toBe('Asafe — projeto de Luiz Freitas');
  });

  it('o título do case sai do nome do projeto, não de uma lista', async () => {
    // A promessa do §2: um `.mdx` novo nasce com título correto sem código.
    for (const project of await getAllProjects()) {
      expect(caseTitle(project.name)).toContain(project.name);
      expect(caseTitle(project.name)).toContain(AUTHOR);
    }
  });

  /**
   * O §8 manda a descrição do site antigo sair inteira, e o §4 fixa o registro.
   * A lista é a do brief, palavra por palavra, mais os dois fragmentos da
   * descrição antiga que a identificam sem ambiguidade.
   */
  const PROIBIDAS = [
    'soluções',
    'experiências digitais',
    'impulsionar',
    'inovador',
    'inovadora',
    'excepcional',
    'escaláveis',
    'transformando ideias',
  ];

  it.each(PROIBIDAS)('nenhuma descrição usa "%s" (§4, §8)', async (palavra) => {
    for (const { path, description } of await todasAsRotas()) {
      expect(description.toLowerCase(), `em ${path}`).not.toContain(palavra);
    }
  });

  it('toda descrição funciona sozinha — nem curta demais, nem apostando no fim', async () => {
    for (const { path, description } of await todasAsRotas()) {
      expect(description.length, `${path} tem ${description.length} caracteres`).toBeGreaterThan(
        60,
      );
      expect(description.length, `${path} tem ${description.length} caracteres`).toBeLessThan(200);
    }
  });

  it('a descrição da home carrega o dado do §4.1', async () => {
    // "o dado mais forte do currículo e a única coisa da página que não pode
    // ser dita por qualquer outro dev".
    expect(META.home.description).toContain('400 mil');
    expect(META.home.description).toContain('Analytica Ensino');
  });
});

describe('metadata por rota (§8)', () => {
  it('tem canonical relativo à raiz — o Next resolve contra o metadataBase', () => {
    const meta = pageMetadata({ meta: META.sobre, path: '/sobre' });
    expect(meta.alternates?.canonical).toBe('/sobre');
  });

  it('o Open Graph repete o par da rota, e não um texto próprio', () => {
    const meta = pageMetadata({ meta: META.contato, path: '/contato' });
    expect(meta.openGraph?.title).toBe(META.contato.title);
    expect(meta.openGraph?.description).toBe(META.contato.description);
    expect(meta.openGraph && 'locale' in meta.openGraph && meta.openGraph.locale).toBe('pt_BR');
  });

  it('a OG image não passa por aqui — quem a declara é o opengraph-image.tsx da rota', () => {
    // O Next descobre a imagem pelo nome do arquivo ao lado da página e injeta
    // `og:image` sozinho. Uma imagem montada também aqui sairia duplicada no
    // `<head>`, e o crawler escolhe uma das duas. Que a tag chegou ao HTML, e
    // que o arquivo existe, é `tests/e2e/seo.spec.ts` quem mede.
    const meta = pageMetadata({ meta: META.home, path: '/' });
    expect(meta.openGraph && 'images' in meta.openGraph).toBe(false);
    expect(meta.twitter && 'images' in meta.twitter).toBe(false);
  });
});

describe('sitemap (§8)', () => {
  it('lista as seis rotas, em URL absoluta sob o domínio', async () => {
    expect((await sitemap()).map((entry) => entry.url)).toEqual([
      'https://luizfreitas.com.br',
      'https://luizfreitas.com.br/projetos',
      'https://luizfreitas.com.br/projetos/asafe',
      'https://luizfreitas.com.br/projetos/eaifez',
      'https://luizfreitas.com.br/sobre',
      'https://luizfreitas.com.br/contato',
    ]);
  });

  it('as rotas dos cases saem do conteúdo, não de uma lista à mão', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const project of await getAllProjects()) {
      expect(urls).toContain(`${SITE_URL}/projetos/${project.slug}`);
    }
  });

  it('as rotas fixas batem com as chaves do dicionário do §8', () => {
    // Se nascer uma página nova com metadado e ninguém a puser no sitemap — ou
    // o contrário — a divergência falha aqui, e não em produção.
    const doDicionario = ['/', '/projetos', '/sobre', '/contato'];
    expect([...STATIC_ROUTES]).toEqual(doDicionario);
    expect(Object.keys(META)).toHaveLength(doDicionario.length);
  });

  it('nenhuma URL tem barra dupla', async () => {
    for (const { url } of await sitemap()) {
      expect(url.replace('https://', '')).not.toContain('//');
    }
  });
});

describe('robots (§8)', () => {
  it('libera o site inteiro e aponta o sitemap em URL absoluta', () => {
    const r = robots();
    expect(r.rules).toEqual([{ userAgent: '*', allow: '/' }]);
    expect(r.sitemap).toBe('https://luizfreitas.com.br/sitemap.xml');
  });
});

describe('JSON-LD Person (§8)', () => {
  it('serializa para JSON válido', () => {
    expect(() => JSON.parse(JSON.stringify(PERSON))).not.toThrow();
  });

  it('tem os cinco campos que o §8 nomeia', () => {
    expect(PERSON['@type']).toBe('Person');
    expect(PERSON.name).toBe(AUTHOR);
    expect(PERSON.jobTitle).toBe(JOB_TITLE);
    expect(PERSON.url).toBe(SITE_URL);
    expect(PERSON.sameAs).toEqual([GITHUB, LINKEDIN]);
    expect(PERSON.address.addressLocality).toBe(ADDRESS.locality);
    expect(PERSON.address.addressRegion).toBe(ADDRESS.region);
  });

  it('o sameAs é o mesmo dado do rodapé e do /contato', () => {
    // Não é redundância com o teste acima: aqui o que se afirma é a origem.
    // Um link redigitado aqui envelheceria em silêncio — JSON-LD não aparece na
    // tela e ninguém revisa o que não vê.
    expect(PERSON.sameAs).toContain('https://github.com/FreitasAssis');
    expect(PERSON.sameAs).toContain('https://www.linkedin.com/in/luiz-dev');
  });

  it('o endereço para em cidade e estado — sem logradouro nem CEP', () => {
    const campos = Object.keys(PERSON.address);
    expect(campos).toEqual(['@type', 'addressLocality', 'addressRegion', 'addressCountry']);
  });
});
