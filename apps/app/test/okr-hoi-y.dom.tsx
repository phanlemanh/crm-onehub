import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type HoiYDu = NonNullable<RouterOutputs["okr"]["hoiY"]>;
type ChuKyDu = RouterOutputs["okr"]["cycles"];
type NhanDu = RouterOutputs["okr"]["hoiYNhan"];
type DoPhuDu = RouterOutputs["okr"]["hoiYDoPhu"];

const TRANG_THAI_9 = [
	"dang-tai",
	"loi",
	"trong-quan-tri",
	"trong-thanh-vien",
	"gop",
	"het-han",
	"viet-truoc",
	"chon-chua-du",
	"ket-qua",
] as const;
type TrangThai9 = (typeof TRANG_THAI_9)[number];

const MA_TRAN = {
	"dang-tai": '[data-khoi="dang-tai"]',
	loi: '[data-khoi="loi"]',
	"trong-quan-tri": '[data-khoi="trong-quan-tri"]',
	"trong-thanh-vien": '[data-khoi="trong-thanh-vien"]',
	gop: '[data-khoi="o-soan"]',
	"het-han": '[data-khoi="het-han"]',
	"viet-truoc": '[data-khoi="ban-viet-truoc"]',
	"chon-chua-du": '[data-khoi="thanh-cong-bo"]',
	"ket-qua": '[data-khoi="y-cua-ban-ket-qua"]',
} satisfies Record<TrangThai9, string>;

const GIO = 3_600_000;
const BAY_GIO = Date.now();
const LY_DO_900 =
	`${"Chọn vì khách hàng lạnh quay lại nhiều nhất. ".repeat(20)}`.slice(0, 900);
const Y_THE_B = "Ý có <b>x</b> ở giữa, in nguyên văn";

const CHU_KY: ChuKyDu = {
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
		},
		{
			id: "n27",
			kind: "nam",
			name: "Năm 2027",
			parentId: null,
			startsOn: "2027-01-01",
			endsOn: "2027-12-31",
			phase: "lap-ke-hoach",
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
			cuaSoRa: null,
		},
	],
	currentId: "q4",
};

function yAn(id: string, noiDung: string) {
	return {
		id,
		noiDung,
		viSao: "",
		doBangGi: "",
		chuDeId: null,
		daDongY: false,
	};
}

function yDu(id: string, noiDung: string, chuDeId: string | null) {
	return {
		...yAn(id, noiDung),
		chuDeId,
		tacGia: { id: `ng-${id}`, ten: `Người ${id}` },
		soDongY: 1,
		createdAt: new Date(BAY_GIO - 30 * GIO).toISOString(),
	};
}

function yCuaToi(id: string, noiDung: string) {
	return {
		id,
		noiDung,
		viSao: "",
		doBangGi: "",
		createdAt: new Date(BAY_GIO - 40 * GIO).toISOString(),
		chuDe: null,
		ketLuan: null,
		lyDo: null,
		objectiveId: null,
		hanhTrinh: {
			gopLuc: new Date(BAY_GIO - 40 * GIO).toISOString(),
			vaoChuDeLuc: null,
			ketLuanLuc: null,
		},
	};
}

const DONG_NGHIEP = [
	yAn("k1", Y_THE_B),
	...Array.from({ length: 11 }, (_, i) =>
		yAn(`k${i + 2}`, `Ý đồng nghiệp số ${i + 2} cho năm tới`),
	),
];

function coBan(): HoiYDu {
	return {
		hoiY: {
			id: "h1",
			cauHoi: "Nếu là CEO, mục tiêu nào quan trọng cho năm 2027?",
			loiMo: "Năm nay giữ được khách cũ nhưng khách mới về chậm.",
			soLieu: [
				{
					nhan: "Doanh thu năm",
					giaTri: "186 tỷ",
					ghiChu: "+12% so với năm trước",
				},
				{ nhan: "Khách mới", giaTri: "41", ghiChu: "-8 so với năm trước" },
			],
			hanLuc: new Date(BAY_GIO + 30 * GIO).toISOString(),
			createdAt: new Date(BAY_GIO - 18 * GIO).toISOString(),
			congBoLuc: null,
		},
		trangThai: "dang-mo",
		nguoiChon: { id: "dang", name: "Lê Hải Đăng" },
		cuaToi: { y: [], daHieu: false },
		y: { khoa: false, lyDoKhoa: null, ds: DONG_NGHIEP },
		chuDe: null,
		banTruoc: null,
		ketQua: null,
		quyen: {
			moDuoc: false,
			gopDuoc: true,
			gomDuoc: false,
			chonDuoc: false,
			congBoDuoc: false,
			niemPhongDuoc: false,
			lyDoChuaCongBo: [],
		},
	};
}

const BAN_TRUOC = [
	"Đưa giao hàng lạnh thành mảng có lãi ở cả hai miền",
	"Mở thêm hai kho trung chuyển ở miền Trung",
	"Rút thời gian giao chặng cuối xuống dưới một ngày",
];

function chuDe(
	id: string,
	ten: string,
	ketLuan: "chon" | "de-sau" | null,
	lyDo: string,
	loai: "chu-de" | "y-la" = "chu-de",
) {
	return {
		id,
		loai,
		ten,
		ketLuan,
		lyDo,
		cauMucTieu: ketLuan === "chon" ? "Giao lạnh có lãi ở hai miền" : "",
		noiBanTruoc: ketLuan === "chon" ? ("cau-1" as const) : null,
		objectiveId: null,
		bangChung: {
			soNguoi: 3,
			soDonVi: 2,
			soDongY: 4,
			trich: [`Câu trích của ${ten}`],
		},
		y: [yDu(`${id}-y`, `Ý trong ${ten}`, id)],
	};
}

