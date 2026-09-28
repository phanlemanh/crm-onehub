import { beforeAll, describe, expect, test } from "bun:test";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	deXuat,
	donTaiLieu,
	dungSan,
	duyet,
	hoi,
	ok,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

type Dong = {
	slug: string;
	ten: string;
	cau: string;
	vanBan: string;
	soLan: number;
};

const slug: Record<string, string> = {};

const lk = (chu: string) => `[${chu}](/ws/tai-lieu/${slug.D})`;

async function trangDuyet(khoa: string, ten: string, noiDung: string) {
	const moi = await taoTrang(ten, noiDung);
	await duyet(moi.deXuatId, "chu");
	slug[khoa] = moi.slug;
	return moi;
}

const MONG: readonly {
	khoa: string;
	ten: string;
	cau: string;
	vanBan: string;
	soLan: number;
}[] = [
	{
		khoa: "A",
		ten: "An toàn thông tin",
		cau: "Xem quy trình khiếu nại trước khi trả lời khách.",
		vanBan: "quy trình khiếu nại",
		soLan: 1,
	},
	{
		khoa: "B",
		ten: "Bước tiếp nhận",
		cau: "Bước 1: đọc trang khiếu nại",
		vanBan: "trang khiếu nại",
		soLan: 1,
	},
	{
		khoa: "C",
		ten: "Chia việc xử lý",
		cau: "khiếu nại",
		vanBan: "khiếu nại",
		soLan: 1,
	},
	{
		khoa: "E",
		ten: "Hướng dẫn trả lời",
		cau: "Theo quy trình D",
		vanBan: "quy trình D",
		soLan: 1,
	},
	{
		khoa: "F",
		ten: "Phụ lục khiếu nại",
		cau: "Đọc lần đầu ở đây.",
		vanBan: "lần đầu",
		soLan: 2,
	},
];

async function nhacToi(
	s: string,
	ai: "khac" | "tao" = "khac",
): Promise<Dong[]> {
	return ok<{ rows: Dong[] }>(
		await hoi("taiLieu.nhacToi", { slug: s }, ai),
		`nhacToi ${s}`,
	).rows;
}

beforeAll(async () => {
	await donTaiLieu({});
	const d = await trangDuyet("D", "Quy trình khiếu nại", "Nội dung gốc.\n");
	await trangDuyet(
		"A",
		"An toàn thông tin",
		`Xem ${lk("quy trình khiếu nại")} trước khi trả lời khách.\n`,
	);
	await trangDuyet(
		"B",
		"Bước tiếp nhận",
		`- Bước 1: đọc ${lk("trang khiếu nại")}\n- Bước 2: ghi sổ\n`,
	);
	await trangDuyet(
		"C",
		"Chia việc xử lý",
		`| Việc | Nơi |\n| --- | --- |\n| Xử lý | ${lk("khiếu nại")} |\n`,
	);
	await trangDuyet(
		"E",
		"Hướng dẫn trả lời",
		`## Theo ${lk("quy trình D")}\n\nNội dung.\n`,
	);
	await trangDuyet(
		"F",
		"Phụ lục khiếu nại",
		`Đọc ${lk("lần đầu")} ở đây.\n\nRồi ${lk("lần hai")} ở kia.\n`,
	);
	const tuNhac = await deXuat(
		d.slug,
		`Nội dung gốc, xem lại ${lk("chính trang này")}.\n`,
	);
	await duyet(tuNhac, "chu");
	const g = await trangDuyet("G", "Góp ý mới", "Chưa nhắc gì.\n");
	await deXuat(g.slug, `Bản chờ nhắc ${lk("trang D")}.\n`);
	await trangDuyet("R", "Rỗng không ai nhắc", "Một mình.\n");
	const nhap = await taoTrang("Nháp chưa duyệt", "Chưa duyệt.\n", "tao");
	slug.N = nhap.slug;
});

describe("nhac-toi-ma-tran", () => {
	test("nhac-toi-ma-tran: nam trang nguon da duyet, dung cau nguyen van cua lan nhac dau", async () => {
		const thay = await nhacToi(slug.D as string);
		const coSlug = thay.map((r) => r.slug);
		if (coSlug.includes(slug.D as string)) {
			throw new Error("nhac-toi: trang tu nhac chinh no co dong");
		}
		if (coSlug.includes(slug.G as string)) {
			throw new Error("nhac-toi: ban chua duyet co dong");
		}
		expect(coSlug).toEqual(MONG.map((m) => slug[m.khoa] as string));
		for (const m of MONG) {
			const dong = thay.find((r) => r.slug === slug[m.khoa]);
			if (m.khoa === "F" && dong?.vanBan === "lần hai") {
				throw new Error("nhac-toi: F lay cau cua lan hai");
			}
			expect(dong).toEqual({
				slug: slug[m.khoa] as string,
				ten: m.ten,
				cau: m.cau,
				vanBan: m.vanBan,
				soLan: m.soLan,
			});
		}
	});

	test("nhac-toi-ma-tran: trang khong ai nhac tra rong", async () => {
		expect(await nhacToi(slug.R as string)).toEqual([]);
	});

	test("nhac-toi-ma-tran: trang chua duyet voi nguoi khac giong het slug khong co", async () => {
		const nhap = await hoi("taiLieu.nhacToi", { slug: slug.N }, "khac");
		const khongCo = await hoi(
			"taiLieu.nhacToi",
			{ slug: "khong-co-trang-nay" },
			"khac",
		);
		expect(`${nhap.status} ${nhap.loi}`).toBe(`404 ${T.khongCo}`);
		expect(`${khongCo.status} ${khongCo.loi}`).toBe(`404 ${T.khongCo}`);
		expect(await nhacToi(slug.N as string, "tao")).toEqual([]);
	});
});
