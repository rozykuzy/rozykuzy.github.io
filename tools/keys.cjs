const H = require('./harness.cjs');
(async () => {
  const b = await H.browser(); const p = await H.page(b, { width: 1440, height: 900 });
  await p.goto(H.BASE + '/?archive=hl'); await H.ready(p);
  const seen = [];
  for (let i = 0; i < 46; i++) {
    await p.keyboard.press('Tab');
    const d = await p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '') + ' "' + (e.getAttribute('aria-label') || e.textContent || e.value || '').trim().slice(0, 22) + '"') +
        ' outline:' + cs.outlineStyle + ' vis:' + (r.width > 0 && r.bottom > 0 && r.top < innerHeight) });
    seen.push(d);
  }
  console.log(seen.map((s, i) => (i + 1) + ' ' + s).join('\n'));
  await b.close();
})();
