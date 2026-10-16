import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db, Prisma } from "@crm/db";
import { parseNoiDungThongBao, THONG_BAO } from "@crm/validation/thong-bao";
import type { ChannelEvents } from "eve/channels";
import { crmEvents } from "../agent/channels/crm";
import { builderToken } from "../agent/lib/custom-agent-dispatch";
import {
	baoTacNhan,
	ghiThongBaoTacNhan,
} from "../agent/lib/thong-bao-tac-nhan";
import MAU_NOI_DUNG from "./fixtures/cho-tac-nhan-lau-noi-dung.json";

type SuKien =
	| "session.waiting"
	| "session.failed"
	| "turn.failed"
	| "turn.cancelled";

const hau = crypto.randomUUID();
const nguoi = `cho-tac-nhan-${hau}`;
const TEN_TAC_NHAN = "Tóm tắt deal mỗi sáng";
let agentId = "";
let soPhienBan = 0;

const kenh = (token: string) => ({
	continuationToken: token,
	setContinuationToken() {},
});

type DuLieuLuot = Parameters<NonNullable<ChannelEvents["turn.failed"]>>[0];
type DuLieuPhien = Parameters<NonNullable<ChannelEvents["session.failed"]>>[0];

const LOI_LUOT = { code: "TURN_FAILED", message: "hong" } satisfies DuLieuLuot;
const LOI_PHIEN = {
	code: "SESSION_FAILED",
	message: "hong",
} satisfies DuLieuPhien;

function xuLy<K extends SuKien>(suKien: K): NonNullable<ChannelEvents[K]> {
	const ham = crmEvents[suKien];
	if (!ham) throw new Error(`kenh crm khong xu ly ${suKien}`);
	return ham;
}

async function phat(suKien: SuKien, token: string): Promise<void> {
	const k = kenh(token);
	const ctx = undefined as never;
	if (suKien === "session.waiting") await xuLy("session.waiting")({}, k, ctx);
	else if (suKien === "turn.cancelled")
		await xuLy("turn.cancelled")({}, k, ctx);
	else if (suKien === "turn.failed")
		await xuLy("turn.failed")(LOI_LUOT, k, ctx);
	else await xuLy("session.failed")(LOI_PHIEN, k, ctx);
}

async function taoHoiThoai(): Promise<string> {
	const h = await db.agentConversation.create({
		data: { userId: nguoi, kind: "BUILDER", title: "Hội thoại mẫu" },
		select: { id: true },
	});
	return h.id;
}

async function gui(
	conversationId: string,
	commandType: "CHAT" | "CREATE_AGENT" = "CREATE_AGENT",
): Promise<string> {
	const s = await db.agentConversationSubmission.create({
		data: {
			conversationId,
			submittedById: nguoi,
			clientRequestId: `gui-${crypto.randomUUID()}`,
			commandType,
			message: { text: "dung tac nhan", resources: [], attachments: [] },
			status: "ACCEPTED",
		},
		select: { id: true },
	});
	return s.id;
}

async function luuBanNhap(conversationId: string): Promise<void> {
	soPhienBan += 1;
	await db.agentVersion.create({
		data: {
			agentId,
			number: soPhienBan,
			status: "DRAFT",
			instructions: "Tóm tắt.",
			manifest: {},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: nguoi,
			sourceConversationId: conversationId,
		},
	});
}

async function hoiCho(conversationId: string, coCauHoi: boolean) {
	await db.agentConversation.update({
		where: { id: conversationId },
		data: {
			pendingInputRequest: coCauHoi
				? { kind: "question", id: `cau-${crypto.randomUUID()}` }
				: Prisma.DbNull,
		},
	});
}

async function dong(conversationId: string) {
	const ds = await db.thongBao.findMany({
		where: {
			nguoiNhanId: nguoi,
			nguon: THONG_BAO.nguon.tacNhan,
			duongDan: `/chat/${conversationId}`,
		},
		orderBy: { taoLuc: "asc" },
	});
	return ds.map((d) => ({ ...d, nd: parseNoiDungThongBao(d.noiDung) }));
}

beforeAll(async () => {
	await db.user.create({
		data: { id: nguoi, name: nguoi, email: `${nguoi}@example.test` },
	});
	const agent = await db.agentDefinition.create({
		data: { name: TEN_TAC_NHAN, status: "DRAFT", createdById: nguoi },
		select: { id: true },
	});
	agentId = agent.id;
});

