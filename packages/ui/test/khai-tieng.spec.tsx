import { expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ForeignText } from "../src/components/foreign-text";

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const goc = createRoot(o);
	act(() => {
		goc.render(cay);
	});
	return o;
}

test("chieu a — ForeignText sinh attribute lang dung tham so", () => {
	const anh = ve(<ForeignText lang="en">Technology</ForeignText>);
	const viet = ve(<ForeignText lang="vi">Công nghệ</ForeignText>);

	expect(anh.querySelector("[lang]")?.getAttribute("lang")).toBe("en");
	expect(viet.querySelector("[lang]")?.getAttribute("lang")).toBe("vi");
});
