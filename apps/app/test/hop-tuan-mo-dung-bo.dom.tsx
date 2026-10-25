import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
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
import { cyclesOutput, okrAccessOutput } from "../../api/src/okr/okr.contracts";
import { hoiYNhanOutput } from "../../api/src/okr/okr-hoi-y.contracts";
import {
	danhSachBoOutput,
	danhSachOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const LAN = { id: "U1", name: "Nguyễn Thị Lan", email: "u1@onehub.vn" };

const CHU_KY = cyclesOutput.parse({
	cycles: [
		{
			id: "q4",
			kind: "quy",
			name: "Quý 4/2026",
			parentId: null,
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
		},
	],
	currentId: "q4",
});

const phongBan = (id: string, name: string, divisionId: string | null) => ({
	id,
	name,
	moTa: "",
	position: 0,
	divisionId,
	head: LAN,
	stepCount: 0,
	okrMo: 0,
	people: [{ ...LAN, primary: true }],
});

const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "B",
			name: "Khối Vận hành",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [phongBan("P", "Phòng Kế toán", "B")],
		},
	],
	chuaXep: [phongBan("X", "Phòng Pháp chế", null)],
	chuaCoPhongBan: [],
	people: [
		{
			...LAN,
			primaryDepartmentId: "P",
			secondaryDepartmentIds: [],
			managerOverrideId: null,
			manager: null,
			managerSource: "khong-co",
			chucDanh: "",
		},
	],
	archived: { divisions: [], departments: [] },
	coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
});

const QUYEN = okrAccessOutput.parse({
	canManageProgram: false,
	headOf: { divisions: [], departments: ["P"] },
});

const NHAN_Y_KIEN = hoiYNhanOutput.parse({
	coHoiY: false,
	trangThai: null,
	canGop: false,
	soChuDeChuaKetLuan: 0,
});

const hangBo = (
	don: string,
	ten: string,
	cap: "goc" | "bo-phan" | "phong-ban",
	toiDan: boolean,
) => ({
	don,
	ten,
	cap,
	cha: cap === "goc" ? null : "goc",
	truong: { id: LAN.id, name: LAN.name },
	soMucTieu: 2,
	tienDo: 40,
	tuTinThap: 0,
	toiDan,
	dangTheoDoi: false,
});

const DANH_SACH_BO = danhSachBoOutput.parse({
	hang: [
		hangBo("goc", "OneHub", "goc", false),
		hangBo("bp:B", "Khối Vận hành", "bo-phan", false),
		hangBo("pb:P", "Phòng Kế toán", "phong-ban", true),
		hangBo("pb:X", "Phòng Pháp chế", "phong-ban", false),
	],
});

const DANH_SACH = danhSachOutput.parse({
	rows: [],
	daBo: [],
	total: 0,
	facetCounts: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
	canEdit: false,
	canCreate: false,
});

const TREO_MAI = () => new Promise<never>(() => {});

type DauVao = { readonly cycleId?: string };

function thuTuc<TRa>(ten: string, doc: () => TRa | Promise<TRa>) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: { queryKey: [ten, vao ?? null], queryFn: async () => doc() },
		mutationOptions: () => ({ mutationFn: async () => null }),
		mutationKey: () => [ten],
	};
}

const OKR_GIA = {
	cycles: thuTuc("cycles", () => CHU_KY),
	access: thuTuc("access", () => QUYEN),
	hoiYNhan: thuTuc("hoiYNhan", () => NHAN_Y_KIEN),
	danhSachBo: thuTuc("danhSachBo", () => DANH_SACH_BO),
	danhSach: thuTuc("danhSach", () => DANH_SACH),
};
const okrGia = new Proxy(OKR_GIA, {
	get: (dich, ten: string) =>
		ten in dich ? dich[ten as keyof typeof OKR_GIA] : thuTuc(ten, TREO_MAI),
});

const dinhVi = { duong: "/ws/okr" };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", () => CAY) },
		workspace: { get: thuTuc("workspace", () => ({ name: "OneHub" })) },
		okr: okrGia,
	}),
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => dinhVi.duong,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		prefetch: _prefetch,
		transitionTypes: _transitionTypes,
		...props
	}: ComponentProps<"a"> & {
		children?: ReactNode;
		prefetch?: boolean;
		transitionTypes?: string[];
	}) => h("a", props, children),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { ThanhBenMucTieu } = await import(
	"@/app/(app)/[slug]/okr/thanh-ben-muc-tieu"
);
const { DanhSachBo } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo"
);
const { TheConBo } = await import("@/app/(app)/[slug]/okr/theo-don-vi/the-con");
const { PhanDonViDan } = await import("@/app/(app)/[slug]/okr/phan-don-vi-dan");
const { parseAsDonOkr } = await import(
	"@/app/(app)/[slug]/okr/okr-search-params"
);
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");

