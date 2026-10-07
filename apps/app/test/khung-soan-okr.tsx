import { jest, mock } from "bun:test";
import { chuanHoa } from "@crm/validation/okr-kiem";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import type { SessionSnapshot } from "eve/client";
import type { EveMessage } from "eve/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ReactElement,
	type ReactNode,
	useRef,
	useSyncExternalStore,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	CuocSoanOutput,
	DongSoanOutput,
} from "../../api/src/okr/okr.contracts";
import type { Thread } from "../lib/agent-session";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
export type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type Lay = (vao: DauVao) => unknown;
type TuyChonGhi = {
	onSuccess?: (kq: Json) => void;
	onError?: (e: Error) => void;
};

export const goi: { duong: string; dauVao: DauVao }[] = [];
const duLieu = new Map<string, Lay>();

export function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

export function goiCua(duong: string) {
	return goi.filter((g) => g.duong === duong);
}

function thuTuc(duong: string) {
	const doc = (vao: DauVao): unknown => {
		goi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "bo-qua"], queryFn: skipToken }
				: {
						queryKey: [duong, vao ?? null],
						queryFn: async () => doc(vao),
					},
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => doc(vao),
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khong: string) =>
			new Proxy({}, { get: (_g, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

export const daLamMoi: string[] = [];
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy(
			{},
			{
				get: (_g, ten: string) => async () => {
					daLamMoi.push(ten);
				},
			},
		),
}));

if (!("ResizeObserver" in window))
	Object.defineProperty(window, "ResizeObserver", {
		value: globalThis.ResizeObserver,
		writable: true,
		configurable: true,
	});

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

export const diTrang: { kieu: "push" | "replace"; duong: string }[] = [];
export const urlDoi: string[] = [];
export const dinhVi = { duong: "/ws/okr/theo-don-vi" };

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (duong: string) => diTrang.push({ kieu: "push", duong }),
		replace: (duong: string) => diTrang.push({ kieu: "replace", duong }),
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => dinhVi.duong,
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

type TrangThaiAgent = "ready" | "submitted" | "streaming" | "error";
export type AgentGia = {
	status: TrangThaiAgent;
	events: readonly { type: string }[];
	data: { messages: EveMessage[] };
	session: {
		sessionId?: string;
		continuationToken?: string;
		streamIndex: number;
	};
	error: Error | undefined;
};

const AGENT_DAU: AgentGia = {
	status: "ready",
	events: [],
	data: { messages: [] },
	session: { streamIndex: 0 },
	error: undefined,
};

let agentGia: AgentGia = AGENT_DAU;
const nghe = new Set<() => void>();
export const daGui: string[] = [];
export let daDung = 0;
export let soLanMoAgent = 0;
export const daTaiLuong: string[] = [];

export async function datAgent(moi: Partial<AgentGia>): Promise<void> {
	await act(async () => {
		agentGia = { ...agentGia, ...moi };
		for (const f of nghe) f();
	});
	await nhip(3);
}

export async function baoLoiAgent(loi: Error): Promise<void> {
	await act(async () => {
		agentGia = { ...agentGia, status: "error", error: loi };
		for (const f of nghe) f();
		tuyChonAgent.at(-1)?.onError?.(loi);
	});
	await nhip(5);
}

const eveReactThat = await import("eve/react");
type TuyChonAgent = NonNullable<Parameters<typeof eveReactThat.useEveAgent>[0]>;
export const tuyChonAgent: TuyChonAgent[] = [];
mock.module("eve/react", () => ({
	...eveReactThat,
	useEveAgent: (tuyChon: TuyChonAgent) => {
		tuyChonAgent.push(tuyChon);
		const moiMo = useRef(true);
		if (moiMo.current) {
			moiMo.current = false;
			soLanMoAgent += 1;
		}
		const snap = useSyncExternalStore(
			(f) => {
				nghe.add(f);
				return () => nghe.delete(f);
			},
			() => agentGia,
		);
		return {
			...snap,
			send: async (v: { message?: string }) => {
				daGui.push(v.message ?? "");
			},
			reset: () => {},
			stop: () => {
				daDung += 1;
			},
		};
	},
}));

export let threadGia: Thread = { status: "offline", events: [] };
export function datThread(t: Thread): void {
	threadGia = t;
}

