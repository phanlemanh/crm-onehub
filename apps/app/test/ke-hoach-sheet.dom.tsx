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
	type OnboardingActivityMeta,
	vet,
} from "@crm/validation/onboarding-activity";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import payload from "../../api/test/fixtures/ke-hoach-payload.json";

type GiaTri = string | number | boolean | null;

type DauVao = Record<string, GiaTri> | undefined;

type LoiGoi = { duong: string; dauVao: DauVao };

const KE_HOACH = "kh-1";
const CONG_TY = "ct-1";
const NGUOI_A = {
	id: "u-a",
	name: "Nguyen A",
	email: "a@thu.test",
	image: null,
};
const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

const BUOC = [
	{
		id: "S1",
		planId: KE_HOACH,
		label: "Kickoff",
		departmentId: "bp-1",
		departmentName: "Kinh doanh",
		assigneeId: null,
		assignee: null,
		dueAt: "2026-09-22T00:00:00.000Z",
		completedAt: null,
		position: 0,
	},
	{
		id: "S2",
		planId: KE_HOACH,
		label: "Dao tao",
		departmentId: "bp-1",
		departmentName: "Kinh doanh",
		assigneeId: null,
		assignee: null,
		dueAt: "2026-09-22T00:00:00.000Z",
		completedAt: null,
		position: 1,
	},
];

const GHI_DANH = [
	{
		id: "gd-1",
		planId: KE_HOACH,
		contactId: "cn-1",
		contactName: "Trinh Cam Thuong",
		accountAt: null,
		courseAt: null,
		activeAt: null,
		dealAt: null,
		source: "tay",
	},
	{
		id: "gd-2",
		planId: KE_HOACH,
		contactId: "cn-2",
		contactName: "Tuan Do",
		accountAt: null,
		courseAt: null,
		activeAt: null,
		dealAt: null,
		source: "tay",
	},
];

const KE_HOACH_CHI_TIET = {
	id: KE_HOACH,
	companyId: CONG_TY,
	companyName: "One Mount",
	templateId: null,
	startedAt: "2026-09-10T00:00:00.000Z",
	targetDays: 30,
	closedAt: null,
	ownerId: TOI.id,
	company: {
		id: CONG_TY,
		name: "One Mount",
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		logoUrl: null,
	},
	owner: TOI,
	templateName: "San giao dich",
	ngayThu: 12,
	buocXong: 0,
	buocTong: 2,
	imNgay: 3,
	tacO: "Kickoff",
	dangTheoDoi: false,
	nguoiTheoDoi: [],
};

const HANG_DANH_MUC = {
	id: KE_HOACH,
	companyId: CONG_TY,
	companyName: "One Mount",
	startedAt: "2026-09-10T00:00:00.000Z",
	targetDays: 30,
	ngayThu: 12,
	buocXong: 0,
	buocTong: 2,
	tacO: "Kickoff",
	boPhanTac: "Kinh doanh",
	boPhanTacId: "bp-1",
	imNgay: 3,
	ownerId: TOI.id,
	closedAt: null,
};

let daGoi: LoiGoi[] = [];
let daLamMoi: string[] = [];

