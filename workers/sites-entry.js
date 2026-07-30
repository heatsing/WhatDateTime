async function readCompressedAsset(env, assetUrl) {
  const asset = await env.ASSETS?.fetch(assetUrl);
  if (!asset?.ok || !asset.body) {
    await asset?.body?.cancel();
    return null;
  }

  return new Response(
    asset.body.pipeThrough(new DecompressionStream("gzip")),
  ).json();
}

function routeToken(route) {
  return route ? route.replaceAll("/", "__") : "index";
}

function extractEmbeddedFlight(html) {
  const chunks = [];
  const scripts =
    html.matchAll(
      /<script>self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g,
    );
  for (const match of scripts) {
    try {
      const record = JSON.parse(match[1]);
      if (record[0] === 1 && typeof record[1] === "string") {
        chunks.push(record[1]);
      }
    } catch {
      return null;
    }
  }
  return chunks.length > 0 ? chunks.join("") : null;
}

async function getStaticPageResponse(request, env) {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/+|\/+$/g, "");

  if (route.startsWith("_next/") || route === "BUILD_ID") {
    return env.ASSETS.fetch(request);
  }

  const metadataTypes = {
    "sitemap.xml": "application/xml; charset=utf-8",
    "robots.txt": "text/plain; charset=utf-8",
    "manifest.webmanifest": "application/manifest+json; charset=utf-8",
  };
  if (metadataTypes[route]) {
    const payload = await readCompressedAsset(
      env,
      new URL(`/cdn-cgi/metadata/${route}.json.gz`, url),
    );
    if (!payload || typeof payload.body !== "string") return null;
    return new Response(request.method === "HEAD" ? null : payload.body, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": payload.contentType || metadataTypes[route],
      },
    });
  }

  let payload = null;
  if (route && !route.includes("/") && !route.includes(".")) {
    payload = await readCompressedAsset(
      env,
      new URL(`/cdn-cgi/seo-pages/${encodeURIComponent(route)}.json.gz`, url),
    );
  }
  payload ??= await readCompressedAsset(
    env,
    new URL(`/cdn-cgi/core-pages/${routeToken(route)}.json.gz`, url),
  );

  let status = 200;
  if (!payload) {
    payload = await readCompressedAsset(
      env,
      new URL("/cdn-cgi/core-pages/_not-found.json.gz", url),
    );
    status = 404;
  }
  if (!payload) return null;

  const isRSC = request.headers.get("RSC") === "1";
  const body = isRSC
    ? payload.rsc ?? extractEmbeddedFlight(payload.html)
    : payload.html;

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
    status,
    headers,
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "GET" || request.method === "HEAD") {
      const staticResponse = await getStaticPageResponse(request, env);
      if (staticResponse) return staticResponse;
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  },
};
