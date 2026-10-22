import type { LOAI_VIEC_OKR } from "./agent-tasks";
import { thangSau, thangVN } from "./ai-chi-phi";
import type { Db } from "./client";
import { Prisma } from "./generated/prisma/client";
import { boGioiHan, dieuKienXemMucTieu, nguCanhXemOkr } from "./okr-hien-thi";
import {
	type KrSo,
	type LanCapNhat,
	type LyDoHop,
	lyDoCua,
} from "./okr-hop-tuan";
import { KY_CON_HIEN } from "./okr-chu-ky-hien";
import { cuaSoSuKien } from "./okr-nhac";
import { cauHinhAiLuc, quaTranChung } from "./okr-tro-ly";
import {
	GIO_MS,
	LY_DO_TAM_DUNG_TOM_TAT,
	type LyDoKhongSanSang,
	type LyDoTamDungTomTat,
	MINUTE_MS,
	MUC_TU_TIN,
	type MucTuTin,
	motTrong,
	type NacCuaDonVi,
	NGAY_MS,
	nacCuaDonVi,
	OKR_TOM_TAT,
	TRO_LY_OKR_TRAN,
	TUAN_MS,
	type TrangThaiQuanTriTomTat,
} from "./okr-tro-ly-danh-muc";
import { KIEU_KR, type KieuKr } from "./okr-xu-huong";
import { dauNgayVN, ngayVN, thuTrongTuan } from "./onboarding-nhac";
import { WORKSPACE_ID } from "./workspace";

type DbHoacTx = Db | Prisma.TransactionClient;

export function gioXepCua(luc: Date): Date {
	return new Date(
		dauNgayVN(luc).getTime() +
			OKR_TOM_TAT.gioXep.gio * GIO_MS +
			OKR_TOM_TAT.gioXep.phut * MINUTE_MS,
	);
}

export function thuCapNhatCuaNgayXep(ngayXep: Date): number {
	return thuTrongTuan(new Date(dauNgayVN(ngayXep).getTime() - 1));
}

export function lanXepTomTatKe(now: Date, updateWeekday: number): Date {
	const dau = dauNgayVN(now).getTime();
	for (let lech = 0; lech <= TUAN_MS; lech += NGAY_MS) {
		const gio = gioXepCua(new Date(dau + lech));
		if (gio > now && thuCapNhatCuaNgayXep(gio) === updateWeekday) return gio;
	}
	throw new Error(`ngay cap nhat cua chu ky khong doc duoc: ${updateWeekday}`);
}

export function lanXepTomTatHomNay(
	now: Date,
	updateWeekday: number,
): Date | null {
	const gio = gioXepCua(now);
	return gio <= now && thuCapNhatCuaNgayXep(gio) === updateWeekday
		? gio
		: null;
}

export type ChenhTuTin = -2 | -1 | 0 | 1 | 2;

export type NacBan = "an" | "bat";

export type TrangThaiBan = "hien" | "can-xem";

export type NguonGoi = {
	id: string;
	keyResultId: string;
	giaTri: number;
	truoc: number | null;
	chenhLech: number | null;
	chenhTuTin: ChenhTuTin | null;
	tienDo: number;
	ngay: string;
};

export type KrKiemGoi = {
	id: string;
	donVi: string;
	khoiDiem: number | null;
	dich: number | null;
};

export type GoiKiem = {
	nguon: NguonGoi[];
	krs: KrKiemGoi[];
	tenThanhVien: string[];
	tuCam: readonly string[];
	chuDauVao: string;
};

export type CauBan = { vanBan: string; nguon: string[] };

export type CauBanBo<M extends string = string> = CauBan & { maBo: M };

export type NoiDungBan<M extends string = string> = {
	nac: NacBan;
	cau: CauBan[];
	bo: CauBanBo<M>[];
};

export type ViecDoc =
	| { viec: "de-xuat" }
	| {
			viec: "tom-tat-tuan";
			cycleId: string;
			departmentId: string;
			tuan: string;
			nac: NacBan;
	  };

export type LuatTomTat<M extends string = string> = {
	kiemBan: (
		cau: CauBan[],
		goi: GoiKiem,
		tuyChon: { tyLeGiuLai: number },
	) => { cau: CauBan[]; bo: CauBanBo<M>[]; trangThai: TrangThaiBan };
	kiemCau: (
		cau: CauBan,
		goi: GoiKiem,
		truoc: readonly string[],
	) => { qua: true } | { qua: false; maBo: M };
	docNoiDung: (value: Prisma.JsonValue) => NoiDungBan<M>;
	docTrangThai: (value: string) => TrangThaiBan;
	docViec: (value: Prisma.JsonValue) => ViecDoc;
	tienDoKr: (kieu: KieuKr, khoi: number, dich: number, hien: number) => number;
};

