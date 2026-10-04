import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
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
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	departmentListOutput,
	enrollmentListOutput,
	enrollmentStageInput,
	enrollmentUpsertInput,
	planCreateFromTemplateInput,
	planDetailOutput,
	stepListOutput,
	templateListOutput,
	templateUpdateInput,
} from "../../api/src/onboarding/onboarding.contracts";
import {
	orgDepartmentMoveInput,
	orgRenameInput,
} from "../../api/src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../../api/src/to-chuc/to-chuc-config";

type Buoc = {
	label: string;
	departmentId: string;
	position: number;
	offsetDays: number;
};
type BoPhanTho = {
	id: string;
	name: string;
	position: number;
	luuTru: boolean;
	dung: boolean;
};
type KhuonTho = {
	id: string;
	name: string;
	partnerType: string | null;
	steps: Buoc[];
	luuTru: boolean;
	dung: boolean;
};
type GhiDanhTho = {
	id: string;
	contactId: string;
	contactName: string;
	accountAt: string | null;
	courseAt: string | null;
	activeAt: string | null;
	dealAt: string | null;
};
type CheDo = "loi" | "treo";

const KE_HOACH = "kh-1";
const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test" };
const CONG_TY = [
	{ id: "ct-1", name: "Alpha Sàn", domain: null, iconUrl: null },
];
const CA_NHAN = [
	{ id: "cn-1", firstName: "Hoa", lastName: "Tran", email: "hoa@thu.test" },
	{ id: "cn-2", firstName: "Binh", lastName: null, email: null },
];
const LOI = "may chu tu choi thao tac nay";
const MOC = new Date("2026-09-01T00:00:00.000Z");

let boPhan: BoPhanTho[] = [];
let khuon: KhuonTho[] = [];
let ghiDanh: GhiDanhTho[] = [];
let buocKeHoach: {
	id: string;
	label: string;
	departmentId: string;
	departmentName: string;
}[] = [];
let dongLuc: string | null = null;
let quyen = true;
let cheDo = new Map<string, CheDo>();
let daGoi: { ten: string; dauVao: unknown }[] = [];
let daDoc: { ten: string; dauVao: unknown }[] = [];

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function dsBoPhan(archived: boolean) {
	return quaJson(
		departmentListOutput.parse(
			boPhan
				.filter((d) => d.luuTru === archived)
				.sort((a, b) => a.position - b.position)
				.map((d) => ({
					id: d.id,
					name: d.name,
					position: d.position,
					archivedAt: d.luuTru ? MOC : null,
					purgeable: d.luuTru && !d.dung,
				})),
		),
	);
}

function dsKhuon(archived: boolean) {
	return quaJson(
		templateListOutput.parse(
			khuon
				.filter((k) => k.luuTru === archived)
				.map((k) => ({
					id: k.id,
					name: k.name,
					partnerType: k.partnerType,
					steps: k.steps,
					archivedAt: k.luuTru ? MOC : null,
					purgeable: k.luuTru && !k.dung,
				})),
		),
	);
}

