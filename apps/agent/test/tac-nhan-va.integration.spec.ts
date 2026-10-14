import {
	afterAll,
	beforeAll,
	describe,
	expect,
	it,
	setDefaultTimeout,
	spyOn,
} from "bun:test";
import { readFileSync } from "node:fs";
import { db } from "@crm/db";
import { type InputRequested, schemas } from "@crm/validation";
import { builderQuestion } from "@crm/validation/builder-question";
import type { ChannelEvents, SendFn } from "eve/channels";
import { z } from "zod";
import { crmEvents } from "../agent/channels/crm";
import {
	builderSessionAttributes,
	builderToken,
	dispatchBuilderSubmission,
} from "../agent/lib/custom-agent-dispatch";

setDefaultTimeout(30_000);

type Loai = "question" | "session-limit";
type DuLieu = Parameters<NonNullable<ChannelEvents["input.requested"]>>[0];

const duongRa = process.env.TNV_HAI_LUOT_RA;
if (!duongRa)
	throw new Error("thieu TNV_HAI_LUOT_RA — chay qua lenh tnv_cau_hoi");
const payload = z
	.array(schemas.agents.inputRequested)
	.parse(JSON.parse(readFileSync(duongRa, "utf8")));

const theoLoai = (loai: Loai) =>
	payload.filter((item) => item.requests[0]?.kind === loai);

const hau = crypto.randomUUID();
const nguoi = `tac-nhan-va-${hau}`;
const hoiThoai: string[] = [];

const kenh = (id: string) =>
	({
		continuationToken: builderToken(id),
		setContinuationToken() {},
	}) as unknown as Parameters<NonNullable<ChannelEvents["input.requested"]>>[1];

const ngu = (id: string) =>
	({
		session: {
			auth: {
				current: {
					attributes: builderSessionAttributes({
						commandType: "CREATE_AGENT",
						conversationId: id,
						userId: nguoi,
						submissionId: `bai-nop-${id}`,
						hasTitle: true,
					}),
				},
				initiator: null,
			},
		},
	}) as unknown as Parameters<NonNullable<ChannelEvents["input.requested"]>>[2];

async function goiKenh(id: string, data: InputRequested) {
	const xuLy = crmEvents["input.requested"];
	if (!xuLy) throw new Error("kenh crm khong xu ly input.requested");
	await xuLy(data as DuLieu, kenh(id), ngu(id));
}

async function taoHoiThoai(
	kind: "BUILDER" | "RECORD" = "BUILDER",
	sessionId: string | null = `phien-${crypto.randomUUID()}`,
) {
	const hang = await db.agentConversation.create({
		data: { kind, userId: nguoi, sessionId },
		select: { id: true },
	});
	hoiThoai.push(hang.id);
	return hang.id;
}

async function doc(id: string) {
	const hang = await db.agentConversation.findUniqueOrThrow({
		where: { id },
		select: { pendingInputRequest: true },
	});
	return {
		cauHoi: builderQuestion.parse(hang.pendingInputRequest),
		soSuKien: await db.agentEvent.count({
			where: { id: { startsWith: `builder-input:${id}:` } },
		}),
	};
}

async function traLoi(id: string, data: InputRequested) {
	const yeuCau = data.requests[0];
	if (!yeuCau) throw new Error("payload khong co cau hoi");
	const baiNop = await db.agentConversationSubmission.create({
		data: {
			conversationId: id,
			submittedById: nguoi,
			clientRequestId: `tra-loi-${crypto.randomUUID()}`,
			inputRequestId: yeuCau.requestId,
			commandType: "CREATE_AGENT",
			message: {
				text: "tra loi",
				resources: [],
				attachments: [],
				inputResponse: {
					requestId: yeuCau.requestId,
					optionId: yeuCau.options?.[0]?.id ?? "continue",
					kind: yeuCau.kind,
				},
			},
		},
		select: { id: true },
	});
	const send: SendFn = async () =>
		({ id: `phien-tiep-${id}` }) as Awaited<ReturnType<SendFn>>;
	await dispatchBuilderSubmission(baiNop.id, send);
}

const toaDo = (item: InputRequested) =>
	[item.sequence, item.stepIndex, item.turnId] as const;

function khongLonHon(sau: InputRequested, truoc: InputRequested): boolean {
	const [a, b, c] = toaDo(sau);
	const [x, y, z] = toaDo(truoc);
	if (a !== x) return a < x;
	if (b !== y) return b < y;
	return c <= z;
}

