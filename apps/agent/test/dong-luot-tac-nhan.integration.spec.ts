import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@crm/db";
import type { SendFn } from "eve/channels";
import ts from "typescript";
import hook from "../agent/hooks/dong-luot-tac-nhan";
import { dispatchAgentRun } from "../agent/lib/custom-agent-dispatch";
import { choKetLuot, LY_DO_DONG_LUOT } from "../agent/lib/dong-luot-tac-nhan";
import { stageRunResult } from "../agent/lib/run-runtime";
import "../agent/subagents/agent_runner/tools/finish_run";
import loiThat from "./fixtures/runner-loi-that.json";
import { trongNguCanhEve } from "./support/eve-ngu-canh";

const suffix = crypto.randomUUID();
const userId = `dong-luot-${suffix}`;
let agentId = "";
let versionId = "";

type ThuocTinh = Record<string, string>;
type NguCanhHook = {
	session: {
		id: string;
		auth: {
			current: { attributes: ThuocTinh };
			initiator: null;
		};
	};
};
type XuLyKetQua = (
	event: { type: string; data: object },
	ctx: NguCanhHook,
) => Promise<void>;

const xuLy = (hook.events as Record<string, unknown>)[
	"action.result"
] as XuLyKetQua;

function nguCanh(thuocTinh: ThuocTinh): NguCanhHook {
	return {
		session: {
			id: `dong-luot-session-${suffix}`,
			auth: { current: { attributes: thuocTinh }, initiator: null },
		},
	};
}

