import { ContactLinks } from '@/components/ContactLinks';
import { Container } from '@/components/Container';

/**
 * O bloco de contato **na home**, porque a home é autossuficiente (§2): quem leu
 * só ela já sabe como falar com o Luiz.
 *
 * Os canais moram em `ContactLinks`, compartilhado com a página `/contato`. Até
 * a Task 8 os valores estavam escritos à mão aqui, e a página nova teria feito
 * deles uma terceira cópia (a segunda é o `Footer`). Endereço de contato copiado
 * é a forma mais silenciosa de publicar um endereço velho.
 *
 * O §3.1 continua listando um bloco de contato na home; o **conteúdo** dele
 * segue o §3.4, que tirou os dois caminhos. Então aqui está a mesma lista da
 * página, sem prosa: a única frase que existia era a que classificava o
 * visitante, e ela saiu com a bifurcação. O que a home não repete da `/contato`
 * é o retrato (§6.5) — ali isto é fecho, não a página, o mesmo motivo pelo qual
 * a trajetória da home é condensada e a inteira vive no `/projetos`.
 */
export function ContactBlock() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Contato</h2>
      <div className="mt-8">
        <ContactLinks />
      </div>
    </Container>
  );
}
