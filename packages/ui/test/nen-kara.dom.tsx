import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraLabel, KaraMark } from "../src/components/kara";
import { LocaleProvider } from "../src/components/locale-provider";
import type { Locale } from "../src/lib/locale";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement, locale: Locale = "vi"): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>));
	return o;
}

function phim(dich: Element, loai: "keydown" | "keyup", key: string): boolean {
	let khongChan = true;
	act(() => {
		khongChan = dich.dispatchEvent(
			new KeyboardEvent(loai, { key, bubbles: true, cancelable: true }),
		);
	});
	return khongChan;
}

function kichHoatNhuTrinhDuyet(dich: HTMLElement, key: "Enter" | " ") {
	const laNut = dich instanceof HTMLButtonElement;
	const xuong = phim(dich, "keydown", key);
	if (key === "Enter") {
		if (laNut && xuong) act(() => dich.click());
		return;
	}
	const len = phim(dich, "keyup", key);
	if (laNut && xuong && len) act(() => dich.click());
}

function oViSao(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		'[data-slot="popover-content"]',
	);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement {
	const nut = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === ten,
	);
	if (!nut) throw new Error(`khong thay nut ${ten}`);
	return nut;
}

const LOP_TO = /^(text|bg)-(primary|brand)/;

describe("nk-dau", () => {
	test("nk-dau: tia sáng ẩn với trình đọc, chữ Kara, màu chữ phụ, không tô", () => {
		for (const [scope, chu] of [
			[undefined, "Kara"],
			["OKR", "Kara · OKR"],
		] as const) {
			const goc = ve(<KaraMark scope={scope} />);
			const dau = goc.querySelector<HTMLElement>('[data-slot="kara-mark"]');
			if (!dau) throw new Error("khong thay dau");
			const svg = dau.querySelectorAll("svg");
			expect(svg.length).toBe(1);
			expect(svg[0]?.getAttribute("aria-hidden")).toBe("true");
			expect(dau.textContent).toBe(chu);
			expect(dau.classList.contains("text-muted-foreground")).toBe(true);
			const to = [dau, ...dau.querySelectorAll("*")].flatMap((el) =>
				[...el.classList].filter((l) => LOP_TO.test(l)),
			);
			if (to.length > 0) throw new Error(`dau to mau: ${to.join(" ")}`);
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
		}
	});
});

describe("nk-vi-sao", () => {
	function dungHang() {
		const dem = { bam: 0, phim: 0 };
		const goc = ve(
			<div
				onClick={() => {
					dem.bam += 1;
				}}
				onKeyDown={() => {
					dem.phim += 1;
				}}
				role="row"
				tabIndex={-1}
			>
				<KaraLabel
					scope="OKR"
					text="2 góp ý"
					reason="Ba KR chưa có đích"
					readAt="09:12"
				/>
				<button type="button">khac</button>
			</div>,
		);
		return { goc, dem };
	}

	test("nk-vi-sao: bấm, Enter, Space mở ô mà không bật hàng; Esc trả focus", async () => {
		const { goc, dem } = dungHang();
		const nut = nutTen(goc, "Vì sao?");
		expect(oViSao()).toBeNull();
		act(() => nut.click());
		const o = oViSao();
		if (!o) throw new Error("o vi sao khong mo khi bam");
		expect(o.textContent).toContain("Kara dựa trên gì");
		expect(o.textContent).toContain("Ba KR chưa có đích");
		expect(o.textContent).toContain("Đọc lúc 09:12");
		if (dem.bam !== 0) throw new Error(`nhan lam mo hang: bam ${dem.bam}`);
		phim(o, "keydown", "Escape");
		expect(oViSao()).toBeNull();
		for (const key of ["Enter", " "] as const) {
			act(() => nut.focus());
			kichHoatNhuTrinhDuyet(nut, key);
			if (!oViSao()) throw new Error(`o vi sao khong mo bang ${key}`);
			phim(oViSao() as HTMLElement, "keydown", "Escape");
			expect(oViSao()).toBeNull();
		}
		if (dem.bam !== 0) throw new Error(`nhan lam mo hang: bam ${dem.bam}`);
		if (dem.phim !== 0) throw new Error(`phim lam mo hang: phim ${dem.phim}`);
		await act(() => new Promise((xong) => setTimeout(xong, 20)));
		expect(document.activeElement).toBe(nut);
	});

	test("nk-vi-sao: đối chứng — Enter trên nút khác trong hàng có tới hàng", () => {
		const { goc, dem } = dungHang();
		const khac = nutTen(goc, "khac");
		act(() => khac.focus());
		phim(khac, "keydown", "Enter");
		expect(dem.phim).toBe(1);
	});
});
