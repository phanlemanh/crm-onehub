import type { Db, Prisma } from "@crm/db";
import { KY_CON_HIEN, tinhTrangGiu } from "@crm/db/okr-chu-ky-hien";
import {
	boGioiHan,
	dieuKienXemMucTieu,
	type NguCanhXem,
} from "@crm/db/okr-hien-thi";
import { lichSuMucTieu } from "@crm/db/okr-muc-tieu-lich-su";
import {
	chonChuKyHienTai,
	kyVongTheoNgay,
	tienDoMucTieu,
} from "@crm/db/okr-tien-do";
import { xepLuotAnSauKhiLuu } from "@crm/db/okr-tro-ly";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	capDichCanChinh,
	chuKyDichCanChinh,
} from "@crm/validation/okr-can-chinh";
import {
	type ChuKyInput,
	ghiDuocOPha,
	LOAI_CHU_KY,
	PHA_CHU_KY,
	type PhaChuKy,
	phaSau,
	viecChuKy,
} from "@crm/validation/okr-chu-ky";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgram,
	type OkrProgramSua,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import { MUC_HIEN_THI } from "@crm/validation/okr-hien-thi";
import {
	type KieuKr,
	kiemSoTheoKieu,
	kieuKr,
	NGUON_KR,
	tienDoKr,
} from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	type CapMucTieu,
	type DonViMucTieu,
	HANG_CAP,
	LOAI_MUC_TIEU,
	type MucTieuInput,
	type MucTieuUpdate,
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import {
	crmHopKieu,
	LOAI_NGUON_MAY,
	parseOkrNguon,
} from "@crm/validation/okr-nguon";
import {
	HANH_DONG_VET,
	type HanhDongVet,
	type OkrVetSnapshot,
	parseOkrVet,
} from "@crm/validation/okr-vet";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
	Optional,
} from "@nestjs/common";
import { z } from "zod";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import { khoa } from "../to-chuc/nhap";
import { dungCayCanChinh, LY_DO_TRONG, type LyDoCanChinh } from "./can-chinh";
import {
	anhVetViec,
	chonHangViec,
	hangViec,
	vetSangKienChoVai,
} from "./canh-kr";
import { chiaCuaToi, vaiCuaToi } from "./cua-toi";
import { demGopYCho } from "./dem-gop-y";
import { khoaDonViDong, tenDonVi } from "./don-vi";
import { MOC_SAU_KHOA_CHU_KY, type MocSauKhoa } from "./dong-ho";
import { locXemTrongVet, type PhamDoc, vetChoNguoiXem } from "./hien-thi";
import {
	type CuaSoRa,
	chotKyCham,
	cuaSoHieuLuc,
	cuaSoRaRa,
	hieuLucHomNay,
	hocTapChuaGhi,
	kiemDongKy,
} from "./khep";
import { dongLoOkr, phanTichLoOkr } from "./nhap";
import type {
	ChuKyOutput,
	CreateKrInput,
	DonViChon,
	KrOutput,
	MucTieuOutput,
	ObjectiveOutput,
	UpdateKrInput,
} from "./okr.contracts";
import {
	chonDonVi,
	type DonViCuaMucTieu,
	donViCua as donViCuaDong,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;
type GhiTrong = { note?: string };
type NguonDaQuaCong = {
	nguon: { id: string; cycleId: string; level: CapMucTieu };
	nc: NguCanhXem;
};
export type KrTrongGiaoDich = {
	tx: Tx;
	mt: { id: string; cycleId: string };
	note: string;
	sauThem?: OkrVetSnapshot;
};
type AlignmentInput = {
	objectiveId: string;
	targetObjectiveId: string | null;
	targetKeyResultId: string | null;
};
type LuotAn = {
	objectiveId: string;
	keyResultId: string | null;
	doiChu: boolean;
};

const loaiChuKy = z.enum(LOAI_CHU_KY);
const phaChuKy = z.enum(PHA_CHU_KY);
const capMucTieu = z.enum(CAP_MUC_TIEU);
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);
const nguonKr = z.enum(NGUON_KR);
const loaiNguonMay = z.enum(LOAI_NGUON_MAY);
const hanhDongVet = z.enum(HANH_DONG_VET);
const mucHienThi = z.enum(MUC_HIEN_THI);
const VET_DUYET: ReadonlySet<string> = new Set<HanhDongVet>([
	"gui-duyet",
	"duyet",
	"tra-lai",
	"rut-duyet",
]);

const chonNguoi = { id: true, name: true, email: true } as const;
const quanHeDonVi = {
	division: { select: { name: true } },
	department: { select: { name: true } },
	person: { select: { name: true } },
} as const;
export const chonTenDonVi = { level: true, ...quanHeDonVi } as const;
export const chonSoMay = {
	nguonMay: {
		select: {
			loai: true,
			chiSo: true,
			phamVi: true,
			bac: true,
			sheetId: true,
			sheetO: true,
			docLuc: true,
			docGiaTri: true,
			docLoi: true,
		},
	},
	soChup: {
		orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }],
		take: 1,
		select: { ngay: true, giaTri: true, nguon: true },
	},
} satisfies Prisma.OkrKeyResultInclude;
const chonMucTieu = {
	owner: { select: chonNguoi },
	participants: {
		include: { user: { select: chonNguoi } },
		orderBy: { createdAt: "asc" },
	},
	keyResults: {
		include: {
			owner: { select: chonNguoi },
			...chonSoMay,
		},
		orderBy: { position: "asc" },
	},
	alignments: {
		where: {
			OR: [
				{ targetObjective: boGioiHan },
				{ targetKeyResult: { objective: boGioiHan } },
			],
		},
		include: {
			targetObjective: { select: { title: true, ...chonTenDonVi } },
			targetKeyResult: {
				select: {
					title: true,
					objectiveId: true,
					objective: { select: { title: true, ...chonTenDonVi } },
				},
			},
		},
		orderBy: { createdAt: "asc" },
	},
	cycle: {
		select: {
			endsOn: true,
			breakStartsOn: true,
			breakEndsOn: true,
			phase: true,
		},
	},
	...quanHeDonVi,
} satisfies Prisma.OkrObjectiveInclude;

export function donViCua(unit: DonViMucTieu): DonViCuaMucTieu {
	return {
		level: unit.level,
		divisionId: unit.level === "bo-phan" ? unit.divisionId : null,
		departmentId: unit.level === "phong-ban" ? unit.departmentId : null,
		personUserId: unit.level === "ca-nhan" ? unit.personUserId : null,
	};
}

function donViChon(unit: DonViChon): DonViCuaMucTieu {
	switch (unit.loai) {
		case "goc":
			return donViCua({ level: "onehub" });
		case "bp":
			return donViCua({ level: "bo-phan", divisionId: unit.id });
		case "pb":
			return donViCua({ level: "phong-ban", departmentId: unit.id });
		case "nguoi":
			return donViCua({ level: "ca-nhan", personUserId: unit.id });
	}
}

function khoaDonVi(unit: DonViChon): string {
	return unit.loai === "goc" ? unit.loai : `${unit.loai}:${unit.id}`;
}

const soKr = (d: Prisma.Decimal | number) => Number(d);

function ghiKhac(
	truoc: OkrVetSnapshot,
	sau: OkrVetSnapshot,
	o: string,
	cu: string | number | null | string[],
	moi: string | number | null | string[] | undefined,
) {
	if (moi === undefined) return;
	if (JSON.stringify(cu) === JSON.stringify(moi)) return;
	truoc[o] = cu;
	sau[o] = moi;
}

export const ngay = (d: Date) => ngayVN(d);
export const toDate = (s: string) => new Date(`${s}T00:00:00Z`);

type ChupGanNhat = {
	ngay: Date;
	giaTri: Prisma.Decimal | number;
	nguon: string;
};

export type VetCongBo = {
	hanhDong: Extract<HanhDongVet, "cong-bo" | "duyet">;
	sau: OkrVetSnapshot;
};

export function vetCongBo(
	truoc: TrangThaiMucTieu,
	tuDuyet: boolean,
): VetCongBo {
	if (truoc === "cho-duyet")
		return tuDuyet
			? { hanhDong: "duyet", sau: { status: "cong-bo" } }
			: { hanhDong: "cong-bo", sau: { status: "cong-bo", tuChoDuyet: true } };
	return {
		hanhDong: "cong-bo",
		sau: tuDuyet ? { status: "cong-bo", tuDuyet: true } : { status: "cong-bo" },
	};
}

export function doCanhVaSoMay(
	nguon: string,
	nguonMay: { loai: string } | null,
	chup: ChupGanNhat | undefined,
) {
	return {
		doCanh: nguon === "tay" && nguonMay !== null,
		soMay:
			nguonMay !== null && chup && chup.nguon === nguonMay.loai
				? {
						giaTri: soKr(chup.giaTri),
						ngay: ngay(chup.ngay),
						nguon: loaiNguonMay.parse(chup.nguon),
					}
				: null,
	};
}

