import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const root = fileURLToPath(new URL('../', import.meta.url));

export async function check() {
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const markup = html.replace(/<!--[\s\S]*?-->/g, '');
  const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const references = new Set();

  for (const [, reference] of markup.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
    if (reference.startsWith('#')) {
      if (!ids.has(reference.slice(1))) throw new Error(`Âncora não encontrada: ${reference}`);
      continue;
    }
    const localPath = path.resolve(root, decodeURIComponent(reference.split(/[?#]/)[0]));
    const relative = path.relative(root, localPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Referência fora do projeto: ${reference}`);
    }
    await access(localPath);
    references.add(reference);
  }

  const javascript = await readFile(path.join(root, 'assets/js/main.js'), 'utf8');
  new vm.Script(javascript, { filename: 'assets/js/main.js' });

  for (const [, json] of markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(json);
  }

  if (/(?:C:\\Users\\|C:\/Users\/)/.test(html + javascript)) {
    throw new Error('Encontrado caminho absoluto de desenvolvimento nos arquivos do site.');
  }

  console.log(`Verificação OK: JavaScript, JSON-LD, âncoras e ${references.size} referências locais.`);
  return html;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  check().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
