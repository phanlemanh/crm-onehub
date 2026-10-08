import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

function phongBan(
	id: string,
	name: string,
	divisionId: string,
	position: number,
) {
	return {
		id,
		name,
		moTa: "",
		position,
		divisionId,
		head: null,
		stepCount: 0,
		okrMo: 0,
		people: [],
	};
}

function boPhan(
	id: string,
	name: string,
	position: number,
	departments: ReturnType<typeof phongBan>[],
) {
	return { id, name, moTa: "", position, head: null, okrMo: 0, departments };
}

function cayMau(): TreeOutput {
	return {
		divisions: [
			boPhan("bp-kd", "Kinh doanh", 0, []),
			boPhan("bp-vh", "Vận hành", 1, [
				phongBan("pb-cskh", "Chăm sóc khách hàng", "bp-vh", 0),
				phongBan("pb-kho", "Kho vận", "bp-vh", 1),
			]),
			boPhan("bp-tc", "Tài chính", 2, []),
		],
		chuaXep: [],
		chuaCoPhongBan: [],
		people: [],
		archived: { divisions: [], departments: [] },
		coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
	};
}

type GoiToast = {
	loai: "thuong" | "xong" | "loi";
	chu: string;
	action?: { label: string; onClick: () => void };
};
const goiToast: GoiToast[] = [];

function ghiToast(loai: GoiToast["loai"]) {
	return (chu: string, o?: { action?: GoiToast["action"] }) => {
		goiToast.push({ loai, chu, action: o?.action });
	};
}

mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		success: ghiToast("xong"),
		error: ghiToast("loi"),
	}),
	Toaster: () => null,
}));

type DauVao = {
	readonly [khoa: string]: string | number | readonly string[] | undefined;
};
type ChonGhi = { onSuccess?: () => void; onError?: (e: Error) => void };
let daGoi: { ten: string; dauVao: DauVao }[] = [];
let tuChoi = new Map<string, string>();

function thuTuc<TRa>(ten: string, doc: () => TRa) {
	return {
		queryKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => doc() }),
		mutationOptions: (chon: ChonGhi = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (dauVao: DauVao) => {
				daGoi.push({ ten, dauVao: JSON.parse(JSON.stringify(dauVao)) });
				const loi = tuChoi.get(ten);
				if (loi !== undefined) throw new Error(loi);
				return { id: `${ten}-ok` };
			},
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: {
			tree: thuTuc("tree", cayMau),
			access: thuTuc("access", () => ({ canManage: true })),
			createDivision: thuTuc("createDivision", khongDoc),
			renameDivision: thuTuc("renameDivision", khongDoc),
			reorderDivisions: thuTuc("reorderDivisions", khongDoc),
			archiveDivision: thuTuc("archiveDivision", khongDoc),
			restoreDivision: thuTuc("restoreDivision", khongDoc),
			purgeDivision: thuTuc("purgeDivision", khongDoc),
			createDepartment: thuTuc("createDepartment", khongDoc),
			renameDepartment: thuTuc("renameDepartment", khongDoc),
			moveDepartment: thuTuc("moveDepartment", khongDoc),
			attachDepartments: thuTuc("attachDepartments", khongDoc),
			addPeople: thuTuc("addPeople", khongDoc),
			setHead: thuTuc("setHead", khongDoc),
			setPlacement: thuTuc("setPlacement", khongDoc),
			previewImport: thuTuc("previewImport", khongDoc),
			applyImport: thuTuc("applyImport", khongDoc),
			luuTruXemTruoc: thuTuc("luuTruXemTruoc", () => ({ lyDo: [] })),
			archiveDepartment: thuTuc("archiveDepartment", khongDoc),
			restoreDepartment: thuTuc("restoreDepartment", khongDoc),
			purgeDepartment: thuTuc("purgeDepartment", khongDoc),
		},
		onboarding: {
			listDepartments: thuTuc("listDepartments", () => []),
			manDanhMuc: thuTuc("manDanhMuc", () => null),
			listTemplates: thuTuc("listTemplates", () => []),
			archiveTemplate: thuTuc("archiveTemplate", khongDoc),
			restoreTemplate: thuTuc("restoreTemplate", khongDoc),
			purgeTemplate: thuTuc("purgeTemplate", khongDoc),
		},
	}),
}));

const { ToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/to-chuc"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");

const saved = messages("vi").sortableList.saved;
const gocRect = Element.prototype.getBoundingClientRect;
let dangMo: { o: HTMLElement; root: Root }[] = [];

beforeEach(() => {
	daGoi = [];
	tuChoi = new Map();
	goiToast.length = 0;
	datViTri();
});

afterEach(() => {
	for (const { o, root } of dangMo) {
		act(() => root.unmount());
		o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	Element.prototype.getBoundingClientRect = gocRect;
});

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 60; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

async function mo(dau: string): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={dau} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<ToChuc />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await cho(
		() => o.querySelectorAll("[data-muc-keo]").length > 0,
		"danh sach keo hien",
	);
}

