import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	fieldAccessOutput,
	fieldListOutput,
} from "../../api/src/fields/fields.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type LoiGoi = { ten: string; vao: DauVao };
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => unknown;
	onError?: (e: Error) => unknown;
};

const DAU_VIET = /[À-ỹ]/u;
const NHAN = "Nguồn khách";

let daGoi: LoiGoi[] = [];
let restoreLoi = false;
let archivedF1 = false;

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function truong(id: string, key: string, label: string, archived: boolean) {
	return {
		id,
		entity: "COMPANY",
		key,
		label,
		type: "TEXT",
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: false,
		showOnFilter: false,
		position: 0,
		archived,
		options: [],
	};
}

function dsTruong() {
	return quaJson(
		fieldListOutput.parse([
			truong("f-1", "ltk_nguon", NHAN, archivedF1),
			truong("f-2", "ltk_vung", "Vùng", false),
		]),
	);
}

function motTruong(archived: boolean) {
	const [dau] = fieldListOutput.parse([
		truong("f-1", "ltk_nguon", NHAN, archived),
	]);
	return quaJson(dau);
}

function thuTuc(ten: string, doc: (vao: DauVao) => unknown) {
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [ten] : [ten, vao]),
		pathKey: () => [ten],
		queryOptions: (vao: DauVao) => ({
			queryKey: vao === undefined ? [ten] : [ten, vao],
			queryFn: async () => {
				daGoi.push({ ten, vao });
				return doc(vao);
			},
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ ten, vao });
				return doc(vao);
			},
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		fields: {
			access: thuTuc("fields.access", () =>
				quaJson(fieldAccessOutput.parse({ canManage: true })),
			),
			list: thuTuc("fields.list", dsTruong),
			filters: thuTuc("fields.filters", () => []),
			coverage: thuTuc("fields.coverage", () => ({ filled: 0, total: 0 })),
			create: thuTuc("fields.create", khongDoc),
			update: thuTuc("fields.update", khongDoc),
			reorder: thuTuc("fields.reorder", khongDoc),
			archive: thuTuc("fields.archive", () => {
				archivedF1 = true;
				return motTruong(true);
			}),
			restore: thuTuc("fields.restore", () => {
				if (restoreLoi) throw new Error("loi-tho-may-chu");
				archivedF1 = false;
				return motTruong(false);
			}),
			backfill: thuTuc("fields.backfill", khongDoc),
		},
	}),
}));
let soLanLamMoi = 0;
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		fields: async () => {
			soLanLamMoi += 1;
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/settings/fields",
	useSearchParams: () => new URLSearchParams(),
}));

