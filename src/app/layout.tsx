import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "KR Servicos e Importacoes | Perfumes Importados",
    template: "%s | KR Servicos e Importacoes",
  },
  description:
    "Perfumes importados com curadoria. Compre pelo catalogo e finalize seu pedido no WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}
