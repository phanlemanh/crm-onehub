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
	loiTim: "Lỗi tìm (test).",
};

const TRANG: TrangGoiY[] = [
	{
		slug: "quy-dinh-hoa-hong-doi-tac",
		ten: "Quy định hoa hồng đối tác",
		duong: "/ws/tai-lieu/quy-dinh-hoa-hong-doi-tac",
	},
];

const goi: string[] = [];

type Luot = {
	q: string;
	giai: (ds: readonly TrangGoiY[]) => void;
	tuChoi: () => void;
};

const luot: Luot[] = [];

function timDieuKhien(q: string): Promise<readonly TrangGoiY[]> {
	return new Promise((giai, tuChoi) => {
		luot.push({ q, giai, tuChoi: () => tuChoi(new Error("loi tim")) });
	});
}

async function timTrang(q: string): Promise<readonly TrangGoiY[]> {
	goi.push(q);
	return TRANG;
}

let timHienTai: (q: string) => Promise<readonly TrangGoiY[]> = timTrang;

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
	timHienTai = timTrang;
	luot.length = 0;
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
			timTrang={coTim ? (q) => timHienTai(q) : undefined}
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

function luotCua(q: string): Luot {
	const l = [...luot].reverse().find((x) => x.q === q);
	if (!l) throw new Error(`kn-loi-tim: khong co luot tim "${q}"`);
	return l;
}

async function xong(f: () => void): Promise<void> {
	await act(async () => {
		f();
		await nhip();
	});
}

function oTrong(): string {
	return document.body.querySelector("[cmdk-empty]")?.textContent?.trim() ?? "";
}

function soDong(): number {
	return document.body.querySelectorAll("[data-goi-y-trang]").length;
}

async function dongHop(): Promise<void> {
	const o = document.body.querySelector<HTMLInputElement>(
		`input[aria-label="${NHAN_LIEN_KET_TRANG.tim}"]`,
	);
	await act(async () => {
		o?.dispatchEvent(
			new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
		await nhip();
	});
}

type OLoiTim = {
	ten: string;
	chay: () => Promise<void>;
	mongChu: string | null;
	mongDong: number;
};

const N = NHAN_LIEN_KET_TRANG;

const O_LOI_TIM: readonly OLoiTim[] = [
	{
		ten: "1-go-them",
		chay: async () => go("q"),
		mongChu: N.goThem,
		mongDong: 0,
	},
	{
		ten: "2-loi",
		chay: async () => {
			await go("quy");
			await xong(() => luotCua("quy").tuChoi());
		},
		mongChu: N.loiTim,
		mongDong: 0,
	},
	{
		ten: "3-rong",
		chay: async () => {
			await go("quy");
			await xong(() => luotCua("quy").giai([]));
		},
		mongChu: N.khongCo,
		mongDong: 0,
	},
	{
		ten: "4-loi-roi-co",
		chay: async () => {
			await go("quy");
			await xong(() => luotCua("quy").tuChoi());
			await go("quy d");
			await xong(() => luotCua("quy d").giai(TRANG));
		},
		mongChu: null,
		mongDong: 1,
	},
	{
		ten: "5-loi-cu-ve-muon",
		chay: async () => {
			await go("quy");
			await go("quy d");
			await xong(() => luotCua("quy d").giai(TRANG));
			await xong(() => luotCua("quy").tuChoi());
		},
		mongChu: null,
		mongDong: 1,
	},
	{
		ten: "6-loi-roi-go-lui",
		chay: async () => {
			await go("quy");
			await xong(() => luotCua("quy").tuChoi());
			await go("q");
		},
		mongChu: N.goThem,
		mongDong: 0,
	},
	{
		ten: "7-loi-dong-mo-lai",
		chay: async () => {
			await go("quy");
			await xong(() => luotCua("quy").tuChoi());
			await dongHop();
			await bam(nutLienKetTrang());
		},
		mongChu: N.goThem,
		mongDong: 0,
	},
];

describe("kn-loi-tim", () => {
	test("kn-loi-tim: ma tran 7 o viet truoc, loi tim co cau rieng theo luot moi nhat", async () => {
		expect(O_LOI_TIM.length).toBe(7);
		expect(new Set(Object.values(N)).size).toBe(Object.values(N).length);
		const sai: string[] = [];
		for (const o of O_LOI_TIM) {
			timHienTai = timDieuKhien;
			luot.length = 0;
			await mo("Một đoạn.\n");
			await bam(nutLienKetTrang());
			await o.chay();
			const chu = soDong() > 0 ? null : oTrong();
			const coLoi = oTrong().includes(N.loiTim);
			if (o.mongChu !== N.loiTim && coLoi) {
				sai.push(
					o.ten === "5-loi-cu-ve-muon"
						? "kn-loi-tim: luot cu ve muon bat cau loi"
						: o.mongChu === N.goThem
							? `kn-loi-tim: cau loi de go them (${o.ten})`
							: `${o.ten}: con cau loi`,
				);
			} else if (o.mongChu === N.loiTim && chu === N.khongCo) {
				sai.push("kn-loi-tim: loi tim hien 'khong co trang nao khop'");
			} else if (chu !== o.mongChu || soDong() !== o.mongDong) {
				sai.push(`${o.ten}: chu «${chu}», ${soDong()} dong`);
			}
			act(() => root?.unmount());
			khung?.remove();
			root = null;
			khung = null;
			document.body.innerHTML = "";
		}
		expect(sai).toEqual([]);
	});
});

describe("chen-lien-ket-go", () => {
	test("chen-lien-ket: go trinh soan khi hop dang mo thi khong loi chua bat", async () => {
		const loi: string[] = [];
		const nghe = (e: ErrorEvent) => {
			loi.push(String(e.error?.message ?? e.message));
		};
		window.addEventListener("error", nghe);
		try {
			await mo("Một đoạn.\n");
			await bam(nutLienKetTrang());
			expect(
				document.body.querySelector(
					`input[aria-label="${NHAN_LIEN_KET_TRANG.tim}"]`,
				),
			).not.toBeNull();
			act(() => root?.unmount());
			root = null;
			await new Promise((r) => setTimeout(r, 0));
		} finally {
			window.removeEventListener("error", nghe);
		}
		expect(loi).toEqual([]);
	});
});
