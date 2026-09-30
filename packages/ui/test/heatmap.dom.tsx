import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BAC_NHIET, Heatmap } from "../src/components/heatmap";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const COT = ["a", "b", "c", "d", "e"].map((id, i) => ({
	id,
	label: `0${i + 1}/11`,
	current: id === "d",
}));

const GIA_TRI: (number | null)[][] = [
	[0, 20, 40, 60, 90],
	[null, 25, 50, 75, 100],
	[null, null, null, null, null],
];

describe("heatmap — năm bậc, ô rỗng, cột hiện tại", () => {
	test("bậc và lớp mỗi ô đúng bảng viết trước", () => {
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
		act(() =>
			root?.render(
				<LocaleProvider locale="vi">
					<Heatmap
						caption="Tỷ lệ KR tự tin cao"
						columns={COT}
						rows={[
							{ id: "r1", label: "Kinh doanh" },
							{ id: "r2", label: "Vùng 1", indent: true },
							{ id: "r3", label: "Kho vận", indent: true },
						]}
						values={GIA_TRI}
					/>
				</LocaleProvider>,
			),
		);
		const o = [...document.querySelectorAll("tbody td")];
		expect(o.map((td) => td.getAttribute("data-bac"))).toEqual([
			"0",
			"1",
			"2",
			"3",
			"4",
			"rong",
			"1",
			"2",
			"3",
			"4",
			"rong",
			"rong",
			"rong",
			"rong",
			"rong",
		]);
		const lop = (td: Element) =>
			[
				"bg-foreground/5",
				"bg-foreground/15",
				"bg-foreground/30",
				"bg-foreground/65",
				"bg-foreground/85",
				"text-foreground",
				"text-background",
				"border-dashed",
			].filter((c) => td.classList.contains(c));
		expect(o.slice(0, 5).map(lop)).toEqual([
			["bg-foreground/5", "text-foreground"],
			["bg-foreground/15", "text-foreground"],
			["bg-foreground/30", "text-foreground"],
			["bg-foreground/65", "text-background"],
			["bg-foreground/85", "text-background"],
		]);
		expect(lop(o[5] as Element)).toEqual(["border-dashed"]);
		expect(o[5]?.textContent).toBe("chưa có");
		expect(document.querySelector("caption")?.textContent).toBe(
			"Tỷ lệ KR tự tin cao",
		);
		expect(document.querySelector("thead [data-current]")?.textContent).toBe(
			"04/11",
		);
	});
});

function veHeatmap(legend?: { cao: string; trong: string }) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<Heatmap
					caption="Độ phủ góp ý theo đơn vị và ngày"
					columns={COT}
					legend={legend}
					rows={[
						{ id: "r1", label: "Kinh doanh" },
						{ id: "r2", label: "Vùng 1", indent: true },
						{ id: "r3", label: "Kho vận", indent: true },
					]}
					values={GIA_TRI}
				/>
			</LocaleProvider>,
		),
	);
	return document.querySelector('[data-slot="heatmap-legend"]');
}

describe("heatmap — chú giải truyền vào", () => {
	test("in đúng hai câu truyền vào, không còn chữ KR", () => {
		const chuGiai = veHeatmap({
			cao: "Ô càng nổi khỏi nền, càng nhiều người trong đơn vị đã góp ý.",
			trong: "ngày chưa tới",
		});
		expect(chuGiai?.textContent).toBe(
			"Ô càng nổi khỏi nền, càng nhiều người trong đơn vị đã góp ý.ngày chưa tới",
		);
		expect(document.body.textContent).not.toContain("KR");
	});

	test("không truyền chú giải thì giữ câu của màn toàn cảnh", () => {
		const chuGiai = veHeatmap();
		expect(chuGiai?.textContent).toBe(
			"Ô càng nổi khỏi nền, càng nhiều KR tự tin cao.tuần chưa tới hoặc chưa ai cập nhật",
		);
	});
});

const CSS = readFileSync(`${import.meta.dir}/../src/styles/geist.css`, "utf8");

function khoiCua(chon: ":root" | ".dark"): string {
	const i = CSS.indexOf(`${chon} {`);
	if (i < 0) throw new Error(`không thấy khối ${chon} trong geist.css`);
	return CSS.slice(i, CSS.indexOf("}", i));
}

function kenh(chon: ":root" | ".dark", ten: string): number {
	const khoi = khoiCua(chon);
	const lab = khoi.match(new RegExp(`--${ten}:\\s*lab\\(([\\d.]+)%`));
	if (lab) {
		const L = Number(lab[1]);
		const fy = (L + 16) / 116;
		const y = fy ** 3 > 0.008856 ? fy ** 3 : (fy - 16 / 116) / 7.787;
		return y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
	}
	const hsl = khoi.match(
		new RegExp(`--${ten}-value:\\s*[\\d.]+,\\s*0%,\\s*([\\d.]+)%`),
	);
	if (hsl) return Number(hsl[1]) / 100;
	throw new Error(`không đọc được --${ten} ở ${chon}`);
}

const tuyen = (c: number) =>
	c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

function tyLe(a: number, b: number): number {
	const la = tuyen(a);
	const lb = tuyen(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const DO_TRONG = [0.05, 0.15, 0.3, 0.65, 0.85];

const BANG_VIET_TRUOC = [
	[15.48, 16.75],
	[12.53, 13.35],
	[8.8, 7.93],
	[5.45, 7.48],
	[11.02, 12.76],
];

describe("heatmap — tương phản chữ trên từng bậc, đọc từ token thật", () => {
	test("năm bậc × hai nền khớp bảng design doc và ≥ 4.5", () => {
		const nen = {
			sang: [kenh(":root", "ds-background-200"), kenh(":root", "ds-gray-1000")],
			toi: [kenh(".dark", "ds-background-200"), kenh(".dark", "ds-gray-1000")],
		} as const;
		const ra = BAC_NHIET.map((b, i) => {
			const a = DO_TRONG[i] ?? 0;
			const chuNen = b.chu === "text-background";
			return (["sang", "toi"] as const).map((k) => {
				const [bg, fg] = nen[k];
				const o = bg * (1 - a) + fg * a;
				return Math.round(tyLe(o, chuNen ? bg : fg) * 100) / 100;
			});
		});
		for (const [i, dong] of ra.entries())
			for (const [j, so] of dong.entries()) {
				expect(Math.abs(so - (BANG_VIET_TRUOC[i]?.[j] ?? 0))).toBeLessThan(0.1);
				expect(so).toBeGreaterThanOrEqual(4.5);
			}
		expect(BAC_NHIET.map((b) => b.nen)).toEqual([
			"bg-foreground/5",
			"bg-foreground/15",
			"bg-foreground/30",
			"bg-foreground/65",
			"bg-foreground/85",
		]);
	});
});
