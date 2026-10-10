import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Timeline,
	TimelineDate,
	TimelineHeader,
	TimelineItem,
	TimelineTitle,
} from "../src/components/reui/timeline";

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

function haiMuc(rail: boolean) {
	return (
		<Timeline rail={rail} value={1}>
			{[1, 2].map((buoc) => (
				<TimelineItem key={buoc} step={buoc}>
					<TimelineHeader>
						<TimelineDate>2026-12-0{buoc}</TimelineDate>
						<TimelineTitle>Mốc {buoc}</TimelineTitle>
					</TimelineHeader>
				</TimelineItem>
			))}
		</Timeline>
	);
}

const LOP_RAIL = "group-data-[rail=true]/timeline:";

describe("Timeline — biến thể thanh ngày", () => {
	test("rail đặt data-rail trên gốc, mục và ngày mang lớp của thanh", () => {
		const o = ve(haiMuc(true));
		const goc = o.querySelector('[data-slot="timeline"]');
		expect(goc?.getAttribute("data-rail")).toBe("true");
		const muc = o.querySelectorAll('[data-slot="timeline-item"]');
		const ngay = o.querySelectorAll('[data-slot="timeline-date"]');
		expect(muc.length).toBe(2);
		expect(ngay.length).toBe(2);
		for (const m of muc) expect(m.className).toContain(`${LOP_RAIL}ms-36`);
		for (const d of ngay) {
			expect(d.className).toContain(`${LOP_RAIL}absolute`);
			expect(d.className).toContain(`${LOP_RAIL}-left-36`);
		}
	});

	test("không rail thì gốc không mang data-rail", () => {
		const goc = ve(haiMuc(false)).querySelector('[data-slot="timeline"]');
		expect(goc?.hasAttribute("data-rail")).toBe(false);
	});
});
