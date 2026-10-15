import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { tinhTrang } from "@crm/validation/okr-muc-tieu";
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
import type { DonChonOkr } from "@/app/(app)/[slug]/okr/okr-search-params";
import type { RouterOutputs } from "@/lib/trpc/types";
import type {
	ChuKyOutput,
	KrOutput,
	MucTieuOutput,
} from "../../api/src/okr/okr.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

/* Trang đơn vị một bảng (DH2). Mỗi `describe` là một nhóm `dvb-…` để
   `-t dvb-…` chọn đúng một eval. Khi một điều khẳng định hỏng, bài ném Error
   mang đúng chuỗi ghim của evals.yaml, để đột biến của rang/hai-chieu.mjs đỏ
   đúng thông điệp. */

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

/* ——— Fixture: cây tổ chức có dấu, sinh bằng hàm ——— */

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("U1", "Nguyễn Thị Lan");
const HUNG = nguoi("U2", "Trần Văn Hùng");

type PhongBanMau = { id: string; name: string; head: typeof LAN | null };

function phongBan(p: PhongBanMau, divisionId: string | null) {
	return {
		...p,
		moTa: "",
		position: 0,
		divisionId,
		stepCount: 0,
		okrMo: 0,
		people: p.head ? [{ ...p.head, primary: true }] : [],
	};
}

const CAY = {
	B1: { id: "B1", name: "Khối Vận hành", head: LAN },
	B2: { id: "B2", name: "Khối Tăng trưởng", head: null },
	P1: { id: "P1", name: "Phòng Kế toán", head: HUNG },
	P2: { id: "P2", name: "Dịch vụ khách hàng", head: null },
	P3: { id: "P3", name: "Kinh doanh", head: HUNG },
	P4: { id: "P4", name: "Tiếp thị", head: null },
	X1: { id: "X1", name: "Pháp chế", head: LAN },
} satisfies Record<string, PhongBanMau>;

const CON_CUA_BP = new Map([
	["B1", [CAY.P1, CAY.P2]],
	["B2", [CAY.P3, CAY.P4]],
]);

function cayMau(): TreeOutput {
	return {
		divisions: [CAY.B1, CAY.B2].map((bp, i) => ({
			...bp,
			moTa: "",
			position: i,
			okrMo: 0,
			departments: (CON_CUA_BP.get(bp.id) ?? []).map((pb) =>
				phongBan(pb, bp.id),
			),
		})),
		chuaXep: [phongBan(CAY.X1, null)],
		chuaCoPhongBan: [],
		people: [
			{
				...LAN,
				primaryDepartmentId: "P1",
				secondaryDepartmentIds: [],
				managerOverrideId: null,
				manager: HUNG,
				managerSource: "chon-tay",
				chucDanh: "",
			},
		],
		archived: { divisions: [], departments: [] },
		coverage: { members: 2, withPrimary: 1, departmentsWithoutHead: 3 },
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

function ketQua(
	id: string,
	objectiveId: string,
	progress = 40,
	moc = false,
): KrOutput {
	return {
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: moc ? "moc" : "tang-toi",
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
		progress,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	};
}

function mucTieu(
	id: string,
	soKr: number,
	them: Partial<MucTieuOutput> = {},
): MucTieuOutput {
	return {
		id,
		cycleId: QUY.id,
		level: "phong-ban",
		unitId: "P1",
		unitName: CAY.P1.name,
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
		keyResults: Array.from({ length: soKr }, (_, i) =>
			ketQua(`${id}-k${i + 1}`, id),
		),
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...them,
	};
}

const NOI_GOP = {
	alignmentId: "al",
	targetObjectiveId: "cty-1",
	targetKeyResultId: null,
	unitName: "OneHub",
	objectiveTitle: "Mục tiêu công ty",
	keyResultTitle: null,
	lyDo: null,
	canCu: null,
	lyDoTuKara: false,
	mucTin: "chua-co-ly-do" as const,
};

/** Một mục tiêu một KR: nhịp KR do (progress, expected) quyết; `gop` thêm một nơi góp. */
function mucTieuNhip(
	id: string,
	progress: number,
	expected: number | null,
	gop: boolean,
	moc: boolean,
): MucTieuOutput {
	return mucTieu(id, 0, {
		expected,
		progress,
		keyResults: [ketQua(`${id}-k1`, id, progress, moc)],
		alignments: gop ? [{ ...NOI_GOP, alignmentId: `al-${id}` }] : [],
	});
}

/* ——— Giả lập tRPC, nuqs, next ——— */

let cycles: RouterOutputs["okr"]["cycles"];
let quanTri: boolean;
let theoDon: Map<string, { rows: MucTieuOutput[]; daBo: MucTieuOutput[] }>;
let dem: RouterOutputs["okr"]["countByUnit"];
let loiDanhSach: Set<string>;
let treo: Set<string>;
let goiDanhSach: DauVao[];

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;

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

const MAT_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] };

const danhSachCua = (vao: DauVao) => {
	const d = theoDon.get(khoaDonVao(vao)) ?? { rows: [], daBo: [] };
	return {
		rows: d.rows.map((o) => ({ ...o, krKhop: [] })),
		daBo: d.daBo.map((o) => ({ ...o, krKhop: [] })),
		total: d.rows.length,
		facetCounts: {
			...MAT_RONG,
			phuTrach: [...new Set(d.rows.map((o) => o.owner.id))].map((id) => ({
				value: id,
				name: d.rows.find((o) => o.owner.id === id)?.owner.name ?? id,
				count: d.rows.filter((o) => o.owner.id === id).length,
			})),
		},
		canEdit: false,
		canCreate: false,
	};
};
const docDanhSach = (vao: DauVao) => {
	goiDanhSach.push(vao);
	const khoa = khoaDonVao(vao);
	if (treo.has(khoa)) return new Promise<never>(() => {});
	if (loiDanhSach.has(khoa)) throw new Error("may chu khong tra loi");
	return danhSachCua(vao);
};
const docCay = () => cayMau();
const docCycles = () => cycles;
const docAccess = () => ({
	canManageProgram: quanTri,
	headOf: { divisions: [], departments: [] },
});
const docWorkspace = () => ({ name: "OneHub" });
const docDem = () => dem;

/* Thủ tục chưa giả lập (bảng của Họp tuần, Chấm điểm, khối KR của người…)
   treo ở đang tải: bài của trang chỉ đo hàng công cụ và bảng mục tiêu. */
const TREO_MAI = () => new Promise<never>(() => {});
const OKR_GIA = {
	cycles: thuTuc("cycles", docCycles),
	access: thuTuc("access", docAccess),
	countByUnit: thuTuc("countByUnit", docDem),
	danhSach: thuTuc("danhSach", docDanhSach),
	soanSanSang: thuTuc("soanSanSang", () => ({
		bat: false,
		lyDo: "don-vi-chua-bat",
	})),
};
const okrGia = new Proxy(OKR_GIA, {
	get: (dich, ten: string) =>
		ten in dich
			? dich[ten as keyof typeof OKR_GIA]
			: {
					...thuTuc(ten, TREO_MAI),
					mutationOptions: () => ({ mutationFn: async () => null }),
				},
});
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", docCay) },
		workspace: { get: thuTuc("workspace", docWorkspace) },
		okr: okrGia,
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

const {
	canBan,
	chuaGop,
	conTrucTiep,
	demLocNhanh,
	gapDau,
	khopTim,
	locNhanh,
	luaChonDonVi,
	sapXep,
	tinhTrangMucTieu,
} = await import("@/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi");
const { khoaDon } = await import("@/app/(app)/[slug]/okr/okr-search-params");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { DataTable } = await import("@crm/ui/components/data-table");
const { okrMessages } = await import("@/lib/messages/okr");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { ChonDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi"
);
const { HangCongCuDonVi, KhungHangCongCu, LOP_HANG_CONG_CU } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu"
);

const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");

