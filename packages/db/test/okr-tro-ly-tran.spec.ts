import { describe, expect, test } from "bun:test";
import { CAU_HINH_AI_MAC_DINH, tranThangApDung } from "../src/okr-tro-ly";
import {
	type CauHinhAi,
	nacCuaDonVi,
	TRO_LY_OKR_TRAN,
	VIEC_TRO_LY,
} from "../src/okr-tro-ly-danh-muc";

const ct = (p: Partial<CauHinhAi>): CauHinhAi => ({
	...CAU_HINH_AI_MAC_DINH,
	aiOn: true,
	...p,
});

describe("tran-soan", () => {
	test("hằng trần của việc soạn và trần ký tự trang chiến lược", () => {
		expect(TRO_LY_OKR_TRAN.soan).toEqual({
			luotMoiCuoc: 12,
			cuocMoiDonViMoiKy: 3,
			tranRaMoiLoiGoi: 3_000,
		});
		expect(TRO_LY_OKR_TRAN.trangChienLuocKyTu).toBe(20_000);
		expect(VIEC_TRO_LY).toEqual(["de-xuat", "tom-tat-tuan", "soan"]);
	});

	test("tranThangApDung: tháng đặt OKR dùng cột riêng khi đặt, bằng trần thường khi trống hoặc không có chu kỳ lập kế hoạch", () => {
		const dat = ct({ aiTranThangUsd: 9, aiTranThangDatOkrUsd: 15 });
		const trong = ct({ aiTranThangUsd: 9, aiTranThangDatOkrUsd: null });
		expect(tranThangApDung(dat, true), "tran thang dat okr khong ap").toBe(15);
		expect(tranThangApDung(dat, false)).toBe(9);
		expect(tranThangApDung(trong, true)).toBe(9);
		expect(tranThangApDung(trong, false)).toBe(9);
	});

	test("nacCuaDonVi(soan): bảng viết trước cho OneHub, bộ phận, phòng ban trong bộ phận; bật thắng ẩn; hàng cũ đọc lên soan tắt", () => {
		const onehub = { onehub: true, boPhanId: null, phongBanId: null };
		const boPhan = { onehub: false, boPhanId: "bp-a", phongBanId: null };
		const phong = { onehub: false, boPhanId: "bp-a", phongBanId: "pb-1" };
		const bang: [string, CauHinhAi, string, string, string][] = [
			["tat ca", ct({}), "viec-tat", "viec-tat", "viec-tat"],
			[
				"bat toan cong ty",
				ct({ aiSoanPhamVi: "toan-cong-ty" }),
				"bat",
				"bat",
				"bat",
			],
			[
				"bat bo phan keo phong ban",
				ct({ aiSoanPhamVi: "danh-sach", aiSoanDonVi: ["bp-a"] }),
				"don-vi-chua-bat",
				"bat",
				"bat",
			],
			[
				"an onehub",
				ct({ aiSoanAnPhamVi: "danh-sach", aiSoanAnDonVi: ["onehub"] }),
				"an",
				"don-vi-chua-bat",
				"don-vi-chua-bat",
			],
			[
				"bat toan + an danh sach",
				ct({
					aiSoanPhamVi: "toan-cong-ty",
					aiSoanAnPhamVi: "danh-sach",
					aiSoanAnDonVi: ["pb-1"],
				}),
				"bat",
				"bat",
				"bat",
			],
			[
				"an toan + bat phong ban",
				ct({
					aiSoanAnPhamVi: "toan-cong-ty",
					aiSoanPhamVi: "danh-sach",
					aiSoanDonVi: ["pb-1"],
				}),
				"an",
				"an",
				"bat",
			],
		];
		for (const [ten, c, oh, bp, pb] of bang) {
			expect(
				[
					nacCuaDonVi(c, "soan", onehub),
					nacCuaDonVi(c, "soan", boPhan),
					nacCuaDonVi(c, "soan", phong),
				],
				ten === "bat toan + an danh sach" ? "an thang bat" : ten,
			).toEqual([oh, bp, pb]);
		}
		expect(
			nacCuaDonVi(
				{ ...CAU_HINH_AI_MAC_DINH, aiOn: true, aiDeXuatPhamVi: "toan-cong-ty" },
				"soan",
				phong,
			),
			"hang cu doc len soan tat",
		).toBe("viec-tat");
		expect(
			nacCuaDonVi(
				ct({ aiOn: false, aiSoanPhamVi: "toan-cong-ty" }),
				"soan",
				phong,
			),
		).toBe("tat");
	});
});
