import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { TargetLineChart } from "../src/components/target-line-chart";

class QuanSatCoCo {
	constructor(private cb: ResizeObserverCallback) {}
	observe(el: Element) {
		this.cb(
			[
				{
					target: el,
					contentRect: { width: 640, height: 224 } as DOMRectReadOnly,
				} as ResizeObserverEntry,
			],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}

const roCu = globalThis.ResizeObserver;
const rectCu = HTMLElement.prototype.getBoundingClientRect;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	globalThis.ResizeObserver = roCu;
	HTMLElement.prototype.getBoundingClientRect = rectCu;
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const DIEM = [
	{ x: "02/11", value: 60, expected: 60 },
	{ x: "09/11", value: 66, expected: 63 },
	{ x: "16/11", value: 71, expected: 66 },
	{ x: "23/11", value: null, expected: 69 },
];

describe("target-line-chart", () => {
	test("hai đường, vạch đích có nhãn, bảng ẩn cho trình đọc", async () => {
		globalThis.ResizeObserver = QuanSatCoCo as unknown as typeof ResizeObserver;
		HTMLElement.prototype.getBoundingClientRect = () =>
			({
				width: 640,
				height: 224,
				top: 0,
				left: 0,
				right: 640,
				bottom: 224,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
		await act(async () =>
			root?.render(
				<LocaleProvider locale="vi">
					<TargetLineChart
						data={DIEM}
						formatValue={(v) => `${v}%`}
						label="Đối tác chấm hài lòng, đích 85%"
						target={85}
						targetLabel="Đích 85%"
					/>
				</LocaleProvider>,
			),
		);
		await act(async () => new Promise((r) => setTimeout(r, 50)));
		const bieuDo = document.querySelector("[data-slot='chart']");
		expect(bieuDo?.getAttribute("aria-label")).toBe(
			"Đối tác chấm hài lòng, đích 85%",
		);
		const duong = [...document.querySelectorAll(".recharts-line-curve")];
		expect(duong.length).toBe(2);
		expect(
			duong.map((d) => d.getAttribute("stroke-dasharray") ?? "liền"),
		).toEqual(["4 4", "liền"]);
		const nhanDich = [...document.querySelectorAll("svg text")].find(
			(t) => t.textContent === "Đích 85%",
		);
		expect(nhanDich?.textContent).toBe("Đích 85%");
		const dong = [...document.querySelectorAll("table.sr-only tbody tr")].map(
			(tr) => [...tr.children].map((c) => c.textContent),
		);
		expect(dong).toEqual([
			["02/11", "60%", "60%"],
			["09/11", "66%", "63%"],
			["16/11", "71%", "66%"],
			["23/11", "—", "69%"],
		]);
	});
});

async function veCoDiemMoi(
	diemMoi: { x: string; value: number } | undefined,
): Promise<void> {
	globalThis.ResizeObserver = QuanSatCoCo as unknown as typeof ResizeObserver;
	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			width: 640,
			height: 224,
			top: 0,
			left: 0,
			right: 640,
			bottom: 224,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		}) as DOMRect;
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () =>
		root?.render(
			<LocaleProvider locale="vi">
				<TargetLineChart
					data={DIEM}
					formatValue={(v) => `${v}%`}
					label="Đối tác chấm hài lòng, đích 85%"
					previewPoint={diemMoi}
					target={85}
					targetLabel="Đích 85%"
				/>
			</LocaleProvider>,
		),
	);
	await act(async () => new Promise((r) => setTimeout(r, 50)));
}

describe("target-line-chart-diem-moi", () => {
	test("có previewPoint: đúng một điểm mới mang giá trị, nối nét đứt từ điểm thật cuối, điểm cũ giữ nguyên", async () => {
		await veCoDiemMoi({ x: "23/11", value: 74 });
		const moi = [...document.querySelectorAll("[data-diem-moi]")];
		const duong = [...document.querySelectorAll(".recharts-line-curve")];
		expect({
			soDiemMoi: moi.length,
			giaTri: moi.map((d) => d.getAttribute("data-diem-moi")),
			soDiemCu: document.querySelectorAll(
				".recharts-line-dots circle:not([data-diem-moi])",
			).length,
			net: duong.map((d) => d.getAttribute("stroke-dasharray") ?? "liền"),
			dich: document.querySelectorAll("[data-muc='dich']").length > 0,
		}).toEqual({
			soDiemMoi: 1,
			giaTri: ["74"],
			soDiemCu: 3,
			net: ["4 4", "liền", "2 4"],
			dich: true,
		});
	});

	test("có previewPoint ở tuần chưa có trong dữ liệu: thêm một hàng, vẫn đúng một điểm mới", async () => {
		await veCoDiemMoi({ x: "30/11", value: 80 });
		expect(
			[...document.querySelectorAll("[data-diem-moi]")].map((d) =>
				d.getAttribute("data-diem-moi"),
			),
		).toEqual(["80"]);
	});

	test("vắng previewPoint: không điểm mới, hai đường như cũ", async () => {
		await veCoDiemMoi(undefined);
		expect({
			soDiemMoi: document.querySelectorAll("[data-diem-moi]").length,
			soDuong: document.querySelectorAll(".recharts-line-curve").length,
		}).toEqual({ soDiemMoi: 0, soDuong: 2 });
	});
});
