import type { FacetCount } from "../trpc/list-input";
import type {
	BangCotCachChia,
	BangCotCot,
	BangCotInput,
	BangCotOutput,
	BangCotThe,
	DanhMucOutput,
	DanhMucTrangThai,
	PlanListInput,
	PlanListOutput,
	PlanRow,
} from "./onboarding.contracts";
import { DANH_MUC_SAP } from "./onboarding.contracts";
import { ONBOARDING } from "./onboarding-config";

const DAY_MS = 24 * 60 * 60 * 1000;

export const COT_XONG = "";

export const BAC_PHEU = [
	"chua-tai-khoan",
	"co-tai-khoan",
	"khoa-hoc",
	"hoat-dong",
	"giao-dich",
] as const;

export type BacPheu = (typeof BAC_PHEU)[number];

export const CHON_KE_HOACH_DANH_MUC = {
	company: { select: { name: true } },
	steps: {
		orderBy: { position: "asc" },
		select: {
			completedAt: true,
			label: true,
			position: true,
			updatedAt: true,
			assigneeId: true,
			assignee: { select: { name: true } },
			department: {
				select: { id: true, name: true, position: true, divisionId: true },
			},
		},
	},
} as const;

export const COT_TRANG_THAI = ["dang-chay", "da-dong"] as const;

export type BuocTho = {
	completedAt: Date | null;
	label: string;
	position: number;
	updatedAt: Date;
	assigneeId?: string | null;
	assignee?: { name: string } | null;
	department: {
		id: string;
		name: string;
		position: number;
		divisionId: string | null;
	};
};

export type KeHoachTho = {
	id: string;
	companyId: string;
	company: { name: string };
	startedAt: Date;
	targetDays: number;
	ownerId: string;
	closedAt: Date | null;
	steps: BuocTho[];
};

export type GhiDanhTho = {
	id: string;
	planId: string;
	accountAt: Date | null;
	courseAt: Date | null;
	activeAt: Date | null;
	dealAt: Date | null;
	contact: { firstName: string; lastName: string | null };
};

export type NguoiGiao = { id: string; ten: string };

export type HangDanhMuc = PlanRow & {
	viTriTac: number | null;
	viTriBoPhan: number | null;
	nguoiGiao: NguoiGiao[];
};

type LocDanhMuc = Pick<
	PlanListInput,
	"status" | "boPhan" | "nguoiCam" | "nguoiGiao" | "division"
>;

export type DemBoLoc = {
	trangThai: FacetCount;
	boPhan: FacetCount;
	nguoiCam: FacetCount;
	nguoiGiao: FacetCount;
	division: FacetCount;
};

type SapDanhMuc = Pick<PlanListInput, "sort" | "dir">;

function soNgay(tu: Date, den: Date): number {
	return Math.floor((den.getTime() - tu.getTime()) / DAY_MS);
}

export function dungHang(plan: KeHoachTho, bayGio: Date): HangDanhMuc {
	const buoc = [...plan.steps].sort((a, b) => a.position - b.position);
	const xong = buoc.filter((s) => s.completedAt !== null).length;
	const dang = buoc.find((s) => s.completedAt === null);
	const moiNhat = buoc.reduce<Date>(
		(moc, s) => (s.updatedAt > moc ? s.updatedAt : moc),
		buoc[0]?.updatedAt ?? plan.startedAt,
	);

	return {
		id: plan.id,
		companyId: plan.companyId,
		companyName: plan.company.name,
		startedAt: plan.startedAt,
		targetDays: plan.targetDays,
		ngayThu: soNgay(plan.startedAt, bayGio),
		buocXong: xong,
		buocTong: buoc.length,
		tacO: dang?.label ?? null,
		boPhanTac: dang?.department.name ?? null,
		boPhanTacId: dang?.department.id ?? null,
		boPhanCapTrenId: dang?.department.divisionId ?? null,
		imNgay: soNgay(moiNhat, bayGio),
		ownerId: plan.ownerId,
		closedAt: plan.closedAt,
		viTriTac: dang?.position ?? null,
		viTriBoPhan: dang?.department.position ?? null,
		nguoiGiao: nguoiGiaoCua(buoc),
	};
}

