import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Luiz Freitas",
  description: "Transformando ideias em realidade!\nFull Stack Developer especializado em Node.js, React, Next.js, TypeScript, Ruby on Rails, Docker, entre outras tecnologias.\nConstruo soluções inovadoras e escaláveis para impulsionar seu negócio para o futuro.\nVisite meu site para descobrir como posso ajudar você a alcançar seus objetivos digitais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-950 text-gray-200`}>{children}</body>
    </html>
  );
}
