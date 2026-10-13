import { afterEach, describe, expect, test } from "bun:test";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ComboboxMulti } from "../src/components/combobox-multi";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

const OPTIONS = [
	{ value: "a", label: "Alpha" },
	{ value: "b", label: "Beta" },
	{ value: "c", label: "Gamma" },
];

function Giu({ max, ghi }: { max?: number; ghi: (values: string[]) => void }) {
	const [values, setValues] = useState<string[]>([]);
	return (
		<ComboboxMulti
			aria-label="chon"
			max={max}
			onValuesChange={(next) => {
				ghi(next);
				setValues(next);
			}}
			options={OPTIONS}
			values={values}
		/>
	);
}

function dung(max: number | undefined, ghi: (values: string[]) => void) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<Giu ghi={ghi} max={max} />
			</LocaleProvider>,
		),
	);
	return document.querySelector("[role=combobox]") as HTMLButtonElement;
}

async function nhip() {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
}

async function bam(el: Element | null) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		(el as HTMLElement).click();
	});
	await nhip();
}

const lua = (ten: string) =>
	[...document.querySelectorAll("[role=option]")].find((o) =>
		o.textContent?.includes(ten),
	) ?? null;

describe("ComboboxMulti", () => {
	test("combobox-multi: chọn hai mục thì onValuesChange nhận cả hai", async () => {
		const goi: string[][] = [];
		const nut = dung(undefined, (v) => goi.push(v));
		await bam(nut);
		await bam(lua("Alpha"));
		await bam(lua("Gamma"));
		if (JSON.stringify(goi.at(-1)) !== JSON.stringify(["a", "c"])) {
			throw new Error("combobox-multi: mat muc da chon");
		}
		expect(nut.textContent).toContain("Alpha, Gamma");
		await bam(lua("Alpha"));
		expect(goi.at(-1)).toEqual(["c"]);
	});

	test("combobox-multi: đủ max thì các mục chưa chọn bị khoá và không thêm được", async () => {
		const goi: string[][] = [];
		const nut = dung(2, (v) => goi.push(v));
		await bam(nut);
		await bam(lua("Alpha"));
		await bam(lua("Beta"));
		if (lua("Gamma")?.getAttribute("aria-disabled") !== "true") {
			throw new Error("combobox-multi: vuot max van chon duoc");
		}
		await bam(lua("Gamma"));
		if (goi.some((v) => v.length > 2)) {
			throw new Error("combobox-multi: vuot max van chon duoc");
		}
		expect(lua("Alpha")?.getAttribute("aria-disabled")).toBe("false");
	});
});
