import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
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
  title: "MedSim AI — Practice Clinical Reasoning with AI Patients",
  description:
    "A virtual patient simulator for medical students to practice diagnostics, history taking, and clinical reasoning with realistic AI-powered patients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${geistMono.variable} antialiased`}
        >
          <ToastProvider />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
