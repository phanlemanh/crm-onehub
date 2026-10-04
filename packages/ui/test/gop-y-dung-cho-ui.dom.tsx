import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraTrace } from "../src/components/kara";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecided,
} from "../src/components/proposed-change";
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
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
	return o;
}

function nut(goc: ParentNode, ten: string): HTMLButtonElement {
	const b = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(x) => x.textContent?.trim() === ten,
	);
	if (!b) throw new Error(`khong thay nut: ${ten}`);
	return b;
}

function DeXuatThu() {
	const [sua, setSua] = useState<string | null>(null);
	const [quyet, setQuyet] = useState<ProposedChangeDecided | undefined>();
	const actions: ProposedChangeAction[] = sua
		? [
				{
					id: "doi-ten",
					label: "Đổi tên KR",
					tone: "primary",
					onClick: () => undefined,
				},
				{ id: "huy", label: "Huỷ", tone: "quiet", onClick: () => setSua(null) },
			]
		: [
				{
					id: "doi-ten",
					label: "Đổi tên KR",
					tone: "primary",
					onClick: () =>
						setQuyet({
							decision: "accepted",
							text: "Đã đổi tên KR theo Kara",
							onUndo: () =>
								setQuyet({ decision: "accepted", text: "Đã hoàn tác" }),
						}),
				},
				{
					id: "sua",
					label: "Sửa",
					tone: "secondary",
					onClick: () => setSua("Tên mới"),
				},
				{
					id: "bo-qua",
					label: "Bỏ qua",
					tone: "quiet",
					onClick: () => undefined,
				},
			];
	return (
		<ProposedChange
			actions={actions}
			before="Đạt số giao dịch"
			decided={quyet}
			editing={
				sua === null
					? undefined
					: { value: sua, onChange: setSua, onCancel: () => setSua(null) }
			}
			kind="rewrite"
			rationale="Tên chưa có đích."
			value="Đạt 1.000 giao dịch trong quý"
		/>
	);
}

