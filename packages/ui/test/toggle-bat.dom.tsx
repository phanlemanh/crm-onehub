import { afterEach, describe, expect, test } from "bun:test";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
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
			lop(dau).includes("invisible") &&
			lop(dau).includes("group-data-[state=on]/toggle:visible") &&
			!lop(dau).includes("hidden"),
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

describe("toggle — outline-check giữ chỗ cho dấu tích", () => {
	test("dấu tích và icon của nơi gọi chồng trong cùng một ô: bật hay tắt thì bề ngang không đổi", () => {
		const o = ve(
			<Toggle icon={ThumbsUp} variant="outline-check">
				Tôi cũng nghĩ vậy
			</Toggle>,
		);
		const nut = o.querySelector('[data-slot="toggle"]');
		const o1 = nut?.querySelector('[data-slot="toggle-mark"]');
		const con = [...(o1?.children ?? [])];
		const ghi = () => ({
			state: nut?.getAttribute("data-state"),
			soO: nut?.querySelectorAll('[data-slot="toggle-mark"]').length,
			con: con.map((c) => c.getAttribute("data-slot")),
			chong:
				lop(o1).includes("*:col-start-1") && lop(o1).includes("*:row-start-1"),
			iconAnKhiBat: lop(con[0]).includes(
				"group-data-[state=on]/toggle:invisible",
			),
			bienMoi: [...(nut?.children ?? [])].map(
				(c) => c.getAttribute("data-slot") ?? c.nodeName,
			),
		});
		const truoc = ghi();
		act(() => (nut as HTMLButtonElement).click());
		expect({ truoc, sau: ghi() }).toEqual({
			truoc: {
				state: "off",
				soO: 1,
				con: ["toggle-icon", "toggle-check"],
				chong: true,
				iconAnKhiBat: true,
				bienMoi: ["toggle-mark"],
			},
			sau: {
				state: "on",
				soO: 1,
				con: ["toggle-icon", "toggle-check"],
				chong: true,
				iconAnKhiBat: true,
				bienMoi: ["toggle-mark"],
			},
		});
	});

	test("nhóm nút: mục chưa chọn cũng giữ ô dấu tích (ẩn chứ không bỏ khỏi dòng)", () => {
		const o = ve(
			<ToggleGroup type="single" variant="outline-check">
				<ToggleGroupItem value="chon">Chọn</ToggleGroupItem>
				<ToggleGroupItem value="de-sau">Để sau</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(
			[...o.querySelectorAll('[data-slot="toggle-group-item"]')].map(
				(m) => m.querySelectorAll('[data-slot="toggle-mark"]').length,
			),
		).toEqual([1, 1]);
	});
});

describe("toggle — asChild", () => {
	test("Toggle asChild với biến thể outline-check dựng đúng một phần tử con, không ô dấu tích", () => {
		const o = ve(
			<Toggle asChild variant="outline-check">
				<a href="#chon">Chọn</a>
			</Toggle>,
		);
		const a = o.querySelector("a");
		expect({
			slot: a?.getAttribute("data-slot"),
			chu: a?.textContent,
			o: o.querySelectorAll('[data-slot="toggle-mark"]').length,
		}).toEqual({ slot: "toggle", chu: "Chọn", o: 0 });
	});

	test("ToggleGroupItem asChild với biến thể outline-check dựng đúng một phần tử con", () => {
		const o = ve(
			<ToggleGroup type="single" variant="outline-check">
				<ToggleGroupItem asChild value="chon">
					<a href="#chon">Chọn</a>
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		const a = o.querySelector("a");
		expect({
			slot: a?.getAttribute("data-slot"),
			chu: a?.textContent,
			o: o.querySelectorAll('[data-slot="toggle-mark"]').length,
		}).toEqual({ slot: "toggle-group-item", chu: "Chọn", o: 0 });
	});
});
