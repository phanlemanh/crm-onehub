import "@crm/ui/test/setup-dom";
import { expect, test } from "bun:test";
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import {
	CompanyAbout,
	MetaLine,
} from "@/components/crm/record-sheet/record-parts";

function ve(cay: ReactElement, tieng?: string): HTMLElement {
	const o = document.createElement("div");
	if (tieng) o.setAttribute("lang", tieng);
	document.body.appendChild(o);
	const goc = createRoot(o);
	act(() => {
		goc.render(cay);
	});
	return o;
}

function vungKhai(goc: HTMLElement, chu: string): string | null {
	const di = goc.ownerDocument.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
	for (let n = di.nextNode(); n; n = di.nextNode()) {
		if (!n.nodeValue?.includes(chu)) continue;
		const vung = n.parentElement?.closest("[lang]");
		return vung ? vung.getAttribute("lang") : null;
	}
	throw new Error(`khong thay chu ${JSON.stringify(chu)} tren man`);
}

test("chieu b — phan tu khong khai lang thi khong duoc khai ho", () => {
	const o = ve(
		createElement(MetaLine, {
			parts: [
				{ text: "Hà Nội, VN" },
				{ text: "Technology", lang: "en" as const },
			],
		}),
		"vi",
	);
	expect(vungKhai(o, "Hà Nội")).toBe("vi");
	expect(vungKhai(o, "Technology")).toBe("en");
});

test("chieu c — khu trung lap chay tren text, khong tren phan tu tho", () => {
	const o = ve(
		createElement(MetaLine, {
			parts: [
				{ text: "Technology" },
				{ text: "Technology", lang: "en" as const },
			],
		}),
	);
	const dem = [...o.querySelectorAll("span")].filter(
		(s) => s.textContent?.trim().replace(/^·\s*/, "") === "Technology",
	).length;

	expect(dem).toBe(1);
});

test("chieu d — doan gioi thieu tieng Anh tu khai lang duoi vung tieng Viet", () => {
	const o = ve(
		createElement(CompanyAbout, {
			title: "Giới thiệu",
			description: "Acme builds logistics software for ports.",
		}),
		"vi",
	);
	expect(vungKhai(o, "Acme builds logistics")).toBe("en");
	expect(vungKhai(o, "Giới thiệu")).toBe("vi");

	const rong = ve(
		createElement(CompanyAbout, { title: "Giới thiệu", description: null }),
		"vi",
	);
	expect(rong.textContent).toBe("");
});
