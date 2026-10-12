import {existsSync,writeFileSync} from 'node:fs';
if(existsSync('.env.local')){console.log('.env.local sudah ada. Tidak ada kunci tambahan yang diperlukan.');process.exit(0);}
writeFileSync('.env.local',`APP_URL=http://localhost:3000\nDATA_DIR=./data\n`,{mode:0o600});
console.log('Konfigurasi dibuat. Buka website lalu buat akun admin pertama dengan username dan password.');
