# CLAUDE.md — Snip

## What is this?

Snip is a free, interactive web tool that guides anyone through the entire process of opening a business in San Francisco. It maps every permit, license, and registration across 17+ city/state/federal agencies into a personalized, step-by-step actionable roadmap.

**Business model:** Free DIY tool for everyone. Revenue from white-glove consulting ($150–$500 per step) for users who want help executing specific steps.

**Target users:** First-time small business owners in SF — restaurants, retail, bars, salons, food trucks, home-based businesses, pop-ups, and professional services.

**Long-term vision:** Pitch to PermitSF as the official portal they direct people to. Expand to Oakland, then LA. Part of a "SF Trifecta" — Snip (permits) → Storefront Matchmaker (locations) → Neighborhood API (data).

## Current state

A working prototype exists as a single React artifact (`snip.jsx`). It includes:
- Landing page
- 12-question intake questionnaire (conditional logic, only asks roadmap-affecting questions)
- Actionable roadmap generator for 8 business types
- Three step interaction types: forms, walkthroughs, checklists
- Progress tracking with completion states
- Persistent storage (progress saves across sessions)
- Per-step "Get Help" inline contact form
- Census tract lookup for liquor license steps

The prototype needs to be rebuilt as a proper Next.js app with real routing, a database, and production infrastructure.

## Tech stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS — but match the existing design tokens exactly (see below)
- **Database:** Supabase (for user sessions, roadmap state, help requests)
- **Auth:** Supabase Auth (email magic link — no passwords)
- **Deployment:** Vercel
- **Repo:** Single repo, not monorepo. This is one app.

## Design tokens (MUST match these exactly)

```
Typography:
  display: "Newsreader" (Google Fonts) — serif, for headings
  body: "Outfit" (Google Fonts) — geometric sans, for body text
  mono: "IBM Plex Mono" (Google Fonts) — for labels, codes, metadata

Colors:
  cream: #FFFCF7 (page background)
  sand: #F5F0E8 (card/section backgrounds)
  sandDark: #EBE4D8 (borders, inactive states)
  ink: #1C1917 (primary text, buttons)
  inkSoft: #44403C (body text)
  inkMuted: #78716C (secondary text)
  inkFaint: #A8A29E (tertiary text)
  inkGhost: #D6D3D1 (disabled states)
  green: #15803D (success, completion, progress)
  greenSoft: #DCFCE7 (success backgrounds)
  greenDark: #14532D (success text on light bg)
  amber: #B45309 (warnings, medium priority)
  amberSoft: #FEF3C7 (warning backgrounds)
  blue: #1D4ED8 (links)
  blueSoft: #DBEAFE (link backgrounds)
  red: #DC2626 (urgent priority)
  redSoft: #FEE2E2 (urgent backgrounds)
  violet: #7C3AED (upsell/help CTAs)
  violetSoft: #F3E8FF (upsell backgrounds)
```

The design should feel like: **the best government service you've ever used** — warm, clear, competent. Editorial warmth meets gov-tech credibility. Light theme only, no dark mode. Trustworthy, not trendy.

## Logo

Nathe is designing the logo in Figma. Placeholder: scissors icon in a dark square tile. The name is "Snip" and the mark concept is angled scissors cutting a ribbon/tape with angular fragments. Swap in the real SVG/PNG when Nathe provides it.

## Project structure

