import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  getRelativePhrase,
  getSEOText,
  type SEOPage,
} from "@/lib/seoGenerator";

export function RelatedLinks({ pages }: { pages: SEOPage[] }) {
  return (
    <section aria-labelledby="related-pages">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">
            Keep calculating
          </p>
          <h2
            id="related-pages"
            className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl"
          >
            Related date & time pages
          </h2>
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            className="group flex items-center justify-between gap-3 rounded-xl bg-white/[0.07] px-4 py-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <span>
              {page.kind === "relative"
                ? getRelativePhrase(page)
                : getSEOText(page).title.replace(/ - .+$/, "")}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
