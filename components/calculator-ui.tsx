import { Icon } from "@/components/icon";

export function CalculatorFrame({
  children,
  result,
}: {
  children: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#C8D0D8] bg-white">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="p-6 sm:p-8">{children}</div>
        <div id="calculator-result" tabIndex={-1} aria-live="polite" aria-atomic="true" className="min-h-56 border-t border-[#D9DEE5] bg-[#F4F8FB] p-6 text-ink lg:border-l lg:border-t-0 sm:p-8">
          <div className="flex h-full flex-col justify-center">{result}</div>
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
  "h-12 w-full rounded-md border border-[#C8D0D8] bg-white px-3.5 text-sm font-medium text-ink outline-none focus:border-fern focus:ring-2 focus:ring-[#1769AA]/15";

export function focusCalculatorResult() {
  window.requestAnimationFrame(() => {
    document.getElementById("calculator-result")?.focus();
  });
}

export function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-fern px-5 text-sm font-semibold text-white hover:bg-[#12558B]">
      {label} <Icon name="arrow" className="h-4 w-4" />
    </button>
  );
}

export function ResultHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="text-sm font-semibold text-fern">Result</span>
      <div className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">{children}</div>
    </>
  );
}
