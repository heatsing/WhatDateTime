import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
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
const pageIndex = JSON.parse(readFileSync("data/tools/index.json", "utf8"));

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(`${source}/assets/cdn-cgi`, { recursive: true, force: true });
mkdirSync(staticSEOOutput, { recursive: true });

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
