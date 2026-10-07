import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { taskToken } from "../../agent/channels/crm";
import { claimDue, completeTask, noteSession } from "../../agent/lib/tasks";
import { TIEN_TO } from "./nhac-gieo";

export type NguCanhCon = {
	agent: { name: string };
	channel: { kind: string; continuationToken: string };
	session: {
		id: string;
		parent: { sessionId: string; rootSessionId: string };
	};
};

export function nguCanhCon(phienGoc: string): NguCanhCon {
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

export function nguCanhGoc(taskId: string, phienGoc: string) {
	return {
		agent: { name: "crm" },
		channel: { kind: "crm", continuationToken: taskToken(taskId) },
		session: {
			id: phienGoc,
			auth: {
				current: {
					attributes: { purpose: "okr", okrTaskId: taskId, okrViec: "de-xuat" },
				},
				initiator: null,
			},
		},
	};
}

export type ViecMo = { taskId: string; phienGoc: string };

export async function moViecDeXuat(v: {
	objectiveId: string;
	keyResultId?: string | null;
	nguoiYeuCau: string;
}): Promise<ViecMo> {
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId: v.objectiveId,
		keyResultId: v.keyResultId ?? null,
		nguoiYeuCau: v.nguoiYeuCau,
		nac: "bat",
		now: new Date(),
	});
	if (!xep.bat) throw new Error(`khong xep duoc: ${xep.lyDo}`);
	if (xep.dungLai) throw new Error(`dung lai viec cu: ${xep.taskId}`);
	const nhan = await claimDue(50, { only: ["okr-de-xuat"] }, VIEC_OKR.leaseMs);
	if (!nhan.some((t) => t.id === xep.taskId)) {
		throw new Error(`claimDue khong nhan viec ${xep.taskId}`);
	}
	const phienGoc = `${TIEN_TO}goc-${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	return { taskId: xep.taskId, phienGoc };
}

export async function dongDaNop(taskId: string): Promise<void> {
	if (await completeTask(taskId, "da-nop")) return;
	const hang = await db.agentTask.findUniqueOrThrow({
		where: { id: taskId },
		select: { outcome: true },
	});
	if (hang.outcome !== "da-nop") {
		throw new Error(
			`viec ${taskId} da dong ${hang.outcome} truoc khi nop xong`,
		);
	}
}
