import { afterAll, afterEach, beforeAll, describe, test } from "bun:test";
import type { DuAnLich } from "@crm/validation/du-an-lich";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { GanttDuAn, nhanGantt } from "../src/components/gantt-du-an";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	DEFAULT_GANTT_I18N,
	type GanttI18nConfig,
	mergeGanttI18n,
} from "../src/components/reui/gantt/gantt-i18n";
import { messages } from "../src/lib/messages";

const DU_AN: DuAnLich = {
	duAn: {
		id: "p",
		ten: "Mở chi nhánh Đà Nẵng",
		moTa: null,
		dong: false,
		taoBoiId: "u",
	},
	viec: [
		{
			id: "c",
			tieuDe: "Triển khai chi nhánh",
			chaId: null,
			batDau: "2026-10-27",
			han: "2026-10-30",
			nghia: "dangChay",
			suaDuoc: true,
			phaiCho: ["b"],
		},
		{
			id: "a",
			tieuDe: "Khảo sát mặt bằng",
			chaId: "c",
			batDau: "2026-10-19",
			han: "2026-10-20",
			nghia: "xong",
			suaDuoc: true,
			phaiCho: [],
		},
		{
			id: "b",
			tieuDe: "Ký hợp đồng thuê",
			chaId: "c",
			batDau: "2026-10-21",
			han: "2026-10-23",
			nghia: "cho",
			suaDuoc: true,
			phaiCho: ["a"],
		},
		{
			id: "d",
			tieuDe: "Tuyển trưởng chi nhánh",
			chaId: null,
			batDau: null,
			han: null,
			nghia: "nhap",
			suaDuoc: true,
			phaiCho: [],
		},
	],
	moc: [
		{
			id: "m",
			ten: "Khai trương",
			ngay: "2026-10-30",
			tre: false,
			treBoi: [],
			cho: ["d"],
		},
	],
	lich: { ngayNghiTuan: [6, 7], ngayLe: ["2026-10-26"] },
};

const HOM_NAY = "2026-10-16";

const BE_RONG_KHUNG = 1280;

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

