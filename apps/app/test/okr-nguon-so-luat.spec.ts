import { describe, expect, test } from "bun:test";
import type { KetQua } from "@/app/(app)/[slug]/okr/kieu";
import {
	type ChoDoc,
	type NhapNguon,
	nguonDaDoi,
	nhapNguonDau,
	trangThaiDoc,
} from "@/app/(app)/[slug]/okr/nguon-so-luat";
import { OKR_SO_MAN } from "@/lib/okr-so-man";

const SHEET_ID = "1AbCdEf_gh-IJ";
const O = "Tổng!B2";
const T1 = "2026-10-05T02:12:00.000Z";
const T2 = "2026-10-05T02:15:00.000Z";
const MO = Date.parse("2026-10-05T02:10:00.000Z");

type NguonMay = NonNullable<KetQua["nguonMay"]>;

const NGUON_SHEETS: NguonMay = {
	loai: "bang-tinh",
	chiSo: null,
	phamVi: null,
	bac: null,
	sheetId: SHEET_ID,
	sheetO: O,
	docLuc: null,
	docGiaTri: null,
	docLoi: null,
};

const NGUON_CRM: NguonMay = {
	...NGUON_SHEETS,
	loai: "crm",
	chiSo: "thoa-thuan-chot-duoc",
	phamVi: { kieu: "phong-ban", id: "pb-1" },
	sheetId: null,
	sheetO: null,
};

function kr(nguonMay: NguonMay | null, source: KetQua["source"]): KetQua {
	return {
		id: "kr-1",
		objectiveId: "mt-1",
		title: "KR",
		kind: "tang-toi",
		owner: { id: "hung", name: "Hùng", email: "hung@onehub.vn" },
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "khách",
		dueOn: null,
		weight: 1,
		source,
		doCanh: false,
		soMay: null,
		nguonMay,
		startLocked: false,
		progress: 0,
		laCuaToi: true,
		hienTaiQuaCapNhat: false,
	};
}

const MUC_TIEU = {
	cycleId: "q4",
	status: "nhap",
	level: "phong-ban",
	unitId: "pb-1",
} as const;

const sheets = (thay: Partial<NguonMay>) =>
	kr({ ...NGUON_SHEETS, ...thay }, "bang-tinh");
const gia = (k: KetQua): NhapNguon => nhapNguonDau(k, MUC_TIEU);
const moiMo: ChoDoc = { docTruoc: undefined, tu: MO };
const giay = (s: number) => MO + s * 1000;

describe("trangThaiDoc", () => {
	test("cho → doc duoc → loi → Doc lai → doc duoc", () => {
		const cho = sheets({});
		const duoc = sheets({ docLuc: T1, docGiaTri: 1240 });
		const loi = sheets({ docLuc: T1, docLoi: "chua-chia-se" });
		const sauDocLai: ChoDoc = { docTruoc: T1, tu: giay(60) };
		const docLaiDuoc = sheets({ docLuc: T2, docGiaTri: 1300 });
		expect([
			trangThaiDoc(cho, gia(cho), moiMo, giay(3)),
			trangThaiDoc(duoc, gia(duoc), moiMo, giay(6)),
			trangThaiDoc(loi, gia(loi), moiMo, giay(9)),
			trangThaiDoc(loi, gia(loi), sauDocLai, giay(63)),
			trangThaiDoc(docLaiDuoc, gia(docLaiDuoc), sauDocLai, giay(66)),
		]).toEqual([
			{ loai: "dang-doc" },
			{ loai: "doc-duoc", giaTri: 1240, luc: T1 },
			{ loai: "loi", lyDo: "chua-chia-se" },
			{ loai: "dang-doc" },
			{ loai: "doc-duoc", giaTri: 1300, luc: T2 },
		]);
	});

	test("doi duong dan hay o thi bo trang thai doc", () => {
		const k = sheets({ docLuc: T1, docGiaTri: 1240 });
		const doiUrl = {
			...gia(k),
			url: "https://docs.google.com/spreadsheets/d/khac",
		};
		const doiO = { ...gia(k), o: "B3" };
		expect({
			url: trangThaiDoc(k, doiUrl, moiMo, giay(1)),
			o: trangThaiDoc(k, doiO, moiMo, giay(1)),
			chonNguonKhac: trangThaiDoc(
				k,
				{ ...gia(k), loai: "api" },
				moiMo,
				giay(1),
			),
		}).toEqual({ url: null, o: null, chonNguonKhac: null });
	});

	test("qua tran cho thi thoi cho, duoi tran van dang doc", () => {
		const k = sheets({});
		const tran = OKR_SO_MAN.docThuToiDaMs;
		const docLai: ChoDoc = { docTruoc: T1, tu: MO };
		const vanCu = sheets({ docLuc: T1, docLoi: "google-loi" });
		expect({
			duoi: trangThaiDoc(k, gia(k), moiMo, MO + tran - 1),
			tran: trangThaiDoc(k, gia(k), moiMo, MO + tran),
			docLaiQuaTran: trangThaiDoc(vanCu, gia(vanCu), docLai, MO + tran + 1),
		}).toEqual({
			duoi: { loai: "dang-doc" },
			tran: { loai: "qua-han" },
			docLaiQuaTran: { loai: "qua-han" },
		});
	});

	test("KR khong phai Sheets khong co trang thai doc", () => {
		const k = kr(NGUON_CRM, "crm");
		expect(trangThaiDoc(k, gia(k), moiMo, giay(1))).toBeNull();
	});
});

describe("nguonDaDoi", () => {
	test("so voi nguon da luu", () => {
		const tay = kr(null, "tay");
		const crm = kr(NGUON_CRM, "crm");
		const k = sheets({ docLuc: T1, docGiaTri: 1240 });
		expect({
			tayGiu: nguonDaDoi(tay, gia(tay)),
			tayDoiCrm: nguonDaDoi(tay, { ...gia(tay), loai: "crm" }),
			crmGiu: nguonDaDoi(crm, gia(crm)),
			crmDoiPhamVi: nguonDaDoi(crm, { ...gia(crm), idPhamVi: "pb-2" }),
			crmDoiChiSo: nguonDaDoi(crm, { ...gia(crm), chiSo: "thoa-thuan-moi" }),
			sheetsGiu: nguonDaDoi(k, gia(k)),
			sheetsDoiUrl: nguonDaDoi(k, {
				...gia(k),
				url: "https://docs.google.com/spreadsheets/d/khac/edit",
			}),
			krMoiTay: nguonDaDoi(null, gia(tay)),
		}).toEqual({
			tayGiu: false,
			tayDoiCrm: true,
			crmGiu: false,
			crmDoiPhamVi: true,
			crmDoiChiSo: true,
			sheetsGiu: false,
			sheetsDoiUrl: true,
			krMoiTay: false,
		});
	});
});
