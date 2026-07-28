import { Container } from '@/components/Container';

const EMAIL = 'luiz_dev@outlook.com';

/**
 * A bifurcação do §3.4, na home, porque a home é autossuficiente (§2): quem
 * leu só ela já sabe como falar com o Luiz.
 *
 * Os dois caminhos têm a **mesma dignidade visual** — mesmo nível de título,
 * mesma caixa, mesma tipografia. É a única bifurcação do site, e ela existe
 * porque os dois públicos do §1 convergem em tudo menos no fim da jornada;
 * hierarquizar um sobre o outro desfaria o motivo de ela existir.
 *
 * Sem formulário (§3.4 e §11): "formulário some no spam e não dá confirmação;
 * mailto: e link direto convertem melhor e não precisam de backend". E o site é
 * estático — um formulário exigiria backend que o §7 dispensa.
 *
 * Sem WhatsApp: o §12 ainda lista "decidir se expõe WhatsApp" como pendência do
 * Luiz. Expor número de telefone é irreversível; enquanto a decisão for dele,
 * não é do build.
 */
export function ContactBlock() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Contato</h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="border border-rule p-6">
          <h3 className="font-medium text-ink">Tenho uma vaga</h3>
          <p className="mt-2 text-sm text-ink-2">
            Remoto, a partir de Natal (RN). CLT ou PJ. O currículo conta a mesma coisa que este
            site, em uma página.
          </p>
          <ul className="mt-5 space-y-2 font-mono text-xs">
            <li>
              <a href={`mailto:${EMAIL}`} className="text-accent-text underline underline-offset-4">
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/luiz-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text underline underline-offset-4"
              >
                linkedin.com/in/luiz-dev
              </a>
            </li>
            {/* §0: o PDF é gerado numa etapa posterior. Placeholder visível em vez
                de um link para um arquivo que ainda não está no repo — link
                quebrado no bloco de contato é pior que a ausência dele. */}
            <li className="text-ink-2">{'{{ CV em PDF }}'}</li>
          </ul>
        </div>

        <div className="border border-rule p-6">
          <h3 className="font-medium text-ink">Tenho um projeto</h3>
          <p className="mt-2 text-sm text-ink-2">
            Me escreva contando o que você quer construir. Respondo com o que dá pra fazer, em que
            ordem, e o que eu deixaria de fora da primeira versão.
          </p>
          <ul className="mt-5 space-y-2 font-mono text-xs">
            <li>
              <a href={`mailto:${EMAIL}`} className="text-accent-text underline underline-offset-4">
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href="https://github.com/FreitasAssis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text underline underline-offset-4"
              >
                github.com/FreitasAssis
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
