import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dir, "..", "..", "..");
const { z } = createRequire(join(GOC, "apps", "agent", "package.json"))(
	"zod",
) as typeof import("zod");

const CHUP = {
	url: "https://ai-gateway.vercel.sh/v1/models",
	ma: "google/gemini-3.8-flash",
	tep: resolve(
		import.meta.dir,
		"..",
		"evidence",
		"gateway-gemini-3-8-flash-2026-10-15.json",
	),
} as const;

const khuonMuc = z.object({
	id: z.string(),
	context_window: z.number(),
	pricing: z.object({ input: z.string(), output: z.string() }),
});
const khuonDanhMuc = z.object({
	data: z.array(z.object({ id: z.string() }).passthrough()),
});

const res = await fetch(CHUP.url);
if (!res.ok) {
	console.log(`KHONG DO DUOC: ${CHUP.url} tra ${res.status}`);
	process.exit(2);
}
const than = await res.text();
const danhMuc = khuonDanhMuc.parse(JSON.parse(than));
const tho = danhMuc.data.find((m) => m.id === CHUP.ma);
if (!tho) {
	console.log(`KHONG DO DUOC: danh muc khong co ${CHUP.ma}`);
	process.exit(2);
}
const muc = khuonMuc.parse(tho);
const ghi = {
	nguon: CHUP.url,
	fetched_at: new Date().toISOString(),
	sha256: createHash("sha256").update(than).digest("hex"),
	entry: {
		id: muc.id,
		context_window: muc.context_window,
		pricing: { input: muc.pricing.input, output: muc.pricing.output },
	},
};
writeFileSync(CHUP.tep, `${JSON.stringify(ghi, null, "\t")}\n`);
console.log(
	`da ghi ${join("evidence", "gateway-gemini-3-8-flash-2026-10-15.json")}`,
);
