import { afterAll, afterEach, beforeAll, describe, test } from "bun:test";
import type { DuAnLich } from "@crm/validation/du-an-lich";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { GanttDuAn } from "../src/components/gantt-du-an";
import { LocaleProvider } from "../src/components/locale-provider";

const HOM_NAY = "2026-10-19";
const BE_RONG_KHUNG = 1280;

const VIEC: DuAnLich["viec"] = [
	{
		id: "a",
		tieuDe: "Dựng kho mới",
		chaId: null,
		batDau: "2026-10-22",
		han: "2026-10-27",
		nghia: "dangChay",
		suaDuoc: true,
		phaiCho: [],
	},
	{
		id: "b",
		tieuDe: "Bàn giao kho",
		chaId: null,
		batDau: "2026-10-24",
		han: "2026-10-27",
		nghia: "cho",
		suaDuoc: true,
		phaiCho: ["a"],
	},
];

const rongGoc = Object.getOwnPropertyDescriptor(
	window.HTMLElement.prototype,
	"clientWidth",
);

beforeAll(() => {
	Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
		configurable: true,
		get: () => BE_RONG_KHUNG,
	});
});

afterAll(() => {
	if (rongGoc) {
		Object.defineProperty(window.HTMLElement.prototype, "clientWidth", rongGoc);
	}
});

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function ve(lich: DuAnLich["lich"]): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(
			<LocaleProvider locale="vi">
				<GanttDuAn
					className="h-[640px]"
					viec={VIEC}
					moc={[]}
					lich={lich}
					homNay={HOM_NAY}
					onDoiLich={() => {}}
					onDatNgay={() => {}}
					onMoViec={() => {}}
				/>
			</LocaleProvider>,
		);
	});
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
	return khung;
}

function ngayNghi(goc: HTMLElement): string[] {
	return [...goc.querySelectorAll<HTMLElement>("[data-off-day]")].map(
		(e) => e.getAttribute("data-off-day") ?? "",
	);
}

describe("vg-gantt-bay-ngay", () => {
	test("vg-gantt-bay-ngay: lịch làm cả tuần không tô ô ngày nghỉ nào, đối chứng T7 CN có tô", async () => {
		const t7cn = ngayNghi(await ve({ ngayNghiTuan: [6, 7], ngayLe: [] }));
		const cuoiTuan = t7cn.filter(
			(d) => d.includes("2026-10-24") || d.includes("2026-10-25"),
		);
		if (cuoiTuan.length === 0) {
			throw new Error(
				`vg gantt: doi chung T7 CN khong to ${JSON.stringify(t7cn.slice(0, 6))}`,
			);
		}
		act(() => root?.unmount());
		khung?.remove();

		const rong = ngayNghi(await ve({ ngayNghiTuan: [], ngayLe: [] }));
		if (rong.length !== 0) {
			throw new Error(`vg gantt: to ngay nghi khi lich rong ${rong.length}`);
		}
	});
});
