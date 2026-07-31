# Retomada — onde paramos

Última sessão: **2026-07-28**. Branch: `rebuild` (nunca pushada). Merge para `main` só no fim.

Plano completo: [2026-07-28-portfolio-rebuild.md](./2026-07-28-portfolio-rebuild.md).
Contrato: `docs/private/PORTFOLIO-BRIEF.md` (fora do git — repo é público).

---

## Regras do repo que valem sempre

- **Commits sem trailer de co-autor.** Nada de `Co-Authored-By:`, "Generated with", ou menção
  a ferramenta. Mensagem descritiva, em português.
- **O repo é público** (`github.com/FreitasAssis/portfolio`). `docs/private/` é ignorado e
  guarda o brief e o material-fonte. `docs/cv/luiz-freitas.html` é versionado por ser a
  fonte do CV — verificado como livre de RG, CPF, data de nascimento, endereço e telefone.
- **Texto curado e texto inventado não convivem sem rótulo.** Todo texto sobre experiência
  profissional vem do §4.5 verbatim; há teste que remonta a seção inteira a partir do dado e
  falha se alguém escrever prosa de carreira à mão. A regra nasceu de um erro real: uma frase
  inventada achatou "três projetos em três times" a "a plataforma".

---

## Estado das tasks

| # | Task | Estado |
|---|---|---|
| 0 | Reset para Next 16 / React 19 / Tailwind 4, export estático | ✅ |
| 1 | Tokens, fontes, tema + teste de contraste AA | ✅ |
| 2 | Mecânica do `--accent` + anel de foco legível | ✅ |
| 3 | Layout base: header, footer, container, toggle | ✅ |
| 4 | Home + correção da medida de leitura | ✅ |
| 5 | Pipeline MDX e template de case | ✅ |
| 6a | Escrever os dois cases | ✅ |
| 6b | Semear Asafe local, grupo demo no eaifez, capturar 8 prints | ✅ |
| 7 | `/projetos` — cards + timeline | ✅ |
| 8 | `/sobre`, `/contato`, CV | ✅ |
| 9 | SEO e metadados por rota | ✅ |
| 10 | OG images (começa por spike de viabilidade) | ✅ |
| 11 | Piso de qualidade — a11y, 360px, Lighthouse | ✅ |
| 12 | Deploy na Cloudflare + redirects 301 | ⬜ próxima |

Gates ao fim da sessão: `npm run verify` exit 0 · unit **275 passed | 0 todo** · e2e **126 passed**.

**Fim do conteúdo (fora da tabela de tasks).** O pedido era um "voltar ao topo".
O botão flutuante está descartado pelo §6.4 (movimento novo, componente de
cliente, flutuando sobre o conteúdo justamente onde 360px é mais apertado). O que
entrou é um bloco **estático**: régua na coluna de leitura, tipografia mono e uma
âncora `#topo` apontando para o `id` do `<header>` — nunca `href="#"`, que rola
igual mas deixa o ponto de partida do Tab no rodapé.

A forma mora em **`components/EndNav.tsx`** e é a mesma em quatro rotas;
`components/CaseEndNav.tsx` é um chamador dela que acrescenta o link do próximo
case, derivado do `order` (§4.6) em `nextProject`. Um idioma, não quatro — há
teste comparando o `outerHTML` das duas âncoras.

**Está na home, na `/projetos`, no `/sobre` e nos dois cases. Não está no
`/contato`.** A primeira versão ficou só nos cases alegando que as outras são
curtas, e a medida por trás disso era de **desktop**. Medido no `out/` em
**360×740**, que é o piso do §9: home **5.272px (7,1 telas)**, `/projetos`
**6.750px (9,1)**, `/sobre` **2.969px (4,0)**, `/contato` **990px (1,3)**. Os
números de desktop (4,4 / 4,9 / 2,1) subestimavam pela metade. Como a solução é
uma âncora estática, não havia custo a racionar — e o Android não tem o gesto de
tocar a barra de status que o iOS oferece. O `/contato` fica fora porque o §3.4 o
encolheu a um título, uma linha e quatro links: 1,3 telas.

