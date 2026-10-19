/* Archive Index — one index over two archives and the brands.
   The listings come from the two archive pages on this same site (/helmut-lang/ and /ccp/):
   each page carries its day's data in <script id="__data">, and engine.js reads a listing
   by the same rules that page uses. The brands come from /BRAND/ on this same site (index.json,
   b/<slug>.json in the CCP page's own data shape, new.json); each brand is one more archive id
   ('b:<slug>') read by its own copy of the CCP rules. Until /BRAND/ is published, every brand
   piece stays out of sight. Nothing here edits a listing. */
(function(){
'use strict';

var AIX=window.AIX||{}, P=AIX.profiles||{};
var doc=document, root=doc.documentElement;
function $(id){ return doc.getElementById(id) }
var own=Object.prototype.hasOwnProperty;
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':'&#39;' }) }
function won(n){ return Number(n||0).toLocaleString('ko-KR') }
function okUrl(u){ return typeof u==='string' && /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : '' }
function fnv(u){ var h=0x811c9dc5; u=String(u||''); for(var i=0;i<u.length;i++){ h^=u.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0 } return h.toString(36) }
function lsGet(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); return true }catch(e){ return false } }
function lsJSON(k){ var v=lsGet(k); if(v==null) return null; try{ return JSON.parse(v) }catch(e){ return null } }
function keys(o){ var a=[],k; for(k in o) if(own.call(o,k)&&o[k]) a.push(k); return a }
function any(o){ for(var k in o) if(own.call(o,k)&&o[k]) return true; return false }
function dec(s){ s=String(s==null?'':s); try{ return decodeURIComponent(s) }catch(e){ return s } }
function mq(q){ return window.matchMedia ? matchMedia(q) : {matches:false} }
var REDUCED=mq('(prefers-reduced-motion: reduce)');
function md(d){ var m=/^\d{4}-(\d{2})-(\d{2})/.exec(d||''); return m?(+m[1])+'/'+(+m[2]):'' }
function kday(d){ var m=/^\d{4}-(\d{2})-(\d{2})/.exec(d||''); return m?(+m[1])+'월 '+(+m[2])+'일':'' }
var KST=null; try{ KST=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}) }catch(e){}
function kst(iso){ var t=Date.parse(iso||''); if(isNaN(t)) return ''; return KST?KST.format(new Date(t)):new Date(t).toLocaleString('ko-KR') }
function clip(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s }
// a value inside a selector's quotes (a filter value can hold any character)
function cssv(v){ v=String(v); try{ if(window.CSS && CSS.escape) return CSS.escape(v) }catch(e){} return v.replace(/["\\\n\r\f]/g,function(c){ return c==='\n'?'\\a ':c==='\r'?'\\d ':c==='\f'?'\\c ':'\\'+c }) }
// one quiet line for a screen reader (a step in the detail, more listings drawn)
function live(t,h){ var el=$('live'); if(!el) return; el.textContent=''; setTimeout(function(){ if(h) el.innerHTML=h; else el.textContent=t },60) }
// after the next paint: a press shows at once, the work it asks for comes in the following task
function afterPaint(fn){ requestAnimationFrame(function(){ setTimeout(fn,0) }) }
// A control the code draws again keeps the keyboard: its new copy takes the focus (known by what it does, its data-*),
// or else the control now in its place, or else `fb`. Nothing moves if the focus was not lost.
var KEEPA=['data-cat','data-off','data-v','data-nt','data-tt','data-azt','data-save','data-unsave','data-u','data-sort','data-g','data-retry','data-lay'];
var FOC='a[href],button:not([disabled]),input,select,textarea,summary';
function focusMark(ids){
  var el=doc.activeElement; if(!el || el===doc.body || el===root) return null;
  for(var i=0;i<ids.length;i++){ var box=$(ids[i]); if(!box || box===el || !box.contains(el)) continue;
    var sel=el.tagName.toLowerCase(), any=false;
    KEEPA.forEach(function(k){ if(el.hasAttribute(k)){ sel+='['+k+'="'+cssv(el.getAttribute(k))+'"]'; any=true } });
    var c=el.closest('[data-k]'); if(c && c!==el && box.contains(c)){ sel='[data-a="'+cssv(c.getAttribute('data-a'))+'"][data-k="'+cssv(c.getAttribute('data-k'))+'"] '+sel; any=true }
    return {box:ids[i], sel:any?sel:null, idx:[].slice.call(box.querySelectorAll(FOC)).indexOf(el)};
  }
  return null;
}
function focusBack(m,fb){
  if(!m) return; var cur=doc.activeElement; if(cur && cur!==doc.body && cur!==root) return;
  var box=$(m.box), t=null, seen=function(x){ return x && x.getClientRects().length };
  if(box && !box.hidden && seen(box)){
    if(m.sel){ t=box.querySelector(m.sel); if(!seen(t)) t=null }
    if(!t && m.idx>=0){ var all=[].filter.call(box.querySelectorAll(FOC),seen); if(all.length) t=all[Math.min(m.idx,all.length-1)] }
  }
  if(t) try{ t.focus({preventScroll:true}) }catch(e){}
  if(doc.activeElement!==t && fb){ var f=typeof fb==='string'?$(fb):fb; if(f) try{ f.focus({preventScroll:true}) }catch(e){} }
}
// a row of tabs wider than the screen fades at the edge it goes on past
function edges(){ var ts=doc.querySelectorAll('.tabs'); for(var i=0;i<ts.length;i++) edge1(ts[i]) }
function edge1(el){ if(!el.__e){ el.__e=1; el.addEventListener('scroll',function(){ edge1(el) },{passive:true}) }
  el.classList.toggle('more', el.scrollWidth>el.clientWidth+4 && el.scrollLeft+el.clientWidth<el.scrollWidth-4) }
var EDR=0; window.addEventListener('resize',function(){ if(!EDR) EDR=requestAnimationFrame(function(){ EDR=0; edges() }) },{passive:true});

/* ---------------------------------------------------------------- motion
   Little of it: photographs fade in, a second photo on hover, the tab line, the photo that carries
   into the detail. html.fx is the one switch: without it (reduced motion, or no JS) nothing moves. */
function fxOn(){ return !REDUCED.matches }
function fxSync(){ root.classList.toggle('fx', fxOn()) }
fxSync(); if(REDUCED.addEventListener) REDUCED.addEventListener('change', fxSync);
function nextFrame(fn){ requestAnimationFrame(function(){ requestAnimationFrame(fn) }) }
// a second photo under the first, fetched the first time the pointer rests on a card
doc.addEventListener('pointerover',function(e){
  if(e.pointerType && e.pointerType!=='mouse') return;
  var ph=e.target.closest && e.target.closest('.card .ph'); if(!ph || ph.__b2) return; ph.__b2=1;
  var it=itemOfEl(ph); if(!it) return; var u=phs(it)[1]; if(!u) return;
  var im=doc.createElement('img'); im.className='b2'; im.alt=''; im.decoding='async'; im.setAttribute('data-b','1');
  im.onload=function(){ im.classList.add('ok') }; im.onerror=function(){ im.remove() };
  im.src=okUrl(thumb(it.__a,u,600))||u; ph.appendChild(im);
},{passive:true});

if(!P.hl || !P.ccp){ var m0=$('main'); if(m0) m0.innerHTML='<div class="fatal"><p>Could not load</p><p><a href="/helmut-lang/">Helmut Lang</a> · <a href="/ccp/">Carol Christian Poell</a></p></div>'; return }

/* ---------------------------------------------------------------- archives */
var ARCH={
  hl: {a:'hl', no:'01', name:'Helmut Lang', short:'Helmut Lang', ab:'HL', path:'/helmut-lang/', sk:'hlx.saved', vk:'aix.visit.hl',
       ph:'Item · year · model', span:'1986–2005', upd:'매일 09:00', sub:'1986–2005'},
  ccp:{a:'ccp', no:'02', name:'Carol Christian Poell', short:'CCP', ab:'CCP', path:'/ccp/', sk:'ccpx.saved', vk:'aix.visit.ccp',
       ph:'Item · year · number', span:'All seasons', upd:'매일', sub:'전 시즌'}
};
var AS=['hl','ccp'];
// a brand is the archive id 'b:<slug>'; its entry in ARCH (and P, DATA) is made when the brand index arrives (brands with listings)
var SLUG=/^[a-z0-9][a-z0-9-]{0,79}$/, BRK='brx.saved', BVK='aix.visit.brx';
function isB(a){ return typeof a==='string' && a.slice(0,2)==='b:' }
function slugOf(a){ return String(a).slice(2) }
function roomHref(a){ return isB(a)?'/?brand='+slugOf(a):'/?archive='+a }
// the reader for an id: a brand's own once it is ready; before that, the CCP page's slugs, bands and photo sizes (the same)
function prof(a){ return P[a] || (isB(a)?P.ccp:null) }
function ccpLike(a){ return a==='ccp' || isB(a) }
// a listing's photographs that can be shown: an address the page would refuse is not counted as a photograph
function phs(it){ return P[it.__a].photosOf(it).map(okUrl).filter(Boolean) }

/* ---------------------------------------------------------------- words on screen
   Menus, filters, buttons and counts are English (set in capitals by the stylesheet); what a listing
   says about itself — year basis, source, customs, dates — stays in Korean, as the archives write it.
   The archives' own values (categories, motifs) are only shown in other words here: addresses keep them. */
var CATEN={'아우터':'Outerwear','데님':'Denim','팬츠':'Trousers','상의':'Tops','테일러링':'Tailoring','신발':'Footwear',
  '가방·액세서리':'Bags & accessories','가방·소품':'Bags & small goods','셔츠':'Shirts','주얼리':'Jewellery','기타':'Other'};
var MOTIFEN={bondage:'Bondage',astro:'Astro',flak:'M69 flak',bullet:'Bulletproof',painter:'Painter',parachute:'Parachute',taxi:'Taxi',
  harness:'Harness · holster',seatbelt:'Seatbelt',biker:'Biker',aviator:'Aviator',ma1:'MA-1',kite:'Kite',mohawk:'Mohawk',
  reflective:'Reflective',resin:'Resin · rubber',sample:'Sample · runway',deadstock:'Deadstock',
  drip:'Drip',objectdyed:'Object dyed',overlock:'Overlock',deadend:'Dead end',chainseam:'Chain seam',scarstitch:'Scar stitch',
  seamless:'Seamless',reversible:'Reversible',spiral:'Spiral',inbetween:'In between',prosthetic:'Prosthetic',tornado:'Tornado',
  diagonalzip:'Diagonal zip',usole:'U-sole',paperdart:'Paper dart',goodyear:'Goodyear',officer:'Officer',highneck:'High neck',vestbag:'Vest bag'};
var MARKEN={italy:'Made in Italy',austria:'Made in Austria',usa:'Made in USA',japan:'Made in Japan',portugal:'Made in Portugal',
  jeans:'Helmut Lang Jeans',mainline:'Mainline',kangaroo:'Kangaroo',horse:'Horse',cordovan:'Cordovan',bison:'Bison',titanium:'Titanium','new':'New · unworn'};
var FLAGEN={'new':'New','drop':'Price drop','multi':'Multi-listed','saved':'Saved','gone':'Delisted','since':'Since last visit','sold':'Sold records'};
function catEn(c){ return own.call(CATEN,c)?CATEN[c]:c }
function motifEn(a,m){ return own.call(MOTIFEN,m)?MOTIFEN[m]:P[a].motifLbl(m) }
function markEn(a,m){ return own.call(MARKEN,m)?MARKEN[m]:(P[a].MARKLBL[m]||m) }
function grpEn(a,g){ return g==='y'?'Year':g==='cert'?'Year basis':g==='motif'?(ccpLike(a)?'Technique · model':'Motif'):g==='src'?'Source':
  g==='price'?'Price':g==='mark'?(ccpLike(a)?'Material · mark':'Origin · line'):g==='flag'?'Status':g }
// the archive's price bands written as figures: ~30만 → under ₩300K
function kfig(v){ return v>=1e6?String(v/1e6)+'M':Math.round(v/1e3)+'K' }
function priceEn(a,b){ var r=null; prof(a).PRICE.forEach(function(x){ if(x[0]===b) r=x }); if(!r) return b;
  if(!(r[1]>0)) return 'Under ₩'+kfig(r[2]);
  if(!(r[2]<Infinity)) return '₩'+kfig(r[1])+' and up';
  return '₩'+kfig(r[1])+'–'+kfig(r[2]) }
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
function enDay(d){ var m=/^\d{4}-(\d{2})-(\d{2})/.exec(d||''); return m?MON[+m[1]-1]+' '+(+m[2]):'' }

/* ---------------------------------------------------------------- loading */
var busyN=0;
function busy(d){ busyN=Math.max(0,busyN+d); var l=$('load'); if(l) l.classList.toggle('on',busyN>0) }
var DATA={}, PEND={}, FAIL={}, SINCE={}, MCOUNT={hl:{},ccp:{}}, SRCSEEN={hl:{},ccp:{}};

function extract(t){
  var m=t.indexOf('id="__data"'); if(m<0) throw new Error('nodata');
  var s=t.indexOf('>',m)+1, e=t.indexOf('</script>',s);
  if(s<1||e<0) throw new Error('nodata');
  return JSON.parse(t.slice(s,e));
}
// A request keeps its status on the error (only a 404 means "not there"), tries once more after a network failure or a
// server error, gives up when no answer has begun in 30 seconds, and lets go when the signal says the reader has left.
function req(u,o,kind){
  o=o||{};
  var c=window.AbortController?new AbortController():null, up=o.signal, late=false, timer=0;
  if(c && up){ if(up.aborted) c.abort(); else up.addEventListener('abort',function(){ c.abort() }) }
  // (the 30 seconds are for an answer to begin, each try; the download itself may take as long as the line needs)
  var arm=function(){ if(!c) return; clearTimeout(timer); timer=setTimeout(function(){ late=true; c.abort() },o.ms||30000) };
  var opt={credentials:'same-origin'}; if(c) opt.signal=c.signal; if(o.low) opt.priority='low';
  var once=function(){ arm(); return fetch(u,opt).then(function(r){ clearTimeout(timer);
    if(!r.ok){ var e=new Error('HTTP '+r.status); e.status=r.status; throw e }
    return kind==='text'?r.text():kind==='none'?r.arrayBuffer().then(function(){ return null }):r.json() }) };
  return once().catch(function(e){
    if(late || (up && up.aborted) || !(e && (e.name==='TypeError' || e.status>=500))) throw e;
    return new Promise(function(res){ setTimeout(res,900) }).then(once);
  }).then(function(v){ clearTimeout(timer); return v },
    function(e){ clearTimeout(timer); if(late){ var t=new Error('timeout'); t.status=0; throw t } throw e });
}
function getJSON(u,o){ return req(u,o,'json') }
// an archive's data is in its page; a brand's is a file of its own, read by the brands' copy of the CCP rules
// (a brand room opened from its address asks for its file at once, beside the brand index: EARLY)
var EARLY={}, EARLYC={};
function source(a,sig){
  if(isB(a)){ var early=EARLY[a], ec=EARLYC[a]; delete EARLY[a]; delete EARLYC[a];
    var get=function(){ return getJSON(ARCH[a].path,{signal:sig}) };
    if(early && ec && sig) sig.addEventListener('abort',function(){ ec.abort() });
    return Promise.all([early ? early.catch(function(e){ if(sig && sig.aborted) throw e; return get() }) : get(), bengine()])
      .then(function(r){ bprof(a); return r[0] }) }
  return req(ARCH[a].path,{signal:sig},'text').then(extract);
}
// a brand's download stops when the reader leaves its room (Saved shows several brands and keeps them)
var CTL={};
function load(a){
  if(DATA[a]) return Promise.resolve(DATA[a]);
  if(PEND[a]) return PEND[a];
  if(!own.call(ARCH,a)) return Promise.reject(new Error('unknown'));
  busy(1);
  var c=isB(a) && window.AbortController ? new AbortController() : null; CTL[a]=c;
  PEND[a]=source(a,c&&c.signal)
    .then(function(d){ if(!d || !Array.isArray(d.items)) throw new Error('shape'); return ready(a,d,c&&c.signal) })
    .then(function(d){ CTL[a]=null; busy(-1); delete FAIL[a]; PEND[a]=null; if(ST.item && !DV.it) setTimeout(syncItem,0); return d },
          function(e){ CTL[a]=null; busy(-1); PEND[a]=null; if(!(c && c.signal.aborted)) FAIL[a]=e; if(ST.item && !DV.it) setTimeout(syncItem,0); throw e });
  return PEND[a];
}
function letGo(){
  for(var a in CTL) if(own.call(CTL,a) && CTL[a] && !(ST.view==='room' && ST.a===a) && ST.view!=='saved') CTL[a].abort();
  for(var e in EARLYC) if(own.call(EARLYC,e) && !(ST.view==='room' && ST.a===e)){ if(EARLYC[e]) EARLYC[e].abort(); delete EARLYC[e]; delete EARLY[e] }
}

/* ---------------------------------------------------------------- brands: the index, their reader, today's new ones
   BIDX: null = not asked yet, false = none (not published, or unreadable), else the index. Brands without listings
   are in it with c = 0; a brand that has an archive here (ex) is that archive. */
var BIDX=null, BIDXP=null, BENTRY={}, BLIST=[], BBASE={today:null, rates:{}, counts:{}}, BMETA=null;
// BERR: the index is there but could not be read this time (anything but a 404) — a brand address then keeps its
// place and says so, with Retry, instead of opening the list of brands
var BERR=false;
function num(v){ v=+v; return isFinite(v) && v>0 ? Math.floor(v) : 0 }
function bidx(){
  if(BIDX!==null) return Promise.resolve(BIDX);
  if(BIDXP) return BIDXP;
  busy(1); BERR=false;
  BIDXP=getJSON('/BRAND/index.json').then(function(x){ var b=bindex(x); if(!b) BERR=true; return b },
      function(e){ if(!(e && e.status===404)) BERR=true; return false })
    .catch(function(){ BERR=true; return false })
    .then(function(x){ busy(-1); BIDX=x||false; BIDXP=null; brandPanel(); drawerMeta(); return BIDX });
  return BIDXP;
}
function bindex(x){
  if(!x || !Array.isArray(x.brands)) return false;
  var list=[];
  x.brands.forEach(function(e){
    if(!e || typeof e!=='object') return;
    var s=String(e.s||'').toLowerCase(); if(!SLUG.test(s) || own.call(BENTRY,s)) return;
    var q=e.q && typeof e.q==='object' ? e.q : {}, str=function(v){ return typeof v==='string' && v.trim() ? v.trim().slice(0,80) : null };
    var b={s:s, n:(str(e.n)||s), c:num(e.c), nw:num(e.nw), so:num(e.so), big:!!e.big,
      ph:(Array.isArray(e.ph)?e.ph:[]).map(okUrl).filter(Boolean).slice(0,2), q:{en:str(q.en), ja:str(q.ja), ko:str(q.ko)},
      ex:(typeof e.ex==='string' && AS.indexOf(e.ex)>=0)?e.ex:null};
    BENTRY[s]=b; list.push(b);
    // a room for each brand with listings; one with none is a name in the list (its address opens the list)
    if(b.ex || !b.c) return;
    var a='b:'+s;
    ARCH[a]={a:a, slug:s, brand:true, name:b.n, short:b.n, path:'/BRAND/b/'+s+'.json', sk:BRK, ph:'Item · year · size',
      span:b.big?'Dated listings':'All seasons', upd:'매일', sub:'', e:b};
    SRCSEEN[a]={}; MCOUNT[a]={};
  });
  BLIST=list;
  BBASE={today:typeof x.today==='string'?x.today:null, rates:x.rates && typeof x.rates==='object' ? x.rates : {}, counts:{}};
  BMETA={built:typeof x.built==='string'?x.built:null,
    sources:(Array.isArray(x.sources)?x.sources:[]).filter(function(s){ return s && typeof s==='object' && typeof s.name==='string' })};
  return {built:x.built, today:BBASE.today, brands:list};
}
// a brand seen for the first time today has every listing new; like an archive's first day, none of it counts as new
function firstDay(b){ return !!(b && b.c>0 && b.nw>=b.c) }
function brandsIn(){ return BLIST.filter(function(b){ return !b.ex }) }

// The brands' reader: a second copy of the CCP rules (engine.js run once more), so a brand's day, rates and query
// never touch the CCP room's own. CCP's motifs are emptied from this copy; each brand puts its own names in
// where the CCP rules say Carol Christian Poell (search noise, the "find elsewhere" queries).
var BENG=null, BENGP=null, BCUR=null;
function bengine(){
  if(BENG) return Promise.resolve(BENG);
  if(BENGP) return BENGP;
  BENGP=new Promise(function(res,rej){
    var cur=doc.querySelector('script[src*="engine.js"]'), s=doc.createElement('script');
    s.src=cur?cur.getAttribute('src'):'/engine.js'; s.async=true;
    s.onload=function(){ var w=window.AIX, c=w && w.profiles && w.profiles.ccp; if(w) w.profiles=P; s.remove();
      if(c && c!==P.ccp && Array.isArray(c.MOTIF)) res(c); else rej(new Error('engine')) };
    s.onerror=function(){ s.remove(); rej(new Error('engine')) };
    doc.head.appendChild(s);
  }).then(function(c){ c.MOTIF.length=0; BENG=c; BENGP=null; return c }, function(e){ BENGP=null; throw e });
  return BENGP;
}
function fold(s){ s=String(s||''); try{ s=s.normalize('NFKD') }catch(e){} return s.replace(/[\u0300-\u036f]/g,'') }
var YLATE=new Date().getFullYear()+1;
function bprof(a){
  if(P[a]) return P[a];
  var A=ARCH[a], b=A.e, base=BENG, me=Object.create(base), q=b.q;
  // the brand's own names are not search terms in its own room, as Carol Christian Poell is not in the CCP room
  var noise=[];
  [A.name, q.en, q.ja, q.ko].forEach(function(t){ if(!t) return;
    [base.nrm(t), base.nrm(fold(t))].forEach(function(n){
      var ws=n.split(/[\s\-_./*:&+]+/).filter(Boolean);
      n.split(' ').concat(ws,[ws.join(''), n.replace(/\s+/g,'')]).forEach(function(w){ if(w && noise.indexOf(w)<0) noise.push(w) }) }) });
  var sb={en:q.en||base.nrm(A.name), ja:q.ja||q.en||base.nrm(A.name), ko:q.ko||q.en||base.nrm(A.name)};
  var use=function(){ if(BCUR!==a){ base.setData(me.__d||BBASE); BCUR=a } };
  me.tag=a; me.hasCodes=false; me.codeNum=null; me.__d=null; me.SEEKBRAND=sb;
  me.setData=function(d){ me.__d=d; base.setData(d); BCUR=a };
  // a two-digit season reads as 19xx from 90 and 20xx below it (CCP began in 1995); a brand's AW88 would land in 2088.
  // A year past next year is not guessed into another century: the season stays as written, the listing has no year
  me.prep=function(it){ base.prep(it); if(it.__y && it.__y>YLATE){ it.__y=null; it.__yk='none' } };
  me.setQuery=function(t){ var bn=base.BRANDNOISE; bn.length=0; Array.prototype.push.apply(bn,noise); base.setQuery(t) };
  me.seekQuery=function(parts,L){ var s=base.SEEKBRAND; s.en=sb.en; s.ja=sb.ja; s.ko=sb.ko; return base.seekQuery(parts,L) };
  ['seenText','seenDays','dutyHtml','usdOf','flagsHtml'].forEach(function(f){ var fn=base[f]; me[f]=function(it){ use(); return fn(it) } });
  P[a]=me; return me;
}
// today's new listings across the brands (new.json): BNEW null = not asked yet, false = none
var BNEW=null, BNEWP=null;
// (o.low: asked for by the front page beside the two archives, which matter more there)
function bnew(o){
  if(BNEW!==null) return Promise.resolve(BNEW);
  if(BNEWP) return BNEWP;
  BNEWP=bidx().then(function(x){ if(!x || !brandsIn().length) return false;
      busy(1);
      return Promise.all([getJSON('/BRAND/new.json',{low:!!(o&&o.low)}), bengine()]).then(function(r){ return bnewReady(r[0]) })
        .then(function(v){ busy(-1); return v },function(){ busy(-1); return false }) })
    .catch(function(){ return false })
    .then(function(v){ BNEW=v||false; BNEWP=null; drawerMeta(); if(ST.item && !DV.it) setTimeout(syncItem,0); return BNEW });
  return BNEWP;
}
function bnewReady(x){
  if(!x || !Array.isArray(x.items)) return false;
  if(typeof x.today==='string' && !BBASE.today) BBASE.today=x.today;
  var items=[], byKey={};
  x.items.forEach(function(it,i){
    if(!it || typeof it!=='object' || typeof it.b!=='string') return;
    var a='b:'+it.b.toLowerCase(); if(!own.call(ARCH,a) || firstDay(ARCH[a].e)) return;
    clean(it); it.__a=a; it.__i=i; bprof(a).prep(it); it.__k=fnv(it.l||('#'+i)); it.__nw=1;
    var m=byKey[a]||(byKey[a]={}); if(!own.call(m,it.__k)) m[it.__k]=it;
    items.push(it);
  });
  return {today:x.today||BBASE.today, items:items, byKey:byKey};
}
// a listing by its archive and key: the copy on screen — in New in today's new ones (new.json), elsewhere the
// archive's or brand's own data
function itemAt(a,k){
  var d=DATA[a], m=BNEW && own.call(BNEW.byKey,a) ? BNEW.byKey[a] : null;
  var x=d && own.call(d.__byKey,k) ? d.__byKey[k] : null, y=m && own.call(m,k) ? m[k] : null;
  return ST.view==='new'||ST.view==='home' ? (y||x) : (x||y);
}
// What a listing says is shown as it says it. What the code keeps beside it (the __ fields) never comes from the data,
// and the few fields drawn into the page whole are checked first: a currency is three capitals, offers are objects,
// a price history is a list of points.
var CUR3=/^[A-Z]{3}$/;
function clean(it){
  for(var k in it) if(own.call(it,k) && k.charCodeAt(0)===95 && k.charCodeAt(1)===95) delete it[k];
  if(it.u!=null && !(typeof it.u==='string' && CUR3.test(it.u))) delete it.u;
  if(it.v!=null){
    if(Array.isArray(it.v)){ it.v=it.v.filter(function(x){ return x && typeof x==='object' && !Array.isArray(x) });
      it.v.forEach(function(x){ if(x.u!=null && !(typeof x.u==='string' && CUR3.test(x.u))) delete x.u }) }
    else delete it.v;
  }
  if(it.h!=null && !(Array.isArray(it.h) && it.h.every(Array.isArray))) delete it.h;
  if(it.im!=null && !Array.isArray(it.im)) delete it.im;
  if(it.sc!=null && (typeof it.sc!=='object' || Array.isArray(it.sc))) delete it.sc;
  ['t','s','r','z','e','q'].forEach(function(f){ if(it[f]!=null && typeof it[f]==='object') delete it[f] });
}
// A large brand file (thousands of listings) is read in slices of about 50 ms, so the page answers while it is read.
// (The two archives are read at once: their rooms wait on them anyway, and slicing would only make them later.)
var YIELD=(function(){ if(!window.MessageChannel) return function(fn){ setTimeout(fn,0) };
  var ch=new MessageChannel(), q=[]; ch.port1.onmessage=function(){ var f=q.shift(); if(f) f() };
  return function(fn){ q.push(fn); ch.port2.postMessage(0) } })();
function prepAll(a,d,sig){
  var p=P[a], items=d.items, n=items.length, i=0;
  var one=function(j){ var it=items[j];
    if(!it || typeof it!=='object' || Array.isArray(it)){ items[j]={t:'',k:0,__bad:1}; return }
    clean(it); it.__a=a; it.__i=j; p.prep(it); it.__k=fnv(it.l||('#'+j)) };
  if(!isB(a) || n<=3000 || !window.performance){ for(;i<n;i++) one(i); return null }
  return new Promise(function(res,rej){
    (function slice(){
      // (a reader who has left the room stops the reading too)
      if(sig && sig.aborted){ var e=new Error('aborted'); e.name='AbortError'; rej(e); return }
      p.setData(d);   // another brand may have used the shared reader in between
      var t0=performance.now();
      while(i<n){ one(i++); if((i&63)===0 && performance.now()-t0>50) break }
      if(i<n) YIELD(slice); else res();
    })();
  });
}
function ready(a,d,sig){
  var p=P[a]; p.setData(d);
  if(!Array.isArray(d.sources)) d.sources=[];
  var w=prepAll(a,d,sig);
  return w ? w.then(function(){ p.setData(d); return tally0(a,d) }) : tally0(a,d);
}
function tally0(a,d){
  var p=P[a];
  var byKey={}, byUrl={}, mc={}, live=0, cards=0, tn={A:0,B:0,C:0}, sold=0, gone=0, fresh=0;
  var vals={cat:{},src:{},y:{},motif:{},mark:{}}, cnt={src:{},motif:{}};
  for(var i=0;i<d.items.length;i++){
    var it=d.items[i]; if(it.__bad) continue;
    if(!own.call(byKey,it.__k)) byKey[it.__k]=it;
    if(it.l) byUrl[it.l]=it;
    if(it.so) sold++;
    else if(it.x) gone++;
    else {
      var mult=it.v&&it.v.length?it.v.length:1; live+=mult; cards++; if(own.call(tn,it.__c)) tn[it.__c]++;
      if(it.n) fresh++;
      if(it.mc && p.codeNum){ var cn=p.codeNum(it.mc); if(cn) mc[cn]=(mc[cn]||0)+1 }
      cnt.src[it.r]=(cnt.src[it.r]||0)+1;
      it.__m.forEach(function(x){ cnt.motif[x]=(cnt.motif[x]||0)+1 });
    }
    vals.cat[it.s]=1; vals.src[it.r]=1; vals.y[it.__yk]=1;
    it.__m.forEach(function(x){ vals.motif[x]=1 }); it.__mk.forEach(function(x){ vals.mark[x]=1 });
  }
  d.__byKey=byKey; d.__byUrl=byUrl; d.__live=live; d.__cards=cards; d.__tn=tn; d.__sold=sold; d.__gone=gone; d.__vals=vals; d.__srcN=cnt.src;
  d.__allnew=!!(d.counts && d.counts.items && d.counts.fresh>=d.counts.items);
  d.__fresh=d.__allnew?0:fresh;
  MCOUNT[a]=mc;
  if(!SRCSEEN[a]) SRCSEEN[a]={};
  (d.sources||[]).forEach(function(s){ if(s && s.name && s.seen) SRCSEEN[a][s.name]=s.seen });
  // option order is fixed once from the whole archive, so choices do not jump while counts move
  var cats=p.CATORDER.filter(function(c){ return vals.cat[c] });
  keys(vals.cat).forEach(function(c){ if(cats.indexOf(c)<0) cats.push(c) });
  var ys=keys(vals.y).filter(function(y){ return /^\d{4}$/.test(y) }).sort();
  var srcs=keys(vals.src).sort(function(x,y){ return (cnt.src[y]||0)-(cnt.src[x]||0) || (x<y?-1:1) });
  var mos=p.MOTIF.map(function(m){ return m[0] }).filter(function(m){ return vals.motif[m] })
           .sort(function(x,y){ return (cnt.motif[y]||0)-(cnt.motif[x]||0) });
  var mks=p.MARK.map(function(m){ return m[0] }).filter(function(m){ return vals.mark[m] });
  d.__order={cat:cats, y:ys.concat(vals.y.none?['none']:[]), src:srcs, motif:mos, mark:mks,
    price:p.PRICE.map(function(x){ return x[0] }), cert:['A','B','C']};
  DATA[a]=d;
  if(isB(a)) keepFew(a);
  return d;
}
// The last eight brand rooms read stay in memory; an older one is let go and read again if its room is opened again.
// Not on Saved (it shows many brands at once), and never the room on screen or the listing open.
var BREAD=[];
function keepFew(a){
  var i=BREAD.indexOf(a); if(i>=0) BREAD.splice(i,1); BREAD.push(a);
  if(ST.view==='saved') return;
  while(BREAD.length>8){
    var j=0; while(j<BREAD.length && (BREAD[j]===a || BREAD[j]===ST.a || (DV.it && DV.it.__a===BREAD[j]) || PEND[BREAD[j]])) j++;
    if(j>=BREAD.length) break;
    var x=BREAD.splice(j,1)[0];
    delete DATA[x];
    if(P[x]) P[x].__d=null;
    if(BCUR===x && BENG){ BENG.setData(BBASE); BCUR=null }
  }
}
var VISITED={};
function seen(a){ if(VISITED[a] || !DATA[a]) return; VISITED[a]=1; visit(a,DATA[a]) }
// the brands keep their visit days in one map (aix.visit.brx: slug → {date, prev}), the archives one key each
function objOf(v){ return v && typeof v==='object' && !Array.isArray(v) ? v : null }
function visitGet(a){
  if(!isB(a)) return objOf(lsJSON(ARCH[a].vk));
  var m=objOf(lsJSON(BVK)), s=slugOf(a); return m && own.call(m,s) ? objOf(m[s]) : null;
}
function visitSet(a,v){
  if(!isB(a)) return lsSet(ARCH[a].vk, JSON.stringify(v));
  var m=objOf(lsJSON(BVK))||{}; m[slugOf(a)]=v; return lsSet(BVK, JSON.stringify(m));
}
// "since your last visit" — the day before this one on which the archive was opened here
function visit(a,d){
  var today=d.today; if(!today) return;
  var st=visitGet(a);
  if(st && st.date && st.date>today) return;
  var prev=null;
  if(st && st.date===today) prev=st.prev||null;
  else if(st && st.date && st.date<today) prev=st.date;
  visitSet(a, {date:today, prev:prev});
  var gap=prev?P[a].daysBetween(prev,today):null;
  SINCE[a]=(gap!=null && gap>=2)?prev:null;
  P[a].setSince(SINCE[a]);
}

/* ---------------------------------------------------------------- saved (shared with both archive pages)
   Three stores: hlx.saved and ccpx.saved by listing address, as the two archive pages keep them, and brx.saved
   for every brand by '<slug>|<item key>' — the same value {k,p,u,d,g} in all three. */
var SAVED={}, STORES={hl:'hlx.saved', ccp:'ccpx.saved', brx:BRK};
function storeOf(a){ return isB(a)?'brx':a }
function readSaved(a){ var s=storeOf(a), v=own.call(STORES,s)?lsJSON(STORES[s]):null; return v && typeof v==='object' && !Array.isArray(v) ? v : {} }
function reloadSaved(){ ['hl','ccp','brx'].forEach(function(s){ SAVED[s]=readSaved(s) }) }
reloadSaved();
function curOf(u){ return u && u!=='KRW' ? String(u) : '' }
function skey(it){ return isB(it.__a) ? slugOf(it.__a)+'|'+it.__k : it.l }
function isSaved(it){ var m=SAVED[storeOf(it.__a)], k=skey(it); return !!(m && own.call(m,k) && m[k]) }
function todayOf(a){ var d=DATA[a]; return (d&&d.today) || (isB(a) ? (BNEW&&BNEW.today)||BBASE.today : '') || '' }
function keepMark(it){ return {k:it.k||0, p:it.p||0, u:curOf(it.u), d:todayOf(it.__a), g:it.x?1:0} }
function savedN(){ return keys(SAVED.hl||{}).length+keys(SAVED.ccp||{}).length+keys(SAVED.brx||{}).length }
function savedChange(it){
  var m=SAVED[storeOf(it.__a)]||{}, k=skey(it), b=own.call(m,k)?m[k]:null; if(!b || typeof b!=='object') return null;
  if(it.x) return b.g?null:{gone:true};
  var cu=curOf(it.u); if(curOf(b.u)!==cu) return null;
  var was=cu?b.p:b.k, cur=cu?it.p:it.k;
  if(!(was>0) || !(cur>0)) return null;
  return cur<was ? {drop:true, was:was, cur:cur, u:cu} : null;
}
// opening a saved listing makes its current price the new baseline, as the archive pages do
function ackSaved(it){
  if(!isSaved(it)) return;
  var s=storeOf(it.__a), sk=skey(it), m=readSaved(s), b=m[sk], k=keepMark(it); if(!b) return;
  if(typeof b==='object' && b.k===k.k && b.p===k.p && curOf(b.u)===k.u && !!b.g===!!k.g) return;
  m[sk]=k; if(lsSet(STORES[s],JSON.stringify(m))) SAVED[s]=m;
}
function toggleSave(it){
  var s=storeOf(it.__a), sk=skey(it), m=readSaved(s);
  if(own.call(m,sk) && m[sk]) delete m[sk]; else m[sk]=keepMark(it);
  if(!lsSet(STORES[s],JSON.stringify(m))){ toast('This browser cannot save'); return }
  SAVED[s]=m; savedUi(); marks(it);
  toast(m[sk]?'Saved':'Removed');
  if(ST.view==='saved' || (ST.view==='room' && ST.F.flag.saved)){ LASTQ=null; update() }
}
function marks(it){
  var on=isSaved(it), sel='[data-a="'+it.__a+'"] [data-save="'+it.__k+'"], .dv[data-a="'+it.__a+'"] [data-save="'+it.__k+'"]';
  var bs=doc.querySelectorAll(sel);
  for(var i=0;i<bs.length;i++){
    bs[i].setAttribute('aria-pressed',String(on)); bs[i].classList.toggle('on',on);
    if(bs[i].classList.contains('btn')) bs[i].innerHTML=saveBtnInner(on);
    else if(on && fxOn()){ bs[i].classList.remove('pop'); void bs[i].offsetWidth; bs[i].classList.add('pop') }
  }
}
var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.6 2.7c0 5.6-7.6 10.2-7.6 10.2z"/></svg>';
function saveBtnInner(on){ return '<i class="hrt">'+HEART+'</i><span>'+(on?'Saved':'Save')+'</span>' }
function savedUi(){
  var n=savedN(), s=$('savedN'); if(s) s.textContent=n?won(n):'';
  var sl=$('savedLink'); if(sl) sl.setAttribute('aria-label',n?'Saved, '+won(n):'Saved');
  var dm=$('dmSaved'); if(dm) dm.textContent=n?won(n):'';
}
window.addEventListener('storage',function(e){
  if(e.key===ARCH.hl.sk || e.key===ARCH.ccp.sk || e.key===BRK || e.key===null){
    reloadSaved(); savedUi();
    var bs=doc.querySelectorAll('[data-save]');
    for(var i=0;i<bs.length;i++){ var it=itemOfEl(bs[i]); if(it){ var on=isSaved(it); bs[i].classList.toggle('on',on); bs[i].setAttribute('aria-pressed',String(on));
      if(bs[i].classList.contains('btn')) bs[i].innerHTML=saveBtnInner(on) } }
    if(ST.view==='saved'){ LASTQ=null; update() }
  }
});

/* ---------------------------------------------------------------- state and address */
function blankF(){ return {y:{},cat:{},motif:{},price:{},src:{},cert:{},mark:{},flag:{},size:'',q:''} }
var SORT=[['new','Newest'],['k-','Price high to low'],['k+','Price low to high'],['y+','Year old to new'],['y-','Year new to old'],
          ['drop','Biggest price drop'],['age','Longest listed'],['rel','Relevance']];
var SORTV=SORT.map(function(s){ return s[0] });
var FLAGS=['new','drop','multi','saved','since','gone','sold'];
var ORG=['cat','y','motif','price','src','cert','mark'];
var ST={view:'home', a:null, F:blankF(), sort:'new', item:null};
var LASTQ=null, MOUNTED='', GEN=0;

function params(search){
  var out=Object.create(null), s=String(search||'').replace(/^\?/,'');
  if(!s) return out;
  s.split('&').forEach(function(kv){ if(!kv) return; var i=kv.indexOf('=');
    var k=dec((i<0?kv:kv.slice(0,i)).replace(/\+/g,' ')), v=i<0?'':kv.slice(i+1);
    if(!(k in out)) out[k]=v });
  return out;
}
function formVal(v){ return dec(String(v||'').replace(/\+/g,' ')) }
function listOf(v){ return formVal(v).split(',').map(function(x){ return x.trim() }).filter(Boolean).slice(0,40) }
function unslug(map,v){ for(var k in map) if(own.call(map,k) && map[k]===v) return k; return v }
function unpack(parts){
  var out=[];
  parts.forEach(function(p){
    var m=/^(\d{4})-(\d{4})$/.exec(p);
    if(m){ var x=+m[1], y=+m[2]; if(y<x){ var t=x; x=y; y=t } if(y-x>80) return;
      for(var n=x;n<=y;n++) out.push(String(n)) }
    else if(/^\d{4}$/.test(p) || p==='none') out.push(p);
  });
  return out;
}
function pack(ys){
  var ns=ys.filter(function(k){ return /^\d{4}$/.test(k) }).map(Number).sort(function(a,b){ return a-b });
  var rest=ys.filter(function(k){ return !/^\d{4}$/.test(k) }), out=[], i=0;
  while(i<ns.length){ var j=i; while(j+1<ns.length && ns[j+1]===ns[j]+1) j++; out.push(j>i?ns[i]+'-'+ns[j]:String(ns[i])); i=j+1 }
  return out.concat(rest);
}
function readUrl(search){
  var q=params(search), s={view:'home', a:null, F:blankF(), sort:'new', item:null};
  var a=formVal(q.archive).trim().toLowerCase(), v=formVal(q.view).trim().toLowerCase(), br=formVal(q.brand).trim().toLowerCase();
  if(a==='hl' || a==='ccp'){ s.view='room'; s.a=a }
  else if(SLUG.test(br)){ s.view='room'; s.a='b:'+br }
  if(v==='saved' || v==='about' || v==='new' || v==='brands'){ s.view=v; s.a=null }
  if(s.view==='room'){
    var p=prof(s.a), F=s.F;
    listOf(q.category).forEach(function(x){ F.cat[unslug(p.CATSLUG,x)]=1 });
    unpack(listOf(q.year)).forEach(function(x){ F.y[x]=1 });
    listOf(q.motif).forEach(function(x){ F.motif[x.toLowerCase()]=1 });
    listOf(q.price).forEach(function(x){ var k=unslug(p.PRICESLUG,x); if(own.call(p.PRICESLUG,k)) F.price[k]=1 });
    listOf(q.source).forEach(function(x){ F.src[x]=1 });
    listOf(q['year-basis']).forEach(function(x){ var k=unslug(p.CERTSLUG,x); if(own.call(p.CERT,k)) F.cert[k]=1 });
    listOf(q.label).forEach(function(x){ F.mark[x.toLowerCase()]=1 });
    listOf(q.show).forEach(function(x){ x=x.toLowerCase(); if(FLAGS.indexOf(x)>=0) F.flag[x]=1 });
    F.size=formVal(q.size).trim().toLowerCase().slice(0,24);
    F.q=formVal(q.q).replace(/\s+/g,' ').trim().toLowerCase().slice(0,80);
    // the sort is read raw: '+' in k+ and y+ is part of the value, not a space
    var so=dec(String(q.sort||'')).trim();
    if(SORTV.indexOf(so)<0){ var so2=formVal(q.sort).trim(); if(SORTV.indexOf(so2)>=0) so=so2 }
    if(SORTV.indexOf(so)>=0) s.sort=so;
    if(s.sort==='rel' && !F.q) s.sort='new';
    if(!q.sort && F.q) s.sort='rel';
  }
  var it=formVal(q.item).trim().toLowerCase(); if(/^[0-9a-z]{1,8}$/.test(it)) s.item=it;
  return s;
}
// values the archive does not have are dropped: a filter that matches nothing by construction is not shown
function tidy(st){
  if(st.view!=='room') return;
  var d=DATA[st.a]; if(!d) return;
  var F=st.F, V=d.__vals;
  [['cat','cat'],['y','y'],['motif','motif'],['src','src'],['mark','mark']].forEach(function(g){
    keys(F[g[0]]).forEach(function(v){ if(!own.call(V[g[1]],v)) delete F[g[0]][v] }) });
  if(F.flag.gone && !d.__gone) delete F.flag.gone;
  if(F.flag.sold && !d.__sold) delete F.flag.sold;
  if(F.flag.since && !SINCE[st.a]) delete F.flag.since;
  if(F.flag['new'] && d.__allnew) delete F.flag['new'];
}
function qsOf(st, origin){
  var p=[], enc=function(a){ return a.map(function(x){ return encodeURIComponent(x) }).join(',') };
  if(!origin){
    if(st.view==='saved' || st.view==='about' || st.view==='new' || st.view==='brands') p.push('view='+st.view);
    if(st.view==='room') p.push(isB(st.a)?'brand='+slugOf(st.a):'archive='+st.a);
  }
  if(st.view==='room'){
    var pr=prof(st.a), F=st.F;
    var c=keys(F.cat).map(function(k){ return pr.CATSLUG[k]||k }); if(c.length) p.push('category='+enc(c));
    var y=pack(keys(F.y)); if(y.length) p.push('year='+enc(y));
    var mo=keys(F.motif); if(mo.length) p.push('motif='+enc(mo));
    var pz=keys(F.price).map(function(k){ return pr.PRICESLUG[k]||k }); if(pz.length) p.push('price='+enc(pz));
    var sr=keys(F.src); if(sr.length) p.push('source='+enc(sr));
    var ce=keys(F.cert).map(function(k){ return pr.CERTSLUG[k]||k }); if(ce.length) p.push('year-basis='+enc(ce));
    var mk=keys(F.mark); if(mk.length) p.push('label='+enc(mk));
    var fl=keys(F.flag).filter(function(f){ return !(origin && f==='since') }); if(fl.length) p.push('show='+enc(fl));
    if(F.size) p.push('size='+encodeURIComponent(F.size));
    if(F.q) p.push('q='+encodeURIComponent(F.q));
    if(origin){ if(st.sort!=='k-' && st.sort!=='rel') p.push('sort='+encodeURIComponent(st.sort)) }
    else if(st.sort!=='new' && !(st.sort==='rel' && F.q)) p.push('sort='+encodeURIComponent(st.sort));
  }
  if(!origin && st.item) p.push('item='+st.item);
  return p.join('&');
}
function hrefOf(st){ var q=qsOf(st,false); return '/'+(q?'?'+q:'') }
function writeUrl(push){
  var url=hrefOf(ST);
  if(url===location.pathname+location.search) return false;
  try{ history[push?'pushState':'replaceState']({aix:1},'',url); return true }catch(e){ return false }
}
function filterKey(){ var s={view:ST.view, a:ST.a, F:ST.F, sort:ST.sort, item:null}; return qsOf(s,false) }
function copyF(F){ var o=blankF(); ORG.concat(['flag']).forEach(function(g){ for(var k in F[g]) if(own.call(F[g],k) && F[g][k]) o[g][k]=1 }); o.size=F.size; o.q=F.q; return o }

/* ---------------------------------------------------------------- routing */
function keepPlace(){ try{ var s=history.state && typeof history.state==='object' ? history.state : {}; var o={}; for(var k in s) if(own.call(s,k)) o[k]=s[k];
  o.aix=1; o.y=Math.round(window.scrollY); o.n=SHOWN; history.replaceState(o,'') }catch(e){} }
function go(st, push, after){ var prev=ST; if(push!==false) keepPlace(); ST=st; tidy(ST); if(push!==false) writeUrl(true); route(prev, after) }
function route(prev, after, place){
  // a brand room is known once the brand index is here: a brand with an archive of its own opens that archive,
  // a name the index does not have opens the list of brands
  // (a brand without listings opens the list at its name; an index that could not be read keeps the address, with Retry)
  if(ST.view==='room' && isB(ST.a) && !own.call(ARCH,ST.a)){
    var want=ST;
    bidx().then(function(){
      if(ST!==want) return;
      if(!own.call(ARCH,ST.a)){
        if(EARLYC[ST.a]){ EARLYC[ST.a].abort(); delete EARLYC[ST.a]; delete EARLY[ST.a] }
        if(BERR){ brandDown(); return }
        var s=slugOf(ST.a), e=own.call(BENTRY,s)?BENTRY[s]:null;
        if(e && e.ex){ ST={view:'room', a:e.ex, F:ST.F, sort:ST.sort, item:ST.item}; tidy(ST) }
        else { AZMARK=e?s:null; ST={view:'brands', a:null, F:blankF(), sort:'new', item:null} }
        writeUrl(false);
      }
      route(prev, after, place);
    });
    return;
  }
  var key=ST.view+':'+(ST.a||'');
  if(prev && key===MOUNTED){
    // a change inside the same room: the press is drawn first, the listings follow (unless something waits on them)
    if(filterKey()!==LASTQ){ if(after || ST.item || DV.it) update(); else soonUpdate() }
    syncItem(); if(after) after(); return;
  }
  var run=function(){ mount(); update(); syncItem();
    if(prev){
      if(place && place.y>0){ if(ST.view==='room' && DATA[ST.a]){ while(SHOWN<place.n && SHOWN<VIEW.length) paint(false) } window.scrollTo(0,place.y) }
      else window.scrollTo(0,0);
      focusHead();
    }
    if(after) after() };
  if(prev && fxOn() && doc.startViewTransition){
    root.classList.add('vt-on');
    try{ var t=doc.startViewTransition(run); t.finished.then(done,done) }catch(e){ done(); run() }
  }
  else run();
  function done(){ root.classList.remove('vt-on') }
}
window.addEventListener('popstate',function(e){ var prev=ST; ST=readUrl(location.search); tidy(ST); route(prev, null, e.state && typeof e.state==='object' ? e.state : null) });

function focusHead(){ var h=$('vh'); if(h){ try{ h.focus({preventScroll:true}) }catch(e){} } }

function roomOf(){ return ST.view==='room' ? ST.a : 'home' }
function setRoom(r){ root.setAttribute('data-room',r) }
function title(){
  var t='Archive Index';
  if(ST.view==='room' && !own.call(ARCH,ST.a)) return;
  if(ST.view==='room') t=ARCH[ST.a].name+' — '+t;
  else if(ST.view==='saved') t='Saved — '+t;
  else if(ST.view==='about') t='About — '+t;
  else if(ST.view==='new') t='New in — '+t;
  else if(ST.view==='brands') t='Brands — '+t;
  else t='Archive Index — Helmut Lang · Carol Christian Poell · Brands';
  if(DV.it) t=clip(DV.it.t,60)+' — '+ARCH[DV.it.__a].name;
  doc.title=t;
  // one canonical address per view (filters and the open listing are not separate pages); written here, not in the
  // page, so an address never says another one is its own before the script has read it
  var c=doc.querySelector('link[rel="canonical"]'), q=ST.view==='room'?roomHref(ST.a).slice(1):ST.view!=='home'?'?view='+ST.view:'';
  if(!c){ c=doc.createElement('link'); c.rel='canonical'; doc.head.appendChild(c) }
  c.setAttribute('href','https://rozykuzy.github.io/'+q);
  // a description for each view, and Saved (this browser's own list) out of search engines
  var md0=doc.querySelector('meta[name="description"]'), d=ST.view==='room'?DATA[ST.a]:null, nb=BIDX?BLIST.length:0, desc;
  if(ST.view==='room') desc=ARCH[ST.a].name+(isB(ST.a)?'':' '+ARCH[ST.a].span)+' 중고 매물'+(d?' '+won(d.__cards)+'건':'')+' · 매일 갱신 · 판매자 통화와 원화 환산가';
  else if(ST.view==='brands') desc='브랜드 A–Z'+(nb?' · '+won(brandList().length)+'곳':'')+' · Helmut Lang · Carol Christian Poell · 중고 매물 색인 · 매일 갱신';
  else if(ST.view==='new') desc='오늘 처음 본 중고 매물 · Helmut Lang · Carol Christian Poell'+(nb?' · 브랜드 '+won(nb)+'곳':'');
  else if(ST.view==='about') desc='Archive Index 읽는 법 · 연도 표기 · 가격 · 판매처 · 갱신';
  else if(ST.view==='saved') desc='이 브라우저에 저장한 매물';
  else desc='Helmut Lang 1986–2005, Carol Christian Poell'+(nb?'과 브랜드 '+won(nb)+'곳':'')+'의 중고 매물 색인. 매일 갱신, 판매자 통화와 원화 환산가, 상품명에 적힌 연도.';
  if(md0) md0.setAttribute('content',desc);
  var rb=doc.querySelector('meta[name="robots"]');
  if(ST.view==='saved'){ if(!rb){ rb=doc.createElement('meta'); rb.name='robots'; doc.head.appendChild(rb) } rb.setAttribute('content','noindex') }
  else if(rb) rb.remove();
}
function navUi(){
  // a brand room sits under Brands
  var cur=ST.view==='room'?(isB(ST.a)?'brands':ST.a):ST.view;
  var ls=doc.querySelectorAll('[data-nav]');
  for(var i=0;i<ls.length;i++){ var on=ls[i].getAttribute('data-nav')===cur;
    if(on) ls[i].setAttribute('aria-current','page'); else ls[i].removeAttribute('aria-current') }
}

// what every change of view does first: a new generation, the listing closed, downloads the new view does not need let go,
// and a filter drawer left open (it belongs to the page being replaced) let go with its lock
function leave(){
  LASTQ=null; GEN++; WAITED={}; AUTO=false; SOON=0;
  if(IO){ IO.disconnect(); IO=null }
  closeDetail(true);
  letGo();
  if(LAYER.side){ LAYER.side=false; layers() }
}
function mount(){
  MOUNTED=ST.view+':'+(ST.a||''); leave();
  setRoom(roomOf());
  var m=$('main');
  if(ST.view==='room') m.innerHTML=roomShell(ST.a);
  else if(ST.view==='saved') m.innerHTML=savedShell();
  else if(ST.view==='about') m.innerHTML=aboutShell();
  else if(ST.view==='new') m.innerHTML=newShell();
  else if(ST.view==='brands') m.innerHTML=brandsShell();
  else m.innerHTML=homeShell();
  if(ST.view==='room') bindRoom();
  navUi(); title();
}
function update(){
  var gen=GEN; LASTQ=filterKey();
  if(ST.view==='room') return roomUpdate(gen);
  if(ST.view==='saved') return savedUpdate(gen);
  if(ST.view==='about') return aboutUpdate(gen);
  if(ST.view==='new') return newUpdate(gen);
  if(ST.view==='brands') return brandsUpdate(gen);
  return homeUpdate(gen);
}
function refresh(){ LASTQ=null; update() }
var SOON=0;
function soonUpdate(){ var g=GEN; if(SOON===g) return; SOON=g; afterPaint(function(){ if(SOON===g) SOON=0; if(g===GEN && filterKey()!==LASTQ) update() }) }
// A view that waits on several downloads (Saved, New in) waits on each once, and draws again at most once a frame.
var WAITED={}, AGAIN={};
function waitOn(gen,key,pr,fn){ var k=gen+'|'+key; if(WAITED[k]) return; WAITED[k]=1; var go1=function(){ again(gen,fn) }; pr.then(go1,go1) }
function again(gen,fn){ if(gen!==GEN || AGAIN[gen]) return; AGAIN[gen]=1; requestAnimationFrame(function(){ AGAIN[gen]=0; if(gen===GEN) fn(gen) }) }
// a brand address while the brand index could not be read: the address stays, the page says so
function brxErr(){ return '<div class="err" role="alert"><p class="err-t">Brands · Could not load</p><p class="err-a"><button type="button" class="btn" data-retry="brx">Retry</button></p></div>' }
function brandDown(){
  MOUNTED='down:'+ST.a; leave(); setRoom('home');
  $('main').innerHTML='<section class="vh"><h1 id="vh" tabindex="-1" lang="en">Brands</h1></section><div class="body">'+brxErr()+'</div>';
  navUi(); doc.title='Brands — Archive Index'; focusHead();
}

/* ---------------------------------------------------------------- pieces */
function thumb(a,u,w){ try{ return prof(a).thumb(u,w) }catch(e){ return u } }
function imgTag(a,u,w,o){
  o=o||{}; u=okUrl(u); if(!u) return '';
  var t=okUrl(thumb(a,u,w))||u;
  // o.hi: the one photograph the page is about (a band's) — asked for first; o.eager: on the first screen, not lazy
  return '<img src="'+esc(t)+'"'+(t!==u?' data-full="'+esc(u)+'"':'')+' alt="'+esc(o.alt||'')+'"'+
    (o.hi?' fetchpriority="high"':o.eager?'':' loading="lazy"')+' decoding="async"'+(o.id?' id="'+o.id+'"':'')+'>';
}
function bindImgs(r){
  var ims=(r||doc).querySelectorAll('img:not([data-b])');
  for(var i=0;i<ims.length;i++)(function(im){
    im.setAttribute('data-b','1');
    var ok=function(){ im.classList.add('on') };
    if(im.complete && im.naturalWidth>0){ ok(); return }
    im.addEventListener('load',ok);
    im.addEventListener('error',function(){
      // one retry at the size the listing gave, then an honest blank rather than a broken picture
      var full=im.getAttribute('data-full');
      if(full && im.src!==full){ im.removeAttribute('data-full'); im.src=full; return }
      var p=im.parentNode; if(p) p.classList.add('dead'); im.remove();
    });
  })(ims[i]);
}
function money(v,u){ var sym=u?((P.hl.SYM[u])||u+' '):'₩'; return sym+Number(v).toLocaleString(u?'en-US':'ko-KR') }
function itemOfEl(el){
  var c=el.closest('[data-a]'); if(!c) return null;
  var a=c.getAttribute('data-a'), k=el.getAttribute('data-save')||el.getAttribute('data-open')||c.getAttribute('data-k');
  return a && k ? itemAt(a,k) : null;
}
function subLine(it){
  var p=P[it.__a], auc=p.aucText(it), seen=p.seenText(it);
  return [ it.z?esc(it.z):'',
    it.mc && !isB(it.__a)?'<span class="mc">'+esc(it.mc)+'</span>':'',
    esc(it.r),
    it.g>1?'같은 상품명 '+won(it.g)+'곳':'',
    auc?'<span class="auc">'+esc(auc)+'</span>':'',
    it.so?esc(md(it.so)):(seen?esc(seen):'')
  ].filter(Boolean).join(' · ');
}
// the year as the listing writes it — the archive's own reading (engine flagsHtml), first part only
// (words in Hangul are set as words, not as tracked capitals: class k)
function yearPart(it){
  var h=P[it.__a].flagsHtml(it), m=/^<span(?: class="([a-z]+)")?>([\s\S]*?)<\/span>/.exec(h);
  return m?'<span class="yr'+(m[1]?' '+m[1]:'')+(RE_HANG.test(m[2])?' k':'')+'">'+m[2]+'</span>':'';
}
// what is happening to the listing: new today, a lower price, a sale on record, gone from the list
// (not what the section around it already says: no NEW on every card of New today, no PRICE DROP under Price drops)
function statusFl(it,ctx){
  var d=DATA[it.__a], o=[]; ctx=ctx||{};
  if(it.so) o.push('<span class="sold">Sold record</span>');
  if((it.n || it.__nw) && !(d && d.__allnew) && !ctx['new']) o.push('<span class="nw">New</span>');
  if(it.w && it.w>it.k && !ctx.drop) o.push('<span class="dr">Price drop</span>');
  if(it.x) o.push('<span>Delisted</span>');
  return o.join('');
}
// a struck price says what it is to a screen reader
function wasSr(h){ return String(h).replace(/<span class="was">/g,'<span class="was"><span class="sr" lang="en">was </span>') }
// an archive's name on a card: Carol Christian Poell is CCP on a phone
function atName(a){ var A=ARCH[a]; return A.ab && A.name.length>12 ? '<span class="nm-l">'+esc(A.name)+'</span><span class="nm-s">'+esc(A.ab)+'</span>' : esc(A.name) }
// the language a listing's own title is written in (its script decides), so a Japanese title breaks by Japanese rules,
// takes Japanese glyph forms and is read by a Japanese voice; Hangul first, since a Korean title may quote kana
var RE_HANG=/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/, RE_KANA=/[\u3040-\u30ff\u31f0-\u31ff\uff66-\uff9f]/, RE_HAN=/[\u3400-\u9fff]/;
function tlang(t){ t=t||''; return RE_HANG.test(t)?'ko':(RE_KANA.test(t)||RE_HAN.test(t))?'ja':'en' }
function tl(it){ var l=it.__lg||(it.__lg=tlang(it.t)); return ' lang="'+(l==='ko'||l==='ja'?l:'en')+'"' }
function card(it,o){
  o=o||{}; var a=it.__a, A=ARCH[a], p=P[a], k=it.__k, on=isSaved(it);
  var ph=phs(it), ch=o.change?savedChange(it):null, st=statusFl(it,o.ctx);
  return '<article class="card'+(it.x?' gone':'')+(it.so?' rec':'')+'" data-a="'+a+'" data-k="'+k+'">'+
    '<div class="ph" data-open="'+k+'">'+imgTag(a,ph[0],600,{eager:o.eager, alt:''})+'</div>'+
    '<button type="button" class="sv'+(on?' on':'')+'" data-save="'+k+'" aria-pressed="'+on+'" aria-label="Save · '+esc(clip(it.t,40))+'"><i>'+HEART+'</i></button>'+
    '<div class="cap">'+
      '<div class="vd">'+(o.tag?'<span class="at">'+atName(a)+'</span>':'')+yearPart(it)+'</div>'+
      '<h3 class="t"'+tl(it)+'><a href="'+roomHref(a)+'&amp;item='+k+'" data-open="'+k+'">'+esc(it.t)+'</a></h3>'+
      wasSr(p.priceHtml(it,false))+
      (st?'<div class="fl" lang="en">'+st+'</div>':'')+
      (ch?'<div class="chg" lang="en">'+(ch.gone?'Delisted since saved':'Lower since saved '+esc(money(ch.was,ch.u))+' → '+esc(money(ch.cur,ch.u)))+'</div>':'')+
      '<div class="sub">'+subLine(it)+'</div>'+
    '</div></article>';
}
// one line of the index: number, photo, year as written (the card's words), title, size, source, price
function row(it,i,o){
  o=o||{}; var a=it.__a, k=it.__k, on=isSaved(it), ph=phs(it)[0];
  var price='₩'+won(it.k), cut=it.w>it.k?Math.round((it.w-it.k)/it.w*100):0;
  var pr='<span class="r-p">'+(cut?'<s><span class="sr" lang="en">was </span>₩'+won(it.w)+'</s>':'')+esc(price)+(cut?'<em>−'+cut+'%</em>':'')+'</span>';
  return '<article class="row'+(it.x?' gone':'')+'" data-a="'+a+'" data-k="'+k+'">'+
    '<span class="r-no">'+String(i+1).padStart(3,'0')+'</span>'+
    '<span class="ph r-ph" data-open="'+k+'">'+imgTag(a,ph,160)+'</span>'+
    '<h3 class="r-t"'+tl(it)+'><a href="'+roomHref(a)+'&amp;item='+k+'" data-open="'+k+'">'+esc(it.t)+'</a></h3>'+
    '<span class="r-m">'+
      '<span class="r-y">'+yearPart(it)+'</span>'+
      (it.z?'<span class="r-z">'+esc(it.z)+'</span>':'')+
      '<span class="r-s">'+(o.tag?esc(isB(a)?ARCH[a].short:ARCH[a].short==='CCP'?'CCP':'HL')+' · ':'')+esc(it.r)+'</span>'+
      pr+
    '</span>'+
    pr+
    '<button type="button" class="sv'+(on?' on':'')+'" data-save="'+k+'" aria-pressed="'+on+'" aria-label="Save · '+esc(clip(it.t,40))+'"><i>'+HEART+'</i></button>'+
  '</article>';
}
function skel(n){ var h=''; for(var i=0;i<n;i++) h+='<div class="card sk"><div class="ph"></div><div class="cap"><i></i><i></i><i></i></div></div>'; return h }
function errBox(a){
  return '<div class="err" role="alert"><p class="err-t">'+esc(ARCH[a].name)+' · Could not load</p>'+
    '<p class="err-a"><button type="button" class="btn" data-retry="'+a+'">Retry</button></p></div>';
}
function toast(t){ var el=$('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(function(){ el.classList.remove('on') },1800) }

/* ---------------------------------------------------------------- home */
// the front page: the two archives as two photographs, what came in today, what got cheaper
function homeShell(){
  return '<h1 class="sr" id="vh" tabindex="-1">Archive Index</h1>'+
  '<nav class="rooms" id="hero" aria-label="Archive rooms">'+AS.map(function(a){ var A=ARCH[a];
    return '<a class="room r-'+a+'" href="/?archive='+a+'">'+
      '<span class="room-ph" id="rp-'+a+'" aria-hidden="true"></span>'+
      '<span class="room-t" lang="en">'+
        '<span class="room-name">'+esc(A.name)+'</span>'+
        '<span class="room-meta"><span class="room-sp">'+esc(A.span)+'</span><span class="room-stat" id="st-'+a+'"><span class="sk w60"></span></span></span>'+
        '<span class="room-go">Enter</span>'+
      '</span>'+
    '</a>' }).join('')+
  '</nav>'+
  '<section class="sec today" id="today" aria-labelledby="todayH">'+
    '<div class="sec-h" lang="en"><h2 id="todayH">New today</h2><span class="sec-d" id="todayD"></span></div>'+
    '<div class="tabs" id="todayT" role="group" aria-label="New today" lang="en"></div>'+
    '<div class="grid" id="tgrid">'+skel(8)+'</div>'+
    '<div class="sec-more" lang="en"><a class="btn" href="/?view=new">View all new</a></div>'+
  '</section>'+
  // the brands under what came in today; a grey frame while the brand index is on its way, nothing without one
  '<section class="sec bros" id="bros" aria-labelledby="brosH"'+(BIDX===false?' hidden':'')+'>'+
    '<div class="sec-h" lang="en"><h2 id="brosH">Brands</h2></div>'+
    '<div class="bgrid" id="bgrid">'+(BIDX===null?broSkel():'')+'</div>'+
    '<div class="sec-more" lang="en"><a class="btn" href="/?view=brands">All brands</a></div>'+
  '</section>'+
  '<section class="sec drops" id="drops" aria-labelledby="dropsH" hidden>'+
    '<div class="sec-h" lang="en"><h2 id="dropsH">Price drops</h2></div>'+
    '<div class="grid" id="dlist"></div>'+
    '<div class="sec-more" id="dropsL" lang="en"></div>'+
  '</section>';
}
function broSkel(){ var h=''; for(var i=0;i<4;i++) h+='<span class="bt sk-t" aria-hidden="true"><span class="ph"></span><span class="bt-n">&nbsp;</span><span class="bt-s">&nbsp;</span></span>'; return h }
// the same photographs all day: a fixed shuffle of the listings with a photo, seeded by the day
function seeded(str){ var h=2166136261>>>0; for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0 }
  return function(){ h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0; return h/4294967296 } }
// a photograph that can stand behind a name: one from a host that serves it large, of a piece the archive can date
function bigOk(u){ return /media-assets\.grailed\.com|cdn\.shopify\.com|i\.ebayimg\.com|auc-pctr\.c\.yimg\.jp|images\.vestiairecollective\.com|static\.mercdn\.net|img\.fril\.jp/.test(u||'') }
function heroPick(a,d,salt){
  var live=d.items.filter(function(it){ return it.i && !it.x && !it.so && !it.__bad });
  var pool=live.filter(function(it){ return bigOk(it.i) }); if(pool.length<8) pool=live;
  var dated=pool.filter(function(it){ return it.__c==='A' || it.__c==='B' }); if(dated.length>=8) pool=dated;
  if(!pool.length) return null;
  var r=seeded(a+(salt||'')+(d.today||'')); return pool[Math.floor(r()*pool.length)];
}
function heroImg(a,it,hi){ return it?imgTag(a,it.i,1200,{hi:hi}):'' }
function roomPhoto(a,id,salt){
  var el=$(id), d=DATA[a]; if(!el || !d || el.__done) return; el.__done=1;
  el.innerHTML=heroImg(a,heroPick(a,d,salt),true); bindImgs(el);
}
function shortTime(iso){ var s=kst(iso); return s.replace(/(\d{1,2})월\s*(\d{1,2})일\s*/,'$1/$2 ') }
function statHtml(a,d){
  var s=[['Items',won(d.__cards)]];
  if(!d.__allnew && d.__fresh>0) s.push(['New',won(d.__fresh)]);
  if(d.built) s.push(['Updated',esc(shortTime(d.built))]);
  return s.map(function(x){ return '<span><em>'+x[0]+'</em> <b>'+x[1]+'</b></span>' }).join('');
}
// the brands with the most new listings today (a brand's first day does not count), then the largest, four at most
function cmpName(x,y){ return x.n.localeCompare(y.n,'en',{sensitivity:'base'}) }
function broPick(){
  var L=brandsIn().filter(function(b){ return b.c>0 });
  var out=L.filter(function(b){ return b.nw>0 && !firstDay(b) }).sort(function(x,y){ return y.nw-x.nw || y.c-x.c || cmpName(x,y) }).slice(0,4);
  L.slice().sort(function(x,y){ return y.c-x.c || cmpName(x,y) }).forEach(function(b){ if(out.length<4 && out.indexOf(b)<0) out.push(b) });
  return out;
}
function broUpdate(gen){
  bidx().then(function(x){
    var box=$('bros'), g=$('bgrid'); if(gen!==GEN || !box || !g) return;
    var L=x?broPick():[];
    if(!L.length){ box.hidden=true; g.innerHTML=''; return }
    g.innerHTML=L.map(function(b){ var fresh=b.nw>0 && !firstDay(b);
      return '<a class="bt" href="/?brand='+b.s+(fresh?'&amp;show=new':'')+'">'+
        '<span class="ph'+(b.ph[0]?'':' dead')+'">'+imgTag('b:'+b.s,b.ph.filter(bigOk)[0]||b.ph[0],600)+'</span>'+
        '<span class="bt-n">'+esc(b.n)+'</span>'+
        '<span class="bt-s" lang="en">'+(fresh?'<em>New</em> <b>'+won(b.nw)+'</b>':'<em>Items</em> <b>'+won(b.c)+'</b>')+'</span></a>' }).join('');
    bindImgs(g); box.hidden=false;
  });
}
function homeUpdate(gen){
  broUpdate(gen);
  // New today counts the brands too (new.json), as New in does
  bnew({low:true}).then(function(){ todayUpdate(gen); drawerMeta() });
  AS.forEach(function(a){
    var paint=function(){ if(gen!==GEN) return; var d=DATA[a]; seen(a);
      var st=$('st-'+a); if(st) st.innerHTML=statHtml(a,d);
      roomPhoto(a,'rp-'+a,'home'); todayUpdate(gen); dropsUpdate(gen); drawerMeta();
    };
    if(DATA[a]) paint();
    else load(a).then(paint,function(){ if(gen!==GEN) return; var st=$('st-'+a); if(st) st.innerHTML='<span class="bad">Could not load</span>'; todayUpdate(gen); dropsUpdate(gen) });
  });
}
var TILELIST=[];
function cmpNew(a,b){ return (b.n||0)-(a.n||0) || (a.f===b.f?0:(b.f||'')>(a.f||'')?1:-1) || b.k-a.k }
function newOf(a){ var d=DATA[a]; if(!d) return []; return d.items.filter(function(it){ return it.n && !it.x && !it.so && !it.__bad && !d.__allnew }).sort(cmpNew) }
function bnewLive(){ return BNEW ? BNEW.items.filter(function(it){ return !it.x && !it.so && !it.__bad }).sort(cmpNew) : [] }
// a tab: a name and its count. An archive's long name gives way to its letters on a phone (HL, CCP) and keeps both in
// what a screen reader says
function tabHtml(attr,cur,t){
  var ab=t[3], lbl=ab?'<span class="nm-l">'+esc(t[1])+'</span><span class="nm-s" aria-hidden="true">'+esc(ab)+'</span>':esc(t[1]);
  return '<button type="button" class="tab" data-'+attr+'="'+t[0]+'" aria-pressed="'+(t[0]===cur)+'"'+
    (ab?' aria-label="'+esc(t[1]+' ('+ab+') '+won(t[2]))+'"':'')+(t[4]?' disabled':'')+'>'+lbl+'<sup>'+won(t[2])+'</sup></button>';
}
var TODAYLIST=[], TODAYTAB='all', TODAYPER={}, TODAYSRC=[];
function todayUpdate(gen){
  if(gen!==GEN) return;
  var g=$('tgrid'); if(!g) return;
  // (drawn once, when the two archives and the brands' new listings are here — not twice with cards changing places)
  var done=AS.every(function(a){ return DATA[a] || FAIL[a] }) && !(BNEW===null && BIDX!==false); if(!done) return;
  var fm=focusMark(['todayT']);
  var per={}, total=0, src=AS.slice();
  AS.forEach(function(a){ per[a]=newOf(a); total+=per[a].length });
  per.brands=bnewLive(); if(per.brands.length){ src.push('brands'); total+=per.brands.length }
  TODAYPER=per; TODAYSRC=src;
  var d0=DATA.hl||DATA.ccp;
  $('todayD').textContent=d0?enDay(d0.today):(BNEW&&BNEW.today?enDay(BNEW.today):'');
  if(TODAYTAB!=='all' && !(per[TODAYTAB]||[]).length) TODAYTAB='all';
  var tabs=[['all','All',total]].concat(src.map(function(a){ return a==='brands'?['brands','Brands',per.brands.length]:[a,ARCH[a].name,per[a].length,ARCH[a].ab] }));
  $('todayT').innerHTML=total?tabs.filter(function(t){ return t[0]==='all' || t[2] }).map(function(t){ return tabHtml('tt',TODAYTAB,t) }).join(''):'';
  edges();
  todayPaint(); focusBack(fm);
}
function todayPaint(){
  var g=$('tgrid'); if(!g) return;
  var per=TODAYPER, out=[], src=TODAYSRC;
  if(TODAYTAB==='all'){
    // one from each in turn (the first row shows all of them), sixteen at most
    for(var i=0;i<16 && out.length<16;i++) src.forEach(function(a){ var x=(per[a]||[])[i]; if(x && out.length<16) out.push(x) });
  } else out=(per[TODAYTAB]||[]).slice(0,16);
  TODAYLIST=out;
  var bad=AS.filter(function(a){ return FAIL[a] }).map(function(a){ return esc(ARCH[a].name)+' · Could not load' });
  if(!out.length){ g.classList.add('none'); g.innerHTML='<p class="none-t" lang="en">'+(bad.length?bad.join(' · '):'Nothing new today')+'</p>'; return }
  g.classList.remove('none');
  g.innerHTML=out.map(function(it){ return card(it,{tag:true, ctx:{'new':1}}) }).join('');
  bindImgs(g);
}
// price cuts, newest first: the archive's own record of what a seller lowered
var DROPLIST=[];
function cutDay(it){ var h=it.h; return Array.isArray(h)&&h.length&&h[h.length-1] ? String(h[h.length-1][0]||'') : '' }
function dropsUpdate(gen){
  if(gen!==GEN) return;
  var box=$('drops'), l=$('dlist'); if(!box || !l) return;
  var done=AS.every(function(a){ return DATA[a] || FAIL[a] }); if(!done) return;
  var all=[], per={};
  AS.forEach(function(a){ var d=DATA[a]; per[a]=0; if(!d) return;
    d.items.forEach(function(it){ if(!it.x && !it.so && !it.__bad && it.w>it.k && it.k>0){ all.push(it); per[a]++ } }) });
  if(!all.length){ box.hidden=true; DROPLIST=[]; return }
  // the front page shows the cuts on pieces the archive can date, and not the small change
  var shown=all.filter(function(it){ return (it.__c==='A' || it.__c==='B') && it.k>=100000 });
  if(shown.length<8) shown=all;
  shown.sort(function(x,y){ var dx=cutDay(x), dy=cutDay(y); if(dx!==dy) return dy>dx?1:-1; return (y.w-y.k)/y.w-(x.w-x.k)/x.w });
  DROPLIST=shown.slice(0,8);
  $('dropsL').innerHTML=AS.map(function(a){ return per[a]?'<a class="btn" href="/?archive='+a+'&amp;show=drop&amp;sort=drop">'+esc(ARCH[a].name)+'<sup>'+won(per[a])+'</sup></a>':'' }).join('');
  l.innerHTML=DROPLIST.map(function(it){ return card(it,{tag:true, ctx:{drop:1}}) }).join('');
  bindImgs(l); box.hidden=false;
}
/* ---------------------------------------------------------------- the menu's panels (a wide screen with a mouse):
   under an archive its kinds and a few ways in, under Brands the names */
function megaMenus(){
  AS.forEach(function(a){
    var el=$('mm-'+a); if(!el || el.__done) return; el.__done=1;
    var p=P[a], A=ARCH[a];
    var cats=p.CATORDER.map(function(c){ return '<li><a href="/?archive='+a+'&amp;category='+encodeURIComponent(p.CATSLUG[c]||c)+'">'+esc(catEn(c))+'<span class="n" data-mmc="'+a+'|'+esc(c)+'"></span></a></li>' }).join('');
    var ways=[['New today','show=new','new'],['Price drops','show=drop&amp;sort=drop','drop'],['Sold records','show=sold','sold'],['Year old to new','sort=y%2B','']].map(function(w){
      return '<li'+(w[2]==='sold'?' data-mms="'+a+'"':'')+'><a href="/?archive='+a+'&amp;'+w[1]+'">'+esc(w[0])+(w[2]?'<span class="n" data-mmw="'+a+'|'+w[2]+'"></span>':'')+'</a></li>' }).join('');
    el.innerHTML='<div class="mm-in"><div class="mm-c"><p class="mm-h">Category</p><ul class="mm-l two">'+cats+'</ul></div>'+
      '<div class="mm-c"><p class="mm-h">Browse</p><ul class="mm-l">'+ways+'</ul></div>'+
      '<div class="mm-c mm-e"><a class="mm-all" href="/?archive='+a+'">All '+esc(A.name)+'<span class="n" data-mmw="'+a+'|all"></span></a></div></div>';
  });
  brandPanel();
}
// under Brands: the names that open a room (the two archives, and once the brand index is here every brand with
// listings) A–Z in compact columns; every name, with or without listings, is one step on under All brands
function brandPanel(){
  var b=$('mm-brands'); if(!b) return;
  var all=brandList(), L=all.filter(function(x){ return x.href }), many=all.length>AS.length, key=L.length+'/'+all.length;
  if(b.__n===key) return; b.__n=key;
  b.innerHTML='<div class="mm-in"><div class="mm-c'+(many?' mm-az':'')+'"><p class="mm-h">A–Z</p><ul class="mm-l'+(many?' az':'')+'">'+L.map(function(x){
      return '<li><a href="'+x.href+'">'+esc(x.name)+(isB(x.a)?'<span class="n">'+won(x.n)+'</span>':'<span class="n" data-mmw="'+x.a+'|all"></span>')+'</a></li>' }).join('')+'</ul></div>'+
    '<div class="mm-c mm-e"><a class="mm-all" href="/?view=brands">All brands'+(many?'<span class="n">'+won(all.length)+'</span>':'')+'</a></div></div>';
  AS.forEach(function(a){ var d=DATA[a], n=b.querySelector('[data-mmw="'+a+'|all"]'); if(d && n) n.textContent=d.__cards?won(d.__cards):'' });
}
function megaCounts(a){
  var d=DATA[a]; if(!d || d.__mm) return; d.__mm=1;
  var byCat={}; d.items.forEach(function(it){ if(!it.x && !it.so && !it.__bad) byCat[it.s]=(byCat[it.s]||0)+1 });
  var n=doc.querySelectorAll('[data-mmc^="'+a+'|"]'); for(var i=0;i<n.length;i++){ var c=n[i].getAttribute('data-mmc').slice(a.length+1); n[i].textContent=byCat[c]?won(byCat[c]):'' }
  var drops=0; d.items.forEach(function(it){ if(!it.x && !it.so && !it.__bad && it.w>it.k && it.k>0) drops++ });
  var w={'new':d.__allnew?0:d.__fresh, drop:drops, sold:d.__sold, all:d.__cards};
  var m=doc.querySelectorAll('[data-mmw^="'+a+'|"]'); for(var j=0;j<m.length;j++){ var k=m[j].getAttribute('data-mmw').slice(a.length+1); m[j].textContent=w[k]?won(w[k]):'' }
  var s=doc.querySelector('[data-mms="'+a+'"]'); if(s) s.hidden=!d.__sold;
}
function drawerMeta(){
  var dm={hl:$('dmHl'), ccp:$('dmCcp')};
  AS.forEach(function(a){ if(DATA[a]) megaCounts(a) });
  AS.forEach(function(a){ if(dm[a] && DATA[a]) dm[a].textContent=won(DATA[a].__cards) });
  var nw=$('dmNew'); if(nw && AS.every(function(a){ return DATA[a] })){ var n=bnewN(); AS.forEach(function(a){ n+=DATA[a].__fresh||0 }); nw.textContent=n?won(n):'' }
}
// the brands' new listings in New in: new.json once read, before that what the index says (new.json holds 400 at most)
function bnewN(){
  if(BNEW) return bnewLive().length;
  if(!BIDX) return 0;
  var n=0; brandsIn().forEach(function(b){ if(!firstDay(b)) n+=b.nw }); return Math.min(n,400);
}

/* ---------------------------------------------------------------- new in: what came in today, in both archives */
var NEWLIST=[], NEWTAB='all', NEWSHOWN=0;
function newShell(){
  return '<section class="vh" lang="en"><h1 id="vh" tabindex="-1">New in</h1><p class="rm" id="nwm"><span class="sk w40"></span></p></section>'+
    '<div class="vtabs"><div class="tabs" id="newT" role="group" aria-label="New in" lang="en"></div></div>'+
    '<div class="body"><div class="res">'+
      '<h2 class="sr" id="listH" tabindex="-1" lang="en">Listings</h2>'+
      '<div class="grid" id="ngrid">'+skel(8)+'</div>'+
      '<div class="more" id="nmore" hidden lang="en"><button type="button" class="btn" id="nmoreBtn">Load more</button></div>'+
    '</div></div>';
}
function newUpdate(gen){
  var pending=AS.filter(function(a){ return !DATA[a] && !FAIL[a] });
  pending.forEach(function(a){ waitOn(gen,a,load(a),newUpdate) });
  var waitB=BNEW===null;
  if(waitB) waitOn(gen,'bnew',bnew(),newUpdate);
  if(pending.length || waitB) return;
  AS.forEach(seen);
  var fm=focusMark(['newT','ngrid','nmore']);
  // the two archives, and a third tab for the brands' new listings when the brand index has them
  var per={}, total=0, tabs=AS.slice();
  AS.forEach(function(a){ per[a]=newOf(a); total+=per[a].length });
  if(BNEW){ tabs.push('brands'); per.brands=bnewLive(); total+=per.brands.length }
  if(NEWTAB!=='all' && !(per[NEWTAB]||[]).length) NEWTAB='all';
  NEWLIST=NEWTAB==='all' ? tabs.reduce(function(o,a){ return o.concat(per[a]) },[]).sort(cmpNew) : per[NEWTAB].slice();
  var d0=DATA.hl||DATA.ccp;
  $('nwm').innerHTML=(d0?'<span>'+esc(enDay(d0.today))+'</span>':'')+'<span><b>'+won(total)+'</b> Items</span>'+
    AS.filter(function(a){ return FAIL[a] }).map(function(a){ return '<span class="bad">'+esc(ARCH[a].name)+' · Could not load</span>' }).join('')+
    (BERR?'<span class="bad">Brands · Could not load</span>':'');
  $('newT').innerHTML=[['all','All',total]].concat(tabs.map(function(a){ return a==='brands'?['brands','Brands',per.brands.length,'',!per.brands.length]:[a,ARCH[a].name,per[a].length,ARCH[a].ab,!per[a].length] }))
    .map(function(t){ return tabHtml('nt',NEWTAB,t) }).join('');
  edges();
  newPaint(true);
  focusBack(fm,'vh');
}
function newPaint(reset){
  var g=$('ngrid'); if(!g) return;
  if(reset){ g.innerHTML=''; NEWSHOWN=0 }
  var mo=$('nmore');
  if(!NEWLIST.length){ g.classList.add('none'); g.innerHTML='<p class="none-t" lang="en">Nothing new today</p>'; mo.hidden=true; return }
  g.classList.remove('none');
  var end=Math.min(NEWLIST.length,NEWSHOWN+BATCH), h='';
  for(var i=NEWSHOWN;i<end;i++) h+=card(NEWLIST[i],{tag:true, eager:reset && i<4, ctx:{'new':1}});
  g.insertAdjacentHTML('beforeend',h); NEWSHOWN=end; bindImgs(g);
  mo.hidden=NEWSHOWN>=NEWLIST.length;
  $('nmoreBtn').textContent='Load more · '+won(NEWLIST.length-NEWSHOWN);
}

/* ---------------------------------------------------------------- brands, A to Z */
// the archives this site reads and, once /BRAND/ is published, every brand of its index (one with an archive here is
// that archive); a brand without listings is a name without a link. x.al: other spellings, for the search
function brandList(){
  var L=AS.map(function(a){ return {name:ARCH[a].name, href:'/?archive='+a, a:a, n:DATA[a]?DATA[a].__cards:0, al:P[a].BRANDNOISE||[]} });
  if(!BIDX) return L;
  brandsIn().forEach(function(b){ L.push({name:b.n, href:b.c?'/?brand='+b.s:null, a:'b:'+b.s, n:b.c, al:[b.q.en,b.q.ja,b.q.ko].filter(Boolean), ph:b.ph.filter(bigOk)[0]||b.ph[0]}) });
  return L.sort(function(x,y){ return cmpName({n:x.name},{n:y.name}) });
}
// names under their first letter; names that start with a figure under #
function letterOf(n){ var c=fold(n).charAt(0).toUpperCase(); return /[A-Z]/.test(c)?c:'#' }
// (the list waits for the brand index, so it is drawn once: two names, or all of them)
function brandsShell(){
  return '<section class="rh az-h"><span class="rh-ph two" id="azph" aria-hidden="true"></span>'+
      '<div class="rh-in" lang="en"><h1 class="rt" id="vh" tabindex="-1">Brands</h1><p class="rm" id="azm">'+(BIDX===null?'<span class="sk w40"></span>':azStat())+'</p></div></section>'+
    '<div id="azb"'+(AZTAB==='listed'?' class="listed"':'')+'>'+(BIDX===null?'':BERR?brxErr():azBody())+'</div>';
}
function azStat(){ return BERR?'':'<span class="st"><b>'+won(brandList().length)+'</b> <em>Brands</em></span>' }
// All, or only the names that open a room (Listed): a choice on this page, not an address
var AZTAB='all', AZMARK=null;
function azBody(){
  var L=brandList(), by={}, listed=L.filter(function(b){ return b.href }).length;
  L.forEach(function(b){ var c=letterOf(b.name); (by[c]=by[c]||[]).push(b) });
  var letters=keys(by).sort(function(x,y){ return x==='#'?-1:y==='#'?1:x<y?-1:x>y?1:0 }), id=function(c){ return c==='#'?'num':c };
  var none=function(c){ return !by[c].some(function(b){ return b.href }) };
  var tabs=listed<L.length?'<div class="az-t"><div class="tabs" role="group" aria-label="Brands" lang="en">'+
    [['all','All',L.length],['listed','Listed',listed]].map(function(t){ return '<button type="button" class="tab" data-azt="'+t[0]+'" aria-pressed="'+(AZTAB===t[0])+'">'+t[1]+'<sup>'+won(t[2])+'</sup></button>' }).join('')+'</div></div>':'';
  return tabs+'<nav class="az-l'+(letters.length>9?' many':'')+'" aria-label="A to Z">'+letters.map(function(c){
      return '<a href="#az-'+id(c)+'" data-az="'+id(c)+'"'+(none(c)?' class="z"':'')+(c==='#'?' aria-label="0–9"':'')+'>'+c+'</a>' }).join('')+'</nav>'+
    '<div class="az">'+letters.map(function(c){
      return '<section class="az-s'+(none(c)?' z':'')+'" id="az-'+id(c)+'"><h2 id="azh-'+id(c)+'"'+(c==='#'?' aria-label="0–9"':'')+'>'+c+'</h2><ul>'+
        by[c].map(function(b){ var ds=isB(b.a)?' data-s="'+slugOf(b.a)+'"':'';
          if(!b.href) return '<li class="z"'+ds+'><span class="az-x"><span class="az-n">'+esc(b.name)+'</span></span></li>';
          return '<li'+ds+'><a href="'+b.href+'"><span class="az-n">'+esc(b.name)+'</span> <span class="n"'+(isB(b.a)?'>'+won(b.n):' id="azn-'+b.a+'">')+'</span></a></li>' }).join('')+
      '</ul></section>' }).join('')+'</div>';
}
// The page needs no archive of its own: the photographs come from the brand index, the two archives' counts are shown
// when they are already here. Without a brand index (not published yet) it is the two archives' page, as before.
function brandsUpdate(gen){
  var fillA=function(){ AS.forEach(function(a){ var n=$('azn-'+a); if(n && DATA[a]) n.textContent=won(DATA[a].__cards) }); azPhoto() };
  var after=function(){
    if(gen!==GEN) return;
    if(!BIDX && !BERR) AS.forEach(function(a){ if(DATA[a]) return; load(a).then(function(){ if(gen===GEN) fillA() },function(){}) });
    fillA(); title(); if(AZMARK) nextFrame(azMark);
  };
  if(BIDX===null) bidx().then(function(){ if(gen!==GEN) return; var b=$('azb'), m=$('azm'); if(b && m){ m.innerHTML=azStat(); b.innerHTML=BERR?brxErr():azBody() } after() });
  else after();
}
function azPhoto(){
  var el=$('azph'); if(!el || el.__done) return;
  var pick=[];
  if(BIDX){
    var pool=brandsIn().filter(function(b){ return b.c>0 && b.ph.length }), big=pool.filter(function(b){ return b.ph.some(bigOk) });
    if(big.length>=2) pool=big;
    if(pool.length>=2){ var r=seeded('brands'+(BBASE.today||'')), i=Math.floor(r()*pool.length), j=Math.floor(r()*(pool.length-1)); if(j>=i) j++;
      pick=[pool[i],pool[j]].map(function(b){ return imgTag('b:'+b.s,b.ph.filter(bigOk)[0]||b.ph[0],1200,{hi:true}) }) }
  }
  if(!pick.length && AS.every(function(a){ return DATA[a] })) pick=AS.map(function(a){ return heroImg(a,heroPick(a,DATA[a],'brands'),true) });
  if(!pick.length) return;
  el.__done=1; el.innerHTML=pick.map(function(h){ return '<span>'+h+'</span>' }).join(''); bindImgs(el);
}
// a brand without listings, opened by its address: the list, at its name
function azMark(){
  var s=AZMARK; AZMARK=null; if(!s) return;
  var li=doc.querySelector('.az-s li[data-s="'+cssv(s)+'"]'); if(!li) return;
  if(AZTAB==='listed' && li.classList.contains('z')){ AZTAB='all'; azTabs() }
  li.classList.add('on');
  var h=li.closest('.az-s') && li.closest('.az-s').querySelector('h2');
  if(h){ h.setAttribute('tabindex','-1'); try{ h.focus({preventScroll:true}) }catch(e){} }
  window.scrollTo(0,Math.max(0,li.getBoundingClientRect().top+window.scrollY-Math.round(innerHeight/3)));
}
function azTabs(){
  var b=$('azb'); if(!b) return; b.classList.toggle('listed',AZTAB==='listed');
  var ts=b.querySelectorAll('[data-azt]'); for(var i=0;i<ts.length;i++) ts[i].setAttribute('aria-pressed',String(ts[i].getAttribute('data-azt')===AZTAB));
}

/* ---------------------------------------------------------------- room */
var ICO={
  sliders:'<svg class="ico-f" viewBox="0 0 12 10" width="12" height="10" aria-hidden="true"><path d="M6.6 7.6H1m10.2 0H8.4M2.9 2.4H1m10.2 0H4.7M4.7 1v2.8M8.4 9V6.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  mag:'<svg class="ico-s" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M15.2 15.2 20.5 20.5" stroke="currentColor" stroke-width="1.4"/></svg>',
  x:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.3"/></svg>',
  xs:'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5"/></svg>'
};
function roomShell(a){
  var A=ARCH[a];
  var grp=function(g,inner,id){ return '<details class="fg"'+(id?' id="'+id+'"':'')+' open><summary lang="en">'+esc(grpEn(a,g))+'</summary>'+inner+'</details>' };
  return '<section class="rh">'+
      '<span class="rh-ph" id="rhp" aria-hidden="true"></span>'+
      '<div class="rh-in" lang="en">'+
        '<h1 class="rt" id="vh" tabindex="-1">'+esc(A.name)+'</h1>'+
        '<p class="rm" id="rm"><span class="sk w60"></span></p>'+
        '<p class="since" id="since" hidden></p>'+
      '</div>'+
    '</section>'+
    '<div class="cats" id="cats" role="group" aria-label="Category" lang="en"></div>'+
    '<div class="bar" id="bar"><div class="bar-in">'+
      '<button type="button" class="ftog" id="ftog" aria-expanded="false" aria-controls="side" lang="en">'+ICO.sliders+'<span class="ft-l">Filter and sort</span><span class="n" id="fn"></span></button>'+
      '<div class="qf">'+ICO.mag+
        '<input id="rq" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="'+esc(A.ph)+'" aria-label="Search '+esc(A.name)+'">'+
        '<button type="button" class="qx" id="rqx" aria-label="Clear search" hidden>'+ICO.xs+'</button></div>'+
      '<div class="lay" id="lay" role="group" aria-label="View" lang="en">'+
        '<button type="button" data-lay="grid" aria-pressed="'+(LAY!=='list')+'">Grid</button>'+
        '<button type="button" data-lay="list" aria-pressed="'+(LAY==='list')+'">List</button>'+
      '</div>'+
      '<a class="skip2" href="#listH" lang="en">Skip to listings</a>'+
      '<div class="selw" lang="en"><select id="sort" aria-label="Sort">'+SORT.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]==='rel'?' hidden':'')+'>'+s[1]+'</option>' }).join('')+'</select></div>'+
      '<div class="count" id="count" role="status" aria-live="polite" lang="en"></div>'+
    '</div></div>'+
    '<div class="side-shade" id="sideShade" hidden></div>'+
    // a dialog over the page: the page behind it is inert while it is open (layers: it sits inside main, so main's parts)
    '<div class="side shut" id="side" role="dialog" aria-modal="true" aria-labelledby="sideH">'+
      '<div class="side-top" lang="en"><div class="side-tt"><h2 id="sideH">Filter and sort</h2><p class="side-n" id="sideN" role="status" aria-live="polite"></p></div>'+
        '<button type="button" class="ico" id="sideX" aria-label="Close filters">'+ICO.x+'</button></div>'+
      '<div class="side-in">'+
        '<details class="fg fg-sort" open><summary lang="en">Sort by</summary><ul class="ops" id="f-sort" lang="en"></ul></details>'+
        grp('y','<div class="yrs" id="f-y" lang="en"></div>')+
        grp('cert','<ul class="ops" id="f-cert"></ul>')+
        grp('motif','<ul class="ops cols" id="f-motif" lang="en"></ul>','g-motif')+
        grp('src','<ul class="ops" id="f-src"></ul>')+
        grp('price','<ul class="ops" id="f-price" lang="en"></ul>')+
        grp('mark','<ul class="ops" id="f-mark" lang="en"></ul>','g-mark')+
        grp('flag','<ul class="ops" id="f-flag" lang="en"></ul>')+
        '<details class="fg" open><summary lang="en">Size</summary><label class="sr" for="fsize" lang="en">Size</label><input class="fsize" id="fsize" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="48 · M · 32"></details>'+
      '</div>'+
      '<div class="side-foot" lang="en"><button type="button" class="lnk" id="clearAll">Clear</button><button type="button" class="btn solid" id="sideDone">Show results</button></div>'+
    '</div>'+
    '<div class="body"><div class="res">'+
      '<div class="applied" id="applied" hidden></div>'+
      '<h2 class="sr" id="listH" tabindex="-1" lang="en">Listings</h2>'+
      '<p class="crng" id="crng" hidden lang="en"></p>'+
      '<div class="'+(LAY==='list'?'ix':'grid')+'" id="grid">'+skel(12)+'</div>'+
      '<div class="more" id="more" hidden lang="en"><button type="button" class="btn" id="moreBtn">Load more</button></div>'+
      '<div class="empty" id="empty" hidden></div>'+
      '<section class="seek" id="seek" aria-label="Find elsewhere" hidden></section>'+
    '</div></div>';
}
// the filter drawer comes in from the left on every screen, over a shade that closes it; closed, its contents are not
// laid out at all (shut), so a change of filter does not pay for a drawer no one sees
function sideOpen(on){
  var s=$('side'), t=$('ftog'), sh=$('sideShade'); if(!s||!t) return;
  if(on){ clearTimeout(sideOpen.t); s.classList.remove('shut') }
  s.classList.toggle('open',on); t.setAttribute('aria-expanded',String(on));
  LAYER.side=on; layers();
  if(sh){
    if(on){ sh.hidden=false; nextFrame(function(){ if(s.classList.contains('open')) sh.classList.add('on') }) }
    else { sh.classList.remove('on'); setTimeout(function(){ if(!sh.classList.contains('on')) sh.hidden=true },REDUCED.matches?0:320) }
  }
  if(on){ var x=$('sideX'); if(x){ try{ x.focus({preventScroll:true}) }catch(e){}
      // (with reduced motion the drawer can still be hidden for this one moment: try again once it is drawn)
      if(doc.activeElement!==x) nextFrame(function(){ if(s.classList.contains('open')) try{ x.focus({preventScroll:true}) }catch(e){} }) } }
  else {
    if(doc.activeElement && s.contains(doc.activeElement)) t.focus({preventScroll:true});
    sideOpen.t=setTimeout(function(){ if(!s.classList.contains('open')) s.classList.add('shut') },REDUCED.matches?0:380);
  }
}
var qTimer=null, zTimer=null, SORTB4=null, IO=null, AUTO=false;
var LAY=lsGet('aix.layout')==='list'?'list':'grid';
function setSort(v){ if(SORTV.indexOf(v)<0 || v===ST.sort) return; var st=cloneST(); st.sort=v; SORTB4=null; ST=st; writeUrl(false); soonUpdate() }
function bindRoom(){
  $('cats').addEventListener('click',function(e){
    var b=e.target.closest('[data-cat]'); if(!b) return;
    // the press shows at once; the listings follow in the next moment
    var bs=this.querySelectorAll('.cat'); for(var i=0;i<bs.length;i++) bs[i].setAttribute('aria-pressed',String(bs[i]===b)); placeInd(null);
    var v=b.getAttribute('data-cat'), F=copyF(ST.F); F.cat={}; if(v) F.cat[v]=1;
    go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null});
  });
  $('side').addEventListener('click',function(e){
    var so=e.target.closest('[data-sort]');
    if(so){ var rs=$('f-sort').querySelectorAll('[data-sort]'); for(var i=0;i<rs.length;i++){ var on=rs[i]===so; rs[i].classList.toggle('on',on); rs[i].setAttribute('aria-pressed',String(on)) }
      setSort(so.getAttribute('data-sort')); return }
    var b=e.target.closest('[data-g]'); if(!b) return;
    var g=b.getAttribute('data-g'), v=b.getAttribute('data-v'), F=copyF(ST.F);
    if(F[g][v]) delete F[g][v]; else F[g][v]=1;
    b.classList.toggle('on',!!F[g][v]); b.setAttribute('aria-pressed',String(!!F[g][v]));
    FOCUS={g:g, v:v};
    go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null});
  });
  $('sideShade').addEventListener('click',function(){ sideOpen(false) });
  $('applied').addEventListener('click',offClick);
  $('empty').addEventListener('click',offClick);
  $('since').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    var F=copyF(ST.F); if(F.flag.since) delete F.flag.since; else F.flag.since=1; go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null}) });
  $('ftog').addEventListener('click',function(){ sideOpen(!$('side').classList.contains('open')) });
  $('sideX').addEventListener('click',function(){ sideOpen(false) });
  $('sideDone').addEventListener('click',function(){ sideOpen(false); var g=$('grid'); if(g && g.getBoundingClientRect().top<0) window.scrollTo(0, window.scrollY+g.getBoundingClientRect().top-160) });
  $('clearAll').addEventListener('click',function(){ clearAll() });
  $('sort').addEventListener('change',function(){ setSort(this.value) });
  var q=$('rq');
  var applyQ=function(){
    var v=q.value.replace(/\s+/g,' ').trim().toLowerCase().slice(0,80);
    if(v===ST.F.q) return;
    var st=cloneST(); st.F.q=v; st.item=null;
    if(v && st.sort!=='rel'){ SORTB4=st.sort; st.sort='rel' }
    if(!v && st.sort==='rel'){ st.sort=SORTB4||'new'; SORTB4=null }
    ST=st; writeUrl(false); roomUpdate(GEN);
  };
  q.addEventListener('input',function(){ $('rqx').hidden=!q.value; clearTimeout(qTimer); qTimer=setTimeout(applyQ,180) });
  // Enter: the search now, and the keyboard goes on to the listings (on a phone this also puts the keyboard away)
  q.addEventListener('keydown',function(e){
    if(e.key==='Enter'){ e.preventDefault(); clearTimeout(qTimer); applyQ(); var h=$('listH'); if(h) try{ h.focus() }catch(x){} }
    if(e.key==='Escape' && q.value){ e.stopPropagation(); clearQ() } });
  $('rqx').addEventListener('click',function(){ clearQ(); q.focus() });
  $('fsize').addEventListener('input',function(){
    var v=this.value.trim().toLowerCase().slice(0,24); clearTimeout(zTimer);
    zTimer=setTimeout(function(){ if(v===ST.F.size) return; var st=cloneST(); st.F.size=v; st.item=null; ST=st; writeUrl(false); roomUpdate(GEN) },180);
  });
  // more by hand: the keyboard lands on the first new listing, a screen reader hears how many came; from then on
  // the list also grows by itself near its end (before that, the page's foot stays within reach)
  $('moreBtn').addEventListener('click',function(){ var n0=SHOWN; paint(false); AUTO=true; landOn($('grid'),n0); live(won(SHOWN-n0)+' more · '+won(SHOWN)+' of '+won(VIEW.length)) });
  $('lay').addEventListener('click',function(e){ var b=e.target.closest('[data-lay]'); if(!b) return; var v=b.getAttribute('data-lay'); if(v===LAY) return;
    LAY=v; lsSet('aix.layout',v); var bs=this.querySelectorAll('[data-lay]'); for(var i=0;i<bs.length;i++) bs[i].setAttribute('aria-pressed',String(bs[i].getAttribute('data-lay')===v));
    pvHide(); var keep=SHOWN; paint(true); while(SHOWN<keep && SHOWN<VIEW.length) paint(false) });
  if(IO){ IO.disconnect(); IO=null }
  if('IntersectionObserver' in window){
    var io=IO=new IntersectionObserver(function(es){ es.forEach(function(e){ if(AUTO && e.isIntersecting && !$('more').hidden && SHOWN>0 && SHOWN<VIEW.length) paint(false) }) },{rootMargin:'900px 0px'});
    io.observe($('more'));
  }
  var c=$('cats'), endp=function(){ c.classList.toggle('end', c.scrollLeft+c.clientWidth>=c.scrollWidth-4) };
  c.addEventListener('scroll',endp,{passive:true}); setTimeout(endp,0);
}
// the first of the listings just drawn takes the keyboard
function landOn(box,i){ var c=box && box.children[i], l=c && c.querySelector('.t a, .r-t a'); if(l) try{ l.focus() }catch(e){} }
function clearQ(){ clearTimeout(qTimer); var q=$('rq'); if(q) q.value=''; var x=$('rqx'); if(x) x.hidden=true;
  if(!ST.F.q) return; var st=cloneST(); st.F.q=''; if(st.sort==='rel'){ st.sort=SORTB4||'new'; SORTB4=null } st.item=null; ST=st; writeUrl(false); roomUpdate(GEN) }
