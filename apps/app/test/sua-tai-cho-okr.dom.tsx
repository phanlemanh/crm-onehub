import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ghiDuocOPha } from "@crm/validation/okr-chu-ky";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	KrCanhOutput,
	ObjectiveOutput,
} from "../../api/src/okr/okr.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const HUNG = nguoi("hung", "Trần Văn Hùng");
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const TUAN = nguoi("tuan", "Hoàng Anh Tuấn");
const TEN_MT = "Tăng khách hàng doanh nghiệp";
const TEN_KR = "Gọi lại khách sắp hết hạn";

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
	viec: { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false },
};

function taoKr(): KrCanhOutput {
	return {
		id: "kr-1",
		objectiveId: "mt-1",
		title: TEN_KR,
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
		startLocked: false,
		progress: 40,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
		soViec: { xong: 0, tong: 0 },
		soSangKien: 0,
		coBangChung: false,
	};
}

type Quyen = {
	canEdit?: boolean;
	canEditKr?: string[];
	status?: ObjectiveOutput["status"];
	choDuyet?: boolean;
	kyGhiDuoc?: boolean;
	whyNow?: string;
	owner?: typeof HUNG;
	krOwner?: typeof HUNG;
};

function taoMucTieu(q: Quyen = {}): ObjectiveOutput {
	const status = q.status ?? "cong-bo";
	return {
		themKrLe: false,
		id: "mt-1",
		cycleId: QUY.id,
		cycleName: QUY.name,
		kyGhiDuoc: q.kyGhiDuoc ?? ghiDuocOPha(QUY.phase),
		mangSangToi: null,
		mangSangTu: null,
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: TEN_MT,
		kind: "cam-ket",
		status,
		owner: q.owner ?? HUNG,
		participants: [],
		whyNow: q.whyNow ?? "",
		publishedAt: status === "cong-bo" ? "2026-10-02T00:00:00.000Z" : null,
		droppedAt: status === "da-bo" ? "2026-10-20T00:00:00.000Z" : null,
		progress: 40,
		expected: status === "cong-bo" ? 30 : null,
		keyResults: [{ ...taoKr(), owner: q.krOwner ?? HUNG }],
		alignments: [],
		canEdit: q.canEdit ?? true,
		following: false,
		followerCount: 0,
		theoDoi: false,
		soNguoiXem: 0,
		soGopYCho: 0,
		trail: [],
		canEditKr: q.canEditKr ?? ["kr-1"],
		hienThi: "cong-khai",
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: q.choDuyet
			? {
					guiLuc: "2026-10-03T00:00:00.000Z",
					nguoiGui: HUNG,
					nguoiDuyet: "quan-tri",
					lanTraLaiTruoc: null,
				}
			: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: true,
			congBo: false,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
		},
	} as ObjectiveOutput;
}

let chiTiet: ObjectiveOutput = taoMucTieu();
type DauVao =
	| {
			id?: string;
			title?: string;
			whyNow?: string;
			ownerUserId?: string;
			keyResultId?: string;
	  }
	| undefined;
type ChonDot = {
	onSuccess?: () => unknown;
	onError?: (loi: Error, vao: DauVao) => void;
};
const timNguoi = (id: string | undefined, ds: (typeof HUNG)[]) =>
	ds.find((n) => n.id === id);
type LoiGoi = { duong: string; dauVao: DauVao };
let daGoi: LoiGoi[] = [];
let loiGhi: { duong: string; loi: () => Error } | null = null;
let lamMoiBat = true;
let toastLoi: string[] = [];
let client: QueryClient | null = null;

const loiTrpc = (code: string, httpStatus: number) =>
	new TRPCClientError("SERVER_MSG_XYZ", {
		result: {
			error: {
				code: -32600,
				message: "SERVER_MSG_XYZ",
				data: { code, httpStatus },
			},
		},
	});