export type LanTrongGoi = {
	id: string;
	ngay: string;
	luc: string;
	giaTri: number;
	tienDo: number;
	tuTinTruoc: MucTuTin | null;
	tuTin: MucTuTin;
	ghiChu: string;
	truoc: number | null;
	chenhLech: number | null;
	chenhTuTin: ChenhTuTin | null;
};

export type KrTrongGoi = {
	id: string;
	ten: string;
	mucTieuId: string;
	mucTieu: string;
	kieu: KieuKr;
	donVi: string;
	khoiDiem: number;
	dich: number;
	lyDo: LyDoHop[];
	lanTruoc: {
		id: string;
		ngay: string;
		giaTri: number;
		tuTin: MucTuTin;
	} | null;
	lan: LanTrongGoi[];
};

export type GoiTomTat = {
	phong: { id: string; ten: string };
	tuan: string;
	krs: KrTrongGoi[];
	nguon: NguonGoi[];
};

export type NguonHien = {
	id: string;
	keyResultId: string;
	krTen: string;
	mucTieuId: string;
	mucTieuTen: string;
	ngay: string;
	giaTri: number;
	donVi: string;
	tuTin: MucTuTin;
	ghiChu: string;
};

export type BanHien = {
	id: string;
	tuan: string;
	soLanCapNhat: number;
	cau: { vanBan: string; nguon: NguonHien[] }[];
	phanHoiCuaToi: boolean | null;
};

export type NguonQuanTri =
	| { id: string; mat: false; ngay: string; krTen: string }
	| { id: string; mat: true };

export type CauQuanTri = { vanBan: string; nguon: NguonQuanTri[] };

export type CauBoQuanTri<M extends string = string> = CauQuanTri & {
	maBo: M;
};

export type DongQuanTriTomTat<M extends string = string> = {
	departmentId: string;
	ten: string;
	nac: NacBan;
	trangThai: TrangThaiQuanTriTomTat;
	tomTatId: string | null;
	soCau: number;
	soCauBo: number;
	huuIch: number;
	khongHuuIch: number;
	cau: CauQuanTri[];
	bo: CauBoQuanTri<M>[];
};

export type BanTuanQuanTri<M extends string = string> = {
	tuan: string | null;
	phong: DongQuanTriTomTat<M>[];
};

export type ViecTomTat = {
	loai: "okr-tom-tat";
	tomTatId: string;
	departmentId: string;
	cycleId: string;
	phongTen: string;
	krDangBan: string[];
	soKrDangBan: number;
};

export class TomTatDaCo extends Error {
	override readonly name = "TomTatDaCo";

	constructor(
		readonly khoa: {
			taskId: string;
			cycleId: string;
			departmentId: string;
			tuan: string;
		},
	) {
		super(
			`tom tat tuan da co: task ${khoa.taskId} hoac (${khoa.cycleId}, ${khoa.departmentId}, ${khoa.tuan})`,
		);
	}
}

export class PhongKhongTomTatDuoc extends Error {
	override readonly name = "PhongKhongTomTatDuoc";

	constructor(readonly departmentId: string) {
		super(`phong ban khong tom tat duoc: ${departmentId}`);
	}
}

const LOAI_VIEC =
	"okr-tom-tat-tuan" as const satisfies (typeof LOAI_VIEC_OKR)[number];

const BAC_TU_TIN = { cao: 2, vua: 1, thap: 0 } as const satisfies Record<
	MucTuTin,
	number
>;

const LAM_TRON_GIA_TRI = 10_000;

const lamTron = (so: number) =>
	Math.round(so * LAM_TRON_GIA_TRI) / LAM_TRON_GIA_TRI + 0;

const ngayDb = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

const ngayIso = (d: Date) => d.toISOString().slice(0, 10);

function ngayNgan(luc: Date): string {
	const [, thang = "", ngay = ""] = ngayVN(luc).split("-");
	return `${ngay}/${thang}`;
}

function chenhTuTin(cu: MucTuTin, moi: MucTuTin): ChenhTuTin {
	const bac = BAC_TU_TIN[moi] - BAC_TU_TIN[cu];
	if (bac === -2 || bac === -1 || bac === 0 || bac === 1 || bac === 2)
		return bac;
	throw new Error(`chenh tu tin ngoai thang: ${cu} -> ${moi}`);
}

function mucTieuTrongGoi(
	cycleId: string,
	departmentId: string,
): Prisma.OkrObjectiveWhereInput {
	return {
		AND: [
			{ cycleId, level: "phong-ban", departmentId, status: "cong-bo" },
			boGioiHan,
		],
	};
}

