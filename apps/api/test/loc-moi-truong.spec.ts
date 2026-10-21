import {
	afterAll,
	beforeAll,
	describe,
	expect,
	it,
	setSystemTime,
} from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { db, type FieldEntity } from "@crm/db";
import {
	FIELD_TYPES,
	type FieldTypeName,
	TIEN_TO_COT_TRUONG,
} from "@crm/db/fields";
import {
	parseSavedViewFilters,
	type SavedViewFilters,
} from "@crm/validation/saved-view";
import type { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CampaignsService } from "../src/campaigns/campaigns.service";
import { companyListInput } from "../src/companies/companies.contracts";
import { CompaniesService } from "../src/companies/companies.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { contactListInput } from "../src/contacts/contacts.contracts";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { dealBoardInput, dealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { SavedViewsService } from "../src/saved-views/saved-views.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien } from "./phien-thu";

const RUN = (process.env.TEST_RUN_ID ?? "local")
	.replace(/[^a-z0-9]/gi, "")
	.toLowerCase()
	.slice(-10);
const quanTri = `lmt-quan-tri-${RUN}`;
const nguoiB = `lmt-nguoi-b-${RUN}`;

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
	fieldBackfillRecords: async (
		_entity: FieldEntity,
		_keys: string[],
		ids: string[],
	) => ({ queued: ids.length, merged: 0 }),
} as unknown as AgentTriggerService;

const conversion = new ConversionService(db);
const stamp = new ActivityStampService(db);
const queue = {
	queuedCompanies: async () => new Set<string>(),
} as unknown as AgentQueueService;
const fields = new FieldsService(db, agent);
const companies = new CompaniesService(
	db,
	agent,
	queue,
	{ backfill: async () => undefined } as unknown as FaviconService,
	stamp,
	conversion,
	fields,
);
const contacts = new ContactsService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	queue,
	stamp,
	fields,
);
const deals = new DealsService(db, agent, stamp, conversion, fields);
const campaigns = new CampaignsService(db, contacts);
const savedViews = new SavedViewsService(db, campaigns);

const daTao = {
	truong: [] as string[],
	congTy: [] as string[],
	nguoi: [quanTri, nguoiB] as string[],
};

async function taoTruong(
	entity: FieldEntity,
	nhan: string,
	type: FieldTypeName,
	them: { showOnFilter?: boolean; options?: string[] } = {},
) {
	const field = await fields.create(quanTri, {
		entity,
		label: nhan,
		type,
		options: (them.options ?? (type === "SELECT" ? ["A", "B", "C"] : [])).map(
			(label) => ({ label }),
		),
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: false,
		showOnFilter: them.showOnFilter ?? true,
	});
	daTao.truong.push(field.id);
	return field;
}

async function taoCongTy(ten: string): Promise<string> {
	const company = await companies.create({ name: ten });
	daTao.congTy.push(company.id);
	return company.id;
}

async function taoThoaThuan(
	tienTo: string,
	companyId: string,
	ten: string,
	them: {
		ownerId?: string;
		amountCents?: number | null;
		stage?: string;
		expectedCloseDate?: string | null;
	} = {},
): Promise<string> {
	const deal = await deals.create({
		name: `${tienTo} ${ten}`,
		companyId,
		ownerId: them.ownerId ?? quanTri,
		amountCents: them.amountCents ?? null,
		stage: them.stage,
		expectedCloseDate: them.expectedCloseDate ?? null,
	});
	return deal.id;
}

async function batDauCa(tienTo: string) {
	const [d, c, l] = await Promise.all([
		deals.list(dealListInput.parse({ q: tienTo })),
		companies.list(companyListInput.parse({ q: tienTo })),
		contacts.list(contactListInput.parse({ q: tienTo })),
	]);
	const n = d.total + c.total + l.total;
	if (n !== 0) throw new Error(`lmt ${tienTo}: lan ${n}`);
}

async function locThoaThuan(
	tienTo: string,
	fieldsLoc: Record<string, string[]>,
	them: Record<string, unknown> = {},
) {
	const out = await deals.list(
		dealListInput.parse({
			q: tienTo,
			pageSize: 100,
			fields: fieldsLoc,
			...them,
		}),
	);
	return { ids: new Set(out.rows.map((r) => r.id)), total: out.total, out };
}

function tenCua(map: Map<string, string>, ids: Iterable<string>) {
	return [...ids]
		.map((id) => map.get(id) ?? id)
		.sort()
		.join(",");
}

function cungTap(a: Set<string>, b: Set<string>) {
	return a.size === b.size && [...a].every((x) => b.has(x));
}

beforeAll(async () => {
	await gieoThanhVien(quanTri, "owner");
	await gieoThanhVien(nguoiB, "member");
});

afterAll(async () => {
	setSystemTime();
	await db.campaign.deleteMany({ where: { savedView: { ownerId: quanTri } } });
	await db.savedView.deleteMany({ where: { ownerId: quanTri } });
	await db.deal.deleteMany({ where: { companyId: { in: daTao.congTy } } });
	await db.contact.deleteMany({ where: { companyId: { in: daTao.congTy } } });
	await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
	await db.fieldDefinition.deleteMany({ where: { id: { in: daTao.truong } } });
	await db.member.deleteMany({ where: { userId: { in: daTao.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daTao.nguoi } } });
});

