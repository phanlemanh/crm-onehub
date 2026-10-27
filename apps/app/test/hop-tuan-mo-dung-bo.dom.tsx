import {
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
	hopTuanOutput,
	toanCanhOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

type CyclesOutput = ReturnType<typeof cyclesOutput.parse>;
type OrgTreeOutput = ReturnType<typeof orgTreeOutput.parse>;
type HopTuanOutput = ReturnType<typeof hopTuanOutput.parse>;
type ToanCanhOutput = ReturnType<typeof toanCanhOutput.parse>;

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

const daGoi = new Map<string, number>();

function thuTuc<TRa>(ten: string, doc: () => TRa | Promise<TRa>) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: {
						queryKey: [ten, vao ?? null],
						queryFn: async () => {
							daGoi.set(ten, (daGoi.get(ten) ?? 0) + 1);
							return doc();
						},
					},
		mutationOptions: () => ({ mutationFn: async () => null }),
		mutationKey: () => [ten],
	};
}

type GiaHop = {
	chuKy: CyclesOutput;
	cay: OrgTreeOutput;
	hopTuan: () => HopTuanOutput | Promise<HopTuanOutput>;
	toanCanh: () => ToanCanhOutput | Promise<ToanCanhOutput>;
};

const giaMacDinh = (): GiaHop => ({
	chuKy: CHU_KY,
	cay: CAY,
	hopTuan: TREO_MAI,
	toanCanh: TREO_MAI,
});

let gia: GiaHop = giaMacDinh();

const OKR_GIA = {
	cycles: thuTuc("cycles", () => gia.chuKy),
	access: thuTuc("access", () => QUYEN),
	hoiYNhan: thuTuc("hoiYNhan", () => NHAN_Y_KIEN),
	danhSachBo: thuTuc("danhSachBo", () => DANH_SACH_BO),
	danhSach: thuTuc("danhSach", () => DANH_SACH),
	hopTuan: thuTuc("hopTuan", () => gia.hopTuan()),
	toanCanh: thuTuc("toanCanh", () => gia.toanCanh()),
};
const okrGia = new Proxy(OKR_GIA, {
	get: (dich, ten: string) =>
		ten in dich ? dich[ten as keyof typeof OKR_GIA] : thuTuc(ten, TREO_MAI),
});

const dinhVi = { duong: "/ws/okr" };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", () => gia.cay) },
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

const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { lyDoRong } = await import("@/app/(app)/[slug]/okr/ly-do-rong");
const { okrHopTuanBoMessages } = await import("@/lib/messages/okr-hop-tuan-bo");

const voKhu = okrVoKhuMessages("vi");
const CHU_HOP_TUAN = okrToanCanhMessages("vi").hopTuan.cachXem;
const mtc = okrToanCanhMessages("vi");
const mhb = okrHopTuanBoMessages("vi");

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
	gia = giaMacDinh();
	daGoi.clear();
	setSystemTime();
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

const dongHop = (
	id: string,
	tuTin: "cao" | "vua" | "thap" | null,
	coLyDo: boolean,
) => ({
	keyResultId: id,
	objectiveId: `mt-${id}`,
	tieuDe: `KR ${id}`,
	mucTieu: "Mục tiêu chung",
	chuTen: LAN.name,
	progress: 40,
	expected: 50,
	laMoc: false,
	tuTin,
	ghiChu: null,
	lyDo: coLyDo ? [{ loai: "ghi-chu", ngay: "2026-11-09" }] : [],
});

const HOP_CO_SO = hopTuanOutput.parse({
	tuan: "2026-11-09",
	tuanDau: false,
	daCapNhat: 3,
	tongKr: 5,
	dangBan: [dongHop("k1", "thap", true), dongHop("k2", "vua", true)],
	conLai: [
		dongHop("k3", "thap", false),
		dongHop("k4", null, false),
		dongHop("k5", "cao", false),
	],
});

const HOP_RONG = hopTuanOutput.parse({
	tuan: "2026-11-09",
	tuanDau: true,
	daCapNhat: 0,
	tongKr: 0,
	dangBan: [],
	conLai: [],
});

const HOM_NAY_VN = new Date("2026-11-12T03:00:00Z");

