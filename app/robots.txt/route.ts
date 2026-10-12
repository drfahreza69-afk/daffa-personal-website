import {siteOrigin} from '../../lib/server';
export const dynamic='force-dynamic';
export function GET(request:Request){return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: '+siteOrigin(request)+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