async function luotDangChay(): Promise<{ id: string; thuocTinh: ThuocTinh }> {
	const run = await db.agentRun.create({
		data: {
			agentId,
			versionId,
			triggerType: "MANUAL",
			status: "QUEUED",
			idempotencyKey: `dong-luot-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
	let thuocTinh: ThuocTinh = {};
	const send = (async (
		_message: unknown,
		options: { auth: { attributes: ThuocTinh } },
	) => {
		thuocTinh = options.auth.attributes;
		return { id: `dong-luot-session-${crypto.randomUUID()}` };
	}) as unknown as SendFn;
	await dispatchAgentRun(run.id, send);
	return { id: run.id, thuocTinh };
}

async function chayHook(data: object, thuocTinh: ThuocTinh) {
	await trongNguCanhEve(() =>
		xuLy({ type: "action.result", data }, nguCanh(thuocTinh)),
	);
}

async function docLuot(id: string) {
	const run = await db.agentRun.findUniqueOrThrow({
		where: { id },
		select: { status: true, errorCode: true, errorMessage: true, result: true, summary: true },
	});
	const soLanHong = await db.agentRunEvent.count({
		where: { runId: id, type: "run.failed" },
	});
	return { ...run, soLanHong };
}

function loiVoiOutput(output: unknown) {
	const goc = loiThat.su_kien.data;
	return { ...goc, result: { ...goc.result, output } };
}

beforeAll(async () => {
	await db.user.create({
		data: { id: userId, name: "Đóng lượt", email: `${userId}@example.test` },
	});
	const agent = await db.agentDefinition.create({
		data: { name: "Đóng lượt", status: "LIVE", createdById: userId },
		select: { id: true },
	});
	agentId = agent.id;
	const version = await db.agentVersion.create({
		data: {
			agentId,
			number: 1,
			status: "DEPLOYED",
			instructions: "Tóm tắt.",
			manifest: {
				triggers: [
					{ type: "MANUAL", name: "Chạy tay", summary: "Chạy tay", config: {} },
				],
				dataScope: { mode: "WORKSPACE", summary: "Workspace", resources: [] },
				actions: [{ type: "run.summary", provider: "crm", summary: "Tóm tắt" }],
			},
			modelId: "test/model",
			sandboxPolicy: {},
			createdById: userId,
			approvedAt: new Date(),
			deployedAt: new Date(),
		},
		select: { id: true },
	});
	versionId = version.id;
	await db.agentDefinition.update({
		where: { id: agentId },
		data: { currentVersionId: versionId },
	});
});

afterEach(async () => {
	await db.agentRun.updateMany({
		where: { agentId, status: { in: ["QUEUED", "RUNNING"] } },
		data: {
			status: "CANCELLED",
			errorCode: "TEST_CLEANUP",
			errorMessage: "Settled between tests.",
			finishedAt: new Date(),
		},
	});
});

afterAll(async () => {
	if (!agentId) return;
	await db.agentRunEvent.deleteMany({ where: { run: { agentId } } });
	await db.agentAuditEvent.deleteMany({ where: { agentId } });
	await db.agentRun.deleteMany({ where: { agentId } });
	await db.agentDefinition.updateMany({
		where: { id: agentId },
		data: { currentVersionId: null },
	});
	await db.agentVersion.deleteMany({ where: { agentId } });
	await db.agentDefinition.deleteMany({ where: { id: agentId } });
	await db.user.deleteMany({ where: { id: userId } });
});

describe("bao-loi", () => {
	it("bao-loi: loi that cua bo chay dong luot ngay, mang ly do nha cung cap", async () => {
		const luot = await luotDangChay();

		await chayHook(loiThat.su_kien.data, luot.thuocTinh);
		const sauHook = await docLuot(luot.id);

		expect(sauHook.status, "bo chay bao loi phai dong luot ngay").toBe("FAILED");
		expect(sauHook.errorCode).toBe("RUNNER_FAILED");
		expect(sauHook.errorMessage).toBe(
			loiThat.su_kien.data.result.output.message.slice(0, 1000),
		);
		expect(sauHook.soLanHong).toBe(1);

		await choKetLuot(luot.id);
		const sauKet = await docLuot(luot.id);
		expect(sauKet.status).toBe("FAILED");
		expect(sauKet.soLanHong).toBe(1);
	});

	it("bao-loi: ma tran dang output", async () => {
		const maTran: Array<[unknown, string]> = [
			[
				{ code: "SUBAGENT_EXECUTION_FAILED", message: "x".repeat(5000) },
				"x".repeat(1000),
			],
			["loi", LY_DO_DONG_LUOT.khongLyDo],
			[{}, LY_DO_DONG_LUOT.khongLyDo],
			[null, LY_DO_DONG_LUOT.khongLyDo],
		];
		let soO = 0;
		for (const [output, lyDo] of maTran) {
			const luot = await luotDangChay();
			await chayHook(loiVoiOutput(output), luot.thuocTinh);
			const sau = await docLuot(luot.id);
			expect(sau.status, "bo chay bao loi phai dong luot ngay").toBe("FAILED");
			expect(sau.errorCode).toBe("RUNNER_FAILED");
			expect(sau.errorMessage).toBe(lyDo);
			expect(sau.soLanHong).toBe(1);
			soO += 1;
		}
		expect(soO).toBe(4);
	});

	it("bao-loi: doi chung — khong phai loi cua bo chay thi luot van chay", async () => {
		const goc = loiThat.su_kien.data;
		const doiChung: Array<[object, (thuocTinh: ThuocTinh) => ThuocTinh]> = [
			[{ ...goc, result: { ...goc.result, isError: false } }, (t) => t],
			[{ ...goc, result: { ...goc.result, subagentName: "agent_builder" } }, (t) => t],
			[{ ...goc, result: { ...goc.result, kind: "tool-result" } }, (t) => t],
			[goc, (t) => ({ ...t, purpose: "research" })],
		];
		for (const [data, doiThuocTinh] of doiChung) {
			const luot = await luotDangChay();
			await chayHook(data, doiThuocTinh(luot.thuocTinh));
			expect(
				(await docLuot(luot.id)).status,
				"chi loi cua bo chay moi dong luot",
			).toBe("RUNNING");
			await db.agentRun.update({
				where: { id: luot.id },
				data: { status: "CANCELLED", finishedAt: new Date() },
			});
		}
	});

	it("bao-loi: luot da ket thuc thi khong doi, khong nem", async () => {
		const luot = await luotDangChay();
		await stageRunResult(luot.id, { summary: "xong", result: { a: 1 } });
		await choKetLuot(luot.id);

		await chayHook(loiThat.su_kien.data, luot.thuocTinh);

		const sau = await docLuot(luot.id);
		expect(sau.status).toBe("SUCCEEDED");
		expect(sau.soLanHong).toBe(0);
	});
});

describe("chua-nop", () => {
	it("chua-nop: phien xong ma bo chay chua nop thi luot Hong", async () => {
		const luot = await luotDangChay();

		await choKetLuot(luot.id);

		const sau = await docLuot(luot.id);
		expect(sau.status, "chua nop ket qua phai la Hong").toBe("FAILED");
		expect(sau.errorCode).toBe("RUNNER_NO_RESULT");
		expect(sau.errorMessage).toBe("Bộ chạy dừng trước khi nộp kết quả.");
		expect(sau.soLanHong).toBe(1);
	});

	it("chua-nop: doi chung — da nop thi luot Xong voi ket qua da nop", async () => {
		const luot = await luotDangChay();
		await stageRunResult(luot.id, { summary: "xong", result: { a: 1 } });

		await choKetLuot(luot.id);

		const sau = await docLuot(luot.id);
		expect(sau.status).toBe("SUCCEEDED");
		expect(sau.result).toEqual({ a: 1 });
		expect(sau.summary).toBe("xong");
	});

	it("chua-nop: nhanh session.completed cua kenh crm goi choKetLuot", () => {
		const duong = join(
			dirname(fileURLToPath(import.meta.url)),
			"..",
			"agent",
			"channels",
			"crm.ts",
		);
		const cay = ts.createSourceFile(
			duong,
			readFileSync(duong, "utf8"),
			ts.ScriptTarget.Latest,
			true,
		);
		let goiKetLuot = 0;
		let goiRunResultOf = 0;
		const duyet = (node: ts.Node, trongNhanh: boolean) => {
			const laNhanh =
				(ts.isMethodDeclaration(node) || ts.isPropertyAssignment(node)) &&
				node.name.getText() === '"session.completed"';
			const dangTrong = trongNhanh || laNhanh;
			if (dangTrong && ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
				if (node.expression.text === "choKetLuot") goiKetLuot += 1;
				if (node.expression.text === "runResultOf") goiRunResultOf += 1;
			}
			ts.forEachChild(node, (con) => duyet(con, dangTrong));
		};
		duyet(cay, false);
		expect(goiKetLuot, "chua nop ket qua phai la Hong").toBe(1);
		expect(goiRunResultOf).toBe(0);
	});
});
