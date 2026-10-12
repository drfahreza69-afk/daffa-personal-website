import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {authorized,db} from '../../../security';
import {dataDirectory} from '../../../storage';
export const runtime='nodejs';
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){const user=await authorized();if(!user)return new Response('Unauthorized',{status:401});const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});const item=await db().prepare('SELECT content_type FROM media WHERE id=? AND user_id=?').bind(id,user.userId).first();if(!item)return new Response('Not found',{status:404});try{const file=await readFile(join(dataDirectory(),'uploads',id));return new Response(new Uint8Array(file),{headers:{'Content-Type':String(item.content_type),'Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}}
