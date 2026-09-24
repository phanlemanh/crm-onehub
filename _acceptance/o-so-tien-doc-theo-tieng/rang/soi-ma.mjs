import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.SOI_GOC ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const doc = (duong) => readFileSync(join(GOC, duong), "utf8");

const GOI = [
	{
		tep: "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
		dung: /<MoneyInput\b/,
	},
	{
		tep: "apps/app/components/crm/record-sheet/deal-sheet.tsx",
		dung: /<InlineMoneyField\b/,
	},
	{
		tep: "apps/app/components/crm/record-sheet/quick-add.tsx",
		dung: /<MoneyInput\b/,
	},
];

const lech = [];
let khangDinh = 0;

for (const { tep, dung } of GOI) {
	const ma = doc(tep);
	const ten = tep.split("/").at(-1);
	khangDinh += 1;
	if (!dung.test(ma))
		lech.push(`${ten}: khong dung ${dung.source.slice(1, -2)}`);
	khangDinh += 1;
	if (/Number\.parseFloat/.test(ma)) lech.push(`${ten}: con Number.parseFloat`);
}

const goiUi = JSON.parse(doc("packages/ui/package.json"));
const phuThuoc = { ...goiUi.dependencies, ...goiUi.devDependencies };
khangDinh += 1;
if ("@base-ui/react" in phuThuoc)
	lech.push("packages/ui/package.json: co @base-ui/react");
khangDinh += 1;
if ("cn" in phuThuoc) lech.push("packages/ui/package.json: co goi cn");
khangDinh += 1;
if (existsSync(join(GOC, "packages/ui/src/components/reui/number-field.tsx"))) {
	lech.push("packages/ui/src/components/reui/number-field.tsx: ton tai");
}

const THU_MUC_CHU = "apps/app/lib/messages";
for (const ten of readdirSync(join(GOC, THU_MUC_CHU))) {
	if (!ten.endsWith(".ts")) continue;
	khangDinh += 1;
	if (/\bamountNotNumber\b/.test(doc(`${THU_MUC_CHU}/${ten}`))) {
		lech.push(`${THU_MUC_CHU}/${ten}: con khoa amountNotNumber`);
	}
}

const SAN = [
	"packages/ui/src/components/money-input.tsx",
	"apps/app/components/crm/inline-field.tsx",
	"apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
	"apps/app/components/crm/record-sheet/quick-add.tsx",
];

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

console.log(`soi-ma: ${khangDinh} khang dinh, ${lech.length} lech`);
for (const l of lech) console.log(`LECH ${l}`);
process.exit(lech.length === 0 ? 0 : 1);
