import {
	canManageSettings,
	isWorkspaceAdmin,
	NOT_A_MEMBER,
	toWorkspaceRole,
	type WorkspaceRole,
	workspaceRoleOf,
} from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { type NguoiDuyet, nguoiDuyetMucTieu } from "@crm/db/okr-duyet";
import {
	dieuKienXemMucTieu,
	dungNguCanhXem,
	type NguCanhXem,
} from "@crm/db/okr-hien-thi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { CAP_MUC_TIEU, type CapMucTieu } from "@crm/validation/okr-muc-tieu";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type { TreeOutput } from "../to-chuc/to-chuc.contracts";
import { ToChucService } from "../to-chuc/to-chuc.service";
import { OKR } from "./okr-config";

export type DonViCuaMucTieu = {
	level: CapMucTieu;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
};

export type Quyen = {
	role: WorkspaceRole;
	quanTri: boolean;
	quanTriChuongTrinh: boolean;
	truongBoPhan: Set<string>;
	truongPhongBan: Set<string>;
	boPhanCua: Map<string, string | null>;
	phongBanChinh: Map<string, string | null>;
	cay: TreeOutput;
};

const capMucTieu = z.enum(CAP_MUC_TIEU);

export const chonDonVi = {
	id: true,
	cycleId: true,
	level: true,
	divisionId: true,
	departmentId: true,
	personUserId: true,
	status: true,
} as const;

export function donViCua<T extends { level: string }>(
	row: T,
): Omit<T, "level"> & { level: CapMucTieu } {
	return { ...row, level: capMucTieu.parse(row.level) };
}

