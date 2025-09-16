import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kiwi Sri Lankans Events",
  description: "Connect with the Sri Lankan community in New Zealand through meaningful events and experiences.",
  keywords: ["Sri Lankan", "New Zealand", "Events", "Community", "Auckland", "Cultural"],
  authors: [{ name: "Kiwi Sri Lankans Events" }],
  openGraph: {
    title: "Kiwi Sri Lankans Events",
    description: "Connect with the Sri Lankan community in New Zealand through meaningful events and experiences.",
    type: "website",
    locale: "en_NZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
