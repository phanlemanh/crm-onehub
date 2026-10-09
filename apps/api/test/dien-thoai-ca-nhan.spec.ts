import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { CompanyDirectoryService } from "../src/companies/company-directory.service";
import {
	contactCreateInput,
	contactUpdateArgs,
} from "../src/contacts/contacts.contracts";
import { ContactsService } from "../src/contacts/contacts.service";
import { createApp } from "../src/create-app";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { FieldsService } from "../src/fields/fields.service";
import { SearchService } from "../src/search/search.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const HAU_TO = process.env.TEST_RUN_ID ?? "dien-thoai-spec";
const TEN = `DT ${HAU_TO}`;
const MIEN = `dt-${HAU_TO}.test`;
const NGUOI = `dt-nguoi-${HAU_TO}`;
const CUA_TA = { firstName: { startsWith: TEN } };

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const contacts = new ContactsService(
	db,
	new CompanyDirectoryService(agent),
	agent,
	new AgentQueueService(db),
	new ActivityStampService(db),
	fields,
);
const search = new SearchService(db);

let congTyId: string;

async function don() {
	await db.contact.deleteMany({ where: CUA_TA });
	await db.company.deleteMany({ where: { domain: MIEN } });
	await db.session.deleteMany({ where: { userId: NGUOI } });
	await db.member.deleteMany({ where: { userId: NGUOI } });
	await db.user.deleteMany({ where: { id: NGUOI } });
}

async function ghiThang(ten: string, phone: string | null, them = {}) {
	return db.contact.create({
		data: { firstName: `${TEN} ${ten}`, phone, ...them },
		select: { id: true },
	});
}

async function docSo(id: string) {
	return db.contact.findUniqueOrThrow({
		where: { id },
		select: { phone: true, source: true, companyId: true },
	});
}

async function demCuaTa() {
	return db.contact.count({ where: CUA_TA });
}

beforeAll(async () => {
	await don();
	const congTy = await db.company.create({
		data: { name: `${TEN} Co`, domain: MIEN },
		select: { id: true },
	});
	congTyId = congTy.id;
});

afterAll(don);

describe("tao-chuan-hoa", () => {
	test("tao-chuan-hoa: 0901 234 567 phai luu +84901234567", async () => {
		const tao = await contacts.create({
			firstName: `${TEN} Lan`,
			phone: "0901 234 567",
			companyId: congTyId,
		});
		const doc = await docSo(tao.id);
		expect(`${doc.phone} ${doc.companyId === congTyId} ${doc.source}`).toBe(
			"+84901234567 true MANUAL",
		);
	});

	test("tao-chuan-hoa: +84 28 3812 3456 phai luu +842838123456", async () => {
		const tao = await contacts.create({
			firstName: `${TEN} Ban`,
			phone: "+84 28 3812 3456",
		});
		const doc = await docSo(tao.id);
		expect(`${doc.phone} ${doc.source}`).toBe("+842838123456 MANUAL");
	});

	test("tao-chuan-hoa: +65 6123 4567 phai luu +6561234567", async () => {
		const tao = await contacts.create({
			firstName: `${TEN} Sing`,
			phone: "+65 6123 4567",
		});
		expect((await docSo(tao.id)).phone).toBe("+6561234567");
	});

	test("tao-chuan-hoa: khong so van tao duoc", async () => {
		const tao = await contacts.create({ firstName: `${TEN} Trong` });
		expect((await docSo(tao.id)).phone).toBeNull();
	});
});

