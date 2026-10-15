import { type Db, Prisma } from "@crm/db";
import { idMau } from "./cau-hinh";

const KY = {
	quy: idMau("chu-ky", "quy4"),
	nam: idMau("chu-ky", "nam"),
};

const nguoi = (ma: string) => idMau("nguoi", ma);
const bp = (ma: string) => idMau("bp", ma);
const pb = (ma: string) => idMau("pb", ma);
export const mtSoDo = (ma: string) => idMau("mt", ma);
export const krSoDo = (ma: string) => idMau("kr", ma);

export const CHU_SO_DO = "vo-duc-anh";
export const NGUOI_XEM_HEP = "bui-quang-huy";

export const KHOA_CA = {
	A: `bp:${bp("sd-a")}`,
	B: `bp:${bp("sd-b")}`,
	A1: `pb:${pb("sd-a1")}`,
	A2: `pb:${pb("sd-a2")}`,
	A3: `pb:${pb("sd-a3")}`,
	B1: `pb:${pb("sd-b1")}`,
	B2: `pb:${pb("sd-b2")}`,
	B3: `pb:${pb("sd-b3")}`,
	X: `pb:${pb("sd-x")}`,
} as const;

export const DON_VI_CHUA_NOI: readonly string[] = [KHOA_CA.B, KHOA_CA.B2];
export const DON_VI_CAN_CHU_Y: readonly string[] = [
	KHOA_CA.A1,
	KHOA_CA.B,
	KHOA_CA.B2,
	KHOA_CA.B3,
];

export const LY_DO_SO_DO = {
	coSoLieu:
		"A3 giữ tỉ lệ giao đúng hẹn của khối A nên góp thẳng vào mục tiêu khối.",
	canCu: "Tỉ lệ giao đúng hẹn quý 3 của A3 đạt 96%.",
	datCuoc:
		"A3 mở tuyến mới có thể đẩy doanh thu năm nhưng chưa có số đo riêng.",
} as const;

type BoPhanCa = { ma: string; ten: string; truong: string };
type PhongBanCa = {
	ma: string;
	ten: string;
	boPhan: string | null;
	truong: string | null;
};
type KrCa = { ma: string; kieu: "tang-toi" | "moc"; hienTai: number };
type GopCa = {
	mucTieu?: string;
	kr?: string;
	lyDo?: string;
	canCu?: string;
	lyDoTuKara?: boolean;
};
type MucTieuCa = {
	ma: string;
	cap: "bo-phan" | "phong-ban";
	donVi: string;
	kieu: "cam-ket" | "tham-vong";
	ten: string;
	gioiHan?: boolean;
	krs: KrCa[];
	gop: GopCa[];
};

const BO_PHAN: BoPhanCa[] = [
	{ ma: "sd-a", ten: "Sơ đồ · Khối A", truong: "pham-thu-trang" },
	{ ma: "sd-b", ten: "Sơ đồ · Khối B", truong: "dang-ngoc-mai" },
];

const PHONG_BAN: PhongBanCa[] = [
	{ ma: "sd-a1", ten: "Sơ đồ · A1", boPhan: "sd-a", truong: "tran-quoc-bao" },
	{ ma: "sd-a2", ten: "Sơ đồ · A2", boPhan: "sd-a", truong: "nguyen-thi-lan" },
	{ ma: "sd-a3", ten: "Sơ đồ · A3", boPhan: "sd-a", truong: "do-minh-khoa" },
	{ ma: "sd-b1", ten: "Sơ đồ · B1", boPhan: "sd-b", truong: "pham-thu-trang" },
	{ ma: "sd-b2", ten: "Sơ đồ · B2", boPhan: "sd-b", truong: null },
	{ ma: "sd-b3", ten: "Sơ đồ · B3", boPhan: "sd-b", truong: "nguyen-thi-lan" },
	{ ma: "sd-x", ten: "Sơ đồ · X", boPhan: null, truong: "dang-ngoc-mai" },
];

const xong = (ma: string): KrCa => ({ ma, kieu: "tang-toi", hienTai: 100 });

