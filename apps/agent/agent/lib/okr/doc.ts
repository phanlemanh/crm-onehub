import { db } from "@crm/db";
import { LOAI_VIEC_TRO_LY_OKR } from "@crm/db/agent-tasks";

export const DANH_SACH_DOC = [
	"agentTask",
	"okrObjective",
	"okrProgramConfig",
	"okrDeXuat",
] as const;

export async function docViecOkr(taskId: string) {
	return db.agentTask.findUnique({
		where: { id: taskId },
		select: { id: true, kind: true, finishedAt: true, payload: true },
	});
}

export async function docViecTheoPhienGoc(sessionId: string) {
	return db.agentTask.findFirst({
		where: { sessionId, kind: { in: [...LOAI_VIEC_TRO_LY_OKR] } },
		orderBy: { createdAt: "desc" },
		select: { id: true, kind: true, finishedAt: true, payload: true },
	});
}

export async function docMucTieu(objectiveId: string) {
	return db.okrObjective.findUnique({
		where: { id: objectiveId },
		select: {
			id: true,
			level: true,
			status: true,
			title: true,
			whyNow: true,
			keyResults: {
				orderBy: { position: "asc" },
				select: {
					id: true,
					title: true,
					kind: true,
					startValue: true,
					targetValue: true,
					currentValue: true,
					unit: true,
				},
			},
		},
	});
}

export async function docThangCham(): Promise<string> {
	const row = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
		select: { scoreScale: true },
	});
	return row?.scoreScale ?? "0-1";
}

export async function docDeXuatDaBac(objectiveId: string) {
	return db.okrDeXuat.findMany({
		where: { objectiveId, trangThai: "bac" },
		select: { loai: true, truong: true, keyResultId: true, maVanDe: true },
	});
}

export async function soLanNop(taskId: string): Promise<number> {
	return db.okrDeXuat.count({ where: { taskId } });
}
