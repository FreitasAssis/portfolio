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
| 10 | OG images (começa por spike de viabilidade) | ⬜ próxima |
| 11 | Piso de qualidade — a11y, 360px, Lighthouse | ⬜ |
| 12 | Deploy na Cloudflare + redirects 301 | ⬜ |

Gates ao fim da sessão: `npm run verify` exit 0 · unit **238 passed | 0 todo** · e2e **68 passed**.

**O que a Task 10 tem que preencher.** A estrutura de OG está pronta e falta só a imagem.
O ponto de entrada é **um**: o parâmetro `image` de `pageMetadata` em `lib/seo.ts`. As seis
rotas já emitem `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale` e
`twitter:card`. Nenhuma `page.tsx` precisa mudar se o caminho vencedor for
`opengraph-image.tsx` por rota (o Next preenche sozinho); se o caminho for o pré-build em
`public/og/`, cada chamada passa o caminho e o case tira o dele do frontmatter. Há teste em
`tests/unit/site.test.ts` que **falha quando a imagem entrar** — é o lembrete de atualizá-lo.

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

### 6. Contraste de `--accent-ink` em texto pequeno

`#FAFAFA` sobre `#C8506A` mede **4.18:1** — passa AA Large, reprova AA normal. Afeta o botão
"Abrir o E aí, fez?" na home e o CTA primário do case. A correção é no token para os dois
mudarem juntos; pertence à Task 11.

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
11. **Contagem de anos escrita à mão** ("nove anos"). O §2 proíbe e o §4.1 explica: o número
    envelhece sozinho e vira mentira sem ninguém perceber — não quebra build, não some da
    tela, não gera relato. Estava em **três** lugares ao mesmo tempo (h1 da home, description
    do `/projetos`, resumo do CV), porque é a forma natural de dizer a coisa em português e
    quem escreve copy volta a escrevê-la. Ancore sempre no ano de início. Travado em
    `tests/unit/manutencao.test.ts` (texto curado + o CV em HTML) e em `tests/e2e/seo.spec.ts`
    (varredura do `out/` inteiro, que é o único lugar que pega uma string escrita dentro de
    um componente).

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
| Retrato do Luiz | ⬜ §6.5 — 4:5, com instrumento ou em Natal, não headshot |
| CV em PDF para `public/cv/` | ✅ `luiz-freitas-2026-07.pdf`, regerado pelo Luiz com o "desde 2017" |
| Últimas frases do `/sobre` | ✅ §4.3 tem cinco parágrafos, os dois últimos escritos pelo Luiz |
| WhatsApp no `/contato` | ✅ resolvido — a pendência saiu do §12 e o andaime saiu do código |

**Retrato (§6.5).** O buraco está no `/sobre` (`max-w-[16rem]`) e, pequeno, no
`/contato` (`max-w-[10rem]`), nos dois casos em `4:5` — proporção que é premissa
de `components/Portrait.tsx`, não do brief. Quando a foto chegar: salvar em
`public/sobre/retrato.webp` com dimensões declaradas (§9), trocar o
`AssetPlaceholder` por `next/image` com `alt` descritivo, e mexer só nesse
arquivo — as duas chamadas passam por ele. Um `<Portrait size="inline" />` no
`ContactBlock` põe a foto também na home, se o Luiz quiser essa leitura de
"bloco de contato".

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
