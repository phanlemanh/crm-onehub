import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type GiaiDoanList,
	giaiDoanListOutput,
} from "../../api/src/giai-doan/giai-doan.contracts";

type Hang = GiaiDoanList["stages"][number];

function hang(
	id: string,
	label: string,
	kind: Hang["kind"],
	position: number,
	dealCount = 0,
): Hang {
	return { id, label, kind, position, dealCount };
}

const BAY: Hang[] = [
	hang("DEMO_BOOKED", "Demo booked", "OPEN", 0, 4),
	hang("QUALIFIED_TO_BUY", "Qualified to buy", "OPEN", 1),
	hang("DECISION_MAKER_BOUGHT_IN", "Decision maker in", "OPEN", 2),
	hang("CONTRACT_SENT", "Contract sent", "OPEN", 3),
	hang("CLOSED_WON", "Closed won", "WON", 0),
	hang("CLOSED_LOST", "Closed lost", "LOST", 0, 2),
	hang("UNQUALIFIED_TO_BUY", "Unqualified", "LOST", 1),
];

let che: "ok" | "loi" | "treo" = "ok";
let duLieu: GiaiDoanList = giaiDoanListOutput.parse({
	canManage: true,
	tran: 20,
	stages: BAY,
});
let soLanDoc = 0;

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa | Promise<TRa>) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: object) => ({
			mutationKey: [ten],
			mutationFn: async () => ({ id: "x" }),
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => {
				soLanDoc += 1;
				if (che === "loi") throw new Error("hong");
				if (che === "treo") return new Promise(() => {});
				return duLieu;
			}),
			create: thuTuc("giaiDoan.create", () => null),
			rename: thuTuc("giaiDoan.rename", () => null),
			reorder: thuTuc("giaiDoan.reorder", () => null),
			archive: thuTuc("giaiDoan.archive", () => null),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		giaiDoan: async () => undefined,
		deal: async () => undefined,
	}),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { GiaiDoanSettings, LyDoGiaiDoan } = await import(
	"@/app/(app)/[slug]/settings/giai-doan/giai-doan-settings"
);
const { settingsMessages } = await import("@/lib/messages/settings");
const { NHOM_CAI_DAT } = await import("@/lib/cai-dat-dieu-huong");
const t = settingsMessages("vi");

let root: Root | null = null;
let khung: HTMLElement | null = null;

beforeEach(() => {
	che = "ok";
	soLanDoc = 0;
	duLieu = giaiDoanListOutput.parse({ canManage: true, tran: 20, stages: BAY });
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter searchParams="" hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<LyDoGiaiDoan />
						<GiaiDoanSettings />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return khung as HTMLElement;
}

function nutThem(k: HTMLElement) {
	return [...k.querySelectorAll("button")].filter(
		(b) => b.textContent?.trim() === t.giaiDoan.them,
	);
}

function khoa(el: Element) {
	return (
		el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true"
	);
}

function nutMenu(k: HTMLElement) {
	return [...k.querySelectorAll("[data-menu-giai-doan]")];
}

function tayCam(k: HTMLElement) {
	return [...k.querySelectorAll("[data-the-giai-doan] button")].filter((b) =>
		b.querySelector(".sr-only"),
	);
}

async function moMenu(k: HTMLElement, id: string) {
	const nut = k.querySelector(
		`[data-hang-giai-doan="${id}"] [data-menu-giai-doan]`,
	);
	if (!(nut instanceof HTMLElement)) throw new Error(`khong co menu ${id}`);
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await cho(2);
	return [...document.querySelectorAll('[role="menuitem"]')];
}

describe("khong-quyen", () => {
	test("member: moi dieu khien khoa va co dong ly do", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: false,
			tran: 20,
			stages: BAY,
		});
		const k = await dung();
		const them = nutThem(k);
		expect(them).toHaveLength(3);
		expect(them.every(khoa), "member: nut Them bien mat thay vi khoa").toBe(
			true,
		);
		const menu = nutMenu(k);
		expect(menu).toHaveLength(BAY.length);
		expect(menu.every(khoa)).toBe(true);
		const tay = tayCam(k);
		expect(tay).toHaveLength(BAY.length);
		expect(tay.every(khoa)).toBe(true);
		expect(k.textContent).toContain(t.giaiDoan.khongQuyen);
	});

	test("doi chung: quan tri khong co gi khoa", async () => {
		const k = await dung();
		expect(nutThem(k).some(khoa)).toBe(false);
		expect(nutMenu(k).some(khoa)).toBe(false);
		expect(k.textContent).not.toContain(t.giaiDoan.khongQuyen);
	});
});

