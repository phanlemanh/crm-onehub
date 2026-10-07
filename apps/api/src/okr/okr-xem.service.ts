import type { Db, Prisma } from "@crm/db";
import { boGioiHan, dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
import {
	cacTuan,
	congTuan,
	cuoiTrongTuan,
	type KrSo,
	type LanCapNhat,
	lyDoCua,
	moiNhat,
	xepHopTuan,
} from "@crm/db/okr-hop-tuan";
import { kyVongTheoNgay } from "@crm/db/okr-tien-do";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { MUC_TU_TIN, type MucTuTin } from "@crm/validation/okr-cap-nhat";
import { kieuKr } from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	HANG_CAP,
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
	tinhTrang,
} from "@crm/validation/okr-muc-tieu";
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { dungCayCanChinh } from "./can-chinh";
import { demMatLoc, type MucTieuGon } from "./danh-sach";
import { demGopYCho } from "./dem-gop-y";
import { dienBienKr, tuanCapNhatDau } from "./dien-bien";
import type { PhamDoc } from "./hien-thi";
import type { DonViChon, MucTieuOutput, NutCanChinh } from "./okr.contracts";
import { OkrService } from "./okr.service";
import {
	type DonViCuaMucTieu,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";
import { OKR_XEM } from "./okr-xem.config";
import type {
	CayCanChinhOutput,
	DanhSachInput,
	DanhSachOutput,
	DienBienOutput,
	DongCuaToi,
	DongHop,
	HopTuanInput,
	HopTuanOutput,
	KhoiCuaToiInput,
	KhoiCuaToiOutput,
	LocDanhSach,
	NutCayDayDu,
	SucKhoeOutput,
	ToanCanhOutput,
} from "./okr-xem.contracts";
import {
	type CayGon,
	cong,
	gopSucKhoe,
	gopToanCanh,
	KHONG,
	khoaCuaMucTieu,
	type SoRieng,
} from "./toan-canh";

const chonNguoiGon = { id: true, name: true } as const;
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);
const capMucTieu = z.enum(CAP_MUC_TIEU);
const mucTuTin = z.enum(MUC_TU_TIN);

type LanTheoKr = Map<string, { khoaLuc: Date | null; lan: LanCapNhat[] }>;

const RONG_LAN = { khoaLuc: null, lan: [] };

const HANG_CUA_TOI = {
	truot: 0,
	"cham-nhip": 1,
	"moc-chua": 2,
	thap: 3,
	khac: 4,
} as const;

function cayGon(q: Quyen): CayGon {
	const nguoi = (h: { id: string; name: string } | null) =>
		h ? { id: h.id, name: h.name } : null;
	const pb = (p: {
		id: string;
		name: string;
		head: { id: string; name: string } | null;
	}) => ({ id: p.id, name: p.name, head: nguoi(p.head) });
	return {
		divisions: q.cay.divisions.map((b) => ({
			...pb(b),
			departments: b.departments.map(pb),
		})),
		chuaXep: q.cay.chuaXep.map(pb),
	};
}

function donViCuaChon(unit: DonViChon): DonViCuaMucTieu {
	const rong = { divisionId: null, departmentId: null, personUserId: null };
	switch (unit.loai) {
		case "goc":
			return { ...rong, level: "onehub" };
		case "bp":
			return { ...rong, level: "bo-phan", divisionId: unit.id };
		case "pb":
			return { ...rong, level: "phong-ban", departmentId: unit.id };
		case "nguoi":
			return { ...rong, level: "ca-nhan", personUserId: unit.id };
	}
}

