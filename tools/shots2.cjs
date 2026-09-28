// design review shots: after arrivals have finished (1.6 s)
const H = require('./harness.cjs');
const list = process.argv.slice(2);
(async () => {
  const b = await H.browser();
  const jobs = {
    'home-1440': ['/', { width: 1440, height: 900 }, {}],
    'home-390': ['/', { width: 390, height: 844 }, { mobile: true, dpr: 2 }],
    'home-band-1440': ['/', { width: 1440, height: 900 }, {}, async (p) => { await p.evaluate(() => window.scrollTo(0, document.getElementById('band').offsetTop - 300)); }],
    'foot-1440': ['/', { width: 1440, height: 900 }, {}, async (p) => { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); }],
    'foot-390': ['/', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); }],
    'hl-1440': ['/?archive=hl', { width: 1440, height: 900 }, {}],
    'hl-390': ['/?archive=hl', { width: 390, height: 844 }, { mobile: true, dpr: 2 }],
    'ccp-1440': ['/?archive=ccp', { width: 1440, height: 900 }, {}],
    'ccp-390': ['/?archive=ccp', { width: 390, height: 844 }, { mobile: true, dpr: 2 }],
    'hl-yahoo-1440': ['/?archive=hl&source=%EC%95%BC%ED%9B%84%EC%98%A5%EC%85%98', { width: 1440, height: 900 }, {}],
    'hl-detail-1440': ['/?archive=hl&source=%EC%95%BC%ED%9B%84%EC%98%A5%EC%85%98', { width: 1440, height: 900 }, {}, async (p) => { await p.click('#grid .card:nth-child(2) .ph'); }],
    'hl-sold-detail-1440': ['/?archive=hl&show=sold', { width: 1440, height: 900 }, {}, async (p) => { await p.click('#grid .card:nth-child(1) .ph'); }],
    'hl-detail-390': ['/?archive=hl&source=%EB%A9%94%EB%A3%A8%EC%B9%B4%EB%A6%AC', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#grid .card:nth-child(1) .ph'); }],
    'search-1440': ['/', { width: 1440, height: 900 }, {}, async (p) => { await p.keyboard.press('/'); await p.keyboard.type('bondage'); }],
    'about-1440': ['/?view=about', { width: 1440, height: 900 }, {}],
    'filter-390': ['/?archive=hl', { width: 390, height: 844 }, { mobile: true, dpr: 2 }, async (p) => { await p.click('#ftog') }],
  };
  for (const k of Object.keys(jobs)) {
    if (list.length && !list.includes(k)) continue;
    const [u, vp, o, fn] = jobs[k];
    const p = await H.page(b, vp, o); await p.goto(H.BASE + u); await H.ready(p); await p.waitForTimeout(1700);
    if (fn) { await fn(p); await p.waitForTimeout(1500) }
    await p.screenshot({ path: 'shots/' + k + '.png' });
    if (p.errs.length) console.log(k, p.errs);
    const csp = await p.evaluate(() => window.__csp || []); if (csp.length) console.log(k, 'CSP', csp);
    await p.context().close();
  }
  await b.close(); console.log('done');
})();