const KIEU_CHU = ["TEXT", "LONG_TEXT", "URL", "EMAIL", "PHONE"] as const;
const CHU_CUA = {
	T1: (g: string) => `Lmt ${g}`,
	T2: (g: string) => `${g} lmt giua`,
	T3: (g: string) => `${g} cuoi lmt`,
	T4: (g: string) => `LMT ${g}`,
	T5: (g: string) => `${g} khac`,
} as const;

describe("lmt-api-chu", () => {
	const tienTo = `lmtchu${RUN}`;
	const ten = new Map<string, string>();
	const id = new Map<string, string>();
	const khoa = new Map<string, string>();

	beforeAll(async () => {
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		for (const kieu of KIEU_CHU) {
			const f = await taoTruong("DEAL", `${tienTo} ${kieu}`, kieu);
			khoa.set(kieu, f.key);
		}
		for (const nhan of ["T1", "T2", "T3", "T4", "T5", "T6"] as const) {
			const dealId = await taoThoaThuan(tienTo, companyId, nhan, {
				ownerId: ["T1", "T2", "T6"].includes(nhan) ? nguoiB : quanTri,
			});
			ten.set(dealId, nhan);
			id.set(nhan, dealId);
			if (nhan === "T6") continue;
			const values: Record<string, string> = {};
			for (const kieu of KIEU_CHU) {
				const goc = kieu === "EMAIL" ? "a@x.vn" : "x";
				values[khoa.get(kieu) ?? ""] = CHU_CUA[nhan](goc);
			}
			await deals.update(dealId, { fields: values });
		}
		await deals.archive(id.get("T3") ?? "");
	});

	it("lmt-api-chu: chua, trong, hoac — voi moi kieu chu", async () => {
		const doiChung = await locThoaThuan(tienTo, {});
		if (doiChung.total !== 5) throw new Error("lmt api chu: doi chung");
		const coLuuTru = await locThoaThuan(tienTo, {}, { archived: true });
		const tatCa = new Set([...doiChung.ids, ...coLuuTru.ids]);
		if (tatCa.size !== 6) throw new Error("lmt api chu: doi chung");

		const dapAn = {
			has: ["T1", "T2", "T4"],
			none: ["T6"],
			"has+none": ["T1", "T2", "T4", "T6"],
		} as const;
		let soO = 0;
		for (const kieu of KIEU_CHU) {
			const k = khoa.get(kieu) ?? "";
			for (const [boLoc, gia] of [
				["has", ["has:lmt"]],
				["none", ["none"]],
				["has+none", ["has:lmt", "none"]],
			] as const) {
				const r = await locThoaThuan(tienTo, { [k]: [...gia] });
				const mong = dapAn[boLoc].join(",");
				const ra = tenCua(ten, r.ids);
				if (ra !== mong) {
					throw new Error(`lmt api chu: ${kieu} ${boLoc} ra ${ra}`);
				}
				if (r.total !== dapAn[boLoc].length) {
					throw new Error(`lmt api chu: total ${kieu} ${boLoc} ${r.total}`);
				}
				soO += 1;
			}
		}
		if (soO !== 15) throw new Error(`lmt api chu: thieu o ${soO}`);

		const kText = khoa.get("TEXT") ?? "";
		const vaOwner = await locThoaThuan(
			tienTo,
			{ [kText]: ["has:lmt"] },
			{ owner: [nguoiB] },
		);
		if (tenCua(ten, vaOwner.ids) !== "T1,T2") {
			throw new Error("lmt api chu: va owner");
		}
		const luuTru = await locThoaThuan(
			tienTo,
			{ [kText]: ["has:lmt"] },
			{ archived: true },
		);
		if (tenCua(ten, luuTru.ids) !== "T3")
			throw new Error("lmt api chu: luu tru");
		expect(soO).toBe(15);
	});
});

describe("lmt-api-so", () => {
	const tienTo = `lmtso${RUN}`;
	const giaCua = new Map<string, string>();
	let khoa = "";

	beforeAll(async () => {
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		const f = await taoTruong("DEAL", `${tienTo} so`, "NUMBER");
		khoa = f.key;
		for (const gia of [-3, 0, 4.5, 5, 12.25, 20, 21, null]) {
			const nhan = gia === null ? "trong" : String(gia);
			const dealId = await taoThoaThuan(tienTo, companyId, nhan);
			giaCua.set(dealId, nhan);
			if (gia !== null) await deals.update(dealId, { fields: { [khoa]: gia } });
		}
	});

	it("lmt-api-so: khoang hai dau, mot dau, bien, trong", async () => {
		const doiChung = await locThoaThuan(tienTo, { [khoa]: ["gte:-1000"] });
		if (doiChung.total !== 7) throw new Error("lmt api so: doi chung");

		const ca: Array<[string[], string[]]> = [
			[
				["gte:5", "lte:20"],
				["12.25", "20", "5"],
			],
			[["gte:5"], ["12.25", "20", "21", "5"]],
			[["lte:0"], ["-3", "0"]],
			[["gte:4.5", "lte:4.5"], ["4.5"]],
			[
				["gte:21", "none"],
				["21", "trong"],
			],
			[["gte:30", "lte:1"], []],
		];
		let soO = 0;
		for (const [boLoc, mong] of ca) {
			const r = await locThoaThuan(tienTo, { [khoa]: boLoc });
			const ra = tenCua(giaCua, r.ids);
			if (ra !== [...mong].sort().join(",")) {
				throw new Error(`lmt api so: [${boLoc.join(",")}] ra ${ra}`);
			}
			if (r.total !== mong.length) {
				throw new Error(`lmt api so: total [${boLoc.join(",")}] ${r.total}`);
			}
			soO += 1;
		}
		if (soO !== 6) throw new Error(`lmt api so: thieu o ${soO}`);
		expect(soO).toBe(6);
	});
});

