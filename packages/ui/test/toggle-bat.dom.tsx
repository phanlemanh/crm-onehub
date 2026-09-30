import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Toggle } from "../src/components/toggle";
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

function ve(nut: React.ReactNode): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(nut));
	return khung;
}

function lop(e: Element | null | undefined): string[] {
	return (e?.getAttribute("class") ?? "").split(/\s+/);
}

function dangBat(e: Element | null | undefined) {
	const dau = e?.querySelector('[data-slot="toggle-check"]');
	return {
		state: e?.getAttribute("data-state"),
		coDau: dau !== null && dau !== undefined,
		dauChiHienKhiBat:
			lop(dau).includes("hidden") &&
			lop(dau).includes("group-data-[state=on]/toggle:inline-block"),
		dauAnVoiDocGia: dau?.getAttribute("aria-hidden"),
	};
}

describe("toggle — biến thể outline-check", () => {
	test("đang bật có nền và dấu tích, khác hẳn vòng focus: không dùng lại viền ring của lúc được chọn bằng phím", () => {
		const o = ve(
			<Toggle aria-label="Tôi cũng nghĩ vậy" variant="outline-check">
				Tôi cũng nghĩ vậy
			</Toggle>,
		);
		const nut = o.querySelector('[data-slot="toggle"]');
		const truoc = dangBat(nut);
		act(() => (nut as HTMLButtonElement).click());
		const cls = lop(nut);
		expect({
			truoc,
			sau: dangBat(nut),
			pressed: nut?.getAttribute("aria-pressed"),
			nenKhiBat: cls.includes("data-[state=on]:bg-accent"),
			vienGiongFocus: cls.filter(
				(c) =>
					c.startsWith("data-[state=on]:ring") ||
					c === "data-[state=on]:border-ring",
			),
			focus: cls.filter((c) => c.startsWith("focus-visible:ring")),
		}).toEqual({
			truoc: {
				state: "off",
				coDau: true,
				dauChiHienKhiBat: true,
				dauAnVoiDocGia: "true",
			},
			sau: {
				state: "on",
				coDau: true,
				dauChiHienKhiBat: true,
				dauAnVoiDocGia: "true",
			},
			pressed: "true",
			nenKhiBat: true,
			vienGiongFocus: [],
			focus: ["focus-visible:ring-2", "focus-visible:ring-ring/50"],
		});
	});

	test("nhóm nút dùng cùng biến thể: mục đang chọn có dấu tích, mục khác tắt", () => {
		const o = ve(
			<ToggleGroup
				aria-label="Kết luận"
				defaultValue="de-sau"
				type="single"
				variant="outline-check"
			>
				<ToggleGroupItem value="chon">Chọn</ToggleGroupItem>
				<ToggleGroupItem value="de-sau">Để sau</ToggleGroupItem>
			</ToggleGroup>,
		);
		const muc = [...o.querySelectorAll('[data-slot="toggle-group-item"]')];
		expect(
			muc.map((m) => ({
				chu: m.textContent,
				...dangBat(m),
				nenKhiBat: lop(m).includes("data-[state=on]:bg-accent"),
			})),
		).toEqual([
			{
				chu: "Chọn",
				state: "off",
				coDau: true,
				dauChiHienKhiBat: true,
				dauAnVoiDocGia: "true",
				nenKhiBat: true,
			},
			{
				chu: "Để sau",
				state: "on",
				coDau: true,
				dauChiHienKhiBat: true,
				dauAnVoiDocGia: "true",
				nenKhiBat: true,
			},
		]);
	});

	test("biến thể outline cũ giữ nguyên: không dấu tích", () => {
		const o = ve(
			<Toggle defaultPressed variant="outline">
				Cũ
			</Toggle>,
		);
		expect(
			o.querySelector('[data-slot="toggle"] [data-slot="toggle-check"]'),
		).toBeNull();
	});
});
