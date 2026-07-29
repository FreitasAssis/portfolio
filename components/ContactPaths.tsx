import { CONTACT_PATHS, type ContactLink } from '@/content/contact';

/**
 * A bifurcação do §3.4: **dois caminhos lado a lado, com a mesma dignidade
 * visual** — "Tenho uma vaga" e "Tenho um projeto".
 *
 * A igualdade não é promessa de comentário, é estrutura: os dois caminhos saem
 * do mesmo `map` sobre `CONTACT_PATHS`, então não existe lugar onde um pudesse
 * ganhar uma classe que o outro não tem. Mesma caixa, mesmo nível de título,
 * mesma tipografia, mesma coluna do grid. É a única bifurcação do site, e ela
 * existe porque os dois públicos do §1 convergem em tudo menos no fim da
 * jornada; hierarquizar um sobre o outro desfaria o motivo de ela existir.
 *
 * **Sem formulário** (§3.4 e §11): "formulário some no spam e não dá
 * confirmação; `mailto:` e link direto convertem melhor e não precisam de
 * backend". E o site é um export estático (§7) — um formulário exigiria um
 * backend que o §7 dispensa.
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

export function ContactPaths({
  /** `h3` sob o "Contato" da home; `h2` na página `/contato`, sob o `h1`. */
  as: Heading = 'h3',
}: {
  readonly as?: 'h2' | 'h3';
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {CONTACT_PATHS.map((path) => (
        <div key={path.id} className="border border-rule p-6">
          <Heading className="font-medium text-ink">{path.title}</Heading>
          <p className="mt-2 text-sm text-ink-2">{path.blurb}</p>
          <ul className="mt-5 space-y-2 font-mono text-xs">
            {path.links.map((link) => (
              <LinkItem key={link.href} link={link} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
