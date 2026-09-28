/* Archive Index — one index over two archives.
   The listings come from the two archive pages on this same site (/helmut-lang/ and /ccp/):
   each page carries its day's data in <script id="__data">, and engine.js reads a listing
   by the same rules that page uses. Nothing here edits a listing. */
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
var REDUCED=mq('(prefers-reduced-motion: reduce)'), WIDE=mq('(min-width:1280px)');
function md(d){ var m=/^\d{4}-(\d{2})-(\d{2})/.exec(d||''); return m?(+m[1])+'/'+(+m[2]):'' }
function kday(d){ var m=/^\d{4}-(\d{2})-(\d{2})/.exec(d||''); return m?(+m[1])+'월 '+(+m[2])+'일':'' }
var KST=null; try{ KST=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}) }catch(e){}
function kst(iso){ var t=Date.parse(iso||''); if(isNaN(t)) return ''; return KST?KST.format(new Date(t)):new Date(t).toLocaleString('ko-KR') }
function clip(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s }

if(!P.hl || !P.ccp){ var m0=$('main'); if(m0) m0.innerHTML='<div class="fatal"><p>불러오지 못함</p><p><a href="/helmut-lang/">Helmut Lang</a> · <a href="/ccp/">Carol Christian Poell</a></p></div>'; return }