function nguoiGiaoCua(buoc: BuocTho[]): NguoiGiao[] {
	const theoId = new Map<string, NguoiGiao>();
	for (const b of buoc) {
		if (b.completedAt !== null || !b.assigneeId) continue;
		if (!theoId.has(b.assigneeId)) {
			theoId.set(b.assigneeId, {
				id: b.assigneeId,
				ten: b.assignee?.name ?? b.assigneeId,
			});
		}
	}
	return [...theoId.values()];
}

function trangThaiCua(hang: HangDanhMuc): (typeof COT_TRANG_THAI)[number] {
	return hang.closedAt === null ? "dang-chay" : "da-dong";
}

function khopTrangThai(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	return loc.status === "tat-ca" || trangThaiCua(hang) === loc.status;
}

function khopBoPhan(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	return (
		loc.boPhan.length === 0 ||
		(hang.boPhanTacId !== null && loc.boPhan.includes(hang.boPhanTacId))
	);
}

function khopDivision(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	const chon = loc.division ?? [];
	return (
		chon.length === 0 ||
		(hang.boPhanCapTrenId !== null && chon.includes(hang.boPhanCapTrenId))
	);
}

function khopNguoiCam(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	return loc.nguoiCam.length === 0 || loc.nguoiCam.includes(hang.ownerId);
}

function khopNguoiGiao(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	return (
		loc.nguoiGiao.length === 0 ||
		hang.nguoiGiao.some((n) => loc.nguoiGiao.includes(n.id))
	);
}

export function locHang(hang: HangDanhMuc[], loc: LocDanhMuc): HangDanhMuc[] {
	return hang.filter(
		(h) =>
			khopTrangThai(h, loc) &&
			khopBoPhan(h, loc) &&
			khopNguoiCam(h, loc) &&
			khopNguoiGiao(h, loc) &&
			khopDivision(h, loc),
	);
}

function demTheo(
	hang: HangDanhMuc[],
	khoa: (h: HangDanhMuc) => string | null,
): FacetCount {
	const dem: FacetCount = {};
	for (const h of hang) {
		const k = khoa(h);
		if (k === null) continue;
		dem[k] = (dem[k] ?? 0) + 1;
	}
	return dem;
}

function demNhieu(
	hang: HangDanhMuc[],
	khoa: (h: HangDanhMuc) => string[],
): FacetCount {
	const dem: FacetCount = {};
	for (const h of hang) {
		for (const k of khoa(h)) dem[k] = (dem[k] ?? 0) + 1;
	}
	return dem;
}

export function demBoLoc(hang: HangDanhMuc[], loc: LocDanhMuc): DemBoLoc {
	const tru = (bo: (h: HangDanhMuc, l: LocDanhMuc) => boolean) =>
		hang.filter((h) =>
			[khopTrangThai, khopBoPhan, khopNguoiCam, khopNguoiGiao, khopDivision]
				.filter((f) => f !== bo)
				.every((f) => f(h, loc)),
		);
	return {
		trangThai: demTheo(tru(khopTrangThai), trangThaiCua),
		boPhan: demTheo(tru(khopBoPhan), (h) => h.boPhanTacId),
		nguoiCam: demTheo(tru(khopNguoiCam), (h) => h.ownerId),
		nguoiGiao: demNhieu(tru(khopNguoiGiao), (h) =>
			h.nguoiGiao.map((n) => n.id),
		),
		division: demTheo(tru(khopDivision), (h) => h.boPhanCapTrenId),
	};
}

const soChu = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

type KhoaSap = (typeof DANH_MUC_SAP)[number];

