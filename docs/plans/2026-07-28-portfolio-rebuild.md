# Reconstrução do luizfreitas.com.br — Plano de implementação

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reconstruir o portfólio do zero conforme o contrato em `docs/private/PORTFOLIO-BRIEF.md`, mantendo apenas o domínio, e publicar na Cloudflare Pages com os redirects das rotas antigas.

> **Nota sobre `docs/`.** O repo é público. `docs/private/` (o brief e o PDF do CV) é ignorado pelo git — é nota interna, e o §4.2.1 do próprio brief avisa que documento interno vira peça de vitrine no instante em que fica público, então publicar é decisão deliberada e curada, não efeito colateral. `docs/cv/luiz-freitas.html` é versionado por ser a **fonte** do CV; verificado como livre de RG, CPF, data de nascimento, endereço e telefone (§4.3). O PDF publicado vai separado em `public/cv/` na Task 8 — esse precisa ser versionado, senão a Cloudflare não tem o que servir.

**Architecture:** Next.js App Router em **export estático puro** (`output: 'export'`) — sem servidor, sem banco, sem CMS, saída em `out/` servida pela Cloudflare Pages. Conteúdo dos projetos em arquivos MDX lidos do filesystem em build time. Identidade visual construída sobre CSS custom properties: a base é neutra e o acento é injetado por `data-accent` na seção/página, conforme §6.1 do brief.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 (config CSS-first via `@theme`) · `next-mdx-remote/rsc` + `gray-matter` · Vitest + Testing Library · Playwright · Cloudflare Pages.

---

## Decisões deste plano que se afastam da letra do brief

Três, todas com motivo. Se qualquer uma for rejeitada, o plano muda a partir da Task 1.

1. **`output: 'export'` em vez de `@cloudflare/next-on-pages`.** O brief (§7) sugere o adapter, mas também diz "sem banco, sem backend, tudo estático". Não há uma única rota que precise de runtime. Export estático elimina o adapter inteiro, tem build mais simples e é imune a quebra de compatibilidade do `next-on-pages` a cada major do Next. Consequência aceita: `next.config.js redirects()` **não funciona** em export estático — logo os 301 vão em `public/_redirects`, que é a alternativa que o próprio brief §10.1 oferece.

2. **`images.unoptimized: true` com WebP pré-dimensionado.** Export estático não roda o otimizador do `next/image`. Como os prints já vão ser exportados em WebP na dimensão certa (§4.7), o otimizador não teria o que fazer. `next/image` continua sendo usado — pelo `width`/`height` obrigatório, `loading="lazy"` e reserva de espaço, que é o que importa pro CLS.

3. **Next 16 / Tailwind 4 em vez do Next 14 / Tailwind 3 do repo atual.** É reconstrução; herdar duas majors de atraso não faz sentido. Tailwind 4 é config CSS-first (`@theme` no CSS, sem `tailwind.config.ts`), o que encaixa melhor com o sistema de tokens do §6.2 do que o config em JS.

**Risco conhecido, tratado na Task 10:** geração de OG image via `ImageResponse` sob `output: 'export'` é o único ponto do plano que pode não funcionar como esperado. A Task 10 começa por um spike que confirma ou derruba isso, com fallback definido.

---

## Assets pendentes

Nenhum dos assets do §12 existe ainda. O build usa placeholders visíveis (bloco na cor de acento, nas dimensões reais, com label do que falta) e **eu peço o asset a você no momento em que a task o consome** — não invento, não uso banco de imagem, não deixo `alt` genérico. Os pontos de pedido estão marcados no plano como **`⟶ PEDIR AO LUIZ`**.

---

## Task 0: Branch limpa e esqueleto do projeto

**Files:**
- Delete: `app/`, `public/icons/`, `tailwind.config.ts`, `next.config.mjs`, `.eslintrc.json`, `package-lock.json`
- Modify: `package.json`
- Create: `next.config.ts`, `tsconfig.json`, `.gitignore`

**Step 1: Criar a branch**

```bash
git checkout -b rebuild
git add PORTFOLIO-BRIEF.md docs/plans/2026-07-28-portfolio-rebuild.md
git commit -m "docs: brief e plano da reconstrução"
```

**Step 2: Remover o site antigo**

```bash
git rm -r --quiet app public/icons tailwind.config.ts next.config.mjs .eslintrc.json
```

