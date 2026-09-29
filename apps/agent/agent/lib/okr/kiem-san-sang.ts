import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { canKiemLaiKhoa, LY_DO_VIEC_OKR } from "@crm/db/okr-tro-ly";
import { completeTask, type LeasedTask } from "../tasks";
import { TRO_LY_OKR } from "./config";
import { coKhoaMoHinh } from "./viec";

export async function chayKiemSanSang(
	task: Pick<LeasedTask, "id">,
): Promise<void> {
	await completeTask(
		task.id,
		coKhoaMoHinh() ? "san-sang" : "chua-co-khoa-mo-hinh",
	);
}

export async function xepKiemLaiKhoa(now: Date = new Date()): Promise<boolean> {
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, TRO_LY_OKR.khoaKiemLai);
		if (!(await canKiemLaiKhoa(tx, now))) return false;
		await tx.agentTask.create({
			data: {
				kind: "okr-kiem-san-sang",
				reason: LY_DO_VIEC_OKR["okr-kiem-san-sang"],
				priority: PRIORITY.okrKiem,
				budget: 0,
				dueAt: now,
			},
		});
		return true;
	});
}
