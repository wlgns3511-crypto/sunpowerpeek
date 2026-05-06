import type { Metadata } from "next";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";
import { AuthorBox } from "@/components/AuthorBox";
import { ABOUT_VINTAGE } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "About SunPowerPeek — Independent US Residential Solar Data",
  description:
    "How SunPowerPeek surfaces NREL PVWatts, DSIRE incentives, EIA electricity rates, and IRS Form 5695 ITC math into one comparable view. What we cover, what we explicitly don't, and why we exist.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">About SunPowerPeek</h1>

      <div className="not-prose">
        <TrustMetaStrip />
      </div>

      <p className="lead text-lg">
        SunPowerPeek is an independent reference layer that pulls the four
        US residential solar datasets a homeowner actually has to reconcile —
        NREL peak sun hours, DSIRE state incentives, EIA retail electricity
        rates, and the IRS federal Investment Tax Credit — into one comparable
        view, per state, with the math shown.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Why this site exists</h2>
      <p>
        The information you need before signing a 25-year solar contract is
        public, but it is scattered across four different agencies, each with
        its own update cadence and assumed audience. NREL publishes peak sun
        hours but not state-level economics. DSIRE catalogs incentives but
        does not compute payback. EIA tracks retail electricity rates by
        state but not the way solar offsets them. The IRS publishes
        Form 5695 instructions but does not say what 30% of a representative
        system actually looks like in dollars in your state. SunPowerPeek
        joins the four into a single state page, with the assumptions and
        the arithmetic visible on the same screen rather than buried in a
        downloadable PDF.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Who we are</h2>
      <p>
        SunPowerPeek is published by the DataPeek Research Network, a small
        independent operator running narrow vertical-data sites covering
        infrastructure, real estate, energy, and consumer-product economics
        across the US. The network is run from outside the United States,
        and we say so directly because it is relevant: we are not a US
        installer, broker, or affiliate. We sell nothing, take no commission
        on a panel install, and have no relationship with any solar company.
        That makes us a worse hand-holder than your local installer and a
        better second opinion than a sales-funded comparison page.
      </p>
      <p>
        Editorial workflow is Editorial-Team-led, not byline-led: every
        figure on this site lands through the same review checklist, gets
        a per-source vintage anchor, and is republished as a unit. We do
        not credit individual contributors because the data, not the
        author, is the load-bearing object — and faking author identities
        is exactly the pattern Google&apos;s Helpful Content guidance
        flags. What we do credit, on every page, are the actual data
        authorities behind the number.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What this site covers</h2>
      <ul>
        <li>
          State-level <strong>peak sun hours</strong>, anchored to NREL&apos;s
          National Solar Radiation Database (the dataset PVWatts itself runs
          on).
        </li>
        <li>
          <strong>System cost per watt</strong>, expressed as a turnkey
          installed figure (panels, inverter, racking, labor, permitting,
          installer margin) — not just hardware.
        </li>
        <li>
          The <strong>federal 30% Investment Tax Credit</strong> from IRS
          Form 5695, currently in effect through 2032 under the Inflation
          Reduction Act, with the step-down schedule (26% in 2033, 22% in
          2034) called out where it matters for payback.
        </li>
        <li>
          State-level <strong>tax credits, rebates, and net-metering
          policies</strong>, sourced from DSIRE — including the cases where
          a state has transitioned to net billing or successor tariffs
          (California NEM 3.0 being the most-cited example).
        </li>
        <li>
          A <strong>payback calculator</strong> that exposes its inputs
          rather than hiding them: system size, sun hours, derate, retail
          electricity rate, ITC, and net cost. You can verify our number
          against your own utility bill.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">What this site explicitly does not cover</h2>
      <ul>
        <li>
          We do <strong>not</strong> generate per-address quotes. State
          averages are not a substitute for an installer site visit. Use
          PVWatts directly for an address-level production estimate, then
          get 3–4 quotes from <a href="https://www.nabcep.org/" target="_blank" rel="noopener noreferrer">NABCEP-certified</a> installers.
        </li>
        <li>
          We are <strong>not</strong> a NABCEP-certified installer, a
          licensed tax professional, or a financial advisor. A 30% federal
          ITC is the headline figure, but its actual benefit depends on
          your tax liability — that is a CPA conversation, not a website
          conversation.
        </li>
        <li>
          We do not model <strong>financed solar</strong> (loan, lease,
          PPA). The payback you see assumes cash purchase. Financed solar
          changes the math meaningfully and is generally less generous than
          cash on a true cost-of-capital basis.
        </li>
        <li>
          We do not cover <strong>commercial or utility-scale</strong>
          solar. Different incentive structure, different financing, different
          publication entirely.
        </li>
        <li>
          We do not personalize for <strong>roof condition, shading, or
          orientation</strong>. If your roof needs replacement within five
          years or you have heavy tree cover, the state average is wrong
          for you in directions we cannot know from outside.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">How we keep it honest</h2>
      <p>
        Every state page declares the vintage of every source it relies on
        — when NREL last refreshed NSRDB, when EIA published the
        electricity-rate quarter, when DSIRE last touched the relevant
        program entry, and the tax year that the IRS Form 5695 ITC math
        applies to. When a source updates, only the affected pages move;
        we do not bulk-touch every page on the site to fake recency. The
        underlying data lives in a SQLite snapshot in our repository, so
        the dataset that produced today&apos;s numbers is auditable rather
        than mutable in the dark.
      </p>
      <p>
        Methodology details — exactly how we compute payback, what derate
        factor we apply, where each input number comes from — are published
        on our <a href="/methodology/" className="text-orange-600 hover:underline">Methodology page</a>,
        and we treat that page as a contract: changes there land before
        changes to the user-facing numbers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Corrections and contact</h2>
      <p>
        If a published NREL, DSIRE, EIA, or IRS figure disagrees with what
        you see here, we want to know first.
        Visit our <a href="/contact" className="text-orange-600 hover:underline">Contact page</a> with
        the source URL and the page you saw the discrepancy on, and we
        will fix it on the next refresh cycle (usually within a week).
      </p>

      <AuthorBox vintage={ABOUT_VINTAGE} source="NREL NSRDB + DSIRE + EIA + IRS Form 5695" showDisclaimer />
    </article>
  );
}
