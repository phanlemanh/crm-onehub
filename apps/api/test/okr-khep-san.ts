import { setSystemTime } from "bun:test";
import { db } from "@crm/db";
import {
	type AiHoacCookie,
	dangChay,
	goi,
	type Json,
	ma,
	ok,
	phien,
	TIEN_TO,
	taoNam,
	taoQuy,
} from "./okr-san";

const PHIEN_XA = new Date("2099-01-01T00:00:00Z");

export async function keoDaiPhien(): Promise<void> {
	await db.session.updateMany({
		where: { userId: { startsWith: TIEN_TO } },
		data: { expiresAt: PHIEN_XA },
	});
}

export function luc(iso: string): void {
	setSystemTime(new Date(iso));
}

export async function gieoKyQuy(ky: {
	tu: string;
	den: string;
	pha?: "lap-ke-hoach" | "dang-chay";
}): Promise<string> {
	const nam = await taoNam("khep-nam", Number(ky.tu.slice(0, 4)));
	const quy = await taoQuy("khep-quy", nam, ky.tu, ky.den);
	if ((ky.pha ?? "dang-chay") === "dang-chay") await dangChay(quy);
	return quy;
}

export type KrGieo = {
	kind?: string;
	startValue?: number;
	targetValue?: number;
	currentValue?: number;
	weight?: number;
	ownerUserId?: string;
};

export async function gieoMucTieuCongBo(
	cycleId: string,
	krs: KrGieo[],
	tuy: {
		kind?: "cam-ket" | "tham-vong";
		unit?: Json;
		ownerUserId?: string;
		ai?: AiHoacCookie;
	} = {},
): Promise<{ objectiveId: string; krIds: string[] }> {
	const ai = tuy.ai ?? "quan";
	const chu = tuy.ownerUserId ?? phien.quan.nguoi;
	const objectiveId = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit: tuy.unit ?? { level: "onehub" },
				title: ma("muc tieu khep"),
				kind: tuy.kind ?? "cam-ket",
				ownerUserId: chu,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		"tao muc tieu khep",
	).id;
	const krIds: string[] = [];
	for (const kr of krs) {
		krIds.push(
			ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId,
						title: ma("kr khep"),
						kind: kr.kind ?? "tang-toi",
						ownerUserId: kr.ownerUserId ?? chu,
						startValue: kr.startValue ?? 0,
						targetValue: kr.targetValue ?? 100,
						currentValue: kr.currentValue ?? kr.startValue ?? 0,
						unit: "",
						dueOn: null,
						weight: kr.weight ?? 1,
					},
					ai,
				),
				"tao kr khep",
			).id,
		);
	}
	ok(await goi("okr.publishObjective", { id: objectiveId }, ai), "cong bo");
	return { objectiveId, krIds };
}

export async function donSanKhep(): Promise<void> {
	const cuaSan = { name: { startsWith: TIEN_TO } };
	const kr = { objective: { cycle: cuaSan } };
	await db.okrDoiDich.deleteMany({ where: { keyResult: kr } });
	await db.okrDiemKr.deleteMany({ where: { cycle: cuaSan } });
	await db.okrNhinLai.deleteMany({ where: { objective: { cycle: cuaSan } } });
	await db.okrMangSang.deleteMany({
		where: {
			OR: [
				{ sangCycle: cuaSan },
				{ tuObjective: { cycle: cuaSan } },
				{ sangObjective: { cycle: cuaSan } },
			],
		},
	});
	await db.okrCuaSoRa.deleteMany({ where: { cycle: cuaSan } });
}
