import type { IntakeAnswers, RoadmapStep, RoadmapResult } from "./types";
import { BIZ_TYPES } from "./questions";

export function buildRoadmap(a: IntakeAnswers): RoadmapResult {
  const steps: Omit<RoadmapStep, "order">[] = [];
  const warns: string[] = [];
  const t = a.biz ?? "";
  let cL = 0, cH = 0, wL = 1, wH = 2;
  const physical = !["home", "office"].includes(t);
  const food = ["restaurant", "food_truck"].includes(t) || ["cook", "prep"].includes(a.food ?? "");
  const alc = t === "bar" || (!!a.alc && a.alc !== "no");
  const music = !!a.music && a.music !== "no";
  const live = ["live", "liveocc"].includes(a.music ?? "");
  const exempt = a.music === "radio" && a.sqft === "small";
  const emp = a.emp !== "solo";

  const add = (s: Omit<RoadmapStep, "order">) => steps.push(s);

  // Entity
  if (!["llc", "corp"].includes(a.entity ?? "")) {
    add({
      name: "Form your business entity",
      agency: "CA Secretary of State",
      why: "An LLC ($70) protects your personal assets if the business gets sued. Takes minutes to file online.",
      cost: "$70–$100", time: "1–5 days", priority: "high", type: "form",
      fields: [
        { id: "etype", label: "Entity type", kind: "select", options: ["LLC (recommended)", "Corporation", "Sole proprietor"] },
        { id: "lname", label: "Your legal name", kind: "text", ph: "Jane Kim" },
        { id: "bname", label: "Business name", kind: "text", ph: "Snip LLC" },
        { id: "addr", label: "Business address", kind: "text", ph: "456 Valencia St, SF 94103" },
      ],
      actions: [
        { label: "Generate Articles of Organization", primary: true },
        { label: "File on CA SOS website →", url: "https://bizfileonline.sos.ca.gov" },
      ],
      done_field: { label: "Your entity number or confirmation", ph: "e.g. 202612345678" },
    });
    cL += 70; cH += 100;
  }

  // EIN
  add({
    name: "Get your EIN",
    agency: "IRS",
    why: "Your business's Social Security number. Free, instant, and required for everything else.",
    cost: "Free", time: "5 min", priority: "high", type: "walk",
    walk: [
      { text: "Go to the IRS online application", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online", link: "Open IRS EIN Application →" },
      { text: "Select your entity type (LLC, Corporation, etc.)" },
      { text: "Confirm state: California" },
      { text: "Reason: 'Started a new business'" },
      { text: "Enter your info as the responsible party" },
      { text: "Save your EIN confirmation letter" },
    ],
    done_field: { label: "Your EIN", ph: "XX-XXXXXXX" },
  });

  // Zoning
  if (a.loc !== "no" && physical) {
    const urgent = a.loc === "signed";
    add({
      name: "Verify zoning",
      agency: "SF Planning",
      why: urgent
        ? "You've signed a lease — let's confirm your business type is allowed here immediately."
        : "Confirm your intended use is permitted at your target location before you commit.",
      cost: "Free", time: "Same day", priority: urgent ? "urgent" : "high", type: "check",
      checks: [
        { id: "z1", text: "Look up your property on the SF Planning Map", url: "https://sfplanninggis.org/pim/", link: "Open SF Planning Map →" },
        { id: "z2", text: "Find your zoning district code (e.g., NCT-Mission, C-3-G)" },
        { id: "z3", text: "Check if your use is Permitted (P) or Conditionally Permitted (C)", url: "https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_planning/0-0-0-17837", link: "SF Planning Code →" },
        { id: "z4", text: "If Not Permitted (NP) — stop and reconsider the location" },
      ],
      done_options: [
        { id: "p", label: "✓ Permitted" },
        { id: "c", label: "⚠ Conditionally Permitted" },
        { id: "np", label: "✕ Not Permitted" },
        { id: "help", label: "? Need help" },
      ],
    });
    if (urgent) warns.push("Lease signed before confirming zoning — the #1 mistake. Verify immediately.");
  }

  // Formula retail
  if (a.chain === "11+") {
    add({
      name: "Conditional Use Authorization (Formula Retail)",
      agency: "SF Planning Commission",
      why: "11+ locations = 'formula retail' in SF. Public hearing required. Some neighborhoods ban it entirely.",
      cost: "$5K–$15K", time: "3–6 months", priority: "urgent", type: "walk",
      walk: [
        { text: "This requires a formal application to the Planning Commission" },
        { text: "Neighborhood notification and community outreach" },
        { text: "Public hearing — potential opposition" },
        { text: "We recommend hiring a land use attorney for this step" },
      ],
    });
    warns.push("Formula retail requires a Conditional Use hearing — adds 3–6 months.");
    cL += 5000; cH += 15000; wL += 12; wH += 24;
  }

  // TTX Registration
  add({
    name: "Register with SF Treasurer & Tax Collector",
    agency: "TTX",
    why: "This gets you your Business Account Number (BAN) — the key that unlocks every other SF permit.",
    cost: "Free – $35K", time: "10–15 business days", priority: "high", type: "walk",
    tip: "Most new businesses qualify for First Year Free — registration fee waived.",
    walk: [
      { text: "Go to SF business registration", url: "https://sftreasurer.org/business/register-business", link: "Open TTX Registration →" },
      { text: "You'll need: EIN, entity type, business address, start date, estimated gross receipts" },
      { text: "Submit the application online" },
      { text: "Sign the DocuSign email you'll receive" },
      { text: "Pay registration fee (if applicable)" },
      { text: "Save your Business Account Number (BAN) from the confirmation" },
    ],
    done_field: { label: "Your BAN", ph: "XXXXXXXXXX" },
  });
  wL += 1; wH += 2;

  // Seller's permit
  if (["restaurant", "retail", "food_truck", "popup", "bar"].includes(t)) {
    add({
      name: "CA Seller's Permit",
      agency: "CDTFA",
      why: "Required to collect sales tax (8.625% in SF). Free and usually instant.",
      cost: "Free", time: "Instant", priority: "med", type: "walk",
      walk: [
        { text: "Apply on the CDTFA website", url: "https://onlineservices.cdtfa.ca.gov/_/", link: "Open CDTFA Application →" },
        { text: "Select 'Seller's Permit'  →  enter business info" },
        { text: "Most approvals are instant" },
      ],
    });
  }

  // Building permit
  if (food && t !== "food_truck") {
    add({
      name: "Building permit (tenant improvements)",
      agency: "DBI",
      why: "Required for any buildout — kitchen, plumbing, ventilation, ADA. This is usually the longest step.",
      cost: "$500–$15K+", time: "4–16 weeks", priority: "high", type: "check",
      checks: [
        { id: "bp1", text: "Hire a licensed architect and/or contractor" },
        { id: "bp2", text: "Prepare construction drawings" },
        { id: "bp3", text: "Submit to DBI via PermitSF portal", url: "https://permitsf.sfgov.org", link: "PermitSF Portal →" },
        { id: "bp4", text: "Respond to any plan check corrections" },
        { id: "bp5", text: "Receive building permit and begin construction" },
      ],
    });
    cL += 500; cH += 15000; wL += 4; wH += 16;
  }

  // Fire
  if (food || alc) {
    add({
      name: "Fire Department clearance",
      agency: "SFFD",
      why: "Fire inspection required before DPH will issue your health permit.",
      cost: "License fees", time: "1–4 weeks", priority: "high", type: "check",
      checks: [
        { id: "f1", text: "Contact SFFD Fire Prevention: (628) 652-3260" },
        { id: "f2", text: "Schedule fire inspection" },
        { id: "f3", text: "Verify: occupancy load posted, suppression system, exits, extinguishers" },
        { id: "f4", text: "Receive fire clearance" },
      ],
    });
    wL += 1; wH += 4;
  }

  // Health permit
  if (food) {
    add({
      name: t === "food_truck" ? "Health permit (Mobile Food Facility)" : "Health Permit to Operate",
      agency: "DPH Environmental Health",
      why: t === "food_truck"
        ? "Requires plan check, commissary verification, and final inspection."
        : "Plan check, food safety certification, and final inspection. Request a FREE site evaluation before signing a lease.",
      cost: "$400–$2K+", time: "2–8 weeks", priority: "high", type: "walk",
      walk: [
        { text: "Apply through DPH Environmental Health", url: "https://etaxstatement.sfgov.org/dphehbfoodpermit", link: "DPH Online Application →" },
        { text: "Submit plan check documents and fee" },
        ...(t === "food_truck" ? [
          { text: "Provide commissary kitchen agreement" },
          { text: "Provide restroom verification" },
        ] : []),
        { text: "Ensure Food Safety Manager is certified (see next step)" },
        { text: "Pass final inspection" },
      ],
    });
    cL += 400; cH += 2000; wL += 2; wH += 8;

    add({
      name: "Food Safety Manager certification",
      agency: "ServSafe / ANSI provider",
      why: "At least 1 person must be certified. All food handlers need Food Handler Cards (~$15 each).",
      cost: "$80–$180", time: "1–2 days", priority: "high", type: "walk",
      walk: [
        { text: "Enroll in an approved course (ServSafe, StateFoodSafety, etc.)", url: "https://www.servsafe.com", link: "ServSafe →" },
        { text: "Complete ~8 hour course" },
        { text: "Pass the exam" },
        { text: "Get Food Handler Cards for all other staff" },
      ],
    });
    cL += 80; cH += 180;
  }

  // Alcohol
  if (alc) {
    const at = a.alc || "full";
    const lt = at === "bw" ? "Type 41 (Beer & Wine)" : at === "off" ? "Type 20/21 (Off-Sale)" : "Type 47/48 (Full Bar)";
    add({
      name: `Liquor License — ${lt}`,
      agency: "CA ABC",
      why: "Before anything else: check if your census tract allows a new license. If it's over-concentrated, a transfer from a previous tenant is your only path — and that changes your budget and timeline significantly.",
      cost: at === "bw" ? "$1K–$5K" : "$50K–$300K+ (transfer)", time: "2–6 months", priority: "high", type: "check",
      tip: "Do this BEFORE committing to a location. If the tract is over-concentrated, you either need a transfer or a different address.",
      checks: [
        { id: "a0", text: "Step 1: Look up your census tract number — enter your address on the Census geocoder", url: "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?benchmark=Public_AR_Current&vintage=Current_Current&format=html", link: "Census Tract Lookup →" },
        { id: "a1", text: "Step 2: Check if your tract is over-concentrated — select San Francisco county and enter your tract number", url: "https://www.abc.ca.gov/licensing/licensing-reports/licenses-by-county-and-census-tract/", link: "ABC Census Tract Report →" },
        { id: "a1b", text: "Step 2 alt: Use ABC's interactive map to see all active licenses near your address", url: "https://maps.gis.ca.gov/abc/lqs/", link: "ABC License Map →" },
        { id: "a2", text: "Step 3: If over-concentrated → search for transferable licenses in your area", url: "https://www.abc.ca.gov/licensing/license-lookup/", link: "ABC License Lookup →" },
        { id: "a3", text: "Step 4: Apply for license (new if available, or transfer)" },
        { id: "a4", text: "Step 5: Complete 30-day public posting period" },
        { id: "a5", text: "Step 6: Receive license" },
      ],
    });
    cL += at === "bw" ? 1000 : 50000; cH += at === "bw" ? 5000 : 300000; wL += 8; wH += 24;

    if (t === "bar" && a.chain !== "11+") {
      add({
        name: "Conditional Use Authorization (Bar)",
        agency: "Planning Commission",
        why: "Bars typically require a public hearing with neighborhood notification.",
        cost: "$5K–$15K", time: "3–6 months", priority: "high", type: "walk",
        walk: [
          { text: "File CUA application with Planning" },
          { text: "Neighborhood notification mailed" },
          { text: "Community outreach / meeting" },
          { text: "Attend Planning Commission hearing" },
        ],
      });
      cL += 5000; cH += 15000; wL += 12; wH += 24;
    }
  }

  // Music
  if (music && !exempt) {
    add({
      name: "Music licensing (ASCAP / BMI / SESAC)",
      agency: "Performing Rights Organizations",
      why: live
        ? "Live music requires PRO licenses plus an entertainment permit."
        : "Personal Spotify is NOT licensed for business use. You need PRO licenses (~$400–700/yr) or a B2B music service (~$30–60/mo) that bundles them. Fines are $750 per song.",
      cost: live ? "$700–$2K+/yr" : "$400–$700/yr", time: "1–2 weeks", priority: "med", type: "check",
      checks: [
        { id: "mu1", text: "Option A: Apply for ASCAP license", url: "https://www.ascap.com/music-users", link: "ASCAP →" },
        { id: "mu2", text: "Option A: Apply for BMI license", url: "https://www.bmi.com/licensing", link: "BMI →" },
        { id: "mu3", text: "Option A: Apply for SESAC license", url: "https://www.sesac.com", link: "SESAC →" },
        { id: "mu4", text: "— OR Option B: Sign up for a B2B music service", url: "https://www.soundtrackyourbrand.com", link: "Soundtrack Your Brand →" },
        { id: "mu5", text: "Cancel any personal Spotify/Pandora playing in your business" },
      ],
    });
    cL += 400; cH += 2000;
    if (live) {
      add({
        name: a.music === "live" ? "Place of Entertainment permit" : "Limited Live Performance permit",
        agency: "Entertainment Commission",
        why: "Required for live music, DJs, or dancing.",
        cost: "$500–$3K", time: "4–12 weeks", priority: "med", type: "walk",
        walk: [
          { text: "Apply at Entertainment Commission", url: "https://sfgov.org/entertainment/permit-applications", link: "Entertainment Commission →" },
          { text: "Submit application and plans" },
          { text: "Sound study may be required" },
          { text: "Neighborhood notification" },
          { text: "Receive permit with operating conditions" },
        ],
      });
      cL += 500; cH += 3000; wL += 4; wH += 12;
    }
  } else if (exempt) {
    add({
      name: "Music licensing — likely exempt",
      agency: "Info",
      why: "Under 3,750 sq ft + radio/TV only = probable federal exemption. Max 6 speakers, no cover charge.",
      cost: "$0", time: "—", priority: "info", type: "check",
      checks: [
        { id: "me1", text: "Confirm: 6 or fewer speakers, max 4 per room, no cover charge" },
        { id: "me2", text: "If all conditions met, no PRO license needed" },
      ],
    });
  }

  // ADA
  if (physical && t !== "food_truck") {
    add({
      name: "ADA accessibility — CASp inspection",
      agency: "CASp Inspector + Office of Small Business",
      why: "SF is a hotspot for serial ADA lawsuits ($4,000+ per violation). A CASp inspection gives legal protection. SF reimburses up to $10,000.",
      cost: "$500–$2K (reimbursable)", time: "2–4 weeks", priority: "high", type: "check",
      tip: "The $10K grant covers the inspection AND improvements.",
      checks: [
        { id: "ad1", text: "Find a CASp inspector", url: "https://apps2.dgs.ca.gov/DSA/casp/casp_certified_list.aspx", link: "CASp Directory →" },
        { id: "ad2", text: "Schedule and complete inspection" },
        { id: "ad3", text: "Apply for Accessible Barrier Removal Grant (up to $10K)", url: "https://www.sf.gov/apply-grant-make-your-business-accessible", link: "Apply for Grant →" },
        { id: "ad4", text: "Complete any required improvements" },
        { id: "ad5", text: "Keep CASp report on file (provides legal protection)" },
      ],
    });
    cL += 500; cH += 2000;
  }

  // Outdoor
  if (a.seat === "y") {
    add({
      name: "Shared Spaces / parklet permit",
      agency: "SF Public Works",
      why: "The Shared Spaces program is permanent. Great for foot traffic.",
      cost: "$500–$2K/yr", time: "4–8 weeks", priority: "med", type: "walk",
      walk: [
        { text: "Apply through SF Public Works", url: "https://sfpublicworks.org", link: "SF Public Works →" },
        { text: "Submit site plan" },
        { text: "Provide insurance documentation" },
        { text: "Receive permit and set up" },
      ],
    });
    cL += 500; cH += 2000; wL += 4; wH += 8;
  }

  // Employees
  if (emp) {
    const big = a.emp === "20+";
    let why = "CA EDD registration + Workers' Comp (mandatory). SF minimum wage $18.67/hr. Paid Sick Leave.";
    if (big) why += " HCSO: $2.56–$3.85/hr per employee for healthcare. Paid Parental Leave. Commuter Benefits.";
    why += " Fair Chance Ordinance: no criminal history questions until conditional offer.";
    add({
      name: "Employer registration + SF labor compliance",
      agency: "CA EDD + SF OLSE",
      why,
      cost: "Workers' Comp: $500–$5K+/yr", time: "1–2 weeks", priority: "high", type: "check",
      checks: [
        { id: "e1", text: "Register with CA EDD for payroll taxes", url: "https://edd.ca.gov/en/payroll_taxes/", link: "EDD Registration →" },
        { id: "e2", text: "Obtain Workers' Compensation insurance" },
        { id: "e3", text: "Review SF OLSE requirements for your employee count", url: "https://www.sf.gov/departments--office-labor-standards-enforcement", link: "SF OLSE →" },
        ...(big ? [
          { id: "e4", text: "Set up HCSO healthcare expenditures" },
          { id: "e5", text: "Establish Commuter Benefits program" },
        ] : []),
        { id: "e6", text: "Post all required workplace notices" },
      ],
    });
    cL += 500; cH += 5000;
  }

  // Salon specific
  if (t === "salon") {
    add({
      name: "State licenses",
      agency: "CA Board of Barbering & Cosmetology / DPH / SFPD",
      why: "Individual licenses for all practitioners + Establishment License. Massage requires SFPD permit.",
      cost: "$50–$500", time: "2–6 weeks", priority: "high", type: "check",
      checks: [
        { id: "s1", text: "Obtain individual practitioner licenses from state board", url: "https://www.barbercosmo.ca.gov", link: "State Board →" },
        { id: "s2", text: "Apply for Establishment License" },
        { id: "s3", text: "Massage: apply for SFPD permit (background check)" },
        { id: "s4", text: "Tattoo/piercing: apply for DPH Body Art permit" },
      ],
    });
    cL += 50; cH += 500;
  }

  // Home food
  if (t === "home" && ["cook", "prep"].includes(a.food ?? "")) {
    add({
      name: "Cottage Food Operation permit",
      agency: "DPH",
      why: "CA Homemade Food Act. Class A = direct sales. Class B = wholesale (requires inspection).",
      cost: "$200–$600", time: "2–4 weeks", priority: "med", type: "walk",
      walk: [
        { text: "Determine your class (A or B)" },
        { text: "Apply through DPH" },
        { text: "Class B: schedule kitchen inspection" },
        { text: "Receive permit" },
      ],
    });
    cL += 200; cH += 600;
  }

  // Food truck route
  if (t === "food_truck") {
    add({
      name: "Location / route approval",
      agency: "DPW / Planning",
      why: "Buffer rules: 75ft from restaurants, 500ft from elementary schools.",
      cost: "$0–$500+", time: "2–4 weeks", priority: "high", type: "check",
      checks: [
        { id: "ft1", text: "For public streets: apply through DPW" },
        { id: "ft2", text: "For private property: Temporary Use Authorization via Planning ($500+)" },
        { id: "ft3", text: "Alternative: join Off the Grid (10–20% of sales)", url: "https://offthegrid.com", link: "Off the Grid →" },
      ],
    });
    wL += 2; wH += 4;
  }

  // Waste
  if (physical) {
    add({
      name: "Waste & recycling setup",
      agency: "SF Environment",
      why: "Mandatory 3-stream separation." + (food ? " Compostable containers required. No polystyrene." : "") + " Free setup assistance available.",
      cost: "Free", time: "1 week", priority: "med", type: "check",
      checks: [
        { id: "w1", text: "Contact SF Environment for free setup visit", url: "https://sfenvironment.org/green-businesses", link: "SF Environment →" },
        { id: "w2", text: "Set up recycling, composting, and landfill bins" },
        { id: "w3", text: "Train staff on proper sorting" },
      ],
    });
  }

  // Signage
  if (["restaurant", "retail", "bar", "salon"].includes(t)) {
    add({
      name: "Signage permit",
      agency: "SF Planning",
      why: "New exterior signs need a permit. SF's sign code is strict.",
      cost: "$200–$1K", time: "2–6 weeks", priority: "low", type: "walk",
      walk: [
        { text: "Review Article 6 of SF Planning Code for your district" },
        { text: "Submit signage permit application to Planning" },
      ],
    });
    cL += 200; cH += 1000;
  }

  // Insurance
  add({
    name: "Business insurance",
    agency: "Private provider",
    why: "General Liability ($1M–$2M) required by most landlords." + (emp ? " Workers' Comp mandatory." : "") + (food ? " Product liability recommended." : ""),
    cost: "$500–$3K/yr", time: "1–3 days", priority: "med", type: "check",
    checks: [
      { id: "i1", text: "Get quotes from 3+ providers (Hiscox, NEXT, Hartford)" },
      { id: "i2", text: "Secure General Liability policy" },
      { id: "i3", text: emp ? "Secure Workers' Comp policy" : "Consider professional liability / E&O" },
    ],
  });
  cL += 500; cH += 3000;

  // Taxes
  add({
    name: "Tax setup + calendar",
    agency: "TTX + CDTFA + FTB",
    why: "Gross Receipts Tax (annual, even if $0). " + (physical && t !== "food_truck" ? "Commercial Rents Tax (3.4%). " : "") + "CA Franchise Tax ($800/yr for LLCs). We'll set up every deadline.",
    cost: "Varies", time: "Ongoing", priority: "med", type: "check",
    checks: [
      { id: "tx1", text: "Mark annual Gross Receipts Tax filing deadline" },
      { id: "tx2", text: "Set up quarterly/annual sales tax reminders" },
      { id: "tx3", text: "Note CA Franchise Tax due date (April 15)" },
      ...(physical && t !== "food_truck" ? [
        { id: "tx4", text: "Calculate Commercial Rents Tax obligation (3.4% of rent)" },
      ] : []),
      { id: "tx5", text: "Set license renewal reminder (March 31 annually)" },
    ],
  });

  const numberedSteps: RoadmapStep[] = steps.map((s, i) => ({ ...s, order: i + 1 }));

  return {
    steps: numberedSteps,
    warns,
    sum: {
      total: numberedSteps.length,
      cost: `$${cL.toLocaleString()}–$${cH.toLocaleString()}`,
      time: `${wL}–${wH} weeks`,
      bizLabel: BIZ_TYPES.find(b => b.id === t)?.label || t,
      autoFull: numberedSteps.filter(s => s.type === "form").length,
    },
  };
}
