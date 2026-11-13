import { useRelativeState } from "./use-relative-state";
import { relativeText } from "@/lib/relative-state";
import Link from "@/components/link";
import { getPageResult, getRelativePhrase } from "@/lib/pageCalculations";
import type { PageCalculationInput } from "@/lib/pageCalculations";

type RelatedPage = PageCalculationInput & { slug: string; title: string };

export function RelatedLinks({
  currentPage,
  pages,
  referenceDate,
  referenceTime,
}: {
  currentPage: RelatedPage;
  pages: RelatedPage[];
  referenceDate: Date;
  referenceTime?: string;
}) {
  const { state } = useRelativeState(
    currentPage.kind === "relative"
      ? currentPage
      : {
          kind: "relative",
          type: "hours-from-now",
          unit: "hour",
          amount: 0,
          direction: "future",
        },
    referenceTime || referenceDate.toISOString(),
  );
  const heading =
    currentPage.kind === "relative"
      ? "Related and nearby calculations"
      : currentPage.kind === "difference"
        ? "Related date differences"
        : "Related time-zone conversions";

  if (currentPage.kind === "relative") {
    const rows = [currentPage, ...pages]
      .filter(
        (page, index, list) =>
          page.kind === "relative" &&
          list.findIndex((candidate) => candidate.slug === page.slug) === index,
      )
      .sort((left, right) =>
        left.kind === "relative" && right.kind === "relative"
          ? left.amount - right.amount
          : 0,
      );

    return (
      <section
        aria-labelledby="related-pages"
        data-content-stage="nearby-results"
      >
        <h2
          id="related-pages"
          className="font-display text-3xl font-semibold text-ink sm:text-4xl"
        >
          {heading}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-ink/60 sm:text-lg">
          Compare intervals from the same starting point ({state.zone};{" "}
          {state.mode === "example" ? "fixed example" : state.mode}).
        </p>
        <div className="mt-5 overflow-x-auto border-y border-[#D9DEE5]">
          <table className="w-full table-fixed border-collapse text-left text-base sm:text-[17px]">
            <thead className="text-ink/65">
              <tr>
                <th className="w-[42%] px-1 py-3 font-semibold sm:px-2">
                  Calculation
                </th>
                <th className="px-2 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((page) => {
                if (page.kind !== "relative") return null;
                const current = page.slug === currentPage.slug;
                return (
                  <tr
                    key={page.slug}
                    className={current ? "bg-[#E7F0F8] font-semibold" : ""}
                  >
                    <td className="break-words px-1 py-3 capitalize sm:px-2">
                      {current ? (
                        <span aria-current="page">
                          {state.mode === "custom"
                            ? `Your calculation: ${state.page.direction === "future" ? "+" : "−"}${state.page.amount} ${state.page.unit.replace("-", " ")}${state.page.amount === 1 ? "" : "s"}`
                            : getRelativePhrase(state.page)}
                          {state.inputError ? " (last valid inputs)" : ""}
                        </span>
                      ) : (
                        <Link
                          href={`/${page.slug}`}
                          className="font-semibold text-fern transition hover:text-ink"
                        >
                          {getRelativePhrase(page)}
                        </Link>
                      )}
                    </td>
                    <td className="break-words px-2 py-3 text-ink/70">
                      {relativeText(state, current ? state.page : page)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="related-pages"
      data-content-stage="nearby-results"
    >
      <div>
        <div>
          <h2
            id="related-pages"
            className="font-display text-3xl font-semibold text-ink sm:text-4xl"
          >
            {heading}
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            className="rounded-md border border-[#D9DEE5] bg-white px-5 py-4 text-base font-medium leading-7 text-ink/70 hover:border-[#AAB7C2] hover:text-fern"
          >
            <span>
              {page.kind === "relative"
                ? getRelativePhrase(page)
                : page.title.replace(/ - .+$/, "")}{" "}
              — {getPageResult(page, referenceDate)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
