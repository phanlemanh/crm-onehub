import { describe, expect, test } from "bun:test";
import {
	type BanDangDung,
	type BanNop,
	canhBaoQuaHan,
	dungTraLoi,
	dungTraLoiZalo,
	dungTuChoi,
	kiemTraLoi,
	TAI_LIEU_HOI,
} from "../src/tai-lieu-hoi";
import { chuanHoa, chuThuong } from "../src/tai-lieu-markdown";

const NOI_DUNG = [
	"## Mức hoa hồng theo tầng",
	"",
	"| Tầng | Giá trị giao dịch | Hoa hồng |",
	"| --- | --- | --- |",
	"| Tầng 1 | dưới 2 tỷ | 1% |",
	"| Tầng 2 | 2 – 10 tỷ | 1,2% |",
	"",
	"## Khi nào chi",
	"",
	"Chi vào ngày 15 của tháng kế tiếp, sau khi **phòng Tài chính** đối soát.",
	"Hạn nộp chứng từ là 01/10/2026.",
	"Tầng đặc biệt hưởng 1,25% trên phần vượt.",
].join("\n");

const HOA_HONG: BanDangDung = {
	slug: "hoa-hong",
	ten: "Chính sách hoa hồng",
	phienBan: 5,
	duyetLuc: "2026-07-01T03:00:00.000Z",
	noiDung: NOI_DUNG,
	xacMinhDen: null,
	chuTrang: "Nguyễn Thu Hà",
};

const TRANG = new Map([[HOA_HONG.slug, HOA_HONG]]);
const DAU_HOM_NAY = new Date("2026-10-14T17:00:00.000Z");

const BANG = "| Tầng 2 | 2 – 10 tỷ | 1,2% |";
const CHI = "Chi vào ngày 15 của tháng kế tiếp";

function mot(
	chu: string,
	doan: string,
	phienBan = 5,
	slug = "hoa-hong",
): BanNop {
	return { cau: [{ chu, trich: [{ slug, phienBan, doan }] }] };
}

type Ca = {
	ten: string;
	ban: BanNop;
	loai: string | null;
	chua?: string;
};

const MA_TRAN: Ca[] = [
	{
		ten: "tlk-kiem: ca a bi bac",
		ban: mot("Tầng 2 hưởng 1,2%.", BANG),
		loai: null,
	},
	{
		ten: "tlk-kiem: ca b duoc nhan",
		ban: mot("Tầng 2 hưởng 1,2%.", "| Tầng 2 | 2 – 10 tỷ | 1,5% |"),
		loai: "trich-khong-co",
		chua: "1,5%",
	},
	{
		ten: "tlk-kiem: ca c duoc nhan",
		ban: mot("Tầng 2 hưởng 1,2%.", BANG, 4),
		loai: "phien-ban-cu",
		chua: "5",
	},
	{
		ten: "tlk-kiem: ca d duoc nhan",
		ban: mot("Tầng 2 hưởng 1,5%.", "| Tầng 2 | 2 – 10 tỷ | 1,5% |"),
		loai: "trich-khong-co",
		chua: "1,5%",
	},
	{
		ten: "tlk-kiem: ca e duoc nhan",
		ban: { cau: [{ chu: "Tầng 2 hưởng 1,2%.", trich: [] }] },
		loai: "cau-khong-trich",
		chua: "câu 1",
	},
	{
		ten: "tlk-kiem: ca f duoc nhan",
		ban: mot("Tầng 2 hưởng 1,2%, tức 36 triệu.", BANG),
		loai: "so-khong-trich",
		chua: "36",
	},
	{
		ten: "tlk-kiem: so khop mot phan: 20%",
		ban: mot("Phí là 20%.", "Hạn nộp chứng từ là 01/10/2026."),
		loai: "so-khong-trich",
		chua: "20%",
	},
	{
		ten: "tlk-kiem: so khop mot phan: 1,2%",
		ban: {
			cau: [
				{
					chu: "Tầng 2 hưởng 1,2%.",
					trich: [
						{
							slug: "hoa-hong",
							phienBan: 5,
							doan: "Tầng đặc biệt hưởng 1,25% trên phần vượt.",
						},
					],
				},
			],
		},
		loai: "so-khong-trich",
		chua: "1,2%",
	},
	{
		ten: "tlk-kiem: so khop mot phan: 5",
		ban: mot("Chi sau 5 ngày.", CHI),
		loai: "so-khong-trich",
		chua: "5",
	},
	{
		ten: "tlk-kiem: so lay tu doan cau khac",
		ban: {
			cau: [
				{
					chu: "Tầng 2 hưởng 1,2%.",
					trich: [{ slug: "hoa-hong", phienBan: 5, doan: CHI }],
				},
				{
					chu: "Bảng tầng có ghi tỉ lệ.",
					trich: [{ slug: "hoa-hong", phienBan: 5, doan: BANG }],
				},
			],
		},
		loai: "so-khong-trich",
		chua: "câu 1: 1,2%",
	},
	{
		ten: "tlk-kiem: ca g bi bac",
		ban: mot("Chi vào ngày 15.", CHI.normalize("NFD")),
		loai: null,
	},
	{
		ten: "tlk-kiem: ca h duoc nhan",
		ban: mot("Có bảng.", "Tầng"),
		loai: "trich-ngan",
		chua: "Tầng",
	},
	{
		ten: "tlk-kiem: ca i duoc nhan",
		ban: mot("Tầng 2 hưởng 1,2%.", BANG, 5, "khong-ton-tai"),
		loai: "trang-khong-co",
		chua: "khong-ton-tai",
	},
];

