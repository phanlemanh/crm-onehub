import { db, type Prisma } from "@crm/db";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "@crm/db/okr-hien-thi";
import {
	chonChuKyHienTai,
	kyVongTheoNgay,
	tienDoMucTieu,
} from "@crm/db/okr-tien-do";
import { MUC_TU_TIN } from "@crm/db/okr-tro-ly-danh-muc";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { kieuKr, tienDoKr } from "@crm/validation/okr-kr";
import {
	LOAI_MUC_TIEU,
	type TinhTrang,
	tinhTrang,
} from "@crm/validation/okr-muc-tieu";
import { OKR_PHIEN_HOI } from "@crm/validation/okr-phien-hoi";
import { z } from "zod";
import { TRO_LY_OKR_HOI } from "./config";
import { type NguCanhPhien, thuocTinhPhien } from "./phien";

export type TuChoi = { ok: false; reason: string };

export type KrNgan = {
	id: string;
	ten: string;
	kieu: z.infer<typeof kieuKr>;
	tienDo: number;
	khoiDiem: number;
	hienTai: number;
	dich: number;
	donVi: string;
	tuTin: (typeof MUC_TU_TIN)[number] | null;
	cuaBan: boolean;
};

export type CapNhatTuan = {
	krId: string;
	tuan: string;
	giaTri: number;
	tuTin: (typeof MUC_TU_TIN)[number];
};

export type MucTieuNgan = {
	id: string;
	ten: string;
	donVi: string;
	loai: (typeof LOAI_MUC_TIEU)[number];
	chuKy: string;
	chuKyId: string;
	tienDo: number;
	kyVong: number | null;
	tinhTrang: TinhTrang;
	cuaBan: boolean;
	kr: KrNgan[];
};

export type MucTieuDay = MucTieuNgan & { capNhat: CapNhatTuan[] };

export const locTim = z.object({
	tu: z.string().trim().min(1).max(120).optional(),
	cycleId: z.string().trim().min(1).max(120).optional(),
	cuaToi: z.boolean().optional(),
	tinhTrang: z
		.enum(["dung-nhip", "cham-nhip", "truot", "chua-co-ky-vong"])
		.optional(),
});

export type LocTim = z.infer<typeof locTim>;

const loai = z.enum(LOAI_MUC_TIEU);
const tuTin = z.enum(MUC_TU_TIN);
const TU_CHOI = TRO_LY_OKR_HOI.tuChoi;

export function canPhienHoi(
	ctx: NguCanhPhien,
): { userId: string; cuocHoiId: string } | TuChoi {
	const p = thuocTinhPhien(ctx);
	if (p.purpose !== OKR_PHIEN_HOI.purpose || !p.userId || !p.cuocHoiId)
		return { ok: false, reason: TU_CHOI.saiMucDich };
	return { userId: p.userId, cuocHoiId: p.cuocHoiId };
}

const chonMucTieu = {
	id: true,
	title: true,
	kind: true,
	level: true,
	cycleId: true,
	publishedAt: true,
	ownerUserId: true,
	personUserId: true,
	division: { select: { name: true } },
	department: { select: { name: true } },
	person: { select: { name: true } },
	cycle: {
		select: {
			name: true,
			endsOn: true,
			breakStartsOn: true,
			breakEndsOn: true,
		},
	},
	keyResults: {
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		select: {
			id: true,
			title: true,
			kind: true,
			ownerUserId: true,
			startValue: true,
			targetValue: true,
			currentValue: true,
			unit: true,
			weight: true,
			checkIns: {
				orderBy: { weekStart: "desc" },
				take: TRO_LY_OKR_HOI.tranKetQua.capNhat,
				select: { weekStart: true, value: true, confidence: true },
			},
		},
	},
} satisfies Prisma.OkrObjectiveSelect;

type HangMucTieu = Awaited<
	ReturnType<typeof db.okrObjective.findMany<{ select: typeof chonMucTieu }>>
>[number];

function tenDonVi(r: HangMucTieu): string {
	if (r.level === "onehub") return TRO_LY_OKR_HOI.tenGoc;
	return r.division?.name ?? r.department?.name ?? r.person?.name ?? "";
}

async function coTrongSo(): Promise<boolean> {
	const ct = await db.okrProgramConfig.findFirst({
		orderBy: { createdAt: "desc" },
		select: { weightsOn: true },
	});
	return ct?.weightsOn ?? false;
}

