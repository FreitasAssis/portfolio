/**
 * O buraco onde entra uma imagem que ainda não existe. A caixa tem a proporção
 * real do arquivo que vai substituí-la, para que a troca não reflua a página.
 *
 * `aspect` e `width` chegam como classes **literais** por chamada: o Tailwind
 * varre o fonte, e uma classe montada em runtime não é gerada.
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
        // Inline porque o gradiente precisa ler o --accent da zona em vigor.
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
