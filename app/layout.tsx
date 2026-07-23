import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The World I’ve Explored",
  description: "A personal map of 42 flights and 23 cities explored across the world.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
