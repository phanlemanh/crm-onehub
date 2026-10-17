import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act } from "react";

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

const { cho, dat, dongHet, mo, nhip, trangThai } = await import(
	"./khung-gop-y"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { CompaniesTable } = await import(
	"@/app/(app)/[slug]/companies/companies-table"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { messages } = await import("@crm/ui/lib/messages");
const { companyMessages } = await import("@/lib/messages/companies");
const { BANG_NGANH } = await import("@/lib/ten-nganh");

function viet(goc: string): string {
	const ten = BANG_NGANH[goc];
	if (!ten) throw new Error(`bang khong co ${goc}`);
	return ten;
}

type Locale = "vi" | "en";
const NGON_NGU: Locale[] = ["vi", "en"];
const LA = ["Môi giới nhà phố", "Quantum Computing"] as const;

const congTyGia = (industry: string | null) => ({
	id: "co-1",
	name: "Công ty BĐS Titan Miền Nam",
	domain: "titanmiennam.vn",
	website: null,
	description: null,
	logoUrl: null,
	logoDarkUrl: null,
	iconUrl: null,
	iconDarkUrl: null,
	iconTone: null,
	brandColor: null,
	industry,
	subIndustry: null,
	city: "Hà Nội",
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
	archivedContacts: [],
	archivedDeals: [],
});

const dongGia = (id: string, name: string, industry: string | null) => ({
	id,
	name,
	domain: `${id}.vn`,
	iconUrl: null,
	iconDarkUrl: null,
	iconTone: null,
	logoUrl: null,
	brandColor: null,
	industry,
	enrichmentStatus: "COMPLETE",
	queued: false,
	source: "MANUAL",
	owner: null,
	contactCount: 0,
	openDealCount: 0,
	lastActivityAt: null,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	fields: {},
});

function datNen() {
	dat("users.list", () => []);
	dat("fields.list", () => []);
	dat("fields.filters", () => []);
	dat("savedViews.list", () => []);
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.listSteps", () => ({ steps: [], phases: [] }));
	dat("onboarding.listEnrollments", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.access", () => ({ canManage: true }));
	dat("onboarding.plansOfCompany", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
}

async function moNgan(locale: Locale, industry: string | null) {
	datNen();
	dat("companies.byId", () => congTyGia(industry));
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<LocaleProvider locale={locale}>
				<CompanySheet companyId="co-1" />
			</LocaleProvider>
		</DetailSheet>,
		{ searchParams: "record=company:co-1" },
	);
	await cho(
		() => document.body.textContent?.includes("Hà Nội") === true,
		"ngan cong ty",
	);
}

async function moBang(
	locale: Locale,
	dong: ReturnType<typeof dongGia>[],
	dem: Record<string, number> = {},
) {
	datNen();
	dat("companies.list", () => ({
		rows: dong,
		total: dong.length,
		facetCounts: { industry: dem },
	}));
	await mo(
		<LocaleProvider locale={locale}>
			<CompaniesTable />
		</LocaleProvider>,
	);
	if (dong.length > 0)
		await cho(
			() => document.body.textContent?.includes(dong[0]?.name ?? "") === true,
			"bang cong ty",
		);
}

// Phần tử nhỏ nhất chứa đúng chữ — chỗ đọc thuộc tính lang / translate / title.
function phanTuChua(chu: string, goc: ParentNode = document.body): Element {
	const tim = [...goc.querySelectorAll("*")].filter(
		(e) => e.textContent?.trim() === chu,
	);
	const nho = tim.find((e) => ![...e.children].some((c) => tim.includes(c)));
	if (!nho) throw new Error(`khong thay chu "${chu}"`);
	return nho;
}

const coLangEn = (e: Element) => e.closest('[lang="en"]') !== null;

function dongPhu(): Element {
	const tieuDe = phanTuChua("Công ty BĐS Titan Miền Nam");
	const dong = [...document.querySelectorAll("*")].find(
		(e) =>
			e.textContent?.includes("Hà Nội") === true &&
			e.textContent.includes("titanmiennam.vn") &&
			!e.contains(tieuDe),
	);
	if (!dong) throw new Error("khong thay dong phu dau ngan");
	return dong;
}

function oNganhTheo(locale: Locale, tenCongTy: string): Element {
	const hang = phanTuChua(tenCongTy).closest("tr");
	if (!hang) throw new Error(`khong thay dong ${tenCongTy}`);
	const tieuDe = [...document.querySelectorAll("th")].map((th) =>
		th.textContent?.trim(),
	);
	const cot = tieuDe.indexOf(companyMessages(locale).headers.industry);
	const o = hang.querySelectorAll("td")[cot];
	if (!o) throw new Error(`khong thay o Nganh cua ${tenCongTy}`);
	return o;
}

async function bamTro(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	await nhip(5);
}

async function moBoLoc(locale: Locale): Promise<HTMLElement[]> {
	const ui = messages(locale).table;
	const nutLoc = [
		...document.body.querySelectorAll('button[aria-haspopup="menu"]'),
	].find((b) => (b.textContent ?? "").includes(ui.filters));
	await bamTro(nutLoc);
	const nhan = companyMessages(locale).facets.industry;
	const trig = [
		...document.body.querySelectorAll(
			'[data-slot="dropdown-menu-sub-trigger"]',
		),
	].find((el) => (el.textContent ?? "").includes(nhan));
	await bamTro(trig);
	const noi = document.body.querySelector(
		'[data-slot="dropdown-menu-sub-content"]',
	);
	if (!(noi instanceof HTMLElement)) throw new Error("bo loc Nganh khong mo");
	return [
		...noi.querySelectorAll<HTMLElement>(
			'[role="menuitemcheckbox"], [role="option"]',
		),
	].filter((el) => (el.textContent ?? "").trim() !== ui.clearFilters);
}

const nhanMuc = (muc: HTMLElement) => {
	const ban = muc.cloneNode(true) as HTMLElement;
	ban.querySelector('[data-slot="facet-count"]')?.remove();
	return (ban.textContent ?? "").trim();
};
const soMuc = (muc: HTMLElement) =>
	muc.querySelector('[data-slot="facet-count"]')?.textContent ?? null;

const lanLocCuoi = () =>
	trangThai.daGoi.filter((g) => g.duong === "companies.list").at(-1)?.dauVao
		?.industry;

beforeEach(() => {
	trangThai.daGoi.length = 0;
});

afterEach(async () => {
	await dongHet();
});

describe("ac2", () => {
	test("dau ngan tieng Viet hien ten Viet, khong gan nhan tieng Anh", async () => {
		await moNgan("vi", "Real Estate & PropTech");
		const ten = viet("Real Estate & PropTech");
		const dong = dongPhu();
		expect(dong.textContent).toContain(ten);
		expect(dong.textContent).not.toContain("Real Estate & PropTech");
		// Dòng phụ ghép « · » cùng phần tử với tên, nên đọc nhãn ngôn ngữ của mọi phần tử chứa tên.
		const gocAnh = [...dong.querySelectorAll('[lang="en"]')].filter((e) =>
			e.textContent?.includes(ten),
		);
		expect(gocAnh).toEqual([]);
		expect(coLangEn(dong)).toBe(false);
		expect(dong.textContent).toContain("Hà Nội");
	});

	test("dau ngan tieng Anh giu chu goc trong lang=en", async () => {
		await moNgan("en", "Real Estate & PropTech");
		const dong = dongPhu();
		expect(coLangEn(phanTuChua("Real Estate & PropTech", dong))).toBe(true);
		expect(dong.textContent).toContain("Hà Nội");
	});
});

describe("ac3", () => {
	const DONG = [
		dongGia("a", "Cty A", "Technology"),
		dongGia("b", "Cty B", "Real Estate & PropTech"),
	];

	test("cot Nganh tieng Viet: ten Viet, khong lang=en, ten dai co title", async () => {
		await moBang("vi", DONG);
		const oA = oNganhTheo("vi", "Cty A");
		expect(oA.textContent?.trim()).toBe(viet("Technology"));
		expect(coLangEn(phanTuChua(viet("Technology"), oA))).toBe(false);
		const tenB = viet("Real Estate & PropTech");
		const oB = oNganhTheo("vi", "Cty B");
		expect(oB.textContent?.trim()).toBe(tenB);
		expect(phanTuChua(tenB, oB).getAttribute("title")).toBe(tenB);
		expect(phanTuChua("Cty A")).toBeTruthy();
	});

	test("cot Nganh tieng Anh: chu goc trong lang=en", async () => {
		await moBang("en", DONG);
		const oA = oNganhTheo("en", "Cty A");
		expect(oA.textContent?.trim()).toBe("Technology");
		expect(coLangEn(phanTuChua("Technology", oA))).toBe(true);
		expect(phanTuChua("Cty A")).toBeTruthy();
	});
});

describe("ac4", () => {
	const DONG = [
		dongGia("a", "Cty A", "Technology"),
		dongGia("b", "Cty B", "Finance"),
	];
	const DEM = { Technology: 3, Finance: 1 };

	async function chonCongNghe(locale: Locale) {
		await moBang(locale, DONG, DEM);
		const muc = await moBoLoc(locale);
		const nhan = muc.map(nhanMuc);
		const mong =
			locale === "vi"
				? [viet("Finance"), viet("Technology")]
				: ["Finance", "Technology"];
		expect([...nhan].sort()).toEqual([...mong].sort());
		const tenCongNghe = locale === "vi" ? viet("Technology") : "Technology";
		const tenTaiChinh = locale === "vi" ? viet("Finance") : "Finance";
		const mucCN = muc.find((m) => nhanMuc(m) === tenCongNghe);
		const mucTC = muc.find((m) => nhanMuc(m) === tenTaiChinh);
		expect(mucCN && soMuc(mucCN)).toBe("3");
		expect(mucTC && soMuc(mucTC)).toBe("1");
		if (locale === "vi") expect(nhan).not.toContain("Technology");
		await bamTro(mucCN);
		await nhip(10);
		return lanLocCuoi();
	}

	test("loc tieng Viet nhan ten Viet, gui chu goc; bang loc tieng Anh", async () => {
		const vi = await chonCongNghe("vi");
		expect(vi).toEqual(["Technology"]);
		await dongHet();
		trangThai.daGoi.length = 0;
		const en = await chonCongNghe("en");
		expect(en).toEqual(["Technology"]);
		expect(vi).toEqual(en);
	});
});

describe("ac5", () => {
	test("ngoai danh sach x hai ngon ngu x ba cho: nguyen van, y nhu hom nay", async () => {
		let ca = 0;
		for (const locale of NGON_NGU) {
			await moBang(
				locale,
				[
					dongGia("x", "Cty X", LA[0]),
					dongGia("y", "Cty Y", LA[1]),
					dongGia("z", "Cty Z", null),
				],
				{ [LA[0]]: 1, [LA[1]]: 1 },
			);
			for (const [i, la] of LA.entries()) {
				const o = oNganhTheo(locale, i === 0 ? "Cty X" : "Cty Y");
				expect(o.textContent?.trim()).toBe(la);
				expect(coLangEn(phanTuChua(la, o))).toBe(true);
				ca += 1;
			}
			expect(oNganhTheo(locale, "Cty Z").textContent?.trim()).not.toBe("null");
			const muc = (await moBoLoc(locale)).map(nhanMuc);
			for (const la of LA) {
				expect(muc).toContain(la);
				ca += 1;
			}
			await dongHet();
			for (const la of LA) {
				await moNgan(locale, la);
				const dong = dongPhu();
				expect(dong.textContent).toContain(la);
				expect(coLangEn(phanTuChua(la, dong))).toBe(true);
				ca += 1;
				await dongHet();
			}
		}
		expect(ca).toBe(LA.length * NGON_NGU.length * 3);
	});

	test("doi chung duong: nganh trong bang o tieng Viet thi duoc dich", async () => {
		await moBang("vi", [
			dongGia("x", "Cty X", LA[0]),
			dongGia("t", "Cty T", "Technology"),
		]);
		const o = oNganhTheo("vi", "Cty T");
		expect(o.textContent?.trim()).toBe(viet("Technology"));
		expect(coLangEn(phanTuChua(viet("Technology"), o))).toBe(false);
	});
});
