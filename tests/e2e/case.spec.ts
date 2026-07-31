import { expect, test } from '@playwright/test';

/** Valor calculado de `--accent` no `<html>`, que é onde o AccentTracker escreve. */
function accentVar(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  );
}

test('o case segue o template fixo, na ordem', async ({ page }) => {
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

test('as decisões saem no formato "escolhi X em vez de Y"', async ({ page }) => {
  await page.goto('/projetos/asafe');
  const decisoes = page.locator('section', { has: page.getByRole('heading', { name: 'Decisões' }) });
  // 3 a 5 itens, cada um com a escolha e a alternativa. Sem o "em vez de", o
  // case vira vitrine — é a parte que prova que houve escolha.
  const itens = decisoes.getByRole('listitem');
  await expect(itens).toHaveCount(5);
  await expect(itens.first()).toContainText('em vez de');
});

test('o repo privado não vira botão morto', async ({ page }) => {
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

test('o case empresta a cor ao site inteiro', async ({ page }) => {
  // O elo que o teste unitário não alcança: o jsdom não faz cascata de custom
  // properties. Aqui é o browser resolvendo [data-accent] de verdade.
  await page.goto('/projetos/asafe');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'asafe');
  expect(await accentVar(page)).toBe('#2f3a5e');

  await page.goto('/projetos/eaifez');
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'eaifez');
  expect(await accentVar(page)).toBe('#a83c55');
});

test('a linha do corpo fica na faixa de 65–75 caracteres', async ({ page }) => {
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
  // A medida é uma FAIXA, e o piso importa tanto quanto o teto. Sem o piso, este
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
  test(`o case do ${slug} cabe em 360px sem rolagem horizontal`, async ({ page }) => {
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

test('a decisão longa respira em parágrafos', async ({ page }) => {
  await page.goto('/projetos/asafe');
  const primeira = page.locator('#decisoes').locator('..').locator('ol > li').first();
  // A decisão dos dois eixos carrega quatro ideias; num `<p>` só ela media 171
  // palavras. O `+1` é a frase "Escolhi X em vez de Y", que não é prosa.
  expect(await primeira.locator('p').count()).toBeGreaterThan(1 + 1);
});

// Os dois cases estão capturados: nenhum dos dois pode mostrar buraco, e os
// dois precisam ter as quatro imagens com dimensão declarada.
for (const slug of ['asafe', 'eaifez']) {
  test(`o case do ${slug} não mostra buraco nenhum`, async ({ page }) => {
    await page.goto(`/projetos/${slug}`);
    await expect(page.getByText(/\{\{/)).toHaveCount(0);

    const galeria = page.locator('section', {
      has: page.getByRole('heading', { name: /^Prints do/ }),
    });
    const imagens = galeria.getByRole('img');
    await expect(imagens).toHaveCount(4);

    // Dimensão declarada em toda imagem. Sem os atributos, o navegador não
    // reserva espaço e a galeria empurra o rodapé ao carregar — que é o motivo
    // de o site usar `next/image` em vez de `<img>` solto.
    for (const img of await imagens.all()) {
      await expect(img).toHaveAttribute('width', /^\d+$/);
      await expect(img).toHaveAttribute('height', /^\d+$/);
      await expect(img).toHaveAttribute('loading', 'lazy');
    }
  });
}

test('a capa encabeça a galeria em vez de sumir dentro dela', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // A do "E aí, fez?" é paisagem (1200×630, a imagem OG do app); a do Asafe é
  // retrato de celular. As duas orientações convivem na mesma galeria, e em
  // nenhuma das duas a capa pode sair MENOR que os prints que ela encabeça —
  // que é o que acontecia com a capa retrato antes de ela ganhar teto próprio.
  for (const slug of ['asafe', 'eaifez']) {
    await page.goto(`/projetos/${slug}`);
    const imagens = page
      .locator('section', { has: page.getByRole('heading', { name: /^Prints do/ }) })
      .getByRole('img');

    const caixa = async (n: number) => (await imagens.nth(n).boundingBox())!;
    const capa = await caixa(0);
    const print = await caixa(1);

    expect(capa.width, `${slug}: capa mais estreita que o print`).toBeGreaterThan(print.width);
    expect(print.width / print.height, `${slug}: print não é retrato`).toBeLessThan(1);
  }
});

/* ------------------------------------------------------------------------- *
 * Fim do case.
 *
 * A página do Asafe mede 7.915px em 1440×900 e 14.138px em 360×740 — 8,8 e 19,1
 * telas —, e só a seção de decisões responde por 41% a 50% disso. O bloco do fim
 * é a resposta estática a esse comprimento: nada de botão flutuante, que seria
 * movimento novo sobre o conteúdo.
 * ------------------------------------------------------------------------- */

const fimDoCase = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Fim do case' });

test('a corrente do próximo case é derivada, não um par escrito à mão', async ({ page }) => {
  // O encadeamento sai do `order` do frontmatter (tests/unit/projects.test.ts
  // prova a derivação com uma corrente sintética de três). Aqui o que se
  // verifica é o resultado no artefato que vai ao ar: o primeiro leva ao
  // segundo, e o último não inventa um laço de volta ao primeiro.
  await page.goto('/projetos/asafe');
  await expect(fimDoCase(page).getByRole('link', { name: /próximo case/i })).toHaveAttribute(
    'href',
    '/projetos/eaifez',
  );

  await page.goto('/projetos/eaifez');
  const fim = fimDoCase(page);
  await expect(fim.getByRole('link', { name: /próximo case/i })).toHaveCount(0);
  await expect(fim.getByRole('link', { name: 'Ver todos os projetos' })).toHaveAttribute(
    'href',
    '/projetos',
  );
});

test('o "voltar ao topo" leva ao topo de verdade', async ({ page }) => {
  // Mesma razão do teste da âncora da /projetos: `href` para fragmento
  // inexistente é falha silenciosa — o navegador não reclama, só não sai do
  // lugar. Por isso este teste CLICA e mede onde a página parou.
  await page.goto('/projetos/asafe');
  const topo = fimDoCase(page).getByRole('link', { name: 'Voltar ao topo' });
  await topo.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

  await topo.click();
  await page.waitForURL(/\/projetos\/asafe#topo$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // E o alvo é o cabeçalho, não um `<div>` qualquer: é o que põe o ponto de
  // partida da navegação de teclado na navegação do site.
  expect(await page.locator('#topo').evaluate((el) => el.tagName)).toBe('HEADER');
});

test('depois do salto, o Tab continua do topo e não do rodapé', async ({ page }) => {
  // O motivo de o alvo ser um `id` e não um `href="#"` vazio. Com `#`, a página
  // rola e o ponto de partida da navegação sequencial fica para trás: quem usa
  // teclado vê o topo e tabula a partir do fim da página.
  await page.goto('/projetos/asafe');
  await fimDoCase(page).getByRole('link', { name: 'Voltar ao topo' }).click();
  await page.keyboard.press('Tab');

  const focado = page.locator(':focus');
  await expect(focado).toHaveAttribute('href', '/');
  // E o foco está visível, com o anel do site — que vem de graça por ser um <a>.
  expect(await focado.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px');
});

test('os dois links do fim têm nomes distinguíveis e cabem em 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/projetos/eaifez');

  const nomes = await fimDoCase(page)
    .getByRole('link')
    .evaluateAll((els) => els.map((el) => el.textContent!.trim()));
  expect(nomes).toEqual(['Ver todos os projetos', 'Voltar ao topo']);

  // Os dois inteiros dentro da coluna, sem estourar a viewport estreita. O
  // teste de rolagem horizontal da página inteira já roda acima; aqui o que
  // importa é que o bloco novo não é o que a estoura.
  for (const link of await fimDoCase(page).getByRole('link').all()) {
    await expect(link).toBeVisible();
    const box = (await link.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(360);
  }
});

test('o acento não se apaga no fim do case', async ({ page }) => {
  // O bloco fica DENTRO da AccentZone de propósito. Medido no fim da página:
  // com ele dentro, a zona cobre 76,0% da viewport em 1440×900 e 59,6% em
  // 360×740; com ele fora, cairia para 63,3% e 39,4% — a 4,4 pontos do limiar
  // de 35% do AccentTracker. Perto o bastante para o acento se apagar bem no
  // fim do case, que é movimento novo no lugar mais silencioso possível.
  for (const [slug, hex] of [
    ['asafe', '#2f3a5e'],
    ['eaifez', '#a83c55'],
  ] as const) {
    await page.goto(`/projetos/${slug}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(fimDoCase(page)).toBeInViewport();
    await expect(page.locator('html')).toHaveAttribute('data-accent', slug);
    expect(await accentVar(page)).toBe(hex);
  }
});

test('a galeria reserva o espaço antes de a imagem chegar', async ({ page }) => {
  // O motivo de a dimensão declarada importar é este, e não o atributo em si:
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
