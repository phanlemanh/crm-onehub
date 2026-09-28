import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THUOC_LUOT_5 = join(GOC, "_acceptance/toan-canh-okr/rang/san-thiet-ke.mjs");

const VONG = Object.freeze({
	truoc: "f51b5ba1d51528a3624ae79dde8e254d9616eda5",
	sau: "056e62936e913f7286b87920b2b7a3929d2e233a",
});
const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_UI = /^packages\/ui\/src\/components\/.+\.tsx$/;
const GHIM_DO = ["dau hieu ve tay: divide-y", 'mac dinh chuoi trong tham so: size = "sm"'];

const chay = (lenh, doi) => {
	const r = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8" });
	return { ma: r.status ?? 1, ra: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};

function goiKit() {
	return (
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
		).trim()
	);
}

function soiMot(t, kit) {
	const hong = [];
	const soi = chay(process.execPath, [THUOC_LUOT_5, "--tep", t]);
	if (soi.ma !== 0)
		hong.push(...soi.ra.split("\n").filter(Boolean), `soi ${t}: ma ${soi.ma}`);
	if (kit !== null && VUNG_APP.test(t)) {
		const gate = chay("node", [
			join(kit, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		]);
		if (gate.ma !== 0) {
			hong.push(`design-gate ${t}: ma ${gate.ma}`);
			for (const d of gate.ra.split("\n").slice(0, 8)) console.log(`  ${d}`);
		}
	}
	return hong;
}

if (process.argv.includes("--chieu-do")) {
	const thuMuc = mkdtempSync(join(tmpdir(), "n4-san-thiet-ke-"));
	const tep = join(thuMuc, "khoi-gia.tsx");
	writeFileSync(
		tep,
		'export function KhoiGia({ size = "sm" }: { size?: string }) {\n\treturn <div className="divide-y" data-size={size} />;\n}\n',
	);
	const hong = soiMot(tep, null);
	rmSync(thuMuc, { recursive: true, force: true });
	let lot = 0;
	for (const g of GHIM_DO) {
		const bat = hong.some((h) => h.includes(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(`chieu do: ${GHIM_DO.length - lot}/${GHIM_DO.length} vi pham bi bat`);
	process.exit(lot === 0 ? 0 : 1);
}

const dai = `${VONG.truoc}...${VONG.sau}`;
const tep = execFileSync(
	"git",
	["-C", GOC, "diff", "--name-only", "--diff-filter=AM", dai],
	{ encoding: "utf8" },
)
	.split("\n")
	.filter((t) => VUNG_APP.test(t) || VUNG_UI.test(t))
	.filter((t) => existsSync(join(GOC, t)))
	.sort();

console.log(`dai so sanh (merge #176): ${dai}`);
console.log(`so tep giao dien vong nay cham: ${tep.length}`);
if (tep.length === 0) {
	console.log("KHONG DO DUOC: khong tep giao dien nao trong dai da neo");
	process.exit(2);
}

const kit = goiKit();
const hong = [];
for (const t of tep) {
	const loi = soiMot(t, kit);
	hong.push(...loi);
	console.log(`${loi.length === 0 ? "dat " : "HONG"} ${t}`);
}
for (const h of hong) console.log(`HONG ${h}`);
console.log(`san-thiet-ke: ${tep.length} tep, ${hong.length} hong`);
process.exit(hong.length === 0 ? 0 : 1);
