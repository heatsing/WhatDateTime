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
    return env.ASSETS.fetch(request);
  },
};
