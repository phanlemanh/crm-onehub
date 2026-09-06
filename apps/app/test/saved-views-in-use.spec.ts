import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { viewRemoval } from "@/components/data-table/view-removal";
import { crmMessages } from "@/lib/messages/crm";

const MENU = join(
	import.meta.dir,
	"..",
	"components",
	"data-table",
	"saved-views-menu.tsx",
);

describe("AC-7 · góc nhìn đang dùng thì bày ra, không mời bấm xoá", () => {
	it("góc nhìn rảnh thì cho xoá", () => {
		expect(viewRemoval({ usedBy: [] })).toEqual({ kind: "removable" });
	});

	it("góc nhìn có chiến dịch dùng thì KHÔNG cho xoá, và kể tên chiến dịch", () => {
		expect(viewRemoval({ usedBy: ["Gọi môi giới tuần 1"] })).toEqual({
			kind: "in-use",
			usedBy: ["Gọi môi giới tuần 1"],
		});
	});

	it("nhiều chiến dịch thì kể đủ, không cắt bớt", () => {
		const removal = viewRemoval({ usedBy: ["Tuần 1", "Tuần 2", "Tuần 3"] });

		expect(removal.kind).toBe("in-use");
		expect(removal.kind === "in-use" ? removal.usedBy : []).toEqual([
			"Tuần 1",
			"Tuần 2",
			"Tuần 3",
		]);
	});
});

describe("AC-7 · quan hệ trạng thái với câu chữ", () => {
	const vi = crmMessages("vi");
	const en = crmMessages("en");

	it("câu tiếng Việt của trạng thái đang-dùng mang tên chiến dịch", () => {
		const removal = viewRemoval({ usedBy: ["Gọi môi giới tuần 1"] });
		const cau =
			removal.kind === "in-use"
				? vi.views.inUse(removal.usedBy.join(", "))
				: "";

		expect(cau).toContain("Gọi môi giới tuần 1");
		expect(cau).toContain("phân khúc");
	});

	it("câu đang-dùng có dấu tiếng Việt, không phải chữ Anh bỏ dấu", () => {
		expect(vi.views.inUse("X")).not.toBe(en.views.inUse("X"));
		expect(
			/[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(
				vi.views.inUse("X"),
			),
		).toBe(true);
	});

	it("hai trạng thái nói hai câu khác nhau", () => {
		expect(vi.views.inUse("Tuần 1")).not.toBe(vi.views.remove("Tuần 1"));
	});
});

describe("AC-7 · menu chỉ dựng nút xoá ở nhánh cho-xoá", () => {
	const nguon = readFileSync(MENU, "utf8");

	it("menu hỏi viewRemoval trước khi quyết", () => {
		expect(nguon).toContain("viewRemoval(view)");
	});

	it("nút xoá nằm trong nhánh removable, câu đang-dùng nằm ở nhánh kia", () => {
		const nhanh = nguon.slice(nguon.indexOf('removal.kind === "removable"'));

		expect(nhanh.indexOf("onSelect={onDelete}")).toBeGreaterThan(-1);
		expect(nhanh.indexOf("m.views.inUse")).toBeGreaterThan(
			nhanh.indexOf("onSelect={onDelete}"),
		);
	});
});
