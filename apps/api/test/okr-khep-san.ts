import { setSystemTime } from "bun:test";
import { db } from "@crm/db";
import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import { diemTheoThang } from "@crm/validation/okr-khep";
import { z } from "zod";
import {
	type AiHoacCookie,
	dangChay,
	goi,
	type Json,
	ma,
	ok,
	phien,
	phienCua,
	TIEN_TO,
	type TraLoi,
	taoNam,
	taoQuy,
} from "./okr-san";

const thangCham = z.enum(THANG_CHAM);
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
	nguon?: { [khoa: string]: Json };
};

export async function gieoMucTieuCongBo(
	cycleId: string,
	krs: KrGieo[],
	tuy: {
		kind?: "cam-ket" | "tham-vong" | "hoc-tap";
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
		const id = ok<{ id: string }>(
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
		).id;
		if (kr.nguon)
			ok(
				await goi("okr.datNguonKr", { ...kr.nguon, keyResultId: id }, ai),
				"dat nguon kr khep",
			);
		krIds.push(id);
	}
	ok(await goi("okr.publishObjective", { id: objectiveId }, ai), "cong bo");
	return { objectiveId, krIds };
}

export async function guiSo(
	so: { keyResultId: string; value: number }[],
	ai: AiHoacCookie = "quan",
): Promise<void> {
	const sessionId = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "tab" }, ai),
		"mo phien cap nhat khep",
	).sessionId;
	ok(
		await goi(
			"okr.guiCapNhat",
			{
				sessionId,
				items: so.map((m) => ({ ...m, confidence: "vua", note: "" })),
			},
			ai,
		),
		"gui cap nhat khep",
	);
}

export async function chamHetBangGoiY(cycleId: string): Promise<void> {
	const chua = await db.okrDiemKr.findMany({
		where: { cycleId, diem: null },
		select: {
			keyResultId: true,
			diemGoiY: true,
			thang: true,
			keyResult: { select: { ownerUserId: true } },
		},
	});
	const phienChu = new Map<string, string>();
	for (const d of chua) {
		const chu = d.keyResult.ownerUserId;
		const cookie = phienChu.get(chu) ?? (await phienCua(chu));
		phienChu.set(chu, cookie);
		ok(
			await goi(
				"okr.chamKr",
				{
					keyResultId: d.keyResultId,
					diem: diemTheoThang(Number(d.diemGoiY), thangCham.parse(d.thang)),
				},
				cookie,
			),
			"cham bang goi y",
		);
	}
}

export async function sangPha(
	id: string,
	phase: "cham-diem" | "da-dong",
): Promise<TraLoi> {
	if (phase === "da-dong") {
		await chamHetBangGoiY(id);
		return goi("okr.setCyclePhase", { id, phase });
	}
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	const homSau = new Date(c.endsOn);
	homSau.setUTCDate(homSau.getUTCDate() + 1);
	await keoDaiPhien();
	luc(`${homSau.toISOString().slice(0, 10)}T03:00:00Z`);
	try {
		return await goi("okr.setCyclePhase", { id, phase });
	} finally {
		setSystemTime();
	}
}

export async function donSanKhep(): Promise<void> {
	const cuaSan = { name: { startsWith: TIEN_TO } };
	const kr = { objective: { cycle: cuaSan } };
	await db.okrDoiDich.deleteMany({ where: { keyResult: kr } });
	await db.okrSoChup.deleteMany({ where: { keyResult: kr } });
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
