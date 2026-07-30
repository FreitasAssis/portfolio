import type { Metadata } from 'next';

import { Container } from '@/components/Container';
import { EndNav } from '@/components/EndNav';
import { Portrait } from '@/components/Portrait';
import { TechLayers } from '@/components/TechLayers';
import { ABOUT_PARAGRAPHS, EDUCATION } from '@/content/about';
import { META } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ meta: META.sobre, path: '/sobre' });

/**
 * `/sobre` (§3.4): **curto. Pessoa primeiro, tecnologia depois**, na voz do
 * parágrafo real que já existia no site antigo (§4.3).
 *
 * A ordem da página é essa frase, literalmente: os cinco parágrafos do §4.3, o
 * retrato, e só então a tecnologia. A formação fecha, "em algum canto" como o
 * §4.3 permite — é a última pergunta do recrutador e a primeira que ninguém
 * quer ler antes do resto.
 *
 * ## Os dois últimos parágrafos
 *
 * Eram três aqui, e a página omitia o final porque o §4.3 mandava **não gerar**
 * o que o Luiz ainda não tinha escrito. Ele escreveu; o §12 fechou com "todo o
 * texto do site está escrito". Não sobrou ramo condicional: os cinco parágrafos
 * saem do mesmo `map`, e a única forma de a página ter um número diferente é
 * alguém editar a tupla em `content/about.ts` — que não compila com seis.
 *
 * O último tem calibragem própria, explicada em `content/about.ts`: porta
 * encostada, nem trancada nem escancarada. Não o esquente nem o esfrie.
 *
 * O `<main>` é do layout — uma landmark por documento.
 */
export default function SobrePage() {
  return (
    <>
      <Container className="pt-14">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sobre</h1>
      </Container>

      {/* Esta seção é só o texto do §4.3 — nem o retrato, nem a formação moram
          aqui. O teste que conta os parágrafos toma a seção sem `h2` como
          fronteira; qualquer outro `<p>` dentro dela (a legenda do buraco do
          retrato, por exemplo) faria a contagem mentir. */}
      <Container as="section" className="space-y-6 pt-8">
        {ABOUT_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="prose-measure text-ink">
            {paragraph}
          </p>
        ))}
      </Container>

      {/* O retrato vem depois do texto, não ao lado: numa coluna de leitura de
          44rem, dividir a linha com uma foto derrubaria a prosa para uns 40
          caracteres — abaixo do piso de 65 do §6.3, que é justamente o erro que
          a Task 4 corrigiu. Abaixo do texto ele ainda é a única presença humana
          da página, e ninguém rola o /sobre sem passar por ele. */}
      <Container className="pt-12">
        <Portrait />
      </Container>

      <Container>
        <TechLayers />
      </Container>

      {/* §4.3: "Formação, se for exibida em algum canto". Este é o canto.
          Em mono, como todo metadado do site (§6.3), e do tamanho de um dado —
          não de um argumento. Sem foto de documento, sem data de nascimento,
          sem RG: a proibição do §4.3 vale para a página tanto quanto para o CV,
          e há teste conferindo. */}
      {/* `py-16` e não `pt-16`: esta seção deixou de ser a última coisa da
          página quando o "voltar ao topo" entrou, e a régua dele precisa de
          espaço acima. Cada seção paga o próprio ritmo vertical — o `EndNav`
          não traz margem de cima nenhuma. */}
      <Container as="section" className="py-16">
        <h2 className="font-display text-xl font-bold tracking-tight">Formação</h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-2">
          <span className="text-ink">{EDUCATION.degree}</span>
          <br />
          {EDUCATION.institution} — {EDUCATION.conclusion}
        </p>
      </Container>

      {/* Só a âncora: o `/sobre` não tem "próximo". A justificativa de estar
          aqui e não no rodapé está no componente. */}
      <EndNav />
    </>
  );
}
