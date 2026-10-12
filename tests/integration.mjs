import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const directory=await mkdtemp(join(tmpdir(),'daffa-runtime-'));
const port=33000+Math.floor(Math.random()*2000),base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port',String(port),'--hostname','127.0.0.1'],{env:{...process.env,APP_URL:base,DATA_DIR:directory,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',b=>log+=b);server.stderr.on('data',b=>log+=b);
try{
 let response;for(let i=0;i<40;i++){try{response=await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,200));}}
 assert.ok(response,'Server did not start. '+log);const html=await response.text();assert.match(html,/Daffa Rifki Fahreza/);
 const initial=await (await fetch(base+'/api/auth')).json();assert.equal(initial.configured,false);const publicProfile=await fetch(base+'/api/profile');assert.equal(publicProfile.status,200);assert.equal((await publicProfile.json()).name,'Daffa Rifki Fahreza');
 let cookie='';const post=(path,body,method='POST')=>fetch(base+path,{method,headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)});
 const setup=await post('/api/auth',{action:'setup',username:'daffa',password:'Test-password-runtime-2026'});assert.equal(setup.status,200,await setup.clone().text());cookie=setup.headers.get('set-cookie').split(';')[0];
 const profile=await fetch(base+'/api/profile',{headers:{Cookie:cookie}});assert.equal(profile.status,200);const p=await profile.json();assert.equal(p.name,'Daffa Rifki Fahreza');p.email='qa@example.test';assert.equal((await post('/api/profile',p,'PUT')).status,200);
 const form=new FormData();form.append('file',new File([await readFile('public/photos/office.webp')],'office.webp',{type:'image/webp'}));const upload=await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base,Cookie:cookie},body:form});assert.equal(upload.status,200,await upload.clone().text());const {url}=await upload.json();assert.equal((await fetch(base+url,{headers:{Cookie:cookie}})).status,200);assert.equal((await fetch(base+url)).status,401);
 assert.equal((await post('/api/auth',{action:'logout'})).status,200);assert.equal((await fetch(base+'/api/profile',{headers:{Cookie:cookie}})).status,200);assert.equal((await post('/api/profile',p,'PUT')).status,401);
 console.log('PASS: production HTTP public profile, first admin setup, real session cookies, protected editor, upload, media access, and logout.');
}catch(error){console.error(log);throw error;}finally{if(server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}await rm(directory,{recursive:true,force:true});}