```
snip/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx             # Landing page
│   ├── intake/
│   │   └── page.tsx         # Intake questionnaire
│   ├── roadmap/
│   │   └── page.tsx         # Actionable roadmap (requires session)
│   └── api/
│       └── help-request/
│           └── route.ts     # POST endpoint for "Get Help" form submissions
├── components/
│   ├── Logo.tsx
│   ├── intake/
│   │   ├── QuestionCard.tsx
│   │   ├── CardSelect.tsx
│   │   ├── OptionSelect.tsx
│   │   └── ProgressBar.tsx
│   ├── roadmap/
│   │   ├── StepCard.tsx
│   │   ├── FormStep.tsx
│   │   ├── WalkthroughStep.tsx
│   │   ├── ChecklistStep.tsx
│   │   ├── CompletionField.tsx
│   │   ├── CompletionOptions.tsx
│   │   ├── HelpRequest.tsx
│   │   └── ProgressTracker.tsx
│   └── ui/                  # Shared primitives (buttons, inputs, badges)
├── lib/
│   ├── knowledge-graph.ts   # The SF permit knowledge graph (JSON data)
│   ├── roadmap-generator.ts # Business logic: answers → steps
│   ├── questions.ts         # Intake question definitions
│   ├── types.ts             # TypeScript types for everything
│   └── supabase.ts          # Supabase client
├── public/
│   └── logo.svg             # Placeholder, Nathe replaces
├── CLAUDE.md
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## Key files to port from prototype

1. **`snip.jsx`** — The current single-file prototype. Contains all business logic, UI, and data. Needs to be decomposed into the structure above.

2. **`sf_permit_knowledge_graph_v0.2.json`** — The full knowledge graph with 17 agencies, 8 business types, 15 gotchas, 10 programs. This becomes `lib/knowledge-graph.ts`.

3. The roadmap generator function (`buildRoadmap`) in `snip.jsx` contains all conditional logic for which steps appear based on intake answers. This becomes `lib/roadmap-generator.ts`.

## Database schema (Supabase)

```sql
-- Users (via Supabase Auth, email magic link)
-- No separate users table needed, use auth.users

-- Sessions: stores intake answers + generated roadmap
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  answers jsonb not null,        -- intake answers
  roadmap jsonb not null,        -- generated roadmap steps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Step progress: tracks completion state per step
create table step_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  step_order int not null,
  status text default 'not_started', -- not_started, active, waiting, complete
  checks jsonb default '{}',         -- checkbox states for checklist steps
  done_value text,                   -- e.g., EIN number, BAN number
  updated_at timestamptz default now(),
  unique(session_id, step_order)
);