afterAll(async () => {
	await db.thongBao.deleteMany({ where: { nguoiNhanId: nguoi } });
	await db.agentVersion.deleteMany({ where: { agentId } });
	await db.agentConversation.deleteMany({ where: { userId: nguoi } });
	await db.agentDefinition.deleteMany({ where: { id: agentId } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("cho-tac-nhan-lau", () => {
	test("bao-khi-xong: ma tran viet truoc 9 o", async () => {
		const MA_TRAN: Array<{
			ten: string;
			chay: (id: string) => Promise<void>;
			loai: string[];
		}> = [
			{
				ten: "waiting co ban nhap moi -> xong",
				chay: async (id) => {
					await gui(id);
					await luuBanNhap(id);
					await phat("session.waiting", builderToken(id));
				},
				loai: ["tac-nhan-xong"],
			},
			{
				ten: "waiting co cau hoi cho -> can tra loi",
				chay: async (id) => {
					await gui(id);
					await hoiCho(id, true);
					await phat("session.waiting", builderToken(id));
				},
				loai: ["tac-nhan-can-tra-loi"],
			},
			{
				ten: "session.failed -> hong",
				chay: async (id) => {
					await gui(id);
					await phat("session.failed", builderToken(id));
				},
				loai: ["tac-nhan-hong"],
			},
			{
				ten: "turn.failed -> hong",
				chay: async (id) => {
					await gui(id);
					await phat("turn.failed", builderToken(id));
				},
				loai: ["tac-nhan-hong"],
			},
			{
				ten: "turn.cancelled roi waiting -> khong bao",
				chay: async (id) => {
					await gui(id);
					await phat("turn.cancelled", builderToken(id));
					await phat("session.waiting", builderToken(id));
				},
				loai: [],
			},
			{
				ten: "waiting lap lai cung luot -> van 1",
				chay: async (id) => {
					await gui(id);
					await luuBanNhap(id);
					await phat("session.waiting", builderToken(id));
					await phat("session.waiting", builderToken(id));
				},
				loai: ["tac-nhan-xong"],
			},
			{
				ten: "hai luot gui khac nhau -> 2",
				chay: async (id) => {
					await gui(id);
					await luuBanNhap(id);
					await phat("session.waiting", builderToken(id));
					await gui(id);
					await luuBanNhap(id);
					await phat("session.waiting", builderToken(id));
				},
				loai: ["tac-nhan-xong", "tac-nhan-xong"],
			},
			{
				ten: "can tra loi, tra loi, roi xong -> 2 dung thu tu",
				chay: async (id) => {
					await gui(id);
					await hoiCho(id, true);
					await phat("session.waiting", builderToken(id));
					await gui(id);
					await hoiCho(id, false);
					await luuBanNhap(id);
					await phat("session.waiting", builderToken(id));
				},
				loai: ["tac-nhan-can-tra-loi", "tac-nhan-xong"],
			},
			{
				ten: "turn.failed roi session.failed cung luot -> 1",
				chay: async (id) => {
					await gui(id);
					await phat("turn.failed", builderToken(id));
					await phat("session.failed", builderToken(id));
				},
				loai: ["tac-nhan-hong"],
			},
		];
		const loi = spyOn(console, "error").mockImplementation(() => {});
		try {
			for (const o of MA_TRAN) {
				const id = await taoHoiThoai();
				await o.chay(id);
				const ds = await dong(id);
				expect(
					ds.map((d) => d.nd.loai),
					`bao khi xong: ${o.ten}`,
				).toEqual(o.loai);
				const luot = (
					await db.agentConversationSubmission.findMany({
						where: { conversationId: id },
						select: { id: true },
					})
				).map((x) => x.id);
				for (const d of ds) {
					expect(d.duongDan, `duong dan: ${o.ten}`).toBe(`/chat/${id}`);
					expect(luot, `luot that: ${o.ten}`).toContain(
						"luotId" in d.nd ? d.nd.luotId : "",
					);
					const mau = MAU_NOI_DUNG[d.nd.loai as keyof typeof MAU_NOI_DUNG];
					expect(d.nd, `mau noi dung khop ban ghi that: ${o.ten}`).toEqual({
						...mau,
						conversationId: id,
						luotId: "luotId" in d.nd ? d.nd.luotId : "",
					});
				}
				if (ds.length > 0) {
					const h = await db.agentConversation.findUniqueOrThrow({
						where: { id },
						select: { lastAssistantAt: true },
					});
					expect(
						h.lastAssistantAt,
						`co dieu moi cho nguoi dung: ${o.ten}`,
					).not.toBeNull();
				}
				const xong = ds.find((d) => d.nd.loai === "tac-nhan-xong");
				if (xong)
					expect(xong.nd, `ten tac nhan: ${o.ten}`).toMatchObject({
						ten: TEN_TAC_NHAN,
					});
			}
		} finally {
			loi.mockRestore();
		}
		console.log(`bao-khi-xong: ${MA_TRAN.length}/${MA_TRAN.length} o`);
	});

	test("bao-khi-xong: doi chung — luot tro chuyen va token khong phai bo dung", async () => {
		const id = await taoHoiThoai();
		await gui(id, "CHAT");
		await phat("session.waiting", builderToken(id));
		await phat("turn.failed", builderToken(id));
		expect(
			await dong(id),
			"luot tro chuyen khong co ban nhap -> khong bao",
		).toEqual([]);
		const truoc = await db.thongBao.count({ where: { nguoiNhanId: nguoi } });
		await phat("session.waiting", "khong-phai-bo-dung");
		expect(await db.thongBao.count({ where: { nguoiNhanId: nguoi } })).toBe(
			truoc,
		);
	});

	test("ghi-hong: bo ghi nem loi thi vong doi van ghi va khong nem", async () => {
		const id = await taoHoiThoai();
		await gui(id);
		await luuBanNhap(id);
		const loi = spyOn(console, "error").mockImplementation(() => {});
		try {
			await baoTacNhan(id, "cho", async () => {
				throw new Error("co so du lieu tu choi");
			});
			expect(
				loi.mock.calls.map((g) => String(g[0])),
				"thong bao tac nhan",
			).toContain(`[agent] thong bao tac nhan ${id}: co so du lieu tu choi`);
		} finally {
			loi.mockRestore();
		}
		expect(await dong(id), "bo ghi hong -> khong dong nao").toEqual([]);

		await phat("session.waiting", builderToken(id));
		const h = await db.agentConversation.findUniqueOrThrow({
			where: { id },
			select: { continuationToken: true },
		});
		expect(h.continuationToken, "vong doi van ghi").toBe(builderToken(id));
		expect(
			(await dong(id)).map((d) => d.nd.loai),
			"doi chung: bo ghi that thi co dong",
		).toEqual(["tac-nhan-xong"]);
		expect(
			await ghiThongBaoTacNhan(db, id, "cho", new Date()),
			"ghi lai cung luot thi khong them",
		).toBe(false);
	});
});