describe("lmt-api-ngay-tich", () => {
	const tienTo = `lmtngay${RUN}`;
	const ten = new Map<string, string>();
	let khoaNgay = "";
	let khoaTich = "";
	let giaiDoanChot = "";

	beforeAll(async () => {
		setSystemTime(new Date(2026, 10, 15, 10, 0, 0));
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		khoaNgay = (await taoTruong("DEAL", `${tienTo} ngay`, "DATE")).key;
		khoaTich = (await taoTruong("DEAL", `${tienTo} tich`, "CHECKBOX")).key;
		const chot = await db.dealStage.findFirst({ where: { kind: "WON" } });
		giaiDoanChot = chot?.id ?? "";
		const ngay: Array<[string, string | null, string | undefined]> = [
			["homqua", "2026-11-14", undefined],
			["homqua-chot", "2026-11-14", giaiDoanChot],
			["dau-thang", "2026-11-01", undefined],
			["cuoi-thang", "2026-11-30", undefined],
			["dau-thang-sau", "2026-12-01", undefined],
			["cuoi-thang-sau", "2026-12-31", undefined],
			["thang-ke", "2027-01-01", undefined],
			["trong", null, undefined],
		];
		for (const [nhan, gia, stage] of ngay) {
			const dealId = await taoThoaThuan(tienTo, companyId, nhan, {
				stage,
				expectedCloseDate: gia,
			});
			ten.set(dealId, nhan);
			if (gia) await deals.update(dealId, { fields: { [khoaNgay]: gia } });
		}
		for (const [nhan, gia] of [
			["D1", true],
			["D2", false],
			["D3", null],
		] as const) {
			const dealId = await taoThoaThuan(tienTo, companyId, nhan);
			ten.set(dealId, nhan);
			if (gia !== null) {
				await deals.update(dealId, { fields: { [khoaTich]: gia } });
			}
		}
	});

	afterAll(() => {
		setSystemTime();
	});

	it("lmt-api-ngay-tich: moc nhu Ngay chot, trong, Co/Khong", async () => {
		if (!giaiDoanChot)
			throw new Error("lmt api ngay tich: thieu giai doan WON");
		const NGAY = [
			"homqua",
			"homqua-chot",
			"dau-thang",
			"cuoi-thang",
			"dau-thang-sau",
			"cuoi-thang-sau",
			"thang-ke",
			"trong",
		];
		const ca: Array<[string, string, string[], string[]]> = [
			[
				khoaNgay,
				"overdue",
				["overdue"],
				["dau-thang", "homqua", "homqua-chot"],
			],
			[
				khoaNgay,
				"this-month",
				["this-month"],
				["cuoi-thang", "dau-thang", "homqua", "homqua-chot"],
			],
			[
				khoaNgay,
				"next-month",
				["next-month"],
				["cuoi-thang-sau", "dau-thang-sau"],
			],
			[khoaNgay, "later", ["later"], ["thang-ke"]],
			[
				khoaNgay,
				"overdue+later",
				["overdue", "later"],
				["dau-thang", "homqua", "homqua-chot", "thang-ke"],
			],
			[khoaNgay, "none", ["none"], ["D1", "D2", "D3", "trong"]],
			[khoaTich, "yes", ["yes"], ["D1"]],
			[khoaTich, "no", ["no"], [...NGAY, "D2", "D3"]],
		];
		let soO = 0;
		for (const [k, nhan, gia, mong] of ca) {
			const r = await locThoaThuan(tienTo, { [k]: gia });
			const ra = tenCua(ten, r.ids);
			if (ra !== [...mong].sort().join(",")) {
				throw new Error(`lmt api ngay tich: ${nhan} ra ${ra}`);
			}
			soO += 1;
		}
		if (soO !== 8) throw new Error(`lmt api ngay tich: thieu o ${soO}`);

		const chuan = await locThoaThuan(tienTo, {}, { closing: ["this-month"] });
		const tuTao = await locThoaThuan(tienTo, { [khoaNgay]: ["this-month"] });
		if (!cungTap(chuan.ids, tuTao.ids)) {
			throw new Error("lmt api ngay tich: lech ngay chot");
		}
		expect(soO).toBe(8);
	});
});

