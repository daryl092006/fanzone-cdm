import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Fan Zone Coupe du Monde 2026 | Lomé, Togo — Mairie du Golfe × ESCEN",
  description: "Plateforme officielle de la Fan Zone Coupe du Monde 2026 à Lomé, Togo. Inscrivez-vous gratuitement pour obtenir votre badge d'accès. Une initiative de la Mairie du Golfe en partenariat avec ESCEN Expert Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${space.variable} scroll-smooth`}>
      <body className="antialiased font-space selection:bg-yellow-400 selection:text-black min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
