import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SunPowerPeek",
  description: "Learn about SunPowerPeek, our mission, and data sources for US solar panel data.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">About SunPowerPeek</h1>

      <p>
        SunPowerPeek is a free resource that helps homeowners understand solar panel costs, savings,
        and government incentives across the United States. We provide detailed solar data for all 50 states
        and 500+ ZIP codes, plus tools to help you calculate your solar ROI.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        We believe transparent solar data empowers better decisions. Whether you are evaluating whether solar
        makes sense for your home, comparing costs across states, or trying to understand available tax credits
        and rebates, SunPowerPeek provides the data you need to make an informed choice.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        Our solar data comes from the <strong>National Renewable Energy Laboratory (NREL)</strong> for solar
        irradiance and production estimates, the <strong>Database of State Incentives for Renewables &amp;
        Efficiency (DSIRE)</strong> for incentive programs, and the <strong>U.S. Energy Information
        Administration (EIA)</strong> for electricity rates. System costs reflect current residential solar
        market pricing. We update our data regularly to ensure accuracy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact" className="text-orange-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
