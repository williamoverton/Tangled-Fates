import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
    "An AI-powered living, breathing world where your adventure intertwines with others. Discover secrets, forge your path, and leave your mark on a shared universe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background`}
      >
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center">
              <LoadingSpinner
                variant="large"
                size="lg"
                text="Loading Tangled Fates..."
              />
            </div>
          }
        >
          <ClerkProvider>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