describe("tlk-kiem", () => {
	test("ma tran viet truoc: dung 13 o, ma loi va thong diep tung o", () => {
		let dem = 0;
		for (const ca of MA_TRAN) {
			const kq = kiemTraLoi(ca.ban, TRANG, DAU_HOM_NAY, chuThuong);
			if (ca.loai === null) {
				expect(kq.ok, ca.ten).toBe(true);
			} else {
				expect(kq.ok, ca.ten).toBe(false);
				if (kq.ok) continue;
				expect(
					kq.loi.map((l) => l.loai),
					ca.ten,
				).toContain(ca.loai);
				const chi = kq.loi
					.filter((x) => x.loai === ca.loai)
					.map((x) => x.chi)
					.join(" | ");
				expect(chi, ca.ten).toContain(ca.chua ?? "");
			}
			dem += 1;
		}
		expect(dem).toBe(MA_TRAN.length);
		expect(MA_TRAN.length).toBe(13);
	});

	test("doan co dau | va ** khop tren markdown tho", () => {
		const kq = kiemTraLoi(
			mot(
				"Tài chính đối soát trước khi chi.",
				"sau khi **phòng Tài chính** đối soát",
			),
			TRANG,
			DAU_HOM_NAY,
			chuThuong,
		);
		expect(kq.ok).toBe(true);
	});

	test("tlk-kiem: bang luu co dem khoang trang van khop doan go mot khoang trang", () => {
		const dem: BanDangDung = {
			...HOA_HONG,
			noiDung:
				"| Tầng   | Hoa hồng |\n| ------ | -------- |\n| Tầng 2 | 1,2%     |",
		};
		const kq = kiemTraLoi(
			mot("Tầng 2 hưởng 1,2%.", "| Tầng 2 | 1,2% |"),
			new Map([[dem.slug, dem]]),
			DAU_HOM_NAY,
			chuThuong,
		);
		expect(kq.ok, "tlk-kiem: bang co dem bi bac").toBe(true);
		const sai = kiemTraLoi(
			mot("Tầng 2 hưởng 1,2%.", "| Tầng 2 | 1,3% |"),
			new Map([[dem.slug, dem]]),
			DAU_HOM_NAY,
			chuThuong,
		);
		expect(sai.ok).toBe(false);
	});

	test("ban nhan giu anh chup ten, phien ban, ngay duyet luc nop", () => {
		const kq = kiemTraLoi(
			mot("Tầng 2 hưởng 1,2%.", BANG),
			TRANG,
			DAU_HOM_NAY,
			chuThuong,
		);
		if (!kq.ok) throw new Error("tlk-kiem: ca a bi bac");
		expect(kq.traLoi.cau[0].trich[0]).toEqual({
			slug: "hoa-hong",
			ten: "Chính sách hoa hồng",
			phienBan: 5,
			duyetLuc: "2026-07-01T03:00:00.000Z",
			doan: BANG,
		});
	});

	test("qua nhieu cau bi bac", () => {
		const nhieu: BanNop = {
			cau: Array.from({ length: TAI_LIEU_HOI.trich.cauToiDa + 1 }, () => ({
				chu: "Có bảng tầng.",
				trich: [{ slug: "hoa-hong", phienBan: 5, doan: BANG }],
			})),
		};
		const kq = kiemTraLoi(nhieu, TRANG, DAU_HOM_NAY, chuThuong);
		expect(kq.ok).toBe(false);
		if (!kq.ok) expect(kq.loi[0].loai).toBe("qua-nhieu");
	});
});

describe("tlk-qua-han-thuan", () => {
	test("dung mot trang qua han, giu ten chu trang luc nop", () => {
		const bon = ["2026-10-13", "2026-10-14", "2026-10-15", null].map(
			(ngay, i): BanDangDung => ({
				...HOA_HONG,
				slug: `t${i}`,
				ten: `Trang ${i}`,
				xacMinhDen: ngay === null ? null : `${ngay}T17:00:00.000Z`,
				chuTrang: `Chủ ${i}`,
			}),
		);
		const qua = canhBaoQuaHan(bon, DAU_HOM_NAY);
		expect(qua).toEqual([
			{
				slug: "t0",
				ten: "Trang 0",
				xacMinhDen: "2026-10-13T17:00:00.000Z",
				chuTrang: "Chủ 0",
			},
		]);
	});
});

