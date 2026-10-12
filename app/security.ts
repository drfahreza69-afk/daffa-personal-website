import { cookies } from 'next/headers';
import { db } from './storage';
export { db } from './storage';
export const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
export const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export async function digest(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
export async function hashPassword(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256));}
export function equal(a:string,b:string){let v=a.length^b.length;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^(b.charCodeAt(i)||0);return v===0;}
export function sameOrigin(r:Request){const expected=process.env.APP_URL||new URL(r.url).origin;try{return r.headers.get('origin')===new URL(expected).origin;}catch{return false;}}
export function sessionCookie(token:string,maxAge=28800){const secure=process.env.APP_URL?.startsWith('https://')?' Secure;':'';return `daffa_session=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${maxAge}`;}
export async function authorized(){const token=(await cookies()).get('daffa_session')?.value;if(!token)return null;const session=await db().prepare('SELECT user_id FROM sessions WHERE token_hash=? AND expires>?').bind(await digest(token),Date.now()).first();return session?{userId:String(session.user_id)}:null;}
