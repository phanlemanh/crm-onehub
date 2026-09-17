import { describe, expect, it } from "bun:test";
import { tenGoi } from "@/components/agent-builder/ten-goi";

describe("ten goi trong cau chao", () => {
	it("tieng Viet goi bang TEN, tuc phan cuoi cua ho ten", () => {
		expect(tenGoi("Phan Lê Mạnh", "vi", "Bạn")).toBe("Mạnh");
		expect(tenGoi("Nguyễn Thị Hương Giang", "vi", "Bạn")).toBe("Giang");
	});

	it("tieng Anh goi bang phan DAU cua ho ten", () => {
		expect(tenGoi("Ada Lovelace", "en", "there")).toBe("Ada");
		expect(tenGoi("Phan Lê Mạnh", "en", "there")).toBe("Phan");
	});

	it("mot tieng thi hai thu tieng deu tra chinh no", () => {
		expect(tenGoi("Mạnh", "vi", "Bạn")).toBe("Mạnh");
		expect(tenGoi("Ada", "en", "there")).toBe("Ada");
	});

	it("ten rong hoac chi co khoang trang thi tra chu thay the", () => {
		expect(tenGoi("", "vi", "Bạn")).toBe("Bạn");
		expect(tenGoi("   ", "vi", "Bạn")).toBe("Bạn");
		expect(tenGoi("", "en", "there")).toBe("there");
	});

	it("khoang trang thua khong sinh ra phan rong", () => {
		expect(tenGoi("  Phan   Lê   Mạnh  ", "vi", "Bạn")).toBe("Mạnh");
		expect(tenGoi("  Ada   Lovelace  ", "en", "there")).toBe("Ada");
	});
});
