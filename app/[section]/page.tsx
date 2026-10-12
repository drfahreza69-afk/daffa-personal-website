import {notFound} from 'next/navigation';
import PublicSite from '../../components/public-site';
import {publicProfile} from '../../lib/server';
import {publicTabs} from '../../lib/data';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;return {title:publicTabs.find(t=>t.toLowerCase()===section)||'Daffa'};}
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;const tab=publicTabs.find(t=>t.toLowerCase()===section);if(!tab||tab==='Home')notFound();return <PublicSite profile={await publicProfile()} section={tab}/>;}
