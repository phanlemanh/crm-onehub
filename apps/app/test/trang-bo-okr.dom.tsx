import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PHA_CHU_KY, type PhaChuKy } from "@crm/validation/okr-chu-ky";
import { CACH_XEM_OKR, type CachXemOkr } from "@crm/validation/okr-tham-so";
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
import type { ChuKyOutput } from "../../api/src/okr/okr.contracts";
import type { ToanCanhOutput } from "../../api/src/okr/okr-xem.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const LAN = { id: "U1", name: "Nguyễn Thị Lan", email: "U1@onehub.vn" };

function cayMau(): TreeOutput {
	const pb = (id: string, name: string, divisionId: string | null) => ({
		id,
		name,
		head: LAN,
		moTa: "",
		position: 0,
		divisionId,
		stepCount: 0,
		okrMo: 0,
		people: [{ ...LAN, primary: true }],
	});
	return {
		divisions: [
			{
				id: "B1",
				name: "Khối Vận hành",
				head: LAN,
				moTa: "",
				position: 0,
				okrMo: 0,
				departments: [pb("P1", "Phòng Kế toán", "B1")],
			},
		],
		chuaXep: [],
		chuaCoPhongBan: [],
		people: [
			{
				...LAN,
				primaryDepartmentId: "P1",
				secondaryDepartmentIds: [],
				managerOverrideId: null,
				manager: null,
				managerSource: "chon-tay",
				chucDanh: "",
			},
		],
		archived: { divisions: [], departments: [] },
		coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
	};
}

function chuKy(phase: PhaChuKy): ChuKyOutput {
	return {
		id: "q4",
		kind: "quy",
		name: "Quý 4/2026",
		parentId: null,
		startsOn: "2026-10-01",
		endsOn: "2026-12-31",
		phase,
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
}

type HangBo = RouterOutputs["okr"]["danhSachBo"]["hang"][number];

function hangBo(don: string, ten: string, them: Partial<HangBo> = {}): HangBo {
	return {
		don,
		ten,
		cap: don === "goc" ? "goc" : "phong-ban",
		cha: don === "goc" ? null : "goc",
		truong: { id: LAN.id, name: LAN.name },
		soMucTieu: 2,
		tienDo: 40,
		tuTinThap: 0,
		toiDan: false,
		dangTheoDoi: false,
		...them,
	};
}

function dongToanCanh(
	key: string,
	ten: string,
	cap: "goc" | "bo-phan" | "phong-ban",
): ToanCanhOutput["hang"][number] {
	return {
		key,
		ten,
		cap,
		tienDo: 50,
		kyVong: null,
		soMucTieu: 2,
		soKr: 4,
		tuTin: { cao: 2, vua: 0, thap: 0 },
		daCapNhat: 0,
		dangBan: null,
		theoTuan: [null],
	};
}

const TOAN_CANH: ToanCanhOutput = {
	tongQuan: {
		tienDo: 50,
		kyVong: null,
		donViCongBo: 2,
		tongDonVi: 2,
		donViChuaDat: [],
		tongKr: 8,
		daCapNhat: 0,
		daCapNhatTruoc: 0,
		tuTinThap: 0,
		tuTinThapTruoc: 0,
	},
	tuan: ["2026-09-28"],
	tuanNay: "2026-09-28",
	hang: [
		dongToanCanh("goc", "OneHub", "goc"),
		dongToanCanh("pb:P1", "Phòng Kế toán", "phong-ban"),
	],
};

type CheDoBo = "co" | "treo" | "loi";

let phaKy: PhaChuKy;
let treoKy: boolean;
let cheDoBo: CheDoBo;
let hangDs: HangBo[];
let goiBo: number;
type QuyenDan = RouterOutputs["okr"]["access"]["headOf"];
let headOf: QuyenDan;

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
	};
}

const docBo = () => {
	goiBo += 1;
	if (cheDoBo === "treo") return TREO_MAI();
	if (cheDoBo === "loi") throw new Error("may chu khong tra loi");
	return { hang: hangDs };
};

