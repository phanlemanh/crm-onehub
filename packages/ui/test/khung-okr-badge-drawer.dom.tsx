import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Badge } from "../src/components/badge";
import { Drawer, DrawerContent, DrawerHeader } from "../src/components/drawer";

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

describe("Badge — tương tác", () => {
	test("tuongTac trên button có hover và focus, giữ data-variant; Badge thường không có", () => {
		const nut = ve(
			<Badge asChild tuongTac variant="outline">
				<button type="button">Kara</button>
			</Badge>,
		).querySelector("button");
		expect(nut?.getAttribute("data-slot"), "chip khong la badge").toBe("badge");
		expect(nut?.getAttribute("data-variant")).toBe("outline");
		const lop = (o: Element | null | undefined) =>
			(o?.className ?? "").split(/\s+/);
		expect(lop(nut), "thieu hover cua badge tuong tac").toContain(
			"hover:bg-muted",
		);
		expect(lop(nut)).toContain("focus-visible:ring-[3px]");
		act(() => root?.unmount());
		const thuong = ve(<Badge variant="outline">Cam kết</Badge>).querySelector(
			'[data-slot="badge"]',
		);
		expect(lop(thuong), "badge thuong bi doi").not.toContain("hover:bg-muted");
	});
});

describe("DrawerHeader — căn lề", () => {
	test("align start bỏ căn giữa ở ngăn kéo; mặc định giữ căn giữa", () => {
		ve(
			<Drawer open>
				<DrawerContent>
					<DrawerHeader align="start" data-ca="trai" />
					<DrawerHeader data-ca="giua" />
				</DrawerContent>
			</Drawer>,
		);
		const trai = document.querySelector('[data-ca="trai"]');
		const giua = document.querySelector('[data-ca="giua"]');
		expect(trai?.getAttribute("data-align")).toBe("start");
		expect(trai?.className, "ten can giua: drawer-header").not.toContain(
			"text-center",
		);
		expect(giua?.className).toContain("text-center");
	});
});
