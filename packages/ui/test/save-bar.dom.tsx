import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Button } from "../src/components/button";
import { LocaleProvider } from "../src/components/locale-provider";
import { SaveBar } from "../src/components/save-bar";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const MUC = [
	{ id: "a", label: "«Giá» — chưa kết luận", href: "#chu-de-a" },
	{ id: "b", label: "«Kho» — chưa có lý do", href: "#chu-de-b" },
	{ id: "c", label: "2 ý chưa gom", href: "#y-chua-gom" },
];

function ve(
	items?: typeof MUC,
	defaultOpen?: boolean,
	layout?: "inline" | "checklist",
) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<SaveBar
					defaultOpen={defaultOpen}
					items={items}
					layout={layout}
					open
					title="Chưa công bố được — còn 3 điều"
				>
					<Button disabled size="sm">
						Công bố
					</Button>
				</SaveBar>
			</LocaleProvider>,
		),
	);
	const thanh = document.querySelector<HTMLElement>('[data-slot="save-bar"]');
	if (!thanh) throw new Error("không thấy thanh lưu");
	return thanh;
}

describe("save-bar — biến thể danh sách", () => {
	test("ba mục in ba liên kết tới đúng neo, vai status", () => {
		const thanh = ve(MUC);
		const lienKet = [...thanh.querySelectorAll("ul a")];
		expect(lienKet.map((a) => a.getAttribute("href"))).toEqual([
			"#chu-de-a",
			"#chu-de-b",
			"#y-chua-gom",
		]);
		expect(lienKet.map((a) => a.textContent)).toEqual(MUC.map((m) => m.label));
		expect(thanh.getAttribute("role")).toBe("status");
		expect(thanh.querySelector('[role="alert"]')).toBeNull();
	});

	test("nút gập mở và đóng danh sách, nối aria-controls với danh sách", () => {
		const thanh = ve(MUC);
		const nut = thanh.querySelector<HTMLButtonElement>("button[aria-controls]");
		const ds = thanh.querySelector("ul");
		expect(nut?.getAttribute("aria-controls")).toBe(ds?.id ?? "");
		expect(nut?.getAttribute("aria-expanded")).toBe("false");
		expect(ds?.getAttribute("data-mo")).toBe("false");
		act(() => nut?.click());
		expect(nut?.getAttribute("aria-expanded")).toBe("true");
		expect(ds?.getAttribute("data-mo")).toBe("true");
		act(() => nut?.click());
		expect(nut?.getAttribute("aria-expanded")).toBe("false");
	});

	test("checklist + defaultOpen: danh sách mở sẵn ở mọi khổ, trải hết bề ngang dưới hàng tiêu đề, gập được, tiêu đề xuống dòng", () => {
		const thanh = ve(MUC, true, "checklist");
		const nut = thanh.querySelector<HTMLButtonElement>("button[aria-controls]");
		const ds = thanh.querySelector("ul");
		const tieuDe = thanh.querySelector("p");
		const truoc = {
			mo: ds?.getAttribute("data-mo"),
			hien: ds?.classList.contains("hidden"),
			cuon: ds?.classList.contains("overflow-y-auto"),
			nutMoiKho: nut?.classList.contains("md:hidden"),
			cat: tieuDe?.classList.contains("truncate"),
			expanded: nut?.getAttribute("aria-expanded"),
			traiHet: ds?.parentElement === thanh,
			tran: ["max-h-24", "md:max-h-40"].every((c) => ds?.classList.contains(c)),
		};
		act(() => nut?.click());
		expect({
			truoc,
			sau: {
				mo: ds?.getAttribute("data-mo"),
				an: ds?.classList.contains("hidden"),
			},
		}).toEqual({
			truoc: {
				mo: "true",
				hien: false,
				cuon: true,
				nutMoiKho: false,
				cat: false,
				expanded: "true",
				traiHet: true,
				tran: true,
			},
			sau: { mo: "false", an: true },
		});
	});

	test("defaultOpen={false} vẽ y hệt khi không truyền", () => {
		const html = (x: HTMLElement) =>
			x.outerHTML.replace(/id="[^"]*"|aria-controls="[^"]*"/g, "");
		const a = html(ve(MUC, false));
		act(() => root?.unmount());
		khung?.remove();
		const b = html(ve(MUC));
		expect(a).toBe(b);
	});

	test("không truyền danh sách thì giữ thanh lưu cũ", () => {
		const thanh = ve();
		expect(thanh.querySelector("ul")).toBeNull();
		expect(thanh.querySelector("button[aria-controls]")).toBeNull();
		expect(thanh.getAttribute("role")).toBeNull();
	});
});

