import { beforeAll, describe, expect, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { chuThuong } from "@crm/validation/tai-lieu-markdown";
import { boDauTungKyTu, dungTruyVan } from "@crm/validation/tai-lieu-tim";
import { donTaiLieu, dungSan, duyet, hoi, ok, taoTrang } from "./tai-lieu-san";

dungSan();

const TRANG = {
	P1: {
		ten: "Quy định hoa hồng đối tác",
		noiDung: "Tỉ lệ hoa hồng áp dụng cho mọi đối tác đã ký hợp đồng.\n",
	},
	P2: {
		ten: "Đào tạo nhân viên mới",
		noiDung: "Nhân viên mới học cách làm trong tuần thử việc.\n",
	},
	P3: {
		ten: "Bảo mật dữ liệu khách hàng",
		noiDung: "Điều 3: QUY TRÌNH xử lý thông tin khách hàng.\n",
	},
	P4: {
		ten: "Nghỉ phép năm",
		noiDung: "Nhân viên được nghỉ mười hai ngày, không tính hoa hồng.\n",
	},
} as const;

type Khoa = keyof typeof TRANG;

const MA_TRAN: readonly { q: string; mong: readonly Khoa[]; dau?: Khoa }[] = [
	{ q: "quy định", mong: ["P1"] },
	{ q: "quy dinh", mong: ["P1"] },
	{ q: "QUY ĐỊNH", mong: ["P1"] },
	{ q: "Quy Định".normalize("NFD"), mong: ["P1"] },
	{ q: "quy đ", mong: ["P1", "P3"] },
	{ q: "quy d", mong: ["P1", "P3"] },
	{ q: "đào tạo", mong: ["P2"] },
	{ q: "dao tao", mong: ["P2"] },
	{ q: "hoa hồng", mong: ["P1", "P4"], dau: "P1" },
	{ q: "hoa hong", mong: ["P1", "P4"], dau: "P1" },
	{ q: "hoa ho", mong: ["P1", "P4"], dau: "P1" },
	{ q: "nhân viên", mong: ["P2", "P4"], dau: "P2" },
	{ q: "điều 3", mong: ["P3"] },
	{ q: "dieu 3", mong: ["P3"] },
	{ q: "xyzkhongco", mong: [] },
	{ q: "q", mong: [] },
	{ q: "!!!", mong: [] },
];

const CAP: readonly (readonly [string, string])[] = [
	["quy định", "quy dinh"],
	["QUY ĐỊNH", "quy dinh"],
	["Quy Định".normalize("NFD"), "quy định"],
	["quy đ", "quy d"],
	["đào tạo", "dao tao"],
	["hoa hồng", "hoa hong"],
	["điều 3", "dieu 3"],
];

type Dong = {
	slug: string;
	ten: string;
	doanTrich: { truoc: string; khop: string; sau: string };
};

const slugCua = new Map<Khoa, string>();
const khoaCua = new Map<string, Khoa>();

async function tim(q: string, ai: "khac" | "okr" = "khac"): Promise<Dong[]> {
	return ok<{ rows: Dong[] }>(await hoi("taiLieu.tim", { q }, ai), `tim ${q}`)
		.rows;
}

beforeAll(async () => {
	await donTaiLieu({});
	for (const [khoa, t] of Object.entries(TRANG) as [
		Khoa,
		(typeof TRANG)[Khoa],
	][]) {
		const moi = await taoTrang(t.ten, t.noiDung);
		await duyet(moi.deXuatId, "chu");
		slugCua.set(khoa, moi.slug);
		khoaCua.set(moi.slug, khoa);
	}
});

function kiemTap(q: string, thay: Dong[], mong: readonly Khoa[]): void {
	const coThay = new Set(thay.map((d) => khoaCua.get(d.slug) ?? d.slug));
	for (const k of mong) {
		if (!coThay.has(k)) {
			if (thay.length === 0 && /\s\S{1,2}$/.test(q)) {
				throw new Error(`tim-ma-tran: go do '${q}' ra rong`);
			}
			throw new Error(`tim-ma-tran: '${q}' khong ra ${slugCua.get(k)}`);
		}
	}
	expect(
		[...coThay].sort(),
		`tim-ma-tran: '${q}' ra trang ngoai tap viet truoc`,
	).toEqual([...mong].sort());
}

function kiemDoanTrich(q: string, d: Dong): void {
	const khoa = khoaCua.get(d.slug) as Khoa;
	const tu = (dungTruyVan(q)?.tu ?? []).map(boDauTungKyTu);
	const nguon = `${TRANG[khoa].ten}\n${chuThuong(TRANG[khoa].noiDung)}`;
	const { truoc, khop, sau } = d.doanTrich;
	expect(nguon.includes(khop), `${q}/${khoa}: khop co trong chu`).toBe(true);
	if (!tu.includes(boDauTungKyTu(khop.toLowerCase()))) {
		throw new Error(
			`tim-ma-tran: khop khong ung tu truy van ('${khop}' voi '${q}')`,
		);
	}
	expect(
		nguon.includes(`${truoc}${khop}${sau}`),
		`${q}/${khoa}: doan trich lien mach`,
	).toBe(true);
}

describe("tim-ma-tran", () => {
	test("tim-ma-tran: 17 truy van viet truoc ra dung tap, trung ten dung truoc, doan trich ung tu", async () => {
		let soKhangDinh = 0;
		for (const { q, mong, dau } of MA_TRAN) {
			const thay = await tim(q);
			kiemTap(q, thay, mong);
			soKhangDinh += 1;
			if (dau) {
				expect(thay[0]?.slug, `tim-ma-tran: '${q}' trung ten dung truoc`).toBe(
					slugCua.get(dau),
				);
			}
			for (const d of thay) {
				kiemDoanTrich(q, d);
				soKhangDinh += 3;
			}
		}
		expect(soKhangDinh).toBe(MA_TRAN.length + 3 * 20);
	});

	test("tim-ma-tran: 7 cap co dau va khong dau ra cung tap", async () => {
		for (const [a, b] of CAP) {
			const ta = (await tim(a)).map((d) => d.slug).sort();
			const tb = (await tim(b)).map((d) => d.slug).sort();
			expect(ta, `tim-ma-tran: '${a}' khac '${b}'`).toEqual(tb);
		}
	});
});

describe("vai-okr", () => {
	test("vai-okr: nguoi chi OKR tim duoc tai lieu, khong goi duoc tim doi tac", async () => {
		const thay = await tim("quy dinh", "okr");
		expect(thay.map((d) => d.slug)).toEqual([slugCua.get("P1") as string]);
		const doiTac = await hoi("search.quick", { q: "ab" }, "okr");
		expect(`${doiTac.status} ${doiTac.loi}`).toBe(`403 ${KHONG_TRONG_PHAM_VI}`);
	});
});