describe("so-sai", () => {
	for (const sai of ["abc", "12345"]) {
		test(`so-sai: ${sai} phai bi tu choi o hop dong`, () => {
			const tao = contactCreateInput.safeParse({ firstName: "A", phone: sai });
			const sua = contactUpdateArgs.safeParse({
				id: "x",
				data: { phone: sai },
			});
			expect(`${tao.success} ${sua.success}`).toBe("false false");
			expect(String(tao.error?.issues[0]?.message)).toBe(
				"That is not a phone number.",
			);
		});
	}

	for (const dung of ["0901 234 567", ""]) {
		test(`so-sai: doi chung ${JSON.stringify(dung)} qua duoc`, () => {
			expect(
				contactCreateInput.safeParse({ firstName: "A", phone: dung }).success,
			).toBe(true);
		});
	}

	test("so-sai: abc qua router tra BAD_REQUEST va khong tao gi", async () => {
		let app: NestExpressApplication | null = null;
		try {
			app = await createApp();
			spyOn(app.get(BackfillService), "auto").mockResolvedValue({
				started: false,
			});
			await gieoThanhVien(NGUOI, "member");
			const { cookie } = await mintPhien(NGUOI);
			const truoc = await demCuaTa();
			const res = await request(app.getHttpServer())
				.post("/api/trpc/contacts.create")
				.set("content-type", "application/json")
				.set("cookie", cookie)
				.send(JSON.stringify({ firstName: `${TEN} Router`, phone: "abc" }));
			expect(
				`${res.status} ${res.body?.error?.data?.code} ${await demCuaTa()}`,
			).toBe(`400 BAD_REQUEST ${truoc}`);
		} finally {
			await app?.close();
		}
	});
});

describe("trung-tao", () => {
	let aId: string;

	beforeAll(async () => {
		aId = (await ghiThang("Giu So", "0901.234.111")).id;
	});

	for (const vao of ["+84 901 234 111", "84901234111"]) {
		test(`trung-tao: so tho cu phai chan ${vao}`, async () => {
			const truoc = await demCuaTa();
			let loi = "";
			try {
				await contacts.create({ firstName: `${TEN} Moi`, phone: vao });
			} catch (error) {
				loi = `${(error as Error).constructor.name}: ${(error as Error).message}`;
			}
			expect(loi).toBe(
				`ConflictException: ${TEN} Giu So already uses 0901 234 111.`,
			);
			expect(await demCuaTa()).toBe(truoc);
		});
	}

	test("trung-tao: khac mot so thi tao duoc", async () => {
		const tao = await contacts.create({
			firstName: `${TEN} Khac`,
			phone: "0901 234 112",
		});
		expect((await docSo(tao.id)).phone).toBe("+84901234112");
	});

	test("trung-tao: nguoi giu so da luu tru thi tao duoc", async () => {
		await db.contact.update({
			where: { id: aId },
			data: { archivedAt: new Date() },
		});
		const tao = await contacts.create({
			firstName: `${TEN} Sau Luu Tru`,
			phone: "+84901234111",
		});
		expect((await docSo(tao.id)).phone).toBe("+84901234111");
	});
});

describe("trung-sua", () => {
	let aId: string;
	let bId: string;
	let a2Id: string;

	beforeAll(async () => {
		aId = (await ghiThang("Sua A", "0901234222")).id;
		bId = (await ghiThang("Sua B", null)).id;
		a2Id = (await ghiThang("Sua A2", "0907.654.333")).id;
		await ghiThang("Sua C2", "0907.654.333");
	});

	test("trung-sua: sua so cua B thanh so cua A bi chan", async () => {
		let loi = "";
		try {
			await contacts.update(bId, { phone: "+84901234222" });
		} catch (error) {
			loi = (error as Error).constructor.name;
		}
		expect(`${loi} ${(await docSo(bId)).phone}`).toBe("ConflictException null");
	});

	test("trung-sua: sua ve chinh so cua minh phai duoc", async () => {
		await contacts.update(aId, { phone: "+84 901 234 222" });
		expect((await docSo(aId)).phone).toBe("+84901234222");
	});

	test("trung-sua: xoa trong so thi luu rong", async () => {
		await contacts.update(aId, { phone: "" });
		expect((await docSo(aId)).phone).toBeNull();
	});

	test("trung-sua: sua truong khac bi chan — sua chuc danh nguoi da trung san", async () => {
		await contacts.update(a2Id, { title: "Truong phong" });
		const doc = await db.contact.findUniqueOrThrow({
			where: { id: a2Id },
			select: { title: true },
		});
		expect(doc.title).toBe("Truong phong");
	});

	test("trung-sua: sua truong khac bi chan — gui lai chinh so cu dang khac", async () => {
		await contacts.update(a2Id, { phone: "0907 654 333" });
		expect((await docSo(a2Id)).phone).toBe("+84907654333");
	});
});

