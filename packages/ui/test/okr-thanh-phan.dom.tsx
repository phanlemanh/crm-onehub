import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	ConfidenceIndicator,
	type MucTuTin,
	type NhipOkr,
	PaceIndicator,
} from "../src/components/okr-status";
import { Progress } from "../src/components/progress";
import type { Locale } from "../src/lib/locale";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(el: ReactElement, locale: Locale): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale={locale}>{el}</LocaleProvider>));
	return khung;
}

function goRa() {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
}

const CA_THANH: [number, number | null][] = [
	[30, 47],
	[60, 47],
	[100, null],
	[0, 0],
];

describe("progress trung tính", () => {
	test("vạch kỳ vọng đúng chỗ, không tô màu thương hiệu, nhãn đọc ghim", () => {
		const ketQua = CA_THANH.map(([value, expected]) => {
			const k = dung(
				<Progress
					expected={expected}
					label="Tiến độ"
					value={value}
					variant="neutral"
				/>,
				"vi",
			);
			const vach = k.querySelector<HTMLElement>("[data-expected]");
			const chiBao = k.querySelector("[data-slot='progress-indicator']");
			const goc = k.querySelector("[data-slot='progress']");
			const dong = {
				vach: vach ? vach.style.left : null,
				chiBao: chiBao?.className.includes("bg-primary") ?? true,
				nhan: goc?.getAttribute("aria-label") ?? null,
			};
			goRa();
			return dong;
		});
		expect(ketQua).toEqual([
			{
				vach: "calc(47% - 1px)",
				chiBao: false,
				nhan: "Tiến độ: 30%, lẽ ra đã tới 47%",
			},
			{
				vach: "calc(47% - 1px)",
				chiBao: false,
				nhan: "Tiến độ: 60%, lẽ ra đã tới 47%",
			},
			{ vach: null, chiBao: false, nhan: "Tiến độ: 100% tiến độ" },
			{
				vach: "calc(0% - 1px)",
				chiBao: false,
				nhan: "Tiến độ: 0%, lẽ ra đã tới 0%",
			},
		]);
	});

	test("nhãn tiếng Anh khác tiếng Việt", () => {
		const k = dung(
			<Progress expected={47} label="Progress" value={30} variant="neutral" />,
			"en",
		);
		expect(
			k.querySelector("[data-slot='progress']")?.getAttribute("aria-label"),
		).toBe("Progress: 30%, expected 47% by now");
	});

	test("không variant thì giữ hành vi cũ: tô bg-primary, không vạch", () => {
		const k = dung(<Progress value={40} />, "vi");
		expect(
			k
				.querySelector("[data-slot='progress-indicator']")
				?.className.includes("bg-primary"),
		).toBe(true);
		expect(k.querySelector("[data-expected]")).toBeNull();
	});
});

const MUC: MucTuTin[] = ["cao", "vua", "thap"];
const NHIP: NhipOkr[] = [
	"dung-nhip",
	"cham-nhip",
	"truot",
	"chua-co-ky-vong",
	"moc-xong",
	"moc-chua",
];

function doc(el: ReactElement, locale: Locale) {
	const k = dung(el, locale);
	const cham = k.querySelector("[data-slot='indicator-dot']");
	const dong = {
		chu: k.textContent,
		tone: cham?.getAttribute("data-tone") ?? null,
	};
	goRa();
	return dong;
}

describe("cặp chỉ báo mức tự tin và tình trạng", () => {
	test("ba mức tự tin × hai tiếng", () => {
		const ra = MUC.flatMap((m) =>
			(["vi", "en"] as const).map((l) =>
				doc(<ConfidenceIndicator level={m} />, l),
			),
		);
		expect(ra).toEqual([
			{ chu: "Tự tin cao", tone: "success" },
			{ chu: "High confidence", tone: "success" },
			{ chu: "Tự tin vừa", tone: "warning" },
			{ chu: "Medium confidence", tone: "warning" },
			{ chu: "Tự tin thấp", tone: "error" },
			{ chu: "Low confidence", tone: "error" },
		]);
	});

	test("sáu tình trạng × hai tiếng", () => {
		const ra = NHIP.flatMap((n) =>
			(["vi", "en"] as const).map((l) => doc(<PaceIndicator pace={n} />, l)),
		);
		expect(ra).toEqual([
			{ chu: "Đúng nhịp", tone: "success" },
			{ chu: "On track", tone: "success" },
			{ chu: "Chậm nhịp", tone: "warning" },
			{ chu: "Behind", tone: "warning" },
			{ chu: "Trượt", tone: "error" },
			{ chu: "Off track", tone: "error" },
			{ chu: "Chưa có vạch lẽ ra", tone: "neutral" },
			{ chu: "No expected line yet", tone: "neutral" },
			{ chu: "Đã xong", tone: "success" },
			{ chu: "Done", tone: "success" },
			{ chu: "Mốc, chưa xong", tone: "neutral" },
			{ chu: "Milestone, not done", tone: "neutral" },
		]);
	});
});
