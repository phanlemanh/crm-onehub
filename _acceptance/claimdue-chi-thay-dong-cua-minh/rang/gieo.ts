import { db } from "@crm/db";

const DAU = "chung-luot-gieo";
const now = Date.now();

await db.agentTask.deleteMany({ where: { reason: DAU } });
await db.agentTask.createMany({
	data: Array.from({ length: 22 }, (_, i) => ({
		kind: "identify",
		reason: DAU,
		priority: 50,
		budget: 4,
		dueAt: new Date(now - 1000 - i),
	})),
});
const luc = new Date();
const k = await db.agentTask.count({
	where: {
		reason: DAU,
		finishedAt: null,
		dueAt: { lte: luc },
		OR: [{ leasedUntil: null }, { leasedUntil: { lt: luc } }],
	},
});
console.log(k);
await db.$disconnect();
