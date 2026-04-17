import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diagnostika.se"),
  title: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
  description:
    "AI-driven klinisk träning för nästa generation läkare. Träna på realistiska patientfall, utveckla diagnostiska färdigheter och få omedelbar återkoppling.",
  openGraph: {
    title: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
    description:
      "Öva diagnostik, patientintervjuer och behandlingsplanering i en riskfri miljö med realistiska AI-patienter.",
    url: "https://diagnostika.se",
    siteName: "Diagnostika",
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnostika | Träna kliniskt resonemang med AI-patienter",
    description:
      "Öva diagnostik, patientintervjuer och behandlingsplanering i en riskfri miljö med realistiska AI-patienter.",
  },
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
    <html lang="sv" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
