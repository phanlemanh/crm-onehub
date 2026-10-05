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
		moTa: "",
		position: 0,
		divisionId,
		head,
		stepCount: 0,
		okrMo: 0,
		people: head ? [{ ...head, primary: true }] : [],
	});
	return {
		divisions: [
			{
				id: "bp-kd",
				name: "Kinh doanh",
				moTa: "",
				position: 0,
				head: LAN,
				okrMo: 0,
				departments: [pb("pb-1", "Kinh doanh vùng 1", "bp-kd", HUNG)],
			},
			{
				id: "bp-vh",
				name: "Vận hành",
				moTa: "",
				position: 1,
				head: null,
				okrMo: 0,
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
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: {
		suaMoiO: false,
		suaTen: false,
		go: false,
		an: false,
		hienLai: false,
	},
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
		doCanh: false,
		soMay: null,
		nguonMay: null,
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
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
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
		hienThi: "cong-khai",
		soNguoiXem: 0,
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
let treo: Set<string> = new Set();
let hoan: Map<string, { cho: Promise<void>; giai: () => void }> = new Map();
const docDanhSach = (vao: DauVao) => {
	if (treo.has(khoaDonVao(vao))) return new Promise<never>(() => {});
	const h = hoan.get(khoaDonVao(vao));
	if (h) return h.cho.then(() => danhSachCua(vao));
	return danhSachCua(vao);
};
const danhSachCua = (vao: DauVao) => {
	const d = theoDon.get(khoaDonVao(vao)) ?? { objectives: [], canEdit: false };
	return {
		rows: d.objectives.map((o) => ({ ...o, krKhop: [] })),
		total: d.objectives.length,
		facetCounts: { phuTrach: [], loai: [], trangThai: [] },
		canEdit: d.canEdit,
		canCreate: d.canEdit,
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
			soanSanSang: thuTuc("soanSanSang", () => ({
				bat: false,
				lyDo: "don-vi-chua-bat",
			})),
			soanMo: {
				mutationOptions: () => ({ mutationFn: async () => null }),
			},
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
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { okrGioiHanMessages } = await import("@/lib/messages/okr-gioi-han");

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
		const khoa = JSON.stringify(unit);
		if (!treo.has(khoa) && !hoan.has(khoa))
			client.setQueryData(
				["danhSach", { cycleId, unit, loc: LOC_RONG }],
				danhSachCua({ cycleId, unit, loc: LOC_RONG }),
			);
		if (xem === "cay")
			client.setQueryData(["cayCanChinh", { cycleId }], docCayCanChinh());
	}
}

async function mo(
	don = "goc",
	xem: string | null = null,
	doiXong = true,
): Promise<San> {
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
						<TooltipProvider>
							<TheoDonVi />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	if (doiXong) await cho(() => !o.textContent?.includes(m.dangTai), "tai xong");
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
	treo = new Set();
	hoan = new Map();
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
			nut: 7,
			tinhTrang: "Chưa có kỳ vọng",
		});
	});
});

describe("thanh-tab", () => {
	test("thanh-tab: tab dang chon theo duong, nam lien ket giu kyOkr, tieu de theo tab", async () => {
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
				"/ws/okr/hoi-y?kyOkr=q3",
			],
			dangChon: ["false", "false", "true", "false", "false"],
		});
	});
});

const g = okrGioiHanMessages("vi").nhan;
const goiY = (n: number) =>
	n === 0 ? g.goiYKhongTen : g.goiY.replace("{n}", String(n));

describe("nhan-danh-sach", () => {
	test("nhan-danh-sach: the gioi han o Theo don vi va nut cay mang nhan khoa khong mo hop; the cong khai khong co", async () => {
		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [
				{ ...mucTieu("a", 1), hienThi: "gioi-han", soNguoiXem: 1 },
				{ ...mucTieu("b", 1), hienThi: "gioi-han", soNguoiXem: 0 },
				mucTieu("c", 1),
			],
			canEdit: false,
		});
		const s = await mo("pb:pb-1");
		const nhanCua = (id: string) =>
			[
				...s.o.querySelectorAll(`[data-muc-tieu="${id}"] [data-nhan-gioi-han]`),
			].map((n) => ({
				chu: n.textContent,
				ten: n.getAttribute("aria-label"),
				moHop: n.getAttribute("aria-haspopup"),
				the: n.tagName,
			}));
		expect({ a: nhanCua("a"), b: nhanCua("b"), c: nhanCua("c") }).toEqual({
			a: [
				{
					chu: g.gioiHan,
					ten: `${g.gioiHan}: ${goiY(1)}`,
					moHop: null,
					the: "SPAN",
				},
			],
			b: [
				{
					chu: g.gioiHan,
					ten: `${g.gioiHan}: ${goiY(0)}`,
					moHop: null,
					the: "SPAN",
				},
			],
			c: [],
		});
		await act(async () => s.root.unmount());
		dangMo = dangMo.filter((x) => x !== s);
		cayCanChinh = {
			roots: [
				{ ...nut("o", "muc-tieu", []), hienThi: "gioi-han", soNguoiXem: 2 },
			],
			chuaCanChinh: [nut("x", "muc-tieu", [])],
		};
		const c = await mo("goc", "cay");
		const nhanCay = (id: string) =>
			[
				...c.o.querySelectorAll(
					`[data-nut-can-chinh="${id}"] [data-nhan-gioi-han]`,
				),
			].map((n) => [n.getAttribute("aria-label"), n.getAttribute("tabindex")]);
		expect({ o: nhanCay("o"), x: nhanCay("x") }).toEqual({
			o: [[`${g.gioiHan}: ${goiY(2)}`, null]],
			x: [],
		});
	});
});

