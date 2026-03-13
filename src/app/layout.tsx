import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Agentation } from "agentation";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crpko Graphics",
  description: "Crpko Graphics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SplashScreen />
        <header>
          <span className="logo">Crpko Graphics</span>
        </header>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
