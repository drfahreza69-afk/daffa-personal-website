import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { resolve, join } from 'node:path';
let database:DatabaseSync|undefined;
export function dataDirectory(){return resolve(process.env.DATA_DIR||join(process.cwd(),'data'));}
export function connection(){if(database)return database;const directory=dataDirectory();mkdirSync(directory,{recursive:true,mode:0o700});const file=join(directory,'profile.sqlite');database=new DatabaseSync(file);chmodSync(file,0o600);database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS identities (user_id TEXT PRIMARY KEY, username TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, profile TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, content_type TEXT NOT NULL);`);return database;}
export function db(){return {prepare(sql:string){let params:SQLInputValue[]=[];const statement={bind(...values:SQLInputValue[]){params=values;return statement;},async first(){return connection().prepare(sql).get(...params)??null;},async run(){return connection().prepare(sql).run(...params);}};return statement;},async batch(statements:{run:()=>Promise<unknown>}[]){const conn=connection();conn.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());conn.exec('COMMIT');return results;}catch(error){conn.exec('ROLLBACK');throw error;}}};}
