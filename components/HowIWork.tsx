import { Container } from '@/components/Container';

/** Os dois documentos de decisão que o repo público do Asafe de fato versiona —
 *  link para arquivo que dá 404 faz o contrário do que este bloco se propõe. */
const ASAFE_DOCS = 'https://github.com/FreitasAssis/Asafe/blob/main/docs';

const BLOCKS = [
  {
    title: 'Decido com justificativa.',
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