function cloneST(){ return {view:ST.view, a:ST.a, F:copyF(ST.F), sort:ST.sort, item:ST.item} }
function clearAll(){ clearTimeout(qTimer); clearTimeout(zTimer); var F=blankF(); SORTB4=null; go({view:'room', a:ST.a, F:F, sort:ST.sort==='rel'?'new':ST.sort, item:null}) }
function offClick(e){
  var b=e.target.closest('[data-off]'); if(!b) return;
  if(b.getAttribute('data-off')==='all'){ clearAll(); return }
  var g=b.getAttribute('data-off'), v=b.getAttribute('data-v'), F=copyF(ST.F), sort=ST.sort;
  if(g==='q'){ F.q=''; if(sort==='rel') sort=SORTB4||'new'; var q=$('rq'); if(q) q.value='' }
  else if(g==='size'){ F.size=''; var s=$('fsize'); if(s) s.value='' }
  else if(g==='y') offY(F,v);
  else if(own.call(F,g) && typeof F[g]==='object') delete F[g][v];
  go({view:'room', a:ST.a, F:F, sort:sort, item:null});
}

// the filters: an OR inside each group, AND across groups; the flags AND among themselves
function passG(g,it,F,p){
  switch(g){
    case 'cat': return !any(F.cat) || !!F.cat[it.s];
    case 'y': return !any(F.y) || !!F.y[it.__yk];
    case 'motif': if(!any(F.motif)) return true; for(var i=0;i<it.__m.length;i++) if(F.motif[it.__m[i]]) return true; return false;
    case 'price': return !any(F.price) || !!F.price[p.priceBand(it.k)];
    case 'src': return !any(F.src) || !!F.src[it.r];
    case 'cert': return !any(F.cert) || !!F.cert[it.__c];
    case 'mark': if(!any(F.mark)) return true; for(var j=0;j<it.__mk.length;j++) if(F.mark[it.__mk[j]]) return true; return false;
  }
  return true;
}
function flagPass(it,fl,a){
  if(!fl.gone && it.x) return false;
  if(fl.gone && !it.x) return false;
  if(!fl.sold && it.so) return false;
  if(fl.sold && !it.so) return false;
  if(fl.since && !(SINCE[a] && it.f && it.f>SINCE[a])) return false;
  if(fl['new'] && !it.n) return false;
  if(fl.drop && !(it.w && it.w>it.k)) return false;
  if(fl.saved && !isSaved(it)) return false;
  if(fl.multi && !(it.g>1)) return false;
  return true;
}
function sortList(list,s,a){
  var p=P[a];
  list.sort(function(x,y){
    if(s==='rel') return (y.__sc||0)-(x.__sc||0) || y.k-x.k;
    if(s==='k-') return y.k-x.k;
    if(s==='k+') return x.k-y.k;
    if(s==='y+') return (x.__y||9999)-(y.__y||9999) || y.k-x.k;
    if(s==='y-') return (y.__y||0)-(x.__y||0) || y.k-x.k;
    if(s==='drop') return ((y.w?y.w-y.k:0)-(x.w?x.w-x.k:0)) || y.k-x.k;
    if(s==='age') return ((p.seenDays(y)||0)-(p.seenDays(x)||0)) || y.k-x.k;
    return cmpNew(x,y);
  });
}
var VIEW=[], SHOWN=0, BATCH=60, FACET=null, FLAGN=null, FOCUS=null;
function compute(a){
  var d=DATA[a], p=P[a], F=ST.F, items=d.items;
  p.setF(F); p.setQuery(F.q); p.setSince(SINCE[a]||null);
  var QT=p.getQT(), fc={cat:{},y:{},motif:{},price:{},src:{},cert:{},mark:{}}, fl={}, view=[];
  var fopts=flagOpts(a);
  fopts.forEach(function(f){ fl[f]=0 });
  var trial={}; fopts.forEach(function(f){ var t={}; for(var k in F.flag) if(own.call(F.flag,k) && F.flag[k]) t[k]=1; t[f]=1; trial[f]=F.flag[f]?F.flag:t });
  for(var i=0;i<items.length;i++){
    var it=items[i]; if(it.__bad) continue;
    if(QT.length){ it.__sc=p.score(it); if(!(it.__sc>0)) continue } else it.__sc=0;
    if(F.size && !(it.z && String(it.z).toLowerCase().indexOf(F.size)>=0)) continue;
    var fails=0, fg=null;
    for(var j=0;j<ORG.length;j++){ if(!passG(ORG[j],it,F,p)){ fails++; fg=ORG[j]; if(fails>1) break } }
    if(fails>1) continue;
    if(fails===0){ for(var f=0;f<fopts.length;f++) if(flagPass(it,trial[fopts[f]],a)) fl[fopts[f]]++ }
    if(!flagPass(it,F.flag,a)) continue;
    if(fails===0){ view.push(it); tally(fc,it,p,null) }
    else tally(fc,it,p,fg);
  }
  FACET=fc; FLAGN=fl;
  sortList(view,ST.sort,a);
  VIEW=view;
}
function tally(fc,it,p,only){
  var add=function(g,v){ if(!only || only===g) fc[g][v]=(fc[g][v]||0)+1 };
  add('cat',it.s); add('y',it.__yk); add('price',p.priceBand(it.k)); add('src',it.r); add('cert',it.__c);
  if(!only || only==='motif') it.__m.forEach(function(m){ fc.motif[m]=(fc.motif[m]||0)+1 });
  if(!only || only==='mark') it.__mk.forEach(function(m){ fc.mark[m]=(fc.mark[m]||0)+1 });
}
function flagOpts(a){
  var d=DATA[a], o=[];
  if(!d.__allnew) o.push('new');
  o.push('drop','multi','saved');
  if(SINCE[a]) o.push('since');
  if(d.__sold) o.push('sold');
  if(d.__gone) o.push('gone');
  return o;
}
function flagLbl(a,f){ return f==='since'?'Since last visit':(FLAGEN[f]||f) }
function roomUpdate(gen){
  var a=ST.a;
  if(!$('grid')) return;
  if(!DATA[a]){
    $('grid').innerHTML=skel(12); $('empty').hidden=true; $('empty').innerHTML='';
    load(a).then(function(){ if(gen!==GEN) return; seen(a); tidy(ST); writeUrl(false); roomUpdate(gen); syncItem() },
      function(){ if(gen!==GEN) return; $('grid').innerHTML=''; $('empty').hidden=false; $('empty').innerHTML=errBox(a); $('rm').textContent='' });
    return;
  }
  seen(a);
  LASTQ=filterKey();
  // the control under the keyboard is drawn again below: its new copy (or the one now in its place) keeps the focus
  var fm=focusMark(['cats','applied','empty','since','grid']);
  var d=DATA[a], p=P[a], F=ST.F;
  compute(a); title();
  roomPhoto(a,'rhp','room');
  // head (Dated only when it says something Items does not; New only when there is some)
  var tn=d.__tn, st=function(l,n){ return '<span class="st"><em>'+l+'</em> <b>'+(typeof n==='number'?won(n):n)+'</b></span>' };
  var bits=['<span class="st">'+esc(ARCH[a].span)+'</span>', st('Items',d.__cards)];
  if(tn.A>0 && tn.A<d.__cards) bits.push(st('Dated',tn.A));
  if(!d.__allnew && d.__fresh>0) bits.push(st('New',d.__fresh));
  if(d.__sold) bits.push(st('Sold records',d.__sold));
  bits.push(st('Updated',esc(shortTime(d.built))));
  $('rm').innerHTML=bits.join('');
  var sn=$('since');
  if(SINCE[a]){ var ns=0; d.items.forEach(function(it){ if(!it.x && !it.so && it.f && it.f>SINCE[a]) ns++ });
    sn.hidden=!ns; sn.innerHTML=ns?'<button type="button" aria-pressed="'+!!F.flag.since+'">Since your visit '+esc(md(SINCE[a]))+' <b>'+won(ns)+'</b></button>':'' }
  else sn.hidden=true;
  // search box and sort mirror the state (a link or the back button may have changed them)
  var q=$('rq'); if(q && doc.activeElement!==q && q.value.trim().toLowerCase()!==F.q) q.value=F.q;
  if(q) $('rqx').hidden=!q.value;
  var fs=$('fsize'); if(fs && doc.activeElement!==fs && fs.value.trim().toLowerCase()!==F.size) fs.value=F.size;
  var so=$('sort'); if(so){ so.value=ST.sort; var ro=so.querySelector('option[value="rel"]'); if(ro) ro.hidden=!F.q }
  cats(a); facets(a); applied(a); countLine(a); paint(true); empty(a); seek(a);
  var fn=$('fn'), nf=0; ['y','motif','price','src','cert','mark','flag'].forEach(function(g){ nf+=keys(F[g]).length }); if(F.size) nf++;
  if(fn) fn.textContent=nf?won(nf):'';
  focusBack(fm,'listH');
}
function cats(a){
  var d=DATA[a], F=ST.F, fc=FACET.cat, sel=keys(F.cat), tot=0;
  d.__order.cat.forEach(function(c){ tot+=fc[c]||0 });
  var h='<button type="button" class="cat" data-cat="" aria-pressed="'+(!sel.length)+'">All<span class="n">'+won(tot)+'</span></button>';
  d.__order.cat.forEach(function(c){ var on=!!F.cat[c], n=fc[c]||0;
    h+='<button type="button" class="cat'+(n||on?'':' z')+'" data-cat="'+esc(c)+'" aria-pressed="'+on+'">'+esc(catEn(c))+'<span class="n">'+won(n)+'</span></button>' });
  var el=$('cats'), ind=el.querySelector('.ind'), was=ind?{x:ind.__x, w:ind.__w}:null;
  el.innerHTML=h+'<span class="ind" aria-hidden="true"></span>'; el.classList.add('has-ind');
  placeInd(was);
  var on=el.querySelector('.cat[aria-pressed="true"]'); if(on && (on.offsetLeft<el.scrollLeft || on.offsetLeft+on.offsetWidth>el.scrollLeft+el.clientWidth)) el.scrollLeft=Math.max(0,on.offsetLeft-24);
}
function placeInd(was){
  var el=$('cats'); if(!el) return; var ind=el.querySelector('.ind'); if(!ind) return;
  var b=el.querySelector('.cat[aria-pressed="true"]'); if(!b || !b.offsetWidth){ ind.classList.add('off'); return }
  ind.classList.remove('off');
  var x=b.offsetLeft, w=b.offsetWidth;
  if(was && was.w && fxOn()){ ind.style.transition='none'; ind.style.width=was.w+'px'; ind.style.transform='translate3d('+was.x+'px,0,0)'; void ind.offsetWidth; ind.style.transition='' }
  ind.style.width=w+'px'; ind.style.transform='translate3d('+x+'px,0,0)'; ind.__x=x; ind.__w=w;
}
window.addEventListener('resize',function(){ if(ST.view==='room') placeInd(null) },{passive:true});
function opt(g,v,label,n,on,cls){
  return '<li><button type="button" class="op'+(on?' on':'')+(!n&&!on?' z':'')+(cls?' '+cls:'')+'" data-g="'+g+'" data-v="'+esc(v)+'" aria-pressed="'+on+'">'+
    '<span class="op-l">'+label+'</span><span class="op-n">'+won(n)+'</span></button></li>';
}
function facets(a){
  var d=DATA[a], p=P[a], F=ST.F, fc=FACET, O=d.__order;
  var act=doc.activeElement, keep=FOCUS || (act && act.getAttribute && act.hasAttribute('data-g') ? {g:act.getAttribute('data-g'), v:act.getAttribute('data-v')} : null);
  var keepSort=act && act.getAttribute && act.hasAttribute('data-sort');
  FOCUS=null;
  // sort, as a list of choices (the phone has no room for the select)
  $('f-sort').innerHTML=SORT.filter(function(s){ return s[0]!=='rel' || F.q }).map(function(s){ var on=ST.sort===s[0];
    return '<li><button type="button" class="op rad'+(on?' on':'')+'" data-sort="'+s[0]+'" aria-pressed="'+on+'"><span class="op-l">'+esc(s[1])+'</span></button></li>' }).join('');
  // years: one button per year, and one for none
  var yh='';
  O.y.forEach(function(y){ var on=!!F.y[y], n=fc.y[y]||0;
    yh+='<button type="button" class="yb'+(on?' on':'')+(!n&&!on?' z':'')+(y==='none'?' none':'')+'" data-g="y" data-v="'+y+'" aria-pressed="'+on+'" aria-label="'+(y==='none'?'No year':y)+', '+won(n)+'">'+
      '<span>'+(y==='none'?'No year':y)+'</span><i>'+won(n)+'</i></button>' });
  var fy=$('f-y'); fy.innerHTML=yh;
  var ymax=0; O.y.forEach(function(y){ if(y!=='none') ymax=Math.max(ymax,fc.y[y]||0) });
  var ybs=fy.querySelectorAll('.yb'); for(var yi=0;yi<ybs.length;yi++){ var yv=ybs[yi].getAttribute('data-v'), yn=fc.y[yv]||0;
    ybs[yi].style.setProperty('--v', ymax && yv!=='none' ? (yn/ymax).toFixed(3) : '0') }
  $('f-cert').innerHTML=O.cert.map(function(c){ return opt('cert',c,esc(p.CERT[c]),fc.cert[c]||0,!!F.cert[c]) }).join('');
  $('g-motif').hidden=!O.motif.length;
  $('f-motif').innerHTML=O.motif.map(function(m){ return opt('motif',m,esc(motifEn(a,m)),fc.motif[m]||0,!!F.motif[m]) }).join('');
  $('f-src').innerHTML=O.src.map(function(s){ var seen=SRCSEEN[a][s], stop=seen && d.today && seen<d.today;
    return opt('src',s,esc(s)+(stop?'<small>'+esc(md(seen))+' 이후 수집 안 됨</small>':''),fc.src[s]||0,!!F.src[s]) }).join('');
  $('f-price').innerHTML=O.price.map(function(b){ return opt('price',b,esc(priceEn(a,b)),fc.price[b]||0,!!F.price[b]) }).join('');
  $('g-mark').hidden=!O.mark.length;
  $('f-mark').innerHTML=O.mark.map(function(m){ return opt('mark',m,esc(markEn(a,m)),fc.mark[m]||0,!!F.mark[m]) }).join('');
  $('f-flag').innerHTML=flagOpts(a).map(function(f){ return opt('flag',f,esc(f==='since'?'Since last visit '+md(SINCE[a]):flagLbl(a,f)),FLAGN[f]||0,!!F.flag[f]) }).join('');
  var sd=$('sideDone'); if(sd) sd.textContent='Show '+won(VIEW.length)+' '+(VIEW.length===1?'item':'items');
  var sn=$('sideN'); if(sn) sn.textContent=won(VIEW.length)+' '+(VIEW.length===1?'item':'items');
  if(keep){ var b=$('side').querySelector('[data-g="'+keep.g+'"][data-v="'+cssv(keep.v)+'"]'); if(b) b.focus({preventScroll:true}) }
  else if(keepSort){ var sb=$('side').querySelector('[data-sort="'+cssv(ST.sort)+'"]'); if(sb) sb.focus({preventScroll:true}) }
}
function tokLabel(a,g,v){
  var p=P[a];
  if(g==='cert') return p.CERT[v]||v;
  if(g==='motif') return motifEn(a,v);
  if(g==='mark') return markEn(a,v);
  if(g==='flag') return flagLbl(a,v);
  if(g==='price') return priceEn(a,v);
  if(g==='cat') return catEn(v);
  if(g==='y') return v==='none'?'No year':v;
  return v;
}
function tokens(a){
  var F=ST.F, t=[];
  ORG.concat(['flag']).forEach(function(g){
    var vs=keys(F[g]);
    if(g==='y'){ pack(vs).forEach(function(r){ t.push({g:'y', v:r, l:r==='none'?'No year':r.replace('-','–')}) }); return }
    vs.forEach(function(v){ t.push({g:g, v:v, l:tokLabel(a,g,v)}) });
  });
  if(F.size) t.push({g:'size', v:'', l:'Size '+F.size});
  if(F.q) t.push({g:'q', v:'', l:'“'+F.q+'”'});
  return t;
}
function offY(F,r){ var m=/^(\d{4})-(\d{4})$/.exec(r); if(m){ for(var y=+m[1];y<=+m[2];y++) delete F.y[String(y)] } else delete F.y[r] }
function applied(a){
  var t=tokens(a), el=$('applied');
  el.hidden=!t.length;
  el.innerHTML=t.map(function(x){ return '<button type="button" class="tok" data-off="'+x.g+'" data-v="'+esc(x.v)+'"><span class="sr" lang="en">Remove </span>'+esc(x.l)+'<span aria-hidden="true">'+ICO.xs+'</span></button>' }).join('')+
    (t.length>1?'<button type="button" class="tok all" data-off="all" lang="en">Clear all</button>':'');
}
function medianOf(a){ if(!a.length) return 0; var s=a.slice().sort(function(x,y){ return x-y }), m=s.length>>1; return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2) }
function countLine(a){
  var F=ST.F, n=VIEW.length, narrowed=tokens(a).length>0;
  $('count').innerHTML='<span class="cn"><b>'+won(n)+'</b> '+(n===1?'Item':'Items')+'</span>';
  var r='';
  if(narrowed && n>1){
    var ks=VIEW.filter(function(it){ return !it.x && !it.so && it.k>0 }).map(function(it){ return it.k });
    if(ks.length>1){ var lo=Math.min.apply(null,ks), hi=Math.max.apply(null,ks);
      r+='<span>Price ₩'+won(lo)+'–'+won(hi)+'</span><span>Median ₩'+won(medianOf(ks))+'</span>' }
  }
  var el=$('crng'); el.innerHTML=r; el.hidden=!r;
}
function paint(reset){
  var g=$('grid'); if(!g) return;
  if(reset){ g.innerHTML=''; SHOWN=0 }
  var end=Math.min(VIEW.length,SHOWN+BATCH), h='';
  var list=LAY==='list'; if(reset) g.className=list?'ix':'grid';
  // (a section that already says New or Price drop does not say it again on every card)
  var ctx={'new':!!ST.F.flag['new'], drop:!!ST.F.flag.drop};
  for(var i=SHOWN;i<end;i++) h+=list?row(VIEW[i],i):card(VIEW[i],{eager:reset && i<4, ctx:ctx});
  g.insertAdjacentHTML('beforeend',h); SHOWN=end;
  bindImgs(g);
  var mo=$('more'); mo.hidden=SHOWN>=VIEW.length;
  $('moreBtn').textContent='Load more · '+won(VIEW.length-SHOWN);
}
function countWithout(a,g,v){
  var save=ST.F, F=copyF(save);
  if(g==='q') F.q=''; else if(g==='size') F.size=''; else if(g==='y') offY(F,v); else delete F[g][v];
  ST.F=F; var keepV=VIEW, keepF=FACET, keepN=FLAGN; compute(a); var n=VIEW.length; VIEW=keepV; FACET=keepF; FLAGN=keepN; ST.F=save;
  var p=P[a]; p.setF(save); p.setQuery(save.q);
  return n;
}
function empty(a){
  var e=$('empty'), g=$('grid');
  if(VIEW.length){ e.hidden=true; e.innerHTML=''; return }
  g.innerHTML='';
  var t=tokens(a), h='<p class="empty-t" lang="en">No results</p>';
  if(t.length){ h+='<div class="empty-o">'+t.map(function(x){ var n=countWithout(a,x.g,x.v);
      return '<button type="button" class="btn ghost" data-off="'+x.g+'" data-v="'+esc(x.v)+'"><span lang="en">Remove</span> '+esc(x.l)+'<sup>'+won(n)+'</sup></button>' }).join('')+'</div>' }
  e.innerHTML=h; e.hidden=false;
}
function seek(a){
  var el=$('seek'), p=P[a], F=ST.F; if(!el) return;
  p.setF(F); p.setQuery(F.q);
  var parts=p.seekParts(), shown=[], rows=[];
  parts.forEach(function(x){ if(x.row){ if(rows.indexOf(x.row)>=0) return; rows.push(x.row) }
    var w=x.typed || (x.row?(p.word(x.row,'ko')||p.word(x.row,'en')||p.word(x.row,'ja')):x.raw); if(w && shown.indexOf(w)<0) shown.push(w) });
  var h='<h2 class="seek-h">Find elsewhere</h2><p class="seek-q">'+esc(ARCH[a].name)+(shown.length?' · '+esc(shown.join(' · ')):'')+'</p><div class="seek-m">';
  var mk=null, REG={'일본':'Japan','한국':'Korea','해외':'Elsewhere'}, NOTE={'낙찰가':'Sold prices','구매대행':'Proxy','판매 완료':'Sold','유럽':'EU','미국':'US'};
  p.SEEK.forEach(function(sk){
    if(sk[0]!==mk){ if(mk) h+='</div></div>'; mk=sk[0]; h+='<div class="mkt"><span class="mkt-n">'+esc(REG[mk]||mk)+'</span><div class="mkt-l">' }
    // the bare-name pages (a designer page, a brand page) are CCP's own; a brand searches its name instead
    var qq=p.seekQuery(parts,sk[2]), url=okUrl(sk[3](qq,!isB(a) && qq===p.SEEKBRAND[sk[2]]));
    if(url) h+='<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(sk[1])+(sk[4]?'<small>'+esc(NOTE[sk[4]]||sk[4])+'</small>':'')+'</a>';
  });
  el.innerHTML=h+'</div></div></div>'; el.hidden=false;
}

