import type { Metadata } from "next";
import { Geist_Mono, Lato, Space_Grotesk } from "next/font/google";
import { GenerationProvider } from "@/context/GenerationContext";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AlmostCrackd",
  description: "Rate the captions. Judge the memes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${lato.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <GenerationProvider>{children}</GenerationProvider>
      </body>
    </html>
  );
}
