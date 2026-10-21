import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db, type FieldEntity } from "@crm/db";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { dealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";
import { gieoThanhVien } from "./phien-thu";

const CO_BIEN = process.env.SMT_TOC_DO === "1";
const GOI_RIENG = process.argv.some((arg) => arg.includes("smt-toc-do"));
const RUN = (process.env.TEST_RUN_ID ?? "local")
	.replace(/[^a-z0-9]/gi, "")
	.toLowerCase()
	.slice(-10);
const tienTo = `smttocdo${RUN}`;
const quanTri = `smt-toc-do-${RUN}`;

const MAU = { tong: 5000, coGiaTri: 4510, lo: 100, luot: 5, pageSize: 25 };
const NGUONG = { boi: 3, tranMs: 1000 };

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
let fieldId = "";
let khoa = "";

function trungVi(so: number[]): number {
	const xep = [...so].sort((a, b) => a - b);
	return xep[Math.floor(xep.length / 2)] ?? 0;
}

async function doLuot(sort: string, page: number) {
	const input = dealListInput.parse({
		q: tienTo,
		sort,
		dir: "asc",
		page,
		pageSize: MAU.pageSize,
	});
	await deals.list(input);
	const ms: number[] = [];
	let rows: { id: string }[] = [];
	for (let i = 0; i < MAU.luot; i++) {
		const t = performance.now();
		const out = await deals.list(input);
		ms.push(performance.now() - t);
		rows = out.rows;
	}
	return { ms: trungVi(ms), rows };
}

it("smt-toc-do: lệnh eval phải đặt SMT_TOC_DO=1", () => {
	if (GOI_RIENG && !CO_BIEN) throw new Error("smt toc do: thieu bien");
	expect(true).toBe(true);
});

describe.skipIf(!CO_BIEN)("smt-toc-do", () => {
	beforeAll(async () => {
		await gieoThanhVien(quanTri, "owner");
		const company = await db.company.create({
			data: { name: `${tienTo} cong ty`, domain: `${tienTo}.test` },
			select: { id: true },
		});
		companyId = company.id;
		const field = await fields.create(quanTri, {
			entity: "DEAL",
			label: `${tienTo} so`,
			type: "NUMBER",
			options: [],
			agentFilled: false,
			agentBrief: null,
			required: false,
			showOnSheet: true,
			showOnTable: false,
			showOnFilter: false,
		});
		fieldId = field.id;
		khoa = field.key;

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
						if (i < MAU.coGiaTri) {
							await deals.update(deal.id, {
								fields: { [khoa]: (i * 104729) % 1000003 },
							});
						}
					},
				),
			);
		}
	}, 600_000);

	afterAll(async () => {
		await db.deal.deleteMany({ where: { companyId } });
		await db.fieldDefinition.deleteMany({ where: { id: fieldId } });
		await db.company.deleteMany({ where: { id: companyId } });
		await db.member.deleteMany({ where: { userId: quanTri } });
		await db.user.deleteMany({ where: { id: quanTri } });
		const con = await db.deal.count({
			where: { name: { startsWith: tienTo } },
		});
		if (con !== 0) throw new Error(`smt toc do: don de lai ${con}`);
	});

	it("smt-toc-do: sắp theo trường Số không chậm hơn ba lần sắp theo Giá trị", async () => {
		const n = await db.deal.count({ where: { name: { startsWith: tienTo } } });
		if (n !== MAU.tong) throw new Error(`smt toc do: mau ${n}`);

		const trangRanh = Math.floor(MAU.coGiaTri / MAU.pageSize) + 1;
		const truongDau = await doLuot(`field:${khoa}`, 1);
		const truongRanh = await doLuot(`field:${khoa}`, trangRanh);
		const amountDau = await doLuot("amount", 1);
		const amountRanh = await doLuot("amount", trangRanh);

		const coGiaTri = await db.fieldValue.findMany({
			where: { fieldId, dealId: { in: truongRanh.rows.map((r) => r.id) } },
			select: { dealId: true },
		});
		if (
			truongRanh.rows.length !== MAU.pageSize ||
			coGiaTri.length === 0 ||
			coGiaTri.length === MAU.pageSize
		) {
			throw new Error("smt toc do: fixture khong vat ranh");
		}

		console.log(
			`smt toc do: trung vi field trang 1 ${truongDau.ms.toFixed(1)} ms · field trang ${trangRanh} ${truongRanh.ms.toFixed(1)} ms · amount trang 1 ${amountDau.ms.toFixed(1)} ms · amount trang ${trangRanh} ${amountRanh.ms.toFixed(1)} ms`,
		);

		for (const [ten, f, a] of [
			["1", truongDau.ms, amountDau.ms],
			[String(trangRanh), truongRanh.ms, amountRanh.ms],
		] as const) {
			if (f > NGUONG.boi * a) {
				throw new Error(
					`smt toc do: cham ${ten} ${f.toFixed(1)} ${a.toFixed(1)}`,
				);
			}
			for (const ms of [f, a]) {
				if (ms > NGUONG.tranMs)
					throw new Error(`smt toc do: tran ${ten} ${ms.toFixed(1)}`);
			}
		}
		expect(truongDau.rows.length).toBe(MAU.pageSize);
	}, 600_000);
});
