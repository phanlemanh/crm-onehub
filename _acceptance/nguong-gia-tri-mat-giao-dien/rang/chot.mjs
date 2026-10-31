import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BANG,
	DE_XUAT,
	GOC,
	HS,
	goiKit,
	khongDo,
	napNguong,
	oNguong,
	tepGoc,
} from "./chung.mjs";

const { n, nhan } = napNguong(goiKit());

export function dongChot(soText) {
	const ra = [];
	for (const l of soText.split("\n")) {
		if (!l.trim()) continue;
		let d;
		try {
			d = JSON.parse(l);
		} catch {
			continue;
		}
		if (d.chot_nguong && d.decided_by?.trim()) ra.push(d);
	}
	return ra;
}

export function daChot(chot, hs) {
	return chot.some(
		(d) =>
			d.chot_nguong.ho_so === "*" || (d.chot_nguong.ho_so ?? []).includes(hs),
	);
}

export function boTienTo(cu, moi, nhanDs) {
	const bo = [];
	for (const lb of nhanDs) {
		const a = cu.get(lb) ?? "";
		const b = moi.get(lb) ?? "";
		const coTruoc = a.startsWith(DE_XUAT);
		if (b && !b.startsWith(DE_XUAT) && (coTruoc || !a || /^…$/.test(a.trim())))
			bo.push(lb);
	}
	return bo;
}

const dc = boTienTo(
	new Map([["Timebox", "[đề xuất] 2026-11-14"]]),
	new Map([["Timebox", "2026-11-14"]]),
	["Timebox"],
);
if (dc.length !== 1 || daChot([], "x"))
	khongDo("doi chung duong: khong bat bo tien to khi chua co dong chot");
console.log(
	"doi chung duong: bat bo tien to [đề xuất] khi so chua co dong chot",
);

const chot = dongChot(readFileSync(join(GOC, HS, "decisions.jsonl"), "utf8"));
let sai = 0;
let soChot = 0;
for (const hs of [...new Set(BANG.de_xuat.map((r) => r.ho_so))].sort()) {
	const tep = `_acceptance/${hs}/opportunity.md`;
	const bo = boTienTo(
		oNguong(n, tepGoc(tep)),
		oNguong(n, readFileSync(join(GOC, tep), "utf8")),
		nhan,
	);
	if (!bo.length) continue;
	soChot += 1;
	if (daChot(chot, hs)) continue;
	sai += 1;
	console.log(
		`SAI ${hs}: bo [đề xuất] o ${bo.join(", ")} ma so chua co dong chot cua nguoi`,
	);
}
console.log(
	`KET LUAN F39 chot: ${soChot} ho so da bo tien to, ${sai} khong co dong chot`,
);
process.exit(sai === 0 ? 0 : 1);