function dungMucTieu(
	r: HangMucTieu,
	trongSo: boolean,
	homNay: Date,
	userId: string,
): MucTieuDay {
	const kr = r.keyResults.map((k) => {
		const kieu = kieuKr.parse(k.kind);
		const khoiDiem = k.startValue.toNumber();
		const dich = k.targetValue.toNumber();
		const hienTai = k.currentValue.toNumber();
		const moi = k.checkIns[0];
		return {
			id: k.id,
			ten: k.title,
			kieu,
			tienDo: tienDoKr(kieu, khoiDiem, dich, hienTai),
			khoiDiem,
			hienTai,
			dich,
			donVi: k.unit,
			tuTin: moi ? tuTin.parse(moi.confidence) : null,
			cuaBan: k.ownerUserId === userId,
			trongSo: k.weight.toNumber(),
		};
	});
	const nghi =
		r.cycle.breakStartsOn && r.cycle.breakEndsOn
			? { tu: r.cycle.breakStartsOn, den: r.cycle.breakEndsOn }
			: null;
	const tienDo = tienDoMucTieu(
		kr.map((k) => ({ progress: k.tienDo, weight: k.trongSo })),
		trongSo,
	);
	const kyVong = kyVongTheoNgay(r.publishedAt, r.cycle.endsOn, homNay, nghi);
	const loaiMt = loai.parse(r.kind);
	return {
		id: r.id,
		ten: r.title,
		donVi: tenDonVi(r),
		loai: loaiMt,
		chuKy: r.cycle.name,
		chuKyId: r.cycleId,
		tienDo,
		kyVong,
		tinhTrang: tinhTrang(tienDo, kyVong, loaiMt),
		cuaBan: r.ownerUserId === userId || r.personUserId === userId,
		kr: kr.map(({ trongSo: _bo, ...k }) => k),
		capNhat: r.keyResults.flatMap((k) =>
			k.checkIns.map((c) => ({
				krId: k.id,
				tuan: c.weekStart.toISOString().slice(0, 10),
				giaTri: c.value.toNumber(),
				tuTin: tuTin.parse(c.confidence),
			})),
		),
	};
}

async function dieuKienNguoi(userId: string) {
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	return nc ? dieuKienXemMucTieu(nc) : null;
}

export type ChuKyThay = { id: string; ten: string; hienTai: boolean };

export type KetQuaTim = {
	ok: true;
	rong: boolean;
	conThem: boolean;
	chuKy: ChuKyThay[];
	mucTieu: MucTieuNgan[];
};

const ngay = (d: Date) => d.toISOString().slice(0, 10);

async function chuKyThay(
	quyen: Prisma.OkrObjectiveWhereInput,
	homNay: Date,
): Promise<ChuKyThay[]> {
	const ds = await db.okrCycle.findMany({
		where: { objectives: { some: { AND: [quyen, { status: "cong-bo" }] } } },
		orderBy: [{ endsOn: "desc" }, { startsOn: "desc" }],
		select: {
			id: true,
			name: true,
			kind: true,
			phase: true,
			startsOn: true,
			endsOn: true,
		},
	});
	const hienTai = chonChuKyHienTai(
		ds.map((c) => ({
			id: c.id,
			kind: c.kind,
			phase: c.phase,
			startsOn: ngay(c.startsOn),
			endsOn: ngay(c.endsOn),
		})),
		ngayVN(homNay),
	);
	return ds.map((c) => ({
		id: c.id,
		ten: c.name,
		hienTai: c.id === hienTai?.id,
	}));
}

export async function timOkr(
	userId: string,
	loc: LocTim,
	homNay = new Date(),
): Promise<KetQuaTim> {
	const quyen = await dieuKienNguoi(userId);
	if (!quyen)
		return { ok: true, rong: true, conThem: false, chuKy: [], mucTieu: [] };
	const chuKy = await chuKyThay(quyen, homNay);
	const ky =
		loc.cycleId ?? chuKy.find((c) => c.hienTai)?.id ?? chuKy[0]?.id ?? null;
	if (!ky) return { ok: true, rong: true, conThem: false, chuKy, mucTieu: [] };
	const chu = loc.tu
		? {
				OR: [
					{ title: { contains: loc.tu, mode: "insensitive" as const } },
					{
						keyResults: {
							some: {
								title: { contains: loc.tu, mode: "insensitive" as const },
							},
						},
					},
				],
			}
		: {};
	const cuaToi = loc.cuaToi
		? {
				OR: [
					{ ownerUserId: userId },
					{ personUserId: userId },
					{ keyResults: { some: { ownerUserId: userId } } },
				],
			}
		: {};
	const hang = await db.okrObjective.findMany({
		where: {
			AND: [quyen, { status: "cong-bo" }, { cycleId: ky }, chu, cuaToi],
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
		take: TRO_LY_OKR_HOI.tranKetQua.quet,
		select: chonMucTieu,
	});
	const trongSo = await coTrongSo();
	const khop = hang
		.map((r) => dungMucTieu(r, trongSo, homNay, userId))
		.filter((m) => !loc.tinhTrang || m.tinhTrang === loc.tinhTrang);
	const tran = TRO_LY_OKR_HOI.tranKetQua.mucTieu;
	const mucTieu = khop.slice(0, tran).map(({ capNhat: _bo, ...m }) => m);
	return {
		ok: true,
		rong: mucTieu.length === 0,
		conThem:
			khop.length > tran || hang.length === TRO_LY_OKR_HOI.tranKetQua.quet,
		chuKy,
		mucTieu,
	};
}

export async function docOkr(
	userId: string,
	ma: { loai: "objective" | "kr"; id: string },
	homNay = new Date(),
): Promise<{ ok: true; mucTieu: MucTieuDay } | TuChoi> {
	const quyen = await dieuKienNguoi(userId);
	if (!quyen) return { ok: false, reason: TU_CHOI.khongThay };
	const hang = await db.okrObjective.findFirst({
		where: {
			AND: [
				quyen,
				ma.loai === "objective"
					? { id: ma.id }
					: { keyResults: { some: { id: ma.id } } },
			],
		},
		select: chonMucTieu,
	});
	if (!hang) return { ok: false, reason: TU_CHOI.khongThay };
	return {
		ok: true,
		mucTieu: dungMucTieu(hang, await coTrongSo(), homNay, userId),
	};
}
