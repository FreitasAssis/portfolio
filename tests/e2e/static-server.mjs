/**
 * Servidor estático mínimo para o `out/` do `next build`.
 *
 * Por que HTTP e não `file://`: o export do Next referencia os bundles por
 * caminho absoluto (`/_next/static/...`). Sob `file://` isso resolve para a
 * raiz do disco, todo asset dá 404 e a página abre **sem uma linha de CSS** —
 * os testes de layout (360px, cor de acento) passariam ou falhariam por motivo
 * errado, sem nenhum sinal óbvio de que o problema era o protocolo.
 *
 * Por que escrito à mão em vez de um pacote: não vale uma dependência, e um
 * `npx` de servidor exigiria rede no meio do teste. São trinta linhas e elas
 * também codificam a regra de URL limpa (`/projetos` → `out/projetos.html`)
 * que o Cloudflare Pages aplica em produção — o que o teste exercita é o mesmo
 * mapeamento do deploy.
 *
 * Pelo mesmo motivo ele lê o `out/_headers`: as OG images saem do export sem
 * extensão, e sem essa segunda camada elas seriam servidas aqui como
 * `application/octet-stream` — que é justamente o defeito que o `_headers`
 * existe para corrigir no ar.
 *
 * E pelo mesmo motivo ele comprime texto. Isso não é otimização do teste: toda
 * hospedagem estática comprime HTML, CSS e JS por padrão, e sem `gzip` aqui uma
 * medição de performance mede um servidor que ninguém publica — o `out/` tem
 * ~650KB de JS que viram ~200KB no ar. `Accept-Encoding` é respeitado, então
 * quem não pedir compressão continua recebendo o byte cru.
 */
import { gzipSync } from 'node:zlib';

import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Os tipos que ganham compressão. Imagem e PDF já chegam comprimidos. */
const COMPRESSIVEL = /^(text\/|application\/(json|xml)|image\/svg)/;

const ROOT = fileURLToPath(new URL('../../out/', import.meta.url));
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  // O CV (§7). Sem esta linha o arquivo ainda seria servido, mas como
  // application/octet-stream — e o teste que confere o download do /contato
  // passaria a medir o fallback em vez do tipo real.
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

/** As regras de `out/_headers`, como par [padrão compilado, cabeçalhos]. */
async function loadHeaderRules() {
  const source = await readFile(join(ROOT, '_headers'), 'utf8').catch(() => '');
  return source
    .split(/\n(?=\/)/)
    .map((bloco) => bloco.split('\n').filter((linha) => linha.trim() && !linha.startsWith('#')))
    .filter((linhas) => linhas.length > 1)
    .map(([padrao, ...cabecalhos]) => [
      new RegExp(`^${padrao.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`),
      Object.fromEntries(
        cabecalhos.map((linha) => {
          const [nome, ...valor] = linha.split(':');
          return [nome.trim().toLowerCase(), valor.join(':').trim()];
        }),
      ),
    ]);
}

const HEADER_RULES = await loadHeaderRules();

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname));
  const candidates = clean.endsWith('/')
    ? [join(clean, 'index.html')]
    : [clean, `${clean}.html`, join(clean, 'index.html')];

  for (const candidate of candidates) {
    const file = join(ROOT, candidate);
    // `normalize` já resolve `..`, mas a checagem de prefixo é o que garante
    // que nenhum caminho escape do out/.
    if (!file.startsWith(ROOT)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      // segue para o próximo candidato
    }
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  const file = (await resolveFile(pathname)) ?? (await resolveFile('/404.html'));
  const status = file && !file.endsWith('404.html') ? 200 : 404;

  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404');
    return;
  }

  const ext = file.slice(file.lastIndexOf('.'));
  const extras = HEADER_RULES.filter(([padrao]) => padrao.test(pathname)).map(([, h]) => h);
  const cabecalhos = {
    'content-type': TYPES[ext] ?? 'application/octet-stream',
    ...Object.assign({}, ...extras),
  };

  let corpo = await readFile(file);
  const aceita = (req.headers['accept-encoding'] ?? '').includes('gzip');
  if (aceita && COMPRESSIVEL.test(cabecalhos['content-type'])) {
    corpo = gzipSync(corpo);
    cabecalhos['content-encoding'] = 'gzip';
    cabecalhos.vary = 'Accept-Encoding';
  }

  res.writeHead(status, { ...cabecalhos, 'content-length': corpo.length });
  res.end(corpo);
}).listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`static server em http://127.0.0.1:${PORT} servindo ${ROOT}\n`);
});
