import { expect, test } from '@playwright/test';

/** Valor calculado de `--accent` no `<html>`, que é onde o AccentTracker escreve. */
function accentVar(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  );
}

test('a home é autossuficiente (§2)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /projetos/i }).first()).toBeVisible();
  await expect(page.getByText(/400 mil/i)).toBeVisible();
});

test('não existe seção de IA (§4.2.1)', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /^ia$|intelig[êe]ncia artificial/i }),
  ).toHaveCount(0);
});

test('os blocos aparecem na ordem do §3.1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Projetos próprios',
    'Trajetória',
    'Como eu trabalho',
    'Contato',
  ]);
});

test('os cards abrem os apps no ar, com o case em segundo plano (§3.1)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Abrir o Asafe' })).toHaveAttribute(
    'href',
    'https://asafe.mus.br',
  );
  await expect(page.getByRole('link', { name: 'Abrir o E aí, fez?' })).toHaveAttribute(
    'href',
    'https://eaifez.com.br',
  );
  await expect(page.getByRole('link', { name: 'Ler o case do Asafe' })).toHaveAttribute(
    'href',
    '/projetos/asafe',
  );
});

test('o acento troca conforme o projeto na tela (§6.1)', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  await page.locator('[data-accent="asafe"]').scrollIntoViewIfNeeded();
  await expect(html).toHaveAttribute('data-accent', 'asafe');
  // Não basta o atributo: o que o §6.1 promete é a COR virando. Este é o elo
  // que o teste unitário não alcança — o jsdom não faz cascata de custom
  // properties nem layout.
  expect(await accentVar(page)).toBe('#2f3a5e');

  await page.locator('[data-accent="eaifez"]').scrollIntoViewIfNeeded();
  await expect(html).toHaveAttribute('data-accent', 'eaifez');
  expect(await accentVar(page)).toBe('#c8506a');
});

test('a base volta a ser neutra fora dos projetos (§6.1)', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-accent="eaifez"]').scrollIntoViewIfNeeded();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'eaifez');

  await page.getByRole('heading', { name: 'Contato' }).scrollIntoViewIfNeeded();
  await expect(page.locator('html')).not.toHaveAttribute('data-accent', /.*/);
});

test('a prosa fica na faixa de 65–75 caracteres (§6.3)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  // Mede o subhead do hero e os blocos do "Como eu trabalho" — o texto corrido
  // da home. A coluna de leitura já esteve em 36rem, o que dava 56,5 caracteres:
  // abaixo do piso do §6.3, e ninguém percebia porque só o teto era verificado.
  const medidas = await page.locator('section p.prose-measure').evaluateAll((els) =>
    els.map((el) => {
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

test('a trajetória cabe em uma linha por posição em tela larga (§3.1)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  // O "Sênior" da Analytica caía sozinho na segunda linha quando a coluna de
  // leitura era estreita demais. Uma posição = uma linha visual.
  const alturas = await page
    .locator('section', { has: page.getByRole('heading', { name: 'Trajetória' }) })
    .locator('li')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
  expect(alturas).toHaveLength(5);
  expect(Math.max(...alturas)).toBe(Math.min(...alturas));
});

test('cabe em 360px sem rolagem horizontal (§9)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('o foco de teclado é visível nos CTAs (§9)', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Ver os projetos' });
  await cta.focus();
  const outline = await cta.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outline).not.toBe('0px');
});

test('o que ainda falta está escrito na tela, não escondido (§0)', async ({ page }) => {
  await page.goto('/');
  // Os prints chegaram (Task 6b), os cards saem do conteúdo desde a Task 7 e o
  // CV entrou na Task 8 — a home não tem mais buraco nenhum. O que ainda falta
  // no site (o retrato do §6.5) está escrito na tela do /sobre e do /contato,
  // que é onde ele vai morar.
  await expect(page.getByText(/\{\{ print:/)).toHaveCount(0);
  await expect(page.locator('article img')).toHaveCount(2);
  await expect(page.getByText('{{ CV em PDF }}')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Baixar o CV em PDF' })).toHaveAttribute(
    'href',
    /^\/cv\/luiz-freitas-\d{4}-\d{2}\.pdf$/,
  );
  // E nada de placeholder onde o dado já chegou.
  await expect(page.getByText(/URL do documento de decisões/)).toHaveCount(0);
});

test('o documento de decisões do Asafe é linkável (§4.2.1)', async ({ page }) => {
  await page.goto('/');
  // É o link que substitui qualquer declaração sobre método — sem ele, a
  // afirmação do §4.2 fica sem o convite de auditoria que a sustenta.
  await expect(page.getByRole('link', { name: /DESIGN\.md do Asafe/ })).toHaveAttribute(
    'href',
    'https://github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md',
  );
});

test('a trajetória é um índice de cinco linhas, não conteúdo (§3.1)', async ({ page }) => {
  await page.goto('/');
  const traj = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Trajetória' }) });
  await expect(traj.getByRole('listitem')).toHaveCount(5);
  await expect(traj).not.toContainText('em paralelo');
});

test('não há formulário de contato (§11)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('form')).toHaveCount(0);
});
