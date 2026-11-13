import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const swPath = path.join(dist, 'sw.js');
const source = fs.readFileSync(swPath, 'utf8');
const placeholder = 'const BUILT_ASSETS = [];';

if (!source.includes(placeholder)) {
  console.error('Could not find the BUILT_ASSETS placeholder in dist/sw.js');
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const assets = walk(dist)
  .map((absolute) => `./${path.relative(dist, absolute).split(path.sep).join('/')}`)
  .filter((relative) => relative.startsWith('./assets/'))
  .sort();

const next = source.replace(placeholder, `const BUILT_ASSETS = ${JSON.stringify(assets, null, 2)};`);
fs.writeFileSync(swPath, next);
console.log(`Injected ${assets.length} built assets into the service worker.`);
