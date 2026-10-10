import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { docDuLieu } from "../lib/lo-trinh/doc-du-lieu.js";
import {
	homNayNguoiXem,
	mocQuaConViec,
	soNgay,
	viecTre,
} from "../lib/lo-trinh/ngay";

const MAU = path.join(import.meta.dir, "fixtures/lo-trinh/LO-TRINH.mau.html");
const kq = phanTichLoTrinh(docDuLieu(readFileSync(MAU, "utf8")).duLieu);
if (!kq.ok) throw new Error(`tep mau hong: ${kq.duongKhoa}`);
const duLieu = kq.duLieu;
type LoMau = (typeof duLieu.lo_trinh)[number];

const NGAY = /^\d{4}-\d{2}-\d{2}$/;

const cong = (ngay: string, n: number) => {
	const [y, m, d] = ngay.split("-").map(Number);
	const t = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, (d ?? 1) + n));
	return t.toISOString().slice(0, 10);
};

const doiChieuTre = (lo: LoMau, D: string) => {
	const ra: string[] = [];
	for (const m of lo.moc)
		if (NGAY.test(m.ngay) && m.ngay < D)
			for (const ma of m.hang) {
				const h = lo.hang.find((x) => x.ma === ma);
				if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma))
					ra.push(ma);
			}
	return ra;
};

describe("ngay", () => {
	test("hom nay theo gio dia phuong quanh nua dem", () => {
		expect(homNayNguoiXem(new Date(2026, 11, 14, 0, 30))).toBe("2026-12-14");
		expect(homNayNguoiXem(new Date(2026, 11, 13, 23, 30))).toBe("2026-12-13");
	});

	test("ma tran moc x ba ngay", () => {
		let so = 0;
		let coTre = 0;
		for (const lo of duLieu.lo_trinh)
			for (const m of lo.moc.filter((x) => NGAY.test(x.ngay)))
				for (const D of [cong(m.ngay, -1), m.ngay, cong(m.ngay, 1)]) {
					expect(mocQuaConViec(m, D)).toBe(m.ngay < D && m.con_viec);
					const tre = viecTre(lo, D);
					expect(tre).toEqual(doiChieuTre(lo, D));
					if (tre.length) coTre++;
					expect(Math.sign(soNgay(m.ngay, D))).toBe(
						m.ngay === D ? 0 : m.ngay < D ? 1 : -1,
					);
					so++;
				}
		expect(so).toBeGreaterThan(0);
		expect(coTre).toBeGreaterThan(0);
	});
});
