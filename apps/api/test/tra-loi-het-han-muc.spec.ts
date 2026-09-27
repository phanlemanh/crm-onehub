import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { workspaceSlug } from "@crm/db/workspace";
import { schemas } from "@crm/validation";
import {
	buildPendingInputRequest,
	SESSION_LIMIT_OPTION_IDS,
} from "@crm/validation/builder-question";
import mauHetHanMuc from "../../agent/test/fixtures/session-limit-that.json";
import { builderConversationDetailOutput } from "../src/conversations/conversations.contracts";
import { ConversationsService } from "../src/conversations/conversations.service";

const suffix = process.env.TEST_RUN_ID ?? "tra-loi-het-han-muc";
const userId = `tra-loi-het-han-muc-${suffix}`;
const memberId = `tra-loi-het-han-muc-member-${suffix}`;

const yeuCau = schemas.agents.inputRequested.parse(mauHetHanMuc.data)
	.requests[0];
if (yeuCau?.kind !== "session-limit") {
	throw new Error("mau session-limit-that.json khong con la session-limit");
}

let service: ConversationsService;

async function hoiThoaiDangCho(pending: object) {
	const hoi = await service.createBuilder(
		{
			clientRequestId: crypto.randomUUID(),
			commandType: "CREATE_AGENT",
			message: "/Create agent Tong hop contact moi hang ngay",
			resources: [],
			attachments: [],
		},
		userId,
	);
	await db.agentConversation.update({
		where: { id: hoi.id },
		data: {
			sessionId: `phien-${crypto.randomUUID()}`,
			continuationToken: `crm:builder:${hoi.id}`,
			pendingInputRequest: buildPendingInputRequest(pending, true),
		},
	});
	return hoi.id;
}

const traLoi = (
	id: string,
	cau: { requestId: string; optionId?: string; text?: string },
) =>
	service.answerBuilderQuestion(
		{ id, clientRequestId: crypto.randomUUID(), ...cau },
		userId,
	);

const soBaiTraLoi = (id: string) =>
	db.agentConversationSubmission.count({
		where: { conversationId: id, inputRequestId: { not: null } },
	});

beforeAll(async () => {
	await db.agentConversation.deleteMany({ where: { userId } });
	await db.member.deleteMany({ where: { id: memberId } });
	await db.user.deleteMany({ where: { id: userId } });
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
	await db.user.create({
		data: { id: userId, name: "Tra loi", email: `${userId}@example.test` },
	});
	await db.member.create({
		data: {
			id: memberId,
			organizationId: WORKSPACE_ID,
			userId,
			role: "member",
			createdAt: new Date(),
		},
	});
	service = new ConversationsService(db);
});

afterAll(async () => {
	const ids = (
		await db.agentConversation.findMany({
			where: { userId },
			select: { id: true },
		})
	).map((hoi) => hoi.id);
	await db.agentConversationSubmission.deleteMany({
		where: { conversationId: { in: ids } },
	});
	await db.agentConversation.deleteMany({ where: { userId } });
	await db.member.deleteMany({ where: { id: memberId } });
	await db.user.deleteMany({ where: { id: userId } });
});

describe("tra-loi", () => {
	it("tra-loi: builderById tra cau hoi session-limit qua contract that", async () => {
		const id = await hoiThoaiDangCho(yeuCau);
		const chiTiet = builderConversationDetailOutput.parse(
			await service.builderById(id, userId),
		);
		expect(chiTiet.pendingQuestion).toMatchObject({
			kind: "session-limit",
			requestId: yeuCau.requestId,
			allowFreeform: false,
		});
		expect(chiTiet.pendingQuestion?.options.map((option) => option.id)).toEqual(
			[SESSION_LIMIT_OPTION_IDS.continue, SESSION_LIMIT_OPTION_IDS.stop],
		);
	});

	for (const optionId of [
		SESSION_LIMIT_OPTION_IDS.continue,
		SESSION_LIMIT_OPTION_IDS.stop,
	]) {
		it(`tra-loi: ${optionId} tao dung mot bai nop mang inputResponse`, async () => {
			const id = await hoiThoaiDangCho(yeuCau);
			const ketQua = await traLoi(id, {
				requestId: yeuCau.requestId,
				optionId,
			});
			const baiNop = await db.agentConversationSubmission.findUniqueOrThrow({
				where: { id: ketQua.id },
				select: { inputRequestId: true, message: true, status: true },
			});
			expect(baiNop.inputRequestId).toBe(yeuCau.requestId);
			expect(baiNop.status).toBe("PENDING");
			expect(baiNop.message).toMatchObject({
				inputResponse: {
					requestId: yeuCau.requestId,
					optionId,
					kind: "session-limit",
				},
			});
			expect(await soBaiTraLoi(id)).toBe(1);
		});
	}

	const TU_CHOI = [
		{
			o: "chu tu do",
			cau: { text: "ok" },
			requestIdCu: false,
			loi: "Choose one of the available answers for this question.",
		},
		{
			o: "lua chon khong co",
			cau: { optionId: "khac" },
			requestIdCu: false,
			loi: "That answer is not available for this question.",
		},
		{
			o: "requestId cu",
			cau: { optionId: SESSION_LIMIT_OPTION_IDS.continue },
			requestIdCu: true,
			loi: "That follow-up question is no longer active.",
		},
	] as const;

	for (const ca of TU_CHOI) {
		it(`tra-loi: tu choi ${ca.o}, khong tao bai nop`, async () => {
			const id = await hoiThoaiDangCho(yeuCau);
			const requestId = ca.requestIdCu
				? `${yeuCau.requestId}:cu`
				: yeuCau.requestId;
			await expect(traLoi(id, { requestId, ...ca.cau })).rejects.toThrow(
				ca.loi,
			);
			expect(await soBaiTraLoi(id)).toBe(0);
		});
	}

	it("tra-loi: doi chung — cau hoi question cho phep chu van nhan chu", async () => {
		const id = await hoiThoaiDangCho({
			kind: "question",
			requestId: `cau-hoi-${suffix}`,
			prompt: "Ten kenh?",
			display: "text",
			options: [],
		});
		const ketQua = await traLoi(id, {
			requestId: `cau-hoi-${suffix}`,
			text: "#sales",
		});
		const baiNop = await db.agentConversationSubmission.findUniqueOrThrow({
			where: { id: ketQua.id },
			select: { message: true },
		});
		expect(baiNop.message).toMatchObject({
			inputResponse: { requestId: `cau-hoi-${suffix}`, text: "#sales" },
		});
	});
});
