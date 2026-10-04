import type { Db, Prisma } from "@crm/db";
import { hetHieuLuc } from "@crm/db/okr-de-xuat";
import {
	cauHinhAiLuc,
	chonDonViMucTieu,
	donViTuHang,
} from "@crm/db/okr-tro-ly";
import { nacCuaDonVi } from "@crm/db/okr-tro-ly-danh-muc";
import { CAP_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import type {
	DonViCuaMucTieu,
	OkrAccessService,
	Quyen,
} from "./okr-access.service";

type Client = Db | Prisma.TransactionClient;

const capMucTieu = z.enum(CAP_MUC_TIEU);

export type NguoiDem = {
	viewerId: string;
	q: Quyen;
	access: OkrAccessService;
};

function donViQuyen(m: {
	level: string;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
}): DonViCuaMucTieu {
	const level = capMucTieu.parse(m.level);
	return {
		level,
		divisionId: level === "bo-phan" ? m.divisionId : null,
		departmentId: level === "phong-ban" ? m.departmentId : null,
		personUserId: level === "ca-nhan" ? m.personUserId : null,
	};
}

export async function demGopYCho(
	client: Client,
	mucTieuIds: readonly string[],
	nguoi: NguoiDem,
): Promise<ReadonlyMap<string, number>> {
	const dem = new Map<string, number>(mucTieuIds.map((id) => [id, 0]));
	if (mucTieuIds.length === 0) return dem;
	const [ct, ds] = await Promise.all([
		cauHinhAiLuc(client),
		client.okrObjective.findMany({
			where: { id: { in: [...mucTieuIds] }, status: { not: "da-bo" } },
			select: {
				id: true,
				title: true,
				whyNow: true,
				departmentId: true,
				personUserId: true,
				...chonDonViMucTieu,
				keyResults: { select: { id: true, title: true, ownerUserId: true } },
			},
		}),
	]);
	const tap = new Map<string, ReadonlySet<string> | "moi">();
	for (const m of ds) {
		if (nacCuaDonVi(ct, "de-xuat", donViTuHang(m)) !== "bat") continue;
		const objective = donViQuyen(m);
		if (nguoi.access.suaDuocDonVi(nguoi.q, nguoi.viewerId, objective)) {
			tap.set(m.id, "moi");
			continue;
		}
		const kr = m.keyResults.filter((k) =>
			nguoi.access.ghiDuocKr(nguoi.q, nguoi.viewerId, {
				ownerUserId: k.ownerUserId,
				objective,
			}),
		);
		if (kr.length > 0) tap.set(m.id, new Set(kr.map((k) => k.id)));
	}
	if (tap.size === 0) return dem;
	const hang = await client.okrDeXuat.findMany({
		where: {
			objectiveId: { in: [...tap.keys()] },
			nac: "bat",
			trangThai: "cho",
			cuocSoanId: null,
		},
		select: {
			objectiveId: true,
			keyResultId: true,
			loai: true,
			truong: true,
			truoc: true,
		},
	});
	const theoId = new Map(ds.map((m) => [m.id, m]));
	for (const h of hang) {
		const m = theoId.get(h.objectiveId);
		const duoc = tap.get(h.objectiveId);
		if (!m || !duoc) continue;
		if (duoc !== "moi" && (h.keyResultId === null || !duoc.has(h.keyResultId)))
			continue;
		if (
			h.keyResultId !== null &&
			!m.keyResults.some((k) => k.id === h.keyResultId)
		)
			continue;
		if (hetHieuLuc(m, h)) continue;
		dem.set(h.objectiveId, (dem.get(h.objectiveId) ?? 0) + 1);
	}
	return dem;
}
