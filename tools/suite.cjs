// behaviour suite for the combined index — run against tools/serve.mjs
const H = require('./harness.cjs');
let pass = 0; const fails = [];
function ok(c, m) { if (c) pass++; else { fails.push(m); console.log('  FAIL', m) } }
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
      tags: document.querySelectorAll('#tgrid .at').length, strip: document.querySelectorAll('#strip a').length, mos: document.querySelectorAll('.room-mos img').length }));
    ok(r.st.every((t) => /매물/.test(t)), 'home: both rooms have stats ' + JSON.stringify(r.st));
    ok(r.today > 0 && r.tags === r.today, 'home: today grid with archive tags ' + r.today + '/' + r.tags);
    ok(r.strip === 2, 'home: strip links 2 → ' + r.strip);
    ok(r.mos >= 6, 'home: mosaics ' + r.mos);
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
    await p.click('#f-y [data-v="1998"]'); await wait(p, 250);
    await p.click('#f-y [data-v="1999"]'); await wait(p, 250);
    ok((await qs(p)) === '?archive=hl&category=outer&year=1998-1999', 'years packed ' + (await qs(p)));
    const tok = await p.evaluate(() => [...document.querySelectorAll('#applied .tok')].map((t) => t.textContent));
    ok(tok.some((t) => /1998–1999/.test(t)), 'range token ' + tok.join(','));
    const n2 = await count(p);
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
    ok(n.drip > 0 && n.drip === n['ドリップ'] && n.drip === n['드립'], 'three languages ' + JSON.stringify(n));
    await p.fill('#rq', ''); await wait(p, 400);
    const live = await count(p);
    await p.click('#f-flag [data-v="sold"]'); await wait(p, 300);
    const sold = await count(p), recs = await p.evaluate(() => document.querySelectorAll('#grid .card.rec').length);
    ok(sold > 0 && recs === Math.min(sold, 60), 'sale records only ' + sold + '/' + recs);
    await p.click('#f-flag [data-v="sold"]'); await wait(p, 300);
    ok(await count(p) === live, 'sale records off again');
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
    ok(await p.evaluate(() => /브랜드 이름만/.test(document.getElementById('sres').textContent)), 'brand-only query explained');
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
    ok(!await p.evaluate(() => document.getElementById('side').classList.contains('open')) && /건 보기/.test(lbl), 'sheet closes ' + lbl);
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
    ok(/링크 복사함|복사할 수 없음/.test(await p.$eval('#toast', (t) => t.textContent)), 'copy says what happened: ' + await p.$eval('#toast', (t) => t.textContent));
    const tag = await p.$('.dv-info .tag');
    if (tag) { const lbl = await tag.textContent(); await tag.click(); await wait(p, 900);
      ok(/motif=/.test(await qs(p)) && await p.evaluate(() => document.getElementById('ov').hidden), 'motif tag filters the room: ' + lbl + ' ' + (await qs(p))) }
    const links = await p.evaluate(() => [...document.querySelectorAll('.seek a')].map((a) => a.href).filter((h) => !/^https:\/\//.test(h)));
    ok(links.length === 0, 'seek links are all https ' + links.join(' '));
    const orig = await p.$eval('#orig', (a) => a.getAttribute('href'));
    ok(/^\/helmut-lang\/\?/.test(orig) && /motif=/.test(orig), 'origin link carries the filter ' + orig);
    ok(p.errs.length === 0, 'place: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
  await b.close();
})();
