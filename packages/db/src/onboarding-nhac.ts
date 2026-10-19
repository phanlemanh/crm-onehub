import { type LoaiNhacAi, type ViecAi, viecAiCanNhac } from "./ai-nhac";
import type { Db } from "./client";
import { TrangThaiViec } from "./generated/prisma/enums";
import {
	LOAI_NHAC_GOI_Y,
	type LoaiNhacGoiY,
	type ViecGoiY,
	viecGoiYCanNhac,
} from "./goi-y-nhac";
import { type LoaiNhacOkr, type ViecOkr, viecOkrCanNhac } from "./okr-nhac";
import { type ViecTomTat, viecTomTatCanNhac } from "./okr-tom-tat";
import {
	type LoaiNhacTaiLieu,
	type ViecTaiLieu,
	viecTaiLieuCanNhac,
} from "./tai-lieu-nhac";
import { docDuocDoiTac } from "./vai-doi-tac";
import {
	banGhiCua,
	CHON_GAN,
	LOAI_NHAC_VIEC,
	type LoaiNhacViec,
	ngayHan,
	TRANG_THAI_MO,
} from "./viec";
import { WORKSPACE_ID } from "./workspace";

export const LOAI_NHAC = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
] as const;

export type LoaiNhac = (typeof LOAI_NHAC)[number];

export const THU_TU_NHAC = [
	"okr-cap-nhat",
	"okr-cho-duyet",
	"okr-tra-lai",
	"okr-hoi-y-gop",
	...LOAI_NHAC,
	...LOAI_NHAC_GOI_Y,
	...LOAI_NHAC_VIEC,
	"okr-kr-im",
	"okr-duoc-giao",
	"okr-nhac-ten",
	"okr-ghi-nhan",
	"okr-hoi-y-cong-bo",
	"okr-theo-doi",
	"tai-lieu-cho-duyet",
	"okr-tom-tat",
	"ai-tran",
	"ai-doi-soat-lech",
] as const satisfies readonly (
	| LoaiNhac
	| LoaiNhacGoiY
	| LoaiNhacOkr
	| LoaiNhacTaiLieu
	| ViecTomTat["loai"]
	| LoaiNhacAi
	| LoaiNhacViec
)[];

type ThieuThuTu = Exclude<ViecNhac["loai"], (typeof THU_TU_NHAC)[number]>;

export const THU_TU_DU: [ThieuThuTu] extends [never] ? true : ThieuThuTu = true;

export const NHAC = {
	gio: { gio: 8, phut: 30 },
	trua: { gio: 12, phut: 0 },
	muiGio: "Asia/Ho_Chi_Minh",
	sapHanNgay: 3,
	imSauNgay: 7,
	moc: [7, 14, 30],
	tran: 10,
} as const;

const PHUT_MOI_GIO = 60;

const PHUT_MS = 60 * 1000;

export const DAY_MS = 24 * PHUT_MOI_GIO * PHUT_MS;

