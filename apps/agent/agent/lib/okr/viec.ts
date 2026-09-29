import { db } from "@crm/db";
import { laViecTroLyOkr, soLanThuToiDa, VIEC_OKR } from "@crm/db/agent-tasks";
import { troLyOkrSanSang } from "@crm/db/okr-tro-ly";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { LeasedTask } from "../tasks";
import { completeTask } from "../tasks";
import { TRO_LY_OKR } from "./config";
import { nguoiYeuCauXemDuoc } from "./doc";

export { laViecTroLyOkr };

export function coKhoaMoHinh(): boolean {
	return TRO_LY_OKR.khoaMoHinh.some((k) => Boolean(process.env[k]?.trim()));
}

export async function lyDoChanTruocKhiGui(
	task: Pick<LeasedTask, "kind" | "attempts" | "payload">,
	now: Date = new Date(),
): Promise<string | null> {
	if (task.attempts > soLanThuToiDa(task.kind))
		return TRO_LY_OKR.ketThuc.hetLease;
	const viec = okrTroLyViec.safeParse(task.payload);
	if (!viec.success) return TRO_LY_OKR.ketThuc.payloadHong;
	if (
		viec.data.viec === "de-xuat" &&
		!(await nguoiYeuCauXemDuoc(viec.data.objectiveId, viec.data.nguoiYeuCau))
	)
		return TRO_LY_OKR.ketThuc.khongXemDuoc;
	if (!coKhoaMoHinh()) return TRO_LY_OKR.ketThuc.chuaCoKhoa;
	const san = await troLyOkrSanSang(db, {
		viec: viec.data.viec,
		objectiveId:
			viec.data.viec === "de-xuat" ? viec.data.objectiveId : undefined,
		now,
	});
	return san.bat ? null : `khong-chay:${san.lyDo}`;
}

export async function giaHanLease(
	taskId: string,
	now: Date = new Date(),
): Promise<void> {
	await db.agentTask.updateMany({
		where: { id: taskId, finishedAt: null },
		data: { leasedUntil: new Date(now.getTime() + VIEC_OKR.leaseMs) },
	});
}

export async function dongViecOkr(
	taskId: string,
	outcome: string,
): Promise<boolean> {
	return (await completeTask(taskId, outcome)) !== null;
}

export async function laHangTroLyOkr(taskId: string): Promise<boolean> {
	const hang = await db.agentTask.findUnique({
		where: { id: taskId },
		select: { kind: true },
	});
	return hang !== null && laViecTroLyOkr(hang.kind);
}

export function okrAuthAttributes(
	task: Pick<LeasedTask, "id" | "kind" | "payload">,
) {
	const viec = okrTroLyViec.safeParse(task.payload);
	return {
		purpose: "okr",
		okrTaskId: task.id,
		okrViec: viec.success ? viec.data.viec : "de-xuat",
	};
}
