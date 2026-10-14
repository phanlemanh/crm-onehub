import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { ghiKetQuaHoi, type KetQuaHoi } from "@crm/db/tai-lieu-hoi";
import {
	LY_DO_LOI,
	TAI_LIEU_HOI,
	TRANG_THAI_HOI,
} from "@crm/validation/tai-lieu-hoi";
import { z } from "zod";
import { dungSan, goi, hoi, ok } from "./tai-lieu-san";

dungSan();

const MAU = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"sua-sau-chay-that",
	"rang",
	"ket-qua-hoi.json",
);

const tinhHuong = z.array(
	z.object({
		tinhHuong: z.enum(["tu-choi", "loi", "qua-han"]),
		ghi: z.unknown(),
		ketQua: z.unknown(),
	}),
);

const ketQuaCoMa = z.discriminatedUnion("trangThai", [
	z.object({ trangThai: z.literal("TU_CHOI"), ganNhat: z.array(z.unknown()) }),
	z.object({ trangThai: z.literal("LOI"), lyDo: z.enum(LY_DO_LOI) }),
]);

const CAU_CO_DINH = [
	TAI_LIEU_HOI.tuChoi,
	TAI_LIEU_HOI.hetTran,
	TAI_LIEU_HOI.chuaTraLoi,
	TAI_LIEU_HOI.quaHan,
	TAI_LIEU_HOI.tranNgay,
	TAI_LIEU_HOI.tranThang,
] as const;

const cauTrong = (json: string) => CAU_CO_DINH.filter((c) => json.includes(c));

const BANG = tinhHuong.parse(JSON.parse(readFileSync(MAU, "utf8")));

describe("ssct-hoi-ma", () => {
	test("ssct-hoi-ma: ba tình huống viết trước", () => {
		expect(BANG.map((b) => b.tinhHuong)).toEqual(["tu-choi", "loi", "qua-han"]);
	});

	for (const dong of BANG) {
		test(`ssct-hoi-ma: ${dong.tinhHuong} — máy chủ trả trạng thái và mã, không câu chữ`, async () => {
			const { hoiId } = ok<{ hoiId: string }>(
				await goi(
					"hoiKho.hoi",
					{ cauHoi: "Nghỉ phép năm tính thế nào?" },
					"khac",
				),
				"hoi",
			);
			expect(
				await ghiKetQuaHoi(db, hoiId, dong.ghi as KetQuaHoi, new Date()),
			).toBe(true);
			const kq = ok<unknown>(
				await hoi("hoiKho.ketQua", { hoiId }, "khac"),
				`ket qua ${dong.tinhHuong}`,
			);
			const daDoc = ketQuaCoMa.parse(kq);
			expect(TRANG_THAI_HOI).toContain(daDoc.trangThai);
			expect(cauTrong(JSON.stringify(kq))).toEqual([]);
			expect(kq).toEqual(dong.ketQua);
		});
	}

	test("ssct-hoi-ma: chiều đỏ — hàng mang câu tiếng Việt ở lý do thì khuôn từ chối", () => {
		const tinh = "loi";
		const hang = { trangThai: "LOI", lyDo: TAI_LIEU_HOI.chuaTraLoi };
		expect({ tinh, hopLe: ketQuaCoMa.safeParse(hang).success }).toEqual({
			tinh,
			hopLe: false,
		});
		expect(cauTrong(JSON.stringify(hang))).toEqual([TAI_LIEU_HOI.chuaTraLoi]);
	});
});