function apDung(duong: string, vao: DauVao) {
	if (!vao) return;
	if (duong === "okr.updateObjective") {
		const owner = timNguoi(vao.ownerUserId, [HUNG, LAN, TUAN]) ?? chiTiet.owner;
		chiTiet = {
			...chiTiet,
			title: vao.title ?? chiTiet.title,
			whyNow: vao.whyNow ?? chiTiet.whyNow,
			owner,
		};
	}
	if (duong === "okr.updateKeyResult") {
		chiTiet = {
			...chiTiet,
			keyResults: chiTiet.keyResults.map((k) =>
				k.id === vao.id
					? {
							...k,
							title: vao.title ?? k.title,
							owner: timNguoi(vao.ownerUserId, [HUNG, LAN]) ?? k.owner,
						}
					: k,
			),
		};
	}
}

function thuTuc<TRa>(
	duong: string,
	doc: (vao: DauVao) => TRa = () => null as TRa,
) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: ChonDot) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				if (loiGhi?.duong === duong) throw loiGhi.loi();
				apDung(duong, vao);
				return { id: "ok", canhBao: null };
			},
		}),
	};
}

const rong = (duong: string) => thuTuc(duong);

const coSan = <T extends object>(goc: T, tien: string): T =>
	new Proxy(goc, {
		get: (dich, khoa) =>
			Reflect.has(dich, khoa)
				? Reflect.get(dich, khoa)
				: rong(`${tien}.${String(khoa)}`),
	});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: coSan(
			{
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
				updateObjective: rong("okr.updateObjective"),
				updateKeyResult: rong("okr.updateKeyResult"),
				publishObjective: rong("okr.publishObjective"),
				dropObjective: rong("okr.dropObjective"),
				xoaMucTieu: rong("okr.xoaMucTieu"),
				dungLaiMucTieu: rong("okr.dungLaiMucTieu"),
				createObjective: rong("okr.createObjective"),
				createKeyResult: rong("okr.createKeyResult"),
				removeKeyResult: rong("okr.removeKeyResult"),
				addAlignment: rong("okr.addAlignment"),
				removeAlignment: rong("okr.removeAlignment"),
				mau: thuTuc("okr.mau", () => ({ mau: [], quanTri: false })),
				taoTuMau: rong("okr.taoTuMau"),
				comments: thuTuc("okr.comments", () => ({ comments: [], dong: [] })),
				thanhVien: thuTuc("okr.thanhVien", () => [HUNG, LAN]),
				chiSo: thuTuc("okr.chiSo", () => ({
					chiSo: [],
					bac: [],
					sheetsBat: false,
					emailSheets: null,
				})),
				xemTruocChiSo: rong("okr.xemTruocChiSo"),
				datNguonKr: rong("okr.datNguonKr"),
				addComment: rong("okr.addComment"),
				guiGhiNhan: rong("okr.guiGhiNhan"),
				goGhiNhan: rong("okr.goGhiNhan"),
				follow: rong("okr.follow"),
				moCapNhat: rong("okr.moCapNhat"),
				guiCapNhat: rong("okr.guiCapNhat"),
				canhKr: thuTuc("okr.canhKr", (vao) => {
					const k = chiTiet.keyResults.find((x) => x.id === vao?.keyResultId);
					return k
						? {
								kr: {
									id: k.id,
									title: k.title,
									kind: k.kind,
									objectiveId: chiTiet.id,
									ownerName: k.owner.name,
									xong: false,
								},
								dong: [],
								bangChung: [],
								quyen: { suaDuoc: false, ganDuoc: false },
								khoa: false,
								choDuyet: false,
							}
						: null;
				}),
				lichSuKr: thuTuc("okr.lichSuKr", () => ({
					kieu: "tang-toi",
					tieuDe: TEN_KR,
					dich: 50,
					donVi: "khách",
					coCapNhat: false,
					lan: [],
					chuoi: [],
				})),
				hopTuan: rong("okr.hopTuan"),
				themViec: rong("okr.themViec"),
				suaViec: rong("okr.suaViec"),
				danhDauViec: rong("okr.danhDauViec"),
				goViec: rong("okr.goViec"),
				themBangChung: rong("okr.themBangChung"),
				goBangChung: rong("okr.goBangChung"),
				ganSangKien: rong("okr.ganSangKien"),
				banGhiChiSo: rong("okr.banGhiChiSo"),
				lichSuSo: rong("okr.lichSuSo"),
				dienBien: thuTuc("okr.dienBien", () => ({
					kieu: "tang-toi",
					tieuDe: TEN_KR,
					khoi: 0,
					dich: 50,
					donVi: "khách",
					coCapNhat: false,
					tuanDau: null,
					diem: [],
				})),
				troLySanSang: thuTuc("okr.troLySanSang", () => ({
					bat: false,
					lyDo: "tat",
				})),
				mine: thuTuc("okr.mine", () => ({
					objectives: [],
					daBo: [],
					dangTheoDoi: [],
				})),
				danhSach: rong("okr.danhSach"),
				troLyDanhSach: thuTuc("okr.troLyDanhSach", () => ({
					dong: [],
					dangSoan: false,
					maKetThuc: null,
					lyDo: "tat",
				})),
				troLyDeXuat: rong("okr.troLyDeXuat"),
				troLyQuyet: rong("okr.troLyQuyet"),
				xuHuongKr: thuTuc("okr.xuHuongKr", () => null),
			},
			"okr",
		),
		workspace: {
			get: thuTuc("workspace.get", () => ({ viewerRole: "member" })),
		},
		onboarding: { listPlans: thuTuc("onboarding.listPlans", () => []) },
		campaigns: { list: thuTuc("campaigns.list", () => []) },
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
			list: thuTuc("users.list", () => [
				{ ...HUNG, image: null },
				{ ...LAN, image: null },
				{ ...TUAN, image: null },
			]),
			me: thuTuc("users.me", () => HUNG),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {
			if (lamMoiBat) await client?.invalidateQueries();
		},
	}),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		error: (cau: string) => {
			toastLoi.push(cau);
		},
		success: () => {},
		warning: () => {},
		info: () => {},
		message: () => {},
	}),
	Toaster: () => null,
}));

mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
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
const { KrSheet } = await import("@/components/crm/record-sheet/kr-sheet");
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { crmMessages } = await import("@/lib/messages/crm");

const nhan = okrMessages("vi").sheet;
const crm = crmMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function dung(sheet: ReactElement, duong: string): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	client ??= new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const qc = client;
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={duong}>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<DetailSheet onOpenChange={() => {}} open>
								{sheet}
							</DetailSheet>
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
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

const khuMt = () =>
	document.body.querySelector<HTMLElement>(
		'[data-okr-sheet] [data-khu="vi-sao"][data-muc-ngan="chi-tiet"]',
	);
const khuKr = () =>
	document.body.querySelector<HTMLElement>(
		'[data-kr-sheet] [data-muc-ngan="chi-tiet"]',
	);

async function moMt(q: Quyen = {}): Promise<HTMLElement> {
	chiTiet = taoMucTieu(q);
	await dung(<ObjectiveSheet objectiveId="mt-1" />, "?record=objective:mt-1");
	await cho(() => khuMt() !== null, "khoi chi tiet muc tieu");
	return khuMt() as HTMLElement;
}

async function moKr(q: Quyen = {}): Promise<HTMLElement> {
	chiTiet = taoMucTieu(q);
	await dung(<KrSheet keyResultId="kr-1" />, "?record=kr:kr-1");
	await cho(() => khuKr() !== null, "khoi chi tiet KR");
	return khuKr() as HTMLElement;
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

function oTheoNhan(khu: HTMLElement, chu: string): HTMLElement {
	const theoAria = khu.querySelector<HTMLElement>(`[aria-label="${chu}"]`);
	if (theoAria) return theoAria;
	const label = [...khu.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === chu,
	);
	const o = label?.htmlFor
		? khu.querySelector<HTMLElement>(`[id="${CSS.escape(label.htmlFor)}"]`)
		: label?.parentElement?.querySelector<HTMLElement>("button");
	if (!o) throw new Error(`khong thay o ${chu}`);
	return o;
}

function nutO(khu: HTMLElement, chu: string): HTMLElement {
	const label = [...khu.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === chu,
	);
	const nut =
		khu.querySelector<HTMLElement>(`button[aria-label="${chu}"]`) ??
		label?.parentElement?.querySelector<HTMLElement>("button") ??
		null;
	if (!nut) throw new Error(`khong thay nut o ${chu}`);
	return nut;
}

async function datGiaTri(o: Element, chu: string): Promise<void> {
	const Kieu =
		o instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
	const dat = Object.getOwnPropertyDescriptor(Kieu.prototype, "value")?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function phim(o: Element, key: string, ctrl = false): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				ctrlKey: ctrl,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
}

async function roiO(o: Element): Promise<void> {
	await act(async () => {
		(o as HTMLElement).focus();
		(o as HTMLElement).blur();
	});
}

async function nghi(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

type Ket = "enter" | "ctrl-enter" | "roi-o" | "esc";

async function suaChu(khu: HTMLElement, chu: string, giaTri: string, ket: Ket) {
	await bam(nutO(khu, chu));
	const o = await (async () => {
		await cho(
			() => khu.querySelector("input, textarea") !== null,
			`o ${chu} mo`,
		);
		return khu.querySelector("input, textarea") as HTMLElement;
	})();
	await datGiaTri(o, giaTri);
	if (ket === "enter") await phim(o, "Enter");
	if (ket === "ctrl-enter") await phim(o, "Enter", true);
	if (ket === "esc") await phim(o, "Escape");
	if (ket === "roi-o") await roiO(o);
	await nghi();
}

async function chonNguoi(khu: HTMLElement, ten: string | null) {
	const trigger = oTheoNhan(khu, nhan.truongNguoi);
	await bam(trigger);
	await cho(
		() => document.body.querySelector('[role="option"]') !== null,
		"danh sach nguoi",
	);
	if (ten === null) {
		await phim(document.activeElement ?? document.body, "Escape");
	} else {
		const muc = [...document.body.querySelectorAll('[role="option"]')].find(
			(x) => x.textContent?.trim() === ten,
		);
		if (!muc) throw new Error(`khong co lua chon ${ten}`);
		await act(async () => (muc as HTMLElement).focus());
		await phim(muc, "Enter");
	}
	await nghi();
}

const goi = (duong: string) =>
	daGoi.filter((g) => g.duong === duong).map((g) => g.dauVao);
const soDialog = () => document.body.querySelectorAll('[role="dialog"]').length;
const dauNgan = () =>
	[
		...document.body.querySelectorAll(
			'[data-slot="sheet-header"], [data-slot="drawer-header"]',
		),
	]
		.map((x) => x.textContent ?? "")
		.join(" | ");
const soOSua = (khu: HTMLElement) =>
	new Set(khu.querySelectorAll('button, input, textarea, [role="combobox"]'))
		.size;

beforeEach(() => {
	daGoi = [];
	loiGhi = null;
	lamMoiBat = true;
	toastLoi = [];
	client = null;
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("sua-tai-cho-okr: ngăn mục tiêu", () => {
	test("mt-ten-enter: sửa Tên rồi Enter → đúng một lời gọi { id, title }, đầu ngăn đổi, không lớp chồng", async () => {
		const khu = await moMt();
		const truoc = soDialog();
		await suaChu(khu, nhan.truongTen, "Giữ chân khách doanh nghiệp", "enter");
		expect(goi("okr.updateObjective")).toEqual([
			{ id: "mt-1", title: "Giữ chân khách doanh nghiệp" },
		]);
		await cho(
			() => dauNgan().includes("Giữ chân khách doanh nghiệp"),
			"dau ngan doi",
		);
		expect(soDialog()).toBe(truoc);
	});

	test("mt-ten-enter-doi-chung: không gõ gì mà Enter → 0 lời gọi", async () => {
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, TEN_MT, "enter");
		expect(goi("okr.updateObjective")).toEqual([]);
	});

	test("mt-ten-roi-o: gõ rồi rời ô → { id, title }", async () => {
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "Tên mới khi rời ô", "roi-o");
		expect(goi("okr.updateObjective")).toEqual([
			{ id: "mt-1", title: "Tên mới khi rời ô" },
		]);
	});

	test("mt-ten-esc: gõ rồi Esc → 0 lời gọi, ô hiện tên cũ", async () => {
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "Không lưu", "esc");
		expect(goi("okr.updateObjective")).toEqual([]);
		expect(nutO(khu, nhan.truongTen).textContent).toContain(TEN_MT);
	});

	test("mt-vi-sao-rong: «Vì sao» rỗng vẫn có ô; hai dòng + Ctrl+Enter → { id, whyNow }", async () => {
		const khu = await moMt({ whyNow: "" });
		expect(nutO(khu, nhan.truongViSao)).toBeTruthy();
		await suaChu(khu, nhan.truongViSao, "Dòng một\nDòng hai", "ctrl-enter");
		expect(goi("okr.updateObjective")).toEqual([
			{ id: "mt-1", whyNow: "Dòng một\nDòng hai" },
		]);
	});

	test("mt-nguoi: chọn thành viên khác → { id, ownerUserId }, ô hiện tên mới", async () => {
		const khu = await moMt();
		await chonNguoi(khu, LAN.name);
		expect(goi("okr.updateObjective")).toEqual([
			{ id: "mt-1", ownerUserId: "lan" },
		]);
		await cho(
			() =>
				oTheoNhan(
					khuMt() as HTMLElement,
					nhan.truongNguoi,
				).textContent?.includes(LAN.name) === true,
			"o nguoi doi",
		);
	});

	test("mt-nguoi-da-roi: người phụ trách không còn trong đội → tên kèm «đã rời»", async () => {
		const khu = await moMt({ owner: TUAN });
		await cho(
			() =>
				(oTheoNhan(khu, nhan.truongNguoi).textContent ?? "").includes(
					TUAN.name,
				),
			"o nguoi da roi",
		);
		const chu = oTheoNhan(khu, nhan.truongNguoi).textContent ?? "";
		expect(chu).toContain(TUAN.name);
		expect(chu).toContain(crm.owner.formerMember);
	});
});

describe("sua-tai-cho-okr: ngăn KR", () => {
	test("kr-ten: người có quyền đơn vị sửa Tên KR, Enter → { id, title }", async () => {
		const khu = await moKr();
		await suaChu(khu, nhan.truongTen, "Gọi lại mọi khách", "enter");
		expect(goi("okr.updateKeyResult")).toEqual([
			{ id: "kr-1", title: "Gọi lại mọi khách" },
		]);
	});

	test("kr-nguoi: đổi người phụ trách KR → { id, ownerUserId }", async () => {
		const khu = await moKr();
		await chonNguoi(khu, LAN.name);
		expect(goi("okr.updateKeyResult")).toEqual([
			{ id: "kr-1", ownerUserId: "lan" },
		]);
	});

	test("kr-chi-chu: chỉ là chủ KR → Tên sửa được, Người phụ trách chỉ đọc", async () => {
		const khu = await moKr({ canEdit: false, canEditKr: ["kr-1"] });
		expect(nutO(khu, nhan.truongTen)).toBeTruthy();
		expect(khu.querySelector('[role="combobox"]')).toBeNull();
		expect(khu.textContent).toContain(HUNG.name);
	});
});

const KHOA = {
	"khong-quyen": { canEdit: false, canEditKr: [] },
	"da-bo": { status: "da-bo" },
	"cho-duyet": { status: "cho-duyet", choDuyet: true },
	"chu-ky-khoa": { kyGhiDuoc: false },
	"chi-doc-kr": { canEdit: false, canEditKr: [] },
} satisfies Record<string, Quyen>;

describe("sua-tai-cho-okr: bị khoá thì chỉ đọc", () => {
	for (const [ca, q] of Object.entries(KHOA)) {
		test(`khoa-mt-${ca}: ngăn mục tiêu 0 ô sửa, ba giá trị hiện chữ`, async () => {
			const khu = await moMt({ ...q, whyNow: "Lý do rõ ràng" });
			expect(soOSua(khu)).toBe(0);
			expect(khu.textContent).toContain(TEN_MT);
			expect(khu.textContent).toContain("Lý do rõ ràng");
			expect(khu.textContent).toContain(HUNG.name);
		});
		test(`khoa-kr-${ca}: ngăn KR 0 ô sửa, tên và người hiện chữ`, async () => {
			const khu = await moKr(q);
			expect(soOSua(khu)).toBe(0);
			expect(khu.textContent).toContain(TEN_KR);
			expect(khu.textContent).toContain(HUNG.name);
		});
	}

	test("khoa-doi-chung: sửa được thì mục tiêu có 3 ô, KR có 2 ô", async () => {
		expect(soOSua(await moMt())).toBe(3);
		for (const san of dangMo) await act(async () => san.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		client = null;
		expect(soOSua(await moKr())).toBe(2);
	});
});

describe("sua-tai-cho-okr: lỗi lưu", () => {
	test("ten-ngan: «ab» + Enter → 0 lời gọi, câu độ dài, ô giữ tên cũ", async () => {
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "ab", "enter");
		expect(goi("okr.updateObjective")).toEqual([]);
		expect(toastLoi).toEqual([nhan.tenDoDai]);
		expect(nutO(khu, nhan.truongTen).textContent).toContain(TEN_MT);
	});

	test("vi-sao-dai: 501 ký tự → 0 lời gọi, câu độ dài", async () => {
		const khu = await moMt({ whyNow: "Cũ" });
		await suaChu(khu, nhan.truongViSao, "a".repeat(501), "ctrl-enter");
		expect(goi("okr.updateObjective")).toEqual([]);
		expect(toastLoi).toEqual([nhan.viSaoDai]);
		expect(nutO(khu, nhan.truongViSao).textContent).toContain("Cũ");
	});

	test("nguoi-roi: BAD_REQUEST khi lưu người → câu «không còn trong đội»", async () => {
		loiGhi = {
			duong: "okr.updateObjective",
			loi: () => loiTrpc("BAD_REQUEST", 400),
		};
		const khu = await moMt();
		await chonNguoi(khu, LAN.name);
		await cho(() => toastLoi.length > 0, "toast");
		expect(toastLoi[0]).toContain(crm.truongKieu.tuChoi.nguoi);
		expect(toastLoi.join(" ")).not.toContain("SERVER_MSG_XYZ");
		await cho(
			() =>
				oTheoNhan(
					khuMt() as HTMLElement,
					nhan.truongNguoi,
				).textContent?.includes(HUNG.name) === true,
			"o nguoi ve cu",
		);
	});

	test("nguoi-cam: FORBIDDEN khi lưu người → «Chưa lưu được Phụ trách. Thử lại sau một lát.»", async () => {
		loiGhi = {
			duong: "okr.updateKeyResult",
			loi: () => loiTrpc("FORBIDDEN", 403),
		};
		const khu = await moKr();
		await chonNguoi(khu, LAN.name);
		await cho(() => toastLoi.length > 0, "toast");
		expect(toastLoi).toEqual(["Chưa lưu được Phụ trách. Thử lại sau một lát."]);
	});

	test("ten-loi: INTERNAL_SERVER_ERROR khi lưu tên → «Chưa lưu được Tên. Thử lại sau một lát.»", async () => {
		loiGhi = {
			duong: "okr.updateObjective",
			loi: () => loiTrpc("INTERNAL_SERVER_ERROR", 500),
		};
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "Tên hợp lệ khác", "enter");
		await cho(() => toastLoi.length > 0, "toast");
		expect(toastLoi).toEqual(["Chưa lưu được Tên. Thử lại sau một lát."]);
		await cho(
			() =>
				nutO(khuMt() as HTMLElement, nhan.truongTen).textContent?.includes(
					TEN_MT,
				) === true,
			"o ten ve cu",
		);
	});
});

