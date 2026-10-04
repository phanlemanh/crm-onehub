import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SectionHeading } from "../src/components/section-heading";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(cay));
	return o;
}

describe("SectionHeading", () => {
	test("level 3 ra h3, level 4 ra h4, cả hai mang data-slot", () => {
		const ba = ve(<SectionHeading>Bản nháp</SectionHeading>);
		expect(
			ba.querySelector('[data-slot="section-heading-title"]')?.tagName,
		).toBe("H3");
		expect(ba.querySelector('[data-slot="section-heading"]')).not.toBeNull();
		act(() => root?.unmount());
		const bon = ve(<SectionHeading level={4}>Bản nháp</SectionHeading>);
		expect(
			bon.querySelector('[data-slot="section-heading-title"]')?.tagName,
		).toBe("H4");
	});

	test("actions: đứng cùng hàng, sau tiêu đề; không truyền thì không có", () => {
		const co = ve(
			<SectionHeading actions={<button type="button">Thêm</button>}>
				Bản nháp
			</SectionHeading>,
		);
		const hang = co.querySelector('[data-slot="section-heading"]');
		const con = [...(hang?.children ?? [])].map((k) =>
			k.getAttribute("data-slot"),
		);
		expect(con).toEqual(["section-heading-title", "section-heading-actions"]);
		act(() => root?.unmount());
		const khong = ve(<SectionHeading>Bản nháp</SectionHeading>);
		expect(
			khong.querySelector('[data-slot="section-heading-actions"]'),
		).toBeNull();
	});
});
