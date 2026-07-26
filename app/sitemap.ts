import type { MetadataRoute } from "next";
import { getAllSEOPages } from "@/lib/seoGenerator";
import { primaryTools, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...primaryTools
      .filter((tool) => tool.href.startsWith("/calculators/"))
      .map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      })),
  ];

  const seoPages: MetadataRoute.Sitemap = getAllSEOPages().map((page) => ({
    url: `${siteConfig.url}/${page.slug}`,
    lastModified: now,
    changeFrequency: page.kind === "relative" ? "daily" : "weekly",
    priority: page.kind === "relative" ? 0.8 : 0.7,
  }));

  return [...corePages, ...seoPages];
}
