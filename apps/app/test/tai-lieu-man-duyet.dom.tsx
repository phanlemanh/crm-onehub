import { afterEach, describe, expect, mock, test } from "bun:test";
import { diffHash, soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type VaoDuyet = { id: string; diffHash: string };
type VaoTraLai = { id: string; lyDo: string };
type TuyChonDotBien<V, R> = {
	onSuccess?: (r: R, v: V) => unknown;
	onError?: (e: Error, v: V) => unknown;
};

type GoiDuyet = {
	duyet: VaoDuyet[];
	traLai: VaoTraLai[];
	lamMoi: number;
	den: string[];
};

const goi: GoiDuyet = { duyet: [], traLai: [], lamMoi: 0, den: [] };

let loiDuyet: (Error & { data: { code: string; httpStatus: number } }) | null =
	null;

function dotBien<V, R>(ten: string, ghi: V[], tra: (v: V) => R) {
	return {
		mutationOptions: (tuy: TuyChonDotBien<V, R> = {}) => ({
			...tuy,
			mutationKey: [ten],
			mutationFn: async (v: V) => {
				ghi.push(v);
				if (ten === "taiLieu.approve" && loiDuyet) throw loiDuyet;
				return tra(v);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			approve: dotBien("taiLieu.approve", goi.duyet, () => ({
				slug: "quy-dinh-hoa-hong",
				so: 3,
			})),
			reject: dotBien("taiLieu.reject", goi.traLai, () => ({
				ok: true as const,
			})),
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (den: string) => {
			goi.den.push(den);
		},
		replace: () => {},
		refresh: () => {
			goi.lamMoi += 1;
		},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const khoi =
	(the: string) =>
	({ children }: { children?: ReactNode }) =>
		h(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: khoi("div"),
	PageShellContent: khoi("div"),
}));

const { ManDuyet } = await import(
	"@/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type DeXuat = ComponentProps<typeof ManDuyet>["deXuat"];

const TRUOC = "Đối tác nhận hoa hồng trong 48 giờ.\n\nMục cũ sẽ bỏ.";
const SAU = "Đối tác nhận hoa hồng trong 24 giờ.\n\nMục mới thêm vào.";
const KHOI = soSanh(TRUOC, SAU);

const THUONG: DeXuat = {
	id: "dx-1",
	slug: "quy-dinh-hoa-hong",
	ten: "Quy định hoa hồng",
	taoBoi: "Trần An",
	taoLuc: "2026-09-26T20:30:00.000Z",
	trangThai: "CHO_DUYET",
	lyDo: null,
	cu: false,
	duyetDuoc: true,
	khoi: KHOI,
	dai: suKienDoi(KHOI),
};

const CU: DeXuat = { ...THUONG, cu: true };
const KHONG_QUYEN: DeXuat = { ...THUONG, duyetDuoc: false };

const CAU_CU = "Bản đề xuất này đã cũ";

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	goi.duyet.length = 0;
	goi.traLai.length = 0;
	goi.den.length = 0;
	goi.lamMoi = 0;
	loiDuyet = null;
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function mo(deXuat: DeXuat): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<ManDuyet deXuat={deXuat} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip();
}

function timNut(chu: string): HTMLButtonElement | null {
	return (
		[...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

function nut(chu: string): HTMLButtonElement {
	const n = timNut(chu);
	if (!n)
		throw new Error(`khong thay nut ${chu} — ${document.body.textContent}`);
	return n;
}

async function bam(n: HTMLButtonElement): Promise<void> {
	await act(async () => {
		n.click();
	});
	for (let i = 0; i < 6; i += 1) await nhip();
}

function oLyDo(): HTMLTextAreaElement {
	const o = document.body.querySelector<HTMLTextAreaElement>("textarea");
	if (!o) throw new Error("khong thay o ly do");
	return o;
}

async function goLyDo(chu: string): Promise<void> {
	const o = oLyDo();
	await act(async () => {
		o.focus();
		Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set?.call(o, chu);
		o.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
	await nhip();
}

function loiDuoiLyDo(): string | null {
	const field = oLyDo().closest("[data-slot='field']");
	return field?.querySelector("[data-slot='field-error']")?.textContent ?? null;
}

const theCu = () => document.body.querySelector("[data-de-xuat-cu]");

describe("tai-lieu man duyet", () => {
	test("quyen: nguoi duyet duoc thay nut Duyet va Tra lai", async () => {
		await mo(THUONG);
		expect(timNut("Duyệt")).not.toBeNull();
		expect(timNut("Trả lại")).not.toBeNull();
		expect(document.body.querySelectorAll("ins").length).toBeGreaterThan(0);
		expect(document.body.querySelectorAll("del").length).toBeGreaterThan(0);
	});

	test("quyen: nguoi khong duyet duoc khong thay nut nao trong hai nut", async () => {
		await mo(KHONG_QUYEN);
		if (timNut("Duyệt") !== null)
			throw new Error("nut duyet hien cho nguoi khong quyen");
		expect(timNut("Trả lại")).toBeNull();
		expect(document.body.querySelector("textarea")).toBeNull();
	});

	test("de-xuat-cu: Alert 'Ban de xuat nay da cu' va nut Duyet khoa", async () => {
		await mo(CU);
		expect(theCu()?.textContent).toContain(CAU_CU);
		if (!nut("Duyệt").disabled) throw new Error("nut duyet bat voi de xuat cu");
		await bam(nut("Duyệt"));
		expect(goi.duyet.length).toBe(0);
	});

	test("de-xuat-cu doi chung: de xuat thuong khong Alert, nut Duyet bat", async () => {
		await mo(THUONG);
		expect(theCu()).toBeNull();
		expect(document.body.textContent?.includes(CAU_CU)).toBe(false);
		expect(nut("Duyệt").disabled).toBe(false);
	});

	test("tra-lai: ly do trong -> loi duoi o ly do, focus o, khong goi", async () => {
		await mo(THUONG);
		await bam(nut("Trả lại"));
		if (goi.traLai.length !== 0) throw new Error("tra lai goi khi ly do trong");
		expect(loiDuoiLyDo()).toBe("Nhập lý do trả lại.");
		expect(document.activeElement).toBe(oLyDo());

		await goLyDo("   ");
		await bam(nut("Trả lại"));
		if (goi.traLai.length !== 0) throw new Error("tra lai goi khi ly do trong");
	});

	test("tra-lai doi chung: ly do co chu -> goi mot lan dung ly do", async () => {
		await mo(THUONG);
		await goLyDo("  Thiếu mốc 24 giờ cho đối tác mới. ");
		await bam(nut("Trả lại"));
		expect(goi.traLai).toEqual([
			{ id: "dx-1", lyDo: "Thiếu mốc 24 giờ cho đối tác mới." },
		]);
		expect(loiDuoiLyDo()).toBeNull();
	});

	test("duyet gui dung ma so sanh tinh tu cung khoi, xong thi ve trang", async () => {
		await mo(THUONG);
		await bam(nut("Duyệt"));
		expect(goi.duyet).toEqual([{ id: "dx-1", diffHash: await diffHash(KHOI) }]);
		expect(goi.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("ngay-gui: dau man hien nguoi gui va ngay gui dd/mm/yyyy theo gio Viet Nam", async () => {
		await mo(THUONG);
		const moTa = document.body.querySelector("p")?.textContent ?? "";
		if (!moTa.includes("27/09/2026"))
			throw new Error("man duyet thieu ngay gui");
		expect(moTa).toBe("Bản đề xuất · Trần An · 27/09/2026");
	});

	test("xung-dot: may chu tra CONFLICT -> bao ban de xuat vua thay doi va lam moi", async () => {
		loiDuyet = Object.assign(new Error("Nội dung so sánh đã đổi"), {
			data: { code: "CONFLICT", httpStatus: 409 },
		});
		await mo(THUONG);
		await bam(nut("Duyệt"));
		expect(goi.duyet.length).toBe(1);
		expect(document.body.textContent).toContain(
			"Bản đề xuất vừa thay đổi, mở lại để xem bản mới",
		);
		expect(goi.lamMoi).toBe(1);
		expect(goi.den).toEqual([]);
	});
});
