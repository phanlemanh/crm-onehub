import { randomUUID } from "node:crypto";
import { setTimeout as cho } from "node:timers/promises";
import { db, Prisma } from "@crm/db";
import { docCuoc, donViAiCuaCuoc } from "@crm/db/okr-cuoc-soan";
import { cauHinhAiLuc } from "@crm/db/okr-tro-ly";
import {
	nacCuaDonVi,
	type TRANG_THAI_DE_XUAT,
} from "@crm/db/okr-tro-ly-danh-muc";
import {
	type BanNhap,
	KET_QUA_NOP,
	laChoGiuPhien,
	lyDoTuChoiGhi,
} from "@crm/validation/okr-cuoc-soan";
import {
	type DongKiemSoan,
	dongBiLoaiSoan,
	type GoiKiemSoan,
	giaTriViPham,
	kiemBanNhap,
	type MaLoaiBanNhap,
} from "@crm/validation/okr-kiem-ban-nhap";
import { khoaDong, khoaModel } from "@crm/validation/okr-kiem-de-xuat";
import {
	type DongSoan,
	dongSoanTuHang,
	hangTuDongSoan,
} from "@crm/validation/okr-tro-ly";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "./config";
import { type GoiSoan, goiKiemTu, goiSoan } from "./goi-soan";
import { type NguCanhPhien, thuocTinhPhien } from "./phien";
import { docSoNguoiGo } from "./so-nguoi-go";

type TrangThaiHang = (typeof TRANG_THAI_DE_XUAT)[number];

type TrangThaiGiu = (typeof TRO_LY_OKR_SOAN.trangThaiGiuKhoa)[number];

const GIU = TRO_LY_OKR_SOAN.giuNguyen;

export const ketQuaNop = z.object({
	ketQua: z.enum(KET_QUA_NOP),
	lyDo: lyDoTuChoiGhi,
	soDong: z.number().int(),
	biLoai: z.array(dongBiLoaiSoan),
	giuNguyen: z.array(
		z.object({
			khoa: z.string(),
			ten: z.string(),
			trangThai: z.enum(TRO_LY_OKR_SOAN.trangThaiGiuKhoa),
			ma: z.enum([GIU.daQuyet, GIU.khacTen]),
		}),
	),
});

export type KetQuaNop = z.infer<typeof ketQuaNop>;

export type DongGiuNguyen = KetQuaNop["giuNguyen"][number];

type DongDaLuu = {
	khoa: string;
	ten: string;
	trangThai: TrangThaiGiu;
	khoaDong: string;
};

type DaQuyet = {
	theoKhoaDong: ReadonlyMap<string, DongDaLuu>;
	theoKhoaModel: ReadonlyMap<string, DongDaLuu>;
};

const TU_CHOI = TRO_LY_OKR_SOAN.tuChoi;

const tuChoi = (lyDo: (typeof TU_CHOI)[keyof typeof TU_CHOI]): KetQuaNop => ({
	ketQua: "tu-choi",
	lyDo,
	soDong: 0,
	biLoai: [],
	giuNguyen: [],
});

function dongTuBanNhap(
	input: BanNhap,
	v: { cuocSoanId: string; idKr: ReadonlySet<string> },
): DongKiemSoan[] {
	return input.mucTieu.flatMap((m): DongKiemSoan[] => {
		const mucTieu: DongKiemSoan = {
			loai: "muc-tieu-moi",
			khoa: m.khoa,
			ten: m.ten,
			viSaoLucNay: m.viSaoLucNay,
			loaiMucTieu: m.loai,
			viSao: m.viSao,
			canChinhId: m.canChinhId ?? null,
			cuocSoanId: v.cuocSoanId,
			dich: null,
		};
		const dich = m.canChinhId ?? null;
		const canChinh: DongKiemSoan[] =
			dich === null
				? []
				: [
						{
							loai: "can-chinh-moi",
							khoa: `${m.khoa}${TRO_LY_OKR_SOAN.canChinhDuoi}`,
							chaKhoa: m.khoa,
							targetObjectiveId: v.idKr.has(dich) ? null : dich,
							targetKeyResultId: v.idKr.has(dich) ? dich : null,
							viSao: m.viSao,
							cuocSoanId: v.cuocSoanId,
							dich: null,
						},
					];
		const kr = m.kr.map(
			(k): DongKiemSoan => ({
				loai: "kr-moi",
				khoa: k.khoa,
				chaKhoa: m.khoa,
				ten: k.ten,
				kieu: k.kieu,
				donVi: k.donVi,
				khoiDiemGoiY: k.khoiDiemGoiY ?? null,
				dich: k.dich ?? null,
				viSao: k.viSao,
				cuocSoanId: v.cuocSoanId,
			}),
		);
		return [mucTieu, ...canChinh, ...kr];
	});
}

