import { describe, expect, test } from "bun:test";
import { type Messages, messages } from "../src/lib/messages";
import { DAU_TIENG_VIET, DU_LIEU, KHONG_DAU_CHO_PHEP } from "./du-lieu";

type Cap = { khoa: string; en: string; vi: string };

type GiaTri = string | ((...doi_so: string[]) => string);

function chuoiHoa(v: GiaTri): string {
	return v instanceof Function ? v("X", "Y", "Z") : v;
}

function trai(): Cap[] {
	const en = messages("en");
	const vi = messages("vi");
	const ra: Cap[] = [];
	for (const nhom of Object.keys(en) as (keyof Messages)[]) {
		const a = en[nhom] as Record<string, GiaTri>;
		const b = vi[nhom] as Record<string, GiaTri>;
		for (const khoa of Object.keys(a)) {
			const x = a[khoa];
			const y = b[khoa];
			if (x === undefined || y === undefined) continue;
			ra.push({
				khoa: `${String(nhom)}.${khoa}`,
				en: chuoiHoa(x),
				vi: chuoiHoa(y),
			});
		}
	}
	return ra;
}

describe("bảng dịch phải thật sự là tiếng Việt", () => {
	test("không giá trị nào trùng nguyên văn bản tiếng Anh", () => {
		const trung = trai()
			.filter((c) => c.en === c.vi)
			.map((c) => `${c.khoa} = ${JSON.stringify(c.vi)}`);
		expect(trung).toEqual([]);
	});

	test("mọi giá trị mang dấu tiếng Việt, trừ danh sách đã khai", () => {
		const khong_dau = trai()
			.filter((c) => !DAU_TIENG_VIET.test(c.vi))
			.map((c) => c.vi.replace(/X|Y|Z|[^\p{L} ]/gu, "").trim())
			.filter((s) => s !== "");
		expect(khong_dau.sort()).toEqual([...KHONG_DAU_CHO_PHEP].sort());
	});

	test("danh sách miễn dấu không được dài thêm mà không ai thấy", () => {
		expect(KHONG_DAU_CHO_PHEP).toHaveLength(0);
	});
});

describe("danh sách trung tính không phải cửa sau", () => {
	test("mọi mục là dữ liệu thử, không mục nào là chữ của giao diện", () => {
		const chu_giao_dien = new Set(trai().map((c) => c.en));
		const pham = Object.values(DU_LIEU).filter((s) => chu_giao_dien.has(s));
		expect(pham).toEqual([]);
	});

	test("danh sách trung tính chỉ lớn lên khi có người thêm dữ liệu thử", () => {
		expect(Object.keys(DU_LIEU)).toHaveLength(12);
	});
});