const { FieldsSettings } = await import(
	"@/app/(app)/[slug]/settings/fields/fields-settings"
);
const { FieldsSheetHost } = await import(
	"@/components/crm/fields/fields-sheet"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { crmMessages } = await import("@/lib/messages/crm");

type Locale = "vi" | "en";
type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const goiCua = (ten: string) => daGoi.filter((g) => g.ten === ten);

beforeEach(() => {
	daGoi = [];
	restoreLoi = false;
	archivedF1 = false;
	soLanLamMoi = 0;
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 5): Promise<void> {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function cho(dieu: () => boolean, moTa: string): Promise<void> {
	for (let i = 0; i < 150; i += 1) {
		if (dieu()) return;
		await nhip(1);
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function mo(
	man: ReactElement,
	searchParams: string,
	locale: Locale = "vi",
): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={searchParams} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>
							<Toaster />
							{man}
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(10);
}

async function bamTro(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	await nhip(3);
}

const vungToast = () =>
	document.querySelector("[data-sonner-toaster]")?.textContent ?? "";

const nutHoanTac = (locale: Locale = "vi") =>
	[
		...document.querySelectorAll<HTMLButtonElement>(
			"[data-sonner-toaster] button",
		),
	].find(
		(b) => (b.textContent ?? "").trim() === crmMessages(locale).sheet.hoanTac,
	);

const soHopHoi = () =>
	document.querySelectorAll('[role="alertdialog"], [role="dialog"]').length;

async function luuTruTuMenu(locale: Locale = "vi"): Promise<void> {
	const m = crmMessages(locale);
	await mo(<FieldsSettings kindBanDau="company" />, "", locale);
	await cho(
		() =>
			[...document.querySelectorAll("button")].some(
				(b) =>
					b.querySelector(".sr-only")?.textContent?.trim() ===
					m.fields.moreFor(NHAN),
			),
		"menu dong cua truong",
	);
	const menu = [...document.querySelectorAll("button")].find(
		(b) =>
			b.querySelector(".sr-only")?.textContent?.trim() ===
			m.fields.moreFor(NHAN),
	);
	await bamTro(menu);
	await cho(
		() =>
			[...document.querySelectorAll("[role=menuitem]")].some(
				(e) => (e.textContent ?? "").trim() === m.fields.archive,
			),
		"muc Luu tru",
	);
	const muc = [...document.querySelectorAll("[role=menuitem]")].find(
		(e) => (e.textContent ?? "").trim() === m.fields.archive,
	);
	await bamTro(muc);
	await nhip(5);
}

async function luuTruTuTrinhSua(locale: Locale = "vi"): Promise<void> {
	const m = crmMessages(locale);
	await mo(
		<FieldsSheetHost />,
		"manageFields=company&manageField=ltk_nguon",
		locale,
	);
	await cho(
		() =>
			[...document.querySelectorAll("button")].some(
				(b) => (b.textContent ?? "").trim() === m.fields.archive,
			),
		"nut Luu tru cua trinh sua",
	);
	const nut = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => (b.textContent ?? "").trim() === m.fields.archive,
	);
	await userEvent
		.setup({ document, pointerEventsCheck: 0 })
		.click(nut as HTMLButtonElement);
	await nhip(5);
}

describe("ltk-menu", () => {
	test("menu dong luu tru ngay, khong hoi, toast co Hoan tac", async () => {
		const m = crmMessages("vi");
		await luuTruTuMenu();
		await cho(() => goiCua("fields.archive").length > 0, "goi archive");
		expect(goiCua("fields.archive").map((g) => g.vao)).toEqual([{ id: "f-1" }]);
		expect(soHopHoi()).toBe(0);
		await cho(
			() => vungToast().includes(m.fields.archived(NHAN)),
			"toast luu tru",
		);
		chot(nutHoanTac() !== undefined, "ltk: menu luu tru khong co hoan tac");
		expect(soLanLamMoi).toBeGreaterThan(0);
	});
});

describe("ltk-trinh-sua", () => {
	test("trinh sua luu tru ngay, dong lai, toast van co Hoan tac sau khi go", async () => {
		const m = crmMessages("vi");
		await luuTruTuTrinhSua();
		await nhip(10);
		chot(
			document.querySelectorAll('[role="alertdialog"]').length === 0 &&
				goiCua("fields.archive").length === 1,
			"ltk: trinh sua van hoi lai",
		);
		expect(goiCua("fields.archive").map((g) => g.vao)).toEqual([{ id: "f-1" }]);
		expect(document.querySelectorAll('[role="alertdialog"]').length).toBe(0);
		await cho(
			() =>
				![...document.querySelectorAll("button")].some(
					(b) => (b.textContent ?? "").trim() === m.fields.archive,
				),
			"trinh sua da go",
		);
		await cho(
			() => vungToast().includes(m.fields.archived(NHAN)),
			"toast sau khi go",
		);
		const nut = nutHoanTac();
		chot(nut !== undefined, "ltk: trinh sua dong mat toast");
		await userEvent
			.setup({ document, pointerEventsCheck: 0 })
			.click(nut as HTMLButtonElement);
		await cho(() => goiCua("fields.restore").length > 0, "goi restore");
		expect(goiCua("fields.restore").map((g) => g.vao)).toEqual([{ id: "f-1" }]);
	});
});

describe("ltk-hoan-tac", () => {
	test("Hoan tac bam hai lan khoi phuc mot lan, lam moi danh sach", async () => {
		const m = crmMessages("vi");
		const o: string[] = [];
		for (const [ten, luuTru] of [
			["menu", () => luuTruTuMenu()],
			["trinh-sua", () => luuTruTuTrinhSua()],
		] as const) {
			daGoi = [];
			archivedF1 = false;
			await luuTru();
			await cho(() => nutHoanTac() !== undefined, `${ten}: nut Hoan tac`);
			const truoc = soLanLamMoi;
			const nd = userEvent.setup({ document, pointerEventsCheck: 0 });
			const nut = nutHoanTac() as HTMLButtonElement;
			await nd.click(nut);
			await nd.click(nut).catch(() => undefined);
			await cho(
				() => vungToast().includes(m.fields.restored(NHAN)),
				`${ten}: toast khoi phuc`,
			);
			const kp = goiCua("fields.restore").map((g) => g.vao);
			chot(
				kp.length === 1 &&
					JSON.stringify(kp[0]) === JSON.stringify({ id: "f-1" }),
				"ltk: hoan tac sai truong",
			);
			chot(soLanLamMoi > truoc, "ltk: hoan tac khong lam moi danh sach");
			o.push(ten);
			for (const s of dangMo) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
		}
		expect(o.length).toBe(2);
	});
});

describe("ltk-hoan-tac-loi", () => {
	test("hoan tac loi bao ro, khong in loi tho", async () => {
		for (const locale of ["vi", "en"] as const) {
			const m = crmMessages(locale);
			restoreLoi = true;
			archivedF1 = false;
			await luuTruTuMenu(locale);
			await cho(
				() => nutHoanTac(locale) !== undefined,
				`${locale}: nut Hoan tac`,
			);
			await userEvent
				.setup({ document, pointerEventsCheck: 0 })
				.click(nutHoanTac(locale) as HTMLButtonElement);
			await cho(
				() =>
					vungToast().includes(m.fields.hoanTacLoi) ||
					vungToast().includes("loi-tho-may-chu"),
				`${locale}: toast loi`,
			);
			chot(
				!vungToast().includes("loi-tho-may-chu"),
				"ltk: hoan tac loi in loi tho",
			);
			expect(vungToast().includes(m.fields.hoanTacLoi)).toBe(true);
			for (const s of dangMo) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
		}
	});
});

describe("ltk-chu", () => {
	test("chu luu tru truong hai thu tieng", () => {
		const vi = crmMessages("vi").fields;
		const en = crmMessages("en").fields;
		expect(vi.archived(NHAN)).toBe("Đã lưu trữ Nguồn khách.");
		expect(vi.restored(NHAN)).toBe("Đã khôi phục Nguồn khách.");
		expect(vi.hoanTacLoi).toBe(
			"Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ.",
		);
		chot(
			![en.archived("X"), en.restored("X"), en.hoanTacLoi].some((s) =>
				DAU_VIET.test(s),
			),
			"ltk: chu en co dau Viet",
		);
		for (const ban of [vi, en])
			for (const khoa of ["archiveTitle", "archiveBody", "archiveField"])
				expect(khoa in ban).toBe(false);
	});
});