function ghi<TVao>(ten: string, apDung: (dauVao: TVao) => void) {
	return async (dauVao: TVao) => {
		daGoi.push({ ten, dauVao });
		const cd = cheDo.get(ten);
		if (cd === "loi") throw new Error(LOI);
		if (cd === "treo") return new Promise(() => {});
		apDung(dauVao);
		return { id: `${ten}-ok` };
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
						queryFn: async () => {
							daDoc.push({ ten, dauVao });
							return doc(dauVao);
						},
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

function datBoPhan(id: string, thay: Partial<BoPhanTho>) {
	boPhan = boPhan.map((d) => (d.id === id ? { ...d, ...thay } : d));
}

function datKhuon(id: string, thay: Partial<KhuonTho>) {
	khuon = khuon.map((k) => (k.id === id ? { ...k, ...thay } : k));
}

type VaoId = { id: string };

function cayTuBoPhan() {
	return {
		divisions: [
			{
				id: "khoi",
				name: "Khối",
				moTa: "",
				position: 0,
				head: null,
				okrMo: 0,
				departments: boPhan
					.filter((d) => !d.luuTru)
					.sort((a, b) => a.position - b.position)
					.map((d) => ({
						id: d.id,
						name: d.name,
						moTa: "",
						position: d.position,
						divisionId: "khoi",
						head: null,
						stepCount: 0,
						okrMo: 0,
						people: [],
					})),
			},
		],
		chuaXep: [],
		chuaCoPhongBan: [],
		people: [],
		archived: {
			divisions: [],
			departments: boPhan
				.filter((d) => d.luuTru)
				.map((d) => ({ id: d.id, name: d.name, purgeable: !d.dung })),
		},
		coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
	};
}

function orgMock() {
	const khong = (ten: string) => thuTuc(ten, khongDoc);
	return {
		tree: thuTuc("tree", () => cayTuBoPhan()),
		access: thuTuc("orgAccess", () => ({ canManage: quyen })),
		renameDepartment: thuTuc(
			"renameDepartment",
			khongDoc,
			ghi<{ id: string; name: string }>("renameDepartment", (v) =>
				datBoPhan(v.id, { name: v.name }),
			),
		),
		moveDepartment: thuTuc(
			"moveDepartment",
			khongDoc,
			ghi<{ id: string; divisionId: string | null; index: number }>(
				"moveDepartment",
				(v) => {
					const ids = boPhan
						.filter((d) => !d.luuTru && d.id !== v.id)
						.sort((a, b) => a.position - b.position)
						.map((d) => d.id);
					ids.splice(v.index, 0, v.id);
					ids.forEach((id, viTri) => {
						datBoPhan(id, { position: viTri });
					});
				},
			),
		),
		createDepartment: thuTuc(
			"createDepartment",
			khongDoc,
			ghi("createDepartment", () => {}),
		),
		luuTruXemTruoc: thuTuc("luuTruXemTruoc", () => ({ lyDo: [] })),
		archiveDepartment: thuTuc(
			"archiveDepartment",
			khongDoc,
			ghi<VaoId>("archiveDepartment", (v) => datBoPhan(v.id, { luuTru: true })),
		),
		restoreDepartment: thuTuc(
			"restoreDepartment",
			khongDoc,
			ghi<VaoId>("restoreDepartment", (v) =>
				datBoPhan(v.id, { luuTru: false }),
			),
		),
		purgeDepartment: thuTuc(
			"purgeDepartment",
			khongDoc,
			ghi<VaoId>("purgeDepartment", (v) => {
				boPhan = boPhan.filter((d) => d.id !== v.id);
			}),
		),
		createDivision: khong("createDivision"),
		renameDivision: khong("renameDivision"),
		reorderDivisions: khong("reorderDivisions"),
		archiveDivision: khong("archiveDivision"),
		restoreDivision: khong("restoreDivision"),
		purgeDivision: khong("purgeDivision"),
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
			access: thuTuc("access", () => ({ canManage: quyen })),
			listDepartments: thuTuc("listDepartments", (v?: { archived?: boolean }) =>
				dsBoPhan(v?.archived === true),
			),
			listTemplates: thuTuc("listTemplates", (v?: { archived?: boolean }) =>
				dsKhuon(v?.archived === true),
			),
			createTemplate: thuTuc(
				"createTemplate",
				khongDoc,
				ghi("createTemplate", () => {}),
			),
			updateTemplate: thuTuc(
				"updateTemplate",
				khongDoc,
				ghi<{ id: string; name?: string }>("updateTemplate", (v) => {
					const d = templateUpdateInput.parse(quaJson(v));
					datKhuon(d.id, {
						name: d.name,
						partnerType: d.partnerType ?? null,
						steps: d.steps ?? [],
					});
				}),
			),
			archiveTemplate: thuTuc(
				"archiveTemplate",
				khongDoc,
				ghi<VaoId>("archiveTemplate", (v) => datKhuon(v.id, { luuTru: true })),
			),
			restoreTemplate: thuTuc(
				"restoreTemplate",
				khongDoc,
				ghi<VaoId>("restoreTemplate", (v) => datKhuon(v.id, { luuTru: false })),
			),
			purgeTemplate: thuTuc(
				"purgeTemplate",
				khongDoc,
				ghi<VaoId>("purgeTemplate", (v) => {
					khuon = khuon.filter((k) => k.id !== v.id);
				}),
			),
			createFromTemplate: thuTuc(
				"createFromTemplate",
				khongDoc,
				ghi("createFromTemplate", () => {}),
			),
			planById: thuTuc("planById", () =>
				quaJson(
					planDetailOutput.parse({
						id: KE_HOACH,
						companyId: "ct-1",
						companyName: "Alpha Sàn",
						templateId: null,
						startedAt: MOC,
						targetDays: 30,
						closedAt: dongLuc === null ? null : new Date(dongLuc),
						ownerId: TOI.id,
						company: {
							id: "ct-1",
							name: "Alpha Sàn",
							iconUrl: null,
							iconDarkUrl: null,
							iconTone: null,
							logoUrl: null,
						},
						owner: {
							id: TOI.id,
							name: TOI.name,
							email: TOI.email,
							image: null,
						},
						templateName: null,
						ngayThu: 0,
						buocXong: 0,
						buocTong: buocKeHoach.length,
						imNgay: 0,
						tacO: null,
						dangTheoDoi: false,
						nguoiTheoDoi: [],
					}),
				),
			),
			closePlan: thuTuc(
				"closePlan",
				khongDoc,
				ghi("closePlan", () => {
					dongLuc = "2026-09-21T00:00:00.000Z";
				}),
			),
			reopenPlan: thuTuc(
				"reopenPlan",
				khongDoc,
				ghi("reopenPlan", () => {
					dongLuc = null;
				}),
			),
			listSteps: thuTuc("listSteps", () =>
				quaJson(
					stepListOutput.parse({
						rows: buocKeHoach.map((b, viTri) => ({
							...b,
							planId: KE_HOACH,
							assigneeId: null,
							assignee: null,
							dueAt: MOC,
							completedAt: null,
							position: viTri,
						})),
						total: buocKeHoach.length,
					}),
				),
			),
			listEnrollments: thuTuc("listEnrollments", () =>
				quaJson(
					enrollmentListOutput.parse(
						ghiDanh.map((g) => ({
							...g,
							planId: KE_HOACH,
							source: "tay",
							accountAt: g.accountAt === null ? null : new Date(g.accountAt),
							courseAt: g.courseAt === null ? null : new Date(g.courseAt),
							activeAt: g.activeAt === null ? null : new Date(g.activeAt),
							dealAt: g.dealAt === null ? null : new Date(g.dealAt),
						})),
					),
				),
			),
			upsertEnrollment: thuTuc(
				"upsertEnrollment",
				khongDoc,
				ghi<{ contactId: string }>("upsertEnrollment", (v) => {
					ghiDanh = [
						...ghiDanh,
						{
							id: `gd-${ghiDanh.length + 1}`,
							contactId: v.contactId,
							contactName: v.contactId,
							accountAt: null,
							courseAt: null,
							activeAt: null,
							dealAt: null,
						},
					];
				}),
			),
			removeEnrollment: thuTuc("removeEnrollment", khongDoc),
			markEnrollmentStage: thuTuc(
				"markEnrollmentStage",
				khongDoc,
				ghi<{ id: string; stage: string; at: string | null }>(
					"markEnrollmentStage",
					(v) => {
						const d = enrollmentStageInput.parse(quaJson(v));
						ghiDanh = ghiDanh.map((g) =>
							g.id === d.id
								? { ...g, [d.stage]: d.at === null ? null : d.at.toISOString() }
								: g,
						);
					},
				),
			),
			manDanhMuc: thuTuc("manDanhMuc", khongDoc),
			bangCot: thuTuc("bangCot", khongDoc),
			plansOfCompany: thuTuc("plansOfCompany", khongDoc),
		},
		users: {
			list: thuTuc("users.list", () => [TOI]),
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
}));

mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

const { CaiDatDieuPhoi } = await import(
	"@/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi"
);
const { HoSoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach"
);
const { TaoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { ToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/to-chuc"
);
const { HanhDongToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang"
);
const { toChucMessages } = await import("@/lib/messages/to-chuc");
const { toast } = await import("sonner");

const m = onboardingMessages("vi");
const tc = toChucMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

const goc = Element.prototype.getBoundingClientRect;

async function mo(man: ReactElement, don = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={don} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							{man}
							<Toaster />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(() => !o.textContent?.includes(m.loading), "tai xong");
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 500)}`,
	);
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

function coChu(chu: string): boolean {
	return document.body.textContent?.includes(chu) === true;
}

function nut(
	chu: string,
	trong: ParentNode = document.body,
): HTMLButtonElement {
	const tim = [...trong.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...trong.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

function coNut(chu: string, trong: ParentNode = document.body): boolean {
	return [...trong.querySelectorAll("button")].some(
		(b) => b.textContent?.trim() === chu,
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

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				code: key === " " ? "Space" : key,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await nghi(5);
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

function hopThoai(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function hopXacNhan(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="alertdialog"]');
}

function soGoi(ten: string): number {
	return daGoi.filter((g) => g.ten === ten).length;
}

function dauVaoCuoi(ten: string): unknown {
	return [...daGoi].reverse().find((g) => g.ten === ten)?.dauVao;
}

async function moMenu(ten: string): Promise<void> {
	const nhan = [`${m.quanLy.menu} ${ten}`, tc.menu.replace("{ten}", ten)];
	const trigger = [...document.body.querySelectorAll("button")].find((b) =>
		nhan.includes(b.querySelector(".sr-only")?.textContent ?? ""),
	);
	if (!trigger) throw new Error(`khong thay menu cua ${ten}`);
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll('[role="menuitem"]').length > 0,
		`menu ${ten}`,
	);
}

async function chonMuc(chu: string): Promise<void> {
	const muc = [...document.body.querySelectorAll('[role="menuitem"]')].find(
		(x) => x.textContent?.trim() === chu,
	);
	if (!muc) throw new Error(`menu khong co "${chu}"`);
	await bam(muc);
}

async function xacNhan(nhanNut: string): Promise<void> {
	await cho(() => hopXacNhan() !== null, "hop xac nhan");
	const hop = hopXacNhan();
	if (!hop) throw new Error("khong co hop xac nhan");
	await bam(nut(nhanNut, hop));
}

function thuTuBoPhan(): string[] {
	return [...document.body.querySelectorAll("[data-phong-ban]")].map(
		(x) => x.getAttribute("data-phong-ban") ?? "",
	);
}

function tayKeo(id: string): HTMLButtonElement {
	const dong = document.body.querySelector(
		`[data-phong-ban="${id}"]`,
	)?.parentElement;
	const tay = dong?.querySelector("button");
	if (!(tay instanceof HTMLButtonElement))
		throw new Error(`khong thay tay keo ${id}`);
	return tay;
}

async function keoLenDau(id: string, soBuoc: number): Promise<void> {
	const tay = tayKeo(id);
	tay.focus();
	await phim(tay, " ");
	await nghi(20);
	for (let i = 0; i < soBuoc; i += 1) {
		await phim(tay, "ArrowUp");
		await nghi(20);
	}
	await phim(tay, " ");
}

async function moDaLuuTru(): Promise<void> {
	const timTrigger = () =>
		[...document.body.querySelectorAll("button")].find((b) =>
			b.textContent?.startsWith(m.quanLy.daLuuTru),
		);
	await cho(() => timTrigger() !== undefined, "muc Da luu tru xuat hien");
	const trigger = timTrigger();
	if (!trigger) throw new Error("khong thay muc Da luu tru");
	if (trigger.getAttribute("aria-expanded") !== "true") await bam(trigger);
	await cho(
		() => document.body.querySelector("[data-luu-tru]") !== null,
		"mo muc da luu tru",
	);
}

function dongLuuTru(id: string): HTMLElement {
	const dong = document.body.querySelector<HTMLElement>(
		`[data-luu-tru="${id}"]`,
	);
	if (!dong) throw new Error(`khong thay dong luu tru ${id}`);
	return dong;
}

async function bamToast(chu: string): Promise<void> {
	await cho(() => coNut(chu, document.body), `nut toast ${chu}`);
	await bam(nut(chu));
}

function oBac(
	bac: "accountAt" | "courseAt" | "activeAt" | "dealAt",
	ten: string,
	coNgay: boolean,
): HTMLButtonElement {
	const mau = coNgay ? m.bac.doiNgay : m.bac.danhDau;
	const nhan = mau.replace("{bac}", m.bac[bac]).replace("{ten}", ten);
	const o = document.body.querySelector<HTMLButtonElement>(
		`button[aria-label="${nhan}"]`,
	);
	if (!o) throw new Error(`khong thay o bac ${nhan}`);
	return o;
}

async function moLich(o: HTMLButtonElement, ngay: string): Promise<Element> {
	let tim: Element | null = null;
	for (let lan = 0; lan < 5 && tim === null; lan += 1) {
		await bam(o);
		for (let nhip = 0; nhip < 20 && tim === null; nhip += 1) {
			await nghi(1);
			tim = document.body.querySelector(`button[data-day="${ngay}"]`);
		}
	}
	if (!tim) throw new Error(`lich khong mo ra ngay ${ngay}`);
	return tim;
}

function dem(bac: string): string {
	const nhan = [...document.body.querySelectorAll("span")].find(
		(s) => s.textContent?.trim() === bac,
	);
	return (
		nhan?.parentElement
			?.querySelector("span.tabular-nums")
			?.textContent?.trim() ?? ""
	);
}

function hai(): BoPhanTho[] {
	return [
		{ id: "bp-a", name: "Kinh doanh", position: 0, luuTru: false, dung: false },
		{ id: "bp-b", name: "Dao tao", position: 1, luuTru: false, dung: false },
	];
}

function khuonHaiBuoc(): KhuonTho {
	return {
		id: "k-1",
		name: "San moi gioi",
		partnerType: "Sàn",
		steps: [
			{
				label: "Ky hop dong",
				departmentId: "bp-a",
				position: 0,
				offsetDays: 0,
			},
			{ label: "Dao tao", departmentId: "bp-b", position: 1, offsetDays: 7 },
		],
		luuTru: false,
		dung: true,
	};
}

beforeEach(() => {
	boPhan = [];
	khuon = [];
	ghiDanh = [];
	buocKeHoach = [];
	dongLuc = null;
	quyen = true;
	cheDo = new Map();
	daGoi = [];
	daDoc = [];
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-phong-ban]") === null) {
			return {
				x: 0,
				y: -10000,
				top: -10000,
				left: 0,
				bottom: 10000,
				right: 1000,
				width: 1000,
				height: 20000,
				toJSON: () => ({}),
			} as DOMRect;
		}
		const cha = this.parentElement;
		const i = cha ? [...cha.children].indexOf(this) : 0;
		const doi =
			this instanceof HTMLElement
				? Number(
						/translate3d\([^,]+,\s*(-?[\d.]+)px/.exec(
							this.style.transform,
						)?.[1] ?? 0,
					)
				: 0;
		const tren = i * 40 + doi;
		return {
			x: 0,
			y: tren,
			top: tren,
			left: 0,
			bottom: tren + 32,
			right: 300,
			width: 300,
			height: 32,
			toJSON: () => ({}),
		} as DOMRect;
	};
});

async function donSan(): Promise<void> {
	await act(async () => {
		toast.dismiss();
	});
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
}

afterEach(async () => {
	await act(async () => {
		toast.dismiss();
	});
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	Element.prototype.getBoundingClientRect = goc;
	setSystemTime();
});

async function moCaiDat(): Promise<void> {
	await mo(<CaiDatDieuPhoi />);
}

async function moToChuc(don = "?don=bp:khoi"): Promise<void> {
	await mo(
		<>
			<div data-slot="page-shell-actions">
				<HanhDongToChuc />
			</div>
			<ToChuc />
		</>,
		don,
	);
	await cho(
		() => document.body.querySelector("[data-chi-tiet]") !== null,
		"khung chi tiet to chuc",
	);
}

function timNut(chu: string): HTMLButtonElement | null {
	return (
		[...document.body.querySelectorAll("button")].find((b) =>
			b.textContent?.trim().startsWith(chu),
		) ?? null
	);
}

function timMenu(nhan: string): HTMLButtonElement | null {
	return (
		[...document.body.querySelectorAll("button")].find(
			(b) => b.querySelector(".sr-only")?.textContent === nhan,
		) ?? null
	);
}

async function moHoSo(): Promise<void> {
	await mo(<HoSoKeHoach planId={KE_HOACH} />);
}

describe("doi-ten-bo-phan", () => {
	test("doi-ten-bo-phan: menu Doi ten gui updateDepartment qua schema that", async () => {
		boPhan = hai();
		await moToChuc();
		await moMenu("Kinh doanh");
		await chonMuc(tc.doiTen);
		await cho(() => hopThoai() !== null, "mo hop doi ten");
		expect(`dien san: ${oNhap(tc.donVi.tenPhongBan).value}`).toBe(
			"dien san: Kinh doanh",
		);
		await go(oNhap(tc.donVi.tenPhongBan), "Kinh doanh vung 1");
		const hop = hopThoai();
		if (!hop) throw new Error("hop thoai dong som");
		await bam(nut(m.tao.save, hop));
		await cho(() => hopThoai() === null, "dong hop doi ten");

		expect(
			`renameDepartment ${soGoi("renameDepartment")} createDepartment ${soGoi("createDepartment")}`,
		).toBe("renameDepartment 1 createDepartment 0");
		expect(
			orgRenameInput.parse(quaJson(dauVaoCuoi("renameDepartment"))),
		).toEqual({
			id: "bp-a",
			name: "Kinh doanh vung 1",
			moTa: "",
		});
		await cho(() => coChu("Kinh doanh vung 1"), "ten moi tren man");
	});

	test("doi-ten-bo-phan: doi chung — ten rong thi Luu tat, khong loi goi", async () => {
		boPhan = hai();
		await moToChuc();
		await moMenu("Kinh doanh");
		await chonMuc(tc.doiTen);
		await cho(() => hopThoai() !== null, "mo hop doi ten");
		await go(oNhap(tc.donVi.tenPhongBan), "  ");
		const hop = hopThoai();
		if (!hop) throw new Error("hop thoai dong som");
		expect(nut(m.tao.save, hop).disabled).toBe(true);
		await bam(nut(m.tao.save, hop));
		expect(soGoi("renameDepartment")).toBe(0);
	});

	test("doi-ten-bo-phan: ho so ke hoach hien departmentName, khong hien ma", async () => {
		buocKeHoach = [
			{
				id: "b-1",
				label: "Ky hop dong",
				departmentId: "bp-x9",
				departmentName: "Ten moi cua bo phan",
			},
		];
		await moHoSo();
		expect(`${coChu("Ten moi cua bo phan")} ${coChu("bp-x9")}`).toBe(
			"true false",
		);
	});
});

describe("sap-bo-phan", () => {
	const CA = [
		{ ten: "may chu chap nhan", loi: false, mong: ["bp-c", "bp-a", "bp-b"] },
		{ ten: "may chu tu choi", loi: true, mong: ["bp-a", "bp-b", "bp-c"] },
	] as const;

	test("sap-bo-phan: hai ca keo C len dau", async () => {
		let soCa = 0;
		for (const ca of CA) {
			boPhan = [
				...hai(),
				{
					id: "bp-c",
					name: "Ke toan",
					position: 2,
					luuTru: false,
					dung: false,
				},
			];
			cheDo = new Map(ca.loi ? [["moveDepartment", "loi"]] : []);
			daGoi = [];
			await moToChuc();
			await keoLenDau("bp-c", 2);
			await cho(() => soGoi("moveDepartment") === 1, `${ca.ten}: goi sap xep`);
			expect(
				orgDepartmentMoveInput.parse(quaJson(dauVaoCuoi("moveDepartment"))),
			).toEqual({
				id: "bp-c",
				divisionId: "khoi",
				index: 0,
			});
			await cho(
				() => thuTuBoPhan().join(",") === ca.mong.join(","),
				`${ca.ten}: thu tu ${ca.mong.join(",")}`,
			);
			expect(`${ca.ten}: ${thuTuBoPhan().join(",")}`).toBe(
				`${ca.ten}: ${ca.mong.join(",")}`,
			);
			if (ca.loi) {
				await cho(() => coChu(LOI), `${ca.ten}: toast loi`);
			} else {
				await donSan();
				await moCaiDat();
				await bam(nut(m.settings.newTemplate));
				await cho(() => hopThoai() !== null, "mo soan khuon");
				const trigger = document.body.querySelector(
					`[aria-label="${m.tao.khuon.stepDepartment} 1"]`,
				);
				if (!trigger) throw new Error("khong thay o chon bo phan");
				await bam(trigger);
				await cho(
					() => document.body.querySelectorAll('[role="option"]').length > 0,
					"mo o chon",
				);
				const luaChon = [
					...document.body.querySelectorAll('[role="option"]'),
				].map((o) => o.textContent?.trim());
				expect(`${ca.ten}: o chon ${luaChon.join(",")}`).toBe(
					`${ca.ten}: o chon Ke toan,Kinh doanh,Dao tao`,
				);
			}
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

describe("luu-tru-bo-phan", () => {
	test("luu-tru-bo-phan: xac nhan luu tru, hien trong Da luu tru, Hoan tac khoi phuc", async () => {
		boPhan = hai();
		await moToChuc();
		await moMenu("Dao tao");
		await chonMuc(m.quanLy.luuTru);
		await xacNhan(m.quanLy.luuTru);
		await cho(() => !thuTuBoPhan().includes("bp-b"), "roi danh sach");
		expect(
			`archiveDepartment ${soGoi("archiveDepartment")} ${JSON.stringify(dauVaoCuoi("archiveDepartment"))}`,
		).toBe('archiveDepartment 1 {"id":"bp-b"}');
		await moDaLuuTru();
		expect(dongLuuTru("bp-b").textContent?.includes("Dao tao")).toBe(true);
		await bamToast(m.quanLy.hoanTac);
		await cho(() => soGoi("restoreDepartment") === 1, "goi khoi phuc");
		expect(JSON.stringify(dauVaoCuoi("restoreDepartment"))).toBe(
			'{"id":"bp-b"}',
		);
		await cho(() => thuTuBoPhan().includes("bp-b"), "tro lai danh sach");
	});

	test("luu-tru-bo-phan: doi chung — Giu lai o hop xac nhan thi 0 loi goi", async () => {
		boPhan = hai();
		await moToChuc();
		await moMenu("Dao tao");
		await chonMuc(m.quanLy.luuTru);
		await xacNhan(m.quanLy.giu);
		await nghi(5);
		expect(soGoi("archiveDepartment")).toBe(0);
	});
});

describe("bi-chan-luu-tru", () => {
	test("bi-chan-luu-tru: may chu tu choi, bo phan o lai, thong diep hien", async () => {
		const thongDiep = TO_CHUC.thongDiep.phongBanTrongKhuon(["San moi gioi"]);
		boPhan = hai();
		await moToChuc();
		cheDo = new Map([["archiveDepartment", "loi"]]);
		await moMenu("Kinh doanh");
		await chonMuc(m.quanLy.luuTru);
		await xacNhan(m.quanLy.luuTru);
		await cho(() => coChu(LOI), "toast loi");
		expect(
			`Kinh doanh con trong danh sach: ${thuTuBoPhan().includes("bp-a")}`,
		).toBe("Kinh doanh con trong danh sach: true");
		expect(document.body.querySelector('[data-luu-tru="bp-a"]')).toBe(null);
		expect(thongDiep.includes("San moi gioi")).toBe(true);
	});
});

describe("sua-khuon", () => {
	test("sua-khuon: hop dien san, luu gui updateTemplate dung thu tu, khong tao moi", async () => {
		boPhan = hai();
		khuon = [khuonHaiBuoc()];
		await moCaiDat();
		await moMenu("San moi gioi");
		await chonMuc(m.quanLy.sua);
		await cho(() => hopThoai() !== null, "mo hop sua khuon");

		const dienSan = [
			oNhap(m.tao.khuon.name).value,
			oNhap(m.tao.khuon.partnerType).value,
			oNhap(`${m.tao.khuon.stepLabel} 1`).value,
			oNhap(`${m.tao.khuon.stepLabel} 2`).value,
			oNhap(`${m.tao.khuon.stepDay} 2`).value,
		];
		expect(`dien san: ${dienSan.join("|")}`).toBe(
			"dien san: San moi gioi|Sàn|Ky hop dong|Dao tao|7",
		);
		expect(coChu(m.quanLy.keHoachKhongDoi)).toBe(true);

		await go(oNhap(m.tao.khuon.name), "San moi gioi 2");
		await go(oNhap(m.tao.khuon.partnerType), "");
		await go(oNhap(`${m.tao.khuon.stepLabel} 2`), "Dao tao doi");
		const hop = hopThoai();
		if (!hop) throw new Error("hop dong som");
		await bam(nut(m.tao.save, hop));
		await cho(() => hopThoai() === null, "dong hop sua khuon");

		expect(
			`updateTemplate ${soGoi("updateTemplate")} createTemplate ${soGoi("createTemplate")}`,
		).toBe("updateTemplate 1 createTemplate 0");
		expect(
			templateUpdateInput.parse(quaJson(dauVaoCuoi("updateTemplate"))),
		).toEqual({
			id: "k-1",
			name: "San moi gioi 2",
			partnerType: null,
			steps: [
				{
					label: "Ky hop dong",
					departmentId: "bp-a",
					position: 0,
					offsetDays: 0,
				},
				{
					label: "Dao tao doi",
					departmentId: "bp-b",
					position: 1,
					offsetDays: 7,
				},
			],
		});
	});
});

describe("luu-tru-khuon", () => {
	test("luu-tru-khuon: xac nhan luu tru, Da luu tru, Hoan tac", async () => {
		boPhan = hai();
		khuon = [khuonHaiBuoc()];
		await moCaiDat();
		await moMenu("San moi gioi");
		await chonMuc(m.quanLy.luuTru);
		await xacNhan(m.quanLy.luuTru);
		await cho(
			() => document.body.querySelector('[data-khuon="k-1"]') === null,
			"roi danh sach khuon",
		);
		expect(`archiveTemplate ${soGoi("archiveTemplate")}`).toBe(
			"archiveTemplate 1",
		);
		await moDaLuuTru();
		expect(dongLuuTru("k-1").textContent?.includes("San moi gioi")).toBe(true);
		await bamToast(m.quanLy.hoanTac);
		await cho(() => soGoi("restoreTemplate") === 1, "goi khoi phuc khuon");
		await cho(
			() => document.body.querySelector('[data-khuon="k-1"]') !== null,
			"khuon tro lai",
		);
	});

	test("luu-tru-khuon: hop tao ke hoach chi doc khuon dang dung", async () => {
		boPhan = hai();
		khuon = [
			khuonHaiBuoc(),
			{ ...khuonHaiBuoc(), id: "k-2", name: "Khuon cu", luuTru: true },
		];
		await mo(<TaoKeHoach nhanNut="Tao ke hoach" />);
		await bam(nut("Tao ke hoach"));
		await cho(() => daDoc.some((d) => d.ten === "listTemplates"), "doc khuon");
		const dauVao = daDoc
			.filter((d) => d.ten === "listTemplates")
			.map((d) => JSON.stringify(d.dauVao ?? null));
		expect(
			`dau vao listTemplates: ${dauVao.every((v) => v === "null" || v === '{"archived":false}')} ${dauVao.join(",")}`,
		).toBe(`dau vao listTemplates: true ${dauVao.join(",")}`);
		const trigger = document.body.querySelector(
			`[aria-label="${m.tao.keHoach.template}"]`,
		);
		if (!trigger) throw new Error("khong thay o chon khuon");
		await bam(trigger);
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"mo o chon khuon",
		);
		const luaChon = [...document.body.querySelectorAll('[role="option"]')].map(
			(o) => o.textContent?.trim(),
		);
		expect(`o chon khuon: ${luaChon.join(",")}`).toBe(
			"o chon khuon: San moi gioi",
		);
	});
});

describe("khoi-phuc", () => {
	const CA = [
		{ ten: "khoi phuc bo phan", id: "bp-b", thuTuc: "restoreDepartment" },
		{ ten: "khoi phuc khuon", id: "k-2", thuTuc: "restoreTemplate" },
	] as const;

	test("khoi-phuc: hai ca, Khoi phuc goi dung thu tuc va roi Da luu tru", async () => {
		let soCa = 0;
		for (const ca of CA) {
			boPhan = [
				hai()[0] as BoPhanTho,
				{ ...(hai()[1] as BoPhanTho), luuTru: true },
			];
			khuon = [
				{
					...khuonHaiBuoc(),
					id: "k-2",
					name: "Khuon cu",
					luuTru: true,
					dung: false,
				},
			];
			daGoi = [];
			if (ca.thuTuc === "restoreDepartment") await moToChuc();
			else await moCaiDat();
			await moDaLuuTru();
			await bam(nut(m.quanLy.khoiPhuc, dongLuuTru(ca.id)));
			await cho(() => soGoi(ca.thuTuc) === 1, `${ca.ten}: goi`);
			expect(
				`${ca.ten}: ${JSON.stringify(dauVaoCuoi(ca.thuTuc))} restoreDepartment ${soGoi("restoreDepartment")} restoreTemplate ${soGoi("restoreTemplate")}`,
			).toBe(
				`${ca.ten}: {"id":"${ca.id}"} restoreDepartment ${ca.thuTuc === "restoreDepartment" ? 1 : 0} restoreTemplate ${ca.thuTuc === "restoreTemplate" ? 1 : 0}`,
			);
			await cho(
				() => document.body.querySelector(`[data-luu-tru="${ca.id}"]`) === null,
				`${ca.ten}: roi Da luu tru`,
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

	test("khoi-phuc: may chu tu choi khoi phuc khuon, khuon o lai Da luu tru", async () => {
		boPhan = hai();
		khuon = [
			{
				...khuonHaiBuoc(),
				id: "k-2",
				name: "Khuon cu",
				luuTru: true,
				dung: false,
			},
		];
		cheDo = new Map([["restoreTemplate", "loi"]]);
		await moCaiDat();
		await moDaLuuTru();
		await bam(nut(m.quanLy.khoiPhuc, dongLuuTru("k-2")));
		await cho(() => coChu(LOI), "toast loi");
		expect(document.body.querySelector('[data-luu-tru="k-2"]') !== null).toBe(
			true,
		);
	});
});

describe("xoa-vinh-vien", () => {
	const CA = [
		{
			ten: "bo phan chua dung",
			id: "bp-x",
			loai: "bp",
			dung: false,
			thuTuc: "purgeDepartment",
		},
		{
			ten: "bo phan da dung",
			id: "bp-x",
			loai: "bp",
			dung: true,
			thuTuc: "purgeDepartment",
		},
		{
			ten: "khuon chua dung",
			id: "k-x",
			loai: "k",
			dung: false,
			thuTuc: "purgeTemplate",
		},
		{
			ten: "khuon da dung",
			id: "k-x",
			loai: "k",
			dung: true,
			thuTuc: "purgeTemplate",
		},
	] as const;

	test("xoa-vinh-vien: bon ca, nut chi co khi chua tung dung", async () => {
		let soCa = 0;
		for (const ca of CA) {
			boPhan =
				ca.loai === "bp"
					? [
							{
								id: ca.id,
								name: "Bo phan cu",
								position: 0,
								luuTru: true,
								dung: ca.dung,
							},
						]
					: [];
			khuon =
				ca.loai === "k"
					? [
							{
								...khuonHaiBuoc(),
								id: ca.id,
								name: "Khuon cu",
								luuTru: true,
								dung: ca.dung,
							},
						]
					: [];
			daGoi = [];
			const nhanXoa = ca.loai === "bp" ? tc.xoaHan : m.quanLy.xoaVinhVien;
			if (ca.loai === "bp") await moToChuc();
			else await moCaiDat();
			await moDaLuuTru();
			const coNutXoa = coNut(nhanXoa, dongLuuTru(ca.id));
			expect(`${ca.ten}: nut xoa ${coNutXoa}`).toBe(
				`${ca.ten}: nut xoa ${!ca.dung}`,
			);
			if (!ca.dung) {
				await bam(nut(nhanXoa, dongLuuTru(ca.id)));
				await xacNhan(nhanXoa);
				await cho(() => soGoi(ca.thuTuc) === 1, `${ca.ten}: goi xoa`);
				expect(`${ca.ten}: ${JSON.stringify(dauVaoCuoi(ca.thuTuc))}`).toBe(
					`${ca.ten}: {"id":"${ca.id}"}`,
				);
				await cho(
					() =>
						document.body.querySelector(`[data-luu-tru="${ca.id}"]`) === null,
					`${ca.ten}: bien mat`,
				);
			}
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
			document.body.innerHTML = "";
			soCa += 1;
		}
		expect(soCa).toBe(4);
	});
});

describe("khoa-theo-quyen", () => {
	const CA = [
		{ ten: "thanh vien", canManage: false },
		{ ten: "quan tri", canManage: true },
	] as const;

	const khoa = (b: HTMLButtonElement | null) => b === null || b.disabled;

	test("khoa-theo-quyen: hai vai, moi nut cau hinh khoa khi khong du quyen", async () => {
		let soAssert = 0;
		for (const ca of CA) {
			boPhan = [
				...hai(),
				{ id: "bp-c", name: "Cu", position: 2, luuTru: true, dung: false },
			];
			khuon = [khuonHaiBuoc()];
			quyen = ca.canManage;
			await moCaiDat();
			expect(`${ca.ten}: dong can quyen ${coChu(m.quanLy.canQuyen)}`).toBe(
				`${ca.ten}: dong can quyen ${!ca.canManage}`,
			);
			const ketQua: Array<[string, boolean]> = [
				["Soạn khuôn", khoa(timNut(m.settings.newTemplate))],
				["menu khuon", khoa(timMenu(`${m.quanLy.menu} San moi gioi`))],
			];
			await donSan();
			await moToChuc();
			if (ca.canManage) await moDaLuuTru();
			const trongLuuTru = (chu: string) => {
				const dong = document.body.querySelector('[data-luu-tru="bp-c"]');
				return dong
					? ([...dong.querySelectorAll("button")].find((b) =>
							b.textContent?.trim().startsWith(chu),
						) ?? null)
					: null;
			};
			ketQua.push(
				["Thêm bộ phận", khoa(timNut(tc.themBoPhan))],
				["menu bo phan", khoa(timMenu(tc.menu.replace("{ten}", "Kinh doanh")))],
				["keo sap xep", khoa(tayKeo("bp-a"))],
				["Khôi phục", khoa(trongLuuTru(tc.khoiPhuc))],
				["Xoá vĩnh viễn", khoa(trongLuuTru(tc.xoaHan))],
			);
			for (const [ten, daKhoa] of ketQua) {
				expect(`${ca.ten}: ${ten} khoa ${daKhoa}`).toBe(
					`${ca.ten}: ${ten} khoa ${!ca.canManage}`,
				);
				soAssert += 1;
			}
			await donSan();
		}
		expect(soAssert).toBe(14);
	});

	test("khoa-theo-quyen: thanh vien van dong ke hoach, danh dau bac, them moi gioi", async () => {
		quyen = false;
		ghiDanh = [
			{
				id: "gd-1",
				contactId: "cn-1",
				contactName: "Hoa Tran",
				accountAt: null,
				courseAt: null,
				activeAt: null,
				dealAt: null,
			},
		];
		await moHoSo();
		await cho(() => coNut(m.keHoach.dong), "nut dong");
		const viec = [
			["Đóng kế hoạch", nut(m.keHoach.dong).disabled],
			["o bac", oBac("accountAt", "Hoa Tran", false).disabled],
			["Thêm môi giới", nut(m.hoSo.emptyFunnelAction).disabled],
		] as const;
		for (const [ten, khoa] of viec) {
			expect(`${ten} khoa ${khoa}`).toBe(`${ten} khoa false`);
		}
	});
});

describe("dong-mo-ke-hoach", () => {
	test("dong-mo-ke-hoach: dong co xac nhan, hien Da dong va Mo lai", async () => {
		await moHoSo();
		await cho(() => coNut(m.keHoach.dong), "nut dong");
		await bam(nut(m.keHoach.dong));
		await xacNhan(m.keHoach.dong);
		await cho(() => coNut(m.keHoach.moLai), "hien mo lai");
		expect(
			`closePlan ${soGoi("closePlan")} ${JSON.stringify(dauVaoCuoi("closePlan"))} ${coChu(m.keHoach.daDong)}`,
		).toBe(`closePlan 1 {"id":"${KE_HOACH}"} true`);
		await bam(nut(m.keHoach.moLai));
		await cho(() => coNut(m.keHoach.dong), "nut dong tro lai");
		expect(
			`reopenPlan ${soGoi("reopenPlan")} closePlan ${soGoi("closePlan")} ${coChu(m.keHoach.daDong)}`,
		).toBe("reopenPlan 1 closePlan 1 false");
	});

	test("dong-mo-ke-hoach: doi chung — Giu lai thi 0 loi goi", async () => {
		await moHoSo();
		await cho(() => coNut(m.keHoach.dong), "nut dong");
		await bam(nut(m.keHoach.dong));
		await xacNhan(m.keHoach.giu);
		await nghi(5);
		expect(soGoi("closePlan")).toBe(0);
	});
});

describe("danh-dau-bac", () => {
	test("danh-dau-bac: ba ca — o trong ghi ngay lich dia phuong, doi ngay, bo danh dau", async () => {
		setSystemTime(new Date(2026, 8, 22, 0, 30));
		const ngayDiaPhuong = "2026-09-22";
		expect(
			`ngay UTC khac ngay dia phuong: ${new Date().toISOString().slice(0, 10) !== ngayDiaPhuong}`,
		).toBe("ngay UTC khac ngay dia phuong: true");
		let soCa = 0;

		ghiDanh = [
			{
				id: "gd-1",
				contactId: "cn-1",
				contactName: "Hoa Tran",
				accountAt: null,
				courseAt: null,
				activeAt: null,
				dealAt: null,
			},
		];
		await moHoSo();
		await bam(oBac("courseAt", "Hoa Tran", false));
		await cho(() => soGoi("markEnrollmentStage") === 1, "ca 1 goi");
		const vao1 = dauVaoCuoi("markEnrollmentStage");
		expect(`ca 1: ${JSON.stringify(vao1)}`).toBe(
			`ca 1: {"id":"gd-1","stage":"courseAt","at":"${ngayDiaPhuong}"}`,
		);
		enrollmentStageInput.parse(quaJson(vao1));
		await cho(() => dem(m.bac.courseAt) === "1/1", "ca 1 pheu dem 1");
		soCa += 1;

		await cho(
			() =>
				document.body.querySelector(
					`button[aria-label="${m.bac.doiNgay.replace("{bac}", m.bac.courseAt).replace("{ten}", "Hoa Tran")}"]`,
				) !== null,
			"o co ngay",
		);
		const ngayKhac = await moLich(
			oBac("courseAt", "Hoa Tran", true),
			"2026-09-10",
		);
		await bam(ngayKhac);
		await cho(() => soGoi("markEnrollmentStage") === 2, "ca 2 goi");
		expect(`ca 2: ${JSON.stringify(dauVaoCuoi("markEnrollmentStage"))}`).toBe(
			'ca 2: {"id":"gd-1","stage":"courseAt","at":"2026-09-10"}',
		);
		soCa += 1;

		await cho(
			() => ghiDanh[0]?.courseAt?.startsWith("2026-09-10") === true,
			"du lieu doi ngay",
		);
		await nghi(5);
		await moLich(oBac("courseAt", "Hoa Tran", true), "2026-09-10");
		await bam(nut(m.bac.boDanhDau));
		await cho(() => soGoi("markEnrollmentStage") === 3, "ca 3 goi");
		expect(`ca 3: ${JSON.stringify(dauVaoCuoi("markEnrollmentStage"))}`).toBe(
			'ca 3: {"id":"gd-1","stage":"courseAt","at":null}',
		);
		await cho(() => dem(m.bac.courseAt) === "0/1", "ca 3 pheu dem 0");
		soCa += 1;

		expect(soCa).toBe(3);
	});
});

describe("da-trong-pheu", () => {
	async function moThemMoiGioi(): Promise<void> {
		await moHoSo();
		await cho(() => coNut(m.hoSo.emptyFunnelAction), "nut them moi gioi");
		await bam(nut(m.hoSo.emptyFunnelAction));
		await cho(() => hopThoai() !== null, "mo them moi gioi");
		const trigger = [
			...document.body.querySelectorAll('[role="dialog"] [role="combobox"]'),
		].find((b) => b.tagName === "BUTTON");
		if (!trigger) throw new Error("khong thay combobox");
		await bam(trigger);
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"mo combobox",
		);
	}

	function muc(chu: string): Element {
		const x = [...document.body.querySelectorAll("[cmdk-item]")].find((o) =>
			o.textContent?.includes(chu),
		);
		if (!x) throw new Error(`combobox khong co ${chu}`);
		return x;
	}

	test("da-trong-pheu: nguoi da trong pheu mo va khong chon duoc", async () => {
		ghiDanh = [
			{
				id: "gd-1",
				contactId: "cn-1",
				contactName: "Hoa Tran",
				accountAt: null,
				courseAt: null,
				activeAt: null,
				dealAt: null,
			},
		];
		await moThemMoiGioi();
		const hoa = muc("Hoa Tran");
		expect(
			`Hoa Tran: ${hoa.getAttribute("aria-disabled")} ${hoa.textContent?.includes(m.tao.moiGioi.daTrongPheu)}`,
		).toBe("Hoa Tran: true true");
		await bam(hoa);
		const hop = hopThoai();
		if (!hop) throw new Error("hop dong som");
		expect(
			`Luu khoa sau khi bam nguoi da co: ${nut(m.tao.save, hop).disabled}`,
		).toBe("Luu khoa sau khi bam nguoi da co: true");
		await bam(muc("Binh"));
		await cho(() => !nut(m.tao.save, hop).disabled, "chon Binh");
		await bam(nut(m.tao.save, hop));
		await cho(() => soGoi("upsertEnrollment") === 1, "ghi danh");
		expect(
			enrollmentUpsertInput.parse(quaJson(dauVaoCuoi("upsertEnrollment")))
				.contactId,
		).toBe("cn-2");
	});

	test("da-trong-pheu: doi chung — pheu trong thi Hoa Tran chon duoc", async () => {
		await moThemMoiGioi();
		expect(`Hoa Tran: ${muc("Hoa Tran").getAttribute("aria-disabled")}`).toBe(
			"Hoa Tran: false",
		);
	});
});

describe("ngay-tao-ke-hoach", () => {
	test("ngay-tao-ke-hoach: hop tao ke hoach gui ngay lich dia phuong qua schema da siet", async () => {
		setSystemTime(new Date(2026, 8, 22, 0, 30));
		boPhan = hai();
		khuon = [khuonHaiBuoc()];
		await mo(<TaoKeHoach nhanNut="Tao ke hoach" />);
		await bam(nut("Tao ke hoach"));
		await cho(() => hopThoai() !== null, "mo hop");
		const trigger = [
			...document.body.querySelectorAll('[role="dialog"] [role="combobox"]'),
		].find((b) => b.tagName === "BUTTON");
		if (!trigger) throw new Error("khong thay chon cong ty");
		await bam(trigger);
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"mo cong ty",
		);
		const alpha = [...document.body.querySelectorAll("[cmdk-item]")].find((o) =>
			o.textContent?.includes("Alpha"),
		);
		if (!alpha) throw new Error("khong co Alpha");
		await bam(alpha);
		const oKhuon = document.body.querySelector(
			`[aria-label="${m.tao.keHoach.template}"]`,
		);
		if (!oKhuon) throw new Error("khong thay o khuon");
		await bam(oKhuon);
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"mo khuon",
		);
		const lua = [...document.body.querySelectorAll('[role="option"]')][0];
		if (!lua) throw new Error("khong co khuon");
		await act(async () => {
			lua.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		const hop = hopThoai();
		if (!hop) throw new Error("hop dong som");
		await cho(() => !nut(m.tao.save, hop).disabled, "san sang luu");
		await bam(nut(m.tao.save, hop));
		await cho(() => soGoi("createFromTemplate") === 1, "goi tao");
		const goc = dauVaoCuoi("createFromTemplate") as { startedAt: string };
		expect(`startedAt ${goc.startedAt}`).toBe("startedAt 2026-09-22");
		const daParse = planCreateFromTemplateInput.parse(quaJson(goc));
		expect(daParse.startedAt.toISOString()).toBe("2026-09-22T00:00:00.000Z");
	});
});

describe("loi-va-mot-lan", () => {
	type ThaoTac = {
		ten: string;
		thuTuc: string;
		chuanBi: () => void;
		mo: () => Promise<void>;
		lam: () => Promise<void>;
		giu: () => boolean;
		khoa: () => HTMLButtonElement | null;
	};

	function trongHop(chu: string): HTMLButtonElement {
		const hop = hopThoai();
		if (!hop) throw new Error("hop thoai khong mo");
		return nut(chu, hop);
	}

	function trongXacNhan(chu: string): HTMLButtonElement | null {
		const hop = hopXacNhan();
		return hop === null ? null : nut(chu, hop);
	}

	async function moXacNhanLuuTru(ten: string): Promise<void> {
		await moMenu(ten);
		await chonMuc(m.quanLy.luuTru);
		await cho(() => hopXacNhan() !== null, "hop xac nhan luu tru");
	}

	async function luuTruThanhCong(ten: string): Promise<void> {
		await moXacNhanLuuTru(ten);
		const x = trongXacNhan(m.quanLy.luuTru);
		if (!x) throw new Error("khong thay nut xac nhan");
		await bam(x);
		await cho(() => coNut(m.quanLy.hoanTac), "toast hoan tac");
	}

	const motBoPhanLuuTru = (): BoPhanTho[] => [
		hai()[0] as BoPhanTho,
		{ ...(hai()[1] as BoPhanTho), luuTru: true },
	];
	const motKhuonLuuTru = (): KhuonTho[] => [
		{
			...khuonHaiBuoc(),
			id: "k-2",
			name: "Khuon cu",
			luuTru: true,
			dung: false,
		},
	];
	const conTrongDs = (id: string) => thuTuBoPhan().includes(id);
	const conKhuon = (id: string) =>
		document.body.querySelector(`[data-khuon="${id}"]`) !== null;
	const conLuuTru = (id: string) =>
		document.body.querySelector(`[data-luu-tru="${id}"]`) !== null;
	const GD: GhiDanhTho = {
		id: "gd-1",
		contactId: "cn-1",
		contactName: "Hoa Tran",
		accountAt: null,
		courseAt: null,
		activeAt: null,
		dealAt: null,
	};

	const THAO_TAC: ThaoTac[] = [
		{
			ten: "doi ten bo phan",
			thuTuc: "renameDepartment",
			chuanBi: () => {
				boPhan = hai();
			},
			mo: async () => {
				await moToChuc();
				await moMenu("Kinh doanh");
				await chonMuc(tc.doiTen);
				await cho(() => hopThoai() !== null, "hop doi ten");
				await go(oNhap(tc.donVi.tenPhongBan), "Ten dang go");
			},
			lam: async () => bam(trongHop(m.tao.save)),
			giu: () =>
				hopThoai() !== null &&
				oNhap(tc.donVi.tenPhongBan).value === "Ten dang go",
			khoa: () => trongHop(m.tao.save),
		},
		{
			ten: "sap xep bo phan",
			thuTuc: "moveDepartment",
			chuanBi: () => {
				boPhan = [
					...hai(),
					{
						id: "bp-c",
						name: "Ke toan",
						position: 2,
						luuTru: false,
						dung: false,
					},
				];
			},
			mo: moToChuc,
			lam: async () => keoLenDau("bp-c", 2),
			giu: () => thuTuBoPhan().join(",") === "bp-a,bp-b,bp-c",
			khoa: () => tayKeo("bp-a"),
		},
		{
			ten: "sua khuon",
			thuTuc: "updateTemplate",
			chuanBi: () => {
				boPhan = hai();
				khuon = [khuonHaiBuoc()];
			},
			mo: async () => {
				await moCaiDat();
				await moMenu("San moi gioi");
				await chonMuc(m.quanLy.sua);
				await cho(() => hopThoai() !== null, "hop sua khuon");
				await go(oNhap(m.tao.khuon.name), "Khuon dang go");
				await go(oNhap(`${m.tao.khuon.stepLabel} 2`), "Buoc dang go");
			},
			lam: async () => bam(trongHop(m.tao.save)),
			giu: () =>
				hopThoai() !== null &&
				oNhap(m.tao.khuon.name).value === "Khuon dang go" &&
				oNhap(m.tao.khuon.partnerType).value === "Sàn" &&
				oNhap(`${m.tao.khuon.stepLabel} 1`).value === "Ky hop dong" &&
				oNhap(`${m.tao.khuon.stepLabel} 2`).value === "Buoc dang go",
			khoa: () => trongHop(m.tao.save),
		},
		{
			ten: "luu tru bo phan",
			thuTuc: "archiveDepartment",
			chuanBi: () => {
				boPhan = hai();
			},
			mo: async () => {
				await moToChuc();
				await moXacNhanLuuTru("Dao tao");
			},
			lam: async () => {
				const x = trongXacNhan(m.quanLy.luuTru);
				if (x) await bam(x);
			},
			giu: () => conTrongDs("bp-b"),
			khoa: () => trongXacNhan(m.quanLy.luuTru),
		},
		{
			ten: "luu tru khuon",
			thuTuc: "archiveTemplate",
			chuanBi: () => {
				boPhan = hai();
				khuon = [khuonHaiBuoc()];
			},
			mo: async () => {
				await moCaiDat();
				await moXacNhanLuuTru("San moi gioi");
			},
			lam: async () => {
				const x = trongXacNhan(m.quanLy.luuTru);
				if (x) await bam(x);
			},
			giu: () => conKhuon("k-1"),
			khoa: () => trongXacNhan(m.quanLy.luuTru),
		},
		{
			ten: "hoan tac bo phan",
			thuTuc: "restoreDepartment",
			chuanBi: () => {
				boPhan = hai();
			},
			mo: async () => {
				await moToChuc();
				await luuTruThanhCong("Dao tao");
			},
			lam: async () => {
				if (coNut(m.quanLy.hoanTac)) await bam(nut(m.quanLy.hoanTac));
			},
			giu: () => !conTrongDs("bp-b"),
			khoa: () => null,
		},
		{
			ten: "hoan tac khuon",
			thuTuc: "restoreTemplate",
			chuanBi: () => {
				boPhan = hai();
				khuon = [khuonHaiBuoc()];
			},
			mo: async () => {
				await moCaiDat();
				await luuTruThanhCong("San moi gioi");
			},
			lam: async () => {
				if (coNut(m.quanLy.hoanTac)) await bam(nut(m.quanLy.hoanTac));
			},
			giu: () => !conKhuon("k-1"),
			khoa: () => null,
		},
		{
			ten: "khoi phuc bo phan",
			thuTuc: "restoreDepartment",
			chuanBi: () => {
				boPhan = motBoPhanLuuTru();
			},
			mo: async () => {
				await moToChuc();
				await moDaLuuTru();
			},
			lam: async () => bam(nut(m.quanLy.khoiPhuc, dongLuuTru("bp-b"))),
			giu: () => conLuuTru("bp-b") && !conTrongDs("bp-b"),
			khoa: () => nut(m.quanLy.khoiPhuc, dongLuuTru("bp-b")),
		},
		{
			ten: "khoi phuc khuon",
			thuTuc: "restoreTemplate",
			chuanBi: () => {
				boPhan = hai();
				khuon = motKhuonLuuTru();
			},
			mo: async () => {
				await moCaiDat();
				await moDaLuuTru();
			},
			lam: async () => bam(nut(m.quanLy.khoiPhuc, dongLuuTru("k-2"))),
			giu: () => conLuuTru("k-2") && !conKhuon("k-2"),
			khoa: () => nut(m.quanLy.khoiPhuc, dongLuuTru("k-2")),
		},
		{
			ten: "xoa vinh vien bo phan",
			thuTuc: "purgeDepartment",
			chuanBi: () => {
				boPhan = motBoPhanLuuTru();
			},
			mo: async () => {
				await moToChuc();
				await moDaLuuTru();
				await bam(nut(tc.xoaHan, dongLuuTru("bp-b")));
				await cho(() => hopXacNhan() !== null, "hop xac nhan xoa");
			},
			lam: async () => {
				const x = trongXacNhan(tc.xoaHan);
				if (x) await bam(x);
			},
			giu: () => conLuuTru("bp-b"),
			khoa: () => trongXacNhan(tc.xoaHan),
		},
		{
			ten: "xoa vinh vien khuon",
			thuTuc: "purgeTemplate",
			chuanBi: () => {
				boPhan = hai();
				khuon = motKhuonLuuTru();
			},
			mo: async () => {
				await moCaiDat();
				await moDaLuuTru();
				await bam(nut(m.quanLy.xoaVinhVien, dongLuuTru("k-2")));
				await cho(() => hopXacNhan() !== null, "hop xac nhan xoa");
			},
			lam: async () => {
				const x = trongXacNhan(m.quanLy.xoaVinhVien);
				if (x) await bam(x);
			},
			giu: () => conLuuTru("k-2"),
			khoa: () => trongXacNhan(m.quanLy.xoaVinhVien),
		},
		{
			ten: "dong ke hoach",
			thuTuc: "closePlan",
			chuanBi: () => {
				dongLuc = null;
			},
			mo: async () => {
				await moHoSo();
				await cho(() => coNut(m.keHoach.dong), "nut dong");
				await bam(nut(m.keHoach.dong));
				await cho(() => hopXacNhan() !== null, "hop xac nhan dong");
			},
			lam: async () => {
				const x = trongXacNhan(m.keHoach.dong);
				if (x) await bam(x);
			},
			giu: () => coNut(m.keHoach.dong) && !coChu(m.keHoach.daDong),
			khoa: () => trongXacNhan(m.keHoach.dong),
		},
		{
			ten: "mo lai ke hoach",
			thuTuc: "reopenPlan",
			chuanBi: () => {
				dongLuc = "2026-09-21T00:00:00.000Z";
			},
			mo: async () => {
				await moHoSo();
				await cho(() => coNut(m.keHoach.moLai), "nut mo lai");
			},
			lam: async () => bam(nut(m.keHoach.moLai)),
			giu: () => coChu(m.keHoach.daDong),
			khoa: () => nut(m.keHoach.moLai),
		},
		{
			ten: "danh dau bac",
			thuTuc: "markEnrollmentStage",
			chuanBi: () => {
				ghiDanh = [GD];
			},
			mo: async () => {
				await moHoSo();
				await cho(
					() => document.body.querySelector("[data-bac]") !== null,
					"o bac",
				);
			},
			lam: async () => bam(oBac("accountAt", "Hoa Tran", false)),
			giu: () =>
				document.body.querySelector(
					`button[aria-label="${m.bac.danhDau.replace("{bac}", m.bac.accountAt).replace("{ten}", "Hoa Tran")}"]`,
				) !== null,
			khoa: () => oBac("accountAt", "Hoa Tran", false),
		},
	];

	test("loi-va-mot-lan: moi thao tac hai che do, loi giu trang thai, treo chi mot loi goi", async () => {
		expect(THAO_TAC.length).toBe(14);
		let soCa = 0;
		for (const o of THAO_TAC) {
			for (const che of ["loi", "treo"] as const) {
				boPhan = [];
				khuon = [];
				ghiDanh = [];
				dongLuc = null;
				cheDo = new Map();
				daGoi = [];
				o.chuanBi();
				await o.mo();
				const truoc = soGoi(o.thuTuc);
				cheDo = new Map([[o.thuTuc, che]]);
				await o.lam();
				await cho(
					() => soGoi(o.thuTuc) === truoc + 1,
					`${o.ten} (${che}): goi`,
				);
				if (che === "loi") {
					await cho(() => coChu(LOI), `${o.ten} (a): thong diep loi`);
					expect(`${o.ten} (a): giu trang thai ${o.giu()}`).toBe(
						`${o.ten} (a): giu trang thai true`,
					);
				} else {
					await nghi(10);
					const khoa = o.khoa();
					expect(
						`${o.ten} (b): khoa khi treo ${khoa === null ? "khong ap" : khoa.disabled}`,
					).toBe(
						`${o.ten} (b): khoa khi treo ${khoa === null ? "khong ap" : true}`,
					);
					await o.lam();
					await nghi(10);
					expect(`${o.ten} (b): so loi goi ${soGoi(o.thuTuc) - truoc}`).toBe(
						`${o.ten} (b): so loi goi 1`,
					);
				}
				await donSan();
				soCa += 1;
			}
		}
		expect(soCa).toBe(28);
	});
});
