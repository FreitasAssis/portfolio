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
| 6a | Escrever os dois cases | ⬜ próxima |
| 6b | Semear Asafe local, grupo demo no eaifez, capturar 8 prints | ⬜ |
| 7 | `/projetos` — cards + timeline | ⬜ |
| 8 | `/sobre`, `/contato`, CV | ⬜ |
| 9 | SEO e metadados por rota | ⬜ |
| 10 | OG images (começa por spike de viabilidade) | ⬜ |
| 11 | Piso de qualidade — a11y, 360px, Lighthouse | ⬜ |
| 12 | Deploy na Cloudflare + redirects 301 | ⬜ |

Gates ao fim da sessão: `npm run verify` exit 0 · unit **138 passed | 4 todo** · e2e **21 passed**.

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

### 4. Contraste de `--accent-ink` em texto pequeno

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

## A Task 7 herda quatro `it.todo` por nome

Em `tests/unit/home.test.tsx`, movidos da home quando ela foi condensada para cinco linhas:

- `/projetos` rotula "em paralelo" toda posição sobreposta (§4.5)
- `/projetos` marca o fio contínuo **sinalizando** o `impact`, sem frase nova (§4.5)
- `/projetos` distingue sobreposição de fio contínuo sem depender de cor (§4.5, §9)
- `/projetos` mostra `built`, `impact` e `stack` por posição (§3.2, §4.5)

O terceiro existe porque o Luiz olhou a home e **confundiu o marcador do fio com a
sobreposição**. As duas ideias são opostas (continuidade × simultaneidade) e vão conviver no
mesmo bloco da Opah IT. Se usarem linguagem visual parecida, os dois melhores argumentos da
timeline se anulam.

---

## Assets

| Item | Estado |
|---|---|
| Lockup e ícone do E aí, fez? | ✅ `eaifez/public/brand/{lockup,icon}.svg` |
| Ícone do Asafe | ✅ `asafe/apps/web/app/icon.svg` |
| 8 prints | ⬜ Task 6b |
| Retrato do Luiz | ⬜ §6.5 — com instrumento ou em Natal, não headshot |
| CV em PDF para `public/cv/` | ⬜ Task 8 (existe em `docs/private/`) |
| Últimas frases do `/sobre` | ⬜ **não gerar** (§4.3); se vazio, omitir o parágrafo |
| WhatsApp no `/contato` | ⬜ indeciso |

**Banco local do Asafe** (docker, `supabase_*_asafe`, porta 54321): tem 18 músicas, 68
perícopes, 23 dias litúrgicos, 6 repertórios, 20 fontes autorizadas. Mas `song_pericope`,
`group`, `membership` e `moderation_event` estão **zerados** — e `song_pericope` vazio bloqueia
o print nº 1, porque é o vínculo que faz a Liturgia do dia sugerir músicas. Antes de semear,
**ler o código da tela** para confirmar de onde vem a sugestão.

**Curadoria pendente (§4.2.1):** a home linka `github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md`.
O documento hoje diz "Leia antes de contribuir" — está escrito para contribuidor, não para
recrutador. Lê bem e não bloqueia, mas virou peça de vitrine.