describe("trang-thai", () => {
	test("dang tai: ba khung xuong, khong tra rong", async () => {
		che = "treo";
		const k = await dung();
		expect(
			k.querySelectorAll('[data-slot="skeleton"]').length,
			"dang tai: khong co khung xuong",
		).toBeGreaterThan(2);
	});

	test("loi: Empty co nut thu lai, bam thi goi lai", async () => {
		che = "loi";
		const k = await dung();
		expect(k.textContent).toContain(t.giaiDoan.loiTai);
		const nut = [...k.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === t.giaiDoan.thuLai,
		);
		if (!nut) throw new Error("khong co nut thu lai");
		che = "ok";
		await act(async () => nut.click());
		await cho();
		expect(soLanDoc).toBe(2);
	});

	test("co du lieu: ba the dung thu tu, dem hang moi the, nhan translate=no", async () => {
		const k = await dung();
		const the = [...k.querySelectorAll("[data-the-giai-doan]")];
		expect(the.map((e) => e.getAttribute("data-the-giai-doan"))).toEqual([
			"OPEN",
			"WON",
			"LOST",
		]);
		for (const kind of ["OPEN", "WON", "LOST"] as const) {
			const o = k.querySelector(`[data-the-giai-doan="${kind}"]`);
			const hangs = [...(o?.querySelectorAll("[data-hang-giai-doan]") ?? [])];
			expect(hangs.map((h) => h.getAttribute("data-hang-giai-doan"))).toEqual(
				BAY.filter((g) => g.kind === kind).map((g) => g.id),
			);
		}
		const nhan = [...k.querySelectorAll("[data-nhan-giai-doan]")];
		expect(nhan).toHaveLength(BAY.length);
		expect(nhan.every((e) => e.getAttribute("translate") === "no")).toBe(true);
	});

	test("giai doan duy nhat cua loai: muc Xoa khoa", async () => {
		const k = await dung();
		const muc = await moMenu(k, "CLOSED_WON");
		const xoa = muc.find((m) => m.textContent?.includes(t.giaiDoan.xoa));
		if (!xoa) throw new Error("khong co muc Xoa");
		expect(khoa(xoa)).toBe(true);
	});

	test("dat tran: ba nut Them khoa, ly do hien", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: true,
			tran: 7,
			stages: BAY,
		});
		const k = await dung();
		expect(nutThem(k).every(khoa)).toBe(true);
		expect(k.textContent).toContain(t.giaiDoan.datTran.replace("{so}", "7"));
	});

	test("con thoa thuan (ke ca luu tru): Xoa mo hop chuyen, khong mo hop hoi lai", async () => {
		const k = await dung();
		const muc = await moMenu(k, "CLOSED_LOST");
		const xoa = muc.find((m) => m.textContent?.includes(t.giaiDoan.xoa));
		if (!(xoa instanceof HTMLElement)) throw new Error("khong co muc Xoa");
		await act(async () => xoa.click());
		await cho();
		expect(document.body.textContent).toContain(
			t.giaiDoan.conThoaThuan.replace("{so}", "2"),
		);
		expect(document.querySelector('[role="alertdialog"]')).toBeNull();
	});

	test("thanh ben: muc Giai doan thoa thuan ngay sau Truong", () => {
		const khongGian = NHOM_CAI_DAT.find((n) => n.khoa === "khongGian");
		const khoaMuc = khongGian?.muc.map((m) => m.khoa) ?? [];
		expect(khoaMuc.indexOf("giaiDoan")).toBe(khoaMuc.indexOf("truong") + 1);
	});
});
