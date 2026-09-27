import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { schemas } from "@crm/validation";
import {
	builderQuestion,
	SESSION_LIMIT_OPTION_IDS,
} from "@crm/validation/builder-question";
import type { SendFn } from "eve/channels";
import { persistBuilderInputRequest } from "../agent/lib/builder-input";
import {
	builderToken,
	dispatchBuilderSubmission,
} from "../agent/lib/custom-agent-dispatch";
import mauHetHanMuc from "./fixtures/session-limit-that.json";

const suffix = crypto.randomUUID();
const userId = `het-han-muc-${suffix}`;
const hoiThoai: string[] = [];

const suKien = schemas.agents.inputRequested.parse(mauHetHanMuc.data);
const yeuCau = suKien.requests[0];
if (yeuCau?.kind !== "session-limit") {
	throw new Error("mau session-limit-that.json khong con la session-limit");
}

const cauHoiThuong = {
	kind: "question" as const,
	requestId: `cau-hoi-${suffix}`,
	prompt: "Which channel should receive this?",
	action: {
		kind: "tool-call" as const,
		callId: `call-cau-hoi-${suffix}`,
		toolName: "ask_question",
		input: { prompt: "Which channel should receive this?" },
	},
	display: "select" as const,
	options: [{ id: "C123", label: "#sales" }],
};

const chiDuyetCongCu = {
	...cauHoiThuong,
	kind: "tool-approval" as const,
	requestId: `duyet-${suffix}`,
};

async function taoHoiThoai(
	sessionId: string | null = `phien-${crypto.randomUUID()}`,
) {
	const hang = await db.agentConversation.create({
		data: { kind: "BUILDER", userId, sessionId },
		select: { id: true },
	});
	hoiThoai.push(hang.id);
	return hang.id;
}

const voiYeuCau = (request: typeof cauHoiThuong | typeof chiDuyetCongCu) => ({
	...suKien,
	requests: [request],
});

async function docHoiThoai(id: string) {
	const hang = await db.agentConversation.findUniqueOrThrow({
		where: { id },
		select: { continuationToken: true, pendingInputRequest: true },
	});
	const suKienDaLuu = await db.agentEvent.findMany({
		where: { id: { startsWith: `builder-input:${id}:` } },
		select: { id: true },
	});
	return {
		continuationToken: hang.continuationToken,
		cauHoi: builderQuestion.parse(hang.pendingInputRequest),
		soSuKien: suKienDaLuu.length,
	};
}

beforeAll(async () => {
	await db.user.create({
		data: { id: userId, name: "Het han muc", email: `${userId}@example.test` },
	});
});

afterAll(async () => {
	await db.agentEvent.deleteMany({
		where: { conversationId: { in: hoiThoai } },
	});
	await db.agentConversationSubmission.deleteMany({
		where: { conversationId: { in: hoiThoai } },
	});
	await db.agentConversation.deleteMany({ where: { id: { in: hoiThoai } } });
	await db.user.deleteMany({ where: { id: userId } });
});

