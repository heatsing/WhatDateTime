import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const source = ".open-next";
const output = "dist";
const workerOutput = ".wrangler-sites";
const staticCacheOutput = `${source}/assets/cdn-cgi/_next_cache`;

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(staticCacheOutput, { recursive: true, force: true });
if (existsSync(`${source}/cache`)) {
  mkdirSync(staticCacheOutput, { recursive: true });
  cpSync(`${source}/cache`, staticCacheOutput, { recursive: true });
}

rmSync(workerOutput, { recursive: true, force: true });

const wrangler = spawnSync(
  process.execPath,
  [
    resolve("node_modules/wrangler/bin/wrangler.js"),
    "deploy",
    "--dry-run",
    "--outdir",
    workerOutput,
  ],
  {
    encoding: "utf8",
    stdio: "inherit",
  },
);

if (wrangler.status !== 0 || !existsSync(`${workerOutput}/worker.js`)) {
  throw new Error("Wrangler did not produce a deployable Cloudflare Worker");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(`${output}/server`, { recursive: true });
copyFileSync(`${workerOutput}/worker.js`, `${output}/server/index.js`);

if (existsSync(`${source}/assets`)) {
  cpSync(`${source}/assets`, `${output}/client`, { recursive: true });
}

mkdirSync(`${output}/.openai`, { recursive: true });
copyFileSync(".openai/hosting.json", `${output}/.openai/hosting.json`);

rmSync(workerOutput, { recursive: true, force: true });

console.log("Prepared bundled Sites artifact in dist/");
