// Canonical registry of everything being marketed.
//
// `site` is the tracking slug. Any app that calls logVisit()/logConversion()
// from src/marketing/report.js passes this slug, and its numbers land on the
// board automatically. `tracking: false` means nothing is reporting yet — the
// board shows that plainly instead of inventing numbers.

export const PROJECTS = [
  {
    site: "portfolio",
    name: "Bailey.dev",
    summary: "This site — the front door for everything else.",
    image: "/strike.png",
    url: "https://sethbailey.dev",
    accent: "#38bdf8",
    tracking: true,
    goals: { weeklyVisits: 200, conversionRate: 3 },
  },
  {
    site: "bidfolder",
    name: "AI Bid",
    summary: "Machine-learned bidding for construction teams.",
    image: "/bidfolder.png",
    url: "https://bidfolder.com",
    accent: "#a855f7",
    tracking: false,
    goals: { weeklyVisits: 450, conversionRate: 4 },
  },
  {
    site: "pmxl",
    name: "PM XL",
    summary: "Project management and forecasting tools.",
    image: "/pmxl.png",
    url: "https://pm-xl.com",
    accent: "#22c55e",
    tracking: false,
    goals: { weeklyVisits: 750, conversionRate: 2.5 },
  },
  {
    site: "planful",
    name: "Planful",
    summary: "Dream it. Plan it. Do it.",
    image: "/planful.png",
    url: "https://planful.app",
    accent: "#ec4899",
    tracking: false,
    goals: { weeklyVisits: 300, conversionRate: 5 },
  },
  {
    site: "tobysquish",
    name: "Tiktok Store",
    summary: "Social commerce for the next generation.",
    image: "/tobysquish.png",
    url: "https://tobysquish.com",
    accent: "#eab308",
    tracking: false,
    goals: { weeklyVisits: 1000, conversionRate: 1.8 },
  },
  {
    site: "aem",
    name: "AEM Consulting",
    summary: "Adobe Experience Manager implementation.",
    image: "/aemconsult.png",
    url: "https://bailey.marketing",
    accent: "#06b6d4",
    tracking: false,
    goals: { weeklyVisits: 150, conversionRate: 6 },
  },
  {
    site: "chorevest",
    name: "ChoreVest",
    summary: "Chores kids actually finish — allowance that invests itself.",
    image: "/chorevest.png",
    url: "https://chorevest.app",
    accent: "#14b8a6",
    tracking: false,
    goals: { weeklyVisits: 400, conversionRate: 4 },
  },
  {
    site: "drone",
    name: "Drone Services",
    summary: "Commercial drone inspection, mapping, and aerial capture.",
    image: "/drone.png",
    url: "",
    accent: "#f43f5e",
    tracking: false,
    goals: { weeklyVisits: 250, conversionRate: 5 },
  },
];

export const PROJECT_BY_SITE = PROJECTS.reduce((acc, p) => {
  acc[p.site] = p;
  return acc;
}, {});

// Channels available when logging outreach from the board.
export const OUTREACH_CHANNELS = [
  "LinkedIn",
  "X",
  "Instagram",
  "YouTube",
  "Email",
  "Cold DM",
  "Blog",
];
