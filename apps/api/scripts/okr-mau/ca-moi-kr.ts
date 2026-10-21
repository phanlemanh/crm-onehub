import type { TinhTrangKr } from "../../src/okr/okr-moi-kr.contracts";

export const MOC_MOI_KR = {
	ky: { tu: "2026-10-01", den: "2026-12-31" },
	kyKhac: { tu: "2027-01-01", den: "2027-03-31" },
	tao: new Date("2026-10-02T03:00:00Z"),
	muon: new Date("2026-11-10T03:00:00Z"),
	doc: new Date("2026-11-14T03:00:00Z"),
} as const;

export const DON_VI_MOI_KR = ["B1", "P1", "P2", "B2", "P3"] as const;
export type DonViMoiKr = (typeof DON_VI_MOI_KR)[number];

export const CHA_MOI_KR = {
	P1: "B1",
	P2: "B1",
	P3: "B2",
} as const satisfies Partial<Record<DonViMoiKr, DonViMoiKr>>;

export const NGUOI_MOI_KR = ["A", "B", "u2"] as const;
export type NguoiMoiKr = (typeof NGUOI_MOI_KR)[number];

export type CongBoMoiKr = "som" | "muon" | "luc-doc" | "khong" | "bo";

export type KrMoiKr = {
	ma: string;
	kieu: "tang-toi" | "moc";
	hienTai: number;
	chu: NguoiMoiKr;
	mong: TinhTrangKr | "vang";
};

export type MucTieuMoiKr = {
	ma: string;
	donVi: "goc" | DonViMoiKr | "ca-nhan";
	loai: "cam-ket" | "tham-vong" | "hoc-tap";
	chu: NguoiMoiKr;
	congBo: CongBoMoiKr;
	gioiHan?: boolean;
	kyKhac?: boolean;
	krs: KrMoiKr[];
};

const so = (
	ma: string,
	hienTai: number,
	chu: NguoiMoiKr,
	mong: KrMoiKr["mong"],
): KrMoiKr => ({ ma, kieu: "tang-toi", hienTai, chu, mong });

export const CA_MOI_KR: readonly MucTieuMoiKr[] = [
	{
		ma: "goc",
		donVi: "goc",
		loai: "cam-ket",
		chu: "A",
		congBo: "som",
		krs: [so("goc-k1", 60, "A", "dung-nhip")],
	},
	{
		ma: "b1",
		donVi: "B1",
		loai: "cam-ket",
		chu: "A",
		congBo: "som",
		krs: [so("b1-k1", 5, "u2", "truot")],
	},
	{
		ma: "p1",
		donVi: "P1",
		loai: "cam-ket",
		chu: "A",
		congBo: "som",
		krs: [so("p1-k1", 5, "B", "truot"), so("p1-k2", 30, "u2", "cham-nhip")],
	},
	{
		ma: "p2",
		donVi: "P2",
		loai: "cam-ket",
		chu: "B",
		congBo: "som",
		krs: [so("p2-k1", 5, "A", "truot")],
	},
	{
		ma: "b2",
		donVi: "B2",
		loai: "tham-vong",
		chu: "B",
		congBo: "som",
		krs: [so("b2-k1", 5, "B", "cham-nhip")],
	},
	{
		ma: "p3",
		donVi: "P3",
		loai: "hoc-tap",
		chu: "u2",
		congBo: "som",
		krs: [so("p3-k1", 5, "u2", "cham-nhip")],
	},
	{
		ma: "muon",
		donVi: "P3",
		loai: "cam-ket",
		chu: "u2",
		congBo: "muon",
		krs: [so("muon-k1", 15, "u2", "dung-nhip")],
	},
	{
		ma: "moc",
		donVi: "goc",
		loai: "cam-ket",
		chu: "A",
		congBo: "som",
		krs: [
			{ ma: "moc-k1", kieu: "moc", hienTai: 0, chu: "A", mong: "moc-chua" },
			{ ma: "moc-k2", kieu: "moc", hienTai: 1, chu: "A", mong: "moc-xong" },
		],
	},
	{
		ma: "moi",
		donVi: "P2",
		loai: "cam-ket",
		chu: "B",
		congBo: "luc-doc",
		krs: [so("moi-k1", 10, "B", "chua-co-ky-vong")],
	},
	{
		ma: "gioi-han",
		donVi: "P1",
		loai: "cam-ket",
		chu: "B",
		congBo: "som",
		gioiHan: true,
		krs: [so("gioi-han-k1", 5, "B", "truot")],
	},
	{
		ma: "nhap",
		donVi: "P1",
		loai: "cam-ket",
		chu: "A",
		congBo: "khong",
		krs: [so("nhap-k1", 5, "A", "vang")],
	},
	{
		ma: "bo",
		donVi: "P2",
		loai: "cam-ket",
		chu: "A",
		congBo: "bo",
		krs: [so("bo-k1", 5, "A", "vang")],
	},
	{
		ma: "ca-nhan",
		donVi: "ca-nhan",
		loai: "cam-ket",
		chu: "u2",
		congBo: "som",
		krs: [so("ca-nhan-k1", 5, "u2", "vang"), so("ca-nhan-k2", 30, "u2", "vang")],
	},
	{
		ma: "ky-khac",
		donVi: "P1",
		loai: "cam-ket",
		chu: "A",
		congBo: "som",
		kyKhac: true,
		krs: [so("ky-khac-k1", 5, "A", "vang")],
	},
];

export const KR_MOI_KR = CA_MOI_KR.flatMap((m) =>
	m.krs.map((k) => ({ ...k, mucTieu: m })),
);
