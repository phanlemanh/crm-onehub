import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STANDARD_FIELD_KEYS } from "@crm/db/fields-chuan";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type BoTriTruong,
	parseBoTriTruong,
} from "@crm/validation/bo-tri-truong";
import {
	createContext,
	createElement as h,
	type ReactNode,
	useContext,
} from "react";
import { z } from "zod";

const toastLoi: string[] = [];
const toastDung: string[] = [];
const sonnerThat = await import("sonner");
const toastGia = Object.assign(
	(...vao: Parameters<typeof sonnerThat.toast>) => sonnerThat.toast(...vao),
	sonnerThat.toast,
	{
		error: (thongDiep: string) => {
			toastLoi.push(thongDiep);
			return "loi";
		},
		success: (thongDiep: string) => {
			toastDung.push(thongDiep);
			return "ok";
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

mock.module("@crm/ui/components/date-picker", () => ({
	DatePicker: ({
		id,
		value,
		onChange,
	}: {
		id?: string;
		value: string | null | undefined;
		onChange: (next: string) => void;
	}) =>
		h("input", {
			id,
			"data-ngay": "",
			value: value ?? "",
			onChange: (e: { target: { value: string } }) => onChange(e.target.value),
		}),
}));

type ChonCtx = { value: string; chon: (value: string) => void };
const SelectCtx = createContext<ChonCtx>({ value: "", chon: () => undefined });
const selectThat = await import("@crm/ui/components/select");
mock.module("@crm/ui/components/select", () => ({
	...selectThat,
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		children: ReactNode;
	}) =>
		h(SelectCtx.Provider, { value: { value, chon: onValueChange } }, children),
	SelectTrigger: ({
		children,
		...props
	}: {
		children: ReactNode;
		id?: string;
		"aria-label"?: string;
		"aria-required"?: boolean;
		"aria-invalid"?: boolean;
		"aria-describedby"?: string;
	}) =>
		h(
			"button",
			{
				type: "button",
				"data-select-trigger": "",
				id: props.id,
				"aria-label": props["aria-label"],
				"aria-required": props["aria-required"],
				"aria-invalid": props["aria-invalid"],
				"aria-describedby": props["aria-describedby"],
			},
			children,
		),
	SelectValue: ({ placeholder }: { placeholder?: string }) => {
		const { value } = useContext(SelectCtx);
		return value || placeholder || "";
	},
	SelectContent: ({ children }: { children: ReactNode }) =>
		h("span", { "data-select-content": "" }, children),
	SelectItem: ({ value, children }: { value: string; children: ReactNode }) => {
		const { chon } = useContext(SelectCtx);
		return h(
			"button",
			{
				type: "button",
				"data-select-item": value,
				onClick: () => chon(value),
			},
			children,
		);
	},
}));

globalThis.FormData = window.FormData;

const { bam, cho, dat, dongHet, go, mo, nhip, phim, trangThai } = await import(
	"./khung-gop-y"
);
const { fieldListOutput } = await import(
	"../../api/src/fields/fields.contracts"
);
const { dealDetailOutput } = await import(
	"../../api/src/deals/deals.contracts"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { CreateDealSheet } = await import(
	"@/app/(app)/[slug]/deals/create-deal-sheet"
);
const { CreateCompanySheet } = await import(
	"@/app/(app)/[slug]/companies/create-company-sheet"
);
const { CreateContactSheet } = await import(
	"@/app/(app)/[slug]/contacts/create-contact-sheet"
);
const { QuickAddContact, QuickAddDeal } = await import(
	"@/components/crm/record-sheet/quick-add"
);
const { nhanTruongChuan } = await import(
	"@/components/crm/fields/truong-chuan"
);
const { crmMessages } = await import("@/lib/messages/crm");
const { dealMessages } = await import("@/lib/messages/deals");
const { companyMessages } = await import("@/lib/messages/companies");
const { contactMessages } = await import("@/lib/messages/contacts");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { DetailSheet } = await import("@/components/detail-sheet");
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");

type Loai = "DEAL" | "COMPANY" | "CONTACT";

const giaTriGui = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
const duLieuSua = z.object({ fields: giaTriGui.optional() });
type Kieu =
	| "TEXT"
	| "LONG_TEXT"
	| "NUMBER"
	| "DATE"
	| "CHECKBOX"
	| "SELECT"
	| "URL"
	| "EMAIL"
	| "PHONE"
	| "USER";

type TruongGia = {
	key: string;
	label: string;
	type?: Kieu;
	required?: boolean;
	showOnSheet?: boolean;
	archived?: boolean;
	options?: { id: string; label: string }[];
};

const NGUOI = [
	{ id: "u-1", name: "Người A", email: "a@onehub.vn", image: null },
	{ id: "u-2", name: "Người B", email: "b@onehub.vn", image: null },
];

function danhSach(loai: Loai, ds: TruongGia[]) {
	return fieldListOutput.parse(
		ds.map((t, i) => ({
			id: `f-${t.key}`,
			entity: loai,
			key: t.key,
			label: t.label,
			type: t.type ?? "TEXT",
			agentFilled: false,
			agentBrief: null,
			required: t.required ?? false,
			showOnSheet: t.showOnSheet ?? true,
			showOnTable: false,
			showOnFilter: false,
			position: i,
			archived: t.archived ?? false,
			options: (t.options ?? []).map((o, j) => ({ ...o, position: j })),
		})),
	);
}

type DoiBoTri = { lenTren?: [string, string]; an?: string };

function boTri(
	loai: Loai,
	tuTao: TruongGia[],
	doi: DoiBoTri = {},
): BoTriTruong {
	const chuan = STANDARD_FIELD_KEYS[loai].map((key) => ({
		kind: "standard" as const,
		key,
		hidden: key === doi.an,
		required: false,
	}));
	const tu = tuTao.map((t) => ({
		kind: "custom" as const,
		id: `f-${t.key}`,
		key: t.key,
	}));
	let ds: BoTriTruong[number][] = [...chuan, ...tu];
	if (doi.lenTren) {
		const [khoa, truocKhoa] = doi.lenTren;
		const muc = ds.find((m) => m.key === khoa);
		ds = ds.filter((m) => m.key !== khoa);
		const i = ds.findIndex((m) => m.key === truocKhoa);
		if (muc) ds.splice(i, 0, muc);
	}
	return parseBoTriTruong(ds);
}

function datNen(loai: Loai, tuTao: TruongGia[], doi: DoiBoTri = {}) {
	dat("users.list", () => NGUOI);
	dat("users.me", () => NGUOI[0]);
	dat("currency.settings", () => ({
		reportingCurrency: "VND",
		currencies: [],
	}));
	dat("giaiDoan.list", () => ({
		canManage: true,
		tran: 20,
		stages: [
			{ id: "lead", label: "Lead", kind: "OPEN", position: 0, dealCount: 0 },
		],
	}));
	dat("fields.list", (vao) =>
		vao?.entity === loai ? danhSach(loai, tuTao) : [],
	);
	dat("fields.layout", (vao) =>
		vao?.entity === loai ? boTri(loai, tuTao, doi) : boTri("DEAL", []),
	);
}

const FORM_ID = {
	DEAL: "create-deal",
	COMPANY: "create-company",
	CONTACT: "create-contact",
} as const satisfies Record<Loai, string>;

async function moSheet(loai: Loai, locale: Locale = "vi") {
	const man =
		loai === "DEAL" ? (
			<CreateDealSheet companyId="co-1" />
		) : loai === "COMPANY" ? (
			<CreateCompanySheet />
		) : (
			<CreateContactSheet />
		);
	await mo(<LocaleProvider locale={locale}>{man}</LocaleProvider>, {
		searchParams: "new=true",
	});
	await cho(
		() =>
			document.querySelector(`form#${FORM_ID[loai]}:not([aria-busy])`) !== null,
		`sheet ${loai}`,
	);
	await nhip(5);
}

function nhanTrongForm(goc: ParentNode): string[] {
	return [...goc.querySelectorAll("label")]
		.map((l) => l.textContent?.trim() ?? "")
		.filter((t) => t !== "");
}

function oTheoNhan(nhan: string, goc: ParentNode = document): HTMLElement {
	const label = [...goc.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const o = label?.htmlFor ? document.getElementById(label.htmlFor) : null;
	if (!o) throw new Error(`khong thay o ${nhan}`);
	return o;
}

function goiCua(duong: string) {
	return trangThai.daGoi.filter((g) => g.duong === duong);
}

async function bamTao(loai: Loai, locale: Locale = "vi") {
	const chu =
		loai === "DEAL"
			? dealMessages(locale).create.submit
			: loai === "COMPANY"
				? companyMessages(locale).create.submit
				: contactMessages(locale).create.submit;
	const nut = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!nut) throw new Error(`khong thay nut ${chu}`);
	await bam(nut);
	await nhip(5);
}

async function chon(o: HTMLElement, giaTri: string) {
	const muc = o
		.closest("[data-o-tao]")
		?.querySelector<HTMLElement>(`[data-select-item="${giaTri}"]`);
	if (!muc) throw new Error(`khong thay lua chon ${giaTri}`);
	await bam(muc);
}

function dapAnNhan(
	loai: Loai,
	locale: Locale,
	tuTao: TruongGia[],
	doi: DoiBoTri,
): string[] {
	const vao = (t: TruongGia) =>
		!t.archived && (t.required === true || t.showOnSheet !== false);
	const thuTu = boTri(loai, tuTao, doi);
	const ra: string[] = [];
	for (const m of thuTu) {
		if (m.kind === "standard") {
			if (m.key === doi.an) continue;
			ra.push(nhanTruongChuan(loai, m.key, locale));
			if (loai === "DEAL" && m.key === "company")
				ra.push(dealMessages(locale).create.stage);
			continue;
		}
		const t = tuTao.find((x) => x.key === m.key);
		if (t && vao(t)) ra.push(t.label);
	}
	return ra;
}

const AN_THEO_LOAI = {
	DEAL: "expectedCloseDate",
	COMPANY: "city",
	CONTACT: "title",
} as const satisfies Record<Loai, string>;

beforeEach(() => {
	trangThai.daGoi = [];
	toastLoi.length = 0;
	toastDung.length = 0;
});

afterEach(dongHet);

describe("ntl-bo-truong", () => {
	test("form tao co dung truong cua form, dung thu tu, dung nhan", async () => {
		let soCap = 0;
		for (const locale of ["vi", "en"] as const) {
			for (const loai of ["DEAL", "COMPANY", "CONTACT"] as const) {
				const tuTao: TruongGia[] = [
					{ key: "bat_buoc", label: "Bắt buộc ntl", required: true },
					{ key: "hien", label: "Hiện ntl" },
					{ key: "khong_hien", label: "Không hiện ntl", showOnSheet: false },
					{ key: "da_luu_tru", label: "Đã lưu trữ ntl", archived: true },
				];
				const doi: DoiBoTri = {
					lenTren: ["hien", STANDARD_FIELD_KEYS[loai][1] ?? ""],
					an: AN_THEO_LOAI[loai],
				};
				datNen(loai, tuTao, doi);
				await moSheet(loai, locale);
				const form = document.querySelector(`form#${FORM_ID[loai]}`);
				if (!form) throw new Error("khong thay form");
				const nhan = nhanTrongForm(form);
				const dap = dapAnNhan(loai, locale, tuTao, doi);
				if (JSON.stringify(nhan) !== JSON.stringify(dap))
					throw new Error(
						`ntl bo truong: lech ${locale} ${loai} form=${JSON.stringify(nhan)} dap=${JSON.stringify(dap)}`,
					);
				for (const thua of [
					"Không hiện ntl",
					"Đã lưu trữ ntl",
					nhanTruongChuan(loai, AN_THEO_LOAI[loai], locale),
				]) {
					if (nhan.includes(thua))
						throw new Error(`ntl bo truong: thua ${loai} ${thua}`);
				}
				const ten = oTheoNhan(
					nhanTruongChuan(loai, STANDARD_FIELD_KEYS[loai][0] ?? "", locale),
					form,
				);
				const batBuoc = oTheoNhan("Bắt buộc ntl", form);
				if (!ten.hasAttribute("required") || !batBuoc.hasAttribute("required"))
					throw new Error(`ntl bo truong: thieu dau bat buoc ${loai}`);
				if (oTheoNhan("Hiện ntl", form).hasAttribute("required"))
					throw new Error(`ntl bo truong: dau bat buoc thua ${loai}`);
				soCap += 1;
				const doiChung = dap.slice(0, -1);
				if (JSON.stringify(nhan) === JSON.stringify(doiChung))
					throw new Error("ntl bo truong: thuoc mu");
				await dongHet();
				trangThai.daGoi = [];
			}
		}
		if (soCap !== 6) throw new Error(`ntl bo truong: thieu cap ${soCap}`);

		datNen("DEAL", []);
		dat("currency.settings", () => ({
			reportingCurrency: "VND",
			currencies: [],
		}));
		await moSheet("DEAL");
		const tienTe = () =>
			document.querySelector('[data-select-trigger][aria-label="Tiền tệ"]')
				?.textContent;
		if (tienTe() !== "VND")
			throw new Error(`ntl bo truong: tien te mac dinh ${tienTe()}`);
		await dongHet();
		dat("currency.settings", () => ({
			reportingCurrency: "USD",
			currencies: [],
		}));
		await moSheet("DEAL");
		if (tienTe() !== "USD") throw new Error("ntl bo truong: tien te dung yen");
		expect(soCap).toBe(6);
	});
});

describe("ntl-chua-tai", () => {
	test("dang tai thi khoa nut, loi thi van tao duoc", async () => {
		datNen("DEAL", []);
		dat("fields.list", () => new Promise(() => {}));
		await mo(<CreateDealSheet companyId="co-1" />, {
			searchParams: "new=true",
		});
		await cho(
			() => document.querySelector("form#create-deal") !== null,
			"form dang tai",
		);
		const form = document.querySelector("form#create-deal");
		if (!form) throw new Error("khong thay form");
		const dap = dapAnNhan("DEAL", "vi", [], {});
		if (JSON.stringify(nhanTrongForm(form)) !== JSON.stringify(dap))
			throw new Error(
				`ntl chua tai: dang tai ${JSON.stringify(nhanTrongForm(form))}`,
			);
		await go(oTheoNhan("Tên", form), "Thoả thuận A");
		const nut = document.querySelector<HTMLButtonElement>(
			'button[form="create-deal"]',
		);
		if (!nut?.disabled) throw new Error("ntl chua tai: nut mo khi dang tai");
		await dongHet();

		trangThai.daGoi = [];
		datNen("DEAL", []);
		dat("fields.list", () => {
			throw new Error("Internal");
		});
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận B");
		const nut2 = document.querySelector<HTMLButtonElement>(
			'button[form="create-deal"]',
		);
		if (nut2?.disabled) throw new Error("ntl chua tai: nut khoa khi loi");
		await bamTao("DEAL");
		if (goiCua("deals.create").length !== 1)
			throw new Error("ntl chua tai: khong tao khi loi");
		await dongHet();

		trangThai.daGoi = [];
		datNen("DEAL", [{ key: "hien", label: "Hiện ntl" }]);
		await moSheet("DEAL");
		if (!nhanTrongForm(document).includes("Hiện ntl"))
			throw new Error("ntl chua tai: doi chung");
		expect(goiCua("deals.create").length).toBe(0);
	});
});

const MUOI_KIEU: (TruongGia & { type: Kieu })[] = [
	{ key: "chu", label: "Chữ ntl", type: "TEXT" },
	{ key: "chu_dai", label: "Chữ dài ntl", type: "LONG_TEXT" },
	{ key: "so_luong", label: "Số ntl", type: "NUMBER" },
	{ key: "ngay_ky", label: "Ngày ntl", type: "DATE" },
	{ key: "da_xac_minh", label: "Ô tích ntl", type: "CHECKBOX" },
	{
		key: "hang",
		label: "Chọn ntl",
		type: "SELECT",
		options: [
			{ id: "lc-1", label: "Vàng" },
			{ id: "lc-2", label: "Bạc" },
		],
	},
	{ key: "web", label: "Liên kết ntl", type: "URL" },
	{ key: "thu", label: "Email ntl", type: "EMAIL" },
	{ key: "dt", label: "Điện thoại ntl", type: "PHONE" },
	{ key: "nguoi_gioi_thieu", label: "Người ntl", type: "USER" },
];

const DAP_AN_MUOI = new Map<string, string | number | boolean>(
	Object.entries({
		chu: "HS-1",
		chu_dai: "Dòng một\nDòng hai",
		so_luong: 1234.5,
		ngay_ky: "2027-03-31",
		da_xac_minh: true,
		hang: "lc-2",
		web: "onehub.vn",
		thu: "an@onehub.vn",
		dt: "0901234567",
		nguoi_gioi_thieu: "u-1",
	}),
);

const NGAY_MAY_CHU = "2027-03-31T00:00:00.000Z";

function giaTriMayChu(
	kieu: Kieu,
	giaTri: string | number | boolean | undefined,
): string | number | boolean | null {
	if (giaTri === undefined) return null;
	return kieu === "DATE" ? NGAY_MAY_CHU : giaTri;
}

async function dienMuoi() {
	await go(oTheoNhan("Chữ ntl"), "HS-1");
	const chuDai = oTheoNhan("Chữ dài ntl");
	await go(chuDai, "Dòng một\nDòng hai");
	await go(oTheoNhan("Số ntl"), "1.234,5");
	await go(oTheoNhan("Ngày ntl"), "2027-03-31");
	await bam(oTheoNhan("Ô tích ntl"));
	await chon(oTheoNhan("Chọn ntl"), "lc-2");
	await go(oTheoNhan("Liên kết ntl"), "onehub.vn");
	await go(oTheoNhan("Email ntl"), "an@onehub.vn");
	await go(oTheoNhan("Điện thoại ntl"), "0901234567");
	await chon(oTheoNhan("Người ntl"), "u-1");
}

function thoaThuanCo(coGiaTri: boolean) {
	return JSON.parse(
		JSON.stringify(
			dealDetailOutput.parse({
				id: "d-moi",
				name: "Thoả thuận ntl",
				description: null,
				stage: "lead",
				currency: "VND",
				closedReason: null,
				company: {
					id: "co-1",
					name: "Công ty ntl",
					domain: null,
					iconUrl: null,
					iconDarkUrl: null,
					iconTone: null,
					logoUrl: null,
					industry: null,
				},
				owner: NGUOI[0],
				fields: MUOI_KIEU.map((t, i) => ({
					id: `f-${t.key}`,
					entity: "DEAL",
					key: t.key,
					label: t.label,
					type: t.type,
					agentFilled: false,
					agentBrief: null,
					required: false,
					showOnSheet: true,
					showOnTable: false,
					showOnFilter: false,
					position: i,
					archived: false,
					options: (t.options ?? []).map((o, j) => ({ ...o, position: j })),
					value: coGiaTri ? giaTriMayChu(t.type, DAP_AN_MUOI.get(t.key)) : null,
				})),
				amountCents: null,
				baseAmountCents: null,
				reportingCurrency: "VND",
				fxRate: null,
				fxRateAt: null,
				stageChangedAt: "2026-10-01T00:00:00.000Z",
				expectedCloseDate: null,
				closedAt: null,
				createdAt: "2026-10-01T00:00:00.000Z",
				archivedAt: null,
				contacts: [],
				archivedContacts: [],
			}),
		),
	);
}

const PHIEU_DAP_AN = {
	TEXT: (o) => o.chu === "HS-1",
	LONG_TEXT: (o) => o.chu.includes("Dòng một") && o.chu.includes("Dòng hai"),
	NUMBER: (o) => o.chu === "1.234,5",
	DATE: (o) => o.oNhap.includes("2027-03-31"),
	CHECKBOX: (o) => o.tich,
	SELECT: (o) => o.dangChon === "lc-2",
	URL: (o) => o.chu === "onehub.vn",
	EMAIL: (o) => o.chu === "an@onehub.vn",
	PHONE: (o) => o.chu.replace(/\s/g, "") === "0901234567",
	USER: (o) => o.dangChon === "u-1",
} as const satisfies Record<
	Kieu,
	(o: {
		chu: string;
		oNhap: string[];
		tich: boolean;
		dangChon: string;
	}) => boolean
>;

function phieuThieu(): string[] {
	const thieu: string[] = [];
	for (const t of MUOI_KIEU) {
		const nhan = [...document.querySelectorAll("label, span")].find(
			(l) => l.childElementCount === 0 && l.textContent?.trim() === t.label,
		);
		const hang = nhan?.parentElement;
		const o = {
			chu: (hang?.textContent ?? "")
				.replace(t.label, "")
				.replace(/\s+/g, " ")
				.trim(),
			oNhap: [...(hang?.querySelectorAll("input") ?? [])].map((x) => x.value),
			dangChon:
				hang?.querySelector("[data-select-trigger]")?.textContent?.trim() ?? "",
			tich:
				hang
					?.querySelector('[role="checkbox"]')
					?.getAttribute("aria-checked") === "true",
		};
		if (!PHIEU_DAP_AN[t.type](o)) thieu.push(t.key);
	}
	return thieu;
}

describe("ntl-gui-gia-tri", () => {
	test("muoi kieu gui dung trong mot luot tao, phieu hien du", async () => {
		datNen("DEAL", [
			...MUOI_KIEU,
			{ key: "ghi_chu_tuy", label: "Tuỳ ntl" },
			{ key: "da_ky", label: "Đã ký ntl", type: "CHECKBOX" },
		]);
		dat("deals.create", () => ({ id: "d-moi", name: "Thoả thuận A" }));
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận A");
		await dienMuoi();
		await bamTao("DEAL");
		await cho(() => goiCua("deals.create").length > 0, "deals.create");
		const lan = goiCua("deals.create");
		if (lan.length !== 1)
			throw new Error(`ntl gui gia tri: so lan ${lan.length}`);
		const gui = giaTriGui.parse(lan[0]?.dauVao?.fields ?? {});
		let soKieu = 0;
		for (const t of MUOI_KIEU) {
			if (JSON.stringify(gui[t.key]) !== JSON.stringify(DAP_AN_MUOI.get(t.key)))
				throw new Error(
					`ntl gui gia tri: ${t.type} gui ${JSON.stringify(gui[t.key])}`,
				);
			soKieu += 1;
		}
		if (soKieu !== 10) throw new Error(`ntl gui gia tri: thieu kieu ${soKieu}`);
		for (const khoa of ["ghi_chu_tuy", "da_ky"])
			if (khoa in gui)
				throw new Error(`ntl gui gia tri: gui khoa trong ${khoa}`);
		if (goiCua("deals.update").length !== 0)
			throw new Error("ntl gui gia tri: con cap nhat");
		await dongHet();

		dat("deals.byId", () => thoaThuanCo(true));
		dat("fields.layout", () => boTri("DEAL", MUOI_KIEU));
		await mo(
			<DetailSheet open onOpenChange={() => {}}>
				<DealSheet dealId="d-moi" />
			</DetailSheet>,
			{ searchParams: "record=deal:d-moi" },
		);
		await cho(
			() => document.body.textContent?.includes("Chữ ntl") === true,
			"phieu thoa thuan",
		);
		const thieu = phieuThieu();
		if (thieu.length > 0)
			throw new Error(`ntl gui gia tri: phieu thieu ${thieu.join(",")}`);
		await dongHet();
		dat("deals.byId", () => thoaThuanCo(false));
		await mo(
			<DetailSheet open onOpenChange={() => {}}>
				<DealSheet dealId="d-moi" />
			</DetailSheet>,
			{ searchParams: "record=deal:d-moi" },
		);
		await cho(
			() => document.body.textContent?.includes("Chữ ntl") === true,
			"phieu doi chung",
		);
		const muDoiChung = phieuThieu();
		if (muDoiChung.length !== MUOI_KIEU.length)
			throw new Error(
				`ntl gui gia tri: thuoc phieu mu ${MUOI_KIEU.length - muDoiChung.length}`,
			);
		await dongHet();

		trangThai.daGoi = [];
		datNen("COMPANY", [{ key: "nganh", label: "Ngành ntl" }]);
		await moSheet("COMPANY");
		await go(oTheoNhan("Tên"), "Công ty A");
		await go(oTheoNhan("Ngành ntl"), "Ngân hàng");
		await bamTao("COMPANY");
		await cho(() => goiCua("companies.create").length > 0, "companies.create");
		const congTy = goiCua("companies.create")[0]?.dauVao?.fields;
		if (JSON.stringify(congTy) !== JSON.stringify({ nganh: "Ngân hàng" }))
			throw new Error(`ntl gui gia tri: COMPANY gui ${JSON.stringify(congTy)}`);
		await dongHet();

		trangThai.daGoi = [];
		datNen("CONTACT", [
			{
				key: "kenh",
				label: "Kênh ntl",
				type: "SELECT",
				options: [{ id: "lc-zalo", label: "Zalo" }],
			},
		]);
		await moSheet("CONTACT");
		await go(oTheoNhan("Tên"), "Lan");
		await chon(oTheoNhan("Kênh ntl"), "lc-zalo");
		await bamTao("CONTACT");
		await cho(() => goiCua("contacts.create").length > 0, "contacts.create");
		const caNhan = goiCua("contacts.create")[0]?.dauVao?.fields;
		if (JSON.stringify(caNhan) !== JSON.stringify({ kenh: "lc-zalo" }))
			throw new Error(`ntl gui gia tri: CONTACT gui ${JSON.stringify(caNhan)}`);
		await dongHet();

		trangThai.daGoi = [];
		datNen("DEAL", MUOI_KIEU);
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận C");
		await go(oTheoNhan("Số ntl"), "abc");
		await bamTao("DEAL");
		if (goiCua("deals.create").length !== 0)
			throw new Error("ntl gui gia tri: doi chung sai kieu van gui");
		expect(soKieu).toBe(10);
	});
});

const HAI_BAT_BUOC: TruongGia[] = [
	{ key: "ma_ho_so", label: "Mã hồ sơ", required: true },
	{
		key: "hang_doi_tac",
		label: "Hạng đối tác",
		type: "SELECT",
		required: true,
		options: [{ id: "lc-vang", label: "Vàng" }],
	},
];

function cauDuoi(o: HTMLElement): string {
	const id = o.getAttribute("aria-describedby") ?? "";
	return document.getElementById(id)?.textContent ?? "";
}

describe("ntl-bat-buoc", () => {
	test("de trong truong bat buoc thi chan, cau duoi o, con tro ve o dau", async () => {
		const m = crmMessages("vi").truongKieu;
		datNen("DEAL", HAI_BAT_BUOC);
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận A");
		await bamTao("DEAL");
		if (goiCua("deals.create").length !== 0)
			throw new Error("ntl bat buoc: van gui");
		const ma = oTheoNhan("Mã hồ sơ");
		if (cauDuoi(ma) !== m.trong("Mã hồ sơ"))
			throw new Error(`ntl bat buoc: cau ${cauDuoi(ma)}`);
		const hang = oTheoNhan("Hạng đối tác");
		if (cauDuoi(hang) !== m.trong("Hạng đối tác"))
			throw new Error(`ntl bat buoc: cau ${cauDuoi(hang)}`);
		if (document.activeElement !== ma)
			throw new Error(`ntl bat buoc: con tro ${document.activeElement?.id}`);
		const coKhong = [
			...(hang
				.closest("[data-o-tao]")
				?.querySelectorAll("[data-select-item]") ?? []),
		].some((b) => b.textContent === crmMessages("vi").fieldValue.none);
		if (coKhong) throw new Error("ntl bat buoc: chon co khong co");

		await go(ma, "HS-1");
		await chon(hang, "lc-vang");
		await bamTao("DEAL");
		await cho(() => goiCua("deals.create").length > 0, "deals.create");
		const gui = goiCua("deals.create");
		if (
			gui.length !== 1 ||
			JSON.stringify(gui[0]?.dauVao?.fields) !==
				JSON.stringify({ ma_ho_so: "HS-1", hang_doi_tac: "lc-vang" })
		)
			throw new Error("ntl bat buoc: doi chung");
		expect(gui.length).toBe(1);
	});
});

const loiTep = z.object({
	message: z.string(),
	data: z.object({}).passthrough(),
});

function loiTuTep(tep: string): Error {
	const loi = loiTep.parse(
		JSON.parse(readFileSync(join(import.meta.dir, "fixtures", tep), "utf8")),
	);
	return Object.assign(new Error(loi.message), { data: loi.data });
}

describe("ntl-loi-may-chu", () => {
	test("may chu tu choi: toast tieng Viet, cau duoi o, giu gia tri", async () => {
		const m = crmMessages("vi").truongKieu;
		datNen("DEAL", [
			{
				key: "hang_doi_tac",
				label: "Hạng đối tác",
				type: "SELECT",
				options: [{ id: "lc-bac", label: "Bạc" }],
			},
			{ key: "ghi_chu", label: "Ghi chú ntl" },
		]);
		dat("deals.create", () => {
			throw loiTuTep("loi-tao-lua-chon.json");
		});
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận A");
		await chon(oTheoNhan("Hạng đối tác"), "lc-bac");
		await go(oTheoNhan("Ghi chú ntl"), "giữ");
		await bamTao("DEAL");
		await cho(() => toastLoi.length > 0, "toast loi");
		const mong = `${m.chuaTao.DEAL} ${m.tuChoi["lua-chon"]}`;
		if (toastLoi.length !== 1 || toastLoi[0] !== mong)
			throw new Error(`ntl loi may chu: toast ${toastLoi.join("|")}`);
		if (toastLoi[0]?.includes("has no option"))
			throw new Error("ntl loi may chu: in cau may chu");
		if (cauDuoi(oTheoNhan("Hạng đối tác")) !== m.tuChoi["lua-chon"])
			throw new Error(
				`ntl loi may chu: duoi o ${cauDuoi(oTheoNhan("Hạng đối tác"))}`,
			);
		const ten = oTheoNhan("Tên") as HTMLInputElement;
		const ghiChu = oTheoNhan("Ghi chú ntl") as HTMLInputElement;
		if (ten.value !== "Thoả thuận A")
			throw new Error("ntl loi may chu: mat gia tri name");
		if (ghiChu.value !== "giữ")
			throw new Error("ntl loi may chu: mat gia tri ghi_chu");
		if (oTheoNhan("Hạng đối tác").textContent !== "lc-bac")
			throw new Error("ntl loi may chu: mat gia tri hang_doi_tac");
		if (!document.querySelector("form#create-deal"))
			throw new Error("ntl loi may chu: dong form");
		await dongHet();

		toastDung.length = 0;
		datNen("DEAL", []);
		dat("deals.create", () => ({ id: "d-1", name: "Thoả thuận A" }));
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận A");
		await bamTao("DEAL");
		await cho(() => toastDung.length > 0, "toast thanh cong");
		await dongHet();

		toastLoi.length = 0;
		datNen("DEAL", []);
		dat("fields.list", () => {
			throw new Error("Internal");
		});
		dat("deals.create", () => {
			throw loiTuTep("loi-tao-thieu-bat-buoc.json");
		});
		await moSheet("DEAL");
		await go(oTheoNhan("Tên"), "Thoả thuận B");
		await bamTao("DEAL");
		await cho(() => toastLoi.length > 0, "toast thieu bat buoc");
		if (toastLoi[0] !== `${m.chuaTao.DEAL} ${m.trong("Mã hồ sơ")}`)
			throw new Error(`ntl loi may chu: thieu bat buoc ${toastLoi[0]}`);
		if (toastLoi[0]?.includes("is required"))
			throw new Error("ntl loi may chu: in cau may chu thieu");
		expect(toastLoi.length).toBe(1);
	});
});

describe("ntl-them-nhanh", () => {
	test("them nhanh theo cung luat, bot Cong ty, giu thay doi", async () => {
		const rs = recordSheetMessages("vi");
		const tuTao: TruongGia[] = [
			{ key: "bat_buoc", label: "Bắt buộc ntl", required: true },
			{ key: "hien", label: "Hiện ntl" },
		];
		for (const loai of ["CONTACT", "DEAL"] as const) {
			trangThai.daGoi = [];
			datNen(loai, tuTao);
			const man =
				loai === "CONTACT" ? (
					<QuickAddContact companyId="cty-1" ownerId="u-1" onDone={() => {}} />
				) : (
					<QuickAddDeal
						companyId="cty-1"
						companyName="Công ty 1"
						ownerId="u-1"
						onDone={() => {}}
					/>
				);
			await mo(man);
			await cho(
				() => nhanTrongForm(document).includes("Hiện ntl"),
				`them nhanh ${loai}`,
			);
			const dap = dapAnNhan(loai, "vi", tuTao, {}).filter(
				(n) =>
					n !== nhanTruongChuan(loai, "company", "vi") &&
					n !== dealMessages("vi").create.stage,
			);
			const nhan = nhanTrongForm(document);
			if (JSON.stringify(nhan) !== JSON.stringify(dap))
				throw new Error(`ntl them nhanh: lech ${loai} ${JSON.stringify(nhan)}`);
			if (nhan.includes(nhanTruongChuan(loai, "company", "vi")))
				throw new Error(`ntl them nhanh: thua cong ty ${loai}`);
			const chu = oTheoNhan(nhanTruongChuan(loai, "owner", "vi"));
			if (chu.textContent !== "u-1")
				throw new Error(`ntl them nhanh: chu khong san ${loai}`);

			const ten = loai === "CONTACT" ? "Tên" : "Tên";
			await go(oTheoNhan(ten), "Mới");
			const nutThem =
				loai === "CONTACT" ? rs.company.addContact : rs.deal.create;
			const bamThem = async () => {
				const nut = [
					...document.querySelectorAll<HTMLButtonElement>("button"),
				].find((b) => b.textContent?.trim() === nutThem);
				if (!nut) throw new Error("khong thay nut them");
				await bam(nut);
				await nhip(5);
			};
			await bamThem();
			const duong = loai === "CONTACT" ? "contacts.create" : "deals.create";
			if (goiCua(duong).length !== 0)
				throw new Error(`ntl them nhanh: van gui ${loai}`);
			await go(oTheoNhan("Bắt buộc ntl"), "BB");
			await go(oTheoNhan("Hiện ntl"), "H");
			await bamThem();
			await cho(() => goiCua(duong).length > 0, duong);
			const gui = goiCua(duong);
			if (
				gui.length !== 1 ||
				JSON.stringify(gui[0]?.dauVao?.fields) !==
					JSON.stringify({ bat_buoc: "BB", hien: "H" }) ||
				gui[0]?.dauVao?.companyId !== "cty-1"
			)
				throw new Error(`ntl them nhanh: gui ${loai} ${JSON.stringify(gui)}`);
			await dongHet();

			datNen(loai, tuTao);
			await mo(man);
			await cho(() => nhanTrongForm(document).includes("Hiện ntl"), "mo lai");
			await go(oTheoNhan("Hiện ntl"), "đang gõ");
			const huy = [
				...document.querySelectorAll<HTMLButtonElement>("button"),
			].find((b) => b.textContent?.trim() === crmMessages("vi").sheet.cancel);
			if (!huy) throw new Error("khong thay nut huy");
			await bam(huy);
			await nhip(5);
			if (!document.querySelector('[role="alertdialog"]'))
				throw new Error(`ntl them nhanh: khong hoi ${loai}`);
			await dongHet();

			datNen(loai, tuTao);
			await mo(man);
			await cho(() => nhanTrongForm(document).includes("Hiện ntl"), "mo lai 2");
			const huy2 = [
				...document.querySelectorAll<HTMLButtonElement>("button"),
			].find((b) => b.textContent?.trim() === crmMessages("vi").sheet.cancel);
			if (!huy2) throw new Error("khong thay nut huy");
			await bam(huy2);
			await nhip(5);
			if (document.querySelector('[role="alertdialog"]'))
				throw new Error(`ntl them nhanh: hoi thua ${loai}`);
			await dongHet();
		}
		expect(true).toBe(true);
	});
});

describe("ntl-ban-ghi-cu", () => {
	test("sua Ten tren phieu khong gui khoa truong bat buoc dang trong", async () => {
		const ban = thoaThuanCo(false);
		ban.fields = [
			{
				...ban.fields[0],
				key: "ma_ho_so",
				label: "Mã hồ sơ",
				type: "TEXT",
				required: true,
				value: null,
			},
		];
		dat("deals.byId", () => ban);
		dat("fields.layout", () =>
			boTri("DEAL", [{ key: "ma_ho_so", label: "Mã hồ sơ" }]),
		);
		dat("users.list", () => NGUOI);
		await mo(
			<DetailSheet open onOpenChange={() => {}}>
				<DealSheet dealId="d-moi" />
			</DetailSheet>,
			{ searchParams: "record=deal:d-moi" },
		);
		await cho(
			() => document.body.textContent?.includes("Mã hồ sơ") === true,
			"phieu",
		);
		const hangTen = [...document.querySelectorAll("label")].find(
			(l) => l.textContent?.trim() === "Tên",
		);
		const nutTen = hangTen?.htmlFor
			? document.getElementById(hangTen.htmlFor)
			: null;
		if (!nutTen) throw new Error("khong thay o Ten");
		await bam(nutTen);
		const oTen = document.getElementById(hangTen?.htmlFor ?? "");
		await go(oTen, "Tên mới");
		await phim(oTen, "Enter");
		await cho(() => goiCua("deals.update").length > 0, "deals.update");
		const lan = goiCua("deals.update");
		if (lan.length !== 1) throw new Error("ntl ban ghi cu: khong luu");
		const data = duLieuSua.parse(lan[0]?.dauVao?.data ?? {});
		if (data?.fields && "ma_ho_so" in data.fields)
			throw new Error("ntl ban ghi cu: gui khoa trong");

		trangThai.daGoi = [];
		const hangMa = [...document.querySelectorAll("label")].find(
			(l) => l.textContent?.trim() === "Mã hồ sơ",
		);
		const nutMa = hangMa?.htmlFor
			? document.getElementById(hangMa.htmlFor)
			: null;
		if (!nutMa) throw new Error("khong thay o Ma ho so");
		await bam(nutMa);
		const oMa = document.getElementById(hangMa?.htmlFor ?? "");
		await phim(oMa, "Enter");
		await nhip(5);
		if (goiCua("deals.update").length !== 0)
			throw new Error("ntl ban ghi cu: doi chung");
		expect(lan.length).toBe(1);
	});
});