beforeAll(async () => {
	await db.user.create({
		data: { id: nguoi, name: nguoi, email: `${nguoi}@example.test` },
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
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("cau-hoi-luot-sau", () => {
	const MA_TRAN: readonly Loai[] = ["question", "session-limit"];

	it("cau-hoi-luot-sau: payload eve that tai hien ca loi", () => {
		expect(MA_TRAN).toHaveLength(2);
		for (const loai of MA_TRAN) {
			const [truoc, sau] = theoLoai(loai);
			expect(theoLoai(loai), `${loai}: can dung hai payload`).toHaveLength(2);
			if (!truoc || !sau) throw new Error(`${loai}: thieu payload`);
			expect(
				sau.requests[0]?.requestId,
				`${loai}: hai cau phai khac requestId`,
			).not.toBe(truoc.requests[0]?.requestId);
			expect(
				khongLonHon(sau, truoc),
				`ca do khong tai hien loi — payload eve khong con trung toa do (${loai})`,
			).toBe(true);
		}
	});

	for (const loai of MA_TRAN) {
		it(`cau-hoi-luot-sau: ${loai} cua phien con moi duoc ghi`, async () => {
			const [truoc, sau] = theoLoai(loai);
			if (!truoc || !sau) throw new Error(`${loai}: thieu payload`);
			const id = await taoHoiThoai();

			await goiKenh(id, truoc);
			expect((await doc(id)).cauHoi?.requestId).toBe(
				truoc.requests[0]?.requestId,
			);

			await traLoi(id, truoc);
			expect((await doc(id)).cauHoi).toBe(null);

			await goiKenh(id, sau);
			const ket = await doc(id);
			expect(
				{ requestId: ket.cauHoi?.requestId, kind: ket.cauHoi?.kind },
				"cau hoi luot sau bi bo vi so toa do hai phien con",
			).toEqual({ requestId: sau.requests[0]?.requestId, kind: loai });
			expect(ket.soSuKien).toBe(2);
		});
	}
});

describe("cau-hoi-doi-chung", () => {
	const [dau] = theoLoai("question");

	it("cau-hoi-doi-chung: phat lai khong ghi them, cung phien con hoi tiep thi ghi, cau cu hon cau dang cho thi bo", async () => {
		if (!dau) throw new Error("thieu payload question");
		const yeuCau = dau.requests[0];
		if (!yeuCau) throw new Error("payload question rong");
		const id = await taoHoiThoai();
		await goiKenh(id, dau);
		const truoc = await doc(id);

		const loi = spyOn(console, "error");
		try {
			await goiKenh(id, dau);
			expect(await doc(id), "phat lai cung cau ghi them mot dong").toEqual(
				truoc,
			);
			expect(loi).toHaveBeenCalledTimes(0);
		} finally {
			loi.mockRestore();
		}

		const tiep: InputRequested = {
			...dau,
			stepIndex: dau.stepIndex + 2,
			requests: [{ ...yeuCau, requestId: `${yeuCau.requestId}-tiep` }],
		};
		await goiKenh(id, tiep);
		const sauTiep = await doc(id);
		expect(sauTiep.cauHoi?.requestId).toBe(`${yeuCau.requestId}-tiep`);
		expect(sauTiep.soSuKien).toBe(truoc.soSuKien + 1);

		const cu: InputRequested = {
			...dau,
			stepIndex: dau.stepIndex + 1,
			requests: [{ ...yeuCau, requestId: `${yeuCau.requestId}-cu` }],
		};
		await goiKenh(id, cu);
		expect(await doc(id), "cau cu hon de len cau dang cho").toEqual(sauTiep);
	});
});

describe("cau-hoi-bo-co-log", () => {
	const [dau] = theoLoai("question");

	async function demLoi(id: string) {
		if (!dau) throw new Error("thieu payload question");
		const loi = spyOn(console, "error");
		try {
			await goiKenh(id, dau);
			return loi.mock.calls.map((goi) => String(goi[0]));
		} finally {
			loi.mockRestore();
		}
	}

	const MA_TRAN = [
		{ ten: "hoi thoai ban ghi", tao: () => taoHoiThoai("RECORD") },
		{ ten: "hoi thoai chua co phien", tao: () => taoHoiThoai("BUILDER", null) },
	] as const;

	for (const o of MA_TRAN) {
		it(`cau-hoi-bo-co-log: ${o.ten} — bo cau hoi co mot dong loi`, async () => {
			const id = await o.tao();
			const dong = await demLoi(id);
			expect(dong, "cau hoi bi bo ma khong de lai dau vet").toHaveLength(1);
			expect(dong[0]).toContain(id);
			expect(
				await db.agentEvent.count({
					where: { id: { startsWith: `builder-input:${id}:` } },
				}),
			).toBe(0);
		});
	}
});
