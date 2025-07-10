import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: "SIRIUS Regenerative - Control de Jornada Laboral",
  description: "Sistema de control de horas trabajadas con pausas activas. Transformando personas, regenerando el mundo.",
  keywords: ["jornada laboral", "pausas activas", "bienestar", "SIRIUS", "Colombia"],
  authors: [{ name: "SIRIUS Regenerative" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#7FD1AE",
  manifest: "/manifest.json",
  openGraph: {
    title: "SIRIUS Regenerative - Control de Jornada",
    description: "Cuidamos de ti como cuidamos la tierra. Sistema de jornada laboral con enfoque en bienestar.",
    type: "website",
    locale: "es_CO",
    siteName: "SIRIUS Regenerative"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SIRIUS" />
      </head>
      <body className="h-full antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-starry-night">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
