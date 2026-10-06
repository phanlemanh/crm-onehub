import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { doTaiGop, VONG } from "./cau-hinh.mjs";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_UI = /^packages\/ui\/src\/components\/.+\.tsx$/;
const DAU_HIEU = [
	{ nhan: "<table>", mau: /<table\b/ },
	{ nhan: "<h1>", mau: /<h1\b/ },
	{ nhan: "<h2>", mau: /<h2\b/ },
	{ nhan: "size-2 rounded-full", mau: /size-2\s+rounded-full/ },
	{ nhan: "divide-y", mau: /divide-y\b/ },
	{ nhan: "rounded-lg border", mau: /rounded-lg\s+border\b|\bborder\s+rounded-lg/ },
	{ nhan: "navigator.clipboard", mau: /navigator\.clipboard/ },
	{ nhan: "AlertDialog", mau: /AlertDialog/ },
];
const TEP_MOI = [
	{ nhan: "Record<string, unknown>", mau: /Record<string,\s*unknown>/ },
	{ nhan: "useEffect( tran", mau: /(?<![\w.])useEffect\(/ },
];

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

function macDinhChu(duong, ten) {
	const sf = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const ra = [];
	const di = (n) => {
		if (ts.isBindingElement(n) && n.initializer) {
			const gt = n.initializer;
			if (ts.isStringLiteral(gt) && /\p{L}/u.test(gt.text)) {
				const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
				ra.push(
					`mac dinh chuoi trong tham so: ${n.name.getText(sf)} = "${gt.text}" (${ten}:${line + 1})`,
				);
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function soiTep(ten, duong, { app, ui, moi }) {
	const chu = readFileSync(duong, "utf8");
	const hong = [];
	if (app)
		for (const { nhan, mau } of DAU_HIEU)
			if (mau.test(chu)) hong.push(`dau hieu ve tay: ${nhan} (${ten})`);
	if (ui && moi) {
		hong.push(...macDinhChu(duong, ten));
		if (/^\s*const\s+\w+\s*=\s*new\s+Intl\./m.test(chu))
			hong.push(`Intl o cap module: ${ten}`);
	}
	if (moi)
		for (const { nhan, mau } of TEP_MOI)
			if (mau.test(chu)) hong.push(`tep moi chua ${nhan}: ${ten}`);
	return hong;
}

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

function inKet(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

if (doiSo("--tep") !== null) {
	const tep = doiSo("--tep");
	inKet(soiTep(tep, tep, { app: true, ui: true, moi: true }));
}

if (process.argv.includes("--chieu-do")) {
	const thuMuc = mkdtempSync(join(tmpdir(), "san-thiet-ke-"));
	const tep = join(thuMuc, "khoi-gia.tsx");
	writeFileSync(
		tep,
		'export function KhoiGia({ size = "sm" }: { size?: string }) {\n\treturn <div className="divide-y" data-size={size} />;\n}\n',
	);
	const ghim = [
		"dau hieu ve tay: divide-y",
		'mac dinh chuoi trong tham so: size = "sm"',
	];
	const r = spawnSync(process.execPath, [TEP_NAY, "--tep", tep], {
		encoding: "utf8",
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	let lot = 0;
	for (const g of ghim) {
		const bat = r.status === 1 && ra.includes(g);
		if (!bat) lot += 1;
		console.log(
			`${bat ? "bat " : "LOT "} ${g}: ma ${r.status}${bat ? "" : ` — ${ra.trim().slice(0, 300)}`}`,
		);
	}
	rmSync(thuMuc, { recursive: true, force: true });
	console.log(`chieu do: ${ghim.length - lot}/${ghim.length} vi pham bi bat`);
	process.exit(lot === 0 ? 0 : 1);
}

doTaiGop(TEP_NAY);

const dai = `${VONG.truoc}...${VONG.sau}`;
const theoLoc = (loc) =>
	new Set(
		git("diff", "--name-only", `--diff-filter=${loc}`, dai)
			.split("\n")
			.filter(Boolean),
	);
const them = theoLoc("A");
const tep = [...theoLoc("AM")]
	.filter((t) => VUNG_APP.test(t) || VUNG_UI.test(t))
	.filter((t) => existsSync(join(GOC, t)))
	.sort();

console.log(`dai so sanh: ${dai}`);
console.log(`so tep giao dien vong nay cham: ${tep.length}`);
if (tep.length === 0) {
	console.log(
		"KHONG DO DUOC: khong tep giao dien nao trong diff — khong co gi de soi",
	);
	process.exit(2);
}

const kit = goiKit();
const hong = [];
for (const t of tep) {
	const app = VUNG_APP.test(t);
	const loi = soiTep(t, join(GOC, t), {
		app,
		ui: VUNG_UI.test(t),
		moi: them.has(t),
	});
	let ma = 0;
	if (app) {
		const r = spawnSync(
			"node",
			[join(kit, "scripts", "design-gate.mjs"), "--target", t, "--mode", "static"],
			{ cwd: GOC, encoding: "utf8" },
		);
		ma = r.status ?? 1;
		if (ma !== 0) {
			hong.push(`design-gate ${t}: ma ${ma}`);
			for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(0, 8))
				console.log(`  ${d}`);
		}
	}
	hong.push(...loi);
	console.log(
		`${ma === 0 && loi.length === 0 ? "dat " : "HONG"} ${t}${them.has(t) ? " (moi)" : ""}`,
	);
}
console.log(`san-thiet-ke: ${tep.length} tep, ${hong.length} hong`);
inKet(hong);
