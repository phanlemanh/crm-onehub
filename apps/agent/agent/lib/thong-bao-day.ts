import { db } from "@crm/db";
import { docCaiDatNhieuNguoi } from "@crm/db/cai-dat-thong-bao";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	macDinhDayRa,
	parseNoiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";
import {
	cauSuKienVi,
	laNoiDungSuKien,
	type NoiDungSuKien,
} from "@crm/validation/thong-bao-cau";
import { appUrlMacDinh, lienKetDuongDan } from "./nhac-ke-hoach";
import { sendSlackMessage } from "./run-runtime";
import { slackAccessToken } from "./slack-connection";
import { guiZalo, zaloToken } from "./zalo-api";

const PHUT_MS = 60 * 1000;

export type PhuThuocDay = {
	now?: Date;
	zaloFetcher?: typeof fetch;
	fetcher?: typeof fetch;
	appUrl?: string | null;
};

export type KetQuaDay = { gui: number; hong: number; boQua: number };

type Hang = {
	id: string;
	nguoiNhanId: string;
	noiDung: unknown;
	duongDan: string;
	taoLuc: Date;
	dayLan: number;
};

export async function dayThongBaoSuKien(
	deps: PhuThuocDay = {},
): Promise<KetQuaDay> {
	const now = deps.now ?? new Date();
	const ket: KetQuaDay = { gui: 0, hong: 0, boQua: 0 };
	const hang: Hang[] = await db.thongBao.findMany({
		where: {
			nguon: { not: THONG_BAO.nguon.nhacBuoiSang },
			taoLuc: {
				gte: new Date(now.getTime() - THONG_BAO.day.cuaSoPhut * PHUT_MS),
			},
			dayLan: { lt: THONG_BAO.day.tranLan },
			OR: [{ dayLuc: null }, { dayLoi: { not: null } }],
		},
		orderBy: { taoLuc: "asc" },
		select: {
			id: true,
			nguoiNhanId: true,
			noiDung: true,
			duongDan: true,
			taoLuc: true,
			dayLan: true,
		},
	});
	if (hang.length === 0) return ket;
	const caiDat = await docCaiDatNhieuNguoi(
		db,
		[...new Set(hang.map((h) => h.nguoiNhanId))],
		macDinhDayRa,
	);
	const thanhVien = new Set(
		(
			await db.member.findMany({
				where: {
					organizationId: WORKSPACE_ID,
					userId: { in: [...caiDat.keys()] },
				},
				select: { userId: true },
			})
		).map((m) => m.userId),
	);
	const canDay = hang.flatMap((h): { h: Hang; nd: NoiDungSuKien }[] => {
		const nd = parseNoiDungThongBao(h.noiDung);
		if (!laNoiDungSuKien(nd) || !thanhVien.has(h.nguoiNhanId)) return [];
		const cd = caiDat.get(h.nguoiNhanId)?.(nd.loai);
		const duoc =
			cd?.dayRa === true && (cd.doiLuc === null || h.taoLuc >= cd.doiLuc);
		return duoc ? [{ h, nd }] : [];
	});
	if (canDay.length === 0) return ket;
	const token = await zaloToken();
	const lienKet = await lienKetDuongDan(
		deps.appUrl === undefined ? appUrlMacDinh() : deps.appUrl,
	);
	for (const { h, nd } of canDay) {
		const giu = await db.thongBao.updateMany({
			where: {
				id: h.id,
				dayLan: h.dayLan,
				OR: [{ dayLuc: null }, { dayLoi: { not: null } }],
			},
			data: { dayLan: { increment: 1 }, dayLuc: now, dayLoi: null },
		});
		if (giu.count === 0) {
			ket.boQua += 1;
			continue;
		}
		try {
			const kenh = await kenhSeDungCua(db, h.nguoiNhanId, {
				coToken: token !== null,
			});
			if (kenh.kenh === null) {
				await db.thongBao.update({
					where: { id: h.id },
					data: { dayKenh: null },
				});
				ket.boQua += 1;
				continue;
			}
			const duong = lienKet(h.duongDan);
			const text = [cauSuKienVi(nd), duong]
				.filter((d): d is string => d !== null)
				.join("\n");
			if (kenh.kenh === "zalo") {
				if (!token || !kenh.zaloUserId) {
					throw new Error("kenh Zalo duoc chon ma thieu token hoac lien ket");
				}
				await guiZalo(token, kenh.zaloUserId, text, {
					fetcher: deps.zaloFetcher,
				});
			} else {
				const slack = await slackAccessToken();
				if (!slack || !kenh.slackUserId) {
					throw new Error(
						"kenh Slack duoc chon ma thieu token hoac nguoi khop",
					);
				}
				await sendSlackMessage(
					slack,
					{ kind: "user", id: kenh.slackUserId, label: kenh.slackUserId },
					text,
					h.id,
					{ fetcher: deps.fetcher },
				);
			}
			await db.thongBao.update({
				where: { id: h.id },
				data: { dayKenh: kenh.kenh },
			});
			ket.gui += 1;
		} catch (loi) {
			const thongDiep = loi instanceof Error ? loi.message : String(loi);
			console.error(`[thong-bao-day] gui hong thong bao=${h.id}: ${thongDiep}`);
			await db.thongBao.update({
				where: { id: h.id },
				data: { dayLoi: thongDiep.slice(0, 500) },
			});
			ket.hong += 1;
		}
	}
	return ket;
}