Nada de `app/` sobrevive — inclusive as três rotas de API de depoimentos, que morrem junto com a página (§1).

**Step 3: Trocar as dependências**

Sai tudo de Vercel e Postgres (§11: analytics fora de escopo; §7: sem banco). `package.json`:

```json
{
  "name": "portfolio",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run typecheck && npm run lint && npm run test && npm run build"
  },
  "dependencies": {
    "next": "^16.2.12",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "next-mdx-remote": "^6.0.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9",
    "eslint-config-next": "^16.2.12",
    "jsdom": "^25.0.0",
    "tailwindcss": "^4.3.3",
    "@tailwindcss/postcss": "^4.3.3",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

```bash
rm -f package-lock.json && npm install
```

**Step 4: Config do Next**

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // redirects() não é suportado em output: 'export'.
  // Os 301 das rotas antigas vivem em public/_redirects (§10.1 do brief).
};

export default nextConfig;
```

`postcss.config.mjs`:

```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

`tsconfig.json` — manter o gerado pelo Next, garantindo `"strict": true` e o alias `"@/*": ["./*"]`.

**Step 5: Verificar que a base sobe**

Criar um `app/layout.tsx` e `app/page.tsx` mínimos só para validar o pipeline, rodar:

```bash
npm run build
```

Esperado: build passa e gera `out/index.html`.

```bash
test -f out/index.html && echo OK
```

**Step 6: Commit**

```bash
echo "/out/" >> .gitignore
git add -A
git commit -m "chore: reset do projeto para Next 16 + Tailwind 4 em export estático"
```

---

## Task 1: Tokens, fontes e tema claro/escuro

Implementa §6.2 e §6.3. É a task que o resto do site herda — vale fazer com cuidado.

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `lib/theme-script.ts`
- Test: `tests/unit/contrast.test.ts`

**Step 1: Escrever o teste de contraste primeiro**

Este teste é o §6.2 do brief ("verificar com medidor, não no olho") virado em código. Ele trava os quatro pares acento × tema.

`tests/unit/contrast.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';

const LIGHT_PAPER = '#FAFAFA';
const DARK_PAPER = '#0E1013';

const PAIRS = [
  { name: 'asafe / claro',  fg: '#2F3A5E', bg: LIGHT_PAPER },
  { name: 'eaifez / claro', fg: '#A83C55', bg: LIGHT_PAPER },
  { name: 'asafe / escuro', fg: '#8E9AC4', bg: DARK_PAPER },
  { name: 'eaifez / escuro',fg: '#E88BA0', bg: DARK_PAPER },
];

