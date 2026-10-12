import { describe, expect, test } from "bun:test";
import {
	bocPhanHoiKeoVe,
	docPhanHoiKeoVe,
	dungNoiDung,
	idTep,
	lamSachMan,
	parseDuongTinHieu,
	TIN_HIEU,
	tepTinHieu,
	tepTuBanGhi,
	vietTep,
} from "../src/tin-hieu";

const BAN_GHI = {
	tieuDe: "Mở cập nhật KR không thấy số tuần trước",
	muonLam: "Cập nhật số tuần này cho KR",
	daXayRa: "Mở cập nhật KR không thấy số tuần trước",
	man: "/okr/kr",
	guiLuc: new Date("2026-10-15T03:00:00.000Z"),
};

const DUONG = {
	id: "crm-1",
	loai: "tin-hieu",
	tieu_de: "a",
	luc: "2026-10-15T03:00:00.000Z",
	cho: "chua-gom",
	nhom: null,
	ten_nhom: null,
	ly_do: null,
	ho_so_phu: null,
	hang: null,
	ho_so: null,
	trang_thai: null,
	cau: "chưa gom — tín hiệu tới sau lượt gom gần nhất",
};

describe("gth-khuon", () => {
	test("dungNoiDung lay dong dau khac rong cua daXayRa, giu nguyen van hai o", () => {
		const nd = dungNoiDung({
			muonLam: "  cap nhat KR  ",
			daXayRa: "\n\n  dong mot  \ndong hai",
		});
		expect(nd).toEqual({
			tieuDe: "dong mot",
			muonLam: "cap nhat KR",
			daXayRa: "dong mot  \ndong hai",
		});
	});

	test("dungNoiDung cat tieu de dung TIN_HIEU.doDaiTieuDe them dau ba cham", () => {
		const nd = dungNoiDung({ muonLam: "x", daXayRa: "a".repeat(300) });
		expect(nd.tieuDe).toBe(`${"a".repeat(TIN_HIEU.doDaiTieuDe)}…`);
	});

	test("lamSachMan bo truy van va neo, cat do dai, rong thanh /", () => {
		expect(lamSachMan("/okr/kr?x=1#a")).toBe("/okr/kr");
		expect(lamSachMan("/okr#a?x")).toBe("/okr");
		expect(lamSachMan(`/${"b".repeat(400)}`)).toHaveLength(TIN_HIEU.doDaiMan);
		expect(lamSachMan("")).toBe("/");
	});

	test("idTep theo khuon phien-so", () => {
		expect(idTep(12)).toBe("crm-12");
	});

	test("vietTep(tepTuBanGhi) di vong qua khuon, thu tu khoa co dinh, xuong dong cuoi", () => {
		const chu = vietTep(tepTuBanGhi(BAN_GHI));
		expect(chu.endsWith("}\n")).toBe(true);
		const doc = JSON.parse(chu);
		expect(tepTinHieu.parse(doc)).toEqual(doc);
		expect(Object.keys(doc)).toEqual([
			"phien",
			"loai",
			"hang",
			"noi_dung",
			"luc",
		]);
		expect(Object.keys(doc.noi_dung)).toEqual([
			"tieu_de",
			"muon_lam",
			"da_xay_ra",
			"man",
		]);
		expect(doc.luc).toBe("2026-10-15T03:00:00.000Z");
	});

	test("docPhanHoiKeoVe doc dung vo REST cua trpc tu ham boc", () => {
		const ds = [
			{ id: "crm-1", tep: tepTuBanGhi(BAN_GHI), phongBan: "Kinh doanh" },
		];
		const than = JSON.parse(
			JSON.stringify({ result: { data: bocPhanHoiKeoVe(ds) } }),
		);
		expect(docPhanHoiKeoVe(than)).toEqual(ds);
	});

	test("docPhanHoiKeoVe gap mang tran thi nem thong diep ghim", () => {
		const ds = [{ id: "crm-1", tep: tepTuBanGhi(BAN_GHI), phongBan: null }];
		expect(() => docPhanHoiKeoVe(JSON.parse(JSON.stringify(ds)))).toThrow(
			"lệnh kéo về lệch vỏ phản hồi REST",
		);
	});

	test("parseDuongTinHieu phan biet khong co, co, hong", () => {
		expect(parseDuongTinHieu(undefined)).toEqual({ kieu: "khong-co" });
		expect(parseDuongTinHieu([DUONG])).toEqual({ kieu: "co", banGhi: [DUONG] });
		const { cau: _bo, ...thieu } = DUONG;
		const hong = parseDuongTinHieu([thieu]);
		expect(hong.kieu, "ban ghi hong bi coi la khong co").toBe("hong");
	});
});