describe("sua-tai-cho-okr: làm mới", () => {
	test("lam-moi-mt: lưu tên mục tiêu → đầu ngăn mục tiêu có tên mới", async () => {
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "Tên làm mới", "enter");
		await cho(() => dauNgan().includes("Tên làm mới"), "khong lam moi");
	});

	test("lam-moi-kr: lưu tên KR → đầu ngăn KR và dòng KR trong ngăn mục tiêu có tên mới", async () => {
		chiTiet = taoMucTieu();
		await dung(<ObjectiveSheet objectiveId="mt-1" />, "?record=objective:mt-1");
		await cho(() => khuMt() !== null, "ngan muc tieu");
		await dung(<KrSheet keyResultId="kr-1" />, "?record=kr:kr-1");
		await cho(() => khuKr() !== null, "ngan KR");
		await suaChu(khuKr() as HTMLElement, nhan.truongTen, "KR làm mới", "enter");
		await cho(
			() =>
				(
					document.body.querySelector("[data-kr-sheet]")?.textContent ?? ""
				).includes("KR làm mới") &&
				(
					document.body.querySelector("[data-okr-sheet] table")?.textContent ??
					""
				).includes("KR làm mới"),
			"khong lam moi",
		);
	});

	test("sua-menu: «Sửa» ở menu đầu ngăn vẫn mở hộp sửa mục tiêu", async () => {
		await moMt();
		const trigger = document.body.querySelector(`[aria-label="${nhan.menu}"]`);
		if (!trigger) throw new Error("khong co menu dau ngan");
		await bam(trigger);
		await cho(
			() => document.body.querySelector('[role="menuitem"]') !== null,
			"menu dau ngan mo",
		);
		const sua = [...document.body.querySelectorAll('[role="menuitem"]')].find(
			(o) => o.textContent === nhan.sua,
		);
		if (!sua) throw new Error("khong co muc Sua");
		await bam(sua);
		await cho(
			() =>
				document.body.querySelector('[data-hop-thoai-muc-tieu="mt-1"]') !==
				null,
			"hop sua muc tieu",
		);
	});

	test("lam-moi-doi-chung: bỏ cache.okr → đầu ngăn không đổi", async () => {
		lamMoiBat = false;
		const khu = await moMt();
		await suaChu(khu, nhan.truongTen, "Tên không làm mới", "enter");
		await expect(
			cho(() => dauNgan().includes("Tên không làm mới"), "khong lam moi"),
		).rejects.toThrow("khong lam moi");
	});
});

