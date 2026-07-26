import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-2 text-sm text-ink/50"
    >
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1.5 transition hover:text-fern"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        Home
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate text-ink/70">{current}</span>
    </nav>
  );
}
