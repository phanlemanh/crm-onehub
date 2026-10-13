import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const APP = path.join(GOC, "apps/app");
const TEP = [
	"apps/app/components/lo-trinh/tom-tat-ho-so.tsx",
	"apps/app/components/lo-trinh/so-lieu-lam-viec.tsx",
	"apps/app/components/lo-trinh/ho-so-viec.tsx",
	"apps/app/app/(app)/[slug]/lo-trinh/page.tsx",
];
const MOI = TEP.slice(0, 3);
const THUOC_TINH = new Set(["title", "aria-label", "label", "description"]);
const CHU = /\p{L}/u;
const ts = createRequire(path.join(APP, "package.json"))("typescript");

export function quet(ten, ma) {
	const sf = ts.createSourceFile(
		ten,
		ma,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const loi = [];
	const dong = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
	const di = (n) => {
		if (ts.isJsxText(n) && CHU.test(n.getText(sf))) loi.push(dong(n));
		if (
			ts.isJsxAttribute(n) &&
			THUOC_TINH.has(n.name.getText(sf)) &&
			n.initializer &&
			ts.isStringLiteral(n.initializer) &&
			CHU.test(n.initializer.text)
		)
			loi.push(dong(n));
		ts.forEachChild(n, di);
	};
	di(sf);
	return loi;
}

export function khoaDung(ma) {
	const khoa = new Set();
	for (const m of ma.matchAll(/m\.hoSo\.([A-Za-z]+)/g)) khoa.add(m[1]);
	return [...khoa];
}

function docLoi() {
	return JSON.parse(
		execFileSync(
			"bun",
			[
				"-e",
				'import { loTrinhMessages } from "./lib/messages/lo-trinh.ts"; console.log(JSON.stringify({ en: loTrinhMessages("en").hoSo, vi: loTrinhMessages("vi").hoSo }))',
			],
			{ cwd: APP, encoding: "utf8" },
		),
	);
}

export function kiem({ ma, loi: tepLoi }) {
	const dong = [];
	for (const t of TEP) {
		const sai = quet(t, ma[t]);
		dong.push({
			dung: sai.length === 0,
			nhan:
				sai.length === 0
					? `khong chu viet thang o ${path.basename(t)}`
					: `chu viet thang o ${path.basename(t)}:${sai[0]}`,
		});
	}
	const thieu = [];
	for (const t of MOI)
		for (const k of khoaDung(ma[t]))
			for (const nn of ["en", "vi"])
				if (!(k in tepLoi[nn]) || tepLoi[nn][k] === "")
					thieu.push(`thieu khoa ${nn} hoSo.${k}`);
	for (const nhom of ["oTomTat", "oSoLieu"]) {
		const a = Object.keys(tepLoi.en[nhom] ?? {})
			.sort()
			.join();
		const b = Object.keys(tepLoi.vi[nhom] ?? {})
			.sort()
			.join();
		if (a !== b || a === "") thieu.push(`lech khoa en/vi hoSo.${nhom}`);
	}
	dong.push({
		dung: thieu.length === 0,
		nhan: thieu.length === 0 ? "moi khoa loi co ca en va vi" : thieu[0],
	});
	return { ma: dong.every((d) => d.dung) ? 0 : 1, dong };
}

const goc = {
	ma: Object.fromEntries(
		TEP.map((t) => [t, readFileSync(path.join(GOC, t), "utf8")]),
	),
	loi: docLoi(),
};
const kq = kiem(goc);
for (const d of kq.dong) console.log(`${d.dung ? "DUNG" : "SAI"} ${d.nhan}`);
let ma = kq.ma;
if (process.argv.includes("--pha-thu") && ma === 0) {
	const t = TEP[0];
	const chen = goc.ma[t].replace(
		"<DetailSheetSection ",
		'<DetailSheetSection title="Tóm tắt hồ sơ" ',
	);
	const a =
		kiem({ ...goc, ma: { ...goc.ma, [t]: chen } }).dong.find((d) => !d.dung)
			?.nhan ?? "";
	const viThieu = { ...goc.loi.vi };
	delete viThieu.chuaCoTomTat;
	const b =
		kiem({ ...goc, loi: { ...goc.loi, vi: viThieu } }).dong.find((d) => !d.dung)
			?.nhan ?? "";
	const dungA = a.startsWith("chu viet thang o tom-tat-ho-so.tsx:");
	const dungB = b === "thieu khoa vi hoSo.chuaCoTomTat";
	console.log(
		`${dungA ? "DUNG" : "SAI"} pha-thu: chen title viet thang -> ${a || "khong dong nao do"}`,
	);
	console.log(
		`${dungB ? "DUNG" : "SAI"} pha-thu: bo khoa vi chuaCoTomTat -> ${b || "khong dong nao do"}`,
	);
	if (!dungA || !dungB) ma = 1;
}
console.log(`KET LUAN ma ${ma}`);
process.exit(ma);
