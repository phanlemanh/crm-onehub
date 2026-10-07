import type { Db, Prisma } from "@crm/db";
import { dieuKienXemMucTieu, type NguCanhXem } from "@crm/db/okr-hien-thi";
import { TRANG_THAI_GIU_KHOA } from "@crm/db/okr-tro-ly-danh-muc";
import { MA_LOAI_BAN_NHAP } from "@crm/validation/okr-kiem-ban-nhap";
import { khoaDong, khoaModel } from "@crm/validation/okr-kiem-de-xuat";
import {
	type DongSoan,
	dongKrMoi,
	dongMucTieuMoi,
	dongSoanTuHang,
	LOAI_DONG_SOAN,
	TRO_LY_OKR_TRAN,
	trangThaiDeXuat,
} from "@crm/validation/okr-tro-ly";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import type {
	DongSoanOutput,
	SoanQuyetInput,
	SoanQuyetOutput,
} from "./okr.contracts";
import { OKR } from "./okr-config";

type Tx = Prisma.TransactionClient;
type DbHoacTx = Db | Tx;
type HangNhap = Prisma.OkrDeXuatModel;

export type DongDoc = { hang: HangNhap; dong: DongSoan; khoaDong: string };

type MucTieuMoi = Extract<DongSoan, { loai: "muc-tieu-moi" }>;
type CanChinhMoi = Extract<DongSoan, { loai: "can-chinh-moi" }>;
export type DongMucTieu = DongDoc & { dong: MucTieuMoi };
export type TuChoiCha = Extract<SoanQuyetOutput, { ok: false }> & {
	lyDo: "khong-co-cha" | "cha-bi-loai" | "cha-da-bac";
};

const T = OKR.thongDiep.soan;
const maLoai = z.enum(MA_LOAI_BAN_NHAP).nullable();
const DA_QUYET: ReadonlySet<string> = new Set(TRANG_THAI_GIU_KHOA);
const TEN_SUA = {
	"muc-tieu-moi": {
		khuon: dongMucTieuMoi.shape.ten,
		tran: TRO_LY_OKR_TRAN.chu.tenMucTieu,
	},
	"kr-moi": { khuon: dongKrMoi.shape.ten, tran: TRO_LY_OKR_TRAN.chu.tenKr },
} as const;

const dichCua = (d: CanChinhMoi) =>
	d.targetObjectiveId ?? d.targetKeyResultId ?? "";

export const laMucTieu = (d: DongDoc): d is DongMucTieu =>
	d.dong.loai === "muc-tieu-moi";

const daQuyet = (d: DongDoc) => DA_QUYET.has(d.hang.trangThai);

function docTuHang(hang: HangNhap): DongDoc {
	const dong = dongSoanTuHang(hang);
	return { hang, dong, khoaDong: khoaDong(dong) };
}