const dinhNgay = new Intl.DateTimeFormat("en-CA", {
	timeZone: NHAC.muiGio,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const dinhNgayThang = new Intl.DateTimeFormat("en-GB", {
	timeZone: NHAC.muiGio,
	day: "2-digit",
	month: "2-digit",
});

const dinhGio = new Intl.DateTimeFormat("en-GB", {
	timeZone: NHAC.muiGio,
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
});

const dinhLech = new Intl.DateTimeFormat("en-US", {
	timeZone: NHAC.muiGio,
	timeZoneName: "longOffset",
});

const LECH_GMT = /^GMT(?:([+-])(\d{2}):(\d{2}))?$/;

export function ngayVN(d: Date): string {
	return dinhNgay.format(d);
}

function lechPhut(d: Date): number {
	const ten =
		dinhLech.formatToParts(d).find((p) => p.type === "timeZoneName")?.value ??
		"";
	const khop = LECH_GMT.exec(ten);
	if (!khop) {
		throw new Error(`Không đọc được độ lệch múi giờ ${NHAC.muiGio}: «${ten}»`);
	}
	const [, dau, gio, phut] = khop;
	if (!dau) return 0;
	const lech = Number(gio) * PHUT_MOI_GIO + Number(phut);
	return dau === "-" ? -lech : lech;
}

export function gioVN(d: Date): string {
	return dinhGio.format(d);
}

export function dauNgayVN(now: Date): Date {
	const nuaDemUtc = Date.parse(`${ngayVN(now)}T00:00:00Z`);
	return new Date(nuaDemUtc - lechPhut(new Date(nuaDemUtc)) * PHUT_MS);
}

export function soNgayVN(tu: Date, den: Date): number {
	const dau = (d: Date) => Date.parse(`${ngayVN(d)}T00:00:00Z`);
	return Math.round((dau(den) - dau(tu)) / DAY_MS);
}

const NGAY_MOI_TUAN = 7;

export function thuTrongTuan(luc: Date): number {
	const thu = new Date(`${ngayVN(luc)}T00:00:00Z`).getUTCDay();
	return ((thu + NGAY_MOI_TUAN - 1) % NGAY_MOI_TUAN) + 1;
}

export function dauTuanVN(now: Date): string {
	const hom = Date.parse(`${ngayVN(now)}T00:00:00Z`);
	const thu = new Date(hom).getUTCDay();
	const lui = (thu + 6) % 7;
	return new Date(hom - lui * DAY_MS).toISOString().slice(0, 10);
}

export type CuaSoNhac = "buoi-sang" | "truc-tiep";

export function mocNhac(now: Date): Date {
	return new Date(
		dauNgayVN(now).getTime() +
			(NHAC.gio.gio * PHUT_MOI_GIO + NHAC.gio.phut) * PHUT_MS,
	);
}

function phutTrongNgayVN(luc: Date): number {
	const phan = dinhGio.formatToParts(luc);
	const so = (loai: "hour" | "minute") =>
		Number(phan.find((p) => p.type === loai)?.value ?? 0);
	return so("hour") * PHUT_MOI_GIO + so("minute");
}

export function daToiGioNhac(now: Date): boolean {
	return phutTrongNgayVN(now) >= NHAC.gio.gio * PHUT_MOI_GIO + NHAC.gio.phut;
}

export function laBuoiSang(luc: Date): boolean {
	return phutTrongNgayVN(luc) < NHAC.trua.gio * PHUT_MOI_GIO + NHAC.trua.phut;
}

export type ViecKeHoach = {
	loai: LoaiNhac;
	planId: string;
	stepId?: string;
	companyName: string;
	nhan: string;
	goiY: string;
	han?: string;
	soNgay?: number;
	soBuocXong?: number;
	soBuocTong?: number;
	targetDays?: number;
};

export type NhacViec = {
	loai: LoaiNhacViec;
	viecId: string;
	tieuDe: string;
	han?: string;
	soNgay?: number;
	banGhi: string | null;
};

export type ViecNhac =
	| ViecKeHoach
	| ViecGoiY
	| NhacViec
	| ViecOkr
	| ViecTaiLieu
	| ViecTomTat
	| ViecAi;

export function laNhacViec(v: ViecNhac): v is NhacViec {
	return (LOAI_NHAC_VIEC as readonly string[]).includes(v.loai);
}

function docKeHoach(db: Db, userId: string | undefined) {
	return db.onboardingPlan.findMany({
		where: {
			closedAt: null,
			OR: userId
				? [
						{ ownerId: userId },
						{ watches: { some: { userId } } },
						{ steps: { some: { assigneeId: userId } } },
					]
				: undefined,
		},
		select: {
			id: true,
			ownerId: true,
			startedAt: true,
			targetDays: true,
			company: { select: { name: true } },
			watches: { select: { userId: true } },
			steps: {
				select: {
					id: true,
					label: true,
					position: true,
					dueAt: true,
					completedAt: true,
					updatedAt: true,
					assigneeId: true,
					assignee: { select: { name: true } },
					viecId: true,
				},
			},
		},
	});
}

type KeHoach = Awaited<ReturnType<typeof docKeHoach>>[number];

type Buoc = KeHoach["steps"][number];

type Gui = { userId: string; viec: ViecKeHoach };

function goiYIm(chuaXong: Buoc[], now: Date): string {
	const chuaGiao = chuaXong.find((s) => s.assigneeId === null);
	if (chuaGiao) return `Giao bước «${chuaGiao.label}»`;
	const tre = chuaXong.find((s) => soNgayVN(now, s.dueAt) < 0);
	if (tre) {
		return `Bước «${tre.label}» quá hạn ${soNgayVN(tre.dueAt, now)} ngày — hỏi ${tre.assignee?.name ?? ""}`;
	}
	const ke = chuaXong[0];
	if (ke)
		return `Bước kế: «${ke.label}», hạn ${dinhNgayThang.format(ke.dueAt)}`;
	return "Mọi bước đã xong";
}

function viecBuoc(k: KeHoach, s: Buoc, now: Date): ViecKeHoach | null {
	const conLai = soNgayVN(now, s.dueAt);
	const chung = {
		planId: k.id,
		stepId: s.id,
		companyName: k.company.name,
		nhan: s.label,
		goiY: s.label,
		han: ngayVN(s.dueAt),
	};
	if (conLai < 0) return { ...chung, loai: "buoc-qua-han", soNgay: -conLai };
	if (conLai <= NHAC.sapHanNgay) {
		return { ...chung, loai: "buoc-sap-han", soNgay: conLai };
	}
	return null;
}

function viecKeHoach(k: KeHoach, buoc: Buoc[], now: Date): ViecKeHoach[] {
	const chuaXong = buoc.filter((s) => s.completedAt === null);
	const moiNhat = buoc.reduce<Date>(
		(moc, s) => (s.updatedAt > moc ? s.updatedAt : moc),
		buoc[0]?.updatedAt ?? k.startedAt,
	);
	const imNgay = soNgayVN(moiNhat, now);
	const ngayThu = soNgayVN(k.startedAt, now) + 1;
	const chung = {
		planId: k.id,
		companyName: k.company.name,
		nhan: k.company.name,
	};
	const soBuocXong = buoc.length - chuaXong.length;
	return [
		...(imNgay >= NHAC.imSauNgay
			? [
					{
						...chung,
						loai: "ke-hoach-im" as const,
						goiY: goiYIm(chuaXong, now),
						soNgay: imNgay,
					},
				]
			: []),
		...(NHAC.moc.some((m) => m === ngayThu)
			? [
					{
						...chung,
						loai: "moc-ngay" as const,
						goiY: `${soBuocXong}/${buoc.length} bước xong`,
						soNgay: ngayThu,
						soBuocXong,
						soBuocTong: buoc.length,
						targetDays: k.targetDays,
					},
				]
			: []),
	];
}

function guiCua(k: KeHoach, thanhVien: Set<string>, now: Date): Gui[] {
	const buoc = [...k.steps].sort((a, b) => a.position - b.position);
	const theoBuoc = buoc.flatMap((s) => {
		if (s.completedAt !== null || s.assigneeId === null || s.viecId !== null) {
			return [];
		}
		const viec = viecBuoc(k, s, now);
		return viec ? [{ userId: s.assigneeId, viec }] : [];
	});
	const nguoiTheo = [
		...new Set([k.ownerId, ...k.watches.map((w) => w.userId)]),
	];
	const theoKeHoach = viecKeHoach(k, buoc, now).flatMap((viec) =>
		nguoiTheo.map((userId) => ({ userId, viec })),
	);
	return [...theoBuoc, ...theoKeHoach].filter((g) => thanhVien.has(g.userId));
}

function docViec(db: Db, userId: string | undefined) {
	return db.viec.findMany({
		where: {
			trangThai: { in: [...TRANG_THAI_MO] },
			OR: userId
				? [{ nguoiThucHienId: userId }, { nguoiGiaoId: userId }]
				: undefined,
		},
		select: {
			id: true,
			tieuDe: true,
			trangThai: true,
			hanNgay: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" }, take: 1 },
		},
	});
}

type ViecDoc = Awaited<ReturnType<typeof docViec>>[number];

type GuiViec = { userId: string; viec: NhacViec };

function guiViec(v: ViecDoc, thanhVien: Set<string>, now: Date): GuiViec[] {
	const dau = v.gan[0];
	const chung = {
		viecId: v.id,
		tieuDe: v.tieuDe,
		han: v.hanNgay ? ngayHan(v.hanNgay) : undefined,
		banGhi: dau ? banGhiCua(dau).ten : null,
	};
	const ra: GuiViec[] = [];
	if (
		v.trangThai === TrangThaiViec.CHO_DANH_GIA &&
		v.nguoiGiaoId !== v.nguoiThucHienId
	) {
		ra.push({
			userId: v.nguoiGiaoId,
			viec: { ...chung, loai: "viec-cho-danh-gia" },
		});
	}
	if (v.hanNgay !== null) {
		const conLai = soNgayVN(now, v.hanNgay);
		if (conLai < 0) {
			ra.push({
				userId: v.nguoiThucHienId,
				viec: { ...chung, loai: "viec-qua-han", soNgay: -conLai },
			});
		} else if (
			v.trangThai !== TrangThaiViec.CHO_DANH_GIA &&
			conLai <= NHAC.sapHanNgay
		) {
			ra.push({
				userId: v.nguoiThucHienId,
				viec: { ...chung, loai: "viec-sap-han", soNgay: conLai },
			});
		}
	}
	return ra.filter((g) => thanhVien.has(g.userId));
}

function gomViec(gui: GuiViec[]): Map<string, NhacViec[]> {
	const ra = new Map<string, NhacViec[]>();
	for (const g of gui) {
		const ds = ra.get(g.userId) ?? [];
		if (!ds.some((v) => v.loai === g.viec.loai && v.viecId === g.viec.viecId)) {
			ds.push(g.viec);
		}
		ra.set(g.userId, ds);
	}
	return ra;
}

function soSanh(a: ViecNhac, b: ViecNhac): number {
	const theoLoai = THU_TU_NHAC.indexOf(a.loai) - THU_TU_NHAC.indexOf(b.loai);
	if (theoLoai === 0 && "viecId" in a && "viecId" in b) {
		return (
			(a.han ?? "~").localeCompare(b.han ?? "~") ||
			a.viecId.localeCompare(b.viecId)
		);
	}
	if (theoLoai !== 0 || !("planId" in a) || !("planId" in b)) return theoLoai;
	return (
		(a.han ?? "").localeCompare(b.han ?? "") || a.planId.localeCompare(b.planId)
	);
}

function gom(gui: Gui[]): Map<string, ViecKeHoach[]> {
	const nguoi = [...new Set(gui.map((g) => g.userId))];
	return new Map(
		nguoi.map((userId) => {
			const ds = gui.filter((g) => g.userId === userId).map((g) => g.viec);
			const rieng = ds.filter(
				(v, i) =>
					ds.findIndex(
						(u) =>
							u.loai === v.loai &&
							u.planId === v.planId &&
							u.stepId === v.stepId,
					) === i,
			);
			return [userId, rieng];
		}),
	);
}

function gop(
	keHoach: Map<string, ViecKeHoach[]>,
	okr: Map<string, ViecOkr[]>,
	taiLieu: Map<string, ViecTaiLieu[]>,
	tomTat: Map<string, ViecTomTat[]>,
	ai: Map<string, ViecAi[]>,
	viecGiao: Map<string, NhacViec[]>,
	goiY: Map<string, ViecGoiY[]>,
	thanhVien: Set<string>,
): Map<string, ViecNhac[]> {
	const nguoi = [
		...new Set([
			...keHoach.keys(),
			...okr.keys(),
			...taiLieu.keys(),
			...tomTat.keys(),
			...ai.keys(),
			...viecGiao.keys(),
			...goiY.keys(),
		]),
	].filter((u) => thanhVien.has(u));
	return new Map(
		nguoi.map((userId) => {
			const ds: ViecNhac[] = [
				...(keHoach.get(userId) ?? []),
				...(okr.get(userId) ?? []),
				...(taiLieu.get(userId) ?? []),
				...(tomTat.get(userId) ?? []),
				...(ai.get(userId) ?? []),
				...(viecGiao.get(userId) ?? []),
				...(goiY.get(userId) ?? []),
			];
			return [userId, ds.sort(soSanh)];
		}),
	);
}

export async function viecCanNhac(
	db: Db,
	chon: { now: Date; userId?: string; cuaSo: CuaSoNhac },
): Promise<Map<string, ViecNhac[]>> {
	const [keHoach, thanhVien, okr, taiLieu, tomTat, ai, viecGiao, goiY] =
		await Promise.all([
			docKeHoach(db, chon.userId),
			db.member.findMany({
				where: {
					organizationId: WORKSPACE_ID,
					userId: chon.userId,
				},
				select: { userId: true, role: true },
			}),
			viecOkrCanNhac(db, chon),
			viecTaiLieuCanNhac(db, chon),
			chon.cuaSo === "buoi-sang"
				? viecTomTatCanNhac(db, {
						now: chon.now,
						userId: chon.userId,
						cuaSo: "buoi-sang",
					})
				: new Map<string, ViecTomTat[]>(),
			viecAiCanNhac(db, chon),
			docViec(db, chon.userId),
			viecGoiYCanNhac(db, { userId: chon.userId }),
		]);
	const tap = new Set(thanhVien.map((m) => m.userId));
	const tapDoiTac = new Set(
		thanhVien.filter((m) => docDuocDoiTac(m.role)).map((m) => m.userId),
	);
	return gop(
		gom(keHoach.flatMap((k) => guiCua(k, tapDoiTac, chon.now))),
		okr,
		taiLieu,
		tomTat,
		ai,
		gomViec(viecGiao.flatMap((v) => guiViec(v, tapDoiTac, chon.now))),
		new Map([...goiY].filter(([userId]) => tapDoiTac.has(userId))),
		tap,
	);
}
