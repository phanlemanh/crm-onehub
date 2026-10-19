import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const THU_MUC = process.env.TNV_LUONG_DIR;
if (!THU_MUC) throw new Error("thieu TNV_LUONG_DIR");
const LUONG = /^\/eve\/v1\/session\/([^/]+)\/stream$/;

function dongCua(phien: string): string[] {
	const tep = join(THU_MUC ?? "", `${phien}.ndjson`);
	if (!existsSync(tep)) return [];
	return readFileSync(tep, "utf8")
		.split("\n")
		.filter((dong) => dong.trim().length > 0);
}

const may = Bun.serve({
	port: Number(process.env.TAC_TU_GIA_PORT ?? 0),
	hostname: "127.0.0.1",
	fetch(request) {
		const url = new URL(request.url);
		const khop = LUONG.exec(url.pathname);
		if (request.method === "GET" && khop) {
			const phien = decodeURIComponent(khop[1] ?? "");
			const dong = dongCua(phien);
			const tu = Number(url.searchParams.get("startIndex") ?? 0);
			const headers = new Headers({
				"cache-control": "no-store, no-transform",
				"content-type": "application/x-ndjson",
				"x-eve-session-id": phien,
				"x-eve-stream-format": "ndjson",
				"x-eve-stream-version": "20",
			});
			if (url.searchParams.get("includeTailIndex") === "1") {
				headers.set(
					"x-eve-stream-tail-index",
					String(Math.max(0, dong.length - 1)),
				);
			}
			return new Response(
				dong
					.slice(tu)
					.map((d) => `${d}\n`)
					.join(""),
				{ headers },
			);
		}
		if (request.method === "POST" && url.pathname.startsWith("/internal/")) {
			return new Response(null, { status: 202 });
		}
		return Response.json({ error: "khong co o tac tu gia" }, { status: 404 });
	},
});

console.log(`AGENT_URL=http://127.0.0.1:${may.port}`);
