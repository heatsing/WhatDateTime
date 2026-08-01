import Link from "next/link";
import type { SEOPageIndex, SEOPage } from "@/lib/seoGenerator";

type PageType = SEOPage["type"];

const groups: ReadonlyArray<{
  title: string;
  description: string;
  types: PageType[];
  preferred?: string[];
}> = [
  {
    title: "Days",
    description: "Future and past calendar dates for everyday planning.",
    types: ["days-from-today", "days-ago"],
    preferred: [
      "1-day-from-today",
      "7-days-from-today",
      "14-days-from-today",
      "30-days-from-today",
      "7-days-ago",
      "30-days-ago",
      "60-days-ago",
      "90-days-ago",
    ],
  },
  {
    title: "Hours",
    description: "Exact clock-based answers measured forward or backward.",
    types: ["hours-from-now", "hours-ago"],
    preferred: [
      "1-hour-from-now",
      "6-hours-from-now",
      "12-hours-from-now",
      "24-hours-from-now",
      "1-hour-ago",
      "6-hours-ago",
      "12-hours-ago",
      "24-hours-ago",
    ],
  },
  {
    title: "Weeks and months",
    description: "Longer calendar intervals for schedules and milestones.",
    types: ["weeks-from-today", "months-from-today"],
    preferred: [
      "1-week-from-today",
      "2-weeks-from-today",
      "4-weeks-from-today",
      "8-weeks-from-today",
      "1-month-from-today",
      "3-months-from-today",
      "6-months-from-today",
      "12-months-from-today",
    ],
  },
  {
    title: "Years",
    description: "Year-based dates for anniversaries and long-range plans.",
    types: ["years-from-today"],
    preferred: [
      "1-year-from-today",
      "2-years-from-today",
      "5-years-from-today",
      "10-years-from-today",
      "18-years-from-today",
      "25-years-from-today",
      "50-years-from-today",
      "100-years-from-today",
    ],
  },
  {
    title: "Business days",
    description: "Working-day deadlines with weekends excluded.",
    types: ["business-days-from-today"],
    preferred: [
      "1-business-day-from-today",
      "5-business-days-from-today",
      "10-business-days-from-today",
      "20-business-days-from-today",
      "30-business-days-from-today",
      "60-business-days-from-today",
      "90-business-days-from-today",
      "260-business-days-from-today",
    ],
  },
  {
    title: "Date differences",
    description: "Elapsed days between specific calendar dates.",
    types: ["date-difference"],
  },
  {
    title: "World time",
    description: "Compare local time between major international cities.",
    types: ["timezone-converter"],
    preferred: [
      "new-york-to-london-time",
      "london-to-new-york-time",
      "tokyo-to-new-york-time",
      "new-york-to-tokyo-time",
      "los-angeles-to-london-time",
      "london-to-sydney-time",
      "singapore-to-london-time",
      "dubai-to-new-york-time",
    ],
  },
] as const;

function linkLabel(slug: string) {
  return slug.replaceAll("-", " ");
}

export function CalculatorDirectory({
  pages,
}: {
  pages: ReadonlyArray<SEOPageIndex>;
}) {
  const pageMap = new Map(pages.map((page) => [page.slug, page]));

  return (
    <section className="border-t border-[#E5E8EB] bg-mist px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Browse calculations</h2>
          <p className="mt-2 text-sm leading-6 text-ink/55">Direct links to frequently requested date, duration, business-day, and world-time answers.</p>
        </div>

        <div className="mt-6 divide-y divide-[#D9DEE5] border-y border-[#D9DEE5]">
          {groups.map((group) => {
            const fallback = pages
              .filter((page) => group.types.includes(page.type))
              .slice(0, 8);
            const selected = group.preferred
              ? group.preferred
                  .map((slug) => pageMap.get(slug))
                  .filter((page): page is SEOPageIndex => Boolean(page))
              : fallback;

            return (
              <details
                key={group.title}
                className="group py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5">
                  <span><span className="font-display text-base font-semibold text-ink">{group.title}</span><span className="ml-3 hidden text-sm text-ink/50 sm:inline">{group.description}</span></span>
                  <span className="text-xl text-fern transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 grid gap-x-6 gap-y-2 border-t border-[#E5E8EB] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  {selected.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/${page.slug}`}
                      className="min-w-0 text-sm font-medium text-fern hover:underline"
                    >
                      <span className="capitalize">{linkLabel(page.slug)}</span>
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
