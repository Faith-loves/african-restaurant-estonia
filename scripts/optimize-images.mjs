// Generate smaller web assets without modifying the original photographs.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  }));
  return groups.flat();
}

async function main() {
  const replacements = [];
  const previous = JSON.parse(await fs.readFile('docs/image-optimization-results.json', 'utf8').catch(() => '{"replacements":[]}'));
  const generated = new Map(previous.replacements);
  let before = 0;
  let after = 0;
  for (const file of await filesIn('public/images')) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const stat = await fs.stat(file);
    if (stat.size < 150000) continue;
    const output = file.replace(/\.(png|jpe?g)$/i, '.webp');
    // Never replace a pre-existing asset with the same name.
    let exists = false;
    try { await fs.access(output); exists = true; } catch {}
    const sourceUrl = '/' + file.replaceAll(path.sep, '/').slice(7);
    const outputUrl = '/' + output.replaceAll(path.sep, '/').slice(7);
    if (exists && generated.get(sourceUrl) !== outputUrl) continue;
    if (!exists) await sharp(file).rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
    const compressed = await fs.stat(output);
    if (compressed.size >= stat.size) { await fs.unlink(output); continue; }
    before += stat.size;
    after += compressed.size;
    replacements.push([sourceUrl, outputUrl]);
  }
  for (const file of await filesIn('src')) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const original = await fs.readFile(file, 'utf8');
    let updated = original;
    for (const [from, to] of replacements) updated = updated.replaceAll(from, to);
    if (updated !== original) await fs.writeFile(file, updated);
  }
  console.log(JSON.stringify({ images: replacements.length, originalBytes: before, webBytes: after, reductionPercent: Math.round((1 - after / before) * 100) }));
  await fs.writeFile('docs/image-optimization-results.json', JSON.stringify({ originalBytes: before, webBytes: after, replacements }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
