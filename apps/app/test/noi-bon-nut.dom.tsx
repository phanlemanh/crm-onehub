import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { z } from "zod";
import type { DanhMucInput } from "@/app/(app)/[slug]/onboarding/onboarding-search-params";
import {
	enrollmentUpsertInput,
	planCreateFromTemplateInput,
	planListInput,
	templateCreateInput,
} from "../../api/src/onboarding/onboarding.contracts";
import {
	dungHang,
	type HangDanhMuc,
	type KeHoachTho,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";
import { orgDepartmentCreateInput } from "../../api/src/to-chuc/to-chuc.contracts";

type BoPhan = {
	id: string;
	name: string;
	position: number;
	archivedAt: null;
	purgeable: boolean;
};
type Khuon = {
	id: string;
	name: string;
	partnerType: string | null;
	steps: {
		label: string;
		departmentId: string;
		position: number;
		offsetDays: number;
	}[];
	archivedAt: null;
	purgeable: boolean;
};
type GhiDanh = {
	id: string;
	planId: string;
	contactId: string;
	contactName: string;
	accountAt: null;
	courseAt: null;
	activeAt: null;
	dealAt: null;
	source: string;
};
type CheDo = "thanh-cong" | "loi" | "treo";

const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test" };
const NGUOI = [TOI, { id: "u-2", name: "Minh", email: "minh@thu.test" }];
const CONG_TY = [
	{ id: "ct-1", name: "Alpha Sàn", domain: null, iconUrl: null },
];
const CA_NHAN = [
	{ id: "cn-1", firstName: "Hoa", lastName: "Tran", email: "hoa@thu.test" },
	{ id: "cn-2", firstName: "Binh", lastName: null, email: null },
];
const KE_HOACH = "kh-1";
const LOI_MAY_CHU = "may chu tu choi luot luu nay";

let boPhan: BoPhan[] = [];
let khuon: Khuon[] = [];
let tap: HangDanhMuc[] = [];
let ghiDanh: GhiDanh[] = [];
let cheDo: CheDo = "thanh-cong";
let daGoi: { ten: string; dauVao: unknown }[] = [];

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function keHoachTho(i: number, ten: string): KeHoachTho {
	return {
		id: `kh-${i}`,
		companyId: `ct-${i}`,
		company: { name: ten },
		startedAt: new Date("2026-09-01T00:00:00.000Z"),
		targetDays: 30,
		ownerId: TOI.id,
		closedAt: null,
		steps: [
			{
				completedAt: null,
				label: "Ky hop dong",
				position: 0,
				updatedAt: new Date("2026-09-10T00:00:00.000Z"),
				assigneeId: null,
				assignee: null,
				department: { id: "bp-a", name: "Kinh doanh", position: 0 },
			},
		],
	};
}

function ghi<TVao>(ten: string, apDung: (dauVao: TVao) => void) {
	return async (dauVao: TVao) => {
		daGoi.push({ ten, dauVao });
		if (cheDo === "loi") throw new Error(LOI_MAY_CHU);
		if (cheDo === "treo") return new Promise(() => {});
		apDung(dauVao);
		return { id: `${ten}-moi` };
	};
}

function thuTuc<TVao, TRa>(
	ten: string,
	doc: (dauVao: TVao) => TRa,
	viet?: (dauVao: TVao) => Promise<unknown>,
) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		queryOptions: (dauVao: TVao | typeof skipToken) =>
			dauVao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: {
						queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
						queryFn: async () => doc(dauVao),
					},
		mutationOptions: () => ({
			mutationKey: [ten],
			mutationFn: viet ?? (async () => undefined),
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

function orgMock() {
	const khong = (ten: string) => thuTuc(ten, khongDoc);
	return {
		tree: thuTuc("tree", () => ({
			divisions: [
				{
					id: "khoi",
					name: "Khối",
					position: 0,
					head: null,
					departments: boPhan.map((d) => ({
						id: d.id,
						name: d.name,
						position: d.position,
						divisionId: "khoi",
						head: null,
						stepCount: 0,
						people: [],
					})),
				},
			],
			chuaXep: [],
			chuaCoPhongBan: [],
			people: [],
			archived: { divisions: [], departments: [] },
			coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
		})),
		access: thuTuc("orgAccess", () => ({ canManage: true })),
		createDepartment: thuTuc(
			"createDepartment",
			khongDoc,
			ghi<z.input<typeof orgDepartmentCreateInput>>("createDepartment", (v) => {
				const d = orgDepartmentCreateInput.parse(quaJson(v));
				boPhan = [
					...boPhan,
					{
						id: `bp-${boPhan.length}`,
						name: d.name,
						position: boPhan.length,
						archivedAt: null,
						purgeable: false,
					},
				];
			}),
		),
		createDivision: khong("createDivision"),
		renameDivision: khong("renameDivision"),
		reorderDivisions: khong("reorderDivisions"),
		archiveDivision: khong("archiveDivision"),
		restoreDivision: khong("restoreDivision"),
		purgeDivision: khong("purgeDivision"),
		renameDepartment: khong("renameDepartment"),
		moveDepartment: khong("moveDepartment"),
		luuTruXemTruoc: khong("luuTruXemTruoc"),
		archiveDepartment: khong("archiveDepartment"),
		restoreDepartment: khong("restoreDepartment"),
		purgeDepartment: khong("purgeDepartment"),
		setHead: khong("setHead"),
		setPlacement: khong("setPlacement"),
		previewImport: khong("previewImport"),
		applyImport: khong("applyImport"),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: orgMock(),
		onboarding: {
			access: thuTuc("access", () => ({ canManage: true })),
			nguoiNhanViec: thuTuc("nguoiNhanViec", () => NGUOI),
			listDepartments: thuTuc(
				"listDepartments",
				(v?: { archived?: boolean }) => (v?.archived === true ? [] : boPhan),
			),
			listTemplates: thuTuc("listTemplates", (v?: { archived?: boolean }) =>
				v?.archived === true ? [] : khuon,
			),
			updateTemplate: thuTuc("updateTemplate", khongDoc),
			archiveTemplate: thuTuc("archiveTemplate", khongDoc),
			restoreTemplate: thuTuc("restoreTemplate", khongDoc),
			purgeTemplate: thuTuc("purgeTemplate", khongDoc),
			planById: thuTuc("planById", () => ({
				id: KE_HOACH,
				companyId: "ct-1",
				companyName: "Alpha Sàn",
				templateId: null,
				startedAt: "2026-09-01T00:00:00.000Z",
				targetDays: 30,
				closedAt: null,
				ownerId: TOI.id,
			})),
			closePlan: thuTuc("closePlan", khongDoc),
			reopenPlan: thuTuc("reopenPlan", khongDoc),
			markEnrollmentStage: thuTuc("markEnrollmentStage", khongDoc),
			createTemplate: thuTuc(
				"createTemplate",
				khongDoc,
				ghi<z.input<typeof templateCreateInput>>("createTemplate", (v) => {
					const d = templateCreateInput.parse(quaJson(v));
					khuon = [
						...khuon,
						{
							id: `kh-${khuon.length}`,
							...d,
							archivedAt: null,
							purgeable: false,
						},
					];
				}),
			),
			createFromTemplate: thuTuc(
				"createFromTemplate",
				khongDoc,
				ghi<z.input<typeof planCreateFromTemplateInput>>(
					"createFromTemplate",
					(v) => {
						const d = planCreateFromTemplateInput.parse(quaJson(v));
						const ct = CONG_TY.find((c) => c.id === d.companyId);
						tap = [
							...tap,
							dungHang(
								keHoachTho(tap.length + 1, ct?.name ?? d.companyId),
								new Date(),
							),
						];
					},
				),
			),
			upsertEnrollment: thuTuc(
				"upsertEnrollment",
				khongDoc,
				ghi<z.input<typeof enrollmentUpsertInput>>("upsertEnrollment", (v) => {
					const d = enrollmentUpsertInput.parse(quaJson(v));
					ghiDanh = [
						...ghiDanh,
						{
							id: `gd-${ghiDanh.length}`,
							planId: d.planId,
							contactId: d.contactId,
							contactName: d.contactId,
							accountAt: null,
							courseAt: null,
							activeAt: null,
							dealAt: null,
							source: d.source,
						},
					];
				}),
			),
			manDanhMuc: thuTuc("manDanhMuc", (v: DanhMucInput) =>
				manDanhMucTuHang(tap, planListInput.parse(v), khuon.length),
			),
			bangCot: thuTuc("bangCot", () => ({
				cachChia: "buoc",
				tranThe: 30,
				cot: [],
			})),
			plansOfCompany: thuTuc("plansOfCompany", () => []),
			listSteps: thuTuc("listSteps", () => ({ rows: [], total: 0 })),
			listEnrollments: thuTuc("listEnrollments", () => ghiDanh),
			removeEnrollment: thuTuc("removeEnrollment", khongDoc),
		},
		users: {
			list: thuTuc("users.list", () => NGUOI),
			me: thuTuc("users.me", () => TOI),
		},
		companies: {
			options: thuTuc("companies.options", () => CONG_TY),
			byId: thuTuc("companies.byId", khongDoc),
		},
		contacts: {
			list: thuTuc("contacts.list", () => ({
				rows: CA_NHAN,
				total: CA_NHAN.length,
				facetCounts: {},
			})),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) =>
		h(
			"a",
			{ ...rest, href, onClick: (e: ReactMouseEvent) => e.preventDefault() },
			children,
		),
}));

const { CaiDatDieuPhoi } = await import(
	"@/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi"
);
const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { DanhMucHanhDong } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { HoSoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { ToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/to-chuc"
);
const { toChucMessages } = await import("@/lib/messages/to-chuc");

const m = onboardingMessages("vi");
const tc = toChucMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={duong} hasMemory>
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
	await cho(() => !o.textContent?.includes(m.loading));
	return san;
}

async function cho(xong: () => boolean, moTa = ""): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
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

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function oNhap(nhan: string): HTMLInputElement {
	const theoAria = document.body.querySelector<HTMLInputElement>(
		`input[aria-label="${nhan}"]`,
	);
	if (theoAria) return theoAria;
	const label = [...document.body.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const id = label?.getAttribute("for");
	const o = id ? document.getElementById(id) : null;
	if (!(o instanceof HTMLInputElement))
		throw new Error(`khong thay o nhap "${nhan}"`);
	return o;
}

async function chonSelect(
	nhanTrigger: string,
	chuLuaChon: string,
): Promise<void> {
	const trigger = document.body.querySelector(`[aria-label="${nhanTrigger}"]`);
	if (!trigger) throw new Error(`khong thay o chon "${nhanTrigger}"`);
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		`mo o chon ${nhanTrigger}`,
	);
	const lua = [...document.body.querySelectorAll('[role="option"]')].find((o) =>
		o.textContent?.includes(chuLuaChon),
	);
	if (!lua) throw new Error(`o chon "${nhanTrigger}" khong co "${chuLuaChon}"`);
	await act(async () => {
		lua.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length === 0,
		"dong o chon",
	);
}

async function chonCombobox(chuLuaChon: string): Promise<void> {
	const trigger = [
		...document.body.querySelectorAll('[role="dialog"] [role="combobox"]'),
	].find((b) => b.tagName === "BUTTON");
	if (!trigger) throw new Error("khong thay combobox trong hop thoai");
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length > 0,
		"mo combobox",
	);
	const lua = [...document.body.querySelectorAll("[cmdk-item]")].find((o) =>
		o.textContent?.includes(chuLuaChon),
	);
	if (!lua) throw new Error(`combobox khong co "${chuLuaChon}"`);
	await bam(lua);
}

function hopThoai(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function nutLuu(): HTMLButtonElement {
	const hop = hopThoai();
	if (!hop) throw new Error("hop thoai chua mo");
	return nut(m.tao.save, hop);
}

function soGoi(ten: string): number {
	return daGoi.filter((g) => g.ten === ten).length;
}

function dauVaoCuoi(ten: string): unknown {
	return [...daGoi].reverse().find((g) => g.ten === ten)?.dauVao;
}

function ngayLichUtc(d: Date): string {
	return d.toISOString().slice(0, 10);
}

beforeEach(() => {
	boPhan = [];
	khuon = [];
	tap = [];
	ghiDanh = [];
	cheDo = "thanh-cong";
	daGoi = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function moHopThoaiBoPhan(): Promise<void> {
	await mo(<ToChuc />, "?don=bp:khoi");
	await cho(
		() => document.body.querySelector('[data-chi-tiet="bo-phan"]') !== null,
		"khung bo phan Khoi",
	);
	const nutMoi = [...document.body.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === tc.chiTiet.phongBanMoi,
	);
	if (!nutMoi) throw new Error("khong thay nut Phong ban moi cua Khoi");
	await bam(nutMoi);
	await cho(() => hopThoai() !== null, "mo hop thoai bo phan");
}

describe("them-bo-phan", () => {
	test("them-bo-phan: luu gui dung mot loi goi qua schema that, danh sach hien ten moi", async () => {
		await moHopThoaiBoPhan();
		await go(oNhap(tc.donVi.tenPhongBan), "Kinh doanh");
		await bam(nutLuu());
		await cho(() => hopThoai() === null, "dong hop thoai");

		expect(`so loi goi: ${soGoi("createDepartment")}`).toBe("so loi goi: 1");
		expect(
			orgDepartmentCreateInput.parse(quaJson(dauVaoCuoi("createDepartment"))),
		).toEqual({
			name: "Kinh doanh",
			divisionId: "khoi",
		});
		await cho(
			() => document.body.textContent?.includes("Kinh doanh") === true,
			"ten moi tren man",
		);
	});

	test("them-bo-phan: doi chung — ten rong thi nut Luu tat, khong loi goi", async () => {
		await moHopThoaiBoPhan();
		expect(nutLuu().disabled).toBe(true);
		await bam(nutLuu());
		expect(soGoi("createDepartment")).toBe(0);
	});
});

describe("soan-khuon", () => {
	const CA = [
		{ ten: "co loai doi tac", loai: "San moi gioi", mongDoi: "San moi gioi" },
		{ ten: "bo trong loai doi tac", loai: "", mongDoi: null },
	] as const;

	test("soan-khuon: hai ca, dau vao dung thu tu buoc va loai doi tac", async () => {
		let soCa = 0;
		for (const ca of CA) {
			boPhan = [
				{
					id: "bp-a",
					name: "Kinh doanh",
					position: 0,
					archivedAt: null,
					purgeable: false,
				},
				{
					id: "bp-b",
					name: "Dao tao",
					position: 1,
					archivedAt: null,
					purgeable: false,
				},
			];
			khuon = [];
			daGoi = [];
			await mo(<CaiDatDieuPhoi />);
			await bam(nut(m.settings.newTemplate));
			await cho(() => hopThoai() !== null, "mo soan khuon");

			await go(oNhap(m.tao.khuon.name), `Khuon ${ca.ten}`);
			if (ca.loai !== "") await go(oNhap(m.tao.khuon.partnerType), ca.loai);
			await go(oNhap(`${m.tao.khuon.stepLabel} 1`), "Ky hop dong");
			await chonSelect(`${m.tao.khuon.stepDepartment} 1`, "Kinh doanh");
			await bam(nut(m.tao.khuon.addStep));
			await go(oNhap(`${m.tao.khuon.stepLabel} 2`), "Dao tao doi");
			await chonSelect(`${m.tao.khuon.stepDepartment} 2`, "Dao tao");
			await go(oNhap(`${m.tao.khuon.stepDay} 2`), "7");
			await bam(nut(m.tao.khuon.addStep));
			await go(oNhap(`${m.tao.khuon.stepLabel} 3`), "Se bo");
			const nutBo = [...document.body.querySelectorAll("button")].filter(
				(b) => b.textContent?.trim() === m.tao.khuon.removeStep,
			);
			const bo = nutBo[nutBo.length - 1];
			if (!bo) throw new Error("khong thay nut bo buoc");
			await bam(bo);

			await bam(nutLuu());
			await cho(() => hopThoai() === null, "dong soan khuon");

			const dauVao = templateCreateInput.parse(
				quaJson(dauVaoCuoi("createTemplate")),
			);
			expect(`${ca.ten}: partnerType=${dauVao.partnerType}`).toBe(
				`${ca.ten}: partnerType=${ca.mongDoi}`,
			);
			expect(
				dauVao.steps.map(
					(s) => `${s.position}:${s.label}:${s.departmentId}:${s.offsetDays}`,
				),
			).toEqual(["0:Ky hop dong:bp-a:0", "1:Dao tao doi:bp-b:7"]);
			await cho(
				() => document.body.textContent?.includes(`Khuon ${ca.ten}`) === true,
				"ten khuon moi tren man",
			);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
			soCa += 1;
		}
		expect(soCa).toBe(2);
	});
});

describe("chua-co-bo-phan", () => {
	test("chua-co-bo-phan: khong bo phan thi noi them bo phan truoc, khong luu duoc", async () => {
		await mo(<CaiDatDieuPhoi />);
		await bam(nut(m.settings.newTemplate));
		await cho(() => hopThoai() !== null, "mo soan khuon");

		expect(hopThoai()?.textContent).toContain(m.tao.khuon.noDepartment);
		expect(`nut Luu tat=${nutLuu().disabled}`).toBe("nut Luu tat=true");
		await bam(nutLuu());
		expect(`so loi goi: ${soGoi("createTemplate")}`).toBe("so loi goi: 0");
	});

	test("chua-co-bo-phan: doi chung — co mot bo phan thi co o ten khuon", async () => {
		boPhan = [
			{
				id: "bp-a",
				name: "Kinh doanh",
				position: 0,
				archivedAt: null,
				purgeable: false,
			},
		];
		await mo(<CaiDatDieuPhoi />);
		await bam(nut(m.settings.newTemplate));
		await cho(() => hopThoai() !== null, "mo soan khuon");
		expect(oNhap(m.tao.khuon.name)).toBeTruthy();
		expect(hopThoai()?.textContent).not.toContain(m.tao.khuon.noDepartment);
	});
});

async function moTaoKeHoach(
	nhanNut: string,
	duong = "",
	dauTrang = false,
): Promise<void> {
	await mo(
		dauTrang ? (
			<>
				<div data-slot="page-shell-actions">
					<DanhMucHanhDong />
				</div>
				<DanhMucTable />
			</>
		) : (
			<DanhMucTable />
		),
		duong,
	);
	await cho(
		() => document.body.textContent?.includes(nhanNut) === true,
		"nut tao ke hoach",
	);
	await bam(nut(nhanNut));
	await cho(() => hopThoai() !== null, "mo tao ke hoach");
}

async function chonNgay(ngay: string): Promise<void> {
	const nhan = [...document.body.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === m.tao.keHoach.startedAt,
	);
	const maNut = nhan?.getAttribute("for");
	const trigger = maNut ? document.getElementById(maNut) : null;
	if (!trigger) throw new Error("khong thay nut chon ngay");
	let o: Element | null = null;
	for (let lan = 0; lan < 5 && o === null; lan += 1) {
		await bam(trigger);
		for (let nhip = 0; nhip < 20 && o === null; nhip += 1) {
			await nghi(1);
			o = document.body.querySelector(`button[data-day="${ngay}"]`);
		}
	}
	if (!o) throw new Error(`lich khong mo ra o ngay ${ngay}`);
	await bam(o);
	await cho(
		() => trigger.textContent?.includes(String(Number(ngay.slice(8)))) === true,
		`nut ngay hien ${ngay}`,
	);
}

function ngayGiuaThangNay(): string {
	const bayGio = new Date();
	return `${bayGio.getFullYear()}-${String(bayGio.getMonth() + 1).padStart(2, "0")}-15`;
}

describe("tao-ke-hoach", () => {
	test("tao-ke-hoach: luu gui dung cong ty, khuon, nguoi dang dung va ngay lich da chon", async () => {
		khuon = [
			{
				id: "kh-a",
				name: "San moi gioi",
				partnerType: null,
				steps: [],
				archivedAt: null,
				purgeable: false,
			},
		];
		await moTaoKeHoach(m.empty.noPlan.action);

		await chonCombobox("Alpha Sàn");
		await chonSelect(m.tao.keHoach.template, "San moi gioi");
		const ngay = ngayGiuaThangNay();
		await chonNgay(ngay);
		await cho(() => !nutLuu().disabled, "nut Luu bat");
		await bam(nutLuu());
		await cho(() => hopThoai() === null, "dong tao ke hoach");

		const dauVao = planCreateFromTemplateInput.parse(
			quaJson(dauVaoCuoi("createFromTemplate")),
		);
		expect(`${dauVao.companyId}|${dauVao.templateId}|${dauVao.ownerId}`).toBe(
			`ct-1|kh-a|${TOI.id}`,
		);
		expect(`ngay lich ${ngayLichUtc(dauVao.startedAt)}`).toBe(
			`ngay lich ${ngay}`,
		);
		await cho(
			() => document.body.textContent?.includes("Alpha Sàn") === true,
			"ke hoach moi tren danh muc",
		);
	});
});

describe("nut-tren-thanh-cong-cu", () => {
	test("nut-tren-thanh-cong-cu: hai cach xem deu co nut ke hoach moi o dau trang mo hop thoai", async () => {
		khuon = [
			{
				id: "kh-a",
				name: "San moi gioi",
				partnerType: null,
				steps: [],
				archivedAt: null,
				purgeable: false,
			},
		];
		let soCa = 0;
		for (const cachXem of ["bang", "bang-cot"] as const) {
			tap = [dungHang(keHoachTho(1, "Beta Hub"), new Date())];
			await moTaoKeHoach(m.tao.keHoach.toolbar, `cachXem=${cachXem}`, true);
			const dau = document.body.querySelector(
				'[data-slot="page-shell-actions"]',
			);
			expect(
				`${cachXem}: dau trang=${dau?.textContent?.includes(m.tao.keHoach.toolbar)} hop thoai=${hopThoai()?.textContent?.includes(m.tao.keHoach.title)}`,
			).toBe(`${cachXem}: dau trang=true hop thoai=true`);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
			soCa += 1;
		}
		expect(soCa).toBe(2);
	});
});

function soNguoiPheu(): string {
	return document.body.textContent?.match(/Mẫu số (\d+)/)?.[1] ?? "khong co";
}

describe("them-moi-gioi", () => {
	test("them-moi-gioi: pheu trong va pheu da co nguoi, luu ghi dung ca nhan nguon tay", async () => {
		const CA = [
			{ ten: "pheu trong", truoc: [] as GhiDanh[] },
			{
				ten: "pheu da co nguoi",
				truoc: [
					{
						id: "gd-x",
						planId: KE_HOACH,
						contactId: "cn-2",
						contactName: "Binh",
						accountAt: null,
						courseAt: null,
						activeAt: null,
						dealAt: null,
						source: "tay",
					},
				],
			},
		];
		let soCa = 0;
		for (const ca of CA) {
			ghiDanh = [...ca.truoc];
			daGoi = [];
			await mo(<HoSoKeHoach planId={KE_HOACH} />);
			await cho(
				() => document.body.textContent?.includes(m.hoSo.funnel) === true,
				"ho so",
			);
			const truoc = ghiDanh.length;
			await bam(nut(m.hoSo.emptyFunnelAction));
			await cho(() => hopThoai() !== null, `${ca.ten}: mo them moi gioi`);
			await chonCombobox("Hoa Tran");
			await bam(nutLuu());
			await cho(() => hopThoai() === null, "dong them moi gioi");

			const dauVao = enrollmentUpsertInput.parse(
				quaJson(dauVaoCuoi("upsertEnrollment")),
			);
			expect(
				`${ca.ten}: ${dauVao.planId}|${dauVao.contactId}|${dauVao.source}`,
			).toBe(`${ca.ten}: ${KE_HOACH}|cn-1|tay`);
			await cho(
				() => soNguoiPheu() === String(truoc + 1),
				`${ca.ten}: pheu tang`,
			);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
			soCa += 1;
		}
		expect(soCa).toBe(2);
	});
});

type HopThoaiCa = {
	ten: string;
	thuTuc: string;
	chuanBi: () => void;
	mo: () => Promise<void>;
	dien: () => Promise<void>;
	giu: () => string[];
};

const BON_HOP_THOAI: HopThoaiCa[] = [
	{
		ten: "them bo phan",
		thuTuc: "createDepartment",
		chuanBi: () => {},
		mo: moHopThoaiBoPhan,
		dien: async () => go(oNhap(tc.donVi.tenPhongBan), "Kinh doanh"),
		giu: () => [oNhap(tc.donVi.tenPhongBan).value],
	},
	{
		ten: "soan khuon",
		thuTuc: "createTemplate",
		chuanBi: () => {
			boPhan = [
				{
					id: "bp-a",
					name: "Kinh doanh",
					position: 0,
					archivedAt: null,
					purgeable: false,
				},
			];
		},
		mo: async () => {
			await mo(<CaiDatDieuPhoi />);
			await bam(nut(m.settings.newTemplate));
			await cho(() => hopThoai() !== null, "mo soan khuon");
		},
		dien: async () => {
			await go(oNhap(m.tao.khuon.name), "Khuon A");
			await go(oNhap(`${m.tao.khuon.stepLabel} 1`), "Ky hop dong");
			await chonSelect(`${m.tao.khuon.stepDepartment} 1`, "Kinh doanh");
		},
		giu: () => [
			oNhap(m.tao.khuon.name).value,
			oNhap(`${m.tao.khuon.stepLabel} 1`).value,
		],
	},
	{
		ten: "tao ke hoach",
		thuTuc: "createFromTemplate",
		chuanBi: () => {
			khuon = [
				{
					id: "kh-a",
					name: "San moi gioi",
					partnerType: null,
					steps: [],
					archivedAt: null,
					purgeable: false,
				},
			];
		},
		mo: async () => moTaoKeHoach(m.empty.noPlan.action),
		dien: async () => {
			await chonCombobox("Alpha Sàn");
			await chonSelect(m.tao.keHoach.template, "San moi gioi");
			await cho(() => !nutLuu().disabled, "nut Luu bat");
		},
		giu: () => [
			hopThoai()?.textContent?.includes("Alpha Sàn")
				? "Alpha Sàn"
				: "mat cong ty",
		],
	},
	{
		ten: "them moi gioi",
		thuTuc: "upsertEnrollment",
		chuanBi: () => {},
		mo: async () => {
			await mo(<HoSoKeHoach planId={KE_HOACH} />);
			await cho(
				() => document.body.textContent?.includes(m.hoSo.funnel) === true,
				"ho so",
			);
			await bam(nut(m.hoSo.emptyFunnelAction));
			await cho(() => hopThoai() !== null, "mo them moi gioi");
		},
		dien: async () => chonCombobox("Hoa Tran"),
		giu: () => [
			hopThoai()?.textContent?.includes("Hoa Tran")
				? "Hoa Tran"
				: "mat ca nhan",
		],
	},
];

async function donSan(): Promise<void> {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
}

describe("luu-hong", () => {
	test("luu-hong: bon hop thoai, may chu tu choi thi hop thoai o lai, giu du lieu, hien loi", async () => {
		let soCa = 0;
		for (const ca of BON_HOP_THOAI) {
			boPhan = [];
			khuon = [];
			tap = [];
			ghiDanh = [];
			daGoi = [];
			ca.chuanBi();
			await ca.mo();
			await ca.dien();
			const truoc = ca.giu();
			cheDo = "loi";
			await bam(nutLuu());
			await cho(
				() => hopThoai()?.textContent?.includes(LOI_MAY_CHU) === true,
				`${ca.ten}: hien loi`,
			);
			expect(
				`${ca.ten}: mo=${hopThoai() !== null} goi=${soGoi(ca.thuTuc)}`,
			).toBe(`${ca.ten}: mo=true goi=1`);
			expect(`${ca.ten}: ${ca.giu().join("|")}`).toBe(
				`${ca.ten}: ${truoc.join("|")}`,
			);
			cheDo = "thanh-cong";
			await donSan();
			soCa += 1;
		}
		expect(soCa).toBe(4);
	});
});

describe("luu-mot-lan", () => {
	test("luu-mot-lan: bon hop thoai, bam Luu hai lan khi dang luu chi gui mot loi goi", async () => {
		let soCa = 0;
		for (const ca of BON_HOP_THOAI) {
			boPhan = [];
			khuon = [];
			tap = [];
			ghiDanh = [];
			daGoi = [];
			ca.chuanBi();
			await ca.mo();
			await ca.dien();
			cheDo = "treo";
			const luu = nutLuu();
			await bam(luu);
			await bam(luu);
			await nghi(20);
			expect(
				`${ca.ten}: goi=${soGoi(ca.thuTuc)} tat=${nutLuu().disabled}`,
			).toBe(`${ca.ten}: goi=1 tat=true`);
			cheDo = "thanh-cong";
			await donSan();
			soCa += 1;
		}
		expect(soCa).toBe(4);
	});
});
