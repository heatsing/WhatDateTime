import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <section className="px-5 py-24 text-center sm:px-8 sm:py-32">
      <div className="mx-auto max-w-lg">
        <span className="font-display text-7xl font-extrabold tracking-tight text-sage">404</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">That moment got away</h1>
        <p className="mt-4 leading-7 text-ink/55">The page does not exist, but the right calculator is only a click away.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
          Back to calculators <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
