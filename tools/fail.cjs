const H = require('./harness.cjs');
(async () => {
  const b = await H.browser();
  let p = await H.page(b, { width: 1440, height: 900 });
  await p.goto('http://127.0.0.1:8931/'); await H.ready(p); await p.waitForTimeout(600);
  console.log('home with HL down:', JSON.stringify(await p.evaluate(() => ({ hl: document.getElementById('st-hl').textContent, ccp: document.getElementById('st-ccp').textContent.slice(0, 30), today: document.querySelectorAll('#tgrid .card').length, todayTxt: document.getElementById('tgrid').textContent.slice(0, 40), rooms: document.querySelectorAll('.room-ph img').length }))));
  await p.screenshot({ path: 'shots/fail-home.png' });
  await p.goto('http://127.0.0.1:8931/?archive=hl'); await H.ready(p); await p.waitForTimeout(600);
  console.log('room with HL down:', JSON.stringify(await p.evaluate(() => ({ err: (document.querySelector('.err') || {}).textContent, grid: document.querySelectorAll('#grid .card').length, rm: document.getElementById('rm').textContent }))));
  await p.click('[data-retry="hl"]'); await p.waitForTimeout(800);
  console.log('after retry:', JSON.stringify(await p.evaluate(() => ({ err: !!document.querySelector('.err'), sk: document.querySelectorAll('#grid .sk').length }))));
  await p.screenshot({ path: 'shots/fail-room.png' });
  await p.goto('http://127.0.0.1:8931/?archive=hl&item=abc'); await H.ready(p); await p.waitForTimeout(600);
  console.log('item with HL down:', await p.evaluate(() => location.search), 'errs', p.errs);
  await p.keyboard.press('/'); await p.keyboard.type('coat'); await p.waitForTimeout(500);
  console.log('search with HL down:', await p.evaluate(() => document.getElementById('sres').textContent.slice(0, 120)));
  await p.context().close();
  // slow data: what shows while it arrives
  p = await H.page(b, { width: 390, height: 844 }, { mobile: true, dpr: 2 });
  await p.goto('http://127.0.0.1:8932/?archive=hl'); await p.waitForTimeout(700);
  await p.screenshot({ path: 'shots/slow-room.png' });
  console.log('slow room at 0.7s:', JSON.stringify(await p.evaluate(() => ({ load: document.getElementById('load').classList.contains('on'), sk: document.querySelectorAll('#grid .sk').length }))));
  await H.ready(p); await p.waitForTimeout(300);
  console.log('slow room done:', await p.evaluate(() => document.querySelectorAll('#grid .card:not(.sk)').length), 'errs', p.errs);
  await p.context().close(); await b.close();
})();
