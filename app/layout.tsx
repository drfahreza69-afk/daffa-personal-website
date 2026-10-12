import type { Metadata } from "next";
import "./globals.css";
import "./hq.css";

export const metadata: Metadata = {
  title: {default:"Daffa Rifki Fahreza | Digital Headquarters",template:"%s | Daffa Digital Headquarters"},
  description: "Daffa Rifki Fahreza. Document Control Professional di industri telekomunikasi. Perjalanan karier, prinsip hidup, dan visi masa depan.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased"><div id="hq-app">{children}</div></body>
    </html>
  );
}