describe("tlk-dung-cau", () => {
	const ngay = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

	test("tu choi khong gan nhat la dung hang", () => {
		expect(dungTuChoi([])).toBe(TAI_LIEU_HOI.tuChoi);
	});

	test("tu choi co gan nhat bat dau bang hang va chi them ten trang", () => {
		const cau = dungTuChoi([{ ten: "Nghỉ phép năm" }, { ten: "Hoa hồng" }]);
		expect(cau.startsWith(TAI_LIEU_HOI.tuChoi)).toBe(true);
		expect(cau.slice(TAI_LIEU_HOI.tuChoi.length)).toBe(
			"\nTrang gần nhất: Nghỉ phép năm, Hoa hồng",
		);
	});

	test("cau tra loi co canh bao qua han dung truoc, moi trich co ten, phien ban, ngay duyet", () => {
		const traLoi = {
			cau: [
				{
					chu: "Tầng 2 hưởng 1,2%.",
					trich: [
						{
							slug: "hoa-hong",
							ten: "Chính sách hoa hồng",
							phienBan: 5,
							duyetLuc: "2026-07-01T03:00:00.000Z",
							doan: BANG,
						},
					],
				},
			],
			quaHan: [
				{
					slug: "hoa-hong",
					ten: "Chính sách hoa hồng",
					xacMinhDen: "2026-10-13T17:00:00.000Z",
					chuTrang: "Nguyễn Thu Hà",
				},
			],
		};
		const web = dungTraLoi(traLoi, ngay);
		expect(web.indexOf("quá hạn xác minh")).toBeLessThan(
			web.indexOf("Tầng 2 hưởng"),
		);
		expect(web).toContain("Nguyễn Thu Hà");
		expect(web).toContain("phiên bản 5");
		expect(web).toContain("01/07/2026");
		const zalo = dungTraLoiZalo(traLoi, ngay);
		expect(zalo).toContain(`«${BANG}»`);
		expect(zalo).toContain("Chính sách hoa hồng, phiên bản 5");
		expect(zalo).not.toContain("**");
	});
});

describe("tlk-kiem-chu-thuong", () => {
	const MD = chuanHoa(
		"## Mức\n\nDoanh số > 100 triệu & phí A_B được **miễn**.",
	);
	const TRANG_KY_HIEU = new Map([
		[HOA_HONG.slug, { ...HOA_HONG, noiDung: MD }],
	]);
	const THUONG = "Doanh số > 100 triệu & phí A_B được miễn.";

	test("tlk-kiem-chu-thuong: trang luu thuc the va dau thoat that su", () => {
		expect(MD).toContain("&gt;");
		expect(MD).toContain("\\_");
	});

	test("tlk-kiem-chu-thuong: doan chep chu thuong duoc nhan, luu chu thuong", () => {
		const kq = kiemTraLoi(
			mot("Doanh số trên 100 triệu được miễn phí.", THUONG),
			TRANG_KY_HIEU,
			DAU_HOM_NAY,
			chuThuong,
		);
		if (!kq.ok)
			throw new Error(
				`tlk-kiem-chu-thuong: bac chu thuong ${JSON.stringify(kq.loi)}`,
			);
		expect(kq.traLoi.cau[0]?.trich[0]?.doan).toBe(THUONG);
	});

	test("tlk-kiem-chu-thuong: doan chep markdown tho duoc nhan nhung luu chu thuong", () => {
		const kq = kiemTraLoi(
			mot(
				"Doanh số trên 100 triệu được miễn phí.",
				"Doanh số &gt; 100 triệu &amp; phí A\\_B được **miễn**.",
			),
			TRANG_KY_HIEU,
			DAU_HOM_NAY,
			chuThuong,
		);
		if (!kq.ok) throw new Error("tlk-kiem-chu-thuong: bac ban tho");
		const doan = kq.traLoi.cau[0]?.trich[0]?.doan ?? "";
		expect(doan).toBe(THUONG);
		expect(doan).not.toContain("&amp;");
		expect(doan).not.toContain("&gt;");
		expect(doan).not.toContain("**");
	});

	test("tlk-kiem-chu-thuong: cau rong sau trim bi bac", () => {
		const kq = kiemTraLoi(mot("   ", BANG), TRANG, DAU_HOM_NAY, chuThuong);
		expect(kq.ok, "tlk-kiem-chu-thuong: cau rong duoc nhan").toBe(false);
		if (kq.ok) return;
		expect(kq.loi.map((l) => l.loai)).toContain("cau-rong");
	});
});