const OKR_GIA = {
	cycles: thuTuc("cycles", () =>
		treoKy ? TREO_MAI() : { cycles: [chuKy(phaKy)], currentId: "q4" },
	),
	access: thuTuc("access", () => ({ canManageProgram: false, headOf })),
	countByUnit: thuTuc("countByUnit", () => ({})),
	danhSachBo: thuTuc("danhSachBo", docBo),
	toanCanh: thuTuc("toanCanh", () => TOAN_CANH),
	soanSanSang: thuTuc("soanSanSang", () => ({
		bat: false,
		lyDo: "don-vi-chua-bat",
	})),
};
const okrGia = new Proxy(OKR_GIA, {
	get: (dich, ten: string) =>
		ten in dich ? dich[ten as keyof typeof OKR_GIA] : thuTuc(ten, TREO_MAI),
});
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", cayMau) },
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
	usePathname: () => "/ws/okr/bo-okr",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { ViewSwitch } = await import("@crm/ui/components/view-switch");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { TheConBo, hrefThe } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/the-con"
);
const { HangCongCuDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu"
);
const { ChonDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi"
);
const { DanhSachBo } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo"
);
const { DonViCon } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/don-vi-con"
);
const { PhanDonViDan } = await import("@/app/(app)/[slug]/okr/phan-don-vi-dan");
const { ToanCanh } = await import("@/app/(app)/[slug]/okr/toan-canh/toan-canh");
const { duongTheoDonVi, duongMoCuoc } = await import(
	"@/app/(app)/[slug]/okr/soan/luat-ban-nhap"
);
const { khoaDon } = await import("@/app/(app)/[slug]/okr/okr-search-params");
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");

const boOkr = okrVoKhuMessages("vi").boOkr;

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeAll(() => {
	window.HTMLElement.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
	phaKy = "dang-chay";
	treoKy = false;
	cheDoBo = "co";
	hangDs = [];
	goiBo = 0;
	headOf = { divisions: [], departments: [] };
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function ve(
	cay: ReactNode,
	thamSo = new URLSearchParams(),
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let cuoi = new URLSearchParams(thamSo);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					cuoi = new URLSearchParams(e.searchParams);
				}}
				searchParams={`?${thamSo}`}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{cay}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => cuoi };
	dangMo.push(san);
	return san;
}

