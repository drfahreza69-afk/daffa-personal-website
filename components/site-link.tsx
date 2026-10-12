import type {AnchorHTMLAttributes} from 'react';
// Document navigation keeps links usable even before JavaScript has loaded.
export default function Link(props:AnchorHTMLAttributes<HTMLAnchorElement>){return <a {...props}/>;}
