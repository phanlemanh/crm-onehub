import {
	afterAll,
	beforeAll,
	describe,
	expect,
	it,
	setDefaultTimeout,
	spyOn,
} from "bun:test";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { workspaceSlug } from "@crm/db/workspace";
import { type InputRequested, schemas } from "@crm/validation";
import { SESSION_LIMIT_OPTION_IDS } from "@crm/validation/builder-question";
import { parseNoiDungThongBao, THONG_BAO } from "@crm/validation/thong-bao";
import { crmEvents } from "../../agent/agent/channels/crm";
import {
	builderToken,
	dispatchBuilderSubmission,
} from "../../agent/agent/lib/custom-agent-dispatch";
import hoiThat from "../../agent/test/fixtures/hai-luot-hoi-that.json";
import mauHetHanMuc from "../../agent/test/fixtures/session-limit-that.json";
import { ConversationsService } from "../src/conversations/conversations.service";

setDefaultTimeout(30_000);

const suffix = process.env.TEST_RUN_ID ?? "bao-loi-sau-cau-hoi";
const userId = `blth-${suffix}`;
const memberId = `blth-member-${suffix}`;
const TEN_TAC_NHAN = "Tóm tắt deal mỗi sáng";

type SuKien = typeof crmEvents;
type XuLy<K extends keyof SuKien> = NonNullable<SuKien[K]>;
type Kenh = Parameters<XuLy<"session.waiting">>[1];
type NguCanh = Parameters<XuLy<"input.requested">>[2];

let service: ConversationsService;
let agentId = "";
let soPhienBan = 0;

type Send = Parameters<typeof dispatchBuilderSubmission>[1];
type Lenh = "CHAT" | "CREATE_AGENT";
type LoaiCau = "lam-ro-1" | "lam-ro-2" | "het-han-muc";

const nguCanh = new Map<string, NguCanh>();
const KHONG_NGU_CANH = undefined as never;

function kenh(id: string): Kenh {
	const ops = {
		continuationToken: builderToken(id),
		setContinuationToken() {},
	};
	return ops as unknown as Kenh;
}

function cho(id: string): Parameters<XuLy<"session.waiting">>[0] {
	return { continuationToken: builderToken(id), wait: "next-user-message" };
}

function xuLy<K extends keyof SuKien>(ten: K): XuLy<K> {
	const ham = crmEvents[ten];
	if (!ham) throw new Error(`kenh crm khong xu ly ${ten}`);
	return ham as XuLy<K>;
}

async function guiTin(id: string, lenh: Lenh): Promise<string> {
	const bai = await service.submitBuilder(
		{
			id,
			clientRequestId: crypto.randomUUID(),
			commandType: lenh,
			message:
				lenh === "CREATE_AGENT"
					? "/Create agent Tong hop deal moi sang"
					: "Thêm cả deal của tuần trước nhé",
			resources: [],
			attachments: [],
		},
		userId,
	);
	return bai.id;
}

async function giao(id: string): Promise<string> {
	const dau = await db.agentConversationSubmission.findFirstOrThrow({
		where: { conversationId: id, status: "PENDING" },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true },
	});
	const send: Send = async (_tin, tuyChon) => {
		nguCanh.set(id, {
			session: {
				id: `ses_${id}`,
				auth: { current: tuyChon.auth, initiator: null },
			},
		} as unknown as NguCanh);
		return { id: `phien-${id}` } as Awaited<ReturnType<Send>>;
	};
	await dispatchBuilderSubmission(dau.id, send);
	return dau.id;
}

async function mo(lenh: Lenh): Promise<string> {
	const hoi = await service.createBuilder(
		{
			clientRequestId: crypto.randomUUID(),
			commandType: lenh,
			message:
				lenh === "CREATE_AGENT"
					? "/Create agent Tong hop deal moi sang"
					: "Deal nao sap chot tuan nay?",
			resources: [],
			attachments: [],
		},
		userId,
	);
	await giao(hoi.id);
	return hoi.id;
}

function suKienCau(loai: LoaiCau): InputRequested {
	if (loai === "het-han-muc") {
		return schemas.agents.inputRequested.parse(mauHetHanMuc.data);
	}
	return schemas.agents.inputRequested.parse(
		hoiThat[loai === "lam-ro-1" ? 0 : 1],
	);
}

async function karaHoi(id: string, loai: LoaiCau) {
	const ngu = nguCanh.get(id);
	if (!ngu) throw new Error("cuoc chua duoc giao cho Kara");
	await xuLy("input.requested")(suKienCau(loai), kenh(id), ngu);
	await xuLy("session.waiting")(cho(id), kenh(id), KHONG_NGU_CANH);
}

