"use client";

import { useLiveReferenceDate } from "@/components/live-reference-date";
import {
  getDirectFAQ,
  getPageFormula,
  getPageResult,
} from "@/lib/pageCalculations";
import type { SEOPage } from "@/lib/seoGenerator";

export function LivePageResult({
  page,
  referenceDate,
}: {
  page: SEOPage;
  referenceDate: Date;
}) {
  const liveDate = useLiveReferenceDate(referenceDate);
  return <>{getPageResult(page, liveDate)}</>;
}

export function LivePageFormula({
  page,
  referenceDate,
}: {
  page: SEOPage;
  referenceDate: Date;
}) {
  const liveDate = useLiveReferenceDate(referenceDate);
  return <>{getPageFormula(page, liveDate)}</>;
}

export function LiveDirectFAQAnswer({
  page,
  referenceDate,
}: {
  page: SEOPage;
  referenceDate: Date;
}) {
  const liveDate = useLiveReferenceDate(referenceDate);
  return <>{getDirectFAQ(page, liveDate).answer}</>;
}
