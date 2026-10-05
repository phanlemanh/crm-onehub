import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	KrCanhOutput,
	KrOutput,
	ObjectiveOutput,
} from "../../api/src/okr/okr.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const HUNG = nguoi("hung", "Trần Văn Hùng");

const QUY: ChuKyOutput = {
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
};

function kr(thay: Partial<KrOutput>): KrCanhOutput {
	return {
		id: "kr-1",
		objectiveId: "mt-1",
		title: "KR kr-1",
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
		hienTaiQuaCapNhat: true,
		soViec: { xong: 0, tong: 0 },
		soSangKien: 0,
		coBangChung: false,
		...thay,
	};
}

function mucTieu(
	k: Partial<KrOutput>,
	thay: Partial<ObjectiveOutput>,
): ObjectiveOutput {
	return {
		themKrLe: false,
		id: "mt-1",
		cycleId: QUY.id,
		cycleName: QUY.name,
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: "Tăng khách hàng doanh nghiệp",
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 40,
		expected: 30,
		keyResults: [kr(k)],
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		soNguoiXem: 0,
		soGopYCho: 0,
		trail: [],
		canEditKr: [],
		hienThi: "cong-khai",
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
		},
		...thay,
	};
}

let chiTiet: ObjectiveOutput;

type DauVao = { readonly id?: string } | undefined;

type TuyChonGhi = {
	onSuccess?: (kq: { id: string; canhBao: string | null }) => unknown;
	onError?: (e: Error) => void;
};

function thuTuc<TRa>(duong: string, doc: () => TRa = () => null as TRa) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async () => ({ id: "ok", canhBao: null }),
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			objective: thuTuc("okr.objective", () => chiTiet),
			cycles: thuTuc("okr.cycles", () => ({
				cycles: [QUY],
				currentId: QUY.id,
			})),
			program: thuTuc("okr.program", () => ({
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: false,
				version: 1,
			})),
			alignmentTargets: thuTuc("okr.alignmentTargets", () => ({
				targets: [],
			})),
			publishObjective: thuTuc("okr.publishObjective"),
			dropObjective: thuTuc("okr.dropObjective"),
			updateObjective: thuTuc("okr.updateObjective"),
			createObjective: thuTuc("okr.createObjective"),
			createKeyResult: thuTuc("okr.createKeyResult"),
			updateKeyResult: thuTuc("okr.updateKeyResult"),
			removeKeyResult: thuTuc("okr.removeKeyResult"),
			addAlignment: thuTuc("okr.addAlignment"),
			removeAlignment: thuTuc("okr.removeAlignment"),
			comments: thuTuc("okr.comments", () => ({ comments: [], dong: [] })),
			thanhVien: thuTuc("okr.thanhVien", () => [HUNG]),
			chiSo: thuTuc("okr.chiSo", () => ({
				chiSo: [],
				bac: [],
				sheetsBat: false,
				emailSheets: null,
			})),
			xemTruocChiSo: thuTuc("okr.xemTruocChiSo"),
			datNguonKr: thuTuc("okr.datNguonKr"),
			addComment: thuTuc("okr.addComment"),
			follow: thuTuc("okr.follow"),
			moCapNhat: thuTuc("okr.moCapNhat"),
			guiCapNhat: thuTuc("okr.guiCapNhat"),
			troLySanSang: thuTuc("okr.troLySanSang", () => ({
				bat: false,
				lyDo: "tat",
			})),
			mine: thuTuc("okr.mine", () => ({ objectives: [] })),
			danhSach: thuTuc("okr.danhSach"),
			troLyDanhSach: thuTuc("okr.troLyDanhSach", () => ({
				dong: [],
				dangSoan: false,
				maKetThuc: null,
				docLuc: null,
				lyDo: "tat",
			})),
			troLyDeXuat: thuTuc("okr.troLyDeXuat"),
			troLyQuyet: thuTuc("okr.troLyQuyet"),
		},
		workspace: {
			get: thuTuc("workspace.get", () => ({ viewerRole: "member" })),
		},
		org: {
			tree: thuTuc("org.tree", () => ({
				divisions: [],
				chuaXep: [],
				chuaCoPhongBan: [],
				people: [],
				archived: { divisions: [], departments: [] },
				coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
			})),
		},
		users: {
			list: thuTuc("users.list", () => [{ ...HUNG, image: null }]),
			me: thuTuc("users.me", () => HUNG),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ okr: async () => {} }),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

let dangMo: { o: HTMLElement; root: Root }[] = [];

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

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

async function mo(): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="?record=objective:mt-1">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<DetailSheet onOpenChange={() => {}} open>
								<ObjectiveSheet objectiveId="mt-1" />
							</DetailSheet>
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await cho(
		() => document.body.querySelector("[data-okr-sheet] [role=tab]") !== null,
		"sheet tai xong",
	);
}

async function dem(muc: string): Promise<number> {
	const nutMenu = document.body.querySelector(
		'[aria-label="Thao tác với KR kr-1"]',
	);
	if (!nutMenu) return 0;
	await bam(nutMenu);
	await cho(
		() => document.body.querySelector('[role="menuitem"]') !== null,
		"menu KR mo",
	);
	return document.body.querySelectorAll(`[data-muc="${muc}"]`).length;
}

async function don(): Promise<void> {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
}

beforeEach(() => {
	chiTiet = mucTieu({}, {});
});

afterEach(don);

describe("sheet-quyen", () => {
	test("sheet-quyen: ma tran 6 o [laCuaToi, canEdit, canEditKr co kr-1] -> muc Cap nhat hien khi va chi khi canEditKr co kr-1", async () => {
		const MA_TRAN: [boolean, boolean, boolean, number][] = [
			[true, false, true, 1],
			[false, true, true, 1],
			[true, false, false, 0],
			[false, true, false, 0],
			[false, false, true, 1],
			[true, true, false, 0],
		];
		const lech: string[] = [];
		for (const [laCuaToi, canEdit, coKr, mong] of MA_TRAN) {
			chiTiet = mucTieu(
				{ laCuaToi },
				{ canEdit, canEditKr: coKr ? ["kr-1"] : [] },
			);
			await mo();
			const co = await dem("cap-nhat-kr");
			if (co !== mong) lech.push(`${laCuaToi},${canEdit},${coKr}`);
			await don();
		}
		if (lech.length > 0) {
			throw new Error(`sheet-quyen: o ${lech.join(" | ")}`);
		}
		expect(lech).toEqual([]);
	});

	test("sheet-quyen: doi chung — KR khong nhan cap nhat tuan, canEditKr co kr-1: an Cap nhat, van co Sua", async () => {
		chiTiet = mucTieu(
			{ hienTaiQuaCapNhat: false },
			{ canEdit: true, canEditKr: ["kr-1"] },
		);
		await mo();
		expect({
			capNhat: await dem("cap-nhat-kr"),
			sua: document.body.querySelectorAll('[data-muc="sua-kr"]').length,
		}).toEqual({ capNhat: 0, sua: 1 });
	});
});
