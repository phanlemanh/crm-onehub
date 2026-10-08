import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type GiaiDoanList,
	giaiDoanListOutput,
} from "../../api/src/giai-doan/giai-doan.contracts";

type Hang = GiaiDoanList["stages"][number];

function hang(
	id: string,
	label: string,
	kind: Hang["kind"],
	position: number,
	dealCount = 0,
): Hang {
	return { id, label, kind, position, dealCount };
}

const BAY: Hang[] = [
	hang("DEMO_BOOKED", "Demo booked", "OPEN", 0, 4),
	hang("QUALIFIED_TO_BUY", "Qualified to buy", "OPEN", 1),
	hang("DECISION_MAKER_BOUGHT_IN", "Decision maker in", "OPEN", 2),
	hang("CONTRACT_SENT", "Contract sent", "OPEN", 3),
	hang("CLOSED_WON", "Closed won", "WON", 0),
	hang("CLOSED_LOST", "Closed lost", "LOST", 0, 2),
	hang("UNQUALIFIED_TO_BUY", "Unqualified", "LOST", 1),
];

let che: "ok" | "loi" | "treo" = "ok";
let duLieu: GiaiDoanList = giaiDoanListOutput.parse({
	canManage: true,
	tran: 20,
	stages: BAY,
});
let soLanDoc = 0;
let cheDaCat: ("ok" | "loi" | "treo")[] = [];
let soLanDaCat = 0;
let henDaCat: { xong: () => void; hong: () => void } | null = null;

function docDaCat() {
	soLanDaCat += 1;
	const che = cheDaCat.shift() ?? "ok";
	if (che === "loi") throw new Error("mat ket noi");
	if (che === "treo") {
		return new Promise<typeof daCat>((xong, hong) => {
			henDaCat = {
				xong: () => xong(daCat),
				hong: () => hong(new Error("mat ket noi")),
			};
		});
	}
	return daCat;
}
let daCat: {
	id: string;
	label: string;
	kind: Hang["kind"];
	archivedAt: string;
}[] = [];
type DauVaoGhi = {
	readonly [khoa: string]: string | readonly string[] | undefined;
};
let goiGhi: { ten: string; v: DauVaoGhi }[] = [];
let ketQuaGhi: Record<string, () => Promise<{ id: string }>> = {};

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

type MoiGhi = { onSuccess?: unknown; onError?: unknown; onSettled?: unknown };

function sapTheoLoai(stages: Hang[]): Hang[] {
	const thu = { OPEN: 0, WON: 1, LOST: 2 };
	return [...stages].sort(
		(a, b) => thu[a.kind] - thu[b.kind] || a.position - b.position,
	);
}

