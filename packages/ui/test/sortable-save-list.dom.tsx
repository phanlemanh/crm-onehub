import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type GoiToast = {
	loai: "thuong" | "xong" | "loi";
	chu: string;
	action?: { label: string; onClick: () => void };
};

const goiToast: GoiToast[] = [];

function ghiToast(loai: GoiToast["loai"]) {
	return (chu: string, o?: { action?: GoiToast["action"] }) => {
		goiToast.push({ loai, chu, action: o?.action });
	};
}

mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		success: ghiToast("xong"),
		error: ghiToast("loi"),
	}),
}));

const { SortableSaveList } = await import("../src/components/sortable-list");
const { LocaleProvider } = await import("../src/components/locale-provider");
const { messages } = await import("../src/lib/messages");

type Change = { ids: string[]; id: string; index: number };

type Hen = {
	p: Promise<unknown>;
	xong: () => void;
	hong: (e: Error) => void;
};

function hen(): Hen {
	let xong: () => void = () => undefined;
	let hong: (e: Error) => void = () => undefined;
	const p = new Promise<unknown>((a, b) => {
		xong = () => a(undefined);
		hong = b;
	});
	return { p, xong, hong };
}

let root: Root | null = null;
let khung: HTMLElement | null = null;
let goiLuu: Change[] = [];
let henLuu: Hen[] = [];
const gocRect = Element.prototype.getBoundingClientRect;
const canhBao: string[] = [];
const gocLoi = console.error;

beforeEach(() => {
	goiToast.length = 0;
	goiLuu = [];
	henLuu = [];
	canhBao.length = 0;
	console.error = (...x: unknown[]) => {
		canhBao.push(x.map(String).join(" "));
	};
	datViTri();
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	Element.prototype.getBoundingClientRect = gocRect;
	console.error = gocLoi;
});

function datViTri(): void {
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-muc]") === null) {
			return {
				x: 0,
				y: -10000,
				top: -10000,
				left: 0,
				bottom: 10000,
				right: 1000,
				width: 1000,
				height: 20000,
				toJSON: () => ({}),
			} as DOMRect;
		}
		const cha = this.parentElement;
		const i = cha ? [...cha.children].indexOf(this) : 0;
		const doi =
			this instanceof HTMLElement
				? Number(
						/translate3d\([^,]+,\s*(-?[\d.]+)px/.exec(
							this.style.transform,
						)?.[1] ?? 0,
					)
				: 0;
		const tren = i * 40 + doi;
		return {
			x: 0,
			y: tren,
			top: tren,
			left: 0,
			bottom: tren + 32,
			right: 300,
			width: 300,
			height: 32,
			toJSON: () => ({}),
		} as DOMRect;
	};
}

function onSave(c: Change): Promise<unknown> {
	goiLuu.push(c);
	const h = henLuu.shift();
	return h ? h.p : Promise.resolve();
}

function bang(ids: string[], disabled = false, locale: "vi" | "en" = "vi") {
	return (
		<LocaleProvider locale={locale}>
			<SortableSaveList
				ids={ids}
				label={(id) => id}
				disabled={disabled}
				onSave={onSave}
			>
				{(id) => (
					<div data-muc={id} className="flex-1">
						{id}
					</div>
				)}
			</SortableSaveList>
		</LocaleProvider>
	);
}

async function dung(
	ids = ["a", "b", "c"],
	disabled = false,
	locale: "vi" | "en" = "vi",
) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => root?.render(bang(ids, disabled, locale)));
}

async function veLai(ids: string[]) {
	await act(async () => root?.render(bang(ids)));
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				code: key === " " ? "Space" : key,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await nghi(5);
}

function tayKeo(ten: string): HTMLButtonElement {
	const nut = [...document.body.querySelectorAll("button")].find(
		(b) =>
			b.textContent === messages("vi").sortableList.reorder(ten) ||
			b.textContent === messages("en").sortableList.reorder(ten),
	);
	if (!nut) throw new Error(`khong thay tay keo ${ten}`);
	return nut;
}

async function keoXuong(ten: string): Promise<void> {
	const tay = tayKeo(ten);
	tay.focus();
	await phim(tay, " ");
	await nghi(20);
	await phim(tay, "ArrowDown");
	await nghi(20);
	await phim(tay, " ");
	await nghi(20);
}

function thuTu(): string[] {
	return [...document.body.querySelectorAll("[data-muc]")].map(
		(x) => x.getAttribute("data-muc") ?? "",
	);
}

function moiTayKhoa(): boolean[] {
	return [...document.body.querySelectorAll("button")]
		.filter((b) => b.querySelector(".sr-only") !== null)
		.map((b) => b.disabled);
}

async function xa(h: Hen | undefined, loi?: Error): Promise<void> {
	if (!h) throw new Error("khong co loi goi dang treo");
	await act(async () => {
		if (loi) h.hong(loi);
		else h.xong();
		await h.p.catch(() => undefined);
	});
	await nghi(10);
}