describe("lmt-api-trong", () => {
	const tienTo = `lmttrong${RUN}`;
	const KIEU = [
		"TEXT",
		"LONG_TEXT",
		"URL",
		"EMAIL",
		"PHONE",
		"NUMBER",
		"DATE",
		"SELECT",
		"USER",
	] as const;
	const nguoiXoa = `lmt-nguoi-xoa-${RUN}`;
	const giaCo: Record<(typeof KIEU)[number], string | number> = {
		TEXT: "co",
		LONG_TEXT: "co dai",
		URL: "co.vn",
		EMAIL: "co@x.vn",
		PHONE: "0901",
		NUMBER: 7,
		DATE: "2026-05-05",
		SELECT: "",
		USER: quanTri,
	};
	const khoa = new Map<string, string>();
	const lua = new Map<string, string>();
	const o: Array<{ kieu: string; dang: string; dealId: string }> = [];
	const coGia = new Map<string, string>();
	let luaA = "";
	let coB = "";

	beforeAll(async () => {
		await batDauCa(tienTo);
		await gieoThanhVien(nguoiXoa, "member");
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		for (const kieu of KIEU) {
			const f = await taoTruong("DEAL", `${tienTo} ${kieu}`, kieu);
			khoa.set(kieu, f.key);
			if (kieu === "SELECT") {
				for (const opt of f.options) lua.set(opt.label, opt.id);
				luaA = lua.get("A") ?? "";
			}
		}
		const giaCua = (kieu: (typeof KIEU)[number]): string | number =>
			kieu === "SELECT" ? luaA : giaCo[kieu];

		for (const kieu of KIEU) {
			const k = khoa.get(kieu) ?? "";
			const coId = await taoThoaThuan(tienTo, companyId, `co-${kieu}`);
			await deals.update(coId, { fields: { [k]: giaCua(kieu) } });
			coGia.set(kieu, coId);

			const chuaTung = await taoThoaThuan(tienTo, companyId, `chua-${kieu}`);
			o.push({ kieu, dang: "chua tung co hang", dealId: chuaTung });

			const xoa = await taoThoaThuan(tienTo, companyId, `xoa-${kieu}`);
			await deals.update(xoa, { fields: { [k]: giaCua(kieu) } });
			await deals.update(xoa, { fields: { [k]: null } });
			o.push({ kieu, dang: "xoa qua update", dealId: xoa });

			if ((KIEU_CHU as readonly string[]).includes(kieu)) {
				const rong = await taoThoaThuan(tienTo, companyId, `rong-${kieu}`);
				await deals.update(rong, { fields: { [k]: giaCua(kieu) } });
				await deals.update(rong, { fields: { [k]: "   " } });
				o.push({ kieu, dang: "chuoi rong", dealId: rong });
			}
		}

		coB = await taoThoaThuan(tienTo, companyId, "co-B");
		await deals.update(coB, {
			fields: { [khoa.get("SELECT") ?? ""]: lua.get("B") ?? "" },
		});

		const setNullChon = await taoThoaThuan(tienTo, companyId, "setnull-SELECT");
		await deals.update(setNullChon, {
			fields: { [khoa.get("SELECT") ?? ""]: lua.get("C") ?? "" },
		});
		await db.fieldOption.delete({ where: { id: lua.get("C") ?? "" } });
		o.push({ kieu: "SELECT", dang: "setnull", dealId: setNullChon });

		const setNullNguoi = await taoThoaThuan(tienTo, companyId, "setnull-USER");
		await deals.update(setNullNguoi, {
			fields: { [khoa.get("USER") ?? ""]: nguoiXoa },
		});
		await db.member.deleteMany({ where: { userId: nguoiXoa } });
		await db.user.delete({ where: { id: nguoiXoa } });
		o.push({ kieu: "USER", dang: "setnull", dealId: setNullNguoi });
	});

	it("lmt-api-trong: ma tran 25 o, ca hai dang trong", async () => {
		let soO = 0;
		for (const { kieu, dang, dealId } of o) {
			const k = khoa.get(kieu) ?? "";
			const hang = await db.fieldValue.findMany({
				where: { dealId, field: { key: k } },
			});
			console.log(
				`lmt api trong: ${kieu} ${dang} hang=${JSON.stringify(hang.map((h) => ({ text: h.text, number: h.number, date: h.date, optionId: h.optionId, userId: h.userId })))}`,
			);
			if (dang === "setnull" && hang.length !== 1) {
				throw new Error(`lmt api trong: fixture mot dang ${kieu}`);
			}
			const r = await locThoaThuan(tienTo, { [k]: ["none"] });
			if (!r.ids.has(dealId))
				throw new Error(`lmt api trong: ${kieu} ${dang} sot`);
			if (r.ids.has(coGia.get(kieu) ?? "")) {
				throw new Error(`lmt api trong: ${kieu} thua co gia tri`);
			}
			soO += 1;
		}
		if (soO !== 25) throw new Error(`lmt api trong: thieu o ${soO}`);

		const kChon = khoa.get("SELECT") ?? "";
		const coA = coGia.get("SELECT") ?? "";
		const tatCa = (await locThoaThuan(tienTo, {})).ids;
		const trong = await locThoaThuan(tienTo, { [kChon]: ["none"] });
		const mongTrong = new Set(
			[...tatCa].filter((id) => id !== coA && id !== coB),
		);
		if (!cungTap(trong.ids, mongTrong)) {
			throw new Error("lmt api trong: SELECT none tap");
		}
		const hoac = await locThoaThuan(tienTo, { [kChon]: ["none", luaA] });
		const mongHoac = new Set([...tatCa].filter((id) => id !== coB));
		if (!cungTap(hoac.ids, mongHoac)) {
			throw new Error("lmt api trong: none hoac id");
		}
		const chiA = await locThoaThuan(tienTo, { [kChon]: [luaA] });
		if (!cungTap(chiA.ids, new Set([coA])))
			throw new Error("lmt api trong: id doi ket qua");
		expect(soO).toBe(25);
	});
});

