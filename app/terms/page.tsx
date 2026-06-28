import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

const LEGAL_REVIEWED = LEGAL_VINTAGES.terms;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for SunPowerPeek.",
  alternates: { canonical: "/terms/" },
  openGraph: { url: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time>
      </p>

      <p>
        Welcome to SunPowerPeek. By accessing or using our website at sunpowerpeek.com, you agree to be bound by these
        Terms of Service. If you do not agree to these terms, please do not use our website. SunPowerPeek publishes
        a US residential solar reference layer that joins NREL PVWatts (the National Renewable Energy Laboratory&apos;s
        NSRDB peak-sun-hours dataset), the DSIRE Database (the Database of State Incentives for Renewables and
        Efficiency maintained by the N.C. Clean Energy Technology Center at NC State University), the EIA monthly
        retail electricity rate publication (issued by the US Energy Information Administration), and IRS Form 5695
        (the federal Residential Clean Energy Credit at 30% under the Inflation Reduction Act through 2032). These
        terms govern your use of the SunPowerPeek website and the published view of the NREL PVWatts, DSIRE Database,
        EIA, and IRS Form 5695 sourced data.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What these terms do not cover</h2>
      <p>
        These Terms of Service govern only your use of SunPowerPeek and the view we publish of the underlying NREL
        PVWatts NSRDB, DSIRE Database, EIA monthly retail-rate publication, and IRS Form 5695 source data. They do not
        replace, modify, or override the terms under which the upstream data is published. NREL PVWatts and the NSRDB
        are published by the National Renewable Energy Laboratory under its own terms at nrel.gov. The DSIRE Database
        is published by the N.C. Clean Energy Technology Center at NC State University under its own terms at
        dsireusa.org. The EIA monthly retail-rate publication is published by the US Energy Information Administration
        under eia.gov terms. IRS Form 5695 and the 30% federal Investment Tax Credit guidance under the Inflation
        Reduction Act through 2032 are published by the Internal Revenue Service under irs.gov terms. Concerns about
        upstream NREL PVWatts, DSIRE, EIA, or IRS Form 5695 publication should be raised with the named authority
        directly. SunPowerPeek relays the NREL PVWatts, DSIRE, EIA, and IRS Form 5695 data; it does not modify,
        certify, or warrant the underlying NREL PVWatts, DSIRE Database, EIA, or IRS Form 5695 publications.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Use of the Website</h2>
      <p>
        SunPowerPeek provides US residential solar reference data anchored to NREL PVWatts NSRDB peak-sun-hours,
        DSIRE Database state-incentive snapshots, the EIA monthly retail electricity rate publication, and IRS Form
        5695 federal ITC math for informational and educational purposes only. The four editorial reading layers
        (ItcPaybackBand 5-tier, NetMeteringTier 5-tier DSIRE decoder, SolarIrradianceTier 5-band NREL PVWatts
        classifier, and SolarInterpretation composite verdict) are also editorial reading layers — not binding
        recommendations, tax-credit opinions, or installer quotes. You may use the website for personal,
        non-commercial purposes. The published NREL PVWatts averages, DSIRE-published incentive snapshots, EIA
        retail-rate denominators, and IRS Form 5695 ITC math we surface should not be the sole basis for solar
        installation, financial, or tax-credit decisions; for installation, consult a NABCEP-certified installer,
        and for the IRS Form 5695 ITC interaction with your specific tax liability, consult a licensed CPA.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy of Information</h2>
      <p>
        While we strive to provide accurate and up-to-date information, we make no warranties regarding the
        completeness or accuracy of content on this website. The data presented is sourced from publicly available
        datasets — specifically NREL PVWatts and the NSRDB peak-sun-hours data published by the National Renewable
        Energy Laboratory, the DSIRE Database of State Incentives for Renewables and Efficiency maintained by the
        N.C. Clean Energy Technology Center at NC State University, the EIA monthly retail electricity rate
        publication issued by the US Energy Information Administration, and IRS Form 5695 and associated 30%
        Residential Clean Energy Credit guidance under the Inflation Reduction Act through 2032 published by the
        Internal Revenue Service. Actual solar costs, NREL PVWatts production, DSIRE-eligible incentive amounts, EIA
        retail-rate exposure, and IRS Form 5695 ITC benefit may vary based on your specific situation, installer,
        equipment, roof condition, utility, and tax liability. Where SunPowerPeek and a current NREL PVWatts, DSIRE
        Database, EIA, or IRS Form 5695 publication disagree, the named NREL PVWatts, DSIRE, EIA, or IRS Form 5695
        source is authoritative.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
      <p>
        The content, design, layout, and editorial reading layers (ItcPaybackBand, NetMeteringTier, SolarIrradianceTier,
        and SolarInterpretation) of this website are the property of SunPowerPeek and are protected by copyright and
        other intellectual property laws. Underlying NREL PVWatts, DSIRE Database, EIA monthly retail-rate, and IRS
        Form 5695 source data is published by the respective authority (NREL, NC State&apos;s N.C. Clean Energy
        Technology Center, EIA, IRS) under that authority&apos;s own license and use terms; SunPowerPeek claims no
        ownership over the NREL PVWatts, DSIRE, EIA, or IRS Form 5695 underlying data and you should reference the
        upstream NREL, DSIRE, EIA, or IRS Form 5695 publication directly when redistributing those numbers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Links and Advertising</h2>
      <p>
        Our website may contain links to third-party websites — including the upstream NREL PVWatts at pvwatts.nrel.gov,
        the DSIRE Database at dsireusa.org, the EIA monthly retail-rate publication at eia.gov, and IRS Form 5695
        guidance at irs.gov — and display advertisements served by third-party ad networks, including Google AdSense.
        We are not responsible for the content or privacy practices of third-party websites, including the upstream
        NREL, DSIRE, EIA, and IRS publication pages we link to.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, SunPowerPeek shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of your use of the website or your reliance on the NREL
        PVWatts, DSIRE Database, EIA monthly retail-rate, or IRS Form 5695 figures we surface. Solar installation is
        a multi-decade financial commitment; the NREL PVWatts production averages, DSIRE-published state incentive
        snapshots, EIA-published retail electricity rates, and IRS Form 5695 ITC math we publish are reference layers,
        not a substitute for an installer site visit, a CPA review of how IRS Form 5695 interacts with your tax
        liability, or a current consultation of the upstream NREL PVWatts, DSIRE Database, EIA, and IRS publications.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon
        posting on this page. Material changes that affect how we source or present NREL PVWatts NSRDB, DSIRE
        Database, EIA monthly retail-rate, or IRS Form 5695 data will be reflected in the Last Reviewed timestamp
        above.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please visit our{" "}
        <a href="/contact" className="text-orange-600 hover:underline">contact page</a>. For corrections to specific
        NREL PVWatts, DSIRE Database, EIA monthly retail-rate, or IRS Form 5695 figures, please follow the workflow
        documented on our{" "}
        <a href="/corrections-policy/" className="text-orange-600 hover:underline">corrections policy</a> page.
      </p>

      <AuthorBox />
    </article>
  );
}
