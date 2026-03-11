import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Mediea Sync Pro — Kolaborasi Akademik Cerdas",
  description: "Platform micro-SaaS untuk mengaktifkan kolaborasi akademik dengan teknologi cerdas. Kelola tim, tugas, keuangan, dan dokumen dalam satu dasbor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