function datViTri(): void {
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-muc-keo]") === null) {
			return {
				x: 0,
				y: -10000,
				top: -10000,
				left: 0,
				bottom: 10000,
				right: 1000,
				width: 1000,
				height: 20000,
				toJSON: () => ({}),
			} as DOMRect;
		}
		const cha = this.parentElement;
		const i = cha ? [...cha.children].indexOf(this) : 0;
		const doi =
			this instanceof HTMLElement
				? Number(
						/translate3d\([^,]+,\s*(-?[\d.]+)px/.exec(
							this.style.transform,
						)?.[1] ?? 0,
					)
				: 0;
		const tren = i * 40 + doi;
		return {
			x: 0,
			y: tren,
			top: tren,
			left: 0,
			bottom: tren + 32,
			right: 300,
			width: 300,
			height: 32,
			toJSON: () => ({}),
		} as DOMRect;
	};
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				code: key === " " ? "Space" : key,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await nghi(5);
}

async function keoLen(ten: string): Promise<void> {
	const tay = [...document.body.querySelectorAll("button")].find(
		(b) => b.querySelector(".sr-only")?.textContent === `Đổi thứ tự ${ten}`,
	);
	if (!tay) throw new Error(`khong thay tay keo ${ten}`);
	tay.focus();
	await phim(tay, " ");
	await nghi(20);
	await phim(tay, "ArrowUp");
	await nghi(20);
	await phim(tay, " ");
	await nghi(30);
	await cho(
		() =>
			[...document.body.querySelectorAll("button")]
				.filter((b) =>
					b.querySelector(".sr-only")?.textContent?.startsWith("Đổi thứ tự"),
				)
				.every((b) => !b.disabled),
		"luu xong",
	);
}

function thuTu(): string[] {
	return [...document.body.querySelectorAll("[data-muc-keo]")].map(
		(x) => x.getAttribute("data-muc-keo") ?? "",
	);
}

const NOI = [
	{
		ten: "goc",
		dau: "?don=goc",
		thuTuc: "reorderDivisions",
		keo: "Vận hành",
		goc: ["bp-kd", "bp-vh", "bp-tc"],
		dauVao: { ids: ["bp-vh", "bp-kd", "bp-tc"] },
	},
	{
		ten: "bo phan",
		dau: "?don=bp:bp-vh",
		thuTuc: "moveDepartment",
		keo: "Kho vận",
		goc: ["pb-cskh", "pb-kho"],
		dauVao: { id: "pb-kho", divisionId: "bp-vh", index: 0 },
	},
] as const;

describe("sap-luu-loi", () => {
	for (const noi of NOI) {
		test(`sap-luu-loi: ${noi.ten} — may chu tu choi thi thu tu cu, mot toast loi, khong toast da luu`, async () => {
			tuChoi.set(noi.thuTuc, "tu choi");
			await mo(noi.dau);
			await keoLen(noi.keo);
			expect({
				goi: daGoi.filter((g) => g.ten === noi.thuTuc).map((g) => g.dauVao),
				thuTu:
					thuTu().join() === noi.goc.join()
						? "cu"
						: "giu thu tu vua keo khi luu loi",
				loi: goiToast.filter((x) => x.loai === "loi").map((x) => x.chu),
				daLuu: goiToast.filter((x) => x.chu === saved).length,
			}).toEqual({
				goi: [noi.dauVao],
				thuTu: "cu",
				loi: ["tu choi"],
				daLuu: 0,
			});
		});

		test(`sap-luu-loi: ${noi.ten} — doi chung, may chu nhan thi mot toast da luu co Hoan tac`, async () => {
			await mo(noi.dau);
			await keoLen(noi.keo);
			const t = goiToast.filter((x) => x.chu === saved);
			expect({
				goi: daGoi.filter((g) => g.ten === noi.thuTuc).map((g) => g.dauVao),
				daLuu: t.length,
				nut: t[0]?.action?.label,
				loi: goiToast.filter((x) => x.loai === "loi").length,
			}).toEqual({
				goi: [noi.dauVao],
				daLuu: 1,
				nut: messages("vi").sortableList.undo,
				loi: 0,
			});
		});
	}

	test("sap-luu-loi: bo phan — Hoan tac gui moveDepartment ve dung cho cu", async () => {
		await mo("?don=bp:bp-vh");
		await keoLen("Kho vận");
		const t = goiToast.find((x) => x.chu === saved);
		await act(async () => t?.action?.onClick());
		await cho(
			() => daGoi.filter((g) => g.ten === "moveDepartment").length === 2,
			"goi hoan tac",
		);
		expect(
			daGoi.filter((g) => g.ten === "moveDepartment").map((g) => g.dauVao),
		).toEqual([
			{ id: "pb-kho", divisionId: "bp-vh", index: 0 },
			{ id: "pb-kho", divisionId: "bp-vh", index: 1 },
		]);
	});
});
