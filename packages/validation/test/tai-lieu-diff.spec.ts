import { describe, expect, spyOn, test } from "bun:test";
import {
	diffHash,
	type KhoiDoi,
	soSanh,
	suKienDoi,
} from "../src/tai-lieu-diff";

const TRAN_MS = process.env.CI ? 6_000 : 2_000;

const TRUOC = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 48 giờ kể từ khi ký.

Đối tác gửi chứng từ đầy đủ cho vận hành.

Mọi thắc mắc gửi về bộ phận vận hành.
`;

const SAU = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 24 giờ kể từ khi ký.

Mọi thắc mắc gửi về bộ phận vận hành.

Bản này áp dụng cho mọi đối tác.
`;

function dem(khoi: KhoiDoi[], loai: "them" | "bo"): number {
	return khoi.flatMap((k) => k.doan).filter((d) => d.loai === loai).length;
}

function chuTheo(khoi: KhoiDoi[], loai: "them" | "bo"): string[] {
	return khoi
		.flatMap((k) => k.doan)
		.filter((d) => d.loai === loai)
		.map((d) => d.chu);
}

function vanBanDai(tu: string, doanSo: number): string {
	const cau: string[] = [];
	for (let i = 0; cau.join("\n\n").length < 200_000; i += 1)
		cau.push(
			`${tu} ${i} ${"lorem ipsum dolor ".repeat((i % doanSo) + 3)}${tu} ${i}.`,
		);
	return cau.join("\n\n").slice(0, 200_000);
}

