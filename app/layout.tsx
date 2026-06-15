import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天机六爻 — 古老的智慧，为你照亮前路",
  description: "基于传统六爻占卜体系，结合生辰八字与地理位置，为您提供专业的卦象分析与人生指导。",
  keywords: "六爻,占卜,易经,周易,算命,财运,正缘,事业",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
