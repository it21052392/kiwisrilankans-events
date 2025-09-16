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
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  },
  manifest: "/favicon/site.webmanifest",
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
