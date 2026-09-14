import { Icon } from "@/components/icon";

export function CalculatorFrame({
  children,
  result,
}: {
  children: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-[#cbd6e4] bg-white p-4 sm:p-5">
      <div>{children}</div>
      <div id="calculator-result" tabIndex={-1} aria-live="polite" aria-atomic="true" className="mt-5 min-h-36 border-t border-[#cbd6e4] bg-[#edf6ff] p-5 text-center text-ink sm:p-7">
        <div className="flex h-full flex-col justify-center">{result}</div>
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
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[#10264b]">{children}</label>;
}

export const inputClass =
  "h-[50px] w-full rounded-md border border-[#cbd6e4] bg-white px-4 text-sm font-medium text-[#10264b] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15";

export function focusCalculatorResult() {
  window.requestAnimationFrame(() => {
    document.getElementById("calculator-result")?.focus();
  });
}

export function CalculateButton({ label = "Calculate" }: { label?: string }) {
  return (
    <button className="mt-5 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-[#0b74e5] px-6 text-sm font-semibold text-white hover:bg-[#075fc5]">
      {label} <Icon name="arrow" className="h-4 w-4" />
    </button>
  );
}

export function ResultHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#0969da]">Result</span>
      <div className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-[#10264b] sm:text-3xl">{children}</div>
    </>
  );
}
