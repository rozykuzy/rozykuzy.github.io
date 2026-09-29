// the photographs around the names: at every screen size they keep clear of the words,
// of each other and of the sheet's edges (a hover caption still fits under each one), and each can be pressed
const H = require('./harness.cjs');
const VPS = [
  [360, 740, 1], [375, 667, 1], [390, 844, 1], [430, 932, 1], [600, 960, 0], [680, 900, 0], [667, 375, 1], [740, 360, 1], [844, 390, 1], [932, 430, 1],
  [768, 1024, 0], [820, 1180, 0], [1024, 1366, 0], [1024, 768, 0], [1112, 834, 0], [1180, 820, 0],
  [1280, 720, 0], [1280, 800, 0], [1366, 768, 0], [1440, 900, 0], [1536, 864, 0], [1680, 1050, 0],
  [1920, 800, 0], [1920, 1080, 0], [1920, 1200, 0], [2560, 1080, 0], [2560, 1440, 0], [3440, 1440, 0],
];
const only = process.argv[2] ? process.argv[2].split(',') : null;
(async () => {
  const b = await H.browser(); let bad = 0;
  for (const [w, h, m] of VPS) {
    if (only && !only.includes(w + 'x' + h)) continue;
    const p = await H.page(b, { width: w, height: h }, m ? { mobile: true, dpr: 2 } : {});
    await p.goto(H.BASE + '/'); await H.ready(p); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const hero = document.getElementById('hero').getBoundingClientRect();
      const box = (x, pad = 0) => ({ l: x.left - pad, t: x.top - pad, r: x.right + pad, b: x.bottom + pad });
      const hit = (a, c) => Math.min(a.r, c.r) - Math.max(a.l, c.l) > 0.5 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 0.5;
      // the words as they are drawn: each text run, and each word of the names
      const text = [];
      const add = (el, pad) => { const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n);
          for (const x of rg.getClientRects()) if (x.width > 0) text.push({ s: n.textContent.trim().slice(0, 16), ...box(x, pad) }) } };
      document.querySelectorAll('.room-name .wd').forEach((e) => text.push({ s: e.textContent.trim(), ...box(e.getBoundingClientRect(), 12) }));
      document.querySelectorAll('.room-no, .room-meta, #heroD').forEach((e) => add(e, 10));
      // the arrow that appears beside a name on hover (wide screens)
      if (innerWidth >= 1024) document.querySelectorAll('.room-go').forEach((e) => text.push({ s: '→', ...box(e.getBoundingClientRect(), 4) }));
      const tiles = [...document.querySelectorAll('#col .tile')].filter((e) => getComputedStyle(e).display !== 'none')
        .map((e) => ({ i: [...e.parentNode.children].indexOf(e) + 1, ...box(e.getBoundingClientRect()) }));
      const issues = [];
      for (const t of tiles) for (const x of text) if (hit(t, x)) { issues.push(t.i + ' on "' + x.s + '"'); break }
      for (let i = 0; i < tiles.length; i++) for (let j = i + 1; j < tiles.length; j++) if (hit(tiles[i], tiles[j])) issues.push(tiles[i].i + ' on ' + tiles[j].i);
      for (const t of tiles) { if (t.l < hero.left - 0.5 || t.r > hero.right + 0.5 || t.t < hero.top - 0.5) issues.push(t.i + ' past the edge');
        else if (t.b + 20 > hero.bottom + 0.5) issues.push(t.i + ' no room for its caption (' + Math.round(hero.bottom - t.b) + 'px)') }
      // each photograph can be pressed: nothing laid over it catches the pointer
      for (const t of tiles) { const el = document.querySelector('#col .tile:nth-child(' + t.i + ')');
        const pts = [[.5, .5], [.12, .12], [.88, .12], [.12, .88], [.88, .88]].map(([fx, fy]) => [t.l + (t.r - t.l) * fx, t.t + (t.b - t.t) * fy]);
        const miss = pts.filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth - 1 && y < innerHeight - 1).filter(([x, y]) => { const e = document.elementFromPoint(x, y); return !e || !el.contains(e) });
        if (miss.length) { const e = document.elementFromPoint(miss[0][0], miss[0][1]); issues.push(t.i + ' covered by ' + (e ? e.tagName.toLowerCase() + '.' + e.className : 'nothing')) } }
      const ws = tiles.map((t) => Math.round(t.r - t.l));
      return { n: tiles.length, hero: Math.round(hero.height), fs: parseFloat(getComputedStyle(document.querySelector('.room-name')).fontSize), min: Math.min(...ws), max: Math.max(...ws), issues };
    });
    if (r.issues.length) bad++;
    console.log((r.issues.length ? 'FAIL ' : 'ok   ') + (w + 'x' + h).padEnd(10) + ' ' + r.n + ' photos ' + r.min + '–' + r.max + 'px  sheet ' + r.hero + '  name ' + r.fs + 'px' + (r.issues.length ? '\n       ' + r.issues.join(' · ') : ''));
    await p.context().close();
  }
  console.log('\n' + (bad ? bad + ' sizes with clashes' : 'all sizes clear'));
  await b.close(); process.exitCode = bad ? 1 : 0;
})();
