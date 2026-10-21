import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db, type FieldEntity } from "@crm/db";
import type { FieldTypeName } from "@crm/db/fields";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { dealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien } from "./phien-thu";

const CO_BIEN = process.env.LMT_TOC_DO === "1";
const GOI_RIENG = process.argv.some((arg) => arg.includes("lmt-toc-do"));
const RUN = (process.env.TEST_RUN_ID ?? "local")
	.replace(/[^a-z0-9]/gi, "")
	.toLowerCase()
	.slice(-10);
const tienTo = `lmttocdo${RUN}`;
const quanTri = `lmt-toc-do-${RUN}`;

const MAU = { tong: 5000, lo: 100, luot: 5, pageSize: 25, phanCo: 10 };
const NGUONG = { tranMs: 1000 };
const KIEU: FieldTypeName[] = [
	"TEXT",
	"NUMBER",
	"DATE",
	"CHECKBOX",
	"SELECT",
	"USER",
];

const agent = {
	withCrmEvents: withDiscardedCrmEvents,
	fieldBackfillRecords: async (
		_e: FieldEntity,
		_k: string[],
		ids: string[],
	) => ({
		queued: ids.length,
		merged: 0,
	}),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent);
const deals = new DealsService(
	db,
	agent,
	new ActivityStampService(db),
	new ConversionService(db),
	fields,
);

let companyId = "";
const truong = new Map<
	FieldTypeName,
	{ id: string; key: string; lua: string }
>();

function trungVi(so: number[]): number {
	const xep = [...so].sort((a, b) => a - b);
	return xep[Math.floor(xep.length / 2)] ?? 0;
}

function giaTri(type: FieldTypeName, i: number): string | number | boolean {
	switch (type) {
		case "TEXT":
			return `a ${i % 97}`;
		case "NUMBER":
			return (i * 104729) % 1000;
		case "DATE": {
			const ngay = new Date();
			ngay.setDate(1 + (i % 60));
			return ngay.toISOString().slice(0, 10);
		}
		case "CHECKBOX":
			return i % 2 === 0;
		case "SELECT":
			return truong.get("SELECT")?.lua ?? "";
		default:
			return quanTri;
	}
}

async function doLuot(locTruong: Record<string, string[]>) {
	const input = dealListInput.parse({
		q: tienTo,
		pageSize: MAU.pageSize,
		fields: locTruong,
	});
	await deals.list(input);
	const ms: number[] = [];
	let total = 0;
	for (let i = 0; i < MAU.luot; i++) {
		const t = performance.now();
		const out = await deals.list(input);
		ms.push(performance.now() - t);
		total = out.total;
	}
	return { ms: trungVi(ms), total };
}

it("lmt-toc-do: lệnh eval phải đặt LMT_TOC_DO=1", () => {
	if (GOI_RIENG && !CO_BIEN) throw new Error("lmt toc do: thieu bien");
	expect(true).toBe(true);
});

describe.skipIf(!CO_BIEN)("lmt-toc-do", () => {
	beforeAll(async () => {
		await gieoThanhVien(quanTri, "owner");
		const company = await db.company.create({
			data: { name: `${tienTo} cong ty`, domain: `${tienTo}.test` },
			select: { id: true },
		});
		companyId = company.id;
		for (const type of KIEU) {
			const field = await fields.create(quanTri, {
				entity: "DEAL",
				label: `${tienTo} ${type}`,
				type,
				options: type === "SELECT" ? [{ label: "A" }] : [],
				agentFilled: false,
				agentBrief: null,
				required: false,
				showOnSheet: true,
				showOnTable: false,
				showOnFilter: true,
			});
			truong.set(type, {
				id: field.id,
				key: field.key,
				lua: field.options[0]?.id ?? "",
			});
		}

		for (let dau = 0; dau < MAU.tong; dau += MAU.lo) {
			await Promise.all(
				Array.from(
					{ length: Math.min(MAU.lo, MAU.tong - dau) },
					async (_, k) => {
						const i = dau + k;
						const deal = await deals.create({
							name: `${tienTo} ${String(i).padStart(5, "0")}`,
							companyId,
							ownerId: quanTri,
							amountCents: ((i * 7919) % 100000) * 100,
						});
						if (i % MAU.phanCo === 0) return;
						await deals.update(deal.id, {
							fields: Object.fromEntries(
								KIEU.map((type) => [
									truong.get(type)?.key ?? "",
									giaTri(type, i),
								]),
							),
						});
					},
				),
			);
		}
	}, 900_000);

	afterAll(async () => {
		await db.deal.deleteMany({ where: { companyId } });
		await db.fieldDefinition.deleteMany({
			where: { id: { in: [...truong.values()].map((t) => t.id) } },
		});
		await db.company.deleteMany({ where: { id: companyId } });
		await db.member.deleteMany({ where: { userId: quanTri } });
		await db.user.deleteMany({ where: { id: quanTri } });
		const con = await db.deal.count({
			where: { name: { startsWith: tienTo } },
		});
		if (con !== 0) throw new Error(`lmt toc do: don de lai ${con}`);
	});

	it("lmt-toc-do: ba bộ lọc trường trên 5.000 thoả thuận dưới 1 giây", async () => {
		const n = await db.deal.count({ where: { name: { startsWith: tienTo } } });
		if (n !== MAU.tong) throw new Error(`lmt toc do: mau ${n}`);

		const khongLoc = await doLuot({});
		const coLoc = await doLuot({
			[truong.get("NUMBER")?.key ?? ""]: ["gte:10", "lte:500"],
			[truong.get("DATE")?.key ?? ""]: ["this-month", "none"],
			[truong.get("TEXT")?.key ?? ""]: ["has:a"],
		});
		if (coLoc.total === 0) throw new Error("lmt toc do: fixture rong");

		console.log(
			`lmt toc do: trung vi ba bo loc ${coLoc.ms.toFixed(1)} ms (${coLoc.total} hang) · khong loc truong ${khongLoc.ms.toFixed(1)} ms`,
		);

		if (coLoc.ms > NGUONG.tranMs) {
			throw new Error(`lmt toc do: tran ${coLoc.ms.toFixed(1)}`);
		}
		expect(coLoc.total).toBeGreaterThan(0);
	}, 900_000);
});
