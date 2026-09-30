import { describe, expect, test } from "bun:test";
import { mucNhac } from "../src/nhac-ke-hoach";
import {
	cachDocSo,
	type GoiKiemTomTat,
	kiemBanTomTat,
	kiemCauTomTat,
	type NguonKiem,
} from "../src/okr-kiem-tom-tat";
import {
	MA_BO_CAU,
	type MaBoCau,
	parseNoiDungTomTat,
	TRANG_THAI_TOM_TAT,
} from "../src/okr-tom-tat";
import { okrTroLyViec, TRO_LY_OKR_TRAN } from "../src/okr-tro-ly";

const TY_LE_GIU_LAI = 0.3;

const nguon = (rieng: Partial<NguonKiem> & { id: string }): NguonKiem => ({
	keyResultId: "kr1",
	giaTri: 0,
	truoc: null,
	chenhLech: null,
	chenhTuTin: null,
	ngay: "01/01",
	...rieng,
});

const GOI: GoiKiemTomTat = {
	nguon: [
		nguon({
			id: "n1",
			keyResultId: "kr1",
			giaTri: 60,
			truoc: 45,
			chenhLech: 15,
			chenhTuTin: 1,
			ngay: "12/10",
		}),
		nguon({
			id: "n2",
			keyResultId: "kr2",
			giaTri: 40,
			truoc: 55,
			chenhLech: -15,
			chenhTuTin: -1,
			ngay: "13/10",
		}),
	],
	krs: [
		{ id: "kr1", khoiDiem: 0, dich: 100, tienDo: 60 },
		{ id: "kr2", khoiDiem: 100, dich: 20, tienDo: 25 },
	],
	tenThanhVien: ["Nguyễn Thị Hồng Nhung", "Trần Văn Bình"],
	tuCam: TRO_LY_OKR_TRAN.tuCam,
	chuDauVao: "Số khách hàng mới. Số lần gặp đối tác.",
};

type CaKiem = {
	ma: MaBoCau;
	ten: string;
	do: { vanBan: string; nguon: string[] };
	lanh: { vanBan: string; nguon: string[] };
	truocDo?: string[];
	truocLanh?: string[];
};

const BANG_CA: CaKiem[] = [
	{
		ma: "nguon-ngoai-goi",
		ten: "id nguồn không có trong gói",
		do: { vanBan: "Số lần gặp đối tác đạt 60 trong tuần.", nguon: ["n9"] },
		lanh: { vanBan: "Số lần gặp đối tác đạt 60 trong tuần.", nguon: ["n1"] },
	},
	{
		ma: "so-lech",
		ten: "số không có trong nguồn",
		do: { vanBan: "Số lần gặp đối tác đạt 61 trong tuần.", nguon: ["n1"] },
		lanh: { vanBan: "Số lần gặp đối tác đạt 60 trong tuần.", nguon: ["n1"] },
	},
	{
		ma: "sai-chieu",
		ten: "giảm khi nguồn tăng",
		do: {
			vanBan: "Số lần gặp đối tác giảm 15 so với tuần trước.",
			nguon: ["n1"],
		},
		lanh: {
			vanBan: "Số lần gặp đối tác tăng 15 so với tuần trước.",
			nguon: ["n1"],
		},
	},
	{
		ma: "sai-chieu",
		ten: "giam-xuong: giá trị giảm thì giảm đúng, tăng sai",
		do: {
			vanBan: "Chi phí mỗi khách tăng 15 so với tuần trước.",
			nguon: ["n2"],
		},
		lanh: {
			vanBan: "Chi phí mỗi khách giảm 15 so với tuần trước.",
			nguon: ["n2"],
		},
	},
	{
		ma: "sai-chieu",
		ten: "chiều theo mức tự tin",
		do: { vanBan: "Mức tự tin xuống còn 1 bậc.", nguon: ["n1"] },
		lanh: { vanBan: "Mức tự tin lên 1 bậc.", nguon: ["n1"] },
	},
	{
		ma: "noi-ve-nguoi",
		ten: "họ tên đầy đủ, kể cả không dấu",
		do: {
			vanBan: "nguyen thi hong nhung dẫn đầu số lần gặp 60.",
			nguon: ["n1"],
		},
		lanh: {
			vanBan: "Nhóm Nhung giữ số lần gặp 60.",
			nguon: ["n1"],
		},
	},
	{
		ma: "tu-cam",
		ten: "từ cấm không có trong đầu vào",
		do: { vanBan: "Lương nhóm đạt 60 trong tuần.", nguon: ["n1"] },
		lanh: { vanBan: "Số khách hàng mới đạt 60 trong tuần.", nguon: ["n1"] },
	},
	{
		ma: "trung-cau",
		ten: "trùng câu đã có",
		do: { vanBan: "Số lần gặp đối tác đạt 60 trong tuần.", nguon: ["n1"] },
		truocDo: ["Số lần gặp đối tác đạt 60 trong tuần."],
		lanh: { vanBan: "Số lần gặp đối tác đạt 60 trong tuần.", nguon: ["n1"] },
		truocLanh: ["Số lần gặp đối tác đạt 45 tuần trước."],
	},
];

