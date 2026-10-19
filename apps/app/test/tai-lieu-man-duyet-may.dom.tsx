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

type VaoDuyet = { id: string; diffHash: string; daDoiChieu?: number };
type VaoTraLai = { id: string; lyDo: string };
type TuyChonDotBien<V, R> = {
	onSuccess?: (r: R, v: V) => unknown;
	onError?: (e: Error, v: V) => unknown;
};

const goi = {
	duyet: [] as VaoDuyet[],
	traLai: [] as VaoTraLai[],
	taiVe: [] as { id: string }[],
	den: [] as string[],
};

const KHO_TAT = "Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình";
let loiTaiVe: (Error & { data: { code: string; httpStatus: number } }) | null =
	null;

function dotBien<V, R>(ten: string, ghi: V[], tra: (v: V) => R) {
	return {
		mutationOptions: (tuy: TuyChonDotBien<V, R> = {}) => ({
			...tuy,
			mutationKey: [ten],
			mutationFn: async (v: V) => {
				ghi.push(v);
				if (ten === "taiLieuNguon.taiVe" && loiTaiVe) throw loiTaiVe;
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
				so: 2,
			})),
			reject: dotBien("taiLieu.reject", goi.traLai, () => ({
				ok: true as const,
			})),
		},
		taiLieuNguon: {
			taiVe: dotBien("taiLieuNguon.taiVe", goi.taiVe, () => ({
				url: "about:blank",
				hetHan: 300,
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
		refresh: () => {},
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
const { NguonTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/[trang]/nguon-trang"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type DeXuat = ComponentProps<typeof ManDuyet>["deXuat"];

const BAN_MAY =
	"## Hoa hồng\n\nTừ ngày 01/10/2026, tầng hai hưởng 1,5% và tầng ba hưởng 1,8%.";
const KHOI = soSanh("", BAN_MAY);
const TRICH = [
	"Kể từ ngày 01/10/2026",
	"tầng 2 là 1,5%",
	"tầng 3 là 1,8%",
] as const;
const CHU_NGUON = `Quyết định số 12. ${TRICH[0]}, mức hoa hồng ${TRICH[1]} và ${TRICH[2]}. Hết.`;

const MAY: DeXuat = {
	id: "dx-may",
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
	may: {
		tenTep: "quyet-dinh-12.docx",
		chuNguon: CHU_NGUON,
		noiDung: BAN_MAY,
		coBanGoc: false,
		doanTrich: [...TRICH],
		dong: [
			{ so: "01/10/2026", trich: TRICH[0] },
			{ so: "1,5%", trich: TRICH[1] },
			{ so: "1,8%", trich: TRICH[2] },
		],
	},
};

const MAY_KHONG_SO: DeXuat = {
	...MAY,
	may: {
		tenTep: "quyet-dinh-12.docx",
		chuNguon: CHU_NGUON,
		noiDung: BAN_MAY,
		coBanGoc: false,
		doanTrich: [],
		dong: [],
	},
};

const NGUOI_VIET: DeXuat = { ...MAY, id: "dx-tay", may: undefined };

const BAN_GOC = "## Hoa hồng\n\nMức cũ: tầng hai hưởng 1,2% kể từ quý trước.";
const KHOI_CO_GOC = soSanh(BAN_GOC, BAN_MAY);
const MAY_CO_GOC: DeXuat = {
	...MAY,
	id: "dx-may-goc",
	khoi: KHOI_CO_GOC,
	dai: suKienDoi(KHOI_CO_GOC),
	may: MAY.may ? { ...MAY.may, coBanGoc: true } : undefined,
};
const CAU_BAN_MAY =
	"Từ ngày 01/10/2026, tầng hai hưởng 1,5% và tầng ba hưởng 1,8%.";

const DA_DOC = "Đã đọc nguồn, xem bản Kara soạn";
const BA_NUT = ["Duyệt", "Trả lại", "Sửa bản này"] as const;
const matchMediaGoc = window.matchMedia;

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	goi.duyet.length = 0;
	goi.traLai.length = 0;
	goi.taiVe.length = 0;
	goi.den.length = 0;
	loiTaiVe = null;
	window.matchMedia = matchMediaGoc;
});

function manRong(rong: boolean): void {
	window.matchMedia = ((query: string) => ({
		matches: rong,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia;
}

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function mo(deXuat: DeXuat): Promise<Root> {
	manRong(true);
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
	return root;
}

async function dong(root: Root): Promise<void> {
	await act(async () => root.unmount());
	dangMo = dangMo.filter((r) => r !== root);
	document.body.innerHTML = "";
}

function timNut(chu: string): HTMLElement | null {
	return (
		[...document.body.querySelectorAll<HTMLElement>("button, a")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

function nut(chu: string): HTMLElement {
	const n = timNut(chu);
	if (!n)
		throw new Error(`khong thay nut ${chu} — ${document.body.textContent}`);
	return n;
}

async function bam(n: HTMLElement): Promise<void> {
	await act(async () => {
		n.click();
	});
	for (let i = 0; i < 6; i += 1) await nhip();
}

function oTick(): HTMLElement[] {
	return [
		...document.body.querySelectorAll<HTMLElement>(
			"[data-dong-so] [role='checkbox']",
		),
	];
}

function nhanTick(o: HTMLElement): string {
	const id = o.getAttribute("id");
	return id
		? (document.body.querySelector(`label[for='${id}']`)?.textContent ?? "")
		: "";
}

function khoaDuyet(): boolean {
	const n = nut("Duyệt");
	return n instanceof HTMLButtonElement && n.disabled;
}

async function tickDen(so: number): Promise<void> {
	const o = oTick();
	for (let i = 0; i < o.length; i += 1) {
		const muonTick = i < so;
		const daTick = o[i]?.getAttribute("aria-checked") === "true";
		if (muonTick !== daTick) await bam(o[i] as HTMLElement);
	}
}

function dongBang(): { so: string; trich: string }[] {
	return [
		...document.body.querySelectorAll<HTMLTableRowElement>("[data-dong-so]"),
	].map((tr) => ({
		so: tr.cells[0]?.textContent?.trim() ?? "",
		trich: tr.cells[1]?.textContent?.trim() ?? "",
	}));
}

function laNutQuyetDinh(e: Element | null): boolean {
	return e !== null && BA_NUT.some((chu) => e.textContent?.trim() === chu);
}

describe("man-duyet-may", () => {
	test("man-duyet-may buoc 1: chu nguon co doan trich to nen, bang so -> doan, chua co Duyet", async () => {
		await mo(MAY);
		const chu = document.body.querySelector("[data-slot='nguon-chu']");
		expect(chu?.textContent).toBe(CHU_NGUON);
		const mark = [...document.body.querySelectorAll("mark")].map(
			(m) => m.textContent,
		);
		expect(mark).toEqual([...TRICH]);
		expect(document.body.textContent).toContain("Con số và ngày");
		expect(dongBang()).toEqual([
			{ so: "01/10/2026", trich: TRICH[0] },
			{ so: "1,5%", trich: TRICH[1] },
			{ so: "1,8%", trich: TRICH[2] },
		]);
		expect(
			timNut("Duyệt") ? "duyet truoc khi doc nguon" : "chua co Duyet",
		).toBe("chua co Duyet");
		expect(
			document.body.querySelector("[data-nut-duyet]")
				? "duyet truoc khi doc nguon"
				: "chua co Duyet",
		).toBe("chua co Duyet");
		expect(oTick()).toEqual([]);
		expect(laNutQuyetDinh(document.activeElement)).toBe(false);
		expect(document.activeElement).toBe(document.body);
		expect(timNut(DA_DOC)?.hasAttribute("autofocus")).toBe(false);
	});

	test("man-duyet-may buoc 2: ba nut, khong nut nao focus san hay to nen", async () => {
		await mo(MAY);
		await bam(nut(DA_DOC));
		expect(timNut(DA_DOC)).toBeNull();
		expect(
			document.body
				.querySelector("[data-slot='nguon-canh-nhau']")
				?.getAttribute("data-bo-cuc"),
		).toBe("hai-cot");
		for (const chu of BA_NUT) {
			const n = nut(chu);
			expect(`${chu} autofocus=${n.hasAttribute("autofocus")}`).toBe(
				`${chu} autofocus=false`,
			);
			expect(`${chu} ${n.getAttribute("data-variant")}`).not.toBe(
				`${chu} default`,
			);
			expect(n.getAttribute("data-variant")).not.toBeNull();
		}
		expect(laNutQuyetDinh(document.activeElement)).toBe(false);
		expect(document.body.querySelectorAll("mark").length).toBe(3);
	});

	test("man-duyet-may buoc 2: cot ban may doc lien mach, thay doi so voi ban dang dung o khoi rieng", async () => {
		await mo(MAY_CO_GOC);
		await bam(nut(DA_DOC));
		const buoc2 = document.querySelector('[data-buoc-duyet="2"]');
		const chu = (buoc2?.textContent ?? "").replace(/\s+/g, " ");
		expect(chu.includes(CAU_BAN_MAY), "ban may bi xao tron").toBe(true);
		expect(
			buoc2?.querySelector("del, ins, s"),
			"ban may bi xao tron",
		).toBeNull();
		const soVoiBan = document.querySelector("[data-so-voi-ban]");
		expect(soVoiBan?.textContent).toContain("Thay đổi so với bản đang dùng");
		expect(soVoiBan?.textContent).toContain("1,2%");
	});

	test("man-duyet-may buoc 2: trang moi khong co khoi so voi ban dang dung", async () => {
		await mo(MAY);
		await bam(nut(DA_DOC));
		expect(document.querySelector("[data-so-voi-ban]")).toBeNull();
	});

	test("man-duyet-may tick: 0/3, 1/3, 2/3 khoa; 3/3 mo; bo mot o khoa lai", async () => {
		await mo(MAY);
		await bam(nut(DA_DOC));
		const o = oTick();
		expect(o.length).toBe(3);
		expect(o.map(nhanTick)).toEqual([
			"Đã đối chiếu",
			"Đã đối chiếu",
			"Đã đối chiếu",
		]);
		for (const so of [0, 1, 2]) {
			await tickDen(so);
			expect(khoaDuyet() ? `khoa ${so}/3` : "duyet khi chua tick het").toBe(
				`khoa ${so}/3`,
			);
			expect(document.body.textContent).toContain(
				"Đối chiếu từng con số với nguồn rồi mới duyệt được",
			);
		}
		await tickDen(3);
		expect(khoaDuyet()).toBe(false);
		expect(document.body.textContent).not.toContain(
			"Đối chiếu từng con số với nguồn rồi mới duyệt được",
		);
		await bam(oTick()[1] as HTMLElement);
		expect(khoaDuyet() ? "khoa 2/3" : "duyet khi chua tick het").toBe(
			"khoa 2/3",
		);
		await bam(oTick()[1] as HTMLElement);
		await bam(nut("Duyệt"));
		expect(goi.duyet).toEqual([
			{ id: "dx-may", diffHash: await diffHash(KHOI), daDoiChieu: 3 },
		]);
		expect(goi.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("man-duyet-may tick: ban may khong co so moi thi Duyet bat ngay, khong o tick", async () => {
		await mo(MAY_KHONG_SO);
		await bam(nut(DA_DOC));
		expect(oTick()).toEqual([]);
		expect(khoaDuyet()).toBe(false);
		await bam(nut("Duyệt"));
		expect(goi.duyet).toEqual([
			{ id: "dx-may", diffHash: await diffHash(KHOI), daDoiChieu: 0 },
		]);
	});

	test("man-duyet-may tai lai: ve buoc 1, tick mat het", async () => {
		const dau = await mo(MAY);
		await bam(nut(DA_DOC));
		await tickDen(2);
		expect(
			oTick().filter((o) => o.getAttribute("aria-checked") === "true").length,
		).toBe(2);
		await dong(dau);
		await mo(MAY);
		expect(timNut("Duyệt")).toBeNull();
		expect(timNut(DA_DOC)).not.toBeNull();
		await bam(nut(DA_DOC));
		expect(oTick().map((o) => o.getAttribute("aria-checked"))).toEqual([
			"false",
			"false",
			"false",
		]);
		expect(khoaDuyet()).toBe(true);
	});

	test("man-duyet-may sua ban nay: mo trinh soan cua trang mang ma ban may", async () => {
		await mo(MAY);
		await bam(nut(DA_DOC));
		expect(nut("Sửa bản này").getAttribute("href")).toBe(
			"/ws/tai-lieu/quy-dinh-hoa-hong/sua?tuDeXuat=dx-may",
		);
	});

	test("man-duyet-may tra lai: gui ly do nhu luot 1", async () => {
		await mo(MAY);
		await bam(nut(DA_DOC));
		const o = document.body.querySelector("textarea");
		if (!o) throw new Error("khong thay o ly do");
		await act(async () => {
			Object.getOwnPropertyDescriptor(
				HTMLTextAreaElement.prototype,
				"value",
			)?.set?.call(o, "Sai tầng hoa hồng.");
			o.dispatchEvent(new InputEvent("input", { bubbles: true }));
		});
		await bam(nut("Trả lại"));
		expect(goi.traLai).toEqual([{ id: "dx-may", lyDo: "Sai tầng hoa hồng." }]);
	});

	test("man-duyet-may hep: nguon va ban may thanh hai the", async () => {
		await mo(MAY);
		manRong(false);
		await bam(nut(DA_DOC));
		const khung = document.body.querySelector("[data-slot='nguon-canh-nhau']");
		expect(khung?.getAttribute("data-bo-cuc")).toBe("hai-the");
		const the = [...(khung?.querySelectorAll("[role='tab']") ?? [])].map((t) =>
			t.textContent?.trim(),
		);
		expect(the).toEqual(["Nguồn", "Bản Kara soạn"]);
	});

	test("man-duyet-may doi chung: ban nguoi viet giu man luot 1, Duyet co ngay", async () => {
		await mo(NGUOI_VIET);
		expect(timNut(DA_DOC)).toBeNull();
		expect(nut("Duyệt").getAttribute("data-variant")).toBe("default");
		expect(timNut("Sửa bản này")).toBeNull();
		await bam(nut("Duyệt"));
		expect(goi.duyet).toEqual([
			{ id: "dx-tay", diffHash: await diffHash(KHOI) },
		]);
	});
});

describe("man-duyet-may noi so voi doan nguon", () => {
	test("man-duyet-may dong so: so noi voi trich chua tron ven so, khong nho chuoi con", async () => {
		const { dongSoMay } = await import("@/lib/tai-lieu-ban-may");
		expect(
			dongSoMay(
				["20%", "2026", "1,5%"],
				[
					{ menhDe: "Năm", trich: "trong năm 2026" },
					{ menhDe: "Tầng", trich: "tầng 2 là 1,5%" },
				],
			),
		).toEqual([
			{ so: "20%", trich: null },
			{ so: "2026", trich: "trong năm 2026" },
			{ so: "1,5%", trich: "tầng 2 là 1,5%" },
		]);
	});

	test("man-duyet-may doan trong nguon: lech xuong dong, NBSP, kieu nhay van tim ra doan that", async () => {
		const { doanTrongNguon } = await import("@/lib/tai-lieu-ban-may");
		const nguon = "Mức hoa hồng tầng 2\nlà 1,5% theo “Quyết định 12”.";
		expect(doanTrongNguon(nguon, "tầng 2 là 1,5%")).toBe("tầng 2\nlà 1,5%");
		expect(doanTrongNguon(nguon, 'theo "Quyết định 12"')).toBe(
			"theo “Quyết định 12”",
		);
		expect(doanTrongNguon(nguon, "không có")).toBe("không có");
	});
});

async function moNguonTrang(): Promise<void> {
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
					<NguonTrang nguon={{ id: "ng-1", tenTep: "quyet-dinh-12.docx" }} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip();
}

describe("man-doc muc nguon", () => {
	test("man-doc nguon: ten tep va nut Tai ve goi taiVe dung nguon", async () => {
		loiTaiVe = Object.assign(new Error(KHO_TAT), {
			data: { code: "PRECONDITION_FAILED", httpStatus: 412 },
		});
		await moNguonTrang();
		const muc = document.body.querySelector("[data-nguon-trang]");
		expect(muc?.textContent).toContain("Nguồn");
		expect(muc?.textContent).toContain("quyet-dinh-12.docx");
		await bam(nut("Tải về"));
		expect(goi.taiVe).toEqual([{ id: "ng-1" }]);
		expect(
			document.body.querySelector("[data-loi-tai-nguon]")?.textContent,
		).toBe(`Chưa tải về được: ${KHO_TAT}`);
	});
});