function chuKyVoi(thay: { phase?: string; startsOn?: string }): CyclesOutput {
	const goc = CHU_KY.cycles[0];
	if (!goc) throw new Error("thieu chu ky mau");
	return cyclesOutput.parse({
		cycles: [{ ...goc, ...thay }],
		currentId: goc.id,
	});
}

const TEN_KY = CHU_KY.cycles[0]?.name ?? "";

function chu(o: Element | null | undefined): string {
	return o?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function hangSo(): Element[] {
	return [...document.body.querySelectorAll("[data-hang-so-hop]")];
}

function docO(the: Element) {
	return {
		nhan: chu(the.children[0]),
		giaTri: chu(the.children[1]?.firstElementChild),
		moTa: chu(the.querySelector("p")),
	};
}

async function nhip(lan = 5) {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

function trangThai(id: string): Element | null {
	return document.body.querySelector(`[data-trang-thai="${id}"]`);
}

async function bamThuLai(id: string) {
	const nut = trangThai(id)?.querySelector("button");
	if (!nut) throw new Error(`${id} khong co nut Thu lai`);
	await act(async () => (nut as HTMLButtonElement).click());
	await nhip();
}

describe("htmb-hang-so", () => {
	test("HopTuan co du lieu: dung mot hang bon o theo thu tu, dung truoc khoi tom tat va bang, khong con [data-tom-tat-hop]", async () => {
		setSystemTime(HOM_NAY_VN);
		gia.hopTuan = () => HOP_CO_SO;
		await ve(
			<HopTuan cycleId="q4" unit={{ loai: "pb", id: "P" }} />,
			"/ws/okr/bo-okr?donOkr=pb:P&xemOkr=hop-tuan&kyOkr=q4",
		);
		await cho(
			() => trangThai("ST-hoptuan-codulieu") !== null,
			"htmb-hang-so: bang co du lieu",
		);
		const hang = hangSo();
		phai(hang.length === 1, `htmb-hang-so: ${hang.length} hang so, can 1`);
		const the = [
			...(hang[0]?.querySelectorAll('[data-slot="stat-card"]') ?? []),
		];
		phai(the.length === 4, `htmb-hang-so: ${the.length} o, can 4`);
		const o = the.map(docO);
		const MONG = [
			{ nhan: mhb.hangSo.daCapNhat, giaTri: "3/5", ten: "da cap nhat" },
			{ nhan: mhb.hangSo.dangBan, giaTri: "2", ten: "dang ban" },
			{ nhan: mhb.hangSo.tuTinThap, giaTri: "2", ten: "tu tin thap" },
			{ nhan: mhb.hangSo.ngayCon, giaTri: "50", ten: "ngay con" },
		];
		let dem = 0;
		for (const [i, mong] of MONG.entries()) {
			const thay = o[i];
			phai(
				thay?.nhan === mong.nhan,
				`htmb-hang-so: o ${i + 1} nhan «${thay?.nhan}», can «${mong.nhan}»`,
			);
			phai(
				thay?.giaTri === mong.giaTri,
				`htmb-hang-so: ${mong.ten} ${thay?.giaTri}, can ${mong.giaTri}`,
			);
			dem += 1;
		}
		phai(
			o[0]?.moTa.includes("09/11") === true,
			`htmb-hang-so: mo ta da cap nhat «${o[0]?.moTa}» thieu 09/11`,
		);
		const truoc = (dich: Element | null) =>
			dich !== null &&
			((hang[0]?.compareDocumentPosition(dich) ?? 0) &
				Node.DOCUMENT_POSITION_FOLLOWING) !==
				0;
		phai(
			truoc(trangThai("ST-hoptuan-codulieu")),
			"htmb-hang-so: hang so khong dung truoc bang",
		);
		const khoi = document.body.querySelector('[data-khoi="tom-tat"]');
		if (khoi)
			phai(truoc(khoi), "htmb-hang-so: hang so khong dung truoc khoi tom tat");
		phai(
			document.body.querySelector("[data-tom-tat-hop]") === null,
			"htmb-hang-so: con [data-tom-tat-hop]",
		);
		expect(dem).toBe(4);
	});
});

describe("htmb-hang-so-the-khac", () => {
	const URL_BO = "/ws/okr/bo-okr?donOkr=pb:P&kyOkr=q4";

	test("TheoDonVi o the danh-sach, viec, cay: khong [data-hang-so-hop]", async () => {
		setSystemTime(HOM_NAY_VN);
		gia.hopTuan = () => HOP_CO_SO;
		let dem = 0;
		for (const xem of ["danh-sach", "viec", "cay"] as const) {
			await ve(<TheoDonVi />, `${URL_BO}&xemOkr=${xem}`);
			await cho(
				() => document.body.querySelector("[data-the-con-bo]") !== null,
				`htmb-hang-so-the-khac: ${xem} co the con`,
			);
			await nhip(10);
			phai(
				hangSo().length === 0,
				`htmb-hang-so-the-khac: the ${xem} co [data-hang-so-hop]`,
			);
			dem += 1;
			await goHet();
		}
		expect(dem).toBe(3);
	});

	test("doi chung: the hop-tuan co [data-hang-so-hop]", async () => {
		setSystemTime(HOM_NAY_VN);
		gia.hopTuan = () => HOP_CO_SO;
		await ve(<TheoDonVi />, `${URL_BO}&xemOkr=hop-tuan`);
		await cho(
			() => trangThai("ST-hoptuan-codulieu") !== null,
			"htmb-hang-so-the-khac: hop-tuan co bang",
		);
		expect(hangSo().length).toBe(1);
	});
});

const CAY_KR = orgTreeOutput.parse({
	divisions: [
		{
			id: "B",
			name: "B",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [phongBan("P", "P", "B")],
		},
		{
			id: "B2",
			name: "Khối Hậu cần",
			moTa: "",
			position: 1,
			head: null,
			okrMo: 0,
			departments: [phongBan("P2", "Phòng Kho", "B2")],
		},
		{
			id: "B3",
			name: "B3",
			moTa: "",
			position: 2,
			head: null,
			okrMo: 0,
			departments: [phongBan("P3", "P3", "B3")],
		},
	],
	chuaXep: [phongBan("X", "X", null), phongBan("Q", "Q", null)],
	chuaCoPhongBan: [],
	people: CAY.people,
	archived: { divisions: [], departments: [] },
	coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
});

const FIXTURE_TOAN_CANH = toanCanhOutput.parse(
	JSON.parse(
		readFileSync(
			join(
				import.meta.dir,
				"..",
				"..",
				"api",
				"test",
				"fixtures",
				"htmb-toan-canh.json",
			),
			"utf8",
		),
	),
);

function toanCanhCay(): ToanCanhOutput {
	const mau = (khoa: string) => {
		const h = FIXTURE_TOAN_CANH.hang.find((x) => x.key === khoa);
		if (!h) throw new Error(`htmb-chua-kr: fixture thieu hang ${khoa}`);
		return h;
	};
	const boPhan = mau("bp:B");
	const phong = mau("pb:X");
	const them = [
		{ ...boPhan, key: "bp:B2", ten: "Khối Hậu cần", soKr: 0, daCapNhat: 0 },
		{ ...phong, key: "pb:P2", ten: "Phòng Kho", soKr: 0, daCapNhat: 0 },
		{ ...boPhan, key: "bp:B3", ten: "B3", soKr: 2, daCapNhat: 0 },
		{ ...phong, key: "pb:P3", ten: "P3", soKr: 2, daCapNhat: 0 },
	];
	const viTri = FIXTURE_TOAN_CANH.hang.findIndex((x) => x.key === "pb:P") + 1;
	return toanCanhOutput.parse({
		...FIXTURE_TOAN_CANH,
		hang: [
			...FIXTURE_TOAN_CANH.hang.slice(0, viTri),
			...them,
			...FIXTURE_TOAN_CANH.hang.slice(viTri),
		],
	});
}

function toanCanhRong(): ToanCanhOutput {
	const tc = toanCanhCay();
	return toanCanhOutput.parse({
		...tc,
		hang: tc.hang.map((h) => ({ ...h, soKr: 0, daCapNhat: 0 })),
	});
}

type DonHop = Parameters<typeof HopTuan>[0]["unit"];

async function moChuaKr(unit: DonHop, tenBo: string) {
	const khoa = unit.loai === "goc" ? "goc" : `${unit.loai}:${unit.id}`;
	await ve(
		<HopTuan cycleId="q4" unit={unit} />,
		`/ws/okr/bo-okr?donOkr=${khoa}&xemOkr=hop-tuan&kyOkr=q4`,
	);
	await cho(
		() =>
			chu(
				trangThai("ST-hoptuan-chua-kr")?.querySelector("[data-cau-ly-do]"),
			).startsWith(tenBo) ||
			hangSo().some((h) => h.getAttribute("aria-busy") !== "true") ||
			trangThai("ST-hoptuan-tuandau") !== null,
		`htmb-chua-kr: ${khoa} cau ly do`,
	);
}

function kiemChungChuaKr(o: string, tenBo: string) {
	const loi = (s: string) => `htmb-chua-kr: ${o} ${s}`;
	const toan = document.body.textContent ?? "";
	phai(
		!toan.includes(mtc.hopTuan.tuanDau),
		"htmb-chua-kr: bo rong ra cau tuanDau",
	);
	phai(hangSo().length === 0, loi("co [data-hang-so-hop]"));
	phai(!toan.includes("0/0"), loi("co chu 0/0"));
	const cau =
		trangThai("ST-hoptuan-chua-kr")?.querySelector("[data-cau-ly-do]");
	const mong = mhb.rong.chuaKr(tenBo, TEN_KY);
	phai(chu(cau) === mong, loi(`cau «${chu(cau)}», can «${mong}»`));
	const khongDich = [...(cau?.querySelectorAll('[translate="no"]') ?? [])].map(
		(x) => chu(x),
	);
	phai(
		khongDich.includes(tenBo),
		loi(`ten bo «${tenBo}» khong o translate=no`),
	);
	phai(khongDich.includes(TEN_KY), loi("ten chu ky khong o translate=no"));
}

function kiemXemMoiBo(o: string) {
	const loi = (s: string) => `htmb-chua-kr: ${o} ${s}`;
	phai(
		document.body.querySelector("[data-don-vi-co-kr]") === null,
		loi("co danh sach don vi"),
	);
	const lk = [
		...document.body.querySelectorAll('a[data-nut="xem-moi-bo"]'),
	].filter((a) => chu(a) === mhb.donViCoKr.xemMoiBo);
	phai(lk.length === 1, loi(`${lk.length} lien ket Xem moi bo OKR, can 1`));
	const href = docHref(lk[0]?.getAttribute("href") ?? "");
	phai(
		href.duong === "/ws/okr/bo-okr" && href.ky === "q4" && href.don === null,
		loi(`lien ket Xem moi bo OKR «${lk[0]?.getAttribute("href")}»`),
	);
}

const MONG_DONG = [
	{ khoa: "bp:B", ten: "B", dong: mhb.donViCoKr.dong("3", "1") },
	{ khoa: "bp:B3", ten: "B3", dong: mhb.donViCoKr.dong("2", "0") },
	{ khoa: "pb:X", ten: "X", dong: mhb.donViCoKr.dong("1", "0") },
];

function kiemMucDonVi(muc: Element) {
	const k = muc.getAttribute("data-don-vi") ?? "";
	const mong = MONG_DONG.find((x) => x.khoa === k);
	const ten = mong?.ten ?? "";
	const dong = mong?.dong ?? "";
	const tieuDe = muc.querySelector('[data-slot="item-title"]');
	phai(
		chu(tieuDe) === ten && tieuDe?.getAttribute("translate") === "no",
		`htmb-chua-kr: ${k} ten «${chu(tieuDe)}», can «${ten}» trong translate=no`,
	);
	const moTa = chu(muc.querySelector('[data-slot="item-description"]'));
	phai(moTa === dong, `htmb-chua-kr: ${k} dong «${moTa}», can «${dong}»`);
	const href = docHref(muc.getAttribute("href") ?? "");
	phai(
		href.duong === "/ws/okr/bo-okr" &&
			href.don === k &&
			href.xem === "hop-tuan" &&
			href.ky === "q4",
		`htmb-chua-kr: ${k} href «${muc.getAttribute("href")}»`,
	);
}

describe("htmb-chua-kr", () => {
	test("ma tran 4 o: goc liet [B, B3, X]; bp:B2, pb:P va goc moi hang soKr 0 ra lien ket Xem moi bo OKR", async () => {
		setSystemTime(HOM_NAY_VN);
		gia.cay = CAY_KR;
		gia.hopTuan = () => HOP_RONG;
		let dem = 0;

		gia.toanCanh = () => toanCanhCay();
		await moChuaKr({ loai: "goc" }, "OneHub");
		kiemChungChuaKr("goc", "OneHub");
		await cho(
			() => document.body.querySelector("[data-don-vi-co-kr]") !== null,
			"htmb-chua-kr: goc danh sach don vi",
		);
		kiemChungChuaKr("goc", "OneHub");
		const muc = [...document.body.querySelectorAll("[data-don-vi]")];
		const khoa = muc.map((x) => x.getAttribute("data-don-vi") ?? "");
		phai(!khoa.includes("bp:B2"), "htmb-chua-kr: liet don vi soKr 0 (B2)");
		phai(
			JSON.stringify(khoa) === JSON.stringify(["bp:B", "bp:B3", "pb:X"]),
			`htmb-chua-kr: goc liet «${khoa.join(", ")}», can «bp:B, bp:B3, pb:X»`,
		);
		for (const m of muc) kiemMucDonVi(m);
		dem += 1;
		await goHet();
		daGoi.clear();

		const KHAC: [string, DonHop, string][] = [
			["bp:B2", { loai: "bp", id: "B2" }, "Khối Hậu cần"],
			["pb:P", { loai: "pb", id: "P" }, "P"],
		];
		for (const [o, unit, ten] of KHAC) {
			await moChuaKr(unit, ten);
			kiemChungChuaKr(o, ten);
			kiemXemMoiBo(o);
			phai(
				(daGoi.get("toanCanh") ?? 0) === 0,
				`htmb-chua-kr: ${o} goi toanCanh`,
			);
			dem += 1;
			await goHet();
		}

		gia.toanCanh = () => toanCanhRong();
		await moChuaKr({ loai: "goc" }, "OneHub");
		await cho(
			() => document.body.querySelector('a[data-nut="xem-moi-bo"]') !== null,
			"htmb-chua-kr: goc rong lien ket Xem moi bo OKR",
		);
		kiemChungChuaKr("goc moi hang soKr 0", "OneHub");
		kiemXemMoiBo("goc moi hang soKr 0");
		dem += 1;

		expect(dem).toBe(4);
	});
});

type ODo = {
	ten: string;
	chuKy: CyclesOutput;
	homNay: Date;
	hop: HopTuanOutput;
	mong: ReturnType<typeof lyDoRong>;
	trangThai: string;
};

const krChuaCapNhat = (n: number) =>
	Array.from({ length: n }, (_, i) => dongHop(`c${i + 1}`, null, false));

const MA_TRAN_LY_DO: ODo[] = [
	{
		ten: "lap-ke-hoach",
		chuKy: chuKyVoi({ phase: "lap-ke-hoach" }),
		homNay: HOM_NAY_VN,
		hop: HOP_RONG,
		mong: "chu-ky-chua-chay",
		trangThai: "ST-hoptuan-chuky-chua-chay",
	},
	{
		ten: "chua-toi-ngay",
		chuKy: chuKyVoi({ phase: "dang-chay" }),
		homNay: new Date("2026-09-30T16:00:00Z"),
		hop: hopTuanOutput.parse({
			...HOP_RONG,
			tongKr: 3,
			conLai: krChuaCapNhat(3),
		}),
		mong: "chu-ky-chua-chay",
		trangThai: "ST-hoptuan-chuky-chua-chay",
	},
	{
		ten: "chua-kr",
		chuKy: chuKyVoi({ phase: "dang-chay" }),
		homNay: HOM_NAY_VN,
		hop: HOP_RONG,
		mong: "chua-kr-cong-bo",
		trangThai: "ST-hoptuan-chua-kr",
	},
	{
		ten: "chua-ai-cap-nhat",
		chuKy: chuKyVoi({ phase: "dang-chay" }),
		homNay: HOM_NAY_VN,
		hop: hopTuanOutput.parse({
			...HOP_RONG,
			tongKr: 4,
			conLai: krChuaCapNhat(4),
		}),
		mong: "chua-ai-cap-nhat",
		trangThai: "ST-hoptuan-tuandau",
	},
	{
		ten: "co-cap-nhat",
		chuKy: chuKyVoi({ phase: "dang-chay" }),
		homNay: HOM_NAY_VN,
		hop: HOP_CO_SO,
		mong: null,
		trangThai: "ST-hoptuan-codulieu",
	},
];

const NHANH_HOP = [
	"ST-hoptuan-chuky-chua-chay",
	"ST-hoptuan-chua-kr",
	"ST-hoptuan-tuandau",
	"ST-hoptuan-codulieu",
	"ST-hoptuan-yenang",
];

function kiemManLyDo(o: ODo, tenKy: string) {
	const loi = (s: string) => `htmb-ly-do: ${o.ten} ${s}`;
	const toan = document.body.textContent ?? "";
	if (o.mong === "chu-ky-chua-chay") {
		phai(hangSo().length === 0, loi("co hang so"));
		const cau = chu(trangThai(o.trangThai)?.querySelector("[data-cau-ly-do]"));
		const mong = mhb.rong.chuKyChuaChay(tenKy, "01/10");
		phai(cau === mong, loi(`cau «${cau}», can «${mong}»`));
	}
	if (o.mong === "chua-kr-cong-bo") {
		phai(hangSo().length === 0, loi("co hang so"));
		phai(!toan.includes(mtc.hopTuan.tuanDau), loi("co cau tuanDau"));
	}
	if (o.mong === "chua-ai-cap-nhat") {
		const dau = hangSo()[0]?.querySelector('[data-slot="stat-card"]');
		const gt = dau ? docO(dau).giaTri : "";
		phai(gt === "0/4", loi(`hang so ${gt}, can 0/4`));
		phai(toan.includes(mtc.hopTuan.tuanDau), loi("thieu cau tuanDau"));
	}
	if (o.mong === null) {
		phai(hangSo().length === 1, loi("thieu hang so"));
		phai(
			trangThai(o.trangThai)?.querySelector("table") != null,
			loi("thieu bang"),
		);
	}
}

describe("htmb-ly-do", () => {
	test("ma tran 5 o: lyDoRong va man HopTuan dung nhanh", async () => {
		let dem = 0;
		for (const o of MA_TRAN_LY_DO) {
			const loi = (s: string) => `htmb-ly-do: ${o.ten} ${s}`;
			setSystemTime(o.homNay);
			const chuKy = o.chuKy.cycles[0];
			if (!chuKy) throw new Error(loi("thieu chu ky"));
			const ham = lyDoRong({ hop: o.hop, chuKy, homNay: o.homNay });
			gia.chuKy = o.chuKy;
			gia.hopTuan = () => o.hop;
			await ve(
				<HopTuan cycleId="q4" unit={{ loai: "pb", id: "P" }} />,
				"/ws/okr/bo-okr?donOkr=pb:P&xemOkr=hop-tuan&kyOkr=q4",
			);
			await cho(
				() => NHANH_HOP.some((id) => trangThai(id) !== null),
				loi("man co nhanh"),
			);
			const thay = NHANH_HOP.find((id) => trangThai(id) !== null);
			if (o.ten === "chua-toi-ngay")
				phai(
					thay !== "ST-hoptuan-tuandau" && ham !== "chua-ai-cap-nhat",
					"htmb-ly-do: chua-toi-ngay ra chua-ai-cap-nhat",
				);
			phai(ham === o.mong, loi(`lyDoRong ra ${ham}, can ${o.mong}`));
			phai(thay === o.trangThai, loi(`man ra ${thay}, can ${o.trangThai}`));
			kiemManLyDo(o, chuKy.name);
			dem += 1;
			await goHet();
			setSystemTime();
		}
		expect(dem).toBe(5);
	});
});

describe("htmb-tai", () => {
	const URL_PB = "/ws/okr/bo-okr?donOkr=pb:P&xemOkr=hop-tuan&kyOkr=q4";
	const URL_GOC = "/ws/okr/bo-okr?donOkr=goc&xemOkr=hop-tuan&kyOkr=q4";
	const cauLyDo = () =>
		trangThai("ST-hoptuan-chua-kr")?.querySelector("[data-cau-ly-do]");

	test("ma tran 4 o: hopTuan treo, hopTuan loi, toanCanh treo, toanCanh loi", async () => {
		setSystemTime(HOM_NAY_VN);
		let dem = 0;

		await ve(<TheoDonVi />, URL_PB);
		await cho(() => hangSo().length === 1, "htmb-tai: hang so khung xuong");
		const hang = hangSo()[0];
		const khung = hang?.querySelectorAll('[data-slot="skeleton"]') ?? [];
		const o = hang?.querySelectorAll('[data-slot="stat-card"]') ?? [];
		phai(
			khung.length === 4 && o.length === 4,
			`htmb-tai: treo ${khung.length} khung xuong trong ${o.length} o, can 4 trong 4`,
		);
		phai(
			hang?.getAttribute("data-slot") === "stat-group",
			"htmb-tai: khung xuong khong trong StatGroup",
		);
		phai(
			document.body.querySelector('[data-vi-tri-bo="mot-bo"]') !== null &&
				document.body.querySelector("[data-the-con-bo]") !== null,
			"htmb-tai: treo mat dong vi tri hay the con",
		);
		dem += 1;
		await goHet();

		gia.hopTuan = () => {
			throw new Error("hopTuan hong");
		};
		await ve(<TheoDonVi />, URL_PB);
		await cho(
			() => trangThai("ST-hoptuan-loi") !== null,
			"htmb-tai: vung loi hopTuan",
		);
		const truoc = daGoi.get("hopTuan") ?? 0;
		await bamThuLai("ST-hoptuan-loi");
		const sau = daGoi.get("hopTuan") ?? 0;
		phai(
			sau === truoc + 1,
			`htmb-tai: Thu lai goi hopTuan ${sau - truoc} lan, can 1`,
		);
		dem += 1;
		await goHet();

		const mongCau = mhb.rong.chuaKr("OneHub", TEN_KY);
		gia.hopTuan = () => HOP_RONG;
		gia.toanCanh = TREO_MAI;
		await ve(<TheoDonVi />, URL_GOC);
		await cho(
			() => trangThai("ST-hoptuan-donvi-tai") !== null,
			"htmb-tai: khung xuong don vi",
		);
		phai(
			chu(cauLyDo()) === mongCau,
			`htmb-tai: toanCanh treo cau «${chu(cauLyDo())}», can «${mongCau}»`,
		);
		phai(
			(trangThai("ST-hoptuan-donvi-tai")?.querySelectorAll(
				'[data-slot="skeleton"]',
			).length ?? 0) > 0,
			"htmb-tai: toanCanh treo khong co khung xuong",
		);
		dem += 1;
		await goHet();
		daGoi.clear();

		gia.toanCanh = () => {
			throw new Error("toanCanh hong");
		};
		await ve(<TheoDonVi />, URL_GOC);
		await cho(
			() =>
				trangThai("ST-hoptuan-donvi-loi") !== null ||
				((daGoi.get("toanCanh") ?? 0) > 0 && cauLyDo() == null),
			"htmb-tai: vung loi toanCanh",
		);
		phai(chu(cauLyDo()) === mongCau, "htmb-tai: loi toanCanh mat cau ly do");
		phai(
			trangThai("ST-hoptuan-donvi-loi") !== null,
			"htmb-tai: toanCanh loi khong co ST-hoptuan-donvi-loi",
		);
		const truocTc = daGoi.get("toanCanh") ?? 0;
		await bamThuLai("ST-hoptuan-donvi-loi");
		const sauTc = daGoi.get("toanCanh") ?? 0;
		phai(
			sauTc === truocTc + 1,
			`htmb-tai: Thu lai goi toanCanh ${sauTc - truocTc} lan, can 1`,
		);
		dem += 1;

		expect(dem).toBe(4);
	});
});
