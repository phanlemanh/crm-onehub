import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import type { Locale } from "../src/lib/locale";
import { messages } from "../src/lib/messages";

const THU_MUC_KARA = resolve(import.meta.dir, "..", "src", "components", "kara");

const nap = <T,>(bien: string, tep: string): Promise<T> =>
	import(process.env[bien] ?? join(THU_MUC_KARA, tep)) as Promise<T>;

const KhoiState = await nap<typeof import("../src/components/kara/state")>(
	"K1_TEP_STATE",
	"state.tsx",
);

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

function veLai(cay: ReactElement, locale: Locale = "vi") {
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll("button")].filter(
		(b) => (b.textContent ?? "").trim() === ten,
	);
}

async function cho(ms: number) {
	await act(async () => {
		await new Promise((ok) => setTimeout(ok, ms));
	});
}

function laChamBan(goc: ParentNode): boolean {
	return [...goc.querySelectorAll('[aria-hidden="true"]')].some(
		(e) => e.tagName === "SPAN" && e.children.length > 1,
	);
}

type KyVongState = {
	empty: boolean;
	status: boolean;
	thuLai: number;
	moTaO: boolean;
};

const KY_VONG_STATE: Record<
	"working" | "empty" | "error" | "off" | "unconfigured",
	KyVongState
> = {
	working: { empty: false, status: true, thuLai: 0, moTaO: false },
	empty: { empty: true, status: false, thuLai: 0, moTaO: false },
	error: { empty: true, status: false, thuLai: 1, moTaO: false },
	off: { empty: false, status: false, thuLai: 0, moTaO: true },
	unconfigured: { empty: true, status: false, thuLai: 0, moTaO: false },
};

describe("k1-state", () => {
	const { KaraState } = KhoiState;

	function dung(kind: keyof typeof KY_VONG_STATE, onRetry = () => {}) {
		switch (kind) {
			case "working":
				return <KaraState kind="working" label="⟦dang⟧" delayMs={0} />;
			case "empty":
				return <KaraState kind="empty" title="⟦t⟧" description="⟦m⟧" />;
			case "error":
				return <KaraState kind="error" what="soạn" onRetry={onRetry} />;
			case "off":
				return <KaraState kind="off" reason="⟦ly do⟧" />;
			case "unconfigured":
				return <KaraState kind="unconfigured" description="⟦ai bat⟧" />;
		}
	}

	test("năm kind theo bảng ghi trước", () => {
		let soO = 0;
		for (const kind of Object.keys(
			KY_VONG_STATE,
		) as (keyof typeof KY_VONG_STATE)[]) {
			const ky = KY_VONG_STATE[kind];
			const o = ve(dung(kind));
			const empty = o.querySelector('[data-slot="empty"]');
			phai(Boolean(empty) === ky.empty, `empty sai o ${kind}`);
			if (empty) {
				phai(
					empty.getAttribute("data-border") === "solid" &&
						empty.getAttribute("data-size") === "compact",
					`empty sai khuon o ${kind}`,
				);
			}
			phai(
				Boolean(o.querySelector('[role="status"]')) === ky.status,
				`status sai o ${kind}`,
			);
			phai(
				nutTen(o, VI.karaKhung.thuLai).length === ky.thuLai,
				`so nut thu lai sai o ${kind}`,
			);
			phai(
				Boolean(o.querySelector('[data-slot="field-description"]')) ===
					ky.moTaO,
				`mo ta sai o ${kind}`,
			);
			phai(
				!o.querySelector('[data-slot="alert"], [data-slot="spinner"]'),
				`co spinner tran o ${kind}`,
			);
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			soO += 1;
		}
		console.log(`so o: ${soO}`);
		expect(soO).toBe(5);
	});

	test("error: tiêu đề và Thử lại", () => {
		let goi = 0;
		const o = ve(dung("error", () => (goi += 1)));
		expect(o.textContent).toContain(VI.karaKhung.chuaDuoc("soạn"));
		act(() => nutTen(o, VI.karaKhung.thuLai)[0]?.click());
		expect(goi).toBe(1);
	});

	test("working hiện sau trễ, không trước", async () => {
		const o = ve(<KaraState kind="working" label="⟦dang doc⟧" delayMs={200} />);
		phai(!o.querySelector('[role="status"]'), "working hien truoc tre");
		await cho(260);
		const st = o.querySelector('[role="status"]');
		phai(Boolean(st?.textContent?.includes("⟦dang doc⟧")), "working khong hien");
		phai(laChamBan(st as Element), "thieu cham ban");
	});

	test("gỡ trước hạn không cập nhật sau khi gỡ", async () => {
		const loi: unknown[] = [];
		const goc = console.error;
		console.error = (...a: unknown[]) => loi.push(a);
		try {
			ve(<KaraState kind="working" label="x" delayMs={100} />);
			act(() => root?.unmount());
			root = null;
			await cho(150);
		} finally {
			console.error = goc;
		}
		expect(loi).toEqual([]);
	});
});

function tepKara(): string[] {
	return readdirSync(THU_MUC_KARA, { withFileTypes: true })
		.filter((d) => d.isFile() && d.name.endsWith(".tsx"))
		.map((d) => d.name);
}

function laThuLaiDung(b: HTMLButtonElement): boolean {
	return (
		b.getAttribute("data-variant") === "outline" &&
		b.getAttribute("data-size") === "sm" &&
		!b.querySelector("svg")
	);
}

describe("k1-thu-lai", () => {
	const { KaraRetry, KaraState } = KhoiState;

	test("chữ Thử lại chỉ dùng trong state.tsx", () => {
		const ngoai = tepKara()
			.filter((t) => t !== "state.tsx")
			.filter((t) =>
				readFileSync(join(THU_MUC_KARA, t), "utf8").includes(
					"karaKhung.thuLai",
				),
			);
		expect(ngoai).toEqual([]);
	});

	test("KaraRetry một cỡ", () => {
		const o = ve(<KaraRetry onClick={() => {}} />);
		const nut = o.querySelector("button") as HTMLButtonElement;
		phai(nut.getAttribute("data-size") === "sm", "thu lai sai co");
		phai(!nut.querySelector("svg"), "thu lai co icon");
		phai(laThuLaiDung(nut), "thu lai sai bien the");
		expect(nut.textContent).toBe(VI.karaKhung.thuLai);
	});

	test("mọi Thử lại trong các khối đúng cỡ", () => {
		const o = ve(<KaraState kind="error" what="đọc" onRetry={() => {}} />);
		const nut = nutTen(o, VI.karaKhung.thuLai);
		expect(nut.length).toBe(1);
		for (const b of nut) phai(laThuLaiDung(b), "thu lai sai co");
	});
});