**Por que não no rodapé**, que resolveria as três de uma vez: ele apareceria no
`/contato`, apareceria **duas vezes** num case, e é `contentinfo` — chrome igual
em toda rota. No fim do `<main>` o link lê como o fim do que se estava lendo.
A exclusão do `/contato` tem teste nos dois níveis (`tests/unit/contato.test.tsx`
conta os links da página; `tests/e2e/contato.spec.ts` conta os do `<main>` e mede
a altura), justamente para que ninguém a "simplifique" movendo o bloco para o
rodapé.

**Como a Task 10 terminou.** O spike respondeu que **o Next gera sim as OG images em build
time** sob `output: 'export'` — desde que a rota declare `export const dynamic = 'force-static'`,
a mesma trava do item 8 das armadilhas. São cinco arquivos `opengraph-image.tsx` (quatro rotas
fixas + `[slug]`, que precisa do próprio `generateStaticParams`), o card mora em `lib/og.tsx` e
o texto das quatro rotas fixas em `OG_CARDS`, em `content/site.ts`. Nenhuma `page.tsx` mudou:
o Next injeta `og:image` sozinho.

Duas consequências que valem lembrar:

- **O parâmetro `image` de `pageMetadata` saiu.** Com a imagem vindo do arquivo ao lado da
  página, um segundo caminho até o mesmo metadado só serviria para publicar duas `og:image`
  na mesma rota. O teste de `tests/unit/site.test.ts` agora trava a ausência.
- **O export escreve os cards sem extensão** (`out/sobre/opengraph-image`), e hospedagem
  estática deduz o `Content-Type` do nome — sem regra, o card sai como
  `application/octet-stream` e o crawler recusa. Quem fecha isso é `public/_headers`, que o
  servidor estático dos testes passou a ler para exercitar o mesmo mapeamento do deploy.
  O `generateImageMetadata`, que poria `.png` na URL, é incompatível com segmento dinâmico
  sob `output: 'export'`; o porquê está em `lib/og.tsx`.

**Como a Task 11 terminou.** O piso virou varredura: `tests/e2e/piso.spec.ts` roda as **seis
rotas × dois temas** para 360px, foco de teclado e axe — 38 testes onde antes havia um teste
de 360px por rota, quase sempre só no claro. Rota nova entra na lista e ganha as três medidas
sem que ninguém precise lembrar de copiar teste.

O axe entrou como `@axe-core/playwright` (devDependency). É o mesmo motor da categoria de
acessibilidade do Lighthouse, e rodando aqui ele diz **qual regra** quebrou em vez de "97" —
sem prender o repo a um Lighthouse de CI. Conferido que ele falha de verdade: reverter o
`--accent` para `#C8506A` reprova as seis combinações afetadas nomeando o elemento.

**Números do Lighthouse, no `out/` servido por HTTP, mediana de três execuções:**

| rota | perf (h2) | perf (http/1.1) | a11y |
|---|---|---|---|
| `/` | 98 | 94 | 100 |
| `/projetos` | 97 | 93 | 100 |
| `/projetos/asafe` | 97 | 94 | 100 |
| `/projetos/eaifez` | 98 | 95 | 100 |
| `/sobre` | 98 | 95 | 100 |
| `/contato` | 98 | 95 | 100 |

**As duas colunas medem o mesmo `out/`; o que muda é o protocolo do servidor.** O
`tests/e2e/static-server.mjs` fala HTTP/1.1, e com ~35 requisições isso custa contenção de
conexão que hospedagem nenhuma cobra: são ~700ms de LCP e quatro pontos. Servido por HTTP/2 —
que é o que Cloudflare Pages faz — o mesmo build dá 97–98. O servidor do teste não virou HTTP/2
porque isso pediria TLS, e chave privada não entra em repo público; ele **passou a comprimir**,
que era a distorção grande (650KB de JS viram ~200KB, e sem isso as notas ficavam em 77–81).

