import type { MetadataRoute } from "next";
import { getAllSEOPageIndex } from "@/lib/seoGenerator";
import { primaryTools, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildModifiedAt = new Date();
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: "2026-08-27",
    },
    ...primaryTools
      .filter((tool) => tool.href.startsWith("/calculators/"))
      .map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      })),
  ];

  const seoPages: MetadataRoute.Sitemap = getAllSEOPageIndex().map((page) => ({
    url: `${siteConfig.url}/${page.slug}`,
    ...(page.kind === "relative" || page.kind === "timezone"
      ? { lastModified: buildModifiedAt }
      : page.updatedAt
        ? { lastModified: page.updatedAt }
        : {}),
  }));

  return [...corePages, ...seoPages];
}