function thuTuc<T>(duong: string, doc: (v: DauVao) => T = () => null as T) {
	return {
		queryKey: (v?: DauVao) => [duong, v],
		pathKey: () => [duong],
		queryOptions: (v?: DauVao) => ({
			queryKey: [duong, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string }, v: DauVao) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: DauVao) => {
				daGoi.push({ duong, dauVao: v });
				return { id: "ok" };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: {
			nguoiNhanViec: thuTuc("nguoiNhanViec", () => [TOI, NGUOI_A]),
			planById: thuTuc("onboarding.planById", () => KE_HOACH_CHI_TIET),
			listSteps: thuTuc("onboarding.listSteps", () => ({
				rows: BUOC,
				total: BUOC.length,
			})),
			listEnrollments: thuTuc("onboarding.listEnrollments", () => GHI_DANH),
			listDepartments: thuTuc("onboarding.listDepartments", () => []),
			listTemplates: thuTuc("onboarding.listTemplates", () => []),
			access: thuTuc("onboarding.access", () => ({ canManage: true })),
			createFromTemplate: thuTuc("onboarding.createFromTemplate"),
			manDanhMuc: thuTuc("onboarding.manDanhMuc", () => ({
				rows: [HANG_DANH_MUC],
				total: 1,
				facetCounts: { trangThai: {}, boPhan: {}, nguoiCam: {} },
				soKhuon: 1,
				trangThai: "ST-danhmuc-codulieu",
			})),
			bangCot: thuTuc("onboarding.bangCot", () => ({
				cachChia: "buoc",
				tranThe: 30,
				cot: [],
			})),
			setStepDone: thuTuc("onboarding.setStepDone"),
			assignStep: thuTuc("onboarding.assignStep"),
			rescheduleStep: thuTuc("onboarding.rescheduleStep"),
			reorderSteps: thuTuc("onboarding.reorderSteps"),
			removeStep: thuTuc("onboarding.removeStep"),
			addStep: thuTuc("onboarding.addStep"),
			setPlanOwner: thuTuc("onboarding.setPlanOwner"),
			closePlan: thuTuc("onboarding.closePlan"),
			reopenPlan: thuTuc("onboarding.reopenPlan"),
			watch: thuTuc("onboarding.watch"),
			unwatch: thuTuc("onboarding.unwatch"),
			removeEnrollment: thuTuc("onboarding.removeEnrollment"),
			markEnrollmentStage: thuTuc("onboarding.markEnrollmentStage"),
			upsertEnrollment: thuTuc("onboarding.upsertEnrollment"),
		},
		users: {
			list: thuTuc("users.list", () => [TOI, NGUOI_A]),
			me: thuTuc("users.me", () => TOI),
		},
		companies: {
			options: thuTuc("companies.options", () => []),
		},
		contacts: {
			list: thuTuc("contacts.list", () => ({
				rows: [],
				total: 0,
				facetCounts: {},
			})),
		},
		activities: {
			complete: thuTuc("activities.complete"),
			timeline: thuTuc("activities.timeline", () => ({
				entries: [],
				nextCursor: null,
			})),
			timelineCounts: thuTuc("activities.timelineCounts", () => ({
				all: 0,
				notes: 0,
				upcoming: 0,
				done: 0,
				email: 0,
				meetings: 0,
			})),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		plan: async (id?: string) => {
			daLamMoi.push(id ?? "");
		},
		activity: async () => {},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/onboarding",
}));

const { PlanSheet } = await import("@/components/crm/record-sheet/plan-sheet");
const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { TimelineEntry } = await import(
	"@/components/crm/timeline/timeline-entry"
);

const m = onboardingMessages("vi");

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let hienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => hienTai };
	dangMo.push(san);
	return san;
}

