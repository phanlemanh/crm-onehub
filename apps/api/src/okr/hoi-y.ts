import { ngayVN } from "@crm/db/onboarding-nhac";
import type {
	KetLuan,
	LoaiChuDe,
	NoiBanTruoc,
	TrangThaiHoiY,
} from "@crm/validation/okr-hoi-y";
import {
	chuanCau,
	KET_LUAN_CHON,
	NOI_MOI,
	noiTuSoCau,
	OKR_HOI_Y,
	thuTuXao,
} from "@crm/validation/okr-hoi-y";
import { mucTieuInput } from "@crm/validation/okr-muc-tieu";
import { OKR_XEM } from "./okr-xem.config";

export function tenYLa(noiDung: string): string {
	let dai = 0;
	const ra: string[] = [];
	for (const kyTu of noiDung) {
		if (dai + kyTu.length > OKR_HOI_Y.tenChuDe.max) break;
		ra.push(kyTu);
		dai += kyTu.length;
	}
	return ra.join("");
}

export type YBangChung = {
	id: string;
	noiDung: string;
	tacGiaUserId: string;
	phongBanId: string | null;
	soDongY: number;
	createdAt: Date;
};

export type BangChungChuDe = {
	soNguoi: number;
	soDonVi: number;
	soDongY: number;
	trich: string[];
};