describe("focus", () => {
	test("bốn chuyển trạng thái giữ focus đúng chỗ, Esc không nổi tới cha", () => {
		let escCha = 0;
		const nghe = (su: KeyboardEvent) => {
			if (su.key === "Escape") escCha += 1;
		};
		document.body.addEventListener("keydown", nghe);
		const o = ve(<DeXuatThu />);
		const daQua: string[] = [];

		act(() => nut(o, "Sửa").click());
		const oSua = o.querySelector<HTMLTextAreaElement>(
			'[data-slot="proposed-change-edit"]',
		);
		if (!oSua) throw new Error("khong mo o sua");
		act(() => {
			oSua.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Escape",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		if (document.activeElement !== o.querySelector('[data-hanh-dong="sua"]'))
			throw new Error("focus roi: esc");
		expect(escCha).toBe(0);
		document.body.removeEventListener("keydown", nghe);
		daQua.push("esc");

		act(() => nut(o, "Sửa").click());
		act(() => nut(o, "Huỷ").click());
		if (document.activeElement !== o.querySelector('[data-hanh-dong="sua"]'))
			throw new Error("focus roi: huy");
		daQua.push("huy");

		const chinh = nut(o, "Đổi tên KR");
		act(() => chinh.focus());
		act(() => chinh.click());
		if (document.activeElement !== nut(o, "Hoàn tác"))
			throw new Error("focus roi: nhan");
		daQua.push("nhan");

		act(() => nut(o, "Hoàn tác").click());
		if (
			document.activeElement !==
			o.querySelector('[data-slot="proposed-change-receipt"]')
		)
			throw new Error("focus roi: hoan-tac");
		expect(o.textContent).toContain("Đã hoàn tác");
		daQua.push("hoan-tac");

		expect(daQua).toEqual(["esc", "huy", "nhan", "hoan-tac"]);
		console.log(`focus: ${daQua.length} chuyen trang thai`);
	});
});

const CO_CHU = /(^|\s)text-(sm|xs|base)(\s|$)/;

function lopCoChuNgoaiNut(goc: Element): string[] {
	const ra: string[] = [];
	const xet = (el: Element) => {
		if (el.tagName === "BUTTON") return;
		const lop = el.getAttribute("class") ?? "";
		if (CO_CHU.test(lop))
			ra.push(
				`${el.getAttribute("data-slot") ?? el.tagName}: ${lop.match(CO_CHU)?.[0]?.trim()}`,
			);
		for (const con of el.children) xet(con);
	};
	xet(goc);
	return ra;
}

const HANH_DONG: ProposedChangeAction[] = [
	{
		id: "doi-ten",
		label: "Đổi tên KR",
		tone: "primary",
		onClick: () => undefined,
	},
	{ id: "sua", label: "Sửa", tone: "secondary", onClick: () => undefined },
	{ id: "bo-qua", label: "Bỏ qua", tone: "quiet", onClick: () => undefined },
];

describe("inline", () => {
	test("thân đề xuất inline không đặt cỡ chữ riêng", () => {
		const o = ve(
			<ProposedChange
				actions={HANH_DONG}
				before="Cũ"
				kind="rewrite"
				rationale="Lý do."
				value="Mới"
			/>,
		);
		expect(
			o.querySelectorAll('[data-slot="proposed-change-value"]').length,
		).toBe(1);
		const goc = o.querySelector('[data-slot="proposed-change"]');
		if (!goc) throw new Error("thieu goc");
		const lech = lopCoChuNgoaiNut(goc);
		if (lech.length > 0)
			throw new Error(`inline co dinh co chu: text-sm (${lech.join("; ")})`);
	});

	test("dòng biên nhận inline không đặt cỡ chữ riêng", () => {
		const o = ve(
			<ProposedChange
				actions={HANH_DONG}
				decided={{
					decision: "accepted",
					text: "Đã đổi tên KR theo Kara",
					onUndo: () => undefined,
				}}
				kind="rewrite"
				value="Mới"
			/>,
		);
		const bienNhan = o.querySelectorAll(
			'[data-slot="proposed-change-receipt"]',
		);
		expect(bienNhan.length).toBe(1);
		const goc = o.querySelector('[data-slot="proposed-change"]');
		if (!goc) throw new Error("thieu goc");
		const lech = lopCoChuNgoaiNut(goc);
		if (lech.length > 0)
			throw new Error(`inline co dinh co chu: bien-nhan (${lech.join("; ")})`);
	});

	test("nút lặng nằm liền các nút chính", () => {
		const o = ve(
			<ProposedChange actions={HANH_DONG} kind="rewrite" value="Mới" />,
		);
		const nhom = o.querySelector('[data-slot="proposed-change-actions"]');
		const boQua = nut(o, "Bỏ qua");
		expect(boQua.parentElement).toBe(nhom);
		expect(nhom?.querySelector(".ms-auto")).toBeNull();
	});

	test("độ dày card giữ nguyên DOM", () => {
		const o = ve(
			<ProposedChange
				actions={HANH_DONG}
				before="Cũ"
				density="card"
				id="the-ghim"
				kind="rewrite"
				label="Viết lại · Tên KR"
				rationale="Lý do."
				value="Mới"
			/>,
		);
		expect(o.innerHTML).toMatchSnapshot();
	});

	test("KaraTrace hai tiếng", () => {
		const vi = ve(<KaraTrace />, "vi");
		const dau = vi.querySelector('[data-slot="kara-trace"]');
		expect(dau?.querySelector("svg")).not.toBeNull();
		expect(dau?.textContent).toContain("theo Kara");
		expect(
			dau?.querySelector(".sr-only")?.textContent?.length ?? 0,
		).toBeGreaterThan(0);
		act(() => root?.unmount());
		root = null;
		const en = ve(<KaraTrace />, "en");
		expect(en.querySelector('[data-slot="kara-trace"]')?.textContent).toContain(
			"via Kara",
		);
	});
});
