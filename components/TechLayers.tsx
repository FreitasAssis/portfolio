import { LAYER_1, LAYER_2, LAYER_2_CAVEAT } from '@/content/tech';

/**
 * As duas camadas de tecnologia, em peso visual decrescente por quatro eixos
 * (forma, tamanho, tinta, rótulo) e nenhum deles cor. Sem SVG de logotipo:
 * `tests/unit/sobre.test.tsx` falha se aparecer.
 */
export function TechLayers() {
  return (
    <section className="pt-16">
      <h2 className="font-display text-xl font-bold tracking-tight">Tecnologia</h2>

      <p className="mt-6 text-sm text-ink">Uso hoje e defendo em profundidade:</p>
      <ul className="mt-3 flex flex-wrap gap-2 font-mono text-sm">
        {LAYER_1.map((item) => (
          <li key={item} className="border border-rule px-3 py-1.5 text-ink">
            {item}
          </li>
        ))}
      </ul>

      {/* Sem `.prose-measure`: o token vale 68ch medidos no corpo de 18px, e este
          parágrafo é `text-xs` — a mesma caixa em fonte menor dá uns 76
          caracteres, acima do teto de 75. O `ch` daqui é medido nesta fonte. */}
      <p className="mt-8 max-w-[62ch] text-xs leading-relaxed text-ink-2">
        <span className="font-mono">Já entreguei em produção:</span>{' '}
        {LAYER_2.join(', ')}. {LAYER_2_CAVEAT}
      </p>
    </section>
  );
}
