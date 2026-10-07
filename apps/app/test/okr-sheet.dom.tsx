import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ghiDuocOPha } from "@crm/validation/okr-chu-ky";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	CommentsOutput,
	KrCanhOutput,
	KrOutput,
	ObjectiveOutput,
	VetOutput,
} from "../../api/src/okr/okr.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const HUNG = nguoi("hung", "Trần Văn Hùng");
const LAN = nguoi("lan", "Nguyễn Thị Lan");

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

function kr(id: string, startLocked: boolean): KrCanhOutput {
	return {
		id,
		objectiveId: "mt-1",
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
		startLocked,
		progress: 40,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
		soViec: { xong: 0, tong: 0 },
		soSangKien: 0,
		coBangChung: false,
	};
}

function vet(
	id: string,
	action: VetOutput["action"],
	before: VetOutput["before"],
	after: VetOutput["after"],
): VetOutput {
	return {
		id,
		at: `2026-10-0${id.slice(-1)}T03:15:00.000Z`,
		actor: HUNG,
		action,
		keyResultId: null,
		before,
		after,
		note: null,
	};
}

function mucTieu(
	status: ObjectiveOutput["status"],
	coKhoa: boolean,
): ObjectiveOutput {
	return {
		themKrLe: false,
		id: "mt-1",
		cycleId: QUY.id,
		cycleName: QUY.name,
		kyGhiDuoc: ghiDuocOPha(phaQuy),
		mangSangToi: null,
		mangSangTu: null,
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: "Tăng khách hàng doanh nghiệp",
		kind: "cam-ket",
		status,
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: status === "cong-bo" ? "2026-10-02T00:00:00.000Z" : null,
		droppedAt: null,
		progress: 40,
		expected: status === "cong-bo" ? 30 : null,
		keyResults: [kr("kr-1", coKhoa)],
		alignments: [],
		canEdit: true,
		following: false,
		followerCount: 0,
		theoDoi: false,
		soNguoiXem: 0,
		soGopYCho: 0,
		trail: [],
		canEditKr: ["kr-1"],
		hienThi: "cong-khai",
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: true,
			congBo: status === "nhap",
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
		},
	};
}

let chiTiet: ObjectiveOutput;
let binhLuan: CommentsOutput["comments"] = [];

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
let daGoi: LoiGoi[] = [];
let daLamMoi: string[] = [];

let loiGhi: { duong: string; loi: string } | null = null;
type CamSheets = { sheetsBat: boolean; emailSheets: string | null };
const SHEETS_TAT: CamSheets = { sheetsBat: false, emailSheets: null };
let sheets = SHEETS_TAT;
let origin: string | null = null;
let cuaSoRa: ChuKyOutput["cuaSoRa"] = null;
let phaQuy: ChuKyOutput["phase"] = QUY.phase;
const TRONG_RA = { id: "ra-1", tuNgay: "2026-11-16", denNgay: "2026-11-22" };

