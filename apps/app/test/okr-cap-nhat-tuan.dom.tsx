import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { CapNhatTuanOutput } from "../../api/src/okr/okr.contracts";

type Kr = CapNhatTuanOutput["items"][number];

function kr(vao: Partial<Kr> & { keyResultId: string }): Kr {
	return {
		title: `KR ${vao.keyResultId}`,
		objectiveId: "mt-1",
		objectiveTitle: "Tăng trưởng quý 4",
		unitName: "Kinh doanh",
		kind: "tang-toi",
		unit: "khách",
		targetValue: 50,
		currentValue: 0,
		lastConfidence: null,
		lastAt: null,
		updatedThisWeek: false,
		nguon: "tay",
		doCanh: false,
		soMay: null,
		...vao,
	};
}

const KR_CRM = kr({
	keyResultId: "kr-crm",
	nguon: "crm",
	currentValue: 15,
	soMay: { giaTri: 15, ngay: "2026-09-20", nguon: "crm" },
});
const KR_API = kr({
	keyResultId: "kr-api",
	nguon: "api",
	currentValue: 40,
	soMay: { giaTri: 40, ngay: "2026-09-21", nguon: "api" },
});
const KR_CRM_CHUA_CHUP = kr({
	keyResultId: "kr-crm-chua-chup",
	nguon: "crm",
	currentValue: 0,
	soMay: null,
});
const KR_DO_CANH = kr({
	keyResultId: "kr-do-canh",
	nguon: "tay",
	doCanh: true,
	currentValue: 5,
	soMay: { giaTri: 8, ngay: "2026-09-22", nguon: "crm" },
});
const KR_TAY = kr({
	keyResultId: "kr-tay",
	nguon: "tay",
	currentValue: 5,
	targetValue: 20,
});

const DU: CapNhatTuanOutput = {
	items: [KR_CRM, KR_API, KR_CRM_CHUA_CHUP, KR_DO_CANH, KR_TAY],
	weekStart: "2026-09-14",
	dueWeekday: 1,
};

let daLamMoi: string[] = [];

type KetQuaMock = { sessionId: string; written: number; seconds: number };

const thuTuc = (duong: string) => ({
	queryKey: () => [duong, null],
	pathKey: () => [duong],
	queryOptions: () => ({
		queryKey: [duong, null],
		queryFn: async () => null,
	}),
	mutationOptions: (chon?: { onSuccess?: (kq: KetQuaMock) => unknown }) => ({
		...chon,
		mutationKey: [duong],
		mutationFn: async (): Promise<KetQuaMock> => ({
			written: 1,
			seconds: 1,
			sessionId: "phien",
		}),
	}),
});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			capNhatTuan: thuTuc("okr.capNhatTuan"),
			moCapNhat: thuTuc("okr.moCapNhat"),
			guiCapNhat: thuTuc("okr.guiCapNhat"),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async (id?: string) => {
			daLamMoi.push(id ?? "");
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/cap-nhat-tuan",
}));

const { CapNhatTuan } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

let dangMo: Root[] = [];

async function mo(items: CapNhatTuanOutput = DU): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	client.setQueryData(["okr.capNhatTuan", null], items);
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<CapNhatTuan entry="tab" sessionId="phien-1" />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

function dong(id: string): HTMLElement {
	const o = document.body.querySelector<HTMLElement>(`[data-kr="${id}"]`);
	if (!o) throw new Error(`khong thay dong ${id}`);
	return o;
}

function oGiaTri(id: string): HTMLInputElement {
	const o = dong(id).querySelector<HTMLInputElement>(
		'[data-slot="input-group-control"]',
	);
	if (!o) throw new Error(`khong thay o gia tri ${id}`);
	return o;
}

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	daLamMoi = [];
});

describe("man cap nhat tuan: o so khoa hoac dien san", () => {
	test("KR crm co so may: khoa, hien so may, khong sua duoc", async () => {
		await mo();
		const d = dong("kr-crm");
		expect(d.dataset.nguon).toBe("crm");
		const o = oGiaTri("kr-crm");
		expect(o.disabled).toBe(true);
		expect(o.dataset.khoa).toBe("true");
		expect(o.value).toBe("15");
		expect(d.textContent).toContain("Số từ CRM · 20/09");
	});

	test("KR api co so may: khoa, hien so may", async () => {
		await mo();
		const d = dong("kr-api");
		expect(d.dataset.nguon).toBe("api");
		const o = oGiaTri("kr-api");
		expect(o.disabled).toBe(true);
		expect(o.dataset.khoa).toBe("true");
		expect(o.value).toBe("40");
		expect(d.textContent).toContain("Số từ API · 21/09");
	});

	test("KR crm chua chup: van khoa, chu Số máy: sáng mai", async () => {
		await mo();
		const d = dong("kr-crm-chua-chup");
		const o = oGiaTri("kr-crm-chua-chup");
		expect(o.disabled).toBe(true);
		expect(o.dataset.khoa).toBe("true");
		expect(d.textContent).toContain("Số máy: sáng mai");
	});

	test("KR do canh: bat, dien san bang so may, sua duoc", async () => {
		await mo();
		const d = dong("kr-do-canh");
		expect(d.dataset.nguon).toBe("tay");
		const o = oGiaTri("kr-do-canh");
		expect(o.disabled).toBe(false);
		expect(o.dataset.khoa).toBeUndefined();
		expect(o.value).toBe("8");
		expect(d.textContent).toContain("Số máy: 8 · 22/09");
		await go(o, "9");
		expect(o.value).toBe("9");
	});

	test("KR tay: khong doi, khong khoa, khong chu so may", async () => {
		await mo();
		const d = dong("kr-tay");
		const o = oGiaTri("kr-tay");
		expect(o.disabled).toBe(false);
		expect(o.dataset.khoa).toBeUndefined();
		expect(o.value).toBe("5");
		expect(d.textContent).not.toContain("Số từ");
		expect(d.textContent).not.toContain("Số máy");
		await go(o, "12");
		expect(o.value).toBe("12");
	});
});
