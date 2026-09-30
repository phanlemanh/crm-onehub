import { randomUUID } from "node:crypto";
import { setTimeout as cho } from "node:timers/promises";
import { db, Prisma } from "@crm/db";
import { docCuoc, donViAiCuaCuoc } from "@crm/db/okr-cuoc-soan";
import { cauHinhAiLuc } from "@crm/db/okr-tro-ly";
import {
	nacCuaDonVi,
	type TRANG_THAI_DE_XUAT,
} from "@crm/db/okr-tro-ly-danh-muc";
import { type BanNhap, laChoGiuPhien } from "@crm/validation/okr-cuoc-soan";
import {
	type DongKiemSoan,
	kiemBanNhap,
	type MaLoaiBanNhap,
} from "@crm/validation/okr-kiem-ban-nhap";
import { khoaDong } from "@crm/validation/okr-kiem-de-xuat";
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

export type DongBiLoai = { khoa: string; ten: string; maLoai: MaLoaiBanNhap };

type TrangThaiHang = (typeof TRANG_THAI_DE_XUAT)[number];

type TrangThaiDaQuyet = (typeof TRO_LY_OKR_SOAN.trangThaiDaQuyet)[number];

export type DongGiuNguyen = {
	khoa: string;
	ten: string;
	trangThai: TrangThaiDaQuyet;
};

export type KetQuaNop = {
	ketQua: "da-ghi" | "tu-choi";
	lyDo: string;
	soDong: number;
	biLoai: DongBiLoai[];
	giuNguyen: DongGiuNguyen[];
};

const TU_CHOI = TRO_LY_OKR_SOAN.tuChoi;

const tuChoi = (lyDo: string): KetQuaNop => ({
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

async function docKhoaDaQuyet(
	cuocSoanId: string,
): Promise<Map<string, TrangThaiDaQuyet>> {
	const hang = await db.okrDeXuat.findMany({
		where: {
			cuocSoanId,
			trangThai: { in: [...TRO_LY_OKR_SOAN.trangThaiDaQuyet] },
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
	const trangThai = z.enum(TRO_LY_OKR_SOAN.trangThaiDaQuyet);
	return new Map(
		hang.map((h) => [
			khoaDong(dongSoanTuHang(h)),
			trangThai.parse(h.trangThai),
		]),
	);
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
	const dongs = dongTuBanNhap(input, { cuocSoanId, idKr: idKrCua(goi) });
	chanTrungKhoa(dongs);
	const daQuyet = await docKhoaDaQuyet(cuocSoanId);
	const giuNguyen = dongs.flatMap((d) => {
		const trangThai = daQuyet.get(khoaCua(d));
		return trangThai ? [{ khoa: d.khoa, ten: tenCua(d), trangThai }] : [];
	});
	const conLai = dongs.filter((d) => !daQuyet.has(khoaCua(d)));
	const kiem = await goiKiemTu(goi, {
		soNguoiGo: await docSoNguoiGo(ctx.session.id),
	});
	const daKiem = kiemBanNhap(conLai, kiem);
	const lanNop = randomUUID();
	await db.okrDeXuat.createMany({
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
	});
	const biLoai = daKiem.flatMap(({ dong, kq }) =>
		kq.qua ? [] : [{ khoa: dong.khoa, ten: tenCua(dong), maLoai: kq.maLoai }],
	);
	return {
		ketQua: "da-ghi",
		lyDo: "",
		soDong: daKiem.length - biLoai.length,
		biLoai,
		giuNguyen,
	};
}
