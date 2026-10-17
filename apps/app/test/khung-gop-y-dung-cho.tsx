import { expect, mock } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
	useQueryClient,
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
	type DongHien,
	dongHien,
	type KrOutput,
	krCanhOutput,
	krOutput,
	type MucTieuOutput,
	mineOutput,
	mucTieuOutput,
	type ObjectiveOutput,
	objectiveOutput,
	okrAccessOutput,
	troLyDanhSachOutput,
	troLySanSangOutput,
	viecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

export type TroLyDs = ReturnType<typeof troLyDanhSachOutput.parse>;
export type SanSang = ReturnType<typeof troLySanSangOutput.parse>;
export type DanhSach = ReturnType<typeof danhSachOutput.parse>;

export const HUNG = {
	id: "hung",
	name: "Trần Văn Hùng",
	email: "hung@onehub.vn",
};
export const DOC_LUC = "2026-10-03T02:15:00.000Z";
export const MT_ID = "mt-s";

export function kr(
	id: string,
	objectiveId: string,
	doi: Partial<KrOutput> = {},
) {
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
		...doi,
	});
}

export function mucTieu(
	id: string,
	keyResults: KrOutput[],
	doi: Partial<MucTieuOutput> = {},
) {
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
		keyResults,
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

export function chiTietTu(
	mt: MucTieuOutput,
	doi: Partial<ObjectiveOutput> = {},
) {
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
		},
		themKrLe: false,
		...doi,
	});
}

export const KR_1 = kr("kr-1", MT_ID, { title: "Gọi 50 cuộc mỗi tuần" });
export const KR_2 = kr("kr-2", MT_ID, {
	title: "Chốt 12 thoả thuận mới mỗi quý",
});
export const KR_3 = kr("kr-3", MT_ID, { title: "Hoàn thành 20 buổi demo" });

export const mtSheet = (doi: Partial<MucTieuOutput> = {}) =>
	mucTieu(MT_ID, [KR_1, KR_2, KR_3], {
		title: "Triển khai CRM mới cho Kinh doanh miền Bắc",
		whyNow: "Quý 3 mất dấu 9 thoả thuận vì mỗi người ghi một nơi.",
		canEdit: true,
		...doi,
	});

export function dong(id: string, doi: Partial<DongHien>): DongHien {
	return dongHien.parse({
		id,
		loai: "viet-lai",
		objectiveId: MT_ID,
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
		tenDich: null,
		lyDo: "Kara đọc thấy chỗ này chưa rõ.",
		...doi,
	});
}

export const D_TEN = dong("d-ten", {
	truong: "title",
	truoc: "Triển khai CRM mới cho Kinh doanh miền Bắc",
	sau: "Không thoả thuận nào của miền Bắc bị mất dấu",
});
export const D_VI_SAO = dong("d-vi-sao", {
	truong: "whyNow",
	truoc: "Quý 3 mất dấu 9 thoả thuận vì mỗi người ghi một nơi.",
	sau: "Quý 3 mất dấu 9 thoả thuận; đầu quý 1 là mùa ký lại.",
});
export const D_KR1 = dong("d-kr1", {
	keyResultId: KR_1.id,
	truong: "kr.title",
	truoc: KR_1.title,
	sau: "Khách mới hẹn gặp được sau cuộc gọi đầu",
});
export const D_KR2 = dong("d-kr2", {
	keyResultId: KR_2.id,
	truong: "kr.title",
	truoc: KR_2.title,
	sau: "Doanh thu mới từ thoả thuận chốt trong quý",
});
export const D_DOI_TRONG = dong("d-doi-trong", {
	loai: "hoi",
	maVanDe: "thieu-doi-trong",
	sau: "Ba KR đều tăng — điều gì không được xấu đi?",
	lyDo: "Bộ KR chỉ đẩy một chiều.",
});
export const D_KR3 = dong("d-kr3", {
	loai: "hoi",
	keyResultId: KR_3.id,
	maVanDe: "kr-la-viec",
	sau: "Làm xong 20 buổi demo thì khách đổi gì?",
	lyDo: "KR đang đếm việc làm.",
});
export const D_CAN = dong("d-can", {
	loai: "can-chinh",
	targetKeyResultId: "kr-goc",
	tenDich: "KR OneHub · Thoả thuận mới cả năm",
	lyDo: "Mục tiêu này góp thẳng vào số thoả thuận mới.",
});

