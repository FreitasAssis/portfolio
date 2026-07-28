import { expect, test } from '@playwright/test';

/** Valor calculado de `--accent` no `<html>`, que é onde o AccentTracker escreve. */
function accentVar(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  );
}

test('o case segue o template fixo do §3.3, na ordem', async ({ page }) => {
  await page.goto('/projetos/asafe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Asafe');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'O problema',
    'O que é',
    'Decisões',
    'Stack',
    'Estado',
    'Prints do Asafe',
  ]);
});

test('as decisões saem no formato "escolhi X em vez de Y" (§3.3)', async ({ page }) => {
  await page.goto('/projetos/asafe');
  const decisoes = page.locator('section', { has: page.getByRole('heading', { name: 'Decisões' }) });
  // 3 a 5 itens, cada um com a escolha e a alternativa. Sem o "em vez de", o
  // case vira vitrine — é a parte que prova que houve escolha.
  const itens = decisoes.getByRole('listitem');
  await expect(itens).toHaveCount(5);
  await expect(itens.first()).toContainText('em vez de');
});

test('o repo privado não vira botão morto (§4.6)', async ({ page }) => {
  await page.goto('/projetos/asafe');
  await expect(page.getByRole('link', { name: 'Código no GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/FreitasAssis/Asafe',
  );

  await page.goto('/projetos/eaifez');
  await expect(page.getByRole('link', { name: 'Abrir o E aí, fez?' })).toHaveAttribute(
    'href',
    'https://eaifez.com.br',
  );
  await expect(page.getByRole('link', { name: 'Código no GitHub' })).toHaveCount(0);
});

test('o case empresta a cor ao site inteiro (§6.1)', async ({ page }) => {
  // O elo que o teste unitário não alcança: o jsdom não faz cascata de custom
  // properties. Aqui é o browser resolvendo [data-accent] de verdade.
  await page.goto('/projetos/asafe');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'asafe');
  expect(await accentVar(page)).toBe('#2f3a5e');

  await page.goto('/projetos/eaifez');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'eaifez');
  expect(await accentVar(page)).toBe('#c8506a');
});

test('a linha do corpo fica na faixa de 65–75 caracteres (§6.3)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projetos/asafe');
  const medida = await page.locator('article p').first().evaluate((el) => {
    // 1ch medido PELO MOTOR, não estimado. A versão anterior usava a
    // aproximação "1ch ≈ 0,5em", que vale para uma grotesca mas não para a
    // Newsreader: o "0" dela mede 0,566em, ou 10,19px em 18px. A estimativa
    // inflava a medida em 13% (693px viravam 77 caracteres em vez de 68) e
    // teria reprovado uma página que está exatamente no valor pedido.
    const sonda = document.createElement('div');
    sonda.style.cssText = 'position:absolute;visibility:hidden;width:1ch';
    el.appendChild(sonda);
    const umCh = sonda.getBoundingClientRect().width;
    sonda.remove();
    return el.getBoundingClientRect().width / umCh;
  });
  // O §6.3 é uma FAIXA, e o piso importa tanto quanto o teto. Sem o piso, este
  // teste passava com o corpo em 59,2 caracteres — que foi o que aconteceu
  // enquanto `prose-measure` estava no contêiner e o padding comia a medida.
  expect(medida).toBeGreaterThanOrEqual(65);
  expect(medida).toBeLessThanOrEqual(75);
});

test('o case cabe em 360px sem rolagem horizontal (§9)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/projetos/eaifez');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('o que falta está escrito na tela, não escondido (§0)', async ({ page }) => {
  await page.goto('/projetos/asafe');
  // Prosa e prints são da Task 6. Enquanto não chegam, o buraco é visível.
  await expect(page.getByText(/\{\{ print:/)).toHaveCount(4);
  await expect(page.getByText(/\{\{ o produto em 3 ou 4 frases/)).toBeVisible();
});
