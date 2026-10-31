import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BANG,
	docRong,
	GOC,
	goiKit,
	khongDo,
	napNguong,
	nhanCuaDong,
	tepGoc,
} from "./chung.mjs";

const { n, nhan } = napNguong(goiKit());
const HS51 = [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort();
if (HS51.length !== 51)
	khongDo(`bang-de-xuat co ${HS51.length} ho so, mong 51`);

export function xetMot(cu, moi, dong, nhanDs) {
	const loi = [];
	for (const lb of nhanDs) {
		const a = cu.get(lb);
		const b = moi.get(lb);
		const r = dong.find((x) => x.nhan === lb);
		if (!r) {
			if (!a && !b) continue;
			if (!a || !b || a.gia !== b.gia || (b.tienTo && !a.tienTo))
				loi.push(
					`${lb}: o khong co dong bang ma doi («${a?.gia ?? ""}» -> «${b?.gia ?? ""}»)`,
				);
			continue;
		}
		if (r.loai !== "chuan-hoa" && (!r.nguon_so?.trim() || !r.can_cu?.trim()))
			loi.push(`${lb}: dong bang thieu nguon_so hay can_cu`);
		if (
			r.loai === "chuan-hoa" &&
			(!a || a.gia !== r.gia_tri || a.tienTo !== r.de_xuat)
		)
			loi.push(`${lb}: dong chuan-hoa khong dung chu cu cua ho so`);
		if (!b || b.gia !== r.gia_tri)
			loi.push(`${lb}: gia tri khong khop bang («${b?.gia ?? ""}»)`);
		else if (b.tienTo && !r.de_xuat)
			loi.push(`${lb}: gan lai [đề xuất] len o khong de xuat`);
	}
	return loi;
}

const mk = (t) => docRong(`## Ngưỡng chết / ngưỡng UAT\n\n${t}`, nhan);
const dc = xetMot(
	mk("- Timebox: 2026-11-01\n- Kết quả nào là SỐNG:\n  - a\n  - b\n"),
	mk("- Timebox: 2026-12-01\n- Kết quả nào là SỐNG: [đề xuất] a\n"),
	[
		{
			nhan: "Kết quả nào là SỐNG",
			loai: "chuan-hoa",
			gia_tri: "a",
			de_xuat: false,
		},
	],
	["Timebox", "Kết quả nào là SỐNG"],
);
if (dc.length !== 3)
	khongDo(`doi chung duong khong bat du ba loi (${dc.join("; ")})`);
console.log(
	"doi chung duong: bat doi timebox, chuan-hoa mat ve b, gan lai [đề xuất]",
);

const nhanRe = new RegExp(
	`^\\+- (${nhan.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}): `,
);
let sai = 0;
for (const hs of HS51) {
	const tep = `_acceptance/${hs}/opportunity.md`;
	const cuText = tepGoc(tep);
	const moiText = readFileSync(join(GOC, tep), "utf8");
	const dong = BANG.de_xuat.filter((r) => r.ho_so === hs && r.nhan);
	const loi = xetMot(docRong(cuText, nhan), docRong(moiText, nhan), dong, nhan);
	const doi = execFileSync("git", ["diff", "-U0", BANG.goc, "--", tep], {
		cwd: GOC,
		encoding: "utf8",
	})
		.split("\n")
		.filter((l) => /^[-+]/.test(l) && !/^(---|\+\+\+) /.test(l));
	for (const l of doi.filter((x) => x.startsWith("-")))
		if (
			!/^-\s*$/.test(l) &&
			!/^-\s+\S/.test(l) &&
			!nhanCuaDong(l.slice(1), nhan)
		)
			loi.push(`go dong ngoai bon o: ${l.slice(0, 80)}`);
	for (const l of doi.filter((x) => x.startsWith("+")))
		if (
			!nhanRe.test(l) &&
			!/^\+\s*$/.test(l) &&
			l !== "+## Ngưỡng chết / ngưỡng UAT"
		)
			loi.push(`dong them ngoai bon o: ${l.slice(0, 80)}`);
	if (loi.length) sai += 1;
	console.log(
		`${loi.length ? "SAI" : "DUNG"} ${hs}${loi.length ? `: ${loi.join("; ")}` : ""}`,
	);
}
console.log(`KET LUAN F39 doi-chieu: ${HS51.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
