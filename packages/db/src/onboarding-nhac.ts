import type { Db } from "./client";
import { WORKSPACE_ID } from "./workspace";

export const LOAI_NHAC = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
] as const;

export type LoaiNhac = (typeof LOAI_NHAC)[number];

export const NHAC = {
	gio: { gio: 8, phut: 30 },
	muiGio: "Asia/Ho_Chi_Minh",
	sapHanNgay: 3,
	imSauNgay: 7,
	moc: [7, 14, 30],
	tran: 10,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const PHUT_MOI_GIO = 60;

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

export function ngayVN(d: Date): string {
	return dinhNgay.format(d);
}

export function soNgayVN(tu: Date, den: Date): number {
	const dau = (d: Date) => Date.parse(`${ngayVN(d)}T00:00:00Z`);
	return Math.round((dau(den) - dau(tu)) / DAY_MS);
}

export function daToiGioNhac(now: Date): boolean {
	const phan = dinhGio.formatToParts(now);
	const so = (loai: "hour" | "minute") =>
		Number(phan.find((p) => p.type === loai)?.value ?? 0);
	return (
		so("hour") * PHUT_MOI_GIO + so("minute") >=
		NHAC.gio.gio * PHUT_MOI_GIO + NHAC.gio.phut
	);
}

export type ViecNhac = {
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
				},
			},
		},
	});
}

type KeHoach = Awaited<ReturnType<typeof docKeHoach>>[number];

type Buoc = KeHoach["steps"][number];

type Gui = { userId: string; viec: ViecNhac };

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

function viecBuoc(k: KeHoach, s: Buoc, now: Date): ViecNhac | null {
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

function viecKeHoach(k: KeHoach, buoc: Buoc[], now: Date): ViecNhac[] {
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
		if (s.completedAt !== null || s.assigneeId === null) return [];
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

function soSanh(a: ViecNhac, b: ViecNhac): number {
	return (
		LOAI_NHAC.indexOf(a.loai) - LOAI_NHAC.indexOf(b.loai) ||
		(a.han ?? "").localeCompare(b.han ?? "") ||
		a.planId.localeCompare(b.planId)
	);
}

function gom(gui: Gui[]): Map<string, ViecNhac[]> {
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
			return [userId, rieng.sort(soSanh)];
		}),
	);
}

export async function viecCanNhac(
	db: Db,
	chon: { now: Date; userId?: string },
): Promise<Map<string, ViecNhac[]>> {
	const [keHoach, thanhVien] = await Promise.all([
		docKeHoach(db, chon.userId),
		db.member.findMany({
			where: {
				organizationId: WORKSPACE_ID,
				userId: chon.userId,
			},
			select: { userId: true },
		}),
	]);
	const tap = new Set(thanhVien.map((m) => m.userId));
	return gom(keHoach.flatMap((k) => guiCua(k, tap, chon.now)));
}