type ChuKyDong = {
	id: string;
	kind: string;
	name: string;
	parentId: string | null;
	startsOn: Date;
	endsOn: Date;
	phase: string;
	breakStartsOn: Date | null;
	breakEndsOn: Date | null;
	updateWeekday: number;
	anLuc: Date | null;
};

type GiuChuKy = { trong: boolean; quyConHien: number };

@Injectable()
export class OkrService {
	private readonly logger = new Logger(OkrService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(AgentTriggerService) private readonly trigger: AgentTriggerService,
		@Optional()
		@Inject(MOC_SAU_KHOA_CHU_KY)
		private readonly moc?: MocSauKhoa,
	) {}

	private async kichLuotAn(nguoiLuu: string, luot: LuotAn) {
		try {
			await xepLuotAnSauKhiLuu(this.db, {
				...luot,
				nguoiLuu,
				now: new Date(),
			});
		} catch (loi) {
			this.logger.warn({
				message: "Không xếp được lượt đề xuất ẩn sau khi lưu; lần lưu vẫn giữ",
				objectiveId: luot.objectiveId,
				keyResultId: luot.keyResultId,
				loi: loi instanceof Error ? loi.name : "khong-ro",
			});
		}
	}

	async access(userId: string) {
		const q = await this.quyenOkr.quyen(userId);
		return {
			canManageProgram: q.quanTriChuongTrinh,
			headOf: {
				divisions: [...q.truongBoPhan],
				departments: [...q.truongPhongBan],
			},
		};
	}

	private chuKyRa(
		c: ChuKyDong,
		cuaSoRa: CuaSoRa | null,
		giu: GiuChuKy,
		anLyDo: string | null,
	): ChuKyOutput {
		const kind = loaiChuKy.parse(c.kind);
		const phase = phaChuKy.parse(c.phase);
		return {
			id: c.id,
			kind,
			name: c.name,
			parentId: c.parentId,
			startsOn: ngay(c.startsOn),
			endsOn: ngay(c.endsOn),
			phase,
			breakStartsOn: c.breakStartsOn ? ngay(c.breakStartsOn) : null,
			breakEndsOn: c.breakEndsOn ? ngay(c.breakEndsOn) : null,
			updateWeekday: c.updateWeekday,
			cuaSoRa,
			anLuc: c.anLuc ? c.anLuc.toISOString() : null,
			anLyDo: c.anLuc ? anLyDo : null,
			quyConHien: giu.quyConHien,
			viec: viecChuKy({
				phase,
				kind,
				trong: giu.trong,
				daAn: c.anLuc !== null,
				quyConHien: giu.quyConHien,
			}),
		};
	}

	async cycles(homNay = new Date()) {
		const [rows, cuaSo] = await Promise.all([
			this.db.okrCycle.findMany({
				orderBy: [{ startsOn: "desc" }, { kind: "asc" }],
			}),
			this.db.okrCuaSoRa.findMany({
				where: hieuLucHomNay(ngay(homNay)),
				orderBy: { tuNgay: "asc" },
			}),
		]);
		const theoKy = new Map(cuaSo.map((r) => [r.cycleId, cuaSoRaRa(r)]));
		const idsDaAn = rows.flatMap((c) => (c.anLuc ? [c.id] : []));
		const [giu, vetAn] = await Promise.all([
			tinhTrangGiu(
				this.db,
				rows.map((c) => c.id),
			),
			idsDaAn.length === 0
				? []
				: this.db.okrTrail.findMany({
						where: { cycleId: { in: idsDaAn }, action: "an-chu-ky" },
						orderBy: { at: "desc" },
						select: { cycleId: true, note: true },
					}),
		]);
		const lyDoAn = new Map<string, string | null>();
		for (const v of vetAn)
			if (v.cycleId !== null && !lyDoAn.has(v.cycleId))
				lyDoAn.set(v.cycleId, v.note);
		const cycles = rows.flatMap((c) => {
			const g = giu.get(c.id);
			return g
				? [
						this.chuKyRa(
							c,
							theoKy.get(c.id) ?? null,
							g,
							lyDoAn.get(c.id) ?? null,
						),
					]
				: [];
		});
		return {
			cycles,
			currentId:
				chonChuKyHienTai(
					cycles.filter((c) => c.anLuc === null),
					ngay(homNay),
				)?.id ?? null,
		};
	}

