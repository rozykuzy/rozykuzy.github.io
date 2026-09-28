const H = require('./harness.cjs');
(async () => { const b = await H.browser();
  for (const w of [320, 360, 390]) { const p = await H.page(b, { width: w, height: 800 }, { mobile: true, dpr: 2 });
    await p.goto(H.BASE + '/?archive=ccp'); await H.ready(p); await p.click('#grid .card .ph'); await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const x = document.querySelector('.dv-x').getBoundingClientRect(), t = document.querySelector('.dv-tag'); return { closeH: Math.round(x.height), closeRight: Math.round(x.right), tagClipped: t.scrollWidth > t.clientWidth, over: document.documentElement.scrollWidth > innerWidth } });
    console.log(w, JSON.stringify(r)); if (w === 320) await p.screenshot({ path: 'shots/dvbar-320.png', clip: { x: 0, y: 0, width: 320, height: 60 } }); await p.context().close() }
  await b.close() })();
