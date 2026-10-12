import {publicTabs} from '../../lib/data';
import {siteOrigin} from '../../lib/server';
export const dynamic='force-dynamic';
export function GET(request:Request){const origin=siteOrigin(request);const urls=publicTabs.map(t=>'<url><loc>'+origin+(t==='Home'?'/':'/'+t.toLowerCase())+'</loc><changefreq>monthly</changefreq></url>').join('');return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});}
