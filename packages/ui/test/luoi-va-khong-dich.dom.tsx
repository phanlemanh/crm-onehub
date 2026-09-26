import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Combobox } from "../src/components/combobox";
import { LocaleProvider } from "../src/components/locale-provider";
import { ToggleGroup, ToggleGroupItem } from "../src/components/toggle-group";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function ve(cay: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () =>
		root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>),
	);
	return o;
}

function nhom(layout?: "grid-2") {
	return (
		<ToggleGroup layout={layout} type="single" variant="outline">
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
		</ToggleGroup>
	);
}

describe("toggle-group-luoi", () => {
	test("layout grid-2: hai cột ở màn hẹp, hàng ngang từ sm", async () => {
		const o = await ve(nhom("grid-2"));
		const goc = o.querySelector('[data-slot="toggle-group"]');
		const lop = goc?.className.split(/\s+/) ?? [];
		expect({
			layout: goc?.getAttribute("data-layout"),
			luoi: ["grid", "grid-cols-2", "w-full", "sm:flex", "sm:w-fit"].filter(
				(c) => !lop.includes(c),
			),
			conFlexTrenHep: lop.includes("flex") || lop.includes("w-fit"),
		}).toEqual({ layout: "grid-2", luoi: [], conFlexTrenHep: false });
	});

	test("doi chung — không khai layout thì giữ hàng ngang như cũ", async () => {
		const o = await ve(nhom());
		const goc = o.querySelector('[data-slot="toggle-group"]');
		const lop = goc?.className.split(/\s+/) ?? [];
		expect({
			layout: goc?.getAttribute("data-layout"),
			flex: lop.includes("flex") && lop.includes("w-fit"),
			luoi: lop.includes("grid-cols-2"),
		}).toEqual({ layout: null, flex: true, luoi: false });
	});
});

describe("combobox-khong-dich", () => {
	test("translate=no tới cả nút và danh sách trong popover", async () => {
		const o = await ve(
			<Combobox
				onValueChange={() => {}}
				options={[{ value: "p1", label: "Kinh doanh vùng 1" }]}
				translate="no"
				value="p1"
			/>,
		);
		const nut = o.querySelector('[data-slot="combobox-trigger"]');
		if (!(nut instanceof HTMLElement)) throw new Error("khong co nut");
		await act(async () => {
			for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
				nut.dispatchEvent(
					new window.PointerEvent(loai, {
						bubbles: true,
						button: 0,
						pointerType: "mouse",
					}),
				);
		});
		const hop = document.body.querySelector('[data-slot="popover-content"]');
		expect({
			nut: nut.getAttribute("translate"),
			hop: hop?.getAttribute("translate") ?? null,
		}).toEqual({ nut: "no", hop: "no" });
	});
});
