import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SimpleTable, SimpleTableRow } from "../src/components/simple-table";
import { TableCell } from "../src/components/table";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<SimpleTable columns={[{ id: "a" }, { id: "b" }]}>
				<SimpleTableRow data-hang="chinh">
					<TableCell>Câu bị loại</TableCell>
					<TableCell>3</TableCell>
				</SimpleTableRow>
				<SimpleTableRow sub data-hang="phu">
					<TableCell>Số mới</TableCell>
					<TableCell>2</TableCell>
				</SimpleTableRow>
			</SimpleTable>,
		),
	);
	return khung;
}

describe("SimpleTableRow sub", () => {
	test("hàng phụ mang data-sub, chữ mờ và thụt ô đầu; hàng chính không", () => {
		const o = dung();
		const phu = o.querySelector('[data-hang="phu"]');
		const chinh = o.querySelector('[data-hang="chinh"]');
		expect(phu?.hasAttribute("data-sub"), "hang phu khong co data-sub").toBe(
			true,
		);
		expect(phu?.className).toContain("text-muted-foreground");
		expect(phu?.className).toContain(
			"[&>[data-slot=table-cell]:first-child]:pl-6",
		);
		expect(chinh?.hasAttribute("data-sub")).toBe(false);
		expect(chinh?.className).not.toContain("text-muted-foreground");
	});
});