function cuaSoDen(den: Date) {
	return {
		tu: new Date(den.getTime() - OKR_TOM_TAT.cuaSoNgay * NGAY_MS),
		den,
	};
}

function lanTrongCuaSo(tu: Date, den: Date): Prisma.OkrCheckInWhereInput {
	return {
		OR: [
			{ session: { submittedAt: { gte: tu, lt: den } } },
			{ session: { submittedAt: null }, createdAt: { gte: tu, lt: den } },
		],
	};
}

async function demLanTrongCuaSo(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string; den: Date },
): Promise<number> {
	const { tu, den } = cuaSoDen(v.den);
	return db.okrCheckIn.count({
		where: {
			AND: [
				{
					keyResult: {
						objective: mucTieuTrongGoi(v.cycleId, v.departmentId),
					},
				},
				lanTrongCuaSo(tu, den),
			],
		},
	});
}

const chonKr = {
	id: true,
	title: true,
	kind: true,
	unit: true,
	startValue: true,
	targetValue: true,
	startLockedAt: true,
	objective: {
		select: {
			id: true,
			title: true,
			publishedAt: true,
			cycleId: true,
			departmentId: true,
		},
	},
	checkIns: {
		select: {
			id: true,
			weekStart: true,
			value: true,
			confidence: true,
			note: true,
			createdAt: true,
			session: { select: { submittedAt: true } },
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	},
} satisfies Prisma.OkrKeyResultSelect;

type KrDoc = Prisma.OkrKeyResultGetPayload<{ select: typeof chonKr }>;

type LanCo = LanCapNhat & { id: string };

function lanCua(kr: KrDoc): LanCo[] {
	return kr.checkIns
		.map((c) => ({
			id: c.id,
			tuan: ngayIso(c.weekStart),
			luc: c.session.submittedAt ?? c.createdAt,
			tuTin: motTrong(MUC_TU_TIN, c.confidence, "okrCheckIn.confidence"),
			ghiChu: c.note,
			giaTri: c.value.toNumber(),
		}))
		.sort((a, b) => a.luc.getTime() - b.luc.getTime());
}

type PhongKy = { cycleId: string; departmentId: string };

type KrGoi = { kr: KrDoc; lan: LanCo[]; so: KrSo };

const khoaPhongKy = (v: PhongKy) => `${v.cycleId}|${v.departmentId}`;

async function krSoTrongGoi(
	db: DbHoacTx,
	cap: readonly PhongKy[],
): Promise<Map<string, KrGoi[]>> {
	if (cap.length === 0) return new Map();
	const krs = await db.okrKeyResult.findMany({
		where: {
			objective: {
				OR: cap.map((c) => mucTieuTrongGoi(c.cycleId, c.departmentId)),
			},
		},
		select: chonKr,
		orderBy: [
			{ objective: { position: "asc" } },
			{ objectiveId: "asc" },
			{ position: "asc" },
			{ id: "asc" },
		],
	});
	const ra = new Map<string, KrGoi[]>();
	for (const kr of krs) {
		const khoa = khoaPhongKy({
			cycleId: kr.objective.cycleId,
			departmentId: kr.objective.departmentId ?? "",
		});
		const ds = ra.get(khoa) ?? [];
		const lan = lanCua(kr);
		ds.push({
			kr,
			lan,
			so: {
				id: kr.id,
				thuTu: ds.length,
				khoaLuc: kr.startLockedAt ?? kr.objective.publishedAt,
				lan,
			},
		});
		ra.set(khoa, ds);
	}
	return ra;
}

function soCuaKr(kr: KrDoc) {
	return {
		kieu: motTrong(KIEU_KR, kr.kind, "okrKeyResult.kind"),
		khoiDiem: kr.startValue.toNumber(),
		dich: kr.targetValue.toNumber(),
	};
}

function nguonTu(
	kr: KrDoc,
	lan: LanCo[],
	i: number,
	luat: Pick<LuatTomTat, "tienDoKr">,
): NguonGoi | null {
	const l = lan[i];
	if (!l) return null;
	const so = soCuaKr(kr);
	const truoc = lan[i - 1] ?? null;
	return {
		id: l.id,
		keyResultId: kr.id,
		giaTri: l.giaTri,
		truoc: truoc?.giaTri ?? null,
		chenhLech: truoc ? lamTron(l.giaTri - truoc.giaTri) : null,
		chenhTuTin: truoc ? chenhTuTin(truoc.tuTin, l.tuTin) : null,
		tienDo: luat.tienDoKr(so.kieu, so.khoiDiem, so.dich, l.giaTri),
		ngay: ngayNgan(l.luc),
	};
}

async function tenThanhVien(db: DbHoacTx): Promise<string[]> {
	const tv = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		select: { user: { select: { name: true } } },
	});
	return tv.map((t) => t.user.name);
}