const m = okrMessages("vi");
const b = m.donViBang;
const mtc = okrToanCanhMessages("vi");

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

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
	locale: "vi" | "en" = "vi",
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
					<LocaleProvider locale={locale}>
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

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function bamCon(el: Element) {
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"]) {
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
		}
	});
}

async function moOChon(o: ParentNode) {
	const nut = o.querySelector("[data-chon-don-vi]");
	if (!nut) throw new Error("dvb-chon-don-vi: khong co [data-chon-don-vi]");
	await bamCon(nut);
	await cho(
		() => document.querySelector("[cmdk-input]") !== null,
		"o chon don vi mo",
	);
}

async function goTim(chuoi: string) {
	const o = document.querySelector<HTMLInputElement>("[cmdk-input]");
	if (!o) throw new Error("dvb-chon-don-vi: o chon chua mo");
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			"value",
		)?.set;
		dat?.call(o, chuoi);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

type LuaChonHien = { ten: string; goiY: string };

function luaChonDangHien(): LuaChonHien[] {
	return [...document.querySelectorAll('[role="option"]')].map((x) => {
		const [ten, goiY] = [...x.querySelectorAll("span")];
		return { ten: ten?.textContent ?? "", goiY: goiY?.textContent ?? "" };
	});
}

/** Khoá mọi đơn vị của cây fixture, theo thứ tự ô chọn. */
function khoaCuaCay(cay: TreeOutput): string[] {
	return [
		"goc",
		...cay.divisions.flatMap((bp) => [
			`bp:${bp.id}`,
			...bp.departments.map((pb) => `pb:${pb.id}`),
		]),
		...cay.chuaXep.map((pb) => `pb:${pb.id}`),
	];
}

/** countByUnit giả lập sinh từ cây (0, 1, 2 lần lượt) — không viết tay số. */
function demGiaLap(cay: TreeOutput): Record<string, number> {
	return Object.fromEntries(khoaCuaCay(cay).map((k, i) => [k, i % 3]));
}

beforeEach(() => {
	cycles = { cycles: [QUY], currentId: QUY.id };
	quanTri = false;
	theoDon = new Map();
	dem = {};
	loiDanhSach = new Set();
	treo = new Set();
	goiDanhSach = [];
});

/* ——— Nhóm thuần: lọc nhanh ——— */

/** Nhãn kỳ vọng tính độc lập bằng `tinhTrang` của @crm/validation. */
function kyVongCanBan(mt: MucTieuOutput): boolean {
	return mt.keyResults.some((k) => {
		if (k.kind === "moc") return false;
		const t = tinhTrang(k.progress, mt.expected, mt.kind);
		return t === "cham-nhip" || t === "truot";
	});
}

function maTranLocNhanh(): MucTieuOutput[] {
	const NHIP = [
		["dung", 60, 50],
		["cham", 30, 50],
		["truot", 10, 50],
		["ky-vong-null", 40, null],
		["moc", 0, 50],
	] as const;
	const ds = NHIP.flatMap(([ten, p, e]) =>
		[true, false].map((gop) =>
			mucTieuNhip(`${ten}-${gop ? "gop" : "le"}`, p, e, gop, ten === "moc"),
		),
	);
	ds.push(
		mucTieuNhip("cty", 10, 50, false, false),
		mucTieu("cty-le", 1, { level: "onehub" }),
	);
	const cty = ds.find((x) => x.id === "cty");
	if (cty) cty.level = "onehub";
	return ds;
}

describe("dvb-loc-nhanh", () => {
	test("ma tran 5 nhip KR x co/khong noi gop + muc tieu cong ty: Cần bàn, Chưa góp vào đâu, so dem", () => {
		const ds = maTranLocNhanh();
		phai(
			!locNhanh(ds, "chua-gop").some((x) => x.level === "onehub"),
			"dvb-loc-nhanh: muc tieu cong ty nam trong Chưa góp vào đâu",
		);
		for (const mt of ds) {
			phai(
				canBan(mt) === kyVongCanBan(mt),
				`dvb-loc-nhanh: ${mt.id} Cần bàn ${canBan(mt)}, mong ${kyVongCanBan(mt)}`,
			);
			const gop = mt.level !== "onehub" && mt.alignments.length === 0;
			phai(
				chuaGop(mt) === gop,
				`dvb-loc-nhanh: ${mt.id} Chưa góp vào đâu ${chuaGop(mt)}, mong ${gop}`,
			);
		}
		const dem = demLocNhanh(ds);
		expect({
			canBan: locNhanh(ds, "can-ban").map((x) => x.id),
			chuaGop: locNhanh(ds, "chua-gop").map((x) => x.id),
			tatCa: locNhanh(ds, null).length,
		}).toEqual({
			canBan: ds.filter(kyVongCanBan).map((x) => x.id),
			chuaGop: ds
				.filter((x) => x.level !== "onehub" && x.alignments.length === 0)
				.map((x) => x.id),
			tatCa: ds.length,
		});
		expect(dem["can-ban"]).toBe(locNhanh(ds, "can-ban").length);
		expect(dem["chua-gop"]).toBe(locNhanh(ds, "chua-gop").length);
		// đối chứng dương: ma trận có đủ ca cho cả hai ô
		expect(dem["can-ban"]).toBeGreaterThan(0);
		expect(dem["chua-gop"]).toBeGreaterThan(0);
	});
});

/* ——— Nhóm thuần: sắp xếp ——— */

const BAC = ["truot", "cham-nhip", "dung-nhip", "chua-co-ky-vong"] as const;

function bacThamChieu(mt: MucTieuOutput): number {
	const t =
		mt.keyResults.length === 0
			? "chua-co-ky-vong"
			: tinhTrang(mt.progress, mt.expected, mt.kind);
	return BAC.indexOf(t);
}

function sapThamChieu(
	ds: MucTieuOutput[],
	cot: "tien-do" | "tinh-trang",
	chieu: "asc" | "desc",
): string[] {
	const khoa = (mt: MucTieuOutput) =>
		cot === "tien-do" ? mt.progress : bacThamChieu(mt);
	const dau = chieu === "asc" ? 1 : -1;
	const co = ds.map((mt, i) => ({ id: mt.id, i, k: khoa(mt) }));
	const kq: typeof co = [];
	for (const x of co) {
		const viTri = kq.findIndex((y) => (x.k - y.k) * dau < 0);
		if (viTri === -1) kq.push(x);
		else kq.splice(viTri, 0, x);
	}
	return kq.map((x) => x.id);
}

function maTranSapXep(): MucTieuOutput[] {
	return [
		mucTieu("S1", 1, { progress: 50, expected: 50 }),
		mucTieu("S2", 1, { progress: 10, expected: 50 }),
		mucTieu("S3", 1, { progress: 30, expected: null }),
		mucTieu("S4", 1, { progress: 35, expected: 50 }),
		mucTieu("S5", 1, { progress: 45, expected: 50 }),
		mucTieu("S6", 0, { progress: 0, expected: 50 }),
	];
}