describe("bộ kiểm câu tóm tắt: mỗi mã một ca đỏ và một ca lành", () => {
	for (const ma of MA_BO_CAU) {
		test(ma, () => {
			const ca = BANG_CA.filter((c) => c.ma === ma);
			if (ca.length === 0) throw new Error(`ma chua co ca: ${ma}`);
			for (const c of ca) {
				const do_ = kiemCauTomTat(c.do, GOI, c.truocDo ?? []);
				if (do_.qua) throw new Error(`cau do lot: ${c.ma}`);
				expect(do_.maBo).toBe(c.ma);
				const lanh = kiemCauTomTat(c.lanh, GOI, c.truocLanh ?? []);
				if (!lanh.qua)
					throw new Error(`cau lanh bi bo: ${c.ma} (${lanh.maBo})`);
			}
		});
	}

	test("thứ tự bảng: câu trượt nhiều luật mang mã của luật đầu", () => {
		const ket = kiemCauTomTat(
			{ vanBan: "Lương giảm 99 so với tuần trước.", nguon: ["n1"] },
			GOI,
			[],
		);
		expect(ket).toEqual({ qua: false, maBo: "so-lech" });
		const ngoai = kiemCauTomTat(
			{ vanBan: "Lương giảm 99 so với tuần trước.", nguon: ["n1", "n9"] },
			GOI,
			[],
		);
		expect(ngoai).toEqual({ qua: false, maBo: "nguon-ngoai-goi" });
	});
});

type CaSo = {
	dang: string;
	nguon?: Partial<NguonKiem>;
	kr?: { khoiDiem?: number; dich?: number; tienDo?: number };
	khop: string;
	lech: string;
};

