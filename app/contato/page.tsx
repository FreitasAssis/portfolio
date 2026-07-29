import type { Metadata } from 'next';

import { ContactLinks } from '@/components/ContactLinks';
import { Container } from '@/components/Container';
import { Portrait } from '@/components/Portrait';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.contato, path: '/contato' });

/**
 * `/contato` (§3.4): "**simples, porque o objetivo é ser alcançável, não
 * converter**: e-mail em texto copiável, LinkedIn, GitHub e o CV em PDF".
 *
 * ## O que saiu desta página, e por quê
 *
 * Ela tinha três blocos: os dois caminhos ("Tenho uma vaga" / "Tenho um
 * projeto"), uma linha pedindo que o visitante escolhesse um deles, e uma seção
 * "De qualquer forma" com os endereços para quem não se reconhecesse em nenhum.
 * O §3.4 tirou a bifurcação — "pressupunham venda ativa" — e o §1 explicou por
 * quê: a finalidade do site não é converter, e o `/contato` encolhe.
 *
 * Tirada a bifurcação, os outros dois caem sozinhos. A frase "escolha o caminho
 * que descreve você" não tem mais caminho para escolher, e "De qualquer forma"
 * só fazia sentido como escape de uma triagem: sem triagem, é a página inteira.
 * O que resta é uma lista — que é literalmente o que o §3.4 enumera.
 *
 * **Sem formulário.** §3.4 e §11 concordam: "some no spam, não dá confirmação,
 * e precisa de backend; `mailto:` e link direto resolvem melhor". Não existe
 * `<form>` aqui, e há teste que falha se nascer um.
 *
 * **O retrato está aqui, e não na home** (§6.5: "no /sobre e em versão pequena
 * no bloco de contato"). Esta página é o bloco de contato em tamanho inteiro; o
 * da home é o eco condensado dele, e é onde a economia da tese pesa mais. Se o
 * Luiz preferir a leitura contrária, é uma linha: um `<Portrait size="inline"/>`
 * dentro do `ContactBlock`.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
export default function ContatoPage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Contato</h1>
        {/* Uma linha, factual, sem urgência (§1): diz que os canais chegam, e
            não pede nada de quem está lendo. Não há CTA nesta página — ela é o
            destino, e um botão aqui só empurraria de volta para onde a pessoa
            já está.

            Havia uma segunda frase — "O currículo em PDF está na mesma lista" —
            e ela saiu: narrava o que está visível quatro linhas abaixo. Nasceu
            de uma preocupação certa (o CV vivia dentro da caixa "Tenho uma
            vaga" e corria risco de sumir com ela), mas a garantia de que o CV
            apareça é ele estar na lista, não um aviso de que está. */}
        <p className="prose-measure mt-6 text-ink">Qualquer um destes canais chega em mim.</p>
      </Container>

      <Container className="pt-10">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
          <ContactLinks />
          {/* §6.5: "em versão pequena no bloco de contato". Pequena de verdade —
              é sinal de que existe uma pessoa do outro lado, não um retrato de
              galeria. O grande vive no /sobre. */}
          <Portrait size="inline" />
        </div>
      </Container>
    </>
  );
}
