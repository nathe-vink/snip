import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   SNIP — Cut through SF's red tape
   Full product: Landing → Intake → Roadmap
   ═══════════════════════════════════════════ */

/* ─── Design Tokens ─── */
const T = {
  // Typography
  display: "'Newsreader', 'Georgia', serif",
  body: "'Outfit', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  // Colors
  cream: "#FFFCF7",
  sand: "#F5F0E8",
  sandDark: "#EBE4D8",
  ink: "#1C1917",
  inkSoft: "#44403C",
  inkMuted: "#78716C",
  inkFaint: "#A8A29E",
  inkGhost: "#D6D3D1",
  green: "#15803D",
  greenSoft: "#DCFCE7",
  greenDark: "#14532D",
  amber: "#B45309",
  amberSoft: "#FEF3C7",
  blue: "#1D4ED8",
  blueSoft: "#DBEAFE",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  violet: "#7C3AED",
  violetSoft: "#F3E8FF",
};

/* ─── Business Types ─── */
const BIZ_TYPES = [
  { id: "restaurant", label: "Restaurant / Café", icon: "🍽", sub: "Food prepared on-site" },
  { id: "retail", label: "Retail store", icon: "🛍", sub: "Selling goods" },
  { id: "food_truck", label: "Food truck", icon: "🚚", sub: "Mobile food" },
  { id: "bar", label: "Bar / Lounge", icon: "🥃", sub: "Alcohol-focused" },
  { id: "salon", label: "Salon / Spa", icon: "✂", sub: "Personal care" },
  { id: "office", label: "Office / Consulting", icon: "◻", sub: "Professional services" },
  { id: "home", label: "Home-based", icon: "⌂", sub: "From your residence" },
  { id: "popup", label: "Pop-up", icon: "↗", sub: "Temporary retail or food" },
];

const NEIGHBORHOODS = [
  "Mission", "Castro", "SoMa", "Financial District", "North Beach",
  "Chinatown", "Sunset", "Richmond", "Hayes Valley", "Tenderloin",
  "Marina", "Nob Hill", "Pacific Heights", "Potrero Hill", "Dogpatch",
  "Bayview", "Haight-Ashbury", "Union Square", "Noe Valley", "Bernal Heights",
  "Glen Park", "Fillmore", "Excelsior", "Other",
];

/* ─── Intake Questions ─── */
const Q = [
  { id: "biz", q: "What are you opening?", type: "cards" },
  { id: "loc", q: "Do you have a space?", type: "opts", opts: [
    { id: "signed", l: "Signed a lease" }, { id: "looking", l: "Looking at one" }, { id: "no", l: "Not yet" }
  ]},
  { id: "hood", q: "Which neighborhood?", type: "select", showIf: a => a.loc !== "no" },
  { id: "sqft", q: "Approximate size?", type: "opts", opts: [
    { id: "small", l: "Under 3,750 sq ft" }, { id: "large", l: "3,750+ sq ft" }, { id: "idk", l: "Not sure" }
  ], showIf: a => a.loc !== "no" && !["home","office","food_truck"].includes(a.biz) },
  { id: "food", q: "Will you serve food?", type: "opts", opts: [
    { id: "cook", l: "Yes — cooking on-site" }, { id: "prep", l: "Prep only" },
    { id: "pkg", l: "Pre-packaged only" }, { id: "no", l: "No food" }
  ], showIf: a => !["restaurant","food_truck","home"].includes(a.biz) },
  { id: "alc", q: "Alcohol?", type: "opts", opts: [
    { id: "bw", l: "Beer & wine" }, { id: "full", l: "Full bar" },
    { id: "off", l: "Bottles to go" }, { id: "no", l: "None" }
  ], showIf: a => !["home","food_truck","office"].includes(a.biz) },
  { id: "music", q: "Music?", sub: "Even Spotify requires a commercial license.", type: "opts", opts: [
    { id: "live", l: "Live / DJs regularly" }, { id: "liveocc", l: "Live occasionally" },
    { id: "stream", l: "Streaming / recorded" }, { id: "radio", l: "Radio / TV only" },
    { id: "no", l: "None" }
  ], showIf: a => !["home","office"].includes(a.biz) },
  { id: "emp", q: "Employees?", type: "opts", opts: [
    { id: "solo", l: "Just me" }, { id: "1-9", l: "1–9" },
    { id: "10-19", l: "10–19" }, { id: "20+", l: "20+" }
  ]},
  { id: "entity", q: "Business entity?", type: "opts", opts: [
    { id: "llc", l: "LLC" }, { id: "corp", l: "Corporation" },
    { id: "sole", l: "Sole proprietor" }, { id: "none", l: "Not yet" }
  ]},
  { id: "seat", q: "Outdoor seating?", type: "opts", opts: [
    { id: "y", l: "Yes" }, { id: "m", l: "Maybe later" }, { id: "n", l: "No" }
  ], showIf: a => ["restaurant","bar"].includes(a.biz) },
  { id: "chain", q: "Total locations worldwide?", sub: "SF restricts chains with 11+.", type: "opts", opts: [
    { id: "1", l: "Just this one" }, { id: "2-10", l: "2–10" }, { id: "11+", l: "11+" }
  ], showIf: a => ["restaurant","retail","salon"].includes(a.biz) },
  { id: "when", q: "When do you want to open?", type: "opts", opts: [
    { id: "asap", l: "ASAP" }, { id: "3mo", l: "Within 3 months" },
    { id: "6mo", l: "Within 6 months" }, { id: "idk", l: "Exploring" }
  ]},
  { id: "email", q: "Your email", sub: "We'll save your progress.", type: "email" },
];

