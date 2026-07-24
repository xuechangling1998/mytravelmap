import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The World I’ve Explored",
  description: "Import your flight history and turn every journey into a personal travel map.",
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
