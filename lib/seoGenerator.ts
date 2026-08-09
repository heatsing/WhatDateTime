import pageIndexData from "@/data/tools/index.json";
import type { RelativeDirection, RelativeUnit } from "@/lib/dateCalculator";
import {
  getDirectFAQ,
  getPageFormula,
} from "@/lib/pageCalculations";

export {
  getPageFormula,
  getPageResult,
  getRelativePhrase,
  titleCase,
} from "@/lib/pageCalculations";

export type FAQItem = {
  question: string;
  answer: string;
};

export type ContentSection = {
  stage: "calculation-basis" | "how-to-use" | "practical-scenarios";
  title: string;
  text: string;
};

export type SEOScore = {
  score: number;
  grade: "A" | "B" | "C";
  action: "index" | "index-observe";
  factors: {
    content: number;
    searchIntent: number;
    internalLinks: number;
    contentLength: number;
    templateSimilarity: number;
  };
};

type EditorialPageData = {
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  useCases: string[];
  examples: string[];
  tips: string[];
  faq: FAQItem[];
  relatedLinks: string[];
  updatedAt: string | null;
  content: {
    sections: ContentSection[];
  };
};

export type RelativePageType =
  | "days-from-today"
  | "days-ago"
  | "hours-from-now"
  | "hours-ago"
  | "weeks-from-today"
  | "months-from-today"
  | "years-from-today"
  | "business-days-from-today";

export type RelativeSEOPage = EditorialPageData & {
  kind: "relative";
  slug: string;
  type: RelativePageType;
  amount: number;
  unit: RelativeUnit;
  direction: RelativeDirection;
};

export type DifferenceSEOPage = EditorialPageData & {
  kind: "difference";
  slug: string;
  type: "date-difference";
  start: string;
  end: string;
};

export type TimezoneSEOPage = EditorialPageData & {
  kind: "timezone";
  slug: string;
  type: "timezone-converter";
  fromCity: string;
  fromZone: string;
  toCity: string;
  toZone: string;
};

export type SEOPage =
  | RelativeSEOPage
  | DifferenceSEOPage
  | TimezoneSEOPage;

type DataFile =
  | "days-from-today.json"
  | "days-ago.json"
  | "hours-from-now.json"
  | "hours-ago.json"
  | "weeks-from-today.json"
  | "months-from-today.json"
  | "years-from-today.json"
  | "business-days-from-today.json"
  | "date-difference.json"
  | "timezone-converter.json";

export type SEOPageIndex = {
  slug: string;
  kind: SEOPage["kind"];
  type: SEOPage["type"];
  dataFile: DataFile;
  updatedAt: string | null;
};

const pageIndex = pageIndexData as unknown as SEOPageIndex[];
const pageIndexMap = new Map(pageIndex.map((page) => [page.slug, page]));
const dataCache = new Map<DataFile, Map<string, SEOPage>>();

type RuntimePayload = {
  encoding: "gzip-base64";
  data: string;
};

const dataLoaders: Record<
  DataFile,
  () => Promise<{ default: unknown }>
> = {
  "days-from-today.json": () =>
    import("@/data/runtime-tools/days-from-today.json"),
  "days-ago.json": () => import("@/data/runtime-tools/days-ago.json"),
  "hours-from-now.json": () =>
    import("@/data/runtime-tools/hours-from-now.json"),
  "hours-ago.json": () => import("@/data/runtime-tools/hours-ago.json"),
  "weeks-from-today.json": () =>
    import("@/data/runtime-tools/weeks-from-today.json"),
  "months-from-today.json": () =>
    import("@/data/runtime-tools/months-from-today.json"),
  "years-from-today.json": () =>
    import("@/data/runtime-tools/years-from-today.json"),
  "business-days-from-today.json": () =>
    import("@/data/runtime-tools/business-days-from-today.json"),
  "date-difference.json": () =>
    import("@/data/runtime-tools/date-difference.json"),
  "timezone-converter.json": () =>
    import("@/data/runtime-tools/timezone-converter.json"),
};

async function loadDataFile(dataFile: DataFile) {
  const cached = dataCache.get(dataFile);
  if (cached) return cached;

  const loadedModule = await dataLoaders[dataFile]();
  const payload = loadedModule.default as RuntimePayload;
  if (payload.encoding !== "gzip-base64" || !payload.data) {
    throw new Error(`Unsupported SEO runtime payload: ${dataFile}`);
  }
  const binary = atob(payload.data);
  const compressed = Uint8Array.from(binary, (character) =>
    character.charCodeAt(0),
  );
  const stream = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const pages = JSON.parse(await new Response(stream).text()) as SEOPage[];
  const pageMap = new Map(pages.map((page) => [page.slug, page]));
  dataCache.set(dataFile, pageMap);
  return pageMap;
}

export const seoPageCount = pageIndex.length;

export function getAllSEOPageIndex() {
  return pageIndex;
}

export async function getSEOPage(slug: string) {
  const indexEntry = pageIndexMap.get(slug);
  if (!indexEntry) return undefined;
  const pages = await loadDataFile(indexEntry.dataFile);
  return pages.get(slug);
}

export function getSEOText(page: SEOPage) {
  return {
    title: page.title,
    description: page.description,
    h1: page.h1,
    eyebrow: page.eyebrow,
  };
}

export function getLandingSections(page: SEOPage, now: Date) {
  return page.content.sections.map((section) =>
    section.stage === "calculation-basis"
      ? { ...section, text: `${getPageFormula(page, now)} ${section.text}` }
      : section,
  );
}

export function buildFAQs(page: SEOPage, now: Date) {
  const direct = getDirectFAQ(page, now);
  return [direct, ...page.faq.slice(1)];
}

export async function getRelatedPages(page: SEOPage) {
  const related = await Promise.all(
    page.relatedLinks.map((slug) => getSEOPage(slug)),
  );
  return related.filter((item): item is SEOPage => Boolean(item));
}
