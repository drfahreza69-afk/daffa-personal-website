import {randomBytes} from 'node:crypto';
import {existsSync,writeFileSync} from 'node:fs';
if(existsSync('.env.local')){console.log('.env.local sudah ada. Gunakan SETUP_KEY yang tercantum di file tersebut.');process.exit(0);}
const key=randomBytes(32).toString('hex');
writeFileSync('.env.local',`APP_URL=http://localhost:3000\nSETUP_KEY=${key}\nDATA_DIR=./data\n`,{mode:0o600});
console.log('Konfigurasi dibuat. Buka .env.local dan gunakan nilai SETUP_KEY sebagai kunci aktivasi pada login pertama.');
