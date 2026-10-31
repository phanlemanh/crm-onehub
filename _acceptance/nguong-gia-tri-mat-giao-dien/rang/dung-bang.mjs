import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	docRong,
	GOC,
	goiKit,
	HS,
	mucNguong,
	napNguong,
	nhanCuaDong,
	tepGoc,
} from "./chung.mjs";

const TB = "2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)";
const NGAY_CHAY = Date.UTC(2026, 9, 31);
const BA = [
	"Câu hỏi phép đo trả lời",
	"Kết quả nào là SỐNG",
	"Kết quả nào là CHẾT",
];

const { n, nhan } = napNguong(goiKit());
const docJson = (t) =>
	JSON.parse(readFileSync(join(GOC, HS, "rang/nguon", t), "utf8"));
const mayRows = ["aa.json", "ab.json", "ac.json"].flatMap(docJson);
const kitRows = docJson("kit.json");
const cu = JSON.parse(
	readFileSync(join(GOC, HS, "rang/bang-de-xuat.json"), "utf8"),
);
const hs51 = [...new Set(cu.de_xuat.map((r) => r.ho_so))].sort();

const timeboxHong = (v) => {
	const d = n.timeboxDate(`## Ngưỡng chết / ngưỡng UAT\n\n- Timebox: ${v}\n`);
	return d == null || d < NGAY_CHAY;
};

const rows = [];
const vietLai = [];
const kitSinh = [];
for (const hs of hs51) {
	const goc = tepGoc(`_acceptance/${hs}/opportunity.md`);
	const m = mucNguong(goc);
	const lechDong = (l) => {
		if (/^\s+\S/.test(l)) return true;
		const o = /^- /.test(l) ? nhanCuaDong(l, nhan) : null;
		return Boolean(o) && n.bulletOf(l)?.label !== o.nhan;
	};
	const lech = !m || m.muc.some(lechDong);
	if (lech) vietLai.push(hs);
	const rong = docRong(goc, nhan);
	const kit = kitRows.find((r) => r.ho_so === hs);
	if (kit) kitSinh.push(hs);
	const may = mayRows.find((r) => r.ho_so === hs);
	for (const lb of nhan) {
		const o = rong.get(lb);
		const goc1 = { ho_so: hs, nhan: lb };
		if (kit && BA.includes(lb)) {
			rows.push({
				...goc1,
				loai: "thay-de-xuat-kit",
				gia_tri: kit.o[lb],
				de_xuat: true,
				nguon_so: kit.nguon_so,
				can_cu: kit.can_cu,
				cu: o?.gia ?? null,
			});
		} else if (lb === "Timebox" && (!o || timeboxHong(o.gia))) {
			rows.push({
				...goc1,
				loai: o ? "timebox-b7" : "may-soan",
				gia_tri: TB,
				de_xuat: true,
				nguon_so: "Lịch đọc số chung của B7",
				can_cu: o
					? `Hỏi-4: timebox cũ «${o.gia}» đã qua hay không ra ngày`
					: "Ô trống",
				cu: o?.gia ?? null,
			});
		} else if (o) {
			if (lech)
				rows.push({
					...goc1,
					loai: "chuan-hoa",
					gia_tri: o.gia,
					de_xuat: o.tienTo,
					nguon_so: "chữ cũ của hồ sơ",
					can_cu: "Chuẩn hoá khuôn, giữ nguyên chữ và nhãn",
					cu: o.gia,
				});
		} else {
			const v = may?.o?.[lb];
			if (!v) throw new Error(`${hs}: o ${lb} trong ma khong co de xuat`);
			rows.push({
				...goc1,
				loai: "may-soan",
				gia_tri: v,
				de_xuat: true,
				nguon_so: may.nguon_so,
				can_cu: may.can_cu,
				cu: null,
			});
		}
	}
	if (!rows.some((r) => r.ho_so === hs))
		rows.push({ ho_so: hs, nhan: null, loai: "chi-chot" });
}
writeFileSync(
	join(GOC, HS, "rang/bang-de-xuat.json"),
	`${JSON.stringify({ goc: cu.goc, timebox_chung: TB, viet_lai_khuon: vietLai, kit_sinh: kitSinh, hoi: cu.hoi, de_xuat: rows }, null, 1)}\n`,
);
const dem = {};
for (const r of rows) dem[r.loai] = (dem[r.loai] ?? 0) + 1;
console.log(
	JSON.stringify(dem),
	"viet_lai",
	vietLai.length,
	"kit",
	kitSinh.length,
);