async function ve(du_an: DuAnLich): Promise<HTMLElement> {
	act(() => root?.unmount());
	khung?.remove();
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(
			<LocaleProvider locale="vi">
				<GanttDuAn
					className="h-[640px]"
					viec={du_an.viec}
					moc={du_an.moc}
					lich={du_an.lich}
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

function hangCay(goc: HTMLElement): HTMLElement[] {
	return [
		...goc.querySelectorAll<HTMLElement>(
			"[data-slot=gantt-row-group][data-gantt-row-id]",
		),
	];
}

function hangTruc(goc: HTMLElement, id: string): HTMLElement | null {
	return goc.querySelector<HTMLElement>(
		`[data-gantt-row][data-gantt-row-id="${id}"]`,
	);
}

function capPhuThuoc(du_an: DuAnLich): { tu: string; den: string }[] {
	const coLich = new Set(
		du_an.viec.filter((v) => v.batDau && v.han).map((v) => v.id),
	);
	return [
		...du_an.viec
			.filter((v) => coLich.has(v.id))
			.flatMap((v) =>
				v.phaiCho
					.filter((id) => coLich.has(id))
					.map((tu) => ({ tu, den: v.id })),
			),
		...du_an.moc.flatMap((m) =>
			m.cho.filter((id) => coLich.has(id)).map((tu) => ({ tu, den: m.id })),
		),
	];
}

function sapCap(cap: { tu: string; den: string }[]): string {
	return JSON.stringify(
		[...cap].sort((x, y) =>
			`${x.tu}>${x.den}`.localeCompare(`${y.tu}>${y.den}`),
		),
	);
}

type NhanReui = GanttI18nConfig["labels"];
type GiaTriNhan = NhanReui[keyof NhanReui];
type HamNhan = (doi_so: number | string) => string;

function banIn(gia_tri: GiaTriNhan): [string, string][] {
	if (gia_tri instanceof Function) {
		const ham = gia_tri as HamNhan;
		return [
			["(3)", ham(3)],
			["(X)", ham("X")],
		];
	}
	if (gia_tri instanceof Object) {
		return Object.entries(gia_tri).map(([con, chu]) => [`.${con}`, chu]);
	}
	return [["", gia_tri]];
}

function nhanTrung(reui: NhanReui, da_dung: NhanReui): string[] {
	const ra: string[] = [];
	for (const khoa of Object.keys(reui) as (keyof NhanReui)[]) {
		const sau = new Map(banIn(da_dung[khoa]));
		for (const [duoi, chu] of banIn(reui[khoa])) {
			if (sau.get(duoi) === chu) ra.push(`${khoa}${duoi}`);
		}
	}
	return ra;
}

describe("gantt-du-an — GanttDuAn vẽ đúng lịch dự án", () => {
	test("gantt-du-an: hàng mốc, cây con, thanh, mũi tên, ngày nghỉ, nhóm chưa lịch, nhãn", async () => {
		const goc = await ve(DU_AN);
		const moc = DU_AN.moc[0];
		if (!moc) throw new Error("gantt: thieu hang moc");

		const hang = hangCay(goc);
		const dau = hang[0];
		const trucMoc = dau ? hangTruc(goc, dau.dataset.ganttRowId ?? "") : null;
		if (
			!dau?.textContent?.includes("Mốc") ||
			!trucMoc?.querySelector(`[data-gantt-moc="${moc.ten}"]`)
		) {
			throw new Error("gantt: thieu hang moc");
		}

		const C = DU_AN.viec.find((v) => v.tieuDe === "Triển khai chi nhánh");
		const con = DU_AN.viec.filter((v) => C && v.chaId === C.id);
		const hangC = hang.findIndex((h) => h.dataset.ganttRowId === C?.id);
		const conThut = con.every((v) => {
			const i = hang.findIndex((h) => h.dataset.ganttRowId === v.id);
			return i > hangC && hang[i]?.dataset.ganttCha === C?.id;
		});
		if (!C || con.length !== 2 || hangC < 0 || !conThut) {
			throw new Error("gantt: con khong thut");
		}

		const thanh = goc.querySelectorAll("[data-gantt-bar]");
		if (thanh.length !== 3) {
			throw new Error(`gantt: so thanh sai ${thanh.length}`);
		}

		const xong = DU_AN.viec.find((v) => v.nghia === "xong");
		const thanhXong = xong
			? hangTruc(goc, xong.id)?.querySelector("[data-gantt-bar]")
			: null;
		if (thanhXong?.getAttribute("data-tone") !== "success") {
			throw new Error("gantt: mau trang thai sai");
		}

		const duong = [
			...goc.querySelectorAll<SVGElement>("[data-gantt-dependency]"),
		].map((g) => ({
			tu: g.getAttribute("data-tu") ?? "",
			den: g.getAttribute("data-den") ?? "",
		}));
		const mongDoi = capPhuThuoc(DU_AN);
		if (
			duong.length !== 2 ||
			mongDoi.length !== 2 ||
			sapCap(duong) !== sapCap(mongDoi)
		) {
			throw new Error(`gantt: mui ten sai ${JSON.stringify(duong)}`);
		}

		for (const ngay of ["2026-10-24", "2026-10-25", "2026-10-26"]) {
			if (!goc.querySelector(`[data-off-day="${ngay}"]`)) {
				throw new Error(`gantt: ngay nghi sai ${ngay}`);
			}
		}
		if (goc.querySelector('[data-off-day="2026-10-27"]')) {
			throw new Error("gantt: ngay nghi sai 2026-10-27");
		}

		const nhom = hang.find((h) => h.textContent?.includes("Chưa có lịch (1)"));
		const conNhom = nhom
			? hang.filter((h) => h.dataset.ganttCha === nhom.dataset.ganttRowId)
			: [];
		const coNut =
			conNhom.length === 1 &&
			[...(conNhom[0]?.querySelectorAll("button") ?? [])].some(
				(b) => b.textContent?.trim() === "Đặt ngày",
			);
		if (!coNut) throw new Error("gantt: thieu nhom chua lich");

		const chua_dich = nhanTrung(
			DEFAULT_GANTT_I18N.labels,
			mergeGanttI18n(nhanGantt(messages("vi").gantt, "vi")).labels,
		);
		if (chua_dich.length > 0) {
			throw new Error(`gantt: nhan chua dich ${chua_dich.join(", ")}`);
		}

		const khongLe = await ve({
			...DU_AN,
			lich: { ...DU_AN.lich, ngayLe: [] },
		});
		if (
			khongLe.querySelector('[data-off-day="2026-10-26"]') ||
			!khongLe.querySelector('[data-off-day="2026-10-24"]')
		) {
			throw new Error("gantt: doi chung ngay le hong");
		}
	});
});