/* ---------------------------------------------------------------- archives */
var ARCH={
  hl: {a:'hl', no:'01', name:'Helmut Lang', short:'Helmut Lang', path:'/helmut-lang/', sk:'hlx.saved', vk:'aix.visit.hl',
       ph:'품목·연도·모델', span:'1986—2005', upd:'매일 09:00', sub:'1986—2005'},
  ccp:{a:'ccp', no:'02', name:'Carol Christian Poell', short:'CCP', path:'/ccp/', sk:'ccpx.saved', vk:'aix.visit.ccp',
       ph:'품목·연도·번호', span:'전 시즌', upd:'매일 07:17', sub:'전 시즌'}
};
var AS=['hl','ccp'];

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
function load(a){
  if(DATA[a]) return Promise.resolve(DATA[a]);
  if(PEND[a]) return PEND[a];
  busy(1);
  PEND[a]=fetch(ARCH[a].path,{credentials:'same-origin'})
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text() })
    .then(function(t){ var d=extract(t); if(!d || !Array.isArray(d.items)) throw new Error('shape'); ready(a,d); return d })
    .then(function(d){ busy(-1); delete FAIL[a]; PEND[a]=null; if(ST.item && !DV.it) setTimeout(syncItem,0); return d },
          function(e){ busy(-1); FAIL[a]=e; PEND[a]=null; if(ST.item && !DV.it) setTimeout(syncItem,0); throw e });
  return PEND[a];
}
function ready(a,d){
  var p=P[a]; p.setData(d);
  var byKey={}, byUrl={}, mc={}, live=0, cards=0, tn={A:0,B:0,C:0}, sold=0, gone=0, fresh=0;
  var vals={cat:{},src:{},y:{},motif:{},mark:{}}, cnt={src:{},motif:{}};
  for(var i=0;i<d.items.length;i++){
    var it=d.items[i]; if(!it || typeof it!=='object'){ d.items[i]={t:'',k:0,__bad:1}; continue }
    it.__a=a; it.__i=i; p.prep(it); it.__k=fnv(it.l||('#'+i));
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
  d.__byKey=byKey; d.__byUrl=byUrl; d.__live=live; d.__cards=cards; d.__tn=tn; d.__sold=sold; d.__gone=gone; d.__vals=vals;
  d.__allnew=!!(d.counts && d.counts.items && d.counts.fresh>=d.counts.items);
  d.__fresh=d.__allnew?0:fresh;
  MCOUNT[a]=mc;
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
  visit(a,d);
}
// "since your last visit" — the day before this one on which the archive was opened here
function visit(a,d){
  var today=d.today; if(!today) return;
  var st=lsJSON(ARCH[a].vk);
  if(st && st.date && st.date>today) return;
  var prev=null;
  if(st && st.date===today) prev=st.prev||null;
  else if(st && st.date && st.date<today) prev=st.date;
  lsSet(ARCH[a].vk, JSON.stringify({date:today, prev:prev}));
  var gap=prev?P[a].daysBetween(prev,today):null;
  SINCE[a]=(gap!=null && gap>=2)?prev:null;
  P[a].setSince(SINCE[a]);
}

/* ---------------------------------------------------------------- saved (shared with both archive pages) */
var SAVED={};
function readSaved(a){ var v=lsJSON(ARCH[a].sk); return v && typeof v==='object' && !Array.isArray(v) ? v : {} }
function reloadSaved(){ AS.forEach(function(a){ SAVED[a]=readSaved(a) }) }
reloadSaved();
function curOf(u){ return u && u!=='KRW' ? String(u) : '' }
function isSaved(it){ var m=SAVED[it.__a]; return !!(m && own.call(m,it.l) && m[it.l]) }
function keepMark(it){ var d=DATA[it.__a]; return {k:it.k||0, p:it.p||0, u:curOf(it.u), d:(d&&d.today)||'', g:it.x?1:0} }
function savedN(){ return keys(SAVED.hl||{}).length+keys(SAVED.ccp||{}).length }
function savedChange(it){
  var b=(SAVED[it.__a]||{})[it.l]; if(!b || typeof b!=='object') return null;
  if(it.x) return b.g?null:{gone:true};
  var cu=curOf(it.u); if(curOf(b.u)!==cu) return null;
  var was=cu?b.p:b.k, cur=cu?it.p:it.k;
  if(!(was>0) || !(cur>0)) return null;
  return cur<was ? {drop:true, was:was, cur:cur, u:cu} : null;
}
// opening a saved listing makes its current price the new baseline, as the archive pages do
function ackSaved(it){
  if(!isSaved(it)) return;
  var m=readSaved(it.__a), b=m[it.l], k=keepMark(it); if(!b) return;
  if(typeof b==='object' && b.k===k.k && b.p===k.p && curOf(b.u)===k.u && !!b.g===!!k.g) return;
  m[it.l]=k; if(lsSet(ARCH[it.__a].sk,JSON.stringify(m))) SAVED[it.__a]=m;
}
function toggleSave(it){
  var a=it.__a, m=readSaved(a);
  if(m[it.l]) delete m[it.l]; else m[it.l]=keepMark(it);
  if(!lsSet(ARCH[a].sk,JSON.stringify(m))){ toast('이 브라우저에는 저장할 수 없음'); return }
  SAVED[a]=m; savedUi(); marks(it);
  toast(m[it.l]?'저장함':'저장 해제');
  if(ST.view==='saved' || (ST.view==='room' && ST.F.flag.saved)){ LASTQ=null; update() }
}
function marks(it){
  var on=isSaved(it), sel='[data-a="'+it.__a+'"] [data-save="'+it.__k+'"], .dv[data-a="'+it.__a+'"] [data-save="'+it.__k+'"]';
  var bs=doc.querySelectorAll(sel);
  for(var i=0;i<bs.length;i++){
    bs[i].setAttribute('aria-pressed',String(on)); bs[i].classList.toggle('on',on);
    if(bs[i].classList.contains('btn')) bs[i].textContent=on?'저장 해제':'저장';
  }
}
function savedUi(){
  var n=savedN(), s=$('savedN'); if(s) s.textContent=n?won(n):'';
  var sl=$('savedLink'); if(sl) sl.setAttribute('aria-label',n?'저장 '+won(n)+'건':'저장');
  var dm=$('dmSaved'); if(dm) dm.textContent=n?won(n):'';
}
window.addEventListener('storage',function(e){
  if(e.key===ARCH.hl.sk || e.key===ARCH.ccp.sk || e.key===null){
    reloadSaved(); savedUi();
    var bs=doc.querySelectorAll('[data-save]');
    for(var i=0;i<bs.length;i++){ var it=itemOfEl(bs[i]); if(it){ var on=isSaved(it); bs[i].classList.toggle('on',on); bs[i].setAttribute('aria-pressed',String(on));
      if(bs[i].classList.contains('btn')) bs[i].textContent=on?'저장 해제':'저장' } }
    if(ST.view==='saved'){ LASTQ=null; update() }
  }
});

/* ---------------------------------------------------------------- state and address */
function blankF(){ return {y:{},cat:{},motif:{},price:{},src:{},cert:{},mark:{},flag:{},size:'',q:''} }
var SORT=[['new','신규 순'],['k-','가격 높은 순'],['k+','가격 낮은 순'],['y+','연도 오래된 순'],['y-','연도 최신 순'],
          ['drop','가격 내린 순'],['age','오래 남은 순'],['rel','관련도 순']];
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
  var a=formVal(q.archive).trim().toLowerCase(), v=formVal(q.view).trim().toLowerCase();
  if(a==='hl' || a==='ccp'){ s.view='room'; s.a=a }
  if(v==='saved' || v==='about'){ s.view=v; s.a=null }
  if(s.view==='room'){
    var p=P[s.a], F=s.F;
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
    keys(F[g[0]]).forEach(function(v){ if(!V[g[1]][v]) delete F[g[0]][v] }) });
  if(F.flag.gone && !d.__gone) delete F.flag.gone;
  if(F.flag.sold && !d.__sold) delete F.flag.sold;
  if(F.flag.since && !SINCE[st.a]) delete F.flag.since;
  if(F.flag['new'] && d.__allnew) delete F.flag['new'];
}
function qsOf(st, origin){
  var p=[], enc=function(a){ return a.map(function(x){ return encodeURIComponent(x) }).join(',') };
  if(!origin){
    if(st.view==='saved' || st.view==='about') p.push('view='+st.view);
    if(st.view==='room') p.push('archive='+st.a);
  }
  if(st.view==='room'){
    var pr=P[st.a], F=st.F;
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
  if(url===location.pathname+location.search) return;
  try{ history[push?'pushState':'replaceState']({aix:1},'',url) }catch(e){}
}
function filterKey(){ var s={view:ST.view, a:ST.a, F:ST.F, sort:ST.sort, item:null}; return qsOf(s,false) }
function copyF(F){ var o=blankF(); ORG.concat(['flag']).forEach(function(g){ for(var k in F[g]) if(own.call(F[g],k) && F[g][k]) o[g][k]=1 }); o.size=F.size; o.q=F.q; return o }

/* ---------------------------------------------------------------- routing */
function go(st, push, after){ var prev=ST; ST=st; tidy(ST); if(push!==false) writeUrl(true); route(prev, after) }
function route(prev, after){
  var key=ST.view+':'+(ST.a||'');
  if(prev && key===MOUNTED){
    if(filterKey()!==LASTQ) update();
    syncItem(); if(after) after(); return;
  }
  var run=function(){ mount(); update(); syncItem(); if(prev){ window.scrollTo(0,0); focusHead() } if(after) after() };
  if(prev && !REDUCED.matches && doc.startViewTransition){ try{ doc.startViewTransition(run) }catch(e){ run() } }
  else run();
}
window.addEventListener('popstate',function(){ var prev=ST; ST=readUrl(location.search); tidy(ST); route(prev) });

function focusHead(){ var h=$('vh'); if(h){ try{ h.focus({preventScroll:true}) }catch(e){ h.focus() } } }

function roomOf(){ return ST.view==='room' ? ST.a : 'home' }
function setRoom(r){
  root.setAttribute('data-room',r);
  var dark=r==='ccp';
  root.style.colorScheme=dark?'dark':'light';
  var tc=doc.querySelector('meta[name="theme-color"]'); if(tc) tc.setAttribute('content',dark?'#121110':'#fbfaf8');
}
function title(){
  var t='Archive Index';
  if(ST.view==='room') t=ARCH[ST.a].name+' — '+t;
  else if(ST.view==='saved') t='저장 — '+t;
  else if(ST.view==='about') t='소개 — '+t;
  else t='Archive Index — Helmut Lang · Carol Christian Poell';
  if(DV.it) t=clip(DV.it.t,60)+' — '+ARCH[DV.it.__a].name;
  doc.title=t;
}
function navUi(){
  var cur=ST.view==='room'?ST.a:ST.view;
  var ls=doc.querySelectorAll('[data-nav]');
  for(var i=0;i<ls.length;i++){ var on=ls[i].getAttribute('data-nav')===cur;
    if(on) ls[i].setAttribute('aria-current','page'); else ls[i].removeAttribute('aria-current') }
}

function mount(){
  MOUNTED=ST.view+':'+(ST.a||''); LASTQ=null; GEN++;
  closeDetail(true);
  setRoom(roomOf());
  var m=$('main');
  if(ST.view==='room') m.innerHTML=roomShell(ST.a);
  else if(ST.view==='saved') m.innerHTML=savedShell();
  else if(ST.view==='about') m.innerHTML=aboutShell();
  else m.innerHTML=homeShell();
  if(ST.view==='room') bindRoom();
  navUi(); title();
}
function update(){
  var gen=GEN;
  if(ST.view==='room') return roomUpdate(gen);
  if(ST.view==='saved') return savedUpdate(gen);
  if(ST.view==='about') return aboutUpdate(gen);
  return homeUpdate(gen);
}
function refresh(){ LASTQ=null; update() }

/* ---------------------------------------------------------------- pieces */
function thumb(a,u,w){ try{ return P[a].thumb(u,w) }catch(e){ return u } }
function imgTag(a,u,w,o){
  o=o||{}; u=okUrl(u); if(!u) return '';
  var t=okUrl(thumb(a,u,w))||u;
  return '<img src="'+esc(t)+'"'+(t!==u?' data-full="'+esc(u)+'"':'')+' alt="'+esc(o.alt||'')+'"'+
    (o.eager?' fetchpriority="high"':' loading="lazy"')+' decoding="async"'+(o.id?' id="'+o.id+'"':'')+'>';
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
  var d=DATA[a]; return d && k && own.call(d.__byKey,k) ? d.__byKey[k] : null;
}
function subLine(it){
  var p=P[it.__a], auc=p.aucText(it), seen=p.seenText(it);
  return [ it.z?esc(it.z):'',
    it.mc?'<span class="mc">'+esc(it.mc)+'</span>':'',
    esc(it.r),
    it.g>1?'같은 상품명 '+won(it.g)+'곳':'',
    auc?'<span class="ab">'+esc(auc)+'</span>':'',
    it.so?esc(md(it.so)):(seen?esc(seen):'')
  ].filter(Boolean).join(' · ');
}
function card(it,o){
  o=o||{}; var a=it.__a, A=ARCH[a], p=P[a], k=it.__k, on=isSaved(it);
  var ph=p.photosOf(it), ch=o.change?savedChange(it):null;
  return '<article class="card'+(it.x?' gone':'')+(it.so?' rec':'')+'" data-a="'+a+'" data-k="'+k+'">'+
    '<div class="ph" data-open="'+k+'">'+imgTag(a,ph[0],600,{eager:o.eager})+'</div>'+
    '<button type="button" class="sv'+(on?' on':'')+'" data-save="'+k+'" aria-pressed="'+on+'" aria-label="저장 · '+esc(clip(it.t,40))+'"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4.2-5.5 4.2z"/></svg></i></button>'+
    '<div class="cap">'+
      '<div class="fl">'+(o.tag?'<span class="at">'+A.no+' '+esc(A.short)+'</span>':'')+p.flagsHtml(it)+'</div>'+
      '<h3 class="t"><a href="/?archive='+a+'&amp;item='+k+'" data-open="'+k+'">'+esc(it.t)+'</a></h3>'+
      p.priceHtml(it,false)+
      (ch?'<div class="chg">'+(ch.gone?'목록에서 사라짐':'저장 뒤 내림 '+esc(money(ch.was,ch.u))+' → '+esc(money(ch.cur,ch.u)))+'</div>':'')+
      '<div class="sub">'+subLine(it)+'</div>'+
    '</div></article>';
}
function skel(n){ var h=''; for(var i=0;i<n;i++) h+='<div class="card sk"><div class="ph"></div><div class="cap"><i></i><i></i><i></i></div></div>'; return h }
function errBox(a,retry){
  return '<div class="err" role="alert"><p class="err-t">'+esc(ARCH[a].name)+' · 불러오지 못함</p>'+
    '<p class="err-a"><button type="button" class="btn" data-retry="'+a+'">다시 시도</button> '+
    '<a class="lnk" href="'+ARCH[a].path+'">원본 인덱스</a></p></div>';
}
function toast(t){ var el=$('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(function(){ el.classList.remove('on') },1800) }

/* ---------------------------------------------------------------- home */
function homeShell(){
  return '<h1 class="sr" id="vh" tabindex="-1">Archive Index</h1>'+
  '<section class="rooms" aria-label="아카이브">'+AS.map(function(a){ var A=ARCH[a];
    return '<a class="room r-'+a+'" href="/?archive='+a+'" data-room-link="'+a+'">'+
      '<span class="room-top"><span class="no">'+A.no+'</span><span class="sp" id="hs-'+a+'">'+esc(A.span)+'</span></span>'+
      '<span class="room-name">'+A.name.split(' ').map(function(w){ return '<span>'+esc(w)+'</span>' }).join(' ')+'</span>'+
      '<span class="room-foot">'+
        '<span class="room-stat" id="st-'+a+'"><span class="sk w60"></span></span>'+
        '<span class="room-mos" id="mo-'+a+'" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'+
        '<span class="btn room-go">들어가기<span class="arr" aria-hidden="true">→</span></span>'+
      '</span></a>' }).join('')+
  '</section>'+
  '<section class="today" id="today" aria-labelledby="todayH">'+
    '<div class="sh"><h2 id="todayH">오늘 들어온 매물</h2><span class="sh-d" id="todayD"></span><span class="sh-l" id="todayL"></span></div>'+
    '<div class="grid g-today" id="tgrid">'+skel(6)+'</div>'+
  '</section>';
}
function mosaic(a,d){
  var p=P[a], pool=d.items.filter(function(it){ return !it.x && !it.so && it.i });
  pool.sort(cmpNew);
  var pick=[], seen={};
  for(var i=0;i<pool.length && pick.length<4;i++){ var u=pool[i].i; if(seen[u]) continue; seen[u]=1; pick.push(pool[i]) }
  return pick.map(function(it){ return '<i>'+imgTag(a,it.i,300)+'</i>' }).join('')+(pick.length<4?new Array(5-pick.length).join('<i></i>'):'');
}
function statHtml(a,d){
  var s=[['매물',won(d.__cards)]];
  if(!d.__allnew) s.push(['신규',won(d.__fresh)]);
  s.push(['연도 표기',won(d.__tn.A)]);
  if(d.__sold) s.push(['판매 기록',won(d.__sold)]);
  return s.map(function(x){ return '<span><em>'+x[0]+'</em><b>'+x[1]+'</b></span>' }).join('')+
    '<span class="upd">'+esc(kst(d.built))+'</span>';
}
function homeUpdate(gen){
  AS.forEach(function(a){
    var paint=function(){ if(gen!==GEN) return; var d=DATA[a];
      var st=$('st-'+a), mo=$('mo-'+a);
      if(st) st.innerHTML=statHtml(a,d);
      if(mo){ mo.innerHTML=mosaic(a,d); bindImgs(mo) }
      todayUpdate(gen); strip();
    };
    if(DATA[a]) paint();
    else load(a).then(paint,function(){ if(gen!==GEN) return; var st=$('st-'+a); if(st) st.innerHTML='<span class="bad">불러오지 못함</span>'; todayUpdate(gen) });
  });
}
function cmpNew(a,b){ return (b.n||0)-(a.n||0) || (a.f===b.f?0:(b.f||'')>(a.f||'')?1:-1) || b.k-a.k }
var TODAYLIST=[];
function todayUpdate(gen){
  if(gen!==GEN) return;
  var g=$('tgrid'); if(!g) return;
  var done=AS.every(function(a){ return DATA[a] || FAIL[a] }); if(!done) return;
  var per={}, total={};
  AS.forEach(function(a){ var d=DATA[a]; if(!d){ per[a]=[]; total[a]=0; return }
    var l=d.items.filter(function(it){ return it.n && !it.x && !it.so && !d.__allnew });
    l.sort(cmpNew); per[a]=l; total[a]=l.length });
  var want={hl:8, ccp:4}, out=[];
  AS.forEach(function(a){ out=out.concat(per[a].slice(0,want[a])) });
  AS.forEach(function(a){ if(out.length<12) out=out.concat(per[a].slice(want[a], want[a]+(12-out.length))) });
  TODAYLIST=out;
  var d0=DATA.hl||DATA.ccp;
  $('todayD').textContent=d0?kday(d0.today):'';
  $('todayL').innerHTML=AS.map(function(a){ return DATA[a]?'<a href="/?archive='+a+'&amp;show=new">'+esc(ARCH[a].name)+' <b>'+won(total[a])+'</b></a>':'' }).join('');
  var bad=AS.filter(function(a){ return FAIL[a] }).map(function(a){ return esc(ARCH[a].name)+' 불러오지 못함' });
  if(!out.length){ g.classList.add('none'); g.innerHTML='<p class="none-t">'+(bad.length?bad.join(' · '):'오늘 들어온 매물 없음')+'</p>'; return }
  g.classList.remove('none');
  g.innerHTML=out.map(function(it,i){ return card(it,{tag:true, eager:i<2}) }).join('');
  bindImgs(g);
}
function strip(){
  var el=$('strip'); if(!el) return;
  var d0=DATA.hl||DATA.ccp; if(!d0) return;
  var date=(d0.dateKo||'').replace(/^\d{4}년\s*/,'');
  var h='<span class="strip-d">'+esc(date||kday(d0.today))+'</span>';
  AS.forEach(function(a){ var d=DATA[a]; if(!d) return;
    h+='<a href="/?archive='+a+(d.__allnew?'':'&amp;show=new')+'"><span class="l">'+esc(ARCH[a].name)+'</span><span class="s">'+esc(ARCH[a].short==='CCP'?'CCP':'HL')+'</span>'+
      (d.__allnew?' 첫 호':' 신규 <b>'+won(d.__fresh)+'</b>')+'</a>' });
  el.innerHTML=h;
  var dm={hl:$('dmHl'), ccp:$('dmCcp')};
  AS.forEach(function(a){ if(dm[a] && DATA[a]) dm[a].textContent='매물 '+won(DATA[a].__cards) });
}

/* ---------------------------------------------------------------- room */
function roomShell(a){
  var A=ARCH[a], p=P[a];
  return '<section class="rh">'+
      '<div class="rh-top"><span class="no">'+A.no+'</span><span class="sp">'+esc(A.span)+'</span></div>'+
      '<h1 class="rt" id="vh" tabindex="-1">'+esc(A.name)+'</h1>'+
      '<p class="rm" id="rm"><span class="sk w60"></span></p>'+
      '<p class="since" id="since" hidden></p>'+
    '</section>'+
    '<div class="bar" id="bar"><div class="bar-in">'+
      '<div class="cats" id="cats" role="group" aria-label="분류"></div>'+
      '<div class="tools">'+
        '<div class="qf"><svg class="ico-s" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M15.2 15.2 20.5 20.5" stroke="currentColor" stroke-width="1.4"/></svg>'+
          '<input id="rq" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="'+esc(A.ph)+'" aria-label="'+esc(A.name)+' 안에서 찾기">'+
          '<button type="button" class="qx" id="rqx" aria-label="검색어 지우기" hidden><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5"/></svg></button></div>'+
        '<button type="button" class="ftog" id="ftog" aria-expanded="false" aria-controls="side">필터<span class="n" id="fn"></span></button>'+
        '<div class="selw"><select id="sort" aria-label="정렬">'+SORT.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]==='rel'?' hidden':'')+'>'+s[1]+'</option>' }).join('')+'</select></div>'+
      '</div>'+
    '</div></div>'+
    '<div class="body">'+
      '<aside class="side" id="side" aria-label="필터">'+
        '<div class="side-top"><h2>필터</h2><button type="button" class="ico" id="sideX" aria-label="필터 닫기"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.3"/></svg></button></div>'+
        '<div class="side-in">'+
          '<section class="fg"><h3>'+esc(p.GRP.y)+'</h3><div class="yrs" id="f-y"></div></section>'+
          '<section class="fg"><h3>'+esc(p.GRP.cert)+'</h3><ul class="ops" id="f-cert"></ul></section>'+
          '<section class="fg" id="g-motif"><h3>'+esc(p.GRP.motif)+'</h3><ul class="ops cols" id="f-motif"></ul></section>'+
          '<section class="fg"><h3>'+esc(p.GRP.src)+'</h3><ul class="ops" id="f-src"></ul></section>'+
          '<section class="fg"><h3>'+esc(p.GRP.price)+'</h3><ul class="ops" id="f-price"></ul></section>'+
          '<section class="fg" id="g-mark"><h3>'+esc(p.GRP.mark)+'</h3><ul class="ops" id="f-mark"></ul></section>'+
          '<section class="fg"><h3>표시</h3><ul class="ops" id="f-flag"></ul></section>'+
          '<section class="fg"><h3><label for="fsize">사이즈</label></h3><input class="fsize" id="fsize" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="48 · M · 32"></section>'+
        '</div>'+
        '<div class="side-foot"><button type="button" class="btn ghost" id="clearAll">모두 해제</button><button type="button" class="btn solid" id="sideDone">보기</button></div>'+
      '</aside>'+
      '<div class="res">'+
        '<div class="applied" id="applied" hidden></div>'+
        '<h2 class="sr">목록</h2><div class="count" id="count" role="status" aria-live="polite"></div>'+
        '<div class="grid" id="grid">'+skel(12)+'</div>'+
        '<div class="more" id="more" hidden><button type="button" class="btn" id="moreBtn">더 보기</button></div>'+
        '<div class="empty" id="empty" hidden></div>'+
        '<section class="seek" id="seek" aria-label="다른 곳에서 찾기" hidden></section>'+
        '<p class="orig" id="origP" hidden><a id="orig" href="'+A.path+'">이 조건으로 원본 인덱스 열기</a></p>'+
      '</div>'+
    '</div>';
}
function sideOpen(on){
  var s=$('side'), t=$('ftog'); if(!s||!t) return;
  s.classList.toggle('open',on); t.setAttribute('aria-expanded',String(on));
  root.classList.toggle('lock-side',on && !WIDE.matches);
  if(on && !WIDE.matches){ var x=$('sideX'); if(x) x.focus() }
  else if(!on && doc.activeElement && s.contains(doc.activeElement)) t.focus();
}
var qTimer=null, SORTB4=null;
function bindRoom(){
  $('cats').addEventListener('click',function(e){
    var b=e.target.closest('[data-cat]'); if(!b) return;
    var v=b.getAttribute('data-cat'), F=copyF(ST.F); F.cat={}; if(v) F.cat[v]=1;
    go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null});
  });
  $('side').addEventListener('click',function(e){
    var b=e.target.closest('[data-g]'); if(!b) return;
    var g=b.getAttribute('data-g'), v=b.getAttribute('data-v'), F=copyF(ST.F);
    if(F[g][v]) delete F[g][v]; else F[g][v]=1;
    FOCUS={g:g, v:v};
    go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null});
  });
  $('applied').addEventListener('click',offClick);
  $('empty').addEventListener('click',offClick);
  $('since').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return;
    var F=copyF(ST.F); if(F.flag.since) delete F.flag.since; else F.flag.since=1; go({view:'room', a:ST.a, F:F, sort:ST.sort, item:null}) });
  $('ftog').addEventListener('click',function(){ sideOpen(!$('side').classList.contains('open')) });
  $('sideX').addEventListener('click',function(){ sideOpen(false) });
  $('sideDone').addEventListener('click',function(){ sideOpen(false); var g=$('grid'); if(g && g.getBoundingClientRect().top<0) window.scrollTo(0, window.scrollY+g.getBoundingClientRect().top-120) });
  $('clearAll').addEventListener('click',function(){ clearAll() });
  $('sort').addEventListener('change',function(){ var st=cloneST(); st.sort=this.value; SORTB4=null; ST=st; writeUrl(false); roomUpdate(GEN) });
  var q=$('rq');
  q.addEventListener('input',function(){
    var v=q.value.replace(/\s+/g,' ').trim().toLowerCase().slice(0,80);
    $('rqx').hidden=!q.value;
    clearTimeout(qTimer);
    qTimer=setTimeout(function(){
      if(v===ST.F.q) return;
      var st=cloneST(); st.F.q=v; st.item=null;
      if(v && st.sort!=='rel'){ SORTB4=st.sort; st.sort='rel' }
      if(!v && st.sort==='rel'){ st.sort=SORTB4||'new'; SORTB4=null }
      ST=st; writeUrl(false); roomUpdate(GEN);
    },180);
  });
  q.addEventListener('keydown',function(e){ if(e.key==='Enter'){ q.blur() } if(e.key==='Escape' && q.value){ e.stopPropagation(); clearQ() } });
  $('rqx').addEventListener('click',function(){ clearQ(); q.focus() });
  $('fsize').addEventListener('input',function(){
    var v=this.value.trim().toLowerCase().slice(0,24); clearTimeout(qTimer);
    qTimer=setTimeout(function(){ if(v===ST.F.size) return; var st=cloneST(); st.F.size=v; st.item=null; ST=st; writeUrl(false); roomUpdate(GEN) },180);
  });
  $('moreBtn').addEventListener('click',function(){ paint(false) });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !$('more').hidden && SHOWN>0 && SHOWN<VIEW.length) paint(false) }) },{rootMargin:'900px 0px'});
    io.observe($('more'));
  }
  var c=$('cats'), endp=function(){ c.classList.toggle('end', c.scrollLeft+c.clientWidth>=c.scrollWidth-4) };
  c.addEventListener('scroll',endp,{passive:true}); setTimeout(endp,0);
}
function clearQ(){ clearTimeout(qTimer); var q=$('rq'); if(q) q.value=''; var x=$('rqx'); if(x) x.hidden=true;
  if(!ST.F.q) return; var st=cloneST(); st.F.q=''; if(st.sort==='rel'){ st.sort=SORTB4||'new'; SORTB4=null } st.item=null; ST=st; writeUrl(false); roomUpdate(GEN) }
