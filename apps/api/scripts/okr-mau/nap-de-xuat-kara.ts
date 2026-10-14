import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import type { DongGopY } from "@crm/validation/okr-tro-ly";
import { completeTask, noteSession } from "../../../agent/agent/lib/tasks";
import nopDeXuat from "../../../agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import { idMau, LoiBoMau, OKR_MAU } from "./cau-hinh";

export const DE_XUAT_KARA_MAU = {
	mucTieu: "q4-cham-soc-2",
	dichKr: "n1-k2",
	nguoiYeuCau: "vu-thu-ha",
	lyDo: "Khiếu nại xử lý trong ngày giữ đối tác ở lại gia hạn hợp đồng.",
	canCu: "Khiếu nại tồn qua đêm giữ dưới 5 vụ",
} as const;

type KetQuaNop = {
	ketQua: string;
	lyDo: string;
	soDong: number;
	biLoai: number;
};
type CongCuNop = {
	execute: (
		input: { dong: DongGopY[] },
		ctx: ReturnType<typeof nguCanhCon>,
	) => Promise<KetQuaNop>;
};

function nguCanhCon(phienGoc: string) {
	return {
		agent: { name: "tro_ly_okr" },
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
	const kq = await (nopDeXuat as unknown as CongCuNop).execute(
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
