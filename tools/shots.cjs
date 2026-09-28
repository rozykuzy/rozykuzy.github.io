const H = require('./harness.cjs');
const list = process.argv.slice(2);
(async () => {
  const b = await H.browser();
  const jobs = {
    'hl-768': ['/?archive=hl', { width: 768, height: 1024 }, { mobile: true, dpr: 1 }],
    'home-1024': ['/', { width: 1024, height: 768 }, {}],
    'hl-1280': ['/?archive=hl', { width: 1280, height: 800 }, {}],
    'home-1920': ['/', { width: 1920, height: 1080 }, {}],
    'ccp-2560': ['/?archive=ccp', { width: 2560, height: 1440 }, {}],
    'hl-detail-1440': ['/?archive=hl', { width: 1440, height: 900 }, {}, async (p) => { await p.click('#grid .card:nth-child(3) .t a') }],
    'ccp-detail-1440': ['/?archive=ccp', { width: 1440, height: 900 }, {}, async (p) => { await p.click('#grid .card:nth-child(2) .t a') }],
    'hl-detail-390': ['/?archive=hl', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#grid .card:nth-child(3) .ph') }],
    'search-1440': ['/', { width: 1440, height: 900 }, {}, async (p) => { await p.keyboard.press('/'); await p.keyboard.type('bondage'); }],
    'search-390': ['/', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#searchBtn'); await p.keyboard.type('coat'); }],
    'about-1440': ['/?view=about', { width: 1440, height: 900 }, {}],
    'filter-390': ['/?archive=hl', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#ftog') }],
    'menu-390': ['/?archive=hl', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#menuBtn') }],
    'home-today-1440': ['/', { width: 1440, height: 900 }, {}, async (p) => { await p.evaluate(() => window.scrollTo(0, document.getElementById('today').offsetTop - 60)) }],
    'saved-1440': ['/?view=saved', { width: 1440, height: 900 }, { storage: { 'hlx.saved': JSON.stringify({ 'https://www.grailed.com/listings/102614695': { k: 1, p: 32000, u: 'USD', d: '2026-09-27', g: 0 }, 'https://example.com/gone-listing': 1 }) } }],
    'hl-scrolled-1440': ['/?archive=hl&category=outer&year=1998-1999', { width: 1440, height: 900 }, {}, async (p) => { await p.evaluate(() => window.scrollTo(0, 700)) }],
  };
  for (const k of Object.keys(jobs)) {
    if (list.length && !list.includes(k)) continue;
    const [u, vp, o, fn] = jobs[k];
    const p = await H.page(b, vp, o); await p.goto(H.BASE + u); await H.ready(p); await p.waitForTimeout(500);
    if (fn) { await fn(p); await p.waitForTimeout(700) }
    await p.screenshot({ path: 'shots/' + k + '.png' });
    if (p.errs.length) console.log(k, p.errs);
    await p.context().close();
  }
  await b.close(); console.log('done');
})();