export const dsTroLy = (ds: DongHien[], doi: Partial<TroLyDs> = {}): TroLyDs =>
	troLyDanhSachOutput.parse({
		dong: ds,
		dangSoan: false,
		maKetThuc: "da-nop",
		docLuc: DOC_LUC,
		lyDo: null,
		...doi,
	});

export const SAN_SANG: SanSang = troLySanSangOutput.parse({
	bat: true,
	conLaiUsd: 5,
});

export const Q4 = {
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
export const KY = cyclesOutput.parse({ cycles: [Q4], currentId: "q4" });
export const CAY = orgTreeOutput.parse({
	divisions: [],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});
export const QUYEN = okrAccessOutput.parse({
	canManageProgram: false,
	headOf: { divisions: [], departments: [] },
});
export const VIEC_RONG = viecCuaToiOutput.parse({
	viec: [],
	lienQuanOkr: false,
});
export const PROGRAM = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	version: 1,
};

export function danhSachTu(ds: MucTieuOutput[], soCoGopY = 0): DanhSach {
	return danhSachOutput.parse({
		rows: ds.map((mt) => ({ ...mt, krKhop: [] })),
		daBo: [],
		total: ds.length,
		facetCounts: {
			phuTrach: [],
			loai: [],
			trangThai: [],
			tuTin: [],
			gopY: [{ value: "cho", count: soCoGopY }],
		},
		canEdit: false,
		canCreate: false,
	});
}

export type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
export type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
export type Goi = { duong: string; vao: DauVao };

export class LoiTrpc extends Error {
	data: { code: string };
	constructor(code: string, thongDiep: string) {
		super(thongDiep);
		this.data = { code };
	}
}

type Kho = {
	mine: ReturnType<typeof mineOutput.parse>;
	danhSach: (vao: DauVao) => DanhSach;
	chiTiet: () => ObjectiveOutput;
	troLy: (vao: DauVao) => TroLyDs | Promise<TroLyDs>;
	sanSang: SanSang;
	daDoc: Goi[];
	daGhi: Goi[];
	daLamMoi: string[];
	ghiRieng: Map<string, (vao: DauVao) => Promise<KetQuaGhi>>;
	rieng: Map<string, (vao: DauVao) => object>;
};

const khoMoi = (): Kho => ({
	mine: mineOutput.parse({ dangTheoDoi: [], objectives: [], daBo: [] }),
	danhSach: () => danhSachTu([]),
	chiTiet: () => chiTietTu(mtSheet()),
	troLy: () => dsTroLy([]),
	sanSang: SAN_SANG,
	daDoc: [],
	daGhi: [],
	daLamMoi: [],
	ghiRieng: new Map(),
	rieng: new Map(),
});

export const kho: Kho = khoMoi();

export function datLai(): void {
	Object.assign(kho, khoMoi());
}

export function docThuTuc(duong: string, vao: DauVao): object | null {
	const rieng = kho.rieng.get(duong);
	if (rieng) return rieng(vao);
	switch (duong) {
		case "okr.cycles":
			return KY;
		case "okr.access":
			return QUYEN;
		case "okr.viecCuaToi":
			return VIEC_RONG;
		case "okr.capNhatTuan":
			return { items: [], weekStart: "2026-10-12", dueWeekday: 5 };
		case "okr.mine":
			return kho.mine;
		case "okr.countByUnit":
			return {};
		case "okr.danhSach":
			return kho.danhSach(vao);
		case "okr.objective":
			return kho.chiTiet();
		case "okr.program":
			return PROGRAM;
		case "okr.comments":
			return { comments: [], dong: [] };
		case "okr.alignmentTargets":
			return { targets: [] };
		case "okr.mau":
			return { mau: [], quanTri: false };
		case "okr.thanhVien":
			return [HUNG];
		case "okr.troLySanSang":
			return kho.sanSang;
		case "okr.troLyDanhSach":
			return kho.troLy(vao);
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

export type KetQuaGhi =
	| { ok: true }
	| { ok: false; lyDo: string }
	| { bat: true; taskId: string; dungLai: boolean }
	| { sessionId: string }
	| { id: string; canhBao: null };

export function ghiMacDinh(duong: string, vao: DauVao): KetQuaGhi {
	switch (duong) {
		case "okr.troLyQuyet":
			return { ok: true };
		case "okr.troLyDeXuat":
			return { bat: true, taskId: "t-1", dungLai: false };
		case "okr.moCapNhat":
			return { sessionId: "phien-1" };
		default:
			return { id: String(vao?.id ?? "ok"), canhBao: null };
	}
}

export type ChonGhi = {
	onSuccess?: (kq: KetQuaGhi) => void;
	onError?: (e: Error) => void;
};

export function thuTuc(duong: string) {
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: {
						queryKey: [duong, vao ?? null],
						queryFn: async () => {
							kho.daDoc.push({ duong, vao });
							return docThuTuc(duong, vao);
						},
					},
		mutationOptions: (chon?: ChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				kho.daGhi.push({ duong, vao });
				const rieng = kho.ghiRieng.get(duong);
				return rieng ? rieng(vao) : ghiMacDinh(duong, vao);
			},
		}),
	};
}

export const nhanh = (goc: string) =>
	new Proxy({}, { get: (_dich, ten) => thuTuc(`${goc}.${String(ten)}`) });

export const KHOA_LAM_MOI = new Set([
	"okr.objective",
	"okr.mine",
	"okr.danhSach",
	"okr.troLySanSang",
	"okr.troLyDanhSach",
]);

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: nhanh("okr"),
		org: nhanh("org"),
		workspace: nhanh("workspace"),
		users: nhanh("users"),
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return {
			okr: async (id?: string) => {
				kho.daLamMoi.push(id ?? "");
				await qc.invalidateQueries({
					predicate: (q) => KHOA_LAM_MOI.has(String(q.queryKey[0])),
				});
			},
		};
	},
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

export const { CuaToi } = await import("@/app/(app)/[slug]/okr/cua-toi");
export const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
export const { BangMucTieu } = await import(
	"@/app/(app)/[slug]/okr/bang-muc-tieu"
);
export const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
export const { HopThoaiKr } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-kr"
);
export const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
export const { DetailSheet } = await import("@/components/detail-sheet");
export const { LocaleProvider } = await import(
	"@crm/ui/components/locale-provider"
);
export const { TooltipProvider } = await import("@crm/ui/components/tooltip");
export const { Toaster } = await import("@crm/ui/components/sonner");
export const { messages: uiMessages } = await import("@crm/ui/lib/messages");
export const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
export const { okrMessages } = await import("@/lib/messages/okr");

export const m = okrGopYMessages("vi");
export const mo = okrMessages("vi");
export const ui = uiMessages("vi");

export type San = {
	o: HTMLElement;
	root: Root;
	url: () => URLSearchParams;
	veLai: (man: ReactElement) => Promise<void>;
	client: QueryClient;
};
let dangMo: San[] = [];

export async function dung(
	man: ReactElement,
	thamSo = "",
	locale: Locale = "vi",
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
	const ve = (noiDung: ReactElement) => (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e) => {
				url = new URLSearchParams(e.searchParams);
			}}
			searchParams={thamSo}
		>
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>
						{noiDung}
						<Toaster />
					</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => {
		root.render(ve(man));
	});
	const san = {
		o,
		root,
		url: () => url,
		veLai: async (moi: ReactElement) => {
			await act(async () => {
				root.render(ve(moi));
			});
		},
		client,
	};
	dangMo.push(san);
	return san;
}

export async function thaoHet(): Promise<void> {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
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
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
	);
}

export const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });

export async function bamChuot(o: Element): Promise<void> {
	const u = nguoiDung();
	await act(async () => {
		await u.click(o);
	});
	await nhip(2);
}

export async function bamPhim(o: HTMLElement, phim: string): Promise<void> {
	const u = nguoiDung();
	await act(async () => {
		o.focus();
	});
	await act(async () => {
		await u.keyboard(phim);
	});
	await nhip(2);
}

export async function goChu(
	o: Element,
	chu: string,
	xoaTruoc = false,
): Promise<void> {
	const u = nguoiDung();
	await act(async () => {
		if (xoaTruoc) await u.clear(o);
		await u.type(o, chu);
	});
	await nhip(2);
}

export const qs = <T extends Element = HTMLElement>(
	sel: string,
	goc: ParentNode = document.body,
) => goc.querySelector<T>(sel);
export const qsa = (sel: string, goc: ParentNode = document.body) => [
	...goc.querySelectorAll<HTMLElement>(sel),
];

export function nutCo(chu: string, goc: ParentNode = document.body) {
	return qsa("button", goc).find((b) => b.textContent?.trim() === chu) ?? null;
}

export function nut(chu: string, goc: ParentNode = document.body): HTMLElement {
	const tim = nutCo(chu, goc);
	if (!tim)
		throw new Error(
			`khong thay nut "${chu}" — ${qsa("button", goc)
				.map((b) => b.textContent?.trim())
				.join(" | ")}`,
		);
	return tim;
}

