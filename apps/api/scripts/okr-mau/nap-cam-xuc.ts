import type { Db } from "@crm/db";
import { LOAI_CAM_XUC, type LoaiCamXuc } from "@crm/validation/okr-cam-xuc";
import { MUC_TU_TIN, type MucTuTin } from "@crm/validation/okr-cap-nhat";
import { z } from "zod";
import { AgentTriggerService } from "../../src/agent/agent-trigger.service";
import { OkrService } from "../../src/okr/okr.service";
import { OkrAccessService } from "../../src/okr/okr-access.service";
import { OkrCamXucService } from "../../src/okr/okr-cam-xuc.service";
import { ToChucService } from "../../src/to-chuc/to-chuc.service";
import { idMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau } from "./khuon";

export type DemCamXuc = { camXuc: number };

const LOAI_THEO_TU_TIN = {
	thap: "co-len",
	vua: "dong-y",
	cao: "chuc-mung",
} as const satisfies Record<MucTuTin, LoaiCamXuc>;

function dungDichVu(db: Db): OkrCamXucService {
	const quyen = new OkrAccessService(db, new ToChucService(db));
	const okr = new OkrService(db, quyen, new AgentTriggerService(db));
	return new OkrCamXucService(db, okr, quyen);
}

const chonLan = {
	id: true,
	authorUserId: true,
	confidence: true,
	createdAt: true,
	session: { select: { submittedAt: true } },
} as const;

export async function lanTuanGanNhat(db: Db, cycleId: string) {
	const dieuKien = {
		keyResult: {
			objective: { cycleId, status: "cong-bo", hienThi: "cong-khai" },
		},
	};
	const moi = await db.okrCheckIn.findFirst({
		where: dieuKien,
		orderBy: [{ weekStart: "desc" }, { id: "asc" }],
		select: { weekStart: true },
	});
	if (!moi) return [];
	return db.okrCheckIn.findMany({
		where: { ...dieuKien, weekStart: moi.weekStart },
		orderBy: [{ keyResultId: "asc" }, { id: "asc" }],
		select: chonLan,
	});
}

export async function napCamXucMau(
	db: Db,
	bo: BoOkrMau,
	cycleId: string,
): Promise<DemCamXuc> {
	const dichVu = dungDichVu(db);
	const cx = bo.traoDoi.camXuc;
	let dem = 0;
	const tha = async (
		lan: { id: string; createdAt: Date; session: { submittedAt: Date | null } },
		nguoi: string,
		loai: LoaiCamXuc,
	) => {
		const userId = idMau("nguoi", nguoi);
		const co = await db.okrCamXuc.findUnique({
			where: {
				checkInId_userId_loai: { checkInId: lan.id, userId, loai },
			},
			select: { id: true },
		});
		if (co) return;
		const luc = lan.session.submittedAt ?? lan.createdAt;
		await dichVu.thaCamXuc(
			userId,
			{ checkInId: lan.id, loai },
			new Date(
				luc.getTime() + OKR_MAU.traoDoi.sauCapNhatGio * OKR_MAU.thoiGian.gioMs,
			),
		);
		dem += 1;
	};
	const lan = await lanTuanGanNhat(db, cycleId);
	for (const [i, l] of lan.entries()) {
		if (i % cx.boQuaMoi === cx.boQuaMoi - 1) continue;
		const ung = [i, i + 1].map(
			(k) => cx.nguoiTha[k % cx.nguoiTha.length] ?? "",
		);
		const nguoi = ung.find((n) => idMau("nguoi", n) !== l.authorUserId);
		if (!nguoi) continue;
		await tha(
			l,
			nguoi,
			LOAI_THEO_TU_TIN[z.enum(MUC_TU_TIN).parse(l.confidence)],
		);
	}
	const moiNhat = await db.okrCheckIn.findFirst({
		where: { keyResultId: idMau("kr", cx.nhieu.kr) },
		orderBy: [
			{ session: { submittedAt: "desc" } },
			{ createdAt: "desc" },
			{ id: "desc" },
		],
		select: chonLan,
	});
	if (!moiNhat)
		throw new Error(
			`KR mẫu ${cx.nhieu.kr} chưa có lần cập nhật để thả cảm xúc`,
		);
	for (const loai of LOAI_CAM_XUC) {
		const ds = loai === "dong-y" ? cx.nhieu.nguoi : cx.nhieu.nguoi.slice(0, 1);
		for (const n of ds)
			if (idMau("nguoi", n) !== moiNhat.authorUserId)
				await tha(moiNhat, n, loai);
	}
	return { camXuc: dem };
}
