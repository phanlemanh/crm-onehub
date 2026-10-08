import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../src/components/dropdown-menu";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function moMenuCon(lopNoiGoi?: string): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () =>
		root?.render(
			<DropdownMenu>
				<DropdownMenuTrigger>Mở</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Tiêu chí</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className={lopNoiGoi}>
							<DropdownMenuItem>Một</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</DropdownMenu>,
		),
	);
	const nut = o.querySelector("button");
	if (!(nut instanceof HTMLElement)) throw new Error("khong co nut mo menu");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			nut.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	const trig = document.body.querySelector(
		'[data-slot="dropdown-menu-sub-trigger"]',
	);
	if (!(trig instanceof HTMLElement)) throw new Error("khong co menu con");
	await act(async () => trig.click());
	const hop = document.body.querySelector(
		'[data-slot="dropdown-menu-sub-content"]',
	);
	if (!(hop instanceof HTMLElement)) throw new Error("menu con khong mo");
	return hop;
}

const BIEN = "--radix-popper-available-width";

function lopDich(hop: HTMLElement): { phai: boolean; trai: boolean } {
	const lop = hop.className.split(/\s+/);
	return {
		phai: lop.some(
			(l) => l.startsWith("data-[side=right]:translate-x-") && l.includes(BIEN),
		),
		trai: lop.some(
			(l) => l.startsWith("data-[side=left]:translate-x-") && l.includes(BIEN),
		),
	};
}

describe("lop-dich", () => {
	test("dong 1: menu con mang lop dich cho ca hai phia", async () => {
		const ket = lopDich(await moMenuCon());
		expect(ket.phai ? "co" : "thieu lop dich phia phai").toBe("co");
		expect(ket.trai ? "co" : "thieu lop dich phia trai").toBe("co");
	});

	test("dong 2: lop cua noi goi duoc ghep them, khong thay lop dich", async () => {
		const hop = await moMenuCon("max-h-72");
		expect({
			noiGoi: hop.className.split(/\s+/).includes("max-h-72"),
			...lopDich(hop),
		}).toEqual({ noiGoi: true, phai: true, trai: true });
	});

	test("dong 3: data-slot cua menu con giu nguyen", async () => {
		const hop = await moMenuCon();
		expect(hop.getAttribute("data-slot")).toBe("dropdown-menu-sub-content");
	});
});
