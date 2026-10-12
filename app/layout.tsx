import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Daffa Rifki Fahreza | Digital Headquarters',description:'Discover the career, skills, principles, and future vision of Daffa Rifki Fahreza, a Document Control Professional in the telecommunication industry.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'},openGraph:{title:'Daffa Rifki Fahreza',description:'Building skills. Creating value. Designing the future.',type:'profile'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>;}
