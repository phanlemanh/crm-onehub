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

function ve(items?: typeof MUC, defaultOpen?: boolean) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<SaveBar
					defaultOpen={defaultOpen}
					items={items}
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

	test("defaultOpen: danh sách mở sẵn ở mọi khổ, gập được, tiêu đề xuống dòng thay vì cắt", () => {
		const thanh = ve(MUC, true);
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
			},
			sau: { mo: "false", an: true },
		});
	});

	test("không truyền danh sách thì giữ thanh lưu cũ", () => {
		const thanh = ve();
		expect(thanh.querySelector("ul")).toBeNull();
		expect(thanh.querySelector("button[aria-controls]")).toBeNull();
		expect(thanh.getAttribute("role")).toBeNull();
	});
});
