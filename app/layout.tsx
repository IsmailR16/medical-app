import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedSim AI — Träna kliniskt resonemang med AI-patienter",
  description:
    "En virtuell patientsimulatör för läkarstudenter att träna diagnostik, anamnestagning och kliniskt resonemang med realistiska AI-drivna patienter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="sv">
        <body
          className={`${inter.variable} ${geistMono.variable} antialiased`}
        >
          <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
