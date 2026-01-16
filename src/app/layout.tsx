import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Word Search Generator | Create & Play Online",
    template: "%s | Word Search Generator"
  },
  description: "Free online word search maker. Create custom printable puzzles, play online, or share with friends. No signup required.",
  keywords: ["word search", "puzzle maker", "word search generator", "educational games", "classroom tools", "printable puzzles"],
  authors: [{ name: "StagWare" }],
  creator: "StagWare",
  publisher: "StagWare",
  applicationName: "Word Search Generator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wordsearch.stagware.com", // Placeholder URL
    title: "Word Search Generator | Create & Play Online",
    description: "Create, print, and share custom word search puzzles instantly.",
    siteName: "Word Search Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Search Generator",
    description: "Create, print, and share custom word search puzzles instantly.",
    creator: "@bstag", // Placeholder
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Security Enhancement: Content Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
        />
        {/* Security Enhancement: Referrer Policy */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}
