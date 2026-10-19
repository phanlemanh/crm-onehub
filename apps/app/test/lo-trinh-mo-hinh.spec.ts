import { describe, expect, test } from "bun:test";
import {
	BAN_CHUP_LO_TRINH,
	banChupVao,
} from "@crm/validation/ban-chup-lo-trinh";
import type { DuLieuChoXem } from "@crm/validation/lo-trinh-du-lieu";
import { phangViec } from "@/components/lo-trinh/viec";
import type { BanDung } from "@/lib/lo-trinh/chon-nguon";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu.js";
import {
	type DauVaoLoTrinh,
	docDauVaoChoVai,
	docTrangLoTrinh,
	ketQuaTuHang,
} from "@/lib/lo-trinh/doc-trang";
import { moHinhCua } from "@/lib/lo-trinh/mo-hinh";
import {
	datLech,
	HTML_KHOI_CU,
	HTML_THAT,
	htmlTuKhoi,
	type KhoiTho,
	khoiTho,
	mocDauLuatCu,
} from "./lo-trinh-mo-hinh-mau";

type HamPhang = typeof phangViec;

function duLieu(html: string): DuLieuChoXem {
	const dv = docTrangLoTrinh(html);
	if (dv.kieu !== "co-du-lieu") throw new Error(`khong doc duoc: ${dv.kieu}`);
	return dv.duLieu;
}

const mocTheoKhoa = (o: KhoiTho, tep: string, ma: string) =>
	o.lo_trinh
		.find((lo) => lo.tep === tep)
		?.moc.find((m) => (m.viec_hien ?? []).includes(ma)) ?? null;

function kiemViecMoc(ham: HamPhang): number {
	const o = khoiTho();
	const lech = datLech(o);
	const viec = ham(duLieu(htmlTuKhoi(o)), null);
	const cua = (ma: string) =>
		viec.find((v) => v.loTep === lech.tep && v.ma === ma);
	if (cua(lech.x)?.moc?.ten !== lech.b.ten)
		throw new Error(`viec theo luat cu, khong theo viec_hien: ${lech.x}`);
	if (cua(lech.y)?.moc !== null)
		throw new Error(`viec theo luat cu, khong theo viec_hien: ${lech.y}`);
	let dem = 0;
	for (const v of viec) {
		const ky = mocTheoKhoa(o, v.loTep, v.ma);
		if ((v.moc?.ten ?? null) !== (ky?.ten ?? null))
			throw new Error(`viec theo luat cu, khong theo viec_hien: ${v.ma}`);
		dem++;
	}
	return dem;
}

describe("ltmh-viec-moc", () => {
	test("ltmh-viec-moc: moc cua viec theo viec_hien khi khoa lech luat cu", () => {
		const dem = kiemViecMoc(phangViec);
		console.log(`viec-moc: ${dem} viec theo khoa`);
		expect(dem).toBeGreaterThan(0);
	});
	test("ltmh-viec-moc: doi chung — khoi chua sua, luat cu va khoa trung nhau", () => {
		const o = khoiTho();
		for (const lo of o.lo_trinh)
			for (const h of lo.hang)
				expect(mocTheoKhoa(o, lo.tep, h.ma)?.ten ?? null).toBe(
					mocDauLuatCu(lo, h.ma)?.ten ?? null,
				);
	});
	test("ltmh-viec-moc: pha-thu — ban sao dung luat moc dau tien thi do", () => {
		const hong: HamPhang = (d, h) =>
			phangViec(
				{
					...d,
					lo_trinh: d.lo_trinh.map((lo) => ({
						...lo,
						moc: lo.moc.map((m) => ({ ...m, hien: null })),
					})),
				},
				h,
			);
		expect(() => kiemViecMoc(hong)).toThrow(
			"viec theo luat cu, khong theo viec_hien",
		);
	});
});

const SHA = "e".repeat(40);
const BAN_DUNG: BanDung = {
	sha: SHA,
	dungLuc: "2026-10-19T08:00:00.000Z",
	moiTruong: "production",
};

function hangLuu(html: string) {
	const { duLieu: d, canhBao } = docDuLieu(html);
	const vao = banChupVao.parse({
		nguon: BAN_CHUP_LO_TRINH.nguonCrm,
		sha: SHA,
		commitLuc: "2026-10-19T08:00:00.000Z",
		duLieu: d,
		canhBao,
	});
	const luu = JSON.parse(
		JSON.stringify({ duLieu: vao.duLieu, canhBao: vao.canhBao }),
	);
	return {
		sha: vao.sha,
		commitLuc: new Date(vao.commitLuc),
		layLuc: new Date("2026-10-19T08:05:00.000Z"),
		duLieu: luu.duLieu,
		canhBao: luu.canhBao,
	};
}

export async function quaBanChup(html: string): Promise<DauVaoLoTrinh> {
	return docDauVaoChoVai("owner", {
		docBanChup: async () => ketQuaTuHang(hangLuu(html)),
		docBanDung: async () => docTrangLoTrinh(HTML_THAT),
		banDung: BAN_DUNG,
		ghiCanhBao: () => {},
	});
}

const CAU_MO_HINH = "khối chưa mang mô hình hiển thị";

