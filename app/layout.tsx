import type { Metadata } from "next";
import { Geist_Mono, Metamorphous } from "next/font/google";
import "./globals.css";

const metamorphous = Metamorphous({
  variable: "--font-metamorphous",
  weight: ["400"] as const,
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Choose Your Own Adventure Multiplayer",
  description: "A multiplayer choose your own adventure game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${metamorphous.variable} ${geistMono.variable} font-sans text-lg antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