export async function dungGoiTomTat(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string; tuan: string; moc: Date },
	luat: Pick<LuatTomTat, "tienDoKr">,
): Promise<GoiTomTat | null> {
	const phong = await db.department.findUnique({
		where: { id: v.departmentId },
		select: { id: true, name: true, archivedAt: true },
	});
	if (!phong || phong.archivedAt !== null) return null;
	const krs = (await krSoTrongGoi(db, [v])).get(khoaPhongKy(v)) ?? [];
	const { tu, den } = cuaSoDen(v.moc);
	const nguon: NguonGoi[] = [];
	const goiKrs = krs.map(({ kr, lan, so }): KrTrongGoi => {
		const trong: LanTrongGoi[] = [];
		lan.forEach((l, i) => {
			if (l.luc < tu || l.luc >= den) return;
			const n = nguonTu(kr, lan, i, luat);
			if (!n) return;
			nguon.push(n);
			trong.push({
				id: l.id,
				ngay: n.ngay,
				luc: l.luc.toISOString(),
				giaTri: l.giaTri,
				tienDo: n.tienDo,
				tuTinTruoc: lan[i - 1]?.tuTin ?? null,
				tuTin: l.tuTin,
				ghiChu: l.ghiChu,
				truoc: n.truoc,
				chenhLech: n.chenhLech,
				chenhTuTin: n.chenhTuTin,
			});
		});
		const truoc = lan.filter((l) => l.luc < tu).at(-1);
		return {
			id: kr.id,
			ten: kr.title,
			mucTieuId: kr.objective.id,
			mucTieu: kr.objective.title,
			donVi: kr.unit,
			...soCuaKr(kr),
			lyDo: lyDoCua(so, v.moc),
			lanTruoc: truoc
				? {
						id: truoc.id,
						ngay: ngayNgan(truoc.luc),
						giaTri: truoc.giaTri,
						tuTin: truoc.tuTin,
					}
				: null,
			lan: trong,
		};
	});
	return {
		phong: { id: phong.id, ten: phong.name },
		tuan: v.tuan,
		krs: goiKrs,
		nguon,
	};
}

function chuDauVaoCua(goi: GoiTomTat): string {
	return [
		goi.phong.ten,
		...goi.krs.flatMap((k) => [
			k.ten,
			k.mucTieu,
			k.donVi,
			...k.lan.map((l) => l.ghiChu),
		]),
	].join("\n");
}

export async function goiKiemTomTatTu(
	db: DbHoacTx,
	goi: GoiTomTat,
): Promise<GoiKiem> {
	return {
		nguon: goi.nguon,
		krs: goi.krs.map((k) => ({
			id: k.id,
			donVi: k.donVi,
			khoiDiem: k.khoiDiem,
			dich: k.dich,
		})),
		tenThanhVien: await tenThanhVien(db),
		tuCam: TRO_LY_OKR_TRAN.tuCam,
		chuDauVao: chuDauVaoCua(goi),
	};
}

export async function ghiTomTat(
	db: DbHoacTx,
	v: {
		taskId: string;
		cycleId: string;
		departmentId: string;
		tuan: string;
		moc: Date;
		inputHash: string;
		nac: NacBan;
		cau: CauBan[];
	},
	luat: LuatTomTat,
): Promise<{ id: string; trangThai: TrangThaiBan; soCauBo: number }> {
	const goi = await dungGoiTomTat(
		db,
		{
			cycleId: v.cycleId,
			departmentId: v.departmentId,
			tuan: v.tuan,
			moc: v.moc,
		},
		luat,
	);
	if (!goi) throw new PhongKhongTomTatDuoc(v.departmentId);
	const kiem = luat.kiemBan(v.cau, await goiKiemTomTatTu(db, goi), {
		tyLeGiuLai: OKR_TOM_TAT.tyLeGiuLai,
	});
	const noiDung = luat.docNoiDung({
		nac: v.nac,
		cau: kiem.cau,
		bo: kiem.bo,
	});
	try {
		const hang = await db.okrTomTat.create({
			data: {
				taskId: v.taskId,
				cycleId: v.cycleId,
				departmentId: v.departmentId,
				tuan: ngayDb(v.tuan),
				cau: noiDung,
				soCauBo: noiDung.bo.length,
				trangThai: kiem.trangThai,
				inputHash: v.inputHash,
				createdAt: new Date(),
			},
			select: { id: true },
		});
		return {
			id: hang.id,
			trangThai: kiem.trangThai,
			soCauBo: noiDung.bo.length,
		};
	} catch (loi) {
		if (
			loi instanceof Prisma.PrismaClientKnownRequestError &&
			loi.code === "P2002"
		)
			throw new TomTatDaCo({
				taskId: v.taskId,
				cycleId: v.cycleId,
				departmentId: v.departmentId,
				tuan: v.tuan,
			});
		throw loi;
	}
}

