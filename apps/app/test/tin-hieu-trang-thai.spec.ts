import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { docTrangThaiTinHieu } from "@/lib/tin-hieu/trang-thai";

const MAU = readFileSync(
	path.join(import.meta.dir, "fixtures", "tin-hieu", "LO-TRINH.mau.html"),
	"utf8",
);
const m = tinHieuMessages("vi");
const KHOI =
	/(<script type="application\/json" id="lo-trinh-du-lieu">)([\s\S]*?)(<\/script>)/;

function khoi(html: string) {
	const k = html.match(KHOI)?.[2];
	if (!k) throw new Error("tệp mẫu không có khối dữ liệu");
	return JSON.parse(k) as {
		tin_hieu: { id: string; cau: string }[];
		lo_trinh: { hang: { ma: string; nhom_trang_thai: string }[] }[];
	};
}

type KhoiSua = {
	tin_hieu?: { id?: string; cau?: string; cau_nguoi_gui?: string }[];
};

function doiKhoi(sua: (o: KhoiSua) => void): string {
	return MAU.replace(KHOI, (_t, a: string, j: string, c: string) => {
		const o: KhoiSua = JSON.parse(j);
		sua(o);
		return a + JSON.stringify(o).replace(/</g, "\\u003c") + c;
	});
}

const CAU = Object.fromEntries(khoi(MAU).tin_hieu.map((t) => [t.id, t.cau]));

const MA_TRAN = [
	{ ma: "crm-1", nhan: m.nhan.choGom, nghia: "nhap" },
	{ ma: "crm-2", nhan: m.nhan.le, nghia: "nhap" },
	{ ma: "crm-3", nhan: m.nhan.daCoViec, nghia: "xong" },
	{ ma: "crm-4", nhan: m.nhan.daVaoNhom, nghia: "nhap" },
	{ ma: "crm-5", nhan: m.nhan.deSau, nghia: "nhap" },
	{ ma: "crm-6", nhan: m.nhan.chuaBatDau, nghia: "nhap" },
	{ ma: "crm-7", nhan: m.nhan.dangLam, nghia: "dangChay" },
	{ ma: "crm-8", nhan: m.nhan.daGiao, nghia: "xong" },
] as const;

const CUA_TOI = [
	...MA_TRAN.map((o) => ({ ma: o.ma, daKeoVe: true })),
	{ ma: "crm-90", daKeoVe: false },
	{ ma: "crm-91", daKeoVe: true },
];

describe("tin-hieu-trang-thai", () => {
	test("ma-tran: moi cho cua kit va hai trang thai CRM ra dung nhan, cau, nghia", () => {
		const kq = docTrangThaiTinHieu(MAU, CUA_TOI, m);
		expect(kq.banVe).toBe("co");
		for (const o of MA_TRAN)
			expect(kq.trangThai[o.ma], `nghia trang thai lech bang ${o.ma}`).toEqual({
				nhan: o.nhan,
				cau: CAU[o.ma] ?? "",
				nghia: o.nghia,
			});
		expect(kq.trangThai["crm-90"]).toEqual({
			nhan: m.nhan.choLayVe,
			cau: m.trangThai.choKeoVe,
			nghia: "nhap",
		});
		expect(kq.trangThai["crm-91"]).toEqual({
			nhan: m.nhan.choGom,
			cau: m.trangThai.choGom,
			nghia: "nhap",
		});
		expect(Object.keys(kq.trangThai)).toHaveLength(CUA_TOI.length);
	});

	test("chi-cua-toi: ket qua chi mang ma cua nguoi xem", () => {
		const kq = docTrangThaiTinHieu(
			MAU,
			[
				{ ma: "crm-1", daKeoVe: true },
				{ ma: "crm-3", daKeoVe: true },
			],
			m,
		);
		expect(
			Object.keys(kq.trangThai).sort(),
			"trang dua tin hieu nguoi khac xuong trinh duyet",
		).toEqual(["crm-1", "crm-3"]);
		expect(JSON.stringify(kq)).not.toContain(CAU["crm-7"] ?? "x");
	});

	test("cau-nguoi-gui: ban ve co cau_nguoi_gui thi nguoi gui doc cau do, vang thi roi ve cau", () => {
		const html = doiKhoi((o) => {
			for (const t of o.tin_hieu ?? [])
				if (t.id === "crm-3") t.cau_nguoi_gui = "Câu viết cho người gửi";
		});
		const kq = docTrangThaiTinHieu(
			html,
			[
				{ ma: "crm-1", daKeoVe: true },
				{ ma: "crm-3", daKeoVe: true },
			],
			m,
		);
		expect(kq.banVe).toBe("co");
		expect(kq.trangThai["crm-3"]?.cau).toBe("Câu viết cho người gửi");
		expect(kq.trangThai["crm-1"]?.cau).toBe(CAU["crm-1"] ?? "");
	});

	test("khoan-dung: nam ca ban ve ra trang thai luc gui, phan biet hong voi khong co", () => {
		const ca = {
			vang: [null, "vang"],
			"khong-khoi": [MAU.replace(KHOI, ""), "khong-co-danh-sach"],
			"hong-json": [MAU.replace(KHOI, "$1{khong-phai-json$3"), "hong"],
			"khong-khoa": [doiKhoi((o) => delete o.tin_hieu), "khong-co-danh-sach"],
			"ban-ghi-hong": [
				doiKhoi((o) => {
					delete o.tin_hieu?.[0]?.cau;
				}),
				"hong",
			],
		} as const;
		for (const [ten, [html, banVe]] of Object.entries(ca)) {
			const kq = docTrangThaiTinHieu(html, CUA_TOI, m);
			expect(kq.banVe, `ban ghi hong bi coi la khong co: ${ten}`).toBe(banVe);
			for (const { ma, daKeoVe } of CUA_TOI)
				expect(kq.trangThai[ma]?.cau, `${ten} ${ma}`).toBe(
					daKeoVe ? m.trangThai.choGom : m.trangThai.choKeoVe,
				);
		}
	});
});
