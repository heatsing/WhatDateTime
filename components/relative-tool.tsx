import { CalculatorBox } from "./CalculatorBox";
import { DirectDateAnswer } from "./direct-date-answer";
import type { RelativeCalculationInput } from "@/lib/pageCalculations";
export function RelativeTool({
  initialTime,
  business = false,
}: {
  initialTime: string;
  business?: boolean;
}) {
  const page: RelativeCalculationInput = {
    kind: "relative",
    type: business ? "business-days-from-today" : "hours-from-now",
    unit: business ? "business-day" : "hour",
    amount: business ? 30 : 8,
    direction: "future",
  };
  const calculator = (
    <CalculatorBox
      page={page}
      referenceTime={initialTime}
      initialResult=""
      initialDate={initialTime.slice(0, 10)}
    />
  );
  return (
    <>
      <DirectDateAnswer
        page={page}
        referenceTime={initialTime}
        initialTimeZone="UTC"
      />
      {calculator}
    </>
  );
}
