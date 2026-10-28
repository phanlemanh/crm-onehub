import type { MucTuTin } from "@crm/ui/components/okr-status";

export type LoaiCamXuc = "dong-y" | "chuc-mung" | "co-len" | "da-xem";

export type CamXucLan = Partial<Record<LoaiCamXuc, string[]>>;

export type LanCapNhat = {
	checkInId: string;
	luc: string;
	giaTri: number | null;
	tuTin: MucTuTin;
	ghiChu: string | null;
	camXuc: CamXucLan;
};

export type KrMau = {
	id: string;
	tieuDe: string;
	mucTieu: string;
	chuTen: string;
	kieu: "so" | "moc";
	donVi: string;
	batDau: number;
	dich: number;
	han: string;
	lan: LanCapNhat[];
};

export const KY = {
	ten: "Quý 4/2026",
	batDau: "2026-09-14",
	soTuan: 13,
	homNay: "2026-10-28",
	lucGuiThu: "2026-10-28T14:05:00+07:00",
} as const;

export const CAM_XUC = {
	tenToiDa: 3,
	bo: [
		{ loai: "dong-y", emoji: "👍", ten: "Đồng ý" },
		{ loai: "chuc-mung", emoji: "🎉", ten: "Chúc mừng" },
		{ loai: "co-len", emoji: "💪", ten: "Cố lên" },
		{ loai: "da-xem", emoji: "👀", ten: "Đã xem" },
	],
	toi: "Phan Lê Mạnh",
} as const;

const lan = (
	checkInId: string,
	luc: string,
	giaTri: number | null,
	tuTin: MucTuTin,
	ghiChu: string | null,
	camXuc: CamXucLan = {},
): LanCapNhat => ({ checkInId, luc, giaTri, tuTin, ghiChu, camXuc });

export const KR_TANG_TOI: KrMau = {
	id: "kr-doanh-thu-moi",
	tieuDe: "Doanh thu hợp đồng mới từ khách hàng doanh nghiệp khu vực phía Nam",
	mucTieu: "Mở rộng thị phần doanh nghiệp vừa và nhỏ ở phía Nam",
	chuTen: "Nguyễn Thị Thu Hà",
	kieu: "so",
	donVi: "tỷ đồng",
	batDau: 0.5,
	dich: 3,
	han: "13/12/2026",
	lan: [
		lan(
			"ci-01",
			"2026-09-24T09:12:00+07:00",
			0.62,
			"cao",
			"Ký xong hợp đồng với Minh Phát, 120 triệu.",
		),
		lan(
			"ci-02",
			"2026-10-01T16:40:00+07:00",
			0.71,
			"cao",
			"Thêm hai hợp đồng nhỏ ở Bình Dương.",
			{ "dong-y": ["Trần Văn Long"] },
		),
		lan(
			"ci-03",
			"2026-10-06T08:05:00+07:00",
			0.74,
			"vua",
			"Đối tác Hưng Thịnh lùi lịch ký sang tuần sau.",
		),
		lan(
			"ci-04",
			"2026-10-08T14:22:00+07:00",
			0.88,
			"vua",
			"Chốt được gói triển khai cho Sao Việt, 140 triệu.",
			{ "chuc-mung": ["Trần Văn Long", "Lê Hoàng Anh"] },
		),
		lan(
			"ci-05",
			"2026-10-10T17:55:00+07:00",
			0.95,
			"cao",
			"Hưng Thịnh ký sớm hơn dự kiến.",
		),
		lan(
			"ci-06",
			"2026-10-15T10:30:00+07:00",
			1.02,
			"vua",
			"Tuần chậm, đang chờ ba báo giá phản hồi.",
		),
		lan("ci-07", "2026-10-20T09:00:00+07:00", 1.1, "vua", null),
		lan(
			"ci-08",
			"2026-10-23T15:45:00+07:00",
			1.24,
			"thap",
			"Hai khách lớn chuyển ngân sách sang quý 1 năm sau; cần thêm 0,9 tỷ từ nhóm khách mới để kịp đích.",
			{
				"co-len": [
					"Trần Văn Long",
					"Lê Hoàng Anh",
					"Phạm Minh Châu",
					"Đỗ Quang Huy",
				],
			},
		),
		lan(
			"ci-09",
			"2026-10-27T11:20:00+07:00",
			1.31,
			"thap",
			"Đã mở lại đàm phán với Đông Á.",
			{ "da-xem": ["Trần Văn Long"] },
		),
	],
};