Três mudanças reais de performance saíram daí, todas medidas:

- **`components/Link.tsx`** — um `next/link` com `prefetch={false}`. O padrão busca o payload de
  toda rota cujo link esteja na viewport, e o cabeçalho está sempre na viewport: a home e a
  `/projetos` baixavam os dois cases, que são os documentos mais pesados. 3180ms → 2280ms de
  LCP. O hover e o touchstart continuam prefetchando. `tests/unit/manutencao.test.ts` recusa um
  `next/link` cru fora do wrapper.
- **A home não passa mais `priority` ao primeiro card.** O comentário dizia que o print era o
  LCP; o Lighthouse diz que o LCP é a **h1**, e o print nasce em 1023px (412×823) e 1103px
  (360×640) — sempre abaixo da dobra. O preload disputava banda com as fontes de que a h1
  precisa. Na `/projetos` o print está em 449px e é mesmo o LCP: lá o `priority` ficou.
- **`fetchPriority="low"` nos prints sem `priority`.** `loading="lazy"` não segura: a margem do
  lazy-loading do Chrome é maior que a distância até eles, e eles são buscados no primeiro
  instante mesmo abaixo da dobra.

E `public/_headers` ganhou `Cache-Control: immutable` para `/_next/static/*`, que é o caso
exato para que `immutable` existe — o hash do conteúdo já está no nome do arquivo.

O resto do §9 foi **verificado, não presumido**, e estava certo: o anel de foco alcança os 22
elementos interativos da home e os 9–14 das outras cinco rotas, nos dois temas e nas duas
larguras; `prefers-reduced-motion` zera a transição de acento (0.2s → 1e-05s, medido no
`<html>`, que é onde ela mora); os nove `alt` descrevem a decisão que o print ilustra; os oito
prints são `.webp` por `next/image` com `width`/`height` declarados. A única correção de tema
escuro foi `color-scheme`, que faltava — sem ele a barra de rolagem abria clara no escuro.

---

## Pendente e sem resolução

### 1. `components/HowIWork.tsx` — resolvido

