import { Container } from '@/components/Container';

/**
 * Os três blocos do §4.2, com o texto literal do brief. Sem ícone — o §4.2 é
 * explícito, e o §4.4 já tinha matado a parede de ícones.
 *
 * §4.2.1 é a regra que este bloco existe para respeitar: **não há seção sobre
 * IA no site.** Sem selo, sem "AI-assisted", sem parágrafo defendendo o método.
 * A menção cabe numa oração subordinada do primeiro bloco, na mesma temperatura
 * de qualquer outra ferramenta da stack — e é a única que existe na página.
 * O que substitui a declaração é o link para o documento de decisões: alegação
 * vira convite de auditoria. Se alguém acrescentar uma seção de IA aqui, é
 * regressão; travado em tests/unit/home.test.tsx.
 */
/**
 * Os documentos de decisão do repo público do Asafe (§4.2.1).
 *
 * O §4.2.1 nomeia três — `PLANNING.md`, `IDENTIDADE-VISUAL.md`, `REVISAO.md` —
 * e o repo versiona dois, com outros nomes: `docs/DESIGN.md`
 * ("referência viva de arquitetura e do porquê das decisões do Asafe… este
 * documento explica as razões e o que não é óbvio a partir do código") e
 * `docs/identidade-visual.md`. O nome no brief estava errado; a alegação,
 * certa. Aqui vão **os dois que existem**, e nenhum inventado: o §4.2.1 diz que
 * o link "transforma alegação em convite de auditoria", e convite para um
 * arquivo que dá 404 faz o contrário do que se propõe.
 *
 * **Por que dois, e não só o primeiro.** O argumento do §4.2.1 é que documento
 * de decisão é "o trabalho que a IA não faz no seu lugar" e que "quem só
 * vibe-codou não tem esses arquivos". Um documento pode ser acidente; dois,
 * cobrindo eixos diferentes do mesmo projeto — arquitetura e identidade —, são
 * hábito. É por isso que eles aparecem numa frase de convite ("no repo público
 * do Asafe: X e Y") e não numa lista de botões: a lista contaria links, a frase
 * diz que existe um lugar onde o trabalho está escrito.
 *
 * PENDÊNCIA DO LUIZ (§4.2.1): o `DESIGN.md` ainda abre com "Leia antes de
 * contribuir" — está escrito para contribuidor, não para recrutador. O brief
 * avisa que "no momento em que vira link do portfólio, ele deixa de ser nota
 * interna e passa a ser peça de vitrine". Lê bem e não bloqueia o link, mas a
 * curadoria continua pendente, e agora vale para os dois arquivos.
 */
const ASAFE_DOCS = 'https://github.com/FreitasAssis/Asafe/blob/main/docs';

const BLOCKS = [
  {
    title: 'Decido com justificativa.',
    /* §4.2, verbatim: "o que vai ser construído, o que fica de fora, e por quê".
       Havia aqui um "e de que forma" acrescentado na escrita — a frase ganhava
       um terceiro item que o brief não pede e que muda a promessa: "por quê" é
       justificativa, "de que forma" é execução, e o bloco se chama "decido com
       justificativa". */
    body: 'Todo projeto meu começa por um documento de decisões — o que vai ser construído, o que fica de fora, e por quê. O código vem depois, e pra chegar lá uso as ferramentas mais rápidas disponíveis, IA inclusive. O desenho e as escolhas são meus, estão escritos, e você pode ler:',
    invite: {
      lead: 'No repo público do Asafe:',
      docs: [
        { label: 'DESIGN.md', href: `${ASAFE_DOCS}/DESIGN.md` },
        { label: 'identidade-visual.md', href: `${ASAFE_DOCS}/identidade-visual.md` },
      ],
    },
  },
  {
    /* Não reverter para "Entregar é melhor que planejar pra sempre", que é o que
       o §4.2 traz: esta versão é a decisão do Luiz, e o brief é que será
       atualizado. */
    title: 'Escopo é uma decisão, não um acidente.',
    body: 'Sei o que fica de fora da primeira versão e por quê. Cada etapa é bem planejada, assim como as entregas.',
    invite: null,
  },
  {
    title: 'Faço com cuidado o que envolve outras pessoas.',
    body: 'Direito autoral, privacidade, consentimento. Software mexe com gente; isso não é detalhe de rodapé.',
    invite: null,
  },
] as const;

export function HowIWork() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Como eu trabalho</h2>

      <div className="mt-8 space-y-9">
        {BLOCKS.map(({ title, body, invite }) => (
          <div key={title}>
            <h3 className="font-medium text-ink">{title}</h3>
            <p className="prose-measure mt-2 text-ink-2">{body}</p>
            {invite ? (
              // Uma frase, não uma fileira de botões: o §4.2.1 quer um convite
              // de auditoria, e "no repo público do Asafe: X e Y" diz onde o
              // trabalho está escrito. A seta fecha a frase inteira, e não cada
              // link, para que os dois documentos leiam como um lugar só.
              <p className="mt-3 font-mono text-xs text-ink-2">
                {invite.lead}{' '}
                {invite.docs.map((doc, i) => (
                  <span key={doc.href}>
                    {i > 0 ? ' e ' : ''}
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-text underline underline-offset-4"
                    >
                      {doc.label}
                    </a>
                  </span>
                ))}{' '}
                →
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}
