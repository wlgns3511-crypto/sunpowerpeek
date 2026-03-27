import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_NAME = "SunPowerPeek";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunpowerpeek.com";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - US Solar Panel Costs, Savings & Incentives by State`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare solar panel costs, savings, and government incentives across all 50 US states and 500+ ZIP codes. Calculate your solar ROI with our free tools.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-orange-700 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              {SITE_NAME}
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/calculator" className="hover:text-orange-600">Calculator</a>
              <a href="/incentives" className="hover:text-orange-600">Incentives</a>
              <a href="/compare/california-vs-texas-solar/" className="hover:text-orange-600">Compare</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>
              Data from the National Renewable Energy Laboratory (NREL), Database of State Incentives for Renewables & Efficiency (DSIRE), and EIA.
            </p>
            <p className="mt-2">
              <a href="/about" className="hover:text-orange-600">About</a>
              {" | "}
              <a href="/privacy" className="hover:text-orange-600">Privacy</a>
              {" | "}
              <a href="/terms" className="hover:text-orange-600">Terms</a>
              {" | "}
              <a href="/contact" className="hover:text-orange-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">DataPeek Insights Network</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://salarybycity.com" className="hover:text-orange-600">Salaries</a>
                <a href="https://costbycity.com" className="hover:text-orange-600">Cost of Living</a>
                <a href="https://zippeek.com" className="hover:text-orange-600">ZIP Codes</a>
                <a href="https://guidebycity.com" className="hover:text-orange-600">City Guides</a>
                <a href="https://degreewize.com" className="hover:text-orange-600">Colleges</a>
                <a href="https://caloriewize.com" className="hover:text-orange-600">Nutrition</a>
                <a href="https://nameblooms.com" className="hover:text-orange-600">Baby Names</a>
                <a href="https://vocabwize.com" className="hover:text-orange-600">Vocabulary</a>
                <a href="https://calcpeek.com" className="hover:text-orange-600">Calculators</a>
                <a href="https://tariffpeek.com" className="hover:text-orange-600">HS Codes &amp; Tariffs</a>
                <a href="https://ingredipeek.com" className="hover:text-orange-600">Food Allergens</a>
                <a href="https://propertytaxpeek.com" className="hover:text-orange-600">Property Tax</a>
                <a href="https://shipcalcwize.com" className="hover:text-orange-600">Shipping Calculator</a>
                <a href="https://powerbillpeek.com" className="hover:text-orange-600">Power Bills</a>
                <a href="https://eldercarepeek.com" className="hover:text-orange-600">Elder Care</a>
                <a href="https://sunpowerpeek.com" className="hover:text-orange-600 font-semibold">Solar Power</a>
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