describe("dvb-sap-xep", () => {
	const O = [
		["tien-do", "asc", "tien-do tang"],
		["tien-do", "desc", "tien-do giam"],
		["tinh-trang", "asc", "tinh-trang tang"],
		["tinh-trang", "desc", "tinh-trang giam"],
	] as const;
	for (const [cot, chieu, ten] of O) {
		test(`${ten}: day id bang sap tham chieu on dinh`, () => {
			const ds = maTranSapXep();
			const nhan = sapXep(ds, cot, chieu).map((x) => x.id);
			const mong = sapThamChieu(ds, cot, chieu);
			if (cot === "tinh-trang") {
				const tt = (id: string | undefined) => {
					const mt = ds.find((x) => x.id === id);
					return mt ? tinhTrangMucTieu(mt) : "khong-co";
				};
				phai(
					tt(nhan[0]) === tt(mong[0]),
					`dvb-sap-xep: ${ten}: mong ${tt(mong[0])} dau, nhan ${tt(nhan[0])}`,
				);
			}
			phai(
				nhan.join(",") === mong.join(","),
				`dvb-sap-xep: ${ten}: nhan ${nhan.join(",")}, mong ${mong.join(",")}`,
			);
		});
	}
	test("detail (muc «Dòng có chi tiết lên trước» cua DataTable): dong co KR len truoc, on dinh", () => {
		const ds = maTranSapXep();
		const coKr = ds.filter((x) => x.keyResults.length > 0).map((x) => x.id);
		const khongKr = ds
			.filter((x) => x.keyResults.length === 0)
			.map((x) => x.id);
		expect(sapXep(ds, "detail", "asc").map((x) => x.id)).toEqual([
			...coKr,
			...khongKr,
		]);
		expect(sapXep(ds, "detail", "desc").map((x) => x.id)).toEqual([
			...khongKr,
			...coKr,
		]);
	});
	test("khong sap: giu thu tu may chu", () => {
		const ds = maTranSapXep();
		expect(sapXep(ds, null, "asc").map((x) => x.id)).toEqual(
			ds.map((x) => x.id),
		);
	});
	test("doi chung: ma tran co hai muc tieu cung bac va du bon bac", () => {
		const ds = maTranSapXep();
		const bac = ds.map(bacThamChieu);
		expect(new Set(bac).size).toBe(BAC.length);
		expect(bac.length - new Set(bac).size).toBeGreaterThan(0);
	});
});

/* ——— Nhóm thuần của ô chọn và chân bảng ——— */

const CHU_LUA_CHON = {
	caCongTy: "cả công ty",
	thuoc: (duong: string) => `Thuộc ${duong}`,
	demMucTieu: (n: number) => (n === 0 ? "chưa đặt" : `${n} mục tiêu`),
};

describe("dvb-chon-don-vi", () => {
	test("gap dau: hoa thuong, dau, đ", () => {
		expect(
			["Phòng Kế toán", "ĐỊCH VỤ", "Dịch vụ khách hàng"].map(gapDau),
		).toEqual(["phong ke toan", "dich vu", "dich vu khach hang"]);
	});
	test("ma tran tim tren ten co dau (phan thuan)", () => {
		const ds = luaChonDonVi(cayMau(), "OneHub", undefined, null, CHU_LUA_CHON);
		const tim = (q: string) =>
			ds.filter((lc) => khopTim(lc, q)).map((lc) => lc.ten);
		const MA_TRAN = [
			["phong ke toan", [CAY.P1.name]],
			["dich", [CAY.P2.name]],
			["KINH", [CAY.P3.name]],
			[gapDau(CAY.B1.name), [CAY.B1.name, CAY.P1.name, CAY.P2.name]],
			["zzz", []],
		] as const;
		for (const [q, mong] of MA_TRAN) {
			const nhan = tim(q);
			phai(
				nhan.join("|") === mong.join("|"),
				`dvb-chon-don-vi: "${q}" ra ${nhan.length === 0 ? "rong" : `{${nhan.join(", ")}}`}, mong {${mong.join(", ")}}`,
			);
		}
		expect(tim("").length).toBe(8);
	});

	test("o chon: ma tran 8 lua chon — nhan, goi y Thuộc, so muc tieu tu countByUnit", async () => {
		const cay = cayMau();
		const so = demGiaLap(cay);
		const s = await ve(
			<ChonDonVi
				cay={cay}
				chonDon={() => {}}
				dem={so}
				don={{ loai: "goc" }}
				tenGoc="OneHub"
			/>,
		);
		await moOChon(s.o);
		const bpCua = new Map(
			cay.divisions.flatMap((bp) => bp.departments.map((pb) => [pb.id, bp])),
		);
		const tenCua = new Map([
			["goc", "OneHub"],
			...cay.divisions.map((x) => [`bp:${x.id}`, x.name] as const),
			...[...cay.divisions.flatMap((x) => x.departments), ...cay.chuaXep].map(
				(x) => [`pb:${x.id}`, x.name] as const,
			),
		]);
		const thuocCua = (k: string) => {
			if (k === "goc") return b.caCongTy;
			const bp = bpCua.get(k.split(":")[1] ?? "");
			return b.thuoc(k.startsWith("pb:") && bp ? bp.name : "OneHub");
		};
		const mong = khoaCuaCay(cay).map((k) => ({
			ten: tenCua.get(k) ?? "?",
			goiY: `${thuocCua(k)} · ${m.demMucTieu(so[k] ?? 0)}`,
		}));
		const nhan = luaChonDangHien();
		phai(nhan.length === 8, `dvb-chon-don-vi: ${nhan.length} lua chon, mong 8`);
		for (const [i, x] of mong.entries()) {
			phai(
				nhan[i]?.ten === x.ten && nhan[i]?.goiY === x.goiY,
				`dvb-chon-don-vi: lua chon ${i} «${nhan[i]?.ten} / ${nhan[i]?.goiY}», mong «${x.ten} / ${x.goiY}»`,
			);
		}
	});

	test("o chon: ma tran 6 chuoi tim tren ten co dau", async () => {
		const cay = cayMau();
		const s = await ve(
			<ChonDonVi
				cay={cay}
				chonDon={() => {}}
				dem={demGiaLap(cay)}
				don={{ loai: "goc" }}
				tenGoc="OneHub"
			/>,
		);
		await moOChon(s.o);
		const MA_TRAN = [
			["phong ke toan", [CAY.P1.name]],
			["dich", [CAY.P2.name]],
			["KINH", [CAY.P3.name]],
			[gapDau(CAY.B1.name), [CAY.B1.name, CAY.P1.name, CAY.P2.name]],
			["zzz", []],
		] as const;
		for (const [q, mong] of MA_TRAN) {
			await goTim(q);
			const nhan = luaChonDangHien().map((x) => x.ten);
			phai(
				nhan.join("|") === mong.join("|"),
				`dvb-chon-don-vi: "${q}" ra ${nhan.length === 0 ? "rong" : `{${nhan.join(", ")}}`}, mong {${mong.join(", ")}}`,
			);
			if (mong.length === 0)
				phai(
					document.body.textContent?.includes(b.khongKhopDonVi) === true,
					`dvb-chon-don-vi: "${q}" khong hien «${b.khongKhopDonVi}»`,
				);
		}
		await goTim("");
		expect(luaChonDangHien().length).toBe(8);
	});

	test("o chon: chon P2 goi chonDon {pb, P2}; don nguoi:U1 hien ten U1", async () => {
		const cay = cayMau();
		const chon: string[] = [];
		const s = await ve(
			<ChonDonVi
				cay={cay}
				chonDon={(d) => chon.push(khoaDon(d))}
				dem={undefined}
				don={{ loai: "goc" }}
				tenGoc="OneHub"
			/>,
		);
		await moOChon(s.o);
		const p2 = [...document.querySelectorAll('[role="option"]')].find((x) =>
			x.textContent?.startsWith(CAY.P2.name),
		);
		if (!p2) throw new Error("dvb-chon-don-vi: khong thay lua chon P2");
		await act(async () => {
			(p2 as HTMLElement).click();
		});
		phai(
			chon.join(",") === "pb:P2",
			`dvb-chon-don-vi: chon P2 goi ${chon.join(",") || "khong gi"}, mong pb:P2`,
		);
		const s2 = await ve(
			<ChonDonVi
				cay={cay}
				chonDon={() => {}}
				dem={undefined}
				don={{ loai: "nguoi", id: LAN.id }}
				tenGoc="OneHub"
			/>,
		);
		const nut = s2.o.querySelector("[data-chon-don-vi]");
		phai(
			nut?.textContent?.includes(LAN.name) === true,
			`dvb-chon-don-vi: don nguoi:U1 hien «${nut?.textContent}», mong ${LAN.name}`,
		);
	});
});

const MO_TA_CON = new Map([
	["goc", "chi bo phan va chua xep"],
	["bp", "chi phong ban cua no"],
]);

