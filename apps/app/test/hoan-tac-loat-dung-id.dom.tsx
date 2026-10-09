import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
	useQuery,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type Lay = (vao: DauVao) => Json;
type LoiGoi = { duong: string; vao: DauVao };
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

const goiCua = (duong: string) => daGoi.filter((g) => g.duong === duong);

function thuTuc(duong: string) {
	const doc = async (vao: DauVao): Promise<Json> => {
		daGoi.push({ duong, vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: { queryKey: [duong, vao ?? null], queryFn: async () => doc(vao) },
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => (await doc(vao)) ?? { id: "ok" },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_g, khong: string) =>
			new Proxy({}, { get: (_h, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { formatCount } = await import("@crm/ui/lib/format");
const { crmMessages } = await import("@/lib/messages/crm");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");
const { ContactsBulkActions } = await import(
	"@/app/(app)/[slug]/contacts/contacts-bulk-actions"
);
const { CompaniesBulkActions } = await import(
	"@/app/(app)/[slug]/companies/companies-bulk-actions"
);
const { DealsBulkActions } = await import(
	"@/app/(app)/[slug]/deals/deals-bulk-actions"
);

type Locale = "vi" | "en";
type Loai = "contact" | "company" | "deal";

const THU_TUC = {
	contact: "contacts",
	company: "companies",
	deal: "deals",
} as const satisfies Record<Loai, string>;

const LOAI: Loai[] = ["contact", "company", "deal"];
const DAU_VIET = /[À-ỹ]/u;
const LOI_THO = "loi-tho-may-chu";
const KHONG_CON = "No contact with id x.";

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function dem(loai: Loai, n: number, locale: Locale): string {
	if (loai === "contact")
		return formatCount(n, contactMessages(locale).noun, locale);
	if (loai === "company") {
		const m = companyMessages(locale);
		return formatCount(n, m.noun, locale, m.nounPlural);
	}
	return formatCount(n, dealMessages(locale).noun, locale);
}

const chuLuuTru = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.archived(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.archived(dem(loai, n, l))
			: dealMessages(l).bulk.archived(dem(loai, n, l));

const chuKhoiPhuc = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.restored(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.restored(dem(loai, n, l))
			: dealMessages(l).bulk.restored(dem(loai, n, l));

type KetQua = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	message: string | null;
	changedIds: string[];
};

const kq = (
	requested: number,
	succeeded: number,
	skipped: number,
	failed: number,
	message: string | null,
	changedIds: string[],
): KetQua => ({ requested, succeeded, skipped, failed, message, changedIds });

function datNen(): void {
	dat("users.list", () => []);
	dat("companies.options", () => []);
	dat("giaiDoan.list", () => ({ stages: [], canManage: false, tran: 0 }));
	for (const t of Object.values(THU_TUC))
		dat(`${t}.list`, () => ({ rows: [], total: 0, facetCounts: {} }));
}

let goc: { o: HTMLElement; root: Root }[] = [];

async function don(): Promise<void> {
	for (const g of goc) {
		await act(async () => g.root.unmount());
		g.o.remove();
	}
	goc = [];
	document.body.innerHTML = "";
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	datNen();
});

afterEach(don);

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
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
	);
}

function DanhSach({ loai }: { loai: Loai }) {
	const duong = `${THU_TUC[loai]}.list`;
	useQuery({
		queryKey: [duong, { archived: false }],
		queryFn: async () => {
			daGoi.push({ duong, vao: { archived: false } });
			return duLieu.get(duong)?.({ archived: false }) ?? null;
		},
	});
	return null;
}

function BangLoat({ loai }: { loai: Loai }) {
	const ids = ["a", "b", "c"];
	if (loai === "contact")
		return <ContactsBulkActions ids={ids} onDone={() => {}} archived={false} />;
	if (loai === "company")
		return (
			<CompaniesBulkActions ids={ids} onDone={() => {}} archived={false} />
		);
	return <DealsBulkActions ids={ids} onDone={() => {}} archived={false} />;
}

async function mo(man: ReactElement, locale: Locale = "vi"): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	goc.push({ o, root });
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>
						<Toaster />
						{man}
					</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip(10);
}

function nutCo(chu: string): HTMLButtonElement | null {
	return (
		[...document.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => (b.textContent ?? "").trim() === chu,
		) ?? null
	);
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

async function luuTruHet(locale: Locale): Promise<void> {
	const c = crmMessages(locale);
	const trigger = [
		...document.querySelectorAll('button[aria-haspopup="menu"]'),
	].find((b) => (b.textContent ?? "").includes(c.bulkMenu.actions));
	await bamTro(trigger);
	await cho(
		() =>
			[...document.querySelectorAll("[role=menuitem]")].some(
				(e) => (e.textContent ?? "").trim() === c.bulk.archive,
			),
		"muc Luu tru",
	);
	await bamTro(
		[...document.querySelectorAll("[role=menuitem]")].find(
			(e) => (e.textContent ?? "").trim() === c.bulk.archive,
		),
	);
}

const vungToast = () =>
	document.querySelector("[data-sonner-toaster]")?.textContent ?? "";

const toastKieu = (kieu: string) => [
	...document.querySelectorAll(`[data-sonner-toast][data-type=${kieu}]`),
];

async function luuTruRoiChoToast(
	loai: Loai,
	ketLuuTru: KetQua,
	locale: Locale = "vi",
): Promise<void> {
	daGoi = [];
	dat(`${THU_TUC[loai]}.bulkArchive`, () => ketLuuTru);
	await mo(
		<>
			<DanhSach loai={loai} />
			<BangLoat loai={loai} />
		</>,
		locale,
	);
	await luuTruHet(locale);
	await cho(
		() => goiCua(`${THU_TUC[loai]}.bulkArchive`).length === 1,
		`${loai} goi luu tru`,
	);
	await cho(
		() => toastKieu("success").length + toastKieu("warning").length > 0,
		`${loai} toast luu tru`,
	);
}

async function bamHoanTac(locale: Locale): Promise<void> {
	const nut = nutCo(crmMessages(locale).sheet.hoanTac);
	chot(nut !== null, "htl: luu tru loat khong co hoan tac");
	await act(async () => {
		await userEvent.setup({ document }).click(nut as HTMLButtonElement);
	});
	await nhip(10);
}

describe("hoan-tac-loat-dung-id", () => {
	test("htl-hoan-tac-dung-id: Hoan tac gui dung changedIds cua lan luu tru, mot lan", async () => {
		const o: string[] = [];
		for (const loai of LOAI) {
			daGoi = [];
			dat(`${THU_TUC[loai]}.bulkRestore`, () =>
				kq(2, 2, 0, 0, null, ["a", "c"]),
			);
			await luuTruRoiChoToast(loai, kq(3, 2, 1, 0, null, ["a", "c"]));
			await bamHoanTac("vi");
			await cho(
				() => goiCua(`${THU_TUC[loai]}.bulkRestore`).length > 0,
				`${loai} goi khoi phuc`,
			);
			await nhip(10);
			const goi = goiCua(`${THU_TUC[loai]}.bulkRestore`);
			const ids = JSON.stringify(
				(goi[0]?.vao as { ids?: string[] } | undefined)?.ids ?? [],
			);
			chot(ids !== '["a","b","c"]', "htl: hoan tac gui ca lo da chon");
			expect(`${loai}:${ids}:${goi.length}`).toBe(`${loai}:["a","c"]:1`);
			o.push(loai);
			await don();
		}
		expect(o.length).toBe(3);
	});

	test("htl-hoan-tac-thieu: Hoan tac ve du, ve thieu, loi han — moi ca mot loai toast, khong loi tho", async () => {
		const c = crmMessages("vi");
		const o: string[] = [];
		for (const loai of LOAI) {
			for (const ca of ["du", "thieu", "loi"] as const) {
				daGoi = [];
				dat(`${THU_TUC[loai]}.bulkRestore`, () => {
					if (ca === "loi") throw new Error(LOI_THO);
					return ca === "du"
						? kq(2, 2, 0, 0, null, ["a", "c"])
						: kq(2, 1, 0, 1, LOI_THO, ["a"]);
				});
				await luuTruRoiChoToast(loai, kq(3, 2, 1, 0, null, ["a", "c"]));
				const truocXanh = toastKieu("success").length;
				await bamHoanTac("vi");
				if (ca === "du") {
					await cho(
						() => vungToast().includes(chuKhoiPhuc(loai, 2, "vi")),
						`${loai}/du`,
					);
					expect(
						`${loai}/du:${toastKieu("warning").length}/${toastKieu("error").length}`,
					).toBe(`${loai}/du:0/0`);
				} else if (ca === "thieu") {
					await cho(
						() =>
							vungToast().includes(c.bulk.hoanTacThieu("1")) ||
							toastKieu("success").length > truocXanh ||
							vungToast().includes(LOI_THO),
						`${loai}/thieu`,
					);
					await nhip(10);
					const xanhMoi = toastKieu("success").length - truocXanh;
					const vang = toastKieu("warning").filter((t) =>
						(t.textContent ?? "").includes(c.bulk.hoanTacThieu("1")),
					);
					chot(
						vang.length > 0 || xanhMoi === 0,
						"htl: hoan tac thieu bao xanh",
					);
					chot(xanhMoi === 0, "htl: hoan tac thieu van co toast xanh");
					chot(!vungToast().includes(LOI_THO), "htl: hoan tac in loi tho");
					const chu = vang[0]?.textContent ?? "";
					expect(
						`${loai}/thieu:${vang.length}:${chu.includes(chuKhoiPhuc(loai, 1, "vi"))}:${chu.includes("Đã lưu trữ")}`,
					).toBe(`${loai}/thieu:1:true:true`);
				} else {
					await cho(
						() => vungToast().includes(c.bulk.hoanTacLoi),
						`${loai}/loi`,
					);
					chot(!vungToast().includes(LOI_THO), "htl: hoan tac in loi tho");
				}
				o.push(`${loai}/${ca}`);
				await don();
			}
		}
		expect(o.length).toBe(9);
	});

	test("htl-luu-tru-bo-qua: toast luu tru noi so bo qua bang chu san pham, khong Hoan tac khi khong co gi doi", async () => {
		const c = crmMessages("vi");
		const o: string[] = [];
		const CA = [
			{ ten: "bo-qua", r: kq(3, 2, 1, 0, null, ["a", "c"]), doi: 2, bo: 1 },
			{
				ten: "khong-con",
				r: kq(3, 2, 0, 1, KHONG_CON, ["a", "b"]),
				doi: 2,
				bo: 1,
			},
			{ ten: "khong-doi", r: kq(3, 0, 3, 0, null, []), doi: 0, bo: 3 },
			{ ten: "khong-doi-loi", r: kq(3, 0, 0, 3, KHONG_CON, []), doi: 0, bo: 3 },
		] as const;
		for (const loai of LOAI) {
			for (const ca of CA) {
				daGoi = [];
				await luuTruRoiChoToast(loai, ca.r);
				await nhip(5);
				const chu = vungToast();
				chot(
					!chu.includes("No ") && !chu.includes("with id"),
					ca.doi === 0
						? "htl: toast khong doi in loi tho"
						: "htl: toast luu tru in loi tho",
				);
				const coHoanTac = nutCo(c.sheet.hoanTac) !== null;
				if (ca.doi === 0) {
					chot(!coHoanTac, "htl: hoan tac khi khong co gi de hoan tac");
					expect(
						`${loai}/${ca.ten}:${chu.includes(c.bulk.khongDoi(String(ca.bo)))}`,
					).toBe(`${loai}/${ca.ten}:true`);
				} else {
					expect(
						`${loai}/${ca.ten}:${coHoanTac}:${chu.includes(chuLuuTru(loai, ca.doi, "vi"))}:${chu.includes(c.bulk.boQua(String(ca.bo)))}`,
					).toBe(`${loai}/${ca.ten}:true:true:true`);
				}
				o.push(`${loai}/${ca.ten}`);
				await don();
			}
		}
		expect(o.length).toBe(12);
	});

	test("htl-en: toast bo qua, khong doi va hoan tac thieu bang tieng Anh", async () => {
		const c = crmMessages("en");
		const o: string[] = [];
		const kiem = (ten: string, mong: string) => {
			const chu = vungToast();
			chot(!DAU_VIET.test(chu), "htl: toast en con chu Viet");
			chot(
				!chu.includes("with id") && !chu.includes(LOI_THO),
				`htl: toast en in loi tho (${ten})`,
			);
			expect(`${ten}:${chu.includes(mong)}`).toBe(`${ten}:true`);
			o.push(ten);
		};

		await luuTruRoiChoToast(
			"contact",
			kq(3, 2, 0, 1, KHONG_CON, ["a", "b"]),
			"en",
		);
		kiem("khong-con", c.bulk.boQua("1"));
		await don();

		await luuTruRoiChoToast("contact", kq(3, 0, 0, 3, KHONG_CON, []), "en");
		kiem("khong-doi-loi", c.bulk.khongDoi("3"));
		await don();

		dat("contacts.bulkRestore", () => kq(2, 1, 0, 1, LOI_THO, ["a"]));
		await luuTruRoiChoToast("contact", kq(3, 2, 1, 0, null, ["a", "c"]), "en");
		await bamHoanTac("en");
		await cho(() => vungToast().includes(c.bulk.hoanTacThieu("1")), "en thieu");
		kiem("thieu", c.bulk.hoanTacThieu("1"));

		expect(o.length).toBe(3);
	});
});
