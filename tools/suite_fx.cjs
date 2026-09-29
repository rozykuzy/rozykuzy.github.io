// the plain design: what little moves, that nothing waits to be seen, and a budget for the type
const H = require('./harness.cjs');
let pass = 0; const fails = [];
function ok(c, m) { if (c) pass++; else { fails.push(m); console.log('  FAIL', m) } }
const wait = (p, ms) => p.waitForTimeout(ms);
const csp = (p) => p.evaluate(() => window.__csp || []);
// every text run the page draws: which families, sizes, tracking
// (tracking is compared as a share of the size: one value per step of the scale, not per pixel)
const typeOf = (p, within) => p.evaluate((w) => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0 };
  const els = [...document.querySelectorAll((w || 'body') + ' *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && vis(e) && !e.closest('.sr'));
  const fam = {}, size = {}, track = {};
  for (const e of els) { const s = getComputedStyle(e), fs = parseFloat(s.fontSize), ls = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing);
    fam[s.fontFamily.split(',')[0].replace(/["']/g, '').trim()] = 1; size[Math.round(fs * 10) / 10] = 1; track[(Math.round(ls / fs * 1000) / 1000) || 0] = 1 }
  return { fam: Object.keys(fam), size: Object.keys(size).map(Number).sort((a, b) => a - b), track: Object.keys(track).map(Number).sort((a, b) => a - b) };
}, within);

(async () => {
  const b = await H.browser();
  // ---------------------------------------------------------------- home
  { console.log('home'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 900);
    const r = await p.evaluate(() => ({ fx: document.documentElement.classList.contains('fx'),
      photos: document.querySelectorAll('.room-ph img.on').length, hidden: [...document.querySelectorAll('.card, .room')].filter((e) => +getComputedStyle(e).opacity < 1).length,
      gone: ['.wd', '.tile', '#mq', '#footBig', '#strip', '#heroD'].filter((s) => document.querySelector(s)).join(' ') }));
    ok(r.fx, 'html.fx on with motion allowed');
    ok(r.photos === 6, 'three photographs for each archive, shown ' + r.photos);
    ok(r.hidden === 0, 'nothing waits to be seen ' + r.hidden);
    ok(r.gone === '', 'no decoration left: ' + r.gone);
    const t = await typeOf(p);
    ok(t.fam.every((f) => /^Index (Sans|Latin)$/.test(f)), 'one family ' + t.fam.join(', '));
    ok(t.size.length <= 5, 'few sizes on the front page ' + t.size.join(' '));
    ok(t.track.length <= 4, 'few tracking values (em) ' + t.track.join(' '));
    console.log('   home type', JSON.stringify(t));
    // the room door is a link; the page change is a plain cross-fade
    await p.click('.room.r-ccp .room-name'); await wait(p, 700);
    ok(await p.evaluate(() => location.search === '?archive=ccp' && !document.documentElement.classList.contains('vt-on')), 'room change finishes');
    ok(await p.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)'), 'the same white page for both archives');
    ok((await csp(p)).length === 0 && p.errs.length === 0, 'home: no CSP or errors ' + JSON.stringify(await csp(p)) + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- room
  { console.log('room'); const p = await H.page(b, { width: 1440, height: 900 });
    await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await wait(p, 900);
    const t = await typeOf(p);
    ok(t.fam.every((f) => /^Index (Sans|Latin)$/.test(f)), 'room: one family ' + t.fam.join(', '));
    ok(t.size.length <= 5, 'room: few sizes ' + t.size.join(' '));
    ok(t.track.length <= 4, 'room: few tracking values (em) ' + t.track.join(' '));
    console.log('   room type', JSON.stringify(t));
    const ind = async () => p.evaluate(() => { const i = document.querySelector('#cats .ind'), c = document.querySelector('#cats .cat[aria-pressed="true"]');
      return { w: Math.round(i.getBoundingClientRect().width), cw: Math.round(c.getBoundingClientRect().width), x: Math.round(i.getBoundingClientRect().left), cx: Math.round(c.getBoundingClientRect().left) } });
    let r = await ind(); ok(Math.abs(r.w - r.cw) <= 1 && Math.abs(r.x - r.cx) <= 1, 'tab line under 전체 ' + JSON.stringify(r));
    await p.click('.cat[data-cat="데님"]'); await wait(p, 600);
    r = await ind(); ok(Math.abs(r.w - r.cw) <= 1 && Math.abs(r.x - r.cx) <= 1, 'tab line moved under 데님 ' + JSON.stringify(r));
    ok(await p.evaluate(() => document.querySelectorAll('#cats .ind').length === 1), 'one tab line');
    ok(await p.evaluate(() => [...document.querySelectorAll('#grid .card')].every((c) => +getComputedStyle(c).opacity === 1)), 'filter change: cards in place at once');
    // the head steps aside while reading down and comes back going up
    await p.evaluate(() => window.scrollTo(0, 1600)); await wait(p, 120); await p.evaluate(() => window.scrollTo(0, 2200)); await wait(p, 500);
    ok(await p.evaluate(() => document.documentElement.classList.contains('hide-top')), 'head steps aside going down');
    await p.evaluate(() => window.scrollTo(0, 1900)); await wait(p, 500);
    ok(await p.evaluate(() => !document.documentElement.classList.contains('hide-top')), 'head back going up');
    await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 300);
    // a second photo on hover, where there is one
    await p.hover('#grid .card:nth-child(1) .ph'); await wait(p, 500);
    ok(await p.evaluate(() => !!document.querySelector('#grid .card:nth-child(1) .ph').__b2), 'hover asks for a second photo once');
    await p.click('#grid .card:nth-child(2) .sv'); await wait(p, 60);
    ok(await p.evaluate(() => document.querySelector('#grid .card:nth-child(2) .sv').classList.contains('pop')), 'save mark answers');
    await p.click('#grid .card:nth-child(2) .sv'); await wait(p, 200);
    // detail: the photo carries over; the large one follows
    await p.click('#grid .card:nth-child(3) .ph'); await wait(p, 1000);
    const d = await p.evaluate(() => { const im = document.getElementById('dvImg'); return { open: !document.getElementById('ov').hidden, now: document.getElementById('ov').classList.contains('now'),
      vt: document.documentElement.classList.contains('vt-on'), hi: im && im.getAttribute('data-hi'), on: im && im.classList.contains('on') } });
    ok(d.open && !d.now && !d.vt && d.on && !d.hi, 'detail open, large photo in place ' + JSON.stringify(d));
    const dt = await typeOf(p, '#dv');
    ok(dt.size.length <= 5, 'detail: few sizes ' + dt.size.join(' '));
    await p.keyboard.press('Escape'); await wait(p, 800);
    ok(await p.evaluate(() => document.getElementById('ov').hidden && !/item=/.test(location.search) && !document.documentElement.classList.contains('vt-on')), 'detail closes back into its card');
    ok((await csp(p)).length === 0 && p.errs.length === 0, 'room: no CSP or errors ' + JSON.stringify(await csp(p)) + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- phone: photos by swipe, type on a phone
  { console.log('phone'); const p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2 });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 700);
    const t = await typeOf(p);
    ok(t.size.length <= 5 && t.size[0] >= 12, 'phone front page: few sizes, none under 12px ' + t.size.join(' '));
    await p.goto(H.BASE + '/?archive=hl&source=Grailed'); await H.ready(p); await wait(p, 700);
    let opened = false;
    for (let i = 1; i <= 12 && !opened; i++) {
      await p.click('#grid .card:nth-child(' + i + ') .ph'); await wait(p, 800);
      if (await p.$('#dvPn')) { opened = true; break }
      await p.click('.dv-x'); await wait(p, 500);
    }
    if (opened) {
      const box = await p.$eval('.dv-main', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
      const cdp = await p.context().newCDPSession(p);
      const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
      await touch('touchStart', box.x + 120, box.y); for (let s = 1; s <= 6; s++) await touch('touchMove', box.x + 120 - s * 30, box.y + 2); await touch('touchEnd');
      await wait(p, 400);
      ok(/^2 \//.test(await p.$eval('#dvPn', (e) => e.textContent)), 'swipe left: next photo ' + await p.$eval('#dvPn', (e) => e.textContent));
    } else ok(true, 'no multi-photo listing in the first 12 (skipped)');
    ok(p.errs.length === 0, 'phone: no errors ' + p.errs.join(' | '));
    await p.context().close(); }

  // ---------------------------------------------------------------- reduced motion: nothing moves
  { console.log('reduced motion'); const p = await H.page(b, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(H.BASE + '/'); await H.ready(p); await wait(p, 300);
    const r = await p.evaluate(() => ({ fx: document.documentElement.classList.contains('fx'), dur: getComputedStyle(document.querySelector('.ph img') || document.body).transitionDuration }));
    ok(!r.fx && /^0\.00001s|^1e-05s|^0s/.test(r.dur), 'reduced: no motion ' + JSON.stringify(r));
    await p.click('.room.r-hl .room-name'); await wait(p, 500);
    ok(await p.evaluate(() => location.search === '?archive=hl' && !document.documentElement.classList.contains('vt-on')), 'reduced: room change without a transition');
    await p.context().close(); }

  console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
  await b.close();
})();