describe("save-bar — giữ chỗ cho thanh dính đáy", () => {
	function veGiuCho(giuCho: boolean | undefined, chieuCao: number) {
		const goc = Object.getOwnPropertyDescriptor(
			HTMLElement.prototype,
			"offsetHeight",
		);
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
			configurable: true,
			get(this: HTMLElement) {
				return this.getAttribute("data-slot") === "save-bar" ? chieuCao : 0;
			},
		});
		try {
			khung = document.createElement("div");
			document.body.appendChild(khung);
			root = createRoot(khung);
			act(() =>
				root?.render(
					<LocaleProvider locale="vi">
						<SaveBar
							defaultOpen
							items={MUC}
							layout="checklist"
							open
							reserveSpace={giuCho}
							title="Chưa công bố được — còn 3 điều"
						>
							<Button size="sm">Công bố</Button>
						</SaveBar>
					</LocaleProvider>,
				),
			);
		} finally {
			if (goc)
				Object.defineProperty(HTMLElement.prototype, "offsetHeight", goc);
		}
		return document.querySelector<HTMLElement>('[data-slot="save-bar-spacer"]');
	}

	test("reserveSpace: một khối giữ chỗ trong luồng trang, cao bằng thanh cộng lề đáy của lớp dính", () => {
		const giuCho = veGiuCho(true, 246);
		const lop = document.querySelector<HTMLElement>(
			'[data-slot="save-bar"]',
		)?.parentElement;
		const leDay = Number.parseFloat(
			lop ? getComputedStyle(lop).paddingBottom || "0" : "0",
		);
		expect({
			coKhoi: giuCho !== null,
			anVoiDocMan: giuCho?.getAttribute("aria-hidden"),
			trongLuong: giuCho?.parentElement === khung,
			cao: giuCho?.style.height,
		}).toEqual({
			coKhoi: true,
			anVoiDocMan: "true",
			trongLuong: true,
			cao: `${246 + (Number.isNaN(leDay) ? 0 : leDay)}px`,
		});
	});

	test("không truyền reserveSpace thì không có khối giữ chỗ", () => {
		expect(veGiuCho(undefined, 246)).toBeNull();
	});
});

describe("save-bar — danh sách cuộn không che chữ", () => {
	test("danh sách tràn: gạch đáy và dòng gợi ý cuộn, không lớp mask nào trên phần tử cuộn", () => {
		const goc = {
			cuon: Object.getOwnPropertyDescriptor(
				HTMLElement.prototype,
				"scrollHeight",
			),
			khung: Object.getOwnPropertyDescriptor(
				HTMLElement.prototype,
				"clientHeight",
			),
		};
		Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
			configurable: true,
			get: () => 300,
		});
		Object.defineProperty(HTMLElement.prototype, "clientHeight", {
			configurable: true,
			get: () => 100,
		});
		try {
			const thanh = ve(MUC, true, "checklist");
			const ds = thanh.querySelector("ul");
			expect({
				tran: ds?.getAttribute("data-tran"),
				gachDay: ds?.classList.contains("border-b"),
				mask: /(^|\s)mask-/.test(ds?.getAttribute("class") ?? ""),
				goiY:
					thanh.querySelector('[data-slot="save-bar-scroll-hint"]') !== null,
			}).toEqual({ tran: "true", gachDay: true, mask: false, goiY: true });
		} finally {
			if (goc.cuon)
				Object.defineProperty(HTMLElement.prototype, "scrollHeight", goc.cuon);
			if (goc.khung)
				Object.defineProperty(HTMLElement.prototype, "clientHeight", goc.khung);
		}
	});
});
