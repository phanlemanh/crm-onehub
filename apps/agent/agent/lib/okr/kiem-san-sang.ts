import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { canKiemLaiKhoa, LY_DO_VIEC_OKR } from "@crm/db/okr-tro-ly";
import { ketQuaCuaNguon } from "@crm/db/okr-tro-ly-danh-muc";
import { type NguonKhoa, nguonKhoaMoHinh } from "../mo-hinh-khoa";
import { completeTask, type LeasedTask } from "../tasks";
import { TRO_LY_OKR } from "./config";

export async function chayKiemSanSang(
	task: Pick<LeasedTask, "id">,
): Promise<void> {
	await completeTask(task.id, ketQuaCuaNguon(await nguonKhoaMoHinh()));
}

export async function xepKiemLaiKhoa(
	now: Date = new Date(),
	nguon?: NguonKhoa | null,
): Promise<boolean> {
	const hienTai = ketQuaCuaNguon(
		nguon === undefined ? await nguonKhoaMoHinh() : nguon,
	);
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, TRO_LY_OKR.khoaKiemLai);
		if (!(await canKiemLaiKhoa(tx, now, hienTai))) return false;
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
