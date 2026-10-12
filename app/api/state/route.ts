import {readHQ,publicProfile,isAdmin,database,json,sameOrigin} from '../../../lib/server';
import {profileSchema,empireSchema} from '../../../lib/validation';
export const dynamic='force-dynamic';
export async function GET(r:Request){if(new URL(r.url).searchParams.get('public')==='1')return json({profile:await publicProfile()});if(!await isAdmin())return json({error:'Silakan login sebagai admin.'},401);return json(await readHQ());}
export async function POST(r:Request){
if(!sameOrigin(r))return json({error:'Permintaan tidak valid.'},403);if(!await isAdmin())return json({error:'Sesi berakhir. Silakan login kembali.'},401);
if(Number(r.headers.get('content-length')||0)>2000000)return json({error:'Data terlalu besar.'},413);
let b:Record<string,unknown>;try{const value=await r.json();if(!value||typeof value!=='object')return json({error:'Data tidak valid.'},400);b=value as Record<string,unknown>;}catch{return json({error:'Data tidak valid.'},400);}
const p=profileSchema.safeParse(b.profile),e=empireSchema.safeParse(b.empire);
if(!p.success||!e.success||!Number.isInteger(b.revision))return json({error:'Data tidak valid. Periksa isian formulir.'},400);
const ids=p.data.photos.map(x=>x.id);if(new Set(ids).size!==ids.length)return json({error:'Foto ganda pada inventaris.'},400);
const db=database();const found=await db.prepare('SELECT id FROM media WHERE deleted=0').all<{id:string}>();const valid=new Set(found.results.map(x=>x.id));
if(ids.some(id=>!valid.has(id))||p.data.cvId&&!valid.has(p.data.cvId))return json({error:'File tidak tersedia.'},400);
const revision=b.revision as number,profileText=JSON.stringify(p.data);
const res=await db.batch([db.prepare('UPDATE headquarters SET profile=?,empire=?,revision=revision+1 WHERE id=1 AND revision=?').bind(profileText,JSON.stringify(e.data),revision),...p.data.photos.map(photo=>db.prepare('UPDATE media SET visibility=? WHERE id=? AND EXISTS (SELECT id FROM headquarters WHERE id=1 AND revision=? AND profile=?)').bind(photo.visibility,photo.id,revision+1,profileText))]);
if(!res[0].meta.changes)return json({error:'Data berubah di sesi lain. Muat ulang sebelum menyimpan.'},409);
return json({ok:true,revision:revision+1});
}
