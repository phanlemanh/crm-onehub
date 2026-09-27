import { afterEach, describe, expect, test } from "bun:test";
import { Button } from "@crm/ui/components/button";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Input } from "@crm/ui/components/input";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DetailSheet, DetailSheetHeader } from "@/components/detail-sheet";
import { crmMessages } from "@/lib/messages/crm";

const RONG_MAY_TINH = 1440;
const RONG_DIEN_THOAI = 375;
const CHO_VAUL_MO_MS = 550;

let root: Root | null = null;
let khung: HTMLElement | null = null;

function datRong(rong: number) {
	Object.defineProperty(window, "innerWidth", {
		value: rong,
		configurable: true,
		writable: true,
	});
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
	datRong(RONG_MAY_TINH);
});

async function cho(ms = 0) {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, ms));
	});
}

function OTuLuu({ onSave }: { onSave: (v: string) => void }) {
	const [giaTri, datGiaTri] = useState("Lan");
	return (
		<Input
			aria-label="Chức danh"
			value={giaTri}
			onChange={(e) => datGiaTri(e.target.value)}
			onBlur={() => onSave(giaTri)}
		/>
	);
}

function OTraoDoi() {
	const [noiDung, datNoiDung] = useState("");
	const khaiThayDoi = useKhaiThayDoi();
	return (
		<>
			<Textarea
				aria-label="Trao đổi"
				value={noiDung}
				onChange={(e) => {
					datNoiDung(e.target.value);
					khaiThayDoi(e.target.value.trim() !== "");
				}}
			/>
			<Button
				onClick={() => {
					datNoiDung("");
					khaiThayDoi(false);
				}}
			>
				Gửi
			</Button>
		</>
	);
}

function VoNgan({
	ghi,
	luu,
}: {
	ghi: (mo: boolean) => void;
	luu: (v: string) => void;
}) {
	const [mo, datMo] = useState(true);
	return (
		<DetailSheet
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
		>
			<DetailSheetHeader title="Nguyễn Thị Lan" description="Liên hệ" />
			<OTuLuu onSave={luu} />
			<OTraoDoi />
		</DetailSheet>
	);
}

async function dung(ghi: (mo: boolean) => void, luu: (v: string) => void) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<VoNgan ghi={ghi} luu={luu} />
			</LocaleProvider>,
		),
	);
	await cho();
}

function o(nhan: string): HTMLInputElement | HTMLTextAreaElement {
	const phan = document.querySelector(`[aria-label='${nhan}']`) as
		| HTMLInputElement
		| HTMLTextAreaElement
		| null;
	if (!phan) throw new Error(`khong thay o ${nhan}`);
	return phan;
}

async function go(phan: HTMLInputElement | HTMLTextAreaElement, chu: string) {
	await act(async () => {
		phan.focus();
		Object.getOwnPropertyDescriptor(
			Object.getPrototypeOf(phan),
			"value",
		)?.set?.call(phan, chu);
		phan.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
	await cho();
}

async function roiO(phan: HTMLElement) {
	await act(async () => {
		phan.blur();
	});
	await cho();
}

async function bamLopPhu() {
	const lop = document.querySelector(
		"[data-slot='sheet-overlay'],[data-slot='drawer-overlay']",
	) as HTMLElement | null;
	if (!lop) throw new Error("khong thay lop phu");
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		lop.click();
	});
	await cho();
}

