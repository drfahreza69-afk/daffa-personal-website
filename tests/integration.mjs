import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const require=createRequire(import.meta.url);
const data=await mkdtemp(path.join(tmpdir(),'daffa-railway-test-'));
const port='3187',origin='http://127.0.0.1:'+port,canonical='https://daffa-test.up.railway.app';
const initial='isolated-login-fixture-2026',changed='changed-login-fixture-2026';
let server,cookie='',logs='';
const request=(route,options={})=>fetch(origin+route,{...options,signal:AbortSignal.timeout(10000)});
const post=(route,body,authenticated=false,from=canonical)=>request(route,{method:'POST',headers:{Origin:from,'Content-Type':'application/json',...(authenticated?{Cookie:cookie}:{})},body:JSON.stringify(body)});
async function start(){
 logs='';server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',port],{env:{...process.env,NODE_ENV:'production',DATA_DIR:data,ADMIN_NAME:'daffa',ADMIN_PASSWORD:initial,APP_URL:canonical,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',v=>logs+=v);server.stderr.on('data',v=>logs+=v);
 for(let i=0;i<80;i++){try{if((await request('/api/health')).ok)return;}catch{}if(server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,100));}
 throw Error('Server tidak siap: '+logs);
}
async function stop(){if(!server||server.exitCode!==null)return;await new Promise(resolve=>{const limit=setTimeout(()=>server.kill('SIGKILL'),3000);server.once('exit',()=>{clearTimeout(limit);resolve();});server.kill('SIGTERM');});}
try{
 await start();
 let scripts=new Set();
 for(const route of ['/','/profile','/career','/vision','/principles','/gallery','/legacy','/contact','/admin']){
  const r=await request(route);assert.equal(r.status,200,route);const html=await r.text();assert.ok(html.includes(route==='/admin'?'Memuat ruang pribadi':'DAFFA DIGITAL'),route);
  for(const [,src] of html.matchAll(/<script[^>]+src="([^"?]+)[^"]*"/g))scripts.add(src);
 }
 for(const src of scripts){const r=await request(src);assert.equal(r.status,200,src);const script=await r.text();assert.ok(!script.includes(initial));assert.ok(!script.includes('Awal komitmen disiplin & sholat'));}
 let r=await request('/api/state');assert.equal(r.status,401);
 r=await request('/api/state?public=1');let state=await r.json();assert.equal(state.empire,undefined);assert.equal(state.profile.photos.length,14);assert.equal(state.profile.photos.filter(p=>p.category==='Kekasih').length,11);
 for(const photo of state.profile.photos){r=await request('/api/media/'+photo.id);assert.equal(r.status,200,photo.id);assert.equal(r.headers.get('Content-Type'),'image/webp');assert.ok((await r.arrayBuffer()).byteLength>1000);}
 assert.equal((await post('/api/auth',null)).status,400);
 assert.equal((await post('/api/auth',{name:'daffa',password:initial},false,'https://evil.test')).status,403);
 r=await post('/api/auth',{name:'daffa',password:initial});assert.equal(r.status,200,await r.clone().text());const setCookie=r.headers.get('set-cookie');assert.ok(setCookie.includes('HttpOnly'));assert.ok(setCookie.includes('Secure'));cookie=setCookie.split(';')[0];
 r=await request('/api/state',{headers:{Cookie:cookie}});state=await r.json();assert.equal(state.empire.habits.length,15);
 state.profile.nickname='Persistence checked';state.profile.photos.find(p=>p.id==='love-11').visibility='private';
 r=await post('/api/state',state,true);assert.equal(r.status,200);state.revision=(await r.json()).revision;
 assert.equal((await request('/api/media/love-11')).status,404);assert.equal((await request('/api/media/love-11',{headers:{Cookie:cookie}})).status,200);
 assert.equal((await post('/api/state',{...state,revision:state.revision-1},true)).status,409);
 assert.equal((await post('/api/state',{...state,empire:{...state.empire,goal:-1}},true)).status,400);
 const simultaneous=await Promise.all([post('/api/state',state,true),post('/api/state',state,true)]);assert.deepEqual(simultaneous.map(r=>r.status).sort(),[200,409]);
 const form=new FormData();form.set('file',new Blob([Buffer.from(JSON.parse(await readFile('lib/seed-assets.json','utf8'))[0].base64,'base64')],{type:'image/webp'}),'test-photo.webp');form.set('category','Daffa');
 r=await request('/api/upload',{method:'POST',headers:{Cookie:cookie,Origin:canonical},body:form});assert.equal(r.status,200,await r.clone().text());
 r=await request('/api/state',{headers:{Cookie:cookie}});state=await r.json();const added=state.profile.photos.find(p=>p.original==='test-photo.webp');assert.ok(added);assert.equal((await request('/api/media/'+added.id)).status,404);assert.equal((await request('/api/media/'+added.id,{headers:{Cookie:cookie}})).status,200);
 r=await post('/api/account',{current:initial,password:changed},true);assert.equal(r.status,200);assert.equal((await request('/api/state',{headers:{Cookie:cookie}})).status,401);
 await stop();await start();
 r=await post('/api/auth',{name:'daffa',password:changed});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];
 r=await request('/api/state',{headers:{Cookie:cookie}});state=await r.json();assert.equal(state.profile.nickname,'Persistence checked');assert.ok(state.profile.photos.some(p=>p.id===added.id));assert.equal((await request('/api/media/'+added.id,{headers:{Cookie:cookie}})).status,200);
 r=await request('/api/media/'+added.id,{method:'DELETE',headers:{Cookie:cookie,Origin:canonical}});assert.equal(r.status,200);assert.equal((await request('/api/media/'+added.id,{headers:{Cookie:cookie}})).status,404);
 assert.equal((await request('/sitemap.xml')).status,200);assert.ok((await (await request('/sitemap.xml')).text()).includes(canonical));
 r=await post('/api/auth',{action:'logout'},true);assert.equal(r.status,200);assert.equal((await request('/api/state',{headers:{Cookie:cookie}})).status,401);
 console.log('PASS: 9 pages and client assets, all 14 photos, name/password login, origin protection, atomic saves, upload/delete, private media, password change, and persisted state after restart.');
}finally{await stop();await rm(data,{recursive:true,force:true});}
