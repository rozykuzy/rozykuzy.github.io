// behaviour suite for the combined index — run against tools/serve.mjs
const H = require('./harness.cjs');
let pass = 0; const fails = [];
let CCPDRIP = -1;   // the CCP room's count for drip, read again after a brand room has been opened
function ok(c, m) { if (c) { pass++; if (process.env.VERBOSE) console.log('  ok', String(m).slice(0, 220)) } else { fails.push(m); console.log('  FAIL', m) } }
const qs = (p) => p.evaluate(() => location.search);
const wait = (p, ms) => p.waitForTimeout(ms);
async function count(p) { return p.evaluate(() => { const b = document.querySelector('#count b'); return b ? +b.textContent.replace(/,/g, '') : -1 }) }
async function cards(p) { return p.evaluate(() => document.querySelectorAll('#grid .card:not(.sk)').length) }

(async () => {
  const b = await H.browser();
  // ---------------------------------------------------------------- home
  { console.log('home'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 400);
    const r = await p.evaluate(() => ({ st: [...document.querySelectorAll('.room-stat')].map((e) => e.textContent), today: document.querySelectorAll('#tgrid .card').length,
      tags: document.querySelectorAll('#tgrid .at').length, shown: [...document.querySelectorAll('#tgrid .card')].filter((c) => c.offsetParent).length,
      cols: getComputedStyle(document.getElementById('tgrid')).gridTemplateColumns.split(' ').length, mos: document.querySelectorAll('.room-ph img').length,
      rooms: [...document.querySelectorAll('.rooms .room')].map((a) => a.getAttribute('href')) }));
    ok(r.st.every((t) => /Items/i.test(t)), 'home: both rooms have stats ' + JSON.stringify(r.st));
    ok(r.today > 0 && r.tags === r.today, 'home: today grid with archive tags ' + r.today + '/' + r.tags);
    ok(r.shown > 0 && r.shown % r.cols === 0 || r.shown === r.today, 'home: today shows whole rows ' + r.shown + ' in ' + r.cols + ' columns');
    ok(r.mos === 2, 'home: one photograph behind each archive ' + r.mos);
    ok(r.rooms.join() === '/?archive=hl,/?archive=ccp', 'home: the two archives link to their rooms ' + r.rooms.join());
    await p.click('.room.r-ccp'); await wait(p, 700);
    ok((await qs(p)) === '?archive=ccp', 'home → ccp room url ' + (await qs(p)));
    ok(await p.evaluate(() => document.documentElement.dataset.room === 'ccp'), 'ccp palette');
    await p.goBack(); await wait(p, 700);
    ok((await qs(p)) === '' && await p.evaluate(() => !!document.querySelector('.rooms')), 'back to home');
    ok(p.errs.length === 0, 'home: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- HL room, desktop
  { console.log('hl room'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 300);
    const total = await count(p);
    ok(total > 4000, 'hl total ' + total);
    ok(await cards(p) === 60, 'first batch 60');
    const tabN = await p.evaluate(() => +document.querySelector('.cat[data-cat="아우터"] .n').textContent.replace(/,/g, ''));
    await p.click('.cat[data-cat="아우터"]'); await wait(p, 250);
    ok((await qs(p)) === '?archive=hl&category=outer', 'tab url ' + (await qs(p)));
    ok(await count(p) === tabN, 'tab count matches ' + tabN);
    // certainty facet sums to the count shown
    const certSum = await p.evaluate(() => [...document.querySelectorAll('#f-cert .op-n')].reduce((a, e) => a + +e.textContent.replace(/,/g, ''), 0));
    ok(certSum === tabN, 'cert facet sums to view ' + certSum + ' vs ' + tabN);
    await p.click('#ftog'); await wait(p, 450);
    ok(await p.evaluate(() => document.getElementById('side').classList.contains('open') && document.documentElement.classList.contains('lock-side')), 'filter drawer opens on a wide screen');
    await p.click('#f-y [data-v="1998"]'); await wait(p, 250);
    await p.click('#f-y [data-v="1999"]'); await wait(p, 250);
    ok((await qs(p)) === '?archive=hl&category=outer&year=1998-1999', 'years packed ' + (await qs(p)));
    const tok = await p.evaluate(() => [...document.querySelectorAll('#applied .tok')].map((t) => t.textContent));
    ok(tok.some((t) => /1998–1999/.test(t)), 'range token ' + tok.join(','));
    const n2 = await count(p);
    await p.click('#sideDone'); await wait(p, 450);
    ok(await p.evaluate(() => !document.getElementById('side').classList.contains('open') && !document.documentElement.classList.contains('lock-side')), 'drawer closes');
    await p.click('#applied .tok[data-off="y"]'); await wait(p, 250);
    ok((await qs(p)) === '?archive=hl&category=outer', 'range token removes both years ' + (await qs(p)));
    await p.goBack(); await wait(p, 300);
    ok((await qs(p)) === '?archive=hl&category=outer&year=1998-1999' && await count(p) === n2, 'back restores years');
    await p.goBack(); await p.goBack(); await wait(p, 300);
    ok((await qs(p)) === '?archive=hl&category=outer', 'back twice ' + (await qs(p)));
    // search
    await p.fill('#rq', 'bondage'); await wait(p, 450);
    ok((await qs(p)) === '?archive=hl&category=outer&q=bondage', 'search url ' + (await qs(p)));
    ok(await p.$eval('#sort', (s) => s.value) === 'rel', 'search sorts by relevance');
    const nq = await count(p); ok(nq > 0 && nq < tabN, 'search narrows ' + nq);
    await p.click('#rqx'); await wait(p, 300);
    ok((await qs(p)) === '?archive=hl&category=outer', 'clear search url ' + (await qs(p)));
    ok(await p.$eval('#sort', (s) => s.value) === 'new', 'sort restored to new');
    // sort
    await p.selectOption('#sort', 'k+'); await wait(p, 300);
    ok((await qs(p)) === '?archive=hl&category=outer&sort=k%2B', 'sort url ' + (await qs(p)));
    const pr = await p.evaluate(() => [...document.querySelectorAll('#grid .card')].slice(0, 5).map((c) => +c.querySelector('.p').textContent.replace(/[^\d].*$/, '').replace(/\D/g, '') || +c.querySelector('.p').textContent.split(' ')[0].replace(/\D/g, '')));
    ok(pr.every((v, i) => i === 0 || v >= pr[i - 1]), 'ascending prices ' + pr.join(','));
    await p.reload(); await H.ready(p); await wait(p, 300);
    ok(await p.$eval('#sort', (s) => s.value) === 'k+', 'k+ survives reload');
    // more
    await p.selectOption('#sort', 'new'); await wait(p, 300);
    await p.click('.cat[data-cat=""]'); await wait(p, 300);
    await p.click('#moreBtn'); await wait(p, 300);
    ok(await cards(p) >= 120, 'more → ' + (await cards(p)));
    // detail
    await p.evaluate(() => window.scrollTo(0, 0));
    const firstTitle = await p.$eval('#grid .card .t a', (a) => a.textContent);
    await p.click('#grid .card .t a'); await wait(p, 400);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden), 'detail open');
    ok(/item=[0-9a-z]+/.test(await qs(p)), 'item in url ' + (await qs(p)));
    ok(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('dv-x')), 'focus on close');
    ok(await p.$eval('#dvT', (h) => h.textContent) === firstTitle, 'detail title matches card');
    const pos1 = await p.$eval('.dv-pos', (e) => e.textContent);
    await p.keyboard.press('ArrowRight'); await wait(p, 300);
    const pos2 = await p.$eval('.dv-pos', (e) => e.textContent);
    ok(/^1 \//.test(pos1) && /^2 \//.test(pos2), 'arrow steps ' + pos1 + ' → ' + pos2);
    await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
    ok(await p.evaluate(() => document.getElementById('dv').contains(document.activeElement)), 'tab stays in dialog');
    await p.keyboard.press('Escape'); await wait(p, 450);
    ok(await p.evaluate(() => document.getElementById('ov').hidden), 'escape closes');
    ok(!/item=/.test(await qs(p)), 'item removed on close ' + (await qs(p)));
    ok(await p.evaluate(() => !!document.activeElement.closest('.card')), 'focus back on a card');
    // save
    await p.click('#grid .card .sv'); await wait(p, 200);
    const sv = await p.evaluate(() => ({ n: document.getElementById('savedN').textContent, ls: Object.keys(JSON.parse(localStorage.getItem('hlx.saved') || '{}')).length, pressed: document.querySelector('#grid .card .sv').getAttribute('aria-pressed') }));
    ok(sv.n === '1' && sv.ls === 1 && sv.pressed === 'true', 'save ' + JSON.stringify(sv));
    await p.click('.utl a[data-nav="saved"]'); await wait(p, 600);
    ok((await qs(p)) === '?view=saved' && await p.evaluate(() => document.querySelectorAll('#sgg-hl .card').length === 1), 'saved view lists it');
    await p.click('#sgg-hl .card .sv'); await wait(p, 300);
    ok(await p.evaluate(() => document.querySelectorAll('.sg:not([hidden]) .card').length === 0 && document.getElementById('savedN').textContent === ''), 'unsave in saved view');
    ok(p.errs.length === 0, 'hl: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- CCP: three languages, sale records, model numbers
  { console.log('ccp room'); const p = await H.page(b, { width: 1280, height: 900 });
    await p.goto(H.BASE + '/?archive=ccp'); await H.ready(p);
    const n = {};
    for (const w of ['drip', 'ドリップ', '드립']) { await p.fill('#rq', w); await wait(p, 400); n[w] = await count(p) }
    ok(n.drip > 0 && n.drip === n['ドリップ'] && n.drip === n['드립'], 'three languages ' + JSON.stringify(n)); CCPDRIP = n.drip;
    await p.fill('#rq', ''); await wait(p, 400);
    const live = await count(p);
    await p.click('#ftog'); await wait(p, 450);
    await p.click('#f-flag [data-v="sold"]'); await wait(p, 300);
    const sold = await count(p), recs = await p.evaluate(() => document.querySelectorAll('#grid .card.rec').length);
    ok(sold > 0 && recs === Math.min(sold, 60), 'sale records only ' + sold + '/' + recs);
    await p.click('#f-flag [data-v="sold"]'); await wait(p, 300);
    ok(await count(p) === live, 'sale records off again');
    await p.keyboard.press('Escape'); await wait(p, 450);
    ok(await p.evaluate(() => !document.getElementById('side').classList.contains('open') && document.activeElement.id === 'ftog'), 'escape closes the drawer, focus back on its button');
    const code = await p.evaluate(() => { const m = document.querySelector('#grid .sub .mc'); return m ? m.textContent : null });
    if (code) { await p.fill('#rq', code.toLowerCase()); await wait(p, 400); ok(await count(p) > 0, 'model number search ' + code) }
    ok(p.errs.length === 0, 'ccp: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- search across both
  { console.log('global search'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p);
    await p.keyboard.press('/'); await wait(p, 300);
    ok(await p.evaluate(() => !document.getElementById('search').hidden && document.activeElement.id === 'sq'), 'slash opens search');
    await p.keyboard.type('leather'); await wait(p, 500);
    const g = await p.evaluate(() => [...document.querySelectorAll('.sr-g')].map((s) => s.querySelectorAll('.sr-i').length));
    ok(g.length === 2 && g[0] > 0 && g[1] > 0, 'both archives answer ' + g);
    await p.keyboard.press('ArrowDown'); ok(await p.evaluate(() => document.activeElement.classList.contains('sr-i')), 'arrow into results');
    await p.keyboard.press('Enter'); await wait(p, 900);
    ok(/archive=hl/.test(await qs(p)) && /item=/.test(await qs(p)) && /q=leather/.test(await qs(p)), 'result opens room + detail ' + (await qs(p)));
    ok(await p.evaluate(() => !document.getElementById('ov').hidden), 'detail shown');
    await p.keyboard.press('Escape'); await wait(p, 450);
    ok(/q=leather/.test(await qs(p)) && !/item=/.test(await qs(p)), 'closing leaves the search ' + (await qs(p)));
    await p.keyboard.press('/'); await p.fill('#sq', 'helmut lang'); await wait(p, 400);
    ok(await p.evaluate(() => /Brand names are not search terms/.test(document.getElementById('sres').textContent)), 'brand-only query explained');
    await p.keyboard.press('Escape'); await wait(p, 300);
    ok(await p.evaluate(() => document.getElementById('search').hidden && document.activeElement.id === 'searchBtn'), 'escape closes search, focus back');
    ok(p.errs.length === 0, 'search: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- phone
  { console.log('phone'); const p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2 });
    await p.goto(H.BASE + '/'); await H.ready(p);
    await p.click('#menuBtn'); await wait(p, 300);
    ok(await p.evaluate(() => !document.getElementById('drawer').hidden), 'menu opens');
    await p.click('#drawer a[data-nav="ccp"]'); await wait(p, 800);
    ok((await qs(p)) === '?archive=ccp' && await p.evaluate(() => document.getElementById('drawer').hidden), 'menu navigates and closes');
    await p.click('#ftog'); await wait(p, 300);
    ok(await p.evaluate(() => document.getElementById('side').classList.contains('open')), 'filter sheet opens');
    await p.click('#f-cert [data-v="A"]'); await wait(p, 300);
    const lbl = await p.$eval('#sideDone', (x) => x.textContent);
    await p.click('#sideDone'); await wait(p, 300);
    ok(!await p.evaluate(() => document.getElementById('side').classList.contains('open')) && /^Show [\d,]+ items?$/i.test(lbl), 'sheet closes ' + lbl);
    ok((await qs(p)) === '?archive=ccp&year-basis=confirmed', 'cert url ' + (await qs(p)));
    for (const w of [360, 390, 430]) { await p.setViewportSize({ width: w, height: 800 }); await wait(p, 200); const o = await H.overflow(p); ok(o.sw <= o.w, 'no overflow at ' + w + ' ' + JSON.stringify(o)) }
    await p.click('#grid .card .ph'); await wait(p, 400);
    const o2 = await H.overflow(p); ok(o2.sw <= o2.w, 'detail no overflow');
    const box = await p.$eval('#dv', (d) => { const r = d.getBoundingClientRect(); return [r.left, r.width] });
    ok(box[0] === 0 && box[1] === 430, 'detail full width ' + box);
    ok(p.errs.length === 0, 'phone: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- hostile addresses
  { console.log('hostile urls'); const p = await H.page(b, { width: 1280, height: 900 });
    for (const u of ['/?archive=hl&sort=%22&q=%&year=abcd,1998-1990&category=__proto__&show=constructor,gone&item=ZZZZZZZZZZ&source=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
      '/?archive=ccp&year=1000-3000&price=__proto__&label=toString&size=%3Cb%3E&q=%E0%A4%A',
      '/?view=about&archive=ccp', '/?archive=HL', '/?archive=ccp&item=0', '/?view=saved&item=abc',
      '/?archive=hl&category=constructor&motif=constructor,hasOwnProperty&source=__proto__,toString&label=valueOf']) {
      await p.goto(H.BASE + u); await H.ready(p); await wait(p, 300);
      const s = await p.evaluate(() => ({ q: location.search, toks: [...document.querySelectorAll('#applied .tok')].map((t) => t.textContent), room: document.documentElement.dataset.room, scripts: document.querySelectorAll('main script').length }));
      console.log('   ', u.slice(0, 60), '→', s.q, s.toks.join(' | '));
      ok(s.scripts === 0, 'no injected script');
    }
    ok(await p.evaluate(() => document.querySelectorAll('#applied .tok').length === 0 && +document.querySelector('#count b').textContent.replace(/,/g, '') > 4000), 'prototype names do not become filters');
    await p.evaluate(() => localStorage.setItem('hlx.saved', '{"__proto__":{"k":1},"constructor":1}'));
    await p.goto(H.BASE + '/?view=saved'); await H.ready(p); await wait(p, 400);
    ok(await p.evaluate(() => document.querySelectorAll('#sgm-hl li').length === 2 && document.querySelectorAll('#sgg-hl .card').length === 0), 'odd saved keys listed as missing, not as listings');
    ok(p.errs.length === 0, 'hostile: no errors ' + p.errs.join(' | '));
    await p.context().close(); }


  // ---------------------------------------------------------------- place, skip link, detail buttons
  { console.log('place and buttons'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p);
    await p.click('#moreBtn'); await wait(p, 300);
    await p.evaluate(() => window.scrollTo(0, 5200)); await wait(p, 300);
    const y0 = await p.evaluate(() => window.scrollY);
    await p.evaluate(() => document.querySelector('.arch a[data-nav="ccp"]').click()); await wait(p, 900);
    ok((await qs(p)) === '?archive=ccp' && await p.evaluate(() => window.scrollY) === 0, 'new room starts at top');
    await p.goBack(); await wait(p, 900);
    const y1 = await p.evaluate(() => window.scrollY), n1 = await cards(p);
    ok(Math.abs(y1 - y0) < 5 && n1 >= 120, 'back returns to the same place ' + y0 + ' → ' + y1 + ' cards ' + n1);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.focus('#sort'); await p.keyboard.press('Shift+Tab'); await wait(p, 100);
    ok(await p.evaluate(() => document.activeElement.classList.contains('skip2')), 'skip link reachable by keyboard');
    await p.keyboard.press('Enter'); await wait(p, 200);
    ok(await p.evaluate(() => document.activeElement.id === 'listH' && location.hash === ''), 'skip link lands on the list, no hash');
    await p.keyboard.press('Tab'); await wait(p, 100);
    ok(await p.evaluate(() => !!document.activeElement.closest('#grid')), 'next tab is in the grid');
    await p.click('#grid .card:nth-child(2) .t a'); await wait(p, 400);
    await p.click('.dv-nav [data-step="1"]'); await wait(p, 300);
    ok(/^3 \//.test(await p.$eval('.dv-pos', (e) => e.textContent)), 'next button');
    ok(await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-step') === '1'), 'focus stays on next');
    await p.click('.dv-nav [data-step="-1"]'); await wait(p, 300);
    ok(/^2 \//.test(await p.$eval('.dv-pos', (e) => e.textContent)), 'previous button');
    await p.click('[data-copy]'); await wait(p, 300);
    ok(/Link copied|Could not copy/.test(await p.$eval('#toast', (t) => t.textContent)), 'copy says what happened: ' + await p.$eval('#toast', (t) => t.textContent));
    const tag = await p.$('.dv-info .tag');
    if (tag) { const lbl = await tag.textContent(); await tag.click(); await wait(p, 900);
      ok(/motif=/.test(await qs(p)) && await p.evaluate(() => document.getElementById('ov').hidden), 'motif tag filters the room: ' + lbl + ' ' + (await qs(p))) }
    const links = await p.evaluate(() => [...document.querySelectorAll('.seek a')].map((a) => a.href).filter((h) => !/^https:\/\//.test(h)));
    ok(links.length === 0, 'seek links are all https ' + links.join(' '));
    ok(await p.evaluate(() => !document.getElementById('orig') && !/원본 인덱스/.test(document.body.textContent)), 'no second index to send the reader to');
    ok(p.errs.length === 0, 'place: no errors ' + p.errs.join(' | '));
    await p.context().close(); }


  // ---------------------------------------------------------------- new in, brands, sort in the drawer
  { console.log('new in, brands'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?view=new'); await H.ready(p); await wait(p, 400);
    const n = await p.evaluate(() => ({ cards: document.querySelectorAll('#ngrid .card').length, tabs: [...document.querySelectorAll('#newT .tab')].map((t) => t.textContent),
      cur: document.querySelector('.arch a[aria-current="page"]') && document.querySelector('.arch a[aria-current="page"]').getAttribute('data-nav') }));
    ok(n.cards > 0 && n.tabs.length === 4 && n.cur === 'new', 'new in lists today\'s listings (all, two archives, brands) ' + JSON.stringify(n));
    await p.click('#newT [data-nt="ccp"]'); await wait(p, 300);
    ok(await p.evaluate(() => [...document.querySelectorAll('#ngrid .card')].every((c) => c.dataset.a === 'ccp')), 'new in: one archive');
    await p.click('#ngrid .card .t a'); await wait(p, 500);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden && /view=new&item=/.test(location.search)), 'new in: a listing opens ' + await qs(p));
    await p.keyboard.press('Escape'); await wait(p, 450);
    await p.goto(H.BASE + '/?view=brands'); await H.ready(p); await wait(p, 400);
    await p.click('.az-l a[data-az="H"]'); await wait(p, 300);
    ok(await p.evaluate(() => location.hash === '' && document.activeElement && document.activeElement.id === 'azh-H'), 'letter jumps without a hash');
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 300);
    await p.click('#ftog'); await wait(p, 450);
    await p.click('#f-sort [data-sort="k-"]'); await wait(p, 300);
    ok((await qs(p)) === '?archive=hl&sort=k-' && await p.$eval('#sort', (s) => s.value) === 'k-' && await p.evaluate(() => document.querySelector('#f-sort [data-sort="k-"]').getAttribute('aria-pressed') === 'true'), 'sort from the drawer ' + (await qs(p)));
    await p.click('#sideShade', { position: { x: 1300, y: 400 } }); await wait(p, 450);
    ok(await p.evaluate(() => !document.getElementById('side').classList.contains('open')), 'the shade closes the drawer');
    ok(p.errs.length === 0, 'new/brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }
  // ---------------------------------------------------------------- a title keeps its own language
  { console.log('title language'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?archive=hl&source=' + encodeURIComponent('메루카리')); await H.ready(p); await wait(p, 400);
    if (!(await p.$('#grid .card'))) { await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 400) }
    const L = await p.evaluate(() => [...document.querySelectorAll('#grid .card .t')].map((h) => { const s = getComputedStyle(h);
      return { t: h.textContent, lang: h.getAttribute('lang'), lb: s.lineBreak, ff: s.fontFeatureSettings } }));
    const bad = L.filter((x) => (/[\u3040-\u30ff]/.test(x.t) && !/[\uac00-\ud7af]/.test(x.t) ? 'ja' : /[\uac00-\ud7af]/.test(x.t) ? 'ko' : /[\u3400-\u9fff]/.test(x.t) ? 'ja' : 'en') !== x.lang);
    ok(L.length > 0 && bad.length === 0, 'every card title says its language ' + L.length + ' ' + JSON.stringify(bad.slice(0, 3)));
    const ja = L.filter((x) => x.lang === 'ja');
    ok(ja.every((x) => x.lb === 'strict' && /palt/.test(x.ff)), 'japanese titles: strict line breaks, proportional kana (' + ja.length + ')');
    ok(L.filter((x) => x.lang === 'en').every((x) => x.lb !== 'strict'), 'latin titles keep the default line breaking');
    if (ja.length) { await p.click('#grid .card .t[lang="ja"] a'); await wait(p, 600);
      ok(await p.evaluate(() => document.getElementById('dvT').getAttribute('lang') === 'ja'), 'the listing page title keeps the language') }
    ok(p.errs.length === 0, 'title language: no errors ' + p.errs.join(' | '));
    await p.context().close(); }
  // ================================================================ brands (fixtures/BRAND: CCP listings relabelled as three brands)
  const fnvJs = 'const fnv=(u)=>{let h=0x811c9dc5;for(let i=0;i<u.length;i++){h^=u.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)};';
  const getIdx = (p) => p.evaluate(() => fetch('/BRAND/index.json').then((r) => r.json()));
  // ---------------------------------------------------------------- a brand room: the archive room's layout, the CCP rules, its own names
  { console.log('brand room'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?brand=guidi'); await H.ready(p); await wait(p, 300);
    const idx = await getIdx(p), g = idx.brands.find((x) => x.s === 'guidi');
    const r = await p.evaluate(() => ({ h1: document.getElementById('vh').textContent, title: document.title, room: document.documentElement.dataset.room,
      nav: (document.querySelector('.arch a[aria-current="page"]') || {}).textContent, tabs: document.querySelectorAll('#cats .cat').length,
      all: +document.querySelector('.cat[data-cat=""] .n').textContent.replace(/,/g, ''), motif: document.getElementById('g-motif').hidden,
      mc: document.querySelectorAll('#grid .mc').length, canon: document.querySelector('link[rel=canonical]').getAttribute('href'), photo: document.querySelectorAll('#rhp img').length }));
    ok(r.h1 === 'Guidi' && r.title === 'Guidi — Archive Index' && r.nav === 'Brands' && r.room === 'b:guidi' && r.photo === 1, 'brand room: name, title, Brands in the menu, a photograph ' + JSON.stringify(r));
    ok(await count(p) === g.c && r.all === g.c, 'brand room count = the index\'s ' + g.c);
    ok(await cards(p) === 60 && r.tabs > 3, 'brand room: first 60 cards, category tabs ' + r.tabs);
    ok(r.motif && r.mc === 0, 'brand room: no CCP motifs, no CCP model numbers');
    ok(r.canon === 'https://rozykuzy.github.io/?brand=guidi', 'brand room canonical ' + r.canon);
    const tabN = await p.evaluate(() => +document.querySelector('.cat[data-cat="아우터"] .n').textContent.replace(/,/g, ''));
    await p.click('.cat[data-cat="아우터"]'); await wait(p, 250);
    ok((await qs(p)) === '?brand=guidi&category=outer' && await count(p) === tabN, 'brand tab: url and count ' + (await qs(p)) + ' ' + tabN);
    await p.click('#ftog'); await wait(p, 450);
    const yv = await p.evaluate(() => { const x = document.querySelector('#f-y .yb:not(.z):not(.none)'); return x && x.getAttribute('data-v') });
    await p.click('#f-y [data-v="' + yv + '"]'); await wait(p, 250);
    const ny = await count(p);
    ok((await qs(p)) === '?brand=guidi&category=outer&year=' + yv && ny > 0 && ny < tabN, 'brand year filter ' + (await qs(p)) + ' → ' + ny);
    await p.click('#f-src [data-v="Grailed"]'); await wait(p, 250);
    const ns = await count(p);
    ok((await qs(p)) === '?brand=guidi&category=outer&year=' + yv + '&source=Grailed' && ns > 0 && ns <= ny, 'brand source filter ' + ns);
    await p.click('#sideDone'); await wait(p, 450);
    await p.goBack(); await wait(p, 300);
    ok((await qs(p)) === '?brand=guidi&category=outer&year=' + yv && await count(p) === ny, 'back takes one filter off ' + (await qs(p)));
    await p.goBack(); await wait(p, 300);
    ok((await qs(p)) === '?brand=guidi&category=outer' && await count(p) === tabN, 'back again ' + (await qs(p)));
    await p.fill('#rq', 'jacket'); await wait(p, 450);
    const nq = await count(p);
    ok((await qs(p)) === '?brand=guidi&category=outer&q=jacket' && await p.$eval('#sort', (s) => s.value) === 'rel' && nq > 0 && nq < tabN, 'brand room search ' + nq);
    for (const w of ['guidi', 'グイディ', '구이디']) { await p.fill('#rq', w); await wait(p, 450);
      ok(/Brand names are not search terms/.test(await p.$eval('#crng', (e) => e.textContent)), 'the brand\'s own name is not a search term: ' + w) }
    await p.fill('#rq', ''); await wait(p, 450);
    const seekL = await p.evaluate(() => [...document.querySelectorAll('.seek a')].map((a) => decodeURIComponent(a.href)));
    ok(seekL.length > 10 && seekL.every((h) => /^https:\/\//.test(h) && !/carol|poell|ポエル|포엘|キャロル/i.test(h)) && seekL.some((h) => /yahoo\.co\.jp.*グイディ/.test(h)) &&
      seekL.some((h) => /grailed\.com\/shop\?query=guidi/.test(h)) && seekL.some((h) => /fruitsfamily\.com\/search\/구이디/.test(h)), 'find elsewhere asks for the brand by its own names ' + seekL.slice(0, 3).join(' '));
    // detail: the item key is the FNV-1a of the listing's address, and the address opens the same listing again
    await p.click('.cat[data-cat=""]'); await wait(p, 300);
    const t0 = await p.$eval('#grid .card .t a', (a) => a.textContent);
    await p.click('#grid .card .t a'); await wait(p, 500);
    const d = await p.evaluate(new Function('return (()=>{' + fnvJs + 'const l=document.querySelector(".dv-info .acts a.btn.solid");return {q:location.search,t:document.getElementById("dvT").textContent,tag:document.querySelector(".dv-tag .nm-l").textContent,k:l?fnv(l.getAttribute("href")):null,tags:document.querySelectorAll(".dv-info .tag").length}})()'));
    ok(/^\?brand=guidi&item=[0-9a-z]+$/.test(d.q) && new URLSearchParams(d.q).get('item') === d.k && d.t === t0 && d.tag === 'Guidi' && d.tags === 0, 'brand detail: key = FNV-1a of the address ' + JSON.stringify(d));
    await p.reload(); await H.ready(p); await wait(p, 500);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden) && await p.$eval('#dvT', (h) => h.textContent) === t0 && (await qs(p)) === d.q, 'the brand item address reopens the same listing');
    await p.keyboard.press('ArrowRight'); await wait(p, 300);
    ok(/^2 \//.test(await p.$eval('.dv-pos', (e) => e.textContent)) && (await qs(p)) !== d.q, 'arrow steps inside the brand room ' + (await qs(p)));
    await p.keyboard.press('Escape'); await wait(p, 450);
    ok((await qs(p)) === '?brand=guidi' && await p.evaluate(() => document.getElementById('ov').hidden), 'escape closes the brand detail');
    // save: brx.saved, '<slug>|<key>' → {k,p,u,d,g}; the archives' stores untouched
    await p.click('#grid .card .sv'); await wait(p, 200);
    const sv = await p.evaluate(() => ({ n: document.getElementById('savedN').textContent, brx: JSON.parse(localStorage.getItem('brx.saved') || '{}'), hl: localStorage.getItem('hlx.saved'), ccp: localStorage.getItem('ccpx.saved'), k: document.querySelector('#grid .card').dataset.k, pressed: document.querySelector('#grid .card .sv').getAttribute('aria-pressed') }));
    const v = sv.brx['guidi|' + sv.k];
    ok(sv.n === '1' && sv.pressed === 'true' && Object.keys(sv.brx).length === 1 && v && Object.keys(v).sort().join() === 'd,g,k,p,u' && v.d === idx.today && sv.hl === null && sv.ccp === null, 'brand save in brx.saved ' + JSON.stringify(sv));
    await p.click('.utl a[data-nav="saved"]'); await wait(p, 900);
    ok(await p.evaluate(() => document.querySelectorAll('#svbr .card[data-a="b:guidi"]').length === 1 && /^Guidi/.test(document.querySelector('#svbr .sg-h').textContent)), 'saved view lists the brand listing under its brand');
    await p.click('#svbr .card .t a'); await wait(p, 500);
    ok(/^\?view=saved&item=/.test(await qs(p)) && await p.$eval('.dv-tag .nm-l', (e) => e.textContent) === 'Guidi', 'a saved brand listing opens');
    await p.reload(); await H.ready(p); await wait(p, 700);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden) && await p.$eval('.dv-tag .nm-l', (e) => e.textContent) === 'Guidi', 'saved + item address reopens the brand listing');
    await p.keyboard.press('Escape'); await wait(p, 450);
    await p.click('#svbr .card .sv'); await wait(p, 400);
    ok(await p.evaluate(() => !document.querySelector('.sg .card') && document.getElementById('savedN').textContent === '' && localStorage.getItem('brx.saved') === '{}'), 'unsave in the saved view');
    ok(p.errs.length === 0, 'brand room: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- saved brand listings no longer in the list
  { console.log('saved, missing'); const p = await H.page(b, { width: 1280, height: 900 }, { storage: { 'brx.saved': JSON.stringify({ 'rick-owens|zzzzzz': { k: 1, p: 1, u: '', d: '2026-10-18', g: 0 }, 'constructor': 1, 'nope-brand|abc': 1 }) } });
    await p.goto(H.BASE + '/?view=saved'); await H.ready(p); await wait(p, 600);
    const r = await p.evaluate(() => ({ heads: [...document.querySelectorAll('#svbr .sg-h')].map((h) => h.textContent), miss: document.querySelectorAll('#svbr .miss li').length, cards: document.querySelectorAll('#svbr .card').length, n: document.getElementById('savedN').textContent, svm: document.getElementById('svm').textContent }));
    ok(r.heads.length === 3 && r.miss === 3 && r.cards === 0 && r.n === '3' && /^3 Items/i.test(r.svm), 'missing brand listings are lines with Remove ' + JSON.stringify(r));
    await p.click('#svbr [data-u="rick-owens|zzzzzz"]'); await wait(p, 400);
    ok(await p.evaluate(() => !('rick-owens|zzzzzz' in JSON.parse(localStorage.getItem('brx.saved'))) && document.getElementById('savedN').textContent === '2'), 'remove a missing brand listing');
    ok(p.errs.length === 0, 'saved missing: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- Brands A–Z: every brand, a link only where there are listings
  { console.log('brands A to Z'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?view=brands'); await H.ready(p); await wait(p, 400);
    const idx = await getIdx(p), live = idx.brands.filter((x) => !x.ex && x.c > 0);
    const z = await p.evaluate(() => ({ li: [...document.querySelectorAll('.az-s li')].map((l) => { const a = l.querySelector('a'), n = l.querySelector('.n');
        return { name: l.querySelector('.az-n').textContent, href: a ? a.getAttribute('href') : null, n: n ? n.textContent : null } }),
      letters: [...document.querySelectorAll('.az-l a')].map((a) => a.textContent).join(''), stat: document.getElementById('azm').textContent,
      groups: [...document.querySelectorAll('.az-s')].map((s) => [s.querySelector('h2').textContent, [...s.querySelectorAll('.az-n')].map((x) => x.textContent)]) }));
    // Helmut Lang + the index's 131 (Carol Christian Poell is one of them, its archive): 132 names, one each
    ok(z.li.length === 1 + idx.brands.length && new Set(z.li.map((x) => x.name.toLowerCase())).size === z.li.length && /^132 Brands$/i.test(z.stat), 'A–Z: ' + z.li.length + ' names, none twice ' + z.stat);
    ok(z.li.filter((x) => x.href).length === 2 + live.length && z.li.filter((x) => !x.href).every((x) => x.n === null), 'links and counts only where there are listings: ' + z.li.filter((x) => x.href).map((x) => x.href).join(' '));
    ok(live.every((x) => z.li.some((l) => l.href === '/?brand=' + x.s && +l.n.replace(/,/g, '') === x.c)), 'brand counts from the index');
    const ccp = z.li.filter((x) => /^carol christian poell$/i.test(x.name)), hl = z.li.find((x) => x.name === 'Helmut Lang');
    ok(ccp.length === 1 && ccp[0].href === '/?archive=ccp' && hl.href === '/?archive=hl' && +ccp[0].n.replace(/,/g, '') > 1000, 'the two archives, once each, with their own counts');
    ok(z.groups.every((g) => g[1].every((n) => (g[0] === '#' ? /^[^a-z]/i.test(n) : n.normalize('NFKD').charAt(0).toUpperCase() === g[0]))) &&
      z.groups.every((g) => g[1].every((n, i) => !i || g[1][i - 1].localeCompare(n, 'en', { sensitivity: 'base' }) <= 0)) && z.letters.startsWith('#A'), 'A–Z order, figures under # ' + z.letters);
    await p.click('.az-l a[data-az="U"]'); await wait(p, 300);
    ok(await p.evaluate(() => location.hash === '' && document.activeElement.id === 'azh-U'), 'letter U jumps without a hash');
    await p.click('.az-s a[href="/?brand=uma-wang"]'); await wait(p, 900);
    ok((await qs(p)) === '?brand=uma-wang' && await p.$eval('#vh', (h) => h.textContent) === 'Uma Wang', 'a name opens its room');
    ok(p.errs.length === 0, 'A–Z: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- the menu's Brands panel: every brand in compact columns
  { console.log('brands panel');
    for (const w of [1440, 1024]) { const p = await H.page(b, { width: w, height: 900 });
      await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 300);
      await p.focus('.arch a[data-nav="brands"]'); await p.keyboard.press('Tab');
      ok(await p.evaluate(() => document.activeElement.classList.contains('wm')), w + ': the panel is not in the Tab order');
      await p.hover('.arch a[data-nav="brands"]'); await wait(p, 500);
      const m = await p.evaluate(() => { const pan = document.getElementById('mm-brands'), ul = pan.querySelector('.mm-l.az');
        return { vis: getComputedStyle(pan).visibility, cols: ul && getComputedStyle(ul).columnCount, li: ul ? ul.querySelectorAll('li').length : 0, a: ul ? ul.querySelectorAll('a').length : 0,
          counts: ul ? [...ul.querySelectorAll('a[href^="/?brand="] .n')].filter((n) => /\d/.test(n.textContent)).length : 0, all: !!pan.querySelector('a.mm-all[href="/?view=brands"]'),
          fit: pan.getBoundingClientRect().bottom <= innerHeight + 1, over: document.documentElement.scrollWidth - innerWidth } });
      ok(m.vis === 'visible' && m.cols === (w >= 1280 ? '6' : '5') && m.li === 132 && m.a === 5 && m.counts === 3 && m.all && m.fit, w + ': Brands panel ' + JSON.stringify(m));
      await p.focus('.arch a[data-nav="brands"]'); await p.keyboard.press('Escape'); await wait(p, 300);
      ok(await p.evaluate(() => getComputedStyle(document.getElementById('mm-brands')).visibility === 'hidden'), w + ': Escape closes the panel');
      await p.mouse.move(700, 600); await wait(p, 200); await p.hover('.arch a[data-nav="brands"]'); await wait(p, 500);
      await p.click('#mm-brands a[href="/?brand=rick-owens"]'); await wait(p, 900);
      ok((await qs(p)) === '?brand=rick-owens' && await p.evaluate(() => getComputedStyle(document.getElementById('mm-brands')).visibility === 'hidden'), w + ': a name opens the room, the panel closes');
      ok(p.errs.length === 0, 'panel: no errors ' + p.errs.join(' | '));
      await p.context().close(); } }

  // ---------------------------------------------------------------- New in: a third tab for the brands
  { console.log('new in, brands tab'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?view=new'); await H.ready(p); await wait(p, 500);
    const nj = await p.evaluate(() => fetch('/BRAND/new.json').then((r) => r.json()));
    const t = await p.evaluate(() => [...document.querySelectorAll('#newT .tab')].map((x) => [x.dataset.nt, +x.querySelector('sup').textContent.replace(/,/g, '')]));
    ok(t.length === 4 && t[3][0] === 'brands' && t[3][1] === nj.items.length && t[0][1] === t[1][1] + t[2][1] + t[3][1], 'new in: Brands tab, All includes it ' + JSON.stringify(t));
    ok(await p.evaluate(() => document.querySelectorAll('#ngrid .card[data-a^="b:"]').length > 0), 'All shows brand cards too');
    await p.click('#newT [data-nt="brands"]'); await wait(p, 300);
    const c = await p.evaluate(() => [...document.querySelectorAll('#ngrid .card')].map((x) => [x.dataset.a, x.querySelector('.at').textContent, x.querySelector('.t a').getAttribute('href')]));
    ok(c.length === nj.items.length && c.every((x) => /^b:/.test(x[0]) && x[2] === '/?brand=' + x[0].slice(2) + '&item=' + x[2].split('item=')[1]) && c.some((x) => x[1] === 'Rick Owens'), 'Brands tab: brand cards, named, linked to their rooms ' + JSON.stringify(c[0]));
    await p.click('#ngrid .card .t a'); await wait(p, 500);
    const q1 = await qs(p), t1 = await p.$eval('#dvT', (h) => h.textContent);
    ok(/^\?view=new&item=[0-9a-z]+$/.test(q1) && /^1 \//.test(await p.$eval('.dv-pos', (e) => e.textContent)), 'a brand listing opens in New in ' + q1);
    await p.click('.dv-info [data-save]'); await wait(p, 200);
    ok(await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('brx.saved') || '{}')).every((k) => /^[a-z-]+\|[0-9a-z]+$/.test(k)) && Object.keys(JSON.parse(localStorage.getItem('brx.saved'))).length === 1), 'saved from New in, under slug|key');
    await p.reload(); await H.ready(p); await wait(p, 700);
    ok(await p.evaluate(() => !document.getElementById('ov').hidden) && await p.$eval('#dvT', (h) => h.textContent) === t1 && (await qs(p)) === q1, 'the New in address reopens the brand listing');
    ok(p.errs.length === 0, 'new in brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- the front page: one row of brands
  { console.log('home brands row'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 400);
    const idx = await getIdx(p), act = idx.brands.filter((x) => !x.ex && x.nw > 0 && x.nw < x.c).sort((x, y) => y.nw - x.nw);
    const r = await p.evaluate(() => ({ hidden: document.getElementById('bros').hidden, after: document.querySelector('.rooms').nextElementSibling.id,
      tiles: [...document.querySelectorAll('#bgrid .bt')].map((a) => [a.getAttribute('href'), a.querySelector('.bt-n').textContent, a.querySelector('.bt-s').textContent, !!a.querySelector('.ph img')]),
      all: document.querySelector('#bros .sec-more a').getAttribute('href') }));
    ok(!r.hidden && r.after === 'bros' && r.all === '/?view=brands', 'a Brands row under the two archives, with All brands ' + JSON.stringify(r));
    ok(r.tiles.length === Math.min(4, act.length) && r.tiles.every((x, i) => x[0] === '/?brand=' + act[i].s + '&show=new' && x[1] === act[i].n && x[2] === 'New' + act[i].nw && x[3]), 'the brands with the most new listings, a photograph each ' + JSON.stringify(r.tiles));
    await p.click('#bgrid .bt'); await wait(p, 900);
    ok((await qs(p)) === '?brand=' + act[0].s + '&show=new' && await count(p) === act[0].nw, 'a tile opens the brand\'s new listings ' + (await qs(p)));
    ok(p.errs.length === 0, 'home brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }
  // a brand on its first day (all of it new) does not count as new — in the row or in New in
  { console.log('first day'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.route('**/BRAND/index.json', async (rt) => { const res = await rt.fetch(); const j = await res.json();
      j.brands.forEach((x) => { if (x.s === 'guidi') x.nw = x.c }); rt.fulfill({ response: res, body: JSON.stringify(j) }) });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 400);
    const tiles = await p.evaluate(() => [...document.querySelectorAll('#bgrid .bt')].map((a) => a.getAttribute('href') + ' ' + a.querySelector('.bt-s').textContent));
    ok(tiles.length === 3 && /^\/\?brand=guidi Items/.test(tiles[2]) && tiles.slice(0, 2).every((x) => /&show=new New/.test(x)), 'first-day brand after the others, without New ' + JSON.stringify(tiles));
    await p.goto(H.BASE + '/?view=new'); await H.ready(p); await wait(p, 500);
    const nb = await p.evaluate(() => [+document.querySelector('#newT [data-nt="brands"] sup').textContent, document.querySelectorAll('#ngrid .card[data-a="b:guidi"]').length]);
    ok(nb[1] === 0 && nb[0] > 0, 'first-day brand is not in New in ' + nb);
    ok(p.errs.length === 0, 'first day: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- search: brand names jump to their rooms; listings stay per room
  { console.log('search brands'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p);
    const hits = async (w) => { await p.fill('#sq', w); await wait(p, 450); return p.evaluate(() => [...document.querySelectorAll('.sr-bg a.sr-bi')].map((a) => a.getAttribute('href') + ' ' + a.querySelector('.sr-t').textContent)) };
    await p.keyboard.press('/'); await wait(p, 300);
    let h = await hits('guidi');
    ok(h.length === 1 && h[0] === '/?brand=guidi Guidi' && await p.evaluate(() => document.querySelectorAll('.sr-g').length === 3 && !document.querySelector('.sr-g:not(.sr-bg) a.sr-i')), 'search finds the brand name, no item search across brands ' + h);
    for (const w of ['リックオウエンス', '릭오웬스', 'rickowens', 'RICK-OWENS', 'owens']) { h = await hits(w); ok(h[0] === '/?brand=rick-owens Rick Owens', 'brand by another spelling: ' + w + ' → ' + h) }
    h = await hits('helmut'); ok(h.length === 1 && h[0] === '/?archive=hl Helmut Lang', 'the archives are brands too ' + h);
    h = await hits('leather'); ok(h.length === 0 && await p.evaluate(() => document.querySelectorAll('.sr-g').length === 2), 'no brand group without a brand name');
    h = await hits('guidi');
    await p.keyboard.press('Enter'); await wait(p, 900);
    ok((await qs(p)) === '?brand=guidi' && await p.evaluate(() => document.getElementById('search').hidden && document.getElementById('vh').textContent === 'Guidi'), 'Enter goes to the brand room ' + (await qs(p)));
    await p.keyboard.press('/'); await wait(p, 300); await hits('uma');
    await p.keyboard.press('ArrowDown'); await wait(p, 100);
    ok(await p.evaluate(() => document.activeElement.classList.contains('sr-bi')), 'arrow keys reach the brand results');
    await p.keyboard.press('Enter'); await wait(p, 900);
    ok((await qs(p)) === '?brand=uma-wang', 'a brand result opens its room ' + (await qs(p)));
    ok(p.errs.length === 0, 'search brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- addresses: unknown, odd, and the brand that is an archive here
  { console.log('brand addresses'); const p = await H.page(b, { width: 1280, height: 900 });
    for (const [u, want] of [['/?brand=__proto__', ''], ['/?brand=constructor&item=zz', '?view=brands'], ['/?brand=%3Cscript%3E', ''], ['/?brand=nope', '?view=brands'], ['/?brand=aalto', '?view=brands'],
      ['/?brand=GUIDI&category=__proto__&year=1000-3000&show=constructor&motif=drip&item=ZZZZZZZZZZ', '?brand=guidi'], ['/?brand=guidi&archive=hl', '?archive=hl'],
      ['/?brand=carol-christian-poell&category=shoes', '?archive=ccp&category=shoes'], ['/?brand=uma-wang&sort=k%2B&category=shoes', '?brand=uma-wang&category=shoes&sort=k%2B']]) {
      await p.goto(H.BASE + u); await H.ready(p); await wait(p, 400);
      const s = await p.evaluate(() => ({ q: location.search, scripts: document.querySelectorAll('main script').length, h: (document.getElementById('vh') || {}).textContent }));
      ok(s.q === want && s.scripts === 0, 'address ' + u + ' → ' + s.q + ' (' + s.h + ')');
    }
    ok(p.errs.length === 0, 'brand addresses: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- the CCP room is its own after a brand room (the brands read with their own copy)
  { console.log('ccp after brands'); const p = await H.page(b, { width: 1280, height: 900 });
    await p.goto(H.BASE + '/?brand=rick-owens'); await H.ready(p); await wait(p, 300);
    await p.fill('#rq', 'drip'); await wait(p, 400);
    await p.click('.arch a[data-nav="ccp"]'); await wait(p, 900); await H.ready(p);
    await p.fill('#rq', 'drip'); await wait(p, 450);
    ok(await count(p) === CCPDRIP, 'CCP drip count unchanged after a brand room ' + CCPDRIP);
    await p.fill('#rq', 'ccp'); await wait(p, 450);
    ok(/Brand names are not search terms/.test(await p.$eval('#crng', (e) => e.textContent)), 'CCP noise words are CCP\'s');
    await p.fill('#rq', ''); await wait(p, 450);
    ok(await p.evaluate(() => !document.getElementById('g-motif').hidden && window.AIX.profiles.ccp.MOTIF.length > 10 && window.AIX.profiles.ccp.SEEKBRAND.en === 'carol christian poell' && window.AIX.profiles.ccp.codeNum('LM/2498') === '2498'),
      'CCP keeps its motifs, its name in Find elsewhere, its model numbers');
    ok(p.errs.length === 0, 'ccp after brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- phones
  { console.log('brands on a phone'); const p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2 });
    for (const u of ['/', '/?view=brands', '/?brand=rick-owens', '/?view=new']) { await p.goto(H.BASE + u); await H.ready(p); await wait(p, 300);
      // (a phone widens its viewport to what overflows, so the width is checked against the one set)
      for (const w of [360, 430]) { await p.setViewportSize({ width: w, height: 800 }); await wait(p, 150); const o = await H.overflow(p); ok(o.sw <= w && o.w === w, 'no overflow ' + u + ' at ' + w + ' ' + JSON.stringify(o)) } }
    await p.goto(H.BASE + '/?brand=guidi'); await H.ready(p); await wait(p, 300);
    await p.click('#grid .card .ph'); await wait(p, 600);
    const o = await H.overflow(p); ok(o.sw <= 430 && o.w === 430 && await p.evaluate(() => !document.getElementById('ov').hidden), 'brand detail on a phone, no overflow ' + JSON.stringify(o));
    await p.click('.dv-x'); await wait(p, 400);
    await p.click('#menuBtn'); await wait(p, 400); await p.click('#drawer a[data-nav="brands"]'); await wait(p, 800);
    ok((await qs(p)) === '?view=brands' && await p.evaluate(() => document.querySelectorAll('.az-l.many a').length > 20 && getComputedStyle(document.querySelector('.az-l')).gridTemplateColumns.split(' ').length === 9), 'phone: the menu reaches the brands, letters nine to a row');
    ok(p.errs.length === 0, 'phone brands: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- before the brand pipeline's first run: /BRAND/ answers 404 and the site is as it was
  { console.log('without /BRAND/'); const srv = await H.serve({ BRAND: 'off' }); const p = await H.page(b, { width: 1440, height: 900 });
    try {
      await p.goto(srv.base + '/'); await H.ready(p); await wait(p, 400);
      ok(await p.evaluate(() => document.getElementById('bros').hidden && !document.querySelector('#bgrid .bt') && document.querySelectorAll('.rooms .room').length === 2), 'no BRAND: no brands row');
      await p.hover('.arch a[data-nav="brands"]'); await wait(p, 500);
      ok(await p.evaluate(() => { const pan = document.getElementById('mm-brands'); return !pan.querySelector('.az') && [...pan.querySelectorAll('.mm-l a')].map((a) => a.getAttribute('href')).join() === '/?archive=hl,/?archive=ccp' }), 'no BRAND: the panel has the two archives');
      await p.mouse.move(700, 700);
      await p.keyboard.press('/'); await p.keyboard.type('helmut lang'); await wait(p, 500);
      ok(await p.evaluate(() => !document.querySelector('.sr-bg') && document.querySelectorAll('.sr-g').length === 2 && /Brand names are not search terms/.test(document.getElementById('sres').textContent)), 'no BRAND: search as before');
      await p.keyboard.press('Escape'); await wait(p, 300);
      await p.goto(srv.base + '/?view=brands'); await H.ready(p); await wait(p, 400);
      const z = await p.evaluate(() => ({ names: [...document.querySelectorAll('.az-s a')].map((a) => a.getAttribute('href') + ' ' + a.textContent), li: document.querySelectorAll('.az-s li').length, letters: [...document.querySelectorAll('.az-l a')].map((a) => a.textContent).join(''), many: !!document.querySelector('.az-l.many') }));
      ok(z.letters === 'CH' && z.li === 2 && z.names.length === 2 && z.names.every((x) => /^\/\?archive=(hl|ccp) .*\d/.test(x)) && !z.many, 'no BRAND: A–Z shows only the two archives ' + JSON.stringify(z));
      await p.goto(srv.base + '/?view=new'); await H.ready(p); await wait(p, 400);
      ok(await p.evaluate(() => [...document.querySelectorAll('#newT .tab')].map((t) => t.dataset.nt).join() === 'all,hl,ccp'), 'no BRAND: New in has its three tabs');
      await p.goto(srv.base + '/?brand=guidi&item=abc'); await H.ready(p); await wait(p, 400);
      ok((await qs(p)) === '?view=brands' && await p.evaluate(() => document.querySelectorAll('.az-s li').length === 2), 'no BRAND: a brand address lands on the A–Z');
      await p.goto(srv.base + '/?view=saved'); await H.ready(p); await wait(p, 400);
      ok(await p.evaluate(() => document.getElementById('svbr').innerHTML === '' && /Nothing saved/.test(document.getElementById('svm').textContent)), 'no BRAND: saved as before');
      ok(p.errs.length === 0, 'no BRAND: no errors ' + p.errs.join(' | '));
    } finally { await p.context().close(); srv.close() } }

  console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
  await b.close();
})();
