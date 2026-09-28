// Builds site/engine.js: the reading rules of the two archive pages, copied verbatim
// from each page's own template so the combined index reads a listing exactly as they do.
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { mainScript, topLevel } from './scan.mjs';

const WANT = new Set(('won SYM esc MOTIF LEX BRANDNOISE codeForms codeNum MAXY YMIN YMAX nrm LEXW alts PRICE CERT FLAGLBL CATORDER GRP ' +
  'MARK MARKLBL HLJ NOTJEANS marksOf SZGRP SZNAME LETTERS oneSize sizeToks curOf dnum daysBetween seenDays seenText md AEQ aucLeft aucText endText ' +
  'buyeeUrl compsHtml DOMESTIC usdOf dutyHtml QUAL yearClaim CLAIMBASIS yearOf priceBand own keys any motifLbl QT QX setQuery hit score matchedIn ' +
  'SEEK SEEKBRAND HANGUL KANA lexRow word seekParts seekQuery thumb photosOf histHtml keyOf CATSLUG PRICESLUG CERTSLUG packYears unpackYears flagsHtml priceHtml').split(/\s+/));
const EXPORT = [...WANT].filter((n) => !['own', 'QT', 'QX', 'KANA', 'YMIN', 'YMAX', 'MAXY'].includes(n));
const GLOBALS = new Set(('window document Math JSON Date Number String Object Array RegExp Boolean Infinity NaN isNaN isFinite parseInt parseFloat ' +
  'encodeURIComponent decodeURIComponent Error TypeError Set Map undefined arguments console localStorage navigator location Intl Symbol').split(/\s+/));

function profile(tag, file, src) {
  const html = fs.readFileSync(file, 'utf8');
  const code = mainScript(html);
  const nodes = topLevel(code);
  const got = new Set(), parts = [], inits = [];
  for (const n of nodes) {
    const hit = n.names.some((x) => WANT.has(x));
    const flat = n.code.replace(/\s+/g, '');
    const init = n.type === 'ExpressionStatement' && (flat.startsWith('(function(){for(varr=0;r<LEX.length;r++)') || /^MARK\.forEach/.test(n.code));
    if (init) inits.push(flat.slice(0, 40));
    if (hit || init) { parts.push(n.code); n.names.forEach((x) => got.add(x)); }
  }
  const body = parts.join('\n');
  // every name the copied code reads must be declared in the copy, in the shims below, or be a browser global
  const shims = new Set(['D', 'TODAY', 'SINCE', 'F', 'saved', 'ALLNEW']);
  const ast = acorn.parse('(function(){' + body + '})', { ecmaVersion: 2022 });
  const declared = new Set(), refs = new Set();
  walk.full(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier') declared.add(n.id.name);
    if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression') && n.id) declared.add(n.id.name);
    if (/Function/.test(n.type)) n.params.forEach((p) => p.type === 'Identifier' && declared.add(p.name));
    if (n.type === 'CatchClause' && n.param) declared.add(n.param.name);
  });
  walk.ancestor(ast, { Identifier(n, anc) {
    const p = anc[anc.length - 2];
    if (p && p.type === 'MemberExpression' && p.property === n && !p.computed) return;
    if (p && p.type === 'Property' && p.key === n && !p.computed) return;
    refs.add(n.name);
  } });
  const free = [...refs].filter((x) => !declared.has(x) && !GLOBALS.has(x) && !shims.has(x));
  if (free.length) throw new Error(tag + ': copied code reads undeclared names: ' + free.join(', '));
  if (inits.length !== 2) throw new Error(tag + ': expected the LEX and MARK set-up statements, found ' + JSON.stringify(inits));
  const missing = EXPORT.filter((x) => !got.has(x));
  const exp = EXPORT.filter((x) => got.has(x));
  return { tag, missing, text:
`AIX.profiles.${tag}=(function(){
'use strict';
var D=null, TODAY=null, SINCE=null, saved={}, ALLNEW=false;
var F={y:{},cat:{},motif:{},price:{},src:{},cert:{},mark:{},flag:{},size:'',q:''};
/* ---- copied from ${src} ---- */
${body}
/* ---- end of copy ---- */
function prep(it){
  var ycE=yearClaim(it);
  it.__yc=ycE || (it.q ? {k:it.qk||'arch', v:it.q} : null);
  it.__e=ycE?null:(it.e||null);
  it.__c=ycE?'B':(it.__e?'A':it.c);
  it.__y=yearOf(it);
  it.__yk=it.__y?String(it.__y):'none';
  it.__m=[]; var mw='';
  var tk=it.t||''; try{ tk=tk.normalize('NFKC') }catch(e){}
  for(var j=0;j<MOTIF.length;j++) if(MOTIF[j][2].test(tk)){ it.__m.push(MOTIF[j][0]); mw+=' '+MOTIF[j][0]+' '+MOTIF[j][1] }
  it.__mk=marksOf(tk,it);
  it.__z=sizeToks(it);
  it.__t=nrm(it.t);
  it.__mw=nrm(mw);
  it.__sec=nrm(it.s);
  it.__meta=nrm((it.e||'')+' '+(it.r||'')+' '+(it.z||'')${got.has('codeForms') ? "+' '+codeForms(it.mc)" : ''});
  it.__s=it.__t+' '+it.__mw+' '+it.__sec+' '+it.__meta;
}
return {tag:'${tag}', ${exp.map((x) => x + ':' + x).join(', ')},
  prep:prep,
  setData:function(d){ D=d; TODAY=d.today||null; var c=d.counts||{}; ALLNEW=!!(c.items && c.fresh>=c.items) },
  setF:function(f){ F=f },
  setSince:function(s){ SINCE=s },
  getQT:function(){ return QT.slice() },
  hasCodes:${got.has('codeForms')}};
})();
` };
}

const hl = profile('hl', process.argv[2], 'helmut-lang template (as published)');
const ccp = profile('ccp', process.argv[3], 'ccp template.html (repo main)');
for (const p of [hl, ccp]) if (p.missing.length) console.log(p.tag, 'has no', p.missing.join(' '));
const out = `/* Archive Index — reading rules for both archives.
   Generated by tools/extract.mjs; do not edit here. Rebuild when either archive's template changes. */
var AIX=window.AIX||(window.AIX={}); AIX.profiles={};
${hl.text}
${ccp.text}`;
fs.writeFileSync(process.argv[4], out);
console.log('wrote', process.argv[4], out.length, 'bytes');
