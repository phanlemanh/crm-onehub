import { describe, expect, test } from "bun:test";
import { kiemBanMay } from "../src/tai-lieu-so";
import type { TrichDoan } from "../src/tai-lieu-trich-doan";

const NBSP = String.fromCodePoint(0xa0);

const CHU_NGUON = [
	"Điều 5. Hoa hồng",
	"Mức hoa hồng cho hợp đồng mới là 1,5% giá trị hợp đồng, áp dụng từ ngày 01/10/2026.",
	"Nhân viên đạt “Hạng Vàng” được hưởng thêm 2,0% trên doanh số vượt chỉ tiêu.",
	"Quy định này thay thế quyết định hòa giải số 12 về mức thưởng 12% cũ.",
	`Mức trần hoa hồng là 11,5${NBSP}triệu đồng mỗi tháng.`,
].join("\n");

const BAN_GOC = "## Điều 5. Hoa hồng\n\nThời gian thử việc là 48 ngày.";

const TRICH_MUC = {
	menhDe: "Mức hoa hồng là 1,5% từ 01/10/2026",
	trich:
		"Mức hoa hồng cho hợp đồng mới là 1,5% giá trị hợp đồng, áp dụng từ ngày 01/10/2026",
} satisfies TrichDoan;

function kiem(
	noiDung: string,
	trichDoan: TrichDoan[],
	banGoc: string | null = BAN_GOC,
) {
	return kiemBanMay({ noiDung, trichDoan, chuNguon: CHU_NGUON, banGoc });
}

function loiCua(ketQua: ReturnType<typeof kiemBanMay>) {
	return ketQua.ok ? [] : ketQua.loi;
}

describe("kiemBanMay — E9", () => {
	test("dat", () => {
		const ketQua = kiem(
			"## Điều 5. Hoa hồng\n\nMức hoa hồng là 1,5% giá trị hợp đồng.",
			[TRICH_MUC],
		);
		expect(ketQua, "bac oan: dat").toEqual({ ok: true });
	});

	test("so moi khong trich: 2,0%", () => {
		const ketQua = kiem(
			"## Điều 5. Hoa hồng\n\nMức hoa hồng là 1,5%.\n\nHạng Vàng được thêm 2,0%.",
			[TRICH_MUC],
		);
		expect(loiCua(ketQua), "lot so moi: 2,0%").toContainEqual({
			loai: "so-khong-trich",
			chi: "2,0%",
		});
	});

	test("trich khong co trong nguon: tầng 4 là 2%", () => {
		const ketQua = kiem("Hoa hồng tầng 4 là 2%.", [
			{ menhDe: "Tầng 4 hưởng 2%", trich: "tầng 4 là 2%" },
		]);
		expect(loiCua(ketQua), "lot trich bia: tầng 4 là 2%").toContainEqual({
			loai: "trich-khong-co",
			chi: "tầng 4 là 2%",
		});
	});

	test("dau thanh: hoà vs hòa", () => {
		const ketQua = kiem("Thay thế quyết định hoà giải số 12.", [
			{
				menhDe: "Thay quyết định số 12",
				trich: "thay thế quyết định hoà giải số 12",
			},
		]);
		expect(ketQua, "bac oan: dau-thanh").toEqual({ ok: true });
	});

	test("nbsp", () => {
		const ketQua = kiem("Mức trần là 11,5 triệu đồng mỗi tháng.", [
			{
				menhDe: "Trần 11,5 triệu",
				trich: "Mức trần hoa hồng là 11,5 triệu đồng",
			},
		]);
		expect(ketQua, "bac oan: nbsp").toEqual({ ok: true });
	});

	test("nhay cong va thang", () => {
		const ketQua = kiem("Hạng Vàng được thêm 2,0%.", [
			{
				menhDe: "Hạng Vàng thêm 2,0%",
				trich: 'Nhân viên đạt "Hạng Vàng" được hưởng thêm 2,0%',
			},
		]);
		expect(ketQua, "bac oan: nhay").toEqual({ ok: true });
	});

	test("ngay 01/10/2026 va 1,5% co trich", () => {
		const ketQua = kiem("Từ ngày 01/10/2026, mức hoa hồng là 1,5%.", [
			TRICH_MUC,
		]);
		expect(ketQua, "bac oan: ngay-va-phan-tram").toEqual({ ok: true });
	});

	test("so 48 da co trong ban goc", () => {
		const ketQua = kiem("Thời gian thử việc là 48 ngày.", []);
		expect(ketQua, "bac oan: so-cu").toEqual({ ok: true });
	});

	test("so thu tu danh sach", () => {
		const ketQua = kiem(
			"1. Nộp hồ sơ\n2. Duyệt hồ sơ\n3. Ký hợp đồng",
			[],
			null,
		);
		expect(ketQua, "bac oan: so-thu-tu").toEqual({ ok: true });
	});

	test("bien so: 20% khong nho 01/10/2026", () => {
		const ketQua = kiem("Thưởng 20% từ 01/10/2026.", [
			{ menhDe: "Áp dụng từ 01/10/2026", trich: "áp dụng từ ngày 01/10/2026" },
		]);
		expect(loiCua(ketQua), "so khop mot phan: 20%").toContainEqual({
			loai: "so-khong-trich",
			chi: "20%",
		});
	});

	test("bien so: 2% khong nho 12%", () => {
		const ketQua = kiem("Mức thưởng 2%.", [
			{ menhDe: "Mức thưởng cũ", trich: "mức thưởng 12% cũ" },
		]);
		expect(loiCua(ketQua), "so khop mot phan: 2%").toContainEqual({
			loai: "so-khong-trich",
			chi: "2%",
		});
	});

	test("bien so: 1,5 khong nho 11,5", () => {
		const ketQua = kiem("Mức trần là 1,5 triệu đồng.", [
			{ menhDe: "Mức trần", trich: "Mức trần hoa hồng là 11,5 triệu đồng" },
		]);
		expect(loiCua(ketQua), "so khop mot phan: 1,5").toContainEqual({
			loai: "so-khong-trich",
			chi: "1,5",
		});
	});
});