/* ─── Roadmap Generator ─── */
function buildRoadmap(a) {
  const steps = [];
  const warns = [];
  const t = a.biz;
  let cL=0,cH=0,wL=1,wH=2;
  const physical = !["home","office"].includes(t);
  const food = ["restaurant","food_truck"].includes(t) || ["cook","prep"].includes(a.food);
  const alc = t==="bar" || (a.alc && a.alc!=="no");
  const music = a.music && a.music!=="no";
  const live = ["live","liveocc"].includes(a.music);
  const exempt = a.music==="radio" && a.sqft==="small";
  const emp = a.emp!=="solo";

  const add = (s) => steps.push({...s, order:steps.length+1});

  // Entity
  if(!["llc","corp"].includes(a.entity)){
    add({name:"Form your business entity",agency:"CA Secretary of State",why:"An LLC ($70) protects your personal assets if the business gets sued. Takes minutes to file online.",cost:"$70–$100",time:"1–5 days",priority:"high",type:"form",
      fields:[{id:"etype",label:"Entity type",kind:"select",options:["LLC (recommended)","Corporation","Sole proprietor"]},{id:"lname",label:"Your legal name",kind:"text",ph:"Jane Kim"},{id:"bname",label:"Business name",kind:"text",ph:"Snip LLC"},{id:"addr",label:"Business address",kind:"text",ph:"456 Valencia St, SF 94103"}],
      actions:[{label:"Generate Articles of Organization",primary:true},{label:"File on CA SOS website →",url:"https://bizfileonline.sos.ca.gov"}],
      done_field:{label:"Your entity number or confirmation",ph:"e.g. 202612345678"}
    });
    cL+=70;cH+=100;
  }

  // EIN
  add({name:"Get your EIN",agency:"IRS",why:"Your business's Social Security number. Free, instant, and required for everything else.",cost:"Free",time:"5 min",priority:"high",type:"walk",
    walk:[
      {text:"Go to the IRS online application",url:"https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",link:"Open IRS EIN Application →"},
      {text:"Select your entity type (LLC, Corporation, etc.)"},
      {text:"Confirm state: California"},
      {text:"Reason: 'Started a new business'"},
      {text:"Enter your info as the responsible party"},
      {text:"Save your EIN confirmation letter"}
    ],
    done_field:{label:"Your EIN",ph:"XX-XXXXXXX"}
  });

  // Zoning
  if(a.loc!=="no" && physical){
    const urgent = a.loc==="signed";
    add({name:"Verify zoning",agency:"SF Planning",why:urgent?"You've signed a lease — let's confirm your business type is allowed here immediately.":"Confirm your intended use is permitted at your target location before you commit.",cost:"Free",time:"Same day",priority:urgent?"urgent":"high",type:"check",
      checks:[
        {id:"z1",text:"Look up your property on the SF Planning Map",url:"https://sfplanninggis.org/pim/",link:"Open SF Planning Map →"},
        {id:"z2",text:"Find your zoning district code (e.g., NCT-Mission, C-3-G)"},
        {id:"z3",text:"Check if your use is Permitted (P) or Conditionally Permitted (C)",url:"https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_planning/0-0-0-17837",link:"SF Planning Code →"},
        {id:"z4",text:"If Not Permitted (NP) — stop and reconsider the location"}
      ],
      done_options:[{id:"p",label:"✓ Permitted"},{id:"c",label:"⚠ Conditionally Permitted"},{id:"np",label:"✕ Not Permitted"},{id:"help",label:"? Need help"}]
    });
    if(urgent) warns.push("Lease signed before confirming zoning — the #1 mistake. Verify immediately.");
  }

  // Formula retail
  if(a.chain==="11+"){
    add({name:"Conditional Use Authorization (Formula Retail)",agency:"SF Planning Commission",why:"11+ locations = 'formula retail' in SF. Public hearing required. Some neighborhoods ban it entirely.",cost:"$5K–$15K",time:"3–6 months",priority:"urgent",type:"walk",
      walk:[{text:"This requires a formal application to the Planning Commission"},{text:"Neighborhood notification and community outreach"},{text:"Public hearing — potential opposition"},{text:"We recommend hiring a land use attorney for this step"}]
    });
    warns.push("Formula retail requires a Conditional Use hearing — adds 3–6 months.");
    cL+=5000;cH+=15000;wL+=12;wH+=24;
  }

  // TTX Registration
  add({name:"Register with SF Treasurer & Tax Collector",agency:"TTX",why:"This gets you your Business Account Number (BAN) — the key that unlocks every other SF permit.",cost:"Free – $35K",time:"10–15 business days",priority:"high",type:"walk",
    tip:"Most new businesses qualify for First Year Free — registration fee waived.",
    walk:[
      {text:"Go to SF business registration",url:"https://sftreasurer.org/business/register-business",link:"Open TTX Registration →"},
      {text:"You'll need: EIN, entity type, business address, start date, estimated gross receipts"},
      {text:"Submit the application online"},
      {text:"Sign the DocuSign email you'll receive"},
      {text:"Pay registration fee (if applicable)"},
      {text:"Save your Business Account Number (BAN) from the confirmation"}
    ],
    done_field:{label:"Your BAN",ph:"XXXXXXXXXX"}
  });
  wL+=1;wH+=2;

  // Seller's permit
  if(["restaurant","retail","food_truck","popup","bar"].includes(t)){
    add({name:"CA Seller's Permit",agency:"CDTFA",why:"Required to collect sales tax (8.625% in SF). Free and usually instant.",cost:"Free",time:"Instant",priority:"med",type:"walk",
      walk:[{text:"Apply on the CDTFA website",url:"https://onlineservices.cdtfa.ca.gov/_/",link:"Open CDTFA Application →"},{text:"Select 'Seller's Permit'  →  enter business info"},{text:"Most approvals are instant"}]
    });
  }

  // Building permit
  if(food && t!=="food_truck"){
    add({name:"Building permit (tenant improvements)",agency:"DBI",why:"Required for any buildout — kitchen, plumbing, ventilation, ADA. This is usually the longest step.",cost:"$500–$15K+",time:"4–16 weeks",priority:"high",type:"check",
      checks:[{id:"bp1",text:"Hire a licensed architect and/or contractor"},{id:"bp2",text:"Prepare construction drawings"},{id:"bp3",text:"Submit to DBI via PermitSF portal",url:"https://permitsf.sfgov.org",link:"PermitSF Portal →"},{id:"bp4",text:"Respond to any plan check corrections"},{id:"bp5",text:"Receive building permit and begin construction"}]
    });
    cL+=500;cH+=15000;wL+=4;wH+=16;
  }

  // Fire
  if(food || alc){
    add({name:"Fire Department clearance",agency:"SFFD",why:"Fire inspection required before DPH will issue your health permit.",cost:"License fees",time:"1–4 weeks",priority:"high",type:"check",
      checks:[{id:"f1",text:"Contact SFFD Fire Prevention: (628) 652-3260"},{id:"f2",text:"Schedule fire inspection"},{id:"f3",text:"Verify: occupancy load posted, suppression system, exits, extinguishers"},{id:"f4",text:"Receive fire clearance"}]
    });
    wL+=1;wH+=4;
  }

  // Health permit
  if(food){
    add({name:t==="food_truck"?"Health permit (Mobile Food Facility)":"Health Permit to Operate",agency:"DPH Environmental Health",why:t==="food_truck"?"Requires plan check, commissary verification, and final inspection.":"Plan check, food safety certification, and final inspection. Request a FREE site evaluation before signing a lease.",cost:"$400–$2K+",time:"2–8 weeks",priority:"high",type:"walk",
      walk:[
        {text:"Apply through DPH Environmental Health",url:"https://etaxstatement.sfgov.org/dphehbfoodpermit",link:"DPH Online Application →"},
        {text:"Submit plan check documents and fee"},
        ...(t==="food_truck"?[{text:"Provide commissary kitchen agreement"},{text:"Provide restroom verification"}]:[]),
        {text:"Ensure Food Safety Manager is certified (see next step)"},
        {text:"Pass final inspection"}
      ]
    });
    cL+=400;cH+=2000;wL+=2;wH+=8;

    add({name:"Food Safety Manager certification",agency:"ServSafe / ANSI provider",why:"At least 1 person must be certified. All food handlers need Food Handler Cards (~$15 each).",cost:"$80–$180",time:"1–2 days",priority:"high",type:"walk",
      walk:[{text:"Enroll in an approved course (ServSafe, StateFoodSafety, etc.)",url:"https://www.servsafe.com",link:"ServSafe →"},{text:"Complete ~8 hour course"},{text:"Pass the exam"},{text:"Get Food Handler Cards for all other staff"}]
    });
    cL+=80;cH+=180;
  }

  // Alcohol
  if(alc){
    const at = a.alc||"full";
    const lt = at==="bw"?"Type 41 (Beer & Wine)":at==="off"?"Type 20/21 (Off-Sale)":"Type 47/48 (Full Bar)";
    add({name:`Liquor License — ${lt}`,agency:"CA ABC",why:"Before anything else: check if your census tract allows a new license. If it's over-concentrated, a transfer from a previous tenant is your only path — and that changes your budget and timeline significantly.",cost:at==="bw"?"$1K–$5K":"$50K–$300K+ (transfer)",time:"2–6 months",priority:"high",type:"check",
      tip:"Do this BEFORE committing to a location. If the tract is over-concentrated, you either need a transfer or a different address.",
      checks:[
        {id:"a0",text:"Step 1: Look up your census tract number — enter your address on the Census geocoder",url:"https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?benchmark=Public_AR_Current&vintage=Current_Current&format=html",link:"Census Tract Lookup →"},
        {id:"a1",text:"Step 2: Check if your tract is over-concentrated — select San Francisco county and enter your tract number",url:"https://www.abc.ca.gov/licensing/licensing-reports/licenses-by-county-and-census-tract/",link:"ABC Census Tract Report →"},
        {id:"a1b",text:"Step 2 alt: Use ABC's interactive map to see all active licenses near your address",url:"https://maps.gis.ca.gov/abc/lqs/",link:"ABC License Map →"},
        {id:"a2",text:"Step 3: If over-concentrated → search for transferable licenses in your area",url:"https://www.abc.ca.gov/licensing/license-lookup/",link:"ABC License Lookup →"},
        {id:"a3",text:"Step 4: Apply for license (new if available, or transfer)"},
        {id:"a4",text:"Step 5: Complete 30-day public posting period"},
        {id:"a5",text:"Step 6: Receive license"}
      ]
    });
    cL+=at==="bw"?1000:50000;cH+=at==="bw"?5000:300000;wL+=8;wH+=24;

    if(t==="bar" && a.chain!=="11+"){
      add({name:"Conditional Use Authorization (Bar)",agency:"Planning Commission",why:"Bars typically require a public hearing with neighborhood notification.",cost:"$5K–$15K",time:"3–6 months",priority:"high",type:"walk",
        walk:[{text:"File CUA application with Planning"},{text:"Neighborhood notification mailed"},{text:"Community outreach / meeting"},{text:"Attend Planning Commission hearing"}]
      });
      cL+=5000;cH+=15000;wL+=12;wH+=24;
    }
  }

  // Music
  if(music && !exempt){
    add({name:"Music licensing (ASCAP / BMI / SESAC)",agency:"Performing Rights Organizations",why:live?"Live music requires PRO licenses plus an entertainment permit.":"Personal Spotify is NOT licensed for business use. You need PRO licenses (~$400–700/yr) or a B2B music service (~$30–60/mo) that bundles them. Fines are $750 per song.",cost:live?"$700–$2K+/yr":"$400–$700/yr",time:"1–2 weeks",priority:"med",type:"check",
      checks:[
        {id:"mu1",text:"Option A: Apply for ASCAP license",url:"https://www.ascap.com/music-users",link:"ASCAP →"},
        {id:"mu2",text:"Option A: Apply for BMI license",url:"https://www.bmi.com/licensing",link:"BMI →"},
        {id:"mu3",text:"Option A: Apply for SESAC license",url:"https://www.sesac.com",link:"SESAC →"},
        {id:"mu4",text:"— OR Option B: Sign up for a B2B music service",url:"https://www.soundtrackyourbrand.com",link:"Soundtrack Your Brand →"},
        {id:"mu5",text:"Cancel any personal Spotify/Pandora playing in your business"}
      ]
    });
    cL+=400;cH+=2000;
    if(live){
      add({name:a.music==="live"?"Place of Entertainment permit":"Limited Live Performance permit",agency:"Entertainment Commission",why:"Required for live music, DJs, or dancing.",cost:"$500–$3K",time:"4–12 weeks",priority:"med",type:"walk",
        walk:[{text:"Apply at Entertainment Commission",url:"https://sfgov.org/entertainment/permit-applications",link:"Entertainment Commission →"},{text:"Submit application and plans"},{text:"Sound study may be required"},{text:"Neighborhood notification"},{text:"Receive permit with operating conditions"}]
      });
      cL+=500;cH+=3000;wL+=4;wH+=12;
    }
  } else if(exempt){
    add({name:"Music licensing — likely exempt",agency:"Info",why:"Under 3,750 sq ft + radio/TV only = probable federal exemption. Max 6 speakers, no cover charge.",cost:"$0",time:"—",priority:"info",type:"check",checks:[{id:"me1",text:"Confirm: 6 or fewer speakers, max 4 per room, no cover charge"},{id:"me2",text:"If all conditions met, no PRO license needed"}]});
  }

  // ADA
  if(physical && t!=="food_truck"){
    add({name:"ADA accessibility — CASp inspection",agency:"CASp Inspector + Office of Small Business",why:"SF is a hotspot for serial ADA lawsuits ($4,000+ per violation). A CASp inspection gives legal protection. SF reimburses up to $10,000.",cost:"$500–$2K (reimbursable)",time:"2–4 weeks",priority:"high",type:"check",
      checks:[
        {id:"ad1",text:"Find a CASp inspector",url:"https://apps2.dgs.ca.gov/DSA/casp/casp_certified_list.aspx",link:"CASp Directory →"},
        {id:"ad2",text:"Schedule and complete inspection"},
        {id:"ad3",text:"Apply for Accessible Barrier Removal Grant (up to $10K)",url:"https://www.sf.gov/apply-grant-make-your-business-accessible",link:"Apply for Grant →"},
        {id:"ad4",text:"Complete any required improvements"},
        {id:"ad5",text:"Keep CASp report on file (provides legal protection)"}
      ],
      tip:"The $10K grant covers the inspection AND improvements."
    });
    cL+=500;cH+=2000;
  }

  // Outdoor
  if(a.seat==="y"){
    add({name:"Shared Spaces / parklet permit",agency:"SF Public Works",why:"The Shared Spaces program is permanent. Great for foot traffic.",cost:"$500–$2K/yr",time:"4–8 weeks",priority:"med",type:"walk",
      walk:[{text:"Apply through SF Public Works",url:"https://sfpublicworks.org",link:"SF Public Works →"},{text:"Submit site plan"},{text:"Provide insurance documentation"},{text:"Receive permit and set up"}]
    });
    cL+=500;cH+=2000;wL+=4;wH+=8;
  }

  // Employees
  if(emp){
    const big = a.emp==="20+";
    let why = "CA EDD registration + Workers' Comp (mandatory). SF minimum wage $18.67/hr. Paid Sick Leave.";
    if(big) why+=" HCSO: $2.56–$3.85/hr per employee for healthcare. Paid Parental Leave. Commuter Benefits.";
    why += " Fair Chance Ordinance: no criminal history questions until conditional offer.";
    add({name:"Employer registration + SF labor compliance",agency:"CA EDD + SF OLSE",why,cost:"Workers' Comp: $500–$5K+/yr",time:"1–2 weeks",priority:"high",type:"check",
      checks:[
        {id:"e1",text:"Register with CA EDD for payroll taxes",url:"https://edd.ca.gov/en/payroll_taxes/",link:"EDD Registration →"},
        {id:"e2",text:"Obtain Workers' Compensation insurance"},
        {id:"e3",text:"Review SF OLSE requirements for your employee count",url:"https://www.sf.gov/departments--office-labor-standards-enforcement",link:"SF OLSE →"},
        ...(big?[{id:"e4",text:"Set up HCSO healthcare expenditures"},{id:"e5",text:"Establish Commuter Benefits program"}]:[]),
        {id:"e6",text:"Post all required workplace notices"}
      ]
    });
    cL+=500;cH+=5000;
  }

  // Salon specific
  if(t==="salon"){
    add({name:"State licenses",agency:"CA Board of Barbering & Cosmetology / DPH / SFPD",why:"Individual licenses for all practitioners + Establishment License. Massage requires SFPD permit.",cost:"$50–$500",time:"2–6 weeks",priority:"high",type:"check",
      checks:[{id:"s1",text:"Obtain individual practitioner licenses from state board",url:"https://www.barbercosmo.ca.gov",link:"State Board →"},{id:"s2",text:"Apply for Establishment License"},{id:"s3",text:"Massage: apply for SFPD permit (background check)"},{id:"s4",text:"Tattoo/piercing: apply for DPH Body Art permit"}]
    });
    cL+=50;cH+=500;
  }

  // Home food
  if(t==="home" && ["cook","prep"].includes(a.food)){
    add({name:"Cottage Food Operation permit",agency:"DPH",why:"CA Homemade Food Act. Class A = direct sales. Class B = wholesale (requires inspection).",cost:"$200–$600",time:"2–4 weeks",priority:"med",type:"walk",
      walk:[{text:"Determine your class (A or B)"},{text:"Apply through DPH"},{text:"Class B: schedule kitchen inspection"},{text:"Receive permit"}]
    });
    cL+=200;cH+=600;
  }

  // Food truck route
  if(t==="food_truck"){
    add({name:"Location / route approval",agency:"DPW / Planning",why:"Buffer rules: 75ft from restaurants, 500ft from elementary schools.",cost:"$0–$500+",time:"2–4 weeks",priority:"high",type:"check",
      checks:[{id:"ft1",text:"For public streets: apply through DPW"},{id:"ft2",text:"For private property: Temporary Use Authorization via Planning ($500+)"},{id:"ft3",text:"Alternative: join Off the Grid (10–20% of sales)",url:"https://offthegrid.com",link:"Off the Grid →"}]
    });
    wL+=2;wH+=4;
  }

  // Waste
  if(physical){
    add({name:"Waste & recycling setup",agency:"SF Environment",why:"Mandatory 3-stream separation."+(food?" Compostable containers required. No polystyrene.":"")+" Free setup assistance available.",cost:"Free",time:"1 week",priority:"med",type:"check",
      checks:[{id:"w1",text:"Contact SF Environment for free setup visit",url:"https://sfenvironment.org/green-businesses",link:"SF Environment →"},{id:"w2",text:"Set up recycling, composting, and landfill bins"},{id:"w3",text:"Train staff on proper sorting"}]
    });
  }

  // Signage
  if(["restaurant","retail","bar","salon"].includes(t)){
    add({name:"Signage permit",agency:"SF Planning",why:"New exterior signs need a permit. SF's sign code is strict.",cost:"$200–$1K",time:"2–6 weeks",priority:"low",type:"walk",
      walk:[{text:"Review Article 6 of SF Planning Code for your district"},{text:"Submit signage permit application to Planning"}]
    });
    cL+=200;cH+=1000;
  }

  // Insurance
  add({name:"Business insurance",agency:"Private provider",why:"General Liability ($1M–$2M) required by most landlords."+(emp?" Workers' Comp mandatory.":"")+(food?" Product liability recommended.":""),cost:"$500–$3K/yr",time:"1–3 days",priority:"med",type:"check",
    checks:[{id:"i1",text:"Get quotes from 3+ providers (Hiscox, NEXT, Hartford)"},{id:"i2",text:"Secure General Liability policy"},{id:"i3",text:emp?"Secure Workers' Comp policy":"Consider professional liability / E&O"}]
  });
  cL+=500;cH+=3000;

  // Taxes
  add({name:"Tax setup + calendar",agency:"TTX + CDTFA + FTB",why:"Gross Receipts Tax (annual, even if $0). "+(physical&&t!=="food_truck"?"Commercial Rents Tax (3.4%). ":"")+"CA Franchise Tax ($800/yr for LLCs). We'll set up every deadline.",cost:"Varies",time:"Ongoing",priority:"med",type:"check",
    checks:[{id:"tx1",text:"Mark annual Gross Receipts Tax filing deadline"},{id:"tx2",text:"Set up quarterly/annual sales tax reminders"},{id:"tx3",text:"Note CA Franchise Tax due date (April 15)"},
      ...(physical&&t!=="food_truck"?[{id:"tx4",text:"Calculate Commercial Rents Tax obligation (3.4% of rent)"}]:[]),
      {id:"tx5",text:"Set license renewal reminder (March 31 annually)"}]
  });

  return {steps,warns,sum:{
    total:steps.length,cost:`$${cL.toLocaleString()}–$${cH.toLocaleString()}`,
    time:`${wL}–${wH} weeks`,
    bizLabel:BIZ_TYPES.find(b=>b.id===t)?.label||t,
    autoFull:steps.filter(s=>s.type==="form").length,
  }};
}

