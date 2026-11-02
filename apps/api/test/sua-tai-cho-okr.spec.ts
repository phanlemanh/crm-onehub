import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	CHUONG_TRINH_RONG,
	datViTri,
	doc,
	dungSan,
	goi,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
} from "./okr-san";

const CHO_CA_MS = 60_000;

dungSan();

type ChiTiet = { canEdit: boolean; canEditKr: string[] };

async function dungMucTieu() {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const quy = await kyDangChay("sv9");
	const pb = await pbMoi("sv9-pb");
	const truong = await truongMoi("department", pb, "sv9-truong");
	const chuKr = await nguoiMoi("sv9-chu-kr");
	ok(await datViTri(chuKr, pb), "xep chu KR");
	const khac = await nguoiMoi("sv9-khac");
	ok(await datViTri(khac, pb), "xep nguoi khac");
	const mt = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId: quy,
				unit: { level: "phong-ban", departmentId: pb },
				title: ma("muc tieu sv9"),
				kind: "cam-ket",
				ownerUserId: truong.nguoi,
				participantIds: [],
				whyNow: "",
			},
			truong.cookie,
		),
		"tao muc tieu",
	).id;
	const kr = ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId: mt,
				title: ma("kr sv9"),
				kind: "tang-toi",
				ownerUserId: chuKr,
				startValue: 0,
				targetValue: 50,
				currentValue: 0,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			truong.cookie,
		),
		"tao KR",
	).id;
	ok(await goi("okr.publishObjective", { id: mt }, truong.cookie), "cong bo");
	return { mt, kr, truong, chuKr: await phienCua(chuKr), khac };
}

describe("sua-tai-cho-okr: quyền ở máy chủ", () => {
	test(
		"chu-kr-ten · chu-kr-nguoi · truong-don-vi: quyền khớp cờ canEdit, canEditKr của detail",
		async () => {
			const s = await dungMucTieu();

			const xemChu = await doc<ChiTiet>("okr.objective", s.chuKr, { id: s.mt });
			expect({
				canEdit: xemChu.canEdit,
				suaKr: xemChu.canEditKr.includes(s.kr),
			}).toEqual({
				canEdit: false,
				suaKr: true,
			});
			const xemTruong = await doc<ChiTiet>("okr.objective", s.truong.cookie, {
				id: s.mt,
			});
			expect(xemTruong.canEdit).toBe(true);

			const tenMoi = ma("ten kr moi");
			ok(
				await goi("okr.updateKeyResult", { id: s.kr, title: tenMoi }, s.chuKr),
				"chu-kr-ten",
			);
			expect(
				(await db.okrKeyResult.findUniqueOrThrow({ where: { id: s.kr } }))
					.title,
			).toBe(tenMoi);

			const doiNguoi = await goi(
				"okr.updateKeyResult",
				{ id: s.kr, ownerUserId: s.khac },
				s.chuKr,
			);
			expect(doiNguoi.status).toBe(403);
			expect(
				(await db.okrKeyResult.findUniqueOrThrow({ where: { id: s.kr } }))
					.ownerUserId,
			).not.toBe(s.khac);

			const tenMt = ma("ten muc tieu moi");
			ok(
				await goi(
					"okr.updateObjective",
					{ id: s.mt, title: tenMt },
					s.truong.cookie,
				),
				"truong-don-vi",
			);
			expect(
				(await db.okrObjective.findUniqueOrThrow({ where: { id: s.mt } }))
					.title,
			).toBe(tenMt);
		},
		CHO_CA_MS,
	);
});
