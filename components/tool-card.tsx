import Link from "next/link";
import { Icon } from "@/components/icon";

export function ToolCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  tone: string;
}) {
  return (
    <Link href={href} className="group flex gap-4 rounded-lg border border-[#D9DEE5] bg-white p-5 hover:border-[#AAB7C2] hover:bg-[#FCFDFE]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#EEF4F9] text-fern">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          {title}<Icon name="arrow" className="h-3.5 w-3.5 text-ink/35 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-1 block text-sm leading-6 text-ink/55">{description}</span>
      </span>
    </Link>
  );
}
