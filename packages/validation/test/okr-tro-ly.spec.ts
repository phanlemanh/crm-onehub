import { describe, expect, test } from "bun:test";
import { z } from "zod";
import {
	docTranUsd,
	donViDuocBat,
	OKR_PROGRAM_MAC_DINH,
	type OkrProgram,
	okrProgram,
} from "../src/okr-chuong-trinh";
import {
	ketQuaTroLy,
	nopDeXuat,
	okrTroLyViec,
	trangThaiDeXuat,
} from "../src/okr-tro-ly";

const HANG_CU = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	aiOn: false,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiTranThangUsd: 9,
};

function coChuoiTuDo(schema: z.ZodType): boolean {
	const def = (
		schema as {
			_zod: {
				def: {
					type: string;
					shape?: Record<string, z.ZodType>;
					innerType?: z.ZodType;
				};
			};
		}
	)._zod.def;
	if (def.type === "string") return true;
	if (def.type === "object" && def.shape)
		return Object.values(def.shape).some(coChuoiTuDo);
	if ((def.type === "nullable" || def.type === "optional") && def.innerType)
		return coChuoiTuDo(def.innerType);
	return false;
}

describe("mac-dinh", () => {
	test("một hàng cấu hình cũ sau migration đọc lên là Trợ lý OKR tắt, trần 9", () => {
		expect(okrProgram.parse(HANG_CU)).toEqual(OKR_PROGRAM_MAC_DINH);
		expect(OKR_PROGRAM_MAC_DINH.aiOn).toBe(false);
		expect(OKR_PROGRAM_MAC_DINH.aiTranThangUsd).toBe(9);
	});

	test("parse hỏng nêu tên trường, không nuốt thành rỗng", () => {
		const r = trangThaiDeXuat.safeParse("la");
		expect(r.success).toBe(false);
		const p = okrProgram.safeParse({ ...HANG_CU, aiDeXuatPhamVi: "moi-noi" });
		expect(
			p.success ? [] : p.error.issues.map((i) => i.path.join(".")),
		).toEqual(["aiDeXuatPhamVi"]);
	});
});

describe("khuon-khong-chu", () => {
	test("kết quả về gốc không có trường chữ tự do", () => {
		expect(coChuoiTuDo(ketQuaTroLy)).toBe(false);
	});

	test("đối chứng: khuôn có chuỗi thì bộ dò thấy", () => {
		expect(coChuoiTuDo(z.object({ a: z.string() }))).toBe(true);
	});

	test("khuôn đầu vào và đầu ra chuyển sang JSON Schema không vòng $ref, gốc object", () => {
		for (const k of [nopDeXuat, ketQuaTroLy, okrTroLyViec.options[0]]) {
			const s = z.toJSONSchema(k, { target: "draft-7" });
			expect(s.type).toBe("object");
			expect(JSON.stringify(s)).not.toContain("$ref");
		}
		expect(
			JSON.stringify(
				z.toJSONSchema(z.object({ a: z.json() }), { target: "draft-7" }),
			),
		).toContain("$ref");
	});
});

describe("tran-nhap", () => {
	test("dấu phẩy và dấu chấm thập phân; âm, chữ, quá 20 bị chặn", () => {
		expect(
			["7,5", "7.50", "0", "20", "-1", "abc", "21", "7,555"].map(docTranUsd),
		).toEqual([7.5, 7.5, 0, 20, null, null, null, null]);
	});
});

describe("don-vi-duoc-bat", () => {
	const ct = (p: Partial<OkrProgram>): OkrProgram => ({
		...OKR_PROGRAM_MAC_DINH,
		aiOn: true,
		...p,
	});
	const phongA = { onehub: false, boPhanId: "bp-b", phongBanId: "pb-a" };
	const phongNgoai = { onehub: false, boPhanId: "bp-c", phongBanId: "pb-x" };
	const onehub = { onehub: true, boPhanId: null, phongBanId: null };

	test("ma trận viết trước", () => {
		const o = [
			[ct({ aiOn: false, aiDeXuatPhamVi: "toan-cong-ty" }), phongA, "tat"],
			[ct({ aiDeXuatPhamVi: "tat" }), phongA, "viec-tat"],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: [] }),
				phongA,
				"don-vi-chua-bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["bp-b"] }),
				phongA,
				"bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["bp-b"] }),
				phongNgoai,
				"don-vi-chua-bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["onehub"] }),
				onehub,
				"bat",
			],
			[ct({ aiDeXuatPhamVi: "toan-cong-ty" }), phongNgoai, "bat"],
		] as const;
		expect(o.map(([c, d]) => donViDuocBat(c, "de-xuat", d))).toEqual(
			o.map(([, , m]) => m),
		);
		const rong = donViDuocBat(
			ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: [] }),
			"de-xuat",
			phongA,
		);
		if (rong === "bat") throw new Error("rong la tat ca");
	});

	test("hai việc tách phạm vi", () => {
		const c = ct({
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["onehub"],
			aiTomTatPhamVi: "toan-cong-ty",
		});
		expect([
			donViDuocBat(c, "de-xuat", phongA),
			donViDuocBat(c, "tom-tat-tuan", phongA),
		]).toEqual(["don-vi-chua-bat", "bat"]);
	});
});