/* ---------------------------------------------------------------- saved */
function savedShell(){
  return '<section class="vh" lang="en"><h1 id="vh" tabindex="-1">Saved</h1><p class="rm" id="svm"><span class="sk w40"></span></p></section>'+
    '<div id="svb">'+AS.map(function(a){ return '<section class="sg" id="sg-'+a+'" aria-labelledby="sgh-'+a+'"><h2 class="sg-h" id="sgh-'+a+'" lang="en">'+esc(ARCH[a].name)+' <span class="n" id="sgn-'+a+'"></span></h2>'+
      '<div class="grid" id="sgg-'+a+'"></div><ul class="miss" id="sgm-'+a+'" hidden></ul></section>' }).join('')+'<div id="svbr"></div>'+
    // nothing saved: the ways in, no sentence
    '<div class="empty sv-e" id="svx" hidden lang="en"><div class="empty-o">'+[['/?view=new','New in'],['/?archive=hl','Helmut Lang'],['/?archive=ccp','Carol Christian Poell'],['/?view=brands','Brands']].map(function(x){
      return '<a class="btn ghost" href="'+x[0]+'">'+x[1]+'</a>' }).join('')+'</div></div></div>';
}
// the brands' saved listings by brand: '<slug>|<key>' → {slug: [keys]} ('' for keys of no brand)
function bSavedBy(){
  var by={};
  keys(SAVED.brx||{}).forEach(function(k){ var i=k.indexOf('|'), s=i>0?k.slice(0,i):''; if(!SLUG.test(s)) s=''; (by[s]=by[s]||[]).push(k) });
  return by;
}
function bSavedPending(){
  var by=bSavedBy(), ss=keys(by); if(!ss.length) return false;
  if(BIDX===null) return true;
  return ss.some(function(s){ var a='b:'+s; return own.call(ARCH,a) && !DATA[a] && !FAIL[a] });
}
var SAVEDLIST=[];
function savedUpdate(gen){
  if(!$('svb')) return;
  var fm=focusMark(['svb']);
  var pending=AS.filter(function(a){ return !DATA[a] && !FAIL[a] && keys(SAVED[a]||{}).length });
  pending.forEach(function(a){ waitOn(gen,a,load(a),savedUpdate) });
  var total=0; SAVEDLIST=[];
  AS.forEach(function(a){
    var m=SAVED[a]||{}, urls=keys(m), d=DATA[a], g=$('sgg-'+a), miss=$('sgm-'+a), sec=$('sg-'+a);
    total+=urls.length;
    $('sgn-'+a).textContent=won(urls.length);
    sec.hidden=!urls.length;
    if(!urls.length){ g.innerHTML=''; miss.hidden=true; miss.innerHTML=''; return }
    if(!d){ g.innerHTML=FAIL[a]?errBox(a):skel(Math.min(4,urls.length)); miss.hidden=true; return }
    var have=[], lost=[];
    urls.forEach(function(u){ var it=own.call(d.__byUrl,u)?d.__byUrl[u]:null; if(it) have.push(it); else lost.push(u) });
    have.sort(function(x,y){ var bx=m[x.l], by=m[y.l]; return String((by&&by.d)||'').localeCompare(String((bx&&bx.d)||'')) || y.k-x.k });
    SAVEDLIST=SAVEDLIST.concat(have);
    g.innerHTML=have.map(function(it,i){ return card(it,{change:true, eager:i<2}) }).join('');
    bindImgs(g);
    miss.hidden=!lost.length;
    miss.innerHTML=lost.map(function(u){ var ok=okUrl(u), host=''; try{ host=new URL(u).host.replace(/^www\./,'') }catch(e){}
      return '<li lang="en"><span class="miss-l">Not in today’s list</span><span class="miss-u">'+esc(host)+'</span>'+
        (ok?'<a href="'+esc(ok)+'" target="_blank" rel="noopener noreferrer">Listing</a>':'')+
        '<button type="button" class="lnk" data-unsave="'+esc(a)+'" data-u="'+esc(u)+'">Remove</button></li>' }).join('');
  });
  // the brands after the archives, a section each, A–Z (a saved key names its brand and the listing's key, not its address)
  var by=bSavedBy(), ss=keys(by), bx=$('svbr'), bh='';
  ss.forEach(function(s){ total+=by[s].length });
  if(ss.length && BIDX===null) waitOn(gen,'bidx',bidx(),savedUpdate);
  if(!ss.length || BIDX===null) bx.innerHTML='';
  else if(!BIDX) bx.innerHTML='<section class="sg" aria-labelledby="sgh-brx"><h2 class="sg-h" id="sgh-brx" lang="en">Brands <span class="n">'+won(ss.reduce(function(n,s){ return n+by[s].length },0))+'</span></h2>'+brxErr()+'</section>';
  else {
    var bm=SAVED.brx;
    ss.map(function(s){ var a='b:'+s; return {s:s, a:a, name:own.call(ARCH,a)?ARCH[a].name:own.call(BENTRY,s)?BENTRY[s].n:(s||'Brands')} })
      .sort(function(x,y){ return cmpName({n:x.name},{n:y.name}) }).forEach(function(g){
        var ks=by[g.s], a=g.a, known=!!g.s && own.call(ARCH,a), d=known?DATA[a]:null, body;
        if(known && !d){
          if(!FAIL[a]) waitOn(gen,a,load(a),savedUpdate);
          body=FAIL[a]?errBox(a):'<div class="grid">'+skel(Math.min(4,ks.length))+'</div>';
        } else {
          var have=[], lost=[];
          ks.forEach(function(k){ var key=k.slice(k.indexOf('|')+1), it=d && own.call(d.__byKey,key) ? d.__byKey[key] : null; if(it) have.push(it); else lost.push(k) });
          have.sort(function(x,y){ var bx0=bm[skey(x)], by0=bm[skey(y)]; return String((by0&&by0.d)||'').localeCompare(String((bx0&&bx0.d)||'')) || y.k-x.k });
          SAVEDLIST=SAVEDLIST.concat(have);
          body='<div class="grid">'+have.map(function(it,i){ return card(it,{change:true, eager:i<2}) }).join('')+'</div>'+
            (lost.length?'<ul class="miss">'+lost.map(function(k){ return '<li lang="en"><span class="miss-l">Not in today’s list</span>'+
              '<button type="button" class="lnk" data-unsave="brx" data-u="'+esc(k)+'">Remove</button></li>' }).join('')+'</ul>':'');
        }
        bh+='<section class="sg" id="sg-'+a+'" aria-labelledby="sgh-'+a+'"><h2 class="sg-h" id="sgh-'+a+'" lang="en">'+esc(g.name)+' <span class="n">'+won(ks.length)+'</span></h2>'+body+'</section>';
      });
    bx.innerHTML=bh; bindImgs(bx);
  }
  $('svm').innerHTML=total?'<span><b>'+won(total)+'</b> '+(total===1?'Item':'Items')+'</span><span>Kept in this browser</span>':'<span>Nothing saved</span>';
  $('svx').hidden=!!total;
  focusBack(fm,'vh');
  var box=$('svb'); if(box && !box.__b){ box.__b=1; box.addEventListener('click',function(e){ var b=e.target.closest('[data-unsave]'); if(!b) return;
    var s=b.getAttribute('data-unsave'), u=b.getAttribute('data-u'); if(!own.call(STORES,s)) return; var m=readSaved(s); delete m[u]; lsSet(STORES[s],JSON.stringify(m)); SAVED[s]=m; savedUi(); refresh() }) }
}

