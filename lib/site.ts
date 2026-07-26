export const siteConfig = {
  name: "ChronoCraft",
  shortName: "ChronoCraft",
  description:
    "Simple, accurate date and time calculators for everyday planning.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://chronocraft-time.heatsinghaiqing.chatgpt.site",
};

export const primaryTools = [
  {
    title: "Date Calculator",
    description: "Add or subtract days, weeks, months, and years from any date.",
    href: "/calculators/date-calculator",
    icon: "calendar",
    tone: "lime",
  },
  {
    title: "Time Difference",
    description: "Find the precise time between two dates and times.",
    href: "/calculators/time-difference",
    icon: "difference",
    tone: "peach",
  },
  {
    title: "Age Calculator",
    description: "Calculate age in years, months, days, and total days.",
    href: "/calculators/age-calculator",
    icon: "cake",
    tone: "blue",
  },
  {
    title: "Countdown Timer",
    description: "Create a live countdown to any date and time.",
    href: "/calculators/countdown",
    icon: "timer",
    tone: "purple",
  },
  {
    title: "Time Zone Converter",
    description: "Compare local time across popular world time zones.",
    href: "/calculators/timezone-converter",
    icon: "globe",
    tone: "aqua",
  },
  {
    title: "Business Days",
    description: "Add working days while automatically skipping weekends.",
    href: "/30-business-days-from-today",
    icon: "calendar",
    tone: "lime",
  },
] as const;
