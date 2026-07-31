import { Link } from '@/components/Link';

import { Container } from '@/components/Container';

export function Hero() {
  return (
    // `pb-28` (126px) é o valor que faz o respiro daqui até "Projetos próprios"
    // bater com os outros três da página: cada intervalo entre blocos é a SOMA
    // dos paddings vizinhos, e a seção de projetos usa `py-4` porque os cards já
    // trazem `py-12` por dentro — 126 + 18 = os mesmos 144px.
    <Container as="section" className="pt-16 pb-28 sm:pt-24">
      <p className="font-mono text-xs tracking-wide text-ink-2">
        Natal, RN · Desenvolvedor full stack sênior
      </p>

      {/* Sem `text-balance`: na coluna de leitura ele encurta as linhas do meio e
          a tese sai com serrilha. */}
      {/* "desde 2017", nunca uma contagem de anos: o número escrito à mão
          envelhece sozinho, e a h1 é o que o Google mostra. Há teste. */}
      <h1 className="mt-6 font-display text-xl leading-[1.12] font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
        Construo software desde 2017 — e dois dos produtos aqui nasceram de problemas que eu mesmo
        vivo.
      </h1>

      <p className="prose-measure mt-7 text-ink-2">
        Hoje construo, na Analytica Ensino, uma plataforma educacional usada por cerca de 400 mil
        alunos, professores e gestores da rede pública do Paraná. Fora do expediente sou músico, e
        foi daí que surgiu o Asafe. Os dois apps abaixo estão no ar; te convido a testá-los.
      </p>

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
