import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import type {
	AlignmentTreeOutput,
	ChuKyOutput,
	KrOutput,
	MucTieuOutput,
	NutCanChinh,
} from "../../api/src/okr/okr.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");

function cayMau(): TreeOutput {
	const pb = (
		id: string,
		name: string,
		divisionId: string | null,
		head: typeof LAN | null,
	) => ({
		id,
		name,
		position: 0,
		divisionId,
		head,
		stepCount: 0,
		people: head ? [{ ...head, primary: true }] : [],
	});
	return {
		divisions: [
			{
				id: "bp-kd",
				name: "Kinh doanh",
				position: 0,
				head: LAN,
				departments: [pb("pb-1", "Kinh doanh vùng 1", "bp-kd", HUNG)],
			},
			{
				id: "bp-vh",
				name: "Vận hành",
				position: 1,
				head: null,
				departments: [pb("pb-kho", "Kho vận", "bp-vh", null)],
			},
		],
		chuaXep: [pb("pb-pc", "Pháp chế", null, null)],
		chuaCoPhongBan: [],
		people: [],
		archived: { divisions: [], departments: [] },
		coverage: { members: 2, withPrimary: 1, departmentsWithoutHead: 2 },
	};
}

const QUY: ChuKyOutput = {
	id: "q4",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: "n26",
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
};

function kr(id: string, objectiveId: string): KrOutput {
	return {
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: HUNG,
		startValue: 0,
		targetValue: 50,
		currentValue: 20,
		unit: "khách",
		dueOn: null,
		weight: 1,
		source: "tay",
		startLocked: true,
		progress: 40,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	};
}

function mucTieu(id: string, soKr: number): MucTieuOutput {
	return {
		id,
		cycleId: QUY.id,
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 40,
		expected: 50,
		keyResults: Array.from({ length: soKr }, (_, i) => kr(`${id}-${i}`, id)),
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
	};
}

type NutDayDu = RouterOutputs["okr"]["cayCanChinh"]["roots"][number];

function nut(
	id: string,
	loai: NutCanChinh["loai"],
	children: NutDayDu[],
): NutDayDu {
	return {
		id,
		loai,
		objectiveId: id,
		unitName: "OneHub",
		title: `Nút ${id}`,
		progress: 30,
		status: "cong-bo",
		kind: "cam-ket",
		gop: 1,
		lapLai: false,
		expected: 25,
		children,
	};
}

let cycles: RouterOutputs["okr"]["cycles"];
let quanTri: boolean;
let theoDon: Map<string, { objectives: MucTieuOutput[]; canEdit: boolean }>;
let cayCanChinh: RouterOutputs["okr"]["cayCanChinh"];
let dem: RouterOutputs["okr"]["countByUnit"];

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;

const donVao = (don: string) =>
	don === "goc"
		? { loai: "goc" }
		: { loai: don.split(":")[0] ?? "", id: don.split(":")[1] ?? "" };
const khoaDonVao = (vao: DauVao) =>
	JSON.stringify(vao?.unit ?? { loai: "goc" });

function thuTuc<TRa>(ten: string, doc: (vao: DauVao) => TRa) {
	return {
		queryKey: (vao?: DauVao) => [ten, vao ?? null],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: {
						queryKey: [ten, vao ?? null],
						queryFn: async () => doc(vao),
					},
	};
}

