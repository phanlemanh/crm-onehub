import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "./chung.mjs";

const MOC_CU = "9c65f368";
const TEP = {
	hopDong: "_acceptance/so-okr-tu-chay/contract.md",
	evals: "_acceptance/so-okr-tu-chay/evals.yaml",
	docs: "docs/api.md",
	thuoc: "_acceptance/so-okr-tu-chay/rang/soi-ma.mjs",
};
const CHU = ["okr:mau", "kiemDuocNap", "kiemOkrThat"];

const docHienTai = (t) => readFileSync(join(GOC, t), "utf8");
const docCu = (t) =>
	execFileSync("git", ["-C", GOC, "show", `${MOC_CU}:${t}`], {
		encoding: "utf8",
	});

function bangThuoc(thuoc) {
	const hang = new Map(
		[...thuoc.matchAll(/^const (\w+) = "([^"]+)";$/gm)].map((m) => [
			m[1],
			m[2],
		]),
	);
	const khoi = (ten) => {
		const i = thuoc.indexOf(`const ${ten} = `);
		if (i === -1) throw new Error(`KHONG DO DUOC: thuoc khong co ${ten}`);
		return thuoc.slice(i, thuoc.indexOf("]);", i) + 3);
	};
	const duoc = [
		...khoi("DUOC_TAO").matchAll(
			/\["([^"]+)",\s*(null|new Set\(\[([^\]]*)\]\))\]/g,
		),
	].map((m) => ({
		tep: m[1],
		ham: m[3] ? [...m[3].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [],
	}));
	const i = thuoc.indexOf("const MIEN_BO_MAU = [");
	const mienKhoi = thuoc.slice(i, thuoc.indexOf("];", i));
	const mien = [...mienKhoi.matchAll(/tep: (\w+), ham: "([^"]+)"/g)].map(
		(m) => ({
			tep: hang.get(m[1]) ?? m[1],
			ham: [m[2]],
		}),
	);
	if (duoc.length === 0 || mien.length === 0)
		throw new Error(
			"KHONG DO DUOC: khong rut duoc DUOC_TAO hoac MIEN_BO_MAU tu thuoc",
		);
	return [...duoc, ...mien];
}

const dongDau = (chu, dau) =>
	chu.split("\n").find((d) => d.startsWith(dau)) ?? "";

function doanSau(chu, dau, het) {
	const i = chu.indexOf(dau);
	if (i === -1) return "";
	const j = chu.slice(i + dau.length).search(het);
	return j === -1 ? chu.slice(i) : chu.slice(i, i + dau.length + j);
}

const gop = (s) => s.replace(/\s+/g, " ");

function kiem(van, bang) {
	const ac4 = dongDau(van.hopDong, "- AC-4:");
	const ac14 = dongDau(van.hopDong, "- AC-14:");
	const notes = doanSau(van.hopDong, "## Notes", /\n## /);
	const e8 = doanSau(van.evals, "  - id: E8\n", /\n {2}- id: /);
	const docs = doanSau(
		van.docs,
		"- **`okrSoChup` is append-only history.**",
		/\n- \*\*/,
	);
	const thieu = [];
	if (!docs) thieu.push("khong thay doan okrSoChup append-only o docs");
	for (const { tep, ham } of bang) {
		for (const [noi, chu] of [
			["hop-dong AC-4/AC-14", ac4 + ac14],
			["docs", docs],
		]) {
			if (!chu.includes(tep)) thieu.push(`thieu tep ${tep} o ${noi}`);
			for (const h of ham)
				if (!chu.includes(h)) thieu.push(`thieu ham ${h} o ${noi}`);
		}
	}
	for (const w of CHU)
		for (const [noi, chu] of [
			["hop-dong AC-4", ac4],
			["E8", e8],
			["docs", docs],
		])
			if (!chu.includes(w)) thieu.push(`thieu chu ${w} o ${noi}`);
	if (gop(docs).includes("three places only"))
		thieu.push("con 'three places only' o docs");
	if (!notes.includes("mien-so-chup-bo-okr-mau"))
		thieu.push("thieu dong sua doi 01/10 o Notes hop-dong");
	return thieu;
}

const bang = bangThuoc(docHienTai(TEP.thuoc));
console.log(
	`bang tu thuoc: ${bang.map((b) => `${b.tep}${b.ham.length ? ` (${b.ham.join(", ")})` : ""}`).join(" · ")}`,
);

const nay = kiem(
	{
		hopDong: docHienTai(TEP.hopDong),
		evals: docHienTai(TEP.evals),
		docs: docHienTai(TEP.docs),
	},
	bang,
);
for (const t of nay) console.log(`HONG ${t}`);
console.log(
	`ban hien tai: ${nay.length === 0 ? "du" : `${nay.length} cho thieu`}`,
);

const cu = kiem(
	{
		hopDong: docCu(TEP.hopDong),
		evals: docCu(TEP.evals),
		docs: docCu(TEP.docs),
	},
	bang,
);
for (const t of cu) console.log(`chieu do ${MOC_CU}: ${t}`);
const ghim = [
	"con 'three places only' o docs",
	"thieu chu okr:mau o hop-dong AC-4",
	"thieu chu okr:mau o E8",
	"thieu dong sua doi 01/10 o Notes hop-dong",
];
const lot = ghim.filter((g) => !cu.includes(g));
for (const g of lot)
	console.log(`CHIEU DO LOT: ban ${MOC_CU} khong bi bat «${g}»`);
console.log(
	`chieu do: ${ghim.length - lot.length}/${ghim.length} cau ghim bat tren ban ${MOC_CU}`,
);

process.exit(nay.length === 0 && lot.length === 0 ? 0 : 1);
