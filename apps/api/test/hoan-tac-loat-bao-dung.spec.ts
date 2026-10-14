import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import {
	type INestApplication,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { runBulk } from "../src/crm/bulk";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "hlb-spec";
const ma = `hlb${suffix.replace(/[^a-z0-9]/gi, "").slice(-8)}`;
const domain = `hoan-tac-loat-bao-dung-${suffix}.test`;
const NGAY_CU = new Date("2026-09-01T03:00:00.000Z");

type KetQua = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	errored: number;
	message: string | null;
	changedIds: string[];
};

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

type DongLog = { message?: string; recordId?: string };
type GoiLog = [DongLog | undefined, unknown];

function goiCua(spy: { mock: { calls: unknown[][] } }): GoiLog[] {
	return spy.mock.calls.map((c) => [c[0] as DongLog | undefined, c[1]]);
}

describe("hlb-run-bulk", () => {
	afterEach(() => {
		(
			Logger.prototype.error as unknown as { mockRestore?: () => void }
		).mockRestore?.();
		(
			Logger.prototype.warn as unknown as { mockRestore?: () => void }
		).mockRestore?.();
	});

	test("hlb-run-bulk: tach loi that khoi ban khong con va ghi log tung ban", async () => {
		const loi = spyOn(Logger.prototype, "error").mockImplementation(() => {});
		const canh = spyOn(Logger.prototype, "warn").mockImplementation(() => {});
		const hong = new Error("hong-that");
		const kq = await runBulk(["ok", "nul", "mat", "hong"], async (id) => {
			if (id === "ok") return { id };
			if (id === "nul") return null;
			if (id === "mat") throw new NotFoundException(`No record with id ${id}.`);
			throw hong;
		});

		chot(
			kq.errored === 1 && kq.failed === 2,
			"hlb: khong con tinh la loi that",
		);
		expect(
			`${kq.requested}/${kq.succeeded}/${kq.skipped}/${kq.failed}/${kq.errored} ${JSON.stringify(kq.changedIds)} ${kq.message !== null}`,
		).toBe('4/1/1/2/1 ["ok"] true');

		const dongLoi = goiCua(loi);
		chot(dongLoi.length === 1, "hlb: loi that khong co dong log");
		chot(dongLoi[0]?.[0]?.recordId === "hong", "hlb: log khong co id");
		chot(dongLoi[0]?.[1] === hong.stack, "hlb: log khong co stack");

		const dongCanh = goiCua(canh);
		expect(`${dongCanh.length}:${String(dongCanh[0]?.[0]?.recordId)}`).toBe(
			"1:mat",
		);
	});

	test("hlb-run-bulk: doi chung — moi ban doi thi khong co loi va khong co log", async () => {
		const loi = spyOn(Logger.prototype, "error").mockImplementation(() => {});
		const canh = spyOn(Logger.prototype, "warn").mockImplementation(() => {});
		const kq = await runBulk(["a", "b", "c", "d"], async (id) => ({ id }));
		expect(
			`${kq.succeeded}/${kq.failed}/${kq.errored} ${loi.mock.calls.length}/${canh.mock.calls.length}`,
		).toBe("4/0/0 0/0");
	});
});

describe("hlb-may-chu", () => {
	let app: INestApplication;
	let cookie = "";
	let nguoi = "";
	let phienToken = "";
	let congTyGoc = "";

	async function goi(thuTuc: string, ids: string[]): Promise<KetQua> {
		const res = await request(app.getHttpServer())
			.post(`/api/trpc/${thuTuc}`)
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ ids }));
		expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
		return res.body.result.data as KetQua;
	}

	type Loai = {
		ten: "contacts" | "companies" | "deals";
		gieo: (i: number) => Promise<string>;
		catSan: (id: string) => Promise<void>;
	};

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
		},
	];

	const idKhongCo = (id: string) => `${id.slice(0, -6)}zzzzzz`;

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

	test("hlb-may-chu: ket qua hang loat qua HTTP co errored 0 va giu luat dem cua V2d", async () => {
		const o: string[] = [];
		for (const l of LOAI) {
			const a = await l.gieo(1);
			const p = await l.gieo(2);
			await l.catSan(p);
			const x = idKhongCo(a);

			const cat = await goi(`${l.ten}.bulkArchive`, [a, p, x]);
			chot(
				Object.keys(cat).includes("errored"),
				"hlb: may chu khong tra errored",
			);
			expect(
				`${l.ten}:${JSON.stringify(cat.changedIds)} ${cat.succeeded}/${cat.skipped}/${cat.failed}/${cat.errored}`,
			).toBe(`${l.ten}:${JSON.stringify([a])} 1/1/1/0`);
			o.push(`${l.ten}/luu-tru`);

			const ve = await goi(`${l.ten}.bulkRestore`, [a, p, x]);
			chot(
				Object.keys(ve).includes("errored"),
				"hlb: may chu khong tra errored",
			);
			expect(`${l.ten}:${ve.failed}/${ve.errored}`).toBe(`${l.ten}:1/0`);
			o.push(`${l.ten}/khoi-phuc`);
		}
		expect(o.length).toBe(6);
	});
});