describe("tai-lieu-diff", () => {
	test("thêm một câu, bỏ một câu, đổi 48 giờ thành 24 giờ", () => {
		const khoi = soSanh(TRUOC, SAU);
		expect(dem(khoi, "them")).toBe(2);
		expect(dem(khoi, "bo")).toBe(2);
		expect(chuTheo(khoi, "bo")).toEqual([
			"48",
			"Đối tác gửi chứng từ đầy đủ cho vận hành.",
		]);
		expect(chuTheo(khoi, "them")).toEqual([
			"24",
			"Bản này áp dụng cho mọi đối tác.",
		]);
		expect(khoi.map((k) => k.kieu)).toEqual([
			"tieu-de-2",
			"doan",
			"doan",
			"doan",
			"doan",
		]);
		expect(suKienDoi(khoi)).toEqual([{ truoc: "48 giờ", sau: "24 giờ" }]);
	});

	test("hai bản giống nhau sau chuẩn hoá thì không có thêm hay bỏ", () => {
		const nfd = `${TRUOC.normalize("NFD")}\n\n- một\n- hai\n`;
		const nfc = `${TRUOC}\n\n* một\n* hai\n`;
		expect(nfd).not.toBe(nfc);
		const khoi = soSanh(nfd, nfc);
		expect(dem(khoi, "them")).toBe(0);
		expect(dem(khoi, "bo")).toBe(0);
		expect(suKienDoi(khoi)).toEqual([]);
	});

	test("kiểu khối theo cây: tiêu đề, mục số, mục chấm, hàng bảng", () => {
		const md =
			"## Hai\n\n### Ba\n\n1. số\n   - chấm\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n";
		const khoi = soSanh(md, md);
		expect(khoi.map((k) => k.kieu)).toEqual([
			"tieu-de-2",
			"tieu-de-3",
			"muc-so",
			"muc-cham",
			"hang-bang",
			"hang-bang",
		]);
		expect(khoi.every((k) => k.doan.every((d) => d.loai === "giu"))).toBe(true);
	});

	test("dải số: phần trăm và ngày trong khối thêm, bỏ", () => {
		const khoi = soSanh(
			"Mức 12% từ 01/10/2026.\n\nGiữ nguyên.",
			"Mức 15% từ 01/01/2027.\n\nGiữ nguyên.\n\nThêm 3 ngày nghỉ.",
		);
		expect(suKienDoi(khoi)).toEqual([
			{ truoc: "12%", sau: "15%" },
			{ truoc: "01/10/2026", sau: "01/01/2027" },
			{ truoc: "", sau: "3 ngày" },
		]);
	});

	test("diffHash ổn định, đổi một chữ thì lệch", async () => {
		const a = await diffHash(soSanh(TRUOC, SAU));
		const b = await diffHash(soSanh(TRUOC, SAU));
		expect(a).toMatch(/^[0-9a-f]{64}$/);
		expect(b).toBe(a);
		const c = await diffHash(soSanh(TRUOC, SAU.replace("24 giờ", "12 giờ")));
		expect(c).not.toBe(a);
	});

	test("diff-trang-dai: hai bản 200 000 ký tự khác toàn bộ trả dưới 2 giây", () => {
		const truoc = vanBanDai("alpha", 7);
		const sau = vanBanDai("omega", 5);
		expect(truoc.length).toBe(200_000);
		expect(sau.length).toBe(200_000);
		const bd = performance.now();
		const khoi = soSanh(truoc, sau);
		const ms = performance.now() - bd;
		expect(ms).toBeLessThan(TRAN_MS);
		expect(dem(khoi, "them") + dem(khoi, "bo")).toBeGreaterThan(0);
	});

	test("diff-trang-dai: một đoạn 200 000 ký tự viết lại trả dưới 2 giây", () => {
		const truoc = "a b c d e ".repeat(20_000);
		const sau = "f g h i j ".repeat(20_000);
		const bd = performance.now();
		const khoi = soSanh(truoc, sau);
		expect(performance.now() - bd).toBeLessThan(TRAN_MS);
		expect(dem(khoi, "them")).toBeGreaterThan(0);
		expect(dem(khoi, "bo")).toBeGreaterThan(0);
	});

	test("tat-dinh: dong ho chay nhanh hay cham thi diff va diffHash van y het", async () => {
		const truoc = vanBanDai("alpha", 7);
		const sau = vanBanDai("omega", 5);
		const binhThuong = await diffHash(soSanh(truoc, sau));
		let gia = Date.now();
		const dongHo = spyOn(Date, "now").mockImplementation(() => {
			gia += 60_000;
			return gia;
		});
		try {
			expect(await diffHash(soSanh(truoc, sau))).toBe(binhThuong);
			expect(await diffHash(soSanh(TRUOC, SAU))).toBe(
				await diffHash(soSanh(TRUOC, SAU)),
			);
		} finally {
			dongHo.mockRestore();
		}
		const khoi = soSanh(TRUOC, SAU);
		expect(dem(khoi, "them")).toBe(2);
	});

	const doanDanh = (tu: string, n: number) =>
		Array.from({ length: n }, (_, i) => `${tu} ${i} cau thu ${i}.`);
	const md = (ds: string[]) => ds.join("\n\n");
	const goc1500 = doanDanh("goc", 1500);
	const sua10 = goc1500.map((d, i) => (i % 150 === 75 ? `${d} da sua` : d));
	const lap1500 = Array.from({ length: 1500 }, (_, i) =>
		i % 15 === 0 ? `rieng ${i}.` : "Ghi chú lặp.",
	);
	const lapSua = lap1500.map((d, i) =>
		i % 150 === 45 ? `rieng sua ${i}.` : d,
	);
	const CAP = {
		ngan: [
			"## Hạn\n\nHoa hồng trong 48 giờ.\n\nGiữ nguyên.",
			"## Hạn\n\nHoa hồng trong 24 giờ.\n\nGiữ nguyên.\n\nThêm dòng.",
		],
		"dai-khac-het": [vanBanDai("alpha", 7), vanBanDai("omega", 5)],
		"bien-dung-tran": [md(doanDanh("truoc", 1000)), md(doanDanh("sau", 1000))],
		"bien-qua-tran": [md(doanDanh("truoc", 1001)), md(doanDanh("sau", 1000))],
		"dao-thu-tu": [md(doanDanh("x", 1100)), md(doanDanh("x", 1100).reverse())],
		"dai-sua-rai-rac": [md(goc1500), md(sua10)],
		"lap-khoi": [md(lap1500), md(lapSua)],
	} satisfies Record<string, [string, string]>;
	const GHIM: [keyof typeof CAP, string][] = [
		[
			"ngan",
			"5636d2b553bb475d3dad74bb9322b576f6d4ceab68f5e884457a71c3e85c9e4b",
		],
		[
			"dai-khac-het",
			"f01d85ddf98a6151f62251c8f89af658bce34212c83f095c1c8e3779ff0fb8f6",
		],
		[
			"bien-dung-tran",
			"dec61e9618ae03e5f514461061b2a2de222f29f206469368e45e27e173a8cb82",
		],
		[
			"bien-qua-tran",
			"3c8fd026b79d2fc254dea1194282c98e355de5691b92f3666ea87778c777fe84",
		],
		[
			"dao-thu-tu",
			"4a39a5b4119b1a7fdb2091c26f4a40f3d07eb5946c2a785093d1d70f7a19ab83",
		],
		[
			"dai-sua-rai-rac",
			"c2d6beb0986b178f9f7313ff91376d300a89957642f9869d576f7ddb5766ef69",
		],
		[
			"lap-khoi",
			"224acc5122c552b2be73a6597918551aa089c6a1aba59d00e488ca8c18b0e536",
		],
	];
	for (const [ten, ghim] of GHIM)
		test(`tran-duoi-khoi: ${ten}`, async () => {
			const bam = await diffHash(soSanh(...CAP[ten]));
			if (bam !== ghim) throw new Error(`lech ban goc: ${ten} ${bam}`);
		});

	const demDongHo = (truoc: string, sau: string): number => {
		const dongHo = spyOn(Date, "now");
		try {
			soSanh(truoc, sau);
			return dongHo.mock.calls.length;
		} finally {
			dongHo.mockRestore();
		}
	};
	test("myers-vo-ich: khac het thi khong vao vong Myers muc khoi", () => {
		const [truoc, sau] = CAP["dai-khac-het"];
		const n = demDongHo(truoc, sau);
		if (n !== 0)
			throw new Error(`myers-vo-ich: vong Myers muc khoi van chay ${n} lan`);
	});
	test("myers-vo-ich: doi chung duong, trong tran thi cay dem thay vong Myers", () => {
		const [truoc, sau] = CAP["dai-sua-rai-rac"];
		if (demDongHo(truoc, sau) === 0)
			throw new Error("myers-vo-ich: cay dem khong thay vong Myers");
	});

	const BANG = (hang: string) => `| Mục | Tỉ lệ |\n| --- | --- |\n${hang}\n`;
	const HANG_BANG: [string, string, string, string[][]][] = [
		["them-chu-cuoi-o", "| a | 5% |", "| a x | 5% |", [["them:x"], []]],
		["bo-chu-cuoi-o", "| b c | 7 |", "| b | 7 d |", [["bo:c"], ["them:d"]]],
		["doi-o-sau", "| a | 5% |", "| a | 6% |", [[], ["bo:5", "them:6"]]],
	];
	const doiTheoO = (doan: { loai: string; chu: string }[]): string[][] => {
		const o: string[][] = [[]];
		for (const d of doan) {
			if (d.loai === "giu" && d.chu === " | ") o.push([]);
			else if (d.loai !== "giu" && d.chu.trim() !== "")
				o[o.length - 1]?.push(`${d.loai}:${d.chu.trim()}`);
		}
		return o;
	};
	for (const [ten, truoc, sau, mong] of HANG_BANG)
		test(`bang-giu-dau-ngan-o: ${ten}`, () => {
			const hang = soSanh(BANG(truoc), BANG(sau)).filter(
				(k) => k.kieu === "hang-bang" && k.doan.some((d) => d.loai !== "giu"),
			);
			expect(hang.length).toBe(1);
			const doan = hang[0]?.doan ?? [];
			const ngan = doan.filter((d) => d.chu.includes("|"));
			if (ngan.some((d) => d.loai !== "giu" || d.chu !== " | "))
				throw new Error(`dau ngan o bi cat: ${ten}`);
			expect(ngan.length).toBe(1);
			const thucTe = doiTheoO(doan);
			if (JSON.stringify(thucTe) !== JSON.stringify(mong))
				throw new Error(`chu doi lech o: ${ten} ${JSON.stringify(thucTe)}`);
		});
	test("bang-doi-so-cot: hang cu bo va hang moi them tach rieng", () => {
		const hang = soSanh(
			"| Mục | Tỉ lệ |\n| --- | --- |\n| a | 5% |\n",
			"| Mục | Tỉ lệ | Ghi chú |\n| --- | --- | --- |\n| a | 5% | x |\n",
		).filter((k) => k.kieu === "hang-bang");
		const loai = hang.map((k) =>
			[...new Set(k.doan.map((d) => d.loai))].join(","),
		);
		if (loai.some((l) => l.includes(",")))
			throw new Error("hang doi so cot bi gop bo va them");
		expect(loai).toEqual(["bo", "bo", "them", "them"]);
	});
});
