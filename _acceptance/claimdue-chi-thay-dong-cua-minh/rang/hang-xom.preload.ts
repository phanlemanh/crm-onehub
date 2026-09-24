import { afterEach, beforeEach } from "bun:test";
import { appendFileSync } from "node:fs";
import { db } from "@crm/db";

const DAU = "hang-xom-rang";
const OUT = process.env.HANG_XOM_OUT;
if (!OUT) throw new Error("HANG_XOM_OUT chua dat");

let thu = 0;
let truoc = new Map<string, string>();

type DongLa = Awaited<ReturnType<typeof db.agentTask.findMany>>[number];

function hinh(row: DongLa) {
	return JSON.stringify(row);
}

beforeEach(async () => {
	await db.agentTask.deleteMany({ where: { reason: DAU } });
	const now = Date.now();
	const qua = (ms: number) => new Date(now - ms);
	await db.agentTask.createMany({
		data: [
			...Array.from({ length: 22 }, (_, i) => ({
				kind: "identify",
				priority: 1_000_050,
				dueAt: qua(60_000 + i),
			})),
			{ kind: "brand", priority: 1_000_900, dueAt: qua(60_000) },
			{ kind: "portrait", priority: 1_000_800, dueAt: qua(60_000) },
			{
				kind: "identify",
				priority: 1_000_050,
				dueAt: new Date(now + 3_600_000),
			},
		].map((row) => ({ ...row, reason: DAU, budget: 4 })),
	});
	const la = await db.agentTask.findMany({ where: { reason: DAU } });
	truoc = new Map(la.map((row) => [row.id, hinh(row)]));
});

afterEach(async () => {
	const sau = await db.agentTask.findMany({ where: { reason: DAU } });
	const con = new Set(sau.map((row) => row.id));
	const doi = sau.filter(
		(row) => truoc.has(row.id) && truoc.get(row.id) !== hinh(row),
	).length;
	const mat = [...truoc.keys()].filter((id) => !con.has(id)).length;
	appendFileSync(
		OUT,
		`${JSON.stringify({ thu: thu++, truoc: truoc.size, doi, mat })}\n`,
	);
	await db.agentTask.deleteMany({ where: { reason: DAU } });
});