async function coViecMo(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string },
	luat: Pick<LuatTomTat, "docViec">,
): Promise<boolean> {
	const viec = await db.agentTask.findMany({
		where: {
			kind: LOAI_VIEC,
			finishedAt: null,
			AND: [
				{ payload: { path: ["cycleId"], equals: v.cycleId } },
				{ payload: { path: ["departmentId"], equals: v.departmentId } },
			],
		},
		select: { payload: true },
	});
	return viec.some((t) => {
		const p = luat.docViec(t.payload);
		return (
			p.viec === "tom-tat-tuan" &&
			p.cycleId === v.cycleId &&
			p.departmentId === v.departmentId
		);
	});
}

export async function trangThaiTuan(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string; now: Date },
	luat: Pick<LuatTomTat, "docViec">,
): Promise<{ dangSoan: boolean; chuaCapNhat: boolean }> {
	const [dangSoan, soLan] = await Promise.all([
		coViecMo(db, v, luat),
		demLanTrongCuaSo(db, { ...v, den: v.now }),
	]);
	return { dangSoan, chuaCapNhat: soLan === 0 };
}

function nacPhong(
	ct: Awaited<ReturnType<typeof cauHinhAiLuc>>,
	phong: { id: string; divisionId: string | null },
): NacCuaDonVi {
	return nacCuaDonVi(ct, "tom-tat-tuan", {
		onehub: false,
		boPhanId: phong.divisionId,
		phongBanId: phong.id,
	});
}

const LOAI_XEP =
	"okr-tom-tat-xep" as const satisfies (typeof LOAI_VIEC_OKR)[number];

const PHA_XEP = "dang-chay";

export type ChoBanDau =
	| { kieu: "toi-luc"; luc: string }
	| { kieu: "dang-xep" }
	| { kieu: "tam-dung"; lyDo: LyDoTamDungTomTat; moLai: string | null };

function laLyDoTamDung(lyDo: LyDoKhongSanSang): lyDo is LyDoTamDungTomTat {
	return (LY_DO_TAM_DUNG_TOM_TAT as readonly string[]).includes(lyDo);
}

async function daCoBanBat(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string },
): Promise<boolean> {
	const so = await db.okrTomTat.count({
		where: {
			cycleId: v.cycleId,
			departmentId: v.departmentId,
			cau: { path: ["nac"], equals: "bat" },
		},
	});
	return so > 0;
}

export async function choBanDauTomTat(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string; now: Date },
): Promise<ChoBanDau | null> {
	const ky = await db.okrCycle.findFirst({
		where: { id: v.cycleId, phase: PHA_XEP, ...KY_CON_HIEN },
		select: { updateWeekday: true },
	});
	if (!ky || (await daCoBanBat(db, v))) return null;
	const homNay = lanXepTomTatHomNay(v.now, ky.updateWeekday);
	const dangXep =
		homNay !== null &&
		(await db.agentTask.count({
			where: { kind: LOAI_XEP, dueAt: homNay, finishedAt: null },
		})) > 0;
	const luc = lanXepTomTatKe(v.now, ky.updateWeekday);
	const san = await quaTranChung(db, await cauHinhAiLuc(db, v.now), v.now);
	if (!san.bat && laLyDoTamDung(san.lyDo)) {
		const chanLanKe =
			san.lyDo !== "het-tran-thang" ||
			dangXep ||
			thangVN(luc) === thangVN(v.now);
		if (chanLanKe)
			return {
				kieu: "tam-dung",
				lyDo: san.lyDo,
				moLai:
					san.lyDo === "het-tran-thang"
						? `${thangSau(thangVN(v.now))}-01`
						: null,
			};
	}
	return dangXep
		? { kieu: "dang-xep" }
		: { kieu: "toi-luc", luc: luc.toISOString() };
}

export async function nacTomTatPhong(
	db: DbHoacTx,
	v: { departmentId: string; now: Date },
): Promise<NacCuaDonVi | null> {
	const phong = await db.department.findUnique({
		where: { id: v.departmentId },
		select: { id: true, divisionId: true, archivedAt: true },
	});
	if (!phong || phong.archivedAt !== null) return null;
	return nacPhong(await cauHinhAiLuc(db, v.now), phong);
}