/* ---------------------------------------------------------------- about */
function aboutShell(){
  return '<section class="vh"><h1 id="vh" tabindex="-1" lang="en">About</h1><p class="rm"><span>Helmut Lang 1986–2005</span><span>Carol Christian Poell</span><span id="abn" hidden></span><span>중고 매물 색인</span></p></section>'+
  '<div class="ab">'+
    AS.map(function(a){ return '<section class="ab-s" aria-labelledby="abh-'+a+'"><h2 id="abh-'+a+'" lang="en">'+esc(ARCH[a].name)+'</h2><dl class="kv" id="ab-'+a+'"><dt>범위</dt><dd>'+esc(ARCH[a].sub)+'</dd><dt>갱신</dt><dd>'+esc(ARCH[a].upd)+'</dd></dl></section>' }).join('')+
    '<section class="ab-s" id="abs-b" aria-labelledby="abh-b" hidden><h2 id="abh-b" lang="en">Brands</h2><dl class="kv" id="ab-b"></dl></section>'+
    '<section class="ab-s" aria-labelledby="abh-r"><h2 id="abh-r">읽는 법</h2><dl class="kv">'+
      '<dt>연도</dt><dd>상품명에 적힌 것만 <span class="basis">연도 표기 · 아카이브 표기 · 시기 표기 · 연도 미확인</span></dd>'+
      '<dt>가격</dt><dd>판매자 통화와 원화 환산 <span class="basis">그날 환율</span></dd>'+
      '<dt>가격 변동</dt><dd>판매자가 바꾼 가격만 <span class="basis">환율로 움직인 원화는 빼고</span></dd>'+
      '<dt>신규</dt><dd>그날 처음 본 매물 <span class="basis">새로 읽기 시작한 판매처는 첫날 제외</span></dd>'+
      '<dt>사라진 매물</dt><dd>목록에서 빠진 매물 <span class="basis">팔렸는지는 모름</span></dd>'+
      '<dt>판매 기록</dt><dd>경매 낙찰 가격 <span class="basis">살 수 없음</span></dd>'+
      '<dt>같은 상품명</dt><dd>판매처가 달라도 한 장으로</dd>'+
      '<dt>저장</dt><dd>이 브라우저에만</dd>'+
    '</dl></section>'+
    '<section class="ab-s" aria-labelledby="abh-x"><h2 id="abh-x">운영</h2><dl class="kv">'+
      '<dt>만든 곳</dt><dd>개인 색인 <span class="basis">브랜드·판매처와 관계없음</span></dd>'+
      '<dt>사진·정보</dt><dd>각 판매처 <span class="basis">판매 페이지로 연결</span></dd>'+
    '</dl></section>'+
  '</div>';
}
function aboutUpdate(gen){
  AS.forEach(function(a){
    var fill=function(){ if(gen!==GEN) return; var d=DATA[a], el=$('ab-'+a); if(!el) return;
      var srcs = d.sources && d.sources.length ? d.sources.map(function(s){ return esc(s.name)+(s.how?' <span class="basis">'+esc(s.how)+'</span>':'') }).join('<br>')
        : d.__order.src.map(esc).join(' · ');
      var r=d.rates||{}, rates=['USD','EUR','GBP'].filter(function(c){ return r[c]>0 }).map(function(c){ return c+' '+won(r[c]) });
      if(r.JPY>0) rates.push('JPY 100 '+won(r.JPY));
      var more=[]; if(d.__sold) more.push('판매 기록 '+won(d.__sold)); if(d.__gone) more.push('사라진 매물 '+won(d.__gone));
      el.innerHTML='<dt>범위</dt><dd>'+esc(ARCH[a].sub)+(d.yearSpan?' <span class="basis">상품명 연도 '+esc(d.yearSpan)+'</span>':'')+'</dd>'+
        '<dt>매물</dt><dd>'+won(d.__cards)+(more.length?' <span class="basis">'+esc(more.join(' · '))+'</span>':'')+'</dd>'+
        '<dt>갱신</dt><dd>'+esc(ARCH[a].upd)+' <span class="basis">마지막 '+esc(kst(d.built))+'</span></dd>'+
        '<dt>판매처</dt><dd>'+srcs+'</dd>'+
        (rates.length?'<dt>환율</dt><dd>'+esc(rates.join(' · '))+' <span class="basis">원 · '+esc(r.date?md(r.date):md(d.today))+'</span></dd>':'')+
        '<dt>단독 페이지</dt><dd><a href="'+ARCH[a].path+'">rozykuzy.github.io'+ARCH[a].path.replace(/\/$/,'')+'</a></dd>';
    };
    if(DATA[a]) fill(); else load(a).then(fill,function(){});
  });
  // the brands, from their index: how many, how many with listings, when, from where
  bidx().then(function(x){
    var sec=$('abs-b'), el=$('ab-b'), n=$('abn'); if(gen!==GEN || !sec || !el || !x) return;
    // (the index's own count: Carol Christian Poell is one of its brands, read here as its archive)
    var L=BLIST, withC=brandsIn().filter(function(b){ return b.c>0 }), cards=0; withC.forEach(function(b){ cards+=b.c });
    var r=BBASE.rates||{}, rates=['USD','EUR','GBP'].filter(function(c){ return r[c]>0 }).map(function(c){ return c+' '+won(r[c]) });
    if(r.JPY>0) rates.push('JPY 100 '+won(r.JPY));
    var src=(BMETA&&BMETA.sources)||[];
    el.innerHTML='<dt>범위</dt><dd>브랜드 '+won(L.length)+'곳 <span class="basis">매물 '+won(withC.length)+'곳</span></dd>'+
      '<dt>매물</dt><dd>'+won(cards)+'</dd>'+
      '<dt>갱신</dt><dd>매일'+(BMETA&&BMETA.built?' <span class="basis">마지막 '+esc(kst(BMETA.built))+'</span>':'')+'</dd>'+
      (src.length?'<dt>판매처</dt><dd>'+src.map(function(s){ return esc(s.name)+(typeof s.how==='string'&&s.how?' <span class="basis">'+esc(s.how)+'</span>':'') }).join('<br>')+'</dd>':'')+
      (rates.length?'<dt>환율</dt><dd>'+esc(rates.join(' · '))+' <span class="basis">원 · '+esc(md(typeof r.date==='string'?r.date:BBASE.today))+'</span></dd>':'')+
      '<dt>목록</dt><dd><a href="/?view=brands">Brands A–Z</a></dd>';
    sec.hidden=false; if(n){ n.textContent='브랜드 '+won(L.length)+'곳'; n.hidden=false }
  });
}

