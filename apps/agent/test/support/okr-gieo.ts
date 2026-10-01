import { db } from "@crm/db";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import type {
	BacGhiDanh,
	MaChiSo,
	PhamViChiSo,
} from "@crm/validation/okr-chi-so";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import {
	KET_LUAN_CHON,
	NOI_MOI,
	type SoLieuHoiY,
	soLieuHoiY,
} from "@crm/validation/okr-hoi-y";
import type { KieuKr } from "@crm/validation/okr-kr";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import { donDep, ma, TIEN_TO } from "./nhac-gieo";

export const GIO_MS = 60 * 60 * 1000;

export type KyGieo = { tu: string; den: string };

const QUY_4: KyGieo = { tu: "2026-10-01", den: "2026-12-31" };

export async function gieoChuKy(
	phase: PhaChuKy,
	updateWeekday = 1,
	ky: KyGieo = QUY_4,
	anLuc: Date | null = null,
): Promise<string> {
	const ck = await db.okrCycle.create({
		data: {
			kind: "quy",
			name: ma(),
			startsOn: new Date(`${ky.tu}T00:00:00Z`),
			endsOn: new Date(`${ky.den}T00:00:00Z`),
			phase,
			updateWeekday,
			anLuc,
		},
	});
	return ck.id;
}

export type MucTieuGieo = {
	cycleId: string;
	chu: string;
	tieuDe?: string;
	congBo: Date | null;
	cap?: "onehub" | "bo-phan" | "phong-ban" | "ca-nhan";
	departmentId?: string;
	divisionId?: string;
};

export async function gieoMucTieu(m: MucTieuGieo): Promise<string> {
	const cap = m.cap ?? "onehub";
	const mt = await db.okrObjective.create({
		data: {
			cycleId: m.cycleId,
			level: cap,
			departmentId: m.departmentId ?? null,
			divisionId: m.divisionId ?? null,
			personUserId: cap === "ca-nhan" ? m.chu : null,
			ownerUserId: m.chu,
			kind: "cam-ket",
			status: m.congBo ? "cong-bo" : "nhap",
			title: m.tieuDe ?? ma(),
			publishedAt: m.congBo,
			createdAt: m.congBo ?? new Date(),
		},
	});
	return mt.id;
}

export async function gieoKr(k: {
	objectiveId: string;
	chu: string;
	tieuDe?: string;
	khoa: Date | null;
	viTri?: number;
	nguon?: "tay" | "crm" | "api" | "bang-tinh";
	giaTri?: number;
	kieu?: KieuKr;
}): Promise<string> {
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId: k.objectiveId,
			title: k.tieuDe ?? ma(),
			kind: k.kieu ?? "tang-toi",
			ownerUserId: k.chu,
			startValue: 0,
			targetValue: 100,
			currentValue: k.giaTri ?? 0,
			source: k.nguon ?? "tay",
			position: k.viTri ?? 0,
			startLockedAt: k.khoa,
			createdAt: k.khoa ?? new Date(),
		},
	});
	return kr.id;
}

export type NguonGieo =
	| { loai: "crm"; chiSo: MaChiSo; phamVi: PhamViChiSo; bac?: BacGhiDanh }
	| { loai: "bang-tinh"; sheetId: string; o: string; thuLuc?: Date };

export async function gieoNguonKr(
	keyResultId: string,
	taoBoi: string,
	n: NguonGieo,
): Promise<void> {
	await db.okrNguonKr.create({
		data:
			n.loai === "crm"
				? {
						keyResultId,
						loai: n.loai,
						chiSo: n.chiSo,
						phamVi: n.phamVi,
						bac: n.bac ?? null,
						taoBoiUserId: taoBoi,
					}
				: {
						keyResultId,
						loai: n.loai,
						sheetId: n.sheetId,
						sheetO: n.o,
						thuLuc: n.thuLuc ?? null,
						taoBoiUserId: taoBoi,
					},
	});
}

export async function guiCapNhat(
	keyResultId: string,
	nguoi: string,
	luc: Date,
): Promise<void> {
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: keyResultId },
		select: { ownerUserId: true },
	});
	const truoc = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: keyResultId },
		select: { currentValue: true, objectiveId: true },
	});
	const phien = await db.okrCheckInSession.create({
		data: {
			userId: nguoi,
			entry: "nhac",
			openedAt: luc,
			submittedAt: luc,
			seconds: 0,
		},
	});
	await db.okrCheckIn.create({
		data: {
			keyResultId,
			sessionId: phien.id,
			weekStart: new Date(`${dauTuanVN(luc)}T00:00:00Z`),
			value: 10,
			confidence: "vua",
			note: "",
			authorUserId: nguoi,
			ownerUserId: kr.ownerUserId,
			onBehalf: nguoi !== kr.ownerUserId,
			createdAt: luc,
		},
	});
	await db.okrKeyResult.update({
		where: { id: keyResultId },
		data: { currentValue: 10 },
	});
	await vet({
		action: "cap-nhat-tuan",
		nguoiLam: nguoi,
		objectiveId: truoc.objectiveId,
		keyResultId,
		truoc: { currentValue: Number(truoc.currentValue) },
		sau: {
			currentValue: 10,
			confidence: "vua",
			onBehalf: nguoi !== kr.ownerUserId,
		},
		luc,
	});
}

