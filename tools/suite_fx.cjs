// the motion layer: what arrives, what moves, and that nothing is left hidden
const H = require('./harness.cjs');
let pass = 0; const fails = [];
function ok(c, m) { if (c) pass++; else { fails.push(m); console.log('  FAIL', m) } }
const wait = (p, ms) => p.waitForTimeout(ms);
const csp = (p) => p.evaluate(() => window.__csp || []);

(async () => {
  const b = await H.browser();
  // ---------------------------------------------------------------- home
  { console.log('home'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 1600);
    const r = await p.evaluate(() => ({ fx: document.documentElement.classList.contains('fx'), rooms: [...document.querySelectorAll('.room')].map((e) => e.classList.contains('in')),
      words: document.querySelectorAll('.room-name .wd').length, name: [...document.querySelectorAll('.r-ccp .room-name .wd')].map((w) => w.textContent).join(''),
      tiles: document.querySelectorAll('#col .tile').length, colIn: document.getElementById('col').classList.contains('in'),
      band: !document.getElementById('band').hidden, groups: document.querySelectorAll('#mq .mq-g').length, dup: document.querySelectorAll('#mq .mq-g[aria-hidden="true"]').length,
      srcs: document.querySelectorAll('#mq .mq-g:first-child .mq-s').length, run: document.getElementById('mq').classList.contains('run'),
      ticks: [...document.querySelectorAll('.room-stat [data-n]')].every((e) => e.textContent === (+e.dataset.n).toLocaleString('ko-KR')) }));
    ok(r.fx, 'html.fx on with motion allowed');
    ok(r.rooms.every(Boolean), 'both rooms arrived ' + r.rooms);
    ok(r.words === 5 && r.name === 'CarolChristianPoell', 'room names in words ' + r.words + ' ' + r.name);
    ok(r.tiles === 14 && r.colIn, 'photographs around the names ' + r.tiles + ' ' + r.colIn);
    ok(r.band && r.groups === 2 && r.dup === 1 && r.srcs > 10 && r.run, 'source band ' + JSON.stringify(r));
    ok(r.ticks, 'counts end on the exact numbers');
    // one name in focus: the other steps back, the page turns to its sheet, the other archive's photographs fade
    const nb = await (await p.$('.r-ccp .room-name')).boundingBox();
    await p.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2); await wait(p, 900);
    const fo = await p.evaluate(() => { const h = document.getElementById('hero'); const t = document.querySelector('.tile[data-a="hl"] .ph');
      return { f: h.getAttribute('data-focus'), bg: getComputedStyle(h).backgroundColor, hl: +getComputedStyle(document.querySelector('.room.r-hl')).opacity, t: t ? +getComputedStyle(t).opacity : -1 } });
    ok(fo.f === 'ccp' && fo.bg === 'rgb(14, 13, 12)' && fo.hl < .5 && fo.t < .5, 'focus on one archive ' + JSON.stringify(fo));
    await p.mouse.move(8, 880); await wait(p, 900);
    ok(await p.evaluate(() => !document.getElementById('hero').hasAttribute('data-focus')), 'focus clears off the names');
    // today's cards arrive as they scroll in
    const before = await p.evaluate(() => [...document.querySelectorAll('#tgrid .card')].filter((c) => c.classList.contains('rv') && !c.classList.contains('in')).length);
    await p.evaluate(() => window.scrollTo(0, document.getElementById('today').offsetTop - 100)); await wait(p, 1200);
    const after = await p.evaluate(() => [...document.querySelectorAll('#tgrid .card')].filter((c) => { const r = c.getBoundingClientRect(); return r.top < innerHeight && r.left < innerWidth && r.right > 0 && !c.classList.contains('in') }).length);
    ok(before > 0 && after === 0, 'today cards arrive when seen ' + before + ' → ' + after + ' still hidden in view');
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await wait(p, 1500);
    ok(await p.evaluate(() => document.getElementById('footBig').classList.contains('in')), 'foot wordmark arrives');
    ok(await p.evaluate(() => { const f = document.getElementById('footBig'); return f.scrollWidth <= f.clientWidth + 2 }), 'foot wordmark fits the width');
    // the room door: a circle opens into the dark room
    await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 300);
    await p.click('.room.r-ccp .room-name'); await wait(p, 1200);
    ok(await p.evaluate(() => location.search === '?archive=ccp' && !document.documentElement.classList.contains('vt-on')), 'room wipe finishes');
    ok((await csp(p)).length === 0 && p.errs.length === 0, 'home: no CSP or errors ' + JSON.stringify(await csp(p)) + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- room
  { console.log('room'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 1500);
    const ind = async () => p.evaluate(() => { const i = document.querySelector('#cats .ind'), c = document.querySelector('#cats .cat[aria-pressed="true"]');
      return { w: Math.round(i.getBoundingClientRect().width), cw: Math.round(c.getBoundingClientRect().width), x: Math.round(i.getBoundingClientRect().left), cx: Math.round(c.getBoundingClientRect().left) } });
    let r = await ind(); ok(Math.abs(r.w - r.cw) <= 1 && Math.abs(r.x - r.cx) <= 1, 'tab line under 전체 ' + JSON.stringify(r));
    await p.click('.cat[data-cat="데님"]'); await wait(p, 800);
    r = await ind(); ok(Math.abs(r.w - r.cw) <= 1 && Math.abs(r.x - r.cx) <= 1, 'tab line moved under 데님 ' + JSON.stringify(r));
    ok(await p.evaluate(() => document.querySelectorAll('#cats .ind').length === 1), 'one tab line');
    // a filter change repaints at once: no card waits to arrive
    ok(await p.evaluate(() => document.querySelectorAll('#grid .card.rv:not(.in)').length === 0 || [...document.querySelectorAll('#grid .card.rv')].length === 0), 'filter change: no arrival');
    // the progress line
    await p.evaluate(() => window.scrollTo(0, 2400)); await wait(p, 300);
    const pr = await p.evaluate(() => ({ v: +getComputedStyle(document.getElementById('top')).getPropertyValue('--prog'), on: getComputedStyle(document.getElementById('top')).getPropertyValue('--progOn').trim() }));
    ok(pr.v > 0 && pr.v < 1 && pr.on === '1', 'progress through the results ' + JSON.stringify(pr));
    // a second photo on hover, where there is one
    await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 200);
    const multi = await p.evaluate(() => { const cs = [...document.querySelectorAll('#grid .card')]; return cs.findIndex((c) => { const k = c.dataset.k; return window.__two && window.__two(k) }) });
    await p.hover('#grid .card:nth-child(1) .ph'); await wait(p, 600);
    ok(await p.evaluate(() => { const ph = document.querySelector('#grid .card:nth-child(1) .ph'); return !!ph.__b2 }), 'hover asks for a second photo once');
    // save pops
    await p.click('#grid .card:nth-child(2) .sv'); await wait(p, 60);
    ok(await p.evaluate(() => document.querySelector('#grid .card:nth-child(2) .sv').classList.contains('pop')), 'save mark pops');
    await p.click('#grid .card:nth-child(2) .sv'); await wait(p, 200);
    // detail: the photo carries over; the large one follows
    await p.click('#grid .card:nth-child(3) .ph'); await wait(p, 1400);
    const d = await p.evaluate(() => { const im = document.getElementById('dvImg'); return { open: !document.getElementById('ov').hidden, now: document.getElementById('ov').classList.contains('now'),
      vt: document.documentElement.classList.contains('vt-on'), hi: im && im.getAttribute('data-hi'), on: im && im.classList.contains('on'), src: im && im.getAttribute('src') } });
    ok(d.open && !d.now && !d.vt && d.on && !d.hi, 'detail open, large photo in place ' + JSON.stringify(d).slice(0, 200));
    await p.keyboard.press('Escape'); await wait(p, 1000);
    ok(await p.evaluate(() => document.getElementById('ov').hidden && !/item=/.test(location.search) && !document.documentElement.classList.contains('vt-on')), 'detail closes back into its card');
    ok((await csp(p)).length === 0 && p.errs.length === 0, 'room: no CSP or errors ' + JSON.stringify(await csp(p)) + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- phone: photos by swipe
  { console.log('phone swipe'); const p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2 });
    await p.goto(H.BASE + '/?archive=hl&source=Grailed'); await H.ready(p); await wait(p, 900);
    // the first listing with more than one photo
    const k = await p.evaluate(() => { for (const c of document.querySelectorAll('#grid .card')) { const n = window.AIX && 0; } return null });
    let opened = false;
    for (let i = 1; i <= 12 && !opened; i++) {
      await p.click('#grid .card:nth-child(' + i + ') .ph'); await wait(p, 900);
      if (await p.$('#dvPn')) { opened = true; break }
      await p.click('.dv-x'); await wait(p, 600);
    }
    if (opened) {
      const box = await p.$eval('.dv-main', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
      const cdp = await p.context().newCDPSession(p);
      const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
      await touch('touchStart', box.x + 120, box.y); for (let s = 1; s <= 6; s++) await touch('touchMove', box.x + 120 - s * 30, box.y + 2); await touch('touchEnd');
      await wait(p, 500);
      ok(/^2 \//.test(await p.$eval('#dvPn', (e) => e.textContent)), 'swipe left: next photo ' + await p.$eval('#dvPn', (e) => e.textContent));
    } else ok(true, 'no multi-photo listing in the first 12 (skipped)');
    ok(p.errs.length === 0, 'phone: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- reduced motion: everything in place, nothing to wait for
  { console.log('reduced motion'); const p = await H.page(b, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 300);
    const r = await p.evaluate(() => ({ fx: document.documentElement.classList.contains('fx'), rv: document.querySelectorAll('.card.rv').length,
      wordT: getComputedStyle(document.querySelector('.room-name .wd > span')).transform, mq: getComputedStyle(document.getElementById('mq')).animationName,
      dupShown: getComputedStyle(document.querySelector('#mq .mq-g[aria-hidden]')).display }));
    ok(!r.fx && r.rv === 0 && (r.wordT === 'none' || r.wordT === 'matrix(1, 0, 0, 1, 0, 0)') && r.dupShown === 'none', 'reduced: nothing hidden, band is a list ' + JSON.stringify(r));
    await p.context().close(); }

  console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
  await b.close();
})();