const docCay = () => cayMau();
const docCycles = () => cycles;
const docAccess = () => ({
	canManageProgram: quanTri,
	headOf: { divisions: [], departments: [] },
});
const docWorkspace = () => ({ name: "OneHub" });
const docDem = () => dem;
const LOC_RONG = { phuTrach: [], loai: [], trangThai: [] };
const docDanhSach = (vao: DauVao) => {
	const d = theoDon.get(khoaDonVao(vao)) ?? { objectives: [], canEdit: false };
	return {
		rows: d.objectives.map((o) => ({ ...o, krKhop: [] })),
		total: d.objectives.length,
		facetCounts: { phuTrach: [], loai: [], trangThai: [] },
		canEdit: d.canEdit,
	};
};
const docCayCanChinh = () => cayCanChinh;

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", docCay) },
		workspace: { get: thuTuc("workspace", docWorkspace) },
		okr: {
			cycles: thuTuc("cycles", docCycles),
			access: thuTuc("access", docAccess),
			countByUnit: thuTuc("countByUnit", docDem),
			danhSach: thuTuc("danhSach", docDanhSach),
			cayCanChinh: thuTuc("cayCanChinh", docCayCanChinh),
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/theo-don-vi",
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
}));

const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");

const m = okrMessages("vi");
const mt = okrToanCanhMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

function gieo(client: QueryClient, don: string, xem: string | null) {
	const unit = donVao(don);
	client.setQueryData(["tree", null], docCay());
	client.setQueryData(["workspace", null], docWorkspace());
	client.setQueryData(["cycles", null], docCycles());
	client.setQueryData(["access", null], docAccess());
	if (cycles.currentId) {
		const cycleId = cycles.currentId;
		client.setQueryData(["countByUnit", { cycleId }], docDem());
		client.setQueryData(
			["danhSach", { cycleId, unit, loc: LOC_RONG }],
			docDanhSach({ cycleId, unit, loc: LOC_RONG }),
		);
		if (xem === "cay")
			client.setQueryData(["cayCanChinh", { cycleId }], docCayCanChinh());
	}
}

async function mo(don = "goc", xem: string | null = null): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	gieo(client, don, xem);
	const thamSo = new URLSearchParams();
	if (don !== "goc") thamSo.set("donOkr", don);
	if (xem) thamSo.set("xemOkr", xem);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={`?${thamSo}`} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TheoDonVi />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(() => !o.textContent?.includes(m.dangTai), "tai xong");
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 60; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

const nutCo = (o: ParentNode, chu: string) =>
	[...o.querySelectorAll("button")].some((b) => b.textContent?.trim() === chu);

