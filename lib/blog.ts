export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "solar-panel-cost-2024",
    title: "How Much Do Solar Panels Cost in 2024? Complete Pricing Guide",
    description:
      "The average solar panel system costs $20,000–$30,000 before incentives — but the 30% federal tax credit can reduce that to $14,000–$21,000. Here's what you'll actually pay.",
    publishedAt: "2024-10-15",
    updatedAt: "2025-01-10",
    category: "Solar Costs",
    readingTime: 7,
    content: `
<h2>Average Solar System Costs in 2024</h2>
<p>The average residential solar panel system in 2024 costs <strong>$20,000–$30,000 before incentives</strong>, according to the Lawrence Berkeley National Laboratory's Tracking the Sun report. After the 30% federal Investment Tax Credit (ITC), that range drops to approximately $14,000–$21,000.</p>

<h2>Cost Per Watt: The Industry Standard</h2>
<p>Solar is typically priced in <strong>cost per watt ($/W)</strong>. In 2024, residential solar averages $2.50–$3.50/W installed (all-in, including equipment, labor, permits, and overhead). Cost per watt has fallen dramatically — from $7.50/W in 2010 to current levels — but has plateaued in recent years due to labor cost increases offsetting panel price declines.</p>

<h2>Cost by System Size</h2>
<table>
  <thead><tr><th>System Size</th><th>Before ITC</th><th>After 30% ITC</th><th>Typical Home Size</th></tr></thead>
  <tbody>
    <tr><td>4 kW</td><td>$10,000–$14,000</td><td>$7,000–$9,800</td><td>Small (under 1,500 sq ft)</td></tr>
    <tr><td>6 kW</td><td>$15,000–$21,000</td><td>$10,500–$14,700</td><td>Medium (1,500–2,500 sq ft)</td></tr>
    <tr><td>8 kW</td><td>$20,000–$28,000</td><td>$14,000–$19,600</td><td>Large (2,500–3,500 sq ft)</td></tr>
    <tr><td>10 kW</td><td>$25,000–$35,000</td><td>$17,500–$24,500</td><td>Very large or EV owner</td></tr>
  </tbody>
</table>

<h2>What's Included in the Price</h2>
<ul>
  <li><strong>Solar panels</strong>: 30–40% of system cost. Tier 1 manufacturers (LG, Panasonic, SunPower, REC) cost more but offer better efficiency and warranties.</li>
  <li><strong>Inverter</strong>: 10–15% of cost. String inverters are cheapest; microinverters (Enphase) or power optimizers (SolarEdge) cost more but perform better under shading.</li>
  <li><strong>Racking and mounting</strong>: 5–10% of cost</li>
  <li><strong>Labor and installation</strong>: 25–35% of cost — highly variable by market</li>
  <li><strong>Permits and interconnection</strong>: $500–$2,000 depending on jurisdiction</li>
</ul>

<h2>State Incentives Beyond the Federal ITC</h2>
<p>The 30% federal ITC is the biggest incentive, but many states offer additional savings:</p>
<ul>
  <li><strong>California</strong>: Property tax exclusion for solar; no sales tax on panels</li>
  <li><strong>New York</strong>: 25% state tax credit (up to $5,000) + NYSERDA rebates</li>
  <li><strong>Massachusetts</strong>: SMART program — guaranteed payments for solar production</li>
  <li><strong>New Jersey</strong>: Solar Renewable Energy Credits (SRECs) + exemptions</li>
  <li><strong>Texas</strong>: Property tax exemption; some utilities offer rebates</li>
</ul>

<h2>Financing Options</h2>
<h3>Solar Loan (Buy with Financing)</h3>
<p>Solar loans allow you to own the system while spreading payments over 10–25 years. Interest rates typically range from 3–9% depending on credit score and lender. You capture the full ITC and all production benefits while building equity in the system.</p>

<h3>Solar Lease</h3>
<p>With a lease, a third party owns the system and you pay a monthly fee for the electricity or power produced. Leases typically run 20–25 years. The ITC goes to the system owner, not you. Monthly payments are predictable, but you don't build equity and must transfer the lease if you sell your home.</p>

<h3>Power Purchase Agreement (PPA)</h3>
<p>Similar to a lease, but you pay per kWh produced rather than a flat monthly fee. PPAs often have escalator clauses (2–3%/year price increases). Like leases, the ITC benefits go to the system owner.</p>

<h2>Bottom Line</h2>
<p>For most homeowners, <strong>buying with cash or a solar loan</strong> provides the best long-term financial outcome. The 30% federal ITC plus state incentives and avoided electricity costs typically result in payback periods of 6–12 years, followed by 13–19 years of essentially free electricity from a 25-year system.</p>
`,
  },
  {
    slug: "solar-panel-roi-payback-period",
    title: "Solar Panel ROI: When Does It Actually Pay Off?",
    description:
      "The average solar payback period is 6–12 years. Here's how to calculate your specific return on investment — and what factors can shorten or extend the timeline.",
    publishedAt: "2024-10-22",
    category: "Solar Finance",
    readingTime: 6,
    content: `
<h2>The Basic Payback Calculation</h2>
<p>Solar payback period = <strong>Net system cost ÷ Annual savings from solar</strong></p>
<p>Example: System costs $25,000. After 30% ITC, net cost is $17,500. Annual electricity savings: $1,800. Payback period: 17,500 ÷ 1,800 = <strong>9.7 years</strong>.</p>
<p>After the payback period, the system produces essentially free electricity for the remainder of its 25-year life — in this example, 15 more years of savings (~$27,000 more).</p>

<h2>Factors That Shorten the Payback Period</h2>
<h3>High Local Electricity Rates</h3>
<p>This is the single biggest factor. In California (30+ cents/kWh), a 6 kW system producing 8,000 kWh/year saves $2,400+/year, cutting the payback period to 6–7 years. In a state with 12 cents/kWh electricity, the same system saves $960/year and payback stretches to 15+ years.</p>

<h3>Good Sun Hours</h3>
<p>Southwest states (Arizona, New Mexico, Nevada) get 5.5–6.5 peak sun hours per day; the Northeast gets 3.5–4.5. More sun = more production = faster payback. Arizona solar systems can produce 30–40% more energy than the same system in Massachusetts.</p>

<h3>Strong Net Metering Policy</h3>
<p>Net metering lets you sell excess solar production to the grid at retail rates (or near-retail). States with robust net metering (New Jersey, Massachusetts, New York) allow faster payback. States with reduced net metering rates (California's NEM 3.0) have slowed payback for new installations.</p>

<h3>State Incentives</h3>
<p>New York's 25% state tax credit (up to $5,000) on top of the federal ITC can reduce a system's net cost by 55%. This dramatically shortens the payback period compared to states with only the federal credit.</p>

<h2>Factors That Lengthen the Payback Period</h2>
<ul>
  <li><strong>Low electricity rates</strong>: Under 12 cents/kWh, solar ROI is challenging</li>
  <li><strong>High installation costs</strong>: Some markets have labor costs 50–100% above national average</li>
  <li><strong>Shading</strong>: Trees, chimneys, or neighboring buildings can reduce production by 20–40%</li>
  <li><strong>Poor roof condition</strong>: Needing a new roof before or after installation adds $10,000–$20,000</li>
  <li><strong>South vs. north-facing roof</strong>: North-facing panels produce 20–30% less than south-facing</li>
</ul>

<h2>25-Year Financial Model Example</h2>
<table>
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>System size</td><td>7 kW</td></tr>
    <tr><td>Gross cost</td><td>$21,000</td></tr>
    <tr><td>Federal ITC (30%)</td><td>-$6,300</td></tr>
    <tr><td>Net cost</td><td>$14,700</td></tr>
    <tr><td>Year 1 production</td><td>9,100 kWh</td></tr>
    <tr><td>Year 1 savings (@ $0.16/kWh)</td><td>$1,456</td></tr>
    <tr><td>Payback period</td><td>~10 years</td></tr>
    <tr><td>Total 25-year savings</td><td>~$40,000–$50,000</td></tr>
  </tbody>
</table>

<h2>ROI vs. Other Investments</h2>
<p>Solar ROI, expressed as an annual return, typically falls in the <strong>6–15% range</strong> — comparable to a stock market investment, but without the volatility. Unlike financial investments, solar also provides direct energy security (if combined with battery storage) and protection against electricity rate increases. In high-rate states, solar ROI can exceed 20%.</p>

<h2>The Panel Degradation Factor</h2>
<p>Solar panels degrade slowly over time — typically 0.5% per year. By year 25, your panels produce about 87% of their original output. Most manufacturers guarantee at least 80% of rated power at 25 years. Factor this into long-term projections: year 25 production will be somewhat less than year 1.</p>
`,
  },
  {
    slug: "best-states-solar-power-2024",
    title: "Best States for Solar Power in 2024 (Rankings + Incentives)",
    description:
      "Not all states are equal for solar. This ranking combines sun hours, electricity rates, net metering policy, and incentives to identify the best and worst states for going solar.",
    publishedAt: "2024-11-05",
    category: "State Rankings",
    readingTime: 6,
    content: `
<h2>How We Rank Solar Viability</h2>
<p>The best states for solar combine three factors: <strong>sun hours</strong> (how much energy the panels produce), <strong>electricity rates</strong> (the value of each kWh produced), and <strong>state incentives</strong> (tax credits, rebates, net metering quality). A sunny state with cheap electricity may rank lower than a cloudier state with high rates and strong incentives.</p>

<h2>Top 5 States for Solar in 2024</h2>

<h3>1. California</h3>
<p>Despite California's complex new NEM 3.0 net metering policy (which reduced export credits), the combination of 5.5–6.5 peak sun hours, some of the highest electricity rates nationally (30+ cents/kWh), property tax exclusions, and zero sales tax on solar keeps California near the top. EV-pairing with solar and battery storage creates the strongest economics.</p>

<h3>2. Massachusetts</h3>
<p>Massachusetts punches above its weight. With the SMART program (guaranteed fixed payments for solar generation for 10 years), 15-year net metering commitments, and among the highest electricity rates in the continental US (25+ cents/kWh), Massachusetts often achieves payback periods of 5–7 years — faster than sunnier states.</p>

<h3>3. New Jersey</h3>
<p>New Jersey's Solar Renewable Energy Credit (SREC) market has historically provided strong additional income from solar generation. Combined with above-average rates and strong net metering, NJ offers excellent solar economics.</p>

<h3>4. Arizona</h3>
<p>Arizona gets 300+ sunny days per year and 6–6.5 peak sun hours — among the best in the nation. Electricity rates are moderate (12–14 cents/kWh), but high production compensates. Some utilities (Salt River Project) have less favorable net metering, so the utility matters significantly here.</p>

<h3>5. Texas</h3>
<p>Texas's deregulated market allows homeowners to choose electricity plans that optimize solar economics. Excellent sun in most of the state, zero state income tax (no state ITC, but the federal one applies), and growing solar incentives from utilities make Texas a strong solar state.</p>

<h2>States Where Solar Is Challenging</h2>

<h3>Alaska</h3>
<p>Very limited sunlight (1.5–3 peak sun hours), short summer days, and harsh weather make solar impractical for most of Alaska. The exceptions are off-grid applications where solar-battery systems can be cost-effective compared to generator fuel.</p>

<h3>Pacific Northwest (Oregon, Washington)</h3>
<p>The Pacific Northwest has abundant, cheap hydroelectric power — electricity rates run 10–12 cents/kWh. The combination of relatively low sun hours and cheap electricity makes solar's payback period extend to 20+ years in many areas. Solar makes more sense in eastern Washington and Oregon, which get more sun than the coast.</p>

<h3>Louisiana, Oklahoma, Arkansas</h3>
<p>These states have some of the cheapest electricity in the nation (9–11 cents/kWh). Even with good sun hours, low rates make it difficult to justify solar on pure financial terms. Payback periods often exceed 15–18 years.</p>

<h2>Net Metering Policy Matters</h2>
<p>Net metering policies are rapidly changing across the country. States that have weakened net metering (California NEM 3.0, Arizona, Nevada in the past) have seen solar adoption slow. States with strong 1:1 retail net metering (Massachusetts, New Jersey, Maryland, New York) have the most favorable solar economics. Always check your state's current net metering policy before committing to solar — it significantly affects your ROI.</p>

<h2>Using Our State Comparison Tool</h2>
<p>Our solar comparison tool lets you enter your state, average monthly electricity bill, and roof characteristics to calculate a customized payback period, lifetime savings estimate, and optimal system size for your specific situation.</p>
`,
  },
  {
    slug: "federal-solar-tax-credit-guide",
    title: "Federal Solar Tax Credit (ITC) 2024: Complete Guide",
    description:
      "The 30% federal solar tax credit can save the average homeowner $6,000–$9,000 on solar installation. Here's everything you need to know about claiming it.",
    publishedAt: "2024-11-20",
    category: "Solar Incentives",
    readingTime: 7,
    content: `
<h2>What Is the Solar Investment Tax Credit?</h2>
<p>The Solar Investment Tax Credit (ITC) is a <strong>federal tax credit worth 30% of your total solar system cost</strong>, enacted under the Inflation Reduction Act (IRA) of 2022. It applies to residential and commercial solar installations and is the most valuable solar incentive available to most Americans.</p>
<p>On a $20,000 system, the 30% ITC provides a <strong>$6,000 reduction in your federal tax liability</strong>.</p>

<h2>The Credit Schedule</h2>
<table>
  <thead><tr><th>Year</th><th>Credit Percentage</th></tr></thead>
  <tbody>
    <tr><td>2022–2032</td><td>30%</td></tr>
    <tr><td>2033</td><td>26%</td></tr>
    <tr><td>2034</td><td>22%</td></tr>
    <tr><td>2035+</td><td>0% (unless Congress extends)</td></tr>
  </tbody>
</table>
<p>The IRA extended the 30% rate through 2032, giving homeowners a decade of certainty. Earlier legislation had the credit expiring at 26% in 2020 and 22% in 2021 before each extension.</p>

<h2>What Qualifies for the Credit?</h2>
<p>The ITC covers the cost of:</p>
<ul>
  <li><strong>Solar panels</strong> — including all module hardware</li>
  <li><strong>Inverters</strong> — string, micro, or power optimizer</li>
  <li><strong>Racking and mounting equipment</strong></li>
  <li><strong>Wiring and electrical components</strong></li>
  <li><strong>Installation labor</strong></li>
  <li><strong>Permit and inspection fees</strong></li>
  <li><strong>Battery storage</strong> — if charged by the solar system (as of 2023, standalone batteries charged from the grid also qualify)</li>
  <li><strong>Sales tax</strong> on eligible components</li>
</ul>
<p>The credit applies to the full installed cost, including profit margins — meaning the higher-quality, higher-cost system you choose, the larger the credit you receive.</p>

<h2>What Does NOT Qualify?</h2>
<ul>
  <li>Solar systems on rental properties you don't live in (use the commercial ITC instead)</li>
  <li>Solar water heaters (separate credit applies)</li>
  <li>Costs to repair or reinforce your roof (unless directly required for installation)</li>
</ul>

<h2>How to Claim the Credit</h2>
<p>Claiming the ITC is straightforward:</p>
<ol>
  <li>Install your solar system during the tax year</li>
  <li>Obtain your final invoice showing total system cost</li>
  <li>File <strong>IRS Form 5695</strong> (Residential Energy Credits) with your annual tax return</li>
  <li>Enter the eligible cost on line 1, calculate 30%, and enter the credit on your Form 1040</li>
</ol>
<p>You don't need to itemize deductions — the ITC is a nonrefundable tax credit, meaning it reduces your tax bill dollar-for-dollar.</p>

<h2>Carryforward Rules</h2>
<p>The ITC is nonrefundable — it can reduce your tax liability to $0 but won't generate a refund. However, if your credit exceeds your tax liability in the installation year, you can <strong>carry the unused portion forward to future tax years</strong> until the credit is fully used. This is valuable for retirees with low tax liability or in low-income years.</p>
<p>Example: Tax liability is $4,000. ITC credit is $6,000. Use $4,000 this year to zero out your tax bill; carry $2,000 forward to next year.</p>

<h2>Income Limits</h2>
<p>Unlike some other tax incentives, the solar ITC has <strong>no income limit</strong>. Whether you earn $40,000 or $400,000, you qualify for the same 30% credit — as long as you have sufficient tax liability to use it.</p>

<h2>Interaction with State Incentives</h2>
<p>State tax credits typically reduce the federal ITC basis. Example: If your state offers a 25% credit on $20,000, your state credit is $5,000, reducing the federal eligible cost to $15,000 (in some states). The specifics vary — consult a tax professional when stacking multiple incentives.</p>

<h2>Act Before 2033</h2>
<p>The 30% rate is available through 2032 under current law. Given historical patterns (Congress has extended the ITC multiple times), it may be extended again — but there's no guarantee. Installing before December 31, 2032 locks in the 30% credit.</p>
`,
  },
  {
    slug: "solar-battery-storage-worth-it",
    title: "Solar Battery Storage: Is It Worth the Extra Cost?",
    description:
      "A home battery like the Tesla Powerwall costs $10,000–$15,000. For some homeowners it's a no-brainer; for others, it's hard to justify. Here's how to decide.",
    publishedAt: "2024-12-01",
    category: "Solar Technology",
    readingTime: 6,
    content: `
<h2>What Does Solar Battery Storage Do?</h2>
<p>A home battery stores excess solar energy generated during the day for use at night or during outages. Instead of sending surplus production to the grid (and receiving net metering credits), you store it locally and use it when the sun isn't shining — or when the grid goes down.</p>

<h2>Battery Costs in 2024</h2>
<p>The most popular home batteries:</p>
<table>
  <thead><tr><th>Product</th><th>Usable Capacity</th><th>Installed Cost</th></tr></thead>
  <tbody>
    <tr><td>Tesla Powerwall 3</td><td>13.5 kWh</td><td>$11,500–$14,000</td></tr>
    <tr><td>Enphase IQ Battery 5P</td><td>5 kWh per module</td><td>$8,000–$12,000 (3 modules)</td></tr>
    <tr><td>SolarEdge Energy Bank</td><td>9.7 kWh</td><td>$8,000–$11,000</td></tr>
    <tr><td>Franklin Whole-Home Battery</td><td>13.6 kWh</td><td>$10,000–$13,000</td></tr>
  </tbody>
</table>
<p>The 30% federal ITC applies to batteries paired with solar (as of 2023, it also applies to standalone batteries charged from the grid). State incentives vary — some states (California, Massachusetts, New York) offer additional battery rebates of $2,000–$5,000.</p>

<h2>When Battery Storage Makes Strong Financial Sense</h2>

<h3>Your Utility Has Poor Net Metering</h3>
<p>California's NEM 3.0 policy pays homeowners only about 5 cents/kWh for exported solar — vs. the 30+ cents they pay for grid electricity. This creates a massive gap: storing that solar power and using it at night is worth 6x more than exporting it. Battery storage becomes nearly essential for California solar systems to achieve acceptable ROI under NEM 3.0.</p>

<h3>You're on Time-of-Use Rates</h3>
<p>On TOU plans with significant peak/off-peak price spreads, a battery lets you charge during cheap hours and discharge during expensive hours — arbitraging the price difference. At a 20 cents/kWh peak-vs-off-peak spread, a 13.5 kWh battery fully cycled daily generates about $2.70/day in rate arbitrage, or roughly $985/year. Payback: 10–14 years on the battery alone.</p>

<h3>Frequent Power Outages</h3>
<p>If you live in an area prone to grid outages — wildfire-prone California, hurricane-vulnerable Florida, ice storm-prone Texas — a battery provides meaningful backup power. A 13.5 kWh battery can power essential loads (refrigerator, lights, phone chargers, some HVAC) for 12–24 hours during an outage. The economic value of backup power is hard to quantify but real.</p>

<h2>When Battery Storage Is Hard to Justify Financially</h2>
<p>In most scenarios without the factors above, battery storage alone is difficult to justify purely on financial returns:</p>
<ul>
  <li>States with full retail net metering: You're effectively storing energy in the grid at retail rates anyway — adding a physical battery provides little additional financial benefit</li>
  <li>Flat-rate electricity without TOU: No arbitrage opportunity</li>
  <li>Reliable grid: Without backup power value, pure financial ROI is often 15–20+ years</li>
</ul>

<h2>Self-Consumption vs. Grid Export Tradeoffs</h2>
<p>The financial case for batteries hinges on the <strong>spread between what you're paid for exported solar vs. what you pay for grid electricity</strong>. Where net metering pays retail rates (100% of grid price), there's little financial incentive to store. Where export rates are low (California NEM 3.0 at ~5 cents vs. 30+ cents retail), storage becomes essential for good solar economics.</p>

<h2>Bottom Line</h2>
<p>A home battery is worth it if you're in California under NEM 3.0, on time-of-use rates with large peak/off-peak spreads, in an outage-prone area, or going off-grid. For most other homeowners in states with good net metering and reliable grids, a battery is optional and the payback is long. The 30% ITC reduces the hurdle, but doesn't eliminate the financial challenge in favorable net metering environments.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(posts.map((p) => p.category)));
}
