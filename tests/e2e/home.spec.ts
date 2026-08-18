import { expect, test } from '@playwright/test';

import { getAllProjects } from '@/lib/projects';

/** Valor calculado de `--accent` no `<html>`, que é onde o AccentTracker escreve. */
function accentVar(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  );
}

test('a home é autossuficiente', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /projetos/i }).first()).toBeVisible();
  await expect(page.getByText(/400 mil/i)).toBeVisible();
});

test('não existe seção de IA', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /^ia$|intelig[êe]ncia artificial/i }),
  ).toHaveCount(0);
});

test('os blocos aparecem na ordem: projetos, trajetória, como eu trabalho, contato', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Projetos próprios',
    'Trajetória',
    'Como eu trabalho',
    'Contato',
  ]);
});

test('os cards abrem os apps no ar, com o case em segundo plano', async ({ page }) => {
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

test('o acento troca conforme o projeto na tela', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  await page.locator('[data-accent="asafe"]').scrollIntoViewIfNeeded();
  await expect(html).toHaveAttribute('data-accent', 'asafe');
  // Não basta o atributo: o que se promete é a COR virando. Este é o elo
  // que o teste unitário não alcança — o jsdom não faz cascata de custom
  // properties nem layout.
  expect(await accentVar(page)).toBe('#2f3a5e');

  await page.locator('[data-accent="eaifez"]').scrollIntoViewIfNeeded();
  await expect(html).toHaveAttribute('data-accent', 'eaifez');
  expect(await accentVar(page)).toBe('#a83c55');

  await page.locator('[data-accent="ciranda"]').scrollIntoViewIfNeeded();
  await expect(html).toHaveAttribute('data-accent', 'ciranda');
  expect(await accentVar(page)).toBe('#e8a33d');
});

test('a base volta a ser neutra fora dos projetos', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-accent="ciranda"]').scrollIntoViewIfNeeded();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'ciranda');

  await page.getByRole('heading', { name: 'Contato' }).scrollIntoViewIfNeeded();
  await expect(page.locator('html')).not.toHaveAttribute('data-accent', /.*/);
});

test('a prosa fica na faixa de 65–75 caracteres', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  // Mede o subhead do hero e os blocos do "Como eu trabalho" — o texto corrido
  // da home. A coluna de leitura já esteve em 36rem, o que dava 56,5 caracteres:
  // abaixo do piso da faixa, e ninguém percebia porque só o teto era medido.
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

test('a trajetória cabe em uma linha por posição em tela larga', async ({ page }) => {
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

test('cabe em 360px sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('o foco de teclado é visível nos CTAs', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: 'Ver os projetos' });
  await cta.focus();
  const outline = await cta.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outline).not.toBe('0px');
});

test('o que ainda falta está escrito na tela, não escondido', async ({ page }) => {
  await page.goto('/');
  // `{{ }}` é a marca de asset que ainda não chegou; nenhuma sobra no site. A
  // contagem sai do conteúdo, e é uma imagem por card: o retrato mora no /sobre
  // e no /contato, e a home não tem foto.
  await expect(page.getByText(/\{\{ print:/)).toHaveCount(0);
  await expect(page.locator('article img')).toHaveCount((await getAllProjects()).length);
  await expect(page.getByText('{{ CV em PDF }}')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Baixar o CV em PDF' })).toHaveAttribute(
    'href',
    /^\/cv\/luiz-freitas-\d{4}-\d{2}\.pdf$/,
  );
  // E nada de placeholder onde o dado já chegou.
  await expect(page.getByText(/URL do documento de decisões/)).toHaveCount(0);
});

test('os dois documentos de decisão do Asafe são linkáveis', async ({ page }) => {
  await page.goto('/');
  // São os links que substituem qualquer declaração sobre método — sem eles, a
  // afirmação fica sem o convite de auditoria que a sustenta. São estes dois
  // porque são os que o repo público do Asafe versiona, e só se linka o que
  // existe: link de auditoria em 404 desfaz o convite que ele faz.
  await expect(page.getByRole('link', { name: 'DESIGN.md' })).toHaveAttribute(
    'href',
    'https://github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md',
  );
  await expect(page.getByRole('link', { name: 'identidade-visual.md' })).toHaveAttribute(
    'href',
    'https://github.com/FreitasAssis/Asafe/blob/main/docs/identidade-visual.md',
  );
});

test('a trajetória é um índice de cinco linhas, não conteúdo', async ({ page }) => {
  await page.goto('/');
  const traj = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Trajetória' }) });
  await expect(traj.getByRole('listitem')).toHaveCount(5);
  await expect(traj).not.toContainText('em paralelo');
});

test('não há formulário de contato', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('form')).toHaveCount(0);
});

/* ------------------------------------------------------------------------- *
 * Fim da página.
 *
 * O bloco de `components/EndNav.tsx` está na home, na `/projetos`, no `/sobre`
 * e nos cases — uma âncora estática, sem JS, sem movimento e sem elemento
 * flutuante. O `/contato` fica fora: ele cabe numa tela.
 * ------------------------------------------------------------------------- */

const fimDaPagina = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Fim da página' });

test('o "voltar ao topo" da home leva ao topo de verdade', async ({ page }) => {
  // `href` para fragmento inexistente é falha silenciosa: o navegador não
  // reclama, só não sai do lugar. Por isso o teste CLICA e mede onde parou, como
  // já faz o da âncora da experiência em projetos.spec.ts.
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');

  const topo = fimDaPagina(page).getByRole('link', { name: 'Voltar ao topo' });
  await topo.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

  await topo.click();
  await page.waitForURL(/\/#topo$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // E o alvo é o cabeçalho, não um `<div>` qualquer: é o que põe o ponto de
  // partida da navegação de teclado na navegação do site.
  expect(await page.locator('#topo').evaluate((el) => el.tagName)).toBe('HEADER');
});

test('o bloco do fim é o mesmo idioma dos cases, e cabe em 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');

  const bloco = fimDaPagina(page);
  // Um link só: a corrente de "próximo" é dos cases.
  await expect(bloco.getByRole('link')).toHaveCount(1);
  // Texto e uma régua — nem ícone, nem caixa, nem nada flutuando.
  await expect(bloco.locator('svg, img')).toHaveCount(0);
  const forma = await bloco.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      position: s.position,
      regua: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth],
      fonte: s.fontFamily,
    };
  });
  expect(forma.position).toBe('static');
  expect(forma.regua).toEqual(['1px', '0px', '0px', '0px']);
  expect(forma.fonte).toMatch(/JetBrains/i);

  const caixa = (await bloco.getByRole('link').boundingBox())!;
  expect(caixa.x + caixa.width).toBeLessThanOrEqual(360);
});

test('depois do salto, o Tab continua do topo e não do rodapé', async ({ page }) => {
  // O motivo de o alvo ser um `id` e não um `href="#"` vazio. Com `#`, a página
  // rola e o ponto de partida da navegação sequencial fica para trás.
  await page.goto('/');
  await fimDaPagina(page).getByRole('link', { name: 'Voltar ao topo' }).click();
  await page.keyboard.press('Tab');

  const focado = page.locator(':focus');
  await expect(focado).toHaveAttribute('href', '/');
  expect(await focado.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px');
});