beforeEach(() => {
	cycles = { cycles: [QUY], currentId: QUY.id };
	quanTri = false;
	theoDon = new Map();
	dem = {};
	cayCanChinh = { roots: [], chuaCanChinh: [] };
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("theo-don-vi", () => {
	test("theo-don-vi-danh-sach: ba khoi muc tieu, moi bang KR bon cot, cay don vi co so dem", async () => {
		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [mucTieu("a", 2), mucTieu("b", 1), mucTieu("c", 3)],
			canEdit: false,
		});
		dem = { "pb:pb-1": 3, goc: 1 };
		const s = await mo("pb:pb-1");
		const khoi = [...s.o.querySelectorAll("[data-muc-tieu]")];
		expect({
			khoi: khoi.map((k) => k.getAttribute("data-muc-tieu")),
			cot: khoi.map((k) => k.querySelectorAll("thead th").length),
			dongKr: khoi.map((k) => k.querySelectorAll("[data-kr]").length),
			nutCay: s.o.querySelectorAll("[data-nut-cay]").length,
			demPb1: s.o.querySelector('[data-nut-cay="pb:pb-1"]')?.textContent,
			demKho: s.o.querySelector('[data-nut-cay="pb:pb-kho"]')?.textContent,
			dangChon: s.o
				.querySelector('[data-nut-cay="pb:pb-1"]')
				?.getAttribute("aria-selected"),
			trangThai: s.o
				.querySelector("[data-trang-thai]")
				?.getAttribute("data-trang-thai"),
			tinhTrang: s.o
				.querySelector("[data-tinh-trang]")
				?.getAttribute("data-tinh-trang"),
		}).toEqual({
			khoi: ["a", "b", "c"],
			cot: [4, 4, 4],
			dongKr: [2, 1, 3],
			nutCay: 6,
			demPb1: "Kinh doanh vùng 13 mục tiêu",
			demKho: "Kho vậnchưa đặt",
			dangChon: "true",
			trangThai: "ST-donvi-danhsach",
			tinhTrang: "cham-nhip",
		});
		const tieuDe = s.o.querySelector('[data-muc-tieu="a"] [translate="no"]');
		expect(tieuDe?.textContent).toBe("Mục tiêu a");
	});

	test("theo-don-vi-rong: phong ban chua co truong noi cau gan truong, quan tri co lien ket", async () => {
		quanTri = true;
		const s = await mo("pb:pb-kho");
		const rong = s.o.querySelector('[data-trang-thai="ST-donvi-rong"]');
		expect({
			co: rong !== null,
			tieuDe: rong?.textContent?.includes(
				`Kho vận ${m.rong.chuaDat} Quý 4/2026`,
			),
			cauTruong: rong?.textContent?.includes(m.rong.chuaTruong),
			lienKet: rong?.querySelector("a")?.getAttribute("href"),
			khoi: s.o.querySelectorAll("[data-muc-tieu]").length,
		}).toEqual({
			co: true,
			tieuDe: true,
			cauTruong: true,
			lienKet: "/ws/settings/organization",
			khoi: 0,
		});
	});

	test("theo-don-vi-rong: doi chung — phong ban co truong noi cau chung, khong lien ket", async () => {
		quanTri = true;
		const s = await mo("pb:pb-1");
		const rong = s.o.querySelector('[data-trang-thai="ST-donvi-rong"]');
		expect({
			cauChung: rong?.textContent?.includes(m.rong.body),
			lienKet: rong?.querySelector("a"),
		}).toEqual({ cauChung: true, lienKet: null });
	});

	test("theo-don-vi-chua-chu-ky: khong co chu ky, quan tri co lien ket Cai dat, nguoi khac khong", async () => {
		cycles = { cycles: [], currentId: null };
		quanTri = true;
		const qt = await mo();
		const oQt = qt.o.querySelector('[data-trang-thai="ST-donvi-chuakychay"]');
		const lienKetQt = oQt?.querySelector("a")?.getAttribute("href");
		quanTri = false;
		const tv = await mo();
		const oTv = tv.o.querySelector('[data-trang-thai="ST-donvi-chuakychay"]');
		expect({
			quanTri: [oQt !== null, lienKetQt],
			thanhVien: [oTv !== null, oTv?.querySelector("a") ?? null],
			cay: tv.o.querySelectorAll("[data-nut-cay]").length,
		}).toEqual({
			quanTri: [true, "/ws/settings/okr"],
			thanhVien: [true, null],
			cay: 0,
		});
	});

	test("theo-don-vi-truong-thay-nut: canEdit thi co hai nut, khong thi khong nut nao", async () => {
		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [mucTieu("a", 1)],
			canEdit: true,
		});
		const truong = await mo("pb:pb-1");
		const nutTruong = [
			nutCo(truong.o, m.themMucTieu),
			nutCo(truong.o, m.nhapBangTinh),
		];
		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [mucTieu("a", 1)],
			canEdit: false,
		});
		const thanhVien = await mo("pb:pb-1");
		expect({
			truong: nutTruong,
			thanhVien: [
				nutCo(thanhVien.o, m.themMucTieu),
				nutCo(thanhVien.o, m.nhapBangTinh),
			],
		}).toEqual({ truong: [true, true], thanhVien: [false, false] });
	});

	test("theo-don-vi-cay: cay can chinh thut le theo cap, nhom chua can chinh la hang tieu de", async () => {
		cayCanChinh = {
			roots: [
				nut("o", "muc-tieu", [nut("k", "kr", [nut("p", "muc-tieu", [])])]),
			],
			chuaCanChinh: [nut("x", "muc-tieu", [])],
		};
		const s = await mo("goc", "cay");
		const dong = [...s.o.querySelectorAll("[data-nut-can-chinh]")];
		expect({
			cay:
				s.o.querySelector(`[role="tree"][aria-label="${mt.cay.canChinh}"]`) !==
				null,
			dong: dong.map(
				(d) =>
					`${d.getAttribute("data-nut-can-chinh")}@${d.closest('[role="treeitem"]')?.getAttribute("aria-level")}`,
			),
			nhom: s.o.querySelector('[data-cap-nut="nhom"]')?.textContent,
		}).toEqual({
			cay: true,
			dong: ["o@1", "k@2", "p@3", "x@2"],
			nhom: mt.cay.chuaCanChinh,
		});
	});
});