export async function docMoiDongCuaCuoc(
	client: DbHoacTx,
	cuocSoanIds: string[],
): Promise<ReadonlyMap<string, DongDoc[]>> {
	const hang = await client.okrDeXuat.findMany({
		where: {
			cuocSoanId: { in: cuocSoanIds },
			loai: { in: [...LOAI_DONG_SOAN] },
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
	const theoCuoc = new Map<string, DongDoc[]>(
		cuocSoanIds.map((id) => [id, []]),
	);
	for (const h of hang) theoCuoc.get(h.cuocSoanId ?? "")?.push(docTuHang(h));
	return theoCuoc;
}

export async function docMoiDong(
	client: DbHoacTx,
	cuocSoanId: string,
): Promise<DongDoc[]> {
	return (await docMoiDongCuaCuoc(client, [cuocSoanId])).get(cuocSoanId) ?? [];
}

export type LanNop = { lanNopMoiNhat: string | null };

export function tapHien(ds: readonly DongDoc[], cuoc: LanNop): DongDoc[] {
	const lanMoiNhat = cuoc.lanNopMoiNhat ?? ds.at(-1)?.hang.inputHash;
	const ungVien = ds.filter(
		(d) =>
			d.hang.trangThai !== "bi-loai" &&
			(daQuyet(d) || d.hang.inputHash === lanMoiNhat),
	);
	const thang = new Map<string, DongDoc>();
	for (const d of ungVien) {
		const cu = thang.get(d.khoaDong);
		if (!cu || daQuyet(d) || !daQuyet(cu)) thang.set(d.khoaDong, d);
	}
	const moiKhoa = ungVien.filter((d) => thang.get(d.khoaDong) === d);
	const quyetTruoc = new Map<string, DongDoc>();
	for (const d of moiKhoa) {
		const k = khoaModel(d.dong);
		if (daQuyet(d) && !quyetTruoc.has(k)) quyetTruoc.set(k, d);
	}
	return moiKhoa.filter((d) => {
		const q = quyetTruoc.get(khoaModel(d.dong));
		return q === undefined || q === d;
	});
}

export async function docBanNhapHien(
	client: DbHoacTx,
	cuoc: LanNop & { id: string },
): Promise<DongDoc[]> {
	return tapHien(await docMoiDong(client, cuoc.id), cuoc);
}

export async function ghiHienLuc(
	client: DbHoacTx,
	ds: readonly DongDoc[],
	now: Date,
): Promise<void> {
	const lanDau = ds
		.filter((d) => d.hang.hienLuc === null)
		.map((d) => d.hang.id);
	if (lanDau.length === 0) return;
	await client.okrDeXuat.updateMany({
		where: { id: { in: lanDau }, hienLuc: null },
		data: { hienLuc: now },
	});
}

export async function tenDichCua(
	client: DbHoacTx,
	ds: readonly DongDoc[],
	nguoiXem: NguCanhXem,
): Promise<ReadonlyMap<string, string>> {
	const ids = [
		...new Set(
			ds.flatMap(({ dong }) =>
				dong.loai === "can-chinh-moi" ? [dichCua(dong)] : [],
			),
		),
	];
	if (ids.length === 0) return new Map();
	const [mucTieu, kr] = await Promise.all([
		client.okrObjective.findMany({
			where: { AND: [{ id: { in: ids } }, dieuKienXemMucTieu(nguoiXem)] },
			select: { id: true, title: true },
		}),
		client.okrKeyResult.findMany({
			where: { id: { in: ids }, objective: dieuKienXemMucTieu(nguoiXem) },
			select: { id: true, title: true },
		}),
	]);
	return new Map([...mucTieu, ...kr].map((d) => [d.id, d.title]));
}

export function dongHienTu(
	{ hang, dong, khoaDong: khoa }: DongDoc,
	tenDich: ReadonlyMap<string, string>,
): DongSoanOutput {
	const goc = {
		id: hang.id,
		khoa: dong.khoa,
		khoaDong: khoa,
		viSao: hang.lyDo,
		trangThai: trangThaiDeXuat.parse(hang.trangThai),
		maLoai: maLoai.parse(hang.maLoai),
		giaTriCuoi: hang.giaTriCuoi,
		taoRaId: hang.taoRaId,
	};
	if (dong.loai === "muc-tieu-moi")
		return {
			...goc,
			loai: dong.loai,
			ten: dong.ten,
			viSaoLucNay: dong.viSaoLucNay,
			loaiMucTieu: dong.loaiMucTieu,
		};
	if (dong.loai === "kr-moi")
		return {
			...goc,
			loai: dong.loai,
			chaKhoa: dong.chaKhoa,
			ten: dong.ten,
			kieu: dong.kieu,
			donVi: dong.donVi,
			khoiDiemGoiY: dong.khoiDiemGoiY,
		};
	const dichId = dichCua(dong);
	return {
		...goc,
		loai: dong.loai,
		chaKhoa: dong.chaKhoa,
		dichId,
		tenDich: tenDich.get(dichId) ?? "",
	};
}

export async function cuocCuaDong(
	client: DbHoacTx,
	deXuatId: string,
): Promise<string> {
	const moc = await client.okrDeXuat.findUnique({
		where: { id: deXuatId },
		select: { cuocSoanId: true },
	});
	if (!moc?.cuocSoanId) throw new NotFoundException(T.khongCoDong(deXuatId));
	return moc.cuocSoanId;
}

function giaTriSua(dong: DongSoan, giaTri: string | undefined): string {
	if (dong.loai === "can-chinh-moi")
		throw new BadRequestException(T.cachKhongHop);
	if (!giaTri) throw new BadRequestException(T.canGiaTri);
	const { khuon, tran } = TEN_SUA[dong.loai];
	const r = khuon.safeParse(giaTri);
	if (!r.success) throw new BadRequestException(T.tenSuaKhongHop(tran));
	return r.data;
}

export function chaTuChoi(
	ds: readonly DongDoc[],
	hien: readonly DongDoc[],
	con: DongDoc,
	chaKhoa: string,
): TuChoiCha | null {
	const cungKhoa = (tap: readonly DongDoc[]) =>
		tap.filter(laMucTieu).filter((d) => d.dong.khoa === chaKhoa);
	const cung = cungKhoa(ds);
	const cha =
		cungKhoa(hien).at(-1) ??
		cung.findLast((d) => d.hang.inputHash === con.hang.inputHash) ??
		cung.at(-1);
	if (!cha)
		return {
			ok: false,
			lyDo: "khong-co-cha",
			chiTiet: T.khongCoCha(chaKhoa),
		};
	if (cha.hang.trangThai === "bi-loai")
		return {
			ok: false,
			lyDo: "cha-bi-loai",
			chiTiet: T.chaBiLoai(cha.dong.ten),
		};
	if (cha.hang.trangThai === "bac")
		return {
			ok: false,
			lyDo: "cha-da-bac",
			chiTiet: T.chaDaBac(cha.dong.ten),
		};
	return null;
}

type GhiQuyet = SoanQuyetInput & {
	cuoc: LanNop & { id: string };
	userId: string;
	now: Date;
};

const conCua = (hien: readonly DongDoc[], cha: DongDoc): DongDoc[] =>
	laMucTieu(cha)
		? hien.filter(
				(d) =>
					d.dong.loai !== "muc-tieu-moi" && d.dong.chaKhoa === cha.dong.khoa,
			)
		: [];

async function ghiHoan(
	tx: Tx,
	hien: readonly DongDoc[],
	muc: DongDoc,
	cuoc: LanNop,
): Promise<SoanQuyetOutput> {
	if (!daQuyet(muc)) return { ok: false, lyDo: "chua-quyet", chiTiet: null };
	const ids = [muc, ...conCua(hien, muc).filter(daQuyet)].map((d) => d.hang.id);
	await tx.okrDeXuat.updateMany({
		where: { id: { in: ids } },
		data: {
			trangThai: "cho",
			giaTriCuoi: null,
			nguoiQuyet: null,
			quyetLuc: null,
			inputHash: cuoc.lanNopMoiNhat ?? undefined,
		},
	});
	return { ok: true };
}

async function ghiNhom(
	tx: Tx,
	hien: readonly DongDoc[],
	muc: DongDoc,
	kem: readonly string[],
	quyetBoi: { nguoiQuyet: string; quyetLuc: Date },
): Promise<SoanQuyetOutput> {
	const con = new Map(conCua(hien, muc).map((d) => [d.hang.id, d]));
	const hopLe =
		laMucTieu(muc) &&
		!daQuyet(muc) &&
		new Set(kem).size === kem.length &&
		kem.every((id) => {
			const d = con.get(id);
			return d !== undefined && d.dong.loai === "kr-moi" && !daQuyet(d);
		});
	if (!hopLe) return { ok: false, lyDo: "kem-sai", chiTiet: null };
	await tx.okrDeXuat.updateMany({
		where: { id: { in: [muc.hang.id, ...kem] } },
		data: { trangThai: "nhan", giaTriCuoi: null, ...quyetBoi },
	});
	return { ok: true };
}

export async function ghiQuyet(tx: Tx, v: GhiQuyet): Promise<SoanQuyetOutput> {
	if (v.kem !== undefined && v.quyet !== "nhan")
		throw new BadRequestException(T.cachKhongHop);
	const ds = await docMoiDong(tx, v.cuoc.id);
	const muc = ds.find(
		(d) => d.hang.id === v.deXuatId && d.hang.trangThai !== "bi-loai",
	);
	if (!muc) throw new NotFoundException(T.khongCoDong(v.deXuatId));
	const hien = tapHien(ds, v.cuoc);
	if (!hien.includes(muc)) throw new ConflictException(T.dongCu);
	const quyetBoi = { nguoiQuyet: v.userId, quyetLuc: v.now };
	if (v.quyet === "hoan") return ghiHoan(tx, hien, muc, v.cuoc);
	if (v.kem !== undefined) return ghiNhom(tx, hien, muc, v.kem, quyetBoi);
	const { dong } = muc;
	const giaTriCuoi = v.quyet === "sua" ? giaTriSua(dong, v.giaTriCuoi) : null;
	if (v.quyet !== "bac" && dong.loai !== "muc-tieu-moi") {
		const tuChoi = chaTuChoi(ds, hien, muc, dong.chaKhoa);
		if (tuChoi) return tuChoi;
	}
	await tx.okrDeXuat.update({
		where: { id: v.deXuatId },
		data: { trangThai: v.quyet, giaTriCuoi, ...quyetBoi },
	});
	if (v.quyet !== "bac" || dong.loai !== "muc-tieu-moi") return { ok: true };
	const con = hien
		.filter(
			(d) =>
				d.dong.loai !== "muc-tieu-moi" &&
				d.dong.chaKhoa === dong.khoa &&
				d.hang.trangThai !== "bac",
		)
		.map((d) => d.hang.id);
	if (con.length > 0)
		await tx.okrDeXuat.updateMany({
			where: { id: { in: con } },
			data: { trangThai: "bac", giaTriCuoi: null, ...quyetBoi },
		});
	return { ok: true };
}
