import {
	afterAll,
	afterEach,
	describe,
	expect,
	it,
	mock,
	test,
} from "bun:test";
import { AUTH_COOKIE_PREFIX } from "@crm/auth/cookies";
import { NextRequest } from "next/server";
import {
	isValidElement,
	type ReactElement,
	type ReactNode,
	Suspense,
} from "react";
import { type LyDoRong, lyDoRong } from "@/app/(app)/[slug]/okr/ly-do-rong";
import { THU_TUC_HOP_TUAN } from "@/lib/hop-tuan-proxy";
import { okrAccessOutput } from "../../api/src/okr/okr.contracts";
import {
	type HopTuanOutput,
	hopTuanOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { type OSo, oSoHop } from "../app/(app)/[slug]/okr/o-so-hop";
import { duongChuyenHopTuan } from "../app/(app)/[slug]/okr/theo-don-vi/chuyen-hop-tuan";
import { proxy } from "../proxy";

type TuTin = "cao" | "vua" | "thap" | null;

const CHU_KY = { startsOn: "2026-10-01", endsOn: "2026-12-31" };
const THU_TU_O: OSo["khoa"][] = [
	"da-cap-nhat",
	"dang-ban",
	"tu-tin-thap",
	"ngay-con",
];
const CHU_HONG = /NaN|undefined|-\d/;

function dong(id: string, tuTin: TuTin) {
	return {
		keyResultId: id,
		objectiveId: `mt-${id}`,
		tieuDe: `KR ${id}`,
		mucTieu: `Mục tiêu ${id}`,
		chuTen: "Trần Minh Hải",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin,
		ghiChu: null,
		lyDo: [],
	};
}

function hop(dangBan: TuTin[], conLai: TuTin[]): HopTuanOutput {
	return hopTuanOutput.parse({
		tuan: "2026-11-09",
		tuanDau: false,
		daCapNhat: 3,
		tongKr: dangBan.length + conLai.length,
		dangBan: dangBan.map((t, i) => dong(`b${i}`, t)),
		conLai: conLai.map((t, i) => dong(`c${i}`, t)),
	});
}

const MAC_DINH = hop(["thap", "vua"], ["thap", null, "cao"]);

type Ca = {
	ten: string;
	d: HopTuanOutput;
	homNay: string;
	khoa: OSo["khoa"];
	giaTri: string;
	moTa?: OSo["moTa"];
};

const MA_TRAN: Ca[] = [
	{
		ten: "dau-ky",
		d: MAC_DINH,
		homNay: "2026-09-30T17:30:00Z",
		khoa: "ngay-con",
		giaTri: "92",
		moTa: { loai: "ket-thuc", ngay: "31/12" },
	},
	{
		ten: "truoc-bat-dau",
		d: MAC_DINH,
		homNay: "2026-09-30T16:00:00Z",
		khoa: "ngay-con",
		giaTri: "—",
		moTa: { loai: "bat-dau", ngay: "01/10" },
	},
	{
		ten: "ngay-cuoi",
		d: MAC_DINH,
		homNay: "2026-12-31T05:00:00Z",
		khoa: "ngay-con",
		giaTri: "1",
		moTa: { loai: "ket-thuc", ngay: "31/12" },
	},
	{
		ten: "da-qua",
		d: MAC_DINH,
		homNay: "2027-01-01T03:00:00Z",
		khoa: "ngay-con",
		giaTri: "0",
		moTa: { loai: "da-ket-thuc", ngay: "31/12" },
	},
	{
		ten: "khong-thap",
		d: hop(["vua", "cao"], ["cao", null]),
		homNay: "2026-11-12T03:00:00Z",
		khoa: "tu-tin-thap",
		giaTri: "0",
		moTa: { loai: "moi-nhat", ngay: null },
	},
	{
		ten: "chua-tu-tin",
		d: hop([null, null], [null]),
		homNay: "2026-11-12T03:00:00Z",
		khoa: "tu-tin-thap",
		giaTri: "0",
		moTa: { loai: "moi-nhat", ngay: null },
	},
];

function soat(
	ten: string,
	o: OSo[],
	nhan: string,
	loi: string[],
): Map<OSo["khoa"], OSo> {
	const khoa = o.map((x) => x.khoa);
	if (khoa.join(",") !== THU_TU_O.join(","))
		loi.push(`${nhan}: ${ten} thu tu o ${khoa.join(",")}`);
	for (const x of o) {
		const chu = `${x.giaTri}|${x.moTa.ngay ?? ""}`;
		if (CHU_HONG.test(chu)) loi.push(`${nhan}: ${ten} o ${x.khoa} in ${chu}`);
	}
	return new Map(o.map((x) => [x.khoa, x]));
}

describe("htmb-o-so", () => {
	test("bon o cua tuan theo lich gio Viet Nam", () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of MA_TRAN) {
			const o = oSoHop(ca.d, CHU_KY, new Date(ca.homNay));
			const theoKhoa = soat(ca.ten, o, "htmb-o-so", loi);
			const thuc = theoKhoa.get(ca.khoa);
			if (thuc?.giaTri !== ca.giaTri)
				loi.push(`htmb-o-so: ${ca.ten} ra ${thuc?.giaTri}, can ${ca.giaTri}`);
			if (
				ca.moTa &&
				(thuc?.moTa.loai !== ca.moTa.loai || thuc?.moTa.ngay !== ca.moTa.ngay)
			)
				loi.push(
					`htmb-o-so: ${ca.ten} mo ta ${thuc?.moTa.loai} ${thuc?.moTa.ngay}, can ${ca.moTa.loai} ${ca.moTa.ngay}`,
				);
			dem += 1;
		}
		const tuan = soat(
			"tuan",
			oSoHop(MAC_DINH, CHU_KY, new Date("2026-11-12T03:00:00Z")),
			"htmb-o-so",
			loi,
		);
		const chuoi = [...tuan.values()]
			.map((x) => `${x.khoa}=${x.giaTri}:${x.moTa.loai}:${x.moTa.ngay}`)
			.join(" ");
		const can =
			"da-cap-nhat=3/5:tuan:09/11 dang-ban=2:can-ban:null tu-tin-thap=2:moi-nhat:null ngay-con=50:ket-thuc:31/12";
		if (chuoi !== can) loi.push(`htmb-o-so: tuan ra ${chuoi}, can ${can}`);
		expect(loi).toEqual([]);
		expect(dem).toBe(6);
	});
});

