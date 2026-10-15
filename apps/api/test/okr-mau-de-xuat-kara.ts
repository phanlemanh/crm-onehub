import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { nopDeXuatVao } from "../../agent/agent/lib/okr/nop-de-xuat";
import type { NguCanhKenh } from "../../agent/agent/lib/phien-con";
import { completeTask, noteSession } from "../../agent/agent/lib/tasks";
import { idMau, LoiBoMau, OKR_MAU } from "../scripts/okr-mau/cau-hinh";

export const DE_XUAT_KARA_MAU = {
	mucTieu: "q4-cham-soc-2",
	dichKr: "n1-k2",
	nguoiYeuCau: "vu-thu-ha",
	lyDo: "Khiếu nại xử lý trong ngày giữ đối tác ở lại gia hạn hợp đồng.",
	canCu: "Khiếu nại tồn qua đêm giữ dưới 5 vụ",
} as const;

function nguCanhCon(phienGoc: string): NguCanhKenh {
	return {
		channel: {
			kind: "subagent",
			continuationToken: `subagent:${phienGoc}:goi-tro-ly`,
		},
		session: {
			id: `${phienGoc}-con`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
		},
	};
}

export async function napDeXuatKaraMau(now = new Date()): Promise<string> {
	const m = DE_XUAT_KARA_MAU;
	const objectiveId = idMau("mt", m.mucTieu);
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId,
		keyResultId: null,
		nguoiYeuCau: idMau("nguoi", m.nguoiYeuCau),
		nac: "bat",
		now,
	});
	if (!xep.bat)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Không xếp được việc đề xuất mẫu của Kara: ${xep.lyDo}. Bật Kara cho chương trình OKR trước.`,
		);
	await db.agentTask.update({
		where: { id: xep.taskId },
		data: {
			attempts: { increment: 1 },
			startedAt: now,
			leasedUntil: new Date(now.getTime() + VIEC_OKR.leaseMs),
		},
	});
	const phienGoc = `${OKR_MAU.tienTo}kara-${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	const kq = await nopDeXuatVao(
		{
			dong: [
				{
					loai: "can-chinh",
					objectiveId,
					keyResultId: null,
					truong: null,
					truoc: null,
					sau: null,
					maVanDe: null,
					targetObjectiveId: null,
					targetKeyResultId: idMau("kr", m.dichKr),
					lyDo: m.lyDo,
					canCu: m.canCu,
				},
			],
		},
		nguCanhCon(phienGoc),
	);
	await completeTask(xep.taskId, "da-nop");
	if (kq.ketQua !== "da-ghi" || kq.soDong !== 1)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Đề xuất mẫu của Kara không được ghi: ${kq.ketQua} ${kq.lyDo} (bị loại ${kq.biLoai}).`,
		);
	return xep.taskId;
}
