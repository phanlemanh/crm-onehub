import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type GiaiDoanList,
	giaiDoanListOutput,
} from "../../api/src/giai-doan/giai-doan.contracts";

const GOC: GiaiDoanList["stages"] = [
	["DEMO_BOOKED", "Demo booked", "OPEN", 0],
	["QUALIFIED_TO_BUY", "Qualified to buy", "OPEN", 1],
	["DECISION_MAKER_BOUGHT_IN", "Decision maker in", "OPEN", 2],
	["CONTRACT_SENT", "Contract sent", "OPEN", 3],
	["CLOSED_WON", "Closed won", "WON", 0],
	["CLOSED_LOST", "Closed lost", "LOST", 0],
	["UNQUALIFIED_TO_BUY", "Unqualified", "LOST", 1],
].map(([id, label, kind, position]) => ({
	id: id as string,
	label: label as string,
	kind: kind as "OPEN" | "WON" | "LOST",
	position: position as number,
	dealCount: 0,
}));

const NAM: GiaiDoanList["stages"] = [
	["gd-lam-quen", "Làm quen", "OPEN", 0],
	["gd-ky-mou", "Ký biên bản ghi nhớ", "OPEN", 1],
	["gd-trien-khai", "Triển khai thử", "OPEN", 2],
	["gd-hop-tac", "Hợp tác chính thức", "WON", 0],
	["gd-dung", "Dừng hợp tác", "LOST", 0],
].map(([id, label, kind, position]) => ({
	id: id as string,
	label: label as string,
	kind: kind as "OPEN" | "WON" | "LOST",
	position: position as number,
	dealCount: 0,
}));

let danhSach: GiaiDoanList = giaiDoanListOutput.parse({
	canManage: true,
	tran: 20,
	stages: NAM,
});

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: object) => ({
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

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DealStageMenu } = await import("@/components/crm/stage-change");
const { StageStepper } = await import("@/components/crm/stage-stepper");

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

async function mucMenu(k: HTMLElement): Promise<string[]> {
	const nut = k.querySelector('[aria-haspopup="menu"]');
	if (!(nut instanceof HTMLElement)) throw new Error("khong co nut menu");
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await cho(2);
	return [...document.querySelectorAll('[role="menuitemradio"]')].map(
		(m) => m.textContent?.trim() ?? "",
	);
}

describe("giai-doan-menu", () => {
	test("menu giai doan hien dung danh sach dong theo thu tu", async () => {
		danhSach = giaiDoanListOutput.parse({
			canManage: true,
			tran: 20,
			stages: NAM,
		});
		const k = await dung(<DealStageMenu dealId="d1" stage="gd-lam-quen" />);
		const muc = await mucMenu(k);
		const mong = NAM.map((g) => g.label);
		mong.forEach((nhan, i) => {
			expect(muc[i], `muc ${i + 1}: ${muc[i]} != ${nhan}`).toBe(nhan);
		});
		expect(muc).toHaveLength(mong.length);
	});

	test("doi chung: danh sach goc bay giai doan cho bay muc", async () => {
		danhSach = giaiDoanListOutput.parse({
			canManage: true,
			tran: 20,
			stages: GOC,
		});
		const k = await dung(<DealStageMenu dealId="d1" stage="DEMO_BOOKED" />);
		expect(await mucMenu(k)).toEqual(GOC.map((g) => g.label));
	});

	test("thanh tien trinh hien cac giai doan OPEN theo thu tu", async () => {
		danhSach = giaiDoanListOutput.parse({
			canManage: true,
			tran: 20,
			stages: NAM,
		});
		const k = await dung(<StageStepper dealId="d1" stage="gd-ky-mou" />);
		const buoc = [...k.querySelectorAll("ol > li button")].map(
			(b) => b.textContent?.trim() ?? "",
		);
		const mo = NAM.filter((g) => g.kind === "OPEN").map((g) => g.label);
		expect(buoc.slice(0, mo.length)).toEqual(mo);
		expect(
			k.querySelector('[translate="no"]'),
			"nhan khong mang translate=no",
		).not.toBeNull();
	});
});
