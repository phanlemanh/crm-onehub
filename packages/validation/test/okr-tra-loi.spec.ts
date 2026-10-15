import { describe, expect, test } from "bun:test";
import {
	docSo,
	type GiaTriTrich,
	giaTriTrichKr,
	giaTriTrichMucTieu,
	kiemSoCau,
} from "../src/okr-tra-loi";

const KR = { tienDo: 37.4, khoiDiem: 12, hienTai: 25.5, dich: 60 };
const MT = { tienDo: 48, kyVong: 55 };
const LECH = 91;
const kr1 = giaTriTrichKr("k1", KR);
const kr2 = giaTriTrichKr("k2", KR);
const mt1 = giaTriTrichMucTieu("o1", MT);
const mt2 = giaTriTrichMucTieu("o2", MT);
const chuSo = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

const MA_TRAN = [
	"kr.tienDo:khop",
	"kr.tienDo:lech",
	"kr.khoiDiem:khop",
	"kr.khoiDiem:lech",
	"kr.hienTai:khop",
	"kr.hienTai:lech",
	"kr.dich:khop",
	"kr.dich:lech",
	"kr.tuTin:lech",
	"mt.tienDo:khop",
	"mt.tienDo:lech",
	"mt.kyVong:khop",
	"mt.kyVong:lech",
	"dem.kr:khop",
	"dem.kr:lech",
	"dem.mt:khop",
	"dem.mt:lech",
	"mien.nam:khop",
	"mien.quy:khop",
	"mien.quyGachNam:khop",
	"mien.qGachNam:khop",
] as const;

type Ca = {
	o: (typeof MA_TRAN)[number] | null;
	ten: string;
	chu: string;
	trich: GiaTriTrich[];
	ok: boolean;
	so?: string;
};

const caTruong = (
	loai: "kr" | "mt",
	ten: string,
	gia: number,
	trich: GiaTriTrich,
): Ca[] => [
	{
		o: `${loai}.${ten}:khop` as Ca["o"],
		ten: `${loai}-${ten}-khop`,
		chu: `Giá trị ${ten} là ${chuSo(gia)}.`,
		trich: [trich],
		ok: true,
	},
	{
		o: `${loai}.${ten}:lech` as Ca["o"],
		ten: `${loai}-${ten}-lech`,
		chu: `Giá trị ${ten} là ${LECH}.`,
		trich: [trich],
		ok: false,
		so: String(LECH),
	},
];

const CA: Ca[] = [
	...(["tienDo", "khoiDiem", "hienTai", "dich"] as const).flatMap((t) =>
		caTruong("kr", t, KR[t], kr1),
	),
	...(["tienDo", "kyVong"] as const).flatMap((t) =>
		caTruong("mt", t, MT[t], mt1),
	),
	{
		o: "kr.tuTin:lech",
		ten: "kr-tu-tin-la-chu-khong-co-so",
		chu: "Mức tự tin 3.",
		trich: [kr1],
		ok: false,
		so: "3",
	},
	{
		o: "dem.kr:khop",
		ten: "dem-kr-khop",
		chu: "Có 2 KR đang chậm.",
		trich: [kr1, kr2],
		ok: true,
	},
	{
		o: "dem.kr:lech",
		ten: "dem-kr-lech",
		chu: "Có 3 KR đang chậm.",
		trich: [kr1, kr2],
		ok: false,
		so: "3",
	},
	{
		o: "dem.mt:khop",
		ten: "dem-muc-tieu-khop",
		chu: "Phòng có 2 Mục tiêu.",
		trich: [mt1, mt2],
		ok: true,
	},
	{
		o: "dem.mt:lech",
		ten: "dem-muc-tieu-lech",
		chu: "Phòng có 1 Mục tiêu.",
		trich: [mt1, mt2],
		ok: false,
		so: "1",
	},
	{
		o: "mien.nam:khop",
		ten: "mien-nam",
		chu: "Năm 2026 chưa có Mục tiêu nào trượt.",
		trich: [],
		ok: true,
	},
	{
		o: "mien.quy:khop",
		ten: "mien-quy",
		chu: "Trong quý 4 chưa có Mục tiêu nào trượt.",
		trich: [],
		ok: true,
	},
	{
		o: "mien.quyGachNam:khop",
		ten: "quy-gach-nam",
		chu: "Trong quý 4/2026, KR này đạt 37%.",
		trich: [kr1],
		ok: true,
	},
	{
		o: "mien.qGachNam:khop",
		ten: "q-gach-nam",
		chu: "Ở Q4/2026, KR này đạt 37%.",
		trich: [kr1],
		ok: true,
	},
	{
		o: null,
		ten: "hien-tai-dau-cham",
		chu: `Hiện là ${String(KR.hienTai)} hợp đồng.`,
		trich: [kr1],
		ok: true,
	},
	{
		o: null,
		ten: "nghin",
		chu: "Đã chốt 14.000.000 đồng.",
		trich: [giaTriTrichKr("k3", { ...KR, hienTai: 14000000 })],
		ok: true,
	},
	{
		o: null,
		ten: "so-la-khong-trich",
		chu: "Đạt 80% kế hoạch.",
		trich: [],
		ok: false,
		so: "80",
	},
	{
		o: null,
		ten: "khong-so",
		chu: "KR này đang đúng nhịp.",
		trich: [kr1],
		ok: true,
	},
	{
		o: null,
		ten: "so-trong-ten-van-ngoai-lop",
		chu: "Mục tiêu «Doanh thu hợp đồng mới đạt 48 tỷ đồng» đang ở 55%.",
		trich: [giaTriTrichMucTieu("o3", { tienDo: 20, kyVong: 55 })],
		ok: false,
		so: "48",
	},
];

describe("okr-tra-loi kiem so", () => {
	for (const c of CA) {
		test(c.ten, () => {
			const kq = kiemSoCau(c.chu, c.trich);
			expect(kq.ok).toBe(c.ok);
			if (!kq.ok) expect(kq.so).toBe(c.so ?? "");
		});
	}

	test("ma-tran-du-o: moi o da khai co dung mot ca", () => {
		const o = CA.flatMap((c) => (c.o ? [c.o] : []));
		expect([...o].sort()).toEqual([...MA_TRAN].sort());
	});

	test("doc-so", () => {
		expect(docSo("42,5")).toBe(42.5);
		expect(docSo("42.5")).toBe(42.5);
		expect(docSo("1.000")).toBe(1000);
		expect(docSo("14.000.000")).toBe(14000000);
		expect(docSo("42.500")).toBe(42500);
		expect(docSo("abc")).toBeNull();
	});
});
