/**
 * O `src` real por trás de um `next/image` renderizado sob o Vitest.
 *
 * Em `jsdom` o componente não lê o `next.config.ts`, então o `images.unoptimized`
 * do repo não vale ali e o `src` sai como `/_next/image?url=…&w=…&q=…`. No
 * `out/` — que é o que vai ao ar, e o que os testes do `tests/e2e/` medem — o
 * `src` é o caminho cru do arquivo em `/public`.
 *
 * Sem isto, um teste unitário que confere o caminho do arquivo falha por um
 * motivo que não existe em produção, ou passa afrouxando o padrão até não medir
 * mais nada.
 */
export function caminhoDoArquivo(img: Element): string {
  const src = img.getAttribute('src') ?? '';
  const url = new URL(src, 'http://local').searchParams.get('url');
  return url ?? src;
}