/* ---------------------------------------------------------------- detail */
var DV={it:null, list:null, idx:-1, pushed:false, ret:null};
function listFor(it){
  if(ST.view==='room' && ST.a===it.__a) return VIEW;
  if(ST.view==='saved') return SAVEDLIST;
  if(ST.view==='home'){ if(TODAYLIST.indexOf(it)>=0) return TODAYLIST; if(DROPLIST.indexOf(it)>=0) return DROPLIST; if(TILELIST.indexOf(it)>=0) return TILELIST; return TODAYLIST }
  if(ST.view==='new') return NEWLIST;
  return null;
}
function findItem(k){
  if(ST.view==='room'){ var dr=DATA[ST.a]; return dr && own.call(dr.__byKey,k) ? dr.__byKey[k] : null }
  for(var i=0;i<AS.length;i++){ var d=DATA[AS[i]]; if(d && own.call(d.__byKey,k)) return d.__byKey[k] }
  // the brands: New in shows today's new ones (new.json), Saved the brands' own data
  if((ST.view==='new'||ST.view==='home') && BNEW) for(var a in BNEW.byKey) if(own.call(BNEW.byKey,a) && own.call(BNEW.byKey[a],k)) return BNEW.byKey[a][k];
  if(ST.view==='saved'){ var it=null; keys(bSavedBy()).some(function(s){ var x=itemAt('b:'+s,k); if(x && isSaved(x)) it=x; return !!it }); if(it) return it }
  return null;
}
function syncItem(){
  if(!ST.item){ if(DV.it) closeDetail(true); return }
  var it=findItem(ST.item);
  if(!it){
    // (Saved reads only the archives it has listings from)
    var waiting=(ST.view==='room'?[ST.a]:ST.view==='saved'?AS.filter(function(a){ return keys(SAVED[a]||{}).length }):AS).some(function(a){ return !DATA[a] && !FAIL[a] }) ||
      ((ST.view==='new'||ST.view==='home') && BNEW===null) || (ST.view==='saved' && bSavedPending());
    if(waiting) return;
    ST.item=null; writeUrl(false); if(DV.it) closeDetail(true); return;
  }
  if(DV.it===it) return;
  showDetail(it,false);
}
function openItem(it,o){
  if(!it || DV.it===it) return;
  ST.item=it.__k; DV.pushed=writeUrl(true);
  showDetail(it,true,o);
}
function canMorph(){ return fxOn() && typeof doc.startViewTransition==='function' }
function shownImg(el){ var im=el && el.querySelector('.ph img.on:not(.b2)'); if(!im) return null;
  var r=im.getBoundingClientRect(); return r.width>0 && r.bottom>0 && r.top<innerHeight ? im : null }
