import { DONG_TIN, type DongTin, TOI } from "../cap-nhat-gan-day/du-lieu";

export type LoaiCamXuc = "dong-y" | "chuc-mung" | "co-len" | "da-xem";

export const BO_CAM_XUC: { loai: LoaiCamXuc; emoji: string; ten: string }[] = [
	{ loai: "dong-y", emoji: "👍", ten: "Đồng ý" },
	{ loai: "chuc-mung", emoji: "🎉", ten: "Chúc mừng" },
	{ loai: "co-len", emoji: "💪", ten: "Cố lên" },
	{ loai: "da-xem", emoji: "👀", ten: "Đã xem" },
];

export const TEN_TOI_DA = 3;

const NGUOI = [
	"Nguyễn Minh Anh",
	"Lê Hải Đăng",
	"Phạm Quốc Bảo",
	"Đỗ Thị Hồng Nhung",
	"Vũ Thành Long",
	"Hoàng Ngọc Diệp",
	"Bùi Anh Tuấn",
	"Ngô Thị Lan Phương",
];

export type CamXucMau = Record<LoaiCamXuc, string[]>;

function rong(): CamXucMau {
	return { "dong-y": [], "chuc-mung": [], "co-len": [], "da-xem": [] };
}

function camXucCua(d: DongTin, i: number): CamXucMau {
	const cx = rong();
	if (i % 5 === 3) return cx;
	const so = (i * 7) % 6;
	for (let k = 0; k < so; k++) {
		const ai = NGUOI[(i + k) % NGUOI.length] ?? "";
		if (ai !== d.nguoi) cx["dong-y"].push(ai);
	}
	if (d.tuTin === "thap" || i % 4 === 1)
		cx["co-len"].push(NGUOI[(i + 2) % NGUOI.length] ?? "");
	if (d.tuTin === "cao" && i % 3 === 0)
		cx["chuc-mung"].push(NGUOI[(i + 5) % NGUOI.length] ?? "");
	if (i % 2 === 0) cx["da-xem"].push(NGUOI[(i + 1) % NGUOI.length] ?? "");
	if (i % 6 === 2) cx["dong-y"].push(TOI.ten);
	return cx;
}

export const NHIEU_NGUOI: CamXucMau = {
	"dong-y": [TOI.ten, ...NGUOI.slice(0, 6)],
	"chuc-mung": NGUOI.slice(2, 5),
	"co-len": [NGUOI[6] ?? ""],
	"da-xem": NGUOI.slice(0, 2),
};

export type DongCoCamXuc = DongTin & { camXuc: CamXucMau };

export const DONG: DongCoCamXuc[] = DONG_TIN.map((d, i) => ({
	...d,
	camXuc: i === 0 ? NHIEU_NGUOI : camXucCua(d, i),
	traLoi:
		d.traLoi.length > 0 || i % 4 !== 2
			? d.traLoi
			: [
					{
						id: `${d.id}-tl`,
						nguoi: NGUOI[(i + 3) % NGUOI.length] ?? "",
						than: "Tuần trước số này còn thấp hơn, tốt rồi — giữ nhịp nhé.",
						luc: "Thứ Năm 15/10 · 09:12",
					},
				],
}));

export type DongHopMau = {
	krId: string;
	kr: string;
	mucTieu: string;
	chu: string;
	tienDo: number;
	lan: DongCoCamXuc | null;
};

export const DONG_HOP: DongHopMau[] = [
	...DONG.filter((d) => d.moiNhat)
		.slice(0, 8)
		.map((d, i) => ({
			krId: d.krId,
			kr: d.kr,
			mucTieu: d.mucTieu,
			chu: d.thayCho ?? d.nguoi,
			tienDo: [72, 45, 18, 90, 64, 33, 51, 80][i] ?? 50,
			lan: d,
		})),
	{
		krId: "kr-chua",
		kr: "Tỷ lệ khách hàng doanh nghiệp gia hạn hợp đồng năm đạt 85% trước ngày chốt sổ cuối quý",
		mucTieu: "Giữ chân khách hàng doanh nghiệp",
		chu: "Ngô Thị Lan Phương",
		tienDo: 0,
		lan: null,
	},
];

export const KR_NGAN = DONG.find((d) => d.krId === DONG[0]?.krId);

export const TUAN_NGAN = DONG.filter((d) => d.krId === DONG[0]?.krId).map(
	(d, i) => ({ ...d, tuanNhan: `Tuần ${13 - i} · ${d.luc.split(" · ")[0]}` }),
);
