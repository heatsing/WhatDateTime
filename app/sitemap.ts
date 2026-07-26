import type { MetadataRoute } from "next";
import {
  calculationDefinitions,
  calculationSlugs,
} from "@/lib/calculator";
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
    ...primaryTools.map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  const seoPages: MetadataRoute.Sitemap = calculationSlugs.flatMap((slug) =>
    Array.from(
      { length: calculationDefinitions[slug].max },
      (_, index) => ({
        url: `${siteConfig.url}/${slug}/${index + 1}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }),
    ),
  );

  return [...corePages, ...seoPages];
}
