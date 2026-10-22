import { afterEach, describe, expect, jest, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import {
	OKR_TOM_TAT,
	type TroLyTomTatOutput,
	troLyTomTatOutput,
} from "@crm/validation/okr-tom-tat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { dat, datMacDinh, goiCua } from "./khung-gop-y";

const { KhoiTomTat } = await import("@/app/(app)/[slug]/okr/khoi-tom-tat");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const LUC = "2026-10-26T23:00:00.000Z";
const CHU_VI =
	"Kara gửi bản tóm tắt đầu tiên vào khoảng 06:00 thứ Ba, 27/10 — sáng hôm sau ngày cập nhật thứ Hai.";
const CHU_EN =
	"Kara sends the first summary around 06:00 on Tuesday, 27/10 — the morning after the Monday update.";
const CHU_DANG_XEP =
	"Kara đang xếp bản tóm tắt đầu tiên — thường có trong vài phút.";
const CHU_HET_TRAN = "Kara tạm nghỉ tóm tắt tuần tới 01/12.";
const CHU_CHUA_KHOA = "Kara chưa tóm tắt được: quản trị chưa nối mô hình AI.";
const MAU_GIO = /\d\d:\d\d/;
const MAU_TIEN = [/\d[\d.,]*\s*(₫|đ(?![\p{L}\p{N}])|USD)/u, /\$\s*\d/];

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let dongHoGia = false;

function tomTat(thay: Partial<TroLyTomTatOutput>): TroLyTomTatOutput {
	return troLyTomTatOutput.parse({
		ban: null,
		dangSoan: false,
		chuaCapNhat: false,
		...thay,
	});
}

function datTomTat(lay: () => TroLyTomTatOutput): void {
	datMacDinh([]);
	dat("okr.troLyTomTat", () => lay());
}

async function troi(ms: number): Promise<void> {
	const BUOC = 250;
	for (let t = 0; t < ms; t += BUOC) {
		await act(async () => {
			jest.advanceTimersByTime(Math.min(BUOC, ms - t));
		});
		await act(async () => {
			await Promise.resolve();
		});
	}
}

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		if (dongHoGia) await troi(10);
		else
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
	}
}

async function mo(locale: Locale = "vi"): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>
							<KhoiTomTat cycleId="q4" departmentId="pb-1" />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(10);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

