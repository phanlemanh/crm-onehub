import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { FIELD_TYPES, type FieldTypeName } from "@crm/db/fields-shape";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type TuyChonGhi = {
	onSuccess?: (kq: unknown, vao: unknown) => unknown;
	onError?: (e: Error) => unknown;
};

const duLieu = new Map<string, (vao: unknown) => unknown>();
let goi: Array<{ ten: string; vao: unknown }> = [];

function thuTuc(ten: string) {
	const khoa = (vao?: unknown) => (vao === undefined ? [ten] : [ten, vao]);
	const doc = (vao: unknown) => {
		goi.push({ ten, vao });
		const f = duLieu.get(ten);
		return f ? f(vao) : null;
	};
	return {
		queryKey: khoa,
		pathKey: () => [ten],
		queryFilter: () => ({ queryKey: [ten] }),
		infiniteQueryOptions: (vao?: unknown) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
			initialPageParam: 0,
			getNextPageParam: () => undefined,
		}),
		queryOptions: (vao?: unknown) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (vao: unknown) => doc(vao),
		}),
	};
}

function nhanh(duong: string[]): unknown {
	return new Proxy(() => {}, {
		get(_t, ten: string) {
			if (
				[
					"queryKey",
					"pathKey",
					"queryFilter",
					"queryOptions",
					"mutationOptions",
					"infiniteQueryOptions",
				].includes(ten) &&
				duong.length >= 2
			) {
				return (thuTuc(duong.join(".")) as Record<string, unknown>)[ten];
			}
			return nhanh([...duong, ten]);
		},
	});
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => nhanh([]),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));

const { FieldEditor } = await import("@/components/crm/fields/field-editor");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");
const { fieldsCopy } = await import("@/components/crm/fields/fields-copy");

let roots: { o: HTMLElement; root: Root }[] = [];
let urls: UrlUpdateEvent[] = [];

beforeEach(() => {
	goi = [];
	urls = [];
	duLieu.clear();
});

afterEach(async () => {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 1) {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function cho(dieu: () => boolean, moTa: string) {
	for (let i = 0; i < 100; i += 1) {
		if (dieu()) return;
		await nhip();
	}
	throw new Error(`khong toi: ${moTa}`);
}

async function mo(man: ReactElement, searchParams = "") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={searchParams}
				onUrlUpdate={(e) => urls.push(e)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	roots.push({ o, root });
	return o;
}

function truongMau(type: FieldTypeName, i: number) {
	return {
		id: `f-${i}`,
		entity: "DEAL",
		key: `lmt_${type.toLowerCase()}`,
		label: `Lmt ${type}`,
		type,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: false,
		position: i,
		archived: false,
		options:
			type === "SELECT"
				? [
						{ id: "o-a", label: "A", position: 0 },
						{ id: "o-b", label: "B", position: 1 },
					]
				: [],
	};
}

function dsTruong() {
	return JSON.parse(
		JSON.stringify(fieldListOutput.parse(FIELD_TYPES.map(truongMau))),
	) as Array<ReturnType<typeof truongMau>>;
}

describe("lmt-cai-dat", () => {
	test("lmt-cai-dat: o Hien trong bo loc co cho moi kieu va luu showOnFilter", async () => {
		const nhan = crmMessages("vi").fields.filterDeal;
		const truong = dsTruong();
		let soKieu = 0;
		const kq: Record<string, boolean> = {};
		for (const f of truong) {
			goi = [];
			duLieu.set("fields.update", (vao) => vao);
			const o = await mo(
				<FieldEditor
					entity="DEAL"
					field={f as never}
					onArchive={() => {}}
					onDone={() => {}}
				/>,
			);
			const nhanO = [...o.querySelectorAll("label")].find((l) =>
				l.textContent?.includes(nhan),
			);
			const oTich = nhanO?.querySelector<HTMLElement>('[role="checkbox"]');
			if (!oTich) {
				kq[f.type] = false;
				if (f.type !== "SELECT")
					throw new Error(`lmt cai dat: thieu o ${f.type}`);
				throw new Error("lmt cai dat: doi chung SELECT");
			}
			await act(async () => oTich.click());
			const luu = [...o.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === fieldsCopy("vi").save,
			);
			await act(async () => luu?.click());
			await cho(
				() => goi.some((g) => g.ten === "fields.update"),
				`luu ${f.type}`,
			);
			const vao = goi.find((g) => g.ten === "fields.update")?.vao as {
				data: { showOnFilter: boolean };
			};
			if (vao?.data?.showOnFilter !== true) {
				throw new Error(`lmt cai dat: luu ${f.type} ${JSON.stringify(vao)}`);
			}
			kq[f.type] = true;
			soKieu += 1;
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
		}
		if (soKieu !== FIELD_TYPES.length) {
			throw new Error(`lmt cai dat: thieu o ${soKieu}`);
		}
		expect(Object.keys(kq).length).toBe(FIELD_TYPES.length);
	});
});