export async function binhLuan(b: {
	objectiveId: string;
	tacGia: string;
	nhacTen?: string[];
	keyResultId?: string;
	luc: Date;
}): Promise<string> {
	const nhac = [...new Set(b.nhacTen ?? [])];
	const c = await db.okrComment.create({
		data: {
			objectiveId: b.objectiveId,
			keyResultId: b.keyResultId ?? null,
			body: "trao doi",
			authorUserId: b.tacGia,
			createdAt: b.luc,
			mentions: { create: nhac.map((userId) => ({ userId })) },
		},
	});
	await vet({
		action: "binh-luan",
		nguoiLam: b.tacGia,
		objectiveId: b.objectiveId,
		keyResultId: b.keyResultId,
		sau: {
			commentId: c.id,
			keyResultId: b.keyResultId ?? null,
			mentions: nhac,
		},
		luc: b.luc,
	});
	return c.id;
}

export async function ghiNhan(g: {
	objectiveId: string;
	tacGia: string;
	nhan: string[];
	keyResultId?: string;
	luc: Date;
}): Promise<string> {
	const row = await db.okrGhiNhan.create({
		data: {
			objectiveId: g.objectiveId,
			keyResultId: g.keyResultId ?? null,
			loiNhan: "cam on",
			tacGiaUserId: g.tacGia,
			createdAt: g.luc,
			nhan: { create: g.nhan.map((userId) => ({ userId })) },
		},
	});
	await vet({
		action: "ghi-nhan",
		nguoiLam: g.tacGia,
		objectiveId: g.objectiveId,
		keyResultId: g.keyResultId,
		sau: { ghiNhanId: row.id, nguoiNhan: g.nhan },
		luc: g.luc,
	});
	return row.id;
}

export async function theoDoi(
	objectiveId: string,
	userId: string,
	luc = new Date(),
) {
	await db.okrFollow.create({ data: { objectiveId, userId, createdAt: luc } });
	await vet({ action: "theo-doi", nguoiLam: userId, objectiveId, luc });
}

export async function vet(v: {
	action: string;
	nguoiLam: string;
	objectiveId: string;
	keyResultId?: string;
	truoc?: OkrVetSnapshot;
	sau?: OkrVetSnapshot;
	ghiChu?: string;
	luc: Date;
}): Promise<void> {
	await db.okrTrail.create({
		data: {
			at: v.luc,
			actorUserId: v.nguoiLam,
			action: v.action,
			objectiveId: v.objectiveId,
			keyResultId: v.keyResultId ?? null,
			before: v.truoc,
			after: v.sau,
			note: v.ghiChu ?? null,
		},
	});
}

export async function gieoBoPhan(truong: string | null): Promise<string> {
	const bp = await db.division.create({
		data: { name: ma(), position: 0, headUserId: truong },
	});
	return bp.id;
}

export async function gieoPhongBan(
	truong: string | null,
	divisionId: string | null = null,
): Promise<string> {
	const pb = await db.department.create({
		data: { name: ma(), position: 0, headUserId: truong, divisionId },
	});
	return pb.id;
}

const HOI_Y_GIEO = {
	moTruocHanGio: 48,
	cauHoi: "Năm tới nên dồn sức vào điều gì?",
	soLieu: [
		{ nhan: "Doanh thu năm", giaTri: "186 tỷ", ghiChu: "" },
	] satisfies SoLieuHoiY,
	chuDe: "Giao lạnh có lãi",
	lyDo: "Đúng hướng năm tới, có người làm ngay.",
	cauMucTieu: "Đưa giao lạnh thành dịch vụ có lãi",
	noiDungY: "Mở tuyến giao lạnh cho khách dược",
} as const;

