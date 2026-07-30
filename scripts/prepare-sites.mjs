import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const source = ".open-next";
const output = "dist";
const workerOutput = ".wrangler-sites";
const bundledWorker = `${workerOutput}/sites-entry.js`;
const staticSEOOutput = `${source}/assets/cdn-cgi/seo-pages`;
const staticCoreOutput = `${source}/assets/cdn-cgi/core-pages`;
const staticMetadataOutput = `${source}/assets/cdn-cgi/metadata`;
const pageIndex = JSON.parse(readFileSync("data/tools/index.json", "utf8"));
const programmaticSlugs = new Set(pageIndex.map((page) => page.slug));

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(`${source}/assets/cdn-cgi`, { recursive: true, force: true });
mkdirSync(staticSEOOutput, { recursive: true });
mkdirSync(staticCoreOutput, { recursive: true });
mkdirSync(staticMetadataOutput, { recursive: true });

for (const { slug } of pageIndex) {
  const htmlPath = `.next/server/app/${slug}.html`;
  const rscPath = `.next/server/app/${slug}.rsc`;

  if (!existsSync(htmlPath) || !existsSync(rscPath)) {
    throw new Error(`Missing static SEO output for /${slug}`);
  }

  const payload = JSON.stringify({
    html: readFileSync(htmlPath, "utf8"),
    rsc: readFileSync(rscPath, "utf8"),
  });
  writeFileSync(
    `${staticSEOOutput}/${slug}.json.gz`,
    gzipSync(payload, { level: 9 }),
  );
}

function routeToken(route) {
  return route ? route.replaceAll("/", "__") : "index";
}

const appOutput = ".next/server/app";
for (const relativePath of readdirSync(appOutput, {
  recursive: true,
  encoding: "utf8",
})) {
  if (!relativePath.endsWith(".html")) continue;

  const route =
    relativePath === "index.html"
      ? ""
      : relativePath.replaceAll("\\", "/").replace(/\.html$/, "");
  if (programmaticSlugs.has(route)) continue;

  const htmlPath = `${appOutput}/${relativePath}`;
  const rscPath = htmlPath.replace(/\.html$/, ".rsc");
  if (!existsSync(rscPath)) {
    throw new Error(`Missing static RSC output for /${route}`);
  }

  writeFileSync(
    `${staticCoreOutput}/${routeToken(route)}.json.gz`,
    gzipSync(
      JSON.stringify({
        html: readFileSync(htmlPath, "utf8"),
        rsc: readFileSync(rscPath, "utf8"),
      }),
      { level: 9 },
    ),
  );
}

for (const [route, file, contentType] of [
  ["sitemap.xml", "sitemap.xml.body", "application/xml; charset=utf-8"],
  ["robots.txt", "robots.txt.body", "text/plain; charset=utf-8"],
  [
    "manifest.webmanifest",
    "manifest.webmanifest.body",
    "application/manifest+json; charset=utf-8",
  ],
]) {
  const sourcePath = `${appOutput}/${file}`;
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing static metadata output for /${route}`);
  }
  writeFileSync(
    `${staticMetadataOutput}/${route}.json.gz`,
    gzipSync(
      JSON.stringify({
        body: readFileSync(sourcePath, "utf8"),
        contentType,
      }),
      { level: 9 },
    ),
  );
}

rmSync(workerOutput, { recursive: true, force: true });

const wrangler = spawnSync(
  process.execPath,
  [
    resolve("node_modules/wrangler/bin/wrangler.js"),
    "deploy",
    "workers/sites-entry.js",
    "--dry-run",
    "--outdir",
    workerOutput,
  ],
  {
    encoding: "utf8",
    stdio: "inherit",
  },
);

if (wrangler.status !== 0 || !existsSync(bundledWorker)) {
  throw new Error("Wrangler did not produce a deployable Cloudflare Worker");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(`${output}/server`, { recursive: true });
copyFileSync(bundledWorker, `${output}/server/index.js`);

if (existsSync(`${source}/assets`)) {
  cpSync(`${source}/assets`, `${output}/client`, { recursive: true });
}

mkdirSync(`${output}/.openai`, { recursive: true });
copyFileSync(".openai/hosting.json", `${output}/.openai/hosting.json`);

rmSync(workerOutput, { recursive: true, force: true });

console.log("Prepared bundled Sites artifact in dist/");
