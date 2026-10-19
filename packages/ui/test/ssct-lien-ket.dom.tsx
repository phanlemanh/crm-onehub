import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, createElement as h, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { MarkdownReader } from "../src/components/markdown-reader";
import { TrinhSoan } from "../src/components/trinh-soan";
import { locDanDem } from "../src/lib/dan-tu-van-phong";
import { messages } from "../src/lib/messages";
import { donDep, GOI_Y, NHAN_NUT, NHAN_O } from "./trinh-soan-vat";

const M = messages("vi").lienKet;

const DICH = [
	{ href: "http://a.vn", nhan: false },
	{ href: "https://a.vn", nhan: true },
	{ href: "mailto:x@a.vn", nhan: true },
	{ href: "/ws/tai-lieu/t", nhan: true },
	{ href: "javascript:alert(1)", nhan: false },
] as const;

const TEP_LUAT = [
	"src/components/markdown-reader.tsx",
	"src/components/trinh-soan-thanh-cong-cu.tsx",
	"src/lib/dan-tu-van-phong.ts",
] as const;

const REGEX_GIAO_THUC = /https\?:|https:\\\/\\\/|http:\\\/\\\//;

const chuanUrl = (href: string) => new URL(href, "https://crm.test").href;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	if (root) act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	donDep();
});

async function docTrinhDoc(href: string): Promise<boolean> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(<MarkdownReader>{`[đích](${href})`}</MarkdownReader>);
		await new Promise((r) => setTimeout(r, 30));
	});
	const a = khung.querySelector("a[href]");
	const nhan =
		a !== null && chuanUrl(a.getAttribute("href") ?? "") === chuanUrl(href);
	act(() => root?.unmount());
	khung.remove();
	root = null;
	khung = null;
	return nhan;
}

type Soan = { khung: HTMLElement; phat: string[] };

function Vo({ phat }: { phat: string[] }) {
	const [giaTri, setGiaTri] = useState("Một đoạn văn");
	return h(TrinhSoan, {
		giaTri,
		onDoi: (md: string) => {
			phat.push(md);
			setGiaTri(md);
		},
		nhan: NHAN_O,
		goiY: GOI_Y,
		nhanNut: NHAN_NUT,
	});
}

function moSoan(): Soan {
	const k = document.createElement("div");
	document.body.appendChild(k);
	const r = createRoot(k);
	const phat: string[] = [];
	act(() => {
		r.render(
			<LocaleProvider locale="vi">
				<Vo phat={phat} />
			</LocaleProvider>,
		);
	});
	root = r;
	khung = k;
	return { khung: k, phat };
}

function oSoan(s: Soan) {
	const el = s.khung.querySelector<
		HTMLElement & {
			editor?: {
				commands: {
					setTextSelection: (v: { from: number; to: number }) => void;
				};
				getJSON: () => unknown;
			};
		}
	>('[role="textbox"]');
	if (!el?.editor) throw new Error("o soan chua san");
	return el;
}

function bam(el: HTMLElement) {
	act(() => {
		el.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
		el.dispatchEvent(new window.MouseEvent("mouseup", { bubbles: true }));
		el.click();
	});
}

function nhapLienKet(s: Soan, href: string): HTMLInputElement {
	act(() => oSoan(s).editor?.commands.setTextSelection({ from: 1, to: 4 }));
	const nut = s.khung.querySelector<HTMLElement>('[data-nut="lienKet"]');
	if (!nut) throw new Error("khong thay nut lien ket");
	bam(nut);
	const o = document.body.querySelector<HTMLInputElement>(
		`input[aria-label="${NHAN_NUT.lienKet}"]`,
	);
	if (!o) throw new Error("khong thay o nhap lien ket");
	act(() => {
		o.value = href;
		o.dispatchEvent(
			new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	return o;
}

function soanNhan(href: string): boolean {
	const s = moSoan();
	nhapLienKet(s, href);
	const md = s.phat.at(-1) ?? "";
	act(() => root?.unmount());
	s.khung.remove();
	root = null;
	khung = null;
	donDep();
	return md.includes(`](${href})`);
}

function danNhan(href: string): boolean {
	const { html } = locDanDem(`<p><a href="${href}">đích</a></p>`);
	const goc = document.createElement("div");
	goc.innerHTML = html;
	return goc.querySelector("a")?.getAttribute("href") === href;
}

function dan(s: Soan, html: string) {
	const su = new window.Event("paste", { bubbles: true, cancelable: true });
	Object.defineProperty(su, "clipboardData", {
		value: {
			types: ["text/html", "text/plain"],
			files: [],
			items: [],
			getData: (loai: string) => (loai === "text/html" ? html : ""),
		},
	});
	act(() => {
		oSoan(s).dispatchEvent(su);
	});
}

describe("ssct-lien-ket", () => {
	test("ssct-lien-ket: ma trận năm đích × ba nơi viết trước, ba nơi cùng một bảng", async () => {
		const mong = DICH.map((d) => [d.href, d.nhan]);
		const doc: [string, boolean][] = [];
		const soan: [string, boolean][] = [];
		const danVao: [string, boolean][] = [];
		for (const d of DICH) {
			doc.push([d.href, await docTrinhDoc(d.href)]);
			soan.push([d.href, soanNhan(d.href)]);
			danVao.push([d.href, danNhan(d.href)]);
		}
		expect({ noi: "trình đọc", bang: doc }).toEqual({
			noi: "trình đọc",
			bang: mong,
		});
		expect({ noi: "trình soạn", bang: soan }).toEqual({
			noi: "trình soạn",
			bang: mong,
		});
		expect({ noi: "bộ lọc dán", bang: danVao }).toEqual({
			noi: "bộ lọc dán",
			bang: mong,
		});
	});

	test("ssct-lien-ket: trình soạn nhập http báo chỉ nhận https, không tạo liên kết", () => {
		const s = moSoan();
		nhapLienKet(s, "http://a.vn");
		expect(document.body.textContent ?? "").toContain(M.chiHttps);
		expect(JSON.stringify(oSoan(s).editor?.getJSON())).not.toContain('"link"');
	});

	test("ssct-lien-ket: dán hai liên kết http giữ chữ, bỏ liên kết, báo số 2", () => {
		const s = moSoan();
		dan(
			s,
			'<p>Xem <a href="http://a.vn">quy định A</a> và <a href="http://b.vn">quy định B</a>.</p>',
		);
		const md = s.phat.at(-1) ?? "";
		expect(md).toContain("quy định A");
		expect(md).toContain("quy định B");
		expect(md).not.toContain("](");
		const bao = s.khung.querySelector("[data-bo-http]");
		expect(bao?.textContent ?? "").toBe(M.daBoHttp("2"));
	});

	test("ssct-lien-ket: đối chứng — dán chỉ https không có dòng báo", () => {
		const s = moSoan();
		dan(s, '<p>Xem <a href="https://a.vn">quy định A</a>.</p>');
		expect(s.phat.at(-1) ?? "").toContain("](https://a.vn)");
		expect(s.khung.querySelector("[data-bo-http]")).toBeNull();
	});

	test("ssct-lien-ket: chiều đỏ — ba tệp không còn regex giao thức riêng", () => {
		expect(REGEX_GIAO_THUC.test("/^(https?:\\/\\/|mailto:)/")).toBe(true);
		const goc = join(import.meta.dir, "..");
		const con = TEP_LUAT.filter((tep) =>
			REGEX_GIAO_THUC.test(readFileSync(join(goc, tep), "utf8")),
		);
		expect(con).toEqual([]);
	});
});
