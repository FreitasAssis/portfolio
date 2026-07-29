import { expect, test } from '@playwright/test';

/**
 * `/contato` (§3.4) contra o export estático.
 *
 * O teste que só existe aqui é o do CV: um `href` correto no HTML não prova que
 * o arquivo foi publicado. O `next build` não confere `/public`, e um PDF que
 * não entrou no `out/` só dá sintoma pra quem clicou — no bloco de contato, que
 * é a última coisa que se descobre estar quebrada.
 */

const CV = '/cv/luiz-freitas-2026-07.pdf';

test('os dois caminhos aparecem lado a lado, com o mesmo peso (§3.4)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/contato');

  // A caixa é o pai direto do título. Filtrar `div` por texto pegaria o
  // ancestral mais externo que contém a frase — que é a página inteira.
  const caixa = (nome: string) =>
    page.getByRole('heading', { name: nome, exact: true }).locator('xpath=..');
  const vaga = caixa('Tenho uma vaga');
  const projeto = caixa('Tenho um projeto');

  // "Lado a lado": mesma linha, mesma largura, mesmo topo. É a única bifurcação
  // do site, e hierarquizar um caminho sobre o outro desfaria o motivo dela.
  const [a, b] = await Promise.all([vaga.boundingBox(), projeto.boundingBox()]);
  expect(a!.y).toBe(b!.y);
  expect(a!.width).toBe(b!.width);
  expect(a!.x).toBeLessThan(b!.x);
});

test('o CV está publicado e responde 200 (§7)', async ({ page, request }) => {
  await page.goto('/contato');
  const link = page.getByRole('link', { name: 'Baixar o CV em PDF' });
  await expect(link).toHaveAttribute('href', CV);

  const resposta = await request.get(CV);
  expect(resposta.status()).toBe(200);
  expect(resposta.headers()['content-type']).toBe('application/pdf');
  // Um PDF de uma página de currículo tem dezenas de KB. Um arquivo vazio ou um
  // HTML de 404 servido com o tipo errado passaria no status e falharia aqui.
  const corpo = await resposta.body();
  expect(corpo.byteLength).toBeGreaterThan(10_000);
  expect(corpo.subarray(0, 5).toString('latin1')).toBe('%PDF-');
});

test('o e-mail está escrito por extenso, sem botão de copiar (§3.4)', async ({ page }) => {
  await page.goto('/contato');
  const email = page.getByRole('link', { name: 'luiz_dev@outlook.com' });
  await expect(email.first()).toBeVisible();
  await expect(email.first()).toHaveAttribute('href', 'mailto:luiz_dev@outlook.com');
  // Sem botão: o gesto de copiar já existe no sistema operacional em cima de um
  // link mailto:, e um botão custaria JS, estado e região aria-live (§9).
  await expect(page.getByRole('button', { name: /copiar/i })).toHaveCount(0);
});

test('não há formulário de contato (§3.4, §11)', async ({ page }) => {
  await page.goto('/contato');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('input, textarea')).toHaveCount(0);
});

test('o foco de teclado é visível nos links (§9)', async ({ page }) => {
  await page.goto('/contato');
  const cv = page.getByRole('link', { name: 'Baixar o CV em PDF' });
  await cv.focus();
  expect(await cv.evaluate((el) => getComputedStyle(el).outlineWidth)).not.toBe('0px');
});

test('cabe em 360px sem rolagem horizontal, nos dois temas (§9)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });

  for (const tema of ['light', 'dark'] as const) {
    await page.addInitScript((t) => localStorage.setItem('theme', t), tema);
    await page.goto('/contato');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, tema).toBeLessThanOrEqual(0);
    // Em 360px os dois caminhos empilham; o que não pode é um sumir.
    await expect(page.getByRole('heading', { name: 'Tenho uma vaga' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tenho um projeto' })).toBeVisible();
  }
});