export async function gieoHoiY(h: {
	cycleId: string;
	nguoiChon: string;
	han: Date;
	mo?: Date;
	congBo?: Date;
}): Promise<string> {
	const mo =
		h.mo ?? new Date(h.han.getTime() - HOI_Y_GIEO.moTruocHanGio * GIO_MS);
	if (h.congBo && h.congBo.getTime() < h.han.getTime())
		throw new Error(
			`gieoHoiY: công bố ${h.congBo.toISOString()} trước hạn ${h.han.toISOString()} — lần hỏi ý chỉ công bố được sau hạn`,
		);
	const hang = await db.okrHoiY.create({
		data: {
			cycleId: h.cycleId,
			cauHoi: HOI_Y_GIEO.cauHoi,
			soLieu: soLieuHoiY.parse(HOI_Y_GIEO.soLieu),
			hanLuc: h.han,
			nguoiChonUserId: h.nguoiChon,
			taoBoiUserId: h.nguoiChon,
			congBoLuc: h.congBo ?? null,
			createdAt: mo,
		},
	});
	if (h.congBo) {
		await db.okrHoiYBanTruoc.create({
			data: {
				hoiYId: hang.id,
				cau: [],
				boQua: true,
				vietBoiUserId: h.nguoiChon,
				niemPhongLuc: h.han,
			},
		});
		const mucTieu = await gieoMucTieu({
			cycleId: h.cycleId,
			chu: h.nguoiChon,
			tieuDe: HOI_Y_GIEO.cauMucTieu,
			congBo: null,
		});
		await db.okrChuDe.create({
			data: {
				hoiYId: hang.id,
				loai: "chu-de",
				ten: HOI_Y_GIEO.chuDe,
				ketLuan: KET_LUAN_CHON,
				lyDo: HOI_Y_GIEO.lyDo,
				cauMucTieu: HOI_Y_GIEO.cauMucTieu,
				noiBanTruoc: NOI_MOI,
				objectiveId: mucTieu,
				viTri: 0,
				createdAt: h.han,
			},
		});
	}
	return hang.id;
}

export async function gieoY(
	hoiYId: string,
	tacGia: string,
	luc: Date,
): Promise<void> {
	const h = await db.okrHoiY.findUniqueOrThrow({
		where: { id: hoiYId },
		select: {
			createdAt: true,
			hanLuc: true,
			congBoLuc: true,
			chuDe: { select: { id: true }, orderBy: { viTri: "asc" }, take: 1 },
		},
	});
	if (luc.getTime() < h.createdAt.getTime() || luc >= h.hanLuc)
		throw new Error(
			`gieoY: ý góp lúc ${luc.toISOString()} ngoài [mở ${h.createdAt.toISOString()}, hạn ${h.hanLuc.toISOString()}) của lần hỏi ý`,
		);
	const chuDeId = h.congBoLuc ? (h.chuDe[0]?.id ?? null) : null;
	await db.okrY.create({
		data: {
			hoiYId,
			tacGiaUserId: tacGia,
			noiDung: HOI_Y_GIEO.noiDungY,
			chuDeId,
			ganLuc: chuDeId ? h.hanLuc : null,
			createdAt: luc,
		},
	});
}

export async function donOkr(): Promise<void> {
	await db.agentTask.deleteMany({ where: { kind: "nhac-ke-hoach" } });
	const cuaSan = { cycle: { name: { startsWith: TIEN_TO } } };
	await db.okrGhiNhanNhan.deleteMany({
		where: { ghiNhan: { objective: cuaSan } },
	});
	await db.okrGhiNhan.deleteMany({ where: { objective: cuaSan } });
	await db.okrMention.deleteMany({ where: { comment: { objective: cuaSan } } });
	await db.okrComment.deleteMany({ where: { objective: cuaSan } });
	await db.okrFollow.deleteMany({ where: { objective: cuaSan } });
	await db.okrCheckIn.deleteMany({
		where: { keyResult: { objective: cuaSan } },
	});
	await db.okrCheckInSession.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.okrTrail.deleteMany({
		where: { actorUserId: { startsWith: TIEN_TO } },
	});
	await db.okrY.deleteMany({ where: { hoiY: cuaSan } });
	await db.okrChuDe.deleteMany({ where: { hoiY: cuaSan } });
	await db.okrHoiYBanTruoc.deleteMany({ where: { hoiY: cuaSan } });
	await db.okrHoiY.deleteMany({ where: cuaSan });
	await db.okrSoChup.deleteMany({
		where: { keyResult: { objective: cuaSan } },
	});
	await db.okrKeyResult.deleteMany({ where: { objective: cuaSan } });
	await db.okrObjective.deleteMany({ where: cuaSan });
	await db.okrCycle.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.slackMemberMatch.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.account.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await donDep();
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
}

export const TOKEN_ZALO = "1:okr";

export async function batBot(): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
		update: { zaloBotName: "Bot OneHub" },
	});
}

export async function tatBot(): Promise<void> {
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null },
	});
}

export async function noiZalo(userId: string, zaloUserId: string) {
	await db.zaloLink.create({
		data: {
			crmUserId: userId,
			zaloUserId,
			zaloDisplayName: `Zalo ${zaloUserId}`,
		},
	});
}

export function voiToken<T>(chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	process.env.ZALO_BOT_TOKEN = TOKEN_ZALO;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}
