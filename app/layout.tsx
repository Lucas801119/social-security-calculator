import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "五险一金计算器",
  description: "计算公司为员工缴纳的社保公积金费用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
