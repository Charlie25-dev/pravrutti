import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";
import { AuthProvider } from "../lib/auth";

export const metadata: Metadata = {
  title: "RITVYA | Holistic PCOS & Cycle Companion",
  description:
    "A private, stigma-free health companion for women and girls managing PCOS across all life stages.",
  manifest: "/manifest.json",
  icons: {
    icon: "/ritvya_icon.png",
    apple: "/ritvya_icon.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RITVYA"
  }
};

export const viewport: Viewport = {
  themeColor: "#54224A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/ritvya_icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF4F3] text-stone-900 dark:bg-[#140C15] dark:text-stone-100 transition-colors">
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