describe("dvb-chan-bang", () => {
	test("con truc tiep theo cay (phan thuan)", () => {
		const cay = cayMau();
		const MA_TRAN = [
			["goc", ["bp:B1", "bp:B2", "pb:X1"]],
			["bp:B1", ["pb:P1", "pb:P2"]],
			["bp:B2", ["pb:P3", "pb:P4"]],
			["pb:P1", []],
			["pb:X1", []],
			["nguoi:U1", []],
		] as const;
		for (const [don, mong] of MA_TRAN) {
			const unit = donVaoChon(don);
			const nhan = conTrucTiep(cay, unit).map((c) => c.khoa);
			const sai = nhan.find((k) => !mong.some((x) => x === k));
			const thieu = mong.find((k) => !nhan.includes(k));
			phai(
				sai === undefined && thieu === undefined,
				`dvb-chan-bang: ${don}: ${sai ? `con co ${sai.split(":")[1]}` : `thieu ${thieu}`}, mong ${MO_TA_CON.get(unit.loai) ?? "khong co khoi"}`,
			);
			expect(nhan.every((k) => k === khoaDon(donVaoChon(k)))).toBe(true);
		}
	});
});

function donVaoChon(k: string): DonChonOkr {
	const [loai, id = ""] = k.split(":");
	if (loai === "bp" || loai === "pb" || loai === "nguoi") return { loai, id };
	return { loai: "goc" };
}

describe("dvb-hang-cong-cu", () => {
	const TRUY_VAN = {
		sort: "",
		dir: "asc" as const,
		page: 1,
		pageSize: 50,
		tab: "all",
		filters: {},
		toggleSort: () => {},
		setSort: () => {},
		setDir: () => {},
		setPage: async () => {},
		setTab: () => {},
		setFilter: () => {},
	};
	const hang = (xem: "danh-sach" | "hop-tuan", coCham: boolean) => (
		<HangCongCuDonVi
			chon={
				<ChonDonVi
					cay={cayMau()}
					chonDon={() => {}}
					dem={undefined}
					don={{ loai: "goc" }}
					tenGoc="OneHub"
				/>
			}
			coCham={coCham}
			doiXem={() => {}}
			xem={xem}
		/>
	);

	test("khung cua cach xem khac cung lop voi hang cong cu cua DataTable; o chon dung truoc cach xem", async () => {
		const bang = await ve(
			<DataTable
				columns={[{ id: "ten", header: "Tên", cell: () => null }]}
				getRowId={() => "x"}
				layout="content"
				query={TRUY_VAN}
				rows={[]}
				search={hang("danh-sach", false)}
				total={0}
			/>,
		);
		const khac = await ve(
			<KhungHangCongCu>{hang("hop-tuan", true)}</KhungHangCongCu>,
		);
		for (const [xem, san] of [
			["danh-sach", bang],
			["hop-tuan", khac],
		] as const) {
			const khoi = san.o.querySelectorAll("[data-hang-cong-cu-don-vi]");
			phai(
				khoi.length === 1,
				`dvb-hang-cong-cu: ${xem}: ${khoi.length} hang cong cu, mong 1`,
			);
			const chon = khoi[0]?.querySelector("[data-chon-don-vi]");
			const cachXem = khoi[0]?.querySelector("[data-view-switch]");
			phai(
				cachXem !== null && cachXem !== undefined,
				`dvb-hang-cong-cu: ${xem}: [data-view-switch] khong nam trong [data-hang-cong-cu-don-vi]`,
			);
			phai(
				chon !== null &&
					chon !== undefined &&
					cachXem !== null &&
					cachXem !== undefined &&
					(chon.compareDocumentPosition(cachXem) &
						Node.DOCUMENT_POSITION_FOLLOWING) !==
						0,
				`dvb-hang-cong-cu: ${xem}: o chon khong dung truoc cach xem`,
			);
		}
		const lopBang =
			bang.o.querySelector("[data-hang-cong-cu-don-vi]")?.parentElement
				?.className ?? "";
		const lopKhac =
			khac.o.querySelector("[data-hang-cong-cu-don-vi]")?.parentElement
				?.className ?? "";
		phai(
			lopKhac === lopBang && lopBang === LOP_HANG_CONG_CU,
			`dvb-hang-cong-cu: khung «${lopKhac}» khac hang cong cu DataTable «${lopBang}»`,
		);
		expect(
			khac.o.querySelectorAll('[data-view-switch="nut"] button').length,
		).toBe(4);
		expect(
			bang.o.querySelectorAll('[data-view-switch="nut"] button').length,
		).toBe(3);
	});
});

/* ——— Mức trang ——— */

async function moTrang(
	don: string,
	them: Record<string, string> = {},
	locale: "vi" | "en" = "vi",
): Promise<San> {
	const thamSo = new URLSearchParams({ kyOkr: QUY.id, ...them });
	if (don !== "goc") thamSo.set("donOkr", don);
	const s = await ve(<TheoDonVi />, thamSo, locale);
	/* Xong khi cây tổ chức đã về: có ô chọn — hoặc, ở bản bị phá, bất kỳ dấu
	   nào của thân trang — để điều khẳng định sau đó in đúng chuỗi ghim thay vì
	   hết giờ chờ. */
	await cho(
		() =>
			s.o.querySelector(
				"[data-chon-don-vi], [data-nut-cay], [data-vung-tai-loi], [data-hang-muc-tieu], [data-trang-thai=ST-donvi-chuakychay], [data-trang-thai=ST-donvi-khongthay], [data-trang-thai=ST-donvi-rong]",
			) !== null,
		"trang don vi dung xong",
	);
	return s;
}

async function choBang(s: San) {
	await cho(
		() =>
			s.o.querySelector("[data-hang-muc-tieu]") !== null ||
			s.o.querySelector("[data-trang-thai=ST-donvi-rong]") !== null ||
			s.o.querySelector("[data-trang-thai=ST-donvi-loc-khongkhop]") !== null,
		"bang muc tieu",
	);
}

function datDon(
	don: string,
	rows: MucTieuOutput[],
	daBo: MucTieuOutput[] = [],
) {
	theoDon.set(JSON.stringify(donVaoChon(don)), { rows, daBo });
}

const idDong = (o: ParentNode) =>
	[...o.querySelectorAll("[data-hang-muc-tieu]")].map((x) =>
		x.getAttribute("data-hang-muc-tieu"),
	);

const donCuoi = () => {
	const vao = goiDanhSach.at(-1);
	return JSON.stringify(vao?.unit ?? null);
};

describe("dvb-chon-don-vi", () => {
	test("trang: khong con cay, dung 1 o chon trong hang cong cu cua bang", async () => {
		datDon("pb:P1", [mucTieu("M1", 1)]);
		const s = await moTrang("pb:P1");
		await choBang(s);
		const nutCay = s.o.querySelectorAll("[data-nut-cay]").length;
		phai(
			nutCay === 0,
			`dvb-chon-don-vi: con ${nutCay} nut cay [data-nut-cay], mong 0`,
		);
		expect(s.o.querySelectorAll("[role=tree]").length).toBe(0);
		const oChon = s.o.querySelectorAll("[data-chon-don-vi]");
		phai(oChon.length === 1, `dvb-chon-don-vi: ${oChon.length} o chon, mong 1`);
		const khung = oChon[0]?.closest(
			"[data-hang-cong-cu-don-vi]",
		)?.parentElement;
		phai(
			khung?.className === LOP_HANG_CONG_CU &&
				khung.parentElement?.querySelector("table") !== null,
			"dvb-chon-don-vi: o chon khong nam trong hang cong cu cua bang",
		);
	});

	test("trang: chon P2 -> URL donOkr=pb:P2 va okr.danhSach ke tiep hoi {pb, P2}", async () => {
		datDon("pb:P1", [mucTieu("M1", 1)]);
		const s = await moTrang("pb:P1");
		await choBang(s);
		await moOChon(s.o);
		const p2 = [...document.querySelectorAll('[role="option"]')].find((x) =>
			x.textContent?.startsWith(CAY.P2.name),
		);
		if (!p2) throw new Error("dvb-chon-don-vi: khong thay lua chon P2");
		await act(async () => {
			(p2 as HTMLElement).click();
		});
		await cho(() => donCuoi().includes('"P2"'), "danhSach hoi P2");
		expect({
			url: s.url().get("donOkr"),
			don: goiDanhSach.at(-1)?.unit,
		}).toEqual({ url: "pb:P2", don: { loai: "pb", id: "P2" } });
	});

	test("trang: donOkr=nguoi:U1 -> o chon hien ten U1", async () => {
		const s = await moTrang("nguoi:U1");
		const nut = s.o.querySelector("[data-chon-don-vi]");
		phai(
			nut?.textContent?.includes(LAN.name) === true,
			`dvb-chon-don-vi: don nguoi:U1 hien «${nut?.textContent}», mong ${LAN.name}`,
		);
	});
});

