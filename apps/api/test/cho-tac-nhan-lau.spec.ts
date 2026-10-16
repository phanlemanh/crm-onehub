import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { ghiThongBaoTacNhan } from "../../agent/agent/lib/thong-bao-tac-nhan";
import { createApp } from "../src/create-app";
import MAU_LUOT_GUI from "../../app/test/fixtures/cho-tac-nhan-lau-luot-gui.json";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ctnl${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = `${TIEN_TO}-a`;

let app: NestExpressApplication;
let cookie = "";
let agentId = "";

async function trpc(
	thuTuc: string,
	kieu: "query" | "mutation",
	vao?: { id: string },
): Promise<{ status: number; data: unknown }> {
	const goi =
		kieu === "query"
			? request(app.getHttpServer()).get(`/api/trpc/${thuTuc}`)
			: request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao ?? {}));
	const r = await goi.set("cookie", cookie);
	return { status: r.status, data: r.body?.result?.data };
}

async function soChuaDoc(): Promise<number> {
	const r = await trpc("thongBao.chuong", "query");
	expect(r.status).toBe(200);
	return (r.data as { soChuaDoc: number }).soChuaDoc;
}

async function hoiThoaiCoThongBao(): Promise<string> {
	const h = await db.agentConversation.create({
		data: { userId: NGUOI, kind: "BUILDER", title: "Hội thoại đọc" },
		select: { id: true },
	});
	await db.agentConversationSubmission.create({
		data: {
			conversationId: h.id,
			submittedById: NGUOI,
			clientRequestId: `gui-${crypto.randomUUID()}`,
			commandType: "CREATE_AGENT",
			message: { text: "dung", resources: [], attachments: [] },
			status: "ACCEPTED",
		},
	});
	await db.agentVersion.create({
		data: {
			agentId,
			number: Math.floor(Math.random() * 1_000_000),
			status: "DRAFT",
			instructions: "Tóm tắt.",
			manifest: {},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: NGUOI,
			sourceConversationId: h.id,
		},
	});
	expect(await ghiThongBaoTacNhan(db, h.id, "cho", new Date())).toBe(true);
	return h.id;
}

async function docLuc(conversationId: string): Promise<Date | null> {
	const t = await db.thongBao.findFirstOrThrow({
		where: { nguoiNhanId: NGUOI, duongDan: `/chat/${conversationId}` },
		select: { docLuc: true },
	});
	return t.docLuc;
}

beforeAll(async () => {
	app = await createApp();
	await gieoThanhVien(NGUOI, "member");
	cookie = (await mintPhien(NGUOI)).cookie;
	const agent = await db.agentDefinition.create({
		data: { name: "Tác nhân đọc", status: "DRAFT", createdById: NGUOI },
		select: { id: true },
	});
	agentId = agent.id;
}, 120_000);

afterAll(async () => {
	await db.thongBao.deleteMany({ where: { nguoiNhanId: NGUOI } });
	await db.agentVersion.deleteMany({ where: { agentId } });
	await db.agentConversation.deleteMany({ where: { userId: NGUOI } });
	await db.agentDefinition.deleteMany({ where: { id: agentId } });
	await db.session.deleteMany({ where: { userId: NGUOI } });
	await db.member.deleteMany({ where: { userId: NGUOI } });
	await db.user.deleteMany({ where: { id: NGUOI } });
	await app.close();
});

describe("cho-tac-nhan-lau", () => {
	test("doc-khi-mo: mo cuoc A danh dau thong bao cua A, B van chua doc", async () => {
		const a = await hoiThoaiCoThongBao();
		const b = await hoiThoaiCoThongBao();
		const truoc = await soChuaDoc();
		expect(await docLuc(a)).toBeNull();

		expect(
			(await trpc("conversations.markRead", "mutation", { id: a })).status,
		).toBe(200);

		expect(await docLuc(a), "doc khi mo — thong bao cua A").not.toBeNull();
		expect(await docLuc(b), "doc khi mo — thong bao cua B").toBeNull();
		expect(await soChuaDoc(), "doc khi mo — chuong giam dung 1").toBe(
			truoc - 1,
		);
	});

	test("doc-khi-mo: doi chung — mo cuoc khong co thong bao thi khong dong nao doi", async () => {
		const b = await hoiThoaiCoThongBao();
		const rong = await db.agentConversation.create({
			data: { userId: NGUOI, kind: "BUILDER", title: "Không thông báo" },
			select: { id: true },
		});
		const truoc = await soChuaDoc();
		expect(
			(await trpc("conversations.markRead", "mutation", { id: rong.id }))
				.status,
		).toBe(200);
		expect(await docLuc(b)).toBeNull();
		expect(await soChuaDoc()).toBe(truoc);
	});
	test("mau-luot-gui: hang gui builderById tra ve khop mau ma the dang dung doc", async () => {
		const h = await db.agentConversation.create({
			data: { userId: NGUOI, kind: "BUILDER", title: "Hội thoại mẫu" },
			select: { id: true },
		});
		await db.agentConversationSubmission.create({
			data: {
				conversationId: h.id,
				submittedById: NGUOI,
				clientRequestId: `gui-${crypto.randomUUID()}`,
				commandType: "CREATE_AGENT",
				message: MAU_LUOT_GUI.message,
				status: "SENDING",
				createdAt: new Date(MAU_LUOT_GUI.createdAt),
				sentAt: new Date(MAU_LUOT_GUI.createdAt),
			},
		});
		const r = await request(app.getHttpServer())
			.get(
				`/api/trpc/conversations.builderById?input=${encodeURIComponent(JSON.stringify({ id: h.id }))}`,
			)
			.set("cookie", cookie);
		expect(r.status).toBe(200);
		const hang = r.body?.result?.data?.submissions?.[0];
		expect(hang, "mau luot gui khop hang that").toEqual({
			...MAU_LUOT_GUI,
			id: hang?.id,
			clientRequestId: hang?.clientRequestId,
		});
	});
});