async function traLoi(id: string, loai: LoaiCau): Promise<string> {
	const cau = (await service.builderById(id, userId)).pendingQuestion;
	if (!cau) throw new Error("khong co cau hoi dang cho");
	const bai = await service.answerBuilderQuestion(
		{
			id,
			clientRequestId: crypto.randomUUID(),
			requestId: cau.requestId,
			optionId:
				loai === "het-han-muc"
					? SESSION_LIMIT_OPTION_IDS.continue
					: cau.options[0]?.id,
		},
		userId,
	);
	await giao(id);
	return bai.id;
}

async function hong(id: string, suKien: "turn.failed" | "session.failed") {
	if (suKien === "turn.failed") {
		await xuLy("turn.failed")(
			{ code: "TURN_FAILED", message: "hong", sequence: 0, turnId: "turn_0" },
			kenh(id),
			KHONG_NGU_CANH,
		);
		return;
	}
	await xuLy("session.failed")(
		{ code: "SESSION_FAILED", message: "hong", sessionId: `phien-${id}` },
		kenh(id),
	);
}

async function luuBanNhap(id: string) {
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
			createdById: userId,
			sourceConversationId: id,
		},
	});
}

async function thongBao(id: string) {
	const ds = await db.thongBao.findMany({
		where: {
			nguoiNhanId: userId,
			nguon: THONG_BAO.nguon.tacNhan,
			duongDan: `/chat/${id}`,
		},
		orderBy: { taoLuc: "asc" },
	});
	return ds.map((d) => ({ ...d, nd: parseNoiDungThongBao(d.noiDung) }));
}

const loai = async (id: string) => (await thongBao(id)).map((d) => d.nd.loai);

const luotCua = async (id: string, ten: string) =>
	(await thongBao(id)).find((d) => d.nd.loai === ten)?.nd;

let im: ReturnType<typeof spyOn>;

beforeAll(async () => {
	im = spyOn(console, "error").mockImplementation(() => {});
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
		data: { id: userId, name: "Nguoi dung", email: `${userId}@example.test` },
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
	const agent = await db.agentDefinition.create({
		data: { name: TEN_TAC_NHAN, status: "DRAFT", createdById: userId },
		select: { id: true },
	});
	agentId = agent.id;
	service = new ConversationsService(db);
});

afterAll(async () => {
	im.mockRestore();
	const ids = (
		await db.agentConversation.findMany({
			where: { userId },
			select: { id: true },
		})
	).map((h) => h.id);
	await db.thongBao.deleteMany({ where: { nguoiNhanId: userId } });
	await db.agentEvent.deleteMany({ where: { conversationId: { in: ids } } });
	await db.agentVersion.deleteMany({ where: { agentId } });
	await db.agentConversationSubmission.deleteMany({
		where: { conversationId: { in: ids } },
	});
	await db.agentConversation.deleteMany({ where: { userId } });
	await db.agentDefinition.deleteMany({ where: { id: agentId } });
	await db.member.deleteMany({ where: { id: memberId } });
	await db.user.deleteMany({ where: { id: userId } });
});

