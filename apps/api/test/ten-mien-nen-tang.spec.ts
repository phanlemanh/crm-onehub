import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CompaniesService } from "../src/companies/companies.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const HAU_TO = process.env.TEST_RUN_ID ?? "tthv-spec";
const TEN = `Titan thu ${HAU_TO}`;
const MIEN_THU = `tthv-thu-${HAU_TO}.vn`.toLowerCase();
const MIEN_THAT = `tthv-that-${HAU_TO}.vn`.toLowerCase();
const MIEN_MOI = `tthv-moi-${HAU_TO}.vn`.toLowerCase();

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

const agent = {
	contactCreated: async () => true,
	companyCreated: async () => undefined,
	companyRequested: async () => true,
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const stamp = new ActivityStampService(db);
const fields = new FieldsService(db, agent);
const companies = new CompaniesService(
	db,
	agent,
	new AgentQueueService(db),
	{ backfill: async () => undefined } as unknown as FaviconService,
	stamp,
	new ConversionService(db),
	fields,
);

async function don() {
	const cu = await db.company.findMany({
		where: { name: { startsWith: TEN } },
		select: { id: true },
	});
	const ids = cu.map((row) => row.id);
	await db.activity.deleteMany({ where: { companyId: { in: ids } } });
	await db.agentTask.deleteMany({ where: { companyId: { in: ids } } });
	await db.company.deleteMany({ where: { id: { in: ids } } });
}

const soCuaLuot = () =>
	db.company.count({ where: { name: { startsWith: TEN } } });

async function loiCua(viec: () => Promise<unknown>): Promise<Error> {
	try {
		await viec();
	} catch (error) {
		if (error instanceof Error) return error;
	}
	throw new Error("khong nem loi");
}

beforeAll(don);
afterAll(don);

describe("ac3", () => {
	test("tao voi ten mien nen tang bi tu choi, khong ghi gi", async () => {
		for (const [mien, ten] of [
			["https://www.facebook.com/titanmiennam", "Facebook"],
			["vn.linkedin.com", "LinkedIn"],
		] as const) {
			const loi = await loiCua(() =>
				companies.create({ name: TEN, domain: mien }),
			);
			expect(loi).toBeInstanceOf(BadRequestException);
			expect(loi.message).toContain(ten);
		}
		expect(
			await db.company.count({
				where: {
					name: { startsWith: TEN },
					domain: { in: ["facebook.com", "vn.linkedin.com"] },
				},
			}),
		).toBe(0);
		expect(await soCuaLuot()).toBe(0);
	});

	test("sua sang ten mien nen tang bi tu choi, ten mien cu giu nguyen", async () => {
		const congTy = await db.company.create({
			data: { name: `${TEN} sua`, domain: MIEN_THU },
			select: { id: true },
		});
		const loi = await loiCua(() =>
			companies.update(congTy.id, { domain: "zalo.me/123" }),
		);
		expect(loi).toBeInstanceOf(BadRequestException);
		expect(loi.message).toContain("Zalo");
		const sau = await db.company.findUnique({
			where: { id: congTy.id },
			select: { domain: true },
		});
		expect(sau?.domain).toBe(MIEN_THU);

		await companies.update(congTy.id, { domain: MIEN_MOI });
		const doi = await db.company.findUnique({
			where: { id: congTy.id },
			select: { domain: true },
		});
		expect(doi?.domain).toBe(MIEN_MOI);
		await db.company.delete({ where: { id: congTy.id } });
	});

	test("doi chung duong: ten mien that tao duoc", async () => {
		const tao = await companies.create({
			name: `${TEN} that`,
			domain: MIEN_THAT,
		});
		expect(tao.domain).toBe(MIEN_THAT);
		await don();
	});
});

describe("ac1-may-chu", () => {
	test("ba chuoi cua man gui thang deu bi tu choi", async () => {
		expect(dauVao.tao.length).toBe(3);
		for (const [i, chuoi] of dauVao.tao.entries()) {
			const loi = await loiCua(() =>
				companies.create({ name: TEN, domain: chuoi }),
			);
			expect(loi).toBeInstanceOf(BadRequestException);
			expect(loi.message).toContain(dauVao.tenNenTang[i] ?? "");
		}
		expect(await soCuaLuot()).toBe(0);
	});
});
