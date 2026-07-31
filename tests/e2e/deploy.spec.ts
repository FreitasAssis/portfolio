import { existsSync, readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

// Os dois arquivos de configuração da hospedagem só existem no artefato: nada
// no site os renderiza, então nenhum outro teste os alcança. Rodam aqui porque
// o `webServer` do Playwright faz o build antes, e `out/` está fresco.

const OUT = 'out';

function regras(arquivo: string): string[] {
  return readFileSync(`${OUT}/${arquivo}`, 'utf8')
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0 && !linha.startsWith('#'));
}

test('os três redirects do site anterior chegam ao artefato', () => {
  const linhas = regras('_redirects');
  expect(linhas).toEqual([
    '/about          /sobre      301',
    '/projects       /projetos   301',
    '/testimonials   /           301',
  ]);
});

test('todo redirect é 301, nunca 302', () => {
  // O 302 é temporário: funciona igual no navegador e não transfere a reputação
  // da URL antiga, então a troca passa despercebida até o tráfego de busca cair.
  for (const linha of regras('_redirects')) {
    expect(linha.split(/\s+/).at(-1), linha).toBe('301');
  }
});

test('todo destino de redirect existe no artefato', () => {
  // Um 301 para uma rota que não existe troca um 404 por dois saltos até o mesmo
  // 404. O destino tem que ser uma página de verdade.
  for (const linha of regras('_redirects')) {
    const destino = linha.split(/\s+/)[1];
    const arquivo = destino === '/' ? `${OUT}/index.html` : `${OUT}${destino}.html`;
    expect(existsSync(arquivo), `${destino} (de "${linha}")`).toBe(true);
  }
});

test('o _headers chega ao artefato com as regras de tipo e de cache', () => {
  const linhas = regras('_headers');
  expect(linhas).toContain('/opengraph-image');
  expect(linhas).toContain('/*/opengraph-image');
  expect(linhas).toContain('Content-Type: image/png');
  expect(linhas).toContain('/_next/static/*');
});