describe("htmb-bien-o-so", () => {
	test("chu ky mot ngay va ngay ket thuc truoc ngay bat dau", () => {
		const loi: string[] = [];
		const motNgay = soat(
			"mot-ngay",
			oSoHop(
				MAC_DINH,
				{ startsOn: "2026-11-12", endsOn: "2026-11-12" },
				new Date("2026-11-12T03:00:00Z"),
			),
			"htmb-bien-o-so",
			loi,
		);
		if (motNgay.get("ngay-con")?.giaTri !== "1")
			loi.push(
				`htmb-bien-o-so: mot-ngay ra ${motNgay.get("ngay-con")?.giaTri}, can 1`,
			);
		for (const homNay of [
			"2026-11-01T03:00:00Z",
			"2026-11-12T03:00:00Z",
			"2026-11-20T03:00:00Z",
		]) {
			soat(
				`nguoc-${homNay.slice(0, 10)}`,
				oSoHop(
					MAC_DINH,
					{ startsOn: "2026-11-15", endsOn: "2026-11-10" },
					new Date(homNay),
				),
				"htmb-bien-o-so",
				loi,
			);
		}
		const rong = soat(
			"rong",
			oSoHop(hop([], []), CHU_KY, new Date("2026-11-12T03:00:00Z")),
			"htmb-bien-o-so",
			loi,
		);
		if (rong.get("da-cap-nhat")?.giaTri !== "3/0")
			loi.push(
				`htmb-bien-o-so: rong ra ${rong.get("da-cap-nhat")?.giaTri}, can 3/0`,
			);
		expect(loi).toEqual([]);
	});
});

const HOM_NAY_VN_SAU_NUA_DEM = new Date("2026-10-24T17:30:00Z");
const NGAY_BAT_DAU_HOM_NAY = "2026-10-25";
const NGAY_BAT_DAU_SAU = "2026-10-27";

function hopLyDo(v: { tongKr: number; daCapNhat: number; tuanDau: boolean }) {
	return hopTuanOutput.parse({
		tuan: "2026-10-19",
		tuanDau: v.tuanDau,
		daCapNhat: v.daCapNhat,
		tongKr: v.tongKr,
		dangBan: [],
		conLai: [],
	});
}

type CaLyDo = {
	ten: string;
	hop: ReturnType<typeof hop>;
	chuKy: { phase: string; startsOn: string };
	can: LyDoRong;
};

const MA_TRAN_LY_DO: readonly CaLyDo[] = [
	{
		ten: "lap-ke-hoach",
		hop: hopLyDo({ tongKr: 0, daCapNhat: 0, tuanDau: false }),
		chuKy: { phase: "lap-ke-hoach", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-toi-ngay",
		hop: hopLyDo({ tongKr: 3, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_SAU },
		can: "chu-ky-chua-chay",
	},
	{
		ten: "chua-kr",
		hop: hopLyDo({ tongKr: 0, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-kr-cong-bo",
	},
	{
		ten: "chua-cap-nhat",
		hop: hopLyDo({ tongKr: 4, daCapNhat: 0, tuanDau: true }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: "chua-ai-cap-nhat",
	},
	{
		ten: "co-cap-nhat",
		hop: hopLyDo({ tongKr: 4, daCapNhat: 2, tuanDau: false }),
		chuKy: { phase: "dang-chay", startsOn: NGAY_BAT_DAU_HOM_NAY },
		can: null,
	},
];

describe("htmb-ly-do-ham", () => {
	it("lyDoRong chon dung ly do cho tung o cua ma tran", () => {
		let dem = 0;
		for (const ca of MA_TRAN_LY_DO) {
			const ra = lyDoRong({
				hop: ca.hop,
				chuKy: ca.chuKy,
				homNay: HOM_NAY_VN_SAU_NUA_DEM,
			});
			expect(ra, `htmb-ly-do: ${ca.ten} ra ${ra}`).toBe(ca.can);
			dem += 1;
		}
		expect(dem).toBe(5);
	});
});

const DON_P1 = { loai: "pb", id: "P1" } as const;

type CaChuyen = {
	ten: string;
	vao: string;
	can: Record<string, string> | null;
};

const MA_TRAN_CHUYEN: readonly CaChuyen[] = [
	{
		ten: "hop-tuan-khong-don",
		vao: "xemOkr=hop-tuan",
		can: { donOkr: "pb:P1", xemOkr: "hop-tuan" },
	},
	{
		ten: "giu-ky",
		vao: "xemOkr=hop-tuan&kyOkr=q4",
		can: { donOkr: "pb:P1", xemOkr: "hop-tuan", kyOkr: "q4" },
	},
	{ ten: "donOkr=goc bi chuyen", vao: "donOkr=goc&xemOkr=hop-tuan", can: null },
	{
		ten: "donOkr=pb:X bi chuyen",
		vao: "donOkr=pb:X&xemOkr=hop-tuan",
		can: null,
	},
	{ ten: "xemOkr=viec bi chuyen", vao: "xemOkr=viec", can: null },
	{ ten: "khong tham so bi chuyen", vao: "", can: null },
];

describe("htmb-chuyen", () => {
	test("duongChuyenHopTuan chi chuyen Hop tuan khong kem don vi", () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of MA_TRAN_CHUYEN) {
			const ra = duongChuyenHopTuan(new URLSearchParams(ca.vao), DON_P1);
			if (ca.can === null) {
				if (ra !== null) loi.push(`htmb-chuyen: ${ca.ten}`);
			} else if (ra === null || !ra.startsWith("?")) {
				loi.push(`htmb-chuyen: ${ca.ten} khong chuyen`);
			} else {
				const thuc = Object.fromEntries(new URLSearchParams(ra.slice(1)));
				if (JSON.stringify(thuc) !== JSON.stringify(ca.can))
					loi.push(
						`htmb-chuyen: ${ca.ten} ra ${JSON.stringify(thuc)}, can ${JSON.stringify(ca.can)}`,
					);
			}
			dem += 1;
		}
		expect(loi).toEqual([]);
		expect(dem).toBe(6);
	});
});

describe("htmb-bien-chuyen", () => {
	test("kyOkr khong ton tai giu nguyen va dich khong chuyen lan nua", () => {
		const ra = duongChuyenHopTuan(
			new URLSearchParams("xemOkr=hop-tuan&kyOkr=khong-co&phuTrachOkr=u1"),
			DON_P1,
		);
		expect(ra, "htmb-bien-chuyen: khong chuyen").not.toBeNull();
		const dich = new URLSearchParams((ra ?? "").slice(1));
		expect(dich.get("kyOkr"), "htmb-bien-chuyen: mat kyOkr").toBe("khong-co");
		expect(dich.get("phuTrachOkr"), "htmb-bien-chuyen: mat tham so khac").toBe(
			"u1",
		);
		expect(
			duongChuyenHopTuan(dich, DON_P1),
			"htmb-bien-chuyen: dich chuyen lan nua",
		).toBeNull();
	});
});

const nguoi = (id: string) => ({ id, name: id, email: `${id}@thu.test` });

const ACCESS_P1 = okrAccessOutput.parse({
	canManageProgram: true,
	headOf: { divisions: [], departments: ["P1"] },
});

const CAY_P1 = orgTreeOutput.parse({
	divisions: [
		{
			id: "B",
			name: "Bộ phận B",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [
				{
					id: "P1",
					name: "Phòng P1",
					moTa: "",
					position: 0,
					divisionId: "B",
					head: nguoi("u-xem"),
					stepCount: 0,
					okrMo: 0,
					people: [{ ...nguoi("u-xem"), primary: true }],
				},
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [
		{
			...nguoi("u-xem"),
			primaryDepartmentId: "P1",
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

type XuLy = () => Promise<unknown>;
const xuLyGia = new Map<string, XuLy>();
let dangGia = false;

const trpcGia = new Proxy(
	{},
	{
		get: (_d, nhom: string) =>
			new Proxy(
				{},
				{
					get: (_c, thuTuc: string) => ({
						queryOptions: () => ({ queryKey: [`${nhom}.${thuTuc}`] }),
					}),
				},
			),
	},
);

const goiGia = (o: { queryKey: string[] }) =>
	(xuLyGia.get(o.queryKey[0] ?? "") ?? (async () => null))();

const queryClientGia = {
	fetchQuery: goiGia,
	prefetchQuery: async (o: { queryKey: string[] }) => {
		await goiGia(o).catch(() => undefined);
	},
};

const navigationThat = await import("next/dist/client/components/navigation");
mock.module("next/navigation", () => ({ ...navigationThat }));
const sessionThat = await import("@/lib/session");
mock.module("@/lib/session", () => ({
	...sessionThat,
	requireSession: async () =>
		dangGia
			? { user: { id: "u-xem", email: "u-xem@thu.test", name: "u-xem" } }
			: sessionThat.requireSession(),
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: unknown }) => children,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => trpcGia,
	getServerQueryClient: () => queryClientGia,
	getServerTrpcClient: () => ({}),
}));

const { default: TheoDonViPage } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/page"
);
const { getURLFromRedirectError } = await import(
	"next/dist/client/components/redirect"
);
const { isRedirectError } = await import(
	"next/dist/client/components/redirect-error"
);

afterAll(() => {
	dangGia = false;
	xuLyGia.clear();
});

function timSuspense(nut: ReactNode): ReactElement | null {
	if (Array.isArray(nut)) {
		for (const con of nut) {
			const thay = timSuspense(con);
			if (thay) return thay;
		}
		return null;
	}
	if (!isValidElement(nut)) return null;
	if (nut.type === Suspense) return nut;
	return timSuspense((nut.props as { children?: ReactNode }).children);
}

type PropsNoiDung = { searchParams: Promise<Record<string, string>> };
type NoiDungTrang = (p: PropsNoiDung) => Promise<ReactNode>;

async function goiTrang(tham: Record<string, string>): Promise<ReactNode> {
	const cay = TheoDonViPage({ searchParams: Promise.resolve(tham) });
	const s = timSuspense(cay);
	const noiDung = s ? (s.props as { children?: ReactNode }).children : null;
	if (!isValidElement<PropsNoiDung>(noiDung))
		throw new Error(
			"htmb-chuyen-loi: page.tsx khong co noi dung trong Suspense",
		);
	const ham = noiDung.type as NoiDungTrang;
	return ham(noiDung.props);
}

function datGia(v: { access: XuLy; tree: XuLy }) {
	dangGia = true;
	xuLyGia.clear();
	xuLyGia.set("okr.access", v.access);
	xuLyGia.set("org.tree", v.tree);
}

async function ketCuc(tham: Record<string, string>) {
	try {
		return { tra: await goiTrang(tham), loi: null };
	} catch (loi) {
		return {
			tra: null,
			loi: loi instanceof Error ? loi : new Error(String(loi)),
		};
	}
}

const TRANG = "http://localhost/ws/okr/bo-okr?xemOkr=hop-tuan";

const dichTho = (loi: Error | null): string | null =>
	isRedirectError(loi) ? getURLFromRedirectError(loi) : null;

function dichCua(loi: Error | null): URL | null {
	const tho = dichTho(loi);
	return tho === null ? null : new URL(tho, TRANG);
}

const HOP_TUAN = { xemOkr: "hop-tuan" };

describe("htmb-chuyen-loi", () => {
	test("okr.access loi thi trang nem chinh loi ay", async () => {
		const hong = new Error("okr.access hong");
		datGia({
			access: async () => {
				throw hong;
			},
			tree: async () => CAY_P1,
		});
		const kq = await ketCuc(HOP_TUAN);
		if (kq.loi !== hong)
			throw new Error(
				`htmb-chuyen-loi: loi roi ve goc (${dichCua(kq.loi)?.search ?? String(kq.loi)})`,
			);
	});

	test("org.tree loi thi trang nem chinh loi ay", async () => {
		const hong = new Error("org.tree hong");
		datGia({
			access: async () => ACCESS_P1,
			tree: async () => {
				throw hong;
			},
		});
		const kq = await ketCuc(HOP_TUAN);
		if (kq.loi !== hong)
			throw new Error(
				`htmb-chuyen-loi: org.tree loi roi ve goc (${dichCua(kq.loi)?.search ?? String(kq.loi)})`,
			);
	});

	test("doi chung: ca hai binh thuong thi chuyen sang bo cua nguoi xem", async () => {
		datGia({ access: async () => ACCESS_P1, tree: async () => CAY_P1 });
		const kq = await ketCuc({ ...HOP_TUAN, kyOkr: "q4" });
		const dich = dichCua(kq.loi);
		expect(
			dich,
			`htmb-chuyen-loi: khong NEXT_REDIRECT (${String(kq.loi)})`,
		).not.toBeNull();
		expect(
			dichTho(kq.loi)?.startsWith("?"),
			"htmb-chuyen-loi: dich roi khoi trang bo OKR",
		).toBe(true);
		expect(dich?.pathname).toBe("/ws/okr/bo-okr");
		expect(dich?.searchParams.get("donOkr")).toBe("pb:P1");
		expect(dich?.searchParams.get("xemOkr")).toBe("hop-tuan");
		expect(dich?.searchParams.get("kyOkr")).toBe("q4");
	});
});

const SLUG_PROXY = "ws";
const COOKIE_PROXY = `${AUTH_COOKIE_PREFIX}.session_token=abc.def`;
const fetchThat = globalThis.fetch;

type TraApi = () => Promise<Response>;

type ThanApi<T> = { result: { data: T } } | { error: { message?: string } };

const traJson = <T>(than: ThanApi<T>, status = 200): Response =>
	new Response(JSON.stringify(than), {
		status,
		headers: { "content-type": "application/json" },
	});

const traDuLieu = <T>(data: T): Response => traJson({ result: { data } });

const API_MAC_DINH = {
	"workspace.get": async () =>
		traDuLieu({
			slug: SLUG_PROXY,
			onboarded: true,
			canRename: true,
			viewerRole: "owner",
		}),
	"settings.researchKey": async () =>
		traDuLieu({ configured: true, hint: "••••9876", canManage: true }),
	[THU_TUC_HOP_TUAN.quyen]: async () => traDuLieu(ACCESS_P1),
	[THU_TUC_HOP_TUAN.cay]: async () => traDuLieu(CAY_P1),
	[THU_TUC_HOP_TUAN.nguoiXem]: async () =>
		traDuLieu({ id: "u-xem", name: "u-xem", email: "u-xem@thu.test" }),
} satisfies Record<string, TraApi>;

const THU_TUC_THEM = Object.values(THU_TUC_HOP_TUAN);

function gaApi(de: Record<string, TraApi> = {}) {
	const dem = new Map<string, number>();
	const bang = new Map<string, TraApi>([
		...Object.entries(API_MAC_DINH),
		...Object.entries(de),
	]);
	globalThis.fetch = (async (vao: string | URL | Request) => {
		const thuTuc = new URL(String(vao)).pathname.split("/").at(-1) ?? "";
		dem.set(thuTuc, (dem.get(thuTuc) ?? 0) + 1);
		const tra = bang.get(thuTuc);
		if (!tra) throw new Error(`htmb-proxy: goi la ${thuTuc}`);
		return tra();
	}) as unknown as typeof fetch;
	return () => THU_TUC_THEM.reduce((t, k) => t + (dem.get(k) ?? 0), 0);
}

async function quaProxy(duong: string) {
	return proxy(
		new NextRequest(new URL(duong, "http://localhost:3000"), {
			headers: { cookie: COOKIE_PROXY },
		}),
	);
}

const viTriCua = (tra: Response): URL | null => {
	const loc = tra.headers.get("location");
	return loc ? new URL(loc) : null;
};

type CaProxy = {
	ten: string;
	vao: string;
	can: Record<string, string> | null;
	goiThem: number;
};

const MA_TRAN_PROXY: readonly CaProxy[] = [
	{
		ten: "hop-tuan-khong-don",
		vao: `/${SLUG_PROXY}/okr/bo-okr?xemOkr=hop-tuan`,
		can: { donOkr: "pb:P1", xemOkr: "hop-tuan" },
		goiThem: 3,
	},
	{
		ten: "giu-ky",
		vao: `/${SLUG_PROXY}/okr/bo-okr?xemOkr=hop-tuan&kyOkr=q4`,
		can: { donOkr: "pb:P1", xemOkr: "hop-tuan", kyOkr: "q4" },
		goiThem: 3,
	},
	{
		ten: "khong-slug",
		vao: "/okr/bo-okr?xemOkr=hop-tuan",
		can: { donOkr: "pb:P1", xemOkr: "hop-tuan" },
		goiThem: 3,
	},
	{
		ten: "donOkr=goc",
		vao: `/${SLUG_PROXY}/okr/bo-okr?donOkr=goc&xemOkr=hop-tuan`,
		can: null,
		goiThem: 0,
	},
	{
		ten: "donOkr=pb:X",
		vao: `/${SLUG_PROXY}/okr/bo-okr?donOkr=pb:X&xemOkr=hop-tuan`,
		can: null,
		goiThem: 0,
	},
	{
		ten: "khong-xemOkr",
		vao: `/${SLUG_PROXY}/okr/bo-okr`,
		can: null,
		goiThem: 0,
	},
	{
		ten: "xemOkr=viec",
		vao: `/${SLUG_PROXY}/okr/bo-okr?xemOkr=viec`,
		can: null,
		goiThem: 0,
	},
	{
		ten: "duong-khac",
		vao: `/${SLUG_PROXY}/companies?xemOkr=hop-tuan`,
		can: null,
		goiThem: 0,
	},
];

describe("htmb-proxy", () => {
	afterEach(() => {
		globalThis.fetch = fetchThat;
	});

	test("proxy tra 307 truoc khi dung trang, chi cho Hop tuan khong kem don vi", async () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of MA_TRAN_PROXY) {
			const goiThem = gaApi();
			const tra = await quaProxy(ca.vao);
			const viTri = viTriCua(tra);
			if (goiThem() !== ca.goiThem)
				loi.push(
					`htmb-proxy: ${ca.ten} goi them ${goiThem()} API, can ${ca.goiThem}`,
				);
			if (ca.can === null) {
				if (tra.status === 307 || viTri !== null)
					loi.push(
						`htmb-proxy: ${ca.ten} bi chuyen (${tra.status} ${viTri?.search ?? "-"})`,
					);
			} else if (tra.status !== 307 || viTri === null) {
				loi.push(`htmb-proxy: ${ca.ten} khong chuyen (${tra.status})`);
			} else {
				if (viTri.pathname !== `/${SLUG_PROXY}/okr/bo-okr`)
					loi.push(`htmb-proxy: ${ca.ten} chuyen sai duong ${viTri.pathname}`);
				const thuc = Object.fromEntries(
					[...viTri.searchParams.entries()].sort(),
				);
				const can = Object.fromEntries(Object.entries(ca.can).sort());
				if (JSON.stringify(thuc) !== JSON.stringify(can))
					loi.push(
						`htmb-proxy: ${ca.ten} ra ${JSON.stringify(thuc)}, can ${JSON.stringify(can)}`,
					);
			}
			dem += 1;
		}
		expect(loi).toEqual([]);
		expect(dem).toBe(8);
	});

	test("doc API loi hay sai hinh thi proxy di tiep cho trang tu xu", async () => {
		const HONG: [string, Record<string, TraApi>][] = [
			[
				"okr.access 500",
				{ [THU_TUC_HOP_TUAN.quyen]: async () => traJson({ error: {} }, 500) },
			],
			[
				"org.tree loi mang",
				{
					[THU_TUC_HOP_TUAN.cay]: async () => {
						throw new Error("connect ECONNREFUSED");
					},
				},
			],
			[
				"users.me 401",
				{
					[THU_TUC_HOP_TUAN.nguoiXem]: async () =>
						traJson({ error: { message: "UNAUTHORIZED" } }, 401),
				},
			],
			[
				"org.tree sai hinh",
				{ [THU_TUC_HOP_TUAN.cay]: async () => traDuLieu({ divisions: "x" }) },
			],
		];
		const loi: string[] = [];
		for (const [ten, de] of HONG) {
			gaApi(de);
			const tra = await quaProxy(`/${SLUG_PROXY}/okr/bo-okr?xemOkr=hop-tuan`);
			if (tra.status === 307 || viTriCua(tra) !== null)
				loi.push(
					`htmb-proxy: ${ten} van chuyen (${tra.status} ${viTriCua(tra)?.search ?? "-"})`,
				);
		}
		expect(loi).toEqual([]);
		expect(HONG.length).toBe(4);
	});
});
