import {database,json} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{await database().prepare('SELECT 1 AS ok').first();return json({ok:true});}catch{return json({ok:false},503);}}
