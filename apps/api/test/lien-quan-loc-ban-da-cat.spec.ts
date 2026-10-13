import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "lqc-spec";
const ma = `lqc${suffix.replace(/[^a-z0-9]/gi, "").slice(-8)}`;
const domain = `lien-quan-loc-${suffix}.test`;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

type Dong = { id: string; archivedAt?: string; role?: string | null };
type CongTy = {
	contacts: Dong[];
	deals: Dong[];
	archivedContacts?: Dong[];
	archivedDeals?: Dong[];
};
type CaNhan = {
	deals: Dong[];
	archivedDeals?: Dong[];
	relationship: { colleagues: { id: string }[] };
};
type ThoaThuan = { contacts: Dong[]; archivedContacts?: Dong[] };
type DauVao = Readonly<Record<string, string>>;

let app: INestApplication;
let cookie = "";
let nguoi = "";
let phienToken = "";

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const ids = (rows: Dong[] | undefined) => (rows ?? []).map((r) => r.id).sort();

async function doc<T>(thuTuc: string, input: DauVao): Promise<T> {
	const res = await request(app.getHttpServer())
		.get(
			`/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(input))}`,
		)
		.set("cookie", cookie);
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

async function ghi<T>(thuTuc: string, input: DauVao): Promise<T> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(input));
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

let dem = 0;

async function congTy(): Promise<string> {
	dem += 1;
	return (
		await ghi<{ id: string }>("companies.create", {
			name: `Công ty ${ma} ${dem}`,
			domain: `c${dem}.${domain}`,
		})
	).id;
}

async function caNhan(companyId: string, ten: string): Promise<string> {
	return (
		await ghi<{ id: string }>("contacts.create", {
			firstName: ten,
			lastName: ma,
			companyId,
		})
	).id;
}

async function thoaThuan(companyId: string, ten: string): Promise<string> {
	return (
		await ghi<{ id: string }>("deals.create", {
			name: `${ten} ${ma}`,
			companyId,
			ownerId: nguoi,
		})
	).id;
}

async function gan(dealId: string, contactId: string, role?: string) {
	await ghi(
		"deals.attachContact",
		role ? { dealId, contactId, role } : { dealId, contactId },
	);
}

async function cat(loai: "contacts" | "deals", id: string): Promise<void> {
	await ghi(`${loai}.archive`, { id });
	await new Promise((r) => setTimeout(r, 5));
}

async function clean(): Promise<void> {
	const congTyCu = await db.company.findMany({
		where: {
			OR: [{ domain: { endsWith: domain } }, { name: { contains: ma } }],
		},
		select: { id: true },
	});
	const congTyIds = congTyCu.map((r) => r.id);
	const caNhanCu = await db.contact.findMany({
		where: { lastName: { contains: ma } },
		select: { id: true },
	});
	const caNhanIds = caNhanCu.map((r) => r.id);
	await db.deal.deleteMany({
		where: {
			OR: [{ companyId: { in: congTyIds } }, { name: { contains: ma } }],
		},
	});
	await db.activity.deleteMany({ where: { companyId: { in: congTyIds } } });
	await db.agentTask.deleteMany({
		where: {
			OR: [{ companyId: { in: congTyIds } }, { contactId: { in: caNhanIds } }],
		},
	});
	await db.contact.deleteMany({ where: { id: { in: caNhanIds } } });
	await db.company.deleteMany({ where: { id: { in: congTyIds } } });
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
});

