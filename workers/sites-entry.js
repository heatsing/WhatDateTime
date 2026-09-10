const legacyRedirects = new Map([
  ["/date-calculator", "/calculators/date-calculator"],
  ["/time-difference-calculator", "/calculators/time-difference"],
  ["/age-calculator", "/calculators/age-calculator"],
  ["/countdown-timer", "/calculators/countdown"],
  ["/time-zone-converter", "/calculators/timezone-converter"],
]);

function redirectUrl(request) {
  const url = new URL(request.url);
  const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const legacyTarget = legacyRedirects.get(url.pathname.replace(/\/$/, ""));
  if (legacyTarget) {
    url.pathname = legacyTarget;
    if (!isLocal) {
      url.protocol = "https:";
      url.hostname = "whatdatetime.com";
      url.port = "";
    }
    return url;
  }
  const isContentPath =
    url.pathname.length > 1 &&
    url.pathname.endsWith("/") &&
    !url.pathname.startsWith("/_astro/") &&
    !url.pathname.slice(0, -1).split("/").at(-1)?.includes(".");
  if (isContentPath) {
    url.pathname = url.pathname.slice(0, -1);
    if (!isLocal) {
      url.protocol = "https:";
      url.hostname = "whatdatetime.com";
      url.port = "";
    }
    return url;
  }
  if (isLocal) return null;
  if (url.protocol !== "https:" || url.hostname !== "whatdatetime.com") {
    url.protocol = "https:";
    url.hostname = "whatdatetime.com";
    url.port = "";
    return url;
  }
  return null;
}

export default {
  async fetch(request, env) {
    const target = redirectUrl(request);
    if (target) return Response.redirect(target.toString(), 308);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      headers.set("Content-Language", "en");
      headers.set("X-Content-Type-Options", "nosniff");
    }
    if (response.status === 404) {
      headers.set("X-Robots-Tag", "noindex, follow");
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
