import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tangled Fates",
  description:
    "An AI-powered multiplayer adventure where your choices shape the story",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-medieval-dark-bg`}
      >
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center">
              <div>Loading!</div>
            </div>
          }
        >
          <ClerkProvider>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
