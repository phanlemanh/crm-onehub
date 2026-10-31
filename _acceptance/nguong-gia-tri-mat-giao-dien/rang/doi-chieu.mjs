import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BANG,
	DE_XUAT,
	GOC,
	goiKit,
	khongDo,
	napNguong,
	oNguong,
	tepGoc,
} from "./chung.mjs";

const { n, nhan } = napNguong(goiKit());
const HS51 = [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort();
if (HS51.length !== 51)
	khongDo(`bang-de-xuat co ${HS51.length} ho so, mong 51`);

export function xetMot(cu, moi, dong, nhanDs, bo) {
	const loi = [];
	for (const lb of nhanDs) {
		const a = cu.get(lb);
		const b = moi.get(lb);
		const trongCu = a === undefined || /^…$|^\.\.\.$|^\s*$/.test(a.trim());
		const d = dong.find((r) => r.nhan === lb);
		if (!trongCu && !d) {
			if (b !== a && b !== a.replace(DE_XUAT, "").trim())
				loi.push(`${lb}: doi chu o da co («${a}» -> «${b}»)`);
			continue;
		}
		if (!d) {
			loi.push(`${lb}: o trong khong co dong trong bang`);
			continue;
		}
		if (!d.nguon_so?.trim() || !d.can_cu?.trim())
			loi.push(`${lb}: dong bang thieu nguon_so hay can_cu`);
		if (b !== `${DE_XUAT} ${d.gia_tri}` && b !== d.gia_tri)
			loi.push(`${lb}: gia tri khong khop bang («${b}»)`);
	}
	if (bo) for (const l of bo) loi.push(`dong ngoai bon o: ${l}`);
	return loi;
}

const mk = (t) => oNguong(n, t);
const dc = xetMot(
	mk("- Timebox: 2026-11-01\n- Kết quả nào là SỐNG: …\n"),
	mk("- Timebox: 2026-12-01\n- Kết quả nào là SỐNG: [đề xuất] khac bang\n"),
	[
		{
			nhan: "Kết quả nào là SỐNG",
			gia_tri: "dung bang",
			nguon_so: "x",
			can_cu: "y",
		},
	],
	["Timebox", "Kết quả nào là SỐNG"],
	[],
);
if (
	dc.length !== 2 ||
	!dc[0].startsWith("Timebox: doi chu") ||
	!dc[1].includes("khong khop bang")
)
	khongDo(`doi chung duong khong bat (${dc.join("; ")})`);
console.log("doi chung duong: bat doi chu o da co va gia tri lech bang");

let sai = 0;
for (const hs of HS51) {
	const tep = `_acceptance/${hs}/opportunity.md`;
	const cuText = tepGoc(tep);
	const moiText = readFileSync(join(GOC, tep), "utf8");
	const doi = execFileSync("git", ["diff", "-U0", BANG.goc, "--", tep], {
		cwd: GOC,
		encoding: "utf8",
	})
		.split("\n")
		.filter((l) => /^[-+]/.test(l) && !/^(---|\+\+\+) /.test(l));
	const nhanRe = new RegExp(
		`^[-+]- (${nhan.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}):`,
	);
	const vietLai = BANG.viet_lai_khuon.includes(hs);
	const bo = doi.filter(
		(l) =>
			!nhanRe.test(l) &&
			!/^[-+]\s*$/.test(l) &&
			l !== "+## Ngưỡng chết / ngưỡng UAT" &&
			!(vietLai && l.startsWith("-")),
	);
	const loi = xetMot(
		mk(cuText),
		mk(moiText),
		BANG.de_xuat.filter((r) => r.ho_so === hs && r.nhan),
		nhan,
		bo,
	);
	if (loi.length) sai += 1;
	console.log(
		`${loi.length ? "SAI" : "DUNG"} ${hs}${loi.length ? `: ${loi.join("; ")}` : ""}`,
	);
}
console.log(`KET LUAN F39 doi-chieu: ${HS51.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
