import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Limitations of liability, methodology caveats, and source-attribution disclosures for SunPowerPeek — covering NREL PVWatts production assumptions, DSIRE incentive coverage gaps, EIA retail-rate volatility, and IRS Form 5695 ITC math.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  const reviewed = LEGAL_VINTAGES.disclaimer;
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={reviewed}>{reviewed}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. General Information</h2>
      <p>
        SunPowerPeek aggregates solar economics from four public-data authorities — the National Renewable Energy
        Laboratory&apos;s PVWatts production model (NREL), the Database of State Incentives for Renewables &amp; Efficiency
        (DSIRE), the US Energy Information Administration retail-rate series (EIA), and the IRS Form 5695 Residential
        Clean Energy Credit (the federal ITC). Everything on this site is informational and educational. We are not
        a NABCEP-certified installer, a CPA, or a state energy office; we cannot bind a tax position or a system
        warranty.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Source-Attribution Honesty</h2>
      <p>
        Where numbers appear in prose, tables, or schema.org Dataset payloads, the originating authority is named
        inline — NREL for solar irradiance and array output, DSIRE for the state-rebate snapshot, EIA for the retail
        rate used in payback math, and IRS Form 5695 for the 30% Investment Tax Credit. The schema.org{" "}
        <code>creator</code> field on every Dataset surface attributes NREL PVWatts as the dominant data origin;{" "}
        <code>publisher</code> is the DataPeek Research Network; <code>sourceOrganization</code> enumerates all four
        authorities (NREL, DSIRE, EIA, IRS). This separation follows schema.org guidance and is the same pattern
        documented on our Editorial Policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. NREL PVWatts Production Caveats</h2>
      <p>
        State-level production estimates use NREL PVWatts with default DC-to-AC ratio, 14% system losses, fixed tilt
        equal to latitude, and a south-facing azimuth. Real installations vary on every one of those axes: a steeper
        roof, a shaded chimney, a microinverter vs. string-inverter choice, or a heat-derated panel coefficient can
        each move annual kWh by 5–15%. NREL itself documents these as modeling assumptions, not field measurements.
        Use NREL output as a planning benchmark; for a binding production number, request an installer&apos;s site-survey
        report with measured shading.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. DSIRE Coverage Gaps</h2>
      <p>
        DSIRE is the most comprehensive public incentive database in the United States but is not exhaustive. Utility
        rebates change quarterly; municipal incentives are often under-cataloged; and DSIRE&apos;s last-updated date for
        any specific program may lag the program&apos;s actual policy window by weeks. Before signing a system contract,
        verify the specific rebate language on the originating utility or state-energy-office page that DSIRE links
        to. Our state pages show the DSIRE program count and last-updated date so you can see the data&apos;s vintage at
        a glance.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. EIA Retail-Rate Volatility</h2>
      <p>
        Payback math on every state page uses the EIA monthly state retail electricity rate as the displaced-cost
        baseline. Retail rates move with fuel mix, regulatory rate cases, transmission upgrades, and demand-response
        cycles — a 3–6 cent/kWh year-over-year swing is normal in volatile markets (Hawaii, California, New England).
        Our 20-year savings figure assumes the EIA rate as published at the vintage date; it does not project rate
        escalation. A 2–4% annual escalator is the industry default but is editorial commentary, not an EIA forecast.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. IRS Form 5695 ITC — Statutory Sunset</h2>
      <p>
        The Residential Clean Energy Credit (IRS Form 5695) provides a 30% federal Investment Tax Credit on qualified
        solar installations through tax year 2032 under the Inflation Reduction Act, stepping down to 26% in 2033 and
        22% in 2034. Eligibility depends on system placement-in-service date and the homeowner&apos;s tax liability — the
        ITC is nonrefundable, so a household without sufficient federal tax owed in the install year may not capture
        the full credit immediately (it can carry forward, but the carry-forward rules are statute-bound). We render
        the 30% figure on every state page because that is the current IRS Form 5695 instruction; we are not a tax
        advisor and cannot model your specific tax situation.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. ItcPaybackBand — Items NOT Included</h2>
      <p>
        Our ItcPaybackBand 5-tier classifier (A under 5 years / B 5–8 years / C 8–12 years / D 12–20 years / E 20+
        years) divides the post-ITC, post-DSIRE-rebate net system cost by EIA-rate-priced annual NREL PVWatts output.
        That math intentionally excludes the following so that the band is a clean state-level baseline:
      </p>
      <ul>
        <li><strong>Panel degradation curve.</strong> Tier-1 panels lose ~0.5%/yr of output; we use year-1 NREL output throughout the payback window.</li>
        <li><strong>Inverter replacement.</strong> Central inverters typically need replacement around year 10–12; microinverters carry 25-yr warranties at higher upfront cost.</li>
        <li><strong>Financing cost.</strong> Cash purchase, loan APR, and PPA/lease economics differ materially; we model cash purchase only.</li>
        <li><strong>System-design variance.</strong> Module choice, racking type, conduit run length, and main-panel-upgrade cost can move installed price 15–30%.</li>
        <li><strong>Net-metering policy drift.</strong> NEM 2.0 vs NEM 3.0 (California), distributed-generation tariffs (Arizona, Indiana), and time-of-use exports change effective export value. DSIRE catalogs policy; we don&apos;t price the export delta.</li>
        <li><strong>SREC value.</strong> Solar Renewable Energy Certificates (NJ, MD, PA, DC, IL) can add $50–$200/MWh; market prices change too fast to render reliably.</li>
        <li><strong>Battery storage.</strong> ITC now covers standalone storage; battery payback is its own calculation we don&apos;t fold into the band.</li>
        <li><strong>Roof condition.</strong> A reroof needed within 5 years of install effectively front-loads $10–25K of correlated cost.</li>
        <li><strong>Property-tax assessment.</strong> Most states exempt solar from property-tax reassessment (DSIRE tracks this); a handful do not.</li>
        <li><strong>Insurance premium delta.</strong> Adding a $25–40K asset to the roof can move homeowner&apos;s premium 2–5%.</li>
      </ul>
      <p>
        Bottom line: the band is a state-level planning baseline anchored to NREL + DSIRE + EIA + IRS Form 5695 math.
        It is not an installer quote.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. NABCEP Non-Certification</h2>
      <p>
        SunPowerPeek editorial staff are not NABCEP-certified PV installers, designers, or technical sales
        professionals. NABCEP (the North American Board of Certified Energy Practitioners) is the accreditation that
        identifies installers qualified to design and commission residential PV. Any installer recommendation on this
        site is editorial commentary, not a NABCEP credential. Before signing a system contract, verify NABCEP status
        on the installer&apos;s record.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Korean Operator Outside-US Disclosure</h2>
      <p>
        SunPowerPeek is operated from South Korea. We do not have a US business presence, US tax-resident editorial
        staff, or US contractor licensing of any kind. The site exists because solar economics are entirely
        derivable from public NREL / DSIRE / EIA / IRS data — no field reporting, no in-person inspection, no
        installer relationships. Where state pages render local installer commentary, that text is editorial framing
        of public DSIRE incentive data, not first-hand market reporting.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Not Professional Advice</h2>
      <p>
        The content on this website does not constitute professional advice of any kind, including but not limited to
        tax, financial, legal, or contracting advice. For a binding ITC decision, consult a CPA who reads the IRS
        Form 5695 instructions against your specific tax-liability profile. For a binding system quote, get 3–4
        proposals from NABCEP-certified installers with documented array layouts and EIA-rate-aware payback math.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Data Accuracy and External Links</h2>
      <p>
        We pull NREL PVWatts output, DSIRE program metadata, EIA retail-rate series, and IRS Form 5695 instruction
        language from their respective authorities and refresh per the vintages documented in the AuthorBox on every
        page. Errata happen — typos, mis-applied state policy, stale DSIRE program coverage — and our Corrections
        Policy explains how to flag them. External links (NREL, DSIRE, EIA, IRS, installer sites) leave our control
        once clicked; we don&apos;t warrant third-party content.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Advertising</h2>
      <p>
        SunPowerPeek displays third-party advertisements through Google AdSense and similar ad networks. Ad placement
        is editorial-independent — advertisers do not influence which state pages exist, what NREL/DSIRE/EIA/IRS
        numbers we render, or how the ItcPaybackBand classifier is computed. Ads displayed are not endorsements.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Limitation of Liability</h2>
      <p>
        In no event shall SunPowerPeek, DataPeek Research Network, its owners, operators, or contributors be liable
        for any direct, indirect, incidental, consequential, or punitive damages arising from use of this website,
        the NREL / DSIRE / EIA / IRS-derived figures rendered here, or any reliance on the ItcPaybackBand band as a
        proxy for a NABCEP installer quote or an IRS Form 5695 tax determination. Customs of evidence and burden-of-
        proof rules apply to any dispute over a solar economic outcome — we cannot indemnify you against an installer,
        a utility, or the IRS.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">14. Contact</h2>
      <p>
        If you have concerns about content on this website, please visit our{" "}
        <a href="/contact" className="text-orange-700 hover:underline">Contact page</a>. For methodology errata
        specifically, our{" "}
        <a href="/corrections-policy" className="text-orange-700 hover:underline">Corrections Policy</a>{" "}
        explains the 2-day SLA and audit-log mechanics.
      </p>
    </article>
  );
}
