import { db } from "@crm/db";
import { LOAI_VIEC_TRO_LY_OKR } from "@crm/db/agent-tasks";
import {
	capDichCanChinh,
	chuKyDichCanChinh,
	type NguonCanChinh,
} from "@crm/validation/okr-can-chinh";

export const DANH_SACH_DOC = [
	"agentTask",
	"member",
	"okrObjective",
	"okrProgramConfig",
	"okrDeXuat",
] as const;

const TRANG_THAI_CON_TAC_DUNG = ["cho", "bac", "bo-qua"];

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
			cycleId: true,
			cycle: { select: { parentId: true } },
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

export type MucTieuDoc = NonNullable<Awaited<ReturnType<typeof docMucTieu>>>;

export async function docDichCanChinh(nguon: NguonCanChinh) {
	return db.okrObjective.findMany({
		where: {
			status: "cong-bo",
			level: { in: capDichCanChinh(nguon.level) },
			cycleId: { in: chuKyDichCanChinh(nguon) },
		},
		select: {
			id: true,
			title: true,
			level: true,
			keyResults: {
				select: { id: true, title: true },
				orderBy: { position: "asc" },
			},
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
	});
}

export async function docThangCham(): Promise<string> {
	const row = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
		select: { scoreScale: true },
	});
	return row?.scoreScale ?? "0-1";
}

export async function docDeXuatConTacDung(objectiveId: string) {
	return db.okrDeXuat.findMany({
		where: { objectiveId, trangThai: { in: TRANG_THAI_CON_TAC_DUNG } },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			loai: true,
			objectiveId: true,
			keyResultId: true,
			truong: true,
			truoc: true,
			sau: true,
			maVanDe: true,
			dich: true,
			lyDo: true,
			trangThai: true,
			nac: true,
		},
	});
}

export async function docTenThanhVien(): Promise<string[]> {
	const ds = await db.member.findMany({
		select: { user: { select: { name: true } } },
	});
	return ds.map((d) => d.user.name).filter((ten) => ten.trim() !== "");
}

export async function soLanNop(taskId: string): Promise<number> {
	return db.okrDeXuat.count({ where: { taskId } });
}
