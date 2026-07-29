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

test('a página é uma lista de canais, sem triagem (§3.4)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/contato');

  // Havia aqui um teste que media a igualdade das duas caixas ("Tenho uma
  // vaga" / "Tenho um projeto") em pixel. O §3.4 tirou os dois caminhos —
  // "pressupunham venda ativa" — e o §1 explicou por quê: o site não existe
  // para converter. O que sobrou a medir é que a bifurcação não voltou.
  const corpo = await page.locator('body').innerText();
  expect(corpo).not.toMatch(/Tenho uma vaga|Tenho um projeto|Escolha o caminho/i);

  // Os quatro canais do §3.4, na ordem do brief. Escopo no `main`: o rodapé
  // repete e-mail, GitHub e LinkedIn em toda página, e o que se mede aqui é o
  // conteúdo da rota.
  const canais = page.locator('main a');
  await expect(canais).toHaveCount(4);
  await expect(canais).toHaveText([
    'luiz_dev@outlook.com',
    'linkedin.com/in/luiz-dev',
    'github.com/FreitasAssis',
    'Baixar o CV em PDF',
  ]);
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
    // Em 360px a lista e o retrato empilham; o que não pode é um canal sumir —
    // e o CV é o que mais tem a perder, porque é o único que não cabe também no
    // rodapé.
    await expect(page.getByRole('link', { name: 'Baixar o CV em PDF' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'luiz_dev@outlook.com' }).first()).toBeVisible();
  }
});
