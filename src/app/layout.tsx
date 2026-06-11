import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ici le Mondial Golfe 1 Digital Fan Zone | Lomé, Togo — Mairie du Golfe × ESCEN",
  description: "Plateforme officielle de l'événement Ici le Mondial Golfe 1 Digital Fan Zone à Lomé, Togo. Inscrivez-vous gratuitement pour obtenir votre badge d'accès. Une initiative de la Mairie du Golfe en partenariat avec ESCEN Expert Pro.",
  icons: {
    icon: "/logo-escen.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo-escen.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-space selection:bg-primary-yellow selection:text-black min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