function veDongSoan(d: DongKiemSoan): DongSoan {
	return d.loai === "kr-moi" ? { ...d, dich: null } : d;
}

function tenCua(d: DongKiemSoan): string {
	return d.loai === "can-chinh-moi" ? d.khoa : d.ten;
}

function khoaCua(d: DongKiemSoan): string {
	return khoaDong(veDongSoan(d));
}

function chanTrungKhoa(dongs: readonly DongKiemSoan[]): void {
	const da = new Set<string>();
	for (const d of dongs) {
		const k = khoaCua(d);
		if (da.has(k)) throw new Error(`${TU_CHOI.dongTrungKhoa}: ${d.khoa}`);
		da.add(k);
	}
}

const QUYET_GIU_TEN: ReadonlySet<TrangThaiGiu> = new Set(
	TRO_LY_OKR_SOAN.trangThaiDaQuyet,
);

async function docDaQuyet(cuocSoanId: string): Promise<DaQuyet> {
	const hang = await db.okrDeXuat.findMany({
		where: {
			cuocSoanId,
			trangThai: { in: [...TRO_LY_OKR_SOAN.trangThaiGiuKhoa] },
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			loai: true,
			cuocSoanId: true,
			sau: true,
			lyDo: true,
			noiDung: true,
			trangThai: true,
		},
	});
	const trangThai = z.enum(TRO_LY_OKR_SOAN.trangThaiGiuKhoa);
	const theoKhoaDong = new Map<string, DongDaLuu>();
	const theoKhoaModel = new Map<string, DongDaLuu>();
	for (const h of hang) {
		const dong = dongSoanTuHang(h);
		const luu: DongDaLuu = {
			khoa: dong.khoa,
			ten: dong.loai === "can-chinh-moi" ? dong.khoa : dong.ten,
			trangThai: trangThai.parse(h.trangThai),
			khoaDong: khoaDong(dong),
		};
		if (QUYET_GIU_TEN.has(luu.trangThai) && !theoKhoaDong.has(luu.khoaDong))
			theoKhoaDong.set(luu.khoaDong, luu);
		if (!theoKhoaModel.has(khoaModel(dong)))
			theoKhoaModel.set(khoaModel(dong), luu);
	}
	return { theoKhoaDong, theoKhoaModel };
}

function voiKhoaDaLuu(
	input: BanNhap,
	dongs: readonly DongKiemSoan[],
	daQuyet: DaQuyet,
): BanNhap {
	const dung = new Set(input.mucTieu.map((m) => m.khoa));
	const doi = new Map<string, string>();
	for (const d of dongs) {
		if (d.loai !== "muc-tieu-moi") continue;
		const luu = daQuyet.theoKhoaDong.get(khoaCua(d));
		if (!luu || luu.khoa === d.khoa || dung.has(luu.khoa)) continue;
		doi.set(d.khoa, luu.khoa);
		dung.add(luu.khoa);
	}
	if (doi.size === 0) return input;
	return {
		mucTieu: input.mucTieu.map((m) => ({
			...m,
			khoa: doi.get(m.khoa) ?? m.khoa,
		})),
	};
}

function giuTheo(d: DongKiemSoan, daQuyet: DaQuyet): DongGiuNguyen | null {
	const cungNoiDung = daQuyet.theoKhoaDong.get(khoaCua(d));
	if (cungNoiDung) {
		const { khoa, ten, trangThai } = cungNoiDung;
		return { khoa, ten, trangThai, ma: GIU.daQuyet };
	}
	const cungKhoa = daQuyet.theoKhoaModel.get(khoaModel(veDongSoan(d)));
	if (!cungKhoa || cungKhoa.khoaDong === khoaCua(d)) return null;
	const { khoa, ten, trangThai } = cungKhoa;
	return { khoa, ten, trangThai, ma: GIU.khacTen };
}

const VI_PHAM = TRO_LY_OKR_SOAN.viPham;

function viPhamCua(
	d: DongKiemSoan,
	kiem: GoiKiemSoan,
	maLoai: MaLoaiBanNhap,
): string {
	const giaTri = giaTriViPham(d, kiem, maLoai);
	const nhan = VI_PHAM.nhan[maLoai];
	return giaTri.length
		? `${nhan}${VI_PHAM.noiNhan}${giaTri.join(VI_PHAM.noiGiaTri)}`
		: nhan;
}

