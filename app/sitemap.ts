import type { MetadataRoute } from "next";
import { getAllSEOPageIndex } from "@/lib/seoGenerator";
import { primaryTools, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...primaryTools
      .filter((tool) => tool.href.startsWith("/calculators/"))
      .map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      })),
  ];

  const seoPages: MetadataRoute.Sitemap = getAllSEOPageIndex().map((page) => ({
    url: `${siteConfig.url}/${page.slug}`,
    ...(page.updatedAt ? { lastModified: page.updatedAt } : {}),
    changeFrequency: page.kind === "relative" ? "daily" : "weekly",
    priority: page.kind === "relative" ? 0.8 : 0.7,
  }));

  return [...corePages, ...seoPages];
}
