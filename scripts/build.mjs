import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { check, root } from './check.mjs';

// Exportação opcional: mantém a entrega original em um único HTML portátil.
try {
  let html = await check();
  const css = await readFile(path.join(root, 'assets/css/styles.css'), 'utf8');
  const javascript = await readFile(path.join(root, 'assets/js/main.js'), 'utf8');
  html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">', () => `<style>\n${css}\n</style>`);
  html = html.replace('<script src="assets/js/main.js"></script>', () => `<script>\n${javascript.replace(/<\/script/gi, '<\\/script')}\n</script>`);

  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.pdf': 'application/pdf' };
  const markup = html.replace(/<!--[\s\S]*?-->/g, '');
  const resources = [...new Set([...markup.matchAll(/(?:src|href)="(assets\/(?:images|documents)\/[^"\s]+)"/g)].map(match => match[1]))];
  for (const reference of resources) {
    const mime = mimeTypes[path.extname(reference)];
    if (!mime) throw new Error(`Formato sem configuração de exportação: ${reference}`);
    const bytes = await readFile(path.join(root, reference));
    html = html.replaceAll(`"${reference}"`, `"data:${mime};base64,${bytes.toString('base64')}"`);
  }

  if (/\b(?:src|href)="assets\//.test(html.replace(/<!--[\s\S]*?-->/g, ''))) {
    throw new Error('A exportação contém um recurso local não incorporado.');
  }
  const output = path.join(root, 'dist');
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'index.html'), html, 'utf8');
  console.log(`HTML único gerado em dist/index.html (${Math.round(Buffer.byteLength(html) / 1024)} KB).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
