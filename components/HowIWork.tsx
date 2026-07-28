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
    body: 'Todo projeto meu começa por um documento de decisões — o que vai ser construído, o que fica de fora, e por quê. O código vem depois, e pra chegar lá uso as ferramentas mais rápidas disponíveis, IA inclusive. O desenho e as escolhas são meus, estão escritos, e você pode ler:',
    /* §0: onde o dado ainda não existe, o placeholder fica visível e ninguém
       inventa a URL. Aqui há dois motivos para ele:
       - o §4.2.1 exige curar os documentos do repo do Asafe ANTES de linká-los
         ("no momento em que o PLANNING.md vira link do portfólio, ele deixa de
         ser nota interna e passa a ser peça de vitrine");
       - e o arquivo com esse nome não existe no repo. O que existe é
         docs/DESIGN.md, docs/identidade-visual.md, docs/DIREITOS-AUTORAIS.md,
         docs/REVISAO.md e os docs de slice em docs/plans/.
       Por isso o rótulo do §4.2 ("PLANNING.md do Asafe") não vai à tela como
       afirmação: nomear um arquivo inexistente seria pior que a lacuna. Quem
       resolver a pendência escolhe o documento e o nome de uma vez. */
    pending: '{{ URL do documento de decisões do Asafe }}',
  },
  {
    title: 'Escopo é uma decisão, não um acidente.',
    body: 'Sei o que fica de fora da primeira versão e por quê. Entregar é melhor que planejar pra sempre.',
    pending: null,
  },
  {
    title: 'Faço com cuidado o que envolve outras pessoas.',
    body: 'Direito autoral, privacidade, consentimento. Software mexe com gente; isso não é detalhe de rodapé.',
    pending: null,
  },
] as const;

export function HowIWork() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Como eu trabalho</h2>

      <div className="mt-8 space-y-9">
        {BLOCKS.map(({ title, body, pending }) => (
          <div key={title}>
            <h3 className="font-medium text-ink">{title}</h3>
            <p className="prose-measure mt-2 text-ink-2">{body}</p>
            {pending ? (
              <p className="mt-3 border border-dashed border-rule px-3 py-2 font-mono text-xs text-ink-2">
                {pending}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}