// a card's photo grows into the detail's; the detail opens on the photo already on screen
function openFrom(it,cardEl){
  if(!it) return;
  var im=shownImg(cardEl);
  if(!im || DV.it || !canMorph()){ openItem(it); return }
  im.style.viewTransitionName='pic'; root.classList.add('vt-on');
  var fin=function(){ var di=$('dvImg'); if(di) di.style.viewTransitionName=''; root.classList.remove('vt-on'); $('ov').classList.remove('now'); upgrade() };
  try{
    var t=doc.startViewTransition(function(){ im.style.viewTransitionName=''; openItem(it,{now:true, lo:im.currentSrc||im.src});
      var di=$('dvImg'); if(di) di.style.viewTransitionName='pic' });
    t.finished.then(fin,fin);
  }catch(e){ im.style.viewTransitionName=''; root.classList.remove('vt-on'); openItem(it) }
}
// and shrinks back into its card, when that card is on the page
function closeMorph(fn){
  var it=DV.it, di=$('dvImg'), sel=it?'[data-a="'+it.__a+'"][data-k="'+it.__k+'"]':'', box=it && doc.querySelector('.grid '+sel+', .ix '+sel);
  var im=box && shownImg(box);
  if(!di || !di.classList.contains('on') || !im || !canMorph()){ fn(false); return }
  di.style.viewTransitionName='pic'; root.classList.add('vt-on');
  var fin=function(){ im.style.viewTransitionName=''; root.classList.remove('vt-on') };
  try{
    var t=doc.startViewTransition(function(){ di.style.viewTransitionName=''; fn(true); im.style.viewTransitionName='pic' });
    t.finished.then(fin,fin);
  }catch(e){ fin(); fn(false) }
}
// the detail opens on the small photo already loaded, then takes the large one when it is ready
function upgrade(){
  var im=$('dvImg'); if(!im) return; var hi=im.getAttribute('data-hi'); if(!hi || im.src===hi) return;
  var x=new Image(); x.decoding='async';
  x.onload=function(){ if(im.isConnected && $('dvImg')===im){ im.removeAttribute('data-hi'); im.src=hi } };
  x.src=hi;
}
function showDetail(it,fromUi,o){
  var ov=$('ov'), dv=$('dv'), wasOpen=!!DV.it;
  o=o||{};
  // the page is drawn first and only then taken over: a record that cannot be drawn leaves everything as it was
  var list=listFor(it), idx=list?list.indexOf(it):-1, html=null;
  try{ html=detailHtml(it,o.lo,list,idx) }catch(e){ html=null }
  if(html==null){ if(ST.item===it.__k){ ST.item=null; writeUrl(false) } if(!wasOpen) DV.pushed=false; toast('Could not open'); return }
  var stepF=wasOpen && doc.activeElement && doc.activeElement.getAttribute ? doc.activeElement.getAttribute('data-step') : null;
  if(!wasOpen) DV.ret=doc.activeElement;
  if(!fromUi && !wasOpen) DV.pushed=false;
  DV.it=it; DV.list=list; DV.idx=idx;
  ackSaved(it); savedUi();
  dv.setAttribute('data-a',it.__a); dv.setAttribute('data-room',it.__a);
  dv.innerHTML=html;
  bindImgs(dv); DV.ph=0;
  ov.hidden=false;
  layers();
  if(o.now){ ov.classList.add('now','open') } else { requestAnimationFrame(function(){ ov.classList.add('open') }); upgrade() }
  var sb=stepF && dv.querySelector('[data-step="'+stepF+'"]:not([disabled])');
  var x=sb || dv.querySelector('.dv-x'); if(x && (!wasOpen || !dv.contains(doc.activeElement))) x.focus({preventScroll:true});
  var info=dv.querySelector('.dv-info'); if(info) info.scrollTop=0;
  var pic=dv.querySelector('.dv-pic'); if(pic) pic.scrollTop=0;
  title();
  preload(1); preload(-1);
}
function preload(step){ if(!DV.list||DV.idx<0) return; var n=DV.list[DV.idx+step]; if(!n) return; var u=phs(n)[0]; if(u){ var im=new Image(); im.decoding='async'; im.src=thumb(n.__a,u,1200) } }
function closeDetail(silent,now){
  if(!DV.it) return;
  var ov=$('ov');
  ov.classList.remove('open');
  var done=function(){ if(!ov.classList.contains('open')){ ov.hidden=true; $('dv').innerHTML=''; ov.classList.remove('now') } };
  if(REDUCED.matches || now) done(); else setTimeout(done,240);
  var it=DV.it, r=DV.ret; DV.it=null; DV.list=null; DV.idx=-1; DV.ret=null;
  layers();
  // the keyboard goes back to the listing's own card when it is on the page (after stepping, the one last open),
  // else to where it was, else to the page's heading; a card out of sight is brought into it
  var sel='[data-a="'+cssv(it.__a)+'"][data-k="'+cssv(it.__k)+'"]', cur=doc.querySelector('.grid '+sel+' .t a, .ix '+sel+' .r-t a');
  var t=cur || (r && r.focus && r!==doc.body && doc.contains(r) ? r : null) || $('vh');
  if(t) try{ t.focus({preventScroll:true});
    var box=t.closest('.card,.row'), rc=box && box.getBoundingClientRect();
    if(rc && (rc.bottom<0 || rc.top>innerHeight)) box.scrollIntoView({block:'center'}) }catch(e){}
  title();
}
function closeByUser(){
  if(!DV.it) return;
  var pushed=DV.pushed; DV.pushed=false;
  closeMorph(function(now){
    ST.item=null;
    if(pushed){ closeDetail(false,now); history.back() }   // the phone's back gesture is the same close
    else { writeUrl(false); closeDetail(false,now) }
  });
}
function step(d){
  if(!DV.list || DV.idx<0) return;
  var n=DV.list[DV.idx+d]; if(!n) return;
  ST.item=n.__k; writeUrl(false);
  var pushed=DV.pushed, ret=DV.ret;
  showDetail(n,true); DV.pushed=pushed; DV.ret=ret;
  // the detail is drawn again; one quiet line says where it is now
  if(DV.it===n) live('',won(DV.idx+1)+' / '+won(DV.list.length)+' <span'+tl(n)+'>'+esc(clip(n.t,80))+'</span>');
}
// What sits on top decides what is out of reach — the listing, the search, the phone menu, the filter drawer — and
// one place sets it from what is open now (inert, aria-hidden where inert is not known, the page's scroll lock), so
// closing one layer never frees what another still covers. The skip link is out of reach with the rest.
var LAYER={search:false, menu:false, side:false};
function layers(){
  var q=function(s){ return doc.querySelector(s) }, top=!!DV.it||LAYER.search, set=[];
  var every=[$('top'),$('main'),$('foot'),$('drawer'),q('.skip'),q('#main > .rh'),$('cats'),$('bar'),q('#main > .body')];
  if(top) set=[$('top'),$('main'),$('foot'),$('drawer'),q('.skip')];
  else if(LAYER.menu) set=[$('top'),$('main'),$('foot'),q('.skip')];
  else if(LAYER.side) set=[$('top'),$('foot'),q('.skip'),q('#main > .rh'),$('cats'),$('bar'),q('#main > .body')];
  every.forEach(function(el){ if(!el) return;
    if(set.indexOf(el)>=0){ el.setAttribute('inert',''); el.setAttribute('aria-hidden','true') } else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden') } });
  root.classList.toggle('lock', top||LAYER.menu);
  root.classList.toggle('lock-side', LAYER.side && !top);
}
// the year, in the words the card uses (연도 미확인: no year confirmed), and on what it rests
function yearLine(it){
  var p=P[it.__a];
  if(it.__e) return esc(it.__e)+' <span class="basis">판매자 표기</span>';
  if(it.__yc) return (it.__yc.k==='arch'?'연도 미확인':esc(it.__yc.v))+' <span class="basis">'+esc(p.CLAIMBASIS[it.__yc.k]||p.CLAIMBASIS.arch)+'</span>';
  if(it.c==='A') return '연도 표기 <span class="basis">판매 페이지 확인</span>';
  if(it.c==='B') return '연도 미확인 <span class="basis">아카이브 표기</span>';
  return '연도 미확인 <span class="basis">상품명에 없음</span>';
}
function detailHtml(it,lo,list,idx){
  var a=it.__a, A=ARCH[a], p=P[a], ph=phs(it), on=isSaved(it), d=DATA[a];
  var pos=list&&idx>=0?won(idx+1)+' / '+won(list.length):'';
  var link=okUrl(it.l), bee=!it.so && p.buyeeUrl(it.l);
  var mcN=it.mc && p.codeNum && MCOUNT[a] ? (MCOUNT[a][p.codeNum(it.mc)]||0) : 0;
  var seenAt=SRCSEEN[a] && own.call(SRCSEEN[a],it.r) ? SRCSEEN[a][it.r] : null;
  var seen=p.seenText(it), stop=seenAt && d && d.today && seenAt<d.today;
  var kv='<dt>사이즈</dt><dd>'+(it.z?esc(it.z):'미표기')+'</dd>'+
    '<dt>분류</dt><dd lang="en">'+esc(catEn(it.s))+'</dd>'+
    (it.mc && !isB(a)?'<dt>번호</dt><dd><span class="mc">'+esc(it.mc)+'</span>'+(mcN>1?' <button type="button" class="lnk" data-code="'+esc(p.codeNum(it.mc))+'">같은 번호 '+won(mcN)+'건</button>':'')+' <span class="basis">상품명</span></dd>':'')+
    '<dt>연도</dt><dd>'+yearLine(it)+'</dd>'+
    (it.__mk.length?'<dt>표기</dt><dd><span lang="en">'+it.__mk.map(function(k){ return esc(markEn(a,k)) }).join(' · ')+'</span> <span class="basis">상품명</span></dd>':'')+
    '<dt>판매처</dt><dd>'+esc(it.r)+'</dd>'+
    p.dutyHtml(it)+
    (p.aucText(it)?'<dt>경매</dt><dd>'+esc(p.aucText(it))+(p.endText(it)?' <span class="basis">'+esc(p.endText(it))+' 마감 · 수집 시점 기준</span>':'')+'</dd>':'')+
    (it.so?'<dt>'+esc(it.sk||'판매 완료')+'</dt><dd>'+esc(it.so)+' <span class="basis">구매 불가 · '+esc(it.r)+' 판매 기록</span></dd>':'')+
    (it.f&&!it.so?'<dt>기간</dt><dd>'+(it.x&&it.ls?esc(kday(it.f))+' – '+esc(kday(it.ls))+' <span class="basis">'+esc(seen)+' · 목록에서 사라짐</span>'
       : stop?esc(kday(it.f))+' – '+esc(kday(SRCSEEN[a][it.r]))+' <span class="basis">'+esc(md(SRCSEEN[a][it.r]))+' 이후 수집 안 됨</span>'
       : esc(kday(it.f))+'부터'+(seen?' <span class="basis">'+esc(seen)+'</span>':''))+'</dd>':'');
  var offers='';
  if(it.g>1 && Array.isArray(it.v) && it.v.length){
    var ks=it.v.map(function(v){ return v.k }), lo=Math.min.apply(null,ks), hi=Math.max.apply(null,ks), spread=hi>lo;
    offers='<details class="acc offers" open><summary lang="en">Same title · '+won(it.g)+' sources</summary><div class="acc-b">'+it.v.slice().sort(function(x,y){ return x.k-y.k }).map(function(v){
      var u=okUrl(v.l); if(!u) return '';
      return '<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"'+(spread&&v.k===lo?' class="lo"':'')+'>'+
        '<span class="o-ph">'+(v.i?imgTag(a,v.i,160):'')+'</span>'+
        '<span class="o-w">'+esc(v.r)+(v.z?' · '+esc(v.z):'')+(spread&&v.k===lo?'<em>Lowest</em>':'')+'</span>'+
        '<b>₩'+won(v.k)+(v.u&&v.p>0?'<i>'+esc((p.SYM[v.u]||'')+Number(v.p).toLocaleString('en-US'))+'</i>':'')+'</b></a>' }).join('')+
      (spread?'<p class="gap">Spread ₩'+won(hi-lo)+'</p>':'')+'</div></details>';
  }
  var hist=p.histHtml(it), comps=p.compsHtml(it), st=statusFl(it);
  var tags=it.__m.map(function(k){ return '<button type="button" class="tag" data-motif="'+esc(k)+'">'+esc(motifEn(a,k))+'</button>' }).join('');
  var thumbs=ph.length>1?'<div class="ths" role="group" aria-label="Photographs">'+ph.map(function(u,i){ return '<button type="button" data-ph="'+i+'" aria-label="Photograph '+(i+1)+'"'+(i===0?' aria-current="true"':'')+'>'+imgTag(a,u,160)+'</button>' }).join('')+'</div>':'';
  // the brand line leads to its room (not when the room is the page underneath)
  var inRoom=ST.view==='room' && ST.a===a, nm=inRoom?esc(A.name):'<a href="'+roomHref(a)+'">'+esc(A.name)+'</a>';
  return '<div class="dv-top" lang="en">'+
      '<span class="dv-tag"><span class="nm-l">'+esc(A.name)+'</span><span class="nm-s">'+esc(A.short)+'</span></span>'+
      '<span class="dv-pos">'+pos+'</span>'+
      '<span class="dv-nav">'+
        '<button type="button" class="ico" data-step="-1" aria-label="Previous listing"'+(idx>0?'':' disabled')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.3" fill="none"/></svg></button>'+
        '<button type="button" class="ico" data-step="1" aria-label="Next listing"'+(list&&idx>=0&&idx<list.length-1?'':' disabled')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.3" fill="none"/></svg></button>'+
        '<button type="button" class="dv-x" data-close><span>Close</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.3"/></svg></button>'+
      '</span></div>'+
    '<div class="dv-body">'+
      '<div class="dv-pic'+(ph.length?'':' dead')+'">'+(ph.length?'<div class="dv-main">'+mainImg(a,ph[0],it.t,lo)+(ph.length>1?'<span class="pn" id="dvPn">1 / '+ph.length+'</span>':'')+'</div>':'')+thumbs+'</div>'+
      '<div class="dv-info">'+
        '<div class="vd"><span class="at" lang="en">'+nm+'</span>'+yearPart(it)+'</div>'+
        '<h2 id="dvT"'+tl(it)+'>'+esc(it.t)+'</h2>'+
        wasSr(p.priceHtml(it,true))+
        (st?'<div class="fl" lang="en">'+st+'</div>':'')+
        (tags?'<div class="tags" lang="en">'+tags+'</div>':'')+
        '<div class="acts" lang="en">'+
          (link?'<a class="btn solid" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">'+(it.so?'View record':'View listing')+'<span class="arr" aria-hidden="true">↗</span></a>':'')+
          (bee?'<a class="btn" href="'+esc(bee)+'" target="_blank" rel="noopener noreferrer">Buy via proxy<span class="arr" aria-hidden="true">↗</span></a>':'')+
          '<button type="button" class="btn sv-b'+(on?' on':'')+'" data-save="'+it.__k+'" aria-pressed="'+on+'">'+saveBtnInner(on)+'</button>'+
          '<button type="button" class="btn" data-copy>Copy link</button>'+
        '</div>'+
        '<details class="acc" open><summary lang="en">Details</summary><div class="acc-b"><dl class="kv">'+kv+'</dl></div></details>'+
        (hist?'<details class="acc"><summary lang="en">Price history</summary><div class="acc-b">'+hist+'</div></details>':'')+
        (comps?'<details class="acc"><summary lang="en">Sold records</summary><div class="acc-b">'+comps+'</div></details>':'')+
        offers+
      '</div>'+
    '</div>';
}
function mainImg(a,u,alt,lo){
  u=okUrl(u); if(!u) return '';
  var hi=okUrl(thumb(a,u,1200))||u, first=okUrl(lo)||hi;
  return '<img id="dvImg" src="'+esc(first)+'"'+(first!==hi?' data-hi="'+esc(hi)+'"':'')+(hi!==u?' data-full="'+esc(u)+'"':'')+
    ' alt="'+esc(alt||'')+'" fetchpriority="high" decoding="async">';
}
function showPhoto(i){
  var it=DV.it; if(!it) return; var ph=phs(it), u=ph[i]; if(!u) return;
  var im=$('dvImg'); if(im){ im.classList.remove('on'); im.removeAttribute('data-b'); im.removeAttribute('data-hi'); var t=thumb(it.__a,u,1200); im.src=t; if(t!==u) im.setAttribute('data-full',u); else im.removeAttribute('data-full'); bindImgs($('dv')) }
  DV.ph=i; lensOff(true);
  var pn=$('dvPn'); if(pn) pn.textContent=(i+1)+' / '+ph.length;
  var bs=$('dv').querySelectorAll('[data-ph]'); for(var j=0;j<bs.length;j++){ if(j===i) bs[j].setAttribute('aria-current','true'); else bs[j].removeAttribute('aria-current') }
}
function copyLink(){
  var url=location.origin+hrefOf(ST);
  var ok=function(){ toast('Link copied') }, no=function(){ toast('Could not copy · use the address bar') };
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok,function(){ fallbackCopy(url)?ok():no() });
  else fallbackCopy(url)?ok():no();
}
function fallbackCopy(t){ try{ var ta=doc.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; $('dv').appendChild(ta); ta.select(); var r=doc.execCommand('copy'); ta.remove(); return r }catch(e){ return false } }
var SW=null;
$('ov').addEventListener('pointerdown',function(e){ if(e.pointerType!=='touch' || !e.target.closest('.dv-main')) return; SW={x:e.clientX, y:e.clientY} },{passive:true});
$('ov').addEventListener('pointercancel',function(){ SW=null },{passive:true});
$('ov').addEventListener('pointerup',function(e){
  if(!SW || !DV.it) { SW=null; return } var dx=e.clientX-SW.x, dy=e.clientY-SW.y; SW=null;
  var n=phs(DV.it).length;
  if(n>1 && Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.4) showPhoto(((DV.ph||0)+(dx<0?1:-1)+n)%n);
},{passive:true});
$('ov').addEventListener('click',function(e){
  if(e.target.closest('[data-close]')){ closeByUser(); return }
  var mm=e.target.closest('.dv-main'); if(mm && FINE.matches && !e.target.closest('button')){ if(mm.classList.contains('zoom')) lensOff(); else lensOn(e); return }
  var s=e.target.closest('[data-step]'); if(s){ step(+s.getAttribute('data-step')); return }
  var sv=e.target.closest('[data-save]'); if(sv){ if(DV.it) toggleSave(DV.it); return }
  if(e.target.closest('[data-copy]')){ copyLink(); return }
  var ph=e.target.closest('[data-ph]'); if(ph){ showPhoto(+ph.getAttribute('data-ph')); return }
  var mt=e.target.closest('[data-motif]'); if(mt && DV.it){ var a=DV.it.__a, F=blankF(); F.motif[mt.getAttribute('data-motif')]=1; DV.pushed=false; closeDetail(true); go({view:'room', a:a, F:F, sort:'new', item:null}); return }
  var cd=e.target.closest('[data-code]'); if(cd && DV.it){ var a2=DV.it.__a, F2=blankF(); F2.q=cd.getAttribute('data-code'); DV.pushed=false; closeDetail(true); go({view:'room', a:a2, F:F2, sort:'rel', item:null}); return }
});

/* ---------------------------------------------------------------- search across both */
var SQT=null, SRES=[], SSEL=-1, SOPEN=null;
function openSearch(){
  var s=$('search'); if(!s.hidden) { $('sq').focus(); return }
  closeDrawer(true); var sd=$('side'); if(sd && sd.classList.contains('open')) sideOpen(false);
  SOPEN=doc.activeElement;
  s.hidden=false; LAYER.search=true; layers(); requestAnimationFrame(function(){ s.classList.add('open') });
  $('searchBtn').setAttribute('aria-expanded','true');
  var q=$('sq'); q.value=ST.view==='room'?ST.F.q:''; q.focus(); q.select();
  AS.forEach(function(a){ if(!DATA[a] && !FAIL[a]) load(a).then(runSearch,function(){ runSearch() }) });
  if(BIDX===null) bidx().then(function(){ runSearch() });
  runSearch();
  var hint=hints();
  $('sHint').innerHTML='<span class="lbl" lang="en">Try</span>'+hint.map(function(h){ return '<button type="button" data-hint="'+esc(h)+'">'+esc(h)+'</button>' }).join('');
}
function hints(){
  var h=['bondage','1998','ボンデージ','드립'];
  var d=DATA.ccp; if(d){ var best=null, n=0; for(var k in MCOUNT.ccp) if(own.call(MCOUNT.ccp,k) && MCOUNT.ccp[k]>n){ n=MCOUNT.ccp[k]; best=k } if(best) h.push(best) }
  return h;
}
function closeSearch(silent){
  var s=$('search'); if(s.hidden) return;
  s.classList.remove('open'); LAYER.search=false; layers();
  $('searchBtn').setAttribute('aria-expanded','false');
  var fin=function(){ if(!s.classList.contains('open')) s.hidden=true };
  if(REDUCED.matches) fin(); else setTimeout(fin,200);
  // back to whatever opened it ("/" from a card returns to that card), else the search button
  var r=SOPEN; SOPEN=null;
  if(!silent){ var t=r && r!==doc.body && r!==root && r.focus && doc.contains(r) ? r : $('searchBtn'); try{ t.focus() }catch(e){} }
  $('sStat').textContent='';
}
// Brand names that answer the query: the start of a name first, then the start of a word in it, then anywhere in it;
// letters only (so rickowens, Rick-Owens and RICK OWENS are one), accents and widths folded. A query that begins with a
// name and goes on (guidi boots, リックオウエンス ジャケット) is that brand, searched for the rest in its own room.
function bfold(s){ return fold(s).toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu,' ').trim() }
// what the query says after a name, in the reader's own characters (not the folded ones the match was made on)
function restAfter(q,tc){
  var acc='', i=0;
  while(i<q.length && acc.length<tc.length){ var c=q.codePointAt(i), ch=String.fromCodePoint(c); acc+=bfold(ch).replace(/ /g,''); i+=ch.length }
  return acc===tc ? q.slice(i).replace(/^[\s\-_.,/·:|]+/,'').trim() : null;
}
function brandHits(q){
  var f=bfold(q), fc=f.replace(/ /g,''); if(!fc || (fc.length<2 && /^[\x00-\x7f]+$/.test(fc))) return [];
  var out=[];
  brandList().forEach(function(x){ if(!x.href) return;
    var best=0, rest='';
    [x.name].concat(x.al||[]).forEach(function(n){ var t=bfold(n), tc=t.replace(/ /g,''), sc=0, r='';
      if(!tc) return;
      if(fc===tc) sc=5;
      else if(f.length>t.length && f.indexOf(t+' ')===0){ sc=4; r=f.slice(t.length+1) }
      else if(/[^\x00-\x7f]/.test(tc) && fc.length>tc.length && fc.indexOf(tc)===0){ sc=4; r=fc.slice(tc.length) }
      else if(tc.indexOf(fc)===0) sc=3; else if((' '+t).indexOf(' '+f)>=0) sc=2; else if(tc.indexOf(fc)>=0) sc=1;
      if(sc===4){ var own0=restAfter(q,tc); if(own0) r=own0; else if(r.normalize) r=r.normalize('NFC') }
      // (the longest name that begins the query leaves the shortest rest)
      if(sc>best || (sc===4 && best===4 && r.length<rest.length)){ best=sc; rest=r } });
    if(best) out.push({x:x, sc:best, rest:rest.trim().slice(0,80)});
  });
  return out.sort(function(p,q2){ return q2.sc-p.sc || (q2.x.n||0)-(p.x.n||0) || cmpName({n:p.x.name},{n:q2.x.name}) });
}
function brandHitsHtml(L){
  if(!L.length) return '';
  return '<section class="sr-g sr-bg"><h3 lang="en">Brands <span class="n">'+won(L.length)+'</span></h3><ul>'+L.slice(0,6).map(function(r){ var x=r.x;
    var ph=x.ph || (DATA[x.a] ? (heroPick(x.a,DATA[x.a],'search')||{}).i : '');
    var href=x.href+(r.rest?'&q='+encodeURIComponent(r.rest):'');
    return '<li><a class="sr-i sr-bi" href="'+esc(href)+'" data-sc="'+r.sc+'"><span class="sr-ph">'+imgTag(x.a,ph,160)+'</span><span class="sr-t" lang="en">'+esc(x.name)+'</span>'+
      '<span class="sr-p">'+(r.rest?'“'+esc(r.rest)+'”':x.n?'<span lang="en">'+won(x.n)+' '+(x.n===1?'Item':'Items')+'</span>':'')+'</span></a></li>' }).join('')+'</ul></section>';
}
function runSearch(){
  var s=$('search'); if(s.hidden) return;
  var q=$('sq').value.replace(/\s+/g,' ').trim().toLowerCase().slice(0,80), out=$('sres');
  SRES=[]; SSEL=-1;
  if(!q){ out.innerHTML=''; $('sStat').textContent=''; return }
  var bh=brandHits(q), h=brandHitsHtml(bh), items=0, loading=false;
  AS.forEach(function(a){
    var A=ARCH[a], d=DATA[a], head='<section class="sr-g"><h3 lang="en">'+esc(A.name)+' ';
    if(!d){ if(!FAIL[a]) loading=true; h+=head+'</h3><p class="sr-m" lang="en">'+(FAIL[a]?'Could not load':'Loading')+'</p></section>'; return }
    var p=P[a], F=blankF(); F.q=q; p.setF(F); p.setQuery(q);
    var QT=p.getQT(), res=[];
    if(QT.length) d.items.forEach(function(it){ if(it.x || it.so || it.__bad) return; var sc=p.score(it); if(sc>0) res.push([sc,it]) });
    res.sort(function(x,y){ return y[0]-x[0] || y[1].k-x[1].k });
    // hand the room back its own query
    if(ST.view==='room' && ST.a===a){ p.setF(ST.F); p.setQuery(ST.F.q) }
    // a query that is only this archive's own name is answered under Brands; nothing here while a brand answers: the brand
    if(!QT.length || (!res.length && bh.length)) return;
    if(!res.length){ h+=head+'</h3><p class="sr-m" lang="en">No results</p></section>'; return }
    items+=res.length;
    var st={view:'room', a:a, F:F, sort:'rel', item:null};
    h+=head+'<span class="n">'+won(res.length)+'</span></h3><ul>'+res.slice(0,5).map(function(r){ var it=r[1], ph=phs(it)[0]; SRES.push({it:it, q:q});
      var st2={view:'room', a:a, F:F, sort:'rel', item:it.__k};
      return '<li><a class="sr-i" href="'+esc(hrefOf(st2))+'" data-sri="'+(SRES.length-1)+'">'+
        '<span class="sr-ph">'+imgTag(a,ph,160)+'</span><span class="sr-t"'+tl(it)+'>'+esc(it.t)+'</span>'+
        '<span class="sr-p">₩'+won(it.k)+(it.__e?' · '+esc(it.__e):'')+' · '+esc(it.r)+'</span></a></li>' }).join('')+'</ul>'+
      '<a class="sr-all" href="'+esc(hrefOf(st))+'" lang="en">View all '+won(res.length)+'<span class="arr" aria-hidden="true">→</span></a></section>';
  });
  out.innerHTML=h; bindImgs(out);
  // one short line for a screen reader, not the whole list again
  $('sStat').textContent=loading&&!bh.length&&!items?'Loading':(bh.length||items)?[bh.length?won(bh.length)+(bh.length===1?' brand':' brands'):'',items?won(items)+(items===1?' item':' items'):''].filter(Boolean).join(' · '):'No results';
}
$('searchBtn').addEventListener('click',openSearch);
$('sq').addEventListener('input',function(){ clearTimeout(SQT); SQT=setTimeout(runSearch,160) });
$('sq').addEventListener('keydown',function(e){
  var items=$('sres').querySelectorAll('a.sr-i, a.sr-all');
  if(e.key==='ArrowDown' || e.key==='ArrowUp'){ if(!items.length) return; e.preventDefault(); SSEL=(SSEL+(e.key==='ArrowDown'?1:-1)+items.length)%items.length; items[SSEL].focus(); return }
  // Enter: a brand whose name the query is or begins with; else the first archive's whole list; else the first brand
  if(e.key==='Enter'){ var bi=$('sres').querySelector('a.sr-bi'), sc=bi?+bi.getAttribute('data-sc'):0;
    var first=(sc>=3?bi:null)||$('sres').querySelector('a.sr-all')||bi; if(first){ e.preventDefault(); first.click() } }
});
$('sres').addEventListener('keydown',function(e){
  if(e.key!=='ArrowDown' && e.key!=='ArrowUp') return;
  var items=[].slice.call($('sres').querySelectorAll('a.sr-i, a.sr-all')), i=items.indexOf(doc.activeElement); if(i<0) return;
  e.preventDefault(); var n=i+(e.key==='ArrowDown'?1:-1); if(n<0){ $('sq').focus(); SSEL=-1; return } if(n<items.length){ items[n].focus(); SSEL=n }
});
$('search').addEventListener('click',function(e){
  if(e.target.closest('[data-close]')){ closeSearch(); return }
  var hb=e.target.closest('[data-hint]'); if(hb){ $('sq').value=hb.getAttribute('data-hint'); runSearch(); $('sq').focus(); return }
});

