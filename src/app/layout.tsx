import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DemoBanner } from "@/components/DemoBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meme AI — Swap yourself into viral memes",
  description:
    "Open-source meme face & body swap. Client-side API keys. Self-host or try the demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <DemoBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
