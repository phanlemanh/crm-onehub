import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chuanHoa, nap, rutLienKet, tuanTuHoa } from "../src/tai-lieu-markdown";

const THU_MUC = join(import.meta.dir, "../../ui/test/fixtures/tai-lieu");

const MAU = [
	"tieu-de",
	"doan",
	"dam-nghieng",
	"danh-sach-so",
	"danh-sach-cham",
	"danh-sach-long",
	"bang",
	"bang-o-trong",
	"lien-ket",
	"lien-ket-co-dau",
	"chu-nfd",
	"tron-lan",
] as const;

function doc(mau: string): string {
	return readFileSync(join(THU_MUC, `${mau}.md`), "utf8");
}

describe("tai-lieu-markdown", () => {
	test("thư mục có đúng 12 mẫu viết trước", () => {
		const co = readdirSync(THU_MUC)
			.filter((t) => t.endsWith(".md"))
			.map((t) => t.slice(0, -3))
			.sort();
		expect(co).toEqual([...MAU].sort());
	});

	for (const mau of MAU)
		test(`khứ hồi bất động: ${mau}`, () => {
			const l1 = chuanHoa(doc(mau));
			expect(l1.length).toBeGreaterThan(0);
			expect(chuanHoa(l1)).toBe(l1);
			expect(tuanTuHoa(nap(l1))).toBe(l1);
		});

	test("sửa một chữ thì khác", () => {
		const l1 = chuanHoa(doc("bang"));
		const sua = chuanHoa(doc("bang").replace("48 giờ", "24 giờ"));
		expect(sua).not.toBe(l1);
		expect(sua).toContain("24 giờ");
	});

	test("chữ NFD lưu thành NFC", () => {
		const tho = doc("chu-nfd");
		expect(tho).not.toBe(tho.normalize("NFC"));
		const l1 = chuanHoa(tho);
		expect(l1).toBe(l1.normalize("NFC"));
		expect(l1).toContain("Chính sách hoà giải");
	});

	test("tiêu đề ngoài cấp 2–3 kéo về cấp gần nhất", () => {
		const l1 = chuanHoa(doc("tron-lan"));
		expect(l1).toContain("## Quy định hoa hồng đối tác");
		expect(l1).toContain("### Ghi chú cấp bốn");
		expect(l1).not.toMatch(/^# /m);
		expect(l1).not.toMatch(/^#### /m);
	});

	test("hai danh sách chấm liền nhau gộp một", () => {
		expect(chuanHoa("* sao\n* sao hai\n\n+ cộng")).toBe(
			"- sao\n- sao hai\n- cộng",
		);
	});

	test("nút ngoài lược đồ không lọt vào", () => {
		const l1 = chuanHoa("> trích\n\ntrên\n\n---\n\n~~gạch~~ ảnh ![a](x.png)");
		expect(l1).not.toContain(">");
		expect(l1).not.toContain("~~");
		expect(l1).not.toContain("![");
		expect(l1).not.toContain("---");
	});

	test("rút liên kết mẫu lien-ket", () =>
		expect(rutLienKet(doc("lien-ket"))).toEqual([
			{ den: "/tai-lieu/quy-dinh-hoa-hong", vanBan: "quy định hoa hồng" },
			{
				den: "/tai-lieu/bieu-mau-hop-dong",
				vanBan: "trang biểu mẫu hợp đồng",
			},
		]));

	test("rút liên kết có dấu, chữ đậm trong liên kết giữ trọn", () =>
		expect(rutLienKet(doc("lien-ket-co-dau"))).toEqual([
			{
				den: "/tai-lieu/chinh-sach-doi-tac-da-nang",
				vanBan: "chính sách đối tác Đà Nẵng",
			},
			{
				den: "https://vi.wikipedia.org/wiki/Đà_Nẵng",
				vanBan: "trang ngoài",
			},
		]));

	test("không liên kết thì rỗng", () =>
		expect(rutLienKet(doc("bang"))).toEqual([]));
});