async function go(san: San) {
	await act(async () => san.root.unmount());
	san.o.remove();
	dangMo = dangMo.filter((x) => x !== san);
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

async function bam(el: Element) {
	await act(async () => {
		(el as HTMLElement).click();
	});
}

const demViewSwitch = (o: ParentNode) =>
	o.querySelectorAll("[data-view-switch]").length;

type CotPha = "dang-tai" | PhaChuKy;
type MongO = {
	the: readonly (readonly [CachXemOkr, string])[];
	mo: Record<CachXemOkr, CachXemOkr>;
};

const BON_THE = [
	["danh-sach", "OKR"],
	["hop-tuan", "Họp tuần"],
	["viec", "Việc"],
	["cay", "Sơ đồ"],
] as const;
const NAM_THE = [...BON_THE, ["cham", "Chấm điểm"]] as const;
const MO_KHONG_CHAM = {
	"danh-sach": "danh-sach",
	"hop-tuan": "hop-tuan",
	viec: "viec",
	cay: "cay",
	cham: "danh-sach",
} as const;
const MO_CO_CHAM = {
	"danh-sach": "danh-sach",
	"hop-tuan": "hop-tuan",
	viec: "viec",
	cay: "cay",
	cham: "cham",
} as const;

const MA_TRAN_THE = {
	"dang-tai": { the: BON_THE, mo: MO_KHONG_CHAM },
	"lap-ke-hoach": { the: BON_THE, mo: MO_KHONG_CHAM },
	"dang-chay": { the: BON_THE, mo: MO_KHONG_CHAM },
	"cham-diem": { the: NAM_THE, mo: MO_CO_CHAM },
	"da-dong": { the: NAM_THE, mo: MO_CO_CHAM },
} satisfies Record<CotPha, MongO>;
const XEM_MA_TRAN = ["danh-sach", "hop-tuan", "viec", "cay", "cham"] as const;

function kiemThe(o: ParentNode, nhan: string, mong: MongO, xem: CachXemOkr) {
	const loi = (s: string) => `tbo-the: ${nhan} ${s}`;
	const vs = demViewSwitch(o);
	phai(vs === 0, loi(`${vs} phan tu ViewSwitch`));
	const hang = [...o.querySelectorAll("[data-the-con-bo]")];
	phai(hang.length === 1, loi(`${hang.length} hang the con, mong 1`));
	const khoi = hang[0];
	if (!khoi) return;
	const the = [...khoi.querySelectorAll("[data-the]")];
	const lienKet = the.filter(
		(x) => x.tagName === "A" && (x.getAttribute("href") ?? "") !== "",
	);
	phai(
		lienKet.length === the.length,
		loi(`${the.length - lienKet.length} the khong phai a[href]`),
	);
	const thay = lienKet
		.map((a) => `${a.getAttribute("data-the")}=${a.textContent}`)
		.join(" · ");
	const mongChuoi = mong.the.map(([x, n]) => `${x}=${n}`).join(" · ");
	phai(thay === mongChuoi, loi(`the «${thay}», mong «${mongChuoi}»`));
	const href = new Set(lienKet.map((a) => a.getAttribute("href")));
	phai(href.size === lienKet.length, loi("hai the chung mot href"));
	const dangMoThe = [...khoi.querySelectorAll('[aria-current="page"]')];
	const moThay = dangMoThe.map((x) => x.getAttribute("data-the")).join(",");
	phai(
		dangMoThe.length === 1 && moThay === mong.mo[xem],
		loi(`aria-current «${moThay}», mong «${mong.mo[xem]}»`),
	);
}

async function moBo(cot: CotPha, xem: CachXemOkr): Promise<San> {
	treoKy = cot === "dang-tai";
	if (cot !== "dang-tai") phaKy = cot;
	const thamSo = new URLSearchParams({ kyOkr: "q4", donOkr: "pb:P1" });
	if (xem !== "danh-sach") thamSo.set("xemOkr", xem);
	const s = await ve(<TheoDonVi />, thamSo);
	await cho(
		() =>
			s.o.querySelector(
				cot === "dang-tai" ? "[data-the-con-bo]" : "[data-chon-don-vi]",
			) !== null,
		`tbo-the: ${cot}/${xem} trang mot bo dung xong`,
	);
	return s;
}

describe("tbo-the", () => {
	test("ma tran viet truoc phu dung moi pha chu ky va moi cach xem", () => {
		expect(Object.keys(MA_TRAN_THE)).toEqual(["dang-tai", ...PHA_CHU_KY]);
		expect([...XEM_MA_TRAN].sort()).toEqual([...CACH_XEM_OKR].sort());
	});
	for (const cot of Object.keys(MA_TRAN_THE) as CotPha[]) {
		test(`${cot}: 5 cach xem — the con la lien ket dung thu tu, mot the dang mo, khong ViewSwitch`, async () => {
			for (const xem of XEM_MA_TRAN) {
				const s = await moBo(cot, xem);
				kiemThe(s.o, `${cot}/${xem}`, MA_TRAN_THE[cot], xem);
				await go(s);
			}
		});
	}
});

describe("tbo-the-do", () => {
	test("doi chung duong: hang cong cu ban cu co ViewSwitch thi bo do bat duoc", async () => {
		const s = await ve(
			<>
				<TheConBo
					coCham={false}
					don={{ loai: "pb", id: "P1" }}
					ky="q4"
					xem="danh-sach"
				/>
				<HangCongCuDonVi
					chon={
						<>
							<ChonDonVi
								cay={cayMau()}
								chonDon={() => {}}
								dem={undefined}
								don={{ loai: "pb", id: "P1" }}
								tenGoc="OneHub"
							/>
							<ViewSwitch
								items={[
									{ value: "danh-sach", label: "Danh sách" },
									{ value: "cay", label: "Cây căn chỉnh" },
									{ value: "hop-tuan", label: "Họp tuần" },
								]}
								label="Cách xem"
								onValueChange={() => {}}
								value="danh-sach"
							/>
						</>
					}
				/>
			</>,
		);
		expect(demViewSwitch(s.o)).toBeGreaterThan(0);
		expect(() =>
			kiemThe(
				s.o,
				"dang-chay/danh-sach",
				MA_TRAN_THE["dang-chay"],
				"danh-sach",
			),
		).toThrow(/tbo-the: dang-chay\/danh-sach \d+ phan tu ViewSwitch/);
	});
});

const DUONG_APP = join(dirname(fileURLToPath(import.meta.url)), "..", "app");

type VaiLienKet = "co-don" | "danh-sach";

const CHO_LIEN_KET = {
	"(app)/[slug]/okr/cua-toi.tsx": "danh-sach",
	"(app)/[slug]/okr/phan-don-vi-dan.tsx": "co-don",
	"(app)/[slug]/okr/soan/luat-ban-nhap.ts": "co-don",
	"(app)/[slug]/okr/tab-okr.ts": "danh-sach",
	"(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx": "co-don",
	"(app)/[slug]/okr/theo-don-vi/don-vi-con.tsx": "co-don",
	"(app)/[slug]/okr/theo-don-vi/the-con.tsx": "co-don",
	"(app)/[slug]/okr/theo-don-vi/vi-tri-bo.tsx": "danh-sach",
	"(app)/[slug]/okr/toan-canh/toan-canh.tsx": "co-don",
} satisfies Record<string, VaiLienKet>;

function choDungLienKet(): string[] {
	return readdirSync(DUONG_APP, { recursive: true, encoding: "utf8" })
		.filter((tep) => /\.tsx?$/.test(tep))
		.filter((tep) =>
			readFileSync(join(DUONG_APP, tep), "utf8").includes("/okr/bo-okr"),
		)
		.map((tep) => tep.split("\\").join("/"))
		.sort();
}

function phaiCoDon(tep: string, href: string, don: string) {
	const u = new URL(href, "http://x");
	phai(
		u.pathname === "/ws/okr/bo-okr",
		`tbo-lien-ket: ${tep} sai duong ${u.pathname}`,
	);
	phai(
		u.searchParams.get("donOkr") === don,
		`tbo-lien-ket: ${tep} thieu donOkr=${don} — ${href}`,
	);
}

const hrefTrong = (o: ParentNode, chon: string): string[] =>
	[...o.querySelectorAll(chon)]
		.map((x) => (x.tagName === "A" ? x : x.querySelector("a[href]")))
		.map((a) => a?.getAttribute("href") ?? "");

async function hrefToanCanh(): Promise<HrefTheoDon> {
	const s = await ve(<ToanCanh />, new URLSearchParams({ kyOkr: "q4" }));
	await cho(
		() => s.o.querySelector("[data-hang-toan-canh]") !== null,
		"tbo-lien-ket: toan canh co bang",
	);
	return {
		goc: hrefTrong(s.o, '[data-hang-toan-canh="goc"]'),
		"pb:P1": hrefTrong(s.o, '[data-hang-toan-canh="pb:P1"]'),
	};
}

async function hrefDanhSachBo(): Promise<HrefTheoDon> {
	hangDs = [hangBo("goc", "OneHub"), hangBo("pb:P1", "Phòng Kế toán")];
	const s = await ve(<DanhSachBo />, new URLSearchParams({ kyOkr: "q4" }));
	await cho(
		() => s.o.querySelector("[data-bo]") !== null,
		"tbo-lien-ket: danh sach bo co hang",
	);
	return {
		goc: hrefTrong(s.o, '[data-bo="goc"]'),
		"pb:P1": hrefTrong(s.o, '[data-bo="pb:P1"]'),
	};
}

async function hrefDonViCon(): Promise<HrefTheoDon> {
	const s = await ve(
		<DonViCon
			con={[
				{ khoa: "goc", ten: "OneHub", coTruong: true },
				{ khoa: "pb:P1", ten: "Phòng Kế toán", coTruong: true },
			]}
			dem={undefined}
			ky="q4"
		/>,
	);
	const a = [...s.o.querySelectorAll("[data-don-vi-con] a[href]")].map(
		(x) => x.getAttribute("href") ?? "",
	);
	return { goc: a.slice(0, 1), "pb:P1": a.slice(1, 2) };
}

async function hrefPhanDonViDan(): Promise<HrefTheoDon> {
	headOf = { divisions: ["B1"], departments: ["P1"] };
	const s = await ve(<PhanDonViDan cycleId="q4" ky="q4" tenKy="Quý 4/2026" />);
	await cho(
		() => s.o.querySelector("[data-don-vi-dan]") !== null,
		"tbo-lien-ket: don vi ban dan co the",
	);
	const cua = (don: string) =>
		hrefTrong(s.o, `[data-don-vi-dan="${don}"] [data-nut="mo-don-vi"]`);
	return { "bp:B1": cua("bp:B1"), "pb:P1": cua("pb:P1") };
}

function hrefBanNhap() {
	const dv = (level: "onehub" | "phong-ban", departmentId: string | null) => ({
		cycleId: "q4",
		level,
		divisionId: null,
		departmentId,
	});
	return {
		goc: [
			duongTheoDonVi("ws", dv("onehub", null)),
			duongMoCuoc("ws", "c1", dv("onehub", null)),
		],
		"pb:P1": [
			duongTheoDonVi("ws", dv("phong-ban", "P1")),
			duongMoCuoc("ws", "c1", dv("phong-ban", "P1")),
		],
	};
}

function hrefTheCon() {
	const cua = (don: { loai: "goc" } | { loai: "pb"; id: string }) =>
		XEM_MA_TRAN.map((the) =>
			hrefThe({ goc: "/ws/okr/bo-okr", don, ky: "q4", the }),
		);
	return { goc: cua({ loai: "goc" }), "pb:P1": cua({ loai: "pb", id: "P1" }) };
}

type HrefTheoDon = Record<string, string[]>;

const DUNG_LIEN_KET = {
	"(app)/[slug]/okr/phan-don-vi-dan.tsx": hrefPhanDonViDan,
	"(app)/[slug]/okr/soan/luat-ban-nhap.ts": hrefBanNhap,
	"(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx": hrefDanhSachBo,
	"(app)/[slug]/okr/theo-don-vi/don-vi-con.tsx": hrefDonViCon,
	"(app)/[slug]/okr/theo-don-vi/the-con.tsx": hrefTheCon,
	"(app)/[slug]/okr/toan-canh/toan-canh.tsx": hrefToanCanh,
} satisfies Record<string, () => HrefTheoDon | Promise<HrefTheoDon>>;

function kiemHref(tep: string, theoDon: HrefTheoDon) {
	for (const [don, ds] of Object.entries(theoDon)) {
		phai(ds.length > 0, `tbo-lien-ket: ${tep} khong dung lien ket cho ${don}`);
		for (const href of ds) phaiCoDon(tep, href, don);
	}
}

describe("tbo-lien-ket", () => {
	test("danh sach viet tay khop moi tep dung lien ket /okr/bo-okr trong apps/app/app", () => {
		const thay = choDungLienKet();
		for (const tep of thay)
			phai(tep in CHO_LIEN_KET, `tbo-lien-ket: cho moi ${tep}`);
		for (const tep of Object.keys(CHO_LIEN_KET))
			phai(thay.includes(tep), `tbo-lien-ket: cho mat ${tep}`);
		const coDon = Object.entries(CHO_LIEN_KET)
			.filter(([, vai]) => vai === "co-don")
			.map(([tep]) => tep)
			.sort();
		expect(Object.keys(DUNG_LIEN_KET).sort()).toEqual(coDon);
	});
	for (const [tep, dung] of Object.entries(DUNG_LIEN_KET)) {
		test(`${tep}: bo OneHub mang donOkr=goc, phong ban mang donOkr=pb:<id>`, async () => {
			kiemHref(tep, await dung());
		});
	}
});

describe("tbo-lien-ket-do", () => {
	test("doi chung duong: lien ket Toan canh ban cu bo goc thi khang dinh do", () => {
		const serializeCu = (don: { loai: "goc" } | { loai: "pb"; id: string }) =>
			don.loai === "goc" ? null : khoaDon(don);
		const hrefCu = (don: { loai: "goc" } | { loai: "pb"; id: string }) => {
			const khoa = serializeCu(don);
			const q = new URLSearchParams(khoa ? { donOkr: khoa } : {});
			q.set("kyOkr", "q4");
			return `/ws/okr/bo-okr?${q}`;
		};
		const tep = "(app)/[slug]/okr/toan-canh/toan-canh.tsx";
		expect(() => kiemHref(tep, { goc: [hrefCu({ loai: "goc" })] })).toThrow(
			"tbo-lien-ket: (app)/[slug]/okr/toan-canh/toan-canh.tsx thieu donOkr=goc",
		);
		expect(() =>
			kiemHref(tep, { "pb:P1": [hrefCu({ loai: "pb", id: "P1" })] }),
		).not.toThrow();
	});
});

async function moDanhSach(thamSo = new URLSearchParams({ kyOkr: "q4" })) {
	return ve(<DanhSachBo />, thamSo);
}

describe("tbo-tai", () => {
	test("dang tai: co khung xuong aria-busy va vi tri «Bộ OKR» van o DOM", async () => {
		cheDoBo = "treo";
		const s = await moDanhSach();
		await cho(() => goiBo > 0, "tbo-tai: dang tai goi danhSachBo");
		phai(
			s.o.querySelector('[aria-busy="true"]') !== null,
			"tbo-tai: dang-tai khong co khung xuong aria-busy",
		);
		const viTri = s.o.querySelector("[data-vi-tri-bo]");
		phai(
			viTri?.textContent?.includes(boOkr.viTri) === true,
			`tbo-tai: dang-tai thieu vi tri «${boOkr.viTri}»`,
		);
	});
	test("loi: co VungTaiLoi, bam Thu lai goi lai danhSachBo", async () => {
		cheDoBo = "loi";
		const s = await moDanhSach();
		await cho(
			() => s.o.querySelector("[data-vung-tai-loi]") !== null,
			"tbo-tai: loi khong hien [data-vung-tai-loi]",
		);
		phai(goiBo === 1, `tbo-tai: loi goi ${goiBo} lan truoc khi bam, mong 1`);
		const nut = s.o.querySelector("[data-vung-tai-loi] button");
		phai(nut !== null, "tbo-tai: loi khong co nut Thu lai");
		if (nut) await bam(nut);
		await cho(() => goiBo >= 2, "tbo-tai: bam Thu lai goi lai danhSachBo");
		phai(goiBo === 2, `tbo-tai: loi goi ${goiBo} lan sau khi bam, mong 2`);
	});
});

describe("tbo-tai-do", () => {
	test("doi chung duong: co du lieu thi het aria-busy, khong VungTaiLoi", async () => {
		hangDs = [hangBo("goc", "OneHub"), hangBo("pb:P1", "Phòng Kế toán")];
		const s = await moDanhSach();
		await cho(
			() => s.o.querySelector("[data-danh-sach-bo]") !== null,
			"tbo-tai-do: danh sach bo dung xong",
		);
		expect(s.o.querySelectorAll('[aria-busy="true"]').length).toBe(0);
		expect(s.o.querySelectorAll("[data-vung-tai-loi]").length).toBe(0);
	});
});

describe("tbo-rong-loc", () => {
	test("Tôi dẫn khong khop bo nao: cau rong va Về Tất cả go phamViBo khoi URL", async () => {
		hangDs = [hangBo("goc", "OneHub"), hangBo("pb:P1", "Phòng Kế toán")];
		const s = await moDanhSach(
			new URLSearchParams({ kyOkr: "q4", phamViBo: "toi-dan" }),
		);
		await cho(
			() => s.o.querySelector("[data-danh-sach-bo]") !== null,
			"tbo-rong-loc: danh sach bo dung xong",
		);
		const rong = s.o.querySelector('[data-bo-rong-loc="toi-dan"]');
		phai(rong !== null, "tbo-rong-loc: thieu [data-bo-rong-loc=toi-dan]");
		const nut = rong?.querySelector("[data-ve-tat-ca]");
		phai(
			nut?.textContent === boOkr.rongLoc.nut,
			`tbo-rong-loc: nut «${nut?.textContent}», mong «${boOkr.rongLoc.nut}»`,
		);
		if (nut) await bam(nut);
		await cho(
			() => !s.url().has("phamViBo"),
			"tbo-rong-loc: Về Tất cả go phamViBo",
		);
		await cho(
			() => s.o.querySelector("[data-bo-rong-loc]") === null,
			"tbo-rong-loc: het cau rong sau Về Tất cả",
		);
		expect(s.url().get("kyOkr")).toBe("q4");
	});
});