	async createCycle(userId: string, input: ChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			if (input.kind === "nam" && input.parentId !== null)
				throw new BadRequestException(T.namKhongCoCha);
			if (input.kind === "quy") {
				if (input.parentId === null)
					throw new BadRequestException(T.namKhongCoCha);
				await this.khoaHoNam(tx, input.parentId);
				const cha = await tx.okrCycle.findUnique({
					where: { id: input.parentId },
				});
				if (cha?.kind !== "nam")
					throw new NotFoundException(T.khongCoChuKy(input.parentId));
				if (cha.anLuc !== null)
					throw new BadRequestException(T.chuKy.namChaDaAn);
				if (
					input.startsOn < ngay(cha.startsOn) ||
					input.endsOn > ngay(cha.endsOn)
				)
					throw new BadRequestException(T.quyNgoaiNam);
				const anhEm = await tx.okrCycle.findMany({
					where: { parentId: cha.id, ...KY_CON_HIEN },
				});
				const chong = anhEm.find(
					(q) =>
						ngay(q.startsOn) <= input.endsOn &&
						input.startsOn <= ngay(q.endsOn),
				);
				if (chong) throw new BadRequestException(T.quyChong(chong.name));
			}
			const c = await tx.okrCycle.create({
				data: {
					kind: input.kind,
					name: input.name,
					parentId: input.parentId,
					startsOn: toDate(input.startsOn),
					endsOn: toDate(input.endsOn),
					breakStartsOn: input.breakStartsOn
						? toDate(input.breakStartsOn)
						: null,
					breakEndsOn: input.breakEndsOn ? toDate(input.breakEndsOn) : null,
					updateWeekday: input.updateWeekday,
				},
			});
			await this.vet(tx, userId, "tao-chu-ky", { cycleId: c.id }, null, {
				name: c.name,
				kind: c.kind,
			});
			return { id: c.id, canhBao: null };
		});
	}

	async setCyclePhase(userId: string, id: string, phase: PhaChuKy) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${id} FOR UPDATE`;
			await this.assertKyChuaAn(tx, id);
			const c = await tx.okrCycle.findUnique({ where: { id } });
			if (!c) throw new NotFoundException(T.khongCoChuKy(id));
			const phaCu = phaChuKy.parse(c.phase);
			if (phaCu === "da-dong") throw new BadRequestException(T.phaCuoi);
			if (PHA_CHU_KY.indexOf(phase) < PHA_CHU_KY.indexOf(phaCu))
				throw new BadRequestException(T.phaChiDiToi);
			if (phaSau(phaCu) !== phase)
				throw new BadRequestException(T.khep.phaTungBuoc);
			if (phaCu === "lap-ke-hoach") {
				const conHoiY = await tx.okrHoiY.count({
					where: { cycleId: id, congBoLuc: null },
				});
				if (conHoiY > 0)
					throw new BadRequestException(T.hoiY.conHoiYChuaCongBo(c.name));
			}
			if (phase === "cham-diem") {
				if (ngay(new Date()) <= ngay(c.endsOn))
					throw new BadRequestException(T.khep.chamTuNgaySau);
				await chotKyCham(tx, c, await this.program(tx), userId);
			}
			if (phase === "da-dong") {
				const { conLai } = await kiemDongKy(tx, id);
				if (conLai > 0)
					throw new BadRequestException(T.khep.conKrChuaCham(conLai));
				const hocTap = await hocTapChuaGhi(tx, id);
				if (hocTap.length > 0)
					throw new BadRequestException(
						T.khep.conHocTapChuaGhi(
							hocTap.length,
							hocTap.map((m) => m.ten),
						),
					);
			}
			await tx.okrCycle.update({ where: { id }, data: { phase } });
			await this.vet(
				tx,
				userId,
				"doi-pha",
				{ cycleId: id },
				{ phase: phaCu },
				{ phase },
			);
			return { id, canhBao: null };
		});
	}

	async programFor(userId: string) {
		const [ct, canManage] = await Promise.all([
			this.program(),
			this.quyenOkr.quanTriChuongTrinh(userId),
		]);
		return { ...ct, canManage };
	}

	async program(
		tx: Tx | Db = this.db,
	): Promise<OkrProgram & { version: number }> {
		const row = await tx.okrProgramConfig.findFirst({
			orderBy: { version: "desc" },
		});
		if (!row) return { ...OKR_PROGRAM_MAC_DINH, version: 0 };
		return {
			...okrProgram.parse({
				objectiveCap: row.objectiveCap,
				krCap: row.krCap,
				capMode: row.capMode,
				scoreScale: row.scoreScale,
				weightsOn: row.weightsOn,
				personalOn: row.personalOn,
				aiOn: row.aiOn,
				aiDeXuatPhamVi: row.aiDeXuatPhamVi,
				aiDeXuatDonVi: row.aiDeXuatDonVi,
				aiTomTatPhamVi: row.aiTomTatPhamVi,
				aiTomTatDonVi: row.aiTomTatDonVi,
				aiDeXuatAnPhamVi: row.aiDeXuatAnPhamVi,
				aiDeXuatAnDonVi: row.aiDeXuatAnDonVi,
				aiTomTatAnPhamVi: row.aiTomTatAnPhamVi,
				aiTomTatAnDonVi: row.aiTomTatAnDonVi,
				aiSoanPhamVi: row.aiSoanPhamVi,
				aiSoanDonVi: row.aiSoanDonVi,
				aiSoanAnPhamVi: row.aiSoanAnPhamVi,
				aiSoanAnDonVi: row.aiSoanAnDonVi,
				aiTranThangUsd: row.aiTranThangUsd.toNumber(),
				aiTranThangDatOkrUsd:
					row.aiTranThangDatOkrUsd === null
						? null
						: row.aiTranThangDatOkrUsd.toNumber(),
				duyetCongBo: row.duyetCongBo,
			}),
			version: row.version,
		};
	}

	async setProgram(userId: string, input: OkrProgramSua) {
		await this.quyenOkr.assertQuanTri(userId);
		const ket = await this.db.$transaction(async (tx) => {
			const { version, ...cu } = await this.program(tx);
			const moi = okrProgram.parse({ ...cu, ...input });
			const row = await tx.okrProgramConfig.create({
				data: {
					...moi,
					version: version + 1,
					createdById: userId,
					createdAt: new Date(),
				},
			});
			await this.vet(
				tx,
				userId,
				"cau-hinh",
				{},
				{ ...cu, version },
				{ ...moi, version: row.version },
			);
			return {
				...moi,
				version: row.version,
				canManage: true,
				vuaBatAi: moi.aiOn && !cu.aiOn,
			};
		});
		const { vuaBatAi, ...tra } = ket;
		if (vuaBatAi) await this.trigger.okrKiemSanSang();
		return tra;
	}

	async khoaHoNam(tx: Tx, namId: string) {
		await tx.$queryRaw`
			SELECT id FROM "okrCycle"
			WHERE id = ${namId} OR "parentId" = ${namId}
			ORDER BY id
			FOR UPDATE`;
	}

	async assertKyChuaAn(tx: Tx | Db, cycleId: string) {
		await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${cycleId} FOR SHARE`;
		await this.moc?.("ghi", cycleId);
		const c = await tx.okrCycle.findUnique({
			where: { id: cycleId },
			select: { anLuc: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
		if (c.anLuc !== null) throw new BadRequestException(T.chuKy.kyDaAn);
	}

	async assertKyGhiDuoc(tx: Tx | Db, cycleId: string) {
		await this.assertKyChuaAn(tx, cycleId);
		const c = await tx.okrCycle.findUnique({
			where: { id: cycleId },
			select: { phase: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
		if (!ghiDuocOPha(phaChuKy.parse(c.phase)))
			throw new BadRequestException(T.kyDaKhoa);
	}

	async vet(
		tx: Tx,
		actorUserId: string,
		action: HanhDongVet,
		dich: { cycleId?: string; objectiveId?: string; keyResultId?: string },
		before: OkrVetSnapshot | null,
		after: OkrVetSnapshot | null,
		note: string | null = null,
	) {
		await tx.okrTrail.create({
			data: {
				actorUserId,
				action,
				note,
				cycleId: dich.cycleId ?? null,
				objectiveId: dich.objectiveId ?? null,
				keyResultId: dich.keyResultId ?? null,
				before: before === null ? undefined : before,
				after: after === null ? undefined : after,
			},
		});
	}

	async locThanhVien(tx: Tx | Db, ids: string[]) {
		const can = [...new Set(ids)];
		const co = new Set(
			(
				await tx.member.findMany({
					where: { organizationId: WORKSPACE_ID, userId: { in: can } },
					select: { userId: true },
				})
			).map((m) => m.userId),
		);
		return {
			giu: can.filter((id) => co.has(id)),
			bo: can.filter((id) => !co.has(id)),
		};
	}

	async assertThanhVien(
		tx: Tx | Db,
		ids: string[],
		loi: (id: string) => string = T.khongPhaiThanhVien,
	) {
		const [thieu] = (await this.locThanhVien(tx, ids)).bo;
		if (thieu) throw new BadRequestException(loi(thieu));
	}

	async kiemTranMucTieu(
		tx: Tx,
		cycleId: string,
		dv: DonViCuaMucTieu,
		them: number,
		cheDo?: OkrProgram["capMode"],
	) {
		const ct = await this.program(tx);
		const dem = await tx.okrObjective.count({
			where: {
				cycleId,
				level: dv.level,
				divisionId: dv.divisionId,
				departmentId: dv.departmentId,
				personUserId: dv.personUserId,
				status: { not: "da-bo" },
			},
		});
		if (dem + them <= ct.objectiveCap) return null;
		if ((cheDo ?? ct.capMode) === "chan")
			throw new BadRequestException(T.vuotTranMucTieu(dem));
		return T.vuotTranMucTieu(dem);
	}

	kiemTranKr(ct: OkrProgram, dem: number, them: number): string | null {
		if (dem + them <= ct.krCap) return null;
		const loi = T.vuotTranKr(dem + them - 1);
		if (ct.capMode === "chan") throw new BadRequestException(loi);
		return loi;
	}

	private async trangThai(tx: Tx, id: string) {
		const mt = await tx.okrObjective.findUnique({
			where: { id },
			select: { status: true },
		});
		if (!mt) throw new NotFoundException(T.khongCoMucTieu(id));
		return trangThaiMucTieu.parse(mt.status);
	}

	private async phaCua(tx: Tx, objectiveId: string) {
		const mt = await tx.okrObjective.findUniqueOrThrow({
			where: { id: objectiveId },
			select: { cycle: { select: { phase: true } } },
		});
		return phaChuKy.parse(mt.cycle.phase);
	}

	async createObjective(userId: string, input: MucTieuInput) {
		await this.quyenOkr.assertNhapDuoc(userId, donViCua(input.unit));
		return this.db.$transaction((tx) =>
			this.taoMucTieuTrongTx(tx, userId, input),
		);
	}

	async taoMucTieuTrongTx(
		tx: Tx,
		userId: string,
		input: MucTieuInput,
		vetThem: OkrVetSnapshot = {},
		opts?: GhiTrong,
	) {
		const dv = donViCua(input.unit);
		await this.assertKyGhiDuoc(tx, input.cycleId);
		if (dv.level === "ca-nhan" && !(await this.program(tx)).personalOn)
			throw new BadRequestException(T.caNhanTat);
		const thamGia = [...new Set(input.participantIds)];
		await this.assertThanhVien(tx, [
			input.ownerUserId,
			...thamGia,
			...(dv.personUserId ? [dv.personUserId] : []),
		]);
		const canhBao = await this.kiemTranMucTieu(tx, input.cycleId, dv, 1);
		const viTri = await tx.okrObjective.count({
			where: { cycleId: input.cycleId },
		});
		const mt = await tx.okrObjective.create({
			data: {
				cycleId: input.cycleId,
				...dv,
				ownerUserId: input.ownerUserId,
				kind: input.kind,
				title: input.title,
				whyNow: input.whyNow,
				hienThi: input.hienThi,
				position: viTri,
				participants: { create: thamGia.map((u) => ({ userId: u })) },
			},
		});
		await this.vet(
			tx,
			userId,
			"tao",
			{ objectiveId: mt.id, cycleId: mt.cycleId },
			null,
			{
				title: mt.title,
				kind: mt.kind,
				level: mt.level,
				status: mt.status,
				hienThi: mt.hienThi,
				...vetThem,
			},
			opts?.note ?? null,
		);
		return { id: mt.id, canhBao };
	}

	async updateObjective(userId: string, input: MucTieuUpdate) {
		const { luotAn, ...kq } = await this.db.$transaction((tx) =>
			this.updateObjectiveTrong(tx, userId, input),
		);
		await this.kichLuotAn(userId, luotAn);
		return kq;
	}

	async updateObjectiveTrong(
		tx: Tx,
		userId: string,
		input: MucTieuUpdate,
		opts?: GhiTrong,
	) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.id, tx);
		await this.assertKyGhiDuoc(tx, mt.cycleId);
		const cu = await tx.okrObjective.findUniqueOrThrow({
			where: { id: mt.id },
			include: { participants: { select: { userId: true } } },
		});
		if (cu.status === "da-bo") throw new BadRequestException(T.daBo);
		if (cu.status === "cho-duyet")
			throw new BadRequestException(T.dangChoDuyet);
		const thamGia = input.participantIds
			? [...new Set(input.participantIds)].sort()
			: undefined;
		await this.assertThanhVien(tx, [
			...(input.ownerUserId ? [input.ownerUserId] : []),
			...(thamGia ?? []),
		]);
		const truoc: OkrVetSnapshot = {};
		const sau: OkrVetSnapshot = {};
		ghiKhac(truoc, sau, "title", cu.title, input.title);
		ghiKhac(truoc, sau, "kind", cu.kind, input.kind);
		ghiKhac(truoc, sau, "ownerUserId", cu.ownerUserId, input.ownerUserId);
		ghiKhac(truoc, sau, "whyNow", cu.whyNow, input.whyNow);
		ghiKhac(
			truoc,
			sau,
			"participantIds",
			cu.participants.map((p) => p.userId).sort(),
			thamGia,
		);
		await tx.okrObjective.update({
			where: { id: mt.id },
			data: {
				title: input.title,
				kind: input.kind,
				ownerUserId: input.ownerUserId,
				whyNow: input.whyNow,
				participants: thamGia
					? {
							deleteMany: {},
							create: thamGia.map((u) => ({ userId: u })),
						}
					: undefined,
			},
		});
		await this.vet(
			tx,
			userId,
			"sua",
			{ objectiveId: mt.id },
			truoc,
			sau,
			opts?.note ?? null,
		);
		return {
			id: mt.id,
			canhBao: null,
			luotAn: {
				objectiveId: mt.id,
				keyResultId: null,
				doiChu: "title" in sau || "whyNow" in sau,
			},
		};
	}

	congBoHayGuiDuyet(
		ct: OkrProgram,
		q: Quyen,
		userId: string,
		dv: DonViCuaMucTieu,
	): "cong-bo" | "cho-duyet" {
		return ct.duyetCongBo &&
			dv.level !== "onehub" &&
			!this.quyenOkr.duyetDuoc(q, userId, dv)
			? "cho-duyet"
			: "cong-bo";
	}

	async khoaMucTieu(tx: Tx, id: string) {
		await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${id} FOR UPDATE`;
		return this.trangThai(tx, id);
	}

	async congBoTrongGiaoDich(
		tx: Tx,
		userId: string,
		mt: { id: string; status: TrangThaiMucTieu },
		cach: { tuDuyet: boolean },
	) {
		if ((await tx.okrKeyResult.count({ where: { objectiveId: mt.id } })) === 0)
			throw new BadRequestException(T.congBoCanKr);
		const luc = new Date();
		await tx.okrObjective.update({
			where: { id: mt.id },
			data: { status: "cong-bo", publishedAt: luc },
		});
		await tx.okrKeyResult.updateMany({
			where: { objectiveId: mt.id, startLockedAt: null },
			data: { startLockedAt: luc },
		});
		const vet = vetCongBo(mt.status, cach.tuDuyet);
		await this.vet(
			tx,
			userId,
			vet.hanhDong,
			{ objectiveId: mt.id },
			{ status: mt.status },
			vet.sau,
		);
		return { id: mt.id, canhBao: null };
	}

	async publishObjective(userId: string, id: string) {
		const { q, mt } = await this.quyenOkr.assertSuaMucTieuCoQuyen(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.khoaMucTieu(tx, mt.id);
			if (trangThai === "cong-bo") throw new BadRequestException(T.daCongBo);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			const ct = await this.program(tx);
			if (this.congBoHayGuiDuyet(ct, q, userId, mt) === "cho-duyet")
				throw new BadRequestException(
					trangThai === "cho-duyet" ? T.dangChoDuyet : T.duyet.canDuyet,
				);
			return this.congBoTrongGiaoDich(
				tx,
				userId,
				{ id: mt.id, status: trangThai },
				{ tuDuyet: ct.duyetCongBo && mt.level !== "onehub" },
			);
		});
	}

	async dropObjective(userId: string, id: string) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: "da-bo", droppedAt: new Date() },
			});
			await this.vet(
				tx,
				userId,
				"bo",
				{ objectiveId: mt.id },
				{ status: trangThai },
				{ status: "da-bo" },
			);
			return { id: mt.id, canhBao: null };
		});
	}

	async xoaMucTieu(userId: string, id: string) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.khoaMucTieu(tx, mt.id);
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE "objectiveId" = ${mt.id} ORDER BY id FOR UPDATE`;
			if (trangThai === "cho-duyet")
				throw new BadRequestException(T.xoa.dangChoDuyet);
			const lyDo = (await lichSuMucTieu(tx, [mt.id])).get(mt.id) ?? null;
			if (lyDo !== null)
				throw new BadRequestException(T.xoa.coLichSu(T.xoa.lyDo[lyDo]));
			const hang = await tx.okrObjective.findUniqueOrThrow({
				where: { id: mt.id },
				select: {
					title: true,
					keyResults: { select: { id: true } },
				},
			});
			const krIds = hang.keyResults.map((k) => k.id);
			await tx.okrViecKr.deleteMany({ where: { keyResultId: { in: krIds } } });
			await tx.okrNguonKr.deleteMany({ where: { keyResultId: { in: krIds } } });
			await tx.okrMucTieuTuMau.deleteMany({ where: { objectiveId: mt.id } });
			await tx.okrObjective.delete({ where: { id: mt.id } });
			await this.vet(
				tx,
				userId,
				"xoa-muc-tieu",
				{ cycleId: mt.cycleId, objectiveId: mt.id },
				{
					title: hang.title,
					level: mt.level,
					divisionId: mt.divisionId,
					departmentId: mt.departmentId,
					personUserId: mt.personUserId,
					status: trangThai,
					soKr: krIds.length,
				},
				null,
			);
			return { id: mt.id, canhBao: null };
		});
	}

	async dungLaiMucTieu(userId: string, id: string) {
		const { q, mt } = await this.quyenOkr.assertSuaMucTieuCoQuyen(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.khoaMucTieu(tx, mt.id);
			if (trangThai !== "da-bo")
				throw new BadRequestException(T.dungLai.chuaBo);
			const ct = await this.program(tx);
			const canhBao = await this.kiemTranMucTieu(tx, mt.cycleId, mt, 1);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: "nhap", droppedAt: null },
			});
			await this.vet(
				tx,
				userId,
				"dung-lai",
				{ objectiveId: mt.id },
				{ status: "da-bo" },
				{ status: "nhap" },
			);
			return {
				id: mt.id,
				canhBao,
				canGuiDuyet: this.congBoHayGuiDuyet(ct, q, userId, mt) === "cho-duyet",
			};
		});
	}

	private assertSoTheoKieu(kind: KieuKr, khoi: number, dich: number) {
		const loi = kiemSoTheoKieu(kind, khoi, dich);
		if (loi) throw new BadRequestException(T.soTheoKieu[loi]);
	}

	async createKeyResult(
		userId: string,
		input: CreateKrInput,
		trong?: KrTrongGiaoDich,
	) {
		if (trong && trong.mt.id !== input.objectiveId)
			throw new BadRequestException(
				T.krKhacGiaoDich(input.objectiveId, trong.mt.id),
			);
		const mt =
			trong?.mt ??
			(await this.quyenOkr.assertNhapMucTieu(userId, input.objectiveId));
		const ghi = async (tx: Tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			if (trangThai === "cho-duyet")
				throw new BadRequestException(T.dangChoDuyet);
			this.assertSoTheoKieu(input.kind, input.startValue, input.targetValue);
			await this.assertThanhVien(tx, [input.ownerUserId]);
			const ct = await this.program(tx);
			const dem = await tx.okrKeyResult.count({
				where: { objectiveId: mt.id },
			});
			const cuoi = await tx.okrKeyResult.aggregate({
				where: { objectiveId: mt.id },
				_max: { position: true },
			});
			const canhBao = this.kiemTranKr(ct, dem, 1);
			const kr = await tx.okrKeyResult.create({
				data: {
					objectiveId: mt.id,
					title: input.title,
					kind: input.kind,
					ownerUserId: input.ownerUserId,
					startValue: input.startValue,
					targetValue: input.targetValue,
					currentValue: input.currentValue,
					unit: input.unit,
					dueOn: input.dueOn ? toDate(input.dueOn) : null,
					weight: input.weight,
					position: (cuoi._max.position ?? -1) + 1,
					startLockedAt: trangThai === "cong-bo" ? new Date() : null,
				},
			});
			await this.vet(
				tx,
				userId,
				"tao-kr",
				{ objectiveId: mt.id, keyResultId: kr.id },
				null,
				{
					title: kr.title,
					kind: kr.kind,
					startValue: input.startValue,
					targetValue: input.targetValue,
					...trong?.sauThem,
				},
				trong?.note ?? null,
			);
			return { id: kr.id, canhBao };
		};
		if (trong) return ghi(trong.tx);
		const kq = await this.db.$transaction(ghi);
		await this.kichLuotAn(userId, {
			objectiveId: mt.id,
			keyResultId: kq.id,
			doiChu: true,
		});
		return kq;
	}

	async updateKeyResult(userId: string, input: UpdateKrInput) {
		const { luotAn, ...kq } = await this.db.$transaction((tx) =>
			this.updateKeyResultTrong(tx, userId, input),
		);
		await this.kichLuotAn(userId, luotAn);
		return kq;
	}

	async updateKeyResultTrong(
		tx: Tx,
		userId: string,
		input: UpdateKrInput,
		opts?: GhiTrong,
	) {
		const quyen = await this.quyenOkr.assertSuaKr(userId, input.id, tx);
		const doiCot =
			input.kind !== undefined ||
			input.ownerUserId !== undefined ||
			input.startValue !== undefined;
		if (doiCot && quyen.ownerUserId === userId) {
			const q = await this.quyenOkr.quyen(userId);
			if (!this.quyenOkr.suaDuocDonVi(q, userId, quyen.objective))
				throw new ForbiddenException(T.khongSuaDuocKr);
		}
		await this.assertKyGhiDuoc(tx, quyen.objective.cycleId);
		await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${quyen.id} FOR UPDATE`;
		const kr = await tx.okrKeyResult.findUnique({ where: { id: quyen.id } });
		if (!kr) throw new NotFoundException(T.khongCoKr(quyen.id));
		if (
			input.currentValue !== undefined &&
			input.currentValue !== soKr(kr.currentValue) &&
			nguonKr.parse(kr.source) !== "tay"
		)
			throw new BadRequestException(T.so.hienTaiCuaMay);
		if (input.kind !== undefined && !crmHopKieu(input.kind)) {
			const may = await tx.okrNguonKr.findUnique({
				where: { keyResultId: kr.id },
				select: { loai: true },
			});
			if (kr.source === "crm" || may?.loai === "crm")
				throw new BadRequestException(T.so.crmKhongHopKieu);
		}
		const trangThai = await this.trangThai(tx, kr.objectiveId);
		if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
		if (trangThai === "cho-duyet")
			throw new BadRequestException(T.dangChoDuyet);
		const dangChay =
			trangThai === "cong-bo" &&
			(await this.phaCua(tx, kr.objectiveId)) === "dang-chay";
		if (
			dangChay &&
			input.currentValue !== undefined &&
			input.currentValue !== soKr(kr.currentValue)
		)
			throw new BadRequestException(T.hienTaiQuaCapNhat);
		const khoi = soKr(kr.startValue);
		if (
			input.startValue !== undefined &&
			kr.startLockedAt !== null &&
			input.startValue !== khoi
		)
			throw new BadRequestException(T.khoiDiemDaKhoa);
		const kind = input.kind ?? kieuKr.parse(kr.kind);
		this.assertSoTheoKieu(
			kind,
			input.startValue ?? khoi,
			input.targetValue ?? soKr(kr.targetValue),
		);
		if (input.ownerUserId) await this.assertThanhVien(tx, [input.ownerUserId]);
		const dichCu = soKr(kr.targetValue);
		let doiDich: Prisma.OkrDoiDichUncheckedCreateInput | null = null;
		if (
			dangChay &&
			input.targetValue !== undefined &&
			input.targetValue !== dichCu
		) {
			const ra = await cuaSoHieuLuc(
				tx,
				quyen.objective.cycleId,
				ngay(new Date()),
			);
			if (ra === null && !input.lyDoDoiDich)
				throw new BadRequestException(T.khep.lyDoDoiDich);
			doiDich = {
				keyResultId: kr.id,
				truoc: dichCu,
				sau: input.targetValue,
				lyDo: input.lyDoDoiDich ?? "",
				ngoaiRa: ra === null,
				cuaSoRaId: ra?.id ?? null,
				tacGiaUserId: userId,
			};
		}
		const truoc: OkrVetSnapshot = {};
		const sau: OkrVetSnapshot = {};
		ghiKhac(truoc, sau, "title", kr.title, input.title);
		ghiKhac(truoc, sau, "kind", kr.kind, input.kind);
		ghiKhac(truoc, sau, "ownerUserId", kr.ownerUserId, input.ownerUserId);
		ghiKhac(truoc, sau, "startValue", khoi, input.startValue);
		ghiKhac(truoc, sau, "targetValue", soKr(kr.targetValue), input.targetValue);
		ghiKhac(
			truoc,
			sau,
			"currentValue",
			soKr(kr.currentValue),
			input.currentValue,
		);
		ghiKhac(truoc, sau, "unit", kr.unit, input.unit);
		ghiKhac(truoc, sau, "dueOn", kr.dueOn ? ngay(kr.dueOn) : null, input.dueOn);
		ghiKhac(truoc, sau, "weight", soKr(kr.weight), input.weight);
		await tx.okrKeyResult.update({
			where: { id: kr.id },
			data: {
				title: input.title,
				kind: input.kind,
				ownerUserId: input.ownerUserId,
				startValue: input.startValue,
				targetValue: input.targetValue,
				currentValue: input.currentValue,
				unit: input.unit,
				dueOn:
					input.dueOn === undefined
						? undefined
						: input.dueOn === null
							? null
							: toDate(input.dueOn),
				weight: input.weight,
			},
		});
		await this.vet(
			tx,
			userId,
			"sua-kr",
			{ objectiveId: kr.objectiveId, keyResultId: kr.id },
			truoc,
			sau,
			opts?.note ?? null,
		);
		if (doiDich) {
			await tx.okrDoiDich.create({ data: doiDich });
			await this.vet(
				tx,
				userId,
				"doi-dich",
				{
					cycleId: quyen.objective.cycleId,
					objectiveId: kr.objectiveId,
					keyResultId: kr.id,
				},
				{ targetValue: dichCu },
				{ targetValue: Number(doiDich.sau), ngoaiRa: doiDich.ngoaiRa },
				doiDich.lyDo || null,
			);
		}
		return {
			id: kr.id,
			canhBao: null,
			luotAn: {
				objectiveId: kr.objectiveId,
				keyResultId: kr.id,
				doiChu: "title" in sau,
			},
		};
	}

	async removeKeyResult(userId: string, id: string) {
		const kr = await this.db.okrKeyResult.findUnique({
			where: { id },
			select: { id: true, objectiveId: true, title: true },
		});
		if (!kr) throw new NotFoundException(T.khongCoKr(id));
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, kr.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.trangThai(tx, mt.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			if (trangThai === "cho-duyet")
				throw new BadRequestException(T.dangChoDuyet);
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${kr.id} FOR UPDATE`;
			if (
				(await tx.okrAlignment.count({
					where: { targetKeyResultId: kr.id },
				})) > 0
			)
				throw new BadRequestException(T.krDangLaDich);
			if ((await tx.okrCheckIn.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.krDaCapNhat);
			if ((await tx.okrSoChup.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.so.krDaCoSoChup);
			if ((await tx.okrDoiDich.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.khep.krCoDoiDich);
			if ((await tx.okrDiemKr.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.khep.krCoDiem);
			if ((await tx.okrBangChung.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.canhKr.krCoBangChung);
			if ((await tx.okrGhiNhan.count({ where: { keyResultId: kr.id } })) > 0)
				throw new BadRequestException(T.canhKr.krCoGhiNhan);
			const viec = await tx.okrViecKr.findMany({
				where: { keyResultId: kr.id },
				orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
				select: chonHangViec,
			});
			await tx.okrViecKr.deleteMany({ where: { keyResultId: kr.id } });
			for (const v of viec)
				await this.vet(
					tx,
					userId,
					"go-viec",
					{ objectiveId: mt.id, keyResultId: kr.id },
					anhVetViec(hangViec(v)),
					null,
				);
			await tx.okrNguonKr.deleteMany({ where: { keyResultId: kr.id } });
			await tx.okrKeyResult.delete({ where: { id: kr.id } });
			await this.vet(
				tx,
				userId,
				"xoa-kr",
				{ objectiveId: mt.id, keyResultId: kr.id },
				{ title: kr.title },
				null,
			);
			return { id: kr.id, canhBao: null };
		});
	}

	private async dichCanChinh(
		tx: Tx,
		dich: { objectiveId: string | null; keyResultId: string | null },
		nc: NguCanhXem,
	) {
		const chon = {
			id: true,
			level: true,
			status: true,
			cycleId: true,
			hienThi: true,
		} as const;
		if (dich.keyResultId !== null) {
			const kr = await tx.okrKeyResult.findFirst({
				where: { id: dich.keyResultId, objective: dieuKienXemMucTieu(nc) },
				select: { objective: { select: chon } },
			});
			if (!kr) throw new NotFoundException(T.khongThayMucTieu);
			return kr.objective;
		}
		const mt = await tx.okrObjective.findFirst({
			where: {
				AND: [{ id: dich.objectiveId ?? "" }, dieuKienXemMucTieu(nc)],
			},
			select: chon,
		});
		if (!mt) throw new NotFoundException(T.khongThayMucTieu);
		return mt;
	}

	async addAlignment(userId: string, input: AlignmentInput) {
		return this.db.$transaction((tx) =>
			this.addAlignmentTrong(tx, userId, input),
		);
	}

	private async congCanChinh(
		tx: Tx,
		userId: string,
		input: AlignmentInput,
	): Promise<NguonDaQuaCong> {
		const nguon = await this.quyenOkr.assertSuaMucTieu(
			userId,
			input.objectiveId,
			tx,
		);
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		return { nguon, nc };
	}

	async addAlignmentTrong(
		tx: Tx,
		userId: string,
		input: AlignmentInput,
		opts?: GhiTrong & { daQuaCong?: NguonDaQuaCong; lyDo?: LyDoCanChinh },
	) {
		const { nguon, nc } =
			opts?.daQuaCong ?? (await this.congCanChinh(tx, userId, input));
		await this.assertKyGhiDuoc(tx, nguon.cycleId);
		await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${nguon.id} FOR UPDATE`;
		const trangThai = await this.trangThai(tx, nguon.id);
		if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
		if (trangThai === "cho-duyet")
			throw new BadRequestException(T.dangChoDuyet);
		const nguonCongKhai = await tx.okrObjective.count({
			where: { AND: [{ id: nguon.id }, boGioiHan] },
		});
		if (nguonCongKhai === 0)
			throw new BadRequestException(T.canChinh.gioiHanKhongCanChinh);
		if (
			(input.targetObjectiveId === null) ===
			(input.targetKeyResultId === null)
		)
			throw new BadRequestException(T.canChinh.khongCoDich);
		if (input.targetKeyResultId !== null)
			await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${input.targetKeyResultId} FOR SHARE`;
		const dich = await this.dichCanChinh(
			tx,
			{
				objectiveId: input.targetObjectiveId,
				keyResultId: input.targetKeyResultId,
			},
			nc,
		);
		if (dich.hienThi !== boGioiHan.hienThi)
			throw new BadRequestException(T.canChinh.gioiHanKhongCanChinh);
		if (dich.id === nguon.id) throw new BadRequestException(T.canChinh.chinhNo);
		if (HANG_CAP[capMucTieu.parse(dich.level)] >= HANG_CAP[nguon.level])
			throw new BadRequestException(T.canChinh.cungCap);
		if (dich.status !== "cong-bo")
			throw new BadRequestException(T.canChinh.chuaCongBo);
		const ky = await tx.okrCycle.findUniqueOrThrow({
			where: { id: nguon.cycleId },
			select: { parentId: true },
		});
		if (dich.cycleId !== nguon.cycleId && dich.cycleId !== ky.parentId)
			throw new BadRequestException(T.canChinh.khacChuKy);
		const noi = {
			objectiveId: nguon.id,
			targetObjectiveId: input.targetObjectiveId,
			targetKeyResultId: input.targetKeyResultId,
		};
		if (await tx.okrAlignment.findFirst({ where: noi }))
			throw new BadRequestException(T.canChinh.daGan);
		const g = await tx.okrAlignment.create({
			data: { ...noi, ...(opts?.lyDo ?? LY_DO_TRONG) },
		});
		await this.vet(
			tx,
			userId,
			"gan-can-chinh",
			{ objectiveId: nguon.id },
			null,
			{
				alignmentId: g.id,
				targetObjectiveId: g.targetObjectiveId,
				targetKeyResultId: g.targetKeyResultId,
			},
			opts?.note ?? null,
		);
		return { id: g.id, canhBao: null };
	}

	async removeAlignment(userId: string, id: string) {
		const g = await this.db.okrAlignment.findUnique({ where: { id } });
		if (!g) throw new NotFoundException(T.canChinh.khongCo(id));
		const nguon = await this.quyenOkr.assertSuaMucTieu(userId, g.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, nguon.cycleId);
			const trangThai = await this.trangThai(tx, nguon.id);
			if (trangThai === "da-bo") throw new BadRequestException(T.daBo);
			if (trangThai === "cho-duyet")
				throw new BadRequestException(T.dangChoDuyet);
			const xoa = await tx.okrAlignment.deleteMany({ where: { id: g.id } });
			if (xoa.count === 0) throw new NotFoundException(T.canChinh.khongCo(id));
			await this.vet(
				tx,
				userId,
				"go-can-chinh",
				{ objectiveId: nguon.id },
				{
					alignmentId: g.id,
					targetObjectiveId: g.targetObjectiveId,
					targetKeyResultId: g.targetKeyResultId,
				},
				null,
			);
			return { id: g.id, canhBao: null };
		});
	}

	async alignmentTargets(userId: string, objectiveId: string) {
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const nguon = await this.db.okrObjective.findFirst({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
			select: {
				level: true,
				cycleId: true,
				hienThi: true,
				cycle: { select: { parentId: true } },
			},
		});
		if (!nguon) throw new NotFoundException(T.khongThayMucTieu);
		if (nguon.hienThi !== boGioiHan.hienThi)
			throw new BadRequestException(T.canChinh.gioiHanKhongCanChinh);
		const nguonCanChinh = {
			level: capMucTieu.parse(nguon.level),
			cycleId: nguon.cycleId,
			cycleParentId: nguon.cycle.parentId,
		};
		const rows = await this.db.okrObjective.findMany({
			where: {
				AND: [
					{
						status: "cong-bo",
						level: { in: capDichCanChinh(nguonCanChinh.level) },
						cycleId: { in: chuKyDichCanChinh(nguonCanChinh) },
						cycle: KY_CON_HIEN,
					},
					boGioiHan,
				],
			},
			select: {
				id: true,
				title: true,
				...chonTenDonVi,
				keyResults: {
					select: { id: true, title: true },
					orderBy: { position: "asc" },
				},
			},
			orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		});
		const theoCap = [...rows].sort(
			(a, b) =>
				HANG_CAP[capMucTieu.parse(a.level)] -
				HANG_CAP[capMucTieu.parse(b.level)],
		);
		return {
			targets: theoCap.flatMap((r) => {
				const unitName = tenDonVi(r);
				return [
					{ objectiveId: r.id, keyResultId: null, label: r.title, unitName },
					...r.keyResults.map((k) => ({
						objectiveId: r.id,
						keyResultId: k.id,
						label: k.title,
						unitName,
					})),
				];
			}),
		};
	}

	async alignmentTree(userId: string, cycleId: string) {
		const { mts, gioiHan } = await this.mucTieuCuaCay(userId, cycleId);
		return dungCayCanChinh(mts, gioiHan);
	}

	async mucTieuCuaCay(userId: string, cycleId: string) {
		const q = await this.quyenOkr.quyen(userId);
		const pham = { nguCanh: this.quyenOkr.nguCanhXem(q, userId) };
		const ky = await this.db.okrCycle.findUnique({
			where: { id: cycleId },
			select: { parentId: true },
		});
		if (!ky) throw new NotFoundException(T.khongCoChuKy(cycleId));
		const cha = ky.parentId
			? await this.docMucTieu(
					this.db,
					{ cycleId: ky.parentId },
					userId,
					q,
					pham,
				)
			: [];
		const cua = await this.docMucTieu(this.db, { cycleId }, userId, q, pham);
		const con = ky.parentId
			? []
			: await this.docMucTieu(
					this.db,
					{
						cycle: { parentId: cycleId, ...KY_CON_HIEN },
						alignments: {
							some: {
								OR: [
									{ targetObjective: { cycleId } },
									{ targetKeyResult: { objective: { cycleId } } },
								],
							},
						},
					},
					userId,
					q,
					pham,
				);
		const mts = [...cha, ...cua, ...con];
		const gioiHan = new Set(
			(
				await this.db.okrObjective.findMany({
					where: {
						AND: [
							{ id: { in: mts.map((m) => m.id) } },
							dieuKienXemMucTieu(pham.nguCanh),
							{ NOT: boGioiHan },
						],
					},
					select: { id: true },
				})
			).map((r) => r.id),
		);
		return { mts, gioiHan };
	}

	async docMucTieu(
		tx: Tx | Db,
		where: Prisma.OkrObjectiveWhereInput,
		viewerId: string,
		q: Quyen,
		pham: PhamDoc,
		homNay = new Date(),
		soGopY?: ReadonlyMap<string, number>,
	): Promise<MucTieuOutput[]> {
		const ct = await this.program(tx);
		const rows = await tx.okrObjective.findMany({
			where: {
				AND: [
					where,
					pham === "so-gop" ? boGioiHan : dieuKienXemMucTieu(pham.nguCanh),
				],
			},
			include: {
				...chonMucTieu,
				followers: { where: { userId: viewerId }, select: { userId: true } },
				_count: { select: { followers: true, nguoiXem: true } },
			},
			orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		});
		const dem =
			soGopY ??
			(await demGopYCho(
				tx,
				rows.map((r) => r.id),
				{ viewerId, q, access: this.quyenOkr },
			));
		return rows.map((r) => {
			const level = capMucTieu.parse(r.level);
			const hienTaiQuaCapNhat =
				r.status === "cong-bo" && r.cycle.phase === "dang-chay";
			const keyResults: KrOutput[] = r.keyResults.map((k) => {
				const kind = kieuKr.parse(k.kind);
				const startValue = soKr(k.startValue);
				const targetValue = soKr(k.targetValue);
				const currentValue = soKr(k.currentValue);
				const source = nguonKr.parse(k.source);
				const chup = k.soChup[0];
				return {
					id: k.id,
					objectiveId: k.objectiveId,
					title: k.title,
					kind,
					owner: k.owner,
					startValue,
					targetValue,
					currentValue,
					unit: k.unit,
					dueOn: k.dueOn ? ngay(k.dueOn) : null,
					weight: soKr(k.weight),
					source,
					...doCanhVaSoMay(source, k.nguonMay, chup),
					nguonMay: k.nguonMay
						? {
								...parseOkrNguon(k.nguonMay),
								docLuc: k.nguonMay.docLuc?.toISOString() ?? null,
								docGiaTri:
									k.nguonMay.docGiaTri === null
										? null
										: soKr(k.nguonMay.docGiaTri),
							}
						: null,
					startLocked: k.startLockedAt !== null,
					progress: tienDoKr(kind, startValue, targetValue, currentValue),
					laCuaToi: k.ownerUserId === viewerId,
					hienTaiQuaCapNhat,
				};
			});
			const following = r.followers.length > 0;
			const nghi =
				r.cycle.breakStartsOn && r.cycle.breakEndsOn
					? { tu: r.cycle.breakStartsOn, den: r.cycle.breakEndsOn }
					: null;
			return {
				id: r.id,
				cycleId: r.cycleId,
				level,
				unitId: r.divisionId ?? r.departmentId ?? r.personUserId,
				unitName: tenDonVi(r),
				title: r.title,
				kind: loaiMucTieu.parse(r.kind),
				status: trangThaiMucTieu.parse(r.status),
				owner: r.owner,
				participants: r.participants.map((p) => p.user),
				whyNow: r.whyNow,
				publishedAt: r.publishedAt?.toISOString() ?? null,
				droppedAt: r.droppedAt?.toISOString() ?? null,
				progress: tienDoMucTieu(keyResults, ct.weightsOn),
				expected: kyVongTheoNgay(r.publishedAt, r.cycle.endsOn, homNay, nghi),
				keyResults,
				alignments: r.alignments.map((g) => {
					const dich = g.targetKeyResult?.objective ?? g.targetObjective;
					const dichId = g.targetKeyResult?.objectiveId ?? g.targetObjectiveId;
					if (!dich || !dichId)
						throw new Error(`Căn chỉnh ${g.id} không có đích.`);
					return {
						alignmentId: g.id,
						targetObjectiveId: dichId,
						targetKeyResultId: g.targetKeyResultId,
						unitName: tenDonVi(dich),
						objectiveTitle: dich.title,
						keyResultTitle: g.targetKeyResult?.title ?? null,
					};
				}),
				canEdit: this.quyenOkr.suaDuocDonVi(q, viewerId, {
					level,
					divisionId: r.divisionId,
					departmentId: r.departmentId,
					personUserId: r.personUserId,
				}),
				following,
				followerCount: r._count.followers,
				theoDoi: following,
				hienThi: mucHienThi.parse(r.hienThi),
				soNguoiXem: r._count.nguoiXem,
				soGopYCho: dem.get(r.id) ?? 0,
			};
		});
	}

	private kiemLoNhap(chu: string) {
		const soDong = dongLoOkr(chu).length;
		if (soDong === 0) throw new BadRequestException(T.nhap.loRong);
		if (soDong > OKR.lo.toiDaDong)
			throw new BadRequestException(T.nhap.loQuaDai(OKR.lo.toiDaDong));
	}

	private chuDonViNhap(q: Quyen, userId: string, dv: DonViCuaMucTieu) {
		const moiPb = [
			...q.cay.divisions.flatMap((b) => b.departments),
			...q.cay.chuaXep,
		];
		switch (dv.level) {
			case "onehub":
				return userId;
			case "ca-nhan":
				return dv.personUserId ?? userId;
			case "bo-phan": {
				const b = q.cay.divisions.find((x) => x.id === dv.divisionId);
				if (!b)
					throw new NotFoundException(T.khongCoDonVi(dv.divisionId ?? ""));
				return b.head?.id ?? userId;
			}
			case "phong-ban": {
				const pb = moiPb.find((x) => x.id === dv.departmentId);
				if (!pb)
					throw new NotFoundException(T.khongCoDonVi(dv.departmentId ?? ""));
				return pb.head?.id ?? userId;
			}
		}
	}

	private async phanTichNhap(
		tx: Tx | Db,
		cycleId: string,
		dv: DonViCuaMucTieu,
		chu: string,
	) {
		await this.assertKyGhiDuoc(tx, cycleId);
		const ct = await this.program(tx);
		if (dv.level === "ca-nhan" && !ct.personalOn)
			throw new BadRequestException(T.caNhanTat);
		const [members, coSan] = await Promise.all([
			tx.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, email: true } } },
			}),
			tx.okrObjective.findMany({
				where: { cycleId, ...dv, status: { not: "da-bo" } },
				select: { title: true },
			}),
		]);
		const kq = phanTichLoOkr(chu, {
			members: members.map((m) => m.user),
			daCo: coSan.map((m) => khoa(m.title)),
			tranConLai: ct.capMode === "chan" ? ct.objectiveCap - coSan.length : null,
			tranKr: ct.capMode === "chan" ? ct.krCap : null,
		});
		if (kq.vuotTran)
			throw new BadRequestException(T.nhap.vuotTran(ct.objectiveCap));
		if (kq.vuotTranKr) throw new BadRequestException(T.vuotTranKr(ct.krCap));
		return kq;
	}

	async previewImport(
		userId: string,
		input: { cycleId: string; unit: DonViChon; text: string },
	) {
		const dv = donViChon(input.unit);
		const q = await this.quyenOkr.assertNhapDuoc(userId, dv);
		this.kiemLoNhap(input.text);
		this.chuDonViNhap(q, userId, dv);
		const kq = await this.phanTichNhap(this.db, input.cycleId, dv, input.text);
		return { rows: kq.rows, summary: kq.summary };
	}

	async applyImport(
		userId: string,
		input: { cycleId: string; unit: DonViChon; text: string; congBo: boolean },
	) {
		const dv = donViChon(input.unit);
		const q = await this.quyenOkr.assertNhapDuoc(userId, dv);
		this.kiemLoNhap(input.text);
		const chu = this.chuDonViNhap(q, userId, dv);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			const kq = await this.phanTichNhap(tx, input.cycleId, dv, input.text);
			if (kq.mucTieu.length === 0) {
				if (kq.rows.some((r) => r.error === T.nhap.daCo))
					return { written: 0, objectives: 0, keyResults: 0 };
				throw new BadRequestException(T.nhap.khongDongHopLe);
			}
			await this.assertThanhVien(tx, [chu]);
			const status = input.congBo
				? this.congBoHayGuiDuyet(await this.program(tx), q, userId, dv)
				: "nhap";
			const luc = status === "cong-bo" ? new Date() : null;
			let viTri = await tx.okrObjective.count({
				where: { cycleId: input.cycleId },
			});
			let demKr = 0;
			for (const m of kq.mucTieu) {
				const mt = await tx.okrObjective.create({
					data: {
						cycleId: input.cycleId,
						...dv,
						ownerUserId: chu,
						kind: "cam-ket",
						title: m.title,
						whyNow: "",
						position: viTri,
						status,
						publishedAt: luc,
						keyResults: {
							create: m.keyResults.map((k, i) => ({
								title: k.title,
								kind: k.kind,
								ownerUserId: k.ownerUserId,
								startValue: k.startValue,
								targetValue: k.targetValue,
								currentValue: k.startValue,
								unit: k.unit,
								source: "tay",
								position: i,
								startLockedAt: luc,
							})),
						},
					},
				});
				viTri += 1;
				demKr += m.keyResults.length;
				await this.vet(
					tx,
					userId,
					"tao",
					{ objectiveId: mt.id, cycleId: mt.cycleId },
					null,
					{
						title: mt.title,
						kind: mt.kind,
						level: mt.level,
						status: mt.status,
					},
				);
				if (status === "cho-duyet")
					await this.vet(
						tx,
						userId,
						"gui-duyet",
						{ objectiveId: mt.id },
						null,
						{ status },
					);
			}
			await this.vet(
				tx,
				userId,
				"nhap-bang-tinh",
				{ cycleId: input.cycleId },
				null,
				{
					unit: khoaDonVi(input.unit),
					cycleId: input.cycleId,
					objectives: kq.mucTieu.length,
					keyResults: demKr,
				},
			);
			return {
				written: demKr,
				objectives: kq.mucTieu.length,
				keyResults: demKr,
			};
		});
	}

	async byUnit(userId: string, cycleId: string, unit: DonViChon) {
		const q = await this.quyenOkr.quyen(userId);
		const dv = donViChon(unit);
		const objectives = await this.docMucTieu(
			this.db,
			{ cycleId, ...dv },
			userId,
			q,
			{ nguCanh: this.quyenOkr.nguCanhXem(q, userId) },
		);
		return {
			objectives,
			canEdit: this.quyenOkr.suaDuocDonVi(q, userId, dv),
			canCreate: this.quyenOkr.nhapDuoc(q, userId, dv),
			canhBao: null,
		};
	}

	async countByUnit(
		userId: string,
		cycleId: string,
	): Promise<Record<string, number>> {
		const q = await this.quyenOkr.quyen(userId);
		const nhom = await this.db.okrObjective.groupBy({
			by: ["level", "divisionId", "departmentId", "personUserId"],
			where: {
				AND: [
					{ cycleId, status: "cong-bo" },
					dieuKienXemMucTieu(this.quyenOkr.nguCanhXem(q, userId)),
				],
			},
			_count: { _all: true },
		});
		const dem: Record<string, number> = {};
		for (const n of nhom) {
			const khoa = khoaDonViDong(n);
			dem[khoa] = (dem[khoa] ?? 0) + n._count._all;
		}
		return dem;
	}

	async mine(userId: string, cycleId: string) {
		const q = await this.quyenOkr.quyen(userId);
		const [ds, cuaToi] = await Promise.all([
			this.docMucTieu(
				this.db,
				{
					cycleId,
					OR: [...vaiCuaToi(userId), { followers: { some: { userId } } }],
				},
				userId,
				q,
				{ nguCanh: this.quyenOkr.nguCanhXem(q, userId) },
			),
			this.db.okrObjective.findMany({
				where: { cycleId, OR: vaiCuaToi(userId) },
				select: { id: true },
			}),
		]);
		return chiaCuaToi(ds, new Set(cuaToi.map((m) => m.id)));
	}

	async objective(userId: string, id: string): Promise<ObjectiveOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const [mt] = await this.docMucTieu(this.db, { id }, userId, q, {
			nguCanh: nc,
		});
		if (!mt) throw new NotFoundException(T.khongThayMucTieu);
		const [vet, ky, donVi, nguoiXem, tu, ct] = await Promise.all([
			this.db.okrTrail.findMany({
				where: { objectiveId: id },
				orderBy: [{ at: "asc" }, { id: "asc" }],
			}),
			this.db.okrCycle.findUniqueOrThrow({
				where: { id: mt.cycleId },
				select: { name: true, phase: true, anLuc: true },
			}),
			this.db.okrObjective.findFirst({
				where: { AND: [{ id }, dieuKienXemMucTieu(nc)] },
				select: {
					...chonDonVi,
					hienThi: true,
					mangSangDi: {
						orderBy: { luc: "desc" },
						take: 1,
						select: {
							sangObjectiveId: true,
							sangCycle: { select: { name: true } },
						},
					},
				},
			}),
			this.db.okrNguoiXem.findMany({
				where: { objectiveId: id, objective: dieuKienXemMucTieu(nc) },
				orderBy: [{ createdAt: "asc" }, { userId: "asc" }],
				select: { user: { select: { id: true, name: true } } },
			}),
			this.db.okrMangSang.findFirst({
				where: { sangObjectiveId: id, tuObjective: dieuKienXemMucTieu(nc) },
				select: {
					tuObjectiveId: true,
					tuObjective: { select: { cycle: { select: { name: true } } } },
				},
			}),
			this.program(),
		]);
		if (!donVi) throw new NotFoundException(T.khongThayMucTieu);
		const { hienThi, mangSangDi, ...dongDonVi } = donVi;
		const objective = donViCuaDong(dongDonVi);
		const [moiNhat] = mangSangDi;
		const toi =
			moiNhat &&
			(await this.db.okrObjective.findFirst({
				where: {
					AND: [{ id: moiNhat.sangObjectiveId }, dieuKienXemMucTieu(nc)],
				},
				select: { id: true },
			}))
				? moiNhat
				: null;
		const krIds = mt.keyResults.map((k) => k.id);
		const dongVet = vet.map((v) => ({
			v,
			before: parseOkrVet(v.before),
			after: parseOkrVet(v.after),
		}));
		const [nguoi, dem, xong, bangChung, loc] = await Promise.all([
			this.db.user.findMany({
				where: { id: { in: [...new Set(vet.map((v) => v.actorUserId))] } },
				select: chonNguoi,
			}),
			this.db.okrViecKr.groupBy({
				by: ["keyResultId", "loai"],
				where: {
					keyResultId: { in: krIds },
					keyResult: { objective: dieuKienXemMucTieu(nc) },
				},
				_count: { _all: true },
			}),
			this.db.okrViecKr.groupBy({
				by: ["keyResultId"],
				where: {
					keyResultId: { in: krIds },
					keyResult: { objective: dieuKienXemMucTieu(nc) },
					loai: "viec",
					xongLuc: { not: null },
				},
				_count: { _all: true },
			}),
			this.db.okrBangChung.groupBy({
				by: ["keyResultId"],
				where: {
					keyResultId: { in: krIds },
					keyResult: { objective: dieuKienXemMucTieu(nc) },
				},
				_count: { _all: true },
			}),
			locXemTrongVet(this.db, nc, dongVet),
		]);
		const nguoiCua = (id: string) => nguoi.find((n) => n.id === id) ?? null;
		const vetDuyet = vet.filter((v) => VET_DUYET.has(v.action));
		const cuoiDuyet = vetDuyet.at(-1);
		const guiCuoi = vetDuyet.findLast((v) => v.action === "gui-duyet");
		const ghiDuoc = ky.anLuc === null && ghiDuocOPha(phaChuKy.parse(ky.phase));
		const duyetDuoc = this.quyenOkr.duyetDuoc(q, userId, objective);
		const choDuyet = mt.status === "cho-duyet";
		const cachCongBo = this.congBoHayGuiDuyet(ct, q, userId, objective);
		const sachLichSu =
			(mt.status === "nhap" || mt.status === "da-bo") &&
			((await lichSuMucTieu(this.db, [mt.id])).get(mt.id) ?? null) === null;
		const guiDuyetDuoc =
			ghiDuoc &&
			mt.canEdit &&
			mt.status === "nhap" &&
			cachCongBo === "cho-duyet";
		const traLaiTruoc = guiCuoi
			? vetDuyet.findLast(
					(v) =>
						v.action === "tra-lai" && v.at.getTime() < guiCuoi.at.getTime(),
				)
			: undefined;
		const nguoiDuyetCua = () =>
			this.quyenOkr.tenNguoiDuyet(q, this.quyenOkr.nguoiDuyet(q, objective));
		const demLoai = (krId: string, laViec: boolean) =>
			dem
				.filter((d) => d.keyResultId === krId && (d.loai === "viec") === laViec)
				.reduce((tong, d) => tong + d._count._all, 0);
		return {
			...mt,
			keyResults: mt.keyResults.map((k) => ({
				...k,
				soViec: {
					xong: xong.find((d) => d.keyResultId === k.id)?._count._all ?? 0,
					tong: demLoai(k.id, true),
				},
				soSangKien: demLoai(k.id, false),
				coBangChung: bangChung.some((d) => d.keyResultId === k.id),
			})),
			cycleName: ky.name,
			kyGhiDuoc: ghiDuoc,
			mangSangToi: toi
				? { objectiveId: toi.sangObjectiveId, cycleName: toi.sangCycle.name }
				: null,
			mangSangTu: tu
				? {
						objectiveId: tu.tuObjectiveId,
						cycleName: tu.tuObjective.cycle.name,
					}
				: null,
			trail: dongVet.map(({ v, before, after }) =>
				vetChoNguoiXem(
					vetSangKienChoVai(q.role, {
						id: v.id,
						at: v.at.toISOString(),
						actor: nguoi.find((n) => n.id === v.actorUserId) ?? null,
						action: hanhDongVet.parse(v.action),
						keyResultId: v.keyResultId,
						before,
						after,
						note: v.note,
					}),
					loc.xemDuoc,
					loc.mucTieuCuaKr,
				),
			),
			canEditKr: mt.keyResults
				.filter((k) =>
					this.quyenOkr.ghiDuocKr(q, userId, {
						ownerUserId: k.owner.id,
						objective,
					}),
				)
				.map((k) => k.id),
			hienThi: mucHienThi.parse(hienThi),
			nguoiXem: nguoiXem.map((x) => x.user),
			nguoiDuyetDuKien: guiDuyetDuoc ? nguoiDuyetCua() : null,
			choDuyet: choDuyet
				? {
						nguoiGui: guiCuoi ? nguoiCua(guiCuoi.actorUserId) : null,
						guiLuc: guiCuoi ? guiCuoi.at.toISOString() : null,
						nguoiDuyet: nguoiDuyetCua(),
						lanTraLaiTruoc: traLaiTruoc
							? {
									lyDo: traLaiTruoc.note ?? "",
									nguoi: nguoiCua(traLaiTruoc.actorUserId),
									luc: traLaiTruoc.at.toISOString(),
								}
							: null,
					}
				: null,
			traLaiGanNhat:
				mt.status === "nhap" && cuoiDuyet?.action === "tra-lai"
					? {
							lyDo: cuoiDuyet.note ?? "",
							nguoi: nguoiCua(cuoiDuyet.actorUserId),
							luc: cuoiDuyet.at.toISOString(),
						}
					: null,
			quyen: {
				datHienThi: mt.canEdit && ghiDuoc && !choDuyet,
				congBo:
					ghiDuoc &&
					mt.canEdit &&
					(mt.status === "nhap" || choDuyet) &&
					cachCongBo === "cong-bo",
				guiDuyet: guiDuyetDuoc,
				duyet: ghiDuoc && choDuyet && duyetDuoc,
				rutDuyet: ghiDuoc && choDuyet && guiCuoi?.actorUserId === userId,
				xoa: ghiDuoc && mt.canEdit && sachLichSu,
				dungLai: ghiDuoc && mt.canEdit && mt.status === "da-bo",
			},
			themKrLe:
				ghiDuoc &&
				!choDuyet &&
				mt.status !== "da-bo" &&
				this.quyenOkr.nhapDuoc(q, userId, objective),
		};
	}
}
