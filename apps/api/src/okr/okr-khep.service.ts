import type { Db, Prisma } from "@crm/db";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import { dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { PHA_GHI_DUOC } from "@crm/validation/okr-chu-ky";
import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import {
	type ChamKrInput,
	cachDoc,
	diemChuan,
	diemMucTieu,
	diemTheoThang,
	ghiDieuHocDuocInput,
	luoiDiem,
	type MoRaInput,
	type mangSangInput,
	moLaiKyInput,
	OKR_KHEP,
	type ThangCham,
	type xuatKyInput,
} from "@crm/validation/okr-khep";
import {
	kiemSoTheoKieu,
	kieuKr,
	type LoiSoTheoKieu,
} from "@crm/validation/okr-kr";
import { HANG_CAP, LOAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { tenDonVi } from "./don-vi";
import { locXemTrongVet } from "./hien-thi";
import {
	dongKyChoNguoiXem,
	hocTapChuaGhi,
	ngayLuu,
	PHA_CO_DIEM,
	PHA_NHIN_LAI,
} from "./khep";
import { OkrService } from "./okr.service";
import {
	chonDonVi,
	donViCua,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";
import {
	type BangChamInput,
	type BangChamOutput,
	COT_XUAT,
	type MangSangOutput,
	type MucTieuCham,
	type XuatKyOutput,
} from "./okr-khep.contracts";
import { dungCsv, type OCsv, tenTepXuat } from "./okr-khep.csv";
import { OkrXemService } from "./okr-xem.service";

const T = OKR.thongDiep;
const thangCham = z.enum(THANG_CHAM);
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
type GhiDieuHocDuocInput = z.infer<typeof ghiDieuHocDuocInput>;
type MoLaiKyInput = z.infer<typeof moLaiKyInput>;
type MangSangInput = z.infer<typeof mangSangInput>;
type XuatKyInput = z.infer<typeof xuatKyInput>;
const soThap = (v: number) => String(v).replace(".", ",");

const chonBangCham = {
	...chonDonVi,
	title: true,
	kind: true,
	owner: { select: { name: true } },
	nhinLai: { select: { dieuHocDuoc: true } },
	mangSangDi: {
		orderBy: { luc: "desc" },
		take: 1,
		select: { sangObjectiveId: true, sangCycle: { select: { name: true } } },
	},
	mangSangTu: {
		select: {
			tuObjectiveId: true,
			tuObjective: { select: { cycle: { select: { name: true } } } },
		},
	},
	keyResults: {
		where: { diemKr: { isNot: null } },
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		select: {
			id: true,
			title: true,
			kind: true,
			ownerUserId: true,
			owner: { select: { name: true } },
			unit: true,
			startValue: true,
			targetValue: true,
			weight: true,
			diemKr: {
				select: {
					soChot: true,
					diemGoiY: true,
					diem: true,
					lyDo: true,
					thang: true,
					trongSoBat: true,
				},
			},
			doiDich: {
				where: { ngoaiRa: true },
				orderBy: { luc: "asc" },
				select: { luc: true, truoc: true, sau: true, lyDo: true },
			},
		},
	},
} satisfies Prisma.OkrObjectiveSelect;

const chonXuat = {
	id: true,
	level: true,
	status: true,
	title: true,
	kind: true,
	owner: { select: { name: true } },
	division: { select: { name: true } },
	department: { select: { name: true } },
	person: { select: { name: true } },
	nhinLai: { select: { dieuHocDuoc: true } },
	mangSangDi: {
		orderBy: { luc: "desc" },
		take: 1,
		select: { sangCycle: { select: { name: true } } },
	},
	keyResults: {
		where: { objective: { status: "da-bo" } },
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		select: {
			title: true,
			kind: true,
			unit: true,
			startValue: true,
			targetValue: true,
			owner: { select: { name: true } },
			_count: { select: { doiDich: { where: { ngoaiRa: true } } } },
		},
	},
} satisfies Prisma.OkrObjectiveSelect;

type MucTieuXuat = Prisma.OkrObjectiveGetPayload<{ select: typeof chonXuat }>;

const KR_TRONG: OCsv[] = Array.from({ length: 11 }, () => null);

function dongXuat(
	ky: string,
	m: MucTieuXuat,
	cham: MucTieuCham | undefined,
): OCsv[][] {
	const dau: OCsv[] = [ky, m.level, tenDonVi(m), m.title, m.kind, m.status];
	if (cham) {
		const cuoi: OCsv[] = [
			cham.diem,
			cham.dieuHocDuoc,
			cham.mangSangToi?.cycleName ?? null,
		];
		const krs = cham.krs.map((k): OCsv[] => [
			k.title,
			k.kind,
			k.unit,
			k.ownerName,
			k.startValue,
			k.targetValue,
			k.soChot,
			k.diemGoiY,
			k.diem,
			k.lyDo,
			k.doiDichNgoaiRa.length,
		]);
		return (krs.length ? krs : [KR_TRONG]).map((k) => [
			...dau,
			cham.ownerName,
			...k,
			...cuoi,
		]);
	}
	const cuoi: OCsv[] = [
		null,
		m.nhinLai?.dieuHocDuoc ?? null,
		m.mangSangDi[0]?.sangCycle.name ?? null,
	];
	const krs = m.keyResults.map((k): OCsv[] => [
		k.title,
		k.kind,
		k.unit,
		k.owner.name,
		Number(k.startValue),
		Number(k.targetValue),
		null,
		null,
		null,
		null,
		k._count.doiDich,
	]);
	return (krs.length ? krs : [KR_TRONG]).map((k) => [
		...dau,
		m.owner.name,
		...k,
		...cuoi,
	]);
}

@Injectable()
export class OkrKhepService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrXemService) private readonly xem: OkrXemService,
	) {}

	async moRa(userId: string, input: MoRaInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			await this.okr.assertKyGhiDuoc(tx, input.cycleId);
			const c = await tx.okrCycle.findUniqueOrThrow({
				where: { id: input.cycleId },
			});
			if (c.phase !== "dang-chay")
				throw new BadRequestException(T.khep.raChiKhiDangChay);
			if (input.tuNgay < ngayVN(c.startsOn) || input.denNgay > ngayVN(c.endsOn))
				throw new BadRequestException(T.khep.raNgoaiKy);
			const chong = await tx.okrCuaSoRa.findFirst({
				where: {
					cycleId: c.id,
					dongLuc: null,
					tuNgay: { lte: ngayLuu(input.denNgay) },
					denNgay: { gte: ngayLuu(input.tuNgay) },
				},
			});
			if (chong) throw new BadRequestException(T.khep.raChong);
			const r = await tx.okrCuaSoRa.create({
				data: {
					cycleId: c.id,
					tuNgay: ngayLuu(input.tuNgay),
					denNgay: ngayLuu(input.denNgay),
					moBoiUserId: userId,
				},
			});
			await this.okr.vet(tx, userId, "mo-ra", { cycleId: c.id }, null, {
				tuNgay: input.tuNgay,
				denNgay: input.denNgay,
			});
			return { id: r.id, canhBao: null };
		});
	}

	async dongRa(userId: string, id: string) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const r = await tx.okrCuaSoRa.findUnique({ where: { id } });
			if (!r) throw new NotFoundException(T.khep.khongCoCuaSoRa(id));
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${r.cycleId} FOR UPDATE`;
			await this.okr.assertKyGhiDuoc(tx, r.cycleId);
			const dongLuc = new Date();
			const { count } = await tx.okrCuaSoRa.updateMany({
				where: { id, dongLuc: null },
				data: { dongLuc, dongBoiUserId: userId },
			});
			if (count === 0) throw new BadRequestException(T.khep.raDaDong);
			await this.okr.vet(
				tx,
				userId,
				"dong-ra",
				{ cycleId: r.cycleId },
				{ tuNgay: ngayVN(r.tuNgay), denNgay: ngayVN(r.denNgay) },
				{ dongLuc: dongLuc.toISOString() },
			);
			return { id, canhBao: null };
		});
	}

	async chamKr(userId: string, input: ChamKrInput) {
		const kr = await this.quyenOkr.assertSuaKr(userId, input.keyResultId);
		const cycleId = kr.objective.cycleId;
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, cycleId);
			const c = await tx.okrCycle.findUniqueOrThrow({
				where: { id: cycleId },
				select: { phase: true },
			});
			if (c.phase === "da-dong") throw new BadRequestException(T.khep.kyDaDong);
			if (c.phase !== "cham-diem")
				throw new BadRequestException(T.khep.chiChamKhiChamDiem);
			const dong = await tx.okrDiemKr.findUnique({
				where: { keyResultId: kr.id },
			});
			if (!dong) throw new BadRequestException(T.khep.khongCoDiemKr);
			const thang = thangCham.parse(dong.thang);
			const chuan = diemChuan(input.diem, thang);
			if (chuan === null) {
				const luoi = luoiDiem(thang);
				throw new BadRequestException(
					T.khep.ngoaiLuoi(soThap(luoi[1] ?? 0), soThap(luoi.at(-1) ?? 0)),
				);
			}
			const lyDo = input.lyDo ?? "";
			if (
				chuan !== Number(dong.diemGoiY) &&
				lyDo.length < OKR_KHEP.lyDo.toiThieu
			)
				throw new BadRequestException(T.khep.canLyDoCham);
			await tx.okrDiemKr.update({
				where: { id: dong.id },
				data: {
					diem: chuan,
					lyDo: lyDo || null,
					chamBoiUserId: userId,
					chamLuc: new Date(),
				},
			});
			await this.okr.vet(
				tx,
				userId,
				"cham-kr",
				{ cycleId, objectiveId: kr.objectiveId, keyResultId: kr.id },
				{
					diem: dong.diem === null ? null : Number(dong.diem),
					lyDo: dong.lyDo,
				},
				{ diem: chuan, lyDo: lyDo || null },
			);
			return { id: kr.id, canhBao: null };
		});
	}

	async ghiDieuHocDuoc(userId: string, input: GhiDieuHocDuocInput) {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, mt.cycleId);
			const c = await tx.okrCycle.findUniqueOrThrow({
				where: { id: mt.cycleId },
				select: { phase: true },
			});
			if (c.phase === "da-dong") throw new BadRequestException(T.khep.kyDaDong);
			if (!PHA_NHIN_LAI.includes(c.phase))
				throw new BadRequestException(T.khep.nhinLaiChiKhi);
			const cu = await tx.okrNhinLai.findUnique({
				where: { objectiveId: mt.id },
			});
			await tx.okrNhinLai.upsert({
				where: { objectiveId: mt.id },
				create: {
					objectiveId: mt.id,
					dieuHocDuoc: input.noiDung,
					suaBoiUserId: userId,
				},
				update: { dieuHocDuoc: input.noiDung, suaBoiUserId: userId },
			});
			await this.okr.vet(
				tx,
				userId,
				"nhin-lai",
				{ cycleId: mt.cycleId, objectiveId: mt.id },
				cu ? { dieuHocDuoc: cu.dieuHocDuoc } : null,
				{ dieuHocDuoc: input.noiDung },
			);
			return { id: mt.id, canhBao: null };
		});
	}

	async moLaiKy(userId: string, input: MoLaiKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.id} FOR UPDATE`;
			await this.okr.assertKyChuaAn(tx, input.id);
			const c = await tx.okrCycle.findUnique({
				where: { id: input.id },
				select: { phase: true },
			});
			if (!c) throw new NotFoundException(T.khongCoChuKy(input.id));
			if (c.phase !== "da-dong")
				throw new BadRequestException(T.khep.chiMoLaiKhiDong);
			await tx.okrCycle.update({
				where: { id: input.id },
				data: { phase: "cham-diem" },
			});
			await this.okr.vet(
				tx,
				userId,
				"mo-lai-ky",
				{ cycleId: input.id },
				{ phase: "da-dong" },
				{ phase: "cham-diem" },
				input.lyDo,
			);
			return { id: input.id, canhBao: null };
		});
	}

	async mangSang(
		userId: string,
		input: MangSangInput,
	): Promise<MangSangOutput> {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.objectiveId);
		return this.db.$transaction(async (tx) => {
			const kyNguon = await tx.okrCycle.findUniqueOrThrow({
				where: { id: mt.cycleId },
				select: { kind: true, endsOn: true },
			});
			const dich = await tx.okrCycle.findFirst({
				where: {
					kind: kyNguon.kind,
					startsOn: { gt: kyNguon.endsOn },
					phase: { in: [...PHA_GHI_DUOC] },
					...KY_CON_HIEN,
				},
				orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }],
				select: { id: true },
			});
			for (const id of [mt.cycleId, ...(dich ? [dich.id] : [])].sort())
				await this.okr.assertKyChuaAn(tx, id);
			await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${mt.id} FOR UPDATE`;
			const nguon = await tx.okrObjective.findUniqueOrThrow({
				where: { id: mt.id },
				select: {
					status: true,
					kind: true,
					title: true,
					whyNow: true,
					ownerUserId: true,
					hienThi: true,
					participants: { select: { userId: true } },
					nguoiXem: { select: { userId: true } },
					cycle: { select: { phase: true } },
					keyResults: {
						where: { diemKr: { isNot: null } },
						orderBy: [{ position: "asc" }, { createdAt: "asc" }],
						select: {
							id: true,
							title: true,
							kind: true,
							ownerUserId: true,
							unit: true,
							targetValue: true,
							weight: true,
							diemKr: { select: { soChot: true, diemGoiY: true, diem: true } },
						},
					},
				},
			});
			if (nguon.status !== "cong-bo")
				throw new BadRequestException(T.khep.mangSangChiCongBo);
			if (!PHA_CO_DIEM.includes(nguon.cycle.phase))
				throw new BadRequestException(T.khep.mangSangChiKhi);
			if (!dich) throw new BadRequestException(T.khep.chuaCoKyKe);
			const daCo = await tx.okrMangSang.findUnique({
				where: {
					tuObjectiveId_sangCycleId: {
						tuObjectiveId: mt.id,
						sangCycleId: dich.id,
					},
				},
			});
			if (daCo) throw new BadRequestException(T.khep.daMangSang);
			if (mt.level === "ca-nhan" && !(await this.okr.program(tx)).personalOn)
				throw new BadRequestException(T.caNhanTat);
			await this.okr.assertThanhVien(tx, [
				nguon.ownerUserId,
				...(mt.personUserId ? [mt.personUserId] : []),
			]);
			const { giu: thamGia, bo: boThamGia } = await this.okr.locThanhVien(
				tx,
				nguon.participants.map((p) => p.userId),
			);
			const { giu: nguoiXem } = await this.okr.locThanhVien(
				tx,
				nguon.nguoiXem.map((x) => x.userId),
			);
			const { bo: roiKr } = await this.okr.locThanhVien(
				tx,
				nguon.keyResults.map((k) => k.ownerUserId),
			);
			const chuDaRoi = new Set(roiKr);
			const canhBao = await this.okr.kiemTranMucTieu(tx, dich.id, mt, 1);
			const viTri = await tx.okrObjective.count({
				where: { cycleId: dich.id },
			});
			const moi = await tx.okrObjective.create({
				data: {
					cycleId: dich.id,
					level: mt.level,
					divisionId: mt.divisionId,
					departmentId: mt.departmentId,
					personUserId: mt.personUserId,
					ownerUserId: nguon.ownerUserId,
					kind: nguon.kind,
					title: nguon.title,
					whyNow: nguon.whyNow,
					hienThi: nguon.hienThi,
					position: viTri,
					participants: { create: thamGia.map((u) => ({ userId: u })) },
					nguoiXem: {
						create: nguoiXem.map((u) => ({ userId: u, createdById: userId })),
					},
				},
			});
			const chep: string[] = [];
			const doiPhuTrachKr: string[] = [];
			const khongChep: { keyResultId: string; lyDo: LoiSoTheoKieu }[] = [];
			for (const k of nguon.keyResults) {
				const d = k.diemKr;
				if (!d) continue;
				if (Number(d.diem ?? d.diemGoiY) >= OKR_KHEP.mangSang.diemTron)
					continue;
				const loi = kiemSoTheoKieu(
					kieuKr.parse(k.kind),
					Number(d.soChot),
					Number(k.targetValue),
				);
				if (loi) {
					khongChep.push({ keyResultId: k.id, lyDo: loi });
					continue;
				}
				await tx.okrKeyResult.create({
					data: {
						objectiveId: moi.id,
						title: k.title,
						kind: k.kind,
						ownerUserId: chuDaRoi.has(k.ownerUserId)
							? nguon.ownerUserId
							: k.ownerUserId,
						startValue: d.soChot,
						targetValue: k.targetValue,
						currentValue: d.soChot,
						unit: k.unit,
						source: "tay",
						dueOn: null,
						weight: k.weight,
						position: chep.length,
					},
				});
				chep.push(k.id);
				if (chuDaRoi.has(k.ownerUserId)) doiPhuTrachKr.push(k.id);
			}
			await tx.okrMangSang.create({
				data: {
					tuObjectiveId: mt.id,
					sangObjectiveId: moi.id,
					sangCycleId: dich.id,
					boiUserId: userId,
				},
			});
			await this.okr.vet(
				tx,
				userId,
				"mang-sang",
				{ cycleId: mt.cycleId, objectiveId: mt.id },
				null,
				{
					sangObjectiveId: moi.id,
					sangCycleId: dich.id,
					chep,
					khongChep: khongChep.map((x) => x.keyResultId),
					boThamGia,
					doiPhuTrachKr,
				},
			);
			await this.okr.vet(
				tx,
				userId,
				"tao",
				{ cycleId: dich.id, objectiveId: moi.id },
				null,
				{
					title: moi.title,
					kind: moi.kind,
					level: moi.level,
					status: moi.status,
					tuObjectiveId: mt.id,
				},
			);
			return {
				id: moi.id,
				cycleId: dich.id,
				chep,
				khongChep,
				boThamGia,
				doiPhuTrachKr,
				canhBao,
			};
		});
	}

	async bangCham(
		userId: string,
		input: BangChamInput,
	): Promise<BangChamOutput> {
		return this.bangChamCua(userId, await this.quyenOkr.quyen(userId), input);
	}

	private async bangChamCua(
		userId: string,
		q: Quyen,
		input: BangChamInput,
	): Promise<BangChamOutput> {
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const c = await this.db.okrCycle.findUnique({
			where: { id: input.cycleId },
			select: { phase: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(input.cycleId));
		if (!PHA_CO_DIEM.includes(c.phase))
			throw new BadRequestException(T.khep.bangChamChuaCo);
		const where: Prisma.OkrObjectiveWhereInput = {
			AND: [
				{ cycleId: input.cycleId, status: "cong-bo" },
				input.donVi ? this.xem.dieuKienDonVi(input.donVi, q) : {},
			],
		};
		const [mts, dauDong, dongKy, hocTap] = await Promise.all([
			this.db.okrObjective.findMany({
				where: { AND: [where, dieuKienXemMucTieu(nc)] },
				orderBy: [{ position: "asc" }, { createdAt: "asc" }],
				select: chonBangCham,
			}),
			this.db.okrDiemKr.findFirst({
				where: { cycleId: input.cycleId },
				select: { thang: true },
			}),
			dongKyChoNguoiXem(this.db, input.cycleId, nc),
			hocTapChuaGhi(this.db, input.cycleId, nc),
		]);
		const thangKy = dauDong ? thangCham.parse(dauDong.thang) : null;
		const { xemDuoc } = await locXemTrongVet(
			this.db,
			nc,
			[],
			mts.flatMap((m) => [
				...m.mangSangDi.map((d) => d.sangObjectiveId),
				...(m.mangSangTu ? [m.mangSangTu.tuObjectiveId] : []),
			]),
		);
		const mucTieu = mts
			.map((m): MucTieuCham & { hang: number } => {
				const dv = donViCua(m);
				const krs = m.keyResults.flatMap((k) => {
					const d = k.diemKr;
					if (!d) return [];
					const thang = thangCham.parse(d.thang);
					const diem = d.diem === null ? null : Number(d.diem);
					return [
						{
							thang,
							trongSoBat: d.trongSoBat,
							chuan: diem,
							weight: Number(k.weight),
							ra: {
								id: k.id,
								title: k.title,
								kind: kieuKr.parse(k.kind),
								ownerName: k.owner.name,
								unit: k.unit,
								startValue: Number(k.startValue),
								targetValue: Number(k.targetValue),
								soChot: Number(d.soChot),
								diemGoiY: diemTheoThang(Number(d.diemGoiY), thang),
								diem: diem === null ? null : diemTheoThang(diem, thang),
								lyDo: d.lyDo,
								suaDuoc: this.quyenOkr.ghiDuocKr(q, userId, {
									ownerUserId: k.ownerUserId,
									objective: dv,
								}),
								doiDichNgoaiRa: k.doiDich.map((x) => ({
									luc: x.luc.toISOString(),
									truoc: Number(x.truoc),
									sau: Number(x.sau),
									lyDo: x.lyDo,
								})),
							},
						},
					];
				});
				const dau = krs[0];
				const loai = loaiMucTieu.parse(m.kind);
				const diem = diemMucTieu(
					krs.map((k) => ({ diem: k.chuan, weight: k.weight })),
					dau?.trongSoBat ?? false,
				);
				const thang: ThangCham | null = dau?.thang ?? thangKy;
				const toi = m.mangSangDi.find((d) => xemDuoc(d.sangObjectiveId));
				return {
					hang: HANG_CAP[dv.level],
					id: m.id,
					title: m.title,
					kind: loai,
					ownerName: m.owner.name,
					suaDuoc: this.quyenOkr.suaDuocDonVi(q, userId, dv),
					diem:
						diem === null || thang === null ? null : diemTheoThang(diem, thang),
					cachDoc: cachDoc(loai, diem, m.nhinLai?.dieuHocDuoc ?? ""),
					dieuHocDuoc: m.nhinLai?.dieuHocDuoc ?? "",
					mangSangToi: toi
						? {
								objectiveId: toi.sangObjectiveId,
								cycleName: toi.sangCycle.name,
							}
						: null,
					mangSangTu:
						m.mangSangTu && xemDuoc(m.mangSangTu.tuObjectiveId)
							? {
									objectiveId: m.mangSangTu.tuObjectiveId,
									cycleName: m.mangSangTu.tuObjective.cycle.name,
								}
							: null,
					krs: krs.map((k) => k.ra),
				};
			})
			.sort((a, b) => a.hang - b.hang)
			.map(({ hang: _, ...m }) => m);
		return {
			thang: thangKy,
			conLai: dongKy.conLai,
			chuaCham: dongKy.theoDonVi,
			hocTapChuaGhi: hocTap,
			mucTieu,
		};
	}

	async xuatKy(userId: string, input: XuatKyInput): Promise<XuatKyOutput> {
		const c = await this.db.okrCycle.findUnique({
			where: { id: input.cycleId },
			select: { name: true, phase: true },
		});
		if (!c) throw new NotFoundException(T.khongCoChuKy(input.cycleId));
		if (c.phase !== "da-dong")
			throw new BadRequestException(T.khep.xuatChiKhiDong);
		const q = await this.quyenOkr.quyen(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const [bang, mts] = await Promise.all([
			this.bangChamCua(userId, q, { cycleId: input.cycleId }),
			this.db.okrObjective.findMany({
				where: {
					AND: [
						{
							cycleId: input.cycleId,
							status: { in: ["cong-bo", "da-bo"] },
						},
						dieuKienXemMucTieu(nc),
					],
				},
				orderBy: [{ position: "asc" }, { createdAt: "asc" }],
				select: chonXuat,
			}),
		]);
		const cham = new Map(bang.mucTieu.map((m) => [m.id, m]));
		const dong = mts
			.map((m) => ({ hang: HANG_CAP[donViCua(m).level], m }))
			.sort((a, b) => a.hang - b.hang)
			.flatMap(({ m }) =>
				dongXuat(
					c.name,
					m,
					m.status === "cong-bo" ? cham.get(m.id) : undefined,
				),
			);
		return {
			tenTep: tenTepXuat(c.name, ngayVN(new Date())),
			noiDung: dungCsv(COT_XUAT, dong),
		};
	}
}
