export const GIAI_DOAN = [
	{ id: "DEMO_BOOKED", nhan: "Demo booked", mo: true },
	{ id: "QUALIFIED_TO_BUY", nhan: "Qualified to buy", mo: true },
	{ id: "DECISION_MAKER_BOUGHT_IN", nhan: "Decision maker in", mo: true },
	{ id: "CONTRACT_SENT", nhan: "Contract sent", mo: true },
	{ id: "CLOSED_WON", nhan: "Closed won", mo: false },
	{ id: "CLOSED_LOST", nhan: "Closed lost", mo: false },
	{ id: "UNQUALIFIED_TO_BUY", nhan: "Unqualified", mo: false },
] as const;

export type GiaiDoanId = (typeof GIAI_DOAN)[number]["id"];

export const GIAI_DOAN_THUA: readonly GiaiDoanId[] = [
	"CLOSED_LOST",
	"UNQUALIFIED_TO_BUY",
];

export type TheThoaThuan = {
	id: string;
	ten: string;
	congTy: string;
	giaTriXu: number | null;
	tienTe: string;
	phuTrach: string;
	hanChot: string | null;
};

const CONG_TY = [
	"Sàn Phương Bắc",
	"Công ty Tân Việt",
	"Ngân hàng Đại Nam",
	"Địa ốc Hoàng Gia",
	"Môi giới Minh Châu",
	"Tập đoàn Sông Hồng",
];

const NGUOI = ["Phan Mạnh", "Lê Thu Hà", "Trần Quốc Bảo"];

function the(i: number, giaiDoan: string): TheThoaThuan {
	return {
		id: `${giaiDoan}-${i}`,
		ten: `Hợp tác ${CONG_TY[i % CONG_TY.length]} ${2026 + (i % 2)}`,
		congTy: CONG_TY[i % CONG_TY.length] ?? "",
		giaTriXu: i % 4 === 3 ? null : (i + 2) * 150_000_000_00,
		tienTe: i % 5 === 4 ? "usd" : "vnd",
		phuTrach: NGUOI[i % NGUOI.length] ?? "",
		hanChot:
			i % 3 === 2
				? null
				: `2026-${String(10 + (i % 3)).padStart(2, "0")}-${String(5 + i).padStart(2, "0")}`,
	};
}

export type CotThoaThuan = {
	the: TheThoaThuan[];
	tong: number;
	tongXu: number;
};

const SO_THE: Record<GiaiDoanId, number> = {
	DEMO_BOOKED: 4,
	QUALIFIED_TO_BUY: 3,
	DECISION_MAKER_BOUGHT_IN: 2,
	CONTRACT_SENT: 2,
	CLOSED_WON: 2,
	CLOSED_LOST: 1,
	UNQUALIFIED_TO_BUY: 0,
};

export function bangCotMau(tuyChon: {
	cotRong?: GiaiDoanId;
	cotTran?: GiaiDoanId;
}): Record<GiaiDoanId, CotThoaThuan> {
	const ket = {} as Record<GiaiDoanId, CotThoaThuan>;
	for (const gd of GIAI_DOAN) {
		const soThat =
			gd.id === tuyChon.cotRong
				? 0
				: gd.id === tuyChon.cotTran
					? 53
					: SO_THE[gd.id];
		const the50 = Array.from({ length: Math.min(soThat, 50) }, (_, i) =>
			the(i, gd.id),
		);
		ket[gd.id] = {
			the: the50,
			tong: soThat,
			tongXu: the50.reduce((s, t) => s + (t.giaTriXu ?? 0), 0),
		};
	}
	return ket;
}
