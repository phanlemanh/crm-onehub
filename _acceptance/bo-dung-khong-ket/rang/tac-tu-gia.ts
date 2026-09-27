import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const DONG = readFileSync(join(DAY, "luong-het-han-muc-that.ndjson"), "utf8")
	.split("\n")
	.filter((dong) => dong.trim().length > 0);
const LUONG = /^\/eve\/v1\/session\/[^/]+\/stream$/;

const may = Bun.serve({
	port: Number(process.env.TAC_TU_GIA_PORT ?? 0),
	hostname: "127.0.0.1",
	fetch(request) {
		const url = new URL(request.url);
		if (request.method === "GET" && LUONG.test(url.pathname)) {
			const tu = Number(url.searchParams.get("startIndex") ?? 0);
			const headers = new Headers({
				"cache-control": "no-store, no-transform",
				"content-type": "application/x-ndjson",
				"x-eve-session-id": url.pathname.split("/")[4] ?? "",
				"x-eve-stream-format": "ndjson",
				"x-eve-stream-version": "20",
			});
			if (url.searchParams.get("includeTailIndex") === "1") {
				headers.set("x-eve-stream-tail-index", String(DONG.length));
			}
			const than = DONG.slice(tu)
				.map((dong) => `${dong}\n`)
				.join("");
			return new Response(than, { headers });
		}
		if (request.method === "POST" && url.pathname.startsWith("/internal/")) {
			return new Response(null, { status: 202 });
		}
		return Response.json({ error: "khong co o tac tu gia" }, { status: 404 });
	},
});

console.log(`AGENT_URL=http://127.0.0.1:${may.port}`);
