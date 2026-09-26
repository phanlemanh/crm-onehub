import { afterEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AllowDecision } from "../src/allow-list";
import { ensureWorkspaceMembership } from "../src/organization";

const suffix = `${process.env.TEST_RUN_ID ?? "khong-gian-spec"}-dtoc`;
const CHO_PHEP: AllowDecision = { allowed: true, role: "member", source: "table" };

async function nguoi(ten: string) {
	const now = new Date();
	return db.user.create({
		data: {
			id: `${suffix}-${ten}`,
			name: ten,
			email: `${ten}@${suffix}.test`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	});
}

async function traKhoVe() {
	await db.member.deleteMany({ where: { userId: { startsWith: `${suffix}-` } } });
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() },
		update: { name: "CRM", slug: "crm" },
	});
}

afterEach(traKhoVe);

describe("khong gian mac dinh", () => {
	it("kho trong tao khong gian ten OneHub Center", async () => {
		await db.organization.deleteMany({ where: { id: WORKSPACE_ID } });
		const u = await nguoi("a");
		await ensureWorkspaceMembership(u.id, u.email, async () => CHO_PHEP);
		const ws = await db.organization.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
		expect(ws.name, "ten khong gian moi").toBe("OneHub Center");
	});

	it("kho da co khong gian CRM thi giu ten va slug", async () => {
		await traKhoVe();
		const u = await nguoi("b");
		await ensureWorkspaceMembership(u.id, u.email, async () => CHO_PHEP);
		const ws = await db.organization.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
		expect(ws.name, "doi du lieu cu").toBe("CRM");
		expect(ws.slug, "doi slug cu").toBe("crm");
	});
});
