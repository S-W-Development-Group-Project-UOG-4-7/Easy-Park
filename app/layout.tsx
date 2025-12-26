import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { ThemeProvider } from "./components/ThemeProvider";
=======
>>>>>>> d9e2d7111374b6e76e3dbc20add936cf18c5bf86

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "EasyPark - Online Car Parking System",
  description: "Book your parking slots online with EasyPark",
=======
  title: "EasyPark | Smart Parking Made Simple",
  description: "Reserve parking spots instantly with EasyPark.",
>>>>>>> d9e2d7111374b6e76e3dbc20add936cf18c5bf86
};

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased

          bg-white text-slate-900
          dark:bg-slate-900 dark:text-slate-100

          transition-colors duration-300
        `}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
=======
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-[#0F172A] to-[#020617] text-slate-100`}
      >
        {children}
>>>>>>> d9e2d7111374b6e76e3dbc20add936cf18c5bf86
      </body>
    </html>
  );
}
