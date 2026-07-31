import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { contrastRatio } from '@/lib/contrast';

/**
 * O piso de qualidade, varrido igual em toda rota e nos dois temas.
 *
 * Os specs por rota medem o que é próprio de cada página; aqui mora o que vale
 * para todas e não pode passar despercebido em nenhuma. A varredura é a forma
 * certa para este conjunto porque a falha típica é de omissão: rota nova entra
 * na lista e ganha as três medidas de graça, em vez de esperar que alguém se
 * lembre de copiar três testes.
 *
 * Não substitui um Lighthouse — substitui a parte dele que regride sem aviso. O
 * score de acessibilidade do Lighthouse é o axe rodando; rodá-lo aqui dá a mesma
 * cobertura sem prender o repo a uma dependência de CI, e diz QUAL regra quebrou
 * em vez de "97".
 */

const ROTAS = ['/', '/projetos', '/projetos/asafe', '/projetos/eaifez', '/sobre', '/contato'];
const TEMAS = ['light', 'dark'] as const;

/** O piso de largura que o site atende. */
const ESTREITO = { width: 360, height: 740 };

const COMBOS = ROTAS.flatMap((rota) => TEMAS.map((tema) => ({ rota, tema })));

/** `rgb(14, 16, 19)` do getComputedStyle no `#0e1013` que lib/contrast espera. */
function hex(cor: string): string {
  const canais = [...cor.matchAll(/\d+/g)].slice(0, 3);
  return `#${canais.map(([c]) => Number(c).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Abre a rota com o tema fixado, e confere que ele pegou antes de medir
 * qualquer coisa — metade destes testes não teria sintoma se o tema não
 * aplicasse: eles passariam medindo o claro duas vezes.
 *
 * O claro é a AUSÊNCIA do atributo, não `data-theme="light"`: o script
 * anti-flash de `app/layout.tsx` só escreve quando o resultado é escuro, e o
 * `:root` do CSS já é o tema claro.
 */
async function abrir(page: Page, rota: string, tema: (typeof TEMAS)[number]) {
  await page.addInitScript((t) => localStorage.setItem('theme', t), tema);
  await page.goto(rota);
  const html = page.locator('html');
  if (tema === 'dark') await expect(html).toHaveAttribute('data-theme', 'dark');
  else await expect(html).not.toHaveAttribute('data-theme', 'dark');
}

test.describe('360px', () => {
  test.use({ viewport: ESTREITO });

  for (const { rota, tema } of COMBOS) {
    test(`${rota} no tema ${tema} não rola na horizontal`, async ({ page }) => {
      await abrir(page, rota, tema);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('foco de teclado', () => {
  for (const { rota, tema } of COMBOS) {
    test(`${rota} no tema ${tema}: todo interativo é alcançável e o anel aparece`, async ({
      page,
    }) => {
      await abrir(page, rota, tema);

      const interativos = await page
        .locator('a[href], button, [tabindex]:not([tabindex="-1"])')
        .count();

      /**
       * A caminhada é por Tab de verdade, e não `.focus()` em cada elemento:
       * `.focus()` chega em nó que a ordem sequencial não alcança, que é
       * justamente a falha procurada. O `:focus-visible` também depende de o
       * foco ter vindo do teclado — com `.focus()` o anel pode nem existir.
       */
      const vistos: string[] = [];
      for (let i = 0; i < interativos + 4; i++) {
        await page.keyboard.press('Tab');
        const atual = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const estilo = getComputedStyle(el);
          const caixa = el.getBoundingClientRect();
          // O fundo que interessa é o do ANCESTRAL, não o do próprio elemento:
          // `outline-offset` positivo desenha o anel do lado de fora da caixa.
          // Um botão preenchido com --accent tem o anel sobre o papel, e medir
          // contra o preenchimento acusaria 1:1 onde não há defeito.
          let fundo = 'rgb(255,255,255)';
          for (let p = el.parentElement; p; p = p.parentElement) {
            const c = getComputedStyle(p).backgroundColor;
            if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
              fundo = c;
              break;
            }
          }
          return {
            chave: `${el.tagName}|${el.getAttribute('href') ?? ''}|${el.textContent?.trim().slice(0, 40)}`,
            larguraDoAnel: Number.parseFloat(estilo.outlineWidth),
            estiloDoAnel: estilo.outlineStyle,
            corDoAnel: estilo.outlineColor,
            fundo,
            area: caixa.width * caixa.height,
          };
        });
        if (atual === null) break;
        // O ciclo se fechou: o foco voltou para o primeiro da ordem.
        if (vistos[0] === atual.chave) break;
        vistos.push(atual.chave);

        expect(atual.larguraDoAnel, `anel de ${atual.chave}`).toBeGreaterThanOrEqual(2);
        expect(atual.estiloDoAnel, `anel de ${atual.chave}`).not.toBe('none');
        // O par que `tests/unit/contrast.test.ts` não alcança: lá se mede o
        // token contra `--paper`, aqui contra o que de fato está ATRÁS do
        // elemento focado. Focável dentro da faixa de acento de um case
        // reprovaria aqui e passaria lá.
        expect(
          contrastRatio(hex(atual.corDoAnel), hex(atual.fundo)),
          `anel de ${atual.chave} sobre ${atual.fundo}`,
        ).toBeGreaterThanOrEqual(3);
        // Alvo com área zero é alcançável e invisível — o anel não tem onde ser
        // desenhado, e quem navega por teclado perde o rastro.
        expect(atual.area, `alvo de ${atual.chave}`).toBeGreaterThan(0);
      }

      expect(vistos.length, 'elemento interativo fora da ordem de tabulação').toBe(interativos);
    });
  }
});

test.describe('prefers-reduced-motion', () => {
  /**
   * O único movimento orquestrado do site é a troca de acento, e ela mora numa
   * `transition` no próprio `<html>` — o mesmo elemento em que o `AccentTracker`
   * escreve `data-accent`. É por isso que a medida é feita aqui e não num
   * componente: apagar a transição de um filho não apagaria esta.
   */
  const TRANSICAO = ['background-color', 'color'];

  test('a transição de acento existe quando ninguém pediu para desligá-la', async ({ page }) => {
    await page.goto('/projetos/asafe');
    const estilo = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return { duracao: cs.transitionDuration, propriedade: cs.transitionProperty };
    });
    expect(estilo.propriedade.split(', ')).toEqual(TRANSICAO);
    for (const d of estilo.duracao.split(', ')) expect(Number.parseFloat(d)).toBeGreaterThan(0.05);
  });

  test.describe('com reduce', () => {
    test('a transição de acento é desligada', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/projetos/asafe');
      const duracao = await page.evaluate(
        () => getComputedStyle(document.documentElement).transitionDuration,
      );
      // O bloco do CSS zera por `!important`; o que se mede é o efeito, não a
      // grafia. O que se pede é um salto instantâneo, não a ausência da regra.
      for (const d of duracao.split(', ')) expect(Number.parseFloat(d)).toBeLessThan(0.01);
    });
  });
});

test.describe('axe', () => {
  for (const { rota, tema } of COMBOS) {
    test(`${rota} no tema ${tema} passa em wcag2a/wcag2aa`, async ({ page }) => {
      await abrir(page, rota, tema);
      // Rolar até o fim antes de medir: a cor do site é emprestada pelo projeto
      // que está na tela (`AccentTracker`), então metade das combinações de
      // contraste desta página só existe depois que a zona do case domina a
      // viewport. Medir só o topo mediria a base neutra duas vezes.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(400);

      const resultado = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(
        resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' / ')}`),
      ).toEqual([]);
    });
  }
});