async function laPhienSong(
	cuocSoanId: string,
	sessionId: string,
): Promise<boolean> {
	const han = Date.now() + TRO_LY_OKR_SOAN.choGanPhien.ms;
	for (;;) {
		const cuoc = await docCuoc(db, cuocSoanId);
		if (!cuoc) return false;
		if (!laChoGiuPhien(cuoc.sessionId) || Date.now() >= han)
			return cuoc.sessionId === sessionId;
		await cho(TRO_LY_OKR_SOAN.choGanPhien.nhipMs);
	}
}

function idKrCua(goi: GoiSoan): Set<string> {
	return new Set(
		goi.lop2a.ungVienCanChinh.filter((u) => u.loai === "kr").map((u) => u.id),
	);
}

export async function nopBanNhap(
	input: BanNhap,
	ctx: NguCanhPhien,
): Promise<KetQuaNop> {
	const { cuocSoanId, userId, purpose, vai } = thuocTinhPhien(ctx);
	if (purpose !== TRO_LY_OKR_SOAN.purpose || !cuocSoanId || !userId || !vai)
		return tuChoi(TU_CHOI.saiMucDich);
	const cuoc = await docCuoc(db, cuocSoanId);
	if (!cuoc || cuoc.nguoiMoUserId !== userId)
		return tuChoi(TU_CHOI.cuocKhongThuocPhien);
	if (cuoc.trangThai !== "dang") return tuChoi(TU_CHOI.cuocKhongDang);
	if (
		cuoc.sessionId !== ctx.session.id &&
		!(await laPhienSong(cuocSoanId, ctx.session.id))
	)
		return tuChoi(TU_CHOI.phienKhongSong);
	const ky = await db.okrCycle.findUniqueOrThrow({
		where: { id: cuoc.cycleId },
		select: { phase: true },
	});
	if (ky.phase !== "lap-ke-hoach") return tuChoi(TU_CHOI.chuKyKhongLapKeHoach);
	const nac = nacCuaDonVi(
		await cauHinhAiLuc(db),
		"soan",
		await donViAiCuaCuoc(db, cuoc),
	);
	if (nac !== "bat" && nac !== "an") return tuChoi(TU_CHOI.donViChuaBat);
	const goi = await goiSoan(cuocSoanId, { vai });
	if (!goi) return tuChoi(TU_CHOI.cuocKhongDang);
	const dung = { cuocSoanId, idKr: idKrCua(goi) };
	chanTrungKhoa(dongTuBanNhap(input, dung));
	const daQuyet = await docDaQuyet(cuocSoanId);
	const dongs = dongTuBanNhap(
		voiKhoaDaLuu(input, dongTuBanNhap(input, dung), daQuyet),
		dung,
	);
	const giu = dongs.map((d) => ({ d, giu: giuTheo(d, daQuyet) }));
	const giuNguyen = giu.flatMap(({ giu }) => (giu ? [giu] : []));
	const conLai = giu.flatMap(({ d, giu }) => (giu ? [] : [d]));
	const kiem = await goiKiemTu(goi, {
		soNguoiGo: await docSoNguoiGo([
			ctx.session.id,
			cuoc.sessionId,
			...cuoc.cacPhien,
		]),
	});
	const daKiem = kiemBanNhap(conLai, kiem);
	const lanNop = randomUUID();
	await db.$transaction([
		db.okrDeXuat.createMany({
			data: daKiem.map(({ dong, kq }) => {
				const trangThai: TrangThaiHang = kq.qua ? "cho" : "bi-loai";
				return {
					...hangTuDongSoan(veDongSoan(dong), ctx.session.id),
					dich: Prisma.DbNull,
					inputHash: lanNop,
					nguoiYeuCau: userId,
					nac: cuoc.nac,
					trangThai,
					maLoai: kq.qua ? null : kq.maLoai,
					hienLuc: null,
				};
			}),
		}),
		db.okrCuocSoan.update({
			where: { id: cuocSoanId },
			data: { lanNopMoiNhat: lanNop },
		}),
	]);
	const biLoai = daKiem.flatMap(({ dong, kq }) =>
		kq.qua
			? []
			: [
					{
						khoa: dong.khoa,
						ten: tenCua(dong),
						maLoai: kq.maLoai,
						viPham: viPhamCua(dong, kiem, kq.maLoai),
					},
				],
	);
	return {
		ketQua: "da-ghi",
		lyDo: "",
		soDong: daKiem.length - biLoai.length,
		biLoai,
		giuNguyen,
	};
}
