import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactElement } from "react";

const toastLoi: string[] = [];
const sonnerThat = await import("sonner");
const toastGia = Object.assign(
	(...vao: Parameters<typeof sonnerThat.toast>) => sonnerThat.toast(...vao),
	sonnerThat.toast,
	{
		error: (thongDiep: string) => {
			toastLoi.push(thongDiep);
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

const khung = await import("./khung-gop-y");
const { bam, cho, dat, dongHet, go, phim, trangThai } = khung;

type Nguoi = { id: string; name: string; email: string; image: string | null };

const NGUOI: Nguoi[] = [
	{ id: "u-an", name: "An Trần", email: "an@onehub.vn", image: null },
	{ id: "u-binh", name: "Bình Lê", email: "binh@onehub.vn", image: null },
];

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { crmMessages } = await import("@/lib/messages/crm");
const { OTruongPhieu, OTruongBang, HienThiTruong } = await import(
	"@/components/crm/fields/kieu-truong"
);
const { moTaTruongTuTao } = await import(
	"@/components/crm/fields/record-fields"
);

type MoTaTruong = import("@/components/crm/fields/kieu-truong").MoTaTruong;
type GiaTriHienThi =
	import("@/components/crm/fields/kieu-truong").GiaTriHienThi;
type RecordFieldEntry =
	import("@/components/crm/fields/record-fields").RecordFieldEntry;

const mVi = crmMessages("vi");

afterEach(async () => {
	await dongHet();
	trangThai.daGoi.length = 0;
	toastLoi.length = 0;
});

async function mo(
	man: ReactElement,
	locale: "vi" | "en" = "vi",
): Promise<HTMLElement> {
	dat("users.list", () => NGUOI);
	await khung.mo(<LocaleProvider locale={locale}>{man}</LocaleProvider>);
	const o = document.body.lastElementChild;
	if (!(o instanceof HTMLElement)) throw new Error("khong mo duoc");
	return o;
}

function hangTheoNhan(goc: ParentNode, nhan: string): HTMLElement | null {
	const label = [...goc.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	return (label?.parentElement as HTMLElement | null) ?? null;
}

function moTa(goc: Partial<MoTaTruong> & Pick<MoTaTruong, "kieu" | "nhan">): {
	moTa: MoTaTruong;
	daGoi: unknown[];
} {
	const daGoi: unknown[] = [];
	return {
		daGoi,
		moTa: {
			khoa: goc.nhan,
			giaTri: null,
			nguoiDung: NGUOI,
			luu: (giaTri) => {
				daGoi.push(giaTri);
			},
			...goc,
		},
	};
}

async function moSuaVaGo(
	o: HTMLElement,
	nhan: string,
	chu: string,
): Promise<HTMLInputElement> {
	const hang = hangTheoNhan(o, nhan);
	if (!hang) throw new Error(`thieu hang ${nhan}`);
	const nut = hang.querySelector("button");
	if (!nut) throw new Error(`thieu nut ${nhan}`);
	await bam(nut);
	const input = hang.querySelector("input");
	if (!input) throw new Error(`khong mo o nhap ${nhan}`);
	await go(input, chu);
	await phim(input, "Enter");
	return input;
}

describe("tmc-loi-nhap", () => {
	test("go sai kieu: giu o, cau theo kieu, khong luu", async () => {
		const khuonNhan = [
			"so",
			"email",
			"lien-ket",
			"dien-thoai",
			"locale-khac",
		] as const;
		for (const ma of khuonNhan) {
			const cau = mVi.truongKieu.tuChoi[ma];
			if (!cau.startsWith("Ô này nhận") || !cau.includes("ví dụ")) {
				throw new Error(`tmc loi nhap: khuon cau ${ma}`);
			}
		}
		if (!mVi.truongKieu.tuChoi.so.includes("1.234,5")) {
			throw new Error("tmc loi nhap: khuon cau so");
		}
		if (!mVi.truongKieu.trong("Tên tmc").includes("Tên tmc")) {
			throw new Error("tmc loi nhap: khuon cau trong");
		}

		const maTran = [
			{ kieu: "NUMBER", chuoi: "abc", cau: mVi.truongKieu.tuChoi.so },
			{
				kieu: "NUMBER",
				chuoi: "1234.5",
				cau: mVi.truongKieu.tuChoi["locale-khac"],
			},
			{ kieu: "EMAIL", chuoi: "an@", cau: mVi.truongKieu.tuChoi.email },
			{
				kieu: "URL",
				chuoi: "khong co cham",
				cau: mVi.truongKieu.tuChoi["lien-ket"],
			},
			{
				kieu: "PHONE",
				chuoi: "12ab",
				cau: mVi.truongKieu.tuChoi["dien-thoai"],
			},
			{
				kieu: "TEXT",
				chuoi: "",
				cau: mVi.truongKieu.trong("Tên tmc"),
				batBuoc: true,
				giaTri: "Có sẵn",
			},
		] as const;

		let daSo = 0;
		for (const o of maTran) {
			const nhan = o.kieu === "TEXT" ? "Tên tmc" : `Ô ${o.kieu} tmc`;
			const { moTa: mt, daGoi } = moTa({
				kieu: o.kieu,
				nhan,
				batBuoc: "batBuoc" in o ? o.batBuoc : false,
				giaTri: "giaTri" in o ? o.giaTri : null,
			});
			const goc = await mo(<OTruongPhieu moTa={mt} />);
			await moSuaVaGo(goc, nhan, o.chuoi);
			if (daGoi.length > 0) throw new Error(`tmc loi nhap: ${o.kieu} van luu`);
			const input = goc.querySelector("input");
			if (!input) throw new Error(`tmc loi nhap: ${o.kieu} dong o`);
			const loiId = input.getAttribute("aria-describedby");
			const cauLoi = loiId ? document.getElementById(loiId)?.textContent : null;
			if (
				input.getAttribute("aria-invalid") !== "true" ||
				cauLoi?.trim() !== o.cau
			) {
				throw new Error(`tmc loi nhap: ${o.kieu} cau ${cauLoi}`);
			}
			if (/takes|cannot/.test(cauLoi ?? "")) {
				throw new Error(`tmc loi nhap: ${o.kieu} cau may chu`);
			}
			daSo += 1;
		}
		if (daSo !== 6) throw new Error(`tmc loi nhap: thieu o ${daSo}`);

		const { moTa: dc, daGoi: dcGoi } = moTa({
			kieu: "NUMBER",
			nhan: "Đối chứng tmc",
		});
		const gocDc = await mo(<OTruongPhieu moTa={dc} />);
		await moSuaVaGo(gocDc, "Đối chứng tmc", "1.234,5");
		if (JSON.stringify(dcGoi) !== "[1234.5]") {
			throw new Error("tmc loi nhap: doi chung khong luu");
		}
		expect(daSo).toBe(6);
	});

	test("Esc sau khi go sai tra gia tri cu", async () => {
		const { moTa: mt, daGoi } = moTa({
			kieu: "NUMBER",
			nhan: "Esc tmc",
			giaTri: 7,
		});
		const goc = await mo(<OTruongPhieu moTa={mt} />);
		const input = await moSuaVaGo(goc, "Esc tmc", "abc");
		await phim(input, "Escape");
		if (goc.querySelector("input"))
			throw new Error("tmc loi nhap: esc khong dong");
		if (!goc.textContent?.includes("7"))
			throw new Error("tmc loi nhap: esc mat gia tri");
		expect(daGoi.length).toBe(0);
	});
});

describe("tmc-o-tich", () => {
	test("o tich co nhan, bam nhan doi gia tri, bang hien Co/Khong", async () => {
		const { moTa: mt, daGoi } = moTa({
			kieu: "CHECKBOX",
			nhan: "Đã ký tmc",
			giaTri: false,
		});
		const goc = await mo(<OTruongPhieu moTa={mt} />);
		const o = goc.querySelector<HTMLElement>("[role=checkbox]");
		const label = o?.id ? goc.querySelector(`label[for="${o.id}"]`) : null;
		const ten =
			label?.textContent?.trim() ?? o?.getAttribute("aria-label") ?? "";
		if (ten !== "Đã ký tmc") throw new Error(`tmc o tich: ten ${ten}`);
		if (!label) throw new Error("tmc o tich: ten ");
		await bam(label);
		if (JSON.stringify(daGoi) !== "[true]") {
			throw new Error(`tmc o tich: bam nhan ${JSON.stringify(daGoi)}`);
		}

		const maTran: { mat: string; el: ReactElement; chu: string }[] = [
			{
				mat: "bang",
				el: <OTruongBang kieu="CHECKBOX" giaTri={true} />,
				chu: mVi.misc.yes,
			},
			{
				mat: "bang",
				el: <OTruongBang kieu="CHECKBOX" giaTri={false} />,
				chu: mVi.misc.no,
			},
			{
				mat: "dau",
				el: <HienThiTruong kieu="CHECKBOX" giaTri={true} />,
				chu: mVi.misc.yes,
			},
			{
				mat: "dau",
				el: <HienThiTruong kieu="CHECKBOX" giaTri={false} />,
				chu: mVi.misc.no,
			},
		];
		let daSo = 1;
		for (const muc of maTran) {
			const g = await mo(muc.el);
			if (g.textContent?.trim() !== muc.chu) {
				throw new Error(
					`tmc o tich: hien ${muc.mat} ${muc.chu} ${g.textContent}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== 5) throw new Error(`tmc o tich: thieu o ${daSo}`);
		expect(daSo).toBe(5);
	});
});

function moTaTuTao(
	kieu: RecordFieldEntry["type"],
	nhan: string,
	giaTri: RecordFieldEntry["value"],
): MoTaTruong {
	return moTaTruongTuTao(
		{
			id: `f-${nhan}`,
			key: nhan,
			label: nhan,
			type: kieu,
			showOnSheet: true,
			options: [],
			value: giaTri,
		},
		() => {},
		() => false,
		NGUOI,
	);
}

type OLienKet = {
	kieu: "URL" | "EMAIL" | "PHONE";
	giaTri: string;
	href: string;
	moi: boolean;
};

const MA_TRAN_LIEN_KET: readonly OLienKet[] = [
	{ kieu: "URL", giaTri: "onehub.vn", href: "https://onehub.vn", moi: true },
	{ kieu: "URL", giaTri: "http://a.vn/x", href: "http://a.vn/x", moi: true },
	{
		kieu: "EMAIL",
		giaTri: "an@onehub.vn",
		href: "mailto:an@onehub.vn",
		moi: false,
	},
	{
		kieu: "PHONE",
		giaTri: "0901 234 567",
		href: "tel:+84901234567",
		moi: false,
	},
] as const;

async function kiemLienKet(
	mat: string,
	loai: string,
	el: ReactElement,
	o: OLienKet,
): Promise<void> {
	const g = await mo(el);
	const a = g.querySelector("a");
	if (!a) throw new Error(`tmc lien ket: ${mat} ${loai} ${o.kieu} a`);
	if (a.getAttribute("href") !== o.href) {
		throw new Error(
			`tmc lien ket: ${mat} ${loai} ${o.kieu} href ${a.getAttribute("href")}`,
		);
	}
	if (o.moi) {
		if (
			a.getAttribute("target") !== "_blank" ||
			!a.getAttribute("rel")?.includes("noopener")
		) {
			throw new Error(
				`tmc lien ket: ${mat} ${loai} ${o.kieu} rel ${a.getAttribute("rel")}`,
			);
		}
	}
}

describe("tmc-lien-ket", () => {
	test("bang dang ky: tu tao tren phieu va bang", async () => {
		const { docSoDienThoai } = await import("@crm/validation/so-dien-thoai");
		const doc = docSoDienThoai("0901 234 567");
		if (doc.kind !== "ok" || `tel:${doc.so}` !== "tel:+84901234567") {
			throw new Error("tmc lien ket: dap an phone lech");
		}
		let daSo = 0;
		for (const o of MA_TRAN_LIEN_KET) {
			const nhan = `${o.kieu} tmc`;
			await kiemLienKet(
				"phieu",
				"tu-tao",
				<OTruongPhieu moTa={moTaTuTao(o.kieu, nhan, o.giaTri)} />,
				o,
			);
			await kiemLienKet(
				"bang",
				"tu-tao",
				<OTruongBang kieu={o.kieu} giaTri={o.giaTri} />,
				o,
			);
			daSo += 2;
		}
		expect(daSo).toBe(8);
	});

	test("nut Sua mo o nhap, gia tri rong khong co a, giao thuc la khong thanh href", async () => {
		const mt = moTaTuTao("URL", "Trang tmc", "onehub.vn");
		const g = await mo(<OTruongPhieu moTa={mt} />);
		const nut = g.querySelector(
			`button[aria-label="${mVi.truongKieu.sua("Trang tmc")}"]`,
		);
		if (!nut) throw new Error("tmc lien ket: thieu nut sua URL");
		await bam(nut);
		if (!g.querySelector("input"))
			throw new Error("tmc lien ket: nut sua khong mo");

		for (const kieu of ["URL", "EMAIL", "PHONE"] as const) {
			const r = await mo(
				<OTruongPhieu moTa={moTaTuTao(kieu, `${kieu} rong`, null)} />,
			);
			if (r.querySelector("a"))
				throw new Error(`tmc lien ket: rong co a ${kieu}`);
		}
		const xau = await mo(
			<OTruongBang kieu="URL" giaTri="javascript:alert(1)" />,
		);
		if (xau.querySelector("a"))
			throw new Error("tmc lien ket: giao thuc la thanh href");
		expect(true).toBe(true);
	});
});

describe("tmc-o-bang", () => {
	test("ma tran o bang theo kieu", async () => {
		const { formatMoney } = await import("@crm/ui/lib/format");
		const maTran: {
			ten: string;
			gia: GiaTriHienThi;
			kiem: (g: HTMLElement) => boolean;
		}[] = [
			{
				ten: "NUMBER 1234.5",
				gia: { kieu: "NUMBER", giaTri: 1234.5 },
				kiem: (g) =>
					g.querySelector(".tabular-nums")?.textContent === "1.234,5",
			},
			{
				ten: "MONEY 123450 VND",
				gia: { kieu: "MONEY", giaTri: 123450, tienTe: "VND" },
				kiem: (g) => g.textContent === formatMoney(123450, "VND", "vi"),
			},
			{
				ten: "DATE 2026-10-22",
				gia: { kieu: "DATE", giaTri: "2026-10-22" },
				kiem: (g) => (g.textContent ?? "").includes("22"),
			},
			{
				ten: "USER co",
				gia: { kieu: "USER", giaTri: "u-an", nguoiDung: NGUOI },
				kiem: (g) => (g.textContent ?? "").includes("An Trần"),
			},
			{
				ten: "USER roi doi",
				gia: { kieu: "USER", giaTri: "u-cu", nguoiDung: NGUOI },
				kiem: (g) => g.textContent?.trim() === "—",
			},
			{
				ten: "CHECKBOX true",
				gia: { kieu: "CHECKBOX", giaTri: true },
				kiem: (g) => g.textContent === mVi.misc.yes,
			},
			{
				ten: "SELECT",
				gia: {
					kieu: "SELECT",
					giaTri: "o-1",
					luaChon: [{ value: "o-1", label: "Vàng" }],
				},
				kiem: (g) => g.textContent === "Vàng",
			},
			{
				ten: "TEXT",
				gia: { kieu: "TEXT", giaTri: "abc" },
				kiem: (g) => g.textContent === "abc",
			},
			{
				ten: "LONG_TEXT",
				gia: { kieu: "LONG_TEXT", giaTri: "dòng dài ".repeat(40) },
				kiem: (g) => g.querySelector(".truncate") !== null,
			},
			{
				ten: "URL",
				gia: { kieu: "URL", giaTri: "onehub.vn" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
			{
				ten: "EMAIL",
				gia: { kieu: "EMAIL", giaTri: "an@onehub.vn" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
			{
				ten: "PHONE",
				gia: { kieu: "PHONE", giaTri: "0901234567" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
		];
		let daSo = 0;
		for (const o of maTran) {
			const g = await mo(<OTruongBang {...o.gia} />);
			if (!o.kiem(g))
				throw new Error(`tmc o bang: ${o.ten} ra ${g.textContent}`);
			daSo += 1;
		}
		for (const kieu of [
			"TEXT",
			"NUMBER",
			"DATE",
			"SELECT",
			"URL",
			"MONEY",
		] as const) {
			const g = await mo(<OTruongBang kieu={kieu} giaTri={null} />);
			if (g.textContent?.trim() !== "—")
				throw new Error(`tmc o bang: ${kieu} null ra ${g.textContent}`);
		}
		if (daSo !== 12) throw new Error(`tmc o bang: thieu o ${daSo}`);
		expect(daSo).toBe(12);
	});
});

const { dealDetailOutput } = await import(
	"../../api/src/deals/deals.contracts"
);
const { companyDetailOutput } = await import(
	"../../api/src/companies/companies.contracts"
);
const { contactByIdOutput } = await import(
	"../../api/src/contacts/contacts.contracts"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { DealSheet, truongChuanThoaThuan } = await import(
	"@/components/crm/record-sheet/deal-sheet"
);
const { CompanySheet, truongChuanCongTy } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { ContactSheet, truongChuanLienHe } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");

const r = recordSheetMessages("vi");

type KieuTuTao = RecordFieldEntry["type"];
type GiaTriTuTao = RecordFieldEntry["value"];

function truongTuTao(
	entity: "DEAL" | "COMPANY" | "CONTACT",
	key: string,
	label: string,
	type: KieuTuTao,
	value: GiaTriTuTao,
	options: { id: string; label: string; position: number }[] = [],
) {
	return {
		id: `f-${key}`,
		entity,
		key,
		label,
		type,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: false,
		position: 0,
		archived: false,
		options,
		value,
	};
}

const CHU_SO_HUU = NGUOI[0];

function thoaThuanGia(fields: ReturnType<typeof truongTuTao>[]) {
	return dealDetailOutput.parse({
		id: "d-1",
		name: "Thoả thuận tmc",
		description: "Mô tả tmc",
		stage: "lead",
		currency: "VND",
		closedReason: null,
		company: {
			id: "co-1",
			name: "Công ty tmc",
			domain: "tmc.vn",
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			logoUrl: null,
			industry: null,
		},
		owner: CHU_SO_HUU,
		fields,
		amountCents: 123450,
		baseAmountCents: 123450,
		reportingCurrency: "VND",
		fxRate: null,
		fxRateAt: null,
		stageChangedAt: "2026-10-01T00:00:00.000Z",
		expectedCloseDate: "2026-10-22T00:00:00.000Z",
		closedAt: null,
		createdAt: "2026-10-01T00:00:00.000Z",
		archivedAt: null,
		contacts: [],
		archivedContacts: [],
	});
}

function congTyGia(fields: ReturnType<typeof truongTuTao>[]) {
	return companyDetailOutput.parse({
		id: "co-1",
		name: "Công ty tmc",
		domain: "tmc.vn",
		website: "tmc.vn",
		description: null,
		logoUrl: null,
		logoDarkUrl: null,
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		brandColor: null,
		industry: null,
		subIndustry: null,
		city: "Hà Nội",
		stateCode: null,
		country: null,
		countryCode: null,
		phone: "0901 234 567",
		email: "lienhe@tmc.vn",
		linkedinUrl: null,
		twitterUrl: null,
		githubUrl: null,
		pricingUrl: null,
		careersUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		source: "MANUAL",
		owner: CHU_SO_HUU,
		contacts: [],
		fields,
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
}

function lienHeGia() {
	return contactByIdOutput.parse({
		id: "ct-1",
		firstName: "Lan",
		lastName: "Phạm",
		email: "lan@tmc.vn",
		phone: "0901 234 567",
		title: "Giám đốc",
		linkedinUrl: "linkedin.com/in/lan",
		twitterUrl: null,
		githubUrl: null,
		imageUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		owner: CHU_SO_HUU,
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
		archivedDeals: [],
	});
}

function datNenPhieu() {
	dat("users.list", () => NGUOI);
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.listSteps", () => ({ steps: [], phases: [] }));
	dat("onboarding.listEnrollments", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.access", () => ({ canManage: true }));
	dat("onboarding.plansOfCompany", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
}

async function moPhieu(
	loai: "deal" | "company" | "contact",
	locale: "vi" | "en" = "vi",
): Promise<void> {
	datNenPhieu();
	const ngan =
		loai === "deal" ? (
			<DealSheet dealId="d-1" />
		) : loai === "company" ? (
			<CompanySheet companyId="co-1" />
		) : (
			<ContactSheet contactId="ct-1" />
		);
	const id = loai === "deal" ? "d-1" : loai === "company" ? "co-1" : "ct-1";
	await khung.mo(
		<DetailSheet open onOpenChange={() => {}}>
			<LocaleProvider locale={locale}>{ngan}</LocaleProvider>
		</DetailSheet>,
		{ searchParams: `record=${loai}:${id}` },
	);
	await cho(
		() => document.querySelectorAll("label").length > 3,
		`ngan ${loai}`,
	);
}

const goiCua = (duong: string) =>
	trangThai.daGoi.filter((g) => g.duong === duong);

describe("tmc-phieu-so", () => {
	test("o So tren phieu Thoa thuan doc theo locale va gui number", async () => {
		dat("deals.byId", () =>
			thoaThuanGia([
				truongTuTao("DEAL", "tmc_so", "Số đo tmc", "NUMBER", null),
			]),
		);
		await moPhieu("deal");
		const hang = hangTheoNhan(document.body, "Số đo tmc");
		if (!hang) throw new Error("tmc phieu so: doi chung thieu hang");
		const nutSua = hang.querySelector("button");
		if (!nutSua) throw new Error("tmc phieu so: doi chung thieu hang");
		await bam(nutSua);
		const o = hang.querySelector("input");
		await go(o, "1.234,5");
		await phim(o, "Enter");
		const luu = goiCua("deals.update");
		if (luu.length !== 1) throw new Error("tmc phieu so: khong luu");
		const gui = JSON.stringify(luu[0]?.dauVao?.data);
		if (gui !== JSON.stringify({ fields: { tmc_so: 1234.5 } })) {
			throw new Error(`tmc phieu so: gui ${gui}`);
		}
		await dongHet();

		for (const [locale, chu] of [
			["vi", "1.234,5"],
			["en", "1,234.5"],
		] as const) {
			dat("deals.byId", () =>
				thoaThuanGia([
					truongTuTao("DEAL", "tmc_so", "Số đo tmc", "NUMBER", 1234.5),
				]),
			);
			await moPhieu("deal", locale);
			const h = hangTheoNhan(document.body, "Số đo tmc");
			const so = h?.querySelector(".tabular-nums");
			if (so?.textContent !== chu) {
				throw new Error(
					`tmc phieu so: hien${locale === "en" ? " en" : ""} ${so?.textContent ?? h?.textContent}`,
				);
			}
			await dongHet();
		}
		expect(luu.length).toBe(1);
	});
});

async function chonLuaChon(hang: HTMLElement, nhan: string): Promise<void> {
	const oChon = hang.querySelector('[role="combobox"]');
	if (!oChon) throw new Error("khong co o chon");
	await bam(oChon);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		"mo o chon",
	);
	const muc = [...document.body.querySelectorAll('[role="option"]')].find(
		(o) => o.textContent?.trim() === nhan,
	);
	if (!muc) throw new Error(`khong co lua chon ${nhan}`);
	await phim(muc, "Enter");
}

describe("tmc-loi-may-chu", () => {
	test("may chu tu choi: cau theo kieu, khong in cau may chu", async () => {
		const truong = [
			truongTuTao("DEAL", "tmc_chon", "Chọn tmc", "SELECT", "o-a", [
				{ id: "o-a", label: "Vàng", position: 0 },
				{ id: "o-b", label: "Bạc", position: 1 },
			]),
			truongTuTao("DEAL", "tmc_nguoi", "Người tmc", "USER", "u-an"),
		];
		const ca = [
			{
				ten: "Chọn tmc",
				chon: "Bạc",
				loi: 'Chọn tmc has no option "x".',
				ma: "lua-chon",
				cu: "Vàng",
			},
			{
				ten: "Người tmc",
				chon: "Bình Lê",
				loi: "Người tmc takes someone who works here.",
				ma: "nguoi",
				cu: "An Trần",
			},
		] as const;
		let daSo = 0;
		for (const o of ca) {
			toastLoi.length = 0;
			dat("deals.byId", () => thoaThuanGia(truong));
			dat("deals.update", () => {
				throw new Error(o.loi);
			});
			await moPhieu("deal");
			const hang = hangTheoNhan(document.body, o.ten);
			if (!hang) throw new Error(`thieu hang ${o.ten}`);
			await chonLuaChon(hang, o.chon);
			await cho(() => toastLoi.length > 0, "toast");
			if (toastLoi.length !== 1) throw new Error("tmc loi may chu: khong bao");
			const chu = toastLoi[0] ?? "";
			if (/has no option|takes someone/.test(chu)) {
				throw new Error("tmc loi may chu: in cau may chu");
			}
			const mong = `${mVi.truongKieu.chuaLuu(o.ten)} ${mVi.truongKieu.tuChoi[o.ma]}`;
			if (chu !== mong) throw new Error(`tmc loi may chu: cau ${chu}`);
			const sau = hangTheoNhan(document.body, o.ten);
			if (!sau?.textContent?.includes(o.cu)) {
				throw new Error("tmc loi may chu: khong ve gia tri cu");
			}
			await dongHet();
			daSo += 1;
		}

		toastLoi.length = 0;
		dat("deals.byId", () => thoaThuanGia(truong));
		dat("deals.update", () => {
			throw new Error("Name is taken by another deal.");
		});
		await moPhieu("deal");
		const hangTen = hangTheoNhan(document.body, r.deal.fields.name);
		const nutTen = hangTen?.querySelector("button");
		if (!hangTen || !nutTen) throw new Error("thieu hang Ten");
		await bam(nutTen);
		const oTen = hangTen.querySelector("input");
		await go(oTen, "Tên mới tmc");
		await phim(oTen, "Enter");
		await cho(() => toastLoi.length > 0, "toast ten");
		const mongTen = `${mVi.truongKieu.chuaLuu(r.deal.fields.name)} ${mVi.truongKieu.tuChoi.khac}`;
		if (toastLoi[0] !== mongTen) {
			throw new Error(`tmc loi may chu: chuan ten ${toastLoi[0]}`);
		}
		daSo += 1;
		if (daSo !== 3) throw new Error(`tmc loi may chu: thieu ca ${daSo}`);
		expect(daSo).toBe(3);
	});
});

const DAP_AN_TRUONG_CHUAN: {
	phieu: "deal" | "company" | "contact";
	khoa: string;
	kieu: string;
	batBuoc?: true;
}[] = [
	{ phieu: "deal", khoa: "name", kieu: "TEXT", batBuoc: true },
	{ phieu: "deal", khoa: "amount", kieu: "MONEY" },
	{ phieu: "deal", khoa: "currency", kieu: "SELECT" },
	{ phieu: "deal", khoa: "expectedCloseDate", kieu: "DATE" },
	{ phieu: "deal", khoa: "owner", kieu: "USER" },
	{ phieu: "deal", khoa: "description", kieu: "LONG_TEXT" },
	{ phieu: "company", khoa: "name", kieu: "TEXT", batBuoc: true },
	{ phieu: "company", khoa: "domain", kieu: "TEXT" },
	{ phieu: "company", khoa: "website", kieu: "URL" },
	{ phieu: "company", khoa: "phone", kieu: "PHONE" },
	{ phieu: "company", khoa: "email", kieu: "EMAIL" },
	{ phieu: "company", khoa: "city", kieu: "TEXT" },
	{ phieu: "company", khoa: "country", kieu: "TEXT" },
	{ phieu: "company", khoa: "owner", kieu: "USER" },
	{ phieu: "contact", khoa: "firstName", kieu: "TEXT" },
	{ phieu: "contact", khoa: "lastName", kieu: "TEXT" },
	{ phieu: "contact", khoa: "title", kieu: "TEXT" },
	{ phieu: "contact", khoa: "email", kieu: "EMAIL" },
	{ phieu: "contact", khoa: "phone", kieu: "PHONE" },
	{ phieu: "contact", khoa: "linkedin", kieu: "URL" },
	{ phieu: "contact", khoa: "x", kieu: "URL" },
	{ phieu: "contact", khoa: "github", kieu: "URL" },
	{ phieu: "contact", khoa: "owner", kieu: "USER" },
];

function boMoTaChuan(): Record<"deal" | "company" | "contact", MoTaTruong[]> {
	const ngu = {
		m: r,
		locale: "vi" as const,
		luu: () => {},
		dangLuu: () => false,
		nguoiDung: NGUOI,
	};
	return {
		deal: truongChuanThoaThuan(thoaThuanGia([]), ngu),
		company: truongChuanCongTy(congTyGia([]), ngu),
		contact: truongChuanLienHe(lienHeGia(), ngu),
	};
}

function khungDom(el: Element): string {
	const vai = el.getAttribute("role") ?? "";
	const lop = (el.getAttribute("class") ?? "").split(/\s+/).sort().join(".");
	const con = [...el.children].map(khungDom).join(",");
	return `${el.tagName.toLowerCase()}[${vai}](${lop}){${con}}`;
}

describe("tmc-truong-chuan", () => {
	test("kieu cua truong chuan dung bang, khong thua", () => {
		const bo = boMoTaChuan();
		let daSo = 0;
		for (const dong of DAP_AN_TRUONG_CHUAN) {
			const mt = bo[dong.phieu].find((x) => x.khoa === dong.khoa);
			if (!mt || mt.kieu !== dong.kieu) {
				throw new Error(
					`tmc truong chuan: ${dong.phieu} ${dong.khoa} ${mt?.kieu ?? "thieu"}`,
				);
			}
			if (dong.batBuoc && !mt.batBuoc) {
				throw new Error(
					`tmc truong chuan: ${dong.phieu} ${dong.khoa} bat buoc`,
				);
			}
			daSo += 1;
		}
		for (const phieu of ["deal", "company", "contact"] as const) {
			for (const mt of bo[phieu]) {
				if (
					!DAP_AN_TRUONG_CHUAN.some(
						(d) => d.phieu === phieu && d.khoa === mt.khoa,
					)
				) {
					throw new Error(`tmc truong chuan: thua ${phieu} ${mt.khoa}`);
				}
			}
		}
		if (daSo !== 23) throw new Error(`tmc truong chuan: thieu ${daSo}`);
		expect(daSo).toBe(23);
	});

	test("hang chuan va hang tu tao cung kieu cung khung tren phieu that", async () => {
		const cap: {
			phieu: "deal" | "company";
			chuan: string;
			tuTao: string;
			kieu: KieuTuTao;
			giaTri: GiaTriTuTao;
		}[] = [
			{
				phieu: "deal",
				chuan: r.deal.fields.closeDate,
				tuTao: "Ngày tmc",
				kieu: "DATE",
				giaTri: "2026-10-23T00:00:00.000Z",
			},
			{
				phieu: "deal",
				chuan: r.deal.fields.owner,
				tuTao: "Người tmc",
				kieu: "USER",
				giaTri: "u-binh",
			},
			{
				phieu: "company",
				chuan: r.company.fields.website,
				tuTao: "Web tmc",
				kieu: "URL",
				giaTri: "tmc2.vn",
			},
			{
				phieu: "company",
				chuan: r.company.fields.phone,
				tuTao: "Máy tmc",
				kieu: "PHONE",
				giaTri: "0912 345 678",
			},
			{
				phieu: "company",
				chuan: r.company.fields.email,
				tuTao: "Thư tmc",
				kieu: "EMAIL",
				giaTri: "a@tmc.vn",
			},
			{
				phieu: "company",
				chuan: r.company.fields.city,
				tuTao: "Chữ tmc",
				kieu: "TEXT",
				giaTri: "Đà Nẵng",
			},
		];
		const theoPhieu = (phieu: "deal" | "company") =>
			cap
				.filter((c) => c.phieu === phieu)
				.map((c, i) =>
					truongTuTao(
						phieu === "deal" ? "DEAL" : "COMPANY",
						`tmc_${i}`,
						c.tuTao,
						c.kieu,
						c.giaTri,
					),
				);
		dat("deals.byId", () => thoaThuanGia(theoPhieu("deal")));
		dat("companies.byId", () => congTyGia(theoPhieu("company")));
		let daSo = 0;
		for (const phieu of ["deal", "company"] as const) {
			await moPhieu(phieu);
			for (const c of cap.filter((x) => x.phieu === phieu)) {
				const hangChuan = hangTheoNhan(document.body, c.chuan);
				const hangTuTao = hangTheoNhan(document.body, c.tuTao);
				if (!hangChuan)
					throw new Error(`tmc truong chuan: thieu hang ${phieu} ${c.chuan}`);
				if (!hangTuTao)
					throw new Error(`tmc truong chuan: thieu hang ${phieu} ${c.tuTao}`);
				const a = khungDom(hangChuan);
				const b = khungDom(hangTuTao);
				if (a !== b) {
					throw new Error(`tmc truong chuan: cap lech ${c.kieu} ${a} != ${b}`);
				}
				const ban = hangTuTao.cloneNode(true) as HTMLElement;
				const dau = ban.querySelector("[class]") ?? ban;
				dau.setAttribute(
					"class",
					`${dau.getAttribute("class") ?? ""} lech-thu`,
				);
				if (khungDom(ban) === a) throw new Error("tmc truong chuan: thuoc mu");
				daSo += 1;
			}
			await dongHet();
		}
		if (daSo !== 6) throw new Error(`tmc truong chuan: thieu ${daSo}`);
		expect(daSo).toBe(6);
	});
});

describe("tmc-lien-ket", () => {
	test("truong chuan cua Cong ty: phieu va bang bam duoc nhu tu tao", async () => {
		const bo = boMoTaChuan().company;
		const ca = [
			{
				khoa: "website",
				o: { kieu: "URL", giaTri: "tmc.vn", href: "https://tmc.vn", moi: true },
			},
			{
				khoa: "email",
				o: {
					kieu: "EMAIL",
					giaTri: "lienhe@tmc.vn",
					href: "mailto:lienhe@tmc.vn",
					moi: false,
				},
			},
			{
				khoa: "phone",
				o: {
					kieu: "PHONE",
					giaTri: "0901 234 567",
					href: "tel:+84901234567",
					moi: false,
				},
			},
		] as const;
		let daSo = 0;
		for (const { khoa, o } of ca) {
			const mt = bo.find((x) => x.khoa === khoa);
			if (!mt) throw new Error(`thieu mo ta ${khoa}`);
			await kiemLienKet("phieu", "chuan", <OTruongPhieu moTa={mt} />, o);
			await kiemLienKet(
				"bang",
				"chuan",
				<OTruongBang kieu={o.kieu} giaTri={o.giaTri} />,
				o,
			);
			daSo += 2;
		}
		expect(daSo).toBe(6);
	});
});
