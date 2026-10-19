// v5 screenshots: the main views at three widths
const H = require('./harness.cjs');
const OUT = process.env.OUT || '/tmp/shots5';
require('fs').mkdirSync(OUT, { recursive: true });
const wait = (p, ms) => p.waitForTimeout(ms);
(async () => {
  const b = await H.browser();
  const only = (process.argv[2] || '').split(',').filter(Boolean);
  const want = (k) => !only.length || only.includes(k);
  const errs = [];
  async function shot(name, vp, url, act, o = {}) {
    if (!want(name)) return;
    const p = await H.page(b, vp, o);
    await p.goto(H.BASE + url); await H.ready(p); await wait(p, 700);
    if (act) await act(p);
    await wait(p, 500);
    await p.screenshot({ path: OUT + '/' + name + '.png', fullPage: !!o.full });
    const ov = await H.overflow(p);
    if (ov.sw > ov.w) errs.push(name + ' overflow ' + JSON.stringify(ov));
    if (p.errs.length) errs.push(name + ': ' + p.errs.join(' | '));
    if (await p.evaluate(() => (window.__csp || []).length)) errs.push(name + ' csp ' + await p.evaluate(() => window.__csp.join(',')));
    await p.context().close();
  }
  const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };
  await shot('home-d', D, '/', null, { full: true });
  await shot('home-m', M, '/', null, { mobile: true, dpr: 2, full: true });
  await shot('room-d', D, '/?archive=hl');
  await shot('room-d2', D, '/?archive=hl', async (p) => { await p.evaluate(() => window.scrollTo(0, 420)) });
  await shot('room-m', M, '/?archive=ccp', null, { mobile: true, dpr: 2 });
  await shot('drawer-d', D, '/?archive=hl', async (p) => { await p.click('#ftog'); await wait(p, 500) });
  await shot('drawer-m', M, '/?archive=hl', async (p) => { await p.click('#ftog'); await wait(p, 500) }, { mobile: true, dpr: 2 });
  await shot('detail-d', D, '/?archive=hl', async (p) => { await p.click('#grid .card .t a'); await wait(p, 900) });
  await shot('detail-m', M, '/?archive=hl', async (p) => { await p.click('#grid .card .ph'); await wait(p, 900) }, { mobile: true, dpr: 2 });
  await shot('search-d', D, '/', async (p) => { await p.keyboard.press('/'); await p.keyboard.type('bondage'); await wait(p, 600) });
  await shot('brands-d', D, '/?view=brands');
  await shot('new-d', D, '/?view=new');
  await shot('saved-d', D, '/?view=saved');
  await shot('about-d', D, '/?view=about', null, { full: true });
  await shot('menu-m', M, '/', async (p) => { await p.click('#menuBtn'); await wait(p, 500) }, { mobile: true, dpr: 2 });
  await shot('room-t', { width: 1024, height: 800 }, '/?archive=ccp');
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
