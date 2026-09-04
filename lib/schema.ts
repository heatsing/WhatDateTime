import { siteConfig } from "@/lib/site";

function absoluteUrl(path: string) {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

export function faqPageSchema(
  faqs: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbListSchema(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function calculatorApplicationSchema({
  name,
  description,
  path,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    ...(dateModified ? { dateModified } : {}),
    provider: { "@id": `${siteConfig.url}/#organization` },
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript for interactive calculations",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
