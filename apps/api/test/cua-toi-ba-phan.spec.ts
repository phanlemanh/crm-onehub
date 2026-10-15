import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { LOI_VAO, moCapNhatInput } from "@crm/validation/okr-cap-nhat";
import {
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	phien,
	phienCua,
} from "./okr-san";

dungSan();

async function mucTieu(cycleId: string, ai: AiHoacCookie): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit: { level: "onehub" },
				title: ma("muc tieu"),
				kind: "cam-ket",
				ownerUserId: phien.quan.nguoi,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		"tao muc tieu",
	).id;
}

async function taoKr(
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 10,
				targetValue: 50,
				currentValue: 20,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr",
	).id;
}

describe("ctbp-phien-cua-toi", () => {
	test("ctbp-phien-cua-toi: moi loi vao ghi dung entry, loi vao la bi tu choi, luot cua-toi gui xong co submittedAt va checkIn", async () => {
		ok(
			await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }),
			"cau hinh",
		);
		const quy = await kyDangChay("ctbp");
		const m = await nguoiMoi("ctbp-m");
		const cookieM = await phienCua(m);
		const mt = await mucTieu(quy, "quan");
		const k1 = await taoKr(mt, m, "quan");
		const k2 = await taoKr(mt, m, "quan");
		ok(await goi("okr.publishObjective", { id: mt }, "quan"), "cong bo");

		const moTheo: Json[] = [];
		for (const entry of LOI_VAO) {
			const { sessionId } = ok<{ sessionId: string }>(
				await goi("okr.moCapNhat", { entry }, cookieM),
				`mo ${entry}`,
			);
			const p = await db.okrCheckInSession.findUniqueOrThrow({
				where: { id: sessionId },
			});
			moTheo.push([entry, p.entry, p.userId === m]);
		}
		expect(moTheo).toEqual(LOI_VAO.map((e) => [e, e, true]));
		expect(LOI_VAO).toContain("cua-toi");
		expect(moCapNhatInput.safeParse({ entry: "la" }).success).toBe(false);

		const { sessionId } = ok<{ sessionId: string }>(
			await goi("okr.moCapNhat", { entry: "cua-toi" }, cookieM),
			"mo cua-toi",
		);
		ok(
			await goi(
				"okr.guiCapNhat",
				{
					sessionId,
					items: [k1, k2].map((keyResultId, i) => ({
						keyResultId,
						value: 30 + i,
						confidence: "cao",
						note: "",
					})),
				},
				cookieM,
			),
			"gui",
		);
		const p = await db.okrCheckInSession.findUniqueOrThrow({
			where: { id: sessionId },
		});
		const lan = await db.okrCheckIn.findMany({ where: { sessionId } });
		expect({
			entry: p.entry,
			daGui: p.submittedAt !== null,
			giayHopLe: (p.seconds ?? -1) >= 0,
			kr: lan.map((l) => l.keyResultId).sort(),
		}).toEqual({
			entry: "cua-toi",
			daGui: true,
			giayHopLe: true,
			kr: [k1, k2].sort(),
		});
	});
});
