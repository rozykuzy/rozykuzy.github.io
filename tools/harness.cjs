// shared test harness: local fonts in place of Google Fonts, stand-in photos for the sellers' image hosts
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const FONTS = path.join(__dirname, 'node_modules/@fontsource');
const faces = [['Inter',300,'inter/files/inter-latin-300-normal.woff2'],['Inter',400,'inter/files/inter-latin-400-normal.woff2'],['Inter',500,'inter/files/inter-latin-500-normal.woff2'],
  ['IBM Plex Mono',400,'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'],['IBM Plex Mono',500,'ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2']];
const CSS = faces.map(([f,w,p]) => `@font-face{font-family:'${f}';font-style:normal;font-weight:${w};font-display:swap;src:url(https://fonts.gstatic.com/l/${p.split('/').pop()}) format('woff2')}`).join('\n');
const PH = fs.readdirSync(path.join(__dirname,'ph')).map((f) => fs.readFileSync(path.join(__dirname,'ph',f)));
const BASE = process.env.BASE || 'http://127.0.0.1:8930';
async function browser(){ return chromium.launch() }
async function page(b, vp, o = {}) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile, reducedMotion: o.reduced ? 'reduce' : 'no-preference', locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  if (o.storage) await ctx.addInitScript((s) => { for (const k in s) localStorage.setItem(k, s[k]) }, o.storage);
  await ctx.route(/^https:\/\/fonts\.googleapis\.com\//, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: CSS }));
  await ctx.route(/^https:\/\/fonts\.gstatic\.com\//, (r) => { const f = r.request().url().split('/').pop(); const hit = faces.find((x) => x[2].endsWith(f));
    return hit ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(path.join(FONTS, hit[2])) }) : r.abort() });
  await ctx.route(/^https:\/\/(?!fonts\.)/, (r) => {
    if (o.noimg || r.request().resourceType() !== 'image') return r.abort();
    let h = 0; for (const c of r.request().url()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return r.fulfill({ status: 200, contentType: 'image/jpeg', body: PH[h % PH.length] });
  });
  const p = await ctx.newPage();
  p.errs = []; p.csp = [];
  p.on('pageerror', (e) => p.errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) p.errs.push('console: ' + m.text()) });
  await p.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { (window.__csp = window.__csp || []).push(e.violatedDirective + ' ' + e.blockedURI) }) });
  return p;
}
async function ready(p, sel = '#grid .card:not(.sk), #tgrid .card, .sg .card, .ab .kv dd, #sgm-hl li', t = 20000) {
  await p.waitForFunction(() => !document.querySelector('#load.on'), null, { timeout: t }).catch(() => {});
  await p.waitForTimeout(250);
}
async function overflow(p) { return p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth })) }
module.exports = { browser, page, ready, overflow, BASE };
