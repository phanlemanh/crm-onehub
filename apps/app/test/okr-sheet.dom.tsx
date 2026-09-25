import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
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
};

function kr(id: string, startLocked: boolean): KrOutput {
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
		startLocked,
		progress: 40,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
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
		id: "mt-1",
		cycleId: QUY.id,
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
		trail: [],
		canEditKr: ["kr-1"],
	};
}

let chiTiet: ObjectiveOutput;

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
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string; canhBao: string | null }) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				return { id: "ok", canhBao: null };
			},
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
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(duong = "?record=objective:mt-1"): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const man: ReactElement = (
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId="mt-1" />
		</DetailSheet>
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
			tab: ["KR1", "Căn chỉnh", "Vết"],
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
			tieuDe: hop()?.querySelector('[data-slot="dialog-title"]')?.textContent,
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
