import { mock } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	NuqsTestingAdapter,
	type OnUrlUpdateFunction,
} from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	DongHien,
	KrOutput,
	MucTieuOutput,
} from "../../api/src/okr/okr.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
export type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
export type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (vao: DauVao) => unknown;
type TuyChonGhi = {
	onSuccess?: (kq: Json) => void;
	onError?: (e: Error) => void;
};

export const trangThai = {
	daGoi: [] as LoiGoi[],
	daBam: false,
	truocKhiBam: null as DanhSach | null,
	sauKhiBam: null as DanhSach | null,
};
const duLieu = new Map<string, Lay>();

export function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = (vao: DauVao): unknown => {
		trangThai.daGoi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		infiniteQueryOptions: (
			vao?: DauVao,
			chon?: { getNextPageParam?: (trang: never) => unknown },
		) => ({
			queryKey: [duong, vao ?? null, "vo-han"],
			queryFn: async ({ pageParam }: { pageParam: string | null }) =>
				doc(pageParam === null ? vao : { ...vao, cursor: pageParam }),
			initialPageParam: null,
			getNextPageParam: chon?.getNextPageParam ?? (() => undefined),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) =>
				doc(vao) ?? { id: "ok", canhBao: null },
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

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy(
			{},
			{
				get: () => async () => {},
			},
		),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");

export const HAI = { id: "hai", name: "Trần Minh Hải", email: "hai@onehub.vn" };

const KR_GOC: KrOutput = {
	id: "kr-1",
	objectiveId: "mt-1",
	title: "Gọi 50 cuộc mỗi tuần",
	kind: "tang-toi",
	owner: HAI,
	startValue: 0,
	targetValue: 50,
	currentValue: 20,
	unit: "cuộc",
	dueOn: null,
	weight: 1,
	source: "tay",
	doCanh: false,
	soMay: null,
	nguonMay: null,
	startLocked: false,
	progress: 40,
	laCuaToi: true,
	hienTaiQuaCapNhat: false,
};

export const KR_1: KrOutput = KR_GOC;
export const KR_2: KrOutput = {
	...KR_GOC,
	id: "kr-2",
	title: "Chốt 12 thoả thuận mới mỗi quý",
	currentValue: 3,
	targetValue: 12,
	unit: "thoả thuận",
	progress: 25,
};

export const MT: MucTieuOutput = {
	id: "mt-1",
	cycleId: "q4",
	level: "phong-ban",
	unitId: "pb-1",
	unitName: "KD miền Bắc",
	title: "Triển khai CRM mới cho Kinh doanh miền Bắc",
	kind: "cam-ket",
	status: "nhap",
	owner: HAI,
	participants: [],
	whyNow: "Quý 3 mất dấu 9 thoả thuận vì mỗi người ghi một nơi.",
	publishedAt: null,
	droppedAt: null,
	progress: 40,
	expected: null,
	keyResults: [KR_1, KR_2],
	alignments: [],
	canEdit: true,
	following: false,
	followerCount: 0,
	theoDoi: false,
	hienThi: "cong-khai",
	soNguoiXem: 0,
	soGopYCho: 0,
};

const RONG_DONG = {
	keyResultId: null,
	truong: null,
	truoc: null,
	sau: null,
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId: null,
	tenDich: null,
	canCu: null,
} as const;

export const D_TEN: DongHien = {
	...RONG_DONG,
	id: "d-ten",
	loai: "viet-lai",
	objectiveId: MT.id,
	truong: "title",
	truoc: MT.title,
	sau: "Không thoả thuận nào của miền Bắc bị mất dấu",
	lyDo: "Tên đang nói việc làm; câu mới nói kết quả.",
};
export const D_VI_SAO: DongHien = {
	...RONG_DONG,
	id: "d-vi-sao",
	loai: "viet-lai",
	objectiveId: MT.id,
	truong: "whyNow",
	truoc: MT.whyNow,
	sau: "Quý 3 mất dấu 9 thoả thuận; đầu quý 1 là mùa ký lại.",
	lyDo: "Nói rõ vì sao là lúc này.",
};
export const D_KR: DongHien = {
	...RONG_DONG,
	id: "d-kr",
	loai: "viet-lai",
	objectiveId: MT.id,
	keyResultId: KR_1.id,
	truong: "kr.title",
	truoc: KR_1.title,
	sau: "Khách mới hẹn gặp được sau cuộc gọi đầu",
	lyDo: "KR đang đếm việc làm.",
};
export const D_HOI_KR: DongHien = {
	...RONG_DONG,
	id: "d-hoi-kr",
	loai: "hoi",
	objectiveId: MT.id,
	keyResultId: KR_2.id,
	maVanDe: "kr-la-viec",
	sau: "Chốt 12 thoả thuận thì doanh thu đổi bao nhiêu?",
	lyDo: "KR chưa nói kết quả",
};
export const D_HOI_MT: DongHien = {
	...RONG_DONG,
	id: "d-hoi-mt",
	loai: "hoi",
	objectiveId: MT.id,
	maVanDe: "kr-la-viec",
	sau: "Ai là người dùng chính của CRM mới?",
	lyDo: "Mục tiêu chưa nói ai hưởng lợi",
};
export const D_CAN: DongHien = {
	...RONG_DONG,
	id: "d-can",
	loai: "can-chinh",
	objectiveId: MT.id,
	targetKeyResultId: "kr-onehub",
	tenDich: "KR OneHub · Thoả thuận mới cả năm",
	lyDo: "Mục tiêu này góp thẳng vào số thoả thuận mới.",
};

export type DanhSach = {
	dong: DongHien[];
	dangSoan: boolean;
	maKetThuc: string | null;
	lyDo: null;
};

export const xong = (dong: DongHien[]): DanhSach => ({
	dong,
	dangSoan: false,
	maKetThuc: "da-nop",
	lyDo: null,
});

const chuaCo: DanhSach = {
	dong: [],
	dangSoan: false,
	maKetThuc: null,
	lyDo: null,
};

export function datMacDinh(dong: DongHien[]): void {
	trangThai.daGoi = [];
	trangThai.daBam = false;
	duLieu.clear();
	const sau = xong(dong);
	dat("okr.troLySanSang", () => ({ bat: true, conLaiUsd: 5 }));
	dat("okr.troLyDanhSach", (vao) => {
		const ds = trangThai.daBam ? sau : chuaCo;
		return vao?.keyResultId
			? {
					...ds,
					dong: ds.dong.filter((d) => d.keyResultId === vao.keyResultId),
				}
			: ds;
	});
	dat("okr.troLyDeXuat", () => {
		trangThai.daBam = true;
		return { bat: true, taskId: "t-1", dungLai: false };
	});
	dat("okr.troLyQuyet", () => ({ ok: true }));
	dat("okr.xuHuongKr", () => null);
	dat("okr.updateObjective", (vao) => ({ id: vao?.id, canhBao: null }));
	dat("okr.updateKeyResult", (vao) => ({ id: vao?.id, canhBao: null }));
	dat("okr.objective", () => ({
		...MT,
		keyResults: MT.keyResults.map((k) => ({
			...k,
			soViec: { xong: 0, tong: 0 },
			soSangKien: 0,
			coBangChung: false,
		})),
		cycleName: "Quý 4/2026",
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: [KR_1.id, KR_2.id],
		hienThi: "cong-khai",
		nguoiXem: [],
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: true,
			congBo: true,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
		},
	}));
	dat("okr.program", () => ({ weightsOn: false, personalOn: false }));
	dat("okr.cycles", () => ({ cycles: [], currentId: null }));
	dat("users.list", () => [{ ...HAI, image: null }]);
	dat("users.me", () => HAI);
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

export async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

export type TuyChonMo = {
	searchParams?: string;
	onUrlUpdate?: OnUrlUpdateFunction;
	giuHangDoiUrl?: boolean;
};

export async function mo(
	man: ReactElement,
	chon: TuyChonMo = {},
): Promise<void> {
	if (dangMo.length === 0) {
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		await act(async () => root.render(<Toaster />));
		dangMo.push({ o, root });
	}
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
				searchParams={chon.searchParams ?? ""}
				onUrlUpdate={chon.onUrlUpdate}
				resetUrlUpdateQueueOnMount={!chon.giuHangDoiUrl}
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

export async function dongHet(): Promise<void> {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
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

export async function bam(o: Element): Promise<void> {
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

export async function phim(o: Element | null, key: string): Promise<void> {
	if (!o) throw new Error(`khong co cho bam ${key}`);
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
	await nhip(3);
}

export function nutCo(chu: string, goc: ParentNode = document.body) {
	return (
		[...goc.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

export function nut(
	chu: string,
	goc: ParentNode = document.body,
): HTMLButtonElement {
	const tim = nutCo(chu, goc);
	if (!tim)
		throw new Error(
			`khong thay nut "${chu}" — ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	return tim;
}

export const hopMucTieu = () =>
	document.body.querySelector<HTMLElement>("[data-hop-thoai-muc-tieu]");
export const hopKr = () =>
	document.body.querySelector<HTMLElement>("[data-hop-thoai-kr]");
export const dongCua = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-dong="${id}"]`);
export const goiCua = (duong: string) =>
	trangThai.daGoi.filter((g) => g.duong === duong);
export const soHop = () =>
	document.body.querySelectorAll('[role="dialog"]').length;
