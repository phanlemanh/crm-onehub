import {
	isWorkspaceAdmin,
	NOT_A_MEMBER,
	type WorkspaceRole,
	workspaceRoleOf,
} from "@crm/auth";
import type { Db } from "@crm/db";
import { CAP_MUC_TIEU, type CapMucTieu } from "@crm/validation/okr-muc-tieu";
import {
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
	truongBoPhan: Set<string>;
	truongPhongBan: Set<string>;
	boPhanCua: Map<string, string | null>;
	phongBanChinh: Map<string, string | null>;
	cay: TreeOutput;
};

const capMucTieu = z.enum(CAP_MUC_TIEU);

const chonDonVi = {
	id: true,
	cycleId: true,
	level: true,
	divisionId: true,
	departmentId: true,
	personUserId: true,
	status: true,
} as const;

function donViCua<T extends { level: string }>(
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
		const cay = await this.toChuc.tree();
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
			truongBoPhan,
			truongPhongBan,
			boPhanCua: new Map(moiPb.map((p) => [p.id, p.divisionId])),
			phongBanChinh: new Map(
				cay.people.map((n) => [n.id, n.primaryDepartmentId]),
			),
			cay,
		};
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

	async assertQuanTri(userId: string): Promise<void> {
		if (!isWorkspaceAdmin(await workspaceRoleOf(userId)))
			throw new ForbiddenException(OKR.thongDiep.canQuyenQuanTri);
	}

	async assertSuaDonVi(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!this.suaDuocDonVi(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	async assertNhapDuoc(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!q.quanTri && !this.suaDuocDonVi(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	async assertSuaMucTieu(userId: string, objectiveId: string) {
		const row = await this.db.okrObjective.findUnique({
			where: { id: objectiveId },
			select: chonDonVi,
		});
		if (!row)
			throw new NotFoundException(OKR.thongDiep.khongCoMucTieu(objectiveId));
		const mt = donViCua(row);
		await this.assertSuaDonVi(userId, mt);
		return mt;
	}

	async assertSuaKr(userId: string, keyResultId: string) {
		const kr = await this.db.okrKeyResult.findUnique({
			where: { id: keyResultId },
			include: { objective: { select: chonDonVi } },
		});
		if (!kr) throw new NotFoundException(OKR.thongDiep.khongCoKr(keyResultId));
		const objective = donViCua(kr.objective);
		if (kr.ownerUserId === userId) return { ...kr, objective };
		const q = await this.quyen(userId);
		if (!this.suaDuocDonVi(q, userId, objective))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocKr);
		return { ...kr, objective };
	}
}