describe("dvb-hang-cong-cu", () => {
	const PHA = ["dang-chay", "cham-diem"] as const;
	const XEM = ["danh-sach", "cay", "hop-tuan", "cham"] as const;
	for (const pha of PHA) {
		test(`trang ${pha}: 4 cach xem cung mot hang cong cu, cung lop khung, khong nut tao/nhap/soan`, async () => {
			cycles = { cycles: [{ ...QUY, phase: pha }], currentId: QUY.id };
			datDon("pb:P1", [mucTieu("M1", 1)]);
			let lopDanhSach = "";
			for (const xem of XEM) {
				const s = await moTrang(
					"pb:P1",
					xem === "danh-sach" ? {} : { xemOkr: xem },
				);
				const khoi = s.o.querySelectorAll("[data-hang-cong-cu-don-vi]");
				phai(
					khoi.length === 1,
					`dvb-hang-cong-cu: ${xem}: ${khoi.length} hang cong cu, mong 1`,
				);
				const cachXem = khoi[0]?.querySelector("[data-view-switch]");
				phai(
					cachXem !== null && cachXem !== undefined,
					`dvb-hang-cong-cu: ${xem}: [data-view-switch] khong nam trong [data-hang-cong-cu-don-vi]`,
				);
				const chon = khoi[0]?.querySelector("[data-chon-don-vi]");
				phai(
					chon !== null &&
						chon !== undefined &&
						cachXem !== null &&
						cachXem !== undefined &&
						(chon.compareDocumentPosition(cachXem) &
							Node.DOCUMENT_POSITION_FOLLOWING) !==
							0,
					`dvb-hang-cong-cu: ${xem}: o chon khong dung truoc cach xem`,
				);
				const lop = khoi[0]?.parentElement?.className ?? "";
				if (xem === "danh-sach") {
					await choBang(s);
					lopDanhSach =
						s.o.querySelector("[data-hang-cong-cu-don-vi]")?.parentElement
							?.className ?? "";
					phai(
						s.o.querySelector("table") !== null,
						"dvb-hang-cong-cu: danh-sach khong dung bang",
					);
				}
				phai(
					lop === lopDanhSach,
					`dvb-hang-cong-cu: ${xem}: khung «${lop}» khac danh-sach «${lopDanhSach}»`,
				);
				const nutThan = s.o.querySelectorAll(
					"[data-nut=them-muc-tieu], [data-nut=nhap-bang-tinh], [data-nhom-soan]",
				).length;
				phai(
					nutThan === 0,
					`dvb-hang-cong-cu: ${xem}: ${nutThan} nut tao/nhap/soan trong than`,
				);
				const xemHien =
					pha === "dang-chay" && xem === "cham" ? "danh-sach" : xem;
				phai(
					khoi[0]?.querySelector(`[data-view-switch="nut"] [data-state="on"]`)
						?.textContent !== undefined &&
						s.o.querySelector(
							`[data-view-switch="nut"] [aria-checked="true"], [data-view-switch="nut"] [data-state="on"]`,
						) !== null,
					`dvb-hang-cong-cu: ${xem}: cach xem khong danh dau gia tri`,
				);
				if (pha === "dang-chay" && xem === "cham") {
					await choBang(s);
					phai(
						s.o.querySelector("table") !== null,
						"dvb-hang-cong-cu: cham ngoai pha cham khong roi ve danh-sach",
					);
				}
				expect(xemHien).toBeTruthy();
				await act(async () => s.root.unmount());
				s.o.remove();
				dangMo = dangMo.filter((x) => x !== s);
			}
		});
	}
});