describe("lmt-api-khoa-chet", () => {
	const tienTo = `lmtkc${RUN}`;
	const k = { song: "", tat: "", luu: "", lh: "", so: "", ngay: "", tich: "" };
	const dapAnTat = new Set<string>();

	beforeAll(async () => {
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		k.song = (await taoTruong("DEAL", `${tienTo} song`, "TEXT")).key;
		k.tat = (
			await taoTruong("DEAL", `${tienTo} tat`, "NUMBER", {
				showOnFilter: false,
			})
		).key;
		const luu = await taoTruong("DEAL", `${tienTo} luu`, "TEXT");
		k.luu = luu.key;
		k.lh = (await taoTruong("CONTACT", `${tienTo} lh`, "TEXT")).key;
		k.so = (await taoTruong("DEAL", `${tienTo} so`, "NUMBER")).key;
		k.ngay = (await taoTruong("DEAL", `${tienTo} ngay`, "DATE")).key;
		k.tich = (await taoTruong("DEAL", `${tienTo} tich`, "CHECKBOX")).key;
		for (const i of [1, 2, 3, 4, 5]) {
			const dealId = await taoThoaThuan(tienTo, companyId, `B${i}`);
			await deals.update(dealId, {
				fields: { [k.song]: i % 2 ? "x" : "y", [k.tat]: i, [k.luu]: "x" },
			});
			if (i >= 5) dapAnTat.add(dealId);
		}
		await fields.archive(quanTri, luu.id);
	});

	it("lmt-api-khoa-chet: khoa chet bo qua, truong tat theo Hoi-5, gia tri hong nem", async () => {
		const goc = await locThoaThuan(tienTo, {});
		const gocBang = await deals.board(dealBoardInput.parse({ q: tienTo }));
		const idsBang = (b: typeof gocBang) =>
			new Set(b.columns.flatMap((c) => c.cards.map((card) => card.id)));

		let soO = 0;
		for (const khoa of ["khong_co", k.luu, k.lh, ""]) {
			const loc = { [khoa]: ["has:x"] };
			const thuTuc: Array<[string, () => Promise<Set<string>>, Set<string>]> = [
				[
					"deals.list",
					async () => (await locThoaThuan(tienTo, loc)).ids,
					goc.ids,
				],
				[
					"deals.board",
					async () =>
						idsBang(
							await deals.board(
								dealBoardInput.parse({ q: tienTo, fields: loc }),
							),
						),
					idsBang(gocBang),
				],
				[
					"companies.list",
					async () =>
						new Set(
							(
								await companies.list(
									companyListInput.parse({ q: tienTo, fields: loc }),
								)
							).rows.map((r) => r.id),
						),
					new Set(
						(
							await companies.list(companyListInput.parse({ q: tienTo }))
						).rows.map((r) => r.id),
					),
				],
				[
					"contacts.list",
					async () =>
						new Set(
							(
								await contacts.list(
									contactListInput.parse({ q: tienTo, fields: loc }),
								)
							).rows.map((r) => r.id),
						),
					new Set(
						(
							await contacts.list(contactListInput.parse({ q: tienTo }))
						).rows.map((r) => r.id),
					),
				],
			];
			for (const [ten, goi, mong] of thuTuc) {
				let ra: Set<string>;
				try {
					ra = await goi();
				} catch (error) {
					throw new Error(
						`lmt api khoa chet: ${khoa} ${ten} nem ${(error as Error).name}`,
					);
				}
				if (!cungTap(ra, mong))
					throw new Error(`lmt api khoa chet: ${khoa} ${ten} tap`);
				soO += 1;
			}
		}
		if (soO !== 16) throw new Error(`lmt api khoa chet: thieu o ${soO}`);

		const tat = await locThoaThuan(tienTo, { [k.tat]: ["gte:5"] });
		if (!cungTap(tat.ids, goc.ids)) {
			throw new Error("lmt api khoa chet: tat doi ket qua");
		}

		for (const [khoa, gia] of [
			[k.so, "gte:abc"],
			[k.ngay, "has:x"],
			[k.tich, "maybe"],
		] as const) {
			let loi: Error | null = null;
			try {
				await locThoaThuan(tienTo, { [khoa]: [gia] });
			} catch (error) {
				loi = error as Error;
			}
			if (loi?.name !== "BadRequestException") {
				throw new Error(`lmt api khoa chet: hong khong nem ${khoa}`);
			}
			if (!loi.message.includes(khoa)) {
				throw new Error(`lmt api khoa chet: hong khong neu ten ${khoa}`);
			}
		}

		const song = await locThoaThuan(tienTo, { [k.song]: ["has:x"] });
		if (cungTap(song.ids, goc.ids))
			throw new Error("lmt api khoa chet: thuoc mu");

		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			for (const type of FIELD_TYPES) {
				await taoTruong(entity, `${tienTo} loc ${entity} ${type}`, type);
			}
			const loc = await fields.filters(entity);
			const kieuRa = new Set(
				loc
					.filter((f) => f.label.startsWith(`${tienTo} loc ${entity}`))
					.map((f) => f.type),
			);
			for (const type of FIELD_TYPES) {
				if (!kieuRa.has(type)) {
					throw new Error(`lmt api khoa chet: filters thieu ${type}`);
				}
			}
		}
		expect(soO).toBe(16);
	});
});

