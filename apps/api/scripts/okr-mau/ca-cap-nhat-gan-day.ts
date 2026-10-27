export const MOC_CNG = {
	ky: { tu: "2026-10-01", den: "2026-12-31" },
	kyKhac: { tu: "2027-01-01", den: "2027-03-31" },
	kyTrang: { tu: "2027-04-01", den: "2027-06-30" },
	tao: new Date("2026-10-02T02:00:00Z"),
	bo: new Date("2026-10-19T02:00:00Z"),
	doc: new Date("2026-10-23T02:00:00Z"),
} as const;

export const DON_VI_CNG = ["B1", "P1", "P2", "B2", "P3"] as const;
export type DonViCng = (typeof DON_VI_CNG)[number];

export const CHA_CNG = { P1: "B1", P2: "B1", P3: "B2" } as const;

export const NGUOI_CNG = ["A", "B", "H", "T", "U", "N", "X"] as const;
export type NguoiCng = (typeof NGUOI_CNG)[number];

export const TRUONG_CNG = {
	B1: "A",
	B2: "B",
	P1: "H",
	P3: "T",
} as const satisfies Partial<Record<DonViCng, NguoiCng>>;

export type MucTieuCng = {
	ma: string;
	donVi: "goc" | DonViCng | "ca-nhan";
	chu: NguoiCng;
	ky: "chinh" | "khac";
	gioiHan?: boolean;
	bo?: boolean;
	krs: { ma: string; chu: NguoiCng; kieu: "tang-toi" | "moc" }[];
};

const kr = (
	ma: string,
	chu: NguoiCng,
	kieu: "tang-toi" | "moc" = "tang-toi",
) => ({
	ma,
	chu,
	kieu,
});

export const MUC_TIEU_CNG: MucTieuCng[] = [
	{ ma: "goc", donVi: "goc", chu: "A", ky: "chinh", krs: [kr("g1", "A")] },
	{
		ma: "b1",
		donVi: "B1",
		chu: "A",
		ky: "chinh",
		krs: [kr("b1", "U"), kr("b1x", "A")],
	},
	{
		ma: "p1",
		donVi: "P1",
		chu: "H",
		ky: "chinh",
		krs: [kr("p1a", "U"), kr("p1m", "H", "moc")],
	},
	{ ma: "p2a", donVi: "P2", chu: "A", ky: "chinh", krs: [kr("p2a", "A")] },
	{ ma: "p2b", donVi: "P2", chu: "A", ky: "chinh", krs: [kr("p2b", "A")] },
	{ ma: "p3o", donVi: "P3", chu: "T", ky: "chinh", krs: [kr("p3o", "T")] },
	{
		ma: "p3g",
		donVi: "P3",
		chu: "T",
		ky: "chinh",
		gioiHan: true,
		krs: [kr("p3g", "T")],
	},
	{ ma: "cn", donVi: "ca-nhan", chu: "U", ky: "chinh", krs: [kr("cn", "U")] },
	{
		ma: "bo",
		donVi: "P1",
		chu: "H",
		ky: "chinh",
		bo: true,
		krs: [kr("bo", "H")],
	},
	{ ma: "kh", donVi: "B2", chu: "B", ky: "khac", krs: [kr("kh", "B")] },
];

export type LanCng = {
	ma: string;
	kr: string;
	ai: NguoiCng;
	luc: string;
	giaTri: number;
	tuTin: "cao" | "vua" | "thap";
	ghiChu: string;
	mong: "co" | "vang";
};

const lan = (
	ma: string,
	kr: string,
	ai: NguoiCng,
	luc: string,
	giaTri: number,
	tuTin: LanCng["tuTin"],
	ghiChu: string,
	mong: LanCng["mong"] = "co",
): LanCng => ({ ma, kr, ai, luc, giaTri, tuTin, ghiChu, mong });

export const LAN_CNG: LanCng[] = [
	lan("l-g1", "g1", "A", "2026-10-06T03:00:00Z", 10, "cao", "Khởi động quý."),
	lan("l-p1a-1", "p1a", "U", "2026-10-07T03:00:00Z", 20, "vua", ""),
	lan("l-bo", "bo", "H", "2026-10-08T03:00:00Z", 5, "thap", "Sẽ bỏ.", "vang"),
	lan("l-cn", "cn", "U", "2026-10-09T03:00:00Z", 1, "cao", "Riêng.", "vang"),
	lan("l-p2a", "p2a", "A", "2026-10-13T03:00:00Z", 30, "vua", ""),
	lan("l-p2b", "p2b", "A", "2026-10-13T04:00:00Z", 35, "cao", "P2 b."),
	lan("l-p3o", "p3o", "T", "2026-10-14T03:00:00Z", 40, "vua", "Mở."),
	lan("l-p3g-1", "p3g", "T", "2026-10-14T04:00:00Z", 41, "thap", "Kín 1."),
	lan("l-p3g-2", "p3g", "T", "2026-10-15T04:00:00Z", 42, "thap", "Kín 2."),
	lan("l-p1a-2", "p1a", "H", "2026-10-16T03:00:00Z", 25, "thap", "Thay U."),
	lan("l-p1m", "p1m", "H", "2026-10-16T05:00:00Z", 1, "cao", "Xong mốc."),
	lan("l-b1-1", "b1", "U", "2026-10-20T03:00:00Z", 50, "vua", "Lần một."),
	lan("l-b1-2", "b1", "U", "2026-10-20T05:00:00Z", 55, "cao", "Lần hai."),
	lan("l-kh", "kh", "B", "2027-01-05T03:00:00Z", 9, "vua", "", "vang"),
];

export const THEO_DOI_CNG: { ai: NguoiCng; mucTieu: string }[] = [
	{ ai: "T", mucTieu: "p2a" },
	{ ai: "N", mucTieu: "p3o" },
];

export const BINH_LUAN_CNG: {
	ma: string;
	ai: NguoiCng;
	mucTieu: string;
	kr: string | null;
	luc: string;
}[] = [
	{
		ma: "c-0900",
		ai: "A",
		mucTieu: "b1",
		kr: "b1",
		luc: "2026-10-20T02:00:00Z",
	},
	{
		ma: "c-1100",
		ai: "A",
		mucTieu: "b1",
		kr: "b1",
		luc: "2026-10-20T04:00:00Z",
	},
	{
		ma: "c-1300",
		ai: "A",
		mucTieu: "b1",
		kr: "b1",
		luc: "2026-10-20T06:00:00Z",
	},
	{
		ma: "c-1330",
		ai: "A",
		mucTieu: "b1",
		kr: "b1x",
		luc: "2026-10-20T06:30:00Z",
	},
	{
		ma: "c-1340",
		ai: "A",
		mucTieu: "b1",
		kr: null,
		luc: "2026-10-20T06:40:00Z",
	},
];

export const TRANG_CNG = {
	soPhien: 15,
	krMoiPhien: 3,
	themPhien: 8,
	themKrMoiPhien: 5,
	themDonVi: 3,
	truyVanToiThieu: 8,
} as const;