async function esc() {
	await act(async () => {
		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await cho();
}

async function bam(chu: string) {
	const nut = [...document.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!nut) throw new Error(`khong thay nut ${chu}`);
	await act(async () => nut.click());
	await cho();
}

function ngan(): boolean {
	return (
		document.querySelector(
			"[data-slot='sheet-content'],[data-slot='drawer-content']",
		) !== null
	);
}

function hoi(): number {
	return document.querySelectorAll("[role='alertdialog']").length;
}

function nutX(): HTMLButtonElement {
	const dong = crmMessages("vi").sheet.close;
	const nut = [...document.querySelectorAll("button")].find(
		(b) => b.querySelector(".sr-only")?.textContent === dong,
	);
	if (!nut) throw new Error("khong thay dau X cua ngan");
	return nut;
}

function khop<T>(thucTe: T, mongDoi: T, thongDiep: string) {
	if (!Bun.deepEquals(thucTe, mongDoi)) {
		throw new Error(
			`${thongDiep}\n  thuc te:  ${JSON.stringify(thucTe)}\n  mong doi: ${JSON.stringify(mongDoi)}`,
		);
	}
	expect(thucTe).toEqual(mongDoi);
}

async function suaOTuLuu(daLuu: string[]) {
	const phan = o("Chức danh");
	await go(phan, "Trưởng phòng");
	await roiO(phan);
	khop(daLuu, ["Trưởng phòng"], "ngan-ban-ghi: o tu luu chua luu khi roi o");
}

describe("ngan-ban-ghi", () => {
	test("ngan-ban-ghi: (1) sua o tu luu, roi o, bam lop phu thi ngan dong", async () => {
		const lich: boolean[] = [];
		const daLuu: string[] = [];
		await dung(
			(v) => lich.push(v),
			(v) => daLuu.push(v),
		);
		await suaOTuLuu(daLuu);
		await bamLopPhu();
		khop(
			{ con: ngan(), hoi: hoi(), lich },
			{ con: false, hoi: 0, lich: [false] },
			"ngan-ban-ghi: o tu luu giu ngan",
		);
	});

	test("ngan-ban-ghi: (2) sua o tu luu, roi o, Esc va dau X dong khong hoi", async () => {
		for (const duong of ["esc", "x"] as const) {
			const lich: boolean[] = [];
			const daLuu: string[] = [];
			await dung(
				(v) => lich.push(v),
				(v) => daLuu.push(v),
			);
			await suaOTuLuu(daLuu);
			if (duong === "esc") await esc();
			else await act(async () => nutX().click());
			await cho();
			khop(
				{ con: ngan(), hoi: hoi(), lich },
				{ con: false, hoi: 0, lich: [false] },
				`ngan-ban-ghi: o tu luu giu ngan (${duong})`,
			);
			act(() => root?.unmount());
			document.body.innerHTML = "";
		}
	});

	test("ngan-ban-ghi: (3) o trao doi con chu thi bam lop phu giu, Esc hoi", async () => {
		const lich: boolean[] = [];
		await dung(
			(v) => lich.push(v),
			() => {},
		);
		await go(o("Trao đổi"), "Hẹn gọi lại thứ Hai");
		await bamLopPhu();
		const sauLopPhu = { con: ngan(), hoi: hoi(), goi: lich.length };
		await esc();
		khop(
			{ sauLopPhu, hoi: hoi(), goi: lich.length, chu: o("Trao đổi").value },
			{
				sauLopPhu: { con: true, hoi: 0, goi: 0 },
				hoi: 1,
				goi: 0,
				chu: "Hẹn gọi lại thứ Hai",
			},
			"ngan-ban-ghi: o trao doi con chu ma khong giu",
		);
	});

	test("ngan-ban-ghi: (4) gui xong binh luan thi bam lop phu dong", async () => {
		const lich: boolean[] = [];
		await dung(
			(v) => lich.push(v),
			() => {},
		);
		await go(o("Trao đổi"), "Hẹn gọi lại thứ Hai");
		await bam("Gửi");
		await bamLopPhu();
		khop(
			{ con: ngan(), hoi: hoi(), lich },
			{ con: false, hoi: 0, lich: [false] },
			"ngan-ban-ghi: gui xong van giu ngan",
		);
	});

	test("ngan-ban-ghi: (5) dien thoai — sua o tu luu roi Esc dong khong hoi", async () => {
		datRong(RONG_DIEN_THOAI);
		const lich: boolean[] = [];
		const daLuu: string[] = [];
		await dung(
			(v) => lich.push(v),
			(v) => daLuu.push(v),
		);
		await cho(CHO_VAUL_MO_MS);
		const laDrawer =
			document.querySelector("[data-slot='drawer-content']") !== null;
		await suaOTuLuu(daLuu);
		await esc();
		khop(
			{ laDrawer, con: ngan(), hoi: hoi(), lich },
			{ laDrawer: true, con: false, hoi: 0, lich: [false] },
			"ngan-ban-ghi: o tu luu giu drawer",
		);
	});
});
