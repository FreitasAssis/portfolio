import { expect, test } from '@playwright/test';

/**
 * `/sobre` (§4.3, §4.4) contra o export estático, que é o artefato que vai ao ar.
 *
 * O que só existe aqui, e não no teste unitário: layout de verdade. A medida de
 * leitura e a ausência de rolagem em 360px são medidas em pixel — o jsdom não
 * faz layout. E o tema escuro, que depende da cascata real de custom properties.
 */

/** Mede a largura de um elemento em `ch` da fonte que ele de fato usa. */
async function medidas(locator: import('@playwright/test').Locator) {
  return locator.evaluateAll((els) =>
    els.map((el) => {
      const sonda = document.createElement('div');
      sonda.style.cssText = 'position:absolute;visibility:hidden;width:1ch';
      el.appendChild(sonda);
      const umCh = sonda.getBoundingClientRect().width;
      sonda.remove();
      return el.getBoundingClientRect().width / umCh;
    }),
  );
}

test('a página abre com a pessoa e fecha com a tecnologia (§3.4)', async ({ page }) => {
  await page.goto('/sobre');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sobre');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Tecnologia', 'Formação']);
  await expect(page.getByText(/Sou santista/)).toBeVisible();
});

test('são os cinco parágrafos do §4.3, e nenhum a mais', async ({ page }) => {
  await page.goto('/sobre');
  // Eram três, e o teste guardava a ausência do final — o §4.3 dizia "não
  // gerar". O Luiz escreveu os dois últimos e o §12 fechou: "todo o texto do
  // site está escrito". Cinco é o número; seis significa que alguém escreveu
  // por conta própria, e quatro que alguém apagou.
  const secao = page.locator('section').filter({ hasText: 'Sou santista' });
  await expect(secao.locator('p')).toHaveCount(5);
  await expect(page.getByText(/em breve|lorem ipsum/i)).toHaveCount(0);
  // O fecho do §4.3 chegou ao artefato publicado, com o condicional intacto.
  await expect(page.getByText(/Se um dia aparecer um próximo desafio/)).toBeVisible();
});

test('a prosa fica na faixa de 65–75 caracteres (§6.3)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/sobre');
  // Piso E teto: a coluna já esteve em 56,5 caracteres neste repo porque só o
  // teto era verificado. E o parágrafo da camada 2 fica de fora de propósito —
  // ele é `text-xs`, e 68ch medidos em 18px dariam 76 na fonte menor.
  const larguras = await medidas(page.locator('section p.prose-measure'));
  expect(larguras).toHaveLength(5);
  for (const m of larguras) {
    expect(m).toBeGreaterThanOrEqual(65);
    expect(m).toBeLessThanOrEqual(75);
  }
});

test('as camadas de tecnologia se distinguem sem cor e sem ícone (§4.4, §9)', async ({ page }) => {
  await page.goto('/sobre');
  const tecnologia = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Tecnologia' }) });

  await expect(tecnologia.getByRole('listitem')).toHaveCount(7);
  await expect(tecnologia.getByText('React Native / Expo')).toBeVisible();
  await expect(tecnologia.locator('svg, img')).toHaveCount(0);

  // O peso cai de verdade, e não por cor: a camada 2 é menor que a camada 1.
  const camada1 = await tecnologia
    .getByRole('listitem')
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const camada2 = await tecnologia
    .getByText(/Já entreguei em produção/)
    .evaluate((el) => parseFloat(getComputedStyle(el.closest('p')!).fontSize));
  expect(camada2).toBeLessThan(camada1);
});

test('a camada 3 não aparece em lugar nenhum (§4.4)', async ({ page }) => {
  await page.goto('/sobre');
  // `innerText` e não `textContent`: o export estático embute o payload do RSC
  // em `<script>`, e lá dentro existe literalmente `dangerouslySetInnerHTML` —
  // o teste falharia por causa do framework, não do conteúdo da página.
  const texto = await page.locator('body').innerText();
  // "É como um chef listar 'sei usar faca'." Fronteira de palavra em `Git`,
  // senão `GitHub` casaria — o rodapé linka o perfil.
  for (const termo of ['HTML', 'CSS', 'Bootstrap']) {
    expect(texto, termo).not.toContain(termo);
  }
  expect(texto).not.toMatch(/\bGit\b/);
});

test('cabe em 360px sem rolagem horizontal (§9)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/sobre');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  // O buraco do retrato é o elemento mais largo depois do texto; se ele
  // estourasse, estouraria aqui.
  await expect(page.getByText(/\{\{ retrato do Luiz/)).toBeVisible();
});

test('o tema escuro não quebra a página (§9)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/sobre');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // O papel virou de verdade. O `--paper` escuro é #0e1013; conferir a cor
  // resolvida, e não só o atributo, é o que pega uma cascata quebrada — foi
  // assim que o acento escuro já morreu em silêncio neste repo.
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
  ).toBe('rgb(14, 16, 19)');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