/* ─── Shared Components ─── */
function Logo(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:32,height:32,borderRadius:8,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="4" x2="14" y2="16"/><line x1="18" y1="4" x2="10" y2="16"/><circle cx="4" cy="19" r="3" fill="none"/><circle cx="20" cy="19" r="3" fill="none"/></svg>
      </div>
      <span style={{fontFamily:T.display,fontSize:20,fontWeight:500,color:T.ink,letterSpacing:"-0.02em"}}>Snip</span>
    </div>
  );
}

/* ─── Landing Page ─── */
function Landing({onStart,onResume,hasRoadmap}){
  return(
    <div style={{background:T.cream,minHeight:"100vh"}}>
      {/* Nav */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"28px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Logo/>
        <span style={{fontFamily:T.mono,fontSize:11,color:T.inkMuted,letterSpacing:"0.04em"}}>SAN FRANCISCO</span>
      </div>

      {/* Hero */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"80px 24px 60px"}}>
        <h1 style={{fontFamily:T.display,fontSize:48,fontWeight:400,color:T.ink,lineHeight:1.1,margin:0,letterSpacing:"-0.03em",maxWidth:560}}>
          Every permit.<br/>One place.
        </h1>
        <p style={{fontFamily:T.body,fontSize:18,color:T.inkSoft,lineHeight:1.6,margin:"20px 0 0",maxWidth:480}}>
          Opening a business in San Francisco means navigating 12+ city agencies, dozens of permits, and months of paperwork. Snip maps your entire journey and walks you through each step.
        </p>
        <p style={{fontFamily:T.body,fontSize:15,color:T.inkMuted,lineHeight:1.6,margin:"12px 0 0",maxWidth:480}}>
          Free for everyone. Takes 2 minutes.
        </p>
        <div style={{display:"flex",gap:12,marginTop:32,flexWrap:"wrap"}}>
          <button onClick={onStart} style={{
            fontFamily:T.body,fontSize:16,fontWeight:500,
            padding:"14px 32px",borderRadius:10,border:"none",
            background:T.ink,color:T.cream,cursor:"pointer",
            letterSpacing:"-0.01em",
          }}>Build my roadmap →</button>
          {hasRoadmap && (
            <button onClick={onResume} style={{
              fontFamily:T.body,fontSize:16,fontWeight:500,
              padding:"14px 32px",borderRadius:10,
              border:`1.5px solid ${T.ink}`,background:"transparent",
              color:T.ink,cursor:"pointer",letterSpacing:"-0.01em",
            }}>Resume my roadmap →</button>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"0 24px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
          {[
            {n:"01",title:"Answer a few questions",sub:"Business type, location, and what you'll offer. 2 minutes."},
            {n:"02",title:"Get your roadmap",sub:"Every permit, license, and registration — in the right order, with direct links."},
            {n:"03",title:"Do it yourself or get help",sub:"Each step is a guided workflow. Stuck? Our team handles it for you."},
          ].map((s,i)=>(
            <div key={i} style={{padding:"24px 20px",background:T.sand,borderRadius:12}}>
              <div style={{fontFamily:T.mono,fontSize:11,color:T.inkMuted,letterSpacing:"0.06em",marginBottom:10}}>{s.n}</div>
              <div style={{fontFamily:T.display,fontSize:17,color:T.ink,marginBottom:6,fontWeight:500}}>{s.title}</div>
              <div style={{fontFamily:T.body,fontSize:13,color:T.inkMuted,lineHeight:1.5}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"0 24px 40px"}}>
        <div style={{background:T.sand,borderRadius:12,padding:"20px 24px",display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
          {[
            {v:"12+",l:"city agencies mapped"},
            {v:"90K+",l:"active SF businesses"},
            {v:"~5,000",l:"new registrations per year"},
          ].map((s,i)=>(
            <div key={i} style={{flex:1,minWidth:120,textAlign:"center"}}>
              <div style={{fontFamily:T.display,fontSize:24,color:T.ink,fontWeight:400}}>{s.v}</div>
              <div style={{fontFamily:T.body,fontSize:11,color:T.inkMuted,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"20px 24px 32px",textAlign:"center"}}>
        <p style={{fontFamily:T.body,fontSize:11,color:T.inkFaint}}>
          Registered permit consultant · SF Ethics Commission · Free for everyone
        </p>
      </div>
    </div>
  );
}

/* ─── Intake ─── */
function Intake({onComplete}){
  const[answers,setAnswers]=useState({});
  const[idx,setIdx]=useState(0);
  const visible = Q.filter(q=>!q.showIf||q.showIf(answers));
  const cur = visible[idx];
  const isLast = idx===visible.length-1;
  const has = cur && answers[cur.id]!==undefined && answers[cur.id]!=="";

  const set = v => setAnswers(p=>({...p,[cur.id]:v}));

  return(
    <div style={{background:T.cream,minHeight:"100vh",padding:"28px 24px 40px"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <Logo/>
        {/* Progress */}
        <div style={{display:"flex",gap:3,margin:"32px 0 36px"}}>
          {visible.map((_,i)=>(
            <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=idx?T.ink:T.sandDark,transition:"background 0.3s"}}/>
          ))}
        </div>

        <h2 style={{fontFamily:T.display,fontSize:26,fontWeight:400,color:T.ink,margin:"0 0 4px",lineHeight:1.2,letterSpacing:"-0.02em"}}>{cur?.q}</h2>
        {cur?.sub && <p style={{fontFamily:T.body,fontSize:14,color:T.inkMuted,margin:"0 0 20px",lineHeight:1.5}}>{cur.sub}</p>}
        {!cur?.sub && <div style={{height:18}}/>}

        {/* Card select */}
        {cur?.type==="cards" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {BIZ_TYPES.map(b=>(
              <button key={b.id} onClick={()=>set(b.id)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,textAlign:"left",cursor:"pointer",
                border:answers[cur.id]===b.id?`2px solid ${T.ink}`:`1.5px solid ${T.sandDark}`,
                background:answers[cur.id]===b.id?T.sand:T.cream,
              }}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>{b.icon}</span>
                <div>
                  <div style={{fontFamily:T.body,fontSize:14,fontWeight:500,color:T.ink}}>{b.label}</div>
                  <div style={{fontFamily:T.body,fontSize:11,color:T.inkMuted}}>{b.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Options */}
        {cur?.type==="opts" && (
          <div style={{display:"grid",gap:6}}>
            {cur.opts.map(o=>(
              <button key={o.id} onClick={()=>set(o.id)} style={{
                padding:"13px 16px",borderRadius:10,textAlign:"left",cursor:"pointer",
                fontFamily:T.body,fontSize:15,color:T.ink,
                border:answers[cur.id]===o.id?`2px solid ${T.ink}`:`1.5px solid ${T.sandDark}`,
                background:answers[cur.id]===o.id?T.sand:T.cream,
              }}>{o.l}</button>
            ))}
          </div>
        )}

        {/* Select */}
        {cur?.type==="select" && (
          <select value={answers[cur.id]||""} onChange={e=>set(e.target.value)} style={{
            width:"100%",padding:"13px 14px",borderRadius:10,border:`1.5px solid ${T.sandDark}`,
            background:T.cream,fontFamily:T.body,fontSize:15,color:T.ink,boxSizing:"border-box",
          }}>
            <option value="">Select...</option>
            {NEIGHBORHOODS.map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        )}

        {/* Email */}
        {cur?.type==="email" && (
          <input type="email" value={answers[cur.id]||""} onChange={e=>set(e.target.value)}
            placeholder="you@email.com" style={{
              width:"100%",padding:"13px 14px",borderRadius:10,border:`1.5px solid ${T.sandDark}`,
              background:T.cream,fontFamily:T.body,fontSize:16,color:T.ink,boxSizing:"border-box",outline:"none",
            }}/>
        )}

        {/* Nav */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
          <button onClick={()=>idx>0&&setIdx(p=>p-1)} disabled={idx===0} style={{
            padding:"10px 18px",borderRadius:8,border:`1.5px solid ${T.sandDark}`,background:"transparent",
            color:idx===0?T.inkGhost:T.inkSoft,fontFamily:T.body,fontSize:14,cursor:idx===0?"default":"pointer",
          }}>←</button>
          <button onClick={()=>{if(isLast){onComplete(answers)}else setIdx(p=>p+1)}} disabled={!has} style={{
            padding:"10px 24px",borderRadius:8,border:"none",
            background:has?T.ink:T.sandDark,color:has?T.cream:T.inkMuted,
            fontFamily:T.body,fontSize:14,fontWeight:500,cursor:has?"pointer":"default",
          }}>{isLast?"Generate roadmap →":"→"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Roadmap ─── */
function Roadmap({roadmap:r,answers:a}){
  const[open,setOpen]=useState(null);
  const[checks,setChecks]=useState({});
  const[statuses,setStatuses]=useState({});
  const[doneVals,setDoneVals]=useState({});
  const[helpStep,setHelpStep]=useState(null);
  const[helpForm,setHelpForm]=useState({name:"",email:a.email||"",note:""});
  const[helpSent,setHelpSent]=useState({});

  // Load saved progress
  useEffect(()=>{
    (async()=>{
      try{
        const saved = await window.storage.get("snip-progress");
        if(saved?.value){
          const d=JSON.parse(saved.value);
          if(d.checks) setChecks(d.checks);
          if(d.statuses) setStatuses(d.statuses);
          if(d.doneVals) setDoneVals(d.doneVals);
        }
      }catch(e){}
    })();
  },[]);

  // Save progress on changes
  useEffect(()=>{
    (async()=>{
      try{
        await window.storage.set("snip-progress",JSON.stringify({checks,statuses,doneVals}));
      }catch(e){}
    })();
  },[checks,statuses,doneVals]);

  const toggle = (stepOrder,checkId) => {
    const key = `${stepOrder}-${checkId}`;
    setChecks(p=>({...p,[key]:!p[key]}));
  };

  const markDone = (order) => setStatuses(p=>({...p,[order]:"complete"}));
  const getStatus = (order) => statuses[order]||"not_started";

  const pColor = {urgent:T.red,high:T.green,med:T.amber,low:T.inkMuted,info:T.inkMuted};
  const pLabel = {urgent:"URGENT",high:"REQUIRED",med:"IMPORTANT",low:"WHEN READY",info:"FYI"};

  return(
    <div style={{background:T.cream,minHeight:"100vh",padding:"28px 24px 40px"}}>
      <div style={{maxWidth:620,margin:"0 auto"}}>
        <Logo/>

        {/* Header */}
        <div style={{margin:"32px 0 20px"}}>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.inkMuted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>Your launch roadmap</div>
          <h1 style={{fontFamily:T.display,fontSize:28,fontWeight:400,color:T.ink,margin:0,letterSpacing:"-0.02em"}}>{r.sum.bizLabel}</h1>
          <p style={{fontFamily:T.body,fontSize:14,color:T.inkMuted,margin:"4px 0 0"}}>{a.hood||"San Francisco"} · {r.sum.total} steps · {r.sum.cost} · {r.sum.time}</p>
        </div>

        {/* Progress bar */}
        {(()=>{
          const done = Object.values(statuses).filter(s=>s==="complete").length;
          const pct = Math.round((done/r.steps.length)*100);
          return(
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:T.mono,fontSize:10,color:T.inkMuted,letterSpacing:"0.04em"}}>{done} of {r.steps.length} complete</span>
                <span style={{fontFamily:T.mono,fontSize:10,color:T.green}}>{pct}%</span>
              </div>
              <div style={{height:5,background:T.sandDark,borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:T.green,borderRadius:3,transition:"width 0.4s ease"}}/>
              </div>
            </div>
          );
        })()}

        {/* Warnings */}
        {r.warns.length>0 && (
          <div style={{background:T.amberSoft,border:`1px solid #F59E0B`,borderRadius:10,padding:14,marginBottom:16}}>
            {r.warns.map((w,i)=><p key={i} style={{fontFamily:T.body,fontSize:13,color:T.amber,margin:i?"6px 0 0":0,lineHeight:1.5}}>⚠ {w}</p>)}
          </div>
        )}

        {/* Steps */}
        <div style={{display:"grid",gap:6}}>
          {r.steps.map(step=>{
            const isOpen = open===step.order;
            const status = getStatus(step.order);
            const color = pColor[step.priority];
            return(
              <div key={step.order} style={{
                background:status==="complete"?"#F0FDF4":T.cream,
                border:isOpen?`1.5px solid ${color}50`:`1px solid ${T.sandDark}`,
                borderRadius:10,overflow:"hidden",
              }}>
                {/* Header */}
                <div onClick={()=>setOpen(isOpen?null:step.order)} style={{
                  padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,
                }}>
                  <div style={{
                    width:26,height:26,borderRadius:"50%",flexShrink:0,
                    background:status==="complete"?T.green:`${color}14`,
                    color:status==="complete"?"#fff":color,
                    fontFamily:T.mono,fontSize:11,fontWeight:600,
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>{status==="complete"?"✓":step.order}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:T.display,fontSize:15,color:T.ink,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{step.name}</div>
                    <div style={{fontFamily:T.body,fontSize:11,color:T.inkMuted}}>{step.agency} · {step.cost} · {step.time}</div>
                  </div>
                  <span style={{
                    fontFamily:T.mono,fontSize:8,fontWeight:700,letterSpacing:"0.06em",
                    color,background:`${color}10`,padding:"3px 7px",borderRadius:4,
                  }}>{pLabel[step.priority]}</span>
                </div>

                {/* Body */}
                {isOpen && (
                  <div style={{padding:"0 16px 16px",borderTop:`1px solid ${T.sandDark}`,paddingTop:14}}>
                    <p style={{fontFamily:T.body,fontSize:14,color:T.inkSoft,lineHeight:1.65,margin:"0 0 14px"}}>{step.why}</p>

                    {step.tip && (
                      <div style={{background:T.greenSoft,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                        <span style={{fontFamily:T.body,fontSize:13,color:T.greenDark}}>{step.tip}</span>
                      </div>
                    )}

                    {/* Form type */}
                    {step.type==="form" && step.fields && (
                      <div style={{display:"grid",gap:10,marginBottom:14}}>
                        {step.fields.map(f=>(
                          <div key={f.id}>
                            <label style={{fontFamily:T.mono,fontSize:10,color:T.inkMuted,letterSpacing:"0.04em",display:"block",marginBottom:4}}>{f.label}</label>
                            {f.kind==="select"?(
                              <select style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${T.sandDark}`,background:"#fff",fontFamily:T.body,fontSize:14,color:T.ink,boxSizing:"border-box"}}>
                                <option value="">Select...</option>
                                {f.options.map(o=><option key={o}>{o}</option>)}
                              </select>
                            ):(
                              <input type="text" placeholder={f.ph} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${T.sandDark}`,background:"#fff",fontFamily:T.body,fontSize:14,color:T.ink,boxSizing:"border-box",outline:"none"}}/>
                            )}
                          </div>
                        ))}
                        {step.actions && (
                          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                            {step.actions.map((act,i)=>(
                              <button key={i} onClick={()=>act.url&&window.open(act.url,"_blank")} style={{
                                padding:"10px 16px",borderRadius:8,cursor:"pointer",fontFamily:T.body,fontSize:13,fontWeight:500,
                                background:act.primary?T.ink:"transparent",color:act.primary?T.cream:T.ink,
                                border:act.primary?"none":`1.5px solid ${T.ink}`,
                              }}>{act.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Walkthrough type */}
                    {step.type==="walk" && step.walk && (
                      <div style={{marginBottom:14}}>
                        {step.walk.map((w,i)=>(
                          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<step.walk.length-1?`1px solid ${T.sand}`:"none"}}>
                            <div style={{width:22,height:22,borderRadius:"50%",background:T.sand,flexShrink:0,fontFamily:T.mono,fontSize:10,color:T.inkMuted,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>{i+1}</div>
                            <div>
                              <p style={{fontFamily:T.body,fontSize:13,color:T.inkSoft,margin:0,lineHeight:1.5}}>{w.text}</p>
                              {w.url && <a href={w.url} target="_blank" rel="noopener noreferrer" style={{fontFamily:T.mono,fontSize:11,color:T.blue,textDecoration:"none",marginTop:3,display:"inline-block"}}>{w.link||"Open →"}</a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checklist type */}
                    {step.type==="check" && step.checks && (
                      <div style={{marginBottom:14}}>
                        {step.checks.map(c=>{
                          const key=`${step.order}-${c.id}`;
                          const done=checks[key];
                          return(
                            <div key={c.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.sand}`,alignItems:"flex-start"}}>
                              <div onClick={()=>toggle(step.order,c.id)} style={{
                                width:20,height:20,borderRadius:5,flexShrink:0,cursor:"pointer",marginTop:1,
                                border:done?`2px solid ${T.green}`:`2px solid ${T.sandDark}`,
                                background:done?T.green:"transparent",
                                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,
                              }}>{done&&"✓"}</div>
                              <div>
                                <p style={{fontFamily:T.body,fontSize:13,color:done?T.inkMuted:T.inkSoft,margin:0,lineHeight:1.5,textDecoration:done?"line-through":"none"}}>{c.text}</p>
                                {c.url&&!done && <a href={c.url} target="_blank" rel="noopener noreferrer" style={{fontFamily:T.mono,fontSize:11,color:T.blue,textDecoration:"none",marginTop:3,display:"inline-block"}}>{c.link||"Open →"}</a>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Done options (for zoning) */}
                    {step.done_options && (
                      <div style={{background:T.sand,borderRadius:8,padding:14,marginBottom:10}}>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.inkMuted,marginBottom:8,letterSpacing:"0.04em"}}>What was your result?</div>
                        <div style={{display:"grid",gap:6}}>
                          {step.done_options.map(o=>(
                            <button key={o.id} onClick={()=>{if(o.id==="p")markDone(step.order)}} style={{
                              padding:"10px 14px",borderRadius:8,border:`1.5px solid ${T.sandDark}`,
                              background:T.cream,fontFamily:T.body,fontSize:13,color:T.ink,cursor:"pointer",textAlign:"left",
                            }}>{o.label}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Done field */}
                    {step.done_field && status!=="complete" && (
                      <div style={{background:T.sand,borderRadius:8,padding:14,marginBottom:10}}>
                        <label style={{fontFamily:T.mono,fontSize:10,color:T.inkMuted,letterSpacing:"0.04em",display:"block",marginBottom:6}}>{step.done_field.label}</label>
                        <div style={{display:"flex",gap:8}}>
                          <input type="text" placeholder={step.done_field.ph}
                            value={doneVals[step.order]||""}
                            onChange={e=>setDoneVals(p=>({...p,[step.order]:e.target.value}))}
                            style={{flex:1,padding:"9px 12px",borderRadius:7,border:`1.5px solid ${T.sandDark}`,fontFamily:T.mono,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
                          <button onClick={()=>markDone(step.order)} style={{
                            padding:"9px 14px",borderRadius:7,background:T.green,color:"#fff",border:"none",
                            fontFamily:T.body,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",
                          }}>Done</button>
                        </div>
                      </div>
                    )}

                    {/* Help upsell */}
                    {helpStep===step.order ? (
                      <div style={{marginTop:8,padding:16,background:T.violetSoft,borderRadius:10,border:`1px solid ${T.violet}30`}}>
                        {helpSent[step.order] ? (
                          <div style={{textAlign:"center",padding:"8px 0"}}>
                            <div style={{fontFamily:T.body,fontSize:14,fontWeight:500,color:T.violet,marginBottom:4}}>Request sent</div>
                            <div style={{fontFamily:T.body,fontSize:13,color:T.inkMuted}}>We'll reach out within 1 business day with a plan and quote for this step.</div>
                          </div>
                        ) : (
                          <>
                            <div style={{fontFamily:T.body,fontSize:14,fontWeight:500,color:T.violet,marginBottom:10}}>Get help with: {step.name}</div>
                            <div style={{display:"grid",gap:8}}>
                              <input type="text" placeholder="Your name" value={helpForm.name} onChange={e=>setHelpForm(p=>({...p,name:e.target.value}))}
                                style={{padding:"9px 12px",borderRadius:7,border:`1.5px solid ${T.violet}30`,background:"#fff",fontFamily:T.body,fontSize:13,outline:"none",boxSizing:"border-box",width:"100%"}}/>
                              <input type="email" placeholder="Email" value={helpForm.email} onChange={e=>setHelpForm(p=>({...p,email:e.target.value}))}
                                style={{padding:"9px 12px",borderRadius:7,border:`1.5px solid ${T.violet}30`,background:"#fff",fontFamily:T.body,fontSize:13,outline:"none",boxSizing:"border-box",width:"100%"}}/>
                              <textarea placeholder="Anything we should know? (optional)" value={helpForm.note} onChange={e=>setHelpForm(p=>({...p,note:e.target.value}))} rows={2}
                                style={{padding:"9px 12px",borderRadius:7,border:`1.5px solid ${T.violet}30`,background:"#fff",fontFamily:T.body,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",width:"100%"}}/>
                              <div style={{display:"flex",gap:8}}>
                                <button onClick={()=>{setHelpSent(p=>({...p,[step.order]:true}))}} style={{
                                  padding:"9px 16px",borderRadius:7,background:T.violet,color:"#fff",border:"none",
                                  fontFamily:T.body,fontSize:13,fontWeight:500,cursor:"pointer",flex:1,
                                }}>Send request</button>
                                <button onClick={()=>setHelpStep(null)} style={{
                                  padding:"9px 14px",borderRadius:7,background:"transparent",color:T.violet,border:`1.5px solid ${T.violet}30`,
                                  fontFamily:T.body,fontSize:13,cursor:"pointer",
                                }}>Cancel</button>
                              </div>
                            </div>
                            <p style={{fontFamily:T.body,fontSize:11,color:T.inkMuted,margin:"8px 0 0",lineHeight:1.4}}>
                              We'll reply within 1 business day with a plan and quote. Typical cost: $150–$500 per step depending on complexity.
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,padding:"8px 12px",background:T.violetSoft,borderRadius:8}}>
                        <span style={{fontFamily:T.body,fontSize:12,color:T.violet}}>Want us to handle this step?</span>
                        <button onClick={(e)=>{e.stopPropagation();setHelpStep(step.order)}} style={{fontFamily:T.mono,fontSize:10,color:T.violet,background:"transparent",border:`1px solid ${T.violet}40`,borderRadius:4,padding:"3px 8px",cursor:"pointer",letterSpacing:"0.04em"}}>GET HELP →</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{marginTop:28,background:T.ink,borderRadius:12,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <p style={{fontFamily:T.display,fontSize:17,color:T.cream,margin:0,fontWeight:400}}>Feeling stuck?</p>
            <p style={{fontFamily:T.body,fontSize:12,color:T.inkMuted,margin:"3px 0 0"}}>Free 15-min call. We'll figure it out together.</p>
          </div>
          <button style={{padding:"10px 20px",borderRadius:8,border:"none",background:T.cream,color:T.ink,fontFamily:T.body,fontSize:13,fontWeight:500,cursor:"pointer"}}>Book a call</button>
        </div>

        <p style={{fontFamily:T.body,fontSize:10,color:T.inkFaint,textAlign:"center",marginTop:28,lineHeight:1.6}}>
          Snip · Free for everyone · White glove service available<br/>
          Registered permit consultant · SF Ethics Commission<br/>
          <span onClick={async()=>{try{await window.storage.delete("snip-session");await window.storage.delete("snip-progress")}catch(e){}window.location.reload()}} style={{cursor:"pointer",textDecoration:"underline",color:T.inkMuted}}>Start over with a new business</span>
        </p>
      </div>
    </div>
  );
}

/* ─── App ─── */
export default function App(){
  const[view,setView]=useState("landing");
  const[answers,setAnswers]=useState({});
  const[roadmap,setRoadmap]=useState(null);
  const[loaded,setLoaded]=useState(false);

  // Load saved session
  useEffect(()=>{
    (async()=>{
      try{
        const saved = await window.storage.get("snip-session");
        if(saved?.value){
          const d=JSON.parse(saved.value);
          if(d.view) setView(d.view);
          if(d.answers) setAnswers(d.answers);
          if(d.roadmap) setRoadmap(d.roadmap);
        }
      }catch(e){}
      setLoaded(true);
    })();
  },[]);

  // Save session on changes
  useEffect(()=>{
    if(!loaded) return;
    (async()=>{
      try{
        await window.storage.set("snip-session",JSON.stringify({view,answers,roadmap}));
      }catch(e){}
    })();
  },[view,answers,roadmap,loaded]);

  if(!loaded) return <div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:T.body,color:T.inkMuted}}>Loading...</span></div>;

  if(view==="roadmap" && roadmap) return <Roadmap roadmap={roadmap} answers={answers}/>;
  if(view==="intake") return <Intake onComplete={ans=>{setAnswers(ans);setRoadmap(buildRoadmap(ans));setView("roadmap")}}/>;
  return <Landing onStart={()=>setView("intake")} onResume={()=>setView("roadmap")} hasRoadmap={!!roadmap}/>;
}
