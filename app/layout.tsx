import type { Metadata } from "next";
import { Geist_Mono, Caudex } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const caudex = Caudex({
  variable: "--font-caudex",
  weight: ["400"] as const,
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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${caudex.variable} ${geistMono.variable} font-sans antialiased bg-medieval-dark-bg`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16 text-white bg-medieval-header-bg">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-clerk-primary text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:opacity-90 transition-opacity">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
