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

---

## Publicando

Cloudflare Workers com static assets, conectado a este repositório. Não é Cloudflare Pages: a
Cloudflare vem unificando os dois, e o fluxo atual do painel cria um Worker.

| campo | valor |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Nenhuma variável de ambiente: não há chave, banco nem serviço externo.

O que publicar vem do `wrangler.jsonc`, não do painel. É um Worker **só de assets** — sem
`main`, nenhum código roda por requisição; ele existe para servir o `out/`. As duas opções que
não são default valem uma linha cada: `html_handling` porque o export escreve `sobre.html` e
não `sobre/index.html`, e `not_found_handling` porque sem ele um caminho inexistente devolve
resposta vazia em vez da 404 gerada no build.

Para exercitar tudo isso localmente, com a mesma semântica de assets da produção:

```bash
npm run build && npx wrangler dev --port 8788
```

Dois arquivos em `public/` governam a hospedagem e chegam à raiz do output:

- **`_redirects`** — os 301 das rotas do site anterior. `redirects()` do `next.config` não
  roda sob `output: 'export'`, e não avisa: é este arquivo ou nada.
- **`_headers`** — o `Content-Type` das OG images, que o export escreve sem extensão, e o
  `Cache-Control: immutable` dos assets com hash.

`tests/e2e/deploy.spec.ts` confere que ambos sobrevivem ao build, que todo redirect é 301 e que
todo destino existe de fato como página.

### Depois do primeiro deploy

```bash
curl -sI https://<host>/projects            | grep -iE 'HTTP/|location'   # 301 → /projetos
curl -sI https://<host>/projetos/asafe/opengraph-image | grep -i content-type   # image/png
```

As duas regras foram verificadas contra o `wrangler dev` antes do primeiro deploy: os três 301
respondem com o `Location` certo, e as OG images saem como `image/png` — sem isso o cartão de
link quebra, que é o custo mais caro e mais invisível de errar aqui.