-- Help requests: when user clicks "Get Help" on a step
create table help_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  step_order int not null,
  step_name text not null,
  name text not null,
  email text not null,
  note text,
  status text default 'new',  -- new, contacted, in_progress, resolved
  created_at timestamptz default now()
);
```

## Build plan (in priority order)

### Phase 1: Port and deploy (get it live)
1. Initialize Next.js project with Tailwind, configure fonts
2. Port landing page from prototype
3. Port intake questionnaire with all conditional logic
4. Port roadmap generator and all step types
5. Deploy to Vercel, confirm it works end-to-end
6. Set up Supabase project, create tables
7. Add email magic link auth (optional for generating roadmap, required for saving progress)
8. Wire up persistent progress to Supabase instead of browser storage
9. Wire up help request form to POST to Supabase + send email notification

### Phase 2: Polish and expand
10. Mobile responsive pass — the prototype is desktop-first
11. Add PDF export of roadmap (use @react-pdf/renderer or html2pdf)
12. Add more business types: cannabis, childcare/daycare, fitness studio, gallery/art space
13. Add email notifications for upcoming deadlines
14. SEO: meta tags, OpenGraph, structured data for each business type
15. Add the 5 lead magnet playbooks as static pages (/guides/restaurant, /guides/food-truck, etc.)

### Phase 3: Growth features
16. Admin dashboard for Nathe to see all help requests and user progress
17. Stripe integration for paid help requests
18. Calendar export (.ics) for all deadlines and renewal dates
19. Referral tracking (how did you hear about Snip?)
20. Analytics: which steps do people get stuck on, which steps trigger help requests

## Important legal/compliance notes

- Snip must register as a permit consultant with the SF Ethics Commission within 5 business days of providing services for compensation. File quarterly reports.
- The site must clearly state: "Informational guidance, not legal advice" and "Registered permit consultant, SF Ethics Commission."
- Do NOT store SSNs, EINs, or other sensitive identifiers in the database. Users enter these directly on government portals (IRS, SOS, TTX). We guide them but never hold the data.
- All external links should open in new tabs and go to official government sources (.gov, .ca.gov, .org).

## Intake questions (reference)

These are the questions that affect which roadmap steps appear. Do not add questions that don't change the roadmap — collect other data just-in-time within the roadmap steps.

| ID | Question | Type | Conditional? |
|----|----------|------|-------------|
| biz | What are you opening? | Card select (8 types) | No |
| loc | Do you have a space? | 3 options | No |
| hood | Which neighborhood? | Dropdown (24 neighborhoods) | Only if loc != "no" |
| sqft | Approximate size? | 3 options | Only if physical biz + has location |
| food | Will you serve food? | 4 options | Only if not restaurant/food_truck/home |
| alc | Alcohol? | 4 options | Only if not home/food_truck/office |
| music | Music? | 5 options | Only if not home/office |
| emp | Employees? | 4 options | No |
| entity | Business entity? | 4 options | No |
| seat | Outdoor seating? | 3 options | Only if restaurant/bar |
| chain | Total locations? | 3 options | Only if restaurant/retail/salon |
| when | When to open? | 4 options | No |
| email | Your email | Email input | No |

## Step types (reference)

Each roadmap step has a `type` that determines its UI:

- **`form`** — Collects user data (fields + action buttons). Used for entity formation.
- **`walk`** — Numbered walkthrough with external links. Used for EIN, TTX, health permit, ABC.
- **`check`** — Interactive checklist with checkboxes. Used for zoning, music licensing, ADA, employer requirements.

Each step can also have:
- `tip` — Green info box with helpful context
- `done_field` — Text input to capture a result (EIN, BAN) and mark step complete
- `done_options` — Multiple choice result (used for zoning: Permitted / Conditional / Not Permitted)
- `actions` — Buttons (primary = filled, secondary = outlined) that link externally or trigger generation

## What Nathe does vs what the app does

**Nathe (human, in-person):**
- Respond to help requests (email notifications from Supabase)
- Visit city departments when needed
- Attend Planning Commission hearings
- Build relationships with Office of Small Business, BIDs, SF New Deal
- Design the logo and brand assets in Figma
- Conduct workshops and client meetings

**App (automated):**
- Generate personalized roadmaps from intake answers
- Provide step-by-step guidance with direct links to government portals
- Track progress across sessions
- Send deadline reminders
- Collect and route help requests to Nathe
- Pre-fill form data where possible

## External links used in the app

These are the government portals we link to. All are stable .gov URLs:

- CA SOS filing: https://bizfileonline.sos.ca.gov
- IRS EIN: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
- SF TTX registration: https://sftreasurer.org/business/register-business
- CDTFA seller's permit: https://onlineservices.cdtfa.ca.gov/_/
- SF Planning map: https://sfplanninggis.org/pim/
- SF Planning Code: https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_planning/0-0-0-17837
- PermitSF portal: https://permitsf.sfgov.org
- DPH food application: https://etaxstatement.sfgov.org/dphehbfoodpermit
- ServSafe: https://www.servsafe.com
- Census geocoder: https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?benchmark=Public_AR_Current&vintage=Current_Current&format=html
- ABC census tract report: https://www.abc.ca.gov/licensing/licensing-reports/licenses-by-county-and-census-tract/
- ABC license map: https://maps.gis.ca.gov/abc/lqs/
- ABC license lookup: https://www.abc.ca.gov/licensing/license-lookup/
- Entertainment Commission: https://sfgov.org/entertainment/permit-applications
- ASCAP licensing: https://www.ascap.com/music-users
- BMI licensing: https://www.bmi.com/licensing
- SESAC licensing: https://www.sesac.com
- Soundtrack Your Brand: https://www.soundtrackyourbrand.com
- Rockbot: https://rockbot.com
- CASp directory: https://apps2.dgs.ca.gov/DSA/casp/casp_certified_list.aspx
- SF ADA grant: https://www.sf.gov/apply-grant-make-your-business-accessible
- SF Public Works: https://sfpublicworks.org
- CA EDD: https://edd.ca.gov/en/payroll_taxes/
- SF OLSE: https://www.sf.gov/departments--office-labor-standards-enforcement
- SF Environment: https://sfenvironment.org/green-businesses
- CA Board of Barbering: https://www.barbercosmo.ca.gov
- Off the Grid: https://offthegrid.com
