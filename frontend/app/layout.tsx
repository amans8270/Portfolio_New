import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Aman Singh — Software Developer",
  description:
    "Full-stack software developer specializing in React, Next.js, FastAPI, and AI-powered systems. Available for full-time roles and exciting projects.",
  keywords: ["Aman Singh", "Software Developer", "Full Stack", "React", "Next.js", "FastAPI", "Portfolio"],
  authors: [{ name: "Aman Singh" }],
  openGraph: {
    title: "Aman Singh — Software Developer",
    description: "Full-stack developer building scalable web apps and AI systems.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-[#030712] text-white`}>
        {children}
      </body>
    </html>
  );
}
