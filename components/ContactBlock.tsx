import { ContactPaths } from '@/components/ContactPaths';
import { Container } from '@/components/Container';

/**
 * A bifurcação do §3.4 **na home**, porque a home é autossuficiente (§2): quem
 * leu só ela já sabe como falar com o Luiz.
 *
 * Os dois caminhos moram em `ContactPaths`, compartilhado com a página
 * `/contato`. Até a Task 8 os valores estavam escritos à mão aqui, e a página
 * nova teria feito deles uma terceira cópia (a segunda é o `Footer`). Endereço
 * de contato copiado é a forma mais silenciosa de publicar um endereço velho.
 *
 * O que a home **não** repete da `/contato`: o retrato (§6.5) e a linha "de
 * qualquer forma". Aqui isto é um bloco de fecho, não a página — o mesmo motivo
 * pelo qual a trajetória da home é condensada e a inteira vive no `/projetos`.
 */
export function ContactBlock() {
  return (
    <Container as="section" className="py-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Contato</h2>
      <div className="mt-8">
        <ContactPaths as="h3" />
      </div>
    </Container>
  );
}
