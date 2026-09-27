import { db } from "@crm/db";
import { nopDeXuat, okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { defineTool } from "eve/tools";
import { docViecOkr, soLanNop } from "../../../lib/okr/doc";
import { dungGoiDeXuat, idTrongGoi } from "../../../lib/okr/goi-ngu-canh";
import { attribute, purposeOf } from "../../../lib/session-purpose";

const tuChoi = (lyDo: string) => ({
	ketQua: "tu-choi" as const,
	lyDo,
	soDong: 0,
	boQua: 0,
});

export default defineTool({
	description:
		"Submit the proposals for this Trợ lý OKR task. Call exactly once. Lines must use ids from the data block.",
	inputSchema: nopDeXuat,
	async execute(input, ctx) {
		if (purposeOf(ctx) !== "okr") return tuChoi("not an OKR session");
		const taskId = attribute(ctx, "okrTaskId");
		if (!taskId) return tuChoi("missing task");
		const hang = await docViecOkr(taskId);
		if (!hang || hang.kind !== "okr-de-xuat" || hang.finishedAt) {
			return tuChoi("task is not running");
		}
		const doc = okrTroLyViec.safeParse(hang.payload);
		if (!doc.success) return tuChoi("task payload unreadable");
		const viec = doc.data;
		if (viec.viec !== "de-xuat") return tuChoi("task payload unreadable");
		if ((await soLanNop(taskId)) > 0) return tuChoi("already submitted");
		const goi = await dungGoiDeXuat(viec.objectiveId);
		if (!goi) return tuChoi("objective is gone");
		const coMat = idTrongGoi(goi);
		const hopLe = input.dong.filter(
			(d) =>
				d.objectiveId === goi.mucTieu.id &&
				(d.keyResultId === null || coMat.has(d.keyResultId)) &&
				(d.targetObjectiveId === null || coMat.has(d.targetObjectiveId)) &&
				(d.targetKeyResultId === null || coMat.has(d.targetKeyResultId)),
		);
		await db.okrDeXuat.createMany({
			data: hopLe.map((d) => ({
				taskId,
				objectiveId: d.objectiveId,
				keyResultId: d.keyResultId,
				loai: d.loai,
				truong: d.truong,
				truoc: d.truoc,
				sau: d.sau,
				maVanDe: d.maVanDe,
				dich:
					d.targetObjectiveId || d.targetKeyResultId
						? {
								targetObjectiveId: d.targetObjectiveId,
								targetKeyResultId: d.targetKeyResultId,
							}
						: undefined,
				lyDo: d.lyDo,
				inputHash: viec.inputHash,
				nguoiYeuCau: viec.nguoiYeuCau,
			})),
		});
		return {
			ketQua: "da-ghi" as const,
			lyDo: "",
			soDong: hopLe.length,
			boQua: input.dong.length - hopLe.length,
		};
	},
});
