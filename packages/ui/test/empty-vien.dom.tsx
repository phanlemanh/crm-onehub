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
	test("mặc định không viền; solid có border liền; dashed có border nét đứt", () => {
		expect(
			ve(<Empty />).querySelector('[data-slot="empty"]')?.className,
		).not.toMatch(/\bborder(-dashed)?\b/);
		act(() => root?.unmount());
		const solid = ve(<Empty border="solid" />).querySelector(
			'[data-slot="empty"]',
		);
		expect(solid?.getAttribute("data-border")).toBe("solid");
		expect(solid?.className).toMatch(/\bborder\b/);
		expect(solid?.className).not.toContain("border-dashed");
		act(() => root?.unmount());
		expect(
			ve(<Empty border="dashed" />).querySelector('[data-slot="empty"]')
				?.className,
		).toContain("border-dashed");
	});
});
