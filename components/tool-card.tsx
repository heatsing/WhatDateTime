import Link from "next/link";
import { Icon } from "@/components/icon";

const tones: Record<string, string> = {
  lime: "bg-lime/80 text-ink",
  peach: "bg-peach text-[#7A3D23]",
  blue: "bg-[#DDEEFF] text-[#28577E]",
  purple: "bg-[#E9E2FF] text-[#5B3A8A]",
  aqua: "bg-[#D8F2EC] text-[#176352]",
};

export function ToolCard({
  title,
  description,
  href,
  icon,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-ink/[0.07] bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/55">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fern">
        Open tool
        <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
