import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
  description:
    "AI-driven klinisk träning för nästa generation läkare. Träna på realistiska patientfall, utveckla diagnostiska färdigheter och få omedelbar återkoppling.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="scroll-smooth">
      <body
        className={`${jakarta.variable} ${jetbrains.variable} antialiased`}
      >
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
