import Link from "next/link";
import {
  getPageResult,
  getRelativePhrase,
  getSEOText,
  type SEOPage,
} from "@/lib/seoGenerator";

export function RelatedLinks({
  currentPage,
  pages,
  referenceDate,
}: {
  currentPage: SEOPage;
  pages: SEOPage[];
  referenceDate: Date;
}) {
  const heading =
    currentPage.kind === "relative"
      ? "Nearby date calculations"
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
      <section aria-labelledby="related-pages" data-content-stage="nearby-results">
        <h2 id="related-pages" className="font-display text-2xl font-semibold text-ink">
          {heading}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
          Compare nearby intervals without starting a new calculation.
        </p>
        <div className="mt-5 overflow-x-auto border-y border-[#D9DEE5]">
          <table className="w-full table-fixed border-collapse text-left text-sm sm:text-base">
            <thead className="text-ink/65">
              <tr>
                <th className="w-[42%] px-1 py-3 font-semibold sm:px-2">Calculation</th>
                <th className="px-2 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((page) => {
                if (page.kind !== "relative") return null;
                const current = page.slug === currentPage.slug;
                return (
                  <tr key={page.slug} className={current ? "bg-[#E7F0F8] font-semibold" : ""}>
                    <td className="break-words px-1 py-3 capitalize sm:px-2">
                      {current ? (
                        <span aria-current="page">{getRelativePhrase(page)}</span>
                      ) : (
                        <Link href={`/${page.slug}`} className="font-semibold text-fern transition hover:text-ink">
                          {getRelativePhrase(page)}
                        </Link>
                      )}
                    </td>
                    <td className="break-words px-2 py-3 text-ink/70">
                      {getPageResult(page, referenceDate)}
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
            className="font-display text-2xl font-semibold text-ink"
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
            className="rounded-md border border-[#D9DEE5] bg-white px-4 py-3 text-sm font-medium text-ink/70 hover:border-[#AAB7C2] hover:text-fern"
          >
            <span>
              {`${page.kind === "relative"
                ? getRelativePhrase(page)
                : getSEOText(page).title.replace(/ - .+$/, "")} — ${getPageResult(page, referenceDate)}`}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
