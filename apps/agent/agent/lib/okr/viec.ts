import { db } from "@crm/db";
import {
	type LOAI_VIEC_TRO_LY_OKR,
	laViecTroLyOkr,
	soLanThuToiDa,
	VIEC_OKR,
} from "@crm/db/agent-tasks";
import { troLyOkrSanSang } from "@crm/db/okr-tro-ly";
import type { DonViMucTieu } from "@crm/db/okr-tro-ly-danh-muc";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { LeasedTask } from "../tasks";
import { completeTask } from "../tasks";
import { TRO_LY_OKR } from "./config";
import { coBanTomTatCuaViec, docViecOkr, nguoiYeuCauXemDuoc } from "./doc";

export { laViecTroLyOkr };

const LOAI_TOM_TAT =
	"okr-tom-tat-tuan" satisfies (typeof LOAI_VIEC_TRO_LY_OKR)[number];

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
	const phong =
		viec.data.viec === "tom-tat-tuan"
			? await phongCuaViec(viec.data.departmentId)
			: null;
	if (phong?.luuTru) return TRO_LY_OKR.ketThuc.phongLuuTru;
	if (!coKhoaMoHinh()) return TRO_LY_OKR.ketThuc.chuaCoKhoa;
	const san = await troLyOkrSanSang(db, {
		viec: viec.data.viec,
		objectiveId:
			viec.data.viec === "de-xuat" ? viec.data.objectiveId : undefined,
		donVi: phong?.donVi,
		nacViec: viec.data.nac,
		now,
	});
	return san.bat ? null : `khong-chay:${san.lyDo}`;
}

async function phongCuaViec(
	departmentId: string,
): Promise<{ luuTru: boolean; donVi: DonViMucTieu }> {
	const phong = await db.department.findUniqueOrThrow({
		where: { id: departmentId },
		select: { divisionId: true, archivedAt: true },
	});
	return {
		luuTru: phong.archivedAt !== null,
		donVi: {
			onehub: false,
			boPhanId: phong.divisionId,
			phongBanId: departmentId,
		},
	};
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

export async function ketThucCuaViec(
	taskId: string,
	ketThuc: string,
): Promise<string> {
	if (ketThuc !== "da-nop") return ketThuc;
	const viec = await docViecOkr(taskId);
	if (viec?.kind !== LOAI_TOM_TAT) return ketThuc;
	return (await coBanTomTatCuaViec(taskId))
		? ketThuc
		: TRO_LY_OKR.ketThuc.tomTatKhongNop;
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