type NguonDoc = { kiem: NguonGoi; hien: NguonHien };

async function nguonHienTai(
	db: DbHoacTx,
	idNguon: readonly string[],
	luat: Pick<LuatTomTat, "tienDoKr">,
): Promise<{ theoId: Map<string, NguonDoc>; krs: KrDoc[] }> {
	const lanDan = await db.okrCheckIn.findMany({
		where: { id: { in: [...idNguon] } },
		select: { keyResultId: true },
	});
	const krs = await db.okrKeyResult.findMany({
		where: { id: { in: [...new Set(lanDan.map((l) => l.keyResultId))] } },
		select: chonKr,
	});
	const can = new Set(idNguon);
	const theoId = new Map<string, NguonDoc>();
	for (const kr of krs) {
		const lan = lanCua(kr);
		lan.forEach((l, i) => {
			if (!can.has(l.id)) return;
			const kiem = nguonTu(kr, lan, i, luat);
			if (!kiem) return;
			theoId.set(l.id, {
				kiem,
				hien: {
					id: l.id,
					keyResultId: kr.id,
					krTen: kr.title,
					mucTieuId: kr.objective.id,
					mucTieuTen: kr.objective.title,
					ngay: ngayVN(l.luc),
					giaTri: l.giaTri,
					donVi: kr.unit,
					tuTin: l.tuTin,
					ghiChu: l.ghiChu,
				},
			});
		});
	}
	return { theoId, krs };
}