const CA_SO: CaSo[] = [
	{
		dang: "1,5",
		nguon: { giaTri: 1.5 },
		khop: "Chỉ số đạt 1,5 hôm nay.",
		lech: "Chỉ số đạt 1,6 hôm nay.",
	},
	{
		dang: "12%",
		kr: { tienDo: 12 },
		khop: "Tiến độ đạt 12% hôm nay.",
		lech: "Tiến độ đạt 13% hôm nay.",
	},
	{
		dang: "3 triệu",
		nguon: { giaTri: 3_000_000 },
		khop: "Giá trị đạt 3 triệu hôm nay.",
		lech: "Giá trị đạt 4 triệu hôm nay.",
	},
	{
		dang: "mười hai",
		nguon: { giaTri: 12 },
		khop: "Có mười hai lần gặp hôm nay.",
		lech: "Có mười ba lần gặp hôm nay.",
	},
	{
		dang: "12/10",
		nguon: { giaTri: 7, ngay: "12/10" },
		khop: "Ghi nhận ngày 12/10 với 7 lần gặp.",
		lech: "Ghi nhận ngày 13/10 với 7 lần gặp.",
	},
	{
		dang: "chênh lệch",
		nguon: { giaTri: 9, truoc: 5, chenhLech: 4 },
		khop: "Chênh 4 so với tuần trước, hiện là 9.",
		lech: "Chênh 6 so với tuần trước, hiện là 9.",
	},
	{
		dang: "tiến độ",
		nguon: { giaTri: 9 },
		kr: { tienDo: 40 },
		khop: "Tiến độ 40 khi giá trị là 9.",
		lech: "Tiến độ 41 khi giá trị là 9.",
	},
	{
		dang: "1.5",
		nguon: { giaTri: 1.5 },
		khop: "Chỉ số đạt 1.5 hôm nay.",
		lech: "Chỉ số đạt 1.6 hôm nay.",
	},
	{
		dang: "1,200",
		nguon: { giaTri: 1200 },
		khop: "Chỉ số đạt 1,200 hôm nay.",
		lech: "Chỉ số đạt 1,300 hôm nay.",
	},
	{
		dang: "3k",
		nguon: { giaTri: 3000 },
		khop: "Chỉ số đạt 3k hôm nay.",
		lech: "Chỉ số đạt 4k hôm nay.",
	},
	{
		dang: "12.5%",
		nguon: { giaTri: 12.5 },
		khop: "Chỉ số đạt 12.5% hôm nay.",
		lech: "Chỉ số đạt 12.6% hôm nay.",
	},
	{
		dang: "1.500 đọc kiểu Việt",
		nguon: { giaTri: 1500 },
		khop: "Chỉ số đạt 1.500 hôm nay.",
		lech: "Chỉ số đạt 1.600 hôm nay.",
	},
	{
		dang: "1.500 đọc kiểu Anh",
		nguon: { giaTri: 1.5 },
		khop: "Chỉ số đạt 1.500 hôm nay.",
		lech: "Chỉ số đạt 1.600 hôm nay.",
	},
];

function goiSo(ca: CaSo): GoiKiemTomTat {
	return {
		...GOI,
		nguon: [nguon({ id: "s1", keyResultId: "k1", ...ca.nguon })],
		krs: [
			{
				id: "k1",
				khoiDiem: ca.kr?.khoiDiem ?? null,
				dich: ca.kr?.dich ?? null,
				tienDo: ca.kr?.tienDo ?? null,
			},
		],
	};
}

describe("các dạng số: một ca khớp, một ca lệch", () => {
	for (const ca of CA_SO) {
		test(ca.dang, () => {
			const goi = goiSo(ca);
			expect(
				kiemCauTomTat({ vanBan: ca.khop, nguon: ["s1"] }, goi, []),
			).toEqual({ qua: true });
			expect(
				kiemCauTomTat({ vanBan: ca.lech, nguon: ["s1"] }, goi, []),
			).toEqual({ qua: false, maBo: "so-lech" });
		});
	}

	test("cách đọc kiểu Anh chỉ thêm cách đọc, không bớt cách đọc kiểu Việt", () => {
		expect(cachDocSo("đạt 1,200")).toEqual([[1.2, 1200]]);
		expect(cachDocSo("đạt 3k")).toEqual([[3, 3000]]);
		expect(cachDocSo("đạt 1.500")).toEqual([[1500, 1.5]]);
		expect(cachDocSo("đạt 12,5")).toEqual([[12.5]]);
		expect(cachDocSo("mười hai và 3 triệu")).toEqual([[12], [3_000_000]]);
	});
});

const CAU_LANH = [
	"Nhóm giữ nhịp đều đạt 60 lần gặp",
	"Đội bán hàng đạt 60 lần gặp",
	"Bộ phận hỗ trợ đạt 60 lần gặp",
	"Nhóm vận hành đạt 60 lần gặp",
	"Nhóm đối tác đạt 60 lần gặp",
	"Nhóm nội dung đạt 60 lần gặp",
	"Nhóm sản phẩm đạt 60 lần gặp",
	"Nhóm dữ liệu đạt 60 lần gặp",
	"Nhóm kế toán đạt 60 lần gặp",
	"Nhóm pháp chế đạt 60 lần gặp",
];