describe("luu-cau-hoi", () => {
	it("luu-cau-hoi: session-limit that duoc luu thanh cau hoi dang cho", async () => {
		const id = await taoHoiThoai();
		expect(
			await persistBuilderInputRequest(suKien, builderToken(id), id, true),
			"session-limit khong duoc luu",
		).toBe(true);

		const doc = await docHoiThoai(id);
		expect(doc.continuationToken).toBe(builderToken(id));
		expect(doc.soSuKien).toBe(1);
		expect(doc.cauHoi).toEqual({
			kind: "session-limit",
			requestId: yeuCau.requestId,
			prompt: yeuCau.prompt,
			display: "confirmation",
			options: [
				expect.objectContaining({ id: SESSION_LIMIT_OPTION_IDS.continue }),
				expect.objectContaining({ id: SESSION_LIMIT_OPTION_IDS.stop }),
			],
			allowFreeform: false,
		});
	});

	it("luu-cau-hoi: ma tran truc A — ba loai cau hoi", async () => {
		const MA_TRAN = [
			{ loai: "question", suKien: voiYeuCau(cauHoiThuong), luu: true },
			{ loai: "session-limit", suKien, luu: true },
			{ loai: "tool-approval", suKien: voiYeuCau(chiDuyetCongCu), luu: false },
		] as const;
		expect(MA_TRAN).toHaveLength(3);

		for (const o of MA_TRAN) {
			const id = await taoHoiThoai();
			const daLuu = await persistBuilderInputRequest(
				o.suKien,
				builderToken(id),
				id,
				true,
			);
			const doc = await docHoiThoai(id);
			expect({ loai: o.loai, daLuu, coCauHoi: doc.cauHoi !== null }).toEqual({
				loai: o.loai,
				daLuu: o.luu,
				coCauHoi: o.luu,
			});
			expect(doc.soSuKien).toBe(o.luu ? 1 : 0);
			if (o.luu) expect(doc.cauHoi?.kind).toBe(o.loai);
		}
	});

	it("luu-cau-hoi: phat lai cung su kien khong doi gi", async () => {
		const id = await taoHoiThoai();
		await persistBuilderInputRequest(suKien, builderToken(id), id, true);
		expect(
			await persistBuilderInputRequest(suKien, builderToken(id), id, true),
		).toBe(false);
		expect((await docHoiThoai(id)).soSuKien).toBe(1);
	});

	it("luu-cau-hoi: hoi thoai chua co phien thi khong luu", async () => {
		const id = await taoHoiThoai(null);
		expect(
			await persistBuilderInputRequest(suKien, builderToken(id), id, true),
		).toBe(false);
		expect(await docHoiThoai(id)).toEqual({
			continuationToken: null,
			cauHoi: null,
			soSuKien: 0,
		});
	});
});

describe("dieu-phoi", () => {
	const MA_TRAN = [
		SESSION_LIMIT_OPTION_IDS.continue,
		SESSION_LIMIT_OPTION_IDS.stop,
	] as const;

	for (const optionId of MA_TRAN) {
		it(`dieu-phoi: tra loi ${optionId} di toi eve bang inputResponses`, async () => {
			const id = await taoHoiThoai();
			await persistBuilderInputRequest(suKien, builderToken(id), id, true);
			const baiNop = await db.agentConversationSubmission.create({
				data: {
					conversationId: id,
					submittedById: userId,
					clientRequestId: `tra-loi-${crypto.randomUUID()}`,
					inputRequestId: yeuCau.requestId,
					commandType: "CREATE_AGENT",
					message: {
						text: optionId,
						resources: [],
						attachments: [],
						inputResponse: {
							requestId: yeuCau.requestId,
							optionId,
							kind: "session-limit",
						},
					},
				},
				select: { id: true },
			});

			const daGui: Parameters<SendFn>[] = [];
			const send: SendFn = async (...doiSo) => {
				daGui.push(doiSo);
				return { id: `phien-tiep-${optionId}` } as Awaited<ReturnType<SendFn>>;
			};
			await dispatchBuilderSubmission(baiNop.id, send);

			expect(daGui).toHaveLength(1);
			const [tinNhan, tuyChon] = daGui[0] ?? [];
			expect(tinNhan, "inputResponses").toEqual({
				inputResponses: [{ requestId: yeuCau.requestId, optionId }],
			});
			expect(tuyChon?.continuationToken).toBe(builderToken(id));

			const sau = await db.agentConversationSubmission.findUniqueOrThrow({
				where: { id: baiNop.id },
				select: { status: true },
			});
			expect(sau.status).toBe("ACCEPTED");
			const hoi = await db.agentConversation.findUniqueOrThrow({
				where: { id },
				select: { pendingInputRequest: true },
			});
			expect(hoi.pendingInputRequest).toBe(null);
		});
	}
});