function trongSheet(con: ReactNode): ReactElement {
	return (
		<DetailSheet onOpenChange={() => {}} open>
			{con}
		</DetailSheet>
	);
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

function theoNhan(nhan: string): Element {
	const o = document.body.querySelector(`[aria-label="${nhan}"]`);
	if (!o) {
		throw new Error(
			`khong thay o mang nhan "${nhan}" — cac nhan: ${[...document.body.querySelectorAll("[aria-label]")].map((e) => e.getAttribute("aria-label")).join(" | ")}`,
		);
	}
	return o;
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

function dien(mau: string, gia: Record<string, string>): string {
	return mau.replace(/\{(\w+)\}/g, (_, k: string) => gia[k] ?? "");
}

beforeEach(() => {
	daGoi = [];
	daLamMoi = [];
});

afterEach(async () => {
	setSystemTime();
	for (const san of dangMo) {
		await act(async () => {
			san.root.unmount();
		});
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("mo-nhu-thoa-thuan", () => {
	test("mo-nhu-thoa-thuan: bam hang danh muc mo record plan, bang con, ten cong ty chong sheet cong ty", async () => {
		const san = await mo(<DanhMucTable />);
		await cho(
			() => san.o.textContent?.includes("One Mount") === true,
			"hang One Mount",
		);
		const hang = [...san.o.querySelectorAll("tr")].find((r) =>
			r.textContent?.includes("One Mount"),
		);
		if (!hang) throw new Error("khong thay hang One Mount");

		await bam(hang);
		await nghi(1);

		expect(san.url().get("record"), "record=plan:kh-1").toBe(
			`plan:${KE_HOACH}`,
		);
		expect(san.o.textContent).toContain("One Mount");

		const sheet = await mo(
			trongSheet(<PlanSheet planId={KE_HOACH} />),
			`?record=plan:${KE_HOACH}`,
		);
		await cho(
			() => document.body.textContent?.includes(m.sheet.companyLink) === true,
			"lien ket ho so cong ty",
		);
		await bam(nut(m.sheet.companyLink));
		await nghi(1);
		expect(sheet.url().get("record")).toBe(
			`plan:${KE_HOACH},company:${CONG_TY}`,
		);
	});

	test("mo-nhu-thoa-thuan: doi chung — chua bam gi thi khong co record", async () => {
		const san = await mo(<DanhMucTable />);
		await cho(
			() => san.o.textContent?.includes("One Mount") === true,
			"hang One Mount",
		);
		expect(san.url().get("record")).toBeNull();
	});
});

describe("go-dung-nguoi", () => {
	test("go-dung-nguoi: go hang thu hai chi goi removeEnrollment cho nguoi thu hai", async () => {
		await mo(trongSheet(<PlanSheet planId={KE_HOACH} />), "?tab=brokers");
		const nhanGo = dien(m.sheet.removeBroker, { ten: "Tuan Do" });
		await cho(
			() => document.body.querySelector(`[aria-label="${nhanGo}"]`) !== null,
			"nut go Tuan Do",
		);

		await bam(theoNhan(nhanGo));
		const tieuDe = dien(m.sheet.confirmRemoveBroker.title, { ten: "Tuan Do" });
		await cho(
			() => document.body.textContent?.includes(tieuDe) === true,
			"hop xac nhan nêu ten",
		);
		const hop = document.body.querySelector('[role="alertdialog"]');
		if (!hop) throw new Error("khong thay hop xac nhan");
		expect(hop.textContent).toContain("Tuan Do");

		await bam(nut(m.sheet.confirmRemoveBroker.action, hop));
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.removeEnrollment"),
			"loi goi go",
		);

		const go = daGoi.filter((g) => g.duong === "onboarding.removeEnrollment");
		expect(go.length).toBe(1);
		const nhan = go[0]?.dauVao?.contactId;
		expect(nhan, `Expected contactId cn-2 / Received ${nhan}`).toBe("cn-2");
		expect(daGoi.some((g) => g.dauVao?.contactId === "cn-1")).toBe(false);
	});
});

describe("noi-man-buoc", () => {
	test("noi-man-buoc: tich, giao, doi han o dong hai gui dung ba payload va lam moi ba lan", async () => {
		setSystemTime(new Date("2026-09-20T03:00:00Z"));
		await mo(trongSheet(<PlanSheet planId={KE_HOACH} />));
		const nhanTich = dien(m.sheet.markDone, { nhan: "Dao tao" });
		await cho(
			() => document.body.querySelector(`[aria-label="${nhanTich}"]`) !== null,
			"o tich dong hai",
		);

		await bam(theoNhan(nhanTich));
		await cho(() => daLamMoi.length >= 1, "lam moi sau tich");

		await bam(theoNhan(dien(m.sheet.assignTo, { nhan: "Dao tao" })));
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"mo danh sach nguoi",
		);
		const luaChon = [...document.body.querySelectorAll("[cmdk-item]")].find(
			(o) => o.textContent?.includes(NGUOI_A.name),
		);
		if (!luaChon) throw new Error(`khong co ${NGUOI_A.name} trong danh sach`);
		await bam(luaChon);
		await cho(() => daLamMoi.length >= 2, "lam moi sau giao");

		const trigger = theoNhan(dien(m.sheet.dueFor, { nhan: "Dao tao" }));
		let o: Element | null = null;
		for (let lan = 0; lan < 5 && o === null; lan += 1) {
			await bam(trigger);
			for (let nhip = 0; nhip < 20 && o === null; nhip += 1) {
				await nghi(1);
				o = document.body.querySelector('button[data-day="2026-09-25"]');
			}
		}
		if (!o) throw new Error("lich khong mo ra o ngay 2026-09-25");
		await bam(o);
		await cho(() => daLamMoi.length >= 3, "lam moi sau doi han");

		const thay = (v: (typeof payload)[number]["dauVao"]) =>
			JSON.parse(
				JSON.stringify(v).replaceAll('"A"', `"${NGUOI_A.id}"`),
			) as DauVao;
		const mong = payload.map((p) => ({
			duong: `onboarding.${p.thuTuc}`,
			dauVao: thay(p.dauVao),
		}));
		const ghi = daGoi.filter((g) =>
			[
				"onboarding.setStepDone",
				"onboarding.assignStep",
				"onboarding.rescheduleStep",
			].includes(g.duong),
		);
		expect(
			ghi.map((g) => g.dauVao?.stepId),
			"Expected stepId S2",
		).toEqual(["S2", "S2", "S2"]);
		expect(ghi).toEqual(mong);
		expect(daLamMoi, "so lan lam moi mong 3").toEqual([
			KE_HOACH,
			KE_HOACH,
			KE_HOACH,
		]);
	});
});

const NGUOI_TAO = {
	id: "u-t",
	name: "Trinh Cam Thuong",
	email: "t@thu.test",
	image: null,
};

function dongThoiGian(
	id: string,
	type: string,
	meta: OnboardingActivityMeta | Record<string, string>,
) {
	return {
		id,
		type,
		subject: null,
		body: null,
		occurredAt: "2026-09-22T02:00:00.000Z",
		dueAt: null,
		completedAt: null,
		meta,
		createdAt: "2026-09-22T02:00:00.000Z",
		createdBy: NGUOI_TAO,
		company: null,
		contact: null,
		deal: null,
		planId: KE_HOACH,
		emailThread: null,
		calendarEvent: null,
	};
}

describe("ve-vet-ke-hoach", () => {
	test("ve-vet-ke-hoach: ma tran muoi dong, moi dong mot cau doc duoc", async () => {
		const buoc = { stepId: "S2", nhan: "Dao tao" };
		const MA_TRAN: [string, OnboardingActivityMeta][] = [
			[
				"buoc.giao",
				vet.buocGiao({
					...buoc,
					tu: null,
					tuTen: null,
					den: "u-a",
					denTen: "Nguyen A",
				}),
			],
			[
				"buoc.giao bo giao",
				vet.buocGiao({
					...buoc,
					tu: "u-a",
					tuTen: "Nguyen A",
					den: null,
					denTen: null,
				}),
			],
			["buoc.xong", vet.buocXong({ ...buoc, giaoLucXong: null })],
			["buoc.boXong", vet.buocBoXong(buoc)],
			[
				"buoc.doiHan",
				vet.buocDoiHan({ ...buoc, tu: "2026-09-22", den: "2026-09-25" }),
			],
			["buoc.them", vet.buocThem(buoc)],
			["buoc.bo", vet.buocBo(buoc)],
			[
				"keHoach.doiCamTrich",
				vet.keHoachDoiCamTrich({
					tu: "u-l",
					tuTen: "Lan",
					den: "u-a",
					denTen: "Nguyen A",
				}),
			],
			["keHoach.dong", vet.keHoachDong()],
			["keHoach.moLai", vet.keHoachMoLai()],
		];
		expect(MA_TRAN.length).toBe(10);

		const san = await mo(
			<ul>
				{MA_TRAN.map(([ten, meta], i) => (
					<TimelineEntry
						anchor={{ planId: KE_HOACH }}
						entry={dongThoiGian(`v-${i}`, "PLAN_CHANGE", meta) as never}
						key={ten}
					/>
				))}
			</ul>,
		);
		await cho(() => san.o.querySelectorAll("li").length === 10, "muoi dong");

		const dong = [...san.o.querySelectorAll("li")];
		for (const [i, [ten]] of MA_TRAN.entries()) {
			const chu = dong[i]?.textContent ?? "";
			expect(chu, `${ten}: ten nguoi tao`).toContain(NGUOI_TAO.name);
			if (ten.startsWith("buoc.")) {
				expect(chu, `${ten}: nhan buoc`).toContain("Dao tao");
			}
			expect(chu, `${ten}: lot chu may`).not.toMatch(
				/undefined|null|\d{4}-\d{2}-\d{2}T/,
			);
			expect(chu, `${ten}: roi ve nhan du phong`).not.toContain(m.vet.khongDoc);
		}
		expect(dong[0]?.textContent).toContain("Nguyen A");
		expect(dong[1]?.textContent).toContain("bỏ giao");
	});

	test("ve-vet-ke-hoach: dong thoa thuan van hien giai doan, meta hong hien nhan du phong", async () => {
		const san = await mo(
			<ul>
				<TimelineEntry
					anchor={{ dealId: "d-1" }}
					entry={
						dongThoiGian("s-1", "STAGE_CHANGE", {
							from: "DEMO_BOOKED",
							to: "QUALIFIED_TO_BUY",
						}) as never
					}
				/>
				<TimelineEntry
					anchor={{ planId: KE_HOACH }}
					entry={dongThoiGian("h-1", "PLAN_CHANGE", { stepId: "S2" }) as never}
				/>
			</ul>,
		);
		await cho(() => san.o.querySelectorAll("li").length === 2, "hai dong");
		const [giaiDoan, hong] = [...san.o.querySelectorAll("li")];
		expect(giaiDoan?.textContent).toContain("→");
		expect(hong?.textContent).toContain(m.vet.khongDoc);
	});
});
