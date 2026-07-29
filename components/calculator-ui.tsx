import { Icon } from "@/components/icon";

export function CalculatorFrame({
  children,
  result,
}: {
  children: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.07] bg-white shadow-soft">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="p-6 sm:p-8">{children}</div>
        <div className="relative min-h-72 overflow-hidden bg-ink p-6 text-white sm:p-8">
          <div className="noise absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/10 blur-2xl" />
          <div className="relative flex h-full flex-col justify-center">{result}</div>
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">{children}</label>;
}

export const inputClass =
  "h-12 w-full rounded-xl border border-ink/10 bg-mist px-4 text-sm font-medium text-ink outline-none ring-fern/25 focus:ring-2";

export function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white transition hover:bg-fern">
      {label} <Icon name="arrow" className="h-4 w-4" />
    </button>
  );
}

export function ResultHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Your result</span>
      <div className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{children}</div>
    </>
  );
}
