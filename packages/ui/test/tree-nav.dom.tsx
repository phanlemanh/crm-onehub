import { afterEach, describe, expect, test } from "bun:test";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TreeNav, type TreeNavNode } from "../src/components/tree-nav";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const la = (id: string): TreeNavNode<string> => ({ id, name: id, data: id });

const CAY: TreeNavNode<string>[] = [
	{
		id: "goc",
		name: "goc",
		data: "goc",
		children: [
			{
				id: "nhanh1",
				name: "nhanh1",
				data: "n1",
				children: [la("la11"), la("la12")],
			},
			{
				id: "nhanh2",
				name: "nhanh2",
				data: "n2",
				children: [la("la21"), la("la22")],
			},
		],
	},
];

const chon: string[] = [];

function Vo() {
	const [mo, setMo] = useState<string[]>(["goc"]);
	return (
		<TreeNav
			expanded={mo}
			label="Cây thử"
			nodes={CAY}
			onExpandedChange={setMo}
			onSelect={(id) => chon.push(id)}
			renderLabel={(n) => n.name}
		/>
	);
}

const MA = {
	ArrowDown: "ArrowDown",
	ArrowUp: "ArrowUp",
	ArrowRight: "ArrowRight",
	ArrowLeft: "ArrowLeft",
	Home: "Home",
	End: "End",
	Enter: "Enter",
} as const;

async function phim(key: keyof typeof MA) {
	const dich = document.activeElement;
	if (!dich) throw new Error("không có phần tử đang có tiêu điểm");
	await act(async () => {
		dich.dispatchEvent(
			new KeyboardEvent("keydown", { key, code: MA[key], bubbles: true }),
		);
		dich.dispatchEvent(
			new KeyboardEvent("keyup", { key, code: MA[key], bubbles: true }),
		);
		await new Promise((r) => setTimeout(r, 60));
	});
}

function trangThai() {
	const cay = document.querySelector("[role='tree']");
	const dangCo = document.activeElement?.getAttribute("data-id") ?? null;
	const tab0 = cay
		? [...cay.querySelectorAll("[tabindex='0']")].map((e) =>
				e.getAttribute("data-id"),
			)
		: [];
	const moRa = (id: string) =>
		document
			.querySelector(`[data-id='${id}']`)
			?.getAttribute("aria-expanded") ?? null;
	return { dangCo, tab0, nhanh1: moRa("nhanh1") };
}

describe("tree-nav — đi bằng bàn phím", () => {
	test("kịch bản mười bước viết trước", async () => {
		chon.length = 0;
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
		await act(async () => root?.render(<Vo />));

		const cay = document.querySelector("[role='tree']");
		expect(cay?.getAttribute("aria-label")).toBe("Cây thử");
		const muc = [...document.querySelectorAll("[role='treeitem']")];
		expect(
			muc.map((m) => [m.getAttribute("data-id"), m.getAttribute("aria-level")]),
		).toEqual([
			["goc", "1"],
			["nhanh1", "2"],
			["nhanh2", "2"],
		]);

		const vao = document.querySelector<HTMLElement>(
			"[role='tree'] [tabindex='0']",
		);
		await act(async () => vao?.focus());
		const buoc = [trangThai()];
		for (const k of [
			"ArrowDown",
			"ArrowRight",
			"ArrowRight",
			"ArrowLeft",
			"ArrowLeft",
			"End",
			"Home",
		] as const) {
			await phim(k);
			buoc.push(trangThai());
		}
		await phim("Enter");

		expect(buoc).toEqual([
			{ dangCo: "goc", tab0: ["goc"], nhanh1: "false" },
			{ dangCo: "nhanh1", tab0: ["nhanh1"], nhanh1: "false" },
			{ dangCo: "nhanh1", tab0: ["nhanh1"], nhanh1: "true" },
			{ dangCo: "la11", tab0: ["la11"], nhanh1: "true" },
			{ dangCo: "nhanh1", tab0: ["nhanh1"], nhanh1: "true" },
			{ dangCo: "nhanh1", tab0: ["nhanh1"], nhanh1: "false" },
			{ dangCo: "nhanh2", tab0: ["nhanh2"], nhanh1: "false" },
			{ dangCo: "goc", tab0: ["goc"], nhanh1: "false" },
		]);
		expect(chon).toEqual(["goc"]);
		const cap3 = document.querySelector("[data-id='la11']");
		expect(cap3).toBeNull();
	});
});
