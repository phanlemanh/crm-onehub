import { describe, expect, test } from "bun:test";
import { mucTinCanChinh as mucTinApi } from "../../../apps/api/src/okr/can-chinh";
import {
	LY_DO_CAN_CHINH,
	lyDoCanChinhNhap,
	MA_CAN_CU_CAN_LY_DO,
	mucTinCanChinh,
} from "../src/ly-do-can-chinh";

type Ca = {
	ten: string;
	vao: { lyDo?: string | null; canCu?: string | null };
	ra: { lyDo: string | null; canCu: string | null } | "loi" | "can-cu-can-ly-do";
};

const CA: Ca[] = [
	{
		ten: "cat khoang trang",
		vao: { lyDo: "  Tăng tỷ lệ chốt  ", canCu: null },
		ra: { lyDo: "Tăng tỷ lệ chốt", canCu: null },
	},
	{ ten: "rong", vao: { lyDo: "" }, ra: { lyDo: null, canCu: null } },
	{ ten: "khoang trang", vao: { lyDo: "   " }, ra: { lyDo: null, canCu: null } },
	{
		ten: "nbsp xuong dong tab",
		vao: { lyDo: " \n\t" },
		ra: { lyDo: null, canCu: null },
	},
	{
		ten: "ly do qua tran",
		vao: { lyDo: "a".repeat(LY_DO_CAN_CHINH.lyDoToiDa + 1) },
		ra: "loi",
	},
	{
		ten: "can cu thieu ly do",
		vao: { lyDo: "  ", canCu: "Mảng X chiếm 30%" },
		ra: "can-cu-can-ly-do",
	},
	{
		ten: "can cu qua tran",
		vao: { lyDo: "Lý do", canCu: "b".repeat(LY_DO_CAN_CHINH.canCuToiDa + 1) },
		ra: "loi",
	},
];

describe("l4-luat", () => {
	test("lyDoCanChinhNhap: ma trận bảy ca viết trước", () => {
		let chay = 0;
		for (const ca of CA) {
			const kq = lyDoCanChinhNhap.safeParse(ca.vao);
			if (ca.ra === "can-cu-can-ly-do") {
				if (kq.success)
					throw new Error(`can cu thieu ly do lot qua: ${ca.ten}`);
				const issue = kq.error.issues[0];
				expect(issue?.message).toBe(MA_CAN_CU_CAN_LY_DO);
				expect(issue?.path).toEqual(["canCu"]);
			} else if (ca.ra === "loi") {
				if (kq.success) throw new Error(`qua tran lot qua: ${ca.ten}`);
			} else {
				if (!kq.success) throw new Error(`ca hop le bi tu choi: ${ca.ten}`);
				expect(kq.data).toEqual(ca.ra);
			}
			chay++;
		}
		expect(chay).toBe(7);
	});

	test("đối chứng dương: đúng trần mỗi ô thì qua", () => {
		const kq = lyDoCanChinhNhap.safeParse({
			lyDo: "a".repeat(LY_DO_CAN_CHINH.lyDoToiDa),
			canCu: "b".repeat(LY_DO_CAN_CHINH.canCuToiDa),
		});
		expect(kq.success).toBe(true);
	});

	test("mucTinCanChinh: ba mức, và một hàm duy nhất", () => {
		expect([
			mucTinCanChinh(null, null),
			mucTinCanChinh("Lý do", null),
			mucTinCanChinh("Lý do", "Căn cứ"),
			mucTinCanChinh("   ", null),
			mucTinCanChinh("Lý do", " \n "),
		]).toEqual([
			"chua-co-ly-do",
			"dat-cuoc",
			"co-so-lieu",
			"chua-co-ly-do",
			"dat-cuoc",
		]);
		if (mucTinApi !== mucTinCanChinh)
			throw new Error("ban thu hai cua mucTinCanChinh");
	});
});
