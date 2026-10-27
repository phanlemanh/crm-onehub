import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC_KHO = resolve(HERE, "..", "..", "..");
const QUET =
	process.env.CNG_QUET ??
	join(GOC_KHO, "_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs");
const SO =
	process.env.CNG_SO ??
	join(GOC_KHO, "_acceptance/ngan-kr-mot-cho/decisions.jsonl");
const O = "cap-nhat-gan-day";
const TEP = "apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/";

const r = spawnSync(process.execPath, [QUET], {
	cwd: GOC_KHO,
	encoding: "utf8",
});
const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
const lech = [];
if (r.status !== 0) {
	const ngoai = ra.split("\n").filter((l) => l.startsWith("loi ngoai ma tran"));
	lech.push(
		`bo quet ma ${r.status}${ngoai.length ? ` (${ngoai.join("; ")})` : ""}`,
	);
}
const dem = ra.match(/so loi quet: (\d+) · so o ma tran: (\d+)/);
if (!dem) lech.push("khong doc duoc dong dem");
else if (dem[1] !== dem[2] || Number(dem[2]) <= 9)
	lech.push(`dem lech: ${dem[1]} loi, ${dem[2]} o`);
if (!ra.split("\n").some((l) => l.startsWith(`loi: ${O} ${TEP}`)))
	lech.push(`thieu dong loi: ${O}`);
const dong = readFileSync(SO, "utf8")
	.split("\n")
	.filter((l) => l.trim() !== "")
	.flatMap((l) => {
		try {
			return [JSON.parse(l)];
		} catch {
			return [];
		}
	})
	.filter(
		(d) =>
			d.type === "fix" &&
			String(d.decision).includes(O) &&
			`${d.decision} ${d.why}`.includes("D8"),
	);
if (dong.length === 0) lech.push("thieu dong so fix D8");
if (lech.length > 0) {
	console.log(`SAI ma tran lo mo KR: ${lech.join("; ")}`);
	process.exit(1);
}
console.log(
	`DUNG ma tran lo mo KR: ${dem?.[1]} loi = ${dem?.[2]} o, co o ${O}, dong so=${dong.length}`,
);
