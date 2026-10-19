// brand screens at 1440 and 390 (and the menu panel at 1024), in the shots5.cjs manner
//   node shots_brands.cjs [name,name…]       OUT=dir (default ../shots/brands) · NOBRAND=<base of a BRAND=off server>
const H = require('./harness.cjs');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '..', 'shots', 'brands');
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
    await p.goto((o.base || H.BASE) + url); await H.ready(p); await wait(p, 700);
    if (act) await act(p);
    await wait(p, 500);
    await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: !!o.full });
    const ov = await H.overflow(p);
    if (ov.sw > ov.w) errs.push(name + ' overflow ' + JSON.stringify(ov));
    if (p.errs.length) errs.push(name + ': ' + p.errs.join(' | '));
    if (await p.evaluate(() => (window.__csp || []).length)) errs.push(name + ' csp ' + await p.evaluate(() => window.__csp.join(',')));
    await p.context().close();
  }
  const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 }, MO = { mobile: true, dpr: 2 };
  const saved = { storage: { 'brx.saved': JSON.stringify({ 'rick-owens|zzzzzz': { k: 1, p: 1, u: '', d: '2026-10-18', g: 0 } }) } };
  await shot('home-d', D, '/', null, { full: true });
  await shot('home-m', M, '/', null, Object.assign({ full: true }, MO));
  await shot('brands-d', D, '/?view=brands', null, { full: true });
  await shot('brands-m', M, '/?view=brands', null, MO);
  await shot('room-d', D, '/?brand=rick-owens');
  await shot('room-d2', D, '/?brand=rick-owens', async (p) => { await p.evaluate(() => window.scrollTo(0, 420)) });
  await shot('room-m', M, '/?brand=guidi', null, MO);
  await shot('list-d', D, '/?brand=guidi', async (p) => { await p.click('#lay [data-lay="list"]'); await wait(p, 300) });
  await shot('drawer-d', D, '/?brand=rick-owens', async (p) => { await p.click('#ftog'); await wait(p, 500) });
  await shot('detail-d', D, '/?brand=rick-owens', async (p) => { await p.click('#grid .card .t a'); await wait(p, 900) });
  await shot('detail-m', M, '/?brand=guidi', async (p) => { await p.click('#grid .card .ph'); await wait(p, 900) }, MO);
  await shot('seek-d', D, '/?brand=uma-wang&q=coat', async (p) => { await p.evaluate(() => document.getElementById('seek').scrollIntoView()) });
  await shot('panel-d', D, '/?brand=guidi', async (p) => { await p.hover('.arch a[data-nav="brands"]'); await wait(p, 500) });
  await shot('panel-t', { width: 1024, height: 768 }, '/', async (p) => { await p.hover('.arch a[data-nav="brands"]'); await wait(p, 500) });
  await shot('new-d', D, '/?view=new', async (p) => { await p.click('#newT [data-nt="brands"]'); await wait(p, 400) });
  await shot('search-d', D, '/', async (p) => { await p.keyboard.press('/'); await p.keyboard.type('ri'); await wait(p, 600) });
  await shot('search-m', M, '/', async (p) => { await p.click('#searchBtn'); await p.keyboard.type('guidi'); await wait(p, 600) }, MO);
  await shot('saved-d', D, '/?brand=guidi', async (p) => { await p.click('#grid .card:nth-child(2) .sv'); await p.click('#grid .card:nth-child(5) .sv');
    await p.click('.utl a[data-nav="saved"]'); await wait(p, 900) }, saved);
  if (process.env.NOBRAND) {
    await shot('nobrand-home-d', D, '/', null, { full: true, base: process.env.NOBRAND });
    await shot('nobrand-brands-d', D, '/?view=brands', null, { base: process.env.NOBRAND });
  }
  console.log(errs.length ? errs.join('\n') : 'no errors', '→', OUT);
  await b.close();
})();
