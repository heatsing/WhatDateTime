import Link from "next/link";
import { Icon } from "@/components/icon";

export function Breadcrumbs({
  items,
}: {
  items: ReadonlyArray<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-ink/50">
      <Link href="/" className="transition hover:text-fern">Home</Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <Icon name="chevron" className="h-3.5 w-3.5" />
          {item.href ? (
            <Link href={item.href} className="transition hover:text-fern">{item.label}</Link>
          ) : (
            <span className="text-ink/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