/* ---------------------------------------------------------------- drawer (phone menu) */
function openDrawer(){ var d=$('drawer'); d.hidden=false; LAYER.menu=true; layers(); nextFrame(function(){ d.classList.add('open') }); $('menuBtn').setAttribute('aria-expanded','true'); var x=d.querySelector('[data-close]'); if(x) x.focus() }
function closeDrawer(silent){ var d=$('drawer'); if(d.hidden) return; d.classList.remove('open'); LAYER.menu=false; layers(); $('menuBtn').setAttribute('aria-expanded','false');
  var fin=function(){ if(!d.classList.contains('open')) d.hidden=true }; if(REDUCED.matches) fin(); else setTimeout(fin,360); if(!silent) $('menuBtn').focus() }
$('menuBtn').addEventListener('click',openDrawer);
(function(){ var ar=$('arch'); if(!ar) return;
  var on=function(){ ar.classList.remove('mm-off'); ar.__esc=null };
  ar.addEventListener('mouseleave',on);
  // closed with Escape: open again when focus moves to another item or leaves the menu (a click waits for the pointer to leave)
  ar.addEventListener('focusin',function(e){ var m=e.target.closest && e.target.closest('.mm'); if(ar.__esc && m!==ar.__esc) on() });
  ar.addEventListener('focusout',function(e){ if(ar.__esc && !ar.contains(e.relatedTarget)) on() });
  // a panel the pointer leaves while a link in it has the focus: the focus goes to the menu item, not to nowhere
  [].forEach.call(ar.querySelectorAll('.mm'),function(m){ m.addEventListener('mouseleave',function(){
    var pn=m.querySelector('.mm-p'); if(pn && pn.contains(doc.activeElement)){ var l=m.querySelector('a'); if(l) try{ l.focus({preventScroll:true}) }catch(x){} } }) });
})();
$('drawer').addEventListener('click',function(e){ if(e.target.closest('[data-close]')) closeDrawer() });

