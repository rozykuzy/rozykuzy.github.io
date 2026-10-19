// v6: what the full review of 2026-10-19 asked for — data that cannot break the page, brand searches that land,
// a brand index that fails without hiding the brands, a page that keeps the keyboard, and fewer downloads
const H = require('./harness.cjs');
let pass = 0; const fails = [];
function ok(c, m) { if (c) { pass++; if (process.env.VERBOSE) console.log('  ok', String(m).slice(0, 200)) } else { fails.push(m); console.log('  FAIL', m) } }
const qs = (p) => p.evaluate(() => location.search);
const wait = (p, ms) => p.waitForTimeout(ms);
const count = (p) => p.evaluate(() => { const b = document.querySelector('#count b'); return b ? +b.textContent.replace(/,/g, '') : -1 });
const fs = require('fs'), path = require('path');
const FIX = path.join(__dirname, '../fixtures/BRAND');
const guidi = () => JSON.parse(fs.readFileSync(path.join(FIX, 'b/guidi.json'), 'utf8'));
const index = () => JSON.parse(fs.readFileSync(path.join(FIX, 'index.json'), 'utf8'));
const json = (rt, body) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

(async () => {
  const b = await H.browser();

  // ---------------------------------------------------------------- hostile listing data
  { console.log('hostile data'); const p = await H.page(b, { width: 1440, height: 900 });
    const g = guidi(), it = g.items.find((x) => Array.isArray(x.h) && x.h.length >= 2 && x.u);
    // a currency that is markup, code fields set by the data, offers with holes, a history that is not a list
    it.u = '<meta http-equiv="refresh" content="0;url=https://example.org/">'; it.t = 'ZQXA HOSTILE ' + it.t; it.__lg = '"><b id=pwn>x</b>'; it.__bad = 0;
    const it2 = g.items.find((x) => x !== it && x.g > 1 && Array.isArray(x.v)); it2.t = 'ZQXB HOLES ' + it2.t; it2.v.push(null, 7, 'x'); it2.h = 'nope';
    const it3 = g.items.find((x) => x !== it && x !== it2); it3.t = 'ZQXC SEASON ' + it3.t; it3.e = 'AW88';
    g.sources = {};
    await p.route('**/BRAND/b/guidi.json', (rt) => json(rt, g));
    await p.goto(H.BASE + '/?brand=guidi&sort=k%2B&q=zqxa'); await H.ready(p); await wait(p, 400);
    ok(await count(p) === 1 && !(await p.$('#pwn')), 'a listing cannot write markup through its fields (__lg) ' + await count(p));
    await p.click('#grid .card .t a'); await wait(p, 500);
    const h = await p.$('.dv-info summary:has-text("Price history")');
    if (h) { await h.click(); await wait(p, 300) }
    ok(await p.evaluate(() => !document.querySelector('#dv meta') && !/example\.org/.test(document.getElementById('dv').innerHTML)) && /\?brand=guidi/.test(await qs(p)), 'a currency that is markup is not drawn (no refresh)');
    await p.keyboard.press('Escape'); await wait(p, 400);
    await p.fill('#rq', 'zqxb'); await wait(p, 500);
    await p.click('#grid .card .t a'); await wait(p, 500);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden && !!document.querySelector('.dv-info .offers')), 'offers with holes and a broken history: the listing still opens');
    await p.keyboard.press('Escape'); await wait(p, 400);
    // a brand's two-digit season before 1990 is not put in the 2080s
    await p.fill('#rq', 'zqxc'); await wait(p, 500);
    ok(await p.evaluate(() => /AW88/.test(document.querySelector('#grid .card .vd').textContent)), 'the season stays as the seller wrote it');
    await p.goto(H.BASE + '/?brand=guidi&year=2088'); await H.ready(p); await wait(p, 400);
    ok((await qs(p)) === '?brand=guidi' && await p.evaluate(() => !document.querySelector('#f-y [data-v="2088"]')), 'no year 2088 (the season has no year here) ' + await qs(p));
    ok(await p.evaluate(() => !/Could not load/.test(document.body.textContent)), 'sources that are not a list do not fail the room');
    ok(p.errs.length === 0, 'hostile data: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- search: a brand name and then more words
  { console.log('brand + words'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p);
    const hits = async (w) => { await p.fill('#sq', w); await wait(p, 500); return p.evaluate(() => [...document.querySelectorAll('.sr-bg a.sr-bi')].map((a) => a.getAttribute('href') + ' | ' + a.textContent)) };
    await p.keyboard.press('/'); await wait(p, 300);
    let h = await hits('guidi boots'); ok(/^\/\?brand=guidi&q=boots \| Guidi“boots”$/.test(h[0]), 'guidi boots → Guidi, boots ' + h[0]);
    h = await hits('Rick Owens jacket'); ok(/^\/\?brand=rick-owens&q=jacket/.test(h[0]), 'Rick Owens jacket ' + h[0]);
    h = await hits('リックオウエンス ジャケット'); ok(/^\/\?brand=rick-owens&q=%E3%82%B8%E3%83%A3%E3%82%B1%E3%83%83%E3%83%88 \| Rick Owens“ジャケット”$/.test(h[0]), 'the brand in kana, then a word, as typed ' + h[0]);
    h = await hits('グイディブーツ'); ok(/^\/\?brand=guidi&q=/.test(h[0]) && /“ブーツ”$/.test(h[0]), 'a name and a word with no space between (kana) ' + h[0]);
    h = await hits('helmut lang coat'); ok(/^\/\?archive=hl&q=coat/.test(h[0]), 'an archive by name, then a word ' + h[0]);
    h = await hits('helmut lang'); ok(h[0] === '/?archive=hl | Helmut Lang' || /^\/\?archive=hl \|/.test(h[0]), 'the whole name is the name, not a name and a word ' + h[0]);
    ok(await p.evaluate(() => !document.getElementById('sres').hasAttribute('aria-live') && /brand/i.test(document.getElementById('sStat').textContent)), 'one short status line, not the list read again');
    await hits('guidi boots'); await p.keyboard.press('Enter'); await wait(p, 900); await H.ready(p);
    ok((await qs(p)) === '?brand=guidi&q=boots' && await p.$eval('#rq', (i) => i.value) === 'boots', 'Enter opens the brand room, searched ' + await qs(p));
    ok(p.errs.length === 0, 'brand + words: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- the brand index fails for a while
  { console.log('brand index down'); const srv = await H.serve({ FAIL: 'brand' }); const p = await H.page(b, { width: 1280, height: 900 });
    try {
      await p.goto(srv.base + '/?brand=guidi&category=outer'); await H.ready(p); await wait(p, 2500);
      ok((await qs(p)) === '?brand=guidi&category=outer' && await p.evaluate(() => /Brands · Could not load/i.test(document.querySelector('.err').textContent) && !!document.querySelector('[data-retry="brx"]')), 'a brand address keeps its place and says it could not load ' + await qs(p));
      await p.goto(srv.base + '/?view=brands'); await H.ready(p); await wait(p, 2500);
      ok(await p.evaluate(() => !!document.querySelector('#azb [data-retry="brx"]') && !/2 Brands/i.test(document.getElementById('azm').textContent)), 'the list says it could not load (not "2 brands")');
      await p.goto(srv.base + '/'); await H.ready(p); await wait(p, 2500);
      ok(await p.evaluate(() => document.getElementById('bros').hidden), 'the front page: no brands row');
      ok(p.errs.length === 0, 'index down: no errors ' + p.errs.join(' | '));
    } finally { await p.context().close(); srv.close() } }
  // …and comes back: Retry
  { console.log('brand index retry'); const p = await H.page(b, { width: 1280, height: 900 });
    let n = 0; await p.route('**/BRAND/index.json', (rt) => { n++; return n <= 2 ? rt.fulfill({ status: 503, body: 'down' }) : rt.continue() });
    await p.goto(H.BASE + '/?brand=guidi'); await H.ready(p); await wait(p, 2500);
    ok(await p.evaluate(() => !!document.querySelector('[data-retry="brx"]')), 'down at first (one retry made by itself: ' + n + ' requests)');
    await p.click('[data-retry="brx"]'); await wait(p, 1200); await H.ready(p);
    ok((await qs(p)) === '?brand=guidi' && await p.$eval('#vh', (h) => h.textContent) === 'Guidi' && await count(p) > 0, 'Retry opens the room');
    ok(p.errs.length === 0, 'retry: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- brands A–Z: a name without listings, Listed
  { console.log('A–Z'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?brand=aalto'); await H.ready(p); await wait(p, 600);
    const r = await p.evaluate(() => { const li = document.querySelector('.az-s li[data-s="aalto"]'); const rc = li && li.getBoundingClientRect();
      return { q: location.search, on: li && li.classList.contains('on'), seen: rc && rc.top > 0 && rc.bottom < innerHeight, focus: document.activeElement.id } });
    ok(r.q === '?view=brands' && r.on && r.seen && r.focus === 'azh-A', 'a brand without listings opens the list at its name ' + JSON.stringify(r));
    await p.click('[data-azt="listed"]'); await wait(p, 200);
    const l = await p.evaluate(() => ({ names: [...document.querySelectorAll('.az-s li')].filter((x) => x.offsetParent).length, letters: [...document.querySelectorAll('.az-l a')].filter((x) => x.offsetParent).map((a) => a.textContent).join(''), q: location.search }));
    ok(l.names === 5 && l.q === '?view=brands', 'Listed: only the names that open a room, the address unchanged ' + JSON.stringify(l));
    await p.click('[data-azt="all"]'); await wait(p, 200);
    ok(await p.evaluate(() => [...document.querySelectorAll('.az-s li')].filter((x) => x.offsetParent).length === 132), 'All again');
    ok(await p.evaluate(() => [...document.querySelectorAll('.az-s')].every((s) => !s.hasAttribute('aria-labelledby'))), 'the letters are not landmarks');
    ok(p.errs.length === 0, 'A–Z: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- the keyboard stays where it was
  { console.log('focus'); const p = await H.page(b, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 300);
    await p.focus('.cat[data-cat="데님"]'); await p.keyboard.press('Enter'); await wait(p, 400);
    ok(await p.evaluate(() => document.activeElement.getAttribute('data-cat') === '데님' && document.activeElement.getAttribute('aria-pressed') === 'true'), 'a category chosen by keyboard keeps the focus');
    await p.click('#ftog'); await wait(p, 100);
    ok(await p.evaluate(() => document.activeElement.id === 'sideX'), 'reduced motion: the drawer takes the focus at once');
    ok(await p.evaluate(() => document.getElementById('bar').hasAttribute('inert') && document.getElementById('side').getAttribute('role') === 'dialog'), 'the drawer is a dialog; the page behind it is inert');
    await p.click('#f-y [data-v="1998"]'); await wait(p, 300); await p.click('#f-y [data-v="2001"]'); await wait(p, 300);
    await p.keyboard.press('Escape'); await wait(p, 200);
    ok(await p.evaluate(() => document.activeElement.id === 'ftog' && !document.getElementById('bar').hasAttribute('inert')), 'Escape: back to the button, the page within reach');
    await p.focus('#applied .tok[data-off="cat"]'); await p.keyboard.press('Enter'); await wait(p, 400);
    ok(await p.evaluate(() => document.activeElement.classList.contains('tok')), 'a removed token hands the focus to the next one');
    await p.focus('#rq'); await p.keyboard.type('coat'); await p.keyboard.press('Enter'); await wait(p, 400);
    ok(await p.evaluate(() => document.activeElement.id === 'listH') && /q=coat/.test(await qs(p)), 'Enter in the room search goes to the listings');
    // the detail: Tab reaches the closed accordions; a step is announced; closing returns to the card of the listing open
    await p.click('#grid .card:nth-child(1) .t a'); await wait(p, 300);
    let seenSummary = false; for (let i = 0; i < 25 && !seenSummary; i++) { await p.keyboard.press('Tab'); seenSummary = await p.evaluate(() => document.activeElement.tagName === 'SUMMARY') }
    ok(seenSummary, 'Tab reaches the accordions in the detail');
    await p.keyboard.press('ArrowRight'); await wait(p, 300);
    ok(/^2 \/ /.test(await p.evaluate(() => document.getElementById('live').textContent)), 'the step is announced: ' + await p.evaluate(() => document.getElementById('live').textContent));
    await p.keyboard.press('Escape'); await wait(p, 300);
    ok(await p.evaluate(() => { const c = document.activeElement.closest('.card'); return c && c === document.querySelector('#grid .card:nth-child(2)') }), 'closing returns to the card of the listing last open');
    // load more: the first new listing takes the focus; before a press nothing loads by itself
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await wait(p, 500);
    const before = await p.evaluate(() => document.querySelectorAll('#grid .card').length);
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 300);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await wait(p, 600);
    ok(await p.evaluate(() => document.querySelectorAll('#grid .card').length === 60), 'no more listings by themselves before Load more is pressed');
    await p.click('#moreBtn'); await wait(p, 400);
    ok(await p.evaluate(() => { const c = document.activeElement.closest('.card'); return c && c === document.querySelectorAll('#grid .card')[60] }) && /60 more/.test(await p.evaluate(() => document.getElementById('live').textContent)), 'Load more: the first new listing takes the focus, the count is said (' + before + ')');
    ok(p.errs.length === 0, 'focus: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- what the pages say, and what they no longer repeat
  { console.log('words'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 600);
    const r = await p.evaluate(() => ({ nw: document.querySelectorAll('#tgrid .fl .nw').length, dr: document.querySelectorAll('#dlist .fl .dr').length, order: [...document.querySelectorAll('#main > section, #main > nav')].map((s) => s.id),
      tabs: [...document.querySelectorAll('#todayT .tab')].map((t) => t.dataset.tt), brandCards: document.querySelectorAll('#tgrid .card[data-a^="b:"]').length }));
    ok(r.nw === 0 && r.dr === 0, 'New today does not say NEW on every card, Price drops not PRICE DROP ' + JSON.stringify(r));
    ok(r.order.join() === 'hero,today,bros,drops' && r.tabs.includes('brands') && r.brandCards > 0, 'the front page: archives, New today (with the brands), Brands, Price drops ' + JSON.stringify(r));
    await p.goto(H.BASE + '/?brand=rick-owens'); await H.ready(p); await wait(p, 300);
    const rm = await p.$eval('#rm', (e) => e.textContent), items = +(/Items\s*([\d,]+)/.exec(rm) || [0, '0'])[1].replace(/,/g, ''), dated = /Dated\s*([\d,]+)/.exec(rm);
    ok(!(dated && +dated[1].replace(/,/g, '') >= items) && !/New\s*0\b/.test(rm), 'the room head says nothing twice and no zeros: ' + rm);
    await p.click('#grid .card .t a'); await wait(p, 400);
    ok(await p.evaluate(() => { const dd = [...document.querySelectorAll('.dv-info .kv dt')].find((d) => d.textContent === '분류'); return dd && /^[A-Z&a-z ]+$/.test(dd.nextElementSibling.textContent) && !document.querySelector('.dv-info .vd .at a') }), 'the detail: category in English; no link to the room it is in');
    await p.keyboard.press('Escape'); await wait(p, 300);
    await p.goto(H.BASE + '/?view=new'); await H.ready(p); await wait(p, 400);
    await p.click('#newT [data-nt="brands"]'); await wait(p, 300); await p.click('#ngrid .card .t a'); await wait(p, 400);
    ok(await p.evaluate(() => /^\/\?brand=/.test((document.querySelector('.dv-info .vd .at a') || {}).getAttribute && document.querySelector('.dv-info .vd .at a').getAttribute('href'))), 'from New in, the brand line leads to its room');
    await p.keyboard.press('Escape'); await wait(p, 300);
    await p.goto(H.BASE + '/?view=saved'); await H.ready(p); await wait(p, 400);
    ok(await p.evaluate(() => !document.getElementById('svx').hidden && document.querySelectorAll('#svx a.btn').length === 4 && document.querySelector('meta[name="robots"]').content === 'noindex'), 'Saved, empty: the ways in; not for search engines');
    await p.click('#svx a[href="/?view=brands"]'); await wait(p, 800);
    ok(await p.evaluate(() => !document.querySelector('meta[name="robots"]') && document.querySelector('link[rel="canonical"]').href === 'https://rozykuzy.github.io/?view=brands'), 'elsewhere: indexable, its own canonical');
    ok(p.errs.length === 0, 'words: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- downloads: what a page asks for
  { console.log('downloads'); const p = await H.page(b, { width: 1440, height: 900 });
    const seen = []; p.on('request', (r) => seen.push(new URL(r.url()).pathname));
    await p.goto(H.BASE + '/?brand=rick-owens'); await H.ready(p); await wait(p, 2500);
    ok(!seen.some((u) => /^\/(helmut-lang|ccp)\/$/.test(u)) && seen.includes('/BRAND/b/rick-owens.json'), 'a brand room asks for neither archive');
    ok(seen.indexOf('/BRAND/b/rick-owens.json') < seen.indexOf('/BRAND/index.json') + 2, 'the brand file is asked for beside the index, not after it ' + seen.filter((u) => /BRAND/.test(u)).join(' '));
    const html = await (await p.request.get(H.BASE + '/')).text();
    ok(!/rel="canonical"/.test(html) && /no-referrer/.test(html) && /application\/ld\+json/.test(html), 'the page itself: no canonical before the script, no referrer, a WebSite line');
    // leaving a brand room while its file is on the way lets it go
    const slow = await H.serve({ SLOW: '2500' }); const q = await H.page(b, { width: 1280, height: 900 }); const failed = [];
    q.on('requestfailed', (r) => failed.push(new URL(r.url()).pathname + ' ' + r.failure().errorText));
    try {
      await q.goto(slow.base + '/?brand=guidi'); await wait(q, 3200);
      await q.click('.arch a[data-nav="brands"]'); await wait(q, 400); await q.click('.az-s a[href="/?brand=uma-wang"]'); await wait(q, 300);
      await q.click('.arch a[data-nav="new"]'); await wait(q, 3500);
      ok(failed.some((x) => /uma-wang\.json .*ABORTED/i.test(x)), 'a brand file still on its way when the reader leaves is let go ' + failed.join(' | '));
      ok(q.errs.length === 0, 'abort: no errors ' + q.errs.join(' | '));
    } finally { await q.context().close(); slow.close() }
    ok(p.errs.length === 0, 'downloads: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- Saved with many brands: drawn a few times, not thousands
  { console.log('saved, many brands'); const idx = index(), many = [];
    idx.brands.filter((x) => !x.ex && !x.c).slice(0, 9).forEach((x) => { x.c = 50; x.nw = 1; many.push(x.s) });
    const store = {}; many.forEach((s, i) => { store[s + '|k' + i] = { k: 1, p: 1, u: '', d: '2026-10-18', g: 0 } });
    const srv = await H.serve({ SLOW: '600' });
    const p = await H.page(b, { width: 1280, height: 900 }, { storage: { 'brx.saved': JSON.stringify(store) } });
    try {
      await p.route('**/BRAND/index.json', (rt) => json(rt, idx));
      await p.route(/\/BRAND\/b\/(?!guidi|rick-owens|uma-wang)[a-z0-9-]+\.json$/, async (rt) => { await new Promise((r) => setTimeout(r, 300 + Math.random() * 900)); json(rt, guidi()) });
      await p.addInitScript(() => { window.__draws = 0; document.addEventListener('DOMContentLoaded', () => { new MutationObserver((ms) => { if (ms.some((m) => m.target.id === 'svbr')) window.__draws++ }).observe(document.getElementById('main'), { childList: true, subtree: true }) }) });
      const t0 = Date.now(); await p.goto(srv.base + '/?view=saved'); await wait(p, 6000);
      const r = await p.evaluate(() => ({ draws: window.__draws, heads: document.querySelectorAll('#svbr .sg-h').length, miss: document.querySelectorAll('#svbr .miss li').length }));
      ok(r.heads === 9 && r.miss === 9 && r.draws <= 14, 'nine brands drawn ' + r.draws + ' times ' + JSON.stringify(r) + ' in ' + (Date.now() - t0) + 'ms');
      ok(p.errs.length === 0, 'saved many: no errors ' + p.errs.join(' | '));
    } finally { await p.context().close(); srv.close() } }

  // ---------------------------------------------------------------- memory: the last eight brand rooms stay read
  { console.log('memory'); const idx = index(), slugs = idx.brands.filter((x) => !x.ex && !x.c).slice(0, 10).map((x) => { x.c = 50; return x.s });
    const p = await H.page(b, { width: 1280, height: 900 }); const got = {};
    await p.route('**/BRAND/index.json', (rt) => json(rt, idx));
    await p.route(/\/BRAND\/b\/[a-z0-9-]+\.json$/, (rt) => { const s = rt.request().url().split('/').pop().replace('.json', ''); got[s] = (got[s] || 0) + 1; json(rt, guidi()) });
    const open = async (s) => { await p.evaluate((h) => { const a = document.createElement('a'); a.href = h; document.body.appendChild(a); a.click(); a.remove() }, '/?brand=' + s); await wait(p, 200); await H.ready(p) };
    await p.goto(H.BASE + '/?view=brands'); await H.ready(p);
    for (const s of slugs) await open(s);
    await open(slugs[0]); await open(slugs[9]);
    ok(got[slugs[0]] === 2 && got[slugs[9]] === 1 && got[slugs[5]] === 1, 'the oldest room is read again, the newest is still here ' + JSON.stringify([got[slugs[0]], got[slugs[5]], got[slugs[9]]]));
    ok(await p.$eval('#vh', (h) => h.textContent) === idx.brands.find((x) => x.s === slugs[9]).n && await count(p) > 0, 'and its room is whole');
    ok(p.errs.length === 0, 'memory: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- a large brand file is read in slices, and whole
  { console.log('large brand'); const g = guidi(), base = g.items.slice(), big = [];
    for (let r = 0; r < 8; r++) base.forEach((x, i) => big.push(Object.assign({}, x, { l: x.l + '&r=' + r + '-' + i })));
    g.items = big; const idx = index(); idx.brands.find((x) => x.s === 'guidi').c = big.filter((x) => !x.x && !x.so).length;
    const p = await H.page(b, { width: 1280, height: 900 });
    await p.route('**/BRAND/index.json', (rt) => json(rt, idx)); await p.route('**/BRAND/b/guidi.json', (rt) => json(rt, g));
    await p.addInitScript(() => { window.__frames = 0; const f = () => { window.__frames++; requestAnimationFrame(f) }; requestAnimationFrame(f) });
    await p.goto(H.BASE + '/?brand=guidi'); await H.ready(p); await wait(p, 600);
    const n = await count(p);
    ok(big.length > 6000 && n === big.filter((x) => !x.x && !x.so).length && await p.evaluate(() => document.querySelectorAll('#grid .card').length === 60), 'a brand of ' + big.length + ' listings opens whole: ' + n);
    ok(p.errs.length === 0, 'large brand: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- after the review of v6
  { console.log('review'); const p = await H.page(b, { width: 1440, height: 900 });
    // the front page's New today holds brand listings: one opened there has an address that opens it again
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 600);
    const firstRow = await p.evaluate(() => [...document.querySelectorAll('#tgrid .card')].slice(0, 4).map((c) => c.dataset.a));
    ok(firstRow.some((a) => /^b:/.test(a)) && firstRow.includes('hl'), 'New today: each source in the first row ' + firstRow.join());
    await p.click('#tgrid .card[data-a^="b:"] .t a'); await wait(p, 500);
    const q1 = await qs(p), t1 = await p.$eval('#dvT', (h) => h.textContent);
    await p.reload(); await H.ready(p); await wait(p, 800);
    ok(/^\?item=/.test(q1) && (await qs(p)) === q1 && await p.evaluate(() => !document.getElementById('ov').hidden) && await p.$eval('#dvT', (h) => h.textContent) === t1, 'a brand listing from the front page reopens from its address ' + q1);
    await p.keyboard.press('Escape'); await wait(p, 400);
    // back into an open listing across a change of filter: the list it steps through is the one in the address
    await p.goto(H.BASE + '/?archive=hl&motif=bondage&sort=k%2B'); await H.ready(p); await wait(p, 300);
    await p.click('#grid .card:nth-child(5) .t a'); await wait(p, 500);
    const pos0 = await p.$eval('.dv-pos', (e) => e.textContent);
    await p.click('.dv-info .tag[data-motif="bondage"]'); await wait(p, 900);
    await p.goBack(); await wait(p, 900);
    const pos1 = await p.evaluate(() => (document.querySelector('.dv-pos') || {}).textContent);
    ok(/^5 \//.test(pos0) && pos1 === pos0, 'Back into the open listing: the same place in the same list ' + pos0 + ' → ' + pos1);
    await p.keyboard.press('ArrowRight'); await wait(p, 300);
    ok(/^6 \//.test(await p.$eval('.dv-pos', (e) => e.textContent)), 'and Next goes on from there');
    await p.keyboard.press('Escape'); await wait(p, 400);
    // the drawer's count speaks while the bar behind it is inert
    ok(await p.evaluate(() => { const n = document.getElementById('sideN'); return n.getAttribute('role') === 'status' && n.getAttribute('aria-live') === 'polite' }), 'the drawer has its own status line');
    // Enter: a brand by name; a word that is no brand's name goes to the listings
    await p.keyboard.press('/'); await p.fill('#sq', 'leather'); await wait(p, 500); await p.keyboard.press('Enter'); await wait(p, 900);
    ok(/archive=hl/.test(await qs(p)) && /q=leather/.test(await qs(p)), 'Enter on a plain word: the listings ' + await qs(p));
    ok(p.errs.length === 0, 'review: no errors ' + p.errs.join(' | '));
    await p.context().close(); }
  // Saved: removing the last missing row of an archive keeps the keyboard on the page
  { console.log('saved remove'); const p = await H.page(b, { width: 1280, height: 900 }, { storage: { 'hlx.saved': JSON.stringify({ 'https://example.com/gone-1': { k: 1, p: 1, u: '', d: '2026-10-18', g: 0 } }) } });
    await p.goto(H.BASE + '/?view=saved'); await H.ready(p); await wait(p, 500);
    await p.focus('#sgm-hl [data-unsave]'); await p.keyboard.press('Enter'); await wait(p, 400);
    ok(await p.evaluate(() => document.activeElement !== document.body && document.activeElement.getClientRects().length > 0 && !document.querySelector('#sgm-hl li')), 'the focus lands on something visible: ' + await p.evaluate(() => document.activeElement.id || document.activeElement.tagName));
    ok(p.errs.length === 0, 'saved remove: no errors ' + p.errs.join(' | '));
    await p.context().close(); }
  // the brand index down: leaving the could-not-load page and coming back leaves no lock or inert behind
  { console.log('down and back'); const srv = await H.serve({ FAIL: 'brand' }); const p = await H.page(b, { width: 1280, height: 900 });
    try {
      await p.goto(srv.base + '/?brand=guidi'); await H.ready(p); await wait(p, 2500);
      await p.click('.arch a[data-nav="hl"]'); await wait(p, 900); await H.ready(p);
      await p.click('#ftog'); await wait(p, 500);
      await p.goBack(); await wait(p, 900);
      const r = await p.evaluate(() => ({ lock: document.documentElement.className, inert: ['top', 'foot', 'main'].filter((id) => document.getElementById(id).hasAttribute('inert')), q: location.search }));
      ok(!/lock/.test(r.lock) && r.inert.length === 0 && r.q === '?brand=guidi', 'back on the could-not-load page: nothing locked or inert ' + JSON.stringify(r));
      ok(p.errs.length === 0, 'down and back: no errors ' + p.errs.join(' | '));
    } finally { await p.context().close(); srv.close() } }

  // ---------------------------------------------------------------- the preview of 2026-10-20: a relisting, the search's suggestions
  { console.log('preview'); const p = await H.page(b, { width: 1440, height: 900 });
    // (the CCP fixture has one jacket listed twice on Grailed the same day: same title, price, size)
    const keys = (sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' .card')].map((c) => c.querySelector('.t').textContent + '|' + c.querySelector('.cap').innerText.replace(/\s+/g, ' ')), sel);
    const twice = (l) => l.filter((x, i) => l.indexOf(x) !== i);
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 600);
    let k = await keys('#tgrid');
    ok(k.length >= 8 && twice(k).length === 0, 'New today on the front page: a relisting takes one place ' + twice(k).join(' / '));
    await p.click('#todayT [data-tt="ccp"]'); await wait(p, 300);
    k = await keys('#tgrid');
    ok(k.length === 10 && twice(k).length === 0, 'and in the CCP tab (11 listings, 10 pieces) ' + k.length);
    ok(await p.$eval('#todayT [data-tt="ccp"] sup', (s) => s.textContent) === '11', 'the tab still counts listings');
    await p.goto(H.BASE + '/?view=new'); await H.ready(p); await wait(p, 600);
    await p.click('#newT [data-nt="ccp"]'); await wait(p, 300);
    ok((await keys('#ngrid')).length === 11, 'New in keeps every listing');
    // the suggestions stand in for results: gone while there are some, back when there are none
    await p.keyboard.press('/'); await wait(p, 300);
    const hint = () => p.evaluate(() => !document.getElementById('sHint').hidden);
    ok(await hint(), 'search: suggestions before a word is typed');
    await p.fill('#sq', 'guidi boots'); await wait(p, 500);
    ok(!(await hint()), 'search: no suggestions under a brand that answers');
    await p.fill('#sq', 'bondage'); await wait(p, 500);
    ok(!(await hint()), 'search: no suggestions under listings');
    await p.fill('#sq', 'zzqqxxnothing'); await wait(p, 500);
    ok(await hint(), 'search: suggestions when nothing answers');
    await p.keyboard.press('Escape'); await wait(p, 300);
    // the filter's year list: "No year" on one line
    await p.goto(H.BASE + '/?brand=guidi'); await H.ready(p); await wait(p, 400);
    await p.click('#ftog'); await wait(p, 500);
    ok(await p.evaluate(() => { const s = document.querySelector('#f-y .yb.none span'); return !!s && s.getClientRects().length === 1 }), 'the filter: No year on one line');
    ok(p.errs.length === 0, 'preview: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- a phone: tabs, the brand line, the brands row
  { console.log('phone'); const p = await H.page(b, { width: 360, height: 780 }, { mobile: true, dpr: 2 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 600);
    const r = await p.evaluate(() => { const t = document.getElementById('todayT'); return { fit: t.scrollWidth <= t.clientWidth + 1, labels: [...t.querySelectorAll('.tab')].map((x) => x.innerText.replace(/\s+/g, ' ')),
      names: [...t.querySelectorAll('.tab[aria-label]')].map((x) => x.getAttribute('aria-label')), tiles: [...document.querySelectorAll('#bgrid .bt')].filter((x) => x.offsetParent).length,
      at: [...document.querySelectorAll('#tgrid .card .vd .at')].filter((x) => x.offsetParent).every((x) => x.getBoundingClientRect().height < 20 && getComputedStyle(x).flexBasis === '100%') } });
    ok(r.fit && r.labels.some((l) => /^HL/.test(l)) && r.names.some((n) => /Helmut Lang \(HL\)/.test(n)), 'phone: the tabs fit (HL, CCP), and keep the names for a screen reader ' + JSON.stringify(r));
    ok(r.tiles === 2 && r.at, 'phone: two brand tiles; a card\'s brand on a line of its own ' + JSON.stringify(r));
    ok(p.errs.length === 0, 'phone: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
  await b.close();
})();
