const H = require('./harness.cjs');
(async () => {
  const b = await H.browser();
  for (const [name, url] of [['home', '/'], ['hl room', '/?archive=hl'], ['ccp room', '/?archive=ccp'], ['hl item', '/?archive=hl&item=x14zlu']]) {
    const p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2, noimg: true });
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1638400 / 8, uploadThroughput: 750000 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bytes = 0; cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength });
    const t0 = Date.now();
    await p.goto(H.BASE + url, { waitUntil: 'commit' });
    await p.waitForFunction(() => document.querySelector('.card:not(.sk)') || document.querySelector('.err') || document.querySelector('.dv-info'), null, { timeout: 90000 });
    const tCards = Date.now() - t0;
    await p.waitForTimeout(200);
    const m = await p.evaluate(() => { const f = performance.getEntriesByName('first-contentful-paint')[0]; return { fcp: f ? Math.round(f.startTime) : null } });
    console.log(name.padEnd(9), 'FCP', m.fcp + 'ms', '· content', tCards + 'ms', '· transferred', Math.round(bytes / 1024) + ' KB');
    await p.context().close();
  }
  await b.close();
})();
