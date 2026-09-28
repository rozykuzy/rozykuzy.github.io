import fs from 'node:fs';
import * as acorn from 'acorn';
export function mainScript(html){
  const re=/<script(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g; let m, best='';
  while((m=re.exec(html))) if(m[1].length>best.length) best=m[1];
  return best;
}
export function topLevel(src){
  const ast=acorn.parse(src,{ecmaVersion:2022,sourceType:'script',allowHashBang:true});
  let body=ast.body;
  if(body.length<=3){ const st=body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='CallExpression'&&/Function/.test(n.expression.callee.type));
    if(st) body=st.expression.callee.body.body; }
  return body.map(n=>{
    let names=[];
    if(n.type==='FunctionDeclaration') names=[n.id.name];
    else if(n.type==='VariableDeclaration') names=n.declarations.map(d=>d.id.name);
    return {type:n.type,names,start:n.start,end:n.end,code:src.slice(n.start,n.end)};
  });
}
if(process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop()) && process.argv[2]){
  const src=mainScript(fs.readFileSync(process.argv[2],'utf8'));
  const tl=topLevel(src);
  for(const n of tl) console.log(n.type.padEnd(20), (n.names.join(',')||n.code.replace(/\s+/g,' ').slice(0,90)).slice(0,100), n.end-n.start);
}