A edição não commitada do §4.2 virou decisão do Luiz: **a versão do código vence** no segundo
bloco (*"Sei o que fica de fora da primeira versão e por quê. Cada etapa é bem planejada, assim
como as entregas."*), e é o brief que será atualizado — **não reverter** para o "Entregar é
melhor que planejar pra sempre" do §4.2. O que a cláusula defensiva sobre IA teria custado está
explicado no §4.2.1 e não voltou.

No primeiro bloco saiu um *"e de que forma"* que tinha sido acrescentado na escrita: o §4.2 diz
*"o que fica de fora, **e por quê**"*, e o item extra troca justificativa por execução no bloco
que se chama "decido com justificativa". Há teste travando a frase.

Continua livre o ajuste de ritmo vertical (`py-16` → `py-20`) que esperava por isso.

### 2. Material dos cases — Asafe completo, eaifez com duas lacunas inferíveis

Tudo em `docs/private/decisoes-cases.md`, na voz do Luiz, verbatim.

**Asafe: 5 de 5.** Nada falta. Dois detalhes não podem se perder na escrita: o exemplo
`Lc 15,11-32` vs `Lc 15,1-3.11-32` (por que interseção de intervalos e não igualdade de
string) e o bug corrigido no ranqueador. São o que prova modelagem de domínio de verdade.
Uma frase a confirmar antes de publicar: *"nenhum concorrente cataloga por conteúdo de
leitura"* — comparação com concorrente é verificável e envelhece.

**E aí, fez?: 2 de 5 enviadas, 2 inferíveis do brief** (Cloudflare em vez de Vercel; zero IA
no MVP) e 1 substancialmente coberta (check-in na honra, dentro da decisão de modo). Dá para
escrever sem voltar a perguntar, mas a justificativa do "zero IA" na voz dele seria mais
forte — é o caso raro em que **não** usar IA foi a decisão, o que serve ao §4.2.1 melhor do
que qualquer declaração sobre uso.

### 3. Ressalva com prazo na captura do "E aí, fez?"

A autorização para criar grupo fictício em **produção** vale porque o app ainda não tinha sido
usado por nenhum grupo real — o lançamento com amigos estava marcado para o fim de semana de
2026-08-01. **Se a Task 6b acontecer depois disso, a premissa mudou: perguntar de novo.**
A limpeza do que for criado é parte da tarefa.

### 4. A stack do "E aí, fez?" diverge do CV

`content/projects/eaifez.mdx` diz **Cloudflare Workers**; `docs/cv/luiz-freitas.html` diz
**Cloudflare Pages**. O §4.5 manda site e CV usarem as mesmas palavras, e o card do
`/projetos` e da home agora mostram a lista do frontmatter — a divergência ficou visível.
O case foi escrito com "Workers" a partir do material do Luiz (é lá que roda o cron horário),
então o candidato a corrigir é o CV. **Decisão do Luiz.** A do Asafe está resolvida: as duas
pontas dizem `Next.js, Expo, TypeScript, Supabase, Drizzle ORM, Cloudflare Workers`, e há
teste travando (o exemplo do §5 do brief é ilustração de schema, não a lista de verdade).

### 5. A camada 1 do §4.4 divergia do CV — resolvido a favor do CV

O §4.4 punha `React Native / Expo` na **camada 2**; o `docs/cv/luiz-freitas.html`
põe em **"Uso hoje"**. O §4.5 manda os dois contarem a mesma história com as
mesmas palavras, então uma ponta tinha que ceder. Cedeu o §4.4: a stack da
Analytica em `content/experience.ts` (posição atual) tem React Native e o
frontmatter do Asafe tem Expo — o dado do próprio site já dizia "uso hoje", e o
`/projetos` mostra os dois a poucos blocos de distância. A ordem dos termos da
camada 1 no `/sobre` é agora a do CV, letra por letra. Justificativa completa em
`content/tech.ts`; teste em `tests/unit/sobre.test.tsx`.

Não foram importados `MySQL`, `Nuxt` e `Sidekiq`, que existem no CV e não no
§4.4: encurtar uma lista não conta história errada; mover um item de camada, sim.

### 6. Contraste de `--accent-ink` em texto pequeno — resolvido na Task 11

O `--accent` do "E aí, fez?" deixou de ser o `#C8506A` da marca e passou a ser **`#A83C55`**,
que é a variante escurecida que a paleta já declarava em `--accent-text`. O par com
`#FAFAFA` sai de 4.18:1 para **5.84:1**.

O que decidiu foi a medida, não o gosto: os três botões que usam o par (`Abrir o app` na home,
na `/projetos` e no case) computam **16.2px de peso normal** no browser — `text-sm` × os 18px
da raiz. A WCAG só afrouxa para 3:1 a partir de 24px (ou 18.7px em negrito), então o piso ali
é 4.5:1 e o hex da marca reprovava. O 16.2px agora sai do próprio CSS num teste, em vez de
viver num comentário.

**O card de OG acompanhou sozinho, e não por acaso.** `tests/unit/projects.test.ts` já
exigia que o `accent` do frontmatter fosse igual ao `--accent` do CSS, e `lib/og.tsx` enche o
card a partir do frontmatter — as duas superfícies não têm como divergir sem quebrar teste.
Mudar o token obrigou a mudar o `.mdx`, e o card seguiu. Não havia decisão a tomar; havia uma
trava a respeitar.

**O §6.2 do brief ficou desatualizado** (ele lista `--accent: #C8506A`), como o §4.2 no item 1:
é o brief que se atualiza. O aviso do próprio §6.2 — "meça os quatro pares antes de fechar" —
foi o que apontou para cá.

---

## O que as mensagens de erro deixaram de citar

`lib/projects.ts` e os buracos de imagem citavam seções do brief (`§5`, `§4.7`, `§9`) dentro
de strings que o build cospe e a página mostra — e o brief está **fora do git**. As mensagens
agora dizem a substância ou apontam para dentro do repo: o tipo `Project`, a constante
`SECOES`, `app/globals.css`, `components/AccentZone.tsx`, `tests/unit/projects.test.ts`. O que
não cabia numa mensagem ficou aqui.

- **Spec de captura (§4.7).** O buraco do print diz `390–430pt · 2x/3x · WebP`, que é o que
  quem vai capturar precisa na hora. O resto da regra não cabe na caixa: **todo print ilustra
  uma decisão do texto** (imagem que não sustenta decisão é decoração e sai); **capa + 3 por
  projeto**, porque além disso ninguém olha e o quinto print é sempre o mais fraco — é ele que
  puxa a percepção do conjunto para baixo (esse porquê está na mensagem do build, que é onde
  ele morde); **sem moldura de celular**, que envelheceu mal e encolhe justamente o conteúdo;
  **dados reais, nunca lorem**; tema consistente dentro de cada projeto (o Asafe é escuro nos
  quatro); **nunca** capturar login, splash ou estado vazio; nome real de pessoa, paróquia ou
  grupo trocado por dado de demonstração, o mesmo conjunto fictício em todas as telas.
- **Ordem dos cases (§4.6).** `order: 1` no Asafe não é arbitrário e a mensagem de `order`
  duplicado não tem como explicar: o Asafe é o case com mais intenção do Luiz e o único que
  costura com o `/sobre` — a mesma pessoa em duas páginas —, e esse fio só funciona com ele
  em primeiro. O "E aí, fez?" em segundo não é diminuído: para leitor técnico é o case que
  mais impressiona. Travado em `tests/unit/projects.test.ts`, `tests/unit/projetos.test.tsx`
  e `tests/unit/home.test.tsx`.
- **Retrato pequeno (§6.5).** A caixa do `/contato` tem 180px, e num recorte 4:5 o rosto
  cairia para uns 50px de altura. Por isso as duas escalas usam recortes **diferentes do
  mesmo frame**: 4:5 no `/sobre`, quadrado no `/contato`. É uma foto só, e a justificativa
  inteira está em `components/Portrait.tsx`.

---

## Armadilhas já encontradas — não reintroduzir

1. **Seletor de acento duplicado** em `globals.css`. `AccentTracker` põe `data-accent` no
   `<html>`, e `:root[data-theme='dark'] [data-accent='X']` tem combinador descendente —
   um elemento não é descendente de si mesmo. Sem a forma auto-casante, o acento escuro
   nunca dispara e o texto cai para 1.71:1. Há teste que resolve a cascata de verdade.
2. **`@theme inline`** para os tokens de cor. Sem `inline`, a substituição acontece no `:root`
   e o valor resolvido é herdado — a injeção de acento morreria silenciosamente.
3. **Variant `dark:` customizado** lendo `data-theme`. O padrão do Tailwind lê
   `prefers-color-scheme` e discordaria do toggle manual.
4. **`MIN_COVERAGE = 0.35`** no `AccentTracker` é cobertura de viewport, não `intersectionRatio`
   (ratio nunca dispararia numa página de case alta). Zonas de acento **lado a lado** dentro de
   `wide` nunca atingem o limiar num monitor comum — por isso os cards da home são empilhados.
5. **Sobreposições da timeline** são derivadas de `start`/`end` com intervalos **semiabertos**,
   para que uma troca de emprego não conte como trabalho em paralelo.
6. **Medida de leitura**: os testes medem `1ch` na fonte real e têm **piso**, não só teto.
   A coluna já esteve em 56.5ch achando que estava em 68.
7. **MDX come `{`** — placeholders `{{ }}` precisam estar entre crases.
8. **`export const dynamic = 'force-static'` em `app/sitemap.ts` e `app/robots.ts`.** Sem a
   linha o `next build` **falha** sob `output: 'export'` ("not configured on route
   '/robots.txt'"): o Next trata rota de metadado como handler, e handler sem essa declaração
   não vira arquivo. Vale para qualquer rota de metadado que nascer depois — inclusive
   `opengraph-image.tsx`, na Task 10.
9. **`metadataBase` é obrigatório no export.** Não existe requisição de onde inferir o host,
   então sem `new URL(SITE_URL)` em `app/layout.tsx` o Next resolve canonical e OG contra
   `http://localhost:3000` e o site publica links para a máquina de quem buildou. Há teste
   em `tests/e2e/seo.spec.ts` procurando `localhost:3000` no `out/`.
10. **O canonical da home não tem barra final.** O Next normaliza (`trailingSlash` é falso) e
    emite `https://luizfreitas.com.br`. O `sitemap.ts` foi alinhado a isso de propósito — um
    `<loc>` com `/` no fim apontaria para a URL que o próprio site declara não-canônica.
11. **Prosa do frontmatter usa `|-`, nunca `>-`.** Os campos `because` (decisões) e `why`
    (stack) são compilados como MDX. O escalar dobrado (`>-`) transforma linha em branco em
    UM `\n`, que markdown lê como quebra leve dentro do MESMO parágrafo — o campo volta a
    ser um bloco único de texto, que é exatamente o que a compilação em MDX veio desfazer.
    E o `because` da decisão dos dois eixos do Asafe tem 171 palavras: é o texto mais
    importante do site e o que mais convida a desistir no meio. `lib/projects.ts` recusa
    bloco (`##`, lista, tabela) no campo, mas **não** tem como recusar `>-`.
12. **Contagem de anos escrita à mão** ("nove anos"). O §2 proíbe e o §4.1 explica: o número
    envelhece sozinho e vira mentira sem ninguém perceber — não quebra build, não some da
    tela, não gera relato. Estava em **três** lugares ao mesmo tempo (h1 da home, description
    do `/projetos`, resumo do CV), porque é a forma natural de dizer a coisa em português e
    quem escreve copy volta a escrevê-la. Ancore sempre no ano de início. Travado em
    `tests/unit/manutencao.test.ts` (texto curado + o CV em HTML) e em `tests/e2e/seo.spec.ts`
    (varredura do `out/` inteiro, que é o único lugar que pega uma string escrita dentro de
    um componente).
13. **Não citar número de usuários da Boomer** no `impact` de `content/experience.ts`. A base
    era pequena e o número enfraquece justamente onde o escopo fortalece: a força daquela
    posição é ter internalizado um app que estava com fornecedor terceirizado e a integração
    com o Nota Potiguar, sistema de governo estadual. É a única posição em que o §4.5 pede
    escopo sem métrica. Travado em `tests/unit/experience.test.ts`.
14. **O anel de foco é desenhado FORA da caixa** (`outline-offset: 3px`), então o fundo que
    importa é o do elemento **pai**, não o preenchimento do próprio elemento. Medir contra o
    próprio elemento acusa 1.00:1 nos botões `bg-accent` — um falso positivo convincente, que
    parece exatamente o defeito da armadilha 1. `tests/e2e/piso.spec.ts` sobe um nível antes de
    medir, e diz por quê.
15. **Tema claro é a AUSÊNCIA de `data-theme`**, não `data-theme="light"`. O script anti-flash
    do `app/layout.tsx` só escreve quando o resultado é escuro. Um teste que espere
    `toHaveAttribute('data-theme', 'light')` reprova nas seis rotas de uma vez.
16. **`test.use({ reducedMotion })` não tipa** na versão do Playwright do repo. Quem funciona é
    `page.emulateMedia({ reducedMotion: 'reduce' })`, antes do `goto`.
17. **`Git` na stack do IFRN não contradiz o `LAYER_3_NEVER` de `content/tech.ts`.** Stack de
    posição é registro do que foi usado, e o §4.5 lista assim. A regra do §4.4 que manda não
    listar Git ("é como um chef listar 'sei usar faca'") é sobre a vitrine de tecnologias do
    `/sobre`, que é outra seção. Tirar `Git` do IFRN para "resolver" a contradição não quebra
    teste nenhum — o de `LAYER_3_NEVER` só varre o DOM do `/sobre`.

---

## Os quatro `it.todo` da Task 7 viraram teste

Estão em `tests/unit/projetos.test.tsx`, com o mesmo nome. Não sobrou `it.todo` no repo.

As duas marcas da timeline do `/projetos` divergem em quatro eixos, nenhum deles cor (§9) nem
movimento (§6.4) — a decisão inteira está documentada em `components/Timeline.tsx`:

| | sobreposição (`em paralelo`) | fio contínuo |
|---|---|---|
| forma | caixa fechada nos quatro lados | régua aberta, só à esquerda |
| eixo | horizontal, uma linha | vertical, ao lado de um parágrafo |
| lugar | no cabeçalho, junto das datas | no corpo, colado ao `impact` |
| direção | nenhuma — ela se fecha | seta para a outra ponta (`↓` em cima, `↑` embaixo) |

O fio **sinaliza** o `impact` curado do §4.5 e não escreve frase nenhuma sobre a carreira: o
teste que remonta a seção inteira a partir de `content/experience.ts` agora vale para o
`/projetos`, e a lista completa das palavras inventadas na seção cabe em três (`em paralelo`,
`fio contínuo`, o separador ` · `).

**São três posições rotuladas `em paralelo`, não duas** — a Boomer corre junto da ez.devs e,
logo em seguida, da Opah IT. O trecho da Task 7 no plano dizia duas; o dado manda.

---

## Assets

| Item | Estado |
|---|---|
| Lockup e ícone do E aí, fez? | ✅ `eaifez/public/brand/{lockup,icon}.svg` |
| Ícone do Asafe | ✅ `asafe/apps/web/app/icon.svg` |
| 8 prints | ✅ Task 6b |
| Retrato do Luiz | ✅ `public/retrato/{4x5,1x1}.webp` — dois recortes do mesmo frame |
| CV em PDF para `public/cv/` | ✅ `luiz-freitas-2026-07.pdf`, regerado pelo Luiz com o "desde 2017" |
| Últimas frases do `/sobre` | ✅ §4.3 tem cinco parágrafos, os dois últimos escritos pelo Luiz |
| WhatsApp no `/contato` | ✅ resolvido — a pendência saiu do §12 e o andaime saiu do código |

**Retrato (§6.5) — o último asset, e o que a resolução obrigou a decidir.** A foto é um
frame de vídeo: o recorte maior tem **490px de largura** e não existe nem existirá original
melhor. A raiz do site é 18px (`app/globals.css`), então os `max-w-[16rem]` do buraco antigo
eram **288px**, não 256 — e 288 × 2 pede 576px de uma fonte de 490. O `/sobre` já ampliava em
toda tela retina. A caixa desceu para `max-w-[13.5rem]` = **243px**, cujo 2× são 486px: cabe
nos 490 do arquivo.

A regra que saiu daí vale para os dois: **cada arquivo tem exatamente 2× a caixa em que é
desenhado** — 490 para os 243px do `/sobre`, 360 para os 180px do `/contato`. O recorte de
490 no `/contato` custava 5KB e, medido, 80ms de LCP, o bastante para derrubar a rota de 95
para 94: lá a foto **é** o elemento de LCP, e por isso é a única do site com `priority`. No
`/sobre` o LCP é um parágrafo, e a foto fica `lazy` com `fetchPriority="low"`, como os prints.

Um `<Portrait size="inline" />` no `ContactBlock` põe a foto também na home, se o Luiz quiser
essa leitura de "bloco de contato" — mas aí a home passa a ter três imagens, e há teste
contando duas.

**WhatsApp (§12) — resolvido, e o andaime saiu.** A pendência "decidir se expõe
WhatsApp" **não está mais no §12**, e o caminho "Tenho um projeto", que era o
único lugar onde o número entraria, foi removido pelo §3.4. Então `WHATSAPP` e o
teste que travava o `null` saíram de `content/contact.ts` e de
`tests/unit/contato.test.tsx`: constante nula guardando decisão que ninguém está
tomando é andaime que envelhece parecendo trabalho pendente (§2). A proteção que
importava continua, na home e no `/contato` — a varredura do DOM por `wa.me`,
`tel:` e a palavra "WhatsApp". Se um dia o número entrar, é link novo em
`CONTACT_LINKS` e os dois testes falham.

**Últimos parágrafos do `/sobre` (§4.3) — escritos.** São **cinco** agora, os
dois últimos verbatim do brief, e `ABOUT_SEEKING` deixou de existir. O tipo em
`content/about.ts` é tupla de cinco: um sexto elemento não compila. A trava do
"não gerar" virou trava de "não reescrever", que é o que o §12 pede ao declarar
o texto do site terminado. **O último parágrafo tem calibragem anotada no §4.3**
("porta encostada, não trancada nem escancarada") e há teste que falha se alguém
o esquentar ("disponível para", "aberto a propostas") ou esfriar ("não pretendo
sair").

**CV — as duas pontas voltaram a bater.** `docs/cv/luiz-freitas.html` deixou de
dizer *"Desenvolvedor full stack há nove anos"* e passou a dizer *"desde 2017"*
(§2 proíbe contagem à mão; §4.5 manda site e CV usarem as mesmas palavras). O
`wkhtmltopdf` **não está instalado na máquina de build**, então o PDF não é
regerado por quem mexe no repo — quem regerou foi o Luiz, na mesma sessão, e o
binário em `public/cv/` já carrega o texto novo. `tests/unit/manutencao.test.ts`
trava o HTML; o PDF não tem teste de conteúdo, então **editar o HTML continua
sendo meia edição**. O comando, para a próxima vez:

```bash
wkhtmltopdf --page-size A4 docs/cv/luiz-freitas.html public/cv/luiz-freitas-AAAA-MM.pdf
```

Se a data mudar, muda também o nome do arquivo e a constante `CV` em
`content/contact.ts` (há teste conferindo que o nome carrega a data e que o
arquivo existe no disco).

**CV (verificação de privacidade, feita sobre o PDF de julho/2026).**
`public/cv/luiz-freitas-2026-07.pdf`, cópia byte a byte do
`docs/private/CV-Luiz-Freitas.pdf` (sha256 conferido). Verificado antes de
publicar, extraindo o texto renderizado do PDF: uma página, `/XObject` vazio —
nenhuma imagem embutida, portanto nenhuma foto de documento —, zero glifos não
mapeados na extração (ou seja, o texto lido é o texto todo), nenhum CPF, RG,
telefone, endereço ou data de nascimento, e os três únicos links são
`luizfreitas.com.br`, o LinkedIn e o GitHub. O nome do arquivo carrega a data
(§7); reemitir significa trocar o arquivo **com a data nova** e atualizar `CV`
em `content/contact.ts`.

**Banco local do Asafe** (docker, `supabase_*_asafe`, porta 54321): tem 18 músicas, 68
perícopes, 23 dias litúrgicos, 6 repertórios, 20 fontes autorizadas. Mas `song_pericope`,
`group`, `membership` e `moderation_event` estão **zerados** — e `song_pericope` vazio bloqueia
o print nº 1, porque é o vínculo que faz a Liturgia do dia sugerir músicas. Antes de semear,
**ler o código da tela** para confirmar de onde vem a sugestão.

**Curadoria pendente (§4.2.1):** a home e o case do Asafe linkam **dois** documentos —
`docs/DESIGN.md` e `docs/identidade-visual.md`, que são os que o repo público de fato
versiona (o §4.2.1 nomeia `PLANNING.md`, `IDENTIDADE-VISUAL.md` e `REVISAO.md`; nenhum
existe). O `DESIGN.md` hoje diz "Leia antes de contribuir" — está escrito para contribuidor,
não para recrutador. Lê bem e não bloqueia, mas virou peça de vitrine, e agora a mesma
ressalva vale para o segundo arquivo.
