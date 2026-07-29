import { expect, test } from '@playwright/test';

/**
 * `/projetos` (§3.2) contra o export estático, que é o artefato que vai ao ar.
 *
 * O que só existe aqui, e não no teste unitário: layout de verdade. A cobertura
 * de viewport que dispara o acento, a ausência de rolagem horizontal em 360px e
 * a medida de leitura são todas medidas em pixel — o jsdom não faz layout.
 */

const secao = (page: import('@playwright/test').Page, nome: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: nome, exact: true }) });

test('as duas seções são distinguíveis (§3.2)', async ({ page }) => {
  await page.goto('/projetos');
  await expect(page.getByRole('heading', { name: 'Projetos próprios' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experiência profissional' })).toBeVisible();
  // Um h1 por documento, e ele cobre as duas metades.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projetos e experiência');
});

test('a âncora da home cai na experiência, não no topo', async ({ page }) => {
  // `href` para âncora inexistente é falha silenciosa: o navegador não reclama,
  // só ignora o fragmento e deixa a pessoa no topo. Por isso este teste clica de
  // verdade e mede onde a página parou, em vez de conferir o href — isso o
  // unitário já faz.
  await page.goto('/');
  await page.getByRole('link', { name: /ver detalhe/i }).click();
  await page.waitForURL(/\/projetos#experiencia$/);

  const alvo = page.locator('#experiencia');
  await expect(alvo).toBeVisible();
  await expect(alvo.getByRole('heading', { name: 'Experiência profissional' })).toBeVisible();

  // O salto tem que ter acontecido: o topo da seção perto do topo da viewport, e
  // a página rolada para baixo dos cards de projeto.
  const y = await alvo.evaluate((el) => el.getBoundingClientRect().top);
  expect(y).toBeGreaterThanOrEqual(-1);
  expect(y).toBeLessThan(120);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
});

test('a sobreposição está rotulada, não escondida (§4.5)', async ({ page }) => {
  await page.goto('/projetos');
  // Três posições se sobrepõem no tempo: Boomer corre junto da ez.devs e, logo
  // em seguida, da Opah IT. O conjunto é derivado das datas em
  // tests/unit/experience.test.ts.
  await expect(page.getByText(/em paralelo/i)).toHaveCount(3);
  await expect(page.getByText(/em paralelo/i).first()).toBeVisible();
});

test('o fio contínuo está marcado nas duas pontas (§4.5)', async ({ page }) => {
  await page.goto('/projetos');
  const marcas = page.getByText(/fio contínuo/i);
  await expect(marcas).toHaveCount(2);
  // As duas pontas apontam uma para a outra: a de cima para baixo, a de baixo
  // para cima. É o que faz as duas marcas lerem como uma coisa só, sem legenda.
  await expect(marcas.first()).toContainText('↓');
  await expect(marcas.last()).toContainText('↑');
});

test('as duas marcas da Opah IT não se parecem (§4.5, §9)', async ({ page }) => {
  await page.goto('/projetos');
  const opah = page.locator('li').filter({ hasText: 'Opah IT' }).first();

  const sobreposicao = opah.getByText(/em paralelo/i);
  const fio = opah.getByText(/fio contínuo/i);
  await expect(sobreposicao).toHaveCount(1);
  await expect(fio).toHaveCount(1);

  // A diferença é medida na caixa renderizada, não na classe: a sobreposição é
  // fechada nos quatro lados, o fio é uma régua só à esquerda.
  const bordas = (locator: import('@playwright/test').Locator) =>
    locator.evaluate((el) => {
      const alvo = el.tagName === 'SPAN' ? el.parentElement! : el;
      const s = getComputedStyle(alvo);
      return [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth];
    });

  expect(await bordas(sobreposicao)).toEqual(['1px', '1px', '1px', '1px']);
  // O fio mora no bloco que envolve o rótulo e o `impact`.
  const larguraDoFio = await fio.evaluate((el) => {
    const bloco = el.closest('div')!;
    const s = getComputedStyle(bloco);
    return [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth];
  });
  expect(larguraDoFio).toEqual(['0px', '0px', '0px', '2px']);
});

test('o acento dispara de verdade nos dois cards (§6.1)', async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 900 });
  await page.goto('/projetos');
  const html = page.locator('html');

  for (const [slug, hex] of [
    ['asafe', '#2f3a5e'],
    ['eaifez', '#c8506a'],
  ] as const) {
    // `div[...]`: o próprio <html> ganha o atributo assim que o tracker o
    // elege, e um seletor solto casaria com os dois.
    const zona = page.locator(`div[data-accent="${slug}"]`);
    await zona.scrollIntoViewIfNeeded();
    await expect(html).toHaveAttribute('data-accent', slug);
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      ),
    ).toBe(hex);

    // O limiar do AccentTracker é cobertura de VIEWPORT (35%), e duas zonas
    // lado a lado nunca chegam lá num monitor comum — foi por isso que os cards
    // empilharam. Medir aqui é o que impede a mecânica de morrer em silêncio no
    // dia em que alguém "arrumar" o layout.
    const cobertura = await zona.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const visivel =
        Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) *
        Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
      return visivel / (innerWidth * innerHeight);
    });
    expect(cobertura, slug).toBeGreaterThan(0.35);
  }

  // Fora dos cards a base volta a ser neutra (§6.1): a experiência profissional
  // não empresta cor nenhuma.
  await page.getByRole('heading', { level: 3, name: /IFRN/ }).scrollIntoViewIfNeeded();
  await expect(html).not.toHaveAttribute('data-accent', /.*/);
});

test('cabe em 360px sem rolagem horizontal (§9)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/projetos');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  // E as duas marcas continuam inteiras na tela estreita — a caixa quebra
  // dentro da coluna e a régua custa 1rem de recuo, não margem lateral.
  await expect(page.getByText(/em paralelo/i).first()).toBeVisible();
  await expect(page.getByText(/fio contínuo/i).first()).toBeVisible();
});

test('o texto da experiência fica na faixa de 65–75 caracteres (§6.3)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projetos');
  const medidas = await secao(page, 'Experiência profissional')
    .locator('li > p, li > div > p:last-child')
    .evaluateAll((els) =>
      els
        .filter((el) => (el.textContent ?? '').length > 120)
        .map((el) => {
          const sonda = document.createElement('div');
          sonda.style.cssText = 'position:absolute;visibility:hidden;width:1ch';
          el.appendChild(sonda);
          const umCh = sonda.getBoundingClientRect().width;
          sonda.remove();
          return el.getBoundingClientRect().width / umCh;
        }),
    );
  expect(medidas.length).toBeGreaterThan(0);
  for (const m of medidas) {
    expect(m).toBeGreaterThanOrEqual(65);
    expect(m).toBeLessThanOrEqual(75);
  }
});

test('o card leva ao app e ao case (§3.2)', async ({ page }) => {
  await page.goto('/projetos');
  await expect(page.getByRole('link', { name: 'Abrir o Asafe' })).toHaveAttribute(
    'href',
    'https://asafe.mus.br',
  );
  await expect(page.getByRole('link', { name: 'Ler o case do E aí, fez?' })).toHaveAttribute(
    'href',
    '/projetos/eaifez',
  );
  // Os dois cards mostram print retrato — é o que faz as duas ofertas lerem
  // como pares em vez de duas categorias de coisa.
  const formatos = await page
    .locator('article img')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => r.height > r.width));
  expect(formatos).toEqual([true, true]);
});
