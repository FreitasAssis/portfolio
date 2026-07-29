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
 */
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  res.writeHead(status, { 'content-type': TYPES[ext] ?? 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`static server em http://127.0.0.1:${PORT} servindo ${ROOT}\n`);
});
