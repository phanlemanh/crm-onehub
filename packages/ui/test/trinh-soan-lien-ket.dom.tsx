import { afterEach, describe, expect, test } from "bun:test";
import { slugTuDuongDan } from "@crm/validation/tai-lieu";
import { tuanTuHoa } from "@crm/validation/tai-lieu-markdown";
import type { Editor } from "@tiptap/react";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TrinhSoan } from "../src/components/trinh-soan";
import type { TrangGoiY } from "../src/components/trinh-soan-lien-ket-trang";
import { GOI_Y, NHAN_NUT, NHAN_O } from "./trinh-soan-vat";

const NHAN_LIEN_KET_TRANG = {
	nut: "Liên kết tới trang",
	tim: "Gõ tên trang",
	goThem: "Gõ ít nhất hai chữ.",
	khongCo: "Không có trang nào khớp.",
};

const TRANG: TrangGoiY[] = [
	{
		slug: "quy-dinh-hoa-hong-doi-tac",
		ten: "Quy định hoa hồng đối tác",
		duong: "/ws/tai-lieu/quy-dinh-hoa-hong-doi-tac",
	},
];

const goi: string[] = [];

async function timTrang(q: string): Promise<readonly TrangGoiY[]> {
	goi.push(q);
	return TRANG;
}

type ORieng = HTMLElement & { editor?: Editor };

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	goi.length = 0;
});

function Vo({ dau, coTim }: { dau: string; coTim: boolean }) {
	const [giaTri, setGiaTri] = useState(dau);
	return (
		<TrinhSoan
			giaTri={giaTri}
			goiY={GOI_Y}
			nhan={NHAN_O}
			nhanLienKetTrang={coTim ? NHAN_LIEN_KET_TRANG : undefined}
			nhanNut={NHAN_NUT}
			onDoi={setGiaTri}
			timTrang={coTim ? timTrang : undefined}
		/>
	);
}

const nhip = () => new Promise((r) => setTimeout(r, 20));

async function mo(dau: string, coTim = true) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(<Vo coTim={coTim} dau={dau} />);
		await nhip();
	});
	const o = khung.querySelector<ORieng>('[role="textbox"]');
	const editor = o?.editor;
	if (!editor) throw new Error("chen-lien-ket: chua gan editor");
	return editor;
}

async function bam(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) {
		throw new Error("chen-lien-ket: khong thay phan tu");
	}
	await act(async () => {
		el.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
		el.dispatchEvent(new window.MouseEvent("mouseup", { bubbles: true }));
		el.click();
		await nhip();
	});
}

async function go(chu: string): Promise<void> {
	const o = document.body.querySelector<HTMLInputElement>(
		`input[aria-label="${NHAN_LIEN_KET_TRANG.tim}"]`,
	);
	if (!o) throw new Error("chen-lien-ket: khong thay o tim trang");
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new window.Event("input", { bubbles: true }));
		await nhip();
	});
	await act(async () => {
		await nhip();
	});
}

function nutLienKetTrang(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		`button[aria-label="${NHAN_LIEN_KET_TRANG.nut}"]`,
	);
}

function kiemHref(md: string): void {
	const href = /\]\(([^)]+)\)/.exec(md)?.[1] ?? "";
	if (href !== TRANG[0]?.duong || slugTuDuongDan(href) !== TRANG[0]?.slug) {
		throw new Error("chen-lien-ket: href khong phai /<ws>/tai-lieu/<slug>");
	}
}

describe("chen-lien-ket-ui", () => {
	test("chen-lien-ket: khong truyen timTrang thi khong co nut", async () => {
		await mo("Một đoạn.\n", false);
		expect(nutLienKetTrang()).toBeNull();
	});

	test("chen-lien-ket: chon chu, tim trang, chon dong thi chu thanh lien ket toi trang", async () => {
		const editor = await mo("Xem quy dinh o day nhe.\n");
		await act(async () => {
			editor.commands.setTextSelection({ from: 5, to: 19 });
		});
		await bam(nutLienKetTrang());
		await go("hoa");
		expect(goi).toContain("hoa");
		await bam(
			document.body.querySelector(
				'[data-goi-y-trang="quy-dinh-hoa-hong-doi-tac"]',
			),
		);
		const md = tuanTuHoa(editor.getJSON());
		kiemHref(md);
		expect(md).toBe(
			"Xem [quy dinh o day](/ws/tai-lieu/quy-dinh-hoa-hong-doi-tac) nhe.",
		);
	});

	test("chen-lien-ket: khong chon chu thi chen ten trang mang lien ket", async () => {
		const editor = await mo("Xem \n");
		await act(async () => {
			editor.commands.setTextSelection(5);
		});
		await bam(nutLienKetTrang());
		await go("quy dinh");
		await bam(
			document.body.querySelector(
				'[data-goi-y-trang="quy-dinh-hoa-hong-doi-tac"]',
			),
		);
		const md = tuanTuHoa(editor.getJSON());
		kiemHref(md);
		expect(md).toContain(
			"[Quy định hoa hồng đối tác](/ws/tai-lieu/quy-dinh-hoa-hong-doi-tac)",
		);
	});

	test("chen-lien-ket: Esc dong hop va tra focus ve trinh soan", async () => {
		const editor = await mo("Một đoạn.\n");
		await bam(nutLienKetTrang());
		const o = document.body.querySelector<HTMLInputElement>(
			`input[aria-label="${NHAN_LIEN_KET_TRANG.tim}"]`,
		);
		expect(o).not.toBeNull();
		await act(async () => {
			o?.dispatchEvent(
				new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
			await nhip();
		});
		expect(
			document.body.querySelector(
				`input[aria-label="${NHAN_LIEN_KET_TRANG.tim}"]`,
			),
		).toBeNull();
		expect(editor.view.dom.contains(document.activeElement)).toBe(true);
	});
});
