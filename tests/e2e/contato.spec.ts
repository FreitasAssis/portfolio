import { expect, test } from '@playwright/test';

/**
 * `/contato` contra o export estático.
 *
 * O teste que só existe aqui é o do CV: um `href` correto no HTML não prova que
 * o arquivo foi publicado. O `next build` não confere `/public`, e um PDF que
 * não entrou no `out/` só dá sintoma pra quem clicou — no bloco de contato, que
 * é a última coisa que se descobre estar quebrada.
 */

const CV = '/cv/luiz-freitas-2026-07.pdf';

test('a página é uma lista de canais, sem triagem', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/contato');

  // Os dois caminhos ("Tenho uma vaga" / "Tenho um projeto") saíram porque
  // pressupunham venda ativa: o site existe para ser alcançável, não para
  // converter. O que se mede aqui é que a bifurcação não voltou.
  const corpo = await page.locator('body').innerText();
  expect(corpo).not.toMatch(/Tenho uma vaga|Tenho um projeto|Escolha o caminho/i);

  // Os quatro canais, na ordem. Escopo no `main`: o rodapé
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

test('o CV está publicado e responde 200', async ({ page, request }) => {
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

test('o retrato vai ao ar, no recorte quadrado', async ({ page }) => {
  await page.goto('/contato');
  // Último asset pendente do site: nenhum `{{ }}` sobra na página.
  await expect(page.getByText(/\{\{/)).toHaveCount(0);

  const retrato = page.locator('img[src^="/retrato/"]');
  await expect(retrato).toHaveCount(1);
  await retrato.scrollIntoViewIfNeeded();
  // `naturalWidth`/`naturalHeight` e não os atributos: o src quebrado dá 0, e o
  // layout continuaria certo porque a caixa é reservada pelos atributos.
  const natural = await retrato.evaluate((el: HTMLImageElement) => [
    el.naturalWidth,
    el.naturalHeight,
  ]);
  expect(natural[0]).toBe(natural[1]);

  // O arquivo tem o dobro da caixa — a regra dos dois recortes. Menos que isso
  // amplia num display 2x, que é o mais comum; mais que isso são bytes que a
  // tela não usa, e aqui eles custam caro: esta foto é o elemento de LCP da
  // rota, e o recorte de 490px derrubava a performance de 95 para 94.
  const caixa = (await retrato.boundingBox())!;
  expect(natural[0]).toBe(Math.round(caixa.width * 2));

  // E ela é pré-carregada: aqui a foto É o elemento de LCP, e com `lazy` o
  // Lighthouse reprova `lcp-lazy-loaded`. É a decisão inversa à da home, onde o
  // `priority` saiu do primeiro card por o LCP ser a h1; decide a medição.
  await expect(page.locator('link[rel="preload"][as="image"][href^="/retrato/"]')).toHaveCount(1);
  await expect(retrato).not.toHaveAttribute('loading', 'lazy');
});

test('o e-mail está escrito por extenso, sem botão de copiar', async ({ page }) => {
  await page.goto('/contato');
  const email = page.getByRole('link', { name: 'luiz_dev@outlook.com' });
  await expect(email.first()).toBeVisible();
  await expect(email.first()).toHaveAttribute('href', 'mailto:luiz_dev@outlook.com');
  // Sem botão: o gesto de copiar já existe no sistema operacional em cima de um
  // link mailto:, e um botão custaria JS, estado e uma região aria-live.
  await expect(page.getByRole('button', { name: /copiar/i })).toHaveCount(0);
});

test('não há formulário de contato', async ({ page }) => {
  await page.goto('/contato');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('input, textarea')).toHaveCount(0);
});

test('o foco de teclado é visível nos links', async ({ page }) => {
  await page.goto('/contato');
  const cv = page.getByRole('link', { name: 'Baixar o CV em PDF' });
  await cv.focus();
  expect(await cv.evaluate((el) => getComputedStyle(el).outlineWidth)).not.toBe('0px');
});

test('cabe em 360px sem rolagem horizontal, nos dois temas', async ({ page }) => {
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

test('não tem "voltar ao topo" — a página cabe numa tela', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/contato');

  // A exclusão é decisão registrada, não esquecimento. As outras três rotas de
  // conteúdo fecham com o bloco de `components/EndNav.tsx`; esta não, porque o
  // página é um título, uma linha e quatro links — um atalho para o topo numa
  // página que cabe numa tela é ruído.
  //
  // É também o teste que impede a "simplificação" de mover o bloco para o
  // rodapé: lá ele apareceria nas seis rotas de uma vez, inclusive aqui.
  await expect(page.getByRole('link', { name: 'Voltar ao topo' })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Fim da página' })).toHaveCount(0);

  // E ela de fato é curta: menos de duas telas de 740px em 360px de largura.
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(altura).toBeLessThan(2 * 740);
});
