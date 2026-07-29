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

// Os dois, e não só um: o `because` compila `code` inline, e identificador
// longo (`repertoire.liturgical_snapshot`) é palavra que não quebra. Quem
// estoura a viewport de 360px é o case do Asafe, que é justamente o que a
// versão anterior deste teste não abria.
for (const slug of ['asafe', 'eaifez']) {
  test(`o case do ${slug} cabe em 360px sem rolagem horizontal (§9)`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`/projetos/${slug}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('o `code` do frontmatter chega compilado, e não como crase literal', async ({ page }) => {
  await page.goto('/projetos/asafe');
  const decisoes = page.locator('section', { has: page.getByRole('heading', { name: 'Decisões' }) });
  // O exemplo que sustenta a decisão dos dois eixos: interseção de intervalos
  // e não igualdade de string. Se sair em serifada, com crase em volta, a
  // parte mais técnica do site virou prosa solta.
  await expect(decisoes.locator('code', { hasText: 'Lc 15,1-3.11-32' })).toBeVisible();
  await expect(decisoes.getByText('`')).toHaveCount(0);
});

test('a decisão longa respira em parágrafos (§2)', async ({ page }) => {
  await page.goto('/projetos/asafe');
  const primeira = page.locator('#decisoes').locator('..').locator('ol > li').first();
  // A decisão dos dois eixos carrega quatro ideias; num `<p>` só ela media 171
  // palavras. O `+1` é a frase "Escolhi X em vez de Y", que não é prosa.
  expect(await primeira.locator('p').count()).toBeGreaterThan(1 + 1);
});

test('o que falta está escrito na tela, não escondido (§0)', async ({ page }) => {
  await page.goto('/projetos/asafe');
  // Os prints do Asafe ainda estão sendo capturados. Enquanto não chegam, o
  // buraco é visível — e quando chegarem, esta contagem cai para 0 e o teste
  // vira a afirmação de que não falta mais nada.
  await expect(page.getByText(/\{\{ print:/)).toHaveCount(4);
  // A prosa chegou na Task 6a: nenhum `{{ }}` sobra no corpo do case.
  await expect(page.locator('article').getByText(/\{\{/)).toHaveCount(0);
});

test('o case com print pronto não mostra buraco nenhum (§0)', async ({ page }) => {
  await page.goto('/projetos/eaifez');
  await expect(page.getByText(/\{\{/)).toHaveCount(0);

  const galeria = page.locator('section', { has: page.getByRole('heading', { name: /^Prints do/ }) });
  const imagens = galeria.getByRole('img');
  await expect(imagens).toHaveCount(4);

  // §9: dimensão declarada em toda imagem. Sem os atributos, o navegador não
  // reserva espaço e a galeria empurra o rodapé ao carregar — que é o motivo
  // de o §9 pedir `next/image` em vez de `<img>` solto.
  for (const img of await imagens.all()) {
    await expect(img).toHaveAttribute('width', /^\d+$/);
    await expect(img).toHaveAttribute('height', /^\d+$/);
    await expect(img).toHaveAttribute('loading', 'lazy');
  }

  // A capa é paisagem (1200×630, a imagem OG do app) e os três prints são
  // retrato de celular. As duas orientações convivem na mesma galeria — é o
  // que a linha separada da capa existe para resolver.
  const proporcao = async (n: number) => {
    const box = await imagens.nth(n).boundingBox();
    return box!.width / box!.height;
  };
  expect(await proporcao(0)).toBeGreaterThan(1);
  for (const n of [1, 2, 3]) expect(await proporcao(n)).toBeLessThan(1);
});

test('a galeria reserva o espaço antes de a imagem chegar (§9)', async ({ page }) => {
  // O motivo de o §9 pedir dimensão declarada é este, e não o atributo em si:
  // a galeria fica no fim de uma página longa, e sem reserva ela empurra o
  // rodapé quando os quatro arquivos carregam.
  //
  // Com a imagem bloqueada, a caixa tem que continuar de pé. A primeira versão
  // desta galeria media 0×0 aqui: `w-auto h-auto` deixava os dois eixos
  // indefinidos, e a proporção dos atributos não tinha de onde partir.
  await page.route('**/projects/**', (route) => route.abort());
  await page.goto('/projetos/eaifez');

  const imagens = page.locator('section img');
  await expect(imagens).toHaveCount(4);
  for (const img of await imagens.all()) {
    const box = await img.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  }
});