export const KR_CUNG_NGAY: KrMau = {
	id: "kr-gia-han",
	tieuDe: "Tỷ lệ khách hàng gia hạn hợp đồng bảo trì",
	mucTieu: "Giữ chân khách hàng hiện có",
	chuTen: "Lê Hoàng Anh",
	kieu: "so",
	donVi: "%",
	batDau: 60,
	dich: 85,
	han: "13/12/2026",
	lan: [
		lan(
			"ci-cn-1",
			"2026-09-30T10:00:00+07:00",
			63,
			"cao",
			"Gọi lại 40 khách sắp hết hạn.",
		),
		lan("ci-cn-2", "2026-10-09T15:10:00+07:00", 66, "cao", null),
		lan(
			"ci-cn-3",
			"2026-10-16T09:30:00+07:00",
			68,
			"vua",
			"Ba khách chuyển sang đối thủ.",
		),
		lan("ci-cn-4", "2026-10-22T11:00:00+07:00", 69, "vua", null),
		lan(
			"ci-cn-5",
			"2026-10-27T09:05:00+07:00",
			71,
			"vua",
			"Số buổi sáng, trước khi nhóm hỗ trợ gửi danh sách.",
		),
		lan(
			"ci-cn-6",
			"2026-10-27T16:30:00+07:00",
			74,
			"cao",
			"Nhóm hỗ trợ gửi thêm 12 khách đã gia hạn trong ngày.",
			{ "dong-y": ["Nguyễn Thị Thu Hà"] },
		),
	],
};

export const KR_MOC: KrMau = {
	id: "kr-cong-dai-ly",
	tieuDe: "Ra mắt cổng tự phục vụ cho đại lý cấp 1",
	mucTieu: "Giảm thời gian xử lý đơn của đại lý",
	chuTen: "Phạm Minh Châu",
	kieu: "moc",
	donVi: "",
	batDau: 0,
	dich: 1,
	han: "30/11/2026",
	lan: [
		lan(
			"ci-m-1",
			"2026-09-25T14:00:00+07:00",
			null,
			"cao",
			"Xong bản thiết kế luồng đặt hàng.",
		),
		lan(
			"ci-m-2",
			"2026-10-09T10:15:00+07:00",
			null,
			"vua",
			"Chậm một tuần vì đổi nhà cung cấp cổng thanh toán.",
		),
		lan(
			"ci-m-3",
			"2026-10-21T16:20:00+07:00",
			null,
			"vua",
			"Đã chạy thử với 5 đại lý.",
			{ "co-len": ["Nguyễn Thị Thu Hà"] },
		),
		lan("ci-m-4", "2026-10-26T09:40:00+07:00", null, "cao", null),
	],
};

export const KR_RONG: KrMau = {
	id: "kr-nps",
	tieuDe: "Điểm hài lòng sau triển khai (NPS)",
	mucTieu: "Giữ chân khách hàng hiện có",
	chuTen: "Đỗ Quang Huy",
	kieu: "so",
	donVi: "điểm",
	batDau: 30,
	dich: 45,
	han: "13/12/2026",
	lan: [],
};

const GHI_CHU_DAI = [
	"Gọi lại khách cũ trong danh sách tháng trước.",
	null,
	"Thêm một hợp đồng từ kênh đối tác.",
	"Khách lớn xin dời lịch ký.",
	null,
	"Hội thảo khách hàng mang về ba cơ hội mới.",
	"Chốt gói gia hạn cho hai khách bán lẻ.",
] as const;

const MUC_DAI: readonly MucTuTin[] = ["cao", "cao", "vua", "vua", "thap"];

const NGAY_MS = 86_400_000;

const GIO_DAI = ["08:30", "10:15", "14:40", "16:05", "17:50"] as const;

const DAI_SO_LAN = 30;

function lanDai(i: number): LanCapNhat {
	const goc = Date.UTC(2026, 8, 15);
	const ngay = new Date(goc + Math.floor(i * 1.45) * NGAY_MS)
		.toISOString()
		.slice(0, 10);
	const gio = GIO_DAI[i % GIO_DAI.length];
	return lan(
		`ci-d-${String(i + 1).padStart(2, "0")}`,
		`${ngay}T${gio}:00+07:00`,
		Math.round((120 + i * 6.2 + (i % 3) * 3) * 10) / 10,
		MUC_DAI[i % MUC_DAI.length] ?? "vua",
		GHI_CHU_DAI[i % GHI_CHU_DAI.length] ?? null,
		i % 6 === 0 ? { "dong-y": ["Trần Văn Long"] } : {},
	);
}

export const KR_DAI: KrMau = {
	id: "kr-cuoc-goi",
	tieuDe: "Số cuộc gọi chăm sóc khách hàng hoàn tất",
	mucTieu: "Giữ chân khách hàng hiện có",
	chuTen: "Trần Văn Long",
	kieu: "so",
	donVi: "cuộc",
	batDau: 100,
	dich: 500,
	han: "13/12/2026",
	lan: Array.from({ length: DAI_SO_LAN }, (_, i) => lanDai(i)),
};

export const DS_KR: readonly KrMau[] = [
	KR_TANG_TOI,
	KR_CUNG_NGAY,
	KR_MOC,
	KR_RONG,
	KR_DAI,
];
