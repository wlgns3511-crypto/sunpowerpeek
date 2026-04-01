import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for SunPowerPeek.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 27, 2026</p>

      <p>
        Welcome to SunPowerPeek. By accessing or using our website at sunpowerpeek.com, you agree to be bound by these
        Terms of Service. If you do not agree to these terms, please do not use our website.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Use of the Website</h2>
      <p>
        SunPowerPeek provides solar panel cost data, savings estimates, incentive information, and calculators for
        informational and educational purposes only. You may use the website for personal, non-commercial purposes.
        The information provided should not be the sole basis for solar installation or financial decisions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy of Information</h2>
      <p>
        While we strive to provide accurate and up-to-date information, we make no warranties regarding the completeness
        or accuracy of content on this website. The data presented is sourced from publicly available datasets including
        NREL, DSIRE, and EIA. Actual solar costs, production, and savings may vary based on your specific situation,
        installer, equipment, and local conditions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
      <p>
        The content, design, and layout of this website are the property of SunPowerPeek and are protected by copyright
        and other intellectual property laws.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Links and Advertising</h2>
      <p>
        Our website may contain links to third-party websites and display advertisements served by third-party ad
        networks, including Google AdSense. We are not responsible for the content or privacy practices of third-party
        websites.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, SunPowerPeek shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising out of your use of the website.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon
        posting on this page.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please visit our{" "}
        <a href="/contact" className="text-orange-600 hover:underline">contact page</a>.
      </p>
    </article>
  );
}
