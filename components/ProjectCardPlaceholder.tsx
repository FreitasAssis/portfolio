/**
 * O buraco onde entra o print do app, enquanto ele não existe (Task 6).
 *
 * Duas exigências, e a segunda é a que importa:
 *
 * 1. **Proporção real.** §4.7: a captura é o viewport do dispositivo, 390–430pt
 *    de largura. 390×844 é a proporção que o print vai ter, então o buraco tem
 *    a mesma — trocar um placeholder quadrado por uma imagem 9:19,5 depois
 *    reflui a página inteira e o que foi ajustado aqui volta pra mesa.
 * 2. **Parecer inacabado.** Um bloco liso na cor da marca é indistinguível de
 *    uma escolha de design, e escolha de design ninguém vem substituir. Daí a
 *    borda tracejada, o hachurado e o `{{ }}` do §0 escrito por extenso: se
 *    isto for ao ar por engano, é impossível não ver.
 *
 * A cor vem do `--accent` da `AccentZone` que envolve o card (§6.1) — o
 * placeholder já ocupa o lugar cromático que o print vai ocupar.
 */
export function ProjectCardPlaceholder({
  /** O que falta, no vocabulário do §4.7 ("capa — Repertório montado por momento"). */
  label,
  /** A restrição de captura, pra quem for produzir o arquivo. */
  spec,
}: {
  label: string;
  spec: string;
}) {
  return (
    <div
      className="relative flex aspect-[390/844] w-full max-w-[15rem] items-center justify-center border-2 border-dashed border-accent bg-accent/10 p-3"
      style={{
        // Hachura em 135°: sinal universal de "área reservada". Inline porque o
        // gradiente precisa ler o --accent da zona em tempo de renderização.
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent 0 9px, color-mix(in srgb, var(--accent) 35%, transparent) 9px 11px)',
      }}
    >
      <p className="border border-rule bg-paper px-3 py-2 text-center font-mono text-xs leading-snug">
        <span className="block text-ink">{`{{ print: ${label} }}`}</span>
        <span className="mt-1.5 block text-ink-2">{spec}</span>
      </p>
    </div>
  );
}