@Injectable()
export class OkrXemService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	dieuKienDonVi(unit: DonViChon, q: Quyen): Prisma.OkrObjectiveWhereInput {
		switch (unit.loai) {
			case "goc":
				return { level: "onehub" };
			case "bp": {
				const phongBan =
					q.cay.divisions
						.find((b) => b.id === unit.id)
						?.departments.map((p) => p.id) ?? [];
				return {
					OR: [
						{ level: "bo-phan", divisionId: unit.id },
						{ level: "phong-ban", departmentId: { in: phongBan } },
					],
				};
			}
			case "pb":
				return { level: "phong-ban", departmentId: unit.id };
			case "nguoi":
				return {
					OR: [
						{ ownerUserId: unit.id },
						{ personUserId: unit.id },
						{ participants: { some: { userId: unit.id } } },
						{ keyResults: { some: { ownerUserId: unit.id } } },
					],
				};
		}
	}

	private dieuKienLoc(loc: LocDanhSach): Prisma.OkrObjectiveWhereInput[] {
		const ra: Prisma.OkrObjectiveWhereInput[] = [];
		if (loc.phuTrach.length > 0)
			ra.push({
				OR: [
					{ ownerUserId: { in: loc.phuTrach } },
					{ keyResults: { some: { ownerUserId: { in: loc.phuTrach } } } },
				],
			});
		if (loc.loai.length > 0) ra.push({ kind: { in: loc.loai } });
		if (loc.trangThai.length > 0) ra.push({ status: { in: loc.trangThai } });
		return ra;
	}

	private async lanCuaKr(
		where: Prisma.OkrObjectiveWhereInput,
		pham: PhamDoc,
	): Promise<LanTheoKr> {
		const krs = await this.db.okrKeyResult.findMany({
			where: {
				objective: {
					AND: [
						where,
						pham === "so-gop" ? boGioiHan : dieuKienXemMucTieu(pham.nguCanh),
					],
				},
			},
			select: {
				id: true,
				startLockedAt: true,
				objective: { select: { publishedAt: true } },
				checkIns: {
					select: {
						weekStart: true,
						value: true,
						confidence: true,
						note: true,
						createdAt: true,
						session: { select: { submittedAt: true } },
					},
					orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				},
			},
		});
		return new Map(
			krs.map((k) => [
				k.id,
				{
					khoaLuc: k.startLockedAt ?? k.objective.publishedAt,
					lan: k.checkIns
						.map((c) => ({
							tuan: c.weekStart.toISOString().slice(0, 10),
							luc: c.session.submittedAt ?? c.createdAt,
							tuTin: mucTuTin.parse(c.confidence),
							ghiChu: c.note,
							giaTri: c.value.toNumber(),
						}))
						.sort((a, b) => a.luc.getTime() - b.luc.getTime()),
				},
			]),
		);
	}

	private krSoCua(mts: MucTieuOutput[], lan: LanTheoKr): Map<string, KrSo> {
		const ra = new Map<string, KrSo>();
		let thuTu = 0;
		for (const m of mts)
			for (const k of m.keyResults) {
				ra.set(k.id, { id: k.id, thuTu, ...(lan.get(k.id) ?? RONG_LAN) });
				thuTu += 1;
			}
		return ra;
	}

	private async tuanCuaKy(cycleId: string): Promise<string[]> {
		const ky = await this.db.okrCycle.findUnique({
			where: { id: cycleId },
			select: { startsOn: true, endsOn: true },
		});
		return ky ? cacTuan(ky.startsOn, ky.endsOn) : [];
	}

	async danhSach(
		userId: string,
		input: DanhSachInput,
	): Promise<DanhSachOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const donVi = this.dieuKienDonVi(input.unit, q);
		const goc = { AND: [{ cycleId: input.cycleId }, donVi] };
		const lan = await this.lanCuaKr(goc, { nguCanh: nc });
		const tuTinMoi = new Map<string, MucTuTin>();
		for (const [id, l] of lan) {
			const m = l.lan.at(-1);
			if (m) tuTinMoi.set(id, m.tuTin);
		}
		const krTuTin = [...tuTinMoi]
			.filter(([, t]) => input.loc.tuTin.includes(t))
			.map(([id]) => id);
		const locTuTin: Prisma.OkrObjectiveWhereInput[] =
			input.loc.tuTin.length > 0
				? [{ keyResults: { some: { id: { in: krTuTin } } } }]
				: [];
		const gon = await this.db.okrObjective.findMany({
			where: { AND: [goc, dieuKienXemMucTieu(nc)] },
			select: {
				id: true,
				kind: true,
				status: true,
				owner: { select: chonNguoiGon },
				keyResults: {
					select: { id: true, owner: { select: chonNguoiGon } },
				},
			},
		});
		const soGopY = await demGopYCho(
			this.db,
			gon.map((m) => m.id),
			{ viewerId: userId, q, access: this.quyenOkr },
		);
		const locGopY: Prisma.OkrObjectiveWhereInput[] = input.loc.gopY.includes(
			"cho",
		)
			? [
					{
						id: {
							in: [...soGopY].filter(([, so]) => so > 0).map(([id]) => id),
						},
					},
				]
			: [];
		const mucTieu = await this.okr.docMucTieu(
			this.db,
			{
				AND: [
					...goc.AND,
					...this.dieuKienLoc(input.loc),
					...locTuTin,
					...locGopY,
				],
			},
			userId,
			q,
			{ nguCanh: nc },
			undefined,
			soGopY,
		);
		const ds: MucTieuGon[] = gon.map((m) => ({
			id: m.id,
			owner: m.owner,
			kind: loaiMucTieu.parse(m.kind),
			status: trangThaiMucTieu.parse(m.status),
			krOwners: m.keyResults.map((k) => k.owner),
			tuTinKr: m.keyResults.flatMap((k) => {
				const t = tuTinMoi.get(k.id);
				return t ? [t] : [];
			}),
			coGopYCho: (soGopY.get(m.id) ?? 0) > 0,
		}));
		const coLocKr = input.loc.phuTrach.length > 0 || input.loc.tuTin.length > 0;
		const khopKr = (k: { id: string; owner: { id: string } }) =>
			(input.loc.phuTrach.length === 0 ||
				input.loc.phuTrach.includes(k.owner.id)) &&
			(input.loc.tuTin.length === 0 ||
				input.loc.tuTin.some((t) => tuTinMoi.get(k.id) === t));
		const tatCa = [...mucTieu]
			.sort((a, b) => HANG_CAP[a.level] - HANG_CAP[b.level])
			.map((m) => ({
				...m,
				krKhop: coLocKr ? m.keyResults.filter(khopKr).map((k) => k.id) : [],
			}));
		const tachDaBo = input.loc.trangThai.length === 0;
		const rows = tachDaBo
			? tatCa.filter((m) => m.status !== "da-bo")
			: tatCa;
		return {
			rows,
			daBo: tachDaBo ? tatCa.filter((m) => m.status === "da-bo") : [],
			total: rows.length,
			facetCounts: demMatLoc(ds, input.loc),
			canEdit: this.quyenOkr.suaDuocDonVi(q, userId, donViCuaChon(input.unit)),
			canCreate: this.quyenOkr.nhapDuoc(q, userId, donViCuaChon(input.unit)),
		};
	}

	async toanCanh(
		userId: string,
		cycleId: string,
		homNay = new Date(),
	): Promise<ToanCanhOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const where = { cycleId, status: "cong-bo" };
		const [congBo, lan, tuanKy] = await Promise.all([
			this.okr.docMucTieu(this.db, where, userId, q, "so-gop"),
			this.lanCuaKr(where, "so-gop"),
			this.tuanCuaKy(cycleId),
		]);
		const so = this.krSoCua(congBo, lan);
		return gopToanCanh(
			cayGon(q),
			congBo.map((m) => ({
				level: m.level,
				unitId: m.unitId,
				progress: m.progress,
				expected: m.expected,
				kr: m.keyResults.flatMap((k) => {
					const x = so.get(k.id);
					return x ? [x] : [];
				}),
			})),
			OKR.tenGoc,
			{ tuanKy, homNay },
		);
	}

	async sucKhoe(
		userId: string,
		cycleId: string,
		homNay = new Date(),
	): Promise<SucKhoeOutput> {
		const q = await this.quyenOkr.quyen(userId);
		if (!q.quanTriChuongTrinh)
			throw new ForbiddenException(OKR_XEM.thongDiep.chiQuanTri);
		const nguoi = q.cay.people.map((p) => p.id);
		const [kr, zalo, slack, lan] = await Promise.all([
			this.db.okrKeyResult.findMany({
				where: {
					objective: {
						AND: [{ cycleId, status: { in: ["cong-bo", "nhap"] } }, boGioiHan],
					},
				},
				select: {
					id: true,
					objective: {
						select: {
							level: true,
							divisionId: true,
							departmentId: true,
							status: true,
						},
					},
				},
			}),
			this.db.zaloLink.findMany({
				where: { crmUserId: { in: nguoi } },
				select: { crmUserId: true },
			}),
			this.db.slackMemberMatch.findMany({
				where: { crmUserId: { in: nguoi }, slackUserId: { not: null } },
				select: { crmUserId: true },
			}),
			this.lanCuaKr({ cycleId, status: "cong-bo" }, "so-gop"),
		]);
		const tuanTruoc = congTuan(dauTuanVN(homNay), -1);
		const rieng = new Map<string, SoRieng>();
		const them = (k: string, s: Partial<SoRieng>) => {
			rieng.set(k, cong(rieng.get(k) ?? KHONG, s));
		};
		for (const k of kr) {
			const o = k.objective;
			const khoa = khoaCuaMucTieu({
				level: capMucTieu.parse(o.level),
				unitId: o.divisionId ?? o.departmentId,
			});
			if (khoa === null) continue;
			if (o.status !== "cong-bo") {
				them(khoa, { chuaKhoiDiem: 1 });
				continue;
			}
			const so: KrSo = { id: k.id, thuTu: 0, ...(lan.get(k.id) ?? RONG_LAN) };
			them(khoa, {
				tongKr: 1,
				dungTuan: cuoiTrongTuan(so, tuanTruoc) === null ? 0 : 1,
				krIm: lyDoCua(so, homNay).some((d) => d.loai === "im") ? 1 : 0,
			});
		}
		const daNoi = new Set([...zalo, ...slack].map((x) => x.crmUserId));
		for (const p of q.cay.people) {
			if (daNoi.has(p.id)) continue;
			them(
				p.primaryDepartmentId === null ? "goc" : `pb:${p.primaryDepartmentId}`,
				{ chuaNoiKenh: 1 },
			);
		}
		return gopSucKhoe(cayGon(q), rieng, OKR.tenGoc);
	}

	async cayCanChinh(
		userId: string,
		cycleId: string,
	): Promise<CayCanChinhOutput> {
		const { mts, gioiHan } = await this.okr.mucTieuCuaCay(userId, cycleId);
		const kyVong = new Map(mts.map((m) => [m.id, m.expected]));
		const laMoc = new Set(
			mts.flatMap((m) =>
				m.keyResults.filter((k) => k.kind === "moc").map((k) => k.id),
			),
		);
		const gan = (n: NutCanChinh): NutCayDayDu => ({
			...n,
			expected:
				n.loai === "kr" && laMoc.has(n.id)
					? null
					: (kyVong.get(n.objectiveId) ?? null),
			children: n.children.map(gan),
		});
		const cay = dungCayCanChinh(mts, gioiHan);
		return {
			roots: cay.roots.map(gan),
			chuaCanChinh: cay.chuaCanChinh.map(gan),
		};
	}

	async hopTuan(
		userId: string,
		input: HopTuanInput,
		homNay = new Date(),
	): Promise<HopTuanOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const where = {
			AND: [
				{ cycleId: input.cycleId, status: "cong-bo" },
				this.dieuKienDonVi(input.unit, q),
			],
		};
		const [mts, lan] = await Promise.all([
			this.okr.docMucTieu(this.db, where, userId, q, "so-gop"),
			this.lanCuaKr(where, "so-gop"),
		]);
		const so = this.krSoCua(mts, lan);
		const tuan = dauTuanVN(homNay);
		const xep = xepHopTuan([...so.values()], homNay);
		const theoId = new Map(
			mts.flatMap((m) => m.keyResults.map((k) => [k.id, { m, k }] as const)),
		);
		const dong = (d: { id: string; lyDo: DongHop["lyDo"] }): DongHop[] => {
			const x = theoId.get(d.id);
			const s = so.get(d.id);
			if (!x || !s) return [];
			const laMoc = x.k.kind === "moc";
			const moi = moiNhat(s);
			const ghi = [...s.lan].reverse().find((l) => l.ghiChu.trim() !== "");
			return [
				{
					keyResultId: x.k.id,
					objectiveId: x.m.id,
					tieuDe: x.k.title,
					mucTieu: x.m.title,
					chuTen: x.k.owner.name,
					progress: x.k.progress,
					expected: laMoc ? null : x.m.expected,
					laMoc,
					tuTin: moi?.tuTin ?? null,
					ghiChu: ghi?.ghiChu ?? null,
					lyDo: d.lyDo,
				},
			];
		};
		const tatCa = [...so.values()];
		return {
			tuan,
			tuanDau: tatCa.every((k) => k.lan.length === 0),
			daCapNhat: tatCa.filter((k) => cuoiTrongTuan(k, tuan) !== null).length,
			tongKr: tatCa.length,
			dangBan: xep.dangBan.flatMap(dong),
			conLai: xep.conLai.flatMap(dong),
		};
	}

	async moHopTuan(
		userId: string,
		input: HopTuanInput,
		homNay = new Date(),
	): Promise<{ ghi: boolean }> {
		if (input.unit.loai !== "bp" && input.unit.loai !== "pb")
			return { ghi: false };
		const q = await this.quyenOkr.quyen(userId);
		if (!this.quyenOkr.suaDuocDonVi(q, userId, donViCuaChon(input.unit)))
			return { ghi: false };
		const donVi = `${input.unit.loai}:${input.unit.id}`;
		const tuan = dauTuanVN(homNay);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, input.cycleId);
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`mo-hop-tuan:${userId}:${donVi}`}))`;
			const gan = await tx.okrTrail.findMany({
				where: {
					action: "mo-hop-tuan",
					actorUserId: userId,
					cycleId: input.cycleId,
					at: {
						gt: new Date(homNay.getTime() - OKR_XEM.moHopTuan.gopMs),
						lte: homNay,
					},
				},
				select: { after: true },
			});
			const trung = gan.some((v) => {
				const a = z
					.object({ donVi: z.string(), tuan: z.string() })
					.safeParse(v.after);
				return a.success && a.data.donVi === donVi && a.data.tuan === tuan;
			});
			if (trung) return { ghi: false };
			await tx.okrTrail.create({
				data: {
					actorUserId: userId,
					action: "mo-hop-tuan",
					cycleId: input.cycleId,
					objectiveId: null,
					keyResultId: null,
					at: homNay,
					after: { donVi, tuan },
				},
			});
			return { ghi: true };
		});
	}

	async dienBien(
		userId: string,
		keyResultId: string,
		homNay = new Date(),
	): Promise<DienBienOutput> {
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const kr = await this.db.okrKeyResult.findFirst({
			where: { id: keyResultId, objective: dieuKienXemMucTieu(nc) },
			select: {
				id: true,
				title: true,
				kind: true,
				startValue: true,
				targetValue: true,
				unit: true,
				objective: {
					select: {
						publishedAt: true,
						cycle: {
							select: {
								startsOn: true,
								endsOn: true,
								breakStartsOn: true,
								breakEndsOn: true,
							},
						},
					},
				},
			},
		});
		if (!kr) throw new NotFoundException(OKR.thongDiep.khongThayMucTieu);
		const lan = await this.lanCuaKr(
			{ keyResults: { some: { id: kr.id } } },
			{ nguCanh: nc },
		);
		const c = kr.objective.cycle;
		const nghi =
			c.breakStartsOn && c.breakEndsOn
				? { tu: c.breakStartsOn, den: c.breakEndsOn }
				: null;
		const kieu = kieuKr.parse(kr.kind);
		const so = { id: kr.id, thuTu: 0, ...(lan.get(kr.id) ?? RONG_LAN) };
		return {
			kieu,
			tieuDe: kr.title,
			khoi: kr.startValue.toNumber(),
			dich: kr.targetValue.toNumber(),
			donVi: kr.unit,
			coCapNhat: so.lan.length > 0,
			tuanDau: tuanCapNhatDau(c.startsOn, kr.objective.publishedAt, homNay),
			diem: dienBienKr(
				{
					...so,
					kieu,
					khoi: kr.startValue.toNumber(),
					dich: kr.targetValue.toNumber(),
				},
				cacTuan(c.startsOn, c.endsOn),
				homNay,
				(tuan) =>
					kyVongTheoNgay(
						kr.objective.publishedAt,
						c.endsOn,
						new Date(`${tuan}T00:00:00+07:00`),
						nghi,
					),
			),
		};
	}

	async khoiCuaToi(
		userId: string,
		input: KhoiCuaToiInput,
	): Promise<KhoiCuaToiOutput> {
		const ai = input.userId ?? userId;
		const q = await this.quyenOkr.quyen(userId);
		const pham = { nguCanh: this.quyenOkr.nguCanhXem(q, userId) };
		const where = {
			cycleId: input.cycleId,
			status: "cong-bo",
			keyResults: { some: { ownerUserId: ai } },
		};
		const [mts, lan] = await Promise.all([
			this.okr.docMucTieu(this.db, where, userId, q, pham),
			this.lanCuaKr(where, pham),
		]);
		const so = this.krSoCua(mts, lan);
		const dong: (DongCuaToi & { thuTu: number })[] = mts.flatMap((m) =>
			m.keyResults
				.filter((k) => k.owner.id === ai)
				.map((k) => {
					const laMoc = k.kind === "moc";
					const s = so.get(k.id);
					const moi = s ? moiNhat(s) : null;
					const expected = laMoc ? null : m.expected;
					return {
						keyResultId: k.id,
						objectiveId: m.id,
						tieuDe: k.title,
						mucTieu: m.title,
						chuTen: k.owner.name,
						progress: k.progress,
						expected,
						laMoc,
						tuTin: moi?.tuTin ?? null,
						nhip: laMoc
							? k.progress >= 100
								? "moc-xong"
								: "moc-chua"
							: tinhTrang(k.progress, expected, m.kind),
						thuTu: s?.thuTu ?? 0,
					};
				}),
		);
		const hang = (d: DongCuaToi) => {
			if (d.nhip === "truot") return HANG_CUA_TOI.truot;
			if (d.nhip === "cham-nhip") return HANG_CUA_TOI["cham-nhip"];
			if (d.nhip === "moc-chua") return HANG_CUA_TOI["moc-chua"];
			if (d.tuTin === "thap") return HANG_CUA_TOI.thap;
			return HANG_CUA_TOI.khac;
		};
		const xep = dong.sort((a, b) => hang(a) - hang(b) || a.thuTu - b.thuTu);
		return {
			kr: xep.slice(0, OKR_XEM.khoiCuaToi.toiDa).map(({ thuTu: _, ...d }) => d),
			tong: xep.length,
		};
	}
}
