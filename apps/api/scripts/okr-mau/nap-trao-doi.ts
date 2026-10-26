import type { Db } from "@crm/db";
import { AgentTriggerService } from "../../src/agent/agent-trigger.service";
import { OkrService } from "../../src/okr/okr.service";
import { OkrAccessService } from "../../src/okr/okr-access.service";
import { OkrTraoDoiService } from "../../src/okr/okr-trao-doi.service";
import { ToChucService } from "../../src/to-chuc/to-chuc.service";
import { idMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau } from "./khuon";

export type DemTraoDoi = { theoDoi: number; traLoi: number };

function dungDichVu(db: Db): OkrTraoDoiService {
	const quyen = new OkrAccessService(db, new ToChucService(db));
	const okr = new OkrService(db, quyen, new AgentTriggerService(db));
	return new OkrTraoDoiService(db, okr, quyen);
}

export async function napTraoDoiMau(
	db: Db,
	bo: BoOkrMau,
	moc: Date,
): Promise<DemTraoDoi> {
	const dichVu = dungDichVu(db);
	for (const f of bo.traoDoi.theoDoi)
		await dichVu.follow(
			idMau("nguoi", f.nguoi),
			{
				objectiveId: idMau("mt", f.mucTieu),
				on: true,
			},
			moc,
		);
	const krTheoMa = new Map(
		bo.mucTieu.flatMap((m) => m.krs.map((k) => [k.ma, m.ma] as const)),
	);
	for (const t of bo.traoDoi.traLoi) {
		const keyResultId = idMau("kr", t.kr);
		const lan = await db.okrCheckIn.findFirst({
			where: { keyResultId },
			orderBy: [
				{ session: { submittedAt: "desc" } },
				{ createdAt: "desc" },
				{ id: "desc" },
			],
			select: {
				authorUserId: true,
				createdAt: true,
				session: { select: { submittedAt: true } },
			},
		});
		if (!lan) throw new Error(`KR mẫu ${t.kr} chưa có lần cập nhật để trả lời`);
		const luc = lan.session.submittedAt ?? lan.createdAt;
		const nguoi = idMau("nguoi", t.nguoi);
		await dichVu.addComment(
			nguoi,
			{
				objectiveId: idMau("mt", krTheoMa.get(t.kr) ?? ""),
				keyResultId,
				body: t.noiDung,
				mentionUserIds: lan.authorUserId === nguoi ? [] : [lan.authorUserId],
			},
			new Date(
				luc.getTime() + OKR_MAU.traoDoi.sauCapNhatGio * OKR_MAU.thoiGian.gioMs,
			),
		);
	}
	return {
		theoDoi: bo.traoDoi.theoDoi.length,
		traLoi: bo.traoDoi.traLoi.length,
	};
}
