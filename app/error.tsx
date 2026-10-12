'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><span className="monogram">DRF</span><h1>Halaman belum dapat dimuat.</h1><p>Coba kembali beberapa saat lagi.</p><button className="button gold" onClick={reset}>Coba lagi</button></main>;}
