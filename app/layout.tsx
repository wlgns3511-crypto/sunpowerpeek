import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_NAME = "SunPowerPeek";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunpowerpeek.com";
const GA_ID = "G-795SVW8599";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - US Solar Panel Costs, Savings & Incentives by State`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare solar panel costs, savings, and government incentives across all 50 US states and 500+ ZIP codes. Calculate your solar ROI with our free tools.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${GA_ID}")` }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "SunPowerPeek",
              "url": "https://sunpowerpeek.com",
              "description": "Compare solar panel costs, savings, and government incentives across all 50 US states and 500+ ZIP codes. Calculate your solar ROI with our free tools.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://sunpowerpeek.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "SunPowerPeek",
              "url": "https://sunpowerpeek.com",
              "description": "Compare solar panel costs, savings, and government incentives across all 50 US states and 500+ ZIP codes. Calculate your solar ROI with our free tools.",
              "sameAs": ["https://vocabwize.com", "https://vocablibre.com", "https://wortwize.com", "https://kalimawize.com", "https://dicionariowize.com", "https://kotobapeek.com", "https://salarybycity.com", "https://netpaypeek.com", "https://wagepeek.com", "https://costbycity.com", "https://fairrentwize.com", "https://propertytaxpeek.com", "https://degreewize.com", "https://nameblooms.com", "https://myschoolpeek.com", "https://medcheckwize.com", "https://medcostpeek.com", "https://eldercarepeek.com", "https://ingredipeek.com", "https://caloriewize.com", "https://powerbillpeek.com", "https://shipcalcwize.com", "https://tariffpeek.com", "https://visapeek.com", "https://zippeek.com", "https://calcpeek.com", "https://datapeekfacts.com", "https://guidebycity.com", "https://homepricepeek.com", "https://safecitypeek.com"]
            }
          ]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-orange-700 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              {SITE_NAME}
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/calculator/" className="hover:text-orange-600">Calculator</a>
              <a href="/incentives/" className="hover:text-orange-600">Incentives</a>
              <a href="/compare/california-vs-texas-solar/" className="hover:text-orange-600">Compare</a>
              <a href="/blog/" className="hover:text-orange-600">Guides</a>
              <a href="/es/" className="text-slate-400 hover:text-orange-600 text-xs">ES</a>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>
              Data from the National Renewable Energy Laboratory (NREL), Database of State Incentives for Renewables & Efficiency (DSIRE), and EIA.
            </p>
            <p className="mt-2">
              <a href="/about/" className="hover:text-orange-600">About</a>
              {" | "}
              <a href="/privacy/" className="hover:text-orange-600">Privacy</a>
              {" | "}
              <a href="/terms/" className="hover:text-orange-600">Terms</a>
              {" | "}
              <a href="/disclaimer/" className="hover:text-orange-600">Disclaimer</a>
              {" | "}
              <a href="/contact/" className="hover:text-orange-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://powerbillpeek.com" className="hover:text-orange-600">Power Bills</a>
                <a href="https://calcpeek.com" className="hover:text-orange-600">Calculators</a>
                <a href="https://costbycity.com" className="hover:text-orange-600">Cost of Living</a>
                <a href="https://propertytaxpeek.com" className="hover:text-orange-600">Property Tax</a>
              </div>
            </div>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
