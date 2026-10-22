import { describe, expect, test } from "bun:test";
import { LOCALES } from "@crm/ui/lib/locale";
import { LOAI_THONG_BAO } from "@crm/validation/thong-bao";
import {
	KHOA_CHO_TIN_HIEU,
	type KhoaChoTinHieu,
} from "@crm/validation/tin-hieu-cho";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { cauThongBao } from "@/lib/thong-bao/cau";
import { dongTuRa } from "@/lib/thong-bao/dong";
import { nhanCuaCho } from "@/lib/tin-hieu/nhan";
import { docTrangThaiDu } from "@/lib/tin-hieu/trang-thai";
import { MUC_MAU } from "../../agent/test/support/muc-mau";
import { MUC_MAU_TAC_NHAN } from "../../agent/test/support/muc-mau-tac-nhan";
import { MUC_MAU_TIN_HIEU } from "../../agent/test/support/muc-mau-tin-hieu";
import { dungKhoiMau } from "./support/khoi-tin-hieu-mau";

const MAU = { ...MUC_MAU, ...MUC_MAU_TAC_NHAN, ...MUC_MAU_TIN_HIEU };

describe("cau", () => {
	test("cau: moi loai co cau vi va en, khong chua undefined", () => {
		console.log(`cau: so loai ${LOAI_THONG_BAO.length}`);
		expect(Object.keys(MAU).sort()).toEqual([...LOAI_THONG_BAO].sort());
		for (const loai of LOAI_THONG_BAO)
			for (const locale of LOCALES) {
				const cau = cauThongBao(locale, MAU[loai]);
				expect(
					cau.length,
					`loai nhac thieu cau thong bao: ${loai} ${locale}`,
				).toBeGreaterThan(0);
				expect(cau, `cau con cho trong: ${loai} ${locale}`).not.toMatch(
					/\{\w+\}|undefined/,
				);
			}
	});
});

const MA_THEO_KHOA: Record<Exclude<KhoaChoTinHieu, "hang-khac">, string> = {
	"cho-gom": "crm-8",
	le: "crm-6",
	"da-phu": "crm-7",
	"nhom-chua-cat": "crm-5",
	"chan-troi": "crm-4",
	"chua-bat-dau": "crm-1",
	"dang-lam": "crm-2",
	"da-giao": "crm-3",
};

const KHOI_TTTS = dungKhoiMau({
	tinHieu: Object.values(MA_THEO_KHOA).map((ma) => ({ ma })),
	nhom: [1, 2, 3, 4, 5].map((i) => ({
		ma: `n${i}`,
		ten: `Nhóm ${i}`,
		tinHieu: [`crm-${i}`],
	})),
	le: [{ ma: "crm-6", lyDo: "trùng" }],
	daPhu: [{ ma: "crm-7", hoSo: "gui-tin-hieu-trong-crm" }],
	hang: [
		{ ma: "M1", cauGiao: "«Việc một»", phu: ["n1"], trangThai: "chua-bat-dau" },
		{ ma: "M2", cauGiao: "«Việc hai»", phu: ["n2"], trangThai: "dang-lam" },
		{ ma: "M3", cauGiao: "«Việc ba»", phu: ["n3"], trangThai: "da-giao" },
	],
	chanTroi: [{ ma: "C1", lyDo: "chờ", phu: ["n4"] }],
});

describe("ttts-cau", () => {
	const TIEU_DE = `TTTS «dài» ${Date.now()}`;
	const CTX = (locale: (typeof LOCALES)[number]) => ({
		locale,
		slug: "acme",
		now: new Date("2026-10-22T03:00:00Z"),
	});

	test("ttts-cau: nhan trong chuong trung nhan trang Tin hieu da gui cho cung cho", () => {
		const o = KHOA_CHO_TIN_HIEU.length * LOCALES.length;
		console.log(`ttts-cau: ${o} o`);
		expect(o).toBe(18);
		for (const locale of LOCALES) {
			const mTin = tinHieuMessages(locale);
			const trang = docTrangThaiDu(
				{ duLieu: KHOI_TTTS },
				Object.values(MA_THEO_KHOA).map((ma) => ({ ma, daKeoVe: true })),
				mTin,
			);
			for (const khoa of KHOA_CHO_TIN_HIEU) {
				const ma = khoa === "hang-khac" ? null : MA_THEO_KHOA[khoa];
				const nhanTrang = ma
					? trang.trangThai[ma]?.nhan
					: nhanCuaCho(khoa, mTin);
				if (ma)
					expect(trang.trangThai[ma]?.khoa, `kit ve sai cho ${khoa}`).toBe(
						khoa,
					);
				const dong = dongTuRa(
					{
						id: `tb-${khoa}`,
						noiDung: {
							loai: "tin-hieu-doi-cho",
							ma: ma ?? "crm-9",
							tieuDe: TIEU_DE,
							khoa,
							sha: "0b6759dad0000000000000000000000000000000",
						},
						duongDan: "/tin-hieu",
						taoLuc: "2026-10-22T02:59:00Z",
						daDoc: false,
					},
					CTX(locale),
					"gio",
				);
				expect(dong.cau, "nhan trong chuong khac nhan tren trang").toBe(
					dien(thongBaoMessages(locale).cau["tin-hieu-doi-cho"], {
						tieuDe: TIEU_DE,
						nhan: nhanTrang ?? "",
					}),
				);
				expect(dong.khongDich, "tieu de nguoi gui bi dich").toBe(TIEU_DE);
				expect(dong.href).toBe("/acme/tin-hieu");
				expect(
					dong.cau.replace(TIEU_DE, ""),
					"cau may viet mang ma noi bo",
				).not.toMatch(/crm-\d|gom|[0-9a-f]{7,}|\{|undefined/);
			}
		}
	});
});
