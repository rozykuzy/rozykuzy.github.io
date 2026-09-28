// local preview: the combined site at /, the two archive pages at their real paths
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = +process.env.PORT || 8930, FAIL = (process.env.FAIL || '').split(','), SLOW = +process.env.SLOW || 0;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname), base = ROOT;
  for (const [pre, dir, tag] of [['/helmut-lang/', 'fixtures/helmut-lang', 'hl'], ['/ccp/', 'fixtures/ccp', 'ccp']]) {
    if (p === pre.slice(0, -1)) { res.writeHead(301, { Location: pre }); return res.end() }
    if (p.startsWith(pre)) {
      if (FAIL.includes(tag)) { res.writeHead(503); return res.end('down') }
      base = path.join(ROOT, dir); p = '/' + p.slice(pre.length);
    }
  }
  if (p.startsWith('/fixtures/') || p.startsWith('/tools/')) { res.writeHead(404); return res.end() }
  let f = path.join(base, p); if (!f.startsWith(base)) { res.writeHead(403); return res.end() }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  const send = () => {
    if (!fs.existsSync(f)) { const nf = path.join(ROOT, '404.html'); res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(fs.readFileSync(nf)) }
    const type = TYPES[path.extname(f)] || 'application/octet-stream', body = fs.readFileSync(f);
    if (/gzip/.test(req.headers['accept-encoding'] || '') && /text|javascript|json|xml|svg|manifest/.test(type)) {
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' }); return res.end(zlib.gzipSync(body, { level: 6 }));
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
  };
  if (SLOW && base !== ROOT) setTimeout(send, SLOW); else send();
}).listen(PORT, '127.0.0.1', () => console.log('serving on', PORT));
