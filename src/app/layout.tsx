import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/layout/SchemaMarkup";
import { GDPRConsent } from "@/components/layout/GDPRConsent";
import { AdSpace } from "@/components/ui/AdSpace";

import { AuthContext } from "@/components/layout/AuthContext";
import clientPromise from "@/lib/mongodb";
import VisitorTracker from '@/components/VisitorTracker';

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

interface Settings {
  adSenseId?: string;
  headerScripts?: string;
  footerScripts?: string;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
}

async function getSettings(): Promise<Settings> {
  try {
    const client = await clientPromise;
    const db = client.db('ilovepdftools');
    const settings = await db.collection('settings').findOne({ type: 'global_monetization' });
    return (settings as unknown as Settings) || {};
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return {};
  }
}

export const metadata: Metadata = {
  title: "pdffileconverter | Free Online PDF & File Converter",
  description: "Every tool you need to use PDFs, images, and documents in one place. Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.",
  keywords: "pdf tools, file converter, merge pdf, split pdf, compress pdf, pdf to word, jpg to pdf",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <head>
        <SchemaMarkup />
        {/* AdSense Script */}
        {/* AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7516452210223319"
          crossOrigin="anonymous"
        />
        {/* Custom Header Scripts */}
        {settings.headerScripts && (
          <div dangerouslySetInnerHTML={{ __html: settings.headerScripts }} />
        )}
      </head>
      <body className={inter.className}>
        <VisitorTracker />
        <AuthContext>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              {settings.showHeaderAd !== false && (
                <div className="container">
                  <AdSpace type="header" />
                </div>
              )}
              <main className="flex-grow">
                {children}
              </main>
              {settings.showFooterAd !== false && (
                <div className="container">
                  <AdSpace type="footer" />
                </div>
              )}
              <Footer />
              <GDPRConsent />

              {/* Custom Footer Scripts */}
              {settings.footerScripts && (
                <div dangerouslySetInnerHTML={{ __html: settings.footerScripts }} />
              )}
            </div>
          </ThemeProvider>
        </AuthContext>
      </body>
    </html>
  );
}
