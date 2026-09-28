import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FieldDescription } from "../src/components/field";
import { ViewSwitch } from "../src/components/view-switch";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function render(el: ReactElement) {
	const container = document.createElement("div");
	khung = container;
	document.body.appendChild(container);
	root = createRoot(container);
	act(() => root?.render(el));
	return { container };
}

describe("khep-ky-bien-the", () => {
	test("FieldDescription hoi có biểu tượng ẩn với trình đọc và data-variant", () => {
		const { container } = render(
			<FieldDescription variant="hoi">
				Khởi điểm 0 là số thật, hay chưa đo?
			</FieldDescription>,
		);
		const el = container.querySelector('[data-slot="field-description"]');
		expect(el?.getAttribute("data-variant")).toBe("hoi");
		expect(el?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
	});
	test("FieldDescription mặc định không đổi", () => {
		const { container } = render(
			<FieldDescription>Đã khoá khi công bố.</FieldDescription>,
		);
		expect(container.querySelector("svg")).toBeNull();
	});
	test("ViewSwitch dựng cả hai lối, mỗi lối một khổ", () => {
		const { container } = render(
			<ViewSwitch
				label="Cách xem"
				value="cham"
				onValueChange={() => {}}
				items={[
					{ value: "danh-sach", label: "Danh sách" },
					{ value: "cham", label: "Chấm điểm" },
				]}
			/>,
		);
		expect(container.querySelectorAll("[data-view-switch]").length).toBe(2);
		expect(
			container.querySelector('[data-view-switch="nut"]')?.className,
		).toContain("hidden md:");
		expect(
			container.querySelector('[data-view-switch="chon"]')?.className,
		).toContain("md:hidden");
	});
});
