// Test data for the brand rooms: fixtures/BRAND/ (index.json · b/<slug>.json · new.json), the shapes the BRAND
// pipeline publishes at /BRAND/, built from the CCP fixture page's own __data and relabelled as three brands.
// The listings are CCP's (titles renamed, links marked per brand, model numbers dropped) — test data, never published.
//   node tools/brandfix.mjs [path/to/brands.json]      (default: ../brand/brands.json next to this repository)
import fs from 'node:fs'; import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const REG = process.argv[2] || path.resolve(ROOT, '..', 'brand', 'brands.json');
const OUT = path.join(ROOT, 'fixtures', 'BRAND');
const html = fs.readFileSync(path.join(ROOT, 'fixtures/ccp/index.html'), 'utf8');
const at = html.indexOf('id="__data"'), s0 = html.indexOf('>', at) + 1;
const ccp = JSON.parse(html.slice(s0, html.indexOf('</script>', s0)));
const reg = JSON.parse(fs.readFileSync(REG, 'utf8')).brands;
if (!Array.isArray(reg) || reg.length !== 131) throw new Error('expected the 131-brand registry, got ' + (reg && reg.length));

// three brands, a share of the CCP listings each, and how many of them came in today
const FAKE = [{ s: 'rick-owens', upto: 45, fresh: 14 }, { s: 'guidi', upto: 80, fresh: 6 }, { s: 'uma-wang', upto: 100, fresh: 3 }];
const fnv = (u) => { let h = 0x811c9dc5; for (const c of String(u)) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0 } return h };
const byS = Object.fromEntries(reg.map((b) => [b.slug, b]));
const live = (it) => !it.x && !it.so;

function rename(t, b) {
  const ja = b.ja[0] || b.name, ko = b.ko[0] || b.name;
  return String(t).replace(/carol\s*christian\s*poell?/gi, b.name).replace(/キャロル\s*クリスチャン\s*ポエル/g, ja)
    .replace(/캐롤\s*크리스[찬챤]\s*포엘/g, ko).replace(/\bC\.?C\.?P\b\.?/g, b.name);
}
const mark = (u, s) => (typeof u === 'string' && u ? u + '#' + s : u);

const today = ccp.today, out = {};
for (const f of FAKE) out[f.s] = [];
for (const it0 of ccp.items) {
  const r = fnv(it0.l) % 100, f = FAKE.find((x) => r < x.upto), b = byS[f.s];
  const it = JSON.parse(JSON.stringify(it0));
  delete it.mc; delete it.n;
  it.t = rename(it.t, b); it.l = mark(it.l, f.s);
  if (Array.isArray(it.v)) it.v.forEach((v) => { v.l = mark(v.l, f.s) });
  if (it.sc && it.sc.b === 'code') it.sc.b = 'model';
  out[f.s].push(it);
}
const index = [], fresh = [];
for (const f of FAKE) {
  const b = byS[f.s], items = out[f.s];
  // today's: live listings with a photograph, the ones whose titles give a year first
  const pick = items.filter((it) => live(it) && it.i).sort((x, y) => (x.c > y.c ? 1 : x.c < y.c ? -1 : 0) || fnv(x.l) - fnv(y.l)).slice(0, f.fresh);
  pick.forEach((it) => { it.n = 1; it.f = today });
  const cards = items.filter(live), sold = items.filter((it) => it.so).length, gone = items.filter((it) => it.x).length;
  const sections = {}, sellers = {}, years = [];
  cards.forEach((it) => { sections[it.s] = (sections[it.s] || 0) + 1; sellers[it.r] = (sellers[it.r] || 0) + 1 });
  items.forEach((it) => { if (/^\d{4}$/.test(it.e || '')) years.push(+it.e) });
  const pay = {
    issue: ccp.issue, date: ccp.date, dateKo: ccp.dateKo, built: ccp.built, today, rates: ccp.rates,
    counts: { entries: items.length, items: cards.length, grouped: cards.filter((it) => it.g > 1).length, fresh: pick.length, changed: 0, sold, gone },
    sections, sellers, yearSpan: years.length ? Math.min(...years) + '–' + Math.max(...years) : '', sources: ccp.sources,
    items, brand: { s: b.slug, n: b.name, big: !!b.big }
  };
  fs.mkdirSync(path.join(OUT, 'b'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'b', f.s + '.json'), JSON.stringify(pay));
  const ph = cards.filter((it) => it.i && it.c === 'A').concat(cards.filter((it) => it.i && it.c !== 'A')).slice(0, 2).map((it) => it.i);
  index.push({ s: b.slug, c: cards.length, nw: pick.length, so: sold, srcs: sellers, ph, upd: ccp.built });
  pick.forEach((it) => fresh.push(Object.assign({}, it, { b: b.slug })));
}
const got = Object.fromEntries(index.map((x) => [x.s, x]));
const brands = reg.map((b) => {
  const q = { en: b.latin[0], ja: b.ja[0] || null, ko: b.ko[0] || null };
  if (b.existing) return { s: b.slug, n: b.name, big: !!b.big, q, ex: b.existing };
  const g = got[b.slug] || { c: 0, nw: 0, so: 0, srcs: {}, ph: [], upd: null };
  return { s: b.slug, n: b.name, c: g.c, nw: g.nw, big: !!b.big, so: g.so, srcs: g.srcs, ph: g.ph, upd: g.upd, q };
});
fresh.sort((x, y) => (y.f > x.f ? 1 : y.f < x.f ? -1 : 0) || y.k - x.k);
const sum = (k) => index.reduce((a, x) => a + x[k], 0);
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
  built: ccp.built, today, date: ccp.date, rates: ccp.rates,
  counts: { brands: brands.length, withCards: index.filter((x) => x.c).length, cards: sum('c'), fresh: sum('nw') },
  sources: ccp.sources, brands
}));
fs.writeFileSync(path.join(OUT, 'new.json'), JSON.stringify({ today, items: fresh.slice(0, 400) }));
console.log('wrote', OUT, index.map((x) => x.s + ' ' + x.c + ' cards, ' + x.nw + ' new, ' + x.so + ' sold').join(' · '), '· new.json', fresh.length);
