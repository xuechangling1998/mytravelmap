import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The World I’ve Explored Through My Lens",
  description: "A personal atlas of travel footprints and photographic memories.",
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