function chonChuaDu(): HoiYDu {
	const b = coBan();
	return {
		...b,
		hoiY: { ...b.hoiY, hanLuc: new Date(BAY_GIO - 2 * GIO).toISOString() },
		trangThai: "dang-gom",
		y: {
			khoa: false,
			lyDoKhoa: null,
			ds: [
				yDu("g1", "Ý chưa gom thứ nhất", null),
				yDu("g2", "Ý chưa gom thứ hai", null),
				yDu("c1-y", "Ý trong Giao lạnh", "c1"),
			],
		},
		chuDe: [
			chuDe("c1", "Giao lạnh", "chon", "Khách lạnh quay lại nhiều nhất."),
			chuDe("c2", "Kho miền Trung", null, ""),
			chuDe("yla", "Làm ứng dụng riêng cho tài xế", null, "", "y-la"),
		],
		banTruoc: { cau: BAN_TRUOC, boQua: false, vietBoi: "Lê Hải Đăng" },
		quyen: {
			moDuoc: true,
			gopDuoc: false,
			gomDuoc: true,
			chonDuoc: true,
			congBoDuoc: false,
			niemPhongDuoc: false,
			lyDoChuaCongBo: [
				{ ma: "y-chua-gom", chuDeId: null },
				{ ma: "thieu-ket-luan", chuDeId: "c2" },
				{ ma: "thieu-ket-luan", chuDeId: "yla" },
			],
		},
	};
}

function ketQua(): HoiYDu {
	const b = coBan();
	const congBoLuc = new Date(BAY_GIO - GIO).toISOString();
	const c1 = {
		...chuDe("c1", "Giao lạnh", "chon", LY_DO_900),
		objectiveId: "o1",
		bangChung: { soNguoi: 3, soDonVi: 2, trich: ["Câu trích"] },
	};
	return {
		...b,
		hoiY: {
			...b.hoiY,
			hanLuc: new Date(BAY_GIO - 20 * GIO).toISOString(),
			congBoLuc,
		},
		trangThai: "da-cong-bo",
		cuaToi: {
			y: [
				{
					...yCuaToi("t1", "Ý của tôi về giao lạnh"),
					chuDe: { id: "c1", ten: "Giao lạnh" },
					ketLuan: "chon",
					lyDo: LY_DO_900,
					objectiveId: "o1",
					hanhTrinh: {
						gopLuc: new Date(BAY_GIO - 40 * GIO).toISOString(),
						vaoChuDeLuc: new Date(BAY_GIO - 10 * GIO).toISOString(),
						ketLuanLuc: congBoLuc,
					},
				},
			],
			daHieu: false,
		},
		chuDe: [
			c1,
			{
				...chuDe("c2", "Kho miền Trung", "de-sau", "Để năm sau khi có vốn."),
				bangChung: { soNguoi: 1, soDonVi: 1, trich: [] },
			},
		],
		banTruoc: { cau: BAN_TRUOC, boQua: false, vietBoi: "Lê Hải Đăng" },
		ketQua: {
			cau: ["doi", "bo", "bo"],
			doi: 1,
			them: 0,
			boQua: false,
			vietBoi: "Lê Hải Đăng",
			chon: [
				{
					chuDeId: "c1",
					ten: "Giao lạnh",
					cauMucTieu: "Giao lạnh có lãi ở hai miền",
					noiBanTruoc: "cau-1",
					objectiveId: "o1",
				},
			],
		},
		quyen: { ...b.quyen, gopDuoc: false },
	};
}

const DU_LIEU = {
	gop: coBan,
	"het-han": (): HoiYDu => {
		const b = coBan();
		return {
			...b,
			hoiY: { ...b.hoiY, hanLuc: new Date(BAY_GIO - GIO).toISOString() },
			trangThai: "dang-gom",
			cuaToi: { y: [yCuaToi("t1", "Ý của tôi trước hạn")], daHieu: false },
			quyen: { ...b.quyen, gopDuoc: false },
		};
	},
	"viet-truoc": (): HoiYDu => {
		const b = coBan();
		return {
			...b,
			y: { khoa: true, lyDoKhoa: "chua-niem-phong", ds: [] },
			quyen: {
				...b.quyen,
				gopDuoc: false,
				moDuoc: true,
				niemPhongDuoc: true,
			},
		};
	},
	"chon-chua-du": chonChuaDu,
	"ket-qua": ketQua,
};

const DO_PHU: DoPhuDu = {
	cot: [{ ngay: "2026-12-07", nhan: "07/12" }],
	hang: [
		{ id: "goc", nhan: "OneHub", loai: "goc", cha: null, giaTri: [40] },
		{ id: "bp", nhan: "Kinh doanh", loai: "bo-phan", cha: "goc", giaTri: [50] },
		{
			id: "chua-xep",
			nhan: "Chưa xếp phòng ban",
			loai: "chua-xep",
			cha: "goc",
			giaTri: [null],
		},
	],
};

let hoiY: HoiYDu | null | "loi" | "treo";
let quanTri: boolean;
let loiAccess: boolean;
let nhan: NhanDu;
type VaoGhi = {
	readonly hoiYId?: string;
	readonly yId?: string;
	readonly noiDung?: string;
	readonly viSao?: string;
	readonly doBangGi?: string;
	readonly yIds?: readonly string[];
	readonly loiMo?: string;
	readonly cauHoi?: string;
	readonly hanLuc?: string;
	readonly dongNgay?: boolean;
	readonly nguoiChonUserId?: string;
};
type TuyChonGhi = {
	readonly onSuccess?: (kq: never, vao: never) => unknown;
	readonly onError?: (loi: never) => unknown;
};
const goi: { ten: string; vao: VaoGhi }[] = [];
let khiGop: () => void = () => {};
const loiGhi = new Map<string, string>();
let chuKy: ChuKyDu = CHU_KY;
const QUAN_TRI_MAU = [
	{ userId: "dang", name: "Lê Hải Đăng" },
	{ userId: "trang", name: "Phạm Thu Trang" },
];

