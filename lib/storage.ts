import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {readFile,writeFile,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

export const dataDirectory=()=>path.resolve(process.env.DATA_DIR||path.join(process.cwd(),'data'));
const schema=`
CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY,name TEXT NOT NULL,salt TEXT NOT NULL,hash TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,locked INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS headquarters(id INTEGER PRIMARY KEY,profile TEXT NOT NULL,empire TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,mime TEXT NOT NULL,name TEXT NOT NULL,visibility TEXT NOT NULL DEFAULT 'private',deleted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS session_expiration ON sessions(expires);
`;
class Query{
 values:SQLInputValue[]=[];
 constructor(readonly db:DatabaseSync,readonly sql:string){}
 bind(...values:SQLInputValue[]){this.values=values;return this;}
 async first<T>(){return this.db.prepare(this.sql).get(...this.values) as T|undefined;}
 async all<T>(){return {results:this.db.prepare(this.sql).all(...this.values) as T[]};}
 runSync(){const result=this.db.prepare(this.sql).run(...this.values);return {meta:{changes:Number(result.changes)}};}
 async run(){return this.runSync();}
}
export class LocalDatabase{
 constructor(readonly connection:DatabaseSync){}
 prepare(sql:string){return new Query(this.connection,sql);}
 async batch(statements:Query[]){
  this.connection.exec('BEGIN IMMEDIATE');
  try{const results=statements.map(statement=>statement.runSync());this.connection.exec('COMMIT');return results;}
  catch(error){this.connection.exec('ROLLBACK');throw error;}
 }
}
const globalStore=globalThis as typeof globalThis&{__daffaSqlite?:LocalDatabase};
export function localDatabase(){
 if(!globalStore.__daffaSqlite){
  const directory=dataDirectory();mkdirSync(directory,{recursive:true});
  const db=new DatabaseSync(path.join(directory,'headquarters.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');db.exec(schema);
  globalStore.__daffaSqlite=new LocalDatabase(db);
 }
 return globalStore.__daffaSqlite;
}
function mediaPath(id:string){if(!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw Error('ID file tidak valid.');return path.join(dataDirectory(),'uploads',id);}
export const files={
 async get(id:string){try{const bytes=await readFile(mediaPath(id));return {body:new Uint8Array(bytes)};}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw error;}},
 async put(id:string,bytes:Uint8Array){const destination=mediaPath(id);mkdirSync(path.dirname(destination),{recursive:true});const temporary=destination+'.'+randomUUID()+'.tmp';try{await writeFile(temporary,bytes,{mode:0o600});await rename(temporary,destination);}finally{await unlink(temporary).catch(()=>{});}},
 async delete(id:string){try{await unlink(mediaPath(id));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}},
};