const SO_SANH = {
	companyName: (a, b) => soChu.compare(a.companyName, b.companyName),
	startedAt: (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
	imNgay: (a, b) => a.imNgay - b.imNgay,
	buocXong: (a, b) => a.buocXong - b.buocXong,
} satisfies Record<KhoaSap, (a: HangDanhMuc, b: HangDanhMuc) => number>;

function laKhoaSap(sort: string): sort is KhoaSap {
	return (DANH_MUC_SAP as readonly string[]).includes(sort);
}

function theoId(a: HangDanhMuc, b: HangDanhMuc): number {
	return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function sapHang(hang: HangDanhMuc[], sap: SapDanhMuc): HangDanhMuc[] {
	const khoa: KhoaSap = laKhoaSap(sap.sort) ? sap.sort : "startedAt";
	const chieu = laKhoaSap(sap.sort) && sap.dir === "desc" ? -1 : 1;
	const soSanh = SO_SANH[khoa];
	return [...hang].sort((a, b) => chieu * soSanh(a, b) || theoId(a, b));
}

export function catTrang<T>(
	hang: T[],
	trang: Pick<PlanListInput, "page" | "pageSize">,
): T[] {
	const tu = (trang.page - 1) * trang.pageSize;
	return hang.slice(tu, tu + trang.pageSize);
}

export function bacCaoNhat(
	ghiDanh: Pick<GhiDanhTho, "accountAt" | "courseAt" | "activeAt" | "dealAt">,
): BacPheu {
	if (ghiDanh.dealAt !== null) return "giao-dich";
	if (ghiDanh.activeAt !== null) return "hoat-dong";
	if (ghiDanh.courseAt !== null) return "khoa-hoc";
	if (ghiDanh.accountAt !== null) return "co-tai-khoan";
	return "chua-tai-khoan";
}

function theKeHoach(hang: HangDanhMuc, phu: string | null): BangCotThe {
	return {
		id: hang.id,
		planId: hang.id,
		tieuDe: hang.companyName,
		phu,
		imNgay: hang.imNgay,
	};
}

type CotNhap = {
	khoa: string;
	nhan: string | null;
	thuTu: number;
	the: BangCotThe[];
};

function catCot(cot: CotNhap[], tranThe: number): BangCotCot[] {
	return [...cot]
		.sort((a, b) => a.thuTu - b.thuTu || soChu.compare(a.khoa, b.khoa))
		.map((c) => ({
			khoa: c.khoa,
			nhan: c.nhan,
			tong: c.the.length,
			the: c.the.slice(0, tranThe),
		}));
}

function gomCot(
	hang: HangDanhMuc[],
	phuCua: (h: HangDanhMuc) => string | null,
	khoaCua: (h: HangDanhMuc) => {
		khoa: string;
		nhan: string | null;
		thuTu: number;
	},
): CotNhap[] {
	const theoKhoa = new Map<string, CotNhap>();
	for (const h of hang) {
		const { khoa, nhan, thuTu } = khoaCua(h);
		const cot = theoKhoa.get(khoa) ?? { khoa, nhan, thuTu, the: [] };
		theoKhoa.set(khoa, {
			...cot,
			thuTu: Math.min(cot.thuTu, thuTu),
			the: [...cot.the, theKeHoach(h, phuCua(h))],
		});
	}
	return [...theoKhoa.values()];
}

const SAU_CUNG = Number.MAX_SAFE_INTEGER;

export const COT_CHUA_GIAO = "chua-giao";

function cotXong() {
	return { khoa: COT_XONG, nhan: null, thuTu: SAU_CUNG };
}

export function chiaCot(input: {
	cachChia: BangCotCachChia;
	hang: HangDanhMuc[];
	ghiDanh: GhiDanhTho[];
	tranThe: number;
}): BangCotCot[] {
	const { cachChia, hang, ghiDanh, tranThe } = input;

	if (cachChia === "buoc") {
		return catCot(
			gomCot(
				hang,
				(h) => h.boPhanTac,
				(h) =>
					h.tacO === null
						? cotXong()
						: { khoa: h.tacO, nhan: h.tacO, thuTu: h.viTriTac ?? 0 },
			),
			tranThe,
		);
	}

	if (cachChia === "bo-phan") {
		return catCot(
			gomCot(
				hang,
				(h) => h.tacO,
				(h) =>
					h.boPhanTacId === null
						? cotXong()
						: {
								khoa: h.boPhanTacId,
								nhan: h.boPhanTac,
								thuTu: h.viTriBoPhan ?? 0,
							},
			),
			tranThe,
		);
	}

	if (cachChia === "nguoi-giao") {
		return catCot(cotNguoiGiao(hang), tranThe);
	}

	if (cachChia === "trang-thai") {
		return catCot(
			COT_TRANG_THAI.map((khoa, thuTu) => ({
				khoa,
				nhan: null,
				thuTu,
				the: hang
					.filter((h) => trangThaiCua(h) === khoa)
					.map((h) => theKeHoach(h, h.tacO)),
			})),
			tranThe,
		);
	}

	const congTy = new Map(hang.map((h) => [h.id, h.companyName]));
	return catCot(
		BAC_PHEU.map((khoa, thuTu) => ({
			khoa,
			nhan: null,
			thuTu,
			the: ghiDanh
				.filter((g) => congTy.has(g.planId) && bacCaoNhat(g) === khoa)
				.map((g) => ({
					id: g.id,
					planId: g.planId,
					tieuDe:
						[g.contact.firstName, g.contact.lastName]
							.filter((phan) => phan !== null && phan !== "")
							.join(" ") || g.id,
					phu: congTy.get(g.planId) ?? null,
					imNgay: null,
				})),
		})),
		tranThe,
	);
}

function cotNguoiGiao(hang: HangDanhMuc[]): CotNhap[] {
	const nguoi = [
		...new Map(hang.flatMap((h) => h.nguoiGiao).map((n) => [n.id, n])).values(),
	].sort((a, b) => soChu.compare(a.ten, b.ten));
	const cot = new Map<string, CotNhap>(
		nguoi.map((n, thuTu) => [
			n.id,
			{ khoa: n.id, nhan: n.ten, thuTu, the: [] },
		]),
	);
	const chuaGiao: CotNhap = {
		khoa: COT_CHUA_GIAO,
		nhan: null,
		thuTu: SAU_CUNG - 1,
		the: [],
	};
	const xong: CotNhap = { ...cotXong(), the: [] };
	for (const h of hang) {
		if (h.tacO === null) {
			xong.the.push(theKeHoach(h, null));
			continue;
		}
		if (h.nguoiGiao.length === 0) {
			chuaGiao.the.push(theKeHoach(h, h.tacO));
			continue;
		}
		for (const n of h.nguoiGiao) cot.get(n.id)?.the.push(theKeHoach(h, h.tacO));
	}
	return [...cot.values(), chuaGiao, xong].filter((c) => c.the.length > 0);
}

export function boViTri({
	viTriTac,
	viTriBoPhan,
	nguoiGiao,
	...hang
}: HangDanhMuc): PlanRow {
	return hang;
}

export function danhSachTuHang(
	tap: HangDanhMuc[],
	input: PlanListInput,
): PlanListOutput {
	const daLoc = sapHang(locHang(tap, input), input);

	return {
		rows: catTrang(daLoc, input).map(boViTri),
		total: daLoc.length,
		facetCounts: demBoLoc(tap, input),
	};
}

export function dangLoc(input: PlanListInput): boolean {
	return (
		input.q.trim() !== "" ||
		input.boPhan.length > 0 ||
		input.nguoiCam.length > 0 ||
		input.nguoiGiao.length > 0 ||
		(input.division ?? []).length > 0 ||
		input.status === "da-dong"
	);
}

export function suyTrangThai(
	input: PlanListInput,
	total: number,
	soKhuon: number,
): DanhMucTrangThai {
	if (total > 0) return "ST-danhmuc-codulieu";
	if (dangLoc(input)) return "ST-danhmuc-khongkhop";
	return soKhuon === 0 ? "ST-danhmuc-chuacokhuon" : "ST-danhmuc-empty";
}

export function manDanhMucTuHang(
	tap: HangDanhMuc[],
	input: PlanListInput,
	soKhuon: number,
): DanhMucOutput {
	const danhSach = danhSachTuHang(tap, input);

	return {
		...danhSach,
		soKhuon,
		trangThai: suyTrangThai(input, danhSach.total, soKhuon),
	};
}

export function hangCuaBangCot(
	tap: HangDanhMuc[],
	input: PlanListInput,
): HangDanhMuc[] {
	return sapHang(locHang(tap, input), input);
}

export function bangCotTuHang(
	hang: HangDanhMuc[],
	input: BangCotInput,
	ghiDanh: GhiDanhTho[],
): BangCotOutput {
	const tranThe = ONBOARDING.bangCot.tranThe;

	return {
		cachChia: input.cachChia,
		tranThe,
		cot: chiaCot({ cachChia: input.cachChia, hang, ghiDanh, tranThe }),
	};
}
