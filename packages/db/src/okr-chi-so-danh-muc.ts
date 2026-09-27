export const PHAM_VI_CHI_SO = [
	"toan-cong-ty",
	"bo-phan",
	"phong-ban",
	"nguoi",
] as const;
export type KieuPhamVi = (typeof PHAM_VI_CHI_SO)[number];

export const BAC_GHI_DANH = [
	"tai-khoan",
	"khoa-hoc",
	"hoat-dong",
	"giao-dich-dau",
] as const;
export type BacGhiDanh = (typeof BAC_GHI_DANH)[number];

type DinhNghia = {
	donVi: "thoa-thuan" | "cuoc-goi" | "buoc" | "ca-nhan" | "thu";
	ngayKy: string;
	quyCong: string;
	banGhi: "deal" | "contact" | "plan" | "email";
	phamVi: readonly KieuPhamVi[];
};

export const CHI_SO_OKR = {
	"thoa-thuan-chot-duoc": {
		donVi: "thoa-thuan",
		ngayKy: "closedAt",
		quyCong: "nguoi-phu-trach-thoa-thuan",
		banGhi: "deal",
		phamVi: PHAM_VI_CHI_SO,
	},
	"thoa-thuan-moi": {
		donVi: "thoa-thuan",
		ngayKy: "createdAt",
		quyCong: "nguoi-phu-trach-thoa-thuan",
		banGhi: "deal",
		phamVi: PHAM_VI_CHI_SO,
	},
	"goi-hen-duoc": {
		donVi: "cuoc-goi",
		ngayKy: "createdAt",
		quyCong: "nguoi-goi",
		banGhi: "contact",
		phamVi: PHAM_VI_CHI_SO,
	},
	"buoc-xong-dung-han": {
		donVi: "buoc",
		ngayKy: "completedAt",
		quyCong: "phong-ban-cua-buoc",
		banGhi: "plan",
		phamVi: PHAM_VI_CHI_SO,
	},
	"ghi-danh-dat-bac": {
		donVi: "ca-nhan",
		ngayKy: "ngay-dat-bac",
		quyCong: "nguoi-cam-trich",
		banGhi: "contact",
		phamVi: PHAM_VI_CHI_SO,
	},
	"form-thanh-ca-nhan": {
		donVi: "ca-nhan",
		ngayKy: "filedAt",
		quyCong: "nguoi-phu-trach-ca-nhan",
		banGhi: "contact",
		phamVi: PHAM_VI_CHI_SO,
	},
	"email-gui-ra": {
		donVi: "thu",
		ngayKy: "sentAt",
		quyCong: "nguoi-gui",
		banGhi: "email",
		phamVi: PHAM_VI_CHI_SO,
	},
} as const satisfies { [ma: string]: DinhNghia };

export type MaChiSo = keyof typeof CHI_SO_OKR;
export const MA_CHI_SO = Object.keys(CHI_SO_OKR) as [MaChiSo, ...MaChiSo[]];

export type PhamViDem =
	| { kieu: "toan-cong-ty" }
	| { kieu: Exclude<KieuPhamVi, "toan-cong-ty">; id: string };

export type DinhNghiaDem = {
	chiSo: MaChiSo;
	phamVi: PhamViDem;
	bac?: BacGhiDanh | undefined;
};

export type NguonDem = {
	chiSo: MaChiSo | null;
	phamVi: PhamViDem | null;
	bac: BacGhiDanh | null;
};
