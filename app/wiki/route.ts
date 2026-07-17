// @ts-expect-error Vite bundles the static wiki as a raw string for this route.
import wikiHtml from "../../public/wiki.html?raw";

export async function GET() {
  return new Response(wikiHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}