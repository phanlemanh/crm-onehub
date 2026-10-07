import { afterEach, beforeEach, mock } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	cyclesOutput,
	type KrOutput,
	krCanhOutput,
	krOutput,
	type MucTieuOutput,
	mineOutput,
	mucTieuOutput,
	type ObjectiveOutput,
	objectiveOutput,
	okrAccessOutput,
	viecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

export const HUNG = {
	id: "hung",
	name: "Trần Văn Hùng",
	email: "hung@onehub.vn",
};

export function kr(id: string, objectiveId: string): KrOutput {
	return krOutput.parse({
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
	});
}

export function mucTieu(
	id: string,
	doi: Partial<MucTieuOutput> = {},
): MucTieuOutput {
	return mucTieuOutput.parse({
		id,
		cycleId: "q4",
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
		expected: 47,
		keyResults: [kr(`${id}-kr1`, id), kr(`${id}-kr2`, id)],
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...doi,
	});
}

export const daBoTu = (id: string) =>
	mucTieu(id, {
		status: "da-bo",
		publishedAt: null,
		droppedAt: "2026-10-03T00:00:00.000Z",
		progress: 0,
	});

export function chiTietTu(
	mt: MucTieuOutput,
	quyen: Partial<ObjectiveOutput["quyen"]> = {},
): ObjectiveOutput {
	return objectiveOutput.parse({
		...mt,
		keyResults: mt.keyResults.map((k) =>
			krCanhOutput.parse({
				...k,
				soViec: { xong: 0, tong: 0 },
				soSangKien: 0,
				coBangChung: false,
			}),
		),
		cycleName: "Quý 4/2026",
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: mt.canEdit ? mt.keyResults.map((k) => k.id) : [],
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: false,
			congBo: false,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
			...quyen,
		},
		themKrLe: false,
	});
}

const Q4 = {
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
	viec: { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false },
};
const KY_CO = cyclesOutput.parse({ cycles: [Q4], currentId: "q4" });
const CAY = orgTreeOutput.parse({
	divisions: [],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});
const QUYEN = okrAccessOutput.parse({
	canManageProgram: false,
	headOf: { divisions: [], departments: [] },
});
const VIEC_RONG = viecCuaToiOutput.parse({ viec: [], lienQuanOkr: false });

export function danhSachTu(rows: MucTieuOutput[], daBo: MucTieuOutput[]) {
	return danhSachOutput.parse({
		rows: rows.map((mt) => ({ ...mt, krKhop: [] })),
		daBo: daBo.map((mt) => ({ ...mt, krKhop: [] })),
		total: rows.length,
		facetCounts: {
			phuTrach: [],
			loai: [],
			trangThai: [],
			tuTin: [],
			gopY: [],
		},
		canEdit: false,
		canCreate: false,
	});
}

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type KetGhi = { id: string; canhBao: string | null; canGuiDuyet?: boolean };

export const kho = {
	mine: mineOutput.parse({ objectives: [], daBo: [] }),
	danhSach: danhSachTu([], []),
	chiTiet: chiTietTu(mucTieu("mt-s")),
	loiGhi: new Map<string, string>(),
	traGhi: new Map<string, KetGhi>(),
	daGhi: [] as { duong: string; dauVao: DauVao }[],
	toast: [] as { loai: string; chu: string }[],
};

function docThuTuc(duong: string): object | null {
	switch (duong) {
		case "okr.cycles":
			return KY_CO;
		case "okr.access":
			return QUYEN;
		case "okr.viecCuaToi":
			return VIEC_RONG;
		case "okr.mine":
			return kho.mine;
		case "okr.countByUnit":
			return {};
		case "okr.danhSach":
			return kho.danhSach;
		case "okr.objective":
			return kho.chiTiet;
		case "okr.program":
			return {
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: false,
				version: 1,
			};
		case "okr.comments":
			return { comments: [], dong: [] };
		case "okr.alignmentTargets":
			return { targets: [] };
		case "okr.mau":
			return { mau: [], quanTri: false };
		case "okr.thanhVien":
			return [HUNG];
		case "okr.troLySanSang":
			return { bat: false, lyDo: "tat" };
		case "okr.troLyDanhSach":
			return { dong: [], dangSoan: false, maKetThuc: null, lyDo: "tat" };
		case "org.tree":
			return CAY;
		case "workspace.get":
			return { name: "OneHub", viewerRole: "member" };
		case "users.list":
			return [{ ...HUNG, image: null }];
		case "users.me":
			return HUNG;
		default:
			return null;
	}
}

type ChonGhi = {
	onSuccess?: (kq: KetGhi) => void;
	onError?: (e: Error) => void;
};

function thuTuc(duong: string) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: {
						queryKey: [duong, vao ?? null],
						queryFn: async () => docThuTuc(duong),
					},
		mutationOptions: (chon?: ChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				kho.daGhi.push({ duong, dauVao: vao });
				const loi = kho.loiGhi.get(duong);
				if (loi !== undefined) throw new Error(loi);
				return kho.traGhi.get(duong) ?? { id: "ok", canhBao: null };
			},
		}),
	};
}

const nhanh = (goc: string) =>
	new Proxy({}, { get: (_dich, ten) => thuTuc(`${goc}.${String(ten)}`) });

let duongTrang = "/ws/okr";
export const datDuong = (d: string) => {
	duongTrang = d;
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: nhanh("okr"),
		org: nhanh("org"),
		workspace: nhanh("workspace"),
		users: nhanh("users"),
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ okr: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duongTrang,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const ghiToast = (loai: string) => (chu: string) => {
	kho.toast.push({ loai, chu });
};
mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		success: ghiToast("success"),
		error: ghiToast("error"),
		warning: ghiToast("warning"),
		message: ghiToast("message"),
	}),
	Toaster: () => null,
}));

export const { CuaToi } = await import("@/app/(app)/[slug]/okr/cua-toi");
export const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
export const { KhoiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/khoi-muc-tieu"
);
export const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
export const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { SimpleTable } = await import("@crm/ui/components/simple-table");
export const { okrMessages } = await import("@/lib/messages/okr");
export { SimpleTable };

export type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

export async function dung(
	man: ReactElement,
	thamSo = "",
	locale: "vi" | "en" = "vi",
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	let url = new URLSearchParams(thamSo);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = new URLSearchParams(e.searchParams);
				}}
				searchParams={thamSo}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => url };
	dangMo.push(san);
	return san;
}

export async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 2));
		});
}

export async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

export async function bamChuot(o: Element): Promise<void> {
	const u = userEvent.setup({ document, pointerEventsCheck: 0, delay: null });
	await act(async () => {
		await u.click(o);
	});
}

export const daTaiXong = () =>
	document.body.querySelector(
		"[data-trang-thai]:not([data-trang-thai='ST-donvi-dangtai'])",
	) !== null;

beforeEach(() => {
	kho.mine = mineOutput.parse({ objectives: [], daBo: [] });
	kho.danhSach = danhSachTu([], []);
	kho.loiGhi = new Map();
	kho.traGhi = new Map();
	kho.daGhi = [];
	kho.toast = [];
	duongTrang = "/ws/okr";
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});