describe("bao-loi-sau-cau-hoi", () => {
	it("blth-mot-cau: dung, hoi mot cau, tra loi, turn.failed -> dung mot hong", async () => {
		const id = await mo("CREATE_AGENT");
		await karaHoi(id, "lam-ro-1");
		const luotTraLoi = await traLoi(id, "lam-ro-1");
		const truoc = (
			await db.agentConversation.findUniqueOrThrow({
				where: { id },
				select: { lastAssistantAt: true },
			})
		).lastAssistantAt;
		await Bun.sleep(5);
		await hong(id, "turn.failed");

		expect(await loai(id), "hong sau tra loi: mot-cau").toEqual([
			"tac-nhan-can-tra-loi",
			"tac-nhan-hong",
		]);
		const dong = (await thongBao(id)).find(
			(d) => d.nd.loai === "tac-nhan-hong",
		);
		expect(dong?.nguoiNhanId, "nguoi nhan la nguoi mo cuoc").toBe(userId);
		expect(dong?.duongDan).toBe(`/chat/${id}`);
		expect(dong?.nd, "hong gan voi lan gui tra loi").toMatchObject({
			conversationId: id,
			luotId: luotTraLoi,
		});
		const sau = (
			await db.agentConversation.findUniqueOrThrow({
				where: { id },
				select: { lastAssistantAt: true },
			})
		).lastAssistantAt;
		expect(truoc, "da co dieu moi tu luc hoi").not.toBeNull();
		expect(
			sau?.getTime() ?? 0,
			"hong danh dau cuoc co dieu moi",
		).toBeGreaterThan(truoc?.getTime() ?? Number.POSITIVE_INFINITY);
	});

	it("blth-hai-cau: dung, hai cau noi nhau, tra loi ca hai, session.failed -> dung mot hong", async () => {
		const id = await mo("CREATE_AGENT");
		await karaHoi(id, "lam-ro-1");
		await traLoi(id, "lam-ro-1");
		await karaHoi(id, "lam-ro-2");
		await traLoi(id, "lam-ro-2");
		await hong(id, "session.failed");

		expect(await loai(id), "hong sau tra loi: hai-cau").toEqual([
			"tac-nhan-can-tra-loi",
			"tac-nhan-can-tra-loi",
			"tac-nhan-hong",
		]);
	});

	it("blth-hai-su-kien: turn.failed roi session.failed cung luot sau tra loi -> van mot hong", async () => {
		const id = await mo("CREATE_AGENT");
		await karaHoi(id, "lam-ro-1");
		await traLoi(id, "lam-ro-1");
		await hong(id, "turn.failed");
		expect(await loai(id), "hong sau tra loi: hai-su-kien").toEqual([
			"tac-nhan-can-tra-loi",
			"tac-nhan-hong",
		]);
		await hong(id, "session.failed");
		expect(await loai(id), "dung mot hong: hai-su-kien").toEqual([
			"tac-nhan-can-tra-loi",
			"tac-nhan-hong",
		]);
	});

	it("blth-het-han-muc: het han muc, chon Cap them, turn.failed -> dung mot hong", async () => {
		const id = await mo("CREATE_AGENT");
		await karaHoi(id, "het-han-muc");
		await traLoi(id, "het-han-muc");
		await hong(id, "turn.failed");

		expect(await loai(id), "hong sau tra loi: het-han-muc").toEqual([
			"tac-nhan-can-tra-loi",
			"tac-nhan-hong",
		]);
	});

	it("blth-tro-chuyen: tro chuyen thuong, hoi, tra loi, turn.failed -> khong bao hong", async () => {
		const id = await mo("CHAT");
		await karaHoi(id, "lam-ro-1");
		const luotTraLoi = await traLoi(id, "lam-ro-1");
		const bai = await db.agentConversationSubmission.findUniqueOrThrow({
			where: { id: luotTraLoi },
			select: { commandType: true },
		});
		expect(bai.commandType, "quyen cua luot hoi duoc mang theo").toBe("CHAT");
		await hong(id, "turn.failed");

		expect(await loai(id), "tro chuyen khong bao hong").toEqual([
			"tac-nhan-can-tra-loi",
		]);
	});

	it("blth-chen-hong: tin tro chuyen chen giua luc dung, luot dung hong -> dung mot hong cua lan dung", async () => {
		const id = await mo("CREATE_AGENT");
		const luotDung = (
			await db.agentConversationSubmission.findFirstOrThrow({
				where: { conversationId: id },
				select: { id: true },
			})
		).id;
		const chen = await guiTin(id, "CHAT");
		await hong(id, "turn.failed");

		expect(await loai(id), "chen giua van bao hong").toEqual(["tac-nhan-hong"]);
		expect(
			await luotCua(id, "tac-nhan-hong"),
			"hong gan voi lan dung",
		).toMatchObject({
			luotId: luotDung,
		});
		const xepHang = await db.agentConversationSubmission.findUniqueOrThrow({
			where: { id: chen },
			select: { status: true },
		});
		expect(xepHang.status, "tin chen giua con xep hang").toBe("PENDING");
	});

	it("blth-chen-xong: tin tro chuyen chen giua luc dung, luot dung xong -> dung mot xong cua lan dung", async () => {
		const id = await mo("CREATE_AGENT");
		const luotDung = (
			await db.agentConversationSubmission.findFirstOrThrow({
				where: { conversationId: id },
				select: { id: true },
			})
		).id;
		await luuBanNhap(id);
		await guiTin(id, "CHAT");
		await xuLy("session.waiting")(cho(id), kenh(id), KHONG_NGU_CANH);

		expect(await loai(id), "chen giua van bao xong").toEqual(["tac-nhan-xong"]);
		expect(
			await luotCua(id, "tac-nhan-xong"),
			"xong gan voi lan dung",
		).toMatchObject({
			luotId: luotDung,
			ten: TEN_TAC_NHAN,
		});
	});

	it("blth-chen-roi-hong: luot dung hong, tin chen giua duoc giao roi cung hong -> van mot hong", async () => {
		const id = await mo("CREATE_AGENT");
		await guiTin(id, "CHAT");
		await hong(id, "turn.failed");
		await giao(id);
		await hong(id, "turn.failed");

		expect(
			await loai(id),
			"tro chuyen chen giua khong bao hong lan hai",
		).toEqual(["tac-nhan-hong"]);
	});
});