export function bangChungChuDe(y: YBangChung[]): BangChungChuDe {
	const nguoi = new Set<string>();
	const donVi = new Set<string | null>();
	let soDongY = 0;
	for (const x of y) {
		nguoi.add(x.tacGiaUserId);
		donVi.add(x.phongBanId);
		soDongY += x.soDongY;
	}
	const trich = [...y]
		.sort(
			(a, b) =>
				b.soDongY - a.soDongY ||
				a.createdAt.getTime() - b.createdAt.getTime() ||
				(a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
		)
		.slice(0, OKR_HOI_Y.trich)
		.map((x) => x.noiDung);
	return { soNguoi: nguoi.size, soDonVi: donVi.size, soDongY, trich };
}

export const SO_PHAN_BAN_TRUOC = ["giu", "doi", "bo"] as const;
export type SoPhanBanTruoc = (typeof SO_PHAN_BAN_TRUOC)[number];

export type KetQuaBanTruoc = {
	cau: SoPhanBanTruoc[];
	doi: number;
	them: number;
	boQua: boolean;
};

export function ketQuaBanTruoc(
	ban: { cau: string[]; boQua: boolean },
	chon: { noiBanTruoc: string; cauMucTieu: string }[],
): KetQuaBanTruoc {
	const them = chon.filter((c) => c.noiBanTruoc === NOI_MOI).length;
	if (ban.boQua) {
		return { cau: [], doi: 0, them: chon.length, boQua: true };
	}
	const cau = ban.cau.map((chu, i): SoPhanBanTruoc => {
		const noi = chon.filter((c) => c.noiBanTruoc === noiTuSoCau(i + 1));
		if (noi.length === 0) return "bo";
		const chuan = chuanCau(chu);
		return noi.some((c) => chuanCau(c.cauMucTieu) === chuan) ? "giu" : "doi";
	});
	return {
		cau,
		doi: cau.filter((c) => c === "doi").length,
		them,
		boQua: false,
	};
}

export const LOAI_DON_VI_DO_PHU = [
	"goc",
	"bo-phan",
	"phong-ban",
	"chua-xep",
] as const;
export type LoaiDonViDoPhu = (typeof LOAI_DON_VI_DO_PHU)[number];

export type DonViDoPhu = {
	id: string;
	loai: LoaiDonViDoPhu;
	cha: string | null;
};

export type DoPhuVao = {
	ngay: string[];
	donVi: DonViDoPhu[];
	nguoi: { id: string; phongBanChinh: string | null }[];
	gop: { tacGiaUserId: string; ngayVN: string }[];
};

export type DoPhuRa = { hang: { id: string; giaTri: number[] }[] };

const motChuSo = (x: number): number => Math.round(x * 10) / 10;

function thanhVienCuaDonVi(
	donVi: DonViDoPhu[],
	nguoi: DoPhuVao["nguoi"],
): Map<string, string[]> {
	const theoId = new Map(donVi.map((d) => [d.id, d]));
	const chuaXep = donVi.filter((d) => d.loai === "chua-xep");
	const gocIds = donVi.filter((d) => d.loai === "goc").map((d) => d.id);

	function chuoiDonVi(phongBanChinh: string | null): Set<string> {
		const chuoi = new Set<string>();
		if (phongBanChinh === null) {
			for (const d of chuaXep) chuoi.add(d.id);
			return chuoi;
		}
		let id: string | null = phongBanChinh;
		while (id !== null && !chuoi.has(id)) {
			chuoi.add(id);
			id = theoId.get(id)?.cha ?? null;
		}
		return chuoi;
	}

	const thanhVien = new Map<string, string[]>(donVi.map((d) => [d.id, []]));
	for (const n of nguoi) {
		const chuoi = chuoiDonVi(n.phongBanChinh);
		for (const id of gocIds) chuoi.add(id);
		for (const id of chuoi) thanhVien.get(id)?.push(n.id);
	}
	return thanhVien;
}

export function doPhu(input: DoPhuVao): DoPhuRa {
	const ngayDauTien = new Map<string, string>();
	for (const g of input.gop) {
		const cu = ngayDauTien.get(g.tacGiaUserId);
		if (cu === undefined || g.ngayVN < cu) {
			ngayDauTien.set(g.tacGiaUserId, g.ngayVN);
		}
	}

	const thanhVien = thanhVienCuaDonVi(input.donVi, input.nguoi);

	return {
		hang: input.donVi.map((d) => {
			const ai = thanhVien.get(d.id) ?? [];
			return {
				id: d.id,
				giaTri: input.ngay.map((ngay) => {
					if (ai.length === 0) return 0;
					const daGop = ai.filter((id) => {
						const dau = ngayDauTien.get(id);
						return dau !== undefined && dau <= ngay;
					}).length;
					return motChuSo((100 * daGop) / ai.length);
				}),
			};
		}),
	};
}

export function cacNgayVN(tu: Date, den: Date): string[] {
	const ra: string[] = [];
	const cuoi = ngayVN(den);
	for (let ngay = ngayVN(tu); ngay <= cuoi; ngay = congNgay(ngay))
		ra.push(ngay);
	return ra;
}

function congNgay(ngay: string): string {
	return new Date(Date.parse(`${ngay}T00:00:00Z`) + OKR_XEM.thoiGian.ngayMs)
		.toISOString()
		.slice(0, 10);
}

export type DonViCoNhan = DonViDoPhu & { nhan: string };

export type HangDoPhu = DonViCoNhan & { giaTri: (number | null)[] };

export type BangDoPhu = {
	cot: { ngay: string; nhan: string }[];
	hang: HangDoPhu[];
};

export type BangDoPhuVao = {
	tu: Date;
	den: Date;
	donVi: DonViCoNhan[];
	nguoi: DoPhuVao["nguoi"];
	gop: { tacGiaUserId: string; luc: Date }[];
};

export type CayDoPhu = {
	divisions: {
		id: string;
		name: string;
		departments: { id: string; name: string }[];
	}[];
	chuaXep: { id: string; name: string }[];
	people: { id: string; primaryDepartmentId: string | null }[];
};

export function donViTuCay(cay: CayDoPhu, tenGoc: string): DonViCoNhan[] {
	const goc = OKR_HOI_Y.doPhu.idGoc;
	return [
		{ id: goc, nhan: tenGoc, loai: "goc", cha: null },
		...cay.divisions.map(
			(b): DonViCoNhan => ({
				id: b.id,
				nhan: b.name,
				loai: "bo-phan",
				cha: goc,
			}),
		),
		...cay.divisions.flatMap((b) =>
			b.departments.map(
				(p): DonViCoNhan => ({
					id: p.id,
					nhan: p.name,
					loai: "phong-ban",
					cha: b.id,
				}),
			),
		),
		...cay.chuaXep.map(
			(p): DonViCoNhan => ({
				id: p.id,
				nhan: p.name,
				loai: "phong-ban",
				cha: goc,
			}),
		),
		{
			id: OKR_HOI_Y.doPhu.idChuaXep,
			nhan: OKR_HOI_Y.doPhu.nhanChuaXep,
			loai: "chua-xep",
			cha: goc,
		},
	];
}

export function nguoiTinhDoPhu(
	people: CayDoPhu["people"],
	nguoiChonUserId: string,
): DoPhuVao["nguoi"] {
	return people
		.filter((n) => n.id !== nguoiChonUserId)
		.map((n) => ({ id: n.id, phongBanChinh: n.primaryDepartmentId }));
}

function nhanNgay(ngay: string): string {
	const [, thang, ngayTrongThang] = ngay.split("-");
	return `${ngayTrongThang}/${thang}`;
}

export function bangDoPhu(input: BangDoPhuVao): BangDoPhu {
	const ngay = cacNgayVN(input.tu, input.den);
	const ra = doPhu({
		ngay,
		donVi: input.donVi,
		nguoi: input.nguoi,
		gop: input.gop.map((g) => ({
			tacGiaUserId: g.tacGiaUserId,
			ngayVN: ngayVN(g.luc),
		})),
	});
	const thanhVien = thanhVienCuaDonVi(input.donVi, input.nguoi);
	const giaTri = new Map(ra.hang.map((h) => [h.id, h.giaTri]));
	return {
		cot: ngay.map((n) => ({ ngay: n, nhan: nhanNgay(n) })),
		hang: input.donVi.map((d) => ({
			...d,
			giaTri:
				(thanhVien.get(d.id)?.length ?? 0) === 0
					? ngay.map(() => null)
					: (giaTri.get(d.id) ?? []),
		})),
	};
}

export const MA_THIEU = [
	"chua-niem-phong",
	"y-chua-gom",
	"chu-de-rong",
	"thieu-ket-luan",
	"thieu-ly-do",
	"thieu-cau-muc-tieu",
	"thieu-noi-ban-truoc",
	"khong-chon",
	"vuot-tran",
] as const;
export type MaThieu = (typeof MA_THIEU)[number];

export type ChuDeCongBo = {
	id: string;
	loai: LoaiChuDe;
	ten: string;
	soY: number;
	ketLuan: string | null;
	lyDo: string;
	cauMucTieu: string;
	noiBanTruoc: string | null;
};

export type TinhTrangCongBo = {
	coBanTruoc: boolean;
	boQua: boolean;
	yChuaGom: number;
	chuDe: ChuDeCongBo[];
	tongOneHubSau: number;
	objectiveCap: number;
	capMode: "chan" | "canh-bao";
};

export type TinhTrangVao = {
	ban: { boQua: boolean } | null;
	yChuaGom: number;
	chuDe: ChuDeCongBo[];
	soMucTieuHienCo: number;
	objectiveCap: number;
	capMode: "chan" | "canh-bao";
};

export function tinhTrangCongBo(vao: TinhTrangVao): TinhTrangCongBo {
	const soChon = vao.chuDe.filter((c) => c.ketLuan === KET_LUAN_CHON).length;
	return {
		coBanTruoc: vao.ban !== null && !vao.ban.boQua,
		boQua: vao.ban?.boQua ?? false,
		yChuaGom: vao.yChuaGom,
		chuDe: vao.chuDe,
		tongOneHubSau: vao.soMucTieuHienCo + soChon,
		objectiveCap: vao.objectiveCap,
		capMode: vao.capMode,
	};
}

export function lyDoChuaCongBo(
	s: TinhTrangCongBo,
): { ma: MaThieu; chuDeId: string | null }[] {
	const ra: { ma: MaThieu; chuDeId: string | null }[] = [];
	const chungCuoc = (ma: MaThieu) => ra.push({ ma, chuDeId: null });
	const moiChuDe = (ma: MaThieu, thieu: (c: ChuDeCongBo) => boolean) => {
		for (const c of s.chuDe) if (thieu(c)) ra.push({ ma, chuDeId: c.id });
	};
	const chon = (c: ChuDeCongBo) => c.ketLuan === KET_LUAN_CHON;

	if (!s.coBanTruoc && !s.boQua) chungCuoc("chua-niem-phong");
	if (s.yChuaGom > 0) chungCuoc("y-chua-gom");
	moiChuDe("chu-de-rong", (c) => c.soY === 0);
	moiChuDe("thieu-ket-luan", (c) => c.ketLuan === null);
	moiChuDe("thieu-ly-do", (c) => {
		if (c.ketLuan === null) return false;
		const dai = c.lyDo.trim().length;
		const tran = chon(c) ? OKR_HOI_Y.ketLuan.lyDoChonMax : OKR_HOI_Y.lyDo.max;
		return dai < OKR_HOI_Y.lyDo.min || dai > tran;
	});
	moiChuDe(
		"thieu-cau-muc-tieu",
		(c) => chon(c) && !mucTieuInput.shape.title.safeParse(c.cauMucTieu).success,
	);
	moiChuDe(
		"thieu-noi-ban-truoc",
		(c) => chon(c) && !s.boQua && c.noiBanTruoc === null,
	);
	const rong = s.yChuaGom === 0 && s.chuDe.length === 0;
	if (!rong && !s.chuDe.some(chon)) chungCuoc("khong-chon");
	if (s.capMode === "chan" && s.tongOneHubSau > s.objectiveCap) {
		chungCuoc("vuot-tran");
	}
	return ra;
}

export type YTho = {
	id: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
	chuDeId: string | null;
	tacGiaUserId: string;
	tacGiaTen: string;
	phongBanId: string | null;
	soDongY: number;
	daDongY: boolean;
	createdAt: Date;
};

export type YChieuAn = {
	id: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
	chuDeId: string | null;
	daDongY: boolean;
};

export type YChieuDayDu = YChieuAn & {
	tacGia: { id: string; ten: string };
	soDongY: number;
	createdAt: Date;
};

export type YChieu = YChieuAn | YChieuDayDu;

export type YChieuRa = { khoa: boolean; y: YChieu[] };

export type NguoiXemY = {
	userId: string;
	laQuanTri: boolean;
	laNguoiChon: boolean;
	daNiemPhong: boolean;
	hoiYId: string;
	trangThai: TrangThaiHoiY;
};

const chieuAn = (y: YTho, chuDeId: string | null): YChieuAn => ({
	id: y.id,
	noiDung: y.noiDung,
	viSao: y.viSao,
	doBangGi: y.doBangGi,
	chuDeId,
	daDongY: y.daDongY,
});

const chieuDayDu = (y: YTho): YChieuDayDu => ({
	...chieuAn(y, y.chuDeId),
	tacGia: { id: y.tacGiaUserId, ten: y.tacGiaTen },
	soDongY: y.soDongY,
	createdAt: y.createdAt,
});

function thayDayDu(xem: NguoiXemY): boolean {
	return (
		(xem.laNguoiChon && xem.laQuanTri && xem.daNiemPhong) ||
		(xem.laQuanTri && !xem.laNguoiChon)
	);
}

export function chieuYChoNguoiXem(y: YTho[], xem: NguoiXemY): YChieuRa {
	if (xem.laNguoiChon && !xem.daNiemPhong) return { khoa: true, y: [] };
	if (thayDayDu(xem)) {
		const theoTao = [...y].sort(
			(a, b) =>
				a.createdAt.getTime() - b.createdAt.getTime() ||
				(a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
		);
		return { khoa: false, y: theoTao.map(chieuDayDu) };
	}
	const thayChuDe = xem.trangThai === "da-cong-bo";
	const cuaNguoiKhac = y.filter((x) => x.tacGiaUserId !== xem.userId);
	const theoId = new Map(cuaNguoiKhac.map((x) => [x.id, x]));
	const thuTu = thuTuXao(
		cuaNguoiKhac.map((x) => x.id),
		`${xem.hoiYId}:${xem.userId}`,
	);
	return {
		khoa: false,
		y: thuTu.flatMap((id) => {
			const x = theoId.get(id);
			return x ? [chieuAn(x, thayChuDe ? x.chuDeId : null)] : [];
		}),
	};
}

export type ChuDeTho = {
	id: string;
	loai: LoaiChuDe;
	ten: string;
	ketLuan: KetLuan | null;
	lyDo: string;
	cauMucTieu: string;
	noiBanTruoc: NoiBanTruoc | null;
	objectiveId: string | null;
	viTri: number;
};

export type BangChungChieu = Omit<BangChungChuDe, "soDongY"> & {
	soDongY?: number;
};

export type ChuDeChieu = Omit<ChuDeTho, "viTri" | "cauMucTieu"> & {
	cauMucTieu: string | null;
	bangChung: BangChungChieu;
	y: YChieu[];
};

export function chieuChuDeChoNguoiXem(
	chuDe: ChuDeTho[],
	y: YTho[],
	xem: NguoiXemY,
): ChuDeChieu[] | null {
	const daCongBo = xem.trangThai === "da-cong-bo";
	const dangGom = xem.trangThai === "dang-gom" && thayDayDu(xem);
	if (!daCongBo && !dangGom) return null;
	const day = thayDayDu(xem);
	const thayNoiBanTruoc = daCongBo || xem.laNguoiChon;
	return [...chuDe]
		.sort(
			(a, b) => a.viTri - b.viTri || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
		)
		.map((c) => {
			const cua = y.filter((x) => x.chuDeId === c.id);
			const { soDongY, ...khongDem } = bangChungChuDe(
				cua.map((x) => ({
					id: x.id,
					noiDung: x.noiDung,
					tacGiaUserId: x.tacGiaUserId,
					phongBanId: x.phongBanId,
					soDongY: x.soDongY,
					createdAt: x.createdAt,
				})),
			);
			return {
				id: c.id,
				loai: c.loai,
				ten: c.ten,
				ketLuan: c.ketLuan,
				lyDo: c.lyDo,
				cauMucTieu: thayNoiBanTruoc ? c.cauMucTieu : null,
				noiBanTruoc: thayNoiBanTruoc ? c.noiBanTruoc : null,
				objectiveId: c.objectiveId,
				bangChung: day ? { ...khongDem, soDongY } : khongDem,
				y: chieuYChoNguoiXem(cua, xem).y,
			};
		});
}

export type BanTruocTho = {
	cau: string[];
	boQua: boolean;
	vietBoi: string;
};

export function docBanTruoc(
	ban: BanTruocTho | null,
	xem: { laNguoiChon: boolean; trangThai: TrangThaiHoiY },
): BanTruocTho | null {
	if (ban === null) return null;
	if (xem.laNguoiChon || xem.trangThai === "da-cong-bo") return ban;
	return null;
}

export type YCuaToiTho = {
	id: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
	chuDeId: string | null;
	createdAt: Date;
	ganLuc: Date | null;
};

export type YCuaToiChieu = {
	id: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
	createdAt: string;
	chuDe: { id: string; ten: string } | null;
	ketLuan: KetLuan | null;
	lyDo: string | null;
	objectiveId: string | null;
	hanhTrinh: {
		gopLuc: string;
		vaoChuDeLuc: string | null;
		ketLuanLuc: string | null;
	};
};

export function chieuYCuaToi(
	y: YCuaToiTho[],
	chuDe: ChuDeTho[],
	xem: { trangThai: TrangThaiHoiY; congBoLuc: Date | null },
): YCuaToiChieu[] {
	const daCongBo = xem.trangThai === "da-cong-bo";
	const theoId = new Map(chuDe.map((c) => [c.id, c]));
	return y.map((x) => {
		const c = daCongBo && x.chuDeId !== null ? theoId.get(x.chuDeId) : null;
		return {
			id: x.id,
			noiDung: x.noiDung,
			viSao: x.viSao,
			doBangGi: x.doBangGi,
			createdAt: x.createdAt.toISOString(),
			chuDe: c ? { id: c.id, ten: c.ten } : null,
			ketLuan: c ? c.ketLuan : null,
			lyDo: c ? c.lyDo : null,
			objectiveId: c ? c.objectiveId : null,
			hanhTrinh: {
				gopLuc: x.createdAt.toISOString(),
				vaoChuDeLuc: c ? (x.ganLuc?.toISOString() ?? null) : null,
				ketLuanLuc: c ? (xem.congBoLuc?.toISOString() ?? null) : null,
			},
		};
	});
}

export type KetQuaChieu = KetQuaBanTruoc & {
	vietBoi: string;
	chon: {
		chuDeId: string;
		ten: string;
		cauMucTieu: string;
		noiBanTruoc: NoiBanTruoc;
		objectiveId: string | null;
	}[];
};

export function ketQuaCongBo(
	ban: BanTruocTho | null,
	chuDe: ChuDeTho[],
	trangThai: TrangThaiHoiY,
): KetQuaChieu | null {
	if (trangThai !== "da-cong-bo" || ban === null) return null;
	const chon = [...chuDe]
		.filter((c) => c.ketLuan === KET_LUAN_CHON)
		.sort(
			(a, b) => a.viTri - b.viTri || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
		)
		.map((c) => ({
			chuDeId: c.id,
			ten: c.ten,
			cauMucTieu: c.cauMucTieu,
			noiBanTruoc: c.noiBanTruoc ?? NOI_MOI,
			objectiveId: c.objectiveId,
		}));
	return {
		...ketQuaBanTruoc(ban, chon),
		vietBoi: ban.vietBoi,
		chon,
	};
}