export type LuongEve = SessionSnapshot;
let luongGia: LuongEve | null = null;
export const daPhanLoai: Thread["status"][] = [];
export function datLuong(l: LuongEve): void {
	luongGia = l;
}

const clientThat = await import("eve/client");
mock.module("eve/client", () => ({
	...clientThat,
	Client: class {
		session() {
			return {
				snapshot: async (): Promise<SessionSnapshot> => {
					if (!luongGia) throw new Error("chua dat luong eve gia");
					return luongGia;
				},
			};
		}
	},
}));

const phienThat = await import("../lib/agent-session");
const loadThreadThat = phienThat.loadThread;
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: async (...thamSo: Parameters<typeof loadThreadThat>) => {
		daTaiLuong.push(thamSo[0]);
		if (!luongGia) return threadGia;
		const t = await loadThreadThat(...thamSo);
		daPhanLoai.push(t.status);
		return t;
	},
}));

export const { TrangSoan } = await import(
	"@/app/(app)/[slug]/okr/soan/trang-soan"
);
export const KhungSoanXuat = await import(
	"@/app/(app)/[slug]/okr/soan/khung-soan"
);
export const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
export const { DanhSachCuoc } = await import(
	"@/app/(app)/[slug]/okr/soan/danh-sach-cuoc"
);
export const { SOAN_UI } = await import("@/app/(app)/[slug]/okr/soan/cau-hinh");
export const { dauThangSau } = await import("@/lib/okr-chu-ky-nhan");
export const { homNayVn } = await import("@/lib/okr-chu-ky-nhan");
export const { donViSoanCua } = await import(
	"@/app/(app)/[slug]/okr/soan/nut-soan"
);
export const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");

export const m = okrSoanMessages("vi");

export const CUOC: CuocSoanOutput = {
	id: "cuoc-1",
	cycleId: "q1",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-1",
	tenDonVi: "Kinh doanh miền Bắc",
	tenChuKy: "Quý 1 · 2027",
	nguoiMo: { id: "hai", name: "Trần Minh Hải" },
	sessionId: "phien-1",
	nac: "bat",
	trangThai: "dang",
	soLuot: 2,
	tranLuot: 12,
	moLuc: "2026-12-01T03:00:00.000Z",
	duaVaoLuc: null,
	soDongNhan: 0,
	soDongTong: 0,
};

type TrangThaiDong = DongSoanOutput["trangThai"];

const gocDong = {
	viSao: "Vì kỳ trước hụt.",
	maLoai: null,
	giaTriCuoi: null,
	taoRaId: null,
};

export const mt = (
	id: string,
	ten: string,
	trangThai: TrangThaiDong = "cho",
	them: Partial<Extract<DongSoanOutput, { loai: "muc-tieu-moi" }>> = {},
): DongSoanOutput => ({
	...gocDong,
	id,
	khoa: `m${id}`,
	khoaDong: `muc-tieu-moi:${chuanHoa(them.ten ?? ten)}`,
	loai: "muc-tieu-moi",
	ten,
	viSaoLucNay: "Đầu quý là mùa ký lại.",
	loaiMucTieu: "cam-ket",
	trangThai,
	...them,
});

export const kr = (
	id: string,
	cha: string,
	ten: string,
	trangThai: TrangThaiDong = "cho",
	kieu: "tang-toi" | "moc" = "tang-toi",
): DongSoanOutput => ({
	...gocDong,
	id,
	khoa: `k${id}`,
	khoaDong: `kr-moi:${chuanHoa(ten)}`,
	chaKhoa: `m${cha}`,
	loai: "kr-moi",
	ten,
	kieu,
	donVi: kieu === "moc" ? "" : "khách",
	khoiDiemGoiY: kieu === "moc" ? null : 3,
	trangThai,
});

export const cc = (
	id: string,
	cha: string,
	trangThai: TrangThaiDong = "cho",
): DongSoanOutput => ({
	...gocDong,
	id,
	khoa: `c${id}`,
	khoaDong: `can-chinh-moi:m${cha}:dich-1`,
	chaKhoa: `m${cha}`,
	loai: "can-chinh-moi",
	dichId: "dich-1",
	tenDich: "Giữ khách lớn toàn công ty",
	trangThai,
});

export const BAN_NHAP: DongSoanOutput[] = [
	mt("1", "Giữ khách lớn miền Bắc"),
	kr("11", "1", "Khách lớn ký lại hợp đồng"),
	kr("12", "1", "Rà soát tuyến trước hạn", "cho", "moc"),
	cc("13", "1"),
	mt("2", "Mở tuyến Hà Nội – Hải Phòng"),
	kr("21", "2", "Chuyến đúng hẹn"),
	kr("22", "2", "Khách mới trên tuyến"),
];

export const noiTroLy = (id: string, text: string): EveMessage => ({
	id,
	role: "assistant",
	parts: [{ type: "text", text, state: "done" }],
});

export const nguoiNoi = (id: string, text: string): EveMessage => ({
	id,
	role: "user",
	parts: [{ type: "text", text }],
});

export const MO_DAU =
	"Kỳ trước phòng đạt 91%.\n\n1. Quý này ưu tiên giữ khách hay mở tuyến?\n- gợi ý: Giữ khách · Mở tuyến\n2. Có số nào đã hứa với cấp trên?\n- gợi ý: Có · Chưa có";

export type DanhSachGia = {
	cuoc: CuocSoanOutput;
	dong: DongSoanOutput[];
	thieuBoiCanh: boolean;
	lyDo: null;
};

export let danhSach: DanhSachGia = {
	cuoc: CUOC,
	dong: [],
	thieuBoiCanh: false,
	lyDo: null,
};
export function datDanhSach(moi: Partial<DanhSachGia>): void {
	danhSach = { ...danhSach, ...moi };
}

export function datLai(): void {
	goi.length = 0;
	diTrang.length = 0;
	urlDoi.length = 0;
	globalThis.sessionStorage?.clear();
	dinhVi.duong = "/ws/okr/theo-don-vi";
	daGui.length = 0;
	daLamMoi.length = 0;
	tuyChonAgent.length = 0;
	daDung = 0;
	soLanMoAgent = 0;
	daTaiLuong.length = 0;
	duLieu.clear();
	agentGia = AGENT_DAU;
	threadGia = { status: "offline", events: [] };
	luongGia = null;
	daPhanLoai.length = 0;
	danhSach = { cuoc: CUOC, dong: [], thieuBoiCanh: false, lyDo: null };
	dat("okr.soanDanhSach", () => danhSach);
	dat("okr.soanQuyet", () => ({ ok: true }));
	dat("okr.soanDuaVao", () => ({
		ok: true,
		mucTieuIds: ["o1"],
		soMucTieu: 1,
		soKr: 1,
	}));
	dat("okr.soanMo", () => ({
		ok: true,
		cuoc: { ...CUOC, sessionId: "phien-2" },
	}));
	dat("okr.soanDanhSachCuoc", () => ({
		cuoc: [],
		soCuocDaDung: 0,
		tranCuoc: 3,
	}));
}

type San = { o: HTMLElement; root: Root };
const dangMo: San[] = [];
let dongHoGia = false;

export function batDongHoGia(): void {
	jest.useFakeTimers();
	dongHoGia = true;
}

export function tatDongHoGia(): void {
	if (dongHoGia) jest.useRealTimers();
	dongHoGia = false;
}

export async function mo(man: ReactElement, thamSo = ""): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={thamSo}
				onUrlUpdate={(e) => urlDoi.push(e.queryString)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(20);
}

export const daDong: number[] = [];
export const daMoCuoc: string[] = [];

export async function moTrang(
	quanTri = false,
	cauNoi = true,
	thamSo = "",
): Promise<void> {
	dinhVi.duong = `/ws/okr/soan/${CUOC.id}`;
	dat("okr.access", () => ({
		canManageProgram: quanTri,
		headOf: { divisions: [], departments: [] },
	}));
	await mo(<TrangSoan cuocSoanId={CUOC.id} cauNoi={cauNoi} />, thamSo);
	await cho(
		() =>
			document.querySelector(
				"[data-trang-soan]:not([data-trang-soan='dang-mo'])",
			) !== null,
		"trang soan mo xong",
	);
}

export const moMan = moTrang;

export async function don(): Promise<void> {
	tatDongHoGia();
	for (const { o, root } of dangMo.splice(0)) {
		await act(async () => root.unmount());
		o.remove();
	}
	document.body.innerHTML = "";
	daDong.length = 0;
	daMoCuoc.length = 0;
}

