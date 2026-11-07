// Downloads the Google Fonts used by Cubely into ./fonts and points index.html at them.
// Runs automatically before `npm start` and `npm run dist`. Needs internet the first time only.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const fontDir = path.join(root, 'fonts');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const KEEP = ['latin', 'latin-ext'];

function parseCss(css) {
  // Google splits each family into subsets, each marked by a comment such as /* latin */
  const out = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  let m;
  while ((m = re.exec(css))) if (KEEP.indexOf(m[1]) !== -1) out.push(m[2]);
  return out;
}

async function main(fetchImpl) {
  const get = fetchImpl || fetch;
  let html = fs.readFileSync(htmlPath, 'utf8');
  const link = html.match(/<link[^>]+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"[^>]*>/);
  if (!link) {
    console.log('Fonts are already bundled.');
    return;
  }
  console.log('Downloading fonts...');
  const cssRes = await get(link[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } });
  if (!cssRes.ok) throw new Error('Could not load the font list (' + cssRes.status + '). Check your internet connection.');
  const faces = parseCss(await cssRes.text());
  if (!faces.length) throw new Error('No fonts found in the font list.');
  fs.mkdirSync(fontDir, { recursive: true });
  const cache = {};
  const rewritten = [];
  for (const face of faces) {
    const url = (face.match(/url\((https:[^)]+)\)/) || [])[1];
    if (!url) continue;
    if (!cache[url]) {
      const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + '.woff2';
      const res = await get(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error('Could not download a font (' + res.status + ').');
      fs.writeFileSync(path.join(fontDir, name), Buffer.from(await res.arrayBuffer()));
      cache[url] = name;
    }
    rewritten.push(face.replace(url, './' + cache[url]));
  }
  fs.writeFileSync(path.join(fontDir, 'fonts.css'), rewritten.join('\n') + '\n');
  html = html
    .replace(/<link[^>]+rel="preconnect"[^>]*>\s*/g, '')
    .replace(link[0], '<link rel="stylesheet" href="fonts/fonts.css">');
  fs.writeFileSync(htmlPath, html);
  console.log('Bundled ' + Object.keys(cache).length + ' font files into ./fonts');
}

module.exports = { parseCss, main };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
