import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const loiToast: string[] = [];
const sonnerThat = await import("sonner");
const toastGia = Object.assign(
	(...vao: Parameters<typeof sonnerThat.toast>) => sonnerThat.toast(...vao),
	sonnerThat.toast,
	{
		error: (thongDiep: unknown) => {
			loiToast.push(String(thongDiep));
			return "loi";
		},
	},
);
mock.module("sonner", () => ({ ...sonnerThat, toast: toastGia }));

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

const { bam, cho, dat, dongHet, go, mo, nut, phim, trangThai } = await import(
	"./khung-gop-y"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { CreateCompanySheet } = await import(
	"@/app/(app)/[slug]/companies/create-company-sheet"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { companyMessages } = await import("@/lib/messages/companies");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { tenQuocGia } = await import("@/lib/ten-quoc-gia");

type Locale = "vi" | "en";
const NGON_NGU: Locale[] = ["vi", "en"];

const dauVao = z
	.object({ tao: z.array(z.string()), tenNenTang: z.array(z.string()) })
	.parse(
		JSON.parse(
			readFileSync(
				join(
					import.meta.dir,
					"..",
					"..",
					"..",
					"packages",
					"validation",
					"test",
					"fixtures",
					"ten-mien-nen-tang-dau-vao.json",
				),
				"utf8",
			),
		),
	);

const congTyGia = (doi: Record<string, unknown> = {}) => ({
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
	archivedContacts: [],
	archivedDeals: [],
	...doi,
});

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

const soGoi = (duong: string) =>
	trangThai.daGoi.filter((g) => g.duong === duong).length;

const goiCuoi = (duong: string) =>
	trangThai.daGoi.filter((g) => g.duong === duong).at(-1)?.dauVao;

async function moTao(locale: Locale) {
	datNen();
	await mo(
		<LocaleProvider locale={locale}>
			<CreateCompanySheet />
		</LocaleProvider>,
		{ searchParams: "new=true" },
	);
	await cho(
		() => document.querySelector("form#create-company") !== null,
		"sheet cong ty moi",
	);
}

async function moNgan(locale: Locale, doi: Record<string, unknown> = {}) {
	datNen();
	dat("companies.byId", () => congTyGia(doi));
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			<LocaleProvider locale={locale}>
				<CompanySheet companyId="co-1" />
			</LocaleProvider>
		</DetailSheet>,
		{ searchParams: "record=company:co-1" },
	);
	await cho(
		() =>
			document.body.textContent?.includes("Công ty BĐS Titan Miền Nam") ===
			true,
		"ngan cong ty",
	);
}

function oCua(nhan: string): HTMLElement {
	const label = [...document.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const hang = label?.parentElement;
	if (!hang) throw new Error(`khong thay o ${nhan}`);
	return hang;
}

const oTenMien = () =>
	document.querySelector<HTMLInputElement>("form#create-company input[inputmode=url]");

beforeEach(() => {
	trangThai.daGoi.length = 0;
	loiToast.length = 0;
});

afterEach(async () => {
	await dongHet();
});

describe("ac1", () => {
	for (const locale of NGON_NGU) {
		test(`tao cong ty voi trang nen tang bi chan (${locale})`, async () => {
			const m = companyMessages(locale);
			await moTao(locale);
			for (const [i, chuoi] of dauVao.tao.entries()) {
				const ten = dauVao.tenNenTang[i] ?? "";
				await go(document.querySelector("form#create-company input"), "Titan");
				await go(oTenMien(), chuoi);
				await bam(nut(m.create.submit));

				expect(soGoi("companies.create")).toBe(0);
				const o = oTenMien();
				expect(o?.getAttribute("aria-invalid")).toBe("true");
				const loiId = o?.getAttribute("aria-describedby") ?? "";
				const dongLoi = document.getElementById(loiId);
				expect(dongLoi?.textContent).toBe(m.nenTang(ten));

				await go(oTenMien(), `${chuoi}x`);
				expect(oTenMien()?.getAttribute("aria-invalid")).toBeNull();
				expect(document.getElementById(loiId)).toBeNull();
			}
		});
	}

	test("doi chung duong: ten mien that duoc gui", async () => {
		const m = companyMessages("vi");
		await moTao("vi");
		await go(document.querySelector("form#create-company input"), "Titan");
		await go(oTenMien(), "titanmiennam.vn");
		await bam(nut(m.create.submit));
		expect(soGoi("companies.create")).toBe(1);
		expect(goiCuoi("companies.create")?.domain).toBe("titanmiennam.vn");
	});
});

describe("ac2", () => {
	for (const locale of NGON_NGU) {
		test(`sua ten mien thanh trang Facebook bi chan (${locale})`, async () => {
			const r = recordSheetMessages(locale);
			await moNgan(locale);
			const hang = oCua(r.company.fields.domain);
			await bam(nut("titanmiennam.vn", hang));
			const o = hang.querySelector("input");
			await go(o, "https://www.facebook.com/titanmiennam");
			await phim(o, "Enter");

			expect(soGoi("companies.update")).toBe(0);
			expect(loiToast).toEqual([companyMessages(locale).nenTang("Facebook")]);
			expect(oCua(r.company.fields.domain).textContent).toContain(
				"titanmiennam.vn",
			);
		});
	}

	test("doi chung duong: ten mien that duoc luu", async () => {
		const r = recordSheetMessages("vi");
		await moNgan("vi");
		const hang = oCua(r.company.fields.domain);
		await bam(nut("titanmiennam.vn", hang));
		const o = hang.querySelector("input");
		await go(o, "titan-moi.vn");
		await phim(o, "Enter");
		expect(soGoi("companies.update")).toBe(1);
		expect(goiCuoi("companies.update")).toEqual({
			id: "co-1",
			data: { domain: "titan-moi.vn" },
		});
		expect(loiToast).toEqual([]);
	});
});

describe("ac8", () => {
	const intl = (locale: string, ma: string) =>
		new Intl.DisplayNames([locale], { type: "region" }).of(ma);

	test("tenQuocGia theo bang", () => {
		expect(tenQuocGia("United States", "US", "vi")).toEqual({
			ten: intl("vi", "US") ?? "",
			dich: true,
		});
		expect(intl("vi", "US")).toBe("Hoa Kỳ");
		expect(tenQuocGia("United States", "US", "en")?.ten).toBe(
			intl("en", "US") ?? "",
		);
		expect(tenQuocGia("united states", "US", "vi")?.ten).toBe("Hoa Kỳ");
		expect(tenQuocGia("Mỹ", "US", "vi")).toEqual({ ten: "Mỹ", dich: false });
		expect(tenQuocGia("Mỹ", "US", "en")).toEqual({ ten: "Mỹ", dich: false });
		expect(tenQuocGia("Việt Nam", null, "en")).toEqual({
			ten: "Việt Nam",
			dich: false,
		});
		expect(tenQuocGia(null, "US", "vi")).toBeNull();
		expect(tenQuocGia("United States", "ZZ", "vi")).toEqual({
			ten: "United States",
			dich: false,
		});
		expect(tenQuocGia("United States", "", "vi")).toEqual({
			ten: "United States",
			dich: false,
		});
	});

	for (const locale of NGON_NGU) {
		test(`ngan cong ty hien quoc gia may dien theo ngon ngu (${locale})`, async () => {
			const r = recordSheetMessages(locale);
			await moNgan(locale, {
				city: "Menlo Park",
				stateCode: "CA",
				country: "United States",
				countryCode: "US",
			});
			const mong = intl(locale, "US") ?? "";
			expect(oCua(r.company.fields.country).textContent).toContain(mong);
			expect(document.body.textContent).toContain(`Menlo Park, CA, ${mong}`);
		});

		test(`quoc gia rep go hien nguyen van (${locale})`, async () => {
			const r = recordSheetMessages(locale);
			await moNgan(locale, { country: "Mỹ", countryCode: "US" });
			const o = oCua(r.company.fields.country);
			expect(o.textContent).toContain("Mỹ");
			expect(o.querySelector('[translate="no"]')?.textContent).toBe("Mỹ");
		});
	}
});