describe('--accent-text passa AA em texto de tamanho normal', () => {
  it.each(PAIRS)('$name', ({ fg, bg }) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('texto de corpo passa AA nos dois temas', () => {
  it('ink sobre paper', () => {
    expect(contrastRatio('#14161A', LIGHT_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink-2 sobre paper', () => {
    expect(contrastRatio('#5A616B', LIGHT_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink escuro sobre paper escuro', () => {
    expect(contrastRatio('#EDEEF0', DARK_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
  it('ink-2 escuro sobre paper escuro', () => {
    expect(contrastRatio('#9AA1AC', DARK_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
});
```

**Step 2: Rodar o teste e ver falhar**

```bash
npm run test -- contrast
```

Esperado: FAIL — `Cannot find module '@/lib/contrast'`.

**Step 3: Implementar o cálculo de contraste**

`lib/contrast.ts` — fórmula de luminância relativa da WCAG 2.1:

```ts
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
```

**Step 4: Rodar e ver passar**

```bash
npm run test -- contrast
```

Esperado: PASS nos oito casos. **Se algum par falhar, o hex do brief é que está errado — ajuste o token, não o teste, e registre o novo valor aqui no plano.** É exatamente o cenário que o §6.2 antecipa.

**Step 5: Escrever os tokens**

`app/globals.css` — os valores vêm literalmente do §6.2:

```css
@import 'tailwindcss';

@theme {
  --font-display: var(--font-bricolage), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-newsreader), ui-serif, Georgia, serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;

  /* escala 1.250 — major third, corpo em 18px (§6.3) */
  --text-xs: 0.72rem;
  --text-sm: 0.9rem;
  --text-base: 1.125rem;
  --text-lg: 1.406rem;
  --text-xl: 1.758rem;
  --text-2xl: 2.197rem;
  --text-3xl: 2.746rem;
  --text-4xl: 3.433rem;
}

:root {
  --ink: #14161a;
  --ink-2: #5a616b;
  --paper: #fafafa;
  --paper-2: #f1f2f4;
  --rule: #e2e4e8;

  --accent: var(--ink);
  --accent-ink: var(--paper);
  --accent-text: var(--ink);
}

:root[data-theme='dark'] {
  --ink: #edeef0;
  --ink-2: #9aa1ac;
  --paper: #0e1013;
  --paper-2: #191c21;
  --rule: #2a2e35;
}

[data-accent='asafe'] {
  --accent: #2f3a5e;
  --accent-text: #2f3a5e;
}
[data-accent='eaifez'] {
  --accent: #c8506a;
  --accent-text: #a83c55;
}
:root[data-theme='dark'] [data-accent='asafe'] {
  --accent-text: #8e9ac4;
}
:root[data-theme='dark'] [data-accent='eaifez'] {
  --accent-text: #e88ba0;
}

html {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 18px;
}

/* §9: foco de teclado visível em todo elemento interativo, usando --accent */
:where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* medida de leitura 65–75 caracteres (§6.3) */
.prose-measure {
  max-width: 68ch;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 6: Fontes e script anti-flash no layout**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Bricolage_Grotesque, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

// Roda antes da primeira pintura: sem isso o tema escuro pisca branco no load.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${newsreader.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: tokens de cor, tipografia e tema com teste de contraste AA"
```

---

## Task 2: Mecânica do `--accent`

Implementa §6.1 — o elemento-assinatura. A base é neutra; a cor vem do projeto na tela.

**Files:**
- Create: `components/AccentZone.tsx`
- Create: `components/AccentTracker.tsx`
- Test: `tests/unit/accent.test.tsx`

**Step 1: Teste primeiro**

`tests/unit/accent.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccentZone } from '@/components/AccentZone';

describe('AccentZone', () => {
  it('marca a região com o data-accent do projeto', () => {
    render(<AccentZone accent="asafe"><p>conteúdo</p></AccentZone>);
    expect(screen.getByText('conteúdo').closest('[data-accent]'))
      .toHaveAttribute('data-accent', 'asafe');
  });

  it('sem accent, não emite o atributo — a base permanece neutra', () => {
    render(<AccentZone><p>neutro</p></AccentZone>);
    expect(screen.getByText('neutro').closest('[data-accent]')).toBeNull();
  });
});
```

**Step 2: Rodar e ver falhar**

```bash
npm run test -- accent
```

Esperado: FAIL — módulo não existe.

**Step 3: Implementar**

`components/AccentZone.tsx` — componente de servidor, sem JS no cliente:

```tsx
export type Accent = 'asafe' | 'eaifez';

export function AccentZone({
  accent,
  children,
  className,
}: {
  accent?: Accent;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div {...(accent ? { 'data-accent': accent } : {})} className={className}>
      {children}
    </div>
  );
}
```

**Step 4: Rodar e ver passar**

```bash
npm run test -- accent
```

Esperado: PASS.

> **Achado da Task 1 — leia antes de mexer nos seletores.** O `AccentTracker` abaixo põe
> `data-accent` no **`<html>`**, e o CSS do §6.2 do brief escreve os overrides de tema escuro
> com combinador descendente (`:root[data-theme='dark'] [data-accent='asafe']`). Um elemento
> não é descendente de si mesmo, então esse seletor **nunca casaria** com o `<html>`: o acento
> escuro não entraria e `--accent-text` cairia silenciosamente para o valor claro — 1.713:1
> (asafe) e 3.123:1 (eaifez) sobre papel escuro, falha dura de AA e invisível a olho nu.
> A Task 1 corrigiu duplicando o seletor na forma auto-casante
> (`:root[data-theme='dark'][data-accent='X']`). **Não remova a duplicação.** O guarda não é
> uma asserção de texto sobre o CSS: `tests/unit/contrast.test.ts` lê o `globals.css`, resolve
> a cascata modelando `data-accent` no `<html>` e segue as cadeias de `var()` até o hex, então
> ele trava o **efeito**, não a grafia do seletor — qualquer outra forma de quebrar o acento
> escuro também cai. Verificado por mutação: removendo a correção, o teste reproduz exatamente
> 1.713 e 3.123.
>
> Na mesma passada: `--accent-ink` deixou de ser `var(--paper)`. O preenchimento de acento tem
> a mesma cor nos dois temas (é a cor da marca do projeto), então o texto sobre ele não pode
> depender do tema — no escuro dava preto sobre índigo, 1.713:1.

**Step 5: A transição no scroll da home**

`components/AccentTracker.tsx` — client component. Observa as `AccentZone` visíveis e propaga o acento da que está dominando a viewport para o `<html>`, o que faz header, footer e fundo acompanharem. É o único momento orquestrado de movimento do site (§6.4).

```tsx
'use client';

import { useEffect } from 'react';

export function AccentTracker() {
  useEffect(() => {
    const zones = document.querySelectorAll<HTMLElement>('[data-accent]');
    if (zones.length === 0) return;

    const root = document.documentElement;
    const visible = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: Element | null = null;
        let bestRatio = 0.35; // limiar: abaixo disso a página volta ao neutro
        for (const [el, ratio] of visible) {
          if (ratio > bestRatio) [best, bestRatio] = [el, ratio];
        }
        const accent = best?.getAttribute('data-accent');
        if (accent) root.setAttribute('data-accent', accent);
        else root.removeAttribute('data-accent');
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );

    zones.forEach((z) => observer.observe(z));
    return () => observer.disconnect();
  }, []);

  return null;
}
```

E a transição, adicionada ao `globals.css` (curta, 200ms, e o bloco de `prefers-reduced-motion` da Task 1 já a desliga):

```css
html {
  transition: background-color 200ms ease, color 200ms ease;
}
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: mecânica de acento por projeto com transição no scroll"
```

---

## Task 3: Layout base — header, footer, toggle de tema

**Files:**
- Create: `components/Header.tsx`, `components/Footer.tsx`, `components/ThemeToggle.tsx`, `components/Container.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/unit/theme-toggle.test.tsx`

**Step 1: Teste do toggle**

Cobre o que pode quebrar de verdade: persistência e o atributo no `<html>`.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('alterna o data-theme do documento', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persiste a escolha', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('tem nome acessível', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/tema/i);
  });
});
```

**Step 2 a 4:** rodar → falhar → implementar `ThemeToggle` (client, lê `data-theme` atual no mount, escreve em `localStorage` e no `documentElement`) → rodar → passar.

**Step 5: Header e footer**

Header: nome à esquerda, nav (`Projetos` · `Sobre` · `Contato`) à direita, toggle de tema no fim. Sem logo, sem menu hambúrguer elaborado — em 360px a nav vira uma linha de links menores. Footer: e-mail, GitHub, LinkedIn, ano.

A rota `/notas` fica **prevista mas não linkada** (§11) — nada a construir aqui além de não bloquear a estrutura.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: header, footer e toggle de tema"
```

---

## Task 4: Home

Implementa §3.1 com a copy do §4.1 e §4.2. Cards de projeto ficam em placeholder até a Task 6.

**Files:**
- Create: `app/page.tsx`, `components/Hero.tsx`, `components/HowIWork.tsx`, `components/ContactBlock.tsx`, `components/TimelineCondensed.tsx`
- Create: `content/experience.ts`

**Step 1: Dado tipado da experiência**

`content/experience.ts` — §5 diz explicitamente que experiência é tabela, não MDX. O tipo é o do §4.5.

```ts
export type Experience = {
  company: string;
  role: string;
  start: string;       // ISO "2023-03"
  end: string | null;  // null = atual
  mode: string;
  parallel?: string;
  built: string;
  impact: string;
  stack: string[];
  /** liga Opah → Analytica: o fio contínuo do §4.5 */
  thread?: 'plataforma-analytica';
};
```

As cinco posições entram com o texto **literal** do §4.5. Regra do brief: site e CV contam a mesma história com as mesmas palavras — não reescreva.

**Step 2: Teste da timeline**

Dois invariantes do brief que são fáceis de quebrar sem perceber:

```ts
import { describe, expect, it } from 'vitest';
import { experience } from '@/content/experience';

describe('timeline', () => {
  it('está em ordem cronológica decrescente', () => {
    const starts = experience.map((e) => e.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('rotula as duas posições em paralelo (§4.5)', () => {
    const paralelas = experience.filter((e) => e.parallel);
    expect(paralelas.map((e) => e.company).sort()).toEqual(['Boomer', 'ez.devs']);
  });

  it('marca o fio contínuo da plataforma nas duas posições', () => {
    const fio = experience.filter((e) => e.thread === 'plataforma-analytica');
    expect(fio.map((e) => e.company).sort()).toEqual(['Analytica Ensino', 'Opah IT']);
  });

  it('não expõe número de usuários da Boomer', () => {
    const boomer = experience.find((e) => e.company === 'Boomer')!;
    expect(`${boomer.built} ${boomer.impact}`).not.toMatch(/\d[\d.,]*\s*(usuários|mil)/i);
  });
});
```

**Step 3 a 4:** rodar → falhar → preencher `experience.ts` → rodar → passar.

**Step 5: Hero**

Copy verbatim do §4.1. `h1` em `--font-display`, peso alto, tracking negativo. O número (400 mil) fica no subhead, sem contador animado (§6.4: "sem número contando").

**Sem foto no hero** — §6.5 é explícito: o hero pertence à tese.

**Step 6: "Como eu trabalho"**

Três blocos do §4.2, sem ícone. O link do `PLANNING.md` do Asafe fica como `{{ URL do PLANNING.md }}` até a curadoria dos documentos ser feita (§12).

**⟶ PEDIR AO LUIZ:** a URL do `PLANNING.md` no repo do Asafe, depois da curadoria do §4.2.1.

Guardrail: **nenhuma seção sobre IA** (§4.2.1). Se em algum momento aparecer uma, é regressão.

**Step 7: Timeline condensada + bloco de contato**

Cinco linhas, `--font-mono` nas datas, link "ver detalhe" para `/projetos`. Contato com os dois caminhos do §3.4.

**Step 8: Teste E2E da home**

```ts
import { expect, test } from '@playwright/test';

test('a home é autossuficiente (§2)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /projetos/i }).first()).toBeVisible();
  await expect(page.getByText(/400 mil/i)).toBeVisible();
});

test('não existe seção de IA (§4.2.1)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /^ia$|intelig[êe]ncia artificial/i })).toHaveCount(0);
});
```

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: home com hero, como eu trabalho, timeline condensada e contato"
```

---

## Task 5: Modelo de conteúdo MDX e template de case

**Files:**
- Create: `lib/projects.ts`, `app/projetos/[slug]/page.tsx`, `components/mdx-components.tsx`
- Create: `content/projects/asafe.mdx` (só o frontmatter e cabeçalhos por enquanto)
- Test: `tests/unit/projects.test.ts`

**Step 1: Teste do carregador**

```ts
import { describe, expect, it } from 'vitest';
import { getAllProjects, getProject } from '@/lib/projects';

describe('carregador de projetos', () => {
  it('lê os projetos do diretório de conteúdo', async () => {
    const all = await getAllProjects();
    expect(all.map((p) => p.slug)).toContain('asafe');
  });

  it('ordena pelo campo order — o Asafe abre a seção (§4.6)', async () => {
    const all = await getAllProjects();
    expect(all[0].slug).toBe('asafe');
  });

  it('rejeita frontmatter incompleto', async () => {
    await expect(getProject('nao-existe')).rejects.toThrow();
  });

  it('valida que o accent é hex de 6 dígitos', async () => {
    const p = await getProject('asafe');
    expect(p.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
```

**Step 2 a 4:** rodar → falhar → implementar → passar.

`lib/projects.ts` lê `content/projects/*.mdx` com `fs` + `gray-matter`, valida os campos obrigatórios do §5 e lança erro com o nome do arquivo quando faltar campo. Validação explícita é o que faz "adicionar projeto = criar um arquivo" ser seguro: o build quebra na hora, não no site publicado.

**Step 5: Template do case**

`app/projetos/[slug]/page.tsx` com `generateStaticParams` (obrigatório em export estático). Estrutura fixa do §3.3:

- capa na cor do projeto, nome, uma linha
- `[abrir o app]` e `[código no GitHub]` (o segundo só se `repoUrl` existir — o "E aí, fez?" é privado)
- corpo MDX renderizado dentro de `<AccentZone accent={slug}>`
- galeria de prints no fim

`components/mdx-components.tsx` mapeia os elementos para os tokens: `h2` em display, parágrafo em `--font-body` com `.prose-measure`, `code` inline em mono. A seção **Decisões** ganha estilo próprio — é o ativo principal do site (§2), então tem peso visual acima das outras.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: pipeline MDX e template de case"
```

---

## Task 6: Os dois cases escritos

**Files:**
- Create: `content/projects/asafe.mdx`, `content/projects/eaifez.mdx`
- Create: `public/projects/asafe/*.webp`, `public/projects/eaifez/*.webp`

**Ordem é conteúdo, não detalhe:** Asafe `order: 1`, "E aí, fez?" `order: 2` (§4.6).

**Step 1: Frontmatter dos dois**

Conforme §5 e a tabela do §4.6. URLs e acentos já estão resolvidos:

```yaml
# asafe.mdx
slug: asafe
name: Asafe
kind: own
status: live
liveUrl: https://asafe.mus.br
repoUrl: https://github.com/FreitasAssis/Asafe
accent: '#2F3A5E'
accentDark: '#8E9AC4'
order: 1
```

```yaml
# eaifez.mdx
slug: eaifez
name: E aí, fez?
kind: own
status: live
liveUrl: https://eaifez.com.br
repoUrl: null        # privado
accent: '#C8506A'
accentDark: '#E88BA0'
order: 2
```

**Step 2: Escrever os corpos**

Fonte de verdade são as landings dos dois apps (§4.6). Vou lê-las com WebFetch antes de escrever — o que não estiver publicado vai para *Estado / o que vem depois*, não para *O que é*.

Seção **Decisões**: 3 a 5 itens, cada um no formato *"escolhi X em vez de Y, porque Z"*. As decisões a cobrir já estão listadas no §4.6 e não são negociáveis:

- **Asafe** — os dois eixos de busca; AGPL-3.0 em vez de MIT; consentimento e licença (não cessão) das cifras da comunidade; snapshot litúrgico congelado; RLS no Supabase. Usar o termo técnico **perícope** aqui (§4.6, nota de escrita).
- **E aí, fez?** — a "unidade" como competidora (1..N membros); Cloudflare Pages em vez de Vercel pela cláusula não-comercial do Hobby; check-in na honra; separação privado × de mostrar como arquitetura de privacidade; zero IA no MVP.

**Step 3: Prints**

**⟶ PEDIR AO LUIZ:** os 8 arquivos (capa + 3 por projeto), conforme a spec do §4.7 — 390–430pt em 2x/3x, WebP, sem moldura de celular, dados reais mas de demonstração, tema consistente por projeto, nada de login/splash/estado vazio. Passo eu a lista tela a tela na hora.

Enquanto não chegam: componente `<ShotPlaceholder>` que renderiza um bloco na cor de acento, na proporção real, com o texto do que falta ("capa — repertório montado por momento"). Feio de propósito, para não passar despercebido.

**Step 4: Teste de que os `alt` são reais**

O §9 pede `alt` descritivo, e é a regressão mais fácil de cometer:

```ts
it('todo print tem alt descritivo, não "print"', async () => {
  const projects = await getAllProjects();
  for (const p of projects) {
    for (const shot of p.shots) {
      expect(shot.alt.length).toBeGreaterThan(20);
      expect(shot.alt).not.toMatch(/^(print|screenshot|imagem)$/i);
    }
  }
});
```

Isso implica `shots` no frontmatter ser objeto `{ src, alt }`, não string — ajustar o tipo do §5 na Task 5.

**Step 5: Commit**

```bash
git add -A && git commit -m "content: cases do Asafe e do E aí, fez?"
```

---

## Task 7: /projetos

**Files:**
- Create: `app/projetos/page.tsx`, `components/ProjectCard.tsx`, `components/Timeline.tsx`

**Step 1: Duas seções explicitamente rotuladas**

§3.2: "Projetos próprios" e "Experiência profissional", nunca misturadas. Cada card grande, na cor do projeto, com link pro app e pro case.

**Step 2: Timeline com conteúdo**

Cada posição com `built`, `impact`, `stack` (§4.5). Dois elementos de interface que o brief marca como obrigatórios:

- **Etiqueta `em paralelo`** nas posições Boomer e ez.devs. Sem ela, parece erro de data.
- **Marcador do fio contínuo** ligando Opah IT → Analytica Ensino. O brief é direto: se a timeline mostrar as duas como blocos sem relação, o melhor argumento do currículo desaparece.

**Step 3: E2E**

```ts
test('as duas seções são distinguíveis (§3.2)', async ({ page }) => {
  await page.goto('/projetos');
  await expect(page.getByRole('heading', { name: /projetos próprios/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /experiência profissional/i })).toBeVisible();
});

test('a sobreposição está rotulada, não escondida (§4.5)', async ({ page }) => {
  await page.goto('/projetos');
  await expect(page.getByText(/em paralelo/i)).toHaveCount(2);
});
```

**Step 4: Commit**

---

## Task 8: /sobre, /contato e CV

**Files:**
- Create: `app/sobre/page.tsx`, `app/contato/page.tsx`
- Create: `public/cv/luiz-freitas-2026-07.pdf`, `public/retrato.webp`

**Step 1: /sobre**

Texto do §4.3, verbatim nos três primeiros parágrafos.

**O quarto parágrafo (o que ele procura hoje) não pode ser gerado** — o brief é explícito. Se estiver vazio no momento do build, **omito o parágrafo**; a página funciona sem ele.

**⟶ PEDIR AO LUIZ:** as 2–3 frases finais do /sobre. É a única pendência de texto do site.

As três camadas de tecnologia (§4.4) entram aqui: camada 1 em destaque, camada 2 num parágrafo menor com a frase de honestidade, camada 3 não existe. **Sem ícone colorido em nenhuma** — texto e tipografia.

**Step 2: Retrato**

**⟶ PEDIR AO LUIZ:** a foto do §6.5 — com o instrumento ou em Natal, luz natural, não headshot corporativo. Vai no /sobre e em versão pequena no contato, nunca no hero.

**Step 3: /contato**

Dois caminhos lado a lado, mesma dignidade visual (§3.4). Sem formulário. E-mail em texto copiável, GitHub, LinkedIn, botão de baixar CV.

**⟶ PERGUNTAR AO LUIZ:** expõe WhatsApp ou não (§12). Se sim, `wa.me` com mensagem pré-preenchida no caminho "tenho um projeto"; se não, o caminho fica com e-mail só e nada quebra.

**Step 4: CV**

**⟶ PEDIR AO LUIZ:** o PDF já gerado (§12 diz que existe). Vai para `public/cv/` com a data no nome. Sem foto de documento, sem data de nascimento, sem RG (§4.3).

**Step 5: Teste de que o CV existe e é alcançável**

```ts
test('o CV está publicado e linkado', async ({ page }) => {
  await page.goto('/contato');
  const link = page.getByRole('link', { name: /baixar cv|currículo/i });
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  expect((await page.request.get(href!)).status()).toBe(200);
});
```

**Step 6: Commit**

---

## Task 9: SEO e metadados

Implementa §8. O ganho maior aqui é barato: o site antigo tem o mesmo `title` e a mesma `description` nas quatro páginas.

**Files:**
- Modify: todas as `page.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`, `components/JsonLd.tsx`

**Step 1: Teste do build estático**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ROUTES = ['index', 'projetos/index', 'sobre/index', 'contato/index'];

describe('metadados por rota (§8)', () => {
  const titles = ROUTES.map((r) => {
    const html = readFileSync(`out/${r}.html`, 'utf8');
    return html.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  });

  it('nenhuma rota fica sem title', () => {
    expect(titles.every((t) => t.length > 0)).toBe(true);
  });

  it('nenhum title se repete — o bug do site antigo', () => {
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('nenhuma description se repete', () => {
    const descs = ROUTES.map((r) => {
      const html = readFileSync(`out/${r}.html`, 'utf8');
      return html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
    });
    expect(new Set(descs).size).toBe(descs.length);
  });
});
```

Roda depois de `npm run build`, então entra num arquivo `tests/build/` com script separado.

**Step 2:** `generateMetadata` por rota, no padrão do §8. Descriptions escritas à mão e factuais — a atual sai inteira.

**Step 3:** `sitemap.ts`, `robots.ts`, canonical em toda página, JSON-LD `Person` na home com `sameAs` de GitHub e LinkedIn e `address` em Natal/RN.

**Step 4:** Strings isoladas num dicionário (`content/strings.ts`) para o inglês depois ficar barato (§11).

**Step 5: Commit**

---

## Task 10: OG images

Separada da Task 9 porque é a única parte do plano com risco técnico real.

**Step 1: Spike — `ImageResponse` funciona sob `output: 'export'`?**

```bash
# criar app/opengraph-image.tsx mínimo com ImageResponse, depois:
npm run build && ls out/opengraph-image*
```

- **Se gerar o arquivo:** seguir com `opengraph-image.tsx` por rota e `generateImageMetadata` para os cases.
- **Se não gerar:** fallback é um script de prebuild (`scripts/og.ts`) que usa a mesma `ImageResponse` fora do Next, escreve PNGs em `public/og/` e as rotas apontam para eles via `metadata.openGraph.images`. Mesmo resultado visual, mesma fonte de verdade, sem depender do comportamento do export.

Registrar aqui no plano qual dos dois caminhos venceu.

**Step 2:** Desenho da OG: nome do projeto + tagline sobre a cor do projeto (§8). Nada além disso — é imagem de 1200×630 vista em miniatura no LinkedIn, que é por onde o site circula.

**Step 3: Verificação**

```bash
# toda rota tem og:image
grep -L 'og:image' out/index.html out/sobre/index.html out/contato/index.html out/projetos/index.html
# esperado: nenhuma saída
```

**Step 4: Commit**

---

## Task 11: Piso de qualidade

Implementa §9. Nada disso aparece no site — só é feito.

**Step 1: Suite Playwright do piso**

```ts
test('responsivo até 360px sem scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of ['/', '/projetos', '/sobre', '/contato', '/projetos/asafe']) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `overflow em ${route}`).toBe(false);
  }
});

test('foco de teclado é visível', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement!;
    return getComputedStyle(el).outlineStyle;
  });
  expect(outline).not.toBe('none');
});

test('modo escuro respeita a preferência do sistema', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
```

**Step 2: Lighthouse ≥ 95 em performance e acessibilidade**

```bash
npx serve out -p 4173 &
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility \
  --chrome-flags="--headless" --output=json --output-path=/tmp/lh.json
```

Rodar nas cinco rotas. **Reportar os números reais**, não afirmar que passou.

**Step 3: Passada manual de acessibilidade**

Navegação inteira só com teclado, `prefers-reduced-motion` ligado, e conferência de que cada acento injetado mantém AA — o teste da Task 1 cobre os tokens, mas a composição real é o que vale.

**Step 4: Commit**

---

## Task 12: Deploy

**Step 1: Redirects**

`public/_redirects` — Cloudflare Pages lê na raiz do output:

```
/about          /sobre      301
/projects       /projetos   301
/testimonials   /           301
```

Um dos dois caminhos, não os dois — como estamos em `output: 'export'`, `next.config` redirects não é opção. Só o `_redirects`.

**Step 2: Verificar que o arquivo sobrevive ao build**

```bash
npm run build && cat out/_redirects
```

**Step 3: Merge para a main**

Quando tudo acima estiver verde e você tiver aprovado o site rodando local:

```bash
npm run verify        # typecheck + lint + unit + build
npm run test:e2e
git checkout main && git merge rebuild
```

**Step 4: Cloudflare Pages**

Projeto novo apontando para o repo, build command `npm run build`, output `out`. Domínio `luizfreitas.com.br` movido da Vercel para a Cloudflare (mudança de nameserver ou de registro A/CNAME — decidir na hora, olhando onde o DNS está hoje).

**Step 5: Verificação pós-deploy**

```bash
curl -sI https://luizfreitas.com.br/projects     | grep -iE 'HTTP/|location'
# esperado: HTTP/2 301 + location: /projetos
curl -sI https://luizfreitas.com.br/about        | grep -iE 'HTTP/|location'
curl -sI https://luizfreitas.com.br/testimonials | grep -iE 'HTTP/|location'
```

**⟶ PEDIR AO LUIZ (§12):** antes de publicar, abrir `asafe.mus.br` em aba anônima e colar o link num WhatsApp para conferir o preview. O card do portfólio aponta pra lá.

---

## Fora do escopo, confirmado

Nada disso entra (§11): blog (rota `/notas` fica prevista no roteamento, sem página), versão em inglês (strings já isoladas), analytics de qualquer tipo, formulário de contato, animação elaborada, seção de serviços com preço. E, do §1: **nenhuma prova social de terceiro** — a página de depoimentos morre sem substituto.
