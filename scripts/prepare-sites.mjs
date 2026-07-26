import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";

const source = ".open-next";
const output = "dist";

if (!existsSync(`${source}/worker.js`)) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(output, { recursive: true, force: true });
cpSync(source, output, { recursive: true });

mkdirSync(`${output}/server`, { recursive: true });
writeFileSync(
  `${output}/server/index.js`,
  'export { default } from "../worker.js";\n',
);

if (existsSync(`${source}/assets`)) {
  cpSync(`${source}/assets`, `${output}/client`, { recursive: true });
}

mkdirSync(`${output}/.openai`, { recursive: true });
copyFileSync(".openai/hosting.json", `${output}/.openai/hosting.json`);

console.log("Prepared Sites artifact in dist/");
