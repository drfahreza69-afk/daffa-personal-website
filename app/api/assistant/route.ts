import { authorized,db,sameOrigin } from '../../security';
import { goals } from '../../data';
export async function POST(r:Request){if(!sameOrigin(r))return Response.json({error:'Permintaan tidak valid.'},{status:403});const user=await authorized();if(!user)return Response.json({error:'Silakan login kembali.'},{status:401});let payload:any;try{payload=await r.json();}catch{return Response.json({error:'Data tidak valid.'},{status:400});}const {question}=payload;if(typeof question!=='string'||question.length>1000)return Response.json({error:'Pertanyaan maksimal 1000 karakter.'},{status:400});const row:any=await db().prepare('SELECT profile FROM identities WHERE user_id=?').bind(user.userId).first();const p=JSON.parse(row.profile),q=question.toLowerCase();let answer='Saya dapat membantu mengenal profil, pengalaman, kemampuan, prinsip, visi, dan kontak Daffa. Pilih salah satu topik tersebut agar jawabannya sesuai dengan profil yang tersedia.';
if(/siapa|profil|who|tentang|about/.test(q))answer=`${p.name} adalah ${p.role} di ${p.industry}. ${p.about}`;
else if(/pengalaman|karier|kerja|career|experience|perusahaan/.test(q))answer=p.career.map((c:any)=>`${c.company}: ${c.position}. ${c.detail}.`).join('\n\n');
else if(/tujuan|visi|future|masa depan|goals|purpose/.test(q))answer=goals.map(g=>`${g[0]}: ${g[1]}`).join('\n\n');
else if(/skill|kemampuan|excel/.test(q))answer=p.skills.map((s:any)=>`${s.name}: ${s.value}% (penilaian diri).`).join('\n');
else if(/kontak|contact|telepon|whatsapp|email|alamat/.test(q))answer=`Lokasi: ${p.address}. Telepon: ${p.phone}.${p.email?' Email: '+p.email+'.':''}`;
else if(/prinsip|mindset|disiplin/.test(q))answer='Discipline creates the person I want to become. Prinsip Daffa: konsistensi, tindakan, pengembangan kemampuan, proses, dan integritas.';
else if(/umur|usia|lahir/.test(q))answer=`Daffa lahir di ${p.birth}. Usia yang tercantum dalam profil: ${p.age} tahun.`;
return Response.json({answer,source:'Profil Daffa. Asisten berbasis pengetahuan, tanpa model generatif.'});}
