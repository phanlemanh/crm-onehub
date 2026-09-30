import { db, Prisma } from "@crm/db";
import { docCuoc } from "@crm/db/okr-cuoc-soan";
import { cauHinhAiLuc } from "@crm/db/okr-tro-ly";
import {
	nacCuaDonVi,
	type TRANG_THAI_DE_XUAT,
} from "@crm/db/okr-tro-ly-danh-muc";
import type { BanNhap } from "@crm/validation/okr-cuoc-soan";
import {
	type DongKiemSoan,
	kiemBanNhap,
	type MaLoaiBanNhap,
} from "@crm/validation/okr-kiem-ban-nhap";
import { khoaDong } from "@crm/validation/okr-kiem-de-xuat";
import { type DongSoan, hangTuDongSoan } from "@crm/validation/okr-tro-ly";
import { TRO_LY_OKR_SOAN } from "./config";
import { type GoiSoan, goiKiemTu, goiSoan } from "./goi-soan";
import { type NguCanhPhien, thuocTinhPhien } from "./phien";
import { docSoNguoiGo } from "./so-nguoi-go";

export type DongBiLoai = { khoa: string; ten: string; maLoai: MaLoaiBanNhap };

export type KetQuaNop = {
	ketQua: "da-ghi" | "tu-choi";
	lyDo: string;
	soDong: number;
	biLoai: DongBiLoai[];
};

type TrangThaiHang = (typeof TRANG_THAI_DE_XUAT)[number];

const TU_CHOI = TRO_LY_OKR_SOAN.tuChoi;

const tuChoi = (lyDo: string): KetQuaNop => ({
	ketQua: "tu-choi",
	lyDo,
	soDong: 0,
	biLoai: [],
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

function chanTrungKhoa(dongs: readonly DongKiemSoan[]): void {
	const da = new Set<string>();
	for (const d of dongs) {
		const k = khoaDong(veDongSoan(d));
		if (da.has(k)) throw new Error(`${TU_CHOI.dongTrungKhoa}: ${d.khoa}`);
		da.add(k);
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
	const ky = await db.okrCycle.findUniqueOrThrow({
		where: { id: cuoc.cycleId },
		select: { phase: true },
	});
	if (ky.phase !== "lap-ke-hoach") return tuChoi(TU_CHOI.chuKyKhongLapKeHoach);
	const nac = nacCuaDonVi(await cauHinhAiLuc(db), "soan", {
		onehub: cuoc.level === "onehub",
		boPhanId: cuoc.divisionId,
		phongBanId: cuoc.departmentId,
	});
	if (nac !== "bat" && nac !== "an") return tuChoi(TU_CHOI.donViChuaBat);
	const goi = await goiSoan(cuocSoanId, { vai });
	if (!goi) return tuChoi(TU_CHOI.cuocKhongDang);
	const dongs = dongTuBanNhap(input, { cuocSoanId, idKr: idKrCua(goi) });
	chanTrungKhoa(dongs);
	const kiem = await goiKiemTu(goi, {
		soNguoiGo: await docSoNguoiGo(ctx.session.id),
	});
	const daKiem = kiemBanNhap(dongs, kiem);
	await db.okrDeXuat.createMany({
		data: daKiem.map(({ dong, kq }) => {
			const trangThai: TrangThaiHang = kq.qua ? "cho" : "bi-loai";
			return {
				...hangTuDongSoan(veDongSoan(dong), ctx.session.id),
				dich: Prisma.DbNull,
				inputHash: cuocSoanId,
				nguoiYeuCau: userId,
				nac: cuoc.nac,
				trangThai,
				maLoai: kq.qua ? null : kq.maLoai,
				hienLuc: kq.qua ? new Date() : null,
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
	};
}