describe("lmt-api-cty-lh-bang", () => {
	const tienTo = `lmtcl${RUN}`;
	const ten = new Map<string, string>();
	const khoa: Record<string, Record<string, string>> = {};
	const khoaDeal = { so: "", chu: "", ngay: "", tich: "", chon: "" };
	const giaiDoan: string[] = [];
	const theBang = new Map<
		string,
		{ stage: string; amount: number; so: number }
	>();

	beforeAll(async () => {
		setSystemTime(new Date(2026, 10, 15, 10, 0, 0));
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty me`);
		for (const entity of ["COMPANY", "CONTACT"] as const) {
			khoa[entity] = {};
			for (const type of ["TEXT", "NUMBER", "DATE", "CHECKBOX"] as const) {
				const f = await taoTruong(entity, `${tienTo} ${entity} ${type}`, type);
				(khoa[entity] as Record<string, string>)[type] = f.key;
			}
		}
		const giaTri = {
			C1: { TEXT: "Lmt dau", NUMBER: 3, DATE: "2026-11-02", CHECKBOX: true },
			C2: { TEXT: "giua lmt", NUMBER: 7, DATE: "2026-12-02", CHECKBOX: false },
			C3: { TEXT: "khac", NUMBER: 12, DATE: "2026-11-20", CHECKBOX: null },
			C4: { TEXT: null, NUMBER: null, DATE: null, CHECKBOX: true },
			C5: { TEXT: "nua", NUMBER: 20, DATE: "2027-02-01", CHECKBOX: null },
		} as const;
		for (const [nhan, gia] of Object.entries(giaTri)) {
			const giaCo = (entity: "COMPANY" | "CONTACT") =>
				Object.fromEntries(
					Object.entries(gia)
						.filter(([, v]) => v !== null)
						.map(([type, v]) => [
							(khoa[entity] as Record<string, string>)[type] ?? "",
							v as string | number | boolean,
						]),
				);
			const cty = await companies.create({ name: `${tienTo} ${nhan}` });
			daTao.congTy.push(cty.id);
			ten.set(cty.id, nhan);
			await companies.update(cty.id, { fields: giaCo("COMPANY") });
			const lh = await contacts.create({
				firstName: nhan,
				lastName: tienTo,
				companyId,
			});
			ten.set(lh.id, nhan);
			await contacts.update(lh.id, { fields: giaCo("CONTACT") });
		}

		const stages = await db.dealStage.findMany({
			where: { archivedAt: null, kind: "OPEN" },
			orderBy: { position: "asc" },
			take: 2,
		});
		for (const s of stages) giaiDoan.push(s.id);
		khoaDeal.so = (await taoTruong("DEAL", `${tienTo} bang so`, "NUMBER")).key;
		khoaDeal.chu = (await taoTruong("DEAL", `${tienTo} dem chu`, "TEXT")).key;
		khoaDeal.ngay = (await taoTruong("DEAL", `${tienTo} dem ngay`, "DATE")).key;
		khoaDeal.tich = (
			await taoTruong("DEAL", `${tienTo} dem tich`, "CHECKBOX")
		).key;
		const chon = await taoTruong("DEAL", `${tienTo} dem chon`, "SELECT");
		khoaDeal.chon = chon.key;
		const luaA = chon.options.find((o) => o.label === "A")?.id ?? "";
		let i = 0;
		for (const stage of giaiDoan) {
			for (const so of [1, 5, 9, 2, 30]) {
				i += 1;
				const amount = 1000 * i;
				const dealId = await taoThoaThuan(
					tienTo,
					companyId,
					`G${stage}-${so}`,
					{
						stage,
						amountCents: amount,
						ownerId: i % 2 ? nguoiB : quanTri,
					},
				);
				theBang.set(dealId, { stage, amount, so });
				await deals.update(dealId, {
					fields: {
						[khoaDeal.so]: so,
						...(i % 3 ? { [khoaDeal.chu]: "x" } : {}),
						...(i % 4
							? { [khoaDeal.ngay]: i % 2 ? "2026-11-03" : "2026-12-09" }
							: {}),
						...(i % 2 ? { [khoaDeal.tich]: true } : {}),
						...(i % 5 ? { [khoaDeal.chon]: luaA } : {}),
					},
				});
			}
		}
	});

	afterAll(() => {
		setSystemTime();
	});

	it("lmt-api-cty-lh-bang: cung luat o Cong ty, Lien he, bang cot va so dem", async () => {
		const ca: Array<[string, string, string[], string[]]> = [
			["TEXT", "has", ["has:lmt"], ["C1", "C2"]],
			["NUMBER", "khoang", ["gte:5", "lte:20"], ["C2", "C3", "C5"]],
			["NUMBER", "none", ["none"], ["C4"]],
			["DATE", "this-month", ["this-month"], ["C1", "C3"]],
			["CHECKBOX", "no", ["no"], ["C2", "C3", "C5"]],
		];
		let soO = 0;
		for (const entity of ["COMPANY", "CONTACT"] as const) {
			for (const [type, nhan, gia, mong] of ca) {
				const loc = {
					[(khoa[entity] as Record<string, string>)[type] ?? ""]: gia,
				};
				const rows =
					entity === "COMPANY"
						? (
								await companies.list(
									companyListInput.parse({ q: tienTo, fields: loc }),
								)
							).rows
						: (
								await contacts.list(
									contactListInput.parse({ q: tienTo, fields: loc }),
								)
							).rows;
				const ra = tenCua(
					ten,
					rows.map((r) => r.id).filter((id) => ten.has(id)),
				);
				if (ra !== mong.join(",")) {
					throw new Error(`lmt api cty lh: ${entity} ${type} ${nhan} ra ${ra}`);
				}
				soO += 1;
			}
		}
		if (soO !== 10) throw new Error(`lmt api cty lh: thieu o ${soO}`);

		const bang = await deals.board(
			dealBoardInput.parse({ q: tienTo, fields: { [khoaDeal.so]: ["gte:5"] } }),
		);
		for (const stage of giaiDoan) {
			const cot = bang.columns.find((c) => c.stage === stage);
			const mong = [...theBang.entries()].filter(
				([, v]) => v.stage === stage && v.so >= 5,
			);
			const ra = new Set(cot?.cards.map((c) => c.id) ?? []);
			if (!cungTap(ra, new Set(mong.map(([id]) => id)))) {
				throw new Error(`lmt api board: ${stage} ra ${[...ra].length}`);
			}
			const tong = mong.reduce((n, [, v]) => n + v.amount, 0);
			if (cot?.count !== mong.length || cot?.valueCents !== tong) {
				throw new Error(`lmt api board: dem ${stage} ${cot?.count}`);
			}
		}

		const goc = await deals.list(
			dealListInput.parse({ q: tienTo, pageSize: 100 }),
		);
		const theoOwner = await deals.list(
			dealListInput.parse({ q: tienTo, owner: [nguoiB], pageSize: 100 }),
		);
		const demCua = (out: typeof goc, k: string, gia: string) =>
			(out.facetCounts as Record<string, Record<string, number>>)[
				`field:${k}`
			]?.[gia];
		const giaTriCua: Record<string, string[]> = {
			[khoaDeal.chu]: ["none"],
			[khoaDeal.so]: ["none"],
			[khoaDeal.ngay]: ["overdue", "this-month", "next-month", "later", "none"],
			[khoaDeal.tich]: ["yes", "no"],
			[khoaDeal.chon]: ["none"],
		};
		let soDem = 0;
		for (const [k, cacGia] of Object.entries(giaTriCua)) {
			for (const gia of cacGia) {
				const dem = demCua(goc, k, gia);
				if (dem === undefined)
					throw new Error(`lmt api dem: thieu ${k} ${gia}`);
				const loc = await deals.list(
					dealListInput.parse({ q: tienTo, fields: { [k]: [gia] } }),
				);
				if (dem !== loc.total) {
					throw new Error(`lmt api dem: ${k} ${gia} ${dem} ${loc.total}`);
				}
				if (demCua(theoOwner, k, gia) !== dem) {
					throw new Error("lmt api dem: lech luat dem chuan");
				}
				soDem += 1;
			}
		}
		if (soDem !== 10) throw new Error(`lmt api dem: thieu o ${soDem}`);
		const ownerChuan = goc.facetCounts.owner;
		if (
			JSON.stringify(theoOwner.facetCounts.owner) !== JSON.stringify(ownerChuan)
		) {
			throw new Error("lmt api dem: doi chung luat dem chuan");
		}
		expect(soO).toBe(10);
	});
});

const KHUON_CU = JSON.parse(
	readFileSync(
		path.join(
			import.meta.dir,
			"../../../_acceptance/loc-moi-truong/rang/khuon-cu.json",
		),
		"utf8",
	),
) as {
	sha: string;
	bo: Array<{ ten: string; entity: string; filters: SavedViewFilters }>;
};

function thayCho(filters: SavedViewFilters, thay: Record<string, string>) {
	let chu = JSON.stringify(filters);
	for (const [k, v] of Object.entries(thay)) chu = chu.split(k).join(v);
	return parseSavedViewFilters(JSON.parse(chu));
}

function lienHeTheoBoLoc(filters: SavedViewFilters) {
	const fieldsLoc: Record<string, string[]> = {};
	const mat: Record<string, string[]> = {};
	for (const [k, v] of Object.entries(filters.filters)) {
		if (k.startsWith(TIEN_TO_COT_TRUONG)) {
			fieldsLoc[k.slice(TIEN_TO_COT_TRUONG.length)] = v;
		} else mat[k] = v;
	}
	return contacts.list(
		contactListInput.parse({
			q: filters.q,
			sort: filters.sort,
			dir: filters.dir,
			archived: filters.archived,
			pageSize: 100,
			...mat,
			fields: fieldsLoc,
		}),
	);
}

describe("lmt-api-da-luu", () => {
	const tienTo = `lmtdl${RUN}`;
	const nguoiU = `lmt-nguoi-u-${RUN}`;
	const ten = new Map<string, string>();
	const thay: Record<string, string> = {};
	let tat = { id: "", key: "" };
	const k = { chu: "", so: "", ngay: "" };

	beforeAll(async () => {
		setSystemTime(new Date(2026, 10, 15, 10, 0, 0));
		await batDauCa(tienTo);
		await gieoThanhVien(nguoiU, "member");
		daTao.nguoi.push(nguoiU);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		const chon = await taoTruong("CONTACT", `${tienTo} dl chon`, "SELECT", {
			options: ["A", "B"],
		});
		const nguoi = await taoTruong("CONTACT", `${tienTo} dl nguoi`, "USER");
		const tatF = await taoTruong("CONTACT", `${tienTo} dl tat`, "SELECT", {
			options: ["A", "B"],
		});
		tat = { id: tatF.id, key: tatF.key };
		k.chu = (await taoTruong("CONTACT", `${tienTo} dl chu`, "TEXT")).key;
		k.so = (await taoTruong("CONTACT", `${tienTo} dl so`, "NUMBER")).key;
		k.ngay = (await taoTruong("CONTACT", `${tienTo} dl ngay`, "DATE")).key;
		const A = chon.options.find((o) => o.label === "A")?.id ?? "";
		const B = chon.options.find((o) => o.label === "B")?.id ?? "";
		const tatA = tatF.options.find((o) => o.label === "A")?.id ?? "";
		Object.assign(thay, {
			__Q__: tienTo,
			__B__: nguoiB,
			__CHON__: chon.key,
			__NGUOI__: nguoi.key,
			__A__: A,
			__U__: nguoiU,
			__TAT__: tatF.key,
			__A_TAT__: tatA,
		});
		const hang: Array<
			[
				string,
				string | null,
				string,
				string | null,
				boolean,
				Record<string, unknown>,
			]
		> = [
			[
				"L1",
				nguoiB,
				A,
				nguoiU,
				true,
				{ [k.chu]: "co x", [k.so]: 9, [k.ngay]: "2026-11-20" },
			],
			["L2", null, A, nguoiU, false, { [k.chu]: "x", [k.so]: 2 }],
			["L3", quanTri, A, nguoiU, true, { [k.ngay]: "2026-12-01" }],
			["L4", nguoiB, B, nguoiU, false, { [k.chu]: "khong" }],
			["L5", nguoiB, A, null, true, { [k.so]: 50 }],
			["L6", null, A, nguoiU, false, {}],
		];
		for (const [nhan, owner, giaChon, giaNguoi, coTat, them] of hang) {
			const lh = await contacts.create({
				firstName: nhan,
				lastName: tienTo,
				companyId,
				ownerId: owner,
			});
			ten.set(lh.id, nhan);
			await contacts.update(lh.id, {
				fields: {
					[chon.key]: giaChon,
					...(giaNguoi ? { [nguoi.key]: giaNguoi } : {}),
					...(coTat ? { [tatF.key]: tatA } : {}),
					...(them as Record<string, string | number>),
				},
			});
		}
	});

	afterAll(() => {
		setSystemTime();
	});

	it("lmt-api-da-luu: bo loc da luu khuon cu va chien dich giu ket qua", async () => {
		if (!KHUON_CU.sha.startsWith("c6a718f3d") || KHUON_CU.bo.length !== 2) {
			throw new Error("lmt api da luu: khuon cu sha");
		}
		for (const bo of KHUON_CU.bo) {
			const khoa = Object.keys(bo.filters.filters);
			if (!khoa.some((x) => x.startsWith(TIEN_TO_COT_TRUONG))) {
				throw new Error(`lmt api da luu: khuon cu thieu tien to ${bo.ten}`);
			}
		}
		const [boChon, boTat] = KHUON_CU.bo;
		const viewChon = await savedViews.create(
			{
				entity: "CONTACT",
				name: `${tienTo} chon`,
				shared: false,
				filters: thayCho(boChon?.filters as SavedViewFilters, thay),
			},
			quanTri,
		);
		const viewTat = await savedViews.create(
			{
				entity: "CONTACT",
				name: `${tienTo} tat`,
				shared: false,
				filters: thayCho(boTat?.filters as SavedViewFilters, thay),
			},
			quanTri,
		);
		const chup = async () =>
			JSON.stringify(
				await db.savedView.findMany({
					where: { ownerId: quanTri },
					select: { id: true, filters: true, updatedAt: true },
					orderBy: { id: "asc" },
				}),
			);
		const truoc = await chup();

		const docLai = (await savedViews.list("CONTACT", quanTri)).find(
			(v) => v.id === viewChon.id,
		);
		const mongChon = "L1,L2,L6";
		const ra = await lienHeTheoBoLoc(docLai?.filters as SavedViewFilters);
		if (
			tenCua(
				ten,
				ra.rows.map((r) => r.id),
			) !== mongChon
		) {
			throw new Error(
				`lmt api da luu: CONTACT ra ${tenCua(
					ten,
					ra.rows.map((r) => r.id),
				)}`,
			);
		}

		const chienDich = await campaigns.create(
			{ name: `${tienTo} cd`, savedViewId: viewChon.id },
			quanTri,
		);
		const tv = await campaigns.members({
			id: chienDich.id,
			page: 1,
			pageSize: 50,
			uncalledOnly: false,
			q: "",
		});
		if (
			tv.total !== 3 ||
			tenCua(
				ten,
				tv.rows.map((r) => r.id),
			) !== mongChon
		) {
			throw new Error(`lmt api da luu: chien dich cu ${tv.total}`);
		}

		await fields.update(quanTri, tat.id, { showOnFilter: false });
		const demTat = await campaigns.memberCount(viewTat.filters);
		if (demTat !== 6) throw new Error(`lmt api da luu: truong tat ${demTat}`);

		const viewMoi = await savedViews.create(
			{
				entity: "CONTACT",
				name: `${tienTo} moi`,
				shared: false,
				filters: parseSavedViewFilters({
					q: tienTo,
					filters: {
						[`field:${k.chu}`]: ["has:x"],
						[`field:${k.so}`]: ["gte:5"],
						[`field:${k.ngay}`]: ["this-month", "none"],
					},
				}),
			},
			quanTri,
		);
		const moi = await campaigns.memberCount(viewMoi.filters);
		const moiList = await lienHeTheoBoLoc(viewMoi.filters);
		if (moi !== moiList.total || moi === 0) {
			throw new Error(`lmt api da luu: chien dich moi ${moi} ${moiList.total}`);
		}

		const banSao = parseSavedViewFilters({
			...docLai?.filters,
			filters: { ...docLai?.filters.filters, owner: [] },
		});
		const raSao = await lienHeTheoBoLoc(banSao);
		if (
			tenCua(
				ten,
				raSao.rows.map((r) => r.id),
			) === mongChon
		) {
			throw new Error("lmt api da luu: thuoc mu");
		}

		const truocCu = JSON.parse(truoc) as Array<{ id: string }>;
		const sauDu = JSON.parse(await chup()) as Array<{ id: string }>;
		for (const dong of truocCu) {
			const ban = sauDu.find((x) => x.id === dong.id);
			if (JSON.stringify(ban) !== JSON.stringify(dong)) {
				throw new Error(`lmt api da luu: ghi de ${dong.id}`);
			}
		}
		expect(truocCu.length).toBe(2);
	});
});
