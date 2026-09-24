import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.SOI_GOC ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const doc = (duong) => readFileSync(join(GOC, duong), "utf8");

const TAO = "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx";
const SAN = [
	TAO,
	"apps/app/components/crm/record-sheet/quick-add.tsx",
	"packages/ui/src/components/money-input.tsx",
];
const KHOA = [
	["packages/ui/src/lib/messages.ts", "canDongTien"],
	["apps/app/lib/messages/deals.ts", "currencyLoading"],
	["apps/app/lib/messages/deals.ts", "currencyLoadFailed"],
	["apps/app/lib/messages/record-sheet.ts", "currencyLoading"],
	["apps/app/lib/messages/record-sheet.ts", "currencyLoadFailed"],
	["apps/app/lib/messages/record-sheet.ts", "retry"],
];
const KY_MONG = 1 + SAN.length + KHOA.length;

const lech = [];
let khangDinh = 0;

khangDinh += 1;
if (doc(TAO).includes('"USD"')) {
	lech.push('create-deal-sheet.tsx: con du phong "USD"');
}

for (const [tep, khoa] of KHOA) {
	khangDinh += 1;
	const so = doc(tep).split(new RegExp(`\\b${khoa}:`)).length - 1;
	if (so !== 2)
		lech.push(`${tep}: khoa ${khoa} co ${so} ban, can 2 (vi va en)`);
}

const goiKit =
	process.env.CLAUDE_PLUGIN_ROOT ??
	execFileSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8" },
	).trim();

for (const t of SAN) {
	khangDinh += 1;
	const r = spawnSync(
		"node",
		[
			join(goiKit, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.status !== 0) {
		const dong = `${r.stdout ?? ""}${r.stderr ?? ""}`
			.trim()
			.split("\n")
			.slice(0, 6);
		lech.push(`cong thiet ke tinh ${t}: ma ${r.status} — ${dong.join(" | ")}`);
	}
}

console.log(`soi-ma: ${khangDinh}/${KY_MONG} khang dinh, ${lech.length} lech`);
if (khangDinh !== KY_MONG) {
	console.log(
		`KHONG DO DUOC: ma tran lech ban khai — ${khangDinh} != ${KY_MONG}`,
	);
	process.exit(2);
}
for (const l of lech) console.log(`LECH ${l}`);
process.exit(lech.length === 0 ? 0 : 1);
