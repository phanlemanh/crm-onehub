import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.SOI_GOC ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const doc = (duong) => readFileSync(join(GOC, duong), "utf8");

const BANG_KIEU = "apps/app/components/crm/fields/kieu-truong.tsx";

const GOI = [
	{
		tep: "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
		dung: /<OTruongTao\b/,
	},
	{
		tep: "apps/app/components/crm/record-sheet/deal-sheet.tsx",
		dung: /<OTruongPhieu\b/,
	},
	{
		tep: "apps/app/components/crm/record-sheet/quick-add.tsx",
		dung: /<OTruongTao\b/,
	},
];

const lech = [];
let khangDinh = 0;

function thanHam(ma, ten) {
	const dau = ma.indexOf(`function ${ten}(`);
	if (dau < 0) return null;
	const sau = ma.indexOf("\nfunction ", dau + 1);
	const sauXuat = ma.indexOf("\nexport ", dau + 1);
	const cuoi = [sau, sauXuat].filter((i) => i > 0);
	return ma.slice(dau, cuoi.length ? Math.min(...cuoi) : undefined);
}

function dongKieu(ma, kieu) {
	const m = ma.match(new RegExp(`\\n\\t${kieu}: \\{([\\s\\S]*?)\\n\\t\\},`));
	return m ? m[1] : null;
}

const bang = doc(BANG_KIEU);
const tien = dongKieu(bang, "MONEY");
khangDinh += 1;
if (!tien || !/suaTaiCho: \(moTa\) => <OTien moTa=\{moTa\} \/>/.test(tien))
	lech.push("kieu-truong.tsx: dong MONEY khong sua tai cho bang OTien");
khangDinh += 1;
if (!tien || !/oTao: \(moTa\) => <OTienTao moTa=\{moTa\} \/>/.test(tien))
	lech.push("kieu-truong.tsx: dong MONEY khong tao bang OTienTao");
for (const [ham, dung] of [
	["OTien", /<InlineMoneyField\b/],
	["OTienTao", /<MoneyInput\b/],
]) {
	const than = thanHam(bang, ham);
	khangDinh += 1;
	if (!than || !dung.test(than))
		lech.push(`kieu-truong.tsx: ${ham} khong dung ${dung.source.slice(1, -2)}`);
}
khangDinh += 1;
if (/Number\.parseFloat|\bparseFloat\(/.test(bang))
	lech.push("kieu-truong.tsx: con parseFloat");

for (const { tep, dung } of GOI) {
	const ma = doc(tep);
	const ten = tep.split("/").at(-1);
	khangDinh += 1;
	if (!dung.test(ma))
		lech.push(`${ten}: khong ve truong qua ${dung.source.slice(1, -2)}`);
	khangDinh += 1;
	if (/Number\.parseFloat|\bparseFloat\(/.test(ma))
		lech.push(`${ten}: con parseFloat`);
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
