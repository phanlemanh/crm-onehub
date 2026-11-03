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
	docRong,
	tepGoc,
} from "./chung.mjs";
import { daChot, dongChot } from "./mien.mjs";

const { nhan } = napNguong(goiKit());

export function boTienTo(cu, moi, dong, nhanDs) {
	const bo = [];
	for (const lb of nhanDs) {
		const a = cu.get(lb);
		const b = moi.get(lb);
		const r = dong.find((x) => x.nhan === lb);
		const phaiNhan = Boolean(a?.tienTo) || Boolean(r?.de_xuat);
		if (b && phaiNhan && !b.tienTo) bo.push(lb);
	}
	return bo;
}

const dc = boTienTo(
	new Map([["Timebox", { gia: "2026-11-14", tienTo: true }]]),
	new Map([["Timebox", { gia: "2026-11-14", tienTo: false }]]),
	[],
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
		docRong(tepGoc(tep), nhan),
		docRong(readFileSync(join(GOC, tep), "utf8"), nhan),
		BANG.de_xuat.filter((r) => r.ho_so === hs && r.nhan),
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
