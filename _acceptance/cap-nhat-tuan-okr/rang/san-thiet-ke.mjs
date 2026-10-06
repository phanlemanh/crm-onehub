import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { doTaiGop, VONG } from "./cau-hinh.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const VUNG = [
	/^apps\/app\/app\/\(app\)\/\[slug\]\/okr\/.+\.tsx$/,
	/^apps\/app\/app\/\(app\)\/\[slug\]\/settings\/members\/.+\.tsx$/,
	/^apps\/app\/app\/\(app\)\/\[slug\]\/dashboard-summary\.tsx$/,
	/^apps\/app\/app\/\(app\)\/\[slug\]\/tong-quan-chi-okr\.tsx$/,
	/^apps\/app\/components\/crm\/record-sheet\/.+\.tsx$/,
	/^packages\/ui\/src\/.+\.tsx$/,
];
const BA_TEP_DANH_SACH = [
	"apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx",
	"apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
	"apps/app/components/crm/record-sheet/objective-trao-doi.tsx",
];
const DAU_HIEU = [
	{ nhan: "<table>", mau: /<table\b/ },
	{ nhan: "<h1>", mau: /<h1\b/ },
	{ nhan: "<h2>", mau: /<h2\b/ },
	{ nhan: "<ul", mau: /<ul\b/ },
	{ nhan: "<li", mau: /<li\b/ },
	{ nhan: "size-2 rounded-full", mau: /size-2\s+rounded-full/ },
	{ nhan: "navigator.clipboard", mau: /navigator\.clipboard/ },
	{ nhan: "AlertDialog", mau: /AlertDialog/ },
	{ nhan: "divide-y", mau: /divide-y\b/ },
	{
		nhan: "rounded-lg border",
		mau: /rounded-lg\s+border\b|\bborder\s+rounded-lg/,
	},
];

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

function khopDauHieu(chu) {
	const ra = [];
	for (const { nhan, mau } of DAU_HIEU) {
		if (mau.test(chu)) ra.push(nhan);
	}
	return ra;
}

function soiTepThat(tep, duong) {
	const chu = readFileSync(duong, "utf8");
	return khopDauHieu(chu).map((nhan) => `dau hieu ve tay: ${nhan} (${tep})`);
}

function dongMoi(tep) {
	const tho = git("diff", "-U0", `${VONG.truoc}...${VONG.sau}`, "--", tep);
	return tho
		.split("\n")
		.filter((d) => d.startsWith("+") && !d.startsWith("+++"))
		.map((d) => d.slice(1));
}

function soiDongMoi(tep) {
	const dong = dongMoi(tep);
	const nhanBi = new Set();
	for (const d of dong) {
		for (const nhan of khopDauHieu(d)) nhanBi.add(nhan);
	}
	return [...nhanBi].map((nhan) => `dau hieu ve tay: ${nhan} (${tep})`);
}

function soiUi(danhSach) {
	return danhSach.map((f) => `packages/ui bi sua: ${f}`);
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
	inKet(soiTepThat(tep, tep));
}

if (doiSo("--ui-sua") !== null) {
	inKet(soiUi(doiSo("--ui-sua").split(",").filter(Boolean)));
}

if (process.argv.includes("--chieu-do")) {
	const thuMuc = mkdtempSync(join(tmpdir(), "san-thiet-ke-"));
	const chia = join(thuMuc, "chia-tay.tsx");
	const danhSach = join(thuMuc, "danh-sach-tay.tsx");
	writeFileSync(
		chia,
		'export function ChiaTay() {\n\treturn <div className="divide-y">chia</div>;\n}\n',
	);
	writeFileSync(
		danhSach,
		'export function DanhSachTay({ items }) {\n\treturn (\n\t\t<ul className="border-b">\n\t\t\t{items.map((i) => (\n\t\t\t\t<li key={i.id}>{i.ten}</li>\n\t\t\t))}\n\t\t</ul>\n\t);\n}\n',
	);
	const ca = [
		{
			ten: "tep gia chua divide-y",
			doi: ["--tep", chia],
			ghim: "dau hieu ve tay: divide-y",
		},
		{
			ten: "tep gia dung <ul> dung danh sach",
			doi: ["--tep", danhSach],
			ghim: "dau hieu ve tay: <ul",
		},
		{
			ten: "danh sach gia sua toggle-group.tsx",
			doi: [
				"--ui-sua",
				"packages/ui/src/components/toggle-group.tsx",
			],
			ghim: "packages/ui bi sua: packages/ui/src/components/toggle-group.tsx",
		},
	];
	let lot = 0;
	for (const c of ca) {
		const r = spawnSync(process.execPath, [TEP_NAY, ...c.doi], {
			encoding: "utf8",
		});
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const bat = r.status === 1 && ra.includes(c.ghim);
		if (!bat) lot += 1;
		console.log(
			`${bat ? "bat " : "LOT "} ${c.ten}: ma ${r.status}, ${bat ? `in «${c.ghim}»` : `khong in «${c.ghim}»: ${ra.trim().slice(0, 200)}`}`,
		);
	}
	rmSync(thuMuc, { recursive: true, force: true });
	console.log(`chieu do: ${ca.length - lot}/${ca.length} ca do bi bat`);
	process.exit(lot === 0 ? 0 : 1);
}

doTaiGop(TEP_NAY);

const tep = git("diff", "--name-only", `${VONG.truoc}...${VONG.sau}`)
	.split("\n")
	.filter((t) => t.endsWith(".tsx"))
	.filter((t) => VUNG.some((v) => v.test(t)))
	.filter((t) => existsSync(join(GOC, t)))
	.filter((t, i, ds) => ds.indexOf(t) === i);

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
	const r = spawnSync(
		"node",
		[
			join(kit, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	const dauHieu = t.startsWith("packages/ui/src/") ? [] : soiDongMoi(t);
	if (r.status !== 0) {
		hong.push(`design-gate ${t}: ma ${r.status}`);
		for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`
			.trim()
			.split("\n")
			.slice(0, 8))
			console.log(`  ${d}`);
	}
	hong.push(...dauHieu);
	console.log(
		`${r.status === 0 && dauHieu.length === 0 ? "dat " : "HONG"} ${t}`,
	);
}

for (const t of BA_TEP_DANH_SACH) {
	const duong = join(GOC, t);
	const noi = existsSync(duong) ? readFileSync(duong, "utf8") : "";
	const co = /@crm\/ui\/components\/item/.test(noi);
	console.log(`${co ? "dat " : "HONG"} nhap Item: ${t}`);
	if (!co) hong.push(`thieu nhap Item tu @crm/ui/components/item: ${t}`);
}

const uiSua = git(
	"diff",
	"--name-only",
	"--diff-filter=M",
	`${VONG.truoc}...${VONG.sau}`,
	"--",
	"packages/ui/src",
)
	.split("\n")
	.filter(Boolean);
hong.push(...soiUi(uiSua));
const uiThem = git(
	"diff",
	"--name-only",
	"--diff-filter=A",
	`${VONG.truoc}...${VONG.sau}`,
	"--",
	"packages/ui/src",
)
	.split("\n")
	.filter(Boolean);
for (const f of uiThem) console.log(`them packages/ui (duoc phep): ${f}`);
console.log(
	`packages/ui/src bi sua: ${uiSua.length}, them moi: ${uiThem.length}`,
);
console.log(`san-thiet-ke: ${tep.length} tep, ${hong.length} hong`);
inKet(hong);