function thuTuc<TRa, TKet = { id: string; canhBao: string | null }>(
	duong: string,
	doc: (vao: DauVao) => TRa = () => null as TRa,
	ket: (vao: DauVao) => TKet = () => ({ id: "ok", canhBao: null }) as TKet,
) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: TKet) => unknown;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				if (loiGhi?.duong === duong) throw new Error(loiGhi.loi);
				return ket(vao);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			objective: thuTuc("okr.objective", () => chiTiet),
			cycles: thuTuc("okr.cycles", () => ({
				cycles: [{ ...QUY, phase: phaQuy, cuaSoRa }],
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
			mau: thuTuc("okr.mau", () => ({ mau: [], quanTri: false })),
			taoTuMau: thuTuc("okr.taoTuMau"),
			createKeyResult: thuTuc("okr.createKeyResult"),
			updateKeyResult: thuTuc("okr.updateKeyResult"),
			removeKeyResult: thuTuc("okr.removeKeyResult"),
			addAlignment: thuTuc("okr.addAlignment"),
			removeAlignment: thuTuc("okr.removeAlignment"),
			comments: thuTuc("okr.comments", () => ({
				comments: binhLuan,
				dong: binhLuan.map((c) => ({
					loai: "binh-luan" as const,
					id: c.id,
					createdAt: c.createdAt,
				})),
			})),
			thanhVien: thuTuc("okr.thanhVien", () => [HUNG, LAN]),
			chiSo: thuTuc("okr.chiSo", () => ({
				chiSo: ["thoa-thuan-chot-duoc", "ghi-danh-dat-bac"],
				bac: ["tai-khoan"],
				...sheets,
			})),
			xemTruocChiSo: thuTuc("okr.xemTruocChiSo", () => ({
				giaTri: 0,
				tu: QUY.startsOn,
				den: QUY.startsOn,
			})),
			datNguonKr: thuTuc(
				"okr.datNguonKr",
				() => null,
				(vao) => ({ id: String(vao?.keyResultId), doCanh: false }),
			),
			addComment: thuTuc("okr.addComment"),
			guiGhiNhan: thuTuc("okr.guiGhiNhan"),
			goGhiNhan: thuTuc("okr.goGhiNhan"),
			follow: thuTuc(
				"okr.follow",
				() => null,
				(vao) => ({ following: vao?.on === true, followerCount: 1 }),
			),
			moCapNhat: thuTuc(
				"okr.moCapNhat",
				() => null,
				() => ({ sessionId: "phien-1" }),
			),
			guiCapNhat: thuTuc(
				"okr.guiCapNhat",
				() => null,
				() => ({ written: 1, seconds: 12 }),
			),
			troLySanSang: thuTuc("okr.troLySanSang", () => ({
				bat: false,
				lyDo: "tat",
			})),
			mine: thuTuc("okr.mine", () => ({ objectives: [], daBo: [] })),
			danhSach: thuTuc("okr.danhSach"),
			troLyDanhSach: thuTuc("okr.troLyDanhSach", () => ({
				dong: [],
				dangSoan: false,
				maKetThuc: null,
				lyDo: "tat",
			})),
			troLyDeXuat: thuTuc("okr.troLyDeXuat"),
			troLyQuyet: thuTuc("okr.troLyQuyet"),
			xuHuongKr: thuTuc("okr.xuHuongKr", () => null),
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
			list: thuTuc("users.list", () => [
				{ ...HUNG, image: null },
				{ ...LAN, image: null },
			]),
			me: thuTuc("users.me", () => HUNG),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async (id?: string) => {
			daLamMoi.push(id ?? "");
		},
	}),
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
const { ApiOriginProvider } = await import("@/components/api-origin");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi");
const { okrSoMessages } = await import("@/lib/messages/okr-so");
const so = okrSoMessages("vi").trangThai.hopThoai;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

function SheetDongDuoc({ children }: { children: ReactElement }) {
	const [moSheet, datMoSheet] = useState(true);
	return (
		<DetailSheet onOpenChange={datMoSheet} open={moSheet}>
			{children}
		</DetailSheet>
	);
}

async function mo(
	duong = "?record=objective:mt-1",
	dongDuoc = false,
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const sheet: ReactElement = dongDuoc ? (
		<SheetDongDuoc>
			<ObjectiveSheet objectiveId="mt-1" />
		</SheetDongDuoc>
	) : (
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId="mt-1" />
		</DetailSheet>
	);
	const man = origin ? (
		<ApiOriginProvider origin={origin}>{sheet}</ApiOriginProvider>
	) : (
		sheet
	);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={duong}>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(
		() => document.body.querySelector("[data-okr-sheet] [role=tab]") !== null,
		"sheet tai xong",
	);
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
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
	);
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

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement)) throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!tim)
		throw new Error(
			`khong thay nut "${chu}" — ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	return tim;
}

const hop = () => document.body.querySelector("[data-hop-thoai-kr]");

beforeEach(() => {
	daGoi = [];
	daLamMoi = [];
	loiGhi = null;
	binhLuan = [];
	sheets = SHEETS_TAT;
	origin = null;
	cuaSoRa = null;
	phaQuy = QUY.phase;
	chiTiet = mucTieu("nhap", false);
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("sheet-nhap-co-nut-cong-bo", () => {
	test("sheet-nhap-co-nut-cong-bo: nhap co nut Cong bo sang, ba tab, cong bo goi dung thu tuc", async () => {
		await mo();
		const sheet = document.body.querySelector("[data-okr-sheet]");
		const truoc = {
			trangThai: sheet?.getAttribute("data-trang-thai"),
			tieuDe: document.body.querySelector(
				'[data-slot="sheet-title"] [translate="no"]',
			)?.textContent,
			tab: [
				...document.body.querySelectorAll("[data-okr-sheet] [role=tab]"),
			].map((t) => t.textContent),
			congBo: document.body.querySelectorAll('[data-nut="cong-bo"]').length,
			themKr: document.body.querySelectorAll('[data-nut="them-kr"]').length,
			nhap: sheet?.textContent?.includes(m.trangThai.nhap),
			moTa: sheet?.textContent?.includes("Kinh doanh vùng 1 · Quý 4/2026"),
		};
		expect(truoc).toEqual({
			trangThai: "ST-sheet-nhap",
			tieuDe: "Tăng khách hàng doanh nghiệp",
			tab: ["KR1", "Căn chỉnh", "Vết", "Trao đổi", "Diễn biến"],
			congBo: 1,
			themKr: 1,
			nhap: true,
			moTa: true,
		});

		const nutCongBo = document.body.querySelector('[data-nut="cong-bo"]');
		if (!nutCongBo) throw new Error("khong co nut cong bo");
		await bam(nutCongBo);
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hop hoi cong bo",
		);
		const hoi = document.body.querySelector('[role="alertdialog"]');
		if (!hoi) throw new Error("khong co hop hoi");
		await bam(nut(m.sheet.hoiCongBo.action, hoi));
		await cho(() => daLamMoi.length > 0, "lam moi sau cong bo");
		expect(daGoi).toEqual([
			{ duong: "okr.publishObjective", dauVao: { id: "mt-1" } },
		]);
		expect(daLamMoi).toEqual(["mt-1"]);
	});

	test("sheet-nhap-co-nut-cong-bo: doi chung — da cong bo khong co nut, da bo khong nut ghi nao", async () => {
		chiTiet = mucTieu("cong-bo", true);
		await mo();
		const congBo = {
			trangThai: document.body
				.querySelector("[data-okr-sheet]")
				?.getAttribute("data-trang-thai"),
			congBo: document.body.querySelectorAll('[data-nut="cong-bo"]').length,
			themKr: document.body.querySelectorAll('[data-nut="them-kr"]').length,
			leRa: document.body.textContent?.includes("lẽ ra 30%"),
		};
		for (const san of dangMo) await act(async () => san.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		chiTiet = { ...mucTieu("da-bo", true), canEdit: true };
		await mo();
		expect({
			congBo,
			daBo: {
				trangThai: document.body
					.querySelector("[data-okr-sheet]")
					?.getAttribute("data-trang-thai"),
				nutGhi: document.body.querySelectorAll(
					'[data-nut="cong-bo"], [data-nut="them-kr"], [aria-label="Thao tác với mục tiêu"]',
				).length,
				menuKr: document.body.querySelectorAll(
					'[aria-label="Thao tác với KR kr-1"]',
				).length,
			},
		}).toEqual({
			congBo: {
				trangThai: "ST-sheet-congbo",
				congBo: 0,
				themKr: 1,
				leRa: true,
			},
			daBo: { trangThai: "ST-sheet-dabo", nutGhi: 0, menuKr: 0 },
		});
	});
});

describe("sheet-cong-bo-khoa-khoi-diem", () => {
	test("sheet-cong-bo-khoa-khoi-diem: sua KR da cong bo, o khoi diem disabled co chu thich", async () => {
		chiTiet = mucTieu("cong-bo", true);
		await mo();
		const menu = document.body.querySelector(
			'[aria-label="Thao tác với KR kr-1"]',
		);
		if (!menu) throw new Error("khong co menu KR");
		await bam(menu);
		await cho(
			() => document.body.querySelector('[role="menuitem"]') !== null,
			"menu KR mo",
		);
		const sua = [...document.body.querySelectorAll('[role="menuitem"]')].find(
			(o) => o.textContent === m.sheet.suaKr,
		);
		if (!sua) throw new Error("khong co muc Sua");
		await bam(sua);
		await cho(() => hop() !== null, "hop thoai KR");
		const o = hop()?.querySelector("[data-o-khoi-diem]");
		const moTaId = o?.getAttribute("aria-describedby") ?? "";
		expect({
			disabled: o instanceof HTMLInputElement && o.disabled,
			moTa: moTaId ? document.getElementById(moTaId)?.textContent : null,
			tieuDe: hop()?.querySelector('[data-slot="sheet-title"]')?.textContent,
		}).toEqual({
			disabled: true,
			moTa: m.hopThoai.daKhoa,
			tieuDe: m.hopThoai.suaKr,
		});
	});

	test("sheet-cong-bo-khoa-khoi-diem: doi chung — them KR moi tren muc tieu da cong bo, o khoi diem mo", async () => {
		chiTiet = mucTieu("cong-bo", true);
		await mo();
		const them = document.body.querySelector('[data-nut="them-kr"]');
		if (!them) throw new Error("khong co nut them KR");
		await bam(them);
		await cho(() => hop() !== null, "hop thoai KR");
		const o = hop()?.querySelector("[data-o-khoi-diem]");
		expect({
			disabled: o instanceof HTMLInputElement && o.disabled,
			moTa: o?.getAttribute("aria-describedby") ?? null,
		}).toEqual({ disabled: false, moTa: null });
	});
});

describe("sheet-kr-o-viec-theo-pha", () => {
	test("KR chua co viec, nguoi sua duoc KR: lap ke hoach va dang chay hien «Thêm»; cham diem va da dong hien «—»; o nao cung mo khung KR", async () => {
		const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");
		const them = okrCanhKrMessages("vi").bangKr.them;
		const ket: Record<string, string> = {};
		for (const pha of [
			"lap-ke-hoach",
			"dang-chay",
			"cham-diem",
			"da-dong",
		] as const) {
			phaQuy = pha;
			chiTiet = mucTieu("cong-bo", false);
			const san = await mo();
			const oViec = () =>
				san.o.ownerDocument.querySelector(
					'[data-cot-viec="kr-1"] [data-mo-khung-kr="kr-1"]',
				);
			await cho(() => oViec() !== null, `o viec ${pha}`);
			const o = oViec();
			ket[pha] = o?.textContent?.trim() ?? "khong co o";
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
		}
		expect(ket).toEqual({
			"lap-ke-hoach": them,
			"dang-chay": them,
			"cham-diem": "—",
			"da-dong": "—",
		});
	});
});

describe("sheet-vet-ba-dong", () => {
	test("sheet-vet-ba-dong: ba dong vet, moi nhat truoc, doc duoc truoc sau", async () => {
		chiTiet = {
			...mucTieu("cong-bo", true),
			trail: [
				vet("v1", "tao", null, {
					title: "Tăng khách hàng doanh nghiệp",
					kind: "cam-ket",
					level: "phong-ban",
					status: "nhap",
				}),
				vet(
					"v2",
					"sua",
					{ ownerUserId: "lan", title: "Tăng khách" },
					{ ownerUserId: "hung", title: "Tăng khách hàng doanh nghiệp" },
				),
				vet("v3", "cong-bo", { status: "nhap" }, { status: "cong-bo" }),
			],
		};
		await mo("?record=objective:mt-1&tab=vet");
		await cho(
			() =>
				document.body.querySelectorAll("[data-vet-hang]").length === 3 &&
				document.body.textContent?.includes(LAN.name) === true,
			"ba dong vet co ten nguoi",
		);
		const dong = [...document.body.querySelectorAll("[data-vet-hang]")];
		expect({
			thuTu: dong.map((d) => d.getAttribute("data-hanh-dong")),
			viec: dong.map((d) => d.querySelectorAll("td")[2]?.textContent),
			ai: dong.map((d) => d.querySelectorAll("td")[1]?.textContent),
			congBo: dong[0]?.querySelector('[data-khoa="status"]')?.textContent,
			sua: [...(dong[1]?.querySelectorAll("[data-khoa]") ?? [])].map(
				(o) => o.textContent,
			),
			tao: dong[2]?.querySelector('[data-khoa="level"]')?.textContent,
			lotMay: dong.some((d) =>
				/undefined|null|\d{4}-\d{2}-\d{2}T/.test(d.textContent ?? ""),
			),
		}).toEqual({
			thuTu: ["cong-bo", "sua", "tao"],
			viec: [m.hanhDong["cong-bo"], m.hanhDong.sua, m.hanhDong.tao],
			ai: [HUNG.name, HUNG.name, HUNG.name],
			congBo: "Trạng thái: Nháp → Đã công bố",
			sua: [
				"Tên: Tăng khách → Tăng khách hàng doanh nghiệp",
				`Phụ trách: ${LAN.name} → ${HUNG.name}`,
			],
			tao: "Cấp: Phòng ban",
			lotMay: false,
		});
	});
});

describe("sheet-kr-hop-le", () => {
	test("sheet-kr-hop-le: tang toi voi dich <= khoi diem tat nut gui, sua dich bang dau phay thi bat va gui dung so", async () => {
		await mo();
		const them = document.body.querySelector('[data-nut="them-kr"]');
		if (!them) throw new Error("khong co nut them KR");
		await bam(them);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		const nutGui = () =>
			h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		await go(h.querySelector(`[id$="-ten"]`), "Khách doanh nghiệp mới");
		await go(h.querySelector("[data-o-khoi-diem]"), "10");
		await go(h.querySelector("[data-o-dich]"), "5");
		await go(h.querySelector(`[id$="-don-vi"]`), "khách");
		const hong = {
			tat: nutGui()?.disabled,
			loi: h.querySelector("[data-loi-kieu]")?.textContent,
		};
		await go(h.querySelector("[data-o-dich]"), "15,5");
		const lanh = {
			tat: nutGui()?.disabled,
			loi: h.querySelector("[data-loi-kieu]"),
		};
		const btn = nutGui();
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi tao KR");
		expect({ hong, lanh, goi: daGoi }).toEqual({
			hong: {
				tat: true,
				loi: m.hopThoai.soTheoKieu["dich-phai-lon-hon-khoi-diem"],
			},
			lanh: { tat: false, loi: null },
			goi: [
				{
					duong: "okr.createKeyResult",
					dauVao: {
						objectiveId: "mt-1",
						title: "Khách doanh nghiệp mới",
						kind: "tang-toi",
						ownerUserId: HUNG.id,
						startValue: 10,
						targetValue: 15.5,
						currentValue: 10,
						unit: "khách",
						dueOn: null,
						weight: 1,
					},
				},
			],
		});
	});
});

describe("sheet-kr-so-viet", () => {
	test("sheet-kr-so-viet: go 1.500 vao khoi diem thi gui 1500, cung luat voi bang nhap", async () => {
		await mo();
		const them = document.body.querySelector('[data-nut="them-kr"]');
		if (!them) throw new Error("khong co nut them KR");
		await bam(them);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		await go(h.querySelector(`[id$="-ten"]`), "Doanh thu hợp đồng mới");
		await go(h.querySelector("[data-o-khoi-diem]"), "1.500");
		await go(h.querySelector("[data-o-dich]"), "2.000,5");
		await go(h.querySelector(`[id$="-don-vi"]`), "triệu");
		const btn = h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi tao KR");
		const dauVao = daGoi[0]?.dauVao as {
			startValue: number;
			targetValue: number;
			currentValue: number;
		};
		expect({
			startValue: dauVao.startValue,
			targetValue: dauVao.targetValue,
			currentValue: dauVao.currentValue,
		}).toEqual({ startValue: 1500, targetValue: 2000.5, currentValue: 1500 });
	});
});

async function moMenu(nhan: string, muc: string): Promise<void> {
	const trigger = document.body.querySelector(`[aria-label="${nhan}"]`);
	if (!trigger) throw new Error(`khong co menu ${nhan}`);
	await bam(trigger);
	await cho(
		() => document.body.querySelector('[role="menuitem"]') !== null,
		`menu ${nhan} mo`,
	);
	const chon = [...document.body.querySelectorAll('[role="menuitem"]')].find(
		(o) => o.textContent === muc,
	);
	if (!chon) throw new Error(`khong co muc ${muc}`);
	await bam(chon);
}

describe("hop-thoai-sua-va-cuon", () => {
	test("hop-thoai-sua-va-cuon: sua KR — Luu tat toi khi doi mot o, chan hop nam ngoai khung cuon, chi gui truong da doi", async () => {
		chiTiet = mucTieu("cong-bo", true);
		cuaSoRa = TRONG_RA;
		await mo();
		await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		const cuon = h.querySelector("[data-cuon-hop]");
		const gui = () => h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		const huy = nut(m.hopThoai.huy, h);
		const truoc = {
			tat: gui()?.disabled,
			formTrongKhung: cuon?.querySelector("form") !== null,
			guiNgoaiKhung: cuon?.contains(gui()) === false,
			huyNgoaiKhung: cuon?.contains(huy) === false,
		};
		await go(h.querySelector("[data-o-dich]"), "60");
		const sau = gui()?.disabled;
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi sua KR");
		expect({ truoc, sau, goi: daGoi }).toEqual({
			truoc: {
				tat: true,
				formTrongKhung: true,
				guiNgoaiKhung: true,
				huyNgoaiKhung: true,
			},
			sau: false,
			goi: [
				{
					duong: "okr.updateKeyResult",
					dauVao: { id: "kr-1", targetValue: 60 },
				},
			],
		});
	});

	test("hop-thoai-sua-va-cuon: sua muc tieu — Luu tat toi khi doi ten, chan hop ngoai khung cuon", async () => {
		await mo();
		await moMenu(m.sheet.menu, m.sheet.sua);
		await cho(
			() => document.body.querySelector("[data-hop-thoai-muc-tieu]") !== null,
			"hop thoai muc tieu",
		);
		const h = document.body.querySelector("[data-hop-thoai-muc-tieu]");
		if (!h) throw new Error("khong co hop");
		const cuon = h.querySelector("[data-cuon-hop]");
		const gui = () =>
			h.querySelector<HTMLButtonElement>('[data-nut="gui-muc-tieu"]');
		const truoc = {
			tat: gui()?.disabled,
			guiNgoaiKhung: cuon?.contains(gui()) === false,
			huyNgoaiKhung: cuon?.contains(nut(m.hopThoai.huy, h)) === false,
		};
		await go(
			h.querySelector('[id$="-ten"]'),
			"Tăng khách hàng doanh nghiệp lớn",
		);
		const sau = gui()?.disabled;
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi sua muc tieu");
		expect({ truoc, sau, goi: daGoi }).toEqual({
			truoc: { tat: true, guiNgoaiKhung: true, huyNgoaiKhung: true },
			sau: false,
			goi: [
				{
					duong: "okr.updateObjective",
					dauVao: { id: "mt-1", title: "Tăng khách hàng doanh nghiệp lớn" },
				},
			],
		});
	});
});

async function goVung(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLTextAreaElement)) throw new Error("khong phai o chu");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function dangChay(
	thay: Partial<KrOutput>,
	mt: Partial<ObjectiveOutput> = {},
): ObjectiveOutput {
	const goc = mucTieu("cong-bo", true);
	return {
		...goc,
		keyResults: [{ ...kr("kr-1", true), hienTaiQuaCapNhat: true, ...thay }],
		...mt,
	};
}

const mucMenu = () =>
	[...document.body.querySelectorAll('[role="menuitem"]')].map(
		(o) => o.textContent,
	);

async function moMenuKr(): Promise<string[]> {
	const trigger = document.body.querySelector(
		'[aria-label="Thao tác với KR kr-1"]',
	);
	if (!trigger) return [];
	await bam(trigger);
	await cho(
		() => document.body.querySelector('[role="menuitem"]') !== null,
		"menu KR mo",
	);
	return mucMenu().flatMap((c) => (c ? [c] : []));
}

describe("sheet-theo-doi", () => {
	test("sheet-theo-doi: nguoi khong sua duoc van thay nut Theo doi, bam goi follow bat", async () => {
		chiTiet = { ...mucTieu("cong-bo", true), canEdit: false, canEditKr: [] };
		await mo();
		const nutTheoDoi = document.body.querySelector('[data-nut="theo-doi"]');
		if (!nutTheoDoi) throw new Error("khong co nut theo doi");
		const truoc = {
			chu: nutTheoDoi.textContent,
			bam: nutTheoDoi.getAttribute("aria-pressed"),
			menuMucTieu: document.body.querySelectorAll(
				`[aria-label="${m.sheet.menu}"]`,
			).length,
		};
		await bam(nutTheoDoi);
		await cho(() => daLamMoi.length > 0, "lam moi sau theo doi");
		expect({ truoc, goi: daGoi, lamMoi: daLamMoi }).toEqual({
			truoc: { chu: m.sheet.theoDoi, bam: "false", menuMucTieu: 0 },
			goi: [{ duong: "okr.follow", dauVao: { objectiveId: "mt-1", on: true } }],
			lamMoi: ["mt-1"],
		});
	});

	test("sheet-theo-doi: dang theo doi thi nut bam san, bam lan nua goi bo", async () => {
		chiTiet = { ...mucTieu("cong-bo", true), following: true };
		await mo();
		const nutTheoDoi = document.body.querySelector('[data-nut="theo-doi"]');
		if (!nutTheoDoi) throw new Error("khong co nut theo doi");
		const truoc = {
			chu: nutTheoDoi.textContent,
			bam: nutTheoDoi.getAttribute("aria-pressed"),
		};
		await bam(nutTheoDoi);
		await cho(() => daGoi.length > 0, "goi bo theo doi");
		expect({ truoc, goi: daGoi }).toEqual({
			truoc: { chu: m.sheet.dangTheoDoi, bam: "true" },
			goi: [
				{ duong: "okr.follow", dauVao: { objectiveId: "mt-1", on: false } },
			],
		});
	});
});

describe("sheet-cap-nhat-mot-kr", () => {
	test("sheet-cap-nhat-mot-kr: truong mo menu KR co Cap nhat, hop ghi ho, gui dung phien sheet", async () => {
		chiTiet = dangChay(
			{ laCuaToi: false },
			{
				trail: [
					{
						...vet("v1", "cap-nhat-tuan", { currentValue: 10 }, null),
						keyResultId: "kr-1",
						after: { currentValue: 20, confidence: "vua", onBehalf: false },
					},
				],
			},
		);
		await mo();
		const muc = await moMenuKr();
		const capNhat = [
			...document.body.querySelectorAll('[role="menuitem"]'),
		].find((o) => o.textContent === m.sheet.capNhatKr);
		if (!capNhat) throw new Error(`khong co muc Cap nhat: ${muc.join(" | ")}`);
		await bam(capNhat);
		const hopCapNhat = () =>
			document.body.querySelector("[data-hop-cap-nhat-kr]");
		const guiNut = () =>
			hopCapNhat()?.querySelector<HTMLButtonElement>(
				'[data-nut="gui-cap-nhat-kr"]',
			);
		await cho(() => hopCapNhat() !== null, "hop cap nhat mot KR");
		const h = hopCapNhat();
		if (!h) throw new Error("khong co hop");
		const ghiHo = h.querySelector("[data-ghi-ho]");
		const truoc = {
			muc,
			ghiHo: ghiHo?.querySelector('[data-slot="alert-title"]')?.textContent,
			tenKhongDich:
				ghiHo?.querySelector('[translate="no"]')?.textContent ?? null,
			lanTruoc: h.textContent?.includes(
				`${m.capNhat.lanTruoc["lan-truoc"]}: vừa`,
			),
			tatKhiChuaChon: guiNut()?.disabled,
		};
		await go(h.querySelector('[id="kr-1-gia-tri"]'), "25");
		await bam(nut(m.capNhat.mucTuTin.cao, h));
		await cho(() => guiNut()?.disabled === false, "nut gui bat");
		const btn = guiNut();
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daLamMoi.length > 0, "lam moi sau gui");
		expect({ truoc, goi: daGoi, lamMoi: daLamMoi }).toEqual({
			truoc: {
				muc: [m.sheet.capNhatKr, m.sheet.suaKr, m.sheet.xoaKr],
				ghiHo: `${m.hopCapNhat.ghiHo} ${HUNG.name}`,
				tenKhongDich: HUNG.name,
				lanTruoc: true,
				tatKhiChuaChon: true,
			},
			goi: [
				{ duong: "okr.moCapNhat", dauVao: { entry: "sheet" } },
				{
					duong: "okr.guiCapNhat",
					dauVao: {
						sessionId: "phien-1",
						items: [
							{ keyResultId: "kr-1", value: 25, confidence: "cao", note: "" },
						],
					},
				},
			],
			lamMoi: ["mt-1"],
		});
	});

	test("sheet-cap-nhat-mot-kr: doi chung — nguoi phu trach khong thay dong ghi ho; nguoi khac va KR nhap khong co muc Cap nhat", async () => {
		chiTiet = dangChay({ laCuaToi: true }, { canEdit: false });
		await mo();
		const chu = await moMenuKr();
		const capNhat = [
			...document.body.querySelectorAll('[role="menuitem"]'),
		].find((o) => o.textContent === m.sheet.capNhatKr);
		if (!capNhat) throw new Error("khong co muc Cap nhat cho chu KR");
		await bam(capNhat);
		await cho(
			() => document.body.querySelector("[data-hop-cap-nhat-kr]") !== null,
			"hop cap nhat",
		);
		const ghiHoCuaChu = document.body.querySelectorAll("[data-ghi-ho]").length;
		for (const san of dangMo) await act(async () => san.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		chiTiet = dangChay({ laCuaToi: false }, { canEdit: false, canEditKr: [] });
		await mo();
		const nguoiKhac = await moMenuKr();
		for (const san of dangMo) await act(async () => san.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		chiTiet = { ...mucTieu("nhap", false), canEdit: true };
		await mo();
		const nhap = await moMenuKr();
		expect({ chu, ghiHoCuaChu, nguoiKhac, nhap }).toEqual({
			chu: [m.sheet.capNhatKr, m.sheet.suaKr],
			ghiHoCuaChu: 0,
			nguoiKhac: [],
			nhap: [m.sheet.suaKr, m.sheet.xoaKr],
		});
	});
});

describe("ly-do-doi-dich", () => {
	test("ly-do-doi-dich: ngoai ra — doi dich hien o ly do, Luu tat toi du ly do, gui lyDoDoiDich", async () => {
		chiTiet = mucTieu("cong-bo", true);
		await mo();
		await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		const gui = () => h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		const coOTruoc = h.querySelector("[data-o-ly-do-dich]") !== null;
		await go(h.querySelector("[data-o-dich]"), "60");
		const coOSau = h.querySelector("[data-o-ly-do-dich]") !== null;
		const tatKhiTrong = gui()?.disabled;
		await goVung(h.querySelector("[data-o-ly-do-dich] textarea"), "ngắn quá");
		const tatKhiNgan = gui()?.disabled;
		await goVung(
			h.querySelector("[data-o-ly-do-dich] textarea"),
			"Khách đổi kế hoạch",
		);
		const tatKhiDu = gui()?.disabled;
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi sua KR");
		expect({
			coOTruoc,
			coOSau,
			tatKhiTrong,
			tatKhiNgan,
			tatKhiDu,
			goi: daGoi,
		}).toEqual({
			coOTruoc: false,
			coOSau: true,
			tatKhiTrong: true,
			tatKhiNgan: true,
			tatKhiDu: false,
			goi: [
				{
					duong: "okr.updateKeyResult",
					dauVao: {
						id: "kr-1",
						targetValue: 60,
						lyDoDoiDich: "Khách đổi kế hoạch",
					},
				},
			],
		});
	});

	test("ly-do-doi-dich: trong ra — doi dich khong hien o ly do", async () => {
		chiTiet = mucTieu("cong-bo", true);
		cuaSoRa = TRONG_RA;
		await mo();
		await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		await go(h.querySelector("[data-o-dich]"), "60");
		expect(h.querySelector("[data-o-ly-do-dich]")).toBeNull();
	});
});

describe("sheet-hien-tai-chi-doc", () => {
	test("sheet-hien-tai-chi-doc: KR dang chay — o Hien tai readonly khong disabled, co lien ket Cap nhat tuan, khong gui currentValue", async () => {
		chiTiet = dangChay({ laCuaToi: false });
		cuaSoRa = TRONG_RA;
		await mo();
		await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		const o = h.querySelector("[data-o-hien-tai]");
		if (!(o instanceof HTMLInputElement))
			throw new Error("khong co o hien tai");
		const moTaId = o.getAttribute("aria-describedby") ?? "";
		const moTa = moTaId ? document.getElementById(moTaId) : null;
		const khoa = {
			readOnly: o.readOnly,
			disabled: o.disabled,
			lienKet: moTa?.querySelector("a")?.getAttribute("href"),
			chuLienKet: moTa?.querySelector("a")?.textContent,
		};
		await go(o, "30");
		await go(h.querySelector("[data-o-dich]"), "60");
		const btn = h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi sua KR");
		expect({ khoa, goi: daGoi }).toEqual({
			khoa: {
				readOnly: true,
				disabled: false,
				lienKet: "/ws/okr/cap-nhat-tuan",
				chuLienKet: m.hopThoai.capNhatTuan,
			},
			goi: [
				{
					duong: "okr.updateKeyResult",
					dauVao: { id: "kr-1", targetValue: 60 },
				},
			],
		});
	});

	test("sheet-hien-tai-chi-doc: doi chung — co khoa tu may chu tat thi o Hien tai sua duoc va gui currentValue", async () => {
		chiTiet = mucTieu("cong-bo", true);
		await mo();
		await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
		await cho(() => hop() !== null, "hop thoai KR");
		const h = hop();
		if (!h) throw new Error("khong co hop");
		const o = h.querySelector("[data-o-hien-tai]");
		if (!(o instanceof HTMLInputElement))
			throw new Error("khong co o hien tai");
		const mo2 = {
			readOnly: o.readOnly,
			moTa: o.getAttribute("aria-describedby"),
		};
		await go(o, "30");
		const btn = h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(() => daGoi.length > 0, "goi sua KR");
		expect({ mo: mo2, goi: daGoi }).toEqual({
			mo: { readOnly: false, moTa: null },
			goi: [
				{
					duong: "okr.updateKeyResult",
					dauVao: { id: "kr-1", currentValue: 30 },
				},
			],
		});
	});
});

describe("sheet-trao-doi", () => {
	const HAI_BINH_LUAN: CommentsOutput["comments"] = [
		{
			id: "bl-1",
			author: LAN,
			keyResultId: "kr-1",
			keyResultTitle: "KR kr-1",
			body: "Tuần này chậm vì thiếu người",
			createdAt: "2026-10-05T02:00:00.000Z",
			mentions: [],
		},
		{
			id: "bl-2",
			author: HUNG,
			keyResultId: null,
			keyResultTitle: null,
			body: "Nhờ chị xem lại",
			createdAt: "2026-10-06T02:00:00.000Z",
			mentions: [LAN],
		},
	];

	test("sheet-trao-doi: binh luan cu truoc moi, chip KR, ten duoc nhac to dam, gui thi goi addComment roi don khung", async () => {
		binhLuan = HAI_BINH_LUAN;
		await mo("?record=objective:mt-1&tab=trao-doi");
		await cho(
			() => document.body.querySelectorAll("[data-binh-luan]").length === 2,
			"hai binh luan",
		);
		const dong = [...document.body.querySelectorAll("[data-binh-luan]")];
		const truoc = {
			thuTu: dong.map((d) => d.getAttribute("data-binh-luan")),
			chip: dong[0]?.querySelector("[data-chip-kr]")?.textContent,
			chipKhongDich: dong[0]
				?.querySelector("[data-chip-kr]")
				?.getAttribute("translate"),
			noiDungKhongDich: dong.map((d) =>
				d.querySelector("[data-noi-dung]")?.getAttribute("translate"),
			),
			nhac: dong[1]?.querySelector("[data-nhac-ten] .font-medium")?.textContent,
			tab: [
				...document.body.querySelectorAll("[data-okr-sheet] [role=tab]"),
			].map((t) => t.textContent),
		};
		const vung = document.body.querySelector("[data-khung-soan] textarea");
		await goVung(vung, "Tuần này cần thêm người");
		const guiNut = document.body.querySelector('[data-nut="gui-binh-luan"]');
		if (!guiNut) throw new Error("khong co nut gui");
		await bam(guiNut);
		await cho(() => daLamMoi.length > 0, "lam moi sau gui");
		await cho(
			() =>
				(
					document.body.querySelector(
						"[data-khung-soan] textarea",
					) as HTMLTextAreaElement | null
				)?.value === "",
			"khung soan don",
		);
		expect({ truoc, goi: daGoi, lamMoi: daLamMoi }).toEqual({
			truoc: {
				thuTu: ["bl-1", "bl-2"],
				chip: "KR kr-1",
				chipKhongDich: "no",
				noiDungKhongDich: ["no", "no"],
				nhac: LAN.name,
				tab: ["KR1", "Căn chỉnh", "Vết", "Trao đổi2", "Diễn biến"],
			},
			goi: [
				{
					duong: "okr.addComment",
					dauVao: {
						objectiveId: "mt-1",
						body: "Tuần này cần thêm người",
						mentionUserIds: [],
					},
				},
			],
			lamMoi: ["mt-1"],
		});
	});

	test("sheet-trao-doi: rong thi co cau Chua co trao doi; gui loi thi bao duoi khung, chu con nguyen", async () => {
		loiGhi = {
			duong: "okr.addComment",
			loi: "Bình luận không được để trống.",
		};
		await mo("?record=objective:mt-1&tab=trao-doi");
		await cho(
			() =>
				document.body.querySelector('[data-trang-thai="ST-traodoi-rong"]') !==
				null,
			"trao doi rong",
		);
		const vung = document.body.querySelector("[data-khung-soan] textarea");
		await goVung(vung, "Câu hỏi còn giữ");
		const guiNut = document.body.querySelector('[data-nut="gui-binh-luan"]');
		if (!guiNut) throw new Error("khong co nut gui");
		await bam(guiNut);
		await cho(
			() => document.body.querySelector("[data-loi-gui]") !== null,
			"loi gui",
		);
		expect({
			rong: document.body.textContent?.includes(m.traoDoi.rong.title),
			loi: document.body.querySelector("[data-loi-gui]")?.textContent,
			chu: (
				document.body.querySelector(
					"[data-khung-soan] textarea",
				) as HTMLTextAreaElement | null
			)?.value,
			trangThai: document.body
				.querySelector("[data-khung-soan]")
				?.getAttribute("data-trang-thai"),
		}).toEqual({
			rong: true,
			loi: m.traoDoi.chuaGui.replace("{loi}", m.traoDoi.mayChu),
			chu: "Câu hỏi còn giữ",
			trangThai: "ST-traodoi-loigui",
		});
	});
});

const luaChonNguon = () =>
	[...(hop()?.querySelectorAll("[data-lua-chon-nguon]") ?? [])].map((o) => ({
		nguon: o.getAttribute("data-lua-chon-nguon"),
		tat: o instanceof HTMLButtonElement && o.disabled,
	}));

async function moHopKr(cach: "them" | "sua"): Promise<Element> {
	await mo();
	if (cach === "them") {
		const them = document.body.querySelector('[data-nut="them-kr"]');
		if (!them) throw new Error("khong co nut them KR");
		await bam(them);
	} else await moMenu("Thao tác với KR kr-1", m.sheet.suaKr);
	await cho(
		() =>
			hop()?.querySelector("[data-sheets-tat]") !== null ||
			hop()?.querySelector('[data-lua-chon-nguon="bang-tinh"]') !== null,
		"o nguon so tai xong",
	);
	const h = hop();
	if (!h) throw new Error("khong co hop");
	return h;
}

const NGUON_CRM = {
	loai: "crm",
	chiSo: "thoa-thuan-chot-duoc",
	phamVi: { kieu: "phong-ban", id: "pb-1" },
	bac: null,
	sheetId: null,
	sheetO: null,
	docLuc: null,
	docGiaTri: null,
	docLoi: null,
} satisfies KrOutput["nguonMay"];

describe("nguon-so-sheets-tat", () => {
	test("nguon-so-sheets-tat: vang khoa Sheets thi khong co lua chon Sheets va co mot dong noi quan tri chua cam", async () => {
		const h = await moHopKr("them");
		expect({
			macDinh: h
				.querySelector("[data-nguon-so]")
				?.getAttribute("data-nguon-so"),
			luaChon: luaChonNguon().map((l) => l.nguon),
			dong: h.querySelector("[data-sheets-tat]")?.textContent,
		}).toEqual({
			macDinh: "tay",
			luaChon: ["tay", "crm", "api"],
			dong: so.sheets.tat,
		});
	});

	test("nguon-so-sheets-tat: doi chung — cam khoa thi co Sheets, khong co dong tat, chon Sheets hien dia chi chia se", async () => {
		sheets = {
			sheetsBat: true,
			emailSheets: "okr-doc@du-an.iam.gserviceaccount.com",
		};
		const h = await moHopKr("them");
		const truoc = {
			luaChon: luaChonNguon().map((l) => l.nguon),
			dongTat: h.querySelector("[data-sheets-tat]"),
		};
		const chon = h.querySelector('[data-lua-chon-nguon="bang-tinh"]');
		if (!chon) throw new Error("khong co lua chon Sheets");
		await bam(chon);
		expect({
			...truoc,
			nguon: h.querySelector("[data-nguon-so]")?.getAttribute("data-nguon-so"),
			email: h
				.querySelector("[data-email-sheets]")
				?.getAttribute("data-email-sheets"),
		}).toEqual({
			luaChon: ["tay", "crm", "api", "bang-tinh"],
			dongTat: null,
			nguon: "bang-tinh",
			email: "okr-doc@du-an.iam.gserviceaccount.com",
		});
	});
});

describe("nguon-so-khoa-cong-bo", () => {
	test("nguon-so-khoa-cong-bo: KR crm cua muc tieu da cong bo — nguon khoa, o chi so khoa, co chu thich, khong co them do canh", async () => {
		const goc = mucTieu("cong-bo", true);
		chiTiet = {
			...goc,
			keyResults: [{ ...kr("kr-1", true), source: "crm", nguonMay: NGUON_CRM }],
		};
		const h = await moHopKr("sua");
		const chiSo = h.querySelector("[data-o-chi-so]");
		expect({
			nguon: h.querySelector("[data-nguon-so]")?.getAttribute("data-nguon-so"),
			luaChon: luaChonNguon(),
			chuThich: h.querySelector("[data-nguon-khoa]")?.textContent,
			chiSoTat: chiSo instanceof HTMLButtonElement && chiSo.disabled,
			themDoCanh: h.querySelector('[data-nut="them-do-canh"]'),
		}).toEqual({
			nguon: "crm",
			luaChon: [
				{ nguon: "tay", tat: true },
				{ nguon: "crm", tat: true },
				{ nguon: "api", tat: true },
			],
			chuThich: so.khoa.chuThich,
			chiSoTat: true,
			themDoCanh: null,
		});
	});

	test("nguon-so-khoa-cong-bo: KR tay cua muc tieu da cong bo — nguon khoa, bam Them so do canh thi mo lua chon may", async () => {
		chiTiet = mucTieu("cong-bo", true);
		const h = await moHopKr("sua");
		const truoc = {
			tatCa: luaChonNguon().every((l) => l.tat),
			chuThich: h.querySelector("[data-nguon-khoa]")?.textContent,
		};
		const them = h.querySelector('[data-nut="them-do-canh"]');
		if (!them) throw new Error("khong co nut them so do canh");
		expect(them.textContent).toBe(so.khoa.themDoCanh);
		await bam(them);
		expect({
			...truoc,
			sau: h.querySelector("[data-nguon-so]")?.getAttribute("data-nguon-so"),
			moLai: luaChonNguon().every((l) => !l.tat),
			conNut: h.querySelector('[data-nut="them-do-canh"]'),
		}).toEqual({
			tatCa: true,
			chuThich: so.khoa.chuThich,
			sau: "crm",
			moLai: true,
			conNut: null,
		});
	});
});

describe("nguon-so-kieu-khong-lay-crm", () => {
	test("nguon-so-kieu-khong-lay-crm: KR moc va phan tram — Chi so CRM tat, co mot dong giai thich", async () => {
		const ket: { kieu: string; crmTat: boolean; dong: string | null }[] = [];
		for (const kieu of ["moc", "phan-tram"] as const) {
			chiTiet = {
				...mucTieu("nhap", false),
				keyResults: [{ ...kr("kr-1", false), kind: kieu }],
			};
			const h = await moHopKr("sua");
			const crm = h.querySelector('[data-lua-chon-nguon="crm"]');
			ket.push({
				kieu,
				crmTat: crm instanceof HTMLButtonElement && crm.disabled,
				dong: h.querySelector("[data-crm-khong-hop-kieu]")?.textContent ?? null,
			});
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
		}
		expect(ket).toEqual([
			{ kieu: "moc", crmTat: true, dong: so.crmKhongHopKieu },
			{ kieu: "phan-tram", crmTat: true, dong: so.crmKhongHopKieu },
		]);
	});

	test("nguon-so-kieu-khong-lay-crm: doi chung — KR tang toi thi Chi so CRM bat, khong co dong giai thich", async () => {
		const h = await moHopKr("sua");
		const crm = h.querySelector('[data-lua-chon-nguon="crm"]');
		expect({
			crmTat: crm instanceof HTMLButtonElement && crm.disabled,
			dong: h.querySelector("[data-crm-khong-hop-kieu]"),
		}).toEqual({ crmTat: false, dong: null });
	});
});

describe("nguon-so-gio-doc-thu", () => {
	test("nguon-so-gio-doc-thu: tieng Anh dung chung bo dinh dang so va gio cua khu OKR", async () => {
		const { NguonSo } = await import("@/app/(app)/[slug]/okr/o-nguon-so");
		const { chuSo } = await import("@/app/(app)/[slug]/okr/nguon-so");
		const { dateFormat } = await import("@crm/ui/lib/format");
		const luc = "2026-10-05T08:05:00.000Z";
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		dangMo.push({ o, root });
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		await act(async () => {
			root.render(
				<QueryClientProvider client={client}>
					<LocaleProvider locale="en">
						<TooltipProvider>
							<NguonSo
								kr={null}
								kieu="tang-toi"
								objective={{
									cycleId: QUY.id,
									status: "nhap",
									level: "phong-ban",
									unitId: "pb-1",
								}}
								khoa={false}
								gia={{
									loai: "bang-tinh",
									chiSo: "thoa-thuan-chot-duoc",
									kieuPhamVi: "phong-ban",
									idPhamVi: "pb-1",
									bac: "tai-khoan",
									url: "https://docs.google.com/spreadsheets/d/1AbC",
									o: "Tổng!B2",
								}}
								datGia={() => {}}
								phamVi={{ boPhan: [], phongBan: [], nguoi: [], dangTai: false }}
								docThu={{ loai: "doc-duoc", giaTri: 1240.5, luc }}
								docLai={null}
								dangDocLai={false}
							/>
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>,
			);
		});
		const gio = dateFormat("en", { hour: "2-digit", minute: "2-digit" }).format(
			new Date(luc),
		);
		expect(
			document.body.querySelector('[data-doc-thu="doc-duoc"]')?.textContent,
		).toBe(
			okrSoMessages("en").trangThai.hopThoai.sheets.docDuoc(
				chuSo(1240.5, "en"),
				gio,
			),
		);
	});
});

describe("nguon-so-luu-crm", () => {
	test("nguon-so-luu-crm: them KR nguon CRM — pham vi mac dinh la don vi cua muc tieu, luu tao KR roi dat nguon", async () => {
		const h = await moHopKr("them");
		await go(h.querySelector(`[id$="-ten"]`), "Thoả thuận chốt quý");
		await go(h.querySelector("[data-o-dich]"), "40");
		await go(h.querySelector(`[id$="-don-vi"]`), "thoả thuận");
		const crm = h.querySelector('[data-lua-chon-nguon="crm"]');
		if (!crm) throw new Error("khong co lua chon CRM");
		await bam(crm);
		await cho(
			() =>
				h.querySelector("[data-xem-truoc]")?.getAttribute("data-xem-truoc") ===
				"co",
			"xem truoc co so",
		);
		const btn = h.querySelector<HTMLButtonElement>('[data-nut="gui-kr"]');
		if (!btn) throw new Error("khong co nut gui");
		await bam(btn);
		await cho(
			() => daGoi.some((g) => g.duong === "okr.datNguonKr"),
			"goi dat nguon",
		);
		expect({
			phamVi: h
				.querySelector("[data-o-kieu-pham-vi]")
				?.getAttribute("data-o-kieu-pham-vi"),
			thuTu: daGoi.map((g) => g.duong),
			nguon: daGoi.find((g) => g.duong === "okr.datNguonKr")?.dauVao,
		}).toEqual({
			phamVi: "phong-ban",
			thuTu: ["okr.createKeyResult", "okr.datNguonKr"],
			nguon: {
				keyResultId: "ok",
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: "pb-1" },
			},
		});
	});
});

describe("nguon-so-api-origin", () => {
	test("nguon-so-api-origin: lenh mau lay dia chi goc API tu provider, co ma KR cua KR dang sua", async () => {
		origin = "https://api.thu.test";
		const h = await moHopKr("sua");
		const api = h.querySelector('[data-lua-chon-nguon="api"]');
		if (!api) throw new Error("khong co lua chon API");
		await bam(api);
		const lenh = h.querySelector("[data-lenh-mau]");
		expect({
			maKr: h.querySelector("[data-ma-kr]")?.getAttribute("data-ma-kr"),
			lenh:
				lenh instanceof HTMLInputElement &&
				lenh.value.includes(
					"https://api.thu.test/rest/okr/key-results/kr-1/value",
				),
		}).toEqual({ maKr: "kr-1", lenh: true });
	});

	test("nguon-so-api-origin: doi chung — khong co provider thi khong dung lenh mau voi dia chi doan", async () => {
		const h = await moHopKr("sua");
		const api = h.querySelector('[data-lua-chon-nguon="api"]');
		if (!api) throw new Error("khong co lua chon API");
		await bam(api);
		expect({
			maKr: h.querySelector("[data-ma-kr]")?.getAttribute("data-ma-kr"),
			lenh: h.querySelector("[data-lenh-mau]"),
		}).toEqual({ maKr: "kr-1", lenh: null });
	});
});

describe("nguon-so-doc-lai", () => {
	test("nguon-so-doc-lai: doc thu hong hien nguyen nhan, Doc lai gui lai datNguonKr cung cau hinh", async () => {
		sheets = {
			sheetsBat: true,
			emailSheets: "okr-doc@du-an.iam.gserviceaccount.com",
		};
		chiTiet = {
			...mucTieu("nhap", false),
			keyResults: [
				{
					...kr("kr-1", false),
					source: "bang-tinh",
					nguonMay: {
						...NGUON_CRM,
						loai: "bang-tinh",
						chiSo: null,
						phamVi: null,
						sheetId: "1AbC",
						sheetO: "Tổng!B2",
						docLuc: "2026-10-05T02:12:00.000Z",
						docLoi: "chua-chia-se",
					},
				},
			],
		};
		const h = await moHopKr("sua");
		const loi = h.querySelector('[data-doc-thu="loi"]');
		const docLai = h.querySelector('[data-nut="doc-lai"]');
		if (!docLai) throw new Error("khong co nut doc lai");
		await bam(docLai);
		await cho(
			() => daGoi.some((g) => g.duong === "okr.datNguonKr"),
			"goi dat nguon",
		);
		expect({
			lyDo: loi?.getAttribute("data-ly-do"),
			chu: loi?.textContent,
			goi: daGoi.map((g) => g.dauVao),
		}).toEqual({
			lyDo: "chua-chia-se",
			chu: so.sheets.lyDo["chua-chia-se"],
			goi: [
				{
					keyResultId: "kr-1",
					loai: "bang-tinh",
					url: "https://docs.google.com/spreadsheets/d/1AbC",
					o: "Tổng!B2",
				},
			],
		});
	});
});

describe("hop-thoai-kr-escape-tra-lop", () => {
	test("hop-thoai-kr-escape-tra-lop: mo Sua KR tu menu, mo dong select va combobox ben trong, Escape — trang bam duoc, dong sheet thi body het pointer-events none", async () => {
		chiTiet = mucTieu("nhap", false);
		await mo(undefined, true);
		const sheet = () =>
			document.body.querySelector<HTMLElement>('[data-slot="sheet-content"]');
		const lop = () => ({
			body: document.body.style.pointerEvents,
			sheet: sheet()?.style.pointerEvents ?? null,
		});
		const chiSheet = lop();
		const moMenu = async () => {
			const menu = document.body.querySelector(
				'[aria-label="Thao tác với KR kr-1"]',
			);
			if (!menu) throw new Error("khong co menu KR");
			await bam(menu);
			await cho(
				() => document.body.querySelector('[role="menuitem"]') !== null,
				"menu KR mo",
			);
		};
		const bamEscape = async () => {
			await act(async () => {
				(document.activeElement ?? document.body).dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "Escape",
						bubbles: true,
						cancelable: true,
					}),
				);
			});
		};
		await moMenu();
		const sua = [...document.body.querySelectorAll('[role="menuitem"]')].find(
			(o) => o.textContent === m.sheet.suaKr,
		);
		if (!sua) throw new Error("khong co muc Sua");
		await bam(sua);
		await cho(() => hop() !== null, "hop thoai KR");

		const kieu = hop()?.querySelector("[data-o-kieu]");
		if (!kieu) throw new Error("khong co o kieu");
		await bam(kieu);
		await cho(
			() => document.body.querySelector('[role="option"]') !== null,
			"select kieu mo",
		);
		await bamEscape();
		await cho(
			() => document.body.querySelector('[role="option"]') === null,
			"select kieu dong",
		);

		const chu = hop()?.querySelector('[data-slot="combobox-trigger"]');
		if (!chu) throw new Error("khong co combobox");
		await bam(chu);
		await cho(
			() =>
				document.body.querySelector('[data-slot="popover-content"]') !== null,
			"combobox mo",
		);
		await bamEscape();
		await cho(
			() =>
				document.body.querySelector('[data-slot="popover-content"]') === null,
			"combobox dong",
		);
		const conHop = hop() !== null;

		await bamEscape();
		await cho(() => hop() === null, "hop thoai KR dong bang Escape");
		const sauEscape = lop();
		await moMenu();
		const moLai = document.body.querySelectorAll('[role="menuitem"]').length;
		await bamEscape();
		await cho(
			() => document.body.querySelector('[role="menuitem"]') === null,
			"menu KR dong",
		);
		await bamEscape();
		await cho(() => sheet() === null, "sheet dong");

		expect({
			chiSheet,
			conHop,
			sauEscape,
			moLai: moLai > 0,
			sauDongSheet: document.body.style.pointerEvents,
		}).toEqual({
			chiSheet: { body: "none", sheet: "auto" },
			conHop: true,
			sauEscape: { body: "none", sheet: "auto" },
			moLai: true,
			sauDongSheet: "",
		});
	});
});
