import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const outputRoot = resolve(siteRoot, "out");
const wikiOutput = resolve(outputRoot, "wiki/index.html");

const sourceWiki = await readFile(resolve(siteRoot, "public/wiki.html"), "utf8");
const staticWiki = sourceWiki
  .replaceAll('href="assets/', 'href="/assets/')
  .replaceAll('src="assets/', 'src="/assets/')
  .replaceAll("url('assets/", "url('/assets/")
  .replaceAll('href="index.html"', 'href="/"');

await mkdir(dirname(wikiOutput), { recursive: true });
await writeFile(wikiOutput, staticWiki, "utf8");
await writeFile(resolve(outputRoot, "_redirects"), "/wiki /wiki/ 301\n", "utf8");