describe("khung-xuong", () => {
	const DANG_TAI = m.dangTai;
	const RONG = "chưa đặt OKR";
	const giuLai = (don: string) => {
		let giai = () => {};
		const cho = new Promise<void>((r) => {
			giai = r;
		});
		hoan.set(JSON.stringify(donVao(don)), { cho, giai });
		return async () => {
			await act(async () => {
				giai();
				await cho;
			});
		};
	};
	const doc = (o: HTMLElement) => ({
		busy: o.querySelector('[aria-busy="true"]') !== null,
		dangTai:
			o.querySelector('[aria-busy="true"] [role="status"]')?.textContent ??
			null,
		rong: (o.textContent ?? "").includes(RONG),
		the: [...o.querySelectorAll("[data-muc-tieu]")].map((k) =>
			k.getAttribute("data-muc-tieu"),
		),
	});
	const sangKho = async (o: HTMLElement) => {
		const nut = [...o.querySelectorAll('[role="treeitem"]')].find((n) =>
			n.textContent?.includes("Kho vận"),
		);
		if (!nut) throw new Error("khong thay don vi Kho van");
		await act(async () => {
			(nut.querySelector("button") ?? (nut as HTMLElement)).click();
		});
		await cho(
			() => (o.textContent ?? "").includes("Kho vận"),
			"doi sang Kho van",
		);
	};
	const hai = [
		{ ...mucTieu("k1", 1), unitId: "pb-kho", unitName: "Kho vận" },
		{ ...mucTieu("k2", 1), unitId: "pb-kho", unitName: "Kho vận" },
	];

	test("khung-xuong: ba ca viet truoc — lan dau treo roi giai rong; giu cho du lieu rong cua X roi giai 2 muc tieu; giu cho du lieu co the cua X — dang cho thi khung xuong, khong the cua X, khong cau chua dat OKR", async () => {
		const ra: Record<string, ReturnType<typeof doc> | string> = {};

		const giaiLanDau = giuLai("pb:pb-kho");
		const s1 = await mo("pb:pb-kho", null, false);
		ra.lanDau = doc(s1.o);
		await giaiLanDau();
		await cho(() => !doc(s1.o).busy, "lan dau giai xong");
		ra.lanDauGiai = doc(s1.o);
		await act(async () => s1.root.unmount());
		s1.o.remove();
		dangMo = dangMo.filter((x) => x !== s1);
		hoan = new Map();

		const s2 = await mo("pb:pb-1");
		ra.xRongTruoc = doc(s2.o);
		const giaiY = giuLai("pb:pb-kho");
		theoDon.set(JSON.stringify(donVao("pb:pb-kho")), {
			objectives: hai,
			canEdit: false,
		});
		await sangKho(s2.o);
		ra.xRongCho = doc(s2.o);
		await giaiY();
		await cho(() => !doc(s2.o).busy, "Y giai xong");
		ra.xRongGiai = doc(s2.o);
		await act(async () => s2.root.unmount());
		s2.o.remove();
		dangMo = dangMo.filter((x) => x !== s2);
		hoan = new Map();
		theoDon.delete(JSON.stringify(donVao("pb:pb-kho")));

		theoDon.set(JSON.stringify(donVao("pb:pb-1")), {
			objectives: [mucTieu("x1", 1), mucTieu("x2", 1)],
			canEdit: false,
		});
		const s3 = await mo("pb:pb-1");
		ra.xCoTheTruoc = doc(s3.o);
		giuLai("pb:pb-kho");
		await sangKho(s3.o);
		const cho3 = doc(s3.o);
		ra.xCoTheCho =
			cho3.the.length > 0
				? `hien du lieu don vi truoc khi dang tai: ${cho3.the.join(",")}`
				: cho3;

		const dangCho = { busy: true, dangTai: DANG_TAI, rong: false, the: [] };
		expect(ra).toEqual({
			lanDau: dangCho,
			lanDauGiai: { busy: false, dangTai: null, rong: true, the: [] },
			xRongTruoc: { busy: false, dangTai: null, rong: true, the: [] },
			xRongCho: dangCho,
			xRongGiai: { busy: false, dangTai: null, rong: false, the: ["k1", "k2"] },
			xCoTheTruoc: {
				busy: false,
				dangTai: null,
				rong: false,
				the: ["x1", "x2"],
			},
			xCoTheCho: dangCho,
		});
	});
});
