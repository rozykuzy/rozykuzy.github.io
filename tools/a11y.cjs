const H = require('./harness.cjs'); const fs = require('fs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
async function audit(p, name) {
  await p.evaluate(AXE);
  const r = await p.evaluate(async () => {
    const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, resultTypes: ['violations'] });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 3).map((x) => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n').slice(1, 2).join('').trim().slice(0, 140)) }));
  });
  console.log('==', name, r.length ? '' : 'clean');
  r.forEach((v) => console.log('  ', v.impact, v.id, 'x' + v.n, '\n     ' + v.ex.join('\n     ')));
  return r;
}
(async () => {
  const b = await H.browser();
  // audited in the final state (reduced motion): cards mid-arrival are transparent and would read as low contrast
  const go = async (url, vp, o, fn, name) => { const p = await H.page(b, vp, Object.assign({ reduced: true }, o || {})); await p.goto(((o && o.base) || H.BASE) + url); await H.ready(p); await p.waitForTimeout(400); if (fn) { await fn(p); await p.waitForTimeout(500) } await audit(p, name); await p.context().close() };
  const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 }, MO = { mobile: true, dpr: 2 };
  await go('/', D, {}, null, 'home desktop');
  await go('/?archive=hl', D, {}, null, 'hl room');
  await go('/?archive=ccp', D, {}, null, 'ccp room');
  await go('/?archive=hl', D, {}, async (p) => p.click('#grid .card .t a'), 'hl detail');
  await go('/?archive=ccp', D, {}, async (p) => p.click('#grid .card .t a'), 'ccp detail');
  await go('/', D, {}, async (p) => { await p.keyboard.press('/'); await p.keyboard.type('coat'); await p.waitForTimeout(400) }, 'search overlay');
  await go('/?view=saved', D, { storage: { 'hlx.saved': JSON.stringify({ 'https://www.grailed.com/listings/102614695': { k: 1, p: 1, u: 'USD', d: '2026-09-27', g: 0 }, 'https://example.com/x': 1 }) } }, null, 'saved');
  await go('/?view=about', D, {}, null, 'about');
  await go('/?archive=ccp', M, MO, null, 'ccp phone');
  await go('/?archive=hl', M, MO, async (p) => p.click('#ftog'), 'filter sheet phone');
  await go('/', M, MO, async (p) => p.click('#menuBtn'), 'menu phone');
  await go('/nope', D, {}, null, '404');
  await go('/?view=new', D, {}, null, 'new in');
  await go('/?view=brands', D, {}, null, 'brands');
  await go('/?archive=hl', D, {}, async (p) => p.click('#ftog'), 'filter drawer desktop');
  await go('/?archive=ccp', D, {}, async (p) => p.hover('.arch .mm:nth-of-type(1) > a'), 'menu panel');
  // the brands (fixtures/BRAND)
  await go('/?brand=rick-owens', D, {}, null, 'brand room');
  await go('/?brand=guidi', D, {}, async (p) => p.click('#grid .card .t a'), 'brand detail');
  await go('/?brand=uma-wang', M, MO, null, 'brand phone');
  await go('/?brand=guidi', D, {}, async (p) => p.click('#ftog'), 'brand filter drawer');
  await go('/?view=brands', M, MO, null, 'brands phone');
  await go('/?archive=ccp', D, {}, async (p) => p.hover('.arch a[data-nav="brands"]'), 'brands panel');
  await go('/', D, {}, async (p) => { await p.keyboard.press('/'); await p.keyboard.type('ri'); await p.waitForTimeout(400) }, 'search brands');
  await go('/?view=new', D, {}, async (p) => p.click('#newT [data-nt="brands"]'), 'new in brands');
  await go('/?brand=guidi', D, { storage: { 'brx.saved': JSON.stringify({ 'rick-owens|zzzzzz': { k: 1, p: 1, u: '', d: '2026-10-18', g: 0 } }) } },
    async (p) => { await p.click('#grid .card .sv'); await p.click('.utl a[data-nav="saved"]'); await p.waitForTimeout(600); await H.ready(p) }, 'saved brands');
  // and the site before /BRAND/ is published
  const off = await H.serve({ BRAND: 'off' });
  try { await go('/', D, { base: off.base }, null, 'home without BRAND') } finally { off.close() }
  await b.close();
})();