/* ---------------------------------------------------------------- clicks, keys */
doc.addEventListener('click',function(e){
  if(e.defaultPrevented || e.button!==0) return;
  var mod=e.metaKey||e.ctrlKey||e.shiftKey||e.altKey;
  var sk=e.target.closest('.skip,.skip2');
  if(sk){ var tid=(sk.getAttribute('href')||'').replace(/^#/,''), tg=$(tid); if(tg){ e.preventDefault(); if(!tg.hasAttribute('tabindex')) tg.setAttribute('tabindex','-1'); tg.focus({preventScroll:true});
      var y=tg.getBoundingClientRect().top+window.scrollY-(tid==='listH'?140:0); window.scrollTo(0,Math.max(0,y)) } return }
  var mmp=e.target.closest('.mm-p'); if(mmp){ var ar0=$('arch'); if(ar0) ar0.classList.add('mm-off'); if(doc.activeElement && mmp.contains(doc.activeElement)) doc.activeElement.blur() }
  var re=e.target.closest('[data-retry]'); if(re){ var ra=re.getAttribute('data-retry');
    if(ra==='brx'){ BIDX=null; BERR=false; if(BNEW===false) BNEW=null;
      // a brand address that could not open: try the whole way again
      if(MOUNTED.indexOf('down:')===0){ MOUNTED=''; route(ST); return } }
    else delete FAIL[ra];
    WAITED={}; refresh(); return }
  var azt=e.target.closest('[data-azt]'); if(azt){ AZTAB=azt.getAttribute('data-azt'); azTabs(); return }
  var tt=e.target.closest('[data-tt]'); if(tt){ TODAYTAB=tt.getAttribute('data-tt'); var tb=$('todayT').querySelectorAll('[data-tt]');
    for(var ti=0;ti<tb.length;ti++) tb[ti].setAttribute('aria-pressed',String(tb[ti]===tt)); todayPaint(); return }
  var nt=e.target.closest('[data-nt]'); if(nt){ if(nt.disabled) return; NEWTAB=nt.getAttribute('data-nt'); newUpdate(GEN); return }
  if(e.target.closest('#nmoreBtn')){ var n0=NEWSHOWN; newPaint(false); landOn($('ngrid'),n0); live(won(NEWSHOWN-n0)+' more · '+won(NEWSHOWN)+' of '+won(NEWLIST.length)); return }
  var az=e.target.closest('[data-az]'); if(az){ var at=$('az-'+az.getAttribute('data-az')); if(at){ e.preventDefault();
    var h2=at.querySelector('h2'); if(h2){ h2.setAttribute('tabindex','-1'); h2.focus({preventScroll:true}) }
    window.scrollTo(0,Math.max(0,at.getBoundingClientRect().top+window.scrollY-($('top').offsetHeight+24))) } return }
  var sv=e.target.closest('.card [data-save], .row [data-save]'); if(sv){ var it=itemOfEl(sv); if(it) toggleSave(it); return }
  var sri=e.target.closest('[data-sri]');
  if(sri && !mod){ e.preventDefault(); var r=SRES[+sri.getAttribute('data-sri')]; closeSearch(true); if(!r) return;
    var F=blankF(); F.q=r.q; var target=r.it;
    go({view:'room', a:target.__a, F:F, sort:'rel', item:null}, true, function(){ openItem(target) }); return }
  var op=e.target.closest('.card [data-open], .row [data-open]');
  if(op && !(mod && op.tagName==='A')){ e.preventDefault(); pvHide(); openFrom(itemOfEl(op), op.closest('.card, .row')); return }
  var a=e.target.closest('a'); if(!a || mod || a.target==='_blank' || a.hasAttribute('download')) return;
  var href=a.getAttribute('href')||''; if(!/^\/(\?[^#]*)?$/.test(href)) return;
  e.preventDefault(); closeDrawer(true); closeSearch(true);
  var st=readUrl(href.slice(1));
  if(href===hrefOf(ST) && !ST.item){ window.scrollTo(0,0); return }
  go(st);
});
doc.addEventListener('keydown',function(e){
  var t=e.target, tag=(t.tagName||'').toLowerCase(), typing=tag==='input'||tag==='textarea'||tag==='select'||t.isContentEditable;
  if(e.key==='Escape'){
    if(PVK) pvHide();
    var ar=$('arch'), mmx=ar && doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('.mm');
    if(mmx && ar.contains(mmx)){ e.preventDefault(); ar.classList.add('mm-off'); ar.__esc=mmx; mmx.querySelector('a').focus(); return }
    if(!$('search').hidden){ e.preventDefault(); closeSearch(); return }
    if(DV.it){ e.preventDefault(); closeByUser(); return }
    if(!$('drawer').hidden){ e.preventDefault(); closeDrawer(); return }
    var sd=$('side'); if(sd && sd.classList.contains('open')){ e.preventDefault(); sideOpen(false); return }
    // a menu panel the pointer opened goes away with Escape too, wherever the focus is
    if(ar && ar.querySelector('.mm:hover')){ e.preventDefault(); ar.classList.add('mm-off') }
    return;
  }
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  if(DV.it && !typing && (e.key==='ArrowLeft' || e.key==='ArrowRight')){ e.preventDefault(); step(e.key==='ArrowLeft'?-1:1); return }
  if(e.key==='Tab'){ trap(e); return }
  if(typing) return;
  if(e.key==='/' && !DV.it){ e.preventDefault(); openSearch() }
});
// keep Tab inside whatever sits on top (inert does this where it is supported; this covers the rest)
function trap(e){
  var sd=$('side'), box=DV.it?$('dv'):!$('search').hidden?$('search').querySelector('.so-in'):!$('drawer').hidden?$('drawer'):(sd && sd.classList.contains('open'))?sd:null;
  if(!box) return;
  var f=[].slice.call(box.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')).filter(function(x){ return x.offsetParent!==null || x===doc.activeElement });
  if(!f.length) return;
  var first=f[0], last=f[f.length-1];
  if(!box.contains(doc.activeElement)){ e.preventDefault(); first.focus(); return }
  if(e.shiftKey && doc.activeElement===first){ e.preventDefault(); last.focus() }
  else if(!e.shiftKey && doc.activeElement===last){ e.preventDefault(); first.focus() }
}

/* ---------------------------------------------------------------- the index's photograph under the pointer */
var FINE=mq('(hover:hover) and (pointer:fine)');
var PV=null, PVK=null, PVX=0, PVY=0, PVR=0;
function pvEl(){ if(PV) return PV; PV=doc.createElement('div'); PV.className='pv'; PV.setAttribute('aria-hidden','true');
  var im=doc.createElement('img'); im.alt=''; im.decoding='async'; PV.appendChild(im); doc.body.appendChild(PV); return PV }
function pvHide(){ if(PV) PV.classList.remove('on'); PVK=null }
function pvMove(){ PVR=0; if(!PV) return; var w=PV.offsetWidth||220, h=PV.offsetHeight||275;
  var x=PVX+32, y=PVY-h*.5; if(x+w>innerWidth-16) x=PVX-32-w; y=Math.max(16,Math.min(innerHeight-h-16,y));
  PV.style.setProperty('--px',Math.round(x)+'px'); PV.style.setProperty('--py',Math.round(y)+'px') }
doc.addEventListener('pointermove',function(e){
  if(!FINE.matches || e.pointerType!=='mouse') return;
  var r=e.target.closest && e.target.closest('.ix .row');
  if(!r || DV.it || !fxOn()){ if(PVK) pvHide(); return }
  PVX=e.clientX; PVY=e.clientY;
  var k=r.getAttribute('data-k');
  if(k!==PVK){ var it=itemOfEl(r), u=it && phs(it)[0]; if(!u){ pvHide(); return }
    var el=pvEl(), im=el.firstChild, first=!el.classList.contains('on'); PVK=k; im.src=okUrl(thumb(it.__a,u,600))||u;
    if(first){ pvMove(); nextFrame(function(){ if(PVK===k) el.classList.add('on') }) } }
  if(!PVR) PVR=requestAnimationFrame(pvMove);
},{passive:true});
doc.addEventListener('pointerleave',pvHide);

/* ---------------------------------------------------------------- a closer look: the large photograph, twice over, under the pointer */
function lensOn(e){
  var m=e.target.closest('.dv-main'), im=$('dvImg'); if(!m || !im || !im.classList.contains('on')) return;
  var ln=m.querySelector('.lens');
  if(!ln){ ln=doc.createElement('span'); ln.className='lens'; ln.setAttribute('aria-hidden','true');
    var z=doc.createElement('img'); z.alt=''; z.decoding='async'; z.src=im.getAttribute('data-hi')||im.currentSrc||im.src; ln.appendChild(z); m.appendChild(ln) }
  lensAt(m,e); m.classList.add('zoom');
}
function lensAt(m,e){ var ln=m.querySelector('.lens'); if(!ln) return; var r=m.getBoundingClientRect();
  ln.style.setProperty('--lx',Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)).toFixed(2)+'%');
  ln.style.setProperty('--ly',Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)).toFixed(2)+'%') }
function lensOff(drop){ var m=doc.querySelector('.dv-main'); if(!m) return; m.classList.remove('zoom'); if(drop){ var ln=m.querySelector('.lens'); if(ln) ln.remove() } }
$('ov').addEventListener('pointermove',function(e){ if(e.pointerType!=='mouse') return; var m=e.target.closest('.dv-main');
  if(m){ if(!m.classList.contains('can') && FINE.matches) m.classList.add('can'); if(m.classList.contains('zoom')) lensAt(m,e) } },{passive:true});
$('ov').addEventListener('pointerleave',function(){ lensOff() },{passive:true});
$('ov').addEventListener('pointerout',function(e){ var m=e.target.closest && e.target.closest('.dv-main'); if(m && !m.contains(e.relatedTarget)) lensOff() },{passive:true});

/* ---------------------------------------------------------------- the head stays; a line under it once the page has moved */
var SCR=0;
function topScroll(){ root.classList.toggle('scrolled', window.scrollY>4) }
window.addEventListener('scroll',function(){ if(!SCR) SCR=requestAnimationFrame(function(){ SCR=0; topScroll(); if(PVK) pvHide() }) },{passive:true});
topScroll();

/* ---------------------------------------------------------------- start */
// the page puts the reader back itself (keepPlace); the browser's own guess lands on the previous view's height
try{ if('scrollRestoration' in history) history.scrollRestoration='manual' }catch(e){}
savedUi();
megaMenus();
ST=readUrl(location.search);
if(ST.view!=='room') writeUrl(false);
if(ST.view==='home'){ AS.forEach(function(a){ load(a).catch(function(){}) }) }
// a brand room opened by its address asks for its own file now, beside the brand index, not after it
if(ST.view==='room' && isB(ST.a)){ var ea=ST.a, ec=window.AbortController?new AbortController():null; EARLYC[ea]=ec;
  EARLY[ea]=getJSON('/BRAND/b/'+slugOf(ea)+'.json',{signal:ec&&ec.signal}); EARLY[ea].catch(function(){}); bengine().catch(function(){}) }
route(null);   // mount, update, open the listing in the address — a brand room once the brand index is here
bidx();        // the brand index, small
// From an archive's room, the other archive's page is asked for quietly (low priority, into the browser's cache) once the
// room has its own data, so switching rooms does not wait on the line; it is read when its room opens. A brand room and
// the brand list ask for neither archive: they show neither.
var SAVE=navigator.connection && navigator.connection.saveData;
function warm(){ if(ST.view!=='room' || isB(ST.a)) return;
  AS.forEach(function(a){ if(a!==ST.a && !DATA[a] && !PEND[a] && !FAIL[a]) req(ARCH[a].path,{low:true},'none').catch(function(){}) }) }
if(!SAVE && ST.view==='room' && !isB(ST.a) && PEND[ST.a]) PEND[ST.a].then(function(){ setTimeout(warm,600) },function(){});
if(DATA.hl || DATA.ccp) drawerMeta();
AS.forEach(function(a){ if(PEND[a]) PEND[a].then(drawerMeta,function(){}) });
})();
