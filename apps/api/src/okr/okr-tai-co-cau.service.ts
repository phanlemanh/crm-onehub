import type { Db, Prisma } from "@crm/db";
import { dieuKienOkrMo, PHA_CHUYEN_DUOC } from "@crm/db/okr-don-vi";
import { dieuKienXemMucTieu, type NguCanhXem } from "@crm/db/okr-hien-thi";
import { readTenGoc } from "@crm/db/workspace";
import {
	type ChuyenDonViInput,
	type LyDoMoCoi,
	type MoCoiInput,
	MUC_HIEN_THI,
	type MucHienThi,
} from "@crm/validation/okr-hien-thi";
import type { CapMucTieu } from "@crm/validation/okr-muc-tieu";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type { TreeOutput } from "../to-chuc/to-chuc.contracts";
import type {
	ChuyenDonViOutput,
	ChuyenDonViXemTruocOutput,
	MucMoCoi,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { donViCua, OkrAccessService, type Quyen } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const DA_BO = "da-bo";
const PHA_CHUYEN: readonly string[] = PHA_CHUYEN_DUOC;

type Tx = Prisma.TransactionClient;
type DonViNhan = ChuyenDonViInput["denDonVi"];
type PhongBanCay = TreeOutput["chuaXep"][number];
type BoPhanCay = TreeOutput["divisions"][number];

const mucHienThi = z.enum(MUC_HIEN_THI);

export const cauVuotTran = (v: { soSau: number; tran: number } | null) =>
	v ? T.taiCoCau.vuotTran(v.soSau, v.tran) : null;

type MucTieuMoCoi = {
	id: string;
	title: string;
	level: CapMucTieu;
	departmentId: string | null;
	divisionId: string | null;
	personUserId: string | null;
	ownerUserId: string;
	keyResults: { ownerUserId: string }[];
	hienThi: MucHienThi;
	soNguoiXem: number;
};

type CayMoCoi = {
	thanhVien: ReadonlySet<string>;
	phongBan: ReadonlyMap<string, PhongBanCay>;
	boPhan: ReadonlyMap<string, BoPhanCay>;
	tenLuuTru: ReadonlyMap<string, string>;
	tenNguoi: ReadonlyMap<string, string>;
	tenGoc: string;
};

type DonViMoCoi = {
	donVi: MucMoCoi["donVi"];
	luuTru: boolean;
	khongAiSua: boolean;
};

const cotDonVi = (dv: DonViNhan) =>
	dv.level === "phong-ban" ? "departmentId" : "divisionId";

const ghiDonVi = (dv: DonViNhan, id: string) =>
	dv.level === "phong-ban" ? { departmentId: id } : { divisionId: id };

function khongDonVi(level: CapMucTieu): DonViMoCoi {
	return {
		donVi: { level, id: null, ten: T.taiCoCau.khongDonVi },
		luuTru: false,
		khongAiSua: true,
	};
}

function donViMoCoi(mt: MucTieuMoCoi, cay: CayMoCoi): DonViMoCoi {
	switch (mt.level) {
		case "phong-ban": {
			const id = mt.departmentId;
			if (id === null) return khongDonVi(mt.level);
			const pb = cay.phongBan.get(id);
			const bp = pb?.divisionId ? cay.boPhan.get(pb.divisionId) : undefined;
			return {
				donVi: {
					level: mt.level,
					id,
					ten: pb?.name ?? cay.tenLuuTru.get(id) ?? id,
				},
				luuTru: pb === undefined,
				khongAiSua: pb !== undefined && pb.head === null && !bp?.head,
			};
		}
		case "bo-phan": {
			const id = mt.divisionId;
			if (id === null) return khongDonVi(mt.level);
			const bp = cay.boPhan.get(id);
			return {
				donVi: {
					level: mt.level,
					id,
					ten: bp?.name ?? cay.tenLuuTru.get(id) ?? id,
				},
				luuTru: bp === undefined,
				khongAiSua: bp !== undefined && bp.head === null,
			};
		}
		case "ca-nhan": {
			const id = mt.personUserId;
			if (id === null) return khongDonVi(mt.level);
			return {
				donVi: { level: mt.level, id, ten: cay.tenNguoi.get(id) ?? id },
				luuTru: false,
				khongAiSua: !cay.thanhVien.has(id),
			};
		}
		case "onehub":
			return {
				donVi: { level: mt.level, id: null, ten: cay.tenGoc },
				luuTru: false,
				khongAiSua: false,
			};
	}
}

function lyDoMoCoi(mt: MucTieuMoCoi, cay: CayMoCoi): MucMoCoi | null {
	const dv = donViMoCoi(mt, cay);
	const roi = (u: string) => !cay.thanhVien.has(u);
	const lyDo: LyDoMoCoi[] = [
		...(dv.luuTru ? (["don-vi-luu-tru"] as const) : []),
		...(dv.khongAiSua ? (["khong-ai-sua"] as const) : []),
		...(roi(mt.ownerUserId) ? (["phu-trach-roi"] as const) : []),
		...(mt.keyResults.some((k) => roi(k.ownerUserId))
			? (["kr-phu-trach-roi"] as const)
			: []),
	];
	if (lyDo.length === 0) return null;
	return {
		objectiveId: mt.id,
		tieuDe: mt.title,
		donVi: dv.donVi,
		lyDo,
		hienThi: mt.hienThi,
		soNguoiXem: mt.soNguoiXem,
	};
}

@Injectable()
export class OkrTaiCoCauService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	private async quyenQuanTri(userId: string): Promise<Quyen> {
		const q = await this.quyenOkr.quyen(userId);
		if (!q.quanTri) throw new ForbiddenException(T.taiCoCau.canQuanTri);
		return q;
	}

	private async khoaDonViNhan(tx: Tx, dv: DonViNhan): Promise<void> {
		const hang =
			dv.level === "phong-ban"
				? await tx.$queryRaw<{ archivedAt: Date | null }[]>`
					SELECT "archivedAt" FROM "department" WHERE id = ${dv.id} FOR NO KEY UPDATE`
				: await tx.$queryRaw<{ archivedAt: Date | null }[]>`
					SELECT "archivedAt" FROM "division" WHERE id = ${dv.id} FOR NO KEY UPDATE`;
		const [dong] = hang;
		if (!dong) throw new BadRequestException(T.khongCoDonVi(dv.id));
		if (dong.archivedAt !== null)
			throw new BadRequestException(T.taiCoCau.donViNhanLuuTru);
	}

	private async khoaLo(tx: Tx, ids: string[], nc: NguCanhXem): Promise<void> {
		const ky = await tx.okrObjective.findMany({
			where: { AND: [{ id: { in: ids } }, dieuKienXemMucTieu(nc)] },
			select: { cycleId: true },
			distinct: ["cycleId"],
		});
		const kyIds = ky.map((k) => k.cycleId).sort();
		if (kyIds.length > 0)
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ANY(${kyIds}) ORDER BY id FOR UPDATE`;
		for (const id of kyIds) await this.okr.assertKyChuaAn(tx, id);
		await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ANY(${[...ids].sort()}) ORDER BY id FOR UPDATE`;
	}

	private async vuotTran(
		tx: Tx,
		dv: DonViNhan,
		chuKy: string[],
		them: ReadonlyMap<string, number> = new Map(),
	): Promise<{ soSau: number; tran: number } | null> {
		if (chuKy.length === 0) return null;
		const ct = await this.okr.program(tx);
		const nhom = await tx.okrObjective.groupBy({
			by: ["cycleId"],
			where: {
				cycleId: { in: chuKy },
				level: dv.level,
				...ghiDonVi(dv, dv.id),
				status: { not: DA_BO },
			},
			_count: { _all: true },
		});
		const dem = new Map(nhom.map((n) => [n.cycleId, n._count._all]));
		const nhieuNhat = Math.max(
			0,
			...chuKy.map((k) => (dem.get(k) ?? 0) + (them.get(k) ?? 0)),
		);
		return nhieuNhat > ct.objectiveCap
			? { soSau: nhieuNhat, tran: ct.objectiveCap }
			: null;
	}

	private async kiemChuyen(
		tx: Tx,
		nc: NguCanhXem,
		den: DonViNhan,
		ids: string[],
	) {
		const hang = await tx.okrObjective.findMany({
			where: { AND: [{ id: { in: ids } }, dieuKienXemMucTieu(nc)] },
			select: {
				id: true,
				title: true,
				cycleId: true,
				level: true,
				departmentId: true,
				divisionId: true,
				personUserId: true,
				status: true,
				cycle: { select: { phase: true } },
			},
		});
		const theoMa = new Map(hang.map((h) => [h.id, h]));
		return ids.map((id) => {
			const h = theoMa.get(id);
			if (!h) throw new BadRequestException(T.khongCoMucTieu(id));
			const mt = donViCua(h);
			if (mt.level !== den.level)
				throw new BadRequestException(T.taiCoCau.khacCap(mt.title));
			if (mt.status === DA_BO)
				throw new BadRequestException(T.taiCoCau.daBo(mt.title));
			if (!PHA_CHUYEN.includes(mt.cycle.phase))
				throw new BadRequestException(T.taiCoCau.kyDaDong(mt.title));
			return mt;
		});
	}

	async chuyenDonViXemTruoc(
		userId: string,
		input: ChuyenDonViInput,
	): Promise<ChuyenDonViXemTruocOutput> {
		const q = await this.quyenQuanTri(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const den = input.denDonVi;
		const cot = cotDonVi(den);
		const chuyen = (
			await this.kiemChuyen(this.db, nc, den, [...new Set(input.objectiveIds)])
		).filter((mt) => mt[cot] !== den.id);
		const them = new Map<string, number>();
		for (const mt of chuyen)
			them.set(mt.cycleId, (them.get(mt.cycleId) ?? 0) + 1);
		return {
			vuotTran: await this.vuotTran(this.db, den, [...them.keys()], them),
		};
	}

	async chuyenDonVi(
		userId: string,
		input: ChuyenDonViInput,
	): Promise<ChuyenDonViOutput> {
		const q = await this.quyenQuanTri(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const den = input.denDonVi;
		const cot = cotDonVi(den);
		const ids = [...new Set(input.objectiveIds)];
		return this.db.$transaction(async (tx) => {
			await this.khoaDonViNhan(tx, den);
			await this.khoaLo(tx, ids, nc);
			const chuyen = (await this.kiemChuyen(tx, nc, den, ids)).filter(
				(mt) => mt[cot] !== den.id,
			);
			for (const mt of chuyen) {
				await tx.okrObjective.update({
					where: { id: mt.id },
					data: ghiDonVi(den, den.id),
				});
				await this.okr.vet(
					tx,
					userId,
					"chuyen-don-vi",
					{ objectiveId: mt.id },
					{ [cot]: mt[cot] },
					{ [cot]: den.id },
				);
			}
			return {
				daChuyen: chuyen.length,
				canhBao: cauVuotTran(
					await this.vuotTran(tx, den, [
						...new Set(chuyen.map((mt) => mt.cycleId)),
					]),
				),
			};
		});
	}

	async moCoi(userId: string, input: MoCoiInput): Promise<MucMoCoi[]> {
		const q = await this.quyenQuanTri(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const hang = await this.db.okrObjective.findMany({
			where: {
				AND: [
					dieuKienXemMucTieu(nc),
					dieuKienOkrMo,
					input.cycleId === undefined ? {} : { cycleId: input.cycleId },
				],
			},
			select: {
				id: true,
				title: true,
				level: true,
				departmentId: true,
				divisionId: true,
				personUserId: true,
				ownerUserId: true,
				keyResults: { select: { ownerUserId: true } },
				hienThi: true,
				_count: { select: { nguoiXem: true } },
			},
			orderBy: [{ cycleId: "asc" }, { position: "asc" }, { id: "asc" }],
		});
		const cay = await this.cayMoCoi(
			q.cay,
			hang.flatMap((h) => (h.personUserId ? [h.personUserId] : [])),
		);
		return hang.flatMap(({ _count, hienThi, ...h }) => {
			const muc = lyDoMoCoi(
				{
					...donViCua(h),
					hienThi: mucHienThi.parse(hienThi),
					soNguoiXem: _count.nguoiXem,
				},
				cay,
			);
			return muc ? [muc] : [];
		});
	}

	private async cayMoCoi(cay: TreeOutput, nguoi: string[]): Promise<CayMoCoi> {
		const thanhVien = new Set(cay.people.map((p) => p.id));
		const roi = [...new Set(nguoi)].filter((u) => !thanhVien.has(u));
		const daRoi =
			roi.length === 0
				? []
				: await this.db.user.findMany({
						where: { id: { in: roi } },
						select: { id: true, name: true },
					});
		return {
			thanhVien,
			phongBan: new Map(
				[...cay.divisions.flatMap((b) => b.departments), ...cay.chuaXep].map(
					(p) => [p.id, p],
				),
			),
			boPhan: new Map(cay.divisions.map((b) => [b.id, b])),
			tenLuuTru: new Map(
				[...cay.archived.departments, ...cay.archived.divisions].map((d) => [
					d.id,
					d.name,
				]),
			),
			tenNguoi: new Map([...cay.people, ...daRoi].map((p) => [p.id, p.name])),
			tenGoc: await readTenGoc(this.db),
		};
	}
}
