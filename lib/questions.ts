import type { BusinessType, Question, IntakeAnswers } from "./types";

export const BIZ_TYPES: BusinessType[] = [
  { id: "restaurant", label: "Restaurant / Café", icon: "🍽", sub: "Food prepared on-site" },
  { id: "retail", label: "Retail store", icon: "🛍", sub: "Selling goods" },
  { id: "food_truck", label: "Food truck", icon: "🚚", sub: "Mobile food" },
  { id: "bar", label: "Bar / Lounge", icon: "🥃", sub: "Alcohol-focused" },
  { id: "salon", label: "Salon / Spa", icon: "✂", sub: "Personal care" },
  { id: "office", label: "Office / Consulting", icon: "◻", sub: "Professional services" },
  { id: "home", label: "Home-based", icon: "⌂", sub: "From your residence" },
  { id: "popup", label: "Pop-up", icon: "↗", sub: "Temporary retail or food" },
];

export const NEIGHBORHOODS: string[] = [
  "Mission", "Castro", "SoMa", "Financial District", "North Beach",
  "Chinatown", "Sunset", "Richmond", "Hayes Valley", "Tenderloin",
  "Marina", "Nob Hill", "Pacific Heights", "Potrero Hill", "Dogpatch",
  "Bayview", "Haight-Ashbury", "Union Square", "Noe Valley", "Bernal Heights",
  "Glen Park", "Fillmore", "Excelsior", "Other",
];

export const QUESTIONS: Question[] = [
  { id: "biz", q: "What are you opening?", type: "cards" },
  {
    id: "loc", q: "Do you have a space?", type: "opts", opts: [
      { id: "signed", l: "Signed a lease" },
      { id: "looking", l: "Looking at one" },
      { id: "no", l: "Not yet" },
    ],
  },
  {
    id: "hood", q: "Which neighborhood?", type: "select",
    showIf: (a: IntakeAnswers) => a.loc !== "no",
  },
  {
    id: "sqft", q: "Approximate size?", type: "opts", opts: [
      { id: "small", l: "Under 3,750 sq ft" },
      { id: "large", l: "3,750+ sq ft" },
      { id: "idk", l: "Not sure" },
    ],
    showIf: (a: IntakeAnswers) =>
      a.loc !== "no" && !["home", "office", "food_truck"].includes(a.biz ?? ""),
  },
  {
    id: "food", q: "Will you serve food?", type: "opts", opts: [
      { id: "cook", l: "Yes — cooking on-site" },
      { id: "prep", l: "Prep only" },
      { id: "pkg", l: "Pre-packaged only" },
      { id: "no", l: "No food" },
    ],
    showIf: (a: IntakeAnswers) =>
      !["restaurant", "food_truck", "home"].includes(a.biz ?? ""),
  },
  {
    id: "alc", q: "Alcohol?", type: "opts", opts: [
      { id: "bw", l: "Beer & wine" },
      { id: "full", l: "Full bar" },
      { id: "off", l: "Bottles to go" },
      { id: "no", l: "None" },
    ],
    showIf: (a: IntakeAnswers) =>
      !["home", "food_truck", "office"].includes(a.biz ?? ""),
  },
  {
    id: "music", q: "Music?", sub: "Even Spotify requires a commercial license.", type: "opts", opts: [
      { id: "live", l: "Live / DJs regularly" },
      { id: "liveocc", l: "Live occasionally" },
      { id: "stream", l: "Streaming / recorded" },
      { id: "radio", l: "Radio / TV only" },
      { id: "no", l: "None" },
    ],
    showIf: (a: IntakeAnswers) =>
      !["home", "office"].includes(a.biz ?? ""),
  },
  {
    id: "emp", q: "Employees?", type: "opts", opts: [
      { id: "solo", l: "Just me" },
      { id: "1-9", l: "1–9" },
      { id: "10-19", l: "10–19" },
      { id: "20+", l: "20+" },
    ],
  },
  {
    id: "entity", q: "Business entity?", type: "opts", opts: [
      { id: "llc", l: "LLC" },
      { id: "corp", l: "Corporation" },
      { id: "sole", l: "Sole proprietor" },
      { id: "none", l: "Not yet" },
    ],
  },
  {
    id: "seat", q: "Outdoor seating?", type: "opts", opts: [
      { id: "y", l: "Yes" },
      { id: "m", l: "Maybe later" },
      { id: "n", l: "No" },
    ],
    showIf: (a: IntakeAnswers) => ["restaurant", "bar"].includes(a.biz ?? ""),
  },
  {
    id: "chain", q: "Total locations worldwide?", sub: "SF restricts chains with 11+.", type: "opts", opts: [
      { id: "1", l: "Just this one" },
      { id: "2-10", l: "2–10" },
      { id: "11+", l: "11+" },
    ],
    showIf: (a: IntakeAnswers) =>
      ["restaurant", "retail", "salon"].includes(a.biz ?? ""),
  },
  {
    id: "when", q: "When do you want to open?", type: "opts", opts: [
      { id: "asap", l: "ASAP" },
      { id: "3mo", l: "Within 3 months" },
      { id: "6mo", l: "Within 6 months" },
      { id: "idk", l: "Exploring" },
    ],
  },
  { id: "email", q: "Your email", sub: "We'll save your progress.", type: "email" },
];
