import { CONTACT_LINKS, type ContactLink } from '@/content/contact';

/**
 * Os canais do §3.4, em lista: **e-mail em texto copiável, LinkedIn, GitHub e o
 * CV em PDF**. Nada mais.
 *
 * Este arquivo substituiu o `ContactPaths`, que desenhava a bifurcação "Tenho
 * uma vaga" / "Tenho um projeto". O §3.4 tirou os dois caminhos porque eles
 * "pressupunham venda ativa", e o §1 tornou isso regra de propósito: a
 * finalidade do site não é converter, é ser alcançável. Uma lista não pergunta
 * nada a quem chegou — e era a pergunta, não as caixas, que fazia do contato um
 * funil.
 *
 * **Sem formulário** (§3.4 e §11): "some no spam, não dá confirmação, e precisa
 * de backend; `mailto:` e link direto resolvem melhor". E o site é um export
 * estático (§7), que não tem onde receber um POST.
 *
 * **E-mail em texto copiável, sem botão de copiar.** O §3.4 pede que o endereço
 * seja *texto*, e a alternativa foi pesada de verdade: um botão de copiar exige
 * um componente cliente, estado de "copiado!", uma região `aria-live` para
 * anunciar sucesso (§9) e um caminho de erro quando a Clipboard API não está
 * disponível — tudo isso para substituir um gesto que o sistema operacional já
 * oferece em cima de um link `mailto:` (segurar no celular, botão direito no
 * desktop). O endereço por extenso funciona com JS desligado, é selecionável,
 * clicável, e não inventa superfície. O `Footer` já tinha tomado essa decisão
 * ("um link escrito 'e-mail' não se copia"); manter a mesma leitura mantém o
 * site coerente.
 */
function LinkItem({ link }: { readonly link: ContactLink }) {
  const external = link.external
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <li>
      <a
        href={link.href}
        className="text-accent-text underline underline-offset-4"
        // `download` só vale para o mesmo domínio, que é o caso do CV em
        // /public — o navegador salva em vez de abrir no leitor embutido, e o
        // arquivo chega com a data no nome (§7).
        {...(link.download ? { download: true } : {})}
        {...external}
      >
        {link.label}
      </a>
    </li>
  );
}

export function ContactLinks() {
  return (
    <ul className="space-y-2 font-mono text-xs">
      {CONTACT_LINKS.map((link) => (
        <LinkItem key={link.href} link={link} />
      ))}
    </ul>
  );
}
