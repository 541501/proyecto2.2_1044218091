import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import QueryClient from "@/lib/query-client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClassSport - Gestión de Salones Universitarios",
  description:
    "Plataforma integral para la gestión y reserva de salones académicos en instituciones educativas",
  viewport: "width=device-width, initial-scale=1",
  keywords: [
    "gestión de salones",
    "reserva de aulas",
    "educación",
    "universidad",
    "académico",
  ],
  authors: [
    {
      name: "ClassSport Team",
    },
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://classsport.edu",
    siteName: "ClassSport",
    title: "ClassSport - Gestión de Salones Universitarios",
    description:
      "Plataforma integral para la gestión y reserva de salones académicos",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body>
        <SessionProvider>
          <QueryClientProvider>
            {children}
            <Toaster position="top-right" />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
