import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "怪异·记忆｜物语系列冷知识测验",
  description: "从完整题库随机抽取 30 题的物语系列冷知识挑战。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