describe("dvb-dong-mo", () => {
	const ba = () => [
		mucTieu("M1", 2, { alignments: [{ ...NOI_GOP, alignmentId: "a1" }] }),
		mucTieu("M2", 1),
		mucTieu("M3", 0),
	];
	const dongCua = (o: ParentNode, id: string) =>
		o.querySelector(`[data-hang-muc-tieu="${id}"]`)?.closest("tr") ?? null;
	const nutMo = (o: ParentNode, id: string) =>
		dongCua(o, id)?.querySelector<HTMLButtonElement>("button[aria-expanded]") ??
		null;

	test("mac dinh moi dong thu; M1, M2 co nut aria-expanded=false, M3 khong", async () => {
		datDon("pb:P1", ba());
		const s = await moTrang("pb:P1");
		await choBang(s);
		const soKr = s.o.querySelectorAll("[data-kr]").length;
		phai(soKr === 0, `dvb-dong-mo: mac dinh ${soKr} dong KR, mong 0`);
		expect({
			M1: nutMo(s.o, "M1")?.getAttribute("aria-expanded"),
			M2: nutMo(s.o, "M2")?.getAttribute("aria-expanded"),
			M3: nutMo(s.o, "M3"),
		}).toEqual({ M1: "false", M2: "false", M3: null });
	});

	const CACH = ["nut mui ten", "o trong cua dong"] as const;
	for (const cach of CACH) {
		for (const id of ["M1", "M2"]) {
			test(`${cach} x ${id}: KR hien ngay duoi, cung so cot, URL expand`, async () => {
				datDon("pb:P1", ba());
				const s = await moTrang("pb:P1");
				await choBang(s);
				const dong = dongCua(s.o, id);
				const dich =
					cach === "nut mui ten"
						? nutMo(s.o, id)
						: (dong?.querySelectorAll("td")[3] ?? null);
				if (!dich) throw new Error(`dvb-dong-mo: ${id} khong co ${cach}`);
				await act(async () => {
					(dich as HTMLElement).click();
				});
				const mt = ba().find((x) => x.id === id);
				const kr = mt?.keyResults.map((k) => k.id) ?? [];
				const sau = [] as string[];
				let ke = dongCua(s.o, id)?.nextElementSibling;
				while (ke?.querySelector("[data-kr]")) {
					sau.push(
						ke.querySelector("[data-kr]")?.getAttribute("data-kr") ?? "",
					);
					ke = ke.nextElementSibling;
				}
				phai(
					sau.join(",") === kr.join(","),
					`dvb-dong-mo: ${cach} ${id}: dong KR duoi la ${sau.join(",") || "rong"}, mong ${kr.join(",")}`,
				);
				const soCot = dongCua(s.o, id)?.querySelectorAll("td").length;
				const soCotKr = dongCua(s.o, id)?.nextElementSibling?.querySelectorAll(
					"td",
				).length;
				phai(
					soCot === soCotKr,
					`dvb-dong-mo: ${id}: dong KR ${soCotKr} cot, cha ${soCot}`,
				);
				expect(s.url().getAll("expand").join(",")).toContain(id);
			});
		}
	}

	test("dung lai voi expand=M2 -> M2 mo, M1 thu", async () => {
		datDon("pb:P1", ba());
		const s = await moTrang("pb:P1", { expand: "M2" });
		await choBang(s);
		expect({
			M1: nutMo(s.o, "M1")?.getAttribute("aria-expanded"),
			M2: nutMo(s.o, "M2")?.getAttribute("aria-expanded"),
			kr: [...s.o.querySelectorAll("[data-kr]")].map((x) =>
				x.getAttribute("data-kr"),
			),
		}).toEqual({ M1: "false", M2: "true", kr: ["M2-k1"] });
	});

	test("bam ten M1 mo ngan chi tiet muc tieu, khong doi expand; bam dong KR mo ngan KR", async () => {
		datDon("pb:P1", ba());
		const s = await moTrang("pb:P1");
		await choBang(s);
		const ten = s.o.querySelector<HTMLElement>('[data-mo-muc-tieu="M1"]');
		if (!ten) throw new Error("dvb-dong-mo: khong co nut ten M1");
		await act(async () => ten.click());
		expect({
			record: s.url().get("record"),
			expand: s.url().get("expand"),
			kr: s.o.querySelectorAll("[data-kr]").length,
		}).toEqual({ record: "objective:M1", expand: null, kr: 0 });
		const nut = nutMo(s.o, "M1");
		if (!nut) throw new Error("dvb-dong-mo: M1 khong co nut mo");
		await act(async () => nut.click());
		const dongKr = s.o.querySelector('[data-kr="M1-k1"]')?.closest("tr");
		if (!dongKr) throw new Error("dvb-dong-mo: khong co dong KR M1-k1");
		await act(async () => (dongKr as HTMLElement).click());
		expect(s.url().get("record")?.split(",").at(-1)).toBe("kr:M1-k1");
	});

	test("ban phim: nut mo cua M1 la button co aria-label chua ten; Enter mo, Space thu", async () => {
		datDon("pb:P1", ba());
		const s = await moTrang("pb:P1");
		await choBang(s);
		const nut = nutMo(s.o, "M1");
		phai(
			nut instanceof HTMLButtonElement &&
				(nut.getAttribute("aria-label") ?? "").includes("Mục tiêu M1"),
			"dvb-dong-mo: nut mo M1 khong phai button mang ten M1",
		);
		const nhan = async (phim: "Enter" | " ") => {
			const n = nutMo(s.o, "M1");
			if (!n) throw new Error("dvb-dong-mo: mat nut M1");
			await act(async () => {
				n.focus();
				const duoc = n.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: phim,
						bubbles: true,
						cancelable: true,
					}),
				);
				if (phim === "Enter" && duoc) n.click();
				const len = n.dispatchEvent(
					new KeyboardEvent("keyup", {
						key: phim,
						bubbles: true,
						cancelable: true,
					}),
				);
				if (phim === " " && duoc && len) n.click();
			});
		};
		await nhan("Enter");
		expect(nutMo(s.o, "M1")?.getAttribute("aria-expanded")).toBe("true");
		await nhan(" ");
		expect(nutMo(s.o, "M1")?.getAttribute("aria-expanded")).toBe("false");
	});

	test("cot cua dong cha: ten, loai, trang thai, so KR, góp vào, Tien do, Tinh trang, Phu trach", async () => {
		datDon("pb:P1", ba());
		const s = await moTrang("pb:P1");
		await choBang(s);
		const dong = dongCua(s.o, "M1");
		const chu = dong?.textContent ?? "";
		const dau = [...s.o.querySelectorAll("thead th")].map(
			(x) => x.textContent ?? "",
		);
		const thieu = [
			"Mục tiêu M1",
			m.loai["cam-ket"],
			m.trangThai["cong-bo"],
			m.khoiMucTieu.soKr(2),
			m.gopVao(1),
			HUNG.name,
		].filter((x) => !chu.includes(x));
		phai(thieu.length === 0, `dvb-dong-mo: dong M1 thieu ${thieu.join(", ")}`);
		const thieuDau = [
			b.cot.mucTieu,
			b.cot.tienDo,
			b.cot.tinhTrang,
			b.cot.phuTrach,
		].filter((x) => !dau.some((d) => d.includes(x)));
		phai(
			thieuDau.length === 0,
			`dvb-dong-mo: dau bang thieu ${thieuDau.join(", ")}`,
		);
		expect(dongCua(s.o, "M2")?.textContent?.includes(m.gopVao(1))).toBe(false);
	});
});

describe("dvb-loc-nhanh", () => {
	const mong = (ds: MucTieuOutput[], loc: string | null) =>
		ds
			.filter((x) =>
				loc === "can-ban"
					? kyVongCanBan(x)
					: loc === "chua-gop"
						? x.level !== "onehub" && x.alignments.length === 0
						: true,
			)
			.map((x) => x.id);

	for (const loc of [null, "can-ban", "chua-gop"] as const) {
		test(`trang ${loc ?? "tat-ca"}: dong hien dung nhan, so dem tren nhan = so dong`, async () => {
			const ds = maTranLocNhanh();
			datDon("pb:P1", ds);
			const s = await moTrang("pb:P1", loc ? { locNhanhOkr: loc } : {});
			await choBang(s);
			const hien = idDong(s.o);
			if (loc === "chua-gop")
				phai(
					!hien.includes("cty") && !hien.includes("cty-le"),
					"dvb-loc-nhanh: muc tieu cong ty nam trong Chưa góp vào đâu",
				);
			phai(
				hien.join(",") === mong(ds, loc).join(","),
				`dvb-loc-nhanh: ${loc ?? "tat-ca"}: hien ${hien.join(",")}, mong ${mong(ds, loc).join(",")}`,
			);
			const nutTab = [...s.o.querySelectorAll("button")].find(
				(x) => x.textContent === (loc ? b.locNhanh[loc] : b.locNhanh.tatCa),
			);
			if (!nutTab) throw new Error("dvb-loc-nhanh: khong thay nut o loc nhanh");
			await bamCon(nutTab);
			await cho(
				() => document.querySelectorAll('[role="menuitemradio"]').length === 3,
				"menu loc nhanh",
			);
			const dem = new Map(
				[...document.querySelectorAll('[role="menuitemradio"]')].map((x) => [
					x.querySelector(":scope > span.flex-1")?.textContent ?? "",
					Number(
						x.querySelector('[data-slot="facet-count"]')?.textContent ?? "NaN",
					),
				]),
			);
			for (const k of ["can-ban", "chua-gop"] as const) {
				phai(
					dem.get(b.locNhanh[k]) === mong(ds, k).length,
					`dvb-loc-nhanh: nhan ${b.locNhanh[k]} dem ${dem.get(b.locNhanh[k])}, so dong ${mong(ds, k).length}`,
				);
			}
		});
	}

	test("chon Cần bàn ghi URL; dung lai giu; khong khop -> Không có mục tiêu nào khớp + bo loc ve Tất cả", async () => {
		const ds = maTranLocNhanh();
		datDon("pb:P1", ds);
		const s = await moTrang("pb:P1");
		await choBang(s);
		const nutTab = [...s.o.querySelectorAll("button")].find(
			(x) => x.textContent === b.locNhanh.tatCa,
		);
		if (!nutTab) throw new Error("dvb-loc-nhanh: khong thay o loc nhanh");
		await bamCon(nutTab);
		await cho(
			() => document.querySelectorAll('[role="menuitemradio"]').length === 3,
			"menu",
		);
		const canBanMuc = [
			...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
		].find((x) => x.textContent?.startsWith(b.locNhanh["can-ban"]));
		await act(async () => canBanMuc?.click());
		expect(s.url().get("locNhanhOkr")).toBe("can-ban");
		await cho(
			() => idDong(s.o).join(",") === mong(ds, "can-ban").join(","),
			"loc can-ban",
		);

		datDon("pb:P2", [mucTieuNhip("yen", 60, 50, true, false)]);
		const s2 = await moTrang("pb:P2", { locNhanhOkr: "can-ban" });
		await choBang(s2);
		const kk = s2.o.querySelector("[data-trang-thai=ST-donvi-loc-khongkhop]");
		phai(
			kk?.textContent?.includes(b.khongKhopLoc) === true,
			`dvb-loc-nhanh: khong khop hien «${kk?.textContent ?? "khong co"}»`,
		);
		const bo = [...(kk?.querySelectorAll("button") ?? [])].find(
			(x) => x.textContent === b.boLoc,
		);
		if (!bo) throw new Error("dvb-loc-nhanh: khong co nut bo loc");
		await act(async () => bo.click());
		await cho(() => idDong(s2.o).join(",") === "yen", "bo loc ve Tat ca");
		expect(s2.url().get("locNhanhOkr")).toBeNull();
	});

	test("en: All, Needs discussion, Not aligned (rut tu messages)", async () => {
		const en = okrMessages("en").donViBang.locNhanh;
		datDon("pb:P1", maTranLocNhanh());
		const s = await moTrang("pb:P1", {}, "en");
		await choBang(s);
		const nutTab = [...s.o.querySelectorAll("button")].find(
			(x) => x.textContent === en.tatCa,
		);
		if (!nutTab) throw new Error("dvb-loc-nhanh: en khong co nut All");
		await bamCon(nutTab);
		await cho(
			() => document.querySelectorAll('[role="menuitemradio"]').length === 3,
			"menu en",
		);
		const nhan = [...document.querySelectorAll('[role="menuitemradio"]')].map(
			(x) => x.querySelector(":scope > span.flex-1")?.textContent,
		);
		expect(nhan).toEqual([en.tatCa, en["can-ban"], en["chua-gop"]]);
		expect([en["can-ban"], en["chua-gop"]]).toEqual([
			"Needs discussion",
			"Not aligned",
		]);
	});

	test("nam bo loc may chu van la facets cua DataTable va di vao okr.danhSach", async () => {
		datDon("pb:P1", [mucTieu("M1", 1)]);
		const s = await moTrang("pb:P1", { loaiOkr: "cam-ket", tuTinOkr: "thap" });
		await choBang(s);
		expect(goiDanhSach.at(-1)?.loc).toEqual({
			phuTrach: [],
			loai: ["cam-ket"],
			trangThai: [],
			tuTin: ["thap"],
			gopY: [],
		});
		const nutLoc = [
			...s.o.querySelectorAll('button[aria-haspopup="menu"]'),
		].find((x) => x.textContent?.startsWith(uiMessages("vi").table.filters));
		if (!nutLoc) throw new Error("dvb-loc-nhanh: khong co nut Lọc");
		await bamCon(nutLoc);
		await cho(
			() => document.querySelectorAll('[role="menuitem"]').length >= 5,
			"menu Lọc",
		);
		const mat = [...document.querySelectorAll('[role="menuitem"]')].map(
			(x) => x.textContent ?? "",
		);
		const thieu = [
			mtc.loc.phuTrach,
			mtc.loc.loai,
			mtc.loc.trangThai,
			mtc.loc.tuTin,
		].filter((x) => !mat.some((y) => y.startsWith(x)));
		expect(thieu).toEqual([]);
		expect(mat.length).toBe(5);
	});
});

