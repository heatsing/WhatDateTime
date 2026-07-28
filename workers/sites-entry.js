import openNextWorker from "../.open-next/worker.js";

export {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from "../.open-next/worker.js";

async function getStaticSEOResponse(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  if (!slug || slug.includes("/") || slug.includes(".")) {
    return null;
  }

  const assetUrl = new URL(
    `/cdn-cgi/seo-pages/${encodeURIComponent(slug)}.json.gz`,
    url,
  );
  const asset = await env.ASSETS?.fetch(assetUrl);

  if (!asset?.ok || !asset.body) {
    await asset?.body?.cancel();
    return null;
  }

  const payload = await new Response(
    asset.body.pipeThrough(new DecompressionStream("gzip")),
  ).json();
  const isRSC = request.headers.get("RSC") === "1";
  const body = isRSC ? payload.rsc : payload.html;

  if (typeof body !== "string") {
    return null;
  }

  const headers = new Headers({
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Content-Type": isRSC
      ? "text/x-component; charset=utf-8"
      : "text/html; charset=utf-8",
    Vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url",
  });

  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "GET" || request.method === "HEAD") {
      const staticResponse = await getStaticSEOResponse(request, env);
      if (staticResponse) return staticResponse;
    }

    return openNextWorker.fetch(request, env, ctx);
  },
};