afterAll(async () => {
	await app.close();
	await clean();
	await db.session.deleteMany({ where: { token: phienToken } });
	await db.member.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("lqc-byid-cong-ty", () => {
	test("tach ban dang dung va ban da cat, qua hop dong dau ra that", async () => {
		const c = await congTy();
		const nA = await caNhan(c, "An");
		const nB = await caNhan(c, "Bình");
		const nCat = await caNhan(c, "Cúc");
		const tA = await thoaThuan(c, "Thoả thuận A");
		const tB = await thoaThuan(c, "Thoả thuận B");
		const tCu = await thoaThuan(c, "Thoả thuận cũ");
		const tMoi = await thoaThuan(c, "Thoả thuận mới cất");
		await cat("contacts", nCat);
		await cat("deals", tCu);
		await cat("deals", tMoi);

		const kq = await doc<CongTy>("companies.byId", { id: c });
		chot(
			Array.isArray(kq.archivedDeals) && Array.isArray(kq.archivedContacts),
			"lqc: mang da cat roi o hop dong cong ty",
		);
		chot(
			!ids(kq.deals).includes(tCu) && !ids(kq.deals).includes(tMoi),
			"lqc: cong ty lan thoa thuan da cat",
		);

		const o: [string, string[], string[]][] = [
			["contacts", ids(kq.contacts), [nA, nB].sort()],
			["deals", ids(kq.deals), [tA, tB].sort()],
			["archivedContacts", ids(kq.archivedContacts), [nCat]],
			["archivedDeals", (kq.archivedDeals ?? []).map((d) => d.id), [tMoi, tCu]],
		];
		for (const [ten, co, mong] of o)
			expect(`${ten}: ${co}`).toBe(`${ten}: ${mong}`);
		expect(o.length).toBe(4);
		for (const d of [
			...(kq.archivedDeals ?? []),
			...(kq.archivedContacts ?? []),
		])
			expect(ISO.test(d.archivedAt ?? "")).toBe(true);

		const sach = await doc<CongTy>("companies.byId", { id: await congTy() });
		expect(sach.archivedContacts).toEqual([]);
		expect(sach.archivedDeals).toEqual([]);
	});
});

describe("lqc-byid-ca-nhan", () => {
	test("thoa thuan cua mot nguoi tach dang dung va da cat, giu vai tro", async () => {
		const c = await congTy();
		const n = await caNhan(c, "Dũng");
		const tA = await thoaThuan(c, "Thoả thuận A");
		const tB = await thoaThuan(c, "Thoả thuận B");
		await gan(tA, n, "Người quyết");
		await gan(tB, n);
		await cat("deals", tB);

		const kq = await doc<CaNhan>("contacts.byId", { id: n });
		chot(
			Array.isArray(kq.archivedDeals),
			"lqc: mang da cat roi o hop dong ca nhan",
		);
		const o = [
			[ids(kq.deals), [tA]],
			[ids(kq.archivedDeals), [tB]],
		] as const;
		for (const [co, mong] of o) expect(co).toEqual([...mong]);
		expect(o.length).toBe(2);
		expect(kq.deals[0]?.role).toBe("Người quyết");
		expect(ISO.test(kq.archivedDeals?.[0]?.archivedAt ?? "")).toBe(true);
	});
});

describe("lqc-byid-thoa-thuan", () => {
	test("nguoi tren thoa thuan tach dang dung va da cat, giu vai tro", async () => {
		const c = await congTy();
		const nX = await caNhan(c, "Xuân");
		const nY = await caNhan(c, "Yến");
		const t = await thoaThuan(c, "Thoả thuận X");
		await gan(t, nX, "Kỹ thuật");
		await gan(t, nY);
		await cat("contacts", nY);

		const kq = await doc<ThoaThuan>("deals.byId", { id: t });
		chot(!ids(kq.contacts).includes(nY), "lqc: thoa thuan lan ca nhan da cat");
		const o = [
			[ids(kq.contacts), [nX]],
			[ids(kq.archivedContacts), [nY]],
		] as const;
		for (const [co, mong] of o) expect(co).toEqual([...mong]);
		expect(o.length).toBe(2);
		expect(kq.contacts[0]?.role).toBe("Kỹ thuật");
		expect(ISO.test(kq.archivedContacts?.[0]?.archivedAt ?? "")).toBe(true);
	});
});

describe("lqc-chon-dong-nghiep", () => {
	test("bo chon va dong nghiep bo nguoi da cat", async () => {
		const c = await congTy();
		const nA = await caNhan(c, "An");
		const nB = await caNhan(c, "Bảo");
		const nD = await caNhan(c, "Duy");
		const t = await thoaThuan(c, "Thoả thuận trống");

		const chonTruoc = await doc<{ id: string }[]>("deals.contactOptions", {
			dealId: t,
		});
		const dnTruoc = await doc<CaNhan>("contacts.byId", { id: nD });
		expect(chonTruoc.map((r) => r.id)).toContain(nB);
		expect(dnTruoc.relationship.colleagues.map((r) => r.id)).toContain(nB);

		await cat("contacts", nB);

		const chon = (
			await doc<{ id: string }[]>("deals.contactOptions", { dealId: t })
		).map((r) => r.id);
		const dn = (
			await doc<CaNhan>("contacts.byId", { id: nD })
		).relationship.colleagues.map((r) => r.id);
		chot(!chon.includes(nB), "lqc: bo chon goi y nguoi da cat");
		chot(!dn.includes(nB), "lqc: dong nghiep lan nguoi da cat");
		const o = [chon.includes(nA), dn.includes(nA)];
		expect(o).toEqual([true, true]);
		expect(o.length).toBe(2);
	});
});
