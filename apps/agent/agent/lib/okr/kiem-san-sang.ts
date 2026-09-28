import { completeTask, type LeasedTask } from "../tasks";
import { coKhoaMoHinh } from "./viec";

export async function chayKiemSanSang(
	task: Pick<LeasedTask, "id">,
): Promise<void> {
	await completeTask(
		task.id,
		coKhoaMoHinh() ? "san-sang" : "chua-co-khoa-mo-hinh",
	);
}
