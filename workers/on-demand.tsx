import React from "react";
import { renderToString } from "react-dom/server";
import { OnDemandPage } from "../components/on-demand-page";
import type { OnDemandData, OnDemandProps } from "../components/on-demand-page";
import { getPairCities } from "../lib/indexEligibility";
import {
  getDirectFAQ,
  getPageFormula,
  getPageResult,
} from "../lib/pageCalculations";
import { format } from "date-fns";
import routeData from "./generated/routes.json";
import cityLinks from "./generated/city-links.json";
import aliases from "./generated/aliases.json";
import shell from "./generated/on-demand-shell.html";
const pages = new Map(
  (routeData as unknown as OnDemandData[]).map((p) => [p.slug, p]),
);
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function renderOnDemand(
  slug: string,
  initialTime = new Date().toISOString(),
) {
  const page = pages.get(slug);
  if (!page) return undefined;
  const pair = page.kind === "timezone" ? getPairCities(slug) : undefined;
  const related = pair
    ? (cityLinks as Record<string, { path: string; label: string }[]>)[
        pair[0].slug
      ] || []
    : [
        { path: "/calculators/date-calculator", label: "Date Calculator" },
        { path: "/calculators/time-difference", label: "Days Between Dates" },
        { path: "/30-days-from-today", label: "30 Days From Today" },
      ];
  const props: OnDemandProps = { page, initialTime, related };
  if (page.kind !== "timezone") {
    const now = new Date(initialTime);
    props.snapshot = {
      result: getPageResult(page, now),
      formula: getPageFormula(page, now),
      date: format(now, "yyyy-MM-dd"),
      dateTime: format(now, "yyyy-MM-dd'T'HH:mm"),
      faqs: [getDirectFAQ(page, now), ...page.faq.slice(1)],
    };
  }
  // JSON escaping also prevents a data string from terminating its script element.
  const payload = JSON.stringify(props)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
  return (
    shell
      .replaceAll("__WDT_TITLE__", escape(`${page.title} | WhatDateTime`))
      .replaceAll("__WDT_DESCRIPTION__", escape(page.description))
      // Replace canonical URLs and Header props, never the bundled script filename.
      .replaceAll(
        "https://whatdatetime.com/render-shell",
        `https://whatdatetime.com/${slug}`,
      )
      .replaceAll("&quot;/render-shell/&quot;", `&quot;/${slug}&quot;`)
      .replaceAll("&quot;/render-shell&quot;", `&quot;/${slug}&quot;`)
      .replace(
        '<div id="on-demand-content"></div>',
        () =>
          `<div id="on-demand-content">${renderToString(<OnDemandPage {...props} />)}</div>`,
      )
      .replace("__WDT_PROPS__", () => payload)
  );
}
type Env = { ASSETS: { fetch(request: Request): Promise<Response> } };
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    const slug = url.pathname.replace(/^\//, "").replace(/\/$/, "");
    const alias = (aliases as Record<string, string>)[slug];
    if (alias) {
      url.pathname = alias;
      return Response.redirect(url.toString(), 308);
    }
    if (!pages.has(slug)) return env.ASSETS.fetch(request); // Asset service supplies the real 404 document/status.
    if (url.pathname.endsWith("/")) {
      url.pathname = `/${slug}`;
      return Response.redirect(url.toString(), 308);
    }
    const html = renderOnDemand(slug)!;
    return new Response(request.method === "HEAD" ? null : html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, follow",
        "X-Content-Type-Options": "nosniff",
        "Content-Language": "en",
      },
    });
  },
};
