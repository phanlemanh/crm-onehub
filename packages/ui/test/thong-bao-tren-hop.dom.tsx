import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "../src/components/dialog";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "../src/components/sheet";
import { Toaster } from "../src/components/sonner";

const NHAN_NUT = "Hoàn tác";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

async function cho() {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
}

function dung(el: ReactElement) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

function ThongBaoGia() {
	return (
		<ol data-sonner-toaster="">
			<li data-sonner-toast="">
				<button type="button">{NHAN_NUT}</button>
			</li>
		</ol>
	);
}

function HopMo({
	loai,
	ghi,
}: {
	loai: "dialog" | "sheet";
	ghi: (v: boolean) => void;
}) {
	const [mo, datMo] = useState(true);
	const doi = (v: boolean) => {
		ghi(v);
		datMo(v);
	};
	return (
		<>
			{loai === "dialog" ? (
				<Dialog open={mo} onOpenChange={doi}>
					<DialogContent>
						<DialogTitle>Sửa mục tiêu</DialogTitle>
						<DialogDescription>Hộp đang mở</DialogDescription>
					</DialogContent>
				</Dialog>
			) : (
				<Sheet open={mo} onOpenChange={doi}>
					<SheetContent>
						<SheetTitle>Mục tiêu</SheetTitle>
						<SheetDescription>Ngăn đang mở</SheetDescription>
					</SheetContent>
				</Sheet>
			)}
			<ThongBaoGia />
		</>
	);
}

async function bamNutThongBao() {
	const nut = [
		...document.querySelectorAll("[data-sonner-toaster] button"),
	].find((b) => b.textContent?.trim() === NHAN_NUT);
	if (!nut) throw new Error("khong thay nut trong thong bao");
	await act(async () => {
		nut.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		nut.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		(nut as HTMLElement).click();
	});
	await cho();
}

describe("thong-bao-tren-hop", () => {
	for (const loai of ["dialog", "sheet"] as const) {
		test(`bam nut trong thong bao khong dong ${loai} dang mo`, async () => {
			const lich: boolean[] = [];
			dung(<HopMo loai={loai} ghi={(v) => lich.push(v)} />);
			await cho();
			await bamNutThongBao();
			const con =
				document.querySelector(`[data-slot='${loai}-content']`) !== null;
			if (!con || lich.length > 0)
				throw new Error(
					`thong bao tren hop: bam «${NHAN_NUT}» lam ${loai} dong (onOpenChange ${JSON.stringify(lich)})`,
				);
			expect({ con, lich }).toEqual({ con: true, lich: [] });
		});
	}

	test("vung thong bao nhan con tro khi hop modal khoa body", async () => {
		dung(<Toaster />);
		await act(async () => {
			toast.success("Đã nhận", {
				action: { label: NHAN_NUT, onClick: () => {} },
			});
		});
		await cho();
		const vung = document.querySelector("[data-sonner-toaster]");
		if (!vung) throw new Error("khong thay vung thong bao");
		if (!vung.classList.contains("pointer-events-auto"))
			throw new Error(
				`thong bao tren hop: vung thong bao khong co pointer-events-auto (class «${vung.className}»)`,
			);
		expect(vung.classList.contains("pointer-events-auto")).toBe(true);
	});
});
