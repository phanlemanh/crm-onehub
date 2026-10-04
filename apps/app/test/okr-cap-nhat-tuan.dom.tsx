import { afterEach, describe, expect, mock, test } from "bun:test";
import type { GuiCapNhatInput } from "@crm/validation/okr-cap-nhat";
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
const KR_API_CHUA_GHI = kr({
	keyResultId: "kr-api-chua-ghi",
	nguon: "api",
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
	items: [
		KR_CRM,
		KR_API,
		KR_CRM_CHUA_CHUP,
		KR_API_CHUA_GHI,
		KR_DO_CANH,
		KR_TAY,
	],
	weekStart: "2026-09-14",
	dueWeekday: 1,
};

let daLamMoi: string[] = [];
let daGuiVao: GuiCapNhatInput[] = [];

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
		mutationFn: async (vao: GuiCapNhatInput): Promise<KetQuaMock> => {
			daGuiVao.push(vao);
			return { written: 1, seconds: 1, sessionId: "phien" };
		},
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
const { okrMessages } = await import("@/lib/messages/okr");
const { giaTri } = await import("@/app/(app)/[slug]/okr/bang-kr");

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
	daGuiVao = [];
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

	test("KR api chua ghi: van khoa, chu Chưa có lần ghi qua khoá API, khong hen sang mai", async () => {
		await mo();
		const d = dong("kr-api-chua-ghi");
		const o = oGiaTri("kr-api-chua-ghi");
		expect(o.disabled).toBe(true);
		expect(o.dataset.khoa).toBe("true");
		expect(d.textContent).toContain("Chưa có lần ghi qua khoá API");
		expect(d.textContent).not.toContain("sáng mai");
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

const M = okrMessages("vi").capNhat;
const TUAN_NAY = "2026-09-14";

const XONG_A = kr({
	keyResultId: "kr-xong-a",
	kind: "tang-toi",
	unit: "khách",
	currentValue: 7,
	targetValue: 20,
	lastConfidence: "cao",
	lastAt: "2026-09-15T02:10:00.000Z",
	updatedThisWeek: true,
});
const XONG_B = kr({
	keyResultId: "kr-xong-b",
	kind: "moc",
	unit: "",
	currentValue: 1,
	targetValue: 1,
	lastConfidence: "vua",
	lastAt: "2026-09-16T08:45:00.000Z",
	updatedThisWeek: true,
});

function bo(items: Kr[]): CapNhatTuanOutput {
	return { items, weekStart: TUAN_NAY, dueWeekday: 1 };
}

function trangThai(): string | null {
	return (
		document.body
			.querySelector("[data-trang-thai]")
			?.getAttribute("data-trang-thai") ?? null
	);
}

function tuTinDaChon(): string[] {
	return [
		...document.body.querySelectorAll<HTMLElement>(
			'[data-o="tu-tin"] [data-state="on"]',
		),
	].map((e) => e.closest("[data-kr]")?.getAttribute("data-kr") ?? "");
}

type OMaTran = string | null | (string | null | undefined)[];

const XONG_LON = kr({
	keyResultId: "kr-xong-lon",
	kind: "tang-toi",
	unit: "khách",
	currentValue: 1234.5,
	targetValue: 2000,
	lastConfidence: "thap",
	lastAt: "2026-09-15T02:10:00.000Z",
	updatedThisWeek: true,
});

function nutGui(): HTMLButtonElement | null {
	return document.body.querySelector<HTMLButtonElement>('[data-nut="gui"]');
}

describe("man cap nhat tuan: da xong", () => {
	for (const [ten, items] of [
		["moi hon dung dau", [XONG_B, XONG_A]],
		["moi hon dung cuoi", [XONG_A, XONG_B]],
	] as const) {
		test(`da xong (${ten}): role=status, gio gui moi nhat, so va muc tu tin tung KR, khong nut gui`, async () => {
			await mo(bo([...items]));
			const status = document.body.querySelector('[role="status"]');
			const dong = (k: Kr) => {
				const o = document.body.querySelector(`[data-kr="${k.keyResultId}"]`);
				return {
					so:
						o?.textContent?.includes(giaTri(k, k.currentValue, "vi")) ?? false,
					tuTin:
						o?.textContent?.includes(
							M.tuTinNhan(M.mucTuTin[k.lastConfidence ?? "cao"]),
						) ?? false,
				};
			};
			expect({
				trangThai: trangThai(),
				tieuDe: status?.textContent?.includes(M.daXong.title) ?? false,
				luc: document.body.textContent?.includes(
					M.daXong.luc("16/09", "15:45"),
				),
				a: dong(XONG_A),
				b: dong(XONG_B),
				coNutGui: nutGui() !== null,
			}).toEqual({
				trangThai: "ST-capnhat-daxong",
				tieuDe: true,
				luc: true,
				a: { so: true, tuTin: true },
				b: { so: true, tuTin: true },
				coNutGui: false,
			});
		});
	}

	test("sua cap nhat: form dien san so, khong chon san muc tu tin, Gui 0 tat, focus o gia tri KR dau, chi KR duoc chon moi gui", async () => {
		await mo(bo([XONG_A, XONG_B]));
		const sua = document.body.querySelector<HTMLButtonElement>(
			'[data-nut="sua-cap-nhat"]',
		);
		if (!sua) throw new Error("khong thay nut sua cap nhat");
		await act(async () => sua.click());
		const truoc = {
			trangThai: trangThai(),
			giaTriA: oGiaTri(XONG_A.keyResultId).value,
			daChon: tuTinDaChon(),
			chuGui: nutGui()?.textContent?.trim(),
			tatGui: nutGui()?.disabled,
			focus: document.activeElement?.id,
		};
		const vua = [
			...dong(XONG_A.keyResultId).querySelectorAll<HTMLButtonElement>(
				'[data-o="tu-tin"] button',
			),
		].find((b) => b.textContent?.includes(M.mucTuTin.vua));
		if (!vua) throw new Error("khong thay nut Vua cua KR dau");
		await act(async () => vua.click());
		const daChonSau = tuTinDaChon();
		const gui = nutGui();
		if (!gui) throw new Error("khong thay nut gui");
		await act(async () => gui.click());
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
		const vao = daGuiVao.at(0);
		expect({
			truoc,
			daChonSau,
			guiCua: vao?.items.map((i) => i.keyResultId) ?? null,
		}).toEqual({
			truoc: {
				trangThai: "ST-capnhat-dangdien",
				giaTriA: "7",
				daChon: [],
				chuGui: M.gui(0),
				tatGui: true,
				focus: `${XONG_A.keyResultId}-gia-tri`,
			},
			daChonSau: [XONG_A.keyResultId],
			guiCua: [XONG_A.keyResultId],
		});
	});
});

describe("man cap nhat tuan: so tren man da xong", () => {
	test("da xong so: so cua KR tren man da xong trung so ma dong mo ta duoi o gia tri cua form hien sau khi bam Sua cap nhat", async () => {
		await mo(bo([XONG_LON]));
		const soDaXong =
			dong(XONG_LON.keyResultId)
				.querySelector(".tabular-nums")
				?.textContent?.trim() ?? "";
		const sua = document.body.querySelector<HTMLButtonElement>(
			'[data-nut="sua-cap-nhat"]',
		);
		if (!sua) throw new Error("khong thay nut sua cap nhat");
		await act(async () => sua.click());
		const moTaForm =
			dong(XONG_LON.keyResultId)
				.querySelector('[data-o="gia-tri"] [data-slot="field-description"]')
				?.textContent?.replace(/\s+/g, " ") ?? "";
		expect({
			soDaXong,
			formCoCungSo: soDaXong !== "" && moTaForm.includes(soDaXong),
		}).toEqual({ soDaXong: "1.234,5 khách", formCoCungSo: true });
	});
});

describe("man cap nhat tuan: mot phan va chua gui", () => {
	const K1 = kr({ keyResultId: "kr-mp-1", lastConfidence: "cao" });
	const K2 = kr({ keyResultId: "kr-mp-2", lastConfidence: "vua" });
	const K3 = kr({
		keyResultId: "kr-mp-3",
		lastConfidence: "thap",
		lastAt: "2026-09-09T03:00:00.000Z",
		updatedThisWeek: false,
	});
	const tuanNay = (k: Kr): Kr => ({
		...k,
		lastAt: "2026-09-15T03:00:00.000Z",
		updatedThisWeek: true,
	});
	const tuanTruoc = (k: Kr): Kr => ({
		...k,
		lastAt: "2026-09-08T03:00:00.000Z",
		updatedThisWeek: false,
	});

	test("mot phan: ma tran x = 0, 1, 2 tren y = 3 — trang thai, dong da gui, tap dau, khong chon san", async () => {
		const thuc: Record<string, OMaTran> = {};
		const mong: Record<string, OMaTran> = {};
		for (const x of [0, 1, 2]) {
			const items = [K1, K2].map((k, i) => (i < x ? tuanNay(k) : tuanTruoc(k)));
			await mo(bo([...items, K3]));
			const dongDaGui = document.body.querySelector("[data-da-gui-mot-phan]");
			thuc[`${x}.trangThai`] = trangThai();
			thuc[`${x}.dong`] = dongDaGui?.textContent ?? null;
			thuc[`${x}.dau`] = [
				...document.body.querySelectorAll("[data-da-gui-tuan-nay]"),
			]
				.map((e) => e.closest("[data-kr]")?.getAttribute("data-kr"))
				.sort();
			thuc[`${x}.chonSan`] = tuTinDaChon();
			mong[`${x}.trangThai`] =
				x === 0 ? "ST-capnhat-dangdien" : "ST-capnhat-motphan";
			mong[`${x}.dong`] = x === 0 ? null : M.daGuiMotPhan(x, 3);
			mong[`${x}.dau`] = items
				.filter((k) => k.updatedThisWeek)
				.map((k) => k.keyResultId)
				.sort();
			mong[`${x}.chonSan`] = [];
			for (const root of dangMo) act(() => root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
		console.log(`mot phan: ${Object.keys(mong).length} khang dinh`);
		expect(Object.keys(thuc).length).toBe(12);
		expect(thuc).toEqual(mong);
	});

	test("chua gui: khong ai phu trach KR nao thi giu trang thai rong, khong bao da gui", async () => {
		await mo(bo([]));
		expect({
			trangThai: trangThai(),
			daGui: document.body.textContent?.includes(M.daXong.title) ?? false,
		}).toEqual({ trangThai: "ST-capnhat-rong", daGui: false });
	});
});
