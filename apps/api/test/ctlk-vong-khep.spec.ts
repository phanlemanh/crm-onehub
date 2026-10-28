import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import { viecOkrCanNhac } from "@crm/db/okr-nhac";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { keoDaiPhien, luc } from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	datViTri,
	dungSan,
	goi,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const CHO_MS = 60_000;
const GIEO_LUC = "2026-10-27T03:00:00Z";
const GUI_LUC = "2026-10-27T04:00:00Z";
const DO_LUC = new Date("2026-10-28T03:00:00Z");

afterEach(() => setSystemTime());

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

describe("ctlk-vong-khep", () => {
	test(
		"ctlk-vong-khep: mot lan gui qua hop mot KR dua KR ra khoi capNhatTuan va khoi muc nhac 08:30, KR chua gui van con",
		async () => {
			luc(GIEO_LUC);
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const ky = await kyDangChay("ctlk-vk");
			const pb = await pbMoi("ctlk-vk-pb");
			const truong = await truongMoi("department", pb, "ctlk-vk-tp");
			const a = await nguoiMoi("ctlk-vk-a");
			ok(await datViTri(a, pb), "xep a");
			const mt = ok<{ id: string }>(
				await goi(
					"okr.createObjective",
					{
						cycleId: ky,
						unit: { level: "phong-ban", departmentId: pb },
						title: ma("ctlk vk mt"),
						kind: "cam-ket",
						ownerUserId: truong.nguoi,
						participantIds: [],
						whyNow: "",
					},
					truong.cookie,
				),
				"tao muc tieu",
			).id;
			const taoKr = async (ten: string) =>
				ok<{ id: string }>(
					await goi(
						"okr.createKeyResult",
						{
							objectiveId: mt,
							title: ma(ten),
							kind: "tang-toi",
							ownerUserId: a,
							startValue: 0,
							targetValue: 10,
							currentValue: 0,
							unit: "khách",
							dueOn: null,
							weight: 1,
						},
						truong.cookie,
					),
					`tao ${ten}`,
				).id;
			const kr1 = await taoKr("ctlk vk kr1");
			const kr2 = await taoKr("ctlk vk kr2");
			ok(
				await goi("okr.publishObjective", { id: mt }, truong.cookie),
				"cong bo",
			);

			luc(GUI_LUC);
			const cookieA = await phienCua(a);
			await keoDaiPhien();
			const phien = ok<{ sessionId: string }>(
				await goi("okr.moCapNhat", { entry: "sheet" }, cookieA),
				"mo luot sheet",
			).sessionId;
			ok(
				await goi(
					"okr.guiCapNhat",
					{
						sessionId: phien,
						items: [
							{ keyResultId: kr1, value: 4, confidence: "vua", note: "" },
						],
					},
					cookieA,
				),
				"gui mot KR",
			);
			setSystemTime();

			const tuan = await ungDung()
				.get(OkrCapNhatService)
				.capNhatTuan(a, DO_LUC);
			const daGui = new Map(
				tuan.items.map((i) => [i.keyResultId, i.updatedThisWeek]),
			);
			kiem(
				daGui.get(kr1) === true,
				"ctlk-vong-khep: KR 1 da gui qua sheet van con trong Can cap nhat tuan nay",
			);
			kiem(
				daGui.get(kr2) === false,
				"ctlk-vong-khep: KR 2 chua gui da roi Can cap nhat tuan nay",
			);

			const nhac = (
				(
					await viecOkrCanNhac(db, {
						now: DO_LUC,
						userId: a,
						cuaSo: "truc-tiep",
					})
				).get(a) ?? []
			).flatMap((v) => (v.loai === "okr-cap-nhat" ? [v] : []));
			kiem(
				nhac.length === 1,
				`ctlk-vong-khep: A co ${nhac.length} muc nhac cap nhat, mong 1`,
			);
			kiem(
				!nhac[0]?.krIds.includes(kr1),
				"ctlk-vong-khep: KR 1 da gui qua sheet van con trong tin nhac",
			);
			expect(nhac[0]?.krIds).toEqual([kr2]);
			expect(nhac[0]?.soKr).toBe(1);
		},
		CHO_MS,
	);
});