async function tuanMoiNhat(
	db: DbHoacTx,
	v: { cycleId: string; departmentId?: string; now: Date },
	luat: Pick<LuatTomTat, "docViec">,
): Promise<string | null> {
	const [viec, ban] = await Promise.all([
		db.agentTask.findFirst({
			where: {
				kind: LOAI_VIEC,
				createdAt: { lte: v.now },
				AND: [
					{ payload: { path: ["cycleId"], equals: v.cycleId } },
					...(v.departmentId === undefined
						? []
						: [
								{ payload: { path: ["departmentId"], equals: v.departmentId } },
							]),
				],
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			select: { payload: true },
		}),
		db.okrTomTat.findFirst({
			where: {
				cycleId: v.cycleId,
				departmentId: v.departmentId,
				createdAt: { lte: v.now },
			},
			orderBy: [{ tuan: "desc" }, { id: "desc" }],
			select: { tuan: true },
		}),
	]);
	const p = viec ? luat.docViec(viec.payload) : null;
	return (
		[
			...(p?.viec === "tom-tat-tuan" ? [p.tuan] : []),
			...(ban ? [ngayIso(ban.tuan)] : []),
		]
			.sort()
			.at(-1) ?? null
	);
}

export async function docTomTatChoNguoiXem(
	db: DbHoacTx,
	v: { cycleId: string; departmentId: string; nguoiXem: string; now: Date },
	luat: LuatTomTat,
): Promise<BanHien | null> {
	if ((await nacTomTatPhong(db, v)) !== "bat") return null;
	const [tuan, soLan] = await Promise.all([
		tuanMoiNhat(db, v, luat),
		demLanTrongCuaSo(db, { ...v, den: v.now }),
	]);
	if (tuan === null || soLan === 0) return null;
	const hang = await db.okrTomTat.findFirst({
		where: {
			cycleId: v.cycleId,
			departmentId: v.departmentId,
			tuan: ngayDb(tuan),
			trangThai: "hien",
			cau: { path: ["nac"], equals: "bat" },
			createdAt: {
				gte: new Date(v.now.getTime() - OKR_TOM_TAT.hienTrongNgay * NGAY_MS),
				lte: v.now,
			},
		},
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
	});
	if (!hang) return null;
	if (luat.docTrangThai(hang.trangThai) !== "hien") return null;
	const noiDung = luat.docNoiDung(hang.cau);
	const viec = await db.agentTask.findUnique({
		where: { id: hang.taskId },
		select: { createdAt: true },
	});
	const goi = await dungGoiTomTat(
		db,
		{
			cycleId: v.cycleId,
			departmentId: v.departmentId,
			tuan: ngayIso(hang.tuan),
			moc: viec?.createdAt ?? hang.createdAt,
		},
		luat,
	);
	if (!goi) return null;
	const idNguon = [...new Set(noiDung.cau.flatMap((c) => c.nguon))];
	const [{ theoId, krs }, nguCanh, goiKiemChung, phanHoi] = await Promise.all([
		nguonHienTai(db, idNguon, luat),
		nguCanhXemOkr(db, [v.nguoiXem]),
		goiKiemTomTatTu(db, goi),
		db.okrTomTatPhanHoi.findUnique({
			where: {
				tomTatId_userId: { tomTatId: hang.id, userId: v.nguoiXem },
			},
			select: { huuIch: true },
		}),
	]);
	const nc = nguCanh.get(v.nguoiXem);
	const mucTieuIds = [...new Set(krs.map((k) => k.objective.id))];
	const xemDuoc = new Set(
		nc
			? (
					await db.okrObjective.findMany({
						where: {
							AND: [{ id: { in: mucTieuIds } }, dieuKienXemMucTieu(nc)],
						},
						select: { id: true },
					})
				).map((o) => o.id)
			: [],
	);
	const goiKiem: GoiKiem = {
		...goiKiemChung,
		nguon: [...theoId.values()].map((n) => n.kiem),
		krs: krs.map((kr) => {
			const so = soCuaKr(kr);
			return {
				id: kr.id,
				donVi: kr.unit,
				khoiDiem: so.khoiDiem,
				dich: so.dich,
			};
		}),
	};
	const giu: BanHien["cau"] = [];
	for (const c of noiDung.cau) {
		const nguon = c.nguon.flatMap((id) => {
			const n = theoId.get(id);
			return n ? [n] : [];
		});
		if (nguon.length !== c.nguon.length) continue;
		if (nguon.some((n) => !xemDuoc.has(n.hien.mucTieuId))) continue;
		const ket = luat.kiemCau(
			c,
			goiKiem,
			giu.map((g) => g.vanBan),
		);
		if (!ket.qua) continue;
		giu.push({ vanBan: c.vanBan, nguon: nguon.map((n) => n.hien) });
	}
	return {
		id: hang.id,
		tuan: ngayIso(hang.tuan),
		soLanCapNhat: goi.nguon.length,
		cau: giu,
		phanHoiCuaToi: phanHoi?.huuIch ?? null,
	};
}

export async function banTuanChoQuanTri<M extends string>(
	db: DbHoacTx,
	v: { cycleId: string; now: Date },
	luat: Pick<LuatTomTat<M>, "docNoiDung" | "docTrangThai" | "docViec">,
): Promise<BanTuanQuanTri<M>> {
	const [tuan, phongBan, ct] = await Promise.all([
		tuanMoiNhat(db, v, luat),
		db.department.findMany({
			where: { archivedAt: null },
			orderBy: [{ position: "asc" }, { id: "asc" }],
			select: { id: true, name: true, divisionId: true },
		}),
		cauHinhAiLuc(db, v.now),
	]);
	if (tuan === null) return { tuan: null, phong: [] };
	const [viec, hang] = await Promise.all([
		db.agentTask.findMany({
			where: {
				kind: LOAI_VIEC,
				createdAt: { lte: v.now },
				AND: [
					{ payload: { path: ["cycleId"], equals: v.cycleId } },
					{ payload: { path: ["tuan"], equals: tuan } },
					{
						OR: phongBan.map((pb) => ({
							payload: { path: ["departmentId"], equals: pb.id },
						})),
					},
				],
			},
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: { payload: true, finishedAt: true },
		}),
		db.okrTomTat.findMany({
			where: {
				cycleId: v.cycleId,
				tuan: ngayDb(tuan),
				createdAt: { lte: v.now },
				departmentId: { in: phongBan.map((pb) => pb.id) },
			},
		}),
	]);
	const viecDoc = viec.flatMap((t) => {
		const p = luat.docViec(t.payload);
		return p.viec === "tom-tat-tuan" ? [{ mo: t.finishedAt === null, p }] : [];
	});
	const banTuan = hang.map((h) => ({
		h,
		noiDung: luat.docNoiDung(h.cau),
		trangThai: luat.docTrangThai(h.trangThai),
	}));
	const idNguon = [
		...new Set(
			banTuan.flatMap((b) =>
				[...b.noiDung.cau, ...b.noiDung.bo].flatMap((c) => c.nguon),
			),
		),
	];
	const [phanHoi, lanDan] = await Promise.all([
		db.okrTomTatPhanHoi.groupBy({
			by: ["tomTatId", "huuIch"],
			where: { tomTatId: { in: banTuan.map((b) => b.h.id) } },
			_count: { _all: true },
		}),
		db.okrCheckIn.findMany({
			where: { id: { in: idNguon } },
			select: {
				id: true,
				createdAt: true,
				session: { select: { submittedAt: true } },
				keyResult: { select: { title: true } },
			},
		}),
	]);
	const nguonTheoId = new Map(
		lanDan.map((l) => [
			l.id,
			{
				id: l.id,
				mat: false as const,
				ngay: ngayVN(l.session.submittedAt ?? l.createdAt),
				krTen: l.keyResult.title,
			},
		]),
	);
	const giaiNguon = (id: string): NguonQuanTri =>
		nguonTheoId.get(id) ?? { id, mat: true };
	const giaiCau = <C extends CauBan>(c: C) => ({
		...c,
		nguon: c.nguon.map(giaiNguon),
	});
	const dem = (tomTatId: string, huuIch: boolean) =>
		phanHoi.find((p) => p.tomTatId === tomTatId && p.huuIch === huuIch)?._count
			._all ?? 0;
	const phong = phongBan.flatMap((pb): DongQuanTriTomTat<M>[] => {
		const ban = banTuan.find((b) => b.h.departmentId === pb.id);
		const t = viecDoc.filter((x) => x.p.departmentId === pb.id).at(-1);
		const nacHienTai = nacPhong(ct, pb);
		const nac: NacBan | null = ban
			? ban.noiDung.nac
			: t
				? t.p.nac
				: nacHienTai === "bat" || nacHienTai === "an"
					? nacHienTai
					: null;
		if (nac === null) return [];
		const trangThai: TrangThaiQuanTriTomTat = ban
			? ban.trangThai
			: t
				? t.mo
					? "dang-soan"
					: "khong-lam-duoc"
				: "chua-cap-nhat";
		return [
			{
				departmentId: pb.id,
				ten: pb.name,
				nac,
				trangThai,
				tomTatId: ban?.h.id ?? null,
				soCau: ban?.noiDung.cau.length ?? 0,
				soCauBo: ban?.noiDung.bo.length ?? 0,
				huuIch: ban ? dem(ban.h.id, true) : 0,
				khongHuuIch: ban ? dem(ban.h.id, false) : 0,
				cau: ban?.noiDung.cau.map(giaiCau) ?? [],
				bo: ban?.noiDung.bo.map(giaiCau) ?? [],
			},
		];
	});
	return { tuan, phong };
}

export async function viecTomTatCanNhac(
	db: DbHoacTx,
	chon: { cuaSo: "buoi-sang"; now: Date; userId?: string },
): Promise<Map<string, ViecTomTat[]>> {
	const ban = await db.okrTomTat.findMany({
		where: {
			trangThai: "hien",
			cau: { path: ["nac"], equals: "bat" },
			createdAt: cuaSoSuKien(chon),
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true, cycleId: true, departmentId: true },
	});
	if (ban.length === 0) return new Map();
	const [phong, ct] = await Promise.all([
		db.department.findMany({
			where: {
				id: { in: [...new Set(ban.map((b) => b.departmentId))] },
				archivedAt: null,
				headUserId: chon.userId ?? { not: null },
			},
			select: { id: true, name: true, divisionId: true, headUserId: true },
		}),
		cauHinhAiLuc(db, chon.now),
	]);
	const phongBat = new Map(
		phong.flatMap((p) =>
			p.headUserId !== null && nacPhong(ct, p) === "bat"
				? [[p.id, { ten: p.name, truong: p.headUserId }] as const]
				: [],
		),
	);
	const truong = [...new Set([...phongBat.values()].map((p) => p.truong))];
	const [thanhVien, daTat] = await Promise.all([
		db.member.findMany({
			where: { organizationId: WORKSPACE_ID, userId: { in: truong } },
			select: { userId: true },
		}),
		db.notificationPreference.findMany({
			where: { userId: { in: truong }, dongTroLyOkr: false },
			select: { userId: true },
		}),
	]);
	const tat = new Set(daTat.map((t) => t.userId));
	const nhan = new Set(
		thanhVien.map((m) => m.userId).filter((userId) => !tat.has(userId)),
	);
	const gui = ban.flatMap((b) => {
		const p = phongBat.get(b.departmentId);
		return p && nhan.has(p.truong) ? [{ b, p }] : [];
	});
	const krTheoPhong = await krSoTrongGoi(
		db,
		gui.map(({ b }) => b),
	);
	const viec = gui.map(({ b, p }) => {
		const krDangBan = (krTheoPhong.get(khoaPhongKy(b)) ?? [])
			.filter(({ so }) => lyDoCua(so, chon.now).length > 0)
			.map(({ kr }) => kr.id);
		return {
			userId: p.truong,
			viec: {
				loai: "okr-tom-tat" as const,
				tomTatId: b.id,
				departmentId: b.departmentId,
				cycleId: b.cycleId,
				phongTen: p.ten,
				krDangBan,
				soKrDangBan: krDangBan.length,
			},
		};
	});
	const ra = new Map<string, ViecTomTat[]>();
	for (const { userId, viec: v } of viec)
		ra.set(userId, [...(ra.get(userId) ?? []), v]);
	return ra;
}
