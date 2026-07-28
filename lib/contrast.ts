/**
 * Contraste WCAG 2.1 (luminância relativa).
 *
 * §6.2 do brief manda medir os pares acento × tema com medidor, não no olho:
 * `#C8506A` sobre fundo claro fica na fronteira do AA. Este módulo é o medidor,
 * e `tests/unit/contrast.test.ts` é quem trava os valores.
 */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