type Vao = { readonly cycleId?: string; readonly hoiYId?: string } | undefined;

function thuTuc<T>(ten: string, doc: (vao: Vao) => Promise<T> | T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: (vao?: Vao) => ({
			queryKey: [ten, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (vao: VaoGhi) => {
				goi.push({ ten, vao });
				if (ten === "gopY") khiGop();
				const loi = loiGhi.get(ten);
				if (loi) throw new Error(loi);
				return { id: "moi", mucTieuIds: [], canhBao: null, ok: true };
			},
		}),
	};
}

const docHoiY = async () => {
	if (hoiY === "loi") throw new Error("máy chủ hỏng");
	if (hoiY === "treo") return new Promise<never>(() => {});
	return hoiY;
};

const DOT_BIEN = [
	"moHoiY",
	"suaHoiY",
	"gopY",
	"suaY",
	"goY",
	"dongY",
	"niemPhong",
	"taoChuDe",
	"suaChuDe",
	"goChuDe",
	"ganY",
	"ketLuanChuDe",
	"congBo",
	"hieuViSao",
] as const;

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("cycles", () => chuKy),
			access: thuTuc("access", () => {
				if (loiAccess) throw new Error("không đọc được quyền");
				return {
					canManageProgram: quanTri,
					headOf: { divisions: [], departments: [] },
				};
			}),
			hoiY: thuTuc("hoiY", docHoiY),
			hoiYNhan: thuTuc("hoiYNhan", () => nhan),
			hoiYDoPhu: thuTuc("hoiYDoPhu", () => DO_PHU),
			viecCuaToi: thuTuc("viecCuaToi", () => ({ viec: [], lienQuanOkr: true })),
			objective: thuTuc("objective", () => null),
			...Object.fromEntries(DOT_BIEN.map((t) => [t, thuTuc(t, () => null)])),
		},
		workspace: {
			members: thuTuc("members", () => ({
				rows: QUAN_TRI_MAU,
				total: QUAN_TRI_MAU.length,
				facetCounts: {},
			})),
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/hoi-y",
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

const { HoiYMan } = await import("@/app/(app)/[slug]/okr/hoi-y/hoi-y");
const { DauTrangOkrHoiY } = await import(
	"@/app/(app)/[slug]/okr/dau-trang-hoi-y"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(coDauTrang = false): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						{coDauTrang ? <DauTrangOkrHoiY chonChuKy={null} /> : null}
						<HoiYMan />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

async function nghi(ms = 0): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await nghi();
	}
	throw new Error(
		`không tới: ${moTa} — ${document.body.textContent?.slice(0, 300)}`,
	);
}

function trangThai(o: HTMLElement): string | null {
	return (
		o.querySelector("[data-trang-thai]")?.getAttribute("data-trang-thai") ??
		null
	);
}

async function moTrangThai(t: TrangThai9): Promise<HTMLElement> {
	if (t === "dang-tai") hoiY = "treo";
	else if (t === "loi") hoiY = "loi";
	else if (t === "trong-quan-tri" || t === "trong-thanh-vien") {
		hoiY = null;
		quanTri = t === "trong-quan-tri";
	} else hoiY = DU_LIEU[t]();
	const o = await mo();
	await cho(() => trangThai(o) === t, `trạng thái ${t}`);
	return o;
}