function kiemLuatCu(
	d: DuLieuChoXem,
	ham: typeof moHinhCua,
	nhan = "khoi cu",
): number {
	const o = khoiTho(HTML_KHOI_CU);
	let dem = 0;
	for (const lo of d.lo_trinh) {
		const mh = ham(lo);
		const tho = o.lo_trinh.find((x) => x.tep === lo.tep);
		if (!tho) throw new Error(`thieu lo trinh ${lo.tep}`);
		for (const h of lo.hang) {
			const ky = mocDauLuatCu(tho, h.ma)?.ten ?? null;
			if ((mh.mocCuaMa.get(h.ma)?.ten ?? null) !== ky)
				throw new Error(`${nhan} mat moc: ${h.ma}`);
			dem++;
		}
	}
	return dem;
}

type HamDocTrang = typeof docTrangLoTrinh;

function kiemKhongCanhBao(ham: HamDocTrang): void {
	const dv = ham(HTML_KHOI_CU);
	if (dv.kieu !== "co-du-lieu") throw new Error(`khong doc duoc: ${dv.kieu}`);
	if (dv.canhBao.length > 0)
		throw new Error("hop canh bao bat vi khoi thieu mo hinh");
}

const boNhanhKhoiCu: typeof moHinhCua = (lo) =>
	moHinhCua({
		...lo,
		moc: lo.moc.map((m) => ({ ...m, hien: m.hien ?? false, con_lai: 0 })),
		hang: lo.hang.map((h) => ({ ...h, ten_hien_thi: h.cau_giao })),
	});

describe("ltmh-khoi-cu", () => {
	test("ltmh-khoi-cu: trang doi truoc khong bat hop canh bao vi thieu mo hinh", () => {
		expect(
			docDuLieu(HTML_KHOI_CU).canhBao.some((c) => c.includes(CAU_MO_HINH)),
		).toBe(true);
		expect(() => kiemKhongCanhBao(docTrangLoTrinh)).not.toThrow();
	});
	test("ltmh-khoi-cu: khoi doi truoc giu luat moc dau tien", () => {
		const d = duLieu(HTML_KHOI_CU);
		for (const lo of d.lo_trinh) expect(moHinhCua(lo).coMoHinh).toBe(false);
		const dem = kiemLuatCu(d, moHinhCua);
		console.log(`khoi-cu: ${dem} viec theo luat cu`);
		expect(dem).toBeGreaterThan(0);
	});
	test("ltmh-khoi-cu: ban chup moi qua cot Json giu nam khoa", async () => {
		const dv = await quaBanChup(HTML_THAT);
		if (dv.kieu !== "co-du-lieu") throw new Error(`khong doc duoc: ${dv.kieu}`);
		expect(dv.nguon?.kieu).toBe("ban-chup");
		const tho = khoiTho();
		for (const lo of dv.duLieu.lo_trinh) {
			const t = tho.lo_trinh.find((x) => x.tep === lo.tep);
			expect(lo.chua_hen_moc).toEqual(t?.chua_hen_moc ?? []);
			expect(lo.hang.map((h) => h.ten_hien_thi)).toEqual(
				t?.hang.map((h) => h.ten_hien_thi) ?? [],
			);
			expect(lo.moc.map((m) => [m.hien, m.viec_hien, m.con_lai])).toEqual(
				t?.moc.map((m) => [m.hien, m.viec_hien, m.con_lai]) ?? [],
			);
			expect(moHinhCua(lo).coMoHinh).toBe(true);
		}
	});
	test("ltmh-khoi-cu: ban chup cu qua cot Json giu luat cu", async () => {
		const dv = await quaBanChup(HTML_KHOI_CU);
		if (dv.kieu !== "co-du-lieu") throw new Error(`khong doc duoc: ${dv.kieu}`);
		expect(dv.nguon?.kieu).toBe("ban-chup");
		expect(dv.canhBao, "hop canh bao bat vi khoi thieu mo hinh").toEqual([]);
		for (const lo of dv.duLieu.lo_trinh)
			expect(moHinhCua(lo).coMoHinh).toBe(false);
		expect(kiemLuatCu(dv.duLieu, moHinhCua, "ban chup cu")).toBeGreaterThan(0);
	});
	test("ltmh-khoi-cu: pha-thu — ban sao khong go cau mo hinh thi do", () => {
		const hong: HamDocTrang = (html) => {
			const dv = docTrangLoTrinh(html);
			return dv.kieu === "co-du-lieu"
				? { ...dv, canhBao: docDuLieu(html).canhBao }
				: dv;
		};
		expect(() => kiemKhongCanhBao(hong)).toThrow(
			"hop canh bao bat vi khoi thieu mo hinh",
		);
	});
	test("ltmh-khoi-cu: pha-thu — ban sao bo nhanh khoi cu thi do", async () => {
		expect(() => kiemLuatCu(duLieu(HTML_KHOI_CU), boNhanhKhoiCu)).toThrow(
			"khoi cu mat moc",
		);
		const dv = await quaBanChup(HTML_KHOI_CU);
		if (dv.kieu !== "co-du-lieu") throw new Error(dv.kieu);
		expect(() => kiemLuatCu(dv.duLieu, boNhanhKhoiCu, "ban chup cu")).toThrow(
			"ban chup cu mat moc",
		);
	});
});
