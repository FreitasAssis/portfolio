import Link from 'next/link';

import { Container } from '@/components/Container';

/**
 * Copy literal do §4.1. Não reescreva: o registro é primeira pessoa,
 * específico, sem adjetivo de venda.
 *
 * O número (400 mil) fica no subhead de propósito — é o dado mais forte do
 * currículo e a única coisa da página que outro dev não poderia dizer. Sem
 * contador animado: o §6.4 lista "número contando" entre os movimentos
 * proibidos, e o único momento orquestrado do site é a troca de acento.
 *
 * Sem foto (§6.5): o retrato vive no /sobre e no bloco de contato; o hero
 * pertence à tese.
 */
export function Hero() {
  return (
    // `pb-28` (126px) não é gosto: é o valor que faz o respiro daqui até o
    // "Projetos próprios" bater com os outros três da página. Cada intervalo
    // entre blocos é a SOMA dos paddings vizinhos, e a seção de projetos usa
    // `py-4` porque os cards já trazem `py-12` por dentro — então 126 + 18 = 144,
    // o mesmo 144px que separa os demais. Com `pb-20` este era o único de 108px.
    <Container as="section" className="pt-16 pb-28 sm:pt-24">
      <p className="font-mono text-xs tracking-wide text-ink-2">
        Natal, RN · Desenvolvedor full stack sênior
      </p>

      {/* Sem `text-balance`: na coluna de leitura ele encurta as linhas do meio e
          a tese sai com serrilha. Sem escalonar por viewport a display de 39px
          cabe nove caracteres por linha em 360px, e a frase vira uma coluna. */}
      {/* "Construo software desde 2017", e não "nove anos": o §4.1 é explícito —
          "número escrito à mão envelhece sozinho e vira mentira sem ninguém
          perceber (§2, baixa manutenção). O ano é permanente." A h1 é o pior
          lugar possível para um dado que apodrece: ela é o que o Google mostra e
          o que a pessoa lê primeiro. */}
      <h1 className="mt-6 font-display text-xl leading-[1.12] font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
        Construo software desde 2017 — e dois dos produtos aqui nasceram de problemas que eu mesmo
        vivo.
      </h1>

      {/* "alunos, professores e gestores" — o §4.1 escrevia só "alunos e
          professores", mas o §4.3, o §4.5 e o CV listam os três. O §4.5 manda o
          site e o CV contarem a mesma história com as mesmas palavras, e quem
          abrir os dois compara justamente esta frase. */}
      <p className="prose-measure mt-7 text-ink-2">
        Hoje construo, na Analytica Ensino, uma plataforma educacional usada por cerca de 400 mil
        alunos, professores e gestores da rede pública do Paraná. Fora do expediente sou músico, e
        foi daí que saiu o Asafe. Os dois apps abaixo estão no ar; pode abrir e usar.
      </p>

      {/* Os dois CTAs do §4.1. O primário é sólido no acento — que na home, antes
          de qualquer card entrar em tela, ainda é o neutro da base (§6.1). */}
      <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-sm">
        <Link
          href="/projetos"
          className="bg-accent px-5 py-3 text-accent-ink hover:opacity-90"
        >
          Ver os projetos
        </Link>
        <Link
          href="/contato"
          className="border border-rule px-5 py-3 text-ink hover:border-ink"
        >
          Falar comigo
        </Link>
      </div>
    </Container>
  );
}
