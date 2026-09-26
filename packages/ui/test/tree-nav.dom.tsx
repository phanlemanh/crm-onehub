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

function Vo({ selectedId }: { selectedId?: string }) {
	const [mo, setMo] = useState<string[]>(["goc"]);
	return (
		<TreeNav
			selectedId={selectedId}
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

function trangThai(buoc: string) {
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
	return { buoc, dangCo, tab0, nhanh1: moRa("nhanh1") };
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
		const buoc = [trangThai("tab vào cây")];
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
			buoc.push(trangThai(k));
		}
		await phim("Enter");

		expect(buoc).toEqual([
			{ buoc: "tab vào cây", dangCo: "goc", tab0: ["goc"], nhanh1: "false" },
			{
				buoc: "ArrowDown",
				dangCo: "nhanh1",
				tab0: ["nhanh1"],
				nhanh1: "false",
			},
			{
				buoc: "ArrowRight",
				dangCo: "nhanh1",
				tab0: ["nhanh1"],
				nhanh1: "true",
			},
			{ buoc: "ArrowRight", dangCo: "la11", tab0: ["la11"], nhanh1: "true" },
			{ buoc: "ArrowLeft", dangCo: "nhanh1", tab0: ["nhanh1"], nhanh1: "true" },
			{
				buoc: "ArrowLeft",
				dangCo: "nhanh1",
				tab0: ["nhanh1"],
				nhanh1: "false",
			},
			{ buoc: "End", dangCo: "nhanh2", tab0: ["nhanh2"], nhanh1: "false" },
			{ buoc: "Home", dangCo: "goc", tab0: ["goc"], nhanh1: "false" },
		]);
		expect(chon).toEqual(["goc"]);
		const cap3 = document.querySelector("[data-id='la11']");
		expect(cap3).toBeNull();
	});
});

describe("tree-nav — mục đang chọn không có trong cây", () => {
	for (const [ten, selectedId] of [
		["người không phải nút cây", "nguoi:k"],
		["đơn vị không thấy", "pb:khong-co"],
	] as const) {
		test(`${ten}: đúng một mục trong thứ tự Tab, là mục đầu`, async () => {
			khung = document.createElement("div");
			document.body.appendChild(khung);
			const r = createRoot(khung);
			root = r;
			await act(async () => {
				r.render(<Vo selectedId={selectedId} />);
			});
			const tab0 = [
				...document.querySelectorAll("[role='tree'] [tabindex='0']"),
			].map((e) => e.getAttribute("data-id"));
			expect(tab0).toEqual(["goc"]);
		});
	}
});
