const H = require('./harness.cjs');
(async () => {
  const b = await H.browser();
  const p = await H.page(b, { width: 1440, height: 900 }, { storage: { 'aix.visit.hl': JSON.stringify({ date: '2026-09-20', prev: null }) } });
  await p.goto(H.BASE + '/?archive=hl'); await H.ready(p); await p.waitForTimeout(300);
  const s1 = await p.evaluate(() => ({ since: document.getElementById('since').textContent, hidden: document.getElementById('since').hidden, visit: localStorage.getItem('aix.visit.hl') }));
  console.log('since token:', JSON.stringify(s1));
  await p.click('#since button'); await p.waitForTimeout(300);
  console.log('after click:', await p.evaluate(() => [location.search, document.querySelector('#count b').textContent, document.querySelector('#since button').getAttribute('aria-pressed')]));
  await p.click('#f-flag [data-v="gone"]'); await p.waitForTimeout(300);
  console.log('gone + since:', await p.evaluate(() => [location.search, document.querySelector('#count b').textContent]));
  await p.click('#applied .tok.all'); await p.waitForTimeout(300);
  await p.click('#f-flag [data-v="gone"]'); await p.waitForTimeout(300);
  console.log('gone only:', await p.evaluate(() => [location.search, document.querySelector('#count b').textContent, document.querySelectorAll('#grid .card.gone').length, document.querySelector('#grid .card .sub').textContent]));
  await p.click('#f-flag [data-v="gone"]'); await p.click('#f-flag [data-v="multi"]'); await p.waitForTimeout(300);
  console.log('multi:', await p.evaluate(() => [location.search, document.querySelector('#count b').textContent, document.querySelector('#f-flag [data-v="multi"] .op-n').textContent]));
  // a second visit on the same day keeps the same baseline
  await p.reload(); await H.ready(p); await p.waitForTimeout(300);
  console.log('same-day reload:', await p.evaluate(() => [localStorage.getItem('aix.visit.hl'), document.getElementById('since').textContent]));
  console.log('errs', p.errs);
  await b.close();
})();
