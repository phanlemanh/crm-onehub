import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type GiaiDoanList,
	giaiDoanListOutput,
} from "../../api/src/giai-doan/giai-doan.contracts";
import type { DealListItem, DealListResult } from "../lib/agent-transcript";

const GIAI_DOAN: GiaiDoanList["stages"] = [
	["gd-mo", "Làm quen", "OPEN", 0],
	["gd-thang", "Đã ký", "WON", 0],
	["gd-thua", "Rớt", "LOST", 0],
	["CLOSED_WON", "Chốt", "WON", 1],
].map(([id, label, kind, position]) => ({
	id: id as string,
	label: label as string,
	kind: kind as "OPEN" | "WON" | "LOST",
	position: position as number,
	dealCount: 0,
}));

const danhSach: GiaiDoanList = giaiDoanListOutput.parse({
	canManage: true,
	tran: 20,
	stages: GIAI_DOAN,
});

type MoiGhi = { onSuccess?: unknown; onError?: unknown; onSettled?: unknown };

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: MoiGhi) => ({
			mutationKey: [ten],
			mutationFn: async () => ({ id: "x", stage: "x", changed: true }),
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: { list: thuTuc("giaiDoan.list", () => danhSach) },
		deals: {
			setStage: thuTuc("deals.setStage", () => null),
			byId: thuTuc("deals.byId", () => null),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ deal: async () => undefined }),
}));

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => () => undefined,
}));

mock.module("@/components/crm/record-sheet/record-prefetch", () => ({
	usePrefetchRecord: () => () => undefined,
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DealStageMenu } = await import("@/components/crm/stage-change");
const { DealListResultTable } = await import(
	"@/components/agent-builder/deal-list-result"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(cay: ReactNode) {
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
					<LocaleProvider locale="vi">{cay}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return khung as HTMLElement;
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function thoaThuan(
	id: string,
	stage: string,
	stageId: string | null,
): DealListItem {
	return {
		id,
		name: `Thoả thuận ${id}`,
		stage,
		stageId,
		amount: null,
		currency: "VND",
		company: {
			id: "c1",
			name: "Công ty A",
			domain: null,
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			logoUrl: null,
		},
		owner: null,
		daysSinceLastActivity: 2,
		neverActive: false,
		expectedCloseDate: null,
	};
}

const HANG = [
	thoaThuan("h1", "Nhãn cũ", "gd-mo"),
	thoaThuan("h2", "Đã ký", "gd-thang"),
	thoaThuan("h3", "Rớt", "gd-thua"),
	thoaThuan("h4", "CLOSED_WON", null),
	thoaThuan("h5", "Đã gửi hợp đồng", null),
	thoaThuan("h6", "Cũ", "gd-da-cat"),
];

const KET_QUA: DealListResult = {
	asOf: "2026-10-08T00:00:00.000Z",
	criteria: {
		status: "all",
		inactiveForDays: null,
		companyId: null,
		ownerId: null,
	},
	deals: HANG,
	hasMore: false,
};

type O = { tone: string | null; chu: string; dich: string | null };

function oGiaiDoan(k: HTMLElement): O[] {
	return [...k.querySelectorAll("tbody tr")].map((tr) => {
		const o = tr.querySelectorAll("td")[2];
		const cham = o?.querySelector('[data-slot="indicator-dot"]');
		const coDich = o?.querySelector("[translate]");
		return {
			tone: cham ? cham.getAttribute("data-tone") : null,
			chu: o?.textContent?.trim() ?? "",
			dich: coDich ? coDich.getAttribute("translate") : null,
		};
	});
}

async function toneChip(stage: string): Promise<string | null> {
	const k = await dung(<DealStageMenu dealId="d-kanban" stage={stage} />);
	const cham = k.querySelector('[data-slot="indicator-dot"]');
	const tone = cham ? cham.getAttribute("data-tone") : null;
	act(() => root?.unmount());
	k.remove();
	root = null;
	khung = null;
	return tone;
}

describe("cham-mau", () => {
	test("tung hang cua bang Kara", async () => {
		const k = await dung(<DealListResultTable result={KET_QUA} />);
		const o = oGiaiDoan(k);
		expect(o.length).toBe(HANG.length);
		expect(o[0]?.tone, "hang co stageId khong co cham").toBe("info");
		expect(o[0]?.chu).toBe("Làm quen");
		expect(o[1]?.tone).toBe("success");
		expect(o[1]?.chu).toBe("Đã ký");
		expect(o[2]?.tone).toBe("error");
		expect(o[2]?.chu).toBe("Rớt");
		expect(o[3]?.tone, "ban ghi truoc 29/09 mat cham").toBe("success");
		expect(o[3]?.chu).toBe("Chốt");
		expect(o[4]?.tone, "nhan bi do ra ma").toBe(null);
		expect(o[4]?.chu).toBe("Đã gửi hợp đồng");
		expect(o[4]?.dich).toBe("no");
		expect(o[5]?.tone, "ma la van co cham").toBe(null);
		expect(o[5]?.chu).toBe("Cũ");
		expect(k.querySelectorAll('[data-slot="indicator-dot"]').length).toBe(4);
	});

	test("cung tone voi chip Kanban", async () => {
		const k = await dung(<DealListResultTable result={KET_QUA} />);
		const o = oGiaiDoan(k);
		act(() => root?.unmount());
		k.remove();
		root = null;
		khung = null;
		const kanban = [
			await toneChip("gd-mo"),
			await toneChip("gd-thang"),
			await toneChip("gd-thua"),
		];
		for (let i = 0; i < kanban.length; i += 1) {
			expect(o[i]?.tone, `hang ${i + 1} khac mau Kanban`).toBe(kanban[i] ?? "");
		}
		expect(new Set(kanban).size).toBe(3);
	});
});
