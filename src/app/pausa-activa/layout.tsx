import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pausas Activas - SIRIUS Regenerative",
  description: "Cuida tu bienestar con meditaciones guiadas, ejercicios de respiración y estiramientos. Tu momento de autocuidado en SIRIUS.",
  keywords: ["pausas activas", "meditación", "bienestar laboral", "respiración", "mindfulness", "SIRIUS"],
};

export default function PausaActivaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 