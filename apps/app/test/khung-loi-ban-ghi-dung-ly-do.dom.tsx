import { afterEach, describe, expect, mock, test } from "bun:test";
import type { UrlUpdateEvent } from "nuqs/adapters/testing";
import type { ReactElement } from "react";
import { bam, cho, dat, dongHet, goiCua, mo, nut, nutCo } from "./khung-gop-y";

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
const { CompanyPlans } = await import(
	"@/components/crm/record-sheet/company-plans"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { karaBanGhiMessages } = await import("@/lib/messages/kara-ban-ghi");
const { crmMessages } = await import("@/lib/messages/crm");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const VI = karaBanGhiMessages("vi").khung;
const EN = karaBanGhiMessages("en").khung;
const KHONG_TAI = crmMessages("vi").misc.recordNotLoaded;
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const THU_LAI_EN = uiMessages("en").karaKhung.thuLai;
const DAU_VIET = /[À-ỹ]/u;

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

const khung = () => document.querySelector("[data-khung-tai-loi]");
const lyDo = () => khung()?.getAttribute("data-ly-do") ?? null;
const chuKhung = () => khung()?.textContent ?? "";

async function moNgan(
	o: Ngan,
	url: string,
	ghi: { record: string | null },
	locale: "vi" | "en" = "vi",
) {
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<LocaleProvider locale={locale}>{o.man}</LocaleProvider>
		</DetailSheet>,
		{
			searchParams: url,
			onUrlUpdate: (e: UrlUpdateEvent) => {
				ghi.record = e.searchParams.get("record");
			},
		},
	);
}

afterEach(async () => {
	await dongHet();
});

describe("khung-loi-ban-ghi-dung-ly-do", () => {
	test("klg-khong-con: bon ngan NOT_FOUND hien khong con, nut Dong, khong Thu lai, khong loi tho", async () => {
		const o: string[] = [];
		for (const n of NGAN) {
			datNen();
			dat(n.duong, () => {
				throw loiMa("NOT_FOUND", "khong-con-tho");
			});
			const ghi = { record: "chua" as string | null };
			await moNgan(n, `record=${n.ref}`, ghi);
			await cho(() => khung() !== null, `${n.ten} khung`);
			expect(lyDo()).toBe("khong-con");
			expect(chuKhung().includes(VI.khongCon.tieuDe)).toBe(true);
			expect(chuKhung().includes(VI.khongCon.moTa)).toBe(true);
			expect(chuKhung().includes(VI.loiMoTa)).toBe(false);
			expect(chuKhung().includes("khong-con-tho")).toBe(false);
			expect(nutCo(THU_LAI, khung() as Element) === null).toBe(true);
			await bam(nut(VI.khongCon.dong, khung() as Element));
			await cho(() => ghi.record !== "chua", `${n.ten} dong`);
			expect(ghi.record).toBe(null);
			o.push(n.ten);
			await dongHet();
		}
		expect(o.length).toBe(4);

		datNen();
		dat("contacts.byId", () => {
			throw loiMa("NOT_FOUND", "khong-con-tho");
		});
		const ghi = { record: "chua" as string | null };
		await moNgan(NGAN[0] as Ngan, "record=company:co-1,contact:ct-1", ghi);
		await cho(() => khung() !== null, "chong ngan khung");
		await bam(nut(VI.khongCon.dong, khung() as Element));
		await cho(() => ghi.record !== "chua", "chong ngan dong");
		expect(ghi.record).toBe("company:co-1");
	});

	test("klg-khong-quyen: bon ngan FORBIDDEN hien khong quyen, nut Dong, khong Thu lai", async () => {
		const o: string[] = [];
		for (const n of NGAN) {
			datNen();
			dat(n.duong, () => {
				throw loiMa("FORBIDDEN", "khong-quyen-tho");
			});
			const ghi = { record: "chua" as string | null };
			await moNgan(n, `record=${n.ref}`, ghi);
			await cho(() => khung() !== null, `${n.ten} khung`);
			expect(lyDo()).toBe("khong-quyen");
			expect(chuKhung().includes(VI.khongQuyen.tieuDe)).toBe(true);
			expect(chuKhung().includes(VI.khongQuyen.moTa)).toBe(true);
			expect(chuKhung().includes(VI.loiMoTa)).toBe(false);
			expect(chuKhung().includes("khong-quyen-tho")).toBe(false);
			expect(nutCo(THU_LAI, khung() as Element) === null).toBe(true);
			expect(nutCo(VI.khongQuyen.dong, khung() as Element) === null).toBe(
				false,
			);
			o.push(n.ten);
			await dongHet();
		}
		expect(o.length).toBe(4);
	});

	test("klg-mat-ket-noi: bon ngan loi khac co Thu lai goi lai dung mot lan", async () => {
		const o: string[] = [];
		for (const n of NGAN) {
			datNen();
			let lan = 0;
			let goiKhiKhung = 0;
			dat(n.duong, () => {
				lan += 1;
				if (khung() !== null) goiKhiKhung += 1;
				if (lan === 1) throw loiMa("INTERNAL_SERVER_ERROR", "mang-tho");
				return n.lay();
			});
			const ghi = { record: "chua" as string | null };
			await moNgan(n, `record=${n.ref}`, ghi);
			await cho(() => khung() !== null, `${n.ten} khung`);
			expect(lyDo()).toBe("mat-ket-noi");
			expect(chuKhung().includes(KHONG_TAI)).toBe(true);
			expect(chuKhung().includes(VI.loiMoTa)).toBe(true);
			expect(chuKhung().includes("mang-tho")).toBe(false);
			const truoc = goiCua(n.duong).length;
			await bam(nut(THU_LAI, khung() as Element));
			await cho(() => khung() === null, `${n.ten} tai lai`);
			expect(goiKhiKhung).toBe(1);
			expect(goiCua(n.duong).length - truoc >= 1).toBe(true);
			expect((document.body.textContent ?? "").includes(n.ten_ban_ghi)).toBe(
				true,
			);
			o.push(n.ten);
			await dongHet();
		}
		expect(o.length).toBe(4);
	});

	test("klg-ke-hoach-cong-ty: muc Ke hoach cua cong ty theo dung ly do, hai ly do dau khong nut", async () => {
		const ca: { ma: Ma; ly: string; coThuLai: boolean }[] = [
			{ ma: "NOT_FOUND", ly: "khong-con", coThuLai: false },
			{ ma: "FORBIDDEN", ly: "khong-quyen", coThuLai: false },
			{ ma: "INTERNAL_SERVER_ERROR", ly: "mat-ket-noi", coThuLai: true },
		];
		const o: string[] = [];
		for (const c of ca) {
			datNen();
			dat("onboarding.plansOfCompany", () => {
				throw loiMa(c.ma, "ke-hoach-tho");
			});
			await mo(<CompanyPlans companyId="co-1" companyName="Thép Hòa Phát" />);
			await cho(() => khung() !== null, `${c.ma} khung`);
			expect(lyDo()).toBe(c.ly);
			const soNut = khung()?.querySelectorAll("button").length ?? -1;
			expect(soNut).toBe(c.coThuLai ? 1 : 0);
			expect(nutCo(THU_LAI, khung() as Element) === null).toBe(!c.coThuLai);
			expect(chuKhung().includes("ke-hoach-tho")).toBe(false);
			o.push(c.ly);
			await dongHet();
		}
		expect(o.length).toBe(3);
	});

	test("klg-en: khung tieng Anh dung chu en, khong dau tieng Viet", async () => {
		const ca: { ma: Ma; tieuDe: string; nut: string }[] = [
			{ ma: "NOT_FOUND", tieuDe: EN.khongCon.tieuDe, nut: EN.khongCon.dong },
			{
				ma: "FORBIDDEN",
				tieuDe: EN.khongQuyen.tieuDe,
				nut: EN.khongQuyen.dong,
			},
			{
				ma: "INTERNAL_SERVER_ERROR",
				tieuDe: crmMessages("en").misc.recordNotLoaded,
				nut: THU_LAI_EN,
			},
		];
		const o: string[] = [];
		for (const c of ca) {
			datNen();
			dat("contacts.byId", () => {
				throw loiMa(c.ma, "en-tho");
			});
			await moNgan(
				NGAN[0] as Ngan,
				"record=contact:ct-1",
				{ record: null },
				"en",
			);
			await cho(() => khung() !== null, `${c.ma} khung en`);
			expect(chuKhung().includes(c.tieuDe)).toBe(true);
			expect(nutCo(c.nut, khung() as Element) === null).toBe(false);
			expect(DAU_VIET.test(chuKhung())).toBe(false);
			o.push(c.ma);
			await dongHet();
		}
		expect(o.length).toBe(3);
	});
});
