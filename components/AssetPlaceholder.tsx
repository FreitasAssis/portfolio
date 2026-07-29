/**
 * O buraco onde entra uma imagem que ainda não existe.
 *
 * Nasceu como `ProjectCardPlaceholder`, para os prints dos apps (§4.7). Virou
 * genérico quando o `/sobre` precisou de um buraco para o retrato do §6.5: o
 * site tem **duas** fontes de imagem, e um segundo estilo de "área reservada"
 * faria uma das duas lacunas parecer decisão de design em vez de pendência.
 * Um vocabulário só, dois usos.
 *
 * Duas exigências, e a segunda é a que importa:
 *
 * 1. **Proporção real.** A caixa tem a proporção do arquivo que vai substituí-la
 *    — §4.7 para os prints (390×844, o viewport do celular). Trocar um
 *    placeholder quadrado por uma imagem 9:19,5 depois reflui a página inteira e
 *    o que foi ajustado aqui volta pra mesa.
 * 2. **Parecer inacabado.** Um bloco liso na cor da marca é indistinguível de
 *    uma escolha de design, e escolha de design ninguém vem substituir. Daí a
 *    borda tracejada, o hachurado e o `{{ }}` do §0 escrito por extenso: se
 *    isto for ao ar por engano, é impossível não ver.
 *
 * A cor vem do `--accent` em vigor. Dentro de uma `AccentZone` (§6.1) o
 * placeholder já ocupa o lugar cromático do print; fora dela, `--accent` é o
 * neutro da base e a caixa não inventa cor nenhuma.
 *
 * As classes de proporção e largura chegam **literais** por chamada, e não
 * montadas em runtime: o Tailwind varre o fonte, e uma classe concatenada em
 * tempo de execução não seria gerada.
 */
export function AssetPlaceholder({
  /** O que falta, no vocabulário de quem vai produzir o arquivo. */
  label,
  /** A restrição de captura ou de enquadramento, pra quem for produzir. */
  spec,
  /** `aspect-[390/844]` para print de celular, `aspect-[4/5]` para retrato. */
  aspect,
  /** Teto de largura da caixa, ex.: `max-w-[15rem]`. */
  width,
}: {
  readonly label: string;
  readonly spec: string;
  readonly aspect: string;
  readonly width: string;
}) {
  return (
    <div
      className={`relative flex w-full items-center justify-center border-2 border-dashed border-accent bg-accent/10 p-3 ${aspect} ${width}`}
      style={{
        // Hachura em 135°: sinal universal de "área reservada". Inline porque o
        // gradiente precisa ler o --accent da zona em tempo de renderização.
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent 0 9px, color-mix(in srgb, var(--accent) 35%, transparent) 9px 11px)',
      }}
    >
      <p className="border border-rule bg-paper px-3 py-2 text-center font-mono text-xs leading-snug">
        <span className="block text-ink">{`{{ ${label} }}`}</span>
        <span className="mt-1.5 block text-ink-2">{spec}</span>
      </p>
    </div>
  );
}