type O13 = {
	ngan: "mt" | "kr";
	truong: "ten" | "vi-sao" | "nguoi";
	ket: Ket | "chon";
};

const MA_TRAN: O13[] = [
	{ ngan: "mt", truong: "ten", ket: "enter" },
	{ ngan: "mt", truong: "ten", ket: "roi-o" },
	{ ngan: "mt", truong: "ten", ket: "esc" },
	{ ngan: "mt", truong: "vi-sao", ket: "ctrl-enter" },
	{ ngan: "mt", truong: "vi-sao", ket: "roi-o" },
	{ ngan: "mt", truong: "vi-sao", ket: "esc" },
	{ ngan: "mt", truong: "nguoi", ket: "chon" },
	{ ngan: "mt", truong: "nguoi", ket: "esc" },
	{ ngan: "kr", truong: "ten", ket: "enter" },
	{ ngan: "kr", truong: "ten", ket: "roi-o" },
	{ ngan: "kr", truong: "ten", ket: "esc" },
	{ ngan: "kr", truong: "nguoi", ket: "chon" },
	{ ngan: "kr", truong: "nguoi", ket: "esc" },
];

describe("sua-tai-cho-okr: ma trận cách kết", () => {
	test("ma-tran-du-13", () => {
		expect(MA_TRAN.length).toBe(13);
	});
	for (const o of MA_TRAN) {
		test(`ket: ${o.ngan}-${o.truong}-${o.ket}`, async () => {
			const khu = o.ngan === "mt" ? await moMt() : await moKr();
			const duong =
				o.ngan === "mt" ? "okr.updateObjective" : "okr.updateKeyResult";
			const id = o.ngan === "mt" ? "mt-1" : "kr-1";
			if (o.truong === "nguoi") {
				await chonNguoi(khu, o.ket === "chon" ? LAN.name : null);
				expect(goi(duong)).toEqual(
					o.ket === "chon" ? [{ id, ownerUserId: "lan" }] : [],
				);
				return;
			}
			const chu = o.truong === "ten" ? nhan.truongTen : nhan.truongViSao;
			const moi = o.truong === "ten" ? "Giá trị mới hợp lệ" : "Lý do\nmới";
			await suaChu(khu, chu, moi, o.ket as Ket);
			const khoa = o.truong === "ten" ? "title" : "whyNow";
			expect(goi(duong)).toEqual(o.ket === "esc" ? [] : [{ id, [khoa]: moi }]);
		});
	}
});
