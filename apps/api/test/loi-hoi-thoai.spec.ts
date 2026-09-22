import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { workspaceSlug } from "@crm/db/workspace";
import { ConversationsService } from "../src/conversations/conversations.service";
import mau from "./fixtures/loi-hoi-thoai-events.json";

const hau = process.env.TEST_RUN_ID ?? "loi-hoi-thoai";
const nguoiA = `loi-a-${hau}`;
const nguoiB = `loi-b-${hau}`;
const thanhVien = `loi-thanh-vien-${hau}`;
const idSuKien = `evt_${hau}_loi`;

let hoiThoai = "";
let dichVu: ConversationsService;

async function donDep() {
	await db.agentEvent.deleteMany({ where: { id: idSuKien } });
	await db.agentConversation.deleteMany({ where: { userId: nguoiA } });
	await db.member.deleteMany({ where: { id: thanhVien } });
	await db.user.deleteMany({ where: { id: { in: [nguoiA, nguoiB] } } });
}

beforeAll(async () => {
	await donDep();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: DEFAULT_WORKSPACE_NAME,
			slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
			createdAt: new Date(),
		},
	});
	for (const id of [nguoiA, nguoiB]) {
		await db.user.create({
			data: { id, name: id, email: `${id}@example.test` },
		});
	}
	await db.member.create({
		data: {
			id: thanhVien,
			organizationId: WORKSPACE_ID,
			userId: nguoiA,
			role: "member",
			createdAt: new Date(),
		},
	});
	const conversation = await db.agentConversation.create({
		data: { userId: nguoiA, kind: "BUILDER" },
		select: { id: true },
	});
	hoiThoai = conversation.id;

	const [suKien] = mau;
	if (!suKien) throw new Error("fixture su kien loi rong");
	await db.agentEvent.create({
		data: {
			id: idSuKien,
			sessionId: `ses_${hau}_loi`,
			conversationId: hoiThoai,
			type: suKien.type,
			data: suKien.data,
			emittedAt: new Date(),
		},
	});

	dichVu = new ConversationsService(db);
});

afterAll(donDep);

describe("su-kien-loi", () => {
	test("su kien turn.failed giu code va message", async () => {
		const ra = await dichVu.events({ id: hoiThoai, limit: 50 }, nguoiA);
		const loi = ra.find((event) => event.type === "turn.failed");

		expect(loi?.data).toEqual({
			code: "TOOL_EXECUTION_FAILED",
			message: "search_crm: query too short",
		});
	});

	test("fixture su kien loi khop dau ra that", async () => {
		const ra = await dichVu.events({ id: hoiThoai, limit: 50 }, nguoiA);

		expect(
			ra.map(({ type, data }) => ({ type, data })),
			"fixture su kien loi khop dau ra that",
		).toEqual(mau);
	});

	test("nguoi khac khong doc duoc su kien", async () => {
		const loi = await dichVu
			.events({ id: hoiThoai, limit: 50 }, nguoiB)
			.then(() => null)
			.catch((error: unknown) =>
				error instanceof Error ? error.message : String(error),
			);

		expect(loi).toBe(`No conversation with id ${hoiThoai}.`);
	});
});
