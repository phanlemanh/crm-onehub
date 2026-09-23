export type KenhUuTien = "AUTO" | "ZALO" | "SLACK";

export type LienKetMau =
	| { loai: "chua-noi" }
	| { loai: "ma-cho"; ma: string; hetHanLuc: string }
	| { loai: "ma-het-han" }
	| { loai: "da-noi"; tenZalo: string };

export type ThongBaoMau = {
	zaloBat: boolean;
	tenBot: string;
	lienKet: LienKetMau;
	uuTien: KenhUuTien;
	slackKhop: boolean;
	kenhSeDung: "zalo" | "slack" | null;
	lech: boolean;
	luuLoi: boolean;
};

export type NguoiNoiMau = { ten: string; tenZalo: string | null };

export type KetNoiMau = {
	bat: boolean;
	tenBot: string;
	pollCuoi: string;
	im: boolean;
	nguoi: NguoiNoiMau[];
};

export const TEN_BOT = "Bot OneHub";

export const NGUOI: NguoiNoiMau[] = [
	{ ten: "Phan Lê Mạnh", tenZalo: "Mạnh Phan" },
	{ ten: "Nguyễn Thu Hà", tenZalo: "Hà Nguyễn 🌸" },
	{ ten: "Trần Quốc Bảo", tenZalo: "Bảo Trần" },
	{ ten: "Lê Minh Anh", tenZalo: null },
	{ ten: "Đỗ Hải Yến", tenZalo: null },
	{ ten: "Vũ Đức Long", tenZalo: null },
	{ ten: "Hoàng Gia Huy", tenZalo: null },
];

const GOC: ThongBaoMau = {
	zaloBat: true,
	tenBot: TEN_BOT,
	lienKet: { loai: "chua-noi" },
	uuTien: "AUTO",
	slackKhop: true,
	kenhSeDung: "slack",
	lech: false,
	luuLoi: false,
};

export const THONG_BAO: Record<string, ThongBaoMau> = {
	"ST-thong-bao-chua-noi": GOC,
	"ST-thong-bao-ma-cho": {
		...GOC,
		lienKet: { loai: "ma-cho", ma: "482913", hetHanLuc: "09:15" },
	},
	"ST-thong-bao-ma-het-han": { ...GOC, lienKet: { loai: "ma-het-han" } },
	"ST-thong-bao-da-noi": {
		...GOC,
		lienKet: { loai: "da-noi", tenZalo: "Mạnh Phan" },
		kenhSeDung: "zalo",
	},
	"ST-thong-bao-lech": {
		...GOC,
		lienKet: { loai: "da-noi", tenZalo: "Mạnh Phan" },
		uuTien: "SLACK",
		slackKhop: false,
		kenhSeDung: "zalo",
		lech: true,
	},
	"ST-thong-bao-zalo-tat": { ...GOC, zaloBat: false },
	"ST-thong-bao-luu-loi": {
		...GOC,
		lienKet: { loai: "da-noi", tenZalo: "Mạnh Phan" },
		kenhSeDung: "zalo",
		luuLoi: true,
	},
};

export const KET_NOI: Record<string, KetNoiMau> = {
	"ST-ket-noi-zalo-song": {
		bat: true,
		tenBot: TEN_BOT,
		pollCuoi: "1 phút trước",
		im: false,
		nguoi: NGUOI,
	},
	"ST-ket-noi-zalo-im": {
		bat: true,
		tenBot: TEN_BOT,
		pollCuoi: "47 phút trước",
		im: true,
		nguoi: NGUOI,
	},
	"ST-ket-noi-zalo-tat": {
		bat: false,
		tenBot: TEN_BOT,
		pollCuoi: "",
		im: false,
		nguoi: NGUOI,
	},
};

export const MUC_CAI_DAT = [
	"Chung",
	"Theo dõi",
	"Kết nối",
	"Tiền tệ",
	"Trường",
	"Thành viên",
	"Khoá API",
	"SSO",
	"Điều phối",
	"Thông báo của bạn",
] as const;