describe("tim-bang", () => {
	let pId: string;
	let qId: string;
	let rId: string;

	beforeAll(async () => {
		pId = (await ghiThang("Tim P", "+84901234444")).id;
		qId = (await ghiThang("Tim Q", "0912.345.444")).id;
		rId = (await ghiThang("Tim R12", null)).id;
	});

	async function tim(q: string) {
		const { rows } = await contacts.list({
			...contactListDefaults(),
			q,
		});
		const ids = new Set(rows.map((r) => r.id));
		return `${ids.has(pId) ? "P" : "-"}${ids.has(qId) ? "Q" : "-"}${ids.has(rId) ? "R" : "-"}`;
	}

	const BANG: [string, string][] = [
		["0901234444", "P--"],
		["+84 901 234 444", "P--"],
		["234 444", "P--"],
		["0912345444", "-Q-"],
	];

	for (const [q, ra] of BANG) {
		test(`tim-bang: ${q}`, async () => {
			expect(`tim-bang: ${q} -> ${await tim(q)}`).toBe(
				`tim-bang: ${q} -> ${ra}`,
			);
		});
	}

	test("tim-bang: 12 duoi nguong khong loc theo so", async () => {
		const ten = (id: string) =>
			db.contact
				.findUniqueOrThrow({ where: { id }, select: { firstName: true } })
				.then((c) => c.firstName.includes("12"));
		const mong = `${(await ten(pId)) ? "P" : "-"}${(await ten(qId)) ? "Q" : "-"}R`;
		expect(`tim-bang: 12 -> ${await tim("12")}`).toBe(
			`tim-bang: 12 -> ${mong}`,
		);
	});

	test("tim-bang: dong co so hien phone", async () => {
		const { rows } = await contacts.list({
			...contactListDefaults(),
			q: "0901234444",
		});
		expect(rows.find((r) => r.id === pId)?.phone ?? null).toBe("+84901234444");
	});
});

describe("tim-cmdk", () => {
	let pId: string;
	let p2Id: string;

	beforeAll(async () => {
		pId = (
			await db.contact.create({
				data: {
					firstName: `${TEN} Cmdk P`,
					phone: "+84901234555",
					companyId: congTyId,
				},
				select: { id: true },
			})
		).id;
		p2Id = (await ghiThang("Cmdk P2", "+84907654555")).id;
	});

	test("tim-cmdk: thieu P — co cong ty thi dong phu la ten cong ty", async () => {
		const { hits } = await search.quick("0901 234 555");
		const p = hits.find((h) => h.kind === "contact" && h.id === pId);
		expect(p?.detail ?? "thieu P").toBe(`${TEN} Co`);
	});

	test("tim-cmdk: khong cong ty thi dong phu la so", async () => {
		const { hits } = await search.quick("0907654555");
		const p2 = hits.find((h) => h.kind === "contact" && h.id === p2Id);
		expect(p2?.detail ?? "thieu P2").toBe("0907 654 555");
	});
});

function contactListDefaults() {
	return {
		sort: "",
		dir: "asc" as const,
		page: 1,
		pageSize: 100,
		owner: [],
		company: [],
		source: [],
		title: [],
		seniority: [],
		persona: [],
		activity: [],
		fields: {},
		archived: false,
	};
}
