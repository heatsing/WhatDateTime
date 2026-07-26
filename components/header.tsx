"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";

const links = [
  { href: "/date-calculator", label: "Date" },
  { href: "/time-difference-calculator", label: "Difference" },
  { href: "/age-calculator", label: "Age" },
  { href: "/countdown-timer", label: "Countdown" },
  { href: "/time-zone-converter", label: "Time zones" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-[#fbfcf9]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ChronoCraft home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime shadow-sm">
            <Icon name="spark" className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Chrono<span className="text-fern">Craft</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/65 transition hover:bg-sage/60 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/date-calculator"
          className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-fern sm:inline-flex"
        >
          Start calculating
        </Link>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink sm:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <Icon name="menu" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink/5 bg-white px-5 py-4 sm:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-mist"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
