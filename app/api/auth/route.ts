import {cookies} from 'next/headers';
import {database,isAdmin,json,sameOrigin,cookie,ensureAdmin} from '../../../lib/server';
import {digest,passwordHash,randomToken,equal} from '../../../lib/auth-utils';
export const dynamic='force-dynamic';
export async function GET(){return json({authenticated:await isAdmin(),configured:await ensureAdmin()});}
export async function POST(request:Request){
if(!sameOrigin(request))return json({error:'Permintaan tidak valid.'},403);
let b:Record<string,unknown>;try{const value=await request.json();if(!value||typeof value!=='object')return json({error:'Data tidak valid.'},400);b=value as Record<string,unknown>;}catch{return json({error:'Data tidak valid.'},400);}
const db=database();
if(b.action==='logout'){const token=(await cookies()).get('daffa_session')?.value;if(token)await db.prepare('DELETE FROM sessions WHERE hash=?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
const name=String(b.name||'').trim().toLowerCase(),password=String(b.password||'');
if(!/^[a-z0-9_.-]{3,40}$/.test(name)||password.length<12||password.length>128)return json({error:'Nama atau password tidak cocok.'},400);
if(!await ensureAdmin())return json({error:'Admin belum dikonfigurasi. Isi ADMIN_NAME dan ADMIN_PASSWORD (minimal 12 karakter) pada Variables Railway, lalu redeploy.'},503);
const row=await db.prepare('SELECT * FROM accounts WHERE id=?').bind('owner').first<{name:string;salt:string;hash:string;attempts:number;locked:number}>();if(!row)return json({error:'Akun tidak tersedia.'},503);
if(row.locked>Date.now())return json({error:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'},429);
const hash=await passwordHash(password,row.salt);
if(name!==row.name||!equal(hash,row.hash)){const count=row.locked&&row.locked<Date.now()?1:row.attempts+1;await db.prepare('UPDATE accounts SET attempts=?,locked=? WHERE id=?').bind(count,count>=5?Date.now()+900000:0,'owner').run();return json({error:'Nama atau password tidak cocok.'},401);}
const token=randomToken();await db.batch([db.prepare('UPDATE accounts SET attempts=0,locked=0 WHERE id=?').bind('owner'),db.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()),db.prepare('INSERT INTO sessions (hash,expires) VALUES (?,?)').bind(await digest(token),Date.now()+28800000)]);
return json({ok:true},200,{'Set-Cookie':cookie(token)});
}
