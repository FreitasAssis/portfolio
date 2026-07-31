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
  await page.goto('/sobre');
  // Piso E teto: a coluna já esteve em 56,5 caracteres neste repo porque só o
  // teto era verificado. E o parágrafo da camada 2 fica de fora de propósito —
  // ele é `text-xs`, e 68ch medidos em 18px dariam 76 na fonte menor.
  //
  // Em várias larguras, e não só em 1440, porque a foto passou a morar dentro
  // da coluna de texto: um retrato que flutuasse ou dividisse a linha derrubaria
  // a medida em alguma delas sem derrubar nas outras.
  //
  // 768 é a menor da lista **de propósito**: dali para baixo a coluna é ditada
  // pela viewport e não pelos 68ch (640px dão 54 caracteres, 360px dão 31), e
  // não existe coluna de 65 caracteres que caiba num celular. Medir a faixa lá
  // seria exigir da página o que a tela não tem.
  for (const width of [768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const larguras = await medidas(page.locator('section p.prose-measure'));
    expect(larguras, `${width}px`).toHaveLength(5);
    for (const m of larguras) {
      expect(m, `${width}px`).toBeGreaterThanOrEqual(65);
      expect(m, `${width}px`).toBeLessThanOrEqual(75);
    }
  }
});

test('o retrato fica centrado entre o terceiro e o quarto parágrafo (§6.3)', async ({ page }) => {
  // A posição virou argumento: a foto é dele tocando na igreja, e o terceiro
  // parágrafo é o que diz que ele já tocava na igreja antes de programar. Antes
  // ela vinha depois dos cinco, sozinha, com um vazio enorme ao lado.
  //
  // A ordem de DOM está travada no teste unitário; o que só existe aqui é o
  // pixel — o jsdom não faz layout, então "centrado" e "entre um parágrafo e o
  // outro" só podem ser medidos contra o artefato renderizado.
  await page.goto('/sobre');
  const paragrafos = page.locator('section p.prose-measure');

  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const terceiro = (await paragrafos.nth(2).boundingBox())!;
    const quarto = (await paragrafos.nth(3).boundingBox())!;
    const foto = (await page.locator('img[src^="/retrato/"]').boundingBox())!;

    // Depois do terceiro e antes do quarto, na vertical.
    expect(foto.y, `${width}px`).toBeGreaterThanOrEqual(terceiro.y + terceiro.height);
    expect(foto.y + foto.height, `${width}px`).toBeLessThanOrEqual(quarto.y);

    // Centrada na coluna, e não encostada numa das margens: uma versão anterior
    // punha a foto na margem direita, e a diferença entre as duas não aparece em
    // teste nenhum que só olhe o DOM. 2px de tolerância para arredondamento.
    const centroDaFoto = foto.x + foto.width / 2;
    const centroDaColuna = terceiro.x + terceiro.width / 2;
    expect(Math.abs(centroDaFoto - centroDaColuna), `${width}px`).toBeLessThanOrEqual(2);

    // E dentro da coluna: uma foto mais larga que o texto reabriria a rolagem
    // horizontal que o teste de 360px guarda.
    expect(foto.width, `${width}px`).toBeLessThanOrEqual(terceiro.width);
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
  // O retrato é o elemento mais largo depois do texto; se ele estourasse,
  // estouraria aqui. `scrollIntoViewIfNeeded` porque ele nasce abaixo da dobra
  // e é `loading="lazy"` — sem rolar até ele, o byte nem é pedido.
  const retrato = page.locator('img[src^="/retrato/"]');
  await retrato.scrollIntoViewIfNeeded();
  await expect(retrato).toBeVisible();
  // E ele chegou de verdade: `naturalWidth` é 0 num src quebrado, e o layout
  // continuaria certinho porque a caixa é reservada pelos atributos.
  expect(await retrato.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});

test('o retrato vai ao ar como imagem, não como buraco', async ({ page }) => {
  await page.goto('/sobre');
  // O retrato era o último asset pendente do site. Nenhum `{{ }}` sobra em
  // lugar nenhum da página — nem o dele, nem outro que tenha entrado de carona.
  await expect(page.getByText(/\{\{/)).toHaveCount(0);

  const retrato = page.locator('img[src^="/retrato/"]');
  await expect(retrato).toHaveCount(1);
  await retrato.scrollIntoViewIfNeeded();

  // A caixa renderizada não pode pedir mais pixels do que o arquivo tem: num
  // display 2x, 490px de fonte cobrem 245px de CSS. A raiz do site é 18px, e
  // foi por ela que os 16rem antigos (288px) davam upscale em toda tela retina
  // — 16rem são 288px, não 256, e 288 × 2 = 576 de uma fonte que tem 490.
  const caixa = (await retrato.boundingBox())!;
  const natural = await retrato.evaluate((el: HTMLImageElement) => el.naturalWidth);
  expect(caixa.width * 2).toBeLessThanOrEqual(natural);
  // E não tão pequeno que deixe de ser presença: é a única pessoa no site.
  expect(caixa.width).toBeGreaterThan(200);

  // Alt descritivo — a mesma régua que lib/projects.ts aplica aos prints.
  const alt = (await retrato.getAttribute('alt')) ?? '';
  expect(alt.length).toBeGreaterThan(20);
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

test('o "voltar ao topo" do /sobre leva ao topo de verdade, nos dois temas (§9)', async ({
  page,
}) => {
  // `href` para fragmento inexistente é falha silenciosa. Este teste clica e
  // mede. Nos dois temas porque a régua e o `text-ink-2` do bloco são tokens que
  // trocam de valor no escuro — foi assim que o acento escuro já morreu em
  // silêncio neste repo.
  for (const tema of ['light', 'dark'] as const) {
    await page.addInitScript((t) => localStorage.setItem('theme', t), tema);
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/sobre');

    const bloco = page.getByRole('navigation', { name: 'Fim da página' });
    const topo = bloco.getByRole('link', { name: 'Voltar ao topo' });
    await topo.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY), tema).toBeGreaterThan(600);

    await topo.click();
    await page.waitForURL(/\/sobre#topo$/);
    expect(await page.evaluate(() => window.scrollY), tema).toBe(0);
    expect(await page.locator('#topo').evaluate((el) => el.tagName)).toBe('HEADER');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, tema).toBeLessThanOrEqual(0);
    // Um link só: o /sobre não tem "próximo" a oferecer (§4.6).
    await expect(bloco.getByRole('link')).toHaveCount(1);
  }
});

test('a régua do fim não encosta no texto da formação (§6.4)', async ({ page }) => {
  // A seção "Formação" era a última da página e por isso só tinha `pt-16`. Sem
  // um `pb`, a régua do bloco novo colaria no parágrafo do diploma — o `EndNav`
  // não traz margem de cima nenhuma, por decisão: cada seção paga o próprio
  // ritmo vertical. Esta é a medida que prova que o `py-16` entrou.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/sobre');

  const diploma = (await page
    .locator('section', { has: page.getByRole('heading', { name: 'Formação' }) })
    .locator('p')
    .boundingBox())!;
  const fim = (await page.getByRole('navigation', { name: 'Fim da página' }).boundingBox())!;

  // 64px de `py-16`, e o bloco vem DEPOIS do texto — não ao lado nem antes.
  expect(fim.y - (diploma.y + diploma.height)).toBeGreaterThanOrEqual(48);
});
