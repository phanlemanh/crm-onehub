import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db, type FieldEntity } from "@crm/db";
import type { FieldTypeName } from "@crm/db/fields";
import { savedViewFilters } from "@crm/validation/saved-view";
import type { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { CampaignsService } from "../src/campaigns/campaigns.service";
import { companyListInput } from "../src/companies/companies.contracts";
import { CompaniesService } from "../src/companies/companies.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { contactListInput } from "../src/contacts/contacts.contracts";
import { ContactsService } from "../src/contacts/contacts.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DEAL_BOARD } from "../src/deals/deal-board-config";
import {
	dealBoardInput,
	dealBoardOutput,
	dealListInput,
} from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { SavedViewsService } from "../src/saved-views/saved-views.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien } from "./phien-thu";

const RUN = (process.env.TEST_RUN_ID ?? "local")
	.replace(/[^a-z0-9]/gi, "")
	.toLowerCase()
	.slice(-10);
const quanTri = `smt-quan-tri-${RUN}`;

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
const savedViews = new SavedViewsService(db, {
	memberCount: async () => 0,
	usedByViews: async () => new Map(),
} as unknown as CampaignsService);

const TEN = {
	T1: "Bình",
	T2: "Cường",
	T3: "Dung",
	T4: "An",
	T5: "Em",
} as const;
type Nhan = keyof typeof TEN;
const TANG: Nhan[] = ["T2", "T4", "T1", "T5", "T3"];
const GIAM: Nhan[] = ["T5", "T4", "T1", "T2", "T3"];

type GiaTri = string | number;
type BaGiaTri = { nho: GiaTri; hoa: GiaTri; lon: GiaTri };

const nguoi = {
	a: `smt-nguoi-a-${RUN}`,
	b: `smt-nguoi-b-${RUN}`,
	c: `smt-nguoi-c-${RUN}`,
};

const GIA_TRI = {
	TEXT: { nho: "Anh", hoa: "Minh", lon: "Yen" },
	LONG_TEXT: { nho: "Anh dai", hoa: "Minh dai", lon: "Yen dai" },
	NUMBER: { nho: -2.5, hoa: 10, lon: 1234.5 },
	DATE: { nho: "2026-01-05", hoa: "2026-06-01", lon: "2026-12-31" },
	SELECT: { nho: "C", hoa: "A", lon: "B" },
	USER: { nho: nguoi.a, hoa: nguoi.b, lon: nguoi.c },
	URL: { nho: "a.vn", hoa: "m.vn", lon: "y.vn" },
	EMAIL: { nho: "a@x.vn", hoa: "m@x.vn", lon: "y@x.vn" },
	PHONE: { nho: "0901", hoa: "0905", lon: "0909" },
} satisfies Record<Exclude<FieldTypeName, "CHECKBOX">, BaGiaTri>;

const KIEU_SAP = Object.keys(GIA_TRI) as (keyof typeof GIA_TRI)[];

function giaTriCho(kieu: keyof typeof GIA_TRI, nhan: Nhan): GiaTri | null {
	const ba = GIA_TRI[kieu];
	if (nhan === "T2") return ba.nho;
	if (nhan === "T1" || nhan === "T4") return ba.hoa;
	if (nhan === "T5") return ba.lon;
	return null;
}

const daTao = { truong: [] as string[], congTy: [] as string[] };

async function taoTruong(
	entity: FieldEntity,
	nhan: string,
	type: FieldTypeName,
	them: { showOnTable?: boolean } = {},
) {
	const field = await fields.create(quanTri, {
		entity,
		label: nhan,
		type,
		options:
			type === "SELECT" ? [{ label: "C" }, { label: "A" }, { label: "B" }] : [],
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: them.showOnTable ?? false,
		showOnFilter: false,
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
	them: { amountCents?: number | null; stage?: string } = {},
): Promise<string> {
	const deal = await deals.create({
		name: `${tienTo} ${ten}`,
		companyId,
		ownerId: quanTri,
		amountCents: them.amountCents ?? null,
		stage: them.stage,
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
	if (n !== 0) throw new Error(`smt ${tienTo}: lan ${n}`);
}

function giaTriTheoKhoa(
	kieuS: readonly (keyof typeof GIA_TRI)[],
	khoaCua: Map<string, string>,
	nhan: Nhan,
): Record<string, GiaTri> {
	const out = new Map<string, GiaTri>();
	for (const kieu of kieuS) {
		const v = giaTriCho(kieu, nhan);
		if (v !== null) out.set(khoaCua.get(kieu) ?? "", v);
	}
	return Object.fromEntries(out);
}

function tenTheoId(map: Map<string, Nhan>, ids: string[]) {
	return ids.map((id) => TEN[map.get(id) ?? "T1"] ?? id).join(",");
}

beforeAll(async () => {
	await gieoThanhVien(quanTri, "owner");
	await gieoThanhVien(nguoi.a, "member");
	await gieoThanhVien(nguoi.b, "member");
	await gieoThanhVien(nguoi.c, "member");
});

afterAll(async () => {
	await db.deal.deleteMany({ where: { companyId: { in: daTao.congTy } } });
	await db.contact.deleteMany({ where: { companyId: { in: daTao.congTy } } });
	await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
	await db.fieldDefinition.deleteMany({ where: { id: { in: daTao.truong } } });
	await db.savedView.deleteMany({ where: { ownerId: quanTri } });
	await db.member.deleteMany({
		where: { userId: { in: [quanTri, nguoi.a, nguoi.b, nguoi.c] } },
	});
	await db.user.deleteMany({
		where: { id: { in: [quanTri, nguoi.a, nguoi.b, nguoi.c] } },
	});
});

describe("smt-api-sap", () => {
	const tienTo = `smtsap${RUN}`;
	const nhanTheoId = new Map<string, Nhan>();
	const khoa = new Map<string, string>();

	beforeAll(async () => {
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		for (const kieu of KIEU_SAP) {
			const field = await taoTruong("DEAL", `${tienTo} ${kieu}`, kieu);
			khoa.set(kieu, field.key);
		}
		const amount = {
			T1: 300,
			T2: 500,
			T3: 100,
			T4: 400,
			T5: 200,
		} satisfies Record<Nhan, number>;
		for (const nhan of ["T1", "T2", "T3", "T4", "T5"] as Nhan[]) {
			const id = await taoThoaThuan(tienTo, companyId, TEN[nhan], {
				amountCents: amount[nhan],
			});
			nhanTheoId.set(id, nhan);
			const values = giaTriTheoKhoa(KIEU_SAP, khoa, nhan);
			await deals.update(id, { fields: values });
		}
	});

	it("smt-api-sap: chín kiểu × hai chiều theo đáp án viết tay", async () => {
		const amount = await deals.list(
			dealListInput.parse({ q: tienTo, sort: "amount", dir: "asc" }),
		);
		const ranAmount = amount.rows.map((r) => nhanTheoId.get(r.id));
		if (ranAmount.join(",") !== "T3,T5,T1,T4,T2") {
			throw new Error("smt api sap: doi chung amount");
		}

		let soO = 0;
		for (const kieu of KIEU_SAP) {
			for (const [dir, dapAn] of [
				["asc", TANG],
				["desc", GIAM],
			] as const) {
				const out = await deals.list(
					dealListInput.parse({
						q: tienTo,
						sort: `field:${khoa.get(kieu)}`,
						dir,
						pageSize: 25,
					}),
				);
				const ra = out.rows.map((r) => nhanTheoId.get(r.id) ?? r.id);
				if (ra.join(",") !== dapAn.join(",")) {
					throw new Error(
						`smt api sap: ${kieu} ${dir} ra ${tenTheoId(
							nhanTheoId,
							out.rows.map((r) => r.id),
						)}`,
					);
				}
				soO += 1;
			}
		}
		if (soO !== 18) throw new Error(`smt api sap: thieu o ${soO}`);
		expect(soO).toBe(18);
	});
});

describe("smt-api-trang", () => {
	const tienTo = `smttrang${RUN}`;
	const ids: string[] = [];
	let khoaSo = "";
	let khoaNguoi = "";
	const giaTri: (number | null)[] = [
		50,
		10,
		null,
		30,
		30,
		70,
		null,
		90,
		20,
		null,
		60,
		80,
		null,
		40,
		40,
		15,
		null,
		25,
		35,
		null,
		55,
		65,
		null,
	];

	const TRONG = [2, 6, 9, 12, 16, 19, 22];
	const DAP_AN = {
		asc: [1, 15, 8, 17, 3, 4, 18, 13, 14, 0, 20, 10, 21, 5, 11, 7, ...TRONG],
		desc: [7, 11, 5, 21, 10, 20, 0, 13, 14, 18, 3, 4, 17, 8, 15, 1, ...TRONG],
	};

	function dapAn(dir: "asc" | "desc"): string[] {
		return DAP_AN[dir].map((i) => ids[i] ?? `thieu ${i}`);
	}

	beforeAll(async () => {
		await batDauCa(tienTo);
		const companyId = await taoCongTy(`${tienTo} cong ty`);
		khoaSo = (await taoTruong("DEAL", `${tienTo} so`, "NUMBER")).key;
		for (const [i, v] of giaTri.entries()) {
			const id = await taoThoaThuan(
				tienTo,
				companyId,
				String(i).padStart(2, "0"),
			);
			ids.push(id);
			if (v !== null) await deals.update(id, { fields: { [khoaSo]: v } });
		}
		await deals.update(ids[2] ?? "", { fields: { [khoaSo]: 5 } });
		await deals.update(ids[2] ?? "", { fields: { [khoaSo]: null } });
		await deals.update(ids[6] ?? "", { fields: { [khoaSo]: 5 } });
		await deals.update(ids[6] ?? "", { fields: { [khoaSo]: "" } });
	});

	it("smt-api-trang: đi trang không trùng không sót, vắt ranh, lọc", async () => {
		if (giaTri.length !== 23 || giaTri.filter((v) => v === null).length !== 7) {
			throw new Error("smt api trang: fixture");
		}
		for (const dir of ["asc", "desc"] as const) {
			const gop: string[] = [];
			const coTrang: number[] = [];
			for (let page = 1; page <= 5; page++) {
				const out = await deals.list(
					dealListInput.parse({
						q: tienTo,
						sort: `field:${khoaSo}`,
						dir,
						page,
						pageSize: 5,
					}),
				);
				if (out.total !== 23)
					throw new Error(`smt api trang: total ${out.total}`);
				coTrang.push(out.rows.length);
				if (page === 4) {
					const vals = out.rows.map((r) => giaTri[ids.indexOf(r.id)]);
					if (!vals.some((v) => v === null) || !vals.some((v) => v !== null)) {
						throw new Error("smt api trang: fixture khong vat ranh");
					}
				}
				for (const r of out.rows) {
					if (gop.includes(r.id))
						throw new Error(`smt api trang: ${dir} trung ${r.id}`);
					gop.push(r.id);
				}
			}
			if (coTrang.join(",") !== "5,5,5,5,3") {
				throw new Error(
					`smt api trang: ${dir} co trang ${JSON.stringify(coTrang)}`,
				);
			}
			const sot = ids.filter((id) => !gop.includes(id));
			if (sot.length > 0)
				throw new Error(`smt api trang: ${dir} sot ${sot.length}`);
			const mong = dapAn(dir);
			for (let k = 0; k < 5; k++) {
				const a = gop.slice(k * 5, k * 5 + 5).join(",");
				const b = mong.slice(k * 5, k * 5 + 5).join(",");
				if (a !== b)
					throw new Error(`smt api trang: ${dir} thu tu trang ${k + 1}`);
			}
		}

		const nhomB = ids.filter((_, i) => i % 5 === 0 || i % 5 === 2);
		for (const id of nhomB) await deals.update(id, { ownerId: nguoi.b });
		const loc = await deals.list(
			dealListInput.parse({
				q: tienTo,
				owner: [nguoi.b],
				sort: `field:${khoaSo}`,
				dir: "asc",
				pageSize: 25,
			}),
		);
		const mongLoc = dapAn("asc").filter((id) => nhomB.includes(id));
		if (
			loc.total !== nhomB.length ||
			loc.rows.map((r) => r.id).join(",") !== mongLoc.join(",")
		) {
			throw new Error("smt api trang: loc owner");
		}
		const qHep = `${tienTo} 1`;
		const locQ = await deals.list(
			dealListInput.parse({
				q: qHep,
				sort: `field:${khoaSo}`,
				dir: "asc",
				pageSize: 25,
			}),
		);
		const mongQ = dapAn("asc").filter((id) =>
			`${tienTo} ${String(ids.indexOf(id)).padStart(2, "0")}`.includes(qHep),
		);
		if (
			locQ.total !== mongQ.length ||
			locQ.rows.map((r) => r.id).join(",") !== mongQ.join(",")
		) {
			throw new Error("smt api trang: loc q");
		}
		const luuTru = [ids[0], ids[2], ids[7]].filter((x): x is string => !!x);
		await db.deal.updateMany({
			where: { id: { in: luuTru } },
			data: { archivedAt: new Date() },
		});
		const daLuu = await deals.list(
			dealListInput.parse({
				q: tienTo,
				archived: true,
				sort: `field:${khoaSo}`,
				dir: "asc",
			}),
		);
		const mongLuu = dapAn("asc").filter((id) => luuTru.includes(id));
		if (daLuu.rows.map((r) => r.id).join(",") !== mongLuu.join(",")) {
			throw new Error("smt api trang: luu tru");
		}
		await db.deal.updateMany({
			where: { id: { in: luuTru } },
			data: { archivedAt: null },
		});
	});

	it("smt-api-trang: hai dạng trống", async () => {
		khoaNguoi = (await taoTruong("DEAL", `${tienTo} nguoi`, "USER")).key;
		const xoa = `smt-nguoi-xoa-${RUN}`;
		await gieoThanhVien(xoa, "member");
		const sau = ids.slice(0, 6);
		for (const [i, id] of sau.entries()) {
			await deals.update(id, {
				fields: { [khoaNguoi]: i < 2 ? xoa : i < 4 ? nguoi.a : nguoi.c },
			});
		}
		await db.member.deleteMany({ where: { userId: xoa } });
		await db.user.delete({ where: { id: xoa } });

		const def = await db.fieldDefinition.findFirstOrThrow({
			where: { entity: "DEAL", key: khoaNguoi },
		});
		const hangNull = await db.fieldValue.findMany({
			where: { fieldId: def.id, dealId: { in: sau.slice(0, 2) }, userId: null },
		});
		const soDef = await db.fieldDefinition.findFirstOrThrow({
			where: { entity: "DEAL", key: khoaSo },
		});
		const khongHang = await db.fieldValue.count({
			where: {
				fieldId: soDef.id,
				dealId: { in: [ids[2] ?? "", ids[6] ?? ""] },
			},
		});
		if (hangNull.length !== 2 || khongHang !== 0) {
			throw new Error("smt api trang: fixture trong mot dang");
		}

		for (const dir of ["asc", "desc"] as const) {
			const gop: string[] = [];
			for (let page = 1; page <= 12; page++) {
				const out = await deals.list(
					dealListInput.parse({
						q: tienTo,
						sort: `field:${khoaNguoi}`,
						dir,
						page,
						pageSize: 2,
					}),
				);
				gop.push(...out.rows.map((r) => r.id));
			}
			for (const id of sau.slice(0, 2)) {
				const viTri = gop.indexOf(id);
				if (viTri < 4) throw new Error(`smt api trang: ${dir} sot ${id}`);
			}
			if (new Set(gop).size !== 23)
				throw new Error(`smt api trang: ${dir} sot ${23 - new Set(gop).size}`);
		}
	});
});

describe("smt-api-cty-lh", () => {
	const tienTo = `smtctylh${RUN}`;
	const KIEU_BA = ["TEXT", "NUMBER", "DATE"] as const;

	beforeAll(async () => {
		await batDauCa(tienTo);
	});

	it("smt-api-cty-lh: Công ty và Liên hệ theo trường tự tạo, Điện thoại chuẩn", async () => {
		let soO = 0;
		const khoaCty = new Map<string, string>();
		const khoaLh = new Map<string, string>();
		for (const kieu of KIEU_BA) {
			khoaCty.set(
				kieu,
				(await taoTruong("COMPANY", `${tienTo} cty ${kieu}`, kieu)).key,
			);
			khoaLh.set(
				kieu,
				(await taoTruong("CONTACT", `${tienTo} lh ${kieu}`, kieu)).key,
			);
		}

		const ctyTheoId = new Map<string, Nhan>();
		for (const nhan of ["T1", "T2", "T3", "T4", "T5"] as Nhan[]) {
			const id = await taoCongTy(`${tienTo} ${TEN[nhan]}`);
			ctyTheoId.set(id, nhan);
			const values = giaTriTheoKhoa(KIEU_BA, khoaCty, nhan);
			await companies.update(id, { fields: values });
		}

		const chua = await taoCongTy(`${tienTo} chua lien he`);
		const lhTheoId = new Map<string, Nhan>();
		const lhIds: string[] = [];
		for (const nhan of ["T1", "T2", "T3", "T4", "T5"] as Nhan[]) {
			const c = await contacts.create({
				firstName: "Lien he",
				lastName: TEN[nhan],
				companyId: chua,
			});
			lhTheoId.set(c.id, nhan);
			lhIds.push(c.id);
			const values = giaTriTheoKhoa(KIEU_BA, khoaLh, nhan);
			await contacts.update(c.id, { fields: values });
		}

		for (const kieu of KIEU_BA) {
			for (const [dir, dapAn] of [
				["asc", TANG],
				["desc", GIAM],
			] as const) {
				const cty = await companies.list(
					companyListInput.parse({
						q: tienTo,
						sort: `field:${khoaCty.get(kieu)}`,
						dir,
					}),
				);
				const raCty = cty.rows.map((r) => ctyTheoId.get(r.id)).filter(Boolean);
				if (raCty.join(",") !== dapAn.join(",")) {
					throw new Error(
						`smt api cty lh: COMPANY ${kieu} ${dir} ra ${raCty.join(",")}`,
					);
				}
				soO += 1;
				const lh = await contacts.list(
					contactListInput.parse({
						q: tienTo,
						sort: `field:${khoaLh.get(kieu)}`,
						dir,
					}),
				);
				const raLh = lh.rows.map((r) => lhTheoId.get(r.id));
				if (raLh.join(",") !== dapAn.join(",")) {
					throw new Error(
						`smt api cty lh: CONTACT ${kieu} ${dir} ra ${raLh.join(",")}`,
					);
				}
				soO += 1;
			}
		}
		if (soO !== 12) throw new Error(`smt api cty lh: thieu o ${soO}`);

		const gop: string[] = [];
		for (let page = 1; page <= 3; page++) {
			const out = await contacts.list(
				contactListInput.parse({
					q: tienTo,
					sort: `field:${khoaLh.get("NUMBER")}`,
					dir: "asc",
					page,
					pageSize: 2,
				}),
			);
			for (const r of out.rows) {
				if (gop.includes(r.id))
					throw new Error(`smt api cty lh: trang ${r.id}`);
				gop.push(r.id);
			}
		}
		if (gop.length !== 5)
			throw new Error(`smt api cty lh: trang ${gop.length}`);

		const goc =
			100000 +
			([...RUN].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 800000, 7) %
				800000);
		const soCho = (k: number) => `09${goc}${String(k).padStart(2, "0")}`;
		const SO = {
			T1: soCho(1),
			T2: soCho(2),
			T3: null,
			T4: soCho(4),
			T5: soCho(5),
		} satisfies Record<Nhan, string | null>;
		const khoaDt = (await taoTruong("CONTACT", `${tienTo} dt`, "PHONE")).key;
		for (const id of lhIds) {
			const so = SO[lhTheoId.get(id) ?? "T1"];
			if (so)
				await contacts.update(id, { phone: so, fields: { [khoaDt]: so } });
		}
		const PHONE_TANG: Nhan[] = ["T1", "T2", "T4", "T5", "T3"];
		const PHONE_GIAM: Nhan[] = ["T5", "T4", "T2", "T1", "T3"];
		for (const [dir, dapAn] of [
			["asc", PHONE_TANG],
			["desc", PHONE_GIAM],
		] as const) {
			const chuan = await contacts.list(
				contactListInput.parse({ q: tienTo, sort: "phone", dir }),
			);
			const raChuan = chuan.rows.map((r) => lhTheoId.get(r.id));
			if (raChuan.join(",") !== dapAn.join(",")) {
				throw new Error(`smt api cty lh: phone ${dir} ra ${raChuan.join(",")}`);
			}
			const tuTao = await contacts.list(
				contactListInput.parse({ q: tienTo, sort: `field:${khoaDt}`, dir }),
			);
			if (
				tuTao.rows.map((r) => r.id).join(",") !==
				chuan.rows.map((r) => r.id).join(",")
			) {
				throw new Error(`smt api cty lh: hoa lech chuan ${dir}`);
			}
		}
	});
});

describe("smt-api-khoa-chet", () => {
	const tienTo = `smtkhoa${RUN}`;

	it("smt-api-khoa-chet: khoá chết về thứ tự mặc định, không ném", async () => {
		await batDauCa(tienTo);
		const khoaSong = (await taoTruong("DEAL", `${tienTo} song`, "TEXT")).key;
		const luu = await taoTruong("DEAL", `${tienTo} luu`, "TEXT");
		const khoaTich = (await taoTruong("DEAL", `${tienTo} tich`, "CHECKBOX"))
			.key;
		const khoaLienHe = (await taoTruong("CONTACT", `${tienTo} lien he`, "TEXT"))
			.key;
		await taoTruong("COMPANY", `${tienTo} cty`, "TEXT");

		const companyId = await taoCongTy(`${tienTo} cong ty`);
		const ten = ["Z", "Y", "X", "W", "V"];
		for (const [i, t] of ten.entries()) {
			const id = await taoThoaThuan(tienTo, companyId, t);
			await deals.update(id, { fields: { [khoaSong]: `gia tri ${i}` } });
			await contacts.create({ firstName: t, lastName: tienTo, companyId });
		}
		for (const t of ["P", "Q", "R", "S"]) await taoCongTy(`${tienTo} ${t}`);
		await fields.archive(quanTri, luu.id);

		const thuTuc = {
			"deals.list": async (sort: string) =>
				(
					await deals.list(dealListInput.parse({ q: tienTo, sort, dir: "asc" }))
				).rows.map((r) => r.id),
			"deals.board": async (sort: string) =>
				(
					await deals.board(
						dealBoardInput.parse({ q: tienTo, sort, dir: "asc" }),
					)
				).columns.flatMap((c) => c.cards.map((card) => card.id)),
			"companies.list": async (sort: string) =>
				(
					await companies.list(
						companyListInput.parse({ q: tienTo, sort, dir: "asc" }),
					)
				).rows.map((r) => r.id),
			"contacts.list": async (sort: string) =>
				(
					await contacts.list(
						contactListInput.parse({ q: tienTo, sort, dir: "asc" }),
					)
				).rows.map((r) => r.id),
		};

		const songTruoc = await thuTuc["deals.list"](`field:${khoaSong}`);
		const macDinhDeal = await thuTuc["deals.list"]("");
		if (songTruoc.join(",") === macDinhDeal.join(",")) {
			throw new Error("smt api khoa chet: thuoc mu");
		}

		const khoaChung = [
			"field:khong_co",
			`field:${luu.key}`,
			`field:${khoaTich}`,
			"field:",
			"fieldxyz",
		];
		const ca: [string, keyof typeof thuTuc][] = [];
		for (const k of khoaChung) {
			for (const t of Object.keys(thuTuc) as (keyof typeof thuTuc)[])
				ca.push([k, t]);
		}
		ca.push(
			[`field:${khoaLienHe}`, "deals.list"],
			[`field:${khoaLienHe}`, "deals.board"],
		);

		let soO = 0;
		for (const [k, t] of ca) {
			const macDinh = await thuTuc[t]("");
			let ra: string[];
			try {
				ra = await thuTuc[t](k);
			} catch (error) {
				const ma = (error as { name?: string }).name ?? "loi";
				throw new Error(`smt api khoa chet: ${k} ${t} nem ${ma}`);
			}
			if (ra.join(",") !== macDinh.join(",")) {
				throw new Error(`smt api khoa chet: ${k} ${t} thu tu`);
			}
			soO += 1;
		}
		if (soO !== 22) throw new Error(`smt api khoa chet: thieu o ${soO}`);

		const view = await savedViews.create(
			{
				entity: "DEAL",
				name: `${tienTo} view`,
				shared: false,
				filters: savedViewFilters.parse({
					q: tienTo,
					sort: `field:${khoaSong}`,
				}),
			},
			quanTri,
		);
		const song = (await fields.list("DEAL", false)).find(
			(f) => f.key === khoaSong,
		);
		if (!song) throw new Error("smt api khoa chet: thieu truong song");
		await fields.archive(quanTri, song.id);
		const doc = (await savedViews.list("DEAL", quanTri)).find(
			(v) => v.id === view.id,
		);
		if (!doc) throw new Error("smt api khoa chet: view da luu");
		const filters = savedViewFilters.parse(doc.filters);
		try {
			const out = await deals.list(
				dealListInput.parse({
					q: filters.q,
					sort: filters.sort,
					dir: filters.dir,
				}),
			);
			if (out.rows.map((r) => r.id).join(",") !== macDinhDeal.join(",")) {
				throw new Error("smt api khoa chet: view da luu");
			}
		} catch (error) {
			if (error instanceof Error && error.message.startsWith("smt "))
				throw error;
			throw new Error("smt api khoa chet: view da luu");
		}
		expect(soO).toBe(22);
	});
});

describe("smt-api-board", () => {
	const tienTo = `smtboard${RUN}`;

	it("smt-api-board: thẻ theo cùng luật, đếm cột không đổi, trần thẻ", async () => {
		await batDauCa(tienTo);
		const stages = await db.dealStage.findMany({
			where: { archivedAt: null, kind: "OPEN" },
			orderBy: { position: "asc" },
			select: { id: true },
			take: 3,
		});
		const [g1, g2, g3] = stages.map((s) => s.id);
		if (!g1 || !g2 || !g3) throw new Error("smt api board: thieu giai doan");
		const khoaSo = (await taoTruong("DEAL", `${tienTo} so`, "NUMBER")).key;
		const khoaNgay = (await taoTruong("DEAL", `${tienTo} ngay`, "DATE")).key;
		const companyId = await taoCongTy(`${tienTo} cong ty`);

		const nhanTheoId = new Map<string, Nhan>();
		for (const stage of [g1, g2]) {
			for (const nhan of ["T1", "T2", "T3", "T4", "T5"] as Nhan[]) {
				const id = await taoThoaThuan(tienTo, companyId, TEN[nhan], {
					amountCents: 1000,
					stage,
				});
				nhanTheoId.set(id, nhan);
				const khoaBang = new Map([
					["NUMBER", khoaSo],
					["DATE", khoaNgay],
				]);
				await deals.update(id, {
					fields: giaTriTheoKhoa(["NUMBER", "DATE"], khoaBang, nhan),
				});
			}
		}

		const goc = dealBoardOutput.parse(
			await deals.board(dealBoardInput.parse({ q: tienTo })),
		);
		let soO = 0;
		for (const [khoa, kieu] of [
			[khoaSo, "NUMBER"],
			[khoaNgay, "DATE"],
		] as const) {
			for (const [dir, dapAn] of [
				["asc", TANG],
				["desc", GIAM],
			] as const) {
				const board = dealBoardOutput.parse(
					await deals.board(
						dealBoardInput.parse({ q: tienTo, sort: `field:${khoa}`, dir }),
					),
				);
				for (const [ten, stage] of [
					["G1", g1],
					["G2", g2],
				] as const) {
					const cot = board.columns.find((c) => c.stage === stage);
					const cotGoc = goc.columns.find((c) => c.stage === stage);
					const ra = cot?.cards.map((card) => nhanTheoId.get(card.id)) ?? [];
					if (ra.join(",") !== dapAn.join(",")) {
						throw new Error(
							`smt api board: ${ten} ${kieu} ${dir} ra ${ra.join(",")}`,
						);
					}
					if (
						cot?.count !== cotGoc?.count ||
						cot?.valueCents !== cotGoc?.valueCents ||
						cot?.countedCount !== cotGoc?.countedCount
					) {
						throw new Error(`smt api board: dem lech ${ten}`);
					}
				}
				soO += 1;
			}
		}
		if (soO !== 4) throw new Error(`smt api board: thieu o ${soO * 2}`);

		const tran = DEAL_BOARD.cardsPerColumn;
		const g3Ids: string[] = [];
		for (let i = 0; i < tran + 3; i++) {
			const id = await taoThoaThuan(
				tienTo,
				companyId,
				`g3 ${String(i).padStart(3, "0")}`,
				{
					stage: g3,
				},
			);
			g3Ids.push(id);
			if (i >= 3) await deals.update(id, { fields: { [khoaSo]: i } });
		}
		const board = await deals.board(
			dealBoardInput.parse({ q: tienTo, sort: `field:${khoaSo}`, dir: "asc" }),
		);
		const cot = board.columns.find((c) => c.stage === g3);
		if (cot?.cards.length !== tran)
			throw new Error(`smt api board: tran ${cot?.cards.length}`);
		const cat = g3Ids.slice(0, 3);
		if (cat.some((id) => cot.cards.some((card) => card.id === id))) {
			throw new Error("smt api board: cat sai");
		}
		expect(soO).toBe(4);
	});
});