const HIEU_UNG = new Map<string, (v: DauVaoGhi) => void>([
	[
		"giaiDoan.archive",
		(v: DauVaoGhi) => {
			const ma = String(v.id);
			const g = duLieu.stages.find((x) => x.id === ma);
			if (!g) return;
			duLieu = { ...duLieu, stages: duLieu.stages.filter((x) => x.id !== ma) };
			daCat = [
				{
					id: g.id,
					label: g.label,
					kind: g.kind,
					archivedAt: new Date().toISOString(),
				},
				...daCat,
			];
		},
	],
	[
		"giaiDoan.restore",
		(v: DauVaoGhi) => {
			const ma = String(v.id);
			const c = daCat.find((x) => x.id === ma);
			if (!c) return;
			daCat = daCat.filter((x) => x.id !== ma);
			const cuoi = Math.max(
				-1,
				...duLieu.stages
					.filter((x) => x.kind === c.kind)
					.map((x) => x.position),
			);
			duLieu = {
				...duLieu,
				stages: sapTheoLoai([
					...duLieu.stages,
					hang(c.id, c.label, c.kind, cuoi + 1),
				]),
			};
		},
	],
	[
		"giaiDoan.reorder",
		(v: DauVaoGhi) => {
			const thuTu = [v.ids ?? []].flat();
			duLieu = {
				...duLieu,
				stages: sapTheoLoai(
					duLieu.stages.map((x) =>
						thuTu.includes(x.id) ? { ...x, position: thuTu.indexOf(x.id) } : x,
					),
				),
			};
		},
	],
]);

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa | Promise<TRa>) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: MoiGhi) => ({
			mutationKey: [ten],
			mutationFn: async (v: DauVaoGhi) => {
				goiGhi.push({ ten, v });
				const lam = ketQuaGhi[ten];
				if (lam) return lam();
				HIEU_UNG.get(ten)?.(v);
				return { id: "x" };
			},
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => {
				soLanDoc += 1;
				if (che === "loi") throw new Error("hong");
				if (che === "treo") return new Promise(() => {});
				return duLieu;
			}),
			create: thuTuc("giaiDoan.create", () => null),
			rename: thuTuc("giaiDoan.rename", () => null),
			reorder: thuTuc("giaiDoan.reorder", () => null),
			archive: thuTuc("giaiDoan.archive", () => null),
			restore: thuTuc("giaiDoan.restore", () => null),
			archived: thuTuc("giaiDoan.archived", () => docDaCat()),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return {
			giaiDoan: () => qc.invalidateQueries(),
			deal: async () => undefined,
		};
	},
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		error: ghiToast("loi"),
		success: ghiToast("xong"),
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { GiaiDoanSettings, LyDoGiaiDoan } = await import(
	"@/app/(app)/[slug]/settings/giai-doan/giai-doan-settings"
);
const { settingsMessages } = await import("@/lib/messages/settings");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { NHOM_CAI_DAT } = await import("@/lib/cai-dat-dieu-huong");
const t = settingsMessages("vi");

let root: Root | null = null;
let khung: HTMLElement | null = null;