const voKhu = okrVoKhuMessages("vi");
const CHU_HOP_TUAN = okrToanCanhMessages("vi").hopTuan.cachXem;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

beforeAll(() => {
	window.HTMLElement.prototype.scrollIntoView = () => {};
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function ve(cay: ReactNode, duongDayDu: string): Promise<San> {
	const [duong = "", tham = ""] = duongDayDu.split("?");
	dinhVi.duong = duong;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={tham ? `?${tham}` : ""}>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{cay}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	return san;
}

async function go(san: San) {
	await act(async () => san.root.unmount());
	san.o.remove();
	dangMo = dangMo.filter((x) => x !== san);
}

async function goHet() {
	for (const san of [...dangMo]) await go(san);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 300)}`,
	);
}

const URL_THANH_BEN = [
	"/ws/okr",
	"/ws/okr/bo-okr?kyOkr=q4",
	"/ws/okr/bo-okr?donOkr=pb:X&xemOkr=hop-tuan",
] as const;

function nhomOkr(aside: Element): Element | undefined {
	return [...aside.querySelectorAll("[data-slot=nav-group]")].find(
		(g) =>
			g.querySelector("[data-slot=nav-group-label]")?.textContent ===
			voKhu.nhom.okr,
	);
}

function kiemThanhBen(aside: Element, url: string) {
	const loi = (s: string) => `htmb-thanh-ben: ${url} ${s}`;
	phai(
		!(aside.textContent ?? "").includes(CHU_HOP_TUAN),
		"htmb-thanh-ben: thanh ben co muc Hop tuan",
	);
	const href = [...aside.querySelectorAll("a[href]")].map(
		(a) => a.getAttribute("href") ?? "",
	);
	const coXem = href.filter((x) => x.includes("xemOkr"));
	phai(coXem.length === 0, loi(`href mang xemOkr: ${coXem.join(", ")}`));
	const nhom = nhomOkr(aside);
	phai(nhom !== undefined, loi("khong co nhom OKR"));
	const muc = [...(nhom?.querySelectorAll("[data-slot=nav-item]") ?? [])].map(
		(x) => x.textContent ?? "",
	);
	const mong = [voKhu.muc.boOkr, voKhu.muc.layYKien];
	phai(
		JSON.stringify(muc) === JSON.stringify(mong),
		loi(`nhom OKR «${muc.join(" · ")}», mong «${mong.join(" · ")}»`),
	);
}

async function moThanhBen(url: string): Promise<Element> {
	const s = await ve(<ThanhBenMucTieu />, url);
	await cho(
		() =>
			(s.o
				.querySelector("aside[data-slot=area-sidebar]")
				?.querySelectorAll("a[href]").length ?? 0) > 0,
		`htmb-thanh-ben: ${url} thanh ben co muc`,
	);
	const aside = s.o.querySelector("aside[data-slot=area-sidebar]");
	if (!aside) throw new Error(`htmb-thanh-ben: ${url} khong co thanh ben`);
	return aside;
}

function docHref(href: string) {
	const u = new URL(href, "http://x");
	return {
		duong: u.pathname,
		don: u.searchParams.get("donOkr"),
		ky: u.searchParams.get("kyOkr"),
		xem: u.searchParams.get("xemOkr"),
	};
}

async function hrefHopTuanCuaBo(hrefBo: string, nguon: string) {
	const loi = (s: string) => `htmb-duong-vao: ${nguon} ${s}`;
	const vao = docHref(hrefBo);
	phai(vao.duong === "/ws/okr/bo-okr", loi(`sai duong ${vao.duong}`));
	phai(vao.don === "pb:P", loi(`href bo mang donOkr=${vao.don}, can pb:P`));
	phai(vao.ky === "q4", loi(`href bo mang kyOkr=${vao.ky}, can q4`));
	const don = parseAsDonOkr.parse(vao.don ?? "");
	if (!don) throw new Error(loi(`donOkr «${vao.don}» khong parse duoc`));
	const s = await ve(
		<TheConBo coCham={false} don={don} ky={vao.ky} xem="danh-sach" />,
		`/ws/okr/bo-okr?${new URL(hrefBo, "http://x").searchParams}`,
	);
	const the = s.o.querySelector('[data-the-con-bo] a[data-the="hop-tuan"]');
	phai(the !== null, loi("khong co the Hop tuan"));
	phai(
		the?.textContent === CHU_HOP_TUAN,
		loi(`the hop-tuan ghi «${the?.textContent}»`),
	);
	const ra = docHref(the?.getAttribute("href") ?? "");
	phai(ra.don !== null, "htmb-duong-vao: the con mat donOkr");
	phai(ra.don === "pb:P", loi(`the con mang donOkr=${ra.don}, can pb:P`));
	phai(ra.xem === "hop-tuan", loi(`the con mang xemOkr=${ra.xem}`));
	phai(ra.ky === "q4", loi(`the con mang kyOkr=${ra.ky}, can q4`));
	phai(ra.duong === "/ws/okr/bo-okr", loi(`the con sai duong ${ra.duong}`));
	await go(s);
}

async function hrefTuDanhSachBo(): Promise<string> {
	const s = await ve(
		<DanhSachBo />,
		"/ws/okr/bo-okr?kyOkr=q4&phamViBo=toi-dan",
	);
	await cho(
		() => s.o.querySelector("[data-bo]") !== null,
		"htmb-duong-vao: danh sach bo co hang",
	);
	const bo = new Set(
		[...s.o.querySelectorAll("[data-bo]")].map((x) =>
			x.getAttribute("data-bo"),
		),
	);
	phai(
		bo.size === 1 && bo.has("pb:P"),
		`htmb-duong-vao: loc toi-dan liet «${[...bo].join(", ")}», mong «pb:P»`,
	);
	const href = [
		...s.o.querySelectorAll('[data-bo="pb:P"] a[href], a[data-bo="pb:P"]'),
	]
		.map((a) => a.getAttribute("href") ?? "")
		.filter(Boolean);
	phai(href.length > 0, "htmb-duong-vao: hang bo P khong co lien ket");
	phai(
		new Set(href).size === 1,
		`htmb-duong-vao: hang bo P co hai href ${href.join(", ")}`,
	);
	await go(s);
	return href[0] ?? "";
}

async function hrefTuDonViDan(): Promise<string> {
	const s = await ve(
		<PhanDonViDan cycleId="q4" ky="q4" tenKy="Quý 4/2026" />,
		"/ws/okr?kyOkr=q4",
	);
	const chon = '[data-don-vi-dan="pb:P"] a[data-nut="mo-don-vi"]';
	await cho(
		() => s.o.querySelector(chon) !== null,
		"htmb-duong-vao: don vi ban dan co the P",
	);
	const the = [...s.o.querySelectorAll("[data-don-vi-dan]")].map((x) =>
		x.getAttribute("data-don-vi-dan"),
	);
	phai(
		JSON.stringify(the) === JSON.stringify(["pb:P"]),
		`htmb-duong-vao: don vi ban dan «${the.join(", ")}», mong «pb:P»`,
	);
	const href = s.o.querySelector(chon)?.getAttribute("href") ?? "";
	await go(s);
	return href;
}

describe("htmb-thanh-ben", () => {
	test("ba URL viet truoc: nhom OKR dung «Bo OKR», «Lay y kien»; khong muc Hop tuan; khong href mang xemOkr", async () => {
		let dem = 0;
		for (const url of URL_THANH_BEN) {
			const aside = await moThanhBen(url);
			kiemThanhBen(aside, url);
			dem += 1;
			await goHet();
		}
		expect(dem).toBe(3);
	});

	test("doi chung duong: o URL thu ba «Bo OKR» mang aria-current=page", async () => {
		const url = URL_THANH_BEN[2];
		const aside = await moThanhBen(url);
		const sang = [...aside.querySelectorAll('[aria-current="page"]')];
		const nhan = sang.map((x) => x.textContent ?? "");
		phai(
			sang.length === 1 && nhan[0] === voKhu.muc.boOkr,
			`htmb-thanh-ben: ${url} muc sang «${nhan.join(" · ")}», mong «${voKhu.muc.boOkr}»`,
		);
		const href = new URL(sang[0]?.getAttribute("href") ?? "", "http://x");
		expect(href.pathname).toBe("/ws/okr/bo-okr");
	});

	describe("htmb-duong-vao", () => {
		test("hai duong viet truoc toi the Hop tuan cua bo P", async () => {
			const DUONG = [
				["danh-sach-bo toi-dan", hrefTuDanhSachBo],
				["don vi ban dan", hrefTuDonViDan],
			] as const;
			let dem = 0;
			for (const [nguon, lay] of DUONG) {
				await hrefHopTuanCuaBo(await lay(), nguon);
				dem += 1;
			}
			expect(dem).toBe(2);
		});
	});
});