function cloneST(){ return {view:ST.view, a:ST.a, F:copyF(ST.F), sort:ST.sort, item:ST.item} }
function clearAll(){ clearTimeout(qTimer); var F=blankF(); SORTB4=null; go({view:'room', a:ST.a, F:F, sort:ST.sort==='rel'?'new':ST.sort, item:null}) }
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
function flagLbl(a,f){ return P[a].FLAGLBL[f]||f }
function roomUpdate(gen){
  var a=ST.a;
  if(!DATA[a]){
    $('grid').innerHTML=skel(12);
    load(a).then(function(){ if(gen!==GEN) return; tidy(ST); writeUrl(false); roomUpdate(gen); syncItem() },
      function(){ if(gen!==GEN) return; $('grid').innerHTML=''; $('empty').hidden=false; $('empty').innerHTML=errBox(a); $('rm').textContent='' });
    return;
  }
  LASTQ=filterKey();
  var d=DATA[a], p=P[a], F=ST.F;
  compute(a);
  // head
  var tn=d.__tn, cl=p.CERT, st=function(l,n,x){ return '<span class="st">'+l+' <b>'+won(n)+'</b>'+(x||'')+'</span>' };
  var bits=[st('매물',d.__cards,d.__live!==d.__cards?'<span class="basis">판매처 기준 '+won(d.__live)+'</span>':''), st(esc(cl.A),tn.A), st(esc(cl.B),tn.B), st(esc(cl.C),tn.C)];
  if(!d.__allnew) bits.push(st('신규',d.__fresh));
  if(d.__sold) bits.push(st('판매 기록',d.__sold));
  bits.push('<span class="st upd">'+esc(kst(d.built))+'</span>');
  $('rm').innerHTML=bits.join('<i class="dot" aria-hidden="true">·</i>');
  var sn=$('since');
  if(SINCE[a]){ var ns=0; d.items.forEach(function(it){ if(!it.x && !it.so && it.f && it.f>SINCE[a]) ns++ });
    sn.hidden=!ns; sn.innerHTML=ns?'<button type="button" aria-pressed="'+!!F.flag.since+'">지난 방문 '+esc(md(SINCE[a]))+' 이후 <b>'+won(ns)+'</b></button>':'' }
  else sn.hidden=true;
  // search box and sort mirror the state (a link or the back button may have changed them)
  var q=$('rq'); if(q && doc.activeElement!==q && q.value.trim().toLowerCase()!==F.q) q.value=F.q;
  if(q) $('rqx').hidden=!q.value;
  var fs=$('fsize'); if(fs && doc.activeElement!==fs && fs.value.trim().toLowerCase()!==F.size) fs.value=F.size;
  var so=$('sort'); if(so){ so.value=ST.sort; var ro=so.querySelector('option[value="rel"]'); if(ro) ro.hidden=!F.q }
  cats(a); facets(a); applied(a); countLine(a); paint(true); empty(a); seek(a);
  var o=$('orig'); if(o){ var oq=qsOf(ST,true); o.href=ARCH[a].path+(oq?'?'+oq:''); $('origP').hidden=false }
  var fn=$('fn'), nf=0; ['y','motif','price','src','cert','mark','flag'].forEach(function(g){ nf+=keys(F[g]).length }); if(F.size) nf++;
  if(fn) fn.textContent=nf?won(nf):'';
}
function cats(a){
  var d=DATA[a], F=ST.F, fc=FACET.cat, sel=keys(F.cat), tot=0;
  d.__order.cat.forEach(function(c){ tot+=fc[c]||0 });
  var h='<button type="button" class="cat" data-cat="" aria-pressed="'+(!sel.length)+'">전체<span class="n">'+won(tot)+'</span></button>';
  d.__order.cat.forEach(function(c){ var on=!!F.cat[c], n=fc[c]||0;
    h+='<button type="button" class="cat'+(n||on?'':' z')+'" data-cat="'+esc(c)+'" aria-pressed="'+on+'">'+esc(c)+'<span class="n">'+won(n)+'</span></button>' });
  $('cats').innerHTML=h;
}
function opt(g,v,label,n,on,cls){
  return '<li><button type="button" class="op'+(on?' on':'')+(!n&&!on?' z':'')+(cls?' '+cls:'')+'" data-g="'+g+'" data-v="'+esc(v)+'" aria-pressed="'+on+'">'+
    '<span class="op-l">'+label+'</span><span class="op-n">'+won(n)+'</span></button></li>';
}
function facets(a){
  var d=DATA[a], p=P[a], F=ST.F, fc=FACET, O=d.__order;
  var act=doc.activeElement, keep=FOCUS || (act && act.getAttribute && act.hasAttribute('data-g') ? {g:act.getAttribute('data-g'), v:act.getAttribute('data-v')} : null);
  FOCUS=null;
  // years: one button per year, and one for none
  var yh='';
  O.y.forEach(function(y){ var on=!!F.y[y], n=fc.y[y]||0;
    yh+='<button type="button" class="yb'+(on?' on':'')+(!n&&!on?' z':'')+(y==='none'?' none':'')+'" data-g="y" data-v="'+y+'" aria-pressed="'+on+'" aria-label="'+(y==='none'?'연도 미표기':y+'년')+' '+won(n)+'건">'+
      '<span>'+(y==='none'?'미표기':y)+'</span><i>'+won(n)+'</i></button>' });
  $('f-y').innerHTML=yh;
  $('f-cert').innerHTML=O.cert.map(function(c){ return opt('cert',c,esc(p.CERT[c]),fc.cert[c]||0,!!F.cert[c]) }).join('');
  $('g-motif').hidden=!O.motif.length;
  $('f-motif').innerHTML=O.motif.map(function(m){ return opt('motif',m,esc(p.motifLbl(m)),fc.motif[m]||0,!!F.motif[m]) }).join('');
  $('f-src').innerHTML=O.src.map(function(s){ var seen=SRCSEEN[a][s], stop=seen && d.today && seen<d.today;
    return opt('src',s,esc(s)+(stop?'<small>'+esc(md(seen))+' 이후 수집 안 됨</small>':''),fc.src[s]||0,!!F.src[s]) }).join('');
  $('f-price').innerHTML=O.price.map(function(b){ return opt('price',b,esc(b),fc.price[b]||0,!!F.price[b]) }).join('');
  $('g-mark').hidden=!O.mark.length;
  $('f-mark').innerHTML=O.mark.map(function(m){ return opt('mark',m,esc(p.MARKLBL[m]||m),fc.mark[m]||0,!!F.mark[m]) }).join('');
  $('f-flag').innerHTML=flagOpts(a).map(function(f){ return opt('flag',f,esc(f==='since'?'지난 방문 '+md(SINCE[a])+' 이후':flagLbl(a,f)),FLAGN[f]||0,!!F.flag[f]) }).join('');
  var sd=$('sideDone'); if(sd) sd.textContent=won(VIEW.length)+'건 보기';
  if(keep){ var b=$('side').querySelector('[data-g="'+keep.g+'"][data-v="'+cssv(keep.v)+'"]'); if(b) b.focus({preventScroll:true}) }
}
function cssv(v){ return String(v).replace(/["\\]/g,'\\$&') }
function tokLabel(a,g,v){
  var p=P[a];
  if(g==='cert') return p.CERT[v]||v;
  if(g==='motif') return p.motifLbl(v);
  if(g==='mark') return p.MARKLBL[v]||v;
  if(g==='flag') return v==='since'?'지난 방문 이후':flagLbl(a,v);
  if(g==='y') return v==='none'?'연도 미표기':v;
  return v;
}
function tokens(a){
  var F=ST.F, t=[];
  ORG.concat(['flag']).forEach(function(g){
    var vs=keys(F[g]);
    if(g==='y'){ pack(vs).forEach(function(r){ t.push({g:'y', v:r, l:r==='none'?'연도 미표기':r.replace('-','–')}) }); return }
    vs.forEach(function(v){ t.push({g:g, v:v, l:tokLabel(a,g,v)}) });
  });
  if(F.size) t.push({g:'size', v:'', l:'사이즈 '+F.size});
  if(F.q) t.push({g:'q', v:'', l:'“'+F.q+'”'});
  return t;
}
function offY(F,r){ var m=/^(\d{4})-(\d{4})$/.exec(r); if(m){ for(var y=+m[1];y<=+m[2];y++) delete F.y[String(y)] } else delete F.y[r] }
function applied(a){
  var t=tokens(a), el=$('applied');
  el.hidden=!t.length;
  el.innerHTML=t.map(function(x){ return '<button type="button" class="tok" data-off="'+x.g+'" data-v="'+esc(x.v)+'" aria-label="'+esc(x.l)+' 빼기">'+esc(x.l)+'<span aria-hidden="true">×</span></button>' }).join('')+
    (t.length>1?'<button type="button" class="tok all" data-off="all">모두 해제</button>':'');
}
function medianOf(a){ if(!a.length) return 0; var s=a.slice().sort(function(x,y){ return x-y }), m=s.length>>1; return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2) }
function countLine(a){
  var F=ST.F, n=VIEW.length, narrowed=tokens(a).length>0;
  var h='<span class="cn"><b>'+won(n)+'</b>건</span>';
  if(narrowed && n>1){
    var ks=VIEW.filter(function(it){ return !it.x && !it.so && it.k>0 }).map(function(it){ return it.k });
    if(ks.length>1){ var lo=Math.min.apply(null,ks), hi=Math.max.apply(null,ks);
      h+='<span class="rng">가격 ₩'+won(lo)+'—₩'+won(hi)+' · 중앙값 ₩'+won(medianOf(ks))+'</span>' }
  }
  if(F.q){ var p=P[a], QT=p.getQT(); if(!QT.length) h+='<span class="rng">브랜드 이름만으로는 거르지 않음</span>' }
  $('count').innerHTML=h;
}
function paint(reset){
  var g=$('grid'); if(!g) return;
  if(reset){ g.innerHTML=''; SHOWN=0 }
  var end=Math.min(VIEW.length,SHOWN+BATCH), h='';
  for(var i=SHOWN;i<end;i++) h+=card(VIEW[i],{eager:reset && i<4});
  g.insertAdjacentHTML('beforeend',h); SHOWN=end;
  bindImgs(g);
  var mo=$('more'); mo.hidden=SHOWN>=VIEW.length;
  $('moreBtn').textContent='더 보기 · '+won(VIEW.length-SHOWN)+'건';
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
  var t=tokens(a), h='<p class="empty-t">결과 없음</p>';
  if(t.length){ h+='<div class="empty-o">'+t.map(function(x){ var n=countWithout(a,x.g,x.v);
      return '<button type="button" class="btn ghost" data-off="'+x.g+'" data-v="'+esc(x.v)+'">'+esc(x.l)+' 빼기 · '+won(n)+'건</button>' }).join('')+'</div>' }
  e.innerHTML=h; e.hidden=false;
}
function seek(a){
  var el=$('seek'), p=P[a], F=ST.F; if(!el) return;
  p.setF(F); p.setQuery(F.q);
  var parts=p.seekParts(), shown=[], rows=[];
  parts.forEach(function(x){ if(x.row){ if(rows.indexOf(x.row)>=0) return; rows.push(x.row) }
    var w=x.typed || (x.row?(p.word(x.row,'ko')||p.word(x.row,'en')||p.word(x.row,'ja')):x.raw); if(w && shown.indexOf(w)<0) shown.push(w) });
  var h='<h2 class="seek-h">다른 곳에서 찾기</h2><p class="seek-q">'+esc(ARCH[a].name)+(shown.length?' · '+esc(shown.join(' · ')):' 전체')+'</p><div class="seek-m">';
  var mk=null;
  p.SEEK.forEach(function(sk){
    if(sk[0]!==mk){ if(mk) h+='</div></div>'; mk=sk[0]; h+='<div class="mkt"><span class="mkt-n">'+esc(mk)+'</span><div class="mkt-l">' }
    var qq=p.seekQuery(parts,sk[2]), url=okUrl(sk[3](qq,qq===p.SEEKBRAND[sk[2]]));
    if(url) h+='<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(sk[1])+(sk[4]?'<small>'+esc(sk[4])+'</small>':'')+'</a>';
  });
  el.innerHTML=h+'</div></div></div>'; el.hidden=false;
}

/* ---------------------------------------------------------------- saved */
function savedShell(){
  return '<section class="vh"><h1 id="vh" tabindex="-1">저장</h1><p class="rm" id="svm"><span class="sk w40"></span></p></section>'+
    '<div id="svb">'+AS.map(function(a){ return '<section class="sg" id="sg-'+a+'" aria-labelledby="sgh-'+a+'"><h2 class="sg-h" id="sgh-'+a+'"><span class="no">'+ARCH[a].no+'</span>'+esc(ARCH[a].name)+'<span class="n" id="sgn-'+a+'"></span></h2>'+
      '<div class="grid" id="sgg-'+a+'"></div><ul class="miss" id="sgm-'+a+'" hidden></ul></section>' }).join('')+'</div>';
}
var SAVEDLIST=[];
function savedUpdate(gen){
  var pending=AS.filter(function(a){ return !DATA[a] && !FAIL[a] });
  pending.forEach(function(a){ load(a).then(function(){ if(gen===GEN) savedUpdate(gen) },function(){ if(gen===GEN) savedUpdate(gen) }) });
  var total=0; SAVEDLIST=[];
  AS.forEach(function(a){
    var m=SAVED[a]||{}, urls=keys(m), d=DATA[a], g=$('sgg-'+a), miss=$('sgm-'+a), sec=$('sg-'+a);
    total+=urls.length;
    $('sgn-'+a).textContent=won(urls.length);
    sec.hidden=!urls.length;
    if(!urls.length){ g.innerHTML=''; miss.hidden=true; return }
    if(!d){ g.innerHTML=FAIL[a]?errBox(a):skel(Math.min(4,urls.length)); miss.hidden=true; return }
    var have=[], lost=[];
    urls.forEach(function(u){ var it=d.__byUrl[u]; if(it) have.push(it); else lost.push(u) });
    have.sort(function(x,y){ var bx=m[x.l], by=m[y.l]; return String((by&&by.d)||'').localeCompare(String((bx&&bx.d)||'')) || y.k-x.k });
    SAVEDLIST=SAVEDLIST.concat(have);
    g.innerHTML=have.map(function(it,i){ return card(it,{change:true, eager:i<2}) }).join('');
    bindImgs(g);
    miss.hidden=!lost.length;
    miss.innerHTML=lost.map(function(u){ var ok=okUrl(u), host=''; try{ host=new URL(u).host.replace(/^www\./,'') }catch(e){}
      return '<li><span class="miss-l">이번 호에 없음</span><span class="miss-u">'+esc(host)+'</span>'+
        (ok?'<a href="'+esc(ok)+'" target="_blank" rel="noopener noreferrer">판매 페이지</a>':'')+
        '<button type="button" class="lnk" data-unsave="'+esc(a)+'" data-u="'+esc(u)+'">저장 해제</button></li>' }).join('');
  });
  $('svm').innerHTML=total?'<b>'+won(total)+'</b>건 · 이 브라우저에만 · 두 원본 인덱스와 같은 목록':'저장한 매물 없음 · 사진 오른쪽 위 표시로 저장';
  var box=$('svb'); if(box && !box.__b){ box.__b=1; box.addEventListener('click',function(e){ var b=e.target.closest('[data-unsave]'); if(!b) return;
    var a=b.getAttribute('data-unsave'), u=b.getAttribute('data-u'), m=readSaved(a); if(!own.call(ARCH,a)) return; delete m[u]; lsSet(ARCH[a].sk,JSON.stringify(m)); SAVED[a]=m; savedUi(); refresh() }) }
}

/* ---------------------------------------------------------------- about */
function aboutShell(){
  return '<section class="vh"><h1 id="vh" tabindex="-1">소개</h1><p class="rm">Archive Index · Helmut Lang 1986—2005 · Carol Christian Poell</p></section>'+
  '<div class="ab">'+
    AS.map(function(a){ return '<section class="ab-s" aria-labelledby="abh-'+a+'"><h2 id="abh-'+a+'"><span class="no">'+ARCH[a].no+'</span>'+esc(ARCH[a].name)+'</h2><dl class="kv" id="ab-'+a+'"><dt>범위</dt><dd>'+esc(ARCH[a].sub)+'</dd><dt>갱신</dt><dd>'+esc(ARCH[a].upd)+' (KST)</dd></dl></section>' }).join('')+
    '<section class="ab-s" aria-labelledby="abh-r"><h2 id="abh-r"><span class="no">—</span>읽는 법</h2><dl class="kv">'+
      '<dt>연도</dt><dd>상품명에 적힌 것만 <span class="basis">연도 표기 · 시기(아카이브) 표기 · 연도 미확인</span></dd>'+
      '<dt>가격</dt><dd>판매자 통화 + 원화 환산 <span class="basis">그날 환율</span></dd>'+
      '<dt>가격 변동</dt><dd>판매자 통화 기준 <span class="basis">원화 환산가만 있는 구간은 방향 없음</span></dd>'+
      '<dt>신규</dt><dd>그날 처음 본 매물</dd>'+
      '<dt>사라진 매물</dt><dd>목록에서 빠진 매물 <span class="basis">판매 여부 미상</span></dd>'+
      '<dt>판매 기록</dt><dd>경매 낙찰 기록 <span class="basis">구매 불가</span></dd>'+
      '<dt>같은 상품명</dt><dd>여러 판매처의 같은 매물 한 장으로</dd>'+
      '<dt>저장</dt><dd>이 브라우저에만 <span class="basis">두 원본 인덱스와 같은 목록</span></dd>'+
    '</dl></section>'+
    '<section class="ab-s" aria-labelledby="abh-x"><h2 id="abh-x"><span class="no">—</span>관계</h2><dl class="kv">'+
      '<dt>운영</dt><dd>개인 색인 <span class="basis">두 브랜드·판매처와 무관</span></dd>'+
      '<dt>사진·매물 정보</dt><dd>각 판매처 <span class="basis">원문 링크로 이동</span></dd>'+
      '<dt>로고</dt><dd>쓰지 않음 <span class="basis">브랜드 이름은 글자로만</span></dd>'+
      '<dt>원본 인덱스</dt><dd><a href="/helmut-lang/">rozykuzy.github.io/helmut-lang</a><br><a href="/ccp/">rozykuzy.github.io/ccp</a></dd>'+
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
      el.innerHTML='<dt>범위</dt><dd>'+esc(ARCH[a].sub)+(d.yearSpan?' <span class="basis">상품명 연도 '+esc(d.yearSpan)+'</span>':'')+'</dd>'+
        '<dt>매물</dt><dd>'+won(d.__cards)+(d.__live!==d.__cards?' <span class="basis">판매처 기준 '+won(d.__live)+'</span>':'')+(d.__sold?' <span class="basis">판매 기록 '+won(d.__sold)+'</span>':'')+(d.__gone?' <span class="basis">사라진 매물 '+won(d.__gone)+'</span>':'')+'</dd>'+
        '<dt>호</dt><dd>'+esc(d.issueLabel||'')+' · '+esc(d.date||'')+'</dd>'+
        '<dt>갱신</dt><dd>'+esc(ARCH[a].upd)+' (KST) <span class="basis">마지막 '+esc(kst(d.built))+'</span></dd>'+
        '<dt>수집</dt><dd>'+srcs+'</dd>'+
        (rates.length?'<dt>환율</dt><dd>'+esc(rates.join(' · '))+' <span class="basis">원 · '+esc(r.date?md(r.date):md(d.today))+'</span></dd>':'')+
        '<dt>원본 인덱스</dt><dd><a href="'+ARCH[a].path+'">rozykuzy.github.io'+ARCH[a].path.replace(/\/$/,'')+'</a></dd>';
    };
    if(DATA[a]) fill(); else load(a).then(fill,function(){});
  });
}

