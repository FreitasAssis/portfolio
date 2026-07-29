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
| 9 | SEO e metadados por rota | ⬜ próxima |
| 10 | OG images (começa por spike de viabilidade) | ⬜ |
| 11 | Piso de qualidade — a11y, 360px, Lighthouse | ⬜ |
| 12 | Deploy na Cloudflare + redirects 301 | ⬜ |

Gates ao fim da sessão: `npm run verify` exit 0 · unit **201 passed | 0 todo** · e2e **49 passed**.

---

## Pendente e sem resolução

### 1. `components/HowIWork.tsx` está com edição não commitada

O Luiz reescreveu dois blocos do §4.2; eu reescrevi por cima num meio-termo, mostrei, e ele
não chegou a aprovar antes de pararmos. O arquivo está no disco, fora do git.

O que mudou e por quê: ele havia acrescentado *"IA inclusive, **mas sob a minha supervisão em
todas as etapas**"*, que é literalmente a frase que o §4.2.1 argumenta contra (infalsificável,
e risco assimétrico). E havia trocado *"Entregar é melhor que planejar pra sempre"* por
*"Planejo bem todos os detalhes"*, que inverte o sentido e não sustenta mais o título do bloco.
O meio-termo mantém o que ele quis dizer sem a cláusula defensiva.

**Isso trava** um ajuste de ritmo vertical (`py-16` → `py-20` no mesmo arquivo) que subiria o
espaçamento global acima de 144px.

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
| CV em PDF para `public/cv/` | ✅ `luiz-freitas-2026-07.pdf` |
| Últimas frases do `/sobre` | ⬜ **não gerar** (§4.3); o parágrafo está omitido |
| WhatsApp no `/contato` | ⬜ indeciso |

**Retrato (§6.5).** O buraco está no `/sobre` (`max-w-[16rem]`) e, pequeno, no
`/contato` (`max-w-[10rem]`), nos dois casos em `4:5` — proporção que é premissa
de `components/Portrait.tsx`, não do brief. Quando a foto chegar: salvar em
`public/sobre/retrato.webp` com dimensões declaradas (§9), trocar o
`AssetPlaceholder` por `next/image` com `alt` descritivo, e mexer só nesse
arquivo — as duas chamadas passam por ele. Um `<Portrait size="inline" />` no
`ContactBlock` põe a foto também na home, se o Luiz quiser essa leitura de
"bloco de contato".

**WhatsApp (§12).** Uma edição: `WHATSAPP` em `content/contact.ts` deixa de ser
`null` e vira `{ href: 'https://wa.me/55…', label: 'WhatsApp', external: true }`.
O caminho "Tenho um projeto" já espalha o valor. O teste que trava a pendência
falha junto, de propósito.

**Último parágrafo do `/sobre` (§4.3).** `ABOUT_SEEKING` em `content/about.ts`
segue `null`, e a página **omite** o parágrafo, como o brief manda — sem
placeholder na tela, ao contrário do retrato. A assimetria é deliberada e está
explicada em `app/sobre/page.tsx`. Quando ele mandar as frases, é uma edição lá;
o teste "os três parágrafos do §4.3, verbatim — e nada além" vai falhar, e falhar
é o pedágio que prova que o texto veio dele e não de geração.

**CV.** `public/cv/luiz-freitas-2026-07.pdf`, cópia byte a byte do
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

**Curadoria pendente (§4.2.1):** a home linka `github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md`.
O documento hoje diz "Leia antes de contribuir" — está escrito para contribuidor, não para
recrutador. Lê bem e não bloqueia, mas virou peça de vitrine.
