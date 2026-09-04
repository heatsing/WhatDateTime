import { siteConfig } from "@/lib/site";

function absoluteUrl(path: string) {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: "What Date Time",
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-US",
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function faqSchema(
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

export function webApplicationSchema(
  name: string,
  description: string,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    provider: { "@id": `${siteConfig.url}/#organization` },
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function breadcrumbSchema(
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
