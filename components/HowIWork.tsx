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
const BLOCKS = [
  {
    title: 'Decido com justificativa.',
    body: 'Todo projeto meu começa por um documento de decisões — o que vai ser construído, o que fica de fora, por quê, e de que forma. O código vem depois, e pra chegar lá uso as ferramentas mais rápidas disponíveis, IA inclusive. O desenho e as escolhas são meus, estão escritos, e você pode ler:',
    /* O §4.2 escreve o rótulo como "`PLANNING.md` do Asafe", mas esse arquivo não
       existe no repo — o documento de decisões é o `docs/DESIGN.md`, que abre
       com "referência viva de arquitetura e do porquê das decisões do Asafe...
       este documento explica as razões e o que não é óbvio a partir do código".
       Ou seja: o nome do §4.2 estava errado, a alegação estava certa. O rótulo
       segue a forma do brief com o nome real.

       PENDÊNCIA DO LUIZ (§4.2.1): o documento ainda está escrito para
       contribuidor ("Leia antes de contribuir"), não para recrutador. O brief
       avisa que "no momento em que vira link do portfólio, ele deixa de ser nota
       interna e passa a ser peça de vitrine". Ele lê bem e não bloqueia o link,
       mas a curadoria continua pendente. */
    link: {
      label: 'DESIGN.md do Asafe',
      href: 'https://github.com/FreitasAssis/Asafe/blob/main/docs/DESIGN.md',
    },
  },
  {
    title: 'Escopo é uma decisão, não um acidente.',
    body: 'Sei o que fica de fora da primeira versão e por quê. Cada etapa é bem planejada, assim como as entregas.',
    link: null,
  },
  {
    title: 'Faço com cuidado o que envolve outras pessoas.',
    body: 'Direito autoral, privacidade, consentimento. Software mexe com gente; isso não é detalhe de rodapé.',
    link: null,
  },
] as const;

export function HowIWork() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Como eu trabalho</h2>

      <div className="mt-8 space-y-9">
        {BLOCKS.map(({ title, body, link }) => (
          <div key={title}>
            <h3 className="font-medium text-ink">{title}</h3>
            <p className="prose-measure mt-2 text-ink-2">{body}</p>
            {link ? (
              <p className="mt-3">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent-text underline underline-offset-4"
                >
                  {link.label} →
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}
