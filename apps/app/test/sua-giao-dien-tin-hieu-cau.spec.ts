import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { NHOM_TRANG_THAI } from "@crm/validation/lo-trinh-du-lieu";
import { CHO_TIN_HIEU } from "@crm/validation/tin-hieu";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { docTrangThaiTinHieu } from "@/lib/tin-hieu/trang-thai";

const MAU = readFileSync(
	path.join(import.meta.dir, "fixtures", "tin-hieu", "LO-TRINH.mau.html"),
	"utf8",
);
const KHOI =
	/(<script type="application\/json" id="lo-trinh-du-lieu">)([\s\S]*?)(<\/script>)/;

type BanGhi = {
	id: string;
	cho: string;
	ten_nhom: string | null;
	ly_do: string | null;
	hang: string | null;
	cau: string;
	cau_nguoi_gui?: string;
};
type Khoi = {
	tin_hieu: BanGhi[];
	lo_trinh: {
		hang: { ma: string; cau_giao: string; nhom_trang_thai: string }[];
	}[];
};

function docKhoi(html: string): Khoi {
	const k = html.match(KHOI)?.[2];
	if (!k) throw new Error("tệp mẫu không có khối dữ liệu");
	return JSON.parse(k) as Khoi;
}

function doiKhoi(sua: (o: Khoi) => void): string {
	return MAU.replace(KHOI, (_t, a: string, j: string, c: string) => {
		const o = JSON.parse(j) as Khoi;
		sua(o);
		return a + JSON.stringify(o).replace(/</g, "\\u003c") + c;
	});
}

const GOC = docKhoi(MAU);
const CO_DAU =
	/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const HANG_CHO = ["hang-chua-ho-so", "hang-co-ho-so"] as const;

function mau(cho: string): BanGhi {
	const b = GOC.tin_hieu.find((t) => t.cho === cho);
	if (b) return b;
	const h = GOC.tin_hieu.find((t) => t.cho.startsWith("hang-"));
	if (!h) throw new Error(`tệp mẫu không có bản ghi cho ${cho}`);
	return { ...h, cho };
}

function tenViec(ma: string | null): string {
	for (const lo of GOC.lo_trinh)
		for (const h of lo.hang) if (h.ma === ma) return h.cau_giao;
	throw new Error(`không có hàng ${ma}`);
}

function cauMong(b: BanGhi, nhom: string | null, locale: "vi" | "en") {
	const m = tinHieuMessages(locale);
	const c = m.cauSauGom;
	switch (b.cho) {
		case "chua-gom":
			return { cau: c.chuaGom, duLieu: [] };
		case "le":
			return {
				cau: dien(c.le, { lyDo: b.ly_do ?? "" }),
				duLieu: [b.ly_do ?? ""],
			};
		case "da-phu":
			return { cau: c.daPhu, duLieu: [] };
		case "nhom-chua-cat":
			return {
				cau: dien(c.nhomChuaCat, { tenNhom: b.ten_nhom ?? "" }),
				duLieu: [b.ten_nhom ?? ""],
			};
		case "chan-troi":
			return {
				cau: dien(c.chanTroi, {
					tenNhom: b.ten_nhom ?? "",
					lyDo: b.ly_do ?? "",
				}),
				duLieu: [b.ten_nhom ?? "", b.ly_do ?? ""],
			};
		default: {
			const nhan =
				nhom === "da-giao"
					? m.nhan.daGiao
					: nhom === "dang-lam"
						? m.nhan.dangLam
						: nhom === "chua-bat-dau"
							? m.nhan.chuaBatDau
							: m.nhan.khac;
			const ten = tenViec(b.hang);
			return {
				cau: dien(c.hang, { tenViec: ten, trangThai: nhan }),
				duLieu: [ten],
			};
		}
	}
}

describe("sgt-cau-sau-gom", () => {
	test("sgt-cau-sau-gom: moi cho cua kit x moi nhom trang thai x hai ngon ngu", () => {
		const loi: string[] = [];
		const thuong = CHO_TIN_HIEU.filter((c) => !c.startsWith("hang-"));
		let so = 0;
		for (const locale of ["vi", "en"] as const) {
			const m = tinHieuMessages(locale);
			const o: { cho: string; nhom: string | null }[] = [
				...thuong.map((cho) => ({ cho, nhom: null })),
				...HANG_CHO.flatMap((cho) =>
					NHOM_TRANG_THAI.map((nhom) => ({ cho, nhom })),
				),
			];
			for (const { cho, nhom } of o) {
				so += 1;
				const b = mau(cho);
				const html = doiKhoi((k) => {
					k.tin_hieu = [{ ...b, id: "crm-50", cho }];
					if (nhom)
						for (const lo of k.lo_trinh)
							for (const h of lo.hang)
								if (h.ma === b.hang) h.nhom_trang_thai = nhom;
				});
				const kq = docTrangThaiTinHieu(
					html,
					[{ ma: "crm-50", daKeoVe: true }],
					m,
				);
				const tt = kq.trangThai["crm-50"];
				const mong = cauMong({ ...b, cho }, nhom, locale);
				const nhan = `${cho}${nhom ? `/${nhom}` : ""} (${locale})`;
				if (kq.banVe !== "co") loi.push(`${nhan}: ban ve khong doc duoc`);
				if (tt?.cau === (b.cau_nguoi_gui ?? b.cau))
					loi.push(`${nhan}: cau sau gom chi co tieng Viet`);
				if (tt?.cau !== mong.cau)
					loi.push(`${nhan}: cau lech «${tt?.cau}» != «${mong.cau}»`);
				for (const d of mong.duLieu)
					if (!tt?.cau.includes(d))
						loi.push(`${nhan}: mat chu nguoi viet «${d}»`);
				if (locale === "en") {
					let khung = tt?.cau ?? "";
					for (const d of mong.duLieu) khung = khung.replace(d, "");
					if (CO_DAU.test(khung))
						loi.push(`${nhan}: cau tieng Anh con chu Viet «${khung}»`);
				}
			}
		}
		expect(loi).toEqual([]);
		console.log(
			`sgt-cau-sau-gom: (${CHO_TIN_HIEU.length - HANG_CHO.length} cho thuong + ${HANG_CHO.length} x ${NHOM_TRANG_THAI.length}) x 2 = ${so} o`,
		);
	});

	test("sgt-cau-sau-gom: lui — thieu ten nhom ra cau kit; cho la khong vo trang", () => {
		const m = tinHieuMessages("en");
		const b = mau("nhom-chua-cat");
		const thieu = doiKhoi((k) => {
			k.tin_hieu = [{ ...b, id: "crm-51", ten_nhom: null }];
		});
		const kq1 = docTrangThaiTinHieu(
			thieu,
			[{ ma: "crm-51", daKeoVe: true }],
			m,
		);
		expect(kq1.trangThai["crm-51"]?.cau).toBe(b.cau_nguoi_gui ?? b.cau);
		const la = doiKhoi((k) => {
			k.tin_hieu = [{ ...b, id: "crm-52", cho: "cho-moi-chua-biet" }];
		});
		const kq2 = docTrangThaiTinHieu(la, [{ ma: "crm-52", daKeoVe: true }], m);
		expect(kq2.banVe, "ma cho la lam vo cau trang thai").not.toBe("co");
		expect(kq2.trangThai["crm-52"]?.cau).toBe(m.trangThai.choGom);
		console.log("sgt-cau-sau-gom: 2 o lui");
	});
});