describe("theo-don-vi-bien", () => {
	test("theo-don-vi-khong-thay: id don vi khong co trong cay noi ro, khong the rong ten, ve goc duoc", async () => {
		const s = await mo("bp:bp-da-luu-tru");
		const truoc = {
			khongThay:
				s.o.querySelector('[data-trang-thai="ST-donvi-khongthay"]') !== null,
			theDonVi: s.o.querySelector("[data-don-vi]"),
			cay: s.o.querySelectorAll("[data-nut-cay]").length,
		};
		const nutVe = [...s.o.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.khongThay.action,
		);
		await act(async () => {
			nutVe?.click();
		});
		await cho(() => s.o.querySelector("[data-don-vi]") !== null, "ve goc");
		expect({
			truoc,
			sau: s.o.querySelector("[data-don-vi]")?.getAttribute("data-don-vi"),
		}).toEqual({
			truoc: { khongThay: true, theDonVi: null, cay: 6 },
			sau: "goc",
		});
	});

	test("theo-don-vi-hang-nut: hang nut nam ngoai dau the va xuong dong duoc, khong o CardAction", async () => {
		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [{ ...mucTieu("a", 1), expected: 0 }],
			canEdit: true,
		});
		const s = await mo("pb:pb-1");
		const hang = s.o.querySelector("[data-hang-nut]");
		expect({
			wrap: hang?.classList.contains("flex-wrap"),
			trongDau: hang?.closest('[data-slot="card-header"]') !== null,
			cardAction: s.o.querySelectorAll(
				'[data-don-vi] [data-slot="card-action"]',
			).length,
			nut: hang?.querySelectorAll("button").length,
			tinhTrang: s.o.querySelector("[data-tinh-trang]")?.textContent,
		}).toEqual({
			wrap: true,
			trongDau: false,
			cardAction: 0,
			nut: 6,
			tinhTrang: "Chưa có kỳ vọng",
		});
	});
});

describe("thanh-tab", () => {
	test("thanh-tab: tab dang chon theo duong, ba lien ket giu kyOkr, tieu de theo tab", async () => {
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		await act(async () => {
			root.render(
				<NuqsTestingAdapter searchParams="?kyOkr=q3&donOkr=pb:pb-1">
					<LocaleProvider locale="vi">
						<DauTrangOkr chonChuKy={null} />
					</LocaleProvider>
				</NuqsTestingAdapter>,
			);
		});
		dangMo.push({ o, root });
		const tab = [...o.querySelectorAll('[role="tab"]')];
		expect({
			tieuDe: o.querySelector("h1")?.textContent,
			lienKet: tab.map((t) => t.getAttribute("href")),
			dangChon: tab.map((t) => t.getAttribute("aria-selected")),
		}).toEqual({
			tieuDe: m.tieuDe["theo-don-vi"],
			lienKet: [
				"/ws/okr?kyOkr=q3",
				"/ws/okr/cap-nhat-tuan?kyOkr=q3",
				"/ws/okr/theo-don-vi?kyOkr=q3",
				"/ws/okr/toan-canh?kyOkr=q3",
			],
			dangChon: ["false", "false", "true", "false"],
		});
	});
});