export const deXuat = (id: string) => qs(`[data-gop-y="${id}"]`);
export const nhom = () => qs("[data-nhom-kara]");
export const nhanKara = () =>
	qs("[data-nhom-kara] [data-slot=kara-label] [data-slot=kara-mark]")
		?.textContent ?? null;
export const goiCua = (duong: string) =>
	kho.daGhi.filter((g) => g.duong === duong);
export const docCua = (duong: string) =>
	kho.daDoc.filter((g) => g.duong === duong);
export const hangMt = (id: string) => qs(`[data-hang-muc-tieu="${id}"]`);
export const khoiMt = (id: string) => qs(`[data-muc-tieu="${id}"]`);
export function soHangMt(id: string): number {
	const k = khoiMt(id);
	const dong = k?.closest("tr");
	if (!dong) return k?.querySelectorAll("tr").length ?? -1;
	let so = 1;
	let ke = dong.nextElementSibling;
	while (ke?.querySelector("[data-kr]")) {
		so += 1;
		ke = ke.nextElementSibling;
	}
	return so;
}
export const sau = (a: Element | null, b: Element | null) =>
	a !== null &&
	b !== null &&
	(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

export const daTaiDanhSach = () =>
	qs("[data-trang-thai]:not([data-trang-thai='ST-donvi-dangtai'])") !== null;

export async function dungCuaToi(
	ds: MucTieuOutput[],
	thamSo = "",
): Promise<San> {
	kho.mine = mineOutput.parse({ dangTheoDoi: [], objectives: ds, daBo: [] });
	const san = await dung(<CuaToi />, thamSo);
	await cho(
		() => daTaiDanhSach() && qs("[data-so-kr-cho]") === null,
		"cua toi tai xong",
	);
	const thamGia = document.body.querySelector<HTMLButtonElement>(
		'[data-nhom="tham-gia"] button[aria-expanded="false"]',
	);
	if (thamGia) await bamChuot(thamGia);
	return san;
}

export async function dungTheoDonVi(
	ds: MucTieuOutput[],
	thamSo = "",
): Promise<San> {
	kho.danhSach = () => danhSachTu(ds);
	const san = await dung(<TheoDonVi />, thamSo);
	await cho(
		() => daTaiDanhSach() && qs("[data-so-kr-cho]") === null,
		"theo don vi tai xong",
	);
	return san;
}

export async function dungSheet(
	chon: { onOpenChange?: (mo: boolean) => void; thamSo?: string } = {},
): Promise<San> {
	const san = await dung(
		<DetailSheet onOpenChange={chon.onOpenChange ?? (() => {})} open>
			<ObjectiveSheet objectiveId={MT_ID} />
		</DetailSheet>,
		chon.thamSo ?? `?record=objective:${MT_ID}`,
	);
	await cho(
		() =>
			qs("[data-okr-sheet] [role=tab]") !== null &&
			qs("[data-so-kr-cho]") === null,
		"sheet tai xong",
	);
	return san;
}

export async function dungSheetCoGopY(
	ds: DongHien[],
	chon: {
		onOpenChange?: (mo: boolean) => void;
		doi?: Partial<MucTieuOutput>;
	} = {},
): Promise<San> {
	const mt = mtSheet({ soGopYCho: ds.length, ...chon.doi });
	kho.chiTiet = () => chiTietTu(mt);
	kho.troLy = () => dsTroLy(ds);
	const san = await dungSheet({ onOpenChange: chon.onOpenChange });
	await cho(
		() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
		"nhom kara co gop y",
	);
	return san;
}

export function kiemCa(
	thucTe: Readonly<Record<string, Json>>,
	mongDoi: Readonly<Record<string, Json>>,
	thongDiep: (truong: string) => string,
): void {
	const lech = Object.keys(mongDoi).find(
		(k) => !Bun.deepEquals(thucTe[k], mongDoi[k]),
	);
	expect(thucTe, lech === undefined ? "khop" : thongDiep(lech)).toEqual(
		mongDoi,
	);
}

export const MT_A = () =>
	mucTieu("mt-a", [kr("a1", "mt-a"), kr("a2", "mt-a")], {
		title: "Giữ chân khách miền Bắc",
		soGopYCho: 3,
	});
export const MT_B = () =>
	mucTieu("mt-b", [kr("b1", "mt-b")], {
		title: "Mở thêm kênh đối tác",
		soGopYCho: 0,
	});

export const HAI_MAN = [
	{ ten: "cua-toi", dung: dungCuaToi },
	{ ten: "theo-don-vi", dung: dungTheoDonVi },
] as const;
