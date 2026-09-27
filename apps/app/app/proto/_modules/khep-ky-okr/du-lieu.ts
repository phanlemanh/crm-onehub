import { type LoaiMucTieu, NGUOI, type NguoiMau } from "../ban-mau-okr/du-lieu";

export type KieuKrMau =
	| "tang-toi"
	| "giam-xuong"
	| "giu-tren"
	| "giu-duoi"
	| "moc"
	| "phan-tram";

export type DoiDichMau = {
	ngay: string;
	truoc: number;
	sau: number;
	lyDo: string;
};

export type KrChamMau = {
	id: string;
	ten: string;
	kieu: KieuKrMau;
	phuTrach: NguoiMau;
	khoiDiem: number;
	dich: number;
	soChot: number;
	donVi: string;
	diemGoiY: number;
	diem: number | null;
	lyDo: string | null;
	doiDichNgoaiRa: DoiDichMau[];
	suaDuoc: boolean;
};

export type MucTieuChamMau = {
	id: string;
	ten: string;
	loai: LoaiMucTieu;
	phuTrach: NguoiMau;
	kr: KrChamMau[];
	dieuHocDuoc: string;
	mangSangToi: string | null;
};

export const KY_CHAM = {
	ten: "Quý 4 · 2026",
	ke: "Quý 1 · 2027",
	cuoiKy: "31/12/2026",
	sangCham: "04/01/2027",
	raTu: "16/11",
	raDen: "22/11",
} as const;

export const MT_CAM_KET: MucTieuChamMau = {
	id: "c1",
	ten: "Đối tác mới được đỡ trọn tháng đầu",
	loai: "cam-ket",
	phuTrach: NGUOI.thao,
	kr: [
		{
			id: "c1k1",
			ten: "Thời gian phản hồi đối tác, trung vị",
			kieu: "giam-xuong",
			phuTrach: NGUOI.nga,
			khoiDiem: 8,
			dich: 2,
			soChot: 1.8,
			donVi: "giờ",
			diemGoiY: 1,
			diem: 1,
			lyDo: null,
			doiDichNgoaiRa: [],
			suaDuoc: true,
		},
		{
			id: "c1k2",
			ten: "Đối tác chấm hài lòng từ 4/5",
			kieu: "tang-toi",
			phuTrach: NGUOI.nga,
			khoiDiem: 60,
			dich: 80,
			soChot: 78,
			donVi: "%",
			diemGoiY: 0.9,
			diem: null,
			lyDo: null,
			doiDichNgoaiRa: [
				{
					ngay: "03/12",
					truoc: 85,
					sau: 80,
					lyDo: "Hai công ty lớn chuyển sang gói tự phục vụ, không chấm nữa.",
				},
			],
			suaDuoc: true,
		},
		{
			id: "c1k3",
			ten: "Bộ câu hỏi thường gặp công bố cho đối tác",
			kieu: "moc",
			phuTrach: NGUOI.nga,
			khoiDiem: 0,
			dich: 1,
			soChot: 0,
			donVi: "",
			diemGoiY: 0,
			diem: null,
			lyDo: null,
			doiDichNgoaiRa: [],
			suaDuoc: true,
		},
		{
			id: "c1k4",
			ten: "Công ty mới có buổi gặp tuần đầu",
			kieu: "phan-tram",
			phuTrach: NGUOI.thao,
			khoiDiem: 0,
			dich: 100,
			soChot: 82,
			donVi: "%",
			diemGoiY: 0.8,
			diem: null,
			lyDo: null,
			doiDichNgoaiRa: [],
			suaDuoc: false,
		},
	],
	dieuHocDuoc: "",
	mangSangToi: null,
};

export const MT_THAM_VONG: MucTieuChamMau = {
	id: "c2",
	ten: "Đội tự đọc được số của mình mỗi tuần",
	loai: "tham-vong",
	phuTrach: NGUOI.thao,
	kr: [
		{
			id: "c2k1",
			ten: "Báo cáo tuần tự dựng từ CRM",
			kieu: "tang-toi",
			phuTrach: NGUOI.nga,
			khoiDiem: 0,
			dich: 12,
			soChot: 9,
			donVi: "báo cáo",
			diemGoiY: 0.8,
			diem: 0.7,
			lyDo: "Ba báo cáo cuối dựng tay một nửa, chưa tự dựng hẳn.",
			doiDichNgoaiRa: [],
			suaDuoc: true,
		},
		{
			id: "c2k2",
			ten: "Người trong phòng tự mở bảng số mỗi tuần",
			kieu: "tang-toi",
			phuTrach: NGUOI.thao,
			khoiDiem: 2,
			dich: 9,
			soChot: 6,
			donVi: "người",
			diemGoiY: 0.6,
			diem: 0.6,
			lyDo: null,
			doiDichNgoaiRa: [],
			suaDuoc: true,
		},
	],
	dieuHocDuoc:
		"Khuôn báo cáo đầu tiên mất ba tuần vì chờ quyền đọc thoả thuận. Quý sau xin quyền trước khi đặt KR.",
	mangSangToi: null,
};

export function daChamHet(mt: MucTieuChamMau): MucTieuChamMau {
	return {
		...mt,
		kr: mt.kr.map((k) => ({ ...k, diem: k.diem ?? k.diemGoiY })),
	};
}

export function diemMucTieu(mt: MucTieuChamMau): number | null {
	if (mt.kr.some((k) => k.diem === null)) return null;
	const tong = mt.kr.reduce((s, k) => s + (k.diem ?? 0), 0);
	return Math.round((tong / mt.kr.length) * 100) / 100;
}

export function cauDoc(loai: LoaiMucTieu, diem: number): string {
	if (loai === "tham-vong")
		return diem >= 0.7
			? "Tốt — với mục tiêu tham vọng, 0,7 là tốt"
			: "Dưới mức tốt 0,7 của mục tiêu tham vọng";
	return diem >= 1 ? "Đạt cam kết" : "Cam kết chưa trọn";
}

export const LUOI_DIEM = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

export function diemChu(d: number): string {
	return d.toLocaleString("vi-VN", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 2,
	});
}

export const CHUA_CHAM_THEO_DON_VI = [
	{ donVi: "Chăm sóc khách hàng", conLai: 3 },
	{ donVi: "Kinh doanh 2", conLai: 5 },
	{ donVi: "Kế toán", conLai: 1 },
] as const;
