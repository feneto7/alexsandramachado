import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 4173 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Porta inválida. Exemplo: npm run dev -- --port 4174');
  process.exit(1);
}
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    // Apenas o site é servido; .git, .local e ferramentas permanecem privados.
    if (relative !== 'index.html' && !relative.startsWith('assets/')) {
      response.writeHead(404).end('Não encontrado');
      return;
    }
    const file = path.resolve(root, relative);
    const resolvedRelative = path.relative(root, file);
    if (resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) {
      response.writeHead(403).end('Acesso negado');
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(data);
  } catch {
    response.writeHead(404).end('Não encontrado');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `A porta ${port} está em uso. Escolha outra com --port.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}\nCtrl+C para encerrar.`));