/* ---------------------------------------------------------------- detail */
var DV={it:null, list:null, idx:-1, pushed:false, ret:null};
function listFor(it){
  if(ST.view==='room' && ST.a===it.__a) return VIEW;
  if(ST.view==='saved') return SAVEDLIST;
  if(ST.view==='home') return TODAYLIST;
  return null;
}
function findItem(k){
  var order=ST.view==='room'?[ST.a]:AS;
  for(var i=0;i<order.length;i++){ var d=DATA[order[i]]; if(d && own.call(d.__byKey,k)) return d.__byKey[k] }
  return null;
}
function syncItem(){
  if(!ST.item){ if(DV.it) closeDetail(true); return }
  var it=findItem(ST.item);
  if(!it){
    var waiting=(ST.view==='room'?[ST.a]:AS).some(function(a){ return !DATA[a] && !FAIL[a] });
    if(waiting) return;
    ST.item=null; writeUrl(false); if(DV.it) closeDetail(true); return;
  }
  if(DV.it===it) return;
  showDetail(it,false);
}
function openItem(it){
  if(!it) return;
  DV.pushed=true; ST.item=it.__k; writeUrl(true);
  showDetail(it,true);
}
function showDetail(it,fromUi){
  var ov=$('ov'), dv=$('dv'), wasOpen=!!DV.it;
  if(!wasOpen) DV.ret=doc.activeElement;
  if(!fromUi && !wasOpen) DV.pushed=false;
  DV.it=it; DV.list=listFor(it); DV.idx=DV.list?DV.list.indexOf(it):-1;
  ackSaved(it); savedUi();
  dv.setAttribute('data-a',it.__a); dv.setAttribute('data-room',it.__a);
  dv.innerHTML=detailHtml(it);
  bindImgs(dv);
  ov.hidden=false;
  root.classList.add('lock');
  inert(true);
  requestAnimationFrame(function(){ ov.classList.add('open') });
  var x=dv.querySelector('.dv-x'); if(x && (!wasOpen || !dv.contains(doc.activeElement))) x.focus({preventScroll:true});
  var info=dv.querySelector('.dv-info'); if(info) info.scrollTop=0;
  var pic=dv.querySelector('.dv-pic'); if(pic) pic.scrollTop=0;
  title();
  preload(1); preload(-1);
}
function preload(step){ if(!DV.list||DV.idx<0) return; var n=DV.list[DV.idx+step]; if(!n) return; var u=okUrl(P[n.__a].photosOf(n)[0]); if(u){ var im=new Image(); im.decoding='async'; im.src=thumb(n.__a,u,1200) } }
function closeDetail(silent){
  if(!DV.it) return;
  var ov=$('ov');
  ov.classList.remove('open');
  var done=function(){ if(!ov.classList.contains('open')){ ov.hidden=true; $('dv').innerHTML='' } };
  if(REDUCED.matches) done(); else setTimeout(done,240);
  root.classList.remove('lock'); inert(false);
  var r=DV.ret; DV.it=null; DV.list=null; DV.idx=-1; DV.ret=null;
  if(r && r.focus && doc.contains(r)) try{ r.focus({preventScroll:true}) }catch(e){}
  title();
}
function closeByUser(){
  if(!DV.it) return;
  if(DV.pushed){ DV.pushed=false; history.back(); return }   // the phone's back gesture is the same close
  ST.item=null; writeUrl(false); closeDetail(false);
}
function step(d){
  if(!DV.list || DV.idx<0) return;
  var n=DV.list[DV.idx+d]; if(!n) return;
  ST.item=n.__k; writeUrl(false);
  var pushed=DV.pushed, ret=DV.ret;
  showDetail(n,true); DV.pushed=pushed; DV.ret=ret;
}
function inert(on){
  ['strip','top','main','foot','drawer'].forEach(function(id){ var el=$(id); if(!el) return;
    if(on){ el.setAttribute('inert',''); el.setAttribute('aria-hidden','true') } else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden') } });
}
function yearLine(it){
  var p=P[it.__a];
  if(it.__e) return esc(it.__e)+' <span class="basis">판매자 표기</span>';
  if(it.__yc) return (it.__yc.k==='arch'?'연도 미상':esc(it.__yc.v))+' <span class="basis">'+esc(p.CLAIMBASIS[it.__yc.k]||p.CLAIMBASIS.arch)+'</span>';
  if(it.c==='A') return '연도 표기 <span class="basis">판매 페이지 확인</span>';
  if(it.c==='B') return '연도 미상 <span class="basis">아카이브 표기</span>';
  return '연도 미확인 <span class="basis">표기 없음</span>';
}
function detailHtml(it){
  var a=it.__a, A=ARCH[a], p=P[a], ph=p.photosOf(it), on=isSaved(it), d=DATA[a];
  var pos=DV.list&&DV.idx>=0?won(DV.idx+1)+' / '+won(DV.list.length):'';
  var link=okUrl(it.l), bee=!it.so && p.buyeeUrl(it.l);
  var mcN=it.mc && p.codeNum ? (MCOUNT[a][p.codeNum(it.mc)]||0) : 0;
  var seen=p.seenText(it), stop=SRCSEEN[a][it.r] && d.today && SRCSEEN[a][it.r]<d.today;
  var kv='<dt>사이즈</dt><dd>'+(it.z?esc(it.z):'미표기')+'</dd>'+
    '<dt>분류</dt><dd>'+esc(it.s)+'</dd>'+
    (it.mc?'<dt>번호</dt><dd><span class="mc">'+esc(it.mc)+'</span>'+(mcN>1?' <button type="button" class="lnk" data-code="'+esc(p.codeNum(it.mc))+'">같은 번호 '+won(mcN)+'건</button>':'')+' <span class="basis">상품명</span></dd>':'')+
    '<dt>연도</dt><dd>'+yearLine(it)+'</dd>'+
    (it.__mk.length?'<dt>표기</dt><dd>'+it.__mk.map(function(k){ return esc(p.MARKLBL[k]||k) }).join(' · ')+' <span class="basis">상품명</span></dd>':'')+
    '<dt>판매처</dt><dd>'+esc(it.r)+'</dd>'+
    p.dutyHtml(it)+
    (p.aucText(it)?'<dt>경매</dt><dd>'+esc(p.aucText(it))+(p.endText(it)?' <span class="basis">'+esc(p.endText(it))+' 마감 · 수집 시점 기준</span>':'')+'</dd>':'')+
    (it.so?'<dt>'+esc(it.sk||'판매 완료')+'</dt><dd>'+esc(it.so)+' <span class="basis">구매 불가 · '+esc(it.r)+' 판매 기록</span></dd>':'')+
    (it.f&&!it.so?'<dt>관측</dt><dd>'+(it.x&&it.ls?esc(it.f)+' — '+esc(it.ls)+' <span class="basis">'+esc(seen)+' · 목록에서 사라짐</span>'
       : stop?esc(it.f)+' — '+esc(SRCSEEN[a][it.r])+' <span class="basis">'+esc(md(SRCSEEN[a][it.r]))+' 이후 수집 안 됨</span>'
       : esc(it.f)+'부터'+(seen?' <span class="basis">'+esc(seen)+'</span>':''))+'</dd>':'');
  var offers='';
  if(it.g>1 && Array.isArray(it.v)){
    var ks=it.v.map(function(v){ return v.k }), lo=Math.min.apply(null,ks), hi=Math.max.apply(null,ks), spread=hi>lo;
    offers='<section class="offers"><h3 class="lbl">같은 상품명 '+won(it.g)+'곳</h3>'+it.v.slice().sort(function(x,y){ return x.k-y.k }).map(function(v){
      var u=okUrl(v.l); if(!u) return '';
      return '<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"'+(spread&&v.k===lo?' class="lo"':'')+'>'+
        '<span class="o-ph">'+(v.i?imgTag(a,v.i,160):'')+'</span>'+
        '<span class="o-w">'+esc(v.r)+(v.z?' · '+esc(v.z):'')+(spread&&v.k===lo?'<em>최저가</em>':'')+'</span>'+
        '<b>₩'+won(v.k)+(v.u&&v.p>0?'<i>'+esc((p.SYM[v.u]||'')+Number(v.p).toLocaleString('en-US'))+'</i>':'')+'</b></a>' }).join('')+
      (spread?'<p class="gap">가격 차 ₩'+won(hi-lo)+'</p>':'')+'</section>';
  }
  var tags=it.__m.map(function(k){ return '<button type="button" class="tag" data-motif="'+esc(k)+'">'+esc(p.motifLbl(k))+'</button>' }).join('');
  var thumbs=ph.length>1?'<div class="ths" role="group" aria-label="사진">'+ph.map(function(u,i){ return '<button type="button" data-ph="'+i+'" aria-label="사진 '+(i+1)+'"'+(i===0?' aria-current="true"':'')+'>'+imgTag(a,u,160)+'</button>' }).join('')+'</div>':'';
  return '<div class="dv-top">'+
      '<span class="dv-tag"><span class="no">'+A.no+'</span>'+esc(A.name)+'</span>'+
      '<span class="dv-pos" aria-live="polite">'+pos+'</span>'+
      '<span class="dv-nav">'+
        '<button type="button" class="ico" data-step="-1" aria-label="이전 매물"'+(DV.idx>0?'':' disabled')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.3" fill="none"/></svg></button>'+
        '<button type="button" class="ico" data-step="1" aria-label="다음 매물"'+(DV.list&&DV.idx>=0&&DV.idx<DV.list.length-1?'':' disabled')+'><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.3" fill="none"/></svg></button>'+
        '<button type="button" class="dv-x" data-close>닫기<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.3"/></svg></button>'+
      '</span></div>'+
    '<div class="dv-body">'+
      '<div class="dv-pic'+(ph.length?'':' dead')+'">'+(ph.length?'<div class="dv-main">'+imgTag(a,ph[0],1200,{eager:true, id:'dvImg', alt:it.t})+(ph.length>1?'<span class="pn" id="dvPn">1 / '+ph.length+'</span>':'')+'</div>':'')+thumbs+'</div>'+
      '<div class="dv-info">'+
        '<div class="fl">'+p.flagsHtml(it)+'</div>'+
        '<h2 id="dvT">'+esc(it.t)+'</h2>'+
        p.priceHtml(it,true)+
        '<div class="acts">'+
          (link?'<a class="btn solid" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">'+(it.so?'기록 보기':'판매 페이지')+'<span class="arr" aria-hidden="true">↗</span></a>':'')+
          (bee?'<a class="btn" href="'+esc(bee)+'" target="_blank" rel="noopener noreferrer">구매대행<span class="arr" aria-hidden="true">↗</span></a>':'')+
          '<button type="button" class="btn'+(on?' on':'')+'" data-save="'+it.__k+'" aria-pressed="'+on+'">'+(on?'저장 해제':'저장')+'</button>'+
          '<button type="button" class="btn ghost" data-copy>링크 복사</button>'+
        '</div>'+
        '<dl class="kv">'+kv+'</dl>'+
        p.histHtml(it)+p.compsHtml(it)+
        (tags?'<div class="tags">'+tags+'</div>':'')+
        offers+
        '<p class="dv-orig"><a href="'+A.path+'?item='+it.__k+'">원본 인덱스에서 보기</a></p>'+
      '</div>'+
    '</div>';
}
function showPhoto(i){
  var it=DV.it; if(!it) return; var ph=P[it.__a].photosOf(it), u=okUrl(ph[i]); if(!u) return;
  var im=$('dvImg'); if(im){ im.classList.remove('on'); im.removeAttribute('data-b'); var t=thumb(it.__a,u,1200); im.src=t; if(t!==u) im.setAttribute('data-full',u); else im.removeAttribute('data-full'); bindImgs($('dv')) }
  var pn=$('dvPn'); if(pn) pn.textContent=(i+1)+' / '+ph.length;
  var bs=$('dv').querySelectorAll('[data-ph]'); for(var j=0;j<bs.length;j++){ if(j===i) bs[j].setAttribute('aria-current','true'); else bs[j].removeAttribute('aria-current') }
}
function copyLink(){
  var url=location.origin+hrefOf(ST);
  var ok=function(){ toast('링크 복사함') }, no=function(){ toast('복사할 수 없음 · 주소창의 주소 사용') };
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok,function(){ fallbackCopy(url)?ok():no() });
  else fallbackCopy(url)?ok():no();
}
function fallbackCopy(t){ try{ var ta=doc.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; $('dv').appendChild(ta); ta.select(); var r=doc.execCommand('copy'); ta.remove(); return r }catch(e){ return false } }
$('ov').addEventListener('click',function(e){
  if(e.target.closest('[data-close]')){ closeByUser(); return }
  var s=e.target.closest('[data-step]'); if(s){ step(+s.getAttribute('data-step')); return }
  var sv=e.target.closest('[data-save]'); if(sv){ if(DV.it) toggleSave(DV.it); return }
  if(e.target.closest('[data-copy]')){ copyLink(); return }
  var ph=e.target.closest('[data-ph]'); if(ph){ showPhoto(+ph.getAttribute('data-ph')); return }
  var mt=e.target.closest('[data-motif]'); if(mt && DV.it){ var a=DV.it.__a, F=blankF(); F.motif[mt.getAttribute('data-motif')]=1; DV.pushed=false; closeDetail(true); go({view:'room', a:a, F:F, sort:'new', item:null}); return }
  var cd=e.target.closest('[data-code]'); if(cd && DV.it){ var a2=DV.it.__a, F2=blankF(); F2.q=cd.getAttribute('data-code'); DV.pushed=false; closeDetail(true); go({view:'room', a:a2, F:F2, sort:'rel', item:null}); return }
});

/* ---------------------------------------------------------------- search across both */
var SQT=null, SRES=[], SSEL=-1;
function openSearch(){
  var s=$('search'); if(!s.hidden) { $('sq').focus(); return }
  closeDrawer();
  s.hidden=false; root.classList.add('lock'); requestAnimationFrame(function(){ s.classList.add('open') });
  $('searchBtn').setAttribute('aria-expanded','true');
  var q=$('sq'); q.value=ST.view==='room'?ST.F.q:''; q.focus(); q.select();
  AS.forEach(function(a){ if(!DATA[a] && !FAIL[a]) load(a).then(runSearch,function(){ runSearch() }) });
  runSearch();
  var hint=hints();
  $('sHint').innerHTML='<span class="lbl">예</span>'+hint.map(function(h){ return '<button type="button" data-hint="'+esc(h)+'">'+esc(h)+'</button>' }).join('');
}
function hints(){
  var h=['bondage','1998','ボンデージ','드립'];
  var d=DATA.ccp; if(d){ var best=null, n=0; for(var k in MCOUNT.ccp) if(own.call(MCOUNT.ccp,k) && MCOUNT.ccp[k]>n){ n=MCOUNT.ccp[k]; best=k } if(best) h.push(best) }
  return h;
}
function closeSearch(silent){
  var s=$('search'); if(s.hidden) return;
  s.classList.remove('open'); root.classList.remove('lock');
  $('searchBtn').setAttribute('aria-expanded','false');
  var fin=function(){ if(!s.classList.contains('open')) s.hidden=true };
  if(REDUCED.matches) fin(); else setTimeout(fin,200);
  if(!silent) $('searchBtn').focus();
}
function runSearch(){
  var s=$('search'); if(s.hidden) return;
  var q=$('sq').value.replace(/\s+/g,' ').trim().toLowerCase().slice(0,80), out=$('sres');
  SRES=[]; SSEL=-1;
  if(!q){ out.innerHTML=''; return }
  var h='';
  AS.forEach(function(a){
    var A=ARCH[a], d=DATA[a];
    h+='<section class="sr-g"><h3><span class="no">'+A.no+'</span>'+esc(A.name)+'<span class="n" id="srn-'+a+'"></span></h3>';
    if(!d){ h+='<p class="sr-m">'+(FAIL[a]?'불러오지 못함':'불러오는 중')+'</p></section>'; return }
    var p=P[a], F=blankF(); F.q=q; p.setF(F); p.setQuery(q);
    var QT=p.getQT(), res=[];
    if(QT.length) d.items.forEach(function(it){ if(it.x || it.so || it.__bad) return; var sc=p.score(it); if(sc>0) res.push([sc,it]) });
    res.sort(function(x,y){ return y[0]-x[0] || y[1].k-x[1].k });
    // hand the room back its own query
    if(ST.view==='room' && ST.a===a){ p.setF(ST.F); p.setQuery(ST.F.q) }
    var st={view:'room', a:a, F:F, sort:'rel', item:null};
    if(!res.length){ h+='<p class="sr-m">'+(QT.length?'결과 없음':'브랜드 이름만으로는 거르지 않음')+'</p></section>'; return }
    h=h.replace('<span class="n" id="srn-'+a+'"></span>','<span class="n">'+won(res.length)+'</span>');
    h+='<ul>'+res.slice(0,5).map(function(r){ var it=r[1], ph=p.photosOf(it)[0]; SRES.push({it:it, q:q});
      var st2={view:'room', a:a, F:F, sort:'rel', item:it.__k};
      return '<li><a class="sr-i" href="'+esc(hrefOf(st2))+'" data-sri="'+(SRES.length-1)+'">'+
        '<span class="sr-ph">'+imgTag(a,ph,160)+'</span><span class="sr-t">'+esc(it.t)+'</span>'+
        '<span class="sr-p">₩'+won(it.k)+(it.__e?' · '+esc(it.__e):'')+' · '+esc(it.r)+'</span></a></li>' }).join('')+'</ul>'+
      '<a class="sr-all" href="'+esc(hrefOf(st))+'">'+won(res.length)+'건 모두 보기<span class="arr" aria-hidden="true">→</span></a></section>';
  });
  out.innerHTML=h; bindImgs(out);
}
$('searchBtn').addEventListener('click',openSearch);
$('sq').addEventListener('input',function(){ clearTimeout(SQT); SQT=setTimeout(runSearch,160) });
$('sq').addEventListener('keydown',function(e){
  var items=$('sres').querySelectorAll('a.sr-i, a.sr-all');
  if(e.key==='ArrowDown' || e.key==='ArrowUp'){ if(!items.length) return; e.preventDefault(); SSEL=(SSEL+(e.key==='ArrowDown'?1:-1)+items.length)%items.length; items[SSEL].focus(); return }
  if(e.key==='Enter'){ var first=$('sres').querySelector('a.sr-all'); if(first){ e.preventDefault(); first.click() } }
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
function openDrawer(){ var d=$('drawer'); d.hidden=false; root.classList.add('lock'); requestAnimationFrame(function(){ d.classList.add('open') }); $('menuBtn').setAttribute('aria-expanded','true'); var x=d.querySelector('[data-close]'); if(x) x.focus() }
function closeDrawer(silent){ var d=$('drawer'); if(d.hidden) return; d.classList.remove('open'); root.classList.remove('lock'); $('menuBtn').setAttribute('aria-expanded','false');
  var fin=function(){ if(!d.classList.contains('open')) d.hidden=true }; if(REDUCED.matches) fin(); else setTimeout(fin,200); if(!silent) $('menuBtn').focus() }
$('menuBtn').addEventListener('click',openDrawer);
$('drawer').addEventListener('click',function(e){ if(e.target.closest('[data-close]')) closeDrawer() });

/* ---------------------------------------------------------------- clicks, keys */
doc.addEventListener('click',function(e){
  if(e.defaultPrevented || e.button!==0) return;
  var mod=e.metaKey||e.ctrlKey||e.shiftKey||e.altKey;
  var re=e.target.closest('[data-retry]'); if(re){ var ra=re.getAttribute('data-retry'); delete FAIL[ra]; refresh(); if(ST.view==='home') homeUpdate(GEN); return }
  var sv=e.target.closest('.card [data-save]'); if(sv){ var it=itemOfEl(sv); if(it) toggleSave(it); return }
  var sri=e.target.closest('[data-sri]');
  if(sri && !mod){ e.preventDefault(); var r=SRES[+sri.getAttribute('data-sri')]; closeSearch(true); if(!r) return;
    var F=blankF(); F.q=r.q; var target=r.it;
    go({view:'room', a:target.__a, F:F, sort:'rel', item:null}, true, function(){ openItem(target) }); return }
  var op=e.target.closest('.card [data-open]');
  if(op && !(mod && op.tagName==='A')){ e.preventDefault(); openItem(itemOfEl(op)); return }
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
    if(!$('search').hidden){ e.preventDefault(); closeSearch(); return }
    if(DV.it){ e.preventDefault(); closeByUser(); return }
    if(!$('drawer').hidden){ e.preventDefault(); closeDrawer(); return }
    var sd=$('side'); if(sd && sd.classList.contains('open') && !WIDE.matches){ e.preventDefault(); sideOpen(false); return }
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
  var box=DV.it?$('dv'):!$('search').hidden?$('search').querySelector('.so-in'):!$('drawer').hidden?$('drawer'):null;
  if(!box) return;
  var f=[].slice.call(box.querySelectorAll('a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])')).filter(function(x){ return x.offsetParent!==null || x===doc.activeElement });
  if(!f.length) return;
  var first=f[0], last=f[f.length-1];
  if(!box.contains(doc.activeElement)){ e.preventDefault(); first.focus(); return }
  if(e.shiftKey && doc.activeElement===first){ e.preventDefault(); last.focus() }
  else if(!e.shiftKey && doc.activeElement===last){ e.preventDefault(); first.focus() }
}
if(WIDE.addEventListener) WIDE.addEventListener('change',function(){ root.classList.remove('lock-side'); var s=$('side'); if(s && WIDE.matches) s.classList.remove('open') });

/* ---------------------------------------------------------------- start */
savedUi();
ST=readUrl(location.search);
if(ST.view!=='room') writeUrl(false);
if(ST.view==='home'){ AS.forEach(function(a){ load(a).catch(function(){}) }) }
mount(); update(); syncItem();
// the other archive, quietly, so switching rooms is instant
var SAVE=navigator.connection && navigator.connection.saveData;
if(!SAVE) setTimeout(function(){ AS.forEach(function(a){ if(!DATA[a] && !PEND[a] && !FAIL[a]) load(a).then(function(){ strip() },function(){}) }) },1500);
if(DATA.hl || DATA.ccp) strip();
AS.forEach(function(a){ if(PEND[a]) PEND[a].then(strip,function(){}) });
})();
