import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";

const source = ".open-next";
const output = "dist";

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(`${output}/server`, { recursive: true });
cpSync(source, `${output}/server`, { recursive: true });
copyFileSync(`${source}/worker.js`, `${output}/server/index.js`);

if (existsSync(`${source}/assets`)) {
  cpSync(`${source}/assets`, `${output}/client`, { recursive: true });
}

mkdirSync(`${output}/.openai`, { recursive: true });
copyFileSync(".openai/hosting.json", `${output}/.openai/hosting.json`);

console.log("Prepared Sites artifact in dist/");
