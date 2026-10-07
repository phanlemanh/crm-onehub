import { db } from "@crm/db";
import { LOAI_VIEC_TRO_LY_OKR } from "@crm/db/agent-tasks";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import {
	boGioiHan,
	dieuKienXemMucTieu,
	nguCanhXemOkr,
} from "@crm/db/okr-hien-thi";
import {
	capDichCanChinh,
	chuKyDichCanChinh,
	type NguonCanChinh,
} from "@crm/validation/okr-can-chinh";

export const DANH_SACH_DOC = [
	"agentTask",
	"member",
	"okrObjective",
	"okrProgramConfig",
	"okrDeXuat",
	"okrTomTat",
	"okrCheckIn",
	"okrCheckInSession",
	"okrKeyResult",
	"department",
	"user",
] as const;

const TRANG_THAI_CON_TAC_DUNG = ["cho", "bac", "bo-qua"];

export async function docViecTheoPhienGoc(sessionId: string) {
	return db.agentTask.findFirst({
		where: { sessionId, kind: { in: [...LOAI_VIEC_TRO_LY_OKR] } },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			kind: true,
			finishedAt: true,
			payload: true,
			createdAt: true,
		},
	});
}

async function nguCanhCuaNguoi(nguoiYeuCau: string) {
	return (await nguCanhXemOkr(db, [nguoiYeuCau])).get(nguoiYeuCau) ?? null;
}

export async function nguoiYeuCauXemDuoc(
	objectiveId: string,
	nguoiYeuCau: string,
): Promise<boolean> {
	const nc = await nguCanhCuaNguoi(nguoiYeuCau);
	if (!nc) return false;
	return (
		(await db.okrObjective.count({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
		})) > 0
	);
}

export async function docMucTieu(objectiveId: string, nguoiYeuCau: string) {
	const nc = await nguCanhCuaNguoi(nguoiYeuCau);
	if (!nc) return null;
	return db.okrObjective.findFirst({
		where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
		select: {
			id: true,
			level: true,
			status: true,
			title: true,
			whyNow: true,
			hienThi: true,
			cycleId: true,
			cycle: { select: { parentId: true } },
			keyResults: {
				orderBy: { position: "asc" },
				select: {
					id: true,
					title: true,
					kind: true,
					startValue: true,
					targetValue: true,
					currentValue: true,
					unit: true,
				},
			},
			alignments: {
				select: {
					targetObjectiveId: true,
					targetKeyResult: { select: { objectiveId: true } },
				},
			},
		},
	});
}

export type MucTieuDoc = NonNullable<Awaited<ReturnType<typeof docMucTieu>>>;

export async function docDichCanChinh(nguon: NguonCanChinh) {
	return db.okrObjective.findMany({
		where: {
			AND: [
				{
					status: "cong-bo",
					level: { in: capDichCanChinh(nguon.level) },
					cycleId: { in: chuKyDichCanChinh(nguon) },
					cycle: KY_CON_HIEN,
				},
				boGioiHan,
			],
		},
		select: {
			id: true,
			title: true,
			level: true,
			keyResults: {
				select: { id: true, title: true },
				orderBy: { position: "asc" },
			},
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
	});
}

export async function docThangCham(): Promise<string> {
	const row = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
		select: { scoreScale: true },
	});
	return row?.scoreScale ?? "0-1";
}

export async function docDeXuatConTacDung(objectiveId: string) {
	return db.okrDeXuat.findMany({
		where: { objectiveId, trangThai: { in: TRANG_THAI_CON_TAC_DUNG } },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			loai: true,
			objectiveId: true,
			keyResultId: true,
			truong: true,
			truoc: true,
			sau: true,
			maVanDe: true,
			dich: true,
			lyDo: true,
			trangThai: true,
			nac: true,
		},
	});
}

export async function docTenThanhVien(): Promise<string[]> {
	const ds = await db.member.findMany({
		select: { user: { select: { name: true } } },
	});
	return ds.map((d) => d.user.name).filter((ten) => ten.trim() !== "");
}

export async function soLanNop(taskId: string): Promise<number> {
	return db.okrDeXuat.count({ where: { taskId } });
}

export async function daCoTomTat(taskId: string): Promise<boolean> {
	return (await db.okrTomTat.count({ where: { taskId } })) > 0;
}