@Injectable()
export class OkrAccessService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(ToChucService) private readonly toChuc: ToChucService,
	) {}

	async quyen(userId: string): Promise<Quyen> {
		const role = await workspaceRoleOf(userId);
		if (!role) throw new ForbiddenException(NOT_A_MEMBER);
		return this.quyenTuCay(userId, role, await this.toChuc.tree());
	}

	private quyenTuCay(
		userId: string,
		role: WorkspaceRole,
		cay: TreeOutput,
	): Quyen {
		const truongBoPhan = new Set(
			cay.divisions.filter((b) => b.head?.id === userId).map((b) => b.id),
		);
		const moiPb = [
			...cay.divisions.flatMap((b) => b.departments),
			...cay.chuaXep,
		];
		const truongPhongBan = new Set(
			moiPb.filter((p) => p.head?.id === userId).map((p) => p.id),
		);
		return {
			role,
			quanTri: isWorkspaceAdmin(role),
			quanTriChuongTrinh: canManageSettings(role),
			truongBoPhan,
			truongPhongBan,
			boPhanCua: new Map(moiPb.map((p) => [p.id, p.divisionId])),
			phongBanChinh: new Map(
				cay.people.map((n) => [n.id, n.primaryDepartmentId]),
			),
			cay,
		};
	}

	nguCanhXem(q: Quyen, userId: string): NguCanhXem {
		return dungNguCanhXem(userId, q);
	}

	nguoiDuyet(q: Quyen, mt: DonViCuaMucTieu): NguoiDuyet {
		const moiPb = [
			...q.cay.divisions.flatMap((b) => b.departments),
			...q.cay.chuaXep,
		];
		const truongCua = (ds: { id: string; head: { id: string } | null }[]) =>
			new Map(
				ds.flatMap((d): [string, string][] =>
					d.head ? [[d.id, d.head.id]] : [],
				),
			);
		return nguoiDuyetMucTieu(
			{
				truongCuaBoPhan: truongCua(q.cay.divisions),
				truongCuaPhongBan: truongCua(moiPb),
				boPhanCua: q.boPhanCua,
				phongBanChinh: q.phongBanChinh,
			},
			mt,
		);
	}

	duyetDuoc(q: Quyen, userId: string, mt: DonViCuaMucTieu): boolean {
		const nd = this.nguoiDuyet(q, mt);
		return nd.loai === "nguoi" ? nd.userId === userId : q.quanTri;
	}

	tenNguoiDuyet(q: Quyen, nd: NguoiDuyet): { ten: string } | "quan-tri" {
		if (nd.loai === "quan-tri") return "quan-tri";
		const truong = [
			...q.cay.divisions,
			...q.cay.divisions.flatMap((b) => b.departments),
			...q.cay.chuaXep,
		].find((d) => d.head?.id === nd.userId)?.head;
		return { ten: truong?.name ?? nd.userId };
	}

	async assertXemMucTieu(
		userId: string,
		objectiveId: string,
		client: Prisma.TransactionClient | Db = this.db,
	) {
		const q = await this.quyen(userId);
		const nc = this.nguCanhXem(q, userId);
		const row = await client.okrObjective.findFirst({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
			select: chonDonVi,
		});
		if (!row) throw new NotFoundException(OKR.thongDiep.khongThayMucTieu);
		return { q, nc, mt: donViCua(row) };
	}

	suaDuocDonVi(q: Quyen, userId: string, dv: DonViCuaMucTieu): boolean {
		switch (dv.level) {
			case "onehub":
				return q.quanTri;
			case "bo-phan":
				return dv.divisionId !== null && q.truongBoPhan.has(dv.divisionId);
			case "phong-ban": {
				if (dv.departmentId === null) return false;
				if (q.truongPhongBan.has(dv.departmentId)) return true;
				const bp = q.boPhanCua.get(dv.departmentId) ?? null;
				return bp !== null && q.truongBoPhan.has(bp);
			}
			case "ca-nhan": {
				if (dv.personUserId === null) return false;
				if (dv.personUserId === userId) return true;
				const pb = q.phongBanChinh.get(dv.personUserId) ?? null;
				if (pb === null) return false;
				if (q.truongPhongBan.has(pb)) return true;
				const bp = q.boPhanCua.get(pb) ?? null;
				return bp !== null && q.truongBoPhan.has(bp);
			}
		}
	}

	ghiDuocKr(
		q: Quyen,
		userId: string,
		kr: { ownerUserId: string; objective: DonViCuaMucTieu },
	): boolean {
		return (
			kr.ownerUserId === userId || this.suaDuocDonVi(q, userId, kr.objective)
		);
	}

	async quanTriChuongTrinh(userId: string): Promise<boolean> {
		return canManageSettings(await workspaceRoleOf(userId));
	}

	async assertQuanTri(userId: string): Promise<void> {
		if (!(await this.quanTriChuongTrinh(userId)))
			throw new ForbiddenException(OKR.thongDiep.canQuyenQuanTri);
	}

	async assertSuaDonVi(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!this.suaDuocDonVi(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	nhapDuoc(q: Quyen, userId: string, dv: DonViCuaMucTieu): boolean {
		return q.quanTri || this.suaDuocDonVi(q, userId, dv);
	}

	async assertNhapDuoc(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!this.nhapDuoc(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	async nguoiKhongXemDuoc(
		q: Quyen,
		objectiveId: string,
		userIds: string[],
	): Promise<string[]> {
		const can = [...new Set(userIds)];
		if (can.length === 0) return [];
		const vai = new Map(
			(
				await this.db.member.findMany({
					where: { organizationId: WORKSPACE_ID, userId: { in: can } },
					select: { userId: true, role: true },
				})
			).map((m) => [m.userId, toWorkspaceRole(m.role)]),
		);
		const thay = await Promise.all(
			can.map(async (u) => {
				const role = vai.get(u);
				if (!role) return false;
				const nc = this.nguCanhXem(this.quyenTuCay(u, role, q.cay), u);
				const dem = await this.db.okrObjective.count({
					where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
				});
				return dem > 0;
			}),
		);
		return can.filter((_, i) => !thay[i]);
	}

	async assertXemDuocHet(
		q: Quyen,
		objectiveId: string,
		userIds: string[],
		loi: (ten: string) => string,
	): Promise<void> {
		const khong = await this.nguoiKhongXemDuoc(q, objectiveId, userIds);
		if (khong.length === 0) return;
		const ten = new Map(
			(
				await this.db.user.findMany({
					where: { id: { in: khong } },
					select: { id: true, name: true },
				})
			).map((u) => [u.id, u.name]),
		);
		throw new BadRequestException(
			loi(khong.map((id) => ten.get(id) ?? id).join(", ")),
		);
	}

	async assertSuaMucTieuCoQuyen(
		userId: string,
		objectiveId: string,
		client: Prisma.TransactionClient | Db = this.db,
	) {
		const { q, mt } = await this.assertXemMucTieu(userId, objectiveId, client);
		if (!this.suaDuocDonVi(q, userId, mt))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return { q, mt };
	}

	async assertSuaMucTieu(
		userId: string,
		objectiveId: string,
		client: Prisma.TransactionClient | Db = this.db,
	) {
		return (await this.assertSuaMucTieuCoQuyen(userId, objectiveId, client)).mt;
	}

	async assertSuaKr(
		userId: string,
		keyResultId: string,
		client: Prisma.TransactionClient | Db = this.db,
	) {
		const kr = await client.okrKeyResult.findUnique({
			where: { id: keyResultId },
			include: { objective: { select: chonDonVi } },
		});
		if (!kr) throw new NotFoundException(OKR.thongDiep.khongCoKr(keyResultId));
		const objective = donViCua(kr.objective);
		if (kr.ownerUserId === userId) return { ...kr, objective };
		const q = await this.quyen(userId);
		if (!this.ghiDuocKr(q, userId, { ownerUserId: kr.ownerUserId, objective }))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocKr);
		return { ...kr, objective };
	}
}
