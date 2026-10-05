import {
	canManageOrganization,
	WORKSPACE_ID,
	workspaceRoleOf,
} from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { demOkrCuaDonVi, demOkrTheoDonVi } from "@crm/db/okr-don-vi";
import { parseOnboardingTemplateSteps } from "@crm/validation/onboarding-template";
import { chucDanh as chucDanhKhuon, moTaDonVi } from "@crm/validation/to-chuc";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { type CayTho, dungCay } from "./cay";
import { khoa, phanTichLo, type SnapNhap, tachDong } from "./nhap";
import type {
	AddPeopleInput,
	AttachInput,
	DepartmentCreateInput,
	DepartmentMoveInput,
	HeadInput,
	ImportApplyOutput,
	ImportPreviewOutput,
	KetQuaKhoiPhuc,
	LyDoChanLuuTru,
	PlacementInput,
	RenameInput,
	TreeOutput,
} from "./to-chuc.contracts";
import { TO_CHUC } from "./to-chuc-config";
import { lyDoKhongXoaPhongBan } from "./xoa-phong-ban";

const T = TO_CHUC.thongDiep;

type Tx = Prisma.TransactionClient;

export function kiemTen(ten: string): string {
	const sach = ten.trim();
	if (sach === "") throw new BadRequestException(T.tenTrong);
	if (sach.length > TO_CHUC.ten.toiDa)
		throw new BadRequestException(T.tenDai(TO_CHUC.ten.toiDa));
	return sach;
}

export function kiemMoTa(chu: string): string {
	const sach = chu.normalize("NFC").trim();
	if (!moTaDonVi.safeParse(sach).success)
		throw new BadRequestException(T.moTaDai(TO_CHUC.moTa.toiDa));
	return sach;
}

export function kiemChucDanh(chu: string): string {
	const sach = chu.normalize("NFC").trim();
	if (!chucDanhKhuon.safeParse(sach).success)
		throw new BadRequestException(T.chucDanhDai(TO_CHUC.chucDanh.toiDa));
	return sach;
}

