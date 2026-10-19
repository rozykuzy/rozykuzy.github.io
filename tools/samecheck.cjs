// Two servings of the site, screen by screen: every visible element in the same place, with the same text, colour,
// size, tracking, link and label (photographs aside). Made to show that the site with /BRAND/ answering 404 is the site
// as it was: A = main checked out elsewhere and served there, B = this tree served with BRAND=off.
//   git worktree add ../aix-main main && ln -s "$PWD/fixtures" ../aix-main/fixtures
//   (cd ../aix-main/tools && PORT=8934 node serve.mjs) & (cd tools && PORT=8933 BRAND=off node serve.mjs) &
//   A=http://127.0.0.1:8934 B=http://127.0.0.1:8933 node tools/samecheck.cjs
const H = require('./harness.cjs');
const A = process.env.A || 'http://127.0.0.1:8934', B = process.env.B || 'http://127.0.0.1:8933';
(async () => {
  const b = await H.browser();
  const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 }, MO = { mobile: true, dpr: 2 };
  const jobs = [['home', D, '/'], ['home-m', M, '/', null, MO], ['brands', D, '/?view=brands'], ['brands-m', M, '/?view=brands', null, MO],
    ['new', D, '/?view=new'], ['saved', D, '/?view=saved'], ['saved2', D, '/?view=saved', null, { storage: { 'hlx.saved': JSON.stringify({ 'https://www.grailed.com/listings/102614695': { k: 1, p: 1, u: 'USD', d: '2026-09-27', g: 0 }, 'https://example.com/x': 1 }) } }],
    ['hl', D, '/?archive=hl'], ['ccp-m', M, '/?archive=ccp', null, MO], ['ccp-q', D, '/?archive=ccp&q=drip&category=outer'],
    ['panel-b', D, '/?archive=hl', async (p) => { await p.hover('.arch a[data-nav="brands"]'); await p.waitForTimeout(600) }],
    ['panel-hl', D, '/?archive=ccp', async (p) => { await p.hover('.arch a[data-nav="hl"]'); await p.waitForTimeout(600) }],
    ['search', D, '/', async (p) => { await p.keyboard.press('/'); await p.keyboard.type('helmut'); await p.waitForTimeout(700) }],
    ['search2', D, '/', async (p) => { await p.keyboard.press('/'); await p.keyboard.type('coat'); await p.waitForTimeout(700) }],
    ['about', D, '/?view=about'], ['detail', D, '/?archive=ccp', async (p) => { await p.click('#grid .card .t a'); await p.waitForTimeout(900) }],
    ['drawer', D, '/?archive=hl', async (p) => { await p.click('#ftog'); await p.waitForTimeout(600) }],
    ['menu-m', M, '/', async (p) => { await p.click('#menuBtn'); await p.waitForTimeout(600) }, MO], ['nf', D, '/nope']];
  let diff = 0;
  for (const [name, vp, url, act, o] of jobs) {
    const fp = [];
    for (const base of [A, B]) {
      const p = await H.page(b, vp, Object.assign({ reduced: true }, o || {}));
      await p.goto(base + url); await H.ready(p); await p.waitForTimeout(900);
      if (act) await act(p);
      await p.waitForTimeout(300);
      fp.push(await p.evaluate(() => {
        const out = [];
        for (const e of document.querySelectorAll('body *')) {
          const s = getComputedStyle(e); if (s.display === 'none' || e.closest('[hidden]') || ['azb', 'svbr'].includes(e.id)) continue;
          const r = e.getBoundingClientRect(); const t = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ');
          out.push([e.tagName, e.className && typeof e.className === 'string' ? e.className : '', Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height),
            s.visibility, s.color, s.fontSize, s.letterSpacing, e.tagName === 'IMG' ? '' : t.slice(0, 60), e.getAttribute('href') || '', e.getAttribute('aria-label') || ''].join('|'));
        }
        return { list: out, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, title: document.title, url: location.search };
      }));
      await p.context().close();
    }
    const [x, y] = fp; let first = -1;
    for (let i = 0; i < Math.max(x.list.length, y.list.length); i++) if (x.list[i] !== y.list[i]) { first = i; break }
    const same = first < 0 && x.sw === y.sw && x.sh === y.sh && x.title === y.title && x.url === y.url;
    if (!same) diff++;
    console.log(name.padEnd(9), same ? 'SAME' : 'DIFF', x.list.length, y.list.length, x.sh, y.sh, first >= 0 ? '\n   main: ' + x.list[first] + '\n   off:  ' + y.list[first] : '');
  }
  console.log(diff ? diff + ' screens differ' : 'all ' + jobs.length + ' screens identical');
  await b.close(); process.exitCode = diff ? 1 : 0;
})();