const trangThai = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-trang-thai="${id}"]`);
const khoi = () =>
	document.body.querySelector<HTMLElement>('[data-khoi="tom-tat"]');
const chu = (o: Element | null) =>
	(o?.textContent ?? "").replace(/\s+/g, " ").trim();
const soGoi = () => goiCua("okr.troLyTomTat").length;

afterEach(async () => {
	if (dongHoGia) {
		jest.useRealTimers();
		dongHoGia = false;
	}
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("ttdc-khoi-cho", () => {
	test("ttdc-khoi-cho: phong bat chua co ban thay mot dong gio ban dau tien", async () => {
		datTomTat(() => tomTat({ choBan: { kieu: "toi-luc", luc: LUC } }));
		await mo();
		await cho(() => trangThai("ST-tomtat-cho-ban-dau") !== null, "dong cho");
		const o = trangThai("ST-tomtat-cho-ban-dau");
		expect({
			tieuDe: chu(khoi()?.querySelector("[data-slot=card-title]") ?? null),
			soDong: o?.querySelectorAll("[data-cho-ban]").length ?? 0,
			dong:
				chu(o?.querySelector("[data-cho-ban]") ?? null) ||
				"ttdc-khoi-cho: khong co dong cho ban dau",
		}).toEqual({ tieuDe: "Tóm tắt tuần của Kara", soDong: 1, dong: CHU_VI });
	});

	test("ttdc-khoi-cho: doi chung — khong co choBan thi khong co khoi", async () => {
		datTomTat(() => tomTat({}));
		await mo();
		await nhip(5);
		expect(soGoi()).toBeGreaterThan(0);
		expect(khoi()).toBeNull();
	});

	test("ttdc-khoi-cho: mo san toi luc thi hoi lai dung mot lan", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		const luc = new Date(Date.now() + 60_000).toISOString();
		datTomTat(() => tomTat({ choBan: { kieu: "toi-luc", luc } }));
		await mo();
		await cho(() => trangThai("ST-tomtat-cho-ban-dau") !== null, "dong cho");
		const truoc = soGoi();
		await troi(61_000);
		const sauToiLuc = soGoi();
		await troi(10 * 60_000);
		expect({
			themKhiToiLuc:
				sauToiLuc - truoc === 1
					? 1
					: "ttdc-khoi-cho: khong hoi lai khi toi luc",
			themSauDo: soGoi() - sauToiLuc,
		}).toEqual({ themKhiToiLuc: 1, themSauDo: 0 });
	}, 60_000);

	test("ttdc-khoi-cho: luc qua xa tran hen gio thi khong hen", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		const luc = new Date(Date.now() + 30 * 24 * 3_600_000).toISOString();
		datTomTat(() => tomTat({ choBan: { kieu: "toi-luc", luc } }));
		await mo();
		await cho(() => trangThai("ST-tomtat-cho-ban-dau") !== null, "dong cho");
		const truoc = soGoi();
		await troi(10 * 60_000);
		expect(soGoi()).toBe(truoc);
	}, 60_000);
});

describe("ttdc-dang-xep", () => {
	test("ttdc-dang-xep: dong dang xep va hoi lai theo nhip toi tran", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		datTomTat(() => tomTat({ choBan: { kieu: "dang-xep" } }));
		await mo();
		await cho(() => trangThai("ST-tomtat-dang-xep") !== null, "dang xep");
		expect(
			chu(
				trangThai("ST-tomtat-dang-xep")?.querySelector("[data-cho-ban]") ??
					null,
			),
		).toBe(CHU_DANG_XEP);
		expect(soGoi()).toBe(1);
		await troi(OKR_TOM_TAT.hoiLaiMs + 250);
		expect(soGoi()).toBe(2);
		await troi(OKR_TOM_TAT.tranChoMs);
		const khiDung = soGoi();
		expect(khiDung).toBe(1 + OKR_TOM_TAT.tranChoMs / OKR_TOM_TAT.hoiLaiMs);
		await troi(OKR_TOM_TAT.tranChoMs);
		expect(soGoi()).toBe(khiDung);
	}, 60_000);
});

describe("ttdc-tam-dung", () => {
	test("ttdc-tam-dung: mau so tien bat dung, hai chuoi cua AC-5 lot", () => {
		const bat = (s: string) => MAU_TIEN.some((m) => m.test(s));
		expect({
			duong: ["1.200.000 đ", "5 USD", "$5"].map(bat),
			am: [CHU_HET_TRAN, CHU_CHUA_KHOA].map(bat),
		}).toEqual({ duong: [true, true, true], am: [false, false] });
	});

	for (const [ten, cho_, chuoi] of [
		[
			"het-tran",
			{ kieu: "tam-dung", lyDo: "het-tran-thang", moLai: "2026-12-01" },
			CHU_HET_TRAN,
		],
		[
			"chua-khoa",
			{ kieu: "tam-dung", lyDo: "chua-co-khoa-mo-hinh", moLai: null },
			CHU_CHUA_KHOA,
		],
	] as const) {
		test(`ttdc-tam-dung: ${ten} hien Kara tat, khong gio, khong tien`, async () => {
			datTomTat(() => tomTat({ choBan: cho_ }));
			await mo();
			await cho(() => trangThai("ST-tomtat-tam-dung") !== null, "tam dung");
			const o = trangThai("ST-tomtat-tam-dung");
			const s = chu(o);
			expect({
				off: o?.querySelector("[data-kara-state=off]")
					? "co"
					: "ttdc-tam-dung: (a) ra toi-luc khi het tran",
				chu: s,
				gio: MAU_GIO.test(s),
				tien: MAU_TIEN.some((m) => m.test(s)),
			}).toEqual({ off: "co", chu: chuoi, gio: false, tien: false });
		});
	}
});

describe("ttdc-khong-doi", () => {
	test("ttdc-khong-doi: dang soan va chua cap nhat giu trang thai cu", async () => {
		datTomTat(() => tomTat({ dangSoan: true }));
		await mo();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		for (const s of dangMo) {
			await act(async () => s.root.unmount());
			s.o.remove();
		}
		dangMo = [];
		datTomTat(() => tomTat({ chuaCapNhat: true }));
		await mo();
		await cho(
			() => trangThai("ST-tomtat-chua-cap-nhat") !== null,
			"chua cap nhat",
		);
		expect(document.body.querySelector("[data-cho-ban]")).toBeNull();
	});
});

describe("ttdc-mui-gio", () => {
	test("ttdc-mui-gio: TZ dat tu ngoai co ap", () => {
		const tz = process.env.TZ;
		const MOC = [Date.UTC(2026, 0, 15, 12), Date.UTC(2026, 6, 15, 12)];
		const dang = (timeZone?: string) =>
			MOC.map((t) =>
				new Intl.DateTimeFormat("en-GB", {
					timeZone,
					dateStyle: "short",
					timeStyle: "short",
				}).format(t),
			).join("|");
		expect(tz && dang() === dang(tz) ? "ap" : "ttdc-mui-gio: TZ khong ap").toBe(
			"ap",
		);
	});

	for (const [locale, mong] of [
		["vi", CHU_VI],
		["en", CHU_EN],
	] as const) {
		test(`ttdc-mui-gio: ${locale} hien gio Viet Nam`, async () => {
			datTomTat(() => tomTat({ choBan: { kieu: "toi-luc", luc: LUC } }));
			await mo(locale);
			await cho(() => trangThai("ST-tomtat-cho-ban-dau") !== null, "dong cho");
			const s = chu(trangThai("ST-tomtat-cho-ban-dau"));
			expect(s === mong ? s : `ttdc-mui-gio: gio lech (${s})`).toBe(mong);
		});
	}

	test("ttdc-mui-gio: moi chuoi cua dong cho lay tu messages, khong rong, vi khac en", () => {
		const vi = okrToanCanhMessages("vi").tomTat;
		const en = okrToanCanhMessages("en").tomTat;
		const lay = (m: typeof vi) => [
			m.choBanDau("06:00", m.tenThu[1] ?? "", "27/10", m.tenThu[0] ?? ""),
			m.dangXep,
			m.tamNghiDen("01/12"),
			m.chuaNoiMoHinh,
		];
		const a = lay(vi);
		const b = lay(en);
		expect({
			rong: [...a, ...b].filter((s) => s.trim() === "").length,
			trung: a.filter((s, i) => s === b[i]).length,
			soThu: [vi.tenThu.length, en.tenThu.length],
		}).toEqual({ rong: 0, trung: 0, soThu: [7, 7] });
	});
});
