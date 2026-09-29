import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { activityEntryOutput } from "../../api/src/activities/activities.contracts";

const G_DA_XOA = { id: "gd-da-xoa-7f3k", label: "Thử nghiệm cũ" };
const G_DOI_TEN = { id: "gd-doi-ten-2q9x", label: "Đã ký hợp đồng" };
const G_KHAC = { id: "gd-khac-81mz", label: "Làm quen" };

function muc(
	id: string,
	from: { id: string; label: string },
	to: { id: string; label: string },
) {
	return activityEntryOutput.parse({
		id,
		type: "STAGE_CHANGE",
		subject: "Stage changed",
		body: null,
		occurredAt: "2026-09-20T03:00:00.000Z",
		dueAt: null,
		completedAt: null,
		meta: { from: from.id, to: to.id },
		createdAt: "2026-09-20T03:00:00.000Z",
		createdBy: {
			id: "u1",
			name: "Người thử",
			email: "u1@example.test",
			image: null,
		},
		company: null,
		contact: null,
		deal: null,
		planId: null,
		emailThread: null,
		calendarEvent: null,
		stageChange: { from, to },
	});
}

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
			mutationFn: async () => undefined,
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => ({
				canManage: true,
				tran: 20,
				stages: [
					{ ...G_DOI_TEN, kind: "OPEN", position: 0, dealCount: 0 },
					{ ...G_KHAC, kind: "OPEN", position: 1, dealCount: 0 },
				],
			})),
		},
		activities: { complete: thuTuc("activities.complete", () => null) },
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ activity: async () => undefined }),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TimelineEntry } = await import(
	"@/components/crm/timeline/timeline-entry"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

async function hien(entry: ReturnType<typeof muc>) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () =>
		root?.render(
			<QueryClientProvider client={queryClient}>
				<LocaleProvider locale="vi">
					<TimelineEntry entry={entry} anchor={{ dealId: "d1" }} />
				</LocaleProvider>
			</QueryClientProvider>,
		),
	);
	for (let i = 0; i < 4; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	return khung.textContent ?? "";
}

describe("giai-doan-timeline", () => {
	test("dong cua giai doan da xoa hien nhan, khong hien id", async () => {
		const chu = await hien(muc("a1", G_DA_XOA, G_KHAC));
		expect(
			chu.includes(G_DA_XOA.label),
			`timeline: nhan G ${G_DA_XOA.label} vang`,
		).toBe(true);
		expect(
			chu.includes(G_DA_XOA.id),
			`timeline: nhan G != ${G_DA_XOA.id}`,
		).toBe(false);
	});

	test("doi chung: giai doan song da doi ten hien nhan moi", async () => {
		const chu = await hien(muc("a2", G_KHAC, G_DOI_TEN));
		expect(chu.includes(G_DOI_TEN.label)).toBe(true);
		expect(chu.includes(G_DOI_TEN.id)).toBe(false);
	});
});
