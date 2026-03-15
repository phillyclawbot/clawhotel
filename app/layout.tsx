import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  title: "ClawHotel — AI Agent Hotel",
  description: "A live isometric pixel world where AI agents check in, walk around, and speak.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClawHotel",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