async function go(o: HTMLTextAreaElement | HTMLInputElement, chu: string) {
	const datGiaTri = Object.getOwnPropertyDescriptor(
		o instanceof HTMLTextAreaElement
			? HTMLTextAreaElement.prototype
			: HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGiaTri?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function nutCo(o: ParentNode, chu: string): HTMLButtonElement {
	const nut = [...o.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!nut) throw new Error(`không thấy nút «${chu}»`);
	return nut;
}

function oTheoNhan(o: HTMLElement, nhanO: string) {
	const label = [...o.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhanO,
	);
	const id = label?.getAttribute("for");
	const el = id ? document.getElementById(id) : null;
	if (!(el instanceof HTMLTextAreaElement) && !(el instanceof HTMLInputElement))
		throw new Error(`không thấy ô «${nhanO}»`);
	return el;
}

beforeEach(() => {
	hoiY = coBan();
	quanTri = false;
	loiAccess = false;
	nhan = {
		coHoiY: true,
		trangThai: "dang-mo",
		canGop: true,
		soChuDeChuaKetLuan: null,
	};
	goi.length = 0;
	khiGop = () => {};
	loiGhi.clear();
	chuKy = CHU_KY;
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("Hỏi ý — ma trận chín trạng thái", () => {
	for (const t of TRANG_THAI_9) {
		test(`${t}: phần tử riêng có mặt, tám phần tử kia vắng`, async () => {
			const o = await moTrangThai(t);
			if (t === "dang-tai") await nghi(20);
			const thay = Object.fromEntries(
				TRANG_THAI_9.map((k) => [
					k,
					document.querySelector(MA_TRAN[k]) !== null,
				]),
			);
			expect({ trangThai: trangThai(o), thay }).toEqual({
				trangThai: t,
				thay: Object.fromEntries(TRANG_THAI_9.map((k) => [k, k === t])),
			});
		});
	}
});

describe("Hỏi ý — ô soạn", () => {
	test("9 ký tự: FieldError câu ghim, gopY không được gọi", async () => {
		const o = await moTrangThai("gop");
		await go(oTheoNhan(o, "Ý của bạn"), "Chín ký t");
		await act(async () => nutCo(o, "Gửi").click());
		const loi = o.querySelector(
			'[data-khoi="o-soan"] [data-slot="field-error"]',
		);
		expect({
			loi: loi?.textContent,
			goi: goi.filter((g) => g.ten === "gopY").length,
		}).toEqual({ loi: "Ý cần ít nhất 10 ký tự — hiện có 9.", goi: 0 });
	});

	test("ý hợp lệ gửi đúng ba ô, «Vì sao» không lẫn sang «Đo bằng gì»", async () => {
		const o = await moTrangThai("gop");
		await go(oTheoNhan(o, "Ý của bạn"), "Bán gói giao lạnh theo tháng");
		await go(oTheoNhan(o, "Vì sao (tuỳ chọn)"), "Ba chuỗi nhà thuốc đã hỏi");
		await go(oTheoNhan(o, "Đo bằng gì (tuỳ chọn)"), "Số hợp đồng quý đầu");
		await act(async () => nutCo(o, "Gửi").click());
		await cho(() => goi.some((g) => g.ten === "gopY"), "gọi gopY");
		expect(goi.find((g) => g.ten === "gopY")?.vao).toEqual({
			hoiYId: "h1",
			noiDung: "Bán gói giao lạnh theo tháng",
			viSao: "Ba chuỗi nhà thuốc đã hỏi",
			doBangGi: "Số hợp đồng quý đầu",
		});
	});

	test("đủ 3 ý: ô soạn vắng, dòng «đã đủ 3 ý» lấy số từ trần", async () => {
		const b = coBan();
		hoiY = {
			...b,
			cuaToi: {
				y: [
					yCuaToi("t1", "Ý thứ nhất của tôi"),
					yCuaToi("t2", "Ý thứ hai của tôi"),
					yCuaToi("t3", "Ý thứ ba của tôi"),
				],
				daHieu: false,
			},
			quyen: { ...b.quyen, gopDuoc: false },
		};
		const o = await mo();
		await cho(() => trangThai(o) === "gop", "gop");
		expect({
			oSoan: o.querySelector('[data-khoi="o-soan"]') !== null,
			du: o.textContent?.includes("Bạn đã góp đủ 3 ý"),
			cuaBan: o.querySelectorAll('[data-khoi="y-cua-ban"] [data-y]').length,
		}).toEqual({ oSoan: false, du: true, cuaBan: 3 });
	});
});

describe("Hỏi ý — ý đồng nghiệp", () => {
	test("12 ý hiện 10 và «Hiện thêm 2 ý», bấm thì đủ 12", async () => {
		const o = await moTrangThai("gop");
		const dem = () =>
			o.querySelectorAll('[data-khoi="y-dong-nghiep"] [data-y]').length;
		const truoc = dem();
		const nut = nutCo(o, "Hiện thêm 2 ý");
		await act(async () => nut.click());
		expect({ truoc, sau: dem() }).toEqual({ truoc: 10, sau: 12 });
	});

	test("ý chứa <b>x</b> in nguyên văn, không thành thẻ, mang translate=no", async () => {
		const o = await moTrangThai("gop");
		const y = o.querySelector('[data-khoi="y-dong-nghiep"] [data-y="k1"]');
		const doan = [...(y?.querySelectorAll('[translate="no"]') ?? [])].find(
			(e) => e.textContent === Y_THE_B,
		);
		expect({
			chu: doan?.textContent,
			theB: y?.querySelectorAll("b").length,
			tenTacGia: y?.textContent?.includes("Người"),
		}).toEqual({ chu: Y_THE_B, theB: 0, tenTacGia: false });
	});
});

describe("Hỏi ý — người chọn kết luận", () => {
	test("thanh công bố liệt đúng từng điều thiếu thành liên kết tới thẻ có trong DOM, «Công bố» tắt", async () => {
		const o = await moTrangThai("chon-chua-du");
		const thanh = document.querySelector('[data-khoi="thanh-cong-bo"]');
		const lienKet = [...(thanh?.querySelectorAll("a") ?? [])];
		const dich = lienKet.map((a) => a.getAttribute("href") ?? "");
		const nut = thanh ? nutCo(thanh, "Công bố") : null;
		const ds = thanh?.querySelector("ul");
		expect({
			dsHien:
				ds !== null &&
				ds !== undefined &&
				!ds.classList.contains("hidden") &&
				getComputedStyle(ds).display !== "none",
			chu: lienKet.map((a) => a.textContent),
			dich,
			tonTai: dich.map((d) => document.getElementById(d.slice(1)) !== null),
			nutTat: nut?.disabled,
			dem: o.querySelector('[data-khoi="dem-ket-luan"]')?.textContent,
		}).toEqual({
			dsHien: true,
			chu: [
				"Còn ý chưa gom vào chủ đề",
				"«Kho miền Trung» — chưa kết luận",
				"«Làm ứng dụng riêng cho tài xế» — chưa kết luận",
			],
			dich: chonChuaDu().quyen.lyDoChuaCongBo.map((d) =>
				d.chuDeId === null ? "#y-chua-gom" : `#chu-de-${d.chuDeId}`,
			),
			tonTai: chonChuaDu().quyen.lyDoChuaCongBo.map(() => true),
			nutTat: true,
			dem: "1/3 chủ đề đã kết luận",
		});
	});

	test("thanh chọn nhiều vắng khi chưa chọn, «2 ý đã chọn» khi chọn hai", async () => {
		const o = await moTrangThai("chon-chua-du");
		const truoc = o.querySelector('[data-khoi="thanh-chon"]');
		const hop = [
			...o.querySelectorAll<HTMLButtonElement>(
				'[data-khoi="y-chua-gom"] [role="checkbox"]',
			),
		];
		for (const c of hop.slice(0, 2)) await act(async () => c.click());
		expect({
			truoc: truoc !== null,
			soHop: hop.length,
			sau: o
				.querySelector('[data-khoi="thanh-chon"]')
				?.querySelector('[data-slot="card-title"]')?.textContent,
		}).toEqual({ truoc: false, soHop: 2, sau: "2 ý đã chọn" });
	});

	test("một nút tô nền duy nhất là «Công bố»; sửa một thẻ thì nút lưu của thẻ đó bật", async () => {
		const o = await moTrangThai("chon-chua-du");
		const toNen = () =>
			[
				...document.querySelectorAll(
					'[data-slot="button"][data-variant="default"]',
				),
			].map((b) => b.textContent?.trim());
		const luu = () =>
			[
				...o.querySelectorAll<HTMLButtonElement>('[data-nut="luu-ket-luan"]'),
			].map((b) => b.disabled);
		const truoc = { toNen: toNen(), luu: luu() };
		const lyDo = o.querySelector<HTMLTextAreaElement>("#chu-de-c2 textarea");
		if (!lyDo) throw new Error("không thấy ô lý do của c2");
		await go(lyDo, "Để sang năm sau khi có vốn.");
		expect({ truoc, sau: luu() }).toEqual({
			truoc: { toNen: ["Công bố"], luu: [true, true, true] },
			sau: [true, false, true],
		});
	});

	test("khi không còn thiếu gì thì không có danh sách rỗng", async () => {
		const b = chonChuaDu();
		hoiY = {
			...b,
			quyen: { ...b.quyen, lyDoChuaCongBo: [], congBoDuoc: true },
		};
		const o = await mo();
		await cho(() => trangThai(o) === "chon-du", "chon-du");
		const thanh = document.querySelector('[data-khoi="thanh-cong-bo"]');
		expect({
			ul: thanh?.querySelector("ul") ?? null,
			nutDs: thanh?.querySelector("button[aria-controls]") ?? null,
			congBo: thanh ? nutCo(thanh, "Công bố").disabled : null,
		}).toEqual({ ul: null, nutDs: null, congBo: false });
	});
});

describe("Hỏi ý — dải mốc", () => {
	test("mốc đã qua mang dấu tích, mốc hiện tại mang dấu đặc, mọi bước hành trình đã xong", async () => {
		const o = await moTrangThai("ket-qua");
		const dau = Object.fromEntries(
			[...o.querySelectorAll("[data-khoi='dai-moc'] [data-moc]")].map((e) => [
				e.getAttribute("data-moc"),
				{
					dau: e.querySelector("[data-dau]")?.getAttribute("data-dau"),
					icon: e.querySelector("[data-dau] svg") !== null,
				},
			]),
		);
		const hanhTrinh = [
			...o.querySelectorAll("[data-khoi='hanh-trinh'] [data-dau]"),
		].map((e) => [e.getAttribute("data-dau"), e.querySelector("svg") !== null]);
		expect({ dau, hanhTrinh }).toEqual({
			dau: {
				mo: { dau: "qua", icon: true },
				han: { dau: "qua", icon: true },
				gom: { dau: "qua", icon: true },
				"cong-bo": { dau: "hien-tai", icon: true },
			},
			hanhTrinh: [
				["qua", true],
				["qua", true],
				["qua", true],
				["qua", true],
			],
		});
	});
});

describe("Hỏi ý — sửa lần hỏi ý", () => {
	test("không có quyen.moDuoc thì không có nút sửa", async () => {
		const o = await moTrangThai("gop");
		expect(o.querySelector('[data-nut="sua-hoi-y"]')).toBeNull();
	});

	test("quản trị sửa lời mở: gửi suaHoiY đúng trường đã đổi", async () => {
		const b = coBan();
		hoiY = { ...b, quyen: { ...b.quyen, moDuoc: true } };
		const o = await mo();
		await cho(() => trangThai(o) === "gop", "gop");
		const nut = o.querySelector<HTMLButtonElement>('[data-nut="sua-hoi-y"]');
		await act(async () => nut?.click());
		await cho(
			() => document.querySelector('[data-khoi="sheet-mo-hoi-y"]') !== null,
			"sheet sửa",
		);
		await go(oTheoNhan(document.body, "Lời mở"), "Lời mở mới cho năm tới");
		await act(async () => nutCo(document.body, "Lưu thay đổi").click());
		await cho(() => goi.some((g) => g.ten === "suaHoiY"), "gọi suaHoiY");
		expect(goi.find((g) => g.ten === "suaHoiY")?.vao).toEqual({
			hoiYId: "h1",
			loiMo: "Lời mở mới cho năm tới",
		});
	});

	test("«Huỷ» nằm trong SheetClose: bấm thì sheet đóng, không gọi ghi", async () => {
		const b = coBan();
		hoiY = { ...b, quyen: { ...b.quyen, moDuoc: true } };
		const o = await mo();
		await cho(() => trangThai(o) === "gop", "gop");
		const nut = o.querySelector<HTMLButtonElement>('[data-nut="sua-hoi-y"]');
		await act(async () => nut?.click());
		await cho(
			() => document.querySelector('[data-khoi="sheet-mo-hoi-y"]') !== null,
			"sheet sửa",
		);
		const huy = document.querySelector<HTMLButtonElement>(
			'[data-nut="huy-sheet"]',
		);
		await act(async () => huy?.click());
		await cho(
			() => document.querySelector('[data-khoi="sheet-mo-hoi-y"]') === null,
			"sheet đóng",
		);
		expect(goi.filter((g) => g.ten === "suaHoiY")).toEqual([]);
	});
});

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

async function chonTrongSelect(trigger: Element, nhanMuc: string) {
	await bam(trigger);
	const tuyChon = () => [...document.body.querySelectorAll('[role="option"]')];
	await cho(() => tuyChon().length > 0, "select mở");
	const muc = tuyChon().find((x) => x.textContent === nhanMuc);
	if (!muc) throw new Error(`select không có ${nhanMuc}`);
	await act(async () => {
		muc.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(() => tuyChon().length === 0, "select đóng");
}

function nutChonNguoi(): Element {
	const label = [...document.body.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === "Người chọn",
	);
	const trigger = document.getElementById(label?.getAttribute("for") ?? "");
	if (!trigger) throw new Error("không thấy ô người chọn");
	return trigger;
}

async function moSheetSua(h: HoiYDu): Promise<HTMLElement> {
	hoiY = { ...h, quyen: { ...h.quyen, moDuoc: true } };
	const o = await mo();
	await cho(
		() => o.querySelector('[data-nut="sua-hoi-y"]') !== null,
		"nút sửa",
	);
	await act(async () =>
		o.querySelector<HTMLButtonElement>('[data-nut="sua-hoi-y"]')?.click(),
	);
	await cho(
		() => document.querySelector('[data-khoi="sheet-mo-hoi-y"]') !== null,
		"sheet sửa",
	);
	return o;
}

function loiMay() {
	const e = document.querySelector('[data-khoi="loi-may"]');
	return {
		chu: e?.textContent ?? null,
		trongChan: e?.closest('[data-slot="sheet-footer"]') !== null,
		canhNut:
			e?.parentElement?.querySelector('button[type="submit"]') !== null &&
			e?.parentElement?.querySelector('button[type="submit"]') !== undefined,
	};
}

describe("Hỏi ý — sheet: câu từ chối của máy chủ và nhánh hết hạn", () => {
	test("mở: máy chủ từ chối thì câu ghim hiện nguyên văn ở chân sheet, cạnh «Mở»", async () => {
		hoiY = null;
		quanTri = true;
		const CAU = "Chu kỳ này đã có một lần hỏi ý.";
		loiGhi.set("moHoiY", CAU);
		const o = await mo();
		await cho(() => trangThai(o) === "trong-quan-tri", "trống quản trị");
		await act(async () =>
			o.querySelector<HTMLButtonElement>('[data-nut="mo-hoi-y"]')?.click(),
		);
		await cho(
			() => document.querySelector('[data-khoi="sheet-mo-hoi-y"]') !== null,
			"sheet mở",
		);
		await go(oTheoNhan(document.body, "Nhãn"), "Doanh thu năm");
		await go(oTheoNhan(document.body, "Giá trị"), "186 tỷ");
		await chonTrongSelect(nutChonNguoi(), "Lê Hải Đăng");
		await act(async () => nutCo(document.body, "Mở").click());
		await cho(() => goi.some((g) => g.ten === "moHoiY"), "gọi moHoiY");
		await cho(() => loiMay().chu !== null, "câu từ chối");
		expect(loiMay()).toEqual({ chu: CAU, trongChan: true, canhNut: true });
	});

	test("sửa: máy chủ từ chối thì câu ghim hiện nguyên văn ở chân sheet, cạnh «Lưu thay đổi»", async () => {
		const CAU =
			"Hạn mới phải từ bây giờ tới 168 giờ sau lúc mở — đặt bằng bây giờ là đóng sớm.";
		loiGhi.set("suaHoiY", CAU);
		await moSheetSua(coBan());
		await go(oTheoNhan(document.body, "Lời mở"), "Lời mở mới cho năm tới");
		await act(async () => nutCo(document.body, "Lưu thay đổi").click());
		await cho(() => loiMay().chu !== null, "câu từ chối");
		expect(loiMay()).toEqual({ chu: CAU, trongChan: true, canhNut: true });
	});

	test("đang gom: ô nội dung tắt, đổi người chọn gửi đúng { hoiYId, nguoiChonUserId }", async () => {
		await moSheetSua(DU_LIEU["het-han"]());
		const tat = {
			cauHoi: oTheoNhan(document.body, "Câu hỏi").disabled,
			loiMo: oTheoNhan(document.body, "Lời mở").disabled,
			conSo:
				document.querySelector<HTMLFieldSetElement>(
					'[data-khoi="sheet-mo-hoi-y"] fieldset',
				)?.disabled ?? null,
			gio: oTheoNhan(document.body, "Hạn — giờ").disabled,
			giaiThich:
				document.querySelector('[data-khoi="chi-nguoi-chon"]') !== null,
		};
		await chonTrongSelect(nutChonNguoi(), "Phạm Thu Trang");
		await act(async () => nutCo(document.body, "Lưu thay đổi").click());
		await cho(() => goi.some((g) => g.ten === "suaHoiY"), "gọi suaHoiY");
		const vao = JSON.parse(
			JSON.stringify(goi.find((g) => g.ten === "suaHoiY")?.vao),
		);
		expect({ tat, vao }).toEqual({
			tat: {
				cauHoi: true,
				loiMo: true,
				conSo: true,
				gio: true,
				giaiThich: true,
			},
			vao: { hoiYId: "h1", nguoiChonUserId: "trang" },
		});
	});
});

describe("Hỏi ý — sheet: đóng ngay", () => {
	test("đang mở: «Đóng ngay» hỏi lại bằng ConfirmDialog, chưa xác nhận thì không gửi; xác nhận thì gửi đúng { hoiYId, dongNgay: true }", async () => {
		await moSheetSua(coBan());
		const nut = document.querySelector<HTMLButtonElement>(
			'[data-nut="dong-ngay"]',
		);
		if (!nut) throw new Error("không thấy nút «Đóng ngay»");
		await act(async () => nut.click());
		await cho(
			() => document.querySelector('[role="alertdialog"]') !== null,
			"hỏi lại",
		);
		const hop = document.querySelector('[role="alertdialog"]');
		const truoc = goi.filter((g) => g.ten === "suaHoiY").length;
		if (!hop) throw new Error("không thấy hộp hỏi lại");
		await act(async () => nutCo(hop, "Đóng ngay").click());
		await cho(() => goi.some((g) => g.ten === "suaHoiY"), "gọi suaHoiY");
		expect({
			truoc,
			vao: JSON.parse(
				JSON.stringify(goi.find((g) => g.ten === "suaHoiY")?.vao),
			),
		}).toEqual({ truoc: 0, vao: { hoiYId: "h1", dongNgay: true } });
	});

	test("đang gom: không có «Đóng ngay»", async () => {
		await moSheetSua(DU_LIEU["het-han"]());
		expect(document.querySelector('[data-nut="dong-ngay"]')).toBeNull();
	});
});

describe("Hỏi ý — người chọn không còn là quản trị", () => {
	for (const [ten, trangThaiHoiY, man] of [
		["đang mở", "dang-mo", "gop"],
		["đang gom", "dang-gom", "het-han"],
	] as const)
		test(`${ten}: chưa niêm phong mà niemPhongDuoc false — không có khối viết trước, danh sách khoá nói rõ đã hết quyền`, async () => {
			const b = coBan();
			hoiY = {
				...b,
				hoiY:
					trangThaiHoiY === "dang-gom"
						? { ...b.hoiY, hanLuc: new Date(BAY_GIO - GIO).toISOString() }
						: b.hoiY,
				trangThai: trangThaiHoiY,
				y: { khoa: true, lyDoKhoa: "het-quyen-chon", ds: [] },
				quyen: { ...b.quyen, gopDuoc: false, niemPhongDuoc: false },
			};
			const o = await mo();
			await cho(() => trangThai(o) === man, man);
			expect({
				banVietTruoc: o.querySelector('[data-khoi="ban-viet-truoc"]') !== null,
				khoa: o.querySelector(
					'[data-khoi="y-bi-khoa"] [data-slot="empty-title"]',
				)?.textContent,
			}).toEqual({ banVietTruoc: false, khoa: "Bạn không còn quyền chọn" });
		});
});

describe("Hỏi ý — gom: trần chọn nhiều", () => {
	test(`chọn tới ${50} ý thì ô còn lại tắt và một dòng nói trần; thanh chọn đếm đúng ${50}`, async () => {
		const b = chonChuaDu();
		const nhieu = Array.from({ length: 51 }, (_, i) =>
			yDu(`n${i + 1}`, `Ý chưa gom số ${i + 1} cho năm tới`, null),
		);
		hoiY = { ...b, y: { ...b.y, ds: nhieu } };
		const o = await mo();
		await cho(() => trangThai(o) === "chon-chua-du", "chọn chưa đủ");
		const hop = () => [
			...o.querySelectorAll<HTMLButtonElement>(
				'[data-khoi="y-chua-gom"] [role="checkbox"]',
			),
		];
		for (const c of hop().slice(0, 50)) await act(async () => c.click());
		const cuoi = hop()[50];
		if (!cuoi) throw new Error("thiếu ô thứ 51");
		await act(async () => cuoi.click());
		expect({
			soHop: hop().length,
			tat: hop().filter((c) => c.disabled).length,
			cuoiChon: cuoi.getAttribute("aria-checked"),
			dem: o
				.querySelector('[data-khoi="thanh-chon"]')
				?.querySelector('[data-slot="card-title"]')?.textContent,
			tran: o.querySelector('[data-khoi="chon-toi-da"]')?.textContent,
		}).toEqual({
			soHop: 51,
			tat: 1,
			cuoiChon: "false",
			dem: "50 ý đã chọn",
			tran: "Mỗi lần đưa tối đa 50 ý vào chủ đề — bỏ chọn bớt để chọn ý khác.",
		});
	});
});

describe("Hỏi ý — kết quả ở khổ hẹp", () => {
	test("dấu tích «Bạn đã xác nhận hiểu.» nằm trong cùng dòng chữ; mô tả mục «Thêm» và câu viết trước cũ không bị cắt dòng", async () => {
		const b = ketQua();
		const kq = b.ketQua;
		if (!kq) throw new Error("thiếu kết quả");
		hoiY = {
			...b,
			cuaToi: { ...b.cuaToi, daHieu: true },
			ketQua: {
				...kq,
				them: 1,
				chon: [
					...kq.chon,
					{
						chuDeId: "c3",
						ten: "Tuyến riêng cho khách dược ở ba tỉnh miền Trung và Tây Nguyên",
						cauMucTieu: "Mở tuyến giao lạnh cho khách dược",
						noiBanTruoc: "moi",
						objectiveId: "o3",
					},
				],
			},
		};
		const o = await mo();
		await cho(() => trangThai(o) === "ket-qua", "kết quả");
		const daHieu = o.querySelector('[data-khoi="da-hieu"]');
		const moTa = (chon: string) =>
			o
				.querySelector(chon)
				?.closest('[data-slot="item"]')
				?.querySelector('[data-slot="item-description"]');
		const catDong = (e: Element | null | undefined) =>
			/line-clamp|truncate/.test(e?.getAttribute("class") ?? "");
		expect({
			daHieu: daHieu?.textContent,
			bienThe: daHieu?.getAttribute("data-variant"),
			dauTichTrongDong: daHieu?.firstElementChild?.tagName.toLowerCase(),
			them: moTa('[data-giu-bo="them"]')?.textContent,
			themCat: catDong(moTa('[data-giu-bo="them"]')),
			doiCat: catDong(moTa('[data-giu-bo="doi"]')),
		}).toEqual({
			daHieu: "Bạn đã xác nhận hiểu.",
			bienThe: "xong",
			dauTichTrongDong: "svg",
			them: "Từ chủ đề «Tuyến riêng cho khách dược ở ba tỉnh miền Trung và Tây Nguyên» — không có trong bản viết trước.",
			themCat: false,
			doiCat: false,
		});
	});
});

describe("Hỏi ý — trạng thái biên", () => {
	test("không giải được chu kỳ nào thì hiện màn trống, không skeleton mãi", async () => {
		chuKy = {
			cycles: CHU_KY.cycles.filter((c) => c.phase === "dang-chay"),
			currentId: null,
		};
		hoiY = coBan();
		const o = await mo();
		await cho(() => trangThai(o) === "trong-thanh-vien", "trống thành viên");
		expect(o.querySelector('[data-khoi="trong-thanh-vien"]')).not.toBeNull();
	});

	test("danh sách khoá mà thiếu mã lý do vẫn có tiêu đề", async () => {
		const b = DU_LIEU["viet-truoc"]();
		hoiY = { ...b, y: { ...b.y, lyDoKhoa: null } };
		const o = await mo();
		await cho(() => trangThai(o) === "viet-truoc", "viết trước");
		expect(
			o.querySelector('[data-khoi="y-bi-khoa"] [data-slot="empty-title"]')
				?.textContent,
		).toBe("Niêm phong trước khi đọc ý");
	});
});

describe("Hỏi ý — lỗi quyền", () => {
	test("access hỏng thì hiện lỗi kèm «Thử lại», không giả làm màn trống", async () => {
		hoiY = null;
		loiAccess = true;
		const o = await mo();
		await cho(() => trangThai(o) === "loi", "lỗi");
		expect(nutCo(o, "Thử lại")).not.toBeNull();
	});
});

describe("Hỏi ý — kết quả", () => {
	test("lý do 900 ký tự hiện đủ, không phần tử line-clamp nào bao nó", async () => {
		const o = await moTrangThai("ket-qua");
		const khoiCuaBan = o.querySelector('[data-khoi="y-cua-ban-ket-qua"]');
		const doan = [...(khoiCuaBan?.querySelectorAll("*") ?? [])].find(
			(e) => e.textContent === LY_DO_900,
		);
		const bao: string[] = [];
		for (let e = doan ?? null; e; e = e.parentElement)
			if (/line-clamp|truncate/.test(e.getAttribute("class") ?? ""))
				bao.push(e.getAttribute("data-slot") ?? e.tagName);
		expect({
			dai: LY_DO_900.length,
			thay: doan?.textContent === LY_DO_900,
			khongDich: doan?.closest('[translate="no"]') !== null,
			bao,
			hieu: nutCo(o, "Tôi hiểu vì sao") !== null,
		}).toEqual({ dai: 900, thay: true, khongDich: true, bao: [], hieu: true });
	});
});

describe("Hỏi ý — huy hiệu tab", () => {
	test("«Mới» khi còn góp được, mất ngay sau khi gửi ý", async () => {
		khiGop = () => {
			nhan = { ...nhan, canGop: false };
		};
		const o = await mo(true);
		await cho(() => trangThai(o) === "gop", "gop");
		const huyHieu = () =>
			o.querySelector('[role="tab"][href^="/ws/okr/hoi-y"] [data-slot="badge"]')
				?.textContent ?? null;
		await cho(() => huyHieu() !== null, "huy hiệu");
		const truoc = huyHieu();
		await go(oTheoNhan(o, "Ý của bạn"), "Bán gói giao lạnh theo tháng");
		await act(async () => nutCo(o, "Gửi").click());
		await cho(() => huyHieu() === null, "mất huy hiệu");
		expect({ truoc, sau: huyHieu() }).toEqual({ truoc: "Mới", sau: null });
	});

	test("người chọn đang gom thấy số chủ đề chưa kết luận; không việc thì không huy hiệu", async () => {
		nhan = {
			coHoiY: true,
			trangThai: "dang-gom",
			canGop: false,
			soChuDeChuaKetLuan: 2,
		};
		const a = await mo(true);
		const huyHieu = (o: HTMLElement) =>
			o.querySelector('[role="tab"][href^="/ws/okr/hoi-y"] [data-slot="badge"]')
				?.textContent ?? null;
		await cho(() => huyHieu(a) !== null, "huy hiệu số");
		const so = huyHieu(a);
		nhan = {
			coHoiY: true,
			trangThai: "dang-gom",
			canGop: false,
			soChuDeChuaKetLuan: 0,
		};
		const b = await mo(true);
		await cho(() => trangThai(b) !== null, "tải xong");
		await nghi(10);
		expect({ so, khong: huyHieu(b) }).toEqual({ so: "2", khong: null });
	});
});
