import { defaultProfile } from '../../default-profile';
import { authorized,db,digest,equal,hashPassword,random,sameOrigin,sessionCookie } from '../../security';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const owner='owner';
const headers={'Cache-Control':'no-store'};
export async function GET(){const row=await db().prepare('SELECT username FROM identities WHERE user_id=?').bind(owner).first();return Response.json({configured:!!row,authenticated:!!await authorized(),username:'daffa'},{headers});}
export async function POST(request:Request){
if(!sameOrigin(request))return Response.json({error:'Permintaan tidak valid.'},{status:403});
let body:any;try{body=await request.json();}catch{return Response.json({error:'Data tidak valid.'},{status:400});}
if(body.action==='logout'){const token=request.headers.get('cookie')?.match(/daffa_session=([^;]+)/)?.[1];if(token)await db().prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();return Response.json({ok:true},{headers:{...headers,'Set-Cookie':sessionCookie('',0)}});}
const username=String(body.username??'').trim().toLowerCase(),password=String(body.password??'');if(!/^[a-z0-9_.-]{3,40}$/.test(username)||password.length<12||password.length>128)return Response.json({error:'Username 3–40 karakter. Password minimal 12 karakter.'},{status:400});
let row:any=await db().prepare('SELECT * FROM identities WHERE user_id=?').bind(owner).first();
if(!row){if(body.action!=='setup')return Response.json({error:'Aktifkan akun pertama Anda.'},{status:400});const key=process.env.SETUP_KEY;if(!key||key.length<32)return Response.json({error:'Jalankan npm run setup di komputer server untuk mengaktifkan website.'},{status:503});if(!equal(String(body.setupKey??''),key))return Response.json({error:'Kunci aktivasi tidak valid.'},{status:403});const salt=random();await db().prepare('INSERT OR IGNORE INTO identities (user_id,username,salt,password_hash,profile) VALUES (?,?,?,?,?)').bind(owner,username,salt,await hashPassword(password,salt),JSON.stringify(defaultProfile)).run();row=await db().prepare('SELECT * FROM identities WHERE user_id=?').bind(owner).first();}
if(row.locked_until>Date.now())return Response.json({error:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'},{status:429});
const actual=await hashPassword(password,row.salt);if(!equal(actual,row.password_hash)||username!==row.username){const attempts=row.locked_until&&row.locked_until<Date.now()?1:row.attempts+1;await db().prepare('UPDATE identities SET attempts=?,locked_until=? WHERE user_id=?').bind(attempts,attempts>=5?Date.now()+900000:0,owner).run();return Response.json({error:'Username atau password tidak cocok.'},{status:401});}
await db().prepare('UPDATE identities SET attempts=0,locked_until=0 WHERE user_id=?').bind(owner).run();const token=random();await db().batch([db().prepare('DELETE FROM sessions WHERE user_id=? AND expires<?').bind(owner,Date.now()),db().prepare('INSERT INTO sessions (token_hash,user_id,expires) VALUES (?,?,?)').bind(await digest(token),owner,Date.now()+28800000)]);return Response.json({ok:true},{headers:{...headers,'Set-Cookie':sessionCookie(token)}});
}