describe("dvb-sap-xep", () => {
	test("trang: URL sapOkr/chieuOkr sap dong cha; KR ngay sau cha khi mo; bam dau cot ghi URL", async () => {
		const ds = maTranSapXep();
		datDon("pb:P1", ds);
		const s = await moTrang("pb:P1", {
			sapOkr: "tien-do",
			chieuOkr: "desc",
			expand: ds.map((x) => x.id).join(","),
		});
		await choBang(s);
		const mong = sapThamChieu(ds, "tien-do", "desc");
		phai(
			idDong(s.o).join(",") === mong.join(","),
			`dvb-sap-xep: trang tien-do giam: nhan ${idDong(s.o).join(",")}, mong ${mong.join(",")}`,
		);
		const thuTu = [
			...s.o.querySelectorAll("tbody [data-hang-muc-tieu], tbody [data-kr]"),
		].map(
			(x) =>
				x.getAttribute("data-hang-muc-tieu") ??
				`kr:${x.getAttribute("data-kr")}`,
		);
		const mongThuTu = mong.flatMap((id) => [
			id,
			...(ds.find((x) => x.id === id)?.keyResults.map((k) => `kr:${k.id}`) ??
				[]),
		]);
		expect(thuTu).toEqual(mongThuTu);

		const s2 = await moTrang("pb:P1");
		await choBang(s2);
		expect(idDong(s2.o)).toEqual(ds.map((x) => x.id));
		const dauTinhTrang = [...s2.o.querySelectorAll("thead button")].find((x) =>
			x.textContent?.includes(b.cot.tinhTrang),
		);
		if (!dauTinhTrang)
			throw new Error("dvb-sap-xep: cot Tình trạng khong sap duoc");
		await act(async () => (dauTinhTrang as HTMLElement).click());
		expect(s2.url().get("sapOkr")).toBe("tinh-trang");
		const mongTang = sapThamChieu(ds, "tinh-trang", "asc");
		const tt = (id: string | undefined) => {
			const mt = ds.find((x) => x.id === id);
			return mt ? tinhTrangMucTieu(mt) : "khong-co";
		};
		await cho(
			() => idDong(s2.o).join(",") !== ds.map((x) => x.id).join(","),
			"sap lai",
		);
		phai(
			tt(idDong(s2.o)[0] ?? undefined) === tt(mongTang[0]),
			`dvb-sap-xep: tinh-trang tang: mong ${tt(mongTang[0])} dau, nhan ${tt(idDong(s2.o)[0] ?? undefined)}`,
		);
		await act(async () => (dauTinhTrang as HTMLElement).click());
		expect(s2.url().get("chieuOkr")).toBe("desc");
	});
});

