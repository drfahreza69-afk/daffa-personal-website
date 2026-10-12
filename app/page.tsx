import PublicSite from '../components/public-site';
import {publicProfile} from '../lib/server';
export const dynamic='force-dynamic';
export default async function Home(){return <PublicSite profile={await publicProfile()}/>;}
