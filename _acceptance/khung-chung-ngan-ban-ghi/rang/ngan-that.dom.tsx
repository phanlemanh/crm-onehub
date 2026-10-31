import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactElement } from "react";
import { cho, dat, dongHet, mo } from "./khung-gop-y";

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));

globalThis.FormData = window.FormData;

const { DetailSheet } = await import("@/components/detail-sheet");
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { PlanSheet } = await import("@/components/crm/record-sheet/plan-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");


type Ma = "NOT_FOUND" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR";

function loiMa(ma: Ma, thongDiep: string): Error {
	return Object.assign(new Error(thongDiep), { data: { code: ma } });
}

const caNhanGia = () => ({
	id: "ct-1",
	firstName: "Hà",
	lastName: "Nguyễn",
	email: null,
	phone: null,
	title: null,
	linkedinUrl: null,
	twitterUrl: null,
	githubUrl: null,
	imageUrl: null,
	enrichmentStatus: "COMPLETE",
	enrichmentError: null,
	owner: null,
	company: null,
	tepTheoTruong: {},
	fields: [],
	queued: false,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	brief: null,
	facts: [],
	relationship: {
		emails: 0,
		threads: 0,
		lastReplyAt: null,
		meetings: 0,
		nextMeeting: null,
		colleagues: [],
	},
	isPrimaryContact: false,
	deals: [],
	archivedDeals: [],
});

const congTyGia = () => ({
	id: "co-1",
	name: "Thép Hòa Phát",
	domain: null,
	website: null,
	description: null,
	logoUrl: null,
	logoDarkUrl: null,
	iconUrl: null,
	iconDarkUrl: null,
	iconTone: null,
	brandColor: null,
	industry: null,
	subIndustry: null,
	city: null,
	stateCode: null,
	country: null,
	countryCode: null,
	phone: null,
	email: null,
	linkedinUrl: null,
	twitterUrl: null,
	githubUrl: null,
	pricingUrl: null,
	careersUrl: null,
	enrichmentStatus: "COMPLETE",
	enrichmentError: null,
	source: "MANUAL",
	owner: null,
	contacts: [],
	tepTheoTruong: {},
	fields: [],
	queued: false,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	enrichedAt: null,
	primaryContactId: null,
	primaryContact: null,
	reportingCurrency: "VND",
	soKeHoach: 0,
	xuongCoKhuon: false,
	deals: [],
	archivedContacts: [],
	archivedDeals: [],
});

const thoaThuanGia = () => ({
	id: "d-1",
	name: "Hợp đồng thép quý 4",
	description: null,
	stage: "lead",
	currency: "VND",
	closedReason: null,
	company: { id: "co-1", name: "Thép Hòa Phát", domain: null, iconUrl: null },
	owner: {
		id: "u-1",
		name: "Trần Minh Hải",
		email: "hai@onehub.vn",
		image: null,
	},
	tepTheoTruong: {},
	fields: [],
	amountCents: null,
	baseAmountCents: null,
	reportingCurrency: "VND",
	fxRate: null,
	fxRateAt: null,
	stageChangedAt: "2026-09-01T00:00:00.000Z",
	expectedCloseDate: null,
	closedAt: null,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	contacts: [],
	archivedContacts: [],
});

const keHoachGia = () => ({
	id: "kh-1",
	companyId: "co-1",
	companyName: "Thép Hòa Phát",
	templateId: null,
	startedAt: "2026-09-10T00:00:00.000Z",
	targetDays: 30,
	closedAt: null,
	ownerId: "u-1",
	company: {
		id: "co-1",
		name: "Thép Hòa Phát",
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		logoUrl: null,
	},
	owner: {
		id: "u-1",
		name: "Trần Minh Hải",
		email: "hai@onehub.vn",
		image: null,
	},
	templateName: null,
	ngayThu: 12,
	buocXong: 0,
	buocTong: 0,
	imNgay: 3,
	tacO: null,
	dangTheoDoi: false,
	nguoiTheoDoi: [],
});

type Ngan = {
	ten: string;
	duong: string;
	man: ReactElement;
	ref: string;
	ten_ban_ghi: string;
	lay: () => unknown;
};

const NGAN: Ngan[] = [
	{
		ten: "contact",
		duong: "contacts.byId",
		man: <ContactSheet contactId="ct-1" />,
		ref: "contact:ct-1",
		ten_ban_ghi: "Hà",
		lay: caNhanGia,
	},
	{
		ten: "company",
		duong: "companies.byId",
		man: <CompanySheet companyId="co-1" />,
		ref: "company:co-1",
		ten_ban_ghi: "Thép Hòa Phát",
		lay: congTyGia,
	},
	{
		ten: "deal",
		duong: "deals.byId",
		man: <DealSheet dealId="d-1" />,
		ref: "deal:d-1",
		ten_ban_ghi: "Hợp đồng thép quý 4",
		lay: thoaThuanGia,
	},
	{
		ten: "plan",
		duong: "onboarding.planById",
		man: <PlanSheet planId="kh-1" />,
		ref: "plan:kh-1",
		ten_ban_ghi: "Thép Hòa Phát",
		lay: keHoachGia,
	},
];

function datNen() {
	dat("users.list", () => []);
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.listSteps", () => ({ steps: [], phases: [] }));
	dat("onboarding.listEnrollments", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.access", () => ({ canManage: true }));
	dat("onboarding.plansOfCompany", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
}

async function moNgan(o: Ngan) {
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<LocaleProvider locale="vi">{o.man}</LocaleProvider>
		</DetailSheet>,
		{ searchParams: `record=${o.ref}` },
	);
}

const qs = (s: string) => document.querySelector<HTMLElement>(s);
const dau = () => qs('[data-slot="sheet-header"], [data-slot="drawer-header"]');

afterEach(async () => {
	await dongHet();
});

const MA_TRAN = ["dang-tai", "loi-mat-ket-noi", "khong-con", "du"] as const;
type TrangThai = (typeof MA_TRAN)[number];
type O = {
	dau: boolean;
	ban?: string | null;
	quay?: boolean;
	lyDo?: string | null;
	vung?: boolean;
	loi?: boolean;
	xuong?: boolean;
};

describe("bk1-ngan-that", () => {
	test("bk1-ngan-that: bon ngan that x bon trang thai di qua mot khung", async () => {
		expect(MA_TRAN.length * NGAN.length).toBe(16);
		const thucTe: Record<string, Partial<Record<TrangThai, O>>> = {};
		for (const n of NGAN) {
			const hang: Partial<Record<TrangThai, O>> = {};
			for (const tt of MA_TRAN) {
				datNen();
				if (tt === "dang-tai") dat(n.duong, () => new Promise<never>(() => {}));
				else if (tt === "loi-mat-ket-noi")
					dat(n.duong, () => {
						throw loiMa("INTERNAL_SERVER_ERROR", "hong");
					});
				else if (tt === "khong-con")
					dat(n.duong, () => {
						throw loiMa("NOT_FOUND", "khong-con-tho");
					});
				else dat(n.duong, n.lay);
				await moNgan(n);
				if (tt === "dang-tai") {
					await cho(() => qs('[data-khung-xuong="ngan"]') !== null, `${n.ten} khung xuong`);
					hang[tt] = {
						dau: dau() !== null,
						ban: qs('[data-khung-xuong="ngan"]')?.getAttribute("aria-busy") ?? null,
						quay: document.querySelector(".animate-spin") !== null,
					};
				} else if (tt === "du") {
					await cho(() => (dau()?.textContent ?? "").includes(n.ten_ban_ghi), `${n.ten} du`);
					hang[tt] = {
						dau: true,
						loi: qs("[data-khung-tai-loi]") !== null,
						xuong: qs("[data-khung-xuong]") !== null,
					};
				} else {
					await cho(() => qs("[data-khung-tai-loi]") !== null, `${n.ten} ${tt}`);
					hang[tt] = {
						dau: dau() !== null,
						lyDo: qs("[data-khung-tai-loi]")?.getAttribute("data-ly-do") ?? null,
						vung: qs("[data-khung-tai-loi] [data-vung-tai-loi]") !== null,
					};
				}
				await dongHet();
			}
			thucTe[n.ten] = hang;
		}
		const mong = {
			"dang-tai": { dau: true, ban: "true", quay: false },
			"loi-mat-ket-noi": { dau: true, lyDo: "mat-ket-noi", vung: true },
			"khong-con": { dau: true, lyDo: "khong-con", vung: false },
			du: { dau: true, loi: false, xuong: false },
		};
		expect(thucTe).toEqual(Object.fromEntries(NGAN.map((n) => [n.ten, mong])));
	});
});