function banCoBo(soBo: number) {
	return CAU_LANH.map((vanBan, i) => ({
		vanBan,
		nguon: i < soBo ? ["n9"] : ["n1"],
	}));
}

describe("bản tóm tắt: giữ lại hay hiện", () => {
	test("3/10 câu bị bỏ thì hiện", () => {
		const ban = kiemBanTomTat(banCoBo(3), GOI, { tyLeGiuLai: TY_LE_GIU_LAI });
		expect(ban.trangThai).toBe("hien");
		expect(ban.cau).toHaveLength(7);
		expect(ban.bo).toHaveLength(3);
		expect(ban.bo.every((b) => b.maBo === "nguon-ngoai-goi")).toBe(true);
	});

	test("4/10 câu bị bỏ thì can-xem", () => {
		const ban = kiemBanTomTat(banCoBo(4), GOI, { tyLeGiuLai: TY_LE_GIU_LAI });
		expect(ban.trangThai).toBe("can-xem");
		expect(ban.cau).toHaveLength(6);
		expect(ban.bo).toHaveLength(4);
	});

	test("0 câu thì can-xem", () => {
		const ban = kiemBanTomTat([], GOI, { tyLeGiuLai: TY_LE_GIU_LAI });
		expect(ban).toEqual({ cau: [], bo: [], trangThai: "can-xem" });
	});

	test("bỏ hết thì can-xem dù tỷ lệ cho phép", () => {
		const ban = kiemBanTomTat(banCoBo(1).slice(0, 1), GOI, { tyLeGiuLai: 1 });
		expect(ban.cau).toHaveLength(0);
		expect(ban.trangThai).toBe("can-xem");
	});

	test("câu lặp lại nguyên văn câu đã giữ bị bỏ mã trung-cau", () => {
		const cau = { vanBan: "Nhóm giữ nhịp đều đạt 60 lần gặp", nguon: ["n1"] };
		const ban = kiemBanTomTat([cau, cau], GOI, { tyLeGiuLai: 0.5 });
		expect(ban.cau).toEqual([cau]);
		expect(ban.bo).toEqual([{ ...cau, maBo: "trung-cau" }]);
		expect(ban.trangThai).toBe("hien");
	});
});

describe("khuôn nội dung tóm tắt", () => {
	test("parse nội dung hợp lệ", () => {
		const nd = parseNoiDungTomTat({
			nac: "bat",
			cau: [{ vanBan: "Nhóm đạt 60 lần gặp", nguon: ["n1"] }],
			bo: [{ vanBan: "Nhóm đạt 61 lần gặp", nguon: ["n1"], maBo: "so-lech" }],
		});
		expect(nd.bo[0]?.maBo).toBe("so-lech");
		expect(TRANG_THAI_TOM_TAT).toEqual(["hien", "can-xem"]);
	});

	test("hỏng thì ném lỗi có tên, không nuốt thành rỗng", () => {
		expect(() =>
			parseNoiDungTomTat({ nac: "bat", cau: [], bo: [{ maBo: "la" }] }),
		).toThrow(/noi dung tom tat tuan hong/);
	});

	test("việc tom-tat-tuan có nấc, mặc định bật", () => {
		const goc = {
			viec: "tom-tat-tuan",
			departmentId: "d1",
			cycleId: "c1",
			tuan: "2026-09-28",
			inputHash: "h",
		};
		const viec = okrTroLyViec.parse(goc);
		expect(viec.viec === "tom-tat-tuan" && viec.nac).toBe("bat");
		expect(okrTroLyViec.safeParse({ ...goc, nac: "tat" }).success).toBe(false);
	});

	test("mucNhac nhận okr-tom-tat và từ chối trường lạ", () => {
		const muc = {
			loai: "okr-tom-tat",
			tomTatId: "t1",
			departmentId: "d1",
			cycleId: "c1",
			soKrDangBan: 3,
		};
		expect(mucNhac.parse(muc)).toEqual(muc);
		expect(mucNhac.safeParse({ ...muc, la: 1 }).success).toBe(false);
	});
});
