import {cookies} from 'next/headers';
import {defaultProfile,type Profile,type Empire,type HQ} from './data';
import index from './photo-index.json';
import seedEmpire from './seed-empire.json';
import assets from './seed-assets.json';
import {digest,permittedOrigin,passwordHash,randomToken} from './auth-utils';
import {localDatabase,files} from './storage';
export const database=localDatabase;
let initialization:Promise<unknown>|undefined;
export async function initialize(){if(!initialization){const db=database();initialization=db.batch([db.prepare('INSERT OR IGNORE INTO headquarters (id,profile,empire,revision) VALUES (1,?,?,0)').bind(JSON.stringify({...defaultProfile,photos:index}),JSON.stringify(seedEmpire)),...index.map(p=>db.prepare('INSERT OR IGNORE INTO media (id,mime,name,visibility,deleted) VALUES (?,?,?,?,0)').bind(p.id,'image/webp',p.original,p.visibility))]).catch(error=>{initialization=undefined;throw error;});}await initialization;}
export async function readHQ():Promise<HQ>{await initialize();const r=await database().prepare('SELECT profile,empire,revision FROM headquarters WHERE id=1').first<{profile:string;empire:string;revision:number}>();if(!r)throw new Error('Data tidak tersedia.');return {profile:JSON.parse(r.profile) as Profile,empire:JSON.parse(r.empire) as Empire,revision:r.revision};}
export async function publicProfile(){const {profile}=await readHQ();return {...profile,photos:profile.photos.filter(p=>p.visibility==='public'),...(!profile.showBio?{address:'',birth:'',education:'',gender:'',status:'',occupation:''}:{})};}
export async function isAdmin(){const token=(await cookies()).get('daffa_session')?.value;if(!token)return false;return !!await database().prepare('SELECT hash FROM sessions WHERE hash=? AND expires>?').bind(await digest(token),Date.now()).first();}
export function siteOrigin(request?:Request){const configured=process.env.APP_URL||(process.env.RAILWAY_PUBLIC_DOMAIN?'https://'+process.env.RAILWAY_PUBLIC_DOMAIN:'');if(configured)return new URL(configured).origin;return request?new URL(request.url).origin:'http://localhost:3000';}
export function cookie(token:string,age=28800){return 'daffa_session='+token+'; HttpOnly; '+(siteOrigin().startsWith('https:')?'Secure; ':'')+'SameSite=Lax; Path=/; Max-Age='+age;}
export function sameOrigin(r:Request){return permittedOrigin(r,siteOrigin(r));}
export function json(data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});}
export async function mediaBytes(id:string){let stored=await files.get(id);if(!stored){const seed=assets.find(x=>x.id===id);if(!seed)return null;await files.put(id,new Uint8Array(Buffer.from(seed.base64,'base64')));stored=await files.get(id);}return stored;}
let accountInitialization:Promise<boolean>|undefined;
export async function ensureAdmin(){
 if(!accountInitialization)accountInitialization=(async()=>{
  const db=database();if(await db.prepare('SELECT id FROM accounts WHERE id=?').bind('owner').first())return true;
  const name=(process.env.ADMIN_NAME||'daffa').trim().toLowerCase(),password=process.env.ADMIN_PASSWORD||'';
  if(!/^[a-z0-9_.-]{3,40}$/.test(name)||password.length<12||password.length>128)return false;
  const salt=randomToken();await db.prepare('INSERT OR IGNORE INTO accounts (id,name,salt,hash,attempts,locked) VALUES (?,?,?,?,0,0)').bind('owner',name,salt,await passwordHash(password,salt)).run();return true;
 })().then(result=>{if(!result)accountInitialization=undefined;return result;}).catch(error=>{accountInitialization=undefined;throw error;});
 return accountInitialization;
}
