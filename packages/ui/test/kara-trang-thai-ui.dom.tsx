import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraSteps } from "../src/components/kara/steps";
import { LocaleProvider } from "../src/components/locale-provider";
import { Toaster } from "../src/components/sonner";
import { VungTaiLoi } from "../src/components/vung-tai-loi";
import { baoDaLuuTru } from "../src/lib/bao-luu-tru";
import type { Locale } from "../src/lib/locale";
import { messages } from "../src/lib/messages";

const VI = messages("vi");

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
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
	return o;
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll("button")].filter(
		(b) => (b.textContent ?? "").trim() === ten,
	);
}

async function nhip(lan = 5) {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function cho(dieu: () => boolean, moTa: string) {
	for (let i = 0; i < 100; i += 1) {
		if (dieu()) return;
		await nhip(1);
	}
	throw new Error(`khong toi: ${moTa}`);
}

describe("kara-trang-thai-ui", () => {
	test("vung-tai-loi: chu, Thu lai goi mot lan, dang tai thi khoa", () => {
		let goi = 0;
		const o = ve(
			<VungTaiLoi
				tieuDe="⟦tieu de⟧"
				moTa="⟦mo ta⟧"
				onThuLai={() => {
					goi += 1;
				}}
			/>,
		);
		const khung = o.querySelector("[data-vung-tai-loi]");
		phai(khung !== null, "vung-tai-loi: khong co khung");
		expect(khung?.textContent).toContain("⟦tieu de⟧");
		expect(khung?.textContent).toContain("⟦mo ta⟧");
		const nut = nutTen(o, VI.karaKhung.thuLai);
		expect(nut.length).toBe(1);
		act(() => nut[0]?.click());
		expect(goi).toBe(1);
		act(() => root?.unmount());
		const o2 = ve(
			<VungTaiLoi tieuDe="a" moTa="b" onThuLai={() => {}} dangTai />,
		);
		phai(
			nutTen(o2, VI.karaKhung.thuLai)[0]?.disabled === true,
			"vung-tai-loi: dang tai van bam duoc",
		);
	});

	test("bao-luu-tru: toast co Hoan tac, bam hai lan chi goi mot lan", async () => {
		ve(<Toaster />);
		let goi = 0;
		await act(async () => {
			baoDaLuuTru({
				thongDiep: "⟦Đã lưu trữ Hà.⟧",
				nhanHoanTac: "⟦Hoàn tác⟧",
				onHoanTac: () => {
					goi += 1;
				},
			});
		});
		await cho(
			() => (document.body.textContent ?? "").includes("⟦Đã lưu trữ Hà.⟧"),
			"toast",
		);
		const nut = nutTen(document.body, "⟦Hoàn tác⟧");
		phai(nut.length === 1, "bao-luu-tru: toast khong co Hoan tac");
		await act(async () => {
			nut[0]?.click();
			nut[0]?.click();
		});
		await nhip();
		phai(goi === 1, "bao-luu-tru: hoan tac goi hai lan");
	});

	test("buoc-chua-luu: cham canh bao, tieu de, khac buoc xong", () => {
		const o = ve(
			<KaraSteps
				steps={[
					{ id: "1", label: "⟦doc ho so⟧", state: "done" },
					{ id: "2", label: "⟦ghi thong tin⟧", state: "unsaved" },
				]}
			/>,
		);
		const muc = [...o.querySelectorAll("[data-trang-thai]")];
		expect(muc.map((m) => m.getAttribute("data-trang-thai"))).toEqual([
			"xong",
			"chua-luu",
		]);
		const tong = muc.map(
			(m) =>
				m
					.querySelector("[data-slot=indicator-dot]")
					?.getAttribute("data-tone") ?? null,
		);
		phai(tong[1] === "warning", "buoc-chua-luu: cham khong canh bao");
		phai(tong[0] === "success", "buoc-chua-luu: cham xong khong thanh cong");
		expect(muc[1]?.textContent).toContain(VI.karaKhung.buocChuaLuu);
		const trigger = o.querySelector("button");
		expect(trigger?.textContent).toContain(
			VI.karaKhung.buocChuaLuuTieuDe("⟦ghi thong tin⟧"),
		);
	});
});