describe("dvb-chan-bang", () => {
	const soDong = (k: string) => (k.length % 3) + 1;
	const dongCuaDon = (k: string) =>
		Array.from({ length: soDong(k) }, (_, i) =>
			mucTieu(`${k}-${i}`, i % 2 === 0 ? 2 : 1),
		);
	const O = ["goc", "bp:B1", "bp:B2", "pb:P1", "pb:X1", "nguoi:U1"] as const;
	for (const don of O) {
		test(`${don}: chan bang truong/so/thuoc va khoi Đơn vị trực thuộc`, async () => {
			const cay = cayMau();
			dem = demGiaLap(cay);
			const rows = dongCuaDon(don);
			datDon(don, rows);
			const s = await moTrang(don);
			await choBang(s);
			const chan = s.o.querySelector("[data-dong-don-vi]");
			const chu = chan?.textContent ?? "";
			const soKr = rows.reduce((t, x) => t + x.keyResults.length, 0);
			phai(
				chu.includes(m.demDonVi(rows.length, soKr)),
				`dvb-chan-bang: ${don}: chan bang «${chu}» thieu ${m.demDonVi(rows.length, soKr)}`,
			);
			const d = donVaoChon(don);
			const bp = cay.divisions.find((x) => d.loai === "bp" && x.id === d.id);
			const pbCha = cay.divisions.find((x) =>
				x.departments.some((p) => d.loai === "pb" && p.id === d.id),
			);
			const pb = [
				...cay.divisions.flatMap((x) => x.departments),
				...cay.chuaXep,
			].find((x) => d.loai === "pb" && x.id === d.id);
			const truong = bp?.head ?? pb?.head ?? null;
			if (d.loai === "bp" || d.loai === "pb") {
				phai(
					truong ? chu.includes(truong.name) : chu.includes(m.chuaCoTruong),
					`dvb-chan-bang: ${don}: chan bang thieu ${truong ? truong.name : m.chuaCoTruong}`,
				);
				const duong = pbCha ? `OneHub › ${pbCha.name}` : "OneHub";
				phai(
					chu.includes(b.thuoc(duong)),
					`dvb-chan-bang: ${don}: chan bang thieu ${b.thuoc(duong)}`,
				);
			} else {
				phai(
					!chu.includes(b.thuoc("")) && !chu.includes(m.chuaCoTruong),
					`dvb-chan-bang: ${don}: chan bang co Thuộc/Chưa có trưởng`,
				);
			}
			if (d.loai === "nguoi") {
				phai(
					chu.includes(`${mtc.nguoi.phongBanChinh} ${CAY.P1.name}`) &&
						chu.includes(`${mtc.nguoi.quanLy} ${HUNG.name}`),
					`dvb-chan-bang: ${don}: chan bang thieu phong ban chinh/quan ly`,
				);
			}
			const conMong =
				d.loai === "goc"
					? [
							...cay.divisions.map((x) => ({
								k: `bp:${x.id}`,
								ten: x.name,
								truong: x.head,
							})),
							...cay.chuaXep.map((x) => ({
								k: `pb:${x.id}`,
								ten: x.name,
								truong: x.head,
							})),
						]
					: (bp?.departments.map((x) => ({
							k: `pb:${x.id}`,
							ten: x.name,
							truong: x.head,
						})) ?? []);
			const o = [...s.o.querySelectorAll("[data-don-vi-con] a")];
			const conNhan = o.map((a) =>
				new URLSearchParams(a.getAttribute("href")?.split("?")[1] ?? "").get(
					"donOkr",
				),
			);
			const sai = conNhan.find((k) => !conMong.some((x) => x.k === k));
			phai(
				sai === undefined && conNhan.length === conMong.length,
				`dvb-chan-bang: ${don}: ${sai ? `con co ${sai.split(":")[1]}` : `${conNhan.length} con`}, mong ${MO_TA_CON.get(d.loai) ?? "khong co khoi"}`,
			);
			if (conMong.length === 0)
				expect(s.o.querySelector("[data-don-vi-con]")).toBeNull();
			for (const [i, x] of conMong.entries()) {
				const a = o[i];
				const href = new URLSearchParams(
					a?.getAttribute("href")?.split("?")[1] ?? "",
				);
				const n = dem[khoaDon(donVaoChon(x.k))] ?? 0;
				const chuO = a?.textContent ?? "";
				phai(
					href.get("kyOkr") === QUY.id &&
						chuO.includes(x.ten) &&
						chuO.includes(n === 0 ? b.chuaDatOkr : b.demMucTieuCon(n)) &&
						chuO.includes(m.chuaCoTruong) === (x.truong === null),
					`dvb-chan-bang: ${don}: o con ${x.k} «${chuO}» href ${href}`,
				);
			}
		});
	}
});

describe("dvb-trang-thai", () => {
	test("rong-co-truong / rong-chua-truong: câu hôm nay theo trưởng", async () => {
		const s = await moTrang("pb:P1");
		await choBang(s);
		const rong = s.o.querySelector("[data-trang-thai=ST-donvi-rong]");
		phai(
			rong?.textContent?.includes(m.rong.body) === true,
			"dvb-trang-thai: rong-co-truong sai cau",
		);
		const s2 = await moTrang("pb:P2");
		await choBang(s2);
		const rong2 = s2.o.querySelector("[data-trang-thai=ST-donvi-rong]");
		phai(
			rong2?.textContent?.includes(m.rong.chuaTruong) === true,
			"dvb-trang-thai: rong-chua-truong sai cau",
		);
	});

	test("loi-danh-sach: khoi loi co Thử lại, hang cong cu van dung", async () => {
		loiDanhSach.add(JSON.stringify(donVaoChon("pb:P1")));
		const s = await moTrang("pb:P1");
		await cho(
			() => s.o.querySelector("[data-vung-tai-loi]") !== null,
			"khoi loi",
		);
		const oChon = s.o.querySelector<HTMLButtonElement>("[data-chon-don-vi]");
		phai(
			oChon !== null,
			"dvb-trang-thai: loi-danh-sach: khong co [data-chon-don-vi]",
		);
		phai(
			oChon?.disabled === false,
			"dvb-trang-thai: loi-danh-sach: o chon bi tat",
		);
		const loi = s.o.querySelector("[data-vung-tai-loi]");
		expect(loi?.getAttribute("data-trang-thai")).toBe("ST-donvi-loi");
		expect(
			[...(loi?.querySelectorAll("button") ?? [])].some((x) =>
				x.textContent?.includes(m.loi.action),
			),
		).toBe(true);
	});

	test("don-khong-thay: DonKhongThay + loi ve cong ty, o chon khong vo", async () => {
		const s = await moTrang("pb:KHONG-CON");
		const kt = s.o.querySelector("[data-trang-thai=ST-donvi-khongthay]");
		phai(kt !== null, "dvb-trang-thai: don-khong-thay: khong co DonKhongThay");
		expect(s.o.querySelectorAll("[data-chon-don-vi]").length).toBe(1);
		const ve = [...(kt?.querySelectorAll("button") ?? [])].find(
			(x) => x.textContent === m.khongThay.action,
		);
		await act(async () => ve?.click());
		expect(s.url().get("donOkr")).toBeNull();
	});

	test("chua-chu-ky: ChuaChuKy", async () => {
		cycles = { cycles: [], currentId: null };
		const s = await moTrang("pb:P1");
		phai(
			s.o.querySelector("[data-trang-thai=ST-donvi-chuakychay]") !== null,
			"dvb-trang-thai: chua-chu-ky: khong co ChuaChuKy",
		);
	});

	test("co-da-bo: nhom Đã bỏ duoi bang", async () => {
		datDon(
			"pb:P1",
			[mucTieu("M1", 1)],
			[mucTieu("D1", 1, { status: "da-bo" })],
		);
		const s = await moTrang("pb:P1");
		await choBang(s);
		const nhom = s.o.querySelector("[data-nhom-da-bo]");
		const bang = s.o.querySelector("table");
		phai(
			nhom !== null &&
				bang !== null &&
				(bang.compareDocumentPosition(nhom) &
					Node.DOCUMENT_POSITION_FOLLOWING) !==
					0,
			"dvb-trang-thai: co-da-bo: nhom Đã bỏ khong nam duoi bang",
		);
	});

	test("nguoi: khoi KR cua nguoi duoi bang", async () => {
		datDon("nguoi:U1", [mucTieu("M1", 1)]);
		const s = await moTrang("nguoi:U1");
		await choBang(s);
		const khoi = s.o.querySelector('[data-khoi="okr-cua-toi"]');
		const bang = s.o.querySelector("table");
		phai(
			khoi !== null &&
				bang !== null &&
				(bang.compareDocumentPosition(khoi) &
					Node.DOCUMENT_POSITION_FOLLOWING) !==
					0,
			"dvb-trang-thai: nguoi: khoi KR cua nguoi khong nam duoi bang",
		);
	});

	test("dang-tai: khung xuong o hang cong cu va dong bang, khong cay", async () => {
		treo.add(JSON.stringify(donVaoChon("pb:P1")));
		const s = await moTrang("pb:P1");
		const khung = s.o.querySelector("[data-trang-thai=ST-donvi-dangtai]");
		phai(khung !== null, "dvb-trang-thai: dang-tai: khong co khung dang tai");
		const hang = khung?.querySelector(
			"[data-hang-cong-cu-don-vi]",
		)?.parentElement;
		expect({
			xuongHang: hang?.querySelectorAll("[data-slot=skeleton]").length ?? 0,
			xuongDong:
				khung?.querySelectorAll("[data-khung-hang=hang] [data-slot=skeleton]")
					.length ?? 0,
			cay: s.o.querySelectorAll("[data-nut-cay]").length,
			oChon: s.o.querySelectorAll("[data-chon-don-vi]").length,
		}).toEqual({
			xuongHang: expect.any(Number),
			xuongDong: expect.any(Number),
			cay: 0,
			oChon: 1,
		});
		expect(
			(hang?.querySelectorAll("[data-slot=skeleton]").length ?? 0) > 0,
		).toBe(true);
		expect(
			(khung?.querySelectorAll("[data-khung-hang=hang] [data-slot=skeleton]")
				.length ?? 0) > 0,
		).toBe(true);
	});
});
