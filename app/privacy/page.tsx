import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

const LEGAL_REVIEWED = LEGAL_VINTAGES.privacy;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for SunPowerPeek.",
  alternates: { canonical: "/privacy/" },
  openGraph: { url: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        SunPowerPeek (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website sunpowerpeek.com. This
        page informs you of our policies regarding the collection, use, and disclosure of personal information when
        you use our website. SunPowerPeek publishes a US residential solar dataset derived from NREL PVWatts (the
        NSRDB peak-sun-hours data published by the National Renewable Energy Laboratory), the DSIRE Database (state
        incentive snapshots maintained by the N.C. Clean Energy Technology Center at NC State University), the EIA
        monthly retail electricity rate publication (issued by the US Energy Information Administration), and IRS
        Form 5695 (the 30% federal Residential Clean Energy Credit under the Inflation Reduction Act through 2032).
        The data we publish from NREL PVWatts, DSIRE, EIA, and IRS Form 5695 is public and aggregated; this policy
        describes what we collect from visitors browsing the published NREL PVWatts, DSIRE, EIA, and IRS Form 5695
        view and how we treat that visitor-side information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What this privacy policy does not cover</h2>
      <p>
        This privacy policy does not cover the upstream data publishers we cite. NREL PVWatts and the NSRDB are
        published by the National Renewable Energy Laboratory and operate under their own privacy and use terms at
        nrel.gov. The DSIRE Database is maintained by the N.C. Clean Energy Technology Center at NC State University
        and operates under its own terms at dsireusa.org. The EIA monthly retail electricity rate publication is
        published by the US Energy Information Administration and operates under eia.gov terms. IRS Form 5695 and
        associated 30% Residential Clean Energy Credit guidance under the Inflation Reduction Act through 2032 are
        published by the Internal Revenue Service and operate under irs.gov terms. Anyone with concerns about the
        upstream NREL PVWatts, DSIRE Database, EIA monthly retail-rate, or IRS Form 5695 data sources should consult
        the named NREL, DSIRE, EIA, or IRS authority directly. SunPowerPeek relays the NREL PVWatts, DSIRE, EIA, and
        IRS Form 5695 data; it does not modify, certify, or warrant the underlying NREL PVWatts, DSIRE, EIA, or IRS
        Form 5695 publications.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect</h2>
      <p>
        We do not require you to create an account or provide personal information to use our website or to view the
        NREL PVWatts, DSIRE Database, EIA monthly retail-rate, and IRS Form 5695 reference layers we publish. However,
        we may automatically collect certain information when you visit, including your IP address, browser type,
        operating system, referring URLs, and pages viewed. This information is collected through server logs and
        analytics tools. We do not collect roof-level installer-quote data, IRS Form 5695 tax-filing data, or
        utility-account-level EIA retail-rate billing data — those NREL PVWatts production estimates, DSIRE incentive
        applications, EIA retail billing details, and IRS Form 5695 ITC filings remain with the original NREL, DSIRE,
        EIA, or IRS publication channel and the user&apos;s installer / utility / CPA.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Cookies and Tracking Technologies</h2>
      <p>
        Our website uses cookies and similar tracking technologies to improve your browsing experience and to analyze
        site traffic on the NREL PVWatts, DSIRE Database, EIA monthly retail-rate, and IRS Form 5695 reference views
        we publish. Cookies are small data files stored on your device. You can instruct your browser to refuse all
        cookies or to indicate when a cookie is being sent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Google AdSense</h2>
      <p>
        We use Google AdSense to display advertisements on our website. Google AdSense may use cookies and web
        beacons to serve ads based on your prior visits to our website or other websites. You may opt out of
        personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>{" "}or visit{" "}
        <a href="https://www.aboutads.info/choices/" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Services</h2>
      <p>
        We may use third-party services such as Google Analytics to monitor and analyze web traffic on the NREL
        PVWatts, DSIRE Database, EIA monthly retail-rate, and IRS Form 5695 published views. Their use of this
        information is governed by their respective privacy policies. When you click an outbound NREL PVWatts at
        pvwatts.nrel.gov link, a DSIRE Database at dsireusa.org link, an EIA monthly retail-rate at eia.gov link, or
        an IRS Form 5695 at irs.gov link, the destination NREL, DSIRE, EIA, or IRS privacy policy applies to your
        interaction with that publisher.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Security</h2>
      <p>
        We take reasonable measures to protect the information collected through our website and the NREL PVWatts,
        DSIRE Database, EIA monthly retail-rate, and IRS Form 5695 published reference data. However, no method of
        transmission over the internet is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Children&apos;s Privacy</h2>
      <p>
        Our website is not directed at children under the age of 13. We do not knowingly collect personal information
        from children under 13. The NREL PVWatts, DSIRE Database, EIA monthly retail-rate, and IRS Form 5695 source
        materials we surface are adult-audience financial and tax-credit references.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. Any changes will be posted on this page with an updated
        revision date. Material changes that affect how we publish or relay NREL PVWatts, DSIRE Database, EIA monthly
        retail-rate, or IRS Form 5695 data will be reflected in the Last Reviewed timestamp.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        If you have any questions about this privacy policy, please visit our{" "}
        <a href="/contact" className="text-orange-600 hover:underline">Contact page</a>. Concerns about how the
        upstream NREL PVWatts, DSIRE Database, EIA, or IRS Form 5695 authorities handle data on their own sites
        should be raised with NREL, DSIRE, EIA, or IRS directly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Part of DataPeek Facts Network</h2>
      <p>
        SunPowerPeek is part of the{" "}
        <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          DataPeek Facts
        </a>{" "}
        network of free US data tools. For general inquiries about our data network, privacy practices, or partnership
        opportunities, please contact the DataPeek Facts team at{" "}
        <a href="mailto:datapeekfacts@gmail.com" className="text-blue-600 hover:underline">
          datapeekfacts@gmail.com
        </a>
        . You can also visit the{" "}
        <a href="https://datapeekfacts.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          DataPeek Facts Privacy Policy
        </a>{" "}
        for network-wide privacy information.
      </p>

      <AuthorBox />
    </article>
  );
}
