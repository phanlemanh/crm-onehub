import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "htl-spec";
const ma = `htl${suffix.replace(/[^a-z0-9]/gi, "").slice(-8)}`;
const domain = `hoan-tac-loat-${suffix}.test`;
const NGAY_CU = new Date("2026-09-01T03:00:00.000Z");

type KetQua = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	message: string | null;
	changedIds: string[];
};

type Loai = {
	ten: "contacts" | "companies" | "deals";
	gieo: (i: number) => Promise<string>;
	catSan: (id: string) => Promise<void>;
	archivedAt: (id: string) => Promise<Date | null>;
};

let app: INestApplication;
let cookie = "";
let nguoi = "";
let phienToken = "";
let congTyGoc = "";

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function goi(thuTuc: string, ids: string[]): Promise<KetQua> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify({ ids }));
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as KetQua;
}

const LOAI: Loai[] = [
	{
		ten: "contacts",
		gieo: async (i) =>
			(
				await db.contact.create({
					data: { firstName: `Người ${i}`, lastName: ma },
					select: { id: true },
				})
			).id,
		catSan: async (id) => {
			await db.contact.update({
				where: { id },
				data: { archivedAt: NGAY_CU },
			});
		},
		archivedAt: async (id) =>
			(
				await db.contact.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
	{
		ten: "companies",
		gieo: async (i) =>
			(
				await db.company.create({
					data: { name: `Công ty ${ma} ${i}` },
					select: { id: true },
				})
			).id,
		catSan: async (id) => {
			await db.company.update({
				where: { id },
				data: { archivedAt: NGAY_CU },
			});
		},
		archivedAt: async (id) =>
			(
				await db.company.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
	{
		ten: "deals",
		gieo: async (i) =>
			(
				await db.deal.create({
					data: {
						name: `Thoả thuận ${ma} ${i}`,
						companyId: congTyGoc,
						ownerId: nguoi,
					},
					select: { id: true },
				})
			).id,
		catSan: async (id) => {
			await db.deal.update({
				where: { id },
				data: { archivedAt: NGAY_CU },
			});
		},
		archivedAt: async (id) =>
			(
				await db.deal.findUniqueOrThrow({
					where: { id },
					select: { archivedAt: true },
				})
			).archivedAt,
	},
];

const idKhongCo = (id: string) => `${id.slice(0, -6)}zzzzzz`;
const sapXep = (ids: string[] | undefined) =>
	JSON.stringify([...(ids ?? [])].sort());

async function clean(): Promise<void> {
	const congTy = await db.company.findMany({
		where: {
			OR: [{ domain: { endsWith: domain } }, { name: { contains: ma } }],
		},
		select: { id: true },
	});
	const ids = congTy.map((r) => r.id);
	await db.deal.deleteMany({
		where: { OR: [{ companyId: { in: ids } }, { name: { contains: ma } }] },
	});
	await db.activity.deleteMany({ where: { companyId: { in: ids } } });
	await db.agentTask.deleteMany({ where: { companyId: { in: ids } } });
	await db.contact.deleteMany({ where: { lastName: { contains: ma } } });
	await db.company.deleteMany({ where: { id: { in: ids } } });
}

beforeAll(async () => {
	await clean();
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	nguoi = `${ma}-admin`;
	await gieoThanhVien(nguoi, "admin");
	const phien = await mintPhien(nguoi);
	cookie = phien.cookie;
	phienToken = phien.token;
	congTyGoc = (
		await db.company.create({
			data: { name: `Gốc thoả thuận ${ma}`, domain },
			select: { id: true },
		})
	).id;
});

afterAll(async () => {
	await app.close();
	await clean();
	await db.session.deleteMany({ where: { token: phienToken } });
	await db.member.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("hoan-tac-loat-dung-id", () => {
	test("htl-luu-tru: luu tru va khoi phuc hang loat qua HTTP tra changedIds dung ban da doi", async () => {
		const o: string[] = [];
		for (const l of LOAI) {
			const a = await l.gieo(1);
			const p = await l.gieo(2);
			await l.catSan(p);
			const x = idKhongCo(a);

			const cat = await goi(`${l.ten}.bulkArchive`, [a, p, x]);
			chot(
				(await l.archivedAt(p))?.toISOString() === NGAY_CU.toISOString() &&
					!(cat.changedIds ?? []).includes(p),
				"htl: ban da luu tru tu truoc tinh la vua cat",
			);
			chot(
				["changedIds", "skipped"].every((k) => Object.keys(cat).includes(k)),
				"htl: bien cat changedIds",
			);
			expect(
				`${l.ten}:${sapXep(cat.changedIds)} ${cat.succeeded}/${cat.skipped}/${cat.failed}`,
			).toBe(`${l.ten}:${sapXep([a])} 1/1/1`);
			expect(`${l.ten}:${(await l.archivedAt(a)) !== null}`).toBe(
				`${l.ten}:true`,
			);
			o.push(`${l.ten}/luu-tru`);

			const ve = await goi(`${l.ten}.bulkRestore`, [a, p, x]);
			expect(
				`${l.ten}:${sapXep(ve.changedIds)} ${ve.succeeded}/${ve.skipped}/${ve.failed}`,
			).toBe(`${l.ten}:${sapXep([a, p])} 2/0/1`);
			const lanHai = await goi(`${l.ten}.bulkRestore`, [a, p, x]);
			expect(
				`${l.ten}:${sapXep(lanHai.changedIds)} ${lanHai.succeeded}/${lanHai.skipped}/${lanHai.failed}`,
			).toBe(`${l.ten}:[] 0/2/1`);
			o.push(`${l.ten}/khoi-phuc`);
		}
		expect(o.length).toBe(6);
	});

	test("htl-hoan-tac: Hoan tac bang changedIds khong khoi phuc ban nguoi khac da cat", async () => {
		const o: string[] = [];
		for (const l of LOAI) {
			const a = await l.gieo(3);
			const b = await l.gieo(4);
			const p = await l.gieo(5);
			await l.catSan(p);

			const cat = await goi(`${l.ten}.bulkArchive`, [a, b, p]);
			await goi(`${l.ten}.bulkRestore`, cat.changedIds ?? [a, b, p]);

			chot(
				(await l.archivedAt(p))?.toISOString() === NGAY_CU.toISOString(),
				"htl: hoan tac khoi phuc ban nguoi khac da cat",
			);
			expect(
				`${l.ten}:${(await l.archivedAt(a)) === null}/${(await l.archivedAt(b)) === null}`,
			).toBe(`${l.ten}:true/true`);
			o.push(l.ten);
		}
		expect(o.length).toBe(3);
	});
});