describe("dang-luu", () => {
	test("dang-luu: hien thu tu moi ngay, khoa tay keo, goi onSave mot lan, co dong huong dan", async () => {
		const h = hen();
		henLuu.push(h);
		await dung();
		await keoXuong("a");
		const huongDan = document.body.querySelector(
			"[data-slot='sortable-hint']",
		)?.textContent;
		expect({
			thuTu: thuTu(),
			khoa: moiTayKhoa().every(Boolean)
				? "khoa"
				: "tay keo con mo khi dang luu",
			goi: goiLuu,
			huongDan,
		}).toEqual({
			thuTu: ["b", "a", "c"],
			khoa: "khoa",
			goi: [{ ids: ["b", "a", "c"], id: "a", index: 1 }],
			huongDan: messages("vi").sortableList.hint,
		});
		await keoXuong("c");
		expect(goiLuu.length, "keo lan hai khi dang luu van goi luu").toBe(1);
		await xa(h);
	});

	test("dang-luu: disabled khoa moi tay keo va khong goi onSave", async () => {
		await dung(["a", "b", "c"], true);
		const khoa = moiTayKhoa();
		await keoXuong("a");
		expect({ khoa, goi: goiLuu.length, thuTu: thuTu() }).toEqual({
			khoa: [true, true, true],
			goi: 0,
			thuTu: ["a", "b", "c"],
		});
	});
});

describe("loi", () => {
	test("loi: tu choi thi tra thu tu cu, mot toast loi, mo lai tay keo", async () => {
		const h = hen();
		henLuu.push(h);
		await dung();
		await keoXuong("a");
		await xa(h, new Error("x"));
		expect({
			thuTu:
				thuTu().join() === "a,b,c" ? "a,b,c" : "giu thu tu vua keo khi luu loi",
			loi: goiToast.filter((t) => t.loai === "loi").map((t) => t.chu),
			daLuu: goiToast.filter((t) => t.loai !== "loi").length,
			khoa: moiTayKhoa(),
		}).toEqual({
			thuTu: "a,b,c",
			loi: ["x"],
			daLuu: 0,
			khoa: [false, false, false],
		});
	});
});

describe("hoan-tac", () => {
	async function luuXong(locale: "vi" | "en" = "vi") {
		const h = hen();
		henLuu.push(h);
		await dung(["a", "b", "c"], false, locale);
		await keoXuong("a");
		await xa(h);
	}

	test("hoan-tac: toast da luu co nut Hoan tac, bam thi gui thu tu cu mot lan", async () => {
		await luuXong();
		const m = messages("vi").sortableList;
		const t = goiToast.find((x) => x.action !== undefined);
		expect({ chu: t?.chu, nut: t?.action?.label }).toEqual({
			chu: m.saved,
			nut: m.undo,
		});
		const h2 = hen();
		henLuu.push(h2);
		await act(async () => t?.action?.onClick());
		await act(async () => t?.action?.onClick());
		expect(
			goiLuu[1]?.ids.join() === "a,b,c"
				? "dung"
				: "hoan tac khong tra thu tu cu",
		).toBe("dung");
		expect({
			goi: goiLuu.slice(1),
		}).toEqual({
			goi: [{ ids: ["a", "b", "c"], id: "a", index: 0 }],
		});
		await xa(h2);
		const traXong = goiToast.filter(
			(x) => x.loai === "xong" && x.chu === m.restored,
		);
		expect({
			thuTu: thuTu(),
			khoa: moiTayKhoa(),
			traXong: traXong.map((x) => [x.chu, x.action === undefined]),
			goi: goiLuu.length,
		}).toEqual({
			thuTu: ["a", "b", "c"],
			khoa: [false, false, false],
			traXong: [[m.restored, true]],
			goi: 2,
		});
		await act(async () => t?.action?.onClick());
		expect(goiLuu.length, "hoan tac lan hai sau khi da tra van goi luu").toBe(
			2,
		);
	});

	test("hoan-tac: tra loi thi giu thu tu moi va bao loi", async () => {
		await luuXong();
		const t = goiToast.find((x) => x.action !== undefined);
		const h2 = hen();
		henLuu.push(h2);
		await act(async () => t?.action?.onClick());
		await xa(h2, new Error("y"));
		expect({
			thuTu: thuTu(),
			loi: goiToast.filter((x) => x.loai === "loi").map((x) => x.chu),
		}).toEqual({ thuTu: ["b", "a", "c"], loi: ["y"] });
		await act(async () => t?.action?.onClick());
		expect(goiLuu.length, "tra loi thi khong cho bam Hoan tac lai").toBe(3);
	});

	test("hoan-tac: tieng Anh dung hai chu", async () => {
		await luuXong("en");
		const m = messages("en").sortableList;
		const t = goiToast.find((x) => x.action !== undefined);
		expect([t?.chu, t?.action?.label]).toEqual([m.saved, m.undo]);
	});
});

describe("tam-thoi", () => {
	test("tam-thoi: du lieu moi ve thi hien dung props", async () => {
		const h = hen();
		henLuu.push(h);
		await dung();
		await keoXuong("a");
		await xa(h);
		await veLai(["b", "a", "c"]);
		expect(thuTu()).toEqual(["b", "a", "c"]);
		await veLai(["c", "b", "a"]);
		expect(thuTu()).toEqual(["c", "b", "a"]);
	});

	test("tam-thoi: props doi khi dang luu thi bo tam, hien props", async () => {
		const h = hen();
		henLuu.push(h);
		await dung();
		await keoXuong("a");
		await veLai(["c", "a", "b", "d"]);
		expect(thuTu()).toEqual(["c", "a", "b", "d"]);
		await xa(h);
	});

	test("tam-thoi: go trang khi dang luu thi khong canh bao React", async () => {
		const h = hen();
		henLuu.push(h);
		await dung();
		await keoXuong("a");
		act(() => root?.unmount());
		root = null;
		await xa(h, new Error("x"));
		expect({
			canhBao: canhBao.filter((c) => c.includes("unmounted")),
			loi: goiToast.filter((t) => t.loai === "loi").length,
		}).toEqual({ canhBao: [], loi: 0 });
	});
});
