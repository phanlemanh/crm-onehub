import { db, Prisma } from "@crm/db";
import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import { CAU_HINH_AI_MAC_DINH } from "@crm/db/okr-tro-ly";
import type {
	CauHinhAi,
	KetQuaKiemSanSang,
} from "@crm/db/okr-tro-ly-danh-muc";
import { ma, TIEN_TO } from "./nhac-gieo";

let dem = 0;

export async function gieoCauHinhAi(
	luc: Date,
	p: Partial<CauHinhAi>,
	createdById = `${TIEN_TO}quan-tri`,
): Promise<number> {
	dem += 1;
	const version = -((Math.floor(Date.now() / 1000) % 1_000_000) * 100 + dem);
	await db.okrProgramConfig.create({
		data: {
			version,
			objectiveCap: 5,
			krCap: 5,
			capMode: "canh-bao",
			scoreScale: "0-1",
			weightsOn: false,
			personalOn: false,
			...CAU_HINH_AI_MAC_DINH,
			...p,
			aiDeXuatDonVi: [...(p.aiDeXuatDonVi ?? [])],
			aiTomTatDonVi: [...(p.aiTomTatDonVi ?? [])],
			aiDeXuatAnDonVi: [...(p.aiDeXuatAnDonVi ?? [])],
			aiTomTatAnDonVi: [...(p.aiTomTatAnDonVi ?? [])],
			aiTranThangUsd: new Prisma.Decimal(
				p.aiTranThangUsd ?? CAU_HINH_AI_MAC_DINH.aiTranThangUsd,
			),
			createdById,
			createdAt: luc,
		},
	});
	return version;
}

export async function gieoChiPhi(
	at: Date,
	tinhNang: TinhNang,
	usd: number | null,
	them: Partial<{
		sessionId: string;
		taskId: string;
		outputTokens: number;
	}> = {},
): Promise<string> {
	const id = `${TIEN_TO}cp-${ma()}`;
	await db.aiChiPhi.create({
		data: {
			id,
			at,
			sessionId: them.sessionId ?? `${TIEN_TO}phien`,
			tinhNang,
			taskId: them.taskId ?? null,
			outputTokens: them.outputTokens ?? null,
			costUsd: usd === null ? null : new Prisma.Decimal(usd),
		},
	});
	return id;
}

export async function gieoKiemSanSang(
	luc: Date,
	outcome: KetQuaKiemSanSang,
): Promise<void> {
	await db.agentTask.create({
		data: {
			kind: "okr-kiem-san-sang",
			reason: "okr-kiem-san-sang",
			dueAt: luc,
			finishedAt: luc,
			outcome,
			subject: `${TIEN_TO}kiem`,
		},
	});
}

export async function donTroLy(): Promise<void> {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.aiBaoTran.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.okrDeXuat.deleteMany({
		where: { nguoiYeuCau: { startsWith: TIEN_TO } },
	});
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{
					kind: { in: ["okr-de-xuat", "okr-tom-tat-tuan", "okr-tom-tat-xep"] },
				},
				{ subject: { startsWith: TIEN_TO } },
			],
		},
	});
	await db.okrProgramConfig.deleteMany({ where: { version: { lt: 0 } } });
}
