import { afterEach, describe, expect, test } from "bun:test";
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SimpleTable, SimpleTableRow } from "../src/components/simple-table";
import { TableCell } from "../src/components/table";

const NEN_CON = "bg-muted/30";
const BO_VACH = "border-b-0";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

type HangProps = Pick<
	ComponentProps<typeof SimpleTableRow>,
	"nested" | "joined"
>;

function dung(
	hang: HangProps,
	bang: Pick<ComponentProps<typeof SimpleTable>, "header"> = {},
): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<SimpleTable
				{...bang}
				columns={[
					{ id: "a", header: "A" },
					{ id: "b", header: "B" },
				]}
			>
				<SimpleTableRow {...hang} data-hang="x">
					<TableCell>Một</TableCell>
					<TableCell>Hai</TableCell>
				</SimpleTableRow>
			</SimpleTable>,
		),
	);
	return khung;
}

const MA_TRAN: readonly [string, HangProps, boolean, boolean][] = [
	["mac-dinh", {}, false, false],
	["nested", { nested: true }, true, false],
	["joined", { joined: true }, false, true],
	["ca-hai", { nested: true, joined: true }, true, true],
];

describe("SimpleTableRow nested/joined", () => {
	test("ma tran bon o: nen hang con va bo vach doc lap", () => {
		let so = 0;
		for (const [ten, props, coNen, coDinh] of MA_TRAN) {
			const tr = dung(props).querySelector<HTMLElement>('[data-hang="x"]');
			const lop = tr?.className.split(/\s+/) ?? [];
			expect(
				{
					nested: tr?.hasAttribute("data-nested"),
					joined: tr?.hasAttribute("data-joined"),
					nen: lop.includes(NEN_CON),
					vach: lop.includes(BO_VACH),
				},
				ten === "joined" && lop.includes(NEN_CON) ? "joined dinh nen" : ten,
			).toEqual({ nested: coNen, joined: coDinh, nen: coNen, vach: coDinh });
			act(() => root?.unmount());
			khung?.remove();
			so += 1;
		}
		console.log(`so ca hang: ${so}`);
		expect(so).toBe(MA_TRAN.length);
	});

	test("header sr-only giu du th trong DOM, mac dinh khong an", () => {
		const an = dung({}, { header: "sr-only" }).querySelector("thead");
		expect({
			an: an?.classList.contains("sr-only"),
			th: an?.querySelectorAll("th").length,
		}).toEqual({ an: true, th: 2 });
		act(() => root?.unmount());
		khung?.remove();
		const hien = dung({}).querySelector("thead");
		expect(hien?.classList.contains("sr-only")).toBe(false);
	});
});