@Injectable()
export class ToChucService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async access(userId: string) {
		return { canManage: canManageOrganization(await workspaceRoleOf(userId)) };
	}

	async yeuCauQuanTri(userId: string): Promise<void> {
		if (!canManageOrganization(await workspaceRoleOf(userId))) {
			throw new ForbiddenException(T.canQuyenQuanTri);
		}
	}

	async anhCay(): Promise<CayTho> {
		const [
			members,
			divisions,
			departments,
			placements,
			secondaries,
			khuon,
			okr,
		] = await Promise.all([
			this.db.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, name: true, email: true } } },
			}),
			this.db.division.findMany({
				select: {
					id: true,
					name: true,
					moTa: true,
					position: true,
					headUserId: true,
					archivedAt: true,
					_count: { select: { departments: true } },
				},
			}),
			this.db.department.findMany({
				select: {
					id: true,
					name: true,
					moTa: true,
					position: true,
					divisionId: true,
					headUserId: true,
					archivedAt: true,
					_count: { select: { steps: true } },
				},
			}),
			this.db.orgPlacement.findMany({
				select: {
					userId: true,
					primaryDepartmentId: true,
					managerUserId: true,
					chucDanh: true,
				},
			}),
			this.db.orgSecondaryDepartment.findMany({
				select: { userId: true, departmentId: true },
			}),
			this.db.onboardingTemplate.findMany({
				orderBy: { createdAt: "asc" },
				select: { name: true, steps: true },
			}),
			demOkrTheoDonVi(this.db),
		]);
		return {
			members: members.map((m) => m.user),
			divisions: divisions.map(({ _count, ...d }) => ({
				...d,
				departmentCount: _count.departments,
			})),
			departments: departments.map(({ _count, ...d }) => ({
				...d,
				stepCount: _count.steps,
			})),
			placements,
			secondaries,
			khuonCuaPhongBan: khuon.reduce((banDo, k) => {
				for (const id of new Set(
					parseOnboardingTemplateSteps(k.steps).map((b) => b.departmentId),
				))
					banDo.set(id, [...(banDo.get(id) ?? []), k.name]);
				return banDo;
			}, new Map<string, string[]>()),
			okr,
		};
	}

	async tree(): Promise<TreeOutput> {
		return dungCay(await this.anhCay());
	}

	private async tenKhongTrung(
		bang: "division" | "department",
		ten: string,
		boQua: string | null,
	): Promise<void> {
		const where = {
			archivedAt: null,
			name: { equals: ten, mode: "insensitive" as const },
			id: { not: boQua ?? "" },
		};
		const trung =
			bang === "division"
				? await this.db.division.findFirst({ where, select: { id: true } })
				: await this.db.department.findFirst({ where, select: { id: true } });
		if (trung) throw new BadRequestException(T.tenTrung(ten));
	}

	private async boPhanSong(id: string) {
		const d = await this.db.division.findUnique({
			where: { id },
			select: { id: true, archivedAt: true },
		});
		if (!d) throw new NotFoundException(T.khongCoBoPhan(id));
		return d;
	}

	private async phongBanCo(id: string) {
		const d = await this.db.department.findUnique({
			where: { id },
			select: { id: true, archivedAt: true, divisionId: true },
		});
		if (!d) throw new NotFoundException(T.khongCoPhongBan(id));
		return d;
	}

	async createDivision(input: { name: string }) {
		const ten = kiemTen(input.name);
		await this.tenKhongTrung("division", ten, null);
		const cuoi = await this.db.division.findFirst({
			orderBy: { position: "desc" },
			select: { position: true },
		});
		return this.db.division.create({
			data: { name: ten, position: (cuoi?.position ?? -1) + 1 },
			select: { id: true },
		});
	}

	async renameDivision(input: RenameInput) {
		const ten = kiemTen(input.name);
		const moTa = input.moTa === undefined ? undefined : kiemMoTa(input.moTa);
		await this.boPhanSong(input.id);
		await this.tenKhongTrung("division", ten, input.id);
		return this.db.division.update({
			where: { id: input.id },
			data: { name: ten, moTa },
			select: { id: true },
		});
	}

	async reorderDivisions(input: { ids: string[] }) {
		const song = await this.db.division.findMany({
			where: { archivedAt: null },
			select: { id: true },
		});
		const gui = new Set(input.ids);
		if (
			gui.size !== input.ids.length ||
			gui.size !== song.length ||
			song.some((d) => !gui.has(d.id))
		)
			throw new BadRequestException(T.thuTuBoPhanLech);
		await this.db.$transaction(
			input.ids.map((id, viTri) =>
				this.db.division.update({ where: { id }, data: { position: viTri } }),
			),
		);
		return { id: input.ids[0] as string };
	}

	async archiveDivision(input: { id: string }) {
		await this.boPhanSong(input.id);
		const con = await this.db.department.count({
			where: { divisionId: input.id, archivedAt: null },
		});
		if (con > 0) throw new BadRequestException(T.boPhanConPhongBan(con));
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "division" WHERE id = ${input.id} FOR NO KEY UPDATE`;
			const { mo } = await demOkrCuaDonVi(tx, { divisionId: input.id });
			if (mo > 0) throw new BadRequestException(T.boPhanConOkrMo(mo));
			return tx.division.update({
				where: { id: input.id },
				data: { archivedAt: new Date() },
				select: { id: true },
			});
		});
	}

	private async tenDangDung(
		bang: "division" | "department",
		ten: string,
		boQua: string,
	): Promise<string | null> {
		const where = {
			archivedAt: null,
			name: { equals: ten, mode: "insensitive" as const },
			id: { not: boQua },
		};
		const trung =
			bang === "division"
				? await this.db.division.findFirst({ where, select: { name: true } })
				: await this.db.department.findFirst({
						where,
						select: { name: true },
					});
		return trung?.name ?? null;
	}

	async restoreDivision(input: { id: string }): Promise<KetQuaKhoiPhuc> {
		await this.boPhanSong(input.id);
		const bp = await this.db.division.findUniqueOrThrow({
			where: { id: input.id },
			select: { name: true },
		});
		const trung = await this.tenDangDung("division", bp.name, input.id);
		if (trung !== null) return { chan: { loai: "trung-ten", ten: trung } };
		return this.db.division.update({
			where: { id: input.id },
			data: { archivedAt: null },
			select: { id: true },
		});
	}

	async purgeDivision(input: { id: string }) {
		const d = await this.boPhanSong(input.id);
		if (d.archivedAt === null) throw new BadRequestException(T.chuaLuuTru);
		const con = await this.db.department.count({
			where: { divisionId: input.id },
		});
		if (con > 0) throw new BadRequestException(T.boPhanConTro);
		return this.db.$transaction(async (tx) => {
			const { lichSu } = await demOkrCuaDonVi(tx, { divisionId: input.id });
			if (lichSu > 0) throw new BadRequestException(T.boPhanConOkrXoa(lichSu));
			return tx.division.delete({
				where: { id: input.id },
				select: { id: true },
			});
		});
	}

	async createDepartment(input: DepartmentCreateInput) {
		const ten = kiemTen(input.name);
		if (input.divisionId !== null) {
			const bp = await this.boPhanSong(input.divisionId);
			if (bp.archivedAt !== null)
				throw new BadRequestException(T.boPhanDaLuuTru);
		}
		await this.tenKhongTrung("department", ten, null);
		const cuoi = await this.db.department.findFirst({
			orderBy: { position: "desc" },
			select: { position: true },
		});
		return this.db.department.create({
			data: {
				name: ten,
				position: (cuoi?.position ?? -1) + 1,
				divisionId: input.divisionId,
			},
			select: { id: true },
		});
	}

	async renameDepartment(input: RenameInput) {
		const ten = kiemTen(input.name);
		const moTa = input.moTa === undefined ? undefined : kiemMoTa(input.moTa);
		await this.phongBanCo(input.id);
		await this.tenKhongTrung("department", ten, input.id);
		return this.db.department.update({
			where: { id: input.id },
			data: { name: ten, moTa },
			select: { id: true },
		});
	}

	async moveDepartment(input: DepartmentMoveInput) {
		const pb = await this.phongBanCo(input.id);
		if (pb.archivedAt !== null)
			throw new BadRequestException(T.phongBanDaLuuTru);
		if (input.divisionId !== null) {
			const bp = await this.boPhanSong(input.divisionId);
			if (bp.archivedAt !== null)
				throw new BadRequestException(T.boPhanDaLuuTru);
		}
		const cung = await this.db.department.findMany({
			where: {
				divisionId: input.divisionId,
				archivedAt: null,
				NOT: { id: input.id },
			},
			orderBy: [{ position: "asc" }, { name: "asc" }],
			select: { id: true },
		});
		const thuTu = cung.map((d) => d.id);
		thuTu.splice(Math.min(input.index, thuTu.length), 0, input.id);
		await this.db.$transaction([
			this.db.department.update({
				where: { id: input.id },
				data: { divisionId: input.divisionId },
			}),
			...thuTu.map((id, viTri) =>
				this.db.department.update({ where: { id }, data: { position: viTri } }),
			),
		]);
		return { id: input.id };
	}

	private async khuonChua(id: string) {
		const khuon = await this.db.onboardingTemplate.findMany({
			orderBy: { createdAt: "asc" },
			select: { name: true, steps: true, archivedAt: true },
		});
		return khuon
			.filter((k) =>
				parseOnboardingTemplateSteps(k.steps).some(
					(b) => b.departmentId === id,
				),
			)
			.map((k) => ({ name: k.name, archived: k.archivedAt !== null }));
	}

	private async lyDoChanLuuTru(
		db: Prisma.TransactionClient,
		id: string,
	): Promise<LyDoChanLuuTru[]> {
		const song = (await this.khuonChua(id))
			.filter((k) => !k.archived)
			.map((k) => k.name);
		const conNguoi = await db.orgPlacement.count({
			where: {
				primaryDepartmentId: id,
				user: { members: { some: { organizationId: WORKSPACE_ID } } },
			},
		});
		const { mo } = await demOkrCuaDonVi(db, { departmentId: id });
		return [
			...(song.length > 0
				? [
						{
							loai: "khuon" as const,
							khuon: song,
							cau: T.phongBanTrongKhuon(song),
						},
					]
				: []),
			...(conNguoi > 0
				? [
						{
							loai: "nguoi" as const,
							so: conNguoi,
							cau: T.phongBanConNguoi(conNguoi),
						},
					]
				: []),
			...(mo > 0
				? [{ loai: "okr" as const, so: mo, cau: T.phongBanConOkrMo(mo) }]
				: []),
		];
	}

	async luuTruXemTruoc(input: { id: string }) {
		await this.phongBanCo(input.id);
		return { lyDo: await this.lyDoChanLuuTru(this.db, input.id) };
	}

	async archiveDepartment(input: { id: string }) {
		await this.phongBanCo(input.id);
		await this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "department" WHERE id = ${input.id} FOR NO KEY UPDATE`;
			const [lyDo] = await this.lyDoChanLuuTru(tx, input.id);
			if (lyDo !== undefined) throw new BadRequestException(lyDo.cau);
			await tx.department.update({
				where: { id: input.id },
				data: { archivedAt: new Date() },
			});
		});
		return {
			id: input.id,
			purgeable: (await this.lyDoKhongXoa(input.id)) === null,
		};
	}

	async restoreDepartment(input: { id: string }): Promise<KetQuaKhoiPhuc> {
		const pb = await this.phongBanCo(input.id);
		if (pb.divisionId !== null) {
			const bp = await this.db.division.findUniqueOrThrow({
				where: { id: pb.divisionId },
				select: { name: true, archivedAt: true },
			});
			if (bp.archivedAt !== null)
				return { chan: { loai: "cha-luu-tru", ten: bp.name } };
		}
		const ten = await this.db.department.findUniqueOrThrow({
			where: { id: input.id },
			select: { name: true },
		});
		const trung = await this.tenDangDung("department", ten.name, input.id);
		if (trung !== null) return { chan: { loai: "trung-ten", ten: trung } };
		return this.db.department.update({
			where: { id: input.id },
			data: { archivedAt: null },
			select: { id: true },
		});
	}

	private async lyDoKhongXoa(id: string, tx: Tx | Db = this.db) {
		const pb = await this.phongBanCo(id);
		const stepCount = await tx.onboardingStep.count({
			where: { departmentId: id },
		});
		const primaryCount = await tx.orgPlacement.count({
			where: { primaryDepartmentId: id },
		});
		const khuon = await this.khuonChua(id);
		const okr = await demOkrCuaDonVi(tx, { departmentId: id });
		return lyDoKhongXoaPhongBan({
			archived: pb.archivedAt !== null,
			stepCount,
			primaryCount,
			khuon: khuon.map((k) => k.name),
			okrLichSu: okr.lichSu,
		});
	}

	async purgeDepartment(input: { id: string }) {
		return this.db.$transaction(async (tx) => {
			const lyDo = await this.lyDoKhongXoa(input.id, tx);
			if (lyDo !== null) throw new BadRequestException(lyDo);
			return tx.department.delete({
				where: { id: input.id },
				select: { id: true },
			});
		});
	}

	async attachDepartments(input: AttachInput) {
		const bp = await this.boPhanSong(input.divisionId);
		if (bp.archivedAt !== null) throw new BadRequestException(T.boPhanDaLuuTru);
		const ids = [...new Set(input.departmentIds)];
		const pbs = await this.db.department.findMany({
			where: { id: { in: ids } },
			select: { id: true, archivedAt: true },
		});
		for (const id of ids) {
			const pb = pbs.find((p) => p.id === id);
			if (!pb) throw new NotFoundException(T.khongCoPhongBan(id));
			if (pb.archivedAt !== null)
				throw new BadRequestException(T.phongBanDaLuuTru);
		}
		const cu = await this.db.department.findMany({
			where: { divisionId: input.divisionId, archivedAt: null },
			orderBy: [{ position: "asc" }, { name: "asc" }],
			select: { id: true },
		});
		const thuTu = [
			...cu.map((d) => d.id),
			...ids.filter((id) => !cu.some((d) => d.id === id)),
		];
		await this.db.$transaction(
			thuTu.map((id, viTri) =>
				this.db.department.update({
					where: { id },
					data: { divisionId: input.divisionId, position: viTri },
				}),
			),
		);
		return { id: input.divisionId };
	}

	async addPeople(input: AddPeopleInput) {
		const pb = await this.phongBanCo(input.departmentId);
		if (pb.archivedAt !== null)
			throw new BadRequestException(T.phongBanDaLuuTru);
		const ids = [...new Set(input.userIds)];
		const members = await this.db.member.findMany({
			where: { organizationId: WORKSPACE_ID, userId: { in: ids } },
			select: { userId: true },
		});
		for (const id of ids)
			if (!members.some((m) => m.userId === id))
				throw new BadRequestException(T.khongPhaiThanhVien(id));
		await this.db.$transaction([
			...ids.map((userId) =>
				this.db.orgPlacement.upsert({
					where: { userId },
					create: { userId, primaryDepartmentId: input.departmentId },
					update: { primaryDepartmentId: input.departmentId },
				}),
			),
			this.db.orgSecondaryDepartment.deleteMany({
				where: { userId: { in: ids }, departmentId: input.departmentId },
			}),
		]);
		return { id: input.departmentId };
	}

	private async thanhVienHieuLuc(userId: string): Promise<void> {
		const m = await this.db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId },
			},
			select: { id: true },
		});
		if (!m) throw new BadRequestException(T.khongPhaiThanhVien(userId));
	}

	async setHead(input: HeadInput) {
		if (input.kind === "division") {
			const bp = await this.boPhanSong(input.id);
			if (bp.archivedAt !== null)
				throw new BadRequestException(T.boPhanDaLuuTru);
			if (input.userId !== null) await this.thanhVienHieuLuc(input.userId);
			return this.db.division.update({
				where: { id: input.id },
				data: { headUserId: input.userId },
				select: { id: true },
			});
		}
		const pb = await this.phongBanCo(input.id);
		if (pb.archivedAt !== null)
			throw new BadRequestException(T.phongBanDaLuuTru);
		if (input.userId !== null) {
			await this.thanhVienHieuLuc(input.userId);
			const [chinh, phu] = await Promise.all([
				this.db.orgPlacement.findFirst({
					where: { userId: input.userId, primaryDepartmentId: input.id },
					select: { userId: true },
				}),
				this.db.orgSecondaryDepartment.findFirst({
					where: { userId: input.userId, departmentId: input.id },
					select: { userId: true },
				}),
			]);
			if (!chinh && !phu) throw new BadRequestException(T.truongNgoaiPhongBan);
		}
		return this.db.department.update({
			where: { id: input.id },
			data: { headUserId: input.userId },
			select: { id: true },
		});
	}

	async setPlacement(input: PlacementInput) {
		const chucDanh =
			input.chucDanh === undefined ? undefined : kiemChucDanh(input.chucDanh);
		await this.thanhVienHieuLuc(input.userId);
		const phu = [...new Set(input.secondaryDepartmentIds)];
		if (
			input.primaryDepartmentId !== null &&
			phu.includes(input.primaryDepartmentId)
		) {
			throw new BadRequestException(T.phuTrungChinh);
		}
		for (const id of [input.primaryDepartmentId, ...phu]) {
			if (id === null) continue;
			const pb = await this.phongBanCo(id);
			if (pb.archivedAt !== null)
				throw new BadRequestException(T.phongBanDaLuuTru);
		}
		if (input.managerUserId !== null) {
			if (input.managerUserId === input.userId) {
				throw new BadRequestException(T.quanLyLaChinhMinh);
			}
			await this.thanhVienHieuLuc(input.managerUserId);
		}
		await this.db.$transaction([
			this.db.orgPlacement.upsert({
				where: { userId: input.userId },
				create: {
					userId: input.userId,
					primaryDepartmentId: input.primaryDepartmentId,
					managerUserId: input.managerUserId,
					chucDanh,
				},
				update: {
					primaryDepartmentId: input.primaryDepartmentId,
					managerUserId: input.managerUserId,
					chucDanh,
				},
			}),
			this.db.orgSecondaryDepartment.deleteMany({
				where: { userId: input.userId },
			}),
			this.db.orgSecondaryDepartment.createMany({
				data: phu.map((departmentId) => ({
					userId: input.userId,
					departmentId,
				})),
			}),
		]);
		return { id: input.userId };
	}
	private async snapNhap(
		tx: Pick<Db, "member" | "department" | "division"> = this.db,
	): Promise<SnapNhap> {
		const [members, departments, divisions] = await Promise.all([
			tx.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, email: true } } },
			}),
			tx.department.findMany({
				where: { archivedAt: null },
				orderBy: { position: "asc" },
				select: { id: true, name: true, divisionId: true },
			}),
			tx.division.findMany({
				where: { archivedAt: null },
				orderBy: { position: "asc" },
				select: { id: true, name: true },
			}),
		]);
		return { members: members.map((m) => m.user), departments, divisions };
	}

	private kiemLo(chu: string) {
		const soDong = tachDong(chu).length;
		if (soDong === 0) throw new BadRequestException(T.loRong);
		if (soDong > TO_CHUC.nhap.toiDaDong)
			throw new BadRequestException(T.loQuaDai(TO_CHUC.nhap.toiDaDong));
	}

	async previewImport(input: { text: string }): Promise<ImportPreviewOutput> {
		this.kiemLo(input.text);
		const kq = phanTichLo(input.text, await this.snapNhap());
		return { rows: kq.rows, summary: kq.summary, newNames: kq.newNames };
	}

	async applyImport(input: {
		text: string;
		traTen?: boolean;
	}): Promise<ImportApplyOutput> {
		this.kiemLo(input.text);
		return this.db.$transaction(async (tx) => {
			const kq = phanTichLo(input.text, await this.snapNhap(tx));
			if (kq.hopLe.length === 0)
				throw new BadRequestException(T.khongDongHopLe);
			const bpId = new Map<string, string>();
			let viTriBp =
				((
					await tx.division.findFirst({
						orderBy: { position: "desc" },
						select: { position: true },
					})
				)?.position ?? -1) + 1;
			const bpMoi: string[] = [];
			for (const h of kq.hopLe) {
				if (h.divisionName === null) continue;
				const k = khoa(h.divisionName);
				if (bpId.has(k)) continue;
				if (h.divisionId !== null) {
					bpId.set(k, h.divisionId);
					continue;
				}
				bpMoi.push(h.divisionName.trim());
				bpId.set(
					k,
					(
						await tx.division.create({
							data: { name: h.divisionName.trim(), position: viTriBp++ },
							select: { id: true },
						})
					).id,
				);
			}
			const pbId = new Map<string, string>();
			let viTriPb =
				((
					await tx.department.findFirst({
						orderBy: { position: "desc" },
						select: { position: true },
					})
				)?.position ?? -1) + 1;
			const pbMoi: string[] = [];
			for (const h of kq.hopLe) {
				const k = khoa(h.departmentName);
				const bp =
					h.divisionName === null
						? null
						: (bpId.get(khoa(h.divisionName)) ?? null);
				if (pbId.has(k)) continue;
				if (h.departmentId !== null) {
					pbId.set(k, h.departmentId);
					if (bp !== null)
						await tx.department.updateMany({
							where: {
								id: h.departmentId,
								OR: [
									{ divisionId: null },
									{ division: { is: { archivedAt: { not: null } } } },
								],
							},
							data: { divisionId: bp },
						});
					continue;
				}
				pbMoi.push(h.departmentName.trim());
				pbId.set(
					k,
					(
						await tx.department.create({
							data: {
								name: h.departmentName.trim(),
								position: viTriPb++,
								divisionId: bp,
							},
							select: { id: true },
						})
					).id,
				);
			}
			for (const h of kq.hopLe) {
				const pb = pbId.get(khoa(h.departmentName)) as string;
				await tx.orgPlacement.upsert({
					where: { userId: h.userId },
					create: { userId: h.userId, primaryDepartmentId: pb },
					update: { primaryDepartmentId: pb },
				});
				await tx.orgSecondaryDepartment.deleteMany({
					where: { userId: h.userId, departmentId: pb },
				});
				if (h.head === "phong-ban")
					await tx.department.update({
						where: { id: pb },
						data: { headUserId: h.userId },
					});
				if (h.head === "bo-phan") {
					const bp = (
						await tx.department.findUnique({
							where: { id: pb },
							select: { divisionId: true },
						})
					)?.divisionId;
					if (bp)
						await tx.division.update({
							where: { id: bp },
							data: { headUserId: h.userId },
						});
				}
			}
			const ra = {
				written: kq.hopLe.length,
				newDepartments: pbMoi.length,
				newDivisions: bpMoi.length,
			};
			return input.traTen
				? { ...ra, newNames: { departments: pbMoi, divisions: bpMoi } }
				: ra;
		});
	}
}
