import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { DealBoard } from "@/app/(app)/[slug]/deals/use-deal-board-move";
import { dealBoardOutput } from "../../api/src/deals/deals.contracts";

type MoiGhi = { onSuccess?: unknown; onError?: unknown; onSettled?: unknown };

const bang: DealBoard = dealBoardOutput.parse(
	JSON.parse(
		readFileSync(
			join(import.meta.dir, "fixtures", "deals-board-dem-tong.json"),
			"utf8",
		),
	),
);

let treoGiaiDoan = true;
type LenhGhi = { id: string; toStageId: string; closedReason?: string };

const ghi: LenhGhi[] = [];
const url: URLSearchParams[] = [];

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
			mutationFn: async (v: LenhGhi) => {
				ghi.push(v);
				return null;
			},
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () =>
				treoGiaiDoan
					? new Promise(() => {})
					: {
							canManage: true,
							tran: 20,
							stages: [
								{
									id: "DEMO_BOOKED",
									label: "Demo booked",
									kind: "OPEN",
									position: 0,
									dealCount: 0,
								},
								{
									id: "CLOSED_LOST",
									label: "Closed lost",
									kind: "LOST",
									position: 0,
									dealCount: 0,
								},
							],
						},
			),
		},
		deals: { setStage: thuTuc("deals.setStage", () => null) },
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ deal: async () => undefined }),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const { useDealBoardMove } = await import(
	"@/app/(app)/[slug]/deals/use-deal-board-move"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;
let move: ((id: string, from: string, to: string) => void) | null = null;

function Moc() {
	move = useDealBoardMove(bang).move;
	return null;
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	ghi.length = 0;
	url.length = 0;
});

async function dung() {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter
				searchParams=""
				hasMemory
				onUrlUpdate={(e: UrlUpdateEvent) => url.push(e.searchParams)}
			>
				<QueryClientProvider client={qc}>
					<Moc />
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	for (let i = 0; i < 4; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

function theDau(): string {
	const the = bang.columns.find((c) => c.stage === "DEMO_BOOKED")?.cards[0];
	if (!the) throw new Error("fixture khong co the o DEMO_BOOKED");
	return the.id;
}

describe("giai-doan-board", () => {
	test("danh sach giai doan chua tai: keo vao cot Khong thanh khong gui gi", async () => {
		treoGiaiDoan = true;
		await dung();
		await act(async () => move?.(theDau(), "DEMO_BOOKED", "CLOSED_LOST"));
		await act(async () => {
			await new Promise((r) => setTimeout(r, 120));
		});
		expect(
			ghi,
			"dang tai: keo vao cot thua gui setStage khong ly do",
		).toHaveLength(0);
	});

	test("doi chung: da tai, keo vao cot Khong thanh mo hop ly do, khong ghi", async () => {
		treoGiaiDoan = false;
		await dung();
		await act(async () => move?.(theDau(), "DEMO_BOOKED", "CLOSED_LOST"));
		await act(async () => {
			await new Promise((r) => setTimeout(r, 120));
		});
		expect(ghi).toHaveLength(0);
		expect(url.at(-1)?.get("closeStage")).toBe("CLOSED_LOST");
	});
});
