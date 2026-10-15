import {
	CAY_DON_VI,
	CHUA_XEP,
	type DonViMau,
	type KrMau,
	MT_VANHANH,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
	NGUOI,
	type NguoiMau,
} from "../ban-mau-okr/du-lieu";
import { tienDo, tinhTrang } from "../ban-mau-okr/phan-chung";

export const DUONG = "/proto/trang-don-vi-mot-bang";

/* Hai mục tiêu thêm cho Chăm sóc khách hàng để bảng có đủ ca: một mục tiêu
   chưa góp vào đâu có KR trượt (rơi vào cả «Cần bàn» lẫn «Chưa góp vào đâu»),
   và một mục tiêu nháp chưa có KR (không có mũi tên mở). */
const MT_CSKH_3: MucTieuMau = {
	id: "c3",
	ten: "Đối tác được trả lời trong một giờ làm việc",
	donVi: "Chăm sóc khách hàng",
	loai: "cam-ket",
	phuTrach: NGUOI.thao,
	gopVao: [],
	kr: [
		{
			id: "c3k1",
			ten: "Phiếu hỗ trợ được trả lời trong một giờ",
			phuTrach: NGUOI.thao,
			kieu: "so",
			khoiDiem: 40,
			dich: 90,
			hienTai: 45,
			donVi: "%",
			tuTin: "thap",
			capNhatLuc: "16/11",
			ghiChu: null,
			imNgay: 14,
		},
	],
};

const MT_CSKH_4: MucTieuMau = {
	id: "c4",
	ten: "Sổ tay hỗ trợ đối tác dùng chung",
	donVi: "Chăm sóc khách hàng",
	loai: "cam-ket",
	phuTrach: NGUOI.nga,
	gopVao: [{ donVi: "Vận hành", mucTieu: MT_VANHANH.ten, kr: null }],
	kr: [],
};

export const NHAP = new Set(["c4"]);

export const DA_BO = new Map([
	["cskh", ["Khảo sát hài lòng đối tác hằng tháng"]],
]);

const MUC_TIEU = new Map<string, MucTieuMau[]>(MUC_TIEU_CUA_DON_VI);
MUC_TIEU.set("cskh", [
	...(MUC_TIEU_CUA_DON_VI.get("cskh") ?? []),
	MT_CSKH_3,
	MT_CSKH_4,
]);

export type TomTatDonVi = {
	mucTieu: MucTieuMau[];
	soKr: number;
	tienDoTb: number | null;
};

export function tomTat(id: string): TomTatDonVi {
	const mucTieu = MUC_TIEU.get(id) ?? [];
	const kr = mucTieu.flatMap((mt) => mt.kr);
	return {
		mucTieu,
		soKr: kr.length,
		tienDoTb:
			kr.length === 0
				? null
				: Math.round(kr.reduce((t, k) => t + tienDo(k), 0) / kr.length),
	};
}

export type LoaiDon = "cty" | "bp" | "pb" | "nguoi";

export type DonViPhang = {
	id: string;
	ten: string;
	loai: LoaiDon;
	truong: NguoiMau | null;
	chaId: string | null;
	duong: string[];
	con: string[];
	chuaXep: boolean;
	tt: TomTatDonVi;
};

const LOAI_THEO_CAP = {
	goc: "cty",
	"bo-phan": "bp",
	"phong-ban": "pb",
} satisfies Record<DonViMau["cap"], LoaiDon>;

function phang(
	d: DonViMau,
	chaId: string | null,
	duong: string[],
	chuaXep = false,
): DonViPhang[] {
	const conChuaXep = chaId === null ? CHUA_XEP : [];
	return [
		{
			id: d.id,
			ten: d.ten,
			loai: LOAI_THEO_CAP[d.cap],
			truong: d.truong,
			chaId,
			duong,
			con: [...d.con, ...conChuaXep].map((c) => c.id),
			chuaXep,
			tt: tomTat(d.id),
		},
		...d.con.flatMap((c) => phang(c, d.id, [...duong, d.ten])),
		...conChuaXep.flatMap((c) => phang(c, d.id, [...duong, d.ten], true)),
	];
}

export const DON_VI = phang(CAY_DON_VI, null, []);

export function donVi(id: string): DonViPhang {
	const d = DON_VI.find((x) => x.id === id);
	if (!d) throw new Error(`thiếu đơn vị mẫu ${id}`);
	return d;
}

export function thuoc(dv: DonViPhang): string {
	return dv.duong.length === 0 ? "cả công ty" : `Thuộc ${dv.duong.join(" › ")}`;
}

/* Đơn vị người: một người là một lựa chọn của ô chọn khi đường dẫn mang
   `donOkr=nguoi:<id>`. Mục tiêu của người là mục tiêu người đó phụ trách. */
export type NguoiPhang = {
	nguoi: NguoiMau;
	phongBan: string;
	quanLy: string;
};

export const NGUOI_DON = new Map<string, NguoiPhang>([
	[
		"thao",
		{
			nguoi: NGUOI.thao,
			phongBan: "Chăm sóc khách hàng",
			quanLy: NGUOI.son.ten,
		},
	],
]);

export function mucTieuCua(id: string): MucTieuMau[] {
	return MUC_TIEU.get(id) ?? [];
}

export function mucTieuCuaNguoi(nguoiId: string): MucTieuMau[] {
	return [...MUC_TIEU.values()].flatMap((ds) =>
		ds.filter((mt) => mt.phuTrach.id === nguoiId),
	);
}

export type KrCuaNguoi = { kr: KrMau; mucTieu: MucTieuMau };

export function krCuaNguoi(nguoiId: string): KrCuaNguoi[] {
	return [...MUC_TIEU.values()].flatMap((ds) =>
		ds.flatMap((mt) =>
			mt.kr
				.filter((k) => k.phuTrach.id === nguoiId)
				.map((kr) => ({ kr, mucTieu: mt })),
		),
	);
}

export function tienDoMucTieu(mt: MucTieuMau): number {
	return Math.round(
		mt.kr.reduce((t, k) => t + tienDo(k), 0) / Math.max(1, mt.kr.length),
	);
}

/* «N KR chậm» dưới tên mục tiêu: KR số (không phải mốc) đang chậm nhịp hoặc
   trượt. «Cần bàn» dùng đúng phép đếm này (khuyến nghị Hỏi-1). */
export function soKrCham(mt: MucTieuMau): number {
	return mt.kr.filter(
		(k) => k.kieu !== "moc" && tinhTrang(tienDo(k), mt.loai).tone !== "success",
	).length;
}

export function canBan(mt: MucTieuMau): boolean {
	return soKrCham(mt) > 0;
}

export function chuaGop(laCongTy: boolean, mt: MucTieuMau): boolean {
	return !laCongTy && mt.gopVao.length === 0;
}

/* Bậc tình trạng để sắp xếp: trượt → chậm nhịp → đúng nhịp → chưa có kỳ vọng. */
export function bacTinhTrang(mt: MucTieuMau): number {
	if (mt.kr.length === 0) return 3;
	const tone = tinhTrang(tienDoMucTieu(mt), mt.loai).tone;
	return tone === "error" ? 0 : tone === "warning" ? 1 : 2;
}

export function maDon(dv: DonViPhang): string {
	return dv.loai === "cty" ? "cty" : `${dv.loai}:${dv.id}`;
}

export function duongTrang(state: string, donOkr: string | null): string {
	const q = new URLSearchParams({ state });
	if (donOkr) q.set("donOkr", donOkr);
	q.set("kyOkr", "q4-2026");
	return `${DUONG}?${q}`;
}

export function boDau(s: string): string {
	return s
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}