beforeEach(() => {
	che = "ok";
	soLanDoc = 0;
	cheDaCat = [];
	soLanDaCat = 0;
	henDaCat = null;
	daCat = [];
	goiGhi = [];
	ketQuaGhi = {};
	goiToast.length = 0;
	duLieu = giaiDoanListOutput.parse({ canManage: true, tran: 20, stages: BAY });
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(locale: "vi" | "en" = "vi") {
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
					<LocaleProvider locale={locale}>
						<LyDoGiaiDoan />
						<GiaiDoanSettings />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return khung as HTMLElement;
}

function nutThem(k: HTMLElement) {
	return [...k.querySelectorAll("button")].filter(
		(b) => b.textContent?.trim() === t.giaiDoan.them,
	);
}

function khoa(el: Element) {
	return (
		el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true"
	);
}

function nutMenu(k: HTMLElement) {
	return [...k.querySelectorAll("[data-menu-giai-doan]")];
}

function tayCam(k: HTMLElement) {
	return [...k.querySelectorAll("[data-the-giai-doan] button")].filter((b) =>
		b.querySelector(".sr-only"),
	);
}

async function moMenu(k: HTMLElement, id: string) {
	const nut = k.querySelector(
		`[data-hang-giai-doan="${id}"] [data-menu-giai-doan]`,
	);
	if (!(nut instanceof HTMLElement)) throw new Error(`khong co menu ${id}`);
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await cho(2);
	return [...document.querySelectorAll('[role="menuitem"]')];
}

const HAI = [
	{
		id: "CU_MO",
		label: "Cũ mở",
		kind: "OPEN" as const,
		archivedAt: "2026-10-08T01:00:00.000Z",
	},
	{
		id: "CU_THUA",
		label: "Cũ thua",
		kind: "LOST" as const,
		archivedAt: "2026-10-07T01:00:00.000Z",
	},
];

function khungLoi(): Element | null {
	return document.body.querySelector("[data-da-luu-tru-loi]");
}

function nutThuLai(): HTMLButtonElement | undefined {
	return [...(khungLoi()?.querySelectorAll("button") ?? [])].find(
		(b) => b.textContent?.trim() === t.giaiDoan.thuLai,
	);
}

async function bamThuLai(): Promise<void> {
	const nut = nutThuLai();
	if (!nut) throw new Error("khong co nut Thu lai");
	await act(async () => nut.click());
	await cho();
}

async function chonMuc(k: HTMLElement, id: string, chu: string) {
	const muc = await moMenu(k, id);
	const m = muc.find((x) => x.textContent?.includes(chu));
	if (!(m instanceof HTMLElement)) throw new Error(`khong co muc ${chu}`);
	await act(async () => m.click());
	await cho();
	return m;
}

describe("loi", () => {
	test("loi: tai da luu tru loi thi hien khung loi co Thu lai, ba the van dung duoc", async () => {
		cheDaCat = ["loi", "loi"];
		const k = await dung();
		const kh = khungLoi();
		expect(kh === null ? "loi tai da luu tru bi giau" : "co khung loi").toBe(
			"co khung loi",
		);
		const tieuDe = kh?.textContent ?? "";
		const truocLuu = goiGhi.filter((g) => g.ten === "giaiDoan.archive").length;
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		expect({
			slotEmpty: kh?.getAttribute("data-slot"),
			vienLien: kh?.className.includes("border-solid"),
			tieuDe: tieuDe.includes(t.giaiDoan.loiTaiDaLuuTru),
			moTa: tieuDe.includes(t.giaiDoan.loiTaiMoTa),
			nutThuLai: [...(kh?.querySelectorAll("button") ?? [])].filter(
				(b) => b.textContent?.trim() === t.giaiDoan.thuLai,
			).length,
			the: [...k.querySelectorAll("[data-the-giai-doan]")].map((e) =>
				e.getAttribute("data-the-giai-doan"),
			),
			tayMo: tayCam(k).every((b) => !khoa(b)),
			mucGap: k.querySelector('[data-slot="archived-list"]') !== null,
			luuTru:
				goiGhi.filter((g) => g.ten === "giaiDoan.archive").length - truocLuu,
			conKhungLoi: khungLoi() !== null,
		}).toEqual({
			slotEmpty: "empty",
			vienLien: true,
			tieuDe: true,
			moTa: true,
			nutThuLai: 1,
			the: ["OPEN", "WON", "LOST"],
			tayMo: true,
			mucGap: false,
			luuTru: 1,
			conKhungLoi: true,
		});
	});

	test("loi: doi chung — tai duoc danh sach rong thi khong co khung loi", async () => {
		const k = await dung();
		expect({
			loi: khungLoi() !== null,
			mucGap: k.querySelector('[data-slot="archived-list"]') !== null,
		}).toEqual({ loi: false, mucGap: false });
	});
});

describe("thu-lai", () => {
	test("thu-lai: bam Thu lai chi tai lai danh sach da luu tru roi hien muc gap", async () => {
		cheDaCat = ["loi", "ok"];
		daCat = HAI;
		const k = await dung();
		const coLoiTruoc = khungLoi() !== null;
		const daCatTruoc = soLanDaCat;
		const listTruoc = soLanDoc;
		await bamThuLai();
		const gap = k.querySelector('[data-slot="archived-list"] button');
		expect(
			soLanDoc === listTruoc
				? "dung"
				: "thu lai tai lai ca danh sach dang dung",
		).toBe("dung");
		expect({
			coLoiTruoc,
			goiThem: soLanDaCat - daCatTruoc,
			conLoi: khungLoi() !== null,
			gap: gap?.textContent?.trim(),
		}).toEqual({
			coLoiTruoc: true,
			goiThem: 1,
			conLoi: false,
			gap: `${t.giaiDoan.daLuuTru} (2)`,
		});
	});
});

describe("van-loi", () => {
	test("van-loi: dang thu lai van giu khung loi va khoa nut; van loi thi bam lai duoc", async () => {
		cheDaCat = ["loi", "treo", "loi"];
		await dung();
		await bamThuLai();
		const dangTai = document.body.querySelector("[data-da-luu-tru-dang-tai]");
		expect(
			khungLoi() !== null && dangTai === null
				? "dung"
				: "khung loi nhay sang khung xuong khi thu lai",
		).toBe("dung");
		const khoaKhiTai = nutThuLai()?.disabled;
		await act(async () => henDaCat?.hong());
		await cho();
		const sauLoi = { khung: khungLoi() !== null, khoa: nutThuLai()?.disabled };
		const truocBamLai = soLanDaCat;
		await bamThuLai();
		expect({
			khoaKhiTai,
			sauLoi,
			goiThem: soLanDaCat - truocBamLai,
			mucGap:
				document.body.querySelector('[data-slot="archived-list"]') !== null,
		}).toEqual({
			khoaKhiTai: true,
			sauLoi: { khung: true, khoa: false },
			goiThem: 1,
			mucGap: false,
		});
	});
});

describe("dang-tai", () => {
	test("dang-tai: dang tai co khung xuong sau ba the; tra rong thi khong con gi", async () => {
		cheDaCat = ["treo"];
		const k = await dung();
		const xuong = k.querySelector("[data-da-luu-tru-dang-tai]");
		expect(xuong === null ? "dang tai tra rong" : "co khung xuong").toBe(
			"co khung xuong",
		);
		const theCuoi = [...k.querySelectorAll("[data-the-giai-doan]")].at(-1);
		const sauThe = theCuoi
			? (theCuoi.compareDocumentPosition(xuong as Node) &
					Node.DOCUMENT_POSITION_FOLLOWING) !==
				0
			: false;
		const luc = {
			slot: xuong?.getAttribute("data-slot") ?? "",
			sauThe,
			loi: khungLoi() !== null,
			mucGap: k.querySelector('[data-slot="archived-list"]') !== null,
		};
		await act(async () => henDaCat?.xong());
		await cho();
		expect({
			luc,
			sau: {
				xuong: k.querySelector("[data-da-luu-tru-dang-tai]") !== null,
				loi: khungLoi() !== null,
				mucGap: k.querySelector('[data-slot="archived-list"]') !== null,
			},
		}).toEqual({
			luc: { slot: "skeleton", sauThe: true, loi: false, mucGap: false },
			sau: { xuong: false, loi: false, mucGap: false },
		});
	});

	test("dang-tai: da co du lieu ma lan lam moi sau loi thi giu muc gap, khong hien khung loi", async () => {
		cheDaCat = ["ok", "loi"];
		daCat = HAI;
		const k = await dung();
		const coGap = k.querySelector('[data-slot="archived-list"]') !== null;
		const qcLamMoi = goiToast.length;
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		expect({
			coGap,
			conGap: k.querySelector('[data-slot="archived-list"]') !== null,
			loi: khungLoi() !== null,
			toastMoi: goiToast.length > qcLamMoi,
		}).toEqual({ coGap: true, conGap: true, loi: false, toastMoi: true });
	});
});

describe("khong-quan-tri", () => {
	test("khong-quan-tri: van thay khung loi va bam Thu lai duoc; quyen khac khong doi", async () => {
		cheDaCat = ["loi", "loi"];
		duLieu = giaiDoanListOutput.parse({
			canManage: false,
			tran: 20,
			stages: BAY,
		});
		const k = await dung();
		const mo = nutThuLai()?.disabled === false;
		const truoc = soLanDaCat;
		await bamThuLai();
		expect({
			khung: khungLoi() !== null,
			mo,
			goiThem: soLanDaCat - truoc,
			tayKhoa: tayCam(k).map(khoa),
		}).toEqual({
			khung: true,
			mo: true,
			goiThem: 1,
			tayKhoa: BAY.map(() => true),
		});
	});
});
