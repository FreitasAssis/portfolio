# luizfreitas.com.br

Meu portfólio: dois produtos que construí por conta própria, com o raciocínio por trás de cada
decisão técnica, e a trajetória profissional. No ar em [luizfreitas.com.br](https://luizfreitas.com.br).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · conteúdo em MDX.

---

## As decisões que não são óbvias no código

**Export estático puro, sem adaptador.** `output: 'export'`. Nenhuma rota precisa de runtime —
não há banco, backend nem CMS —, então o site é HTML servido de CDN. Consequência que morde:
`redirects()` do `next.config` **não funciona** sob export estático, e não avisa. Os 301 das
rotas antigas vivem em `public/_redirects`, que a Cloudflare lê na raiz do output.

**A base é neutra; a cor vem do projeto.** O site não tem cor de acento própria: cada projeto
injeta a sua via `data-accent`, e um `IntersectionObserver` propaga para o `<html>` a cor de
quem está dominando a viewport. As marcas fortes aqui são as dos apps, não a do portfólio.
`components/AccentTracker.tsx` — o limiar é cobertura de viewport, não `intersectionRatio`, e o
comentário lá explica por quê.

**Projeto novo é um arquivo.** Um `.mdx` em `content/projects/` com o frontmatter completo, e
mais nada. O carregador (`lib/projects.ts`) valida campo a campo e **quebra o build** citando
arquivo e campo quando algo falta — inclusive as dimensões declaradas de cada imagem, que um
teste confere contra o cabeçalho do `.webp`. A única exceção é cor nova, que precisa do bloco
correspondente em `app/globals.css`.

**A seção de decisões de cada case é dado estruturado**, não prosa: `{ chose, insteadOf,
because }`, de três a cinco itens. Em texto livre, a primeira parte a morrer é o *"em vez de"* —
que é justamente o que separa uma decisão de uma adoção.

---

## Ausências deliberadas

Sem analytics, sem formulário de contato, sem banco de dados, sem versão em inglês. Não são
pendências: o site existe para ser encontrável e alcançável, e cada uma dessas coisas foi
avaliada e descartada. Há teste garantindo que não voltem sem querer.

---

## Rodando

```bash
npm install
npm run dev          # http://localhost:3000
```

## Verificando

```bash
npm run verify       # typecheck + lint + 264 testes + build
npm run test:e2e     # 81 testes de ponta a ponta, contra o export estático
```

Os testes de ponta a ponta rodam contra o `out/`, que é o artefato que vai ao ar — e não contra
o servidor de desenvolvimento. O que só existe lá é layout de verdade: a cobertura de viewport
que dispara o acento, a ausência de rolagem horizontal em 360px e a medida de leitura são
medidas em pixel, e o jsdom não faz layout.
