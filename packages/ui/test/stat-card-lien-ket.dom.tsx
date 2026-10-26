import { afterEach, describe, expect, test } from "bun:test";
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { StatCard } from "../src/components/stat-card";

function LienKet(props: ComponentProps<"a">) {
	return <a {...props} />;
}

let goc: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => goc?.unmount());
	khung?.remove();
	goc = null;
	khung = null;
});

function dung(nut: React.ReactNode): HTMLElement {
	khung = document.createElement("div");
	document.body.append(khung);
	goc = createRoot(khung);
	act(() => goc?.render(nut));
	return khung;
}

describe("stat-card-lien-ket", () => {
	test("stat-card-lien-ket: asChild đặt khung ô lên liên kết và đưa nhãn, số, mô tả vào trong nó", () => {
		const k = dung(
			<StatCard asChild description="mô tả" label="KR trượt" value="3">
				<LienKet href="/x" />
			</StatCard>,
		);
		const a = k.querySelector("a");
		expect({
			slot: a?.getAttribute("data-slot"),
			href: a?.getAttribute("href"),
			chu: a?.textContent,
			soPhanTuNgoai: k.children.length,
		}).toEqual({
			slot: "stat-card",
			href: "/x",
			chu: "KR trượt3mô tả",
			soPhanTuNgoai: 1,
		});
	});

	test("stat-card-lien-ket: không asChild vẫn là khung div như cũ", () => {
		const k = dung(<StatCard label="KR trượt" value="3" />);
		const o = k.querySelector("[data-slot=stat-card]");
		expect({
			the: o?.tagName,
			chu: o?.textContent,
			a: k.querySelector("a"),
		}).toEqual({
			the: "DIV",
			chu: "KR trượt3",
			a: null,
		});
	});
});
