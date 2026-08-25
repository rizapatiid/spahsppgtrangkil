import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPAH SPPG Trangkil",
  description: "Sistem Pelaporan Aktivitas Harian",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans antialiased`}
    >
      <body className="flex flex-col font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
