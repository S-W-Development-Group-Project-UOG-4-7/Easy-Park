import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthModalProvider } from "./components/AuthModalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyPark | Smart Parking Made Simple",
  description: "Reserve parking spots instantly with EasyPark.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased
          min-h-screen
          bg-white text-slate-900
          dark:bg-linear-to-br dark:from-[#0F172A] dark:to-[#020617] dark:text-slate-100
          transition-colors duration-300
        `}
      >
        <ThemeProvider>
          <AuthModalProvider>
            {children}
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
