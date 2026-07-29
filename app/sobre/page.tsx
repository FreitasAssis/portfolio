import { Container } from '@/components/Container';
import { Portrait } from '@/components/Portrait';
import { TechLayers } from '@/components/TechLayers';
import { ABOUT_PARAGRAPHS, ABOUT_SEEKING, EDUCATION } from '@/content/about';

/**
 * `/sobre` (§3.4): **curto. Pessoa primeiro, tecnologia depois**, na voz do
 * parágrafo real que já existia no site antigo (§4.3).
 *
 * A ordem da página é essa frase, literalmente: os três parágrafos do §4.3, o
 * retrato, e só então a tecnologia. A formação fecha, "em algum canto" como o
 * §4.3 permite — é a última pergunta do recrutador e a primeira que ninguém
 * quer ler antes do resto.
 *
 * ## O quarto parágrafo
 *
 * O §4.3 tem um quarto parágrafo, e ele **não está aqui de propósito**: o brief
 * diz "não gerar" e "se estiver vazio na hora do build, omita o parágrafo — a
 * página funciona sem ele". Ela funciona: o terceiro parágrafo fecha no Asafe,
 * que é a ponte para os projetos, e não fica buraco de sentido.
 *
 * Não há placeholder visível aqui, ao contrário do retrato e dos prints — e a
 * assimetria é deliberada. Um buraco de imagem precisa gritar para que alguém
 * produza o arquivo; um "{{ o que ele procura hoje }}" no fim da página sobre
 * uma pessoa lê como abandono para o visitante e não acelera nada, porque a
 * pendência já está registrada onde quem trabalha no repo a encontra
 * (`content/about.ts` e `docs/plans/RETOMADA.md`).
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
        {/* Uma edição, quando o Luiz mandar as frases: `ABOUT_SEEKING` deixa de
            ser null em content/about.ts e o parágrafo nasce aqui, com a mesma
            forma dos outros três. Ver o comentário de lá. */}
        {ABOUT_SEEKING ? <p className="prose-measure text-ink">{ABOUT_SEEKING}</p> : null}
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
      <Container as="section" className="pt-16">
        <h2 className="font-display text-xl font-bold tracking-tight">Formação</h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-2">
          <span className="text-ink">{EDUCATION.degree}</span>
          <br />
          {EDUCATION.institution} — {EDUCATION.conclusion}
        </p>
      </Container>
    </>
  );
}