const MUC_TIEU: MucTieuCa[] = [
	{
		ma: "sd-a-1",
		cap: "bo-phan",
		donVi: "sd-a",
		kieu: "cam-ket",
		ten: "Sơ đồ · A góp KR doanh thu năm",
		krs: [xong("sd-a-1-k1")],
		gop: [{ kr: "n1-k1" }],
	},
	{
		ma: "sd-a-2",
		cap: "bo-phan",
		donVi: "sd-a",
		kieu: "cam-ket",
		ten: "Sơ đồ · A góp KR thứ hai",
		krs: [xong("sd-a-2-k1")],
		gop: [{ kr: "n1-k2" }],
	},
	{
		ma: "sd-a1-1",
		cap: "phong-ban",
		donVi: "sd-a1",
		kieu: "cam-ket",
		ten: "Sơ đồ · A1 góp mục tiêu khối A",
		krs: [
			{ ma: "sd-a1-1-k1", kieu: "tang-toi", hienTai: 0 },
			xong("sd-a1-1-k2"),
		],
		gop: [{ mucTieu: "sd-a-1" }],
	},
	{
		ma: "sd-g",
		cap: "phong-ban",
		donVi: "sd-a1",
		kieu: "cam-ket",
		ten: "Sơ đồ · Mục tiêu giới hạn của A1",
		gioiHan: true,
		krs: [xong("sd-g-k1")],
		gop: [{ mucTieu: "sd-a-1" }],
	},
	{
		ma: "sd-a2-1",
		cap: "phong-ban",
		donVi: "sd-a2",
		kieu: "cam-ket",
		ten: "Sơ đồ · A2 góp chéo sang KR của khối B",
		krs: [xong("sd-a2-1-k1")],
		gop: [{ kr: "sd-b-1-k1" }],
	},
	{
		ma: "sd-a3-1",
		cap: "phong-ban",
		donVi: "sd-a3",
		kieu: "cam-ket",
		ten: "Sơ đồ · A3 góp cả khối A lẫn công ty",
		krs: [xong("sd-a3-1-k1")],
		gop: [
			{
				mucTieu: "sd-a-1",
				lyDo: LY_DO_SO_DO.coSoLieu,
				canCu: LY_DO_SO_DO.canCu,
				lyDoTuKara: true,
			},
			{ mucTieu: "n1", lyDo: LY_DO_SO_DO.datCuoc },
		],
	},
	{
		ma: "sd-b-1",
		cap: "bo-phan",
		donVi: "sd-b",
		kieu: "cam-ket",
		ten: "Sơ đồ · B chưa góp vào đâu",
		krs: [xong("sd-b-1-k1")],
		gop: [],
	},
	{
		ma: "sd-b1-1",
		cap: "phong-ban",
		donVi: "sd-b1",
		kieu: "cam-ket",
		ten: "Sơ đồ · B1 góp thẳng mục tiêu công ty",
		krs: [xong("sd-b1-1-k1")],
		gop: [{ mucTieu: "n1" }],
	},
	{
		ma: "sd-b2-1",
		cap: "phong-ban",
		donVi: "sd-b2",
		kieu: "cam-ket",
		ten: "Sơ đồ · B2 mục tiêu gốc của phòng",
		krs: [xong("sd-b2-1-k1")],
		gop: [],
	},
	{
		ma: "sd-b2-2",
		cap: "phong-ban",
		donVi: "sd-b2",
		kieu: "cam-ket",
		ten: "Sơ đồ · B2 chỉ góp nội bộ",
		krs: [xong("sd-b2-2-k1")],
		gop: [{ mucTieu: "sd-b2-1" }],
	},
	{
		ma: "sd-x-1",
		cap: "phong-ban",
		donVi: "sd-x",
		kieu: "tham-vong",
		ten: "Sơ đồ · X góp mục tiêu công ty",
		krs: [
			{ ma: "sd-x-1-k1", kieu: "tang-toi", hienTai: 0 },
			{ ma: "sd-x-1-k2", kieu: "moc", hienTai: 0 },
		],
		gop: [{ mucTieu: "n1" }],
	},
];

export const MUC_TIEU_SO_DO: readonly string[] = MUC_TIEU.map((m) => m.ma);

const dec = (n: number) => new Prisma.Decimal(n);

export async function napCaSoDo(db: Db, { luc }: { luc: Date }): Promise<void> {
	const chu = nguoi(CHU_SO_DO);
	await db.$transaction(async (tx) => {
		await tx.division.createMany({
			data: BO_PHAN.map((b, i) => ({
				id: bp(b.ma),
				name: b.ten,
				position: 900 + i,
				headUserId: nguoi(b.truong),
			})),
		});
		await tx.department.createMany({
			data: PHONG_BAN.map((p, i) => ({
				id: pb(p.ma),
				name: p.ten,
				position: 900 + i,
				divisionId: p.boPhan ? bp(p.boPhan) : null,
				headUserId: p.truong ? nguoi(p.truong) : null,
			})),
		});
		await tx.orgSecondaryDepartment.createMany({
			data: PHONG_BAN.flatMap((p) =>
				p.truong ? [{ userId: nguoi(p.truong), departmentId: pb(p.ma) }] : [],
			),
		});
		await tx.okrObjective.createMany({
			data: MUC_TIEU.map((m, i) => ({
				id: mtSoDo(m.ma),
				cycleId: KY.quy,
				level: m.cap,
				divisionId: m.cap === "bo-phan" ? bp(m.donVi) : null,
				departmentId: m.cap === "phong-ban" ? pb(m.donVi) : null,
				ownerUserId: chu,
				kind: m.kieu,
				status: "cong-bo",
				hienThi: m.gioiHan ? "gioi-han" : "cong-khai",
				title: m.ten,
				publishedAt: luc,
				position: 900 + i,
			})),
		});
		await tx.okrKeyResult.createMany({
			data: MUC_TIEU.flatMap((m) =>
				m.krs.map((k, i) => ({
					id: krSoDo(k.ma),
					objectiveId: mtSoDo(m.ma),
					title: `${m.ten} · KR ${i + 1}`,
					kind: k.kieu,
					ownerUserId: chu,
					startValue: dec(0),
					targetValue: dec(k.kieu === "moc" ? 1 : 100),
					currentValue: dec(k.hienTai),
					position: i,
				})),
			),
		});
		await tx.okrAlignment.createMany({
			data: MUC_TIEU.flatMap((m) =>
				m.gop.map((g) => ({
					objectiveId: mtSoDo(m.ma),
					targetObjectiveId: g.mucTieu ? mtSoDo(g.mucTieu) : null,
					targetKeyResultId: g.kr ? krSoDo(g.kr) : null,
					lyDo: g.lyDo ?? null,
					canCu: g.canCu ?? null,
					lyDoTuKara: g.lyDoTuKara ?? false,
				})),
			),
		});
	});
}