export async function troi(ms: number): Promise<void> {
	const BUOC = 50;
	for (let t = 0; t < ms; t += BUOC) {
		await act(async () => {
			jest.advanceTimersByTime(Math.min(BUOC, ms - t));
		});
		await act(async () => {
			await Promise.resolve();
		});
	}
}

export async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		if (dongHoGia) {
			await troi(10);
		} else {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
	}
}

export async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

export async function bam(o: Element | null): Promise<void> {
	if (!o) throw new Error("khong co phan tu de bam");
	await act(async () => {
		(o as HTMLElement).click();
	});
	await nhip(3);
}

export async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement))
		throw new Error("khong phai o nhap");
	const goc =
		o instanceof HTMLInputElement
			? HTMLInputElement.prototype
			: HTMLTextAreaElement.prototype;
	const datGia = Object.getOwnPropertyDescriptor(goc, "value")?.set;
	await act(async () => {
		datGia?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await nhip(2);
}

export const q = (chon: string) => document.querySelector(chon);
export const qa = (chon: string) => [...document.querySelectorAll(chon)];
export const chu = (chon: string) => q(chon)?.textContent?.trim() ?? null;

export function nut(chuNut: string, goc: ParentNode = document.body) {
	const tim = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chuNut,
	);
	if (!tim) throw new Error(`khong thay nut "${chuNut}"`);
	return tim;
}

export type SanSangGia =
	| {
			bat: true;
			nac: "bat" | "an";
			cuocDang: CuocSoanOutput | null;
			soCuocDaDung: number;
			tranCuoc: number;
			thieuBoiCanh: boolean;
	  }
	| { bat: false; lyDo: string };

export const SAN_SANG_BAT: Extract<SanSangGia, { bat: true }> = {
	bat: true,
	nac: "bat",
	cuocDang: null,
	soCuocDaDung: 0,
	tranCuoc: 3,
	thieuBoiCanh: false,
};

const NGUOI_TRUONG = {
	id: "hung",
	name: "Trần Văn Hùng",
	email: "h@onehub.vn",
};

const CAY_KHUNG = {
	divisions: [
		{
			id: "bp-kd",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [
				{
					id: "pb-1",
					name: "Kinh doanh miền Bắc",
					moTa: "",
					position: 0,
					divisionId: "bp-kd",
					head: NGUOI_TRUONG,
					stepCount: 0,
					okrMo: 0,
					people: [{ ...NGUOI_TRUONG, primary: true }],
				},
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
};

export type TuyChonKhung = {
	sanSang: SanSangGia;
	quanTri?: boolean;
	canEdit?: boolean;
	pha?: "lap-ke-hoach" | "dang-chay";
	thamSo?: string;
	cauNoi?: boolean;
};

export async function moKhung(
	don: string,
	{
		sanSang,
		quanTri = false,
		canEdit = true,
		pha = "lap-ke-hoach",
		thamSo = "",
		cauNoi = true,
	}: TuyChonKhung,
): Promise<void> {
	dat("okr.soanSanSang", () => sanSang);
	dat("org.tree", () => CAY_KHUNG);
	dat("workspace.get", () => ({ name: "OneHub" }));
	dat("okr.cycles", () => ({
		cycles: [
			{
				id: "q1",
				kind: "quy",
				name: "Quý 1 · 2027",
				parentId: null,
				startsOn: "2027-01-01",
				endsOn: "2027-03-31",
				phase: pha,
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
				cuaSoRa: null,
			},
		],
		currentId: "q1",
	}));
	dat("okr.access", () => ({
		canManageProgram: quanTri,
		headOf: { divisions: [], departments: [] },
	}));
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () => ({
		rows: [],
		total: 0,
		facetCounts: { phuTrach: [], loai: [], trangThai: [] },
		canEdit,
	}));
	const tham = new URLSearchParams(thamSo);
	if (don !== "goc") tham.set("donOkr", don);
	await mo(<TheoDonVi cauNoiOkr={cauNoi} />, `?${tham}`);
	await cho(
		() => document.querySelector("[data-hang-nut]") !== null,
		"khung don vi",
	);
	await nhip(10);
}
