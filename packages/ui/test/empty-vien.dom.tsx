import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Empty } from "../src/components/empty";

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

describe("Empty — biến thể viền", () => {
	test("mặc định giữ nét đứt kiểu cũ (chỉ kiểu, chưa có bề rộng); solid có border liền", () => {
		const mac = ve(<Empty />).querySelector('[data-slot="empty"]');
		expect(mac?.getAttribute("data-border")).toBe("default");
		expect(mac?.className).toContain("border-dashed");
		expect(mac?.className).not.toMatch(/(^|\s)border(\s|$)/);
		act(() => root?.unmount());
		const solid = ve(<Empty border="solid" />).querySelector(
			'[data-slot="empty"]',
		);
		expect(solid?.getAttribute("data-border")).toBe("solid");
		expect(solid?.className).toMatch(/(^|\s)border(\s|$)/);
		expect(solid?.className).toContain("border-solid");
		expect(solid?.className).not.toContain("border-dashed");
	});
});
