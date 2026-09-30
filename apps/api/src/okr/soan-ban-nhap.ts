import type { Db, Prisma } from "@crm/db";
import { MA_LOAI_BAN_NHAP } from "@crm/validation/okr-kiem-ban-nhap";
import {
	type DongSoan,
	dongKrMoi,
	dongMucTieuMoi,
	dongSoanTuHang,
	LOAI_DONG_SOAN,
	TRO_LY_OKR_TRAN,
	trangThaiDeXuat,
} from "@crm/validation/okr-tro-ly";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import type { DongSoanOutput, SoanQuyetInput } from "./okr.contracts";
import { OKR } from "./okr-config";

type Tx = Prisma.TransactionClient;
type DbHoacTx = Db | Tx;
type HangNhap = Prisma.OkrDeXuatModel;

export type DongDoc = { hang: HangNhap; dong: DongSoan };

const T = OKR.thongDiep.soan;
const maLoai = z.enum(MA_LOAI_BAN_NHAP).nullable();
const TEN_SUA = {
	"muc-tieu-moi": {
		khuon: dongMucTieuMoi.shape.ten,
		tran: TRO_LY_OKR_TRAN.chu.tenMucTieu,
	},
	"kr-moi": { khuon: dongKrMoi.shape.ten, tran: TRO_LY_OKR_TRAN.chu.tenKr },
} as const;

type CanChinhMoi = Extract<DongSoan, { loai: "can-chinh-moi" }>;

const dichCua = (d: CanChinhMoi) =>
	d.targetObjectiveId ?? d.targetKeyResultId ?? "";

export async function docBanNhap(
	client: DbHoacTx,
	cuocSoanId: string,
): Promise<DongDoc[]> {
	const hang = await client.okrDeXuat.findMany({
		where: {
			cuocSoanId,
			loai: { in: [...LOAI_DONG_SOAN] },
			trangThai: { not: "bi-loai" },
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
	return hang.map((h) => ({ hang: h, dong: dongSoanTuHang(h) }));
}

export async function ghiHienLuc(
	client: DbHoacTx,
	ds: DongDoc[],
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
	ds: DongDoc[],
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
			where: { id: { in: ids } },
			select: { id: true, title: true },
		}),
		client.okrKeyResult.findMany({
			where: { id: { in: ids } },
			select: { id: true, title: true },
		}),
	]);
	return new Map([...mucTieu, ...kr].map((d) => [d.id, d.title]));
}

export function dongHienTu(
	{ hang, dong }: DongDoc,
	tenDich: ReadonlyMap<string, string>,
): DongSoanOutput {
	const goc = {
		id: hang.id,
		khoa: dong.khoa,
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

const chaCua = (ds: DongDoc[], chaKhoa: string) =>
	ds.findLast((d) => d.dong.loai === "muc-tieu-moi" && d.dong.khoa === chaKhoa);

export async function ghiQuyet(
	tx: Tx,
	v: SoanQuyetInput & { cuocSoanId: string; userId: string; now: Date },
): Promise<void> {
	const ds = await docBanNhap(tx, v.cuocSoanId);
	const muc = ds.find((d) => d.hang.id === v.deXuatId);
	if (!muc) throw new NotFoundException(T.khongCoDong(v.deXuatId));
	const { dong } = muc;
	const giaTriCuoi = v.quyet === "sua" ? giaTriSua(dong, v.giaTriCuoi) : null;
	if (v.quyet !== "bac" && dong.loai !== "muc-tieu-moi")
		if (chaCua(ds, dong.chaKhoa)?.hang.trangThai === "bac")
			throw new BadRequestException(T.chaDaBac);
	const quyetBoi = { nguoiQuyet: v.userId, quyetLuc: v.now };
	await tx.okrDeXuat.update({
		where: { id: v.deXuatId },
		data: { trangThai: v.quyet, giaTriCuoi, ...quyetBoi },
	});
	if (v.quyet !== "bac" || dong.loai !== "muc-tieu-moi") return;
	const con = ds
		.filter(
			(d) =>
				d.dong.loai !== "muc-tieu-moi" &&
				d.dong.chaKhoa === dong.khoa &&
				d.hang.trangThai !== "bac",
		)
		.map((d) => d.hang.id);
	if (con.length === 0) return;
	await tx.okrDeXuat.updateMany({
		where: { id: { in: con } },
		data: { trangThai: "bac", giaTriCuoi: null, ...quyetBoi },
	});
}
