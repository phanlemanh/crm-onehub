import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, writeAgentModel } from "@crm/db/settings";
import { Glob } from "bun";
import type { SendFn } from "eve/channels";
import ts from "typescript";
import { dispatchAgentRun } from "../agent/lib/custom-agent-dispatch";
import {
	modelChoBoChay,
	modelChoBoDung,
	modelChoPhienGoc,
} from "../agent/lib/model";

const GOC_AGENT = join(dirname(fileURLToPath(import.meta.url)), "..", "agent");
const suffix = crypto.randomUUID();
const userId = `model-theo-vai-${suffix}`;
let agentId = "";
let versionId = "";
let caiDatCu: {
	agentModelId: string | null;
	agentModelContextWindow: number | null;
} | null = null;

type ThuocTinh = Record<string, string>;

function nguCanh(thuocTinh: ThuocTinh) {
	return {
		session: {
			auth: { current: { attributes: thuocTinh }, initiator: null },
		},
	};
}

async function taoLuot() {
	return db.agentRun.create({
		data: {
			agentId,
			versionId,
			triggerType: "MANUAL",
			status: "QUEUED",
			idempotencyKey: `model-theo-vai-${crypto.randomUUID()}`,
			correlationId: crypto.randomUUID(),
			events: { create: { sequence: 0, type: "run.queued", data: {} } },
		},
		select: { id: true },
	});
}

async function dieuPhoi(runId: string): Promise<ThuocTinh> {
	let thuocTinh: ThuocTinh = {};
	const send = (async (
		_message: Parameters<SendFn>[0],
		options: { auth: { attributes: ThuocTinh } },
	) => {
		thuocTinh = options.auth.attributes;
		return { id: `model-theo-vai-session-${crypto.randomUUID()}` };
	}) as unknown as SendFn;
	await dispatchAgentRun(runId, send);
	return thuocTinh;
}

function cacTepAgent(): string[] {
	return [...new Glob("**/*.ts").scanSync(GOC_AGENT)].map((tep) =>
		join(GOC_AGENT, tep),
	);
}

function cay(duong: string) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
}

function duyet(node: ts.Node, gap: (node: ts.Node) => void) {
	gap(node);
	ts.forEachChild(node, (con) => duyet(con, gap));
}

function tepDocModelCuaBan(): string[] {
	const viPham: string[] = [];
	for (const duong of cacTepAgent()) {
		const ten = relative(GOC_AGENT, duong);
		if (ten === "lib/builder-runtime.ts") continue;
		duyet(cay(duong), (node) => {
			if (
				ts.isPropertyAccessExpression(node) &&
				node.name.text === "modelId" &&
				ts.isPropertyAccessExpression(node.expression) &&
				node.expression.name.text === "version"
			) {
				viPham.push(ten);
			}
			if (
				ts.isPropertyAssignment(node) &&
				ts.isIdentifier(node.name) &&
				node.name.text === "version" &&
				node.initializer.getText().includes("modelId")
			) {
				viPham.push(ten);
			}
		});
	}
	return [...new Set(viPham)];
}

function tepGoiReadAgentModel(): string[] {
	const ngoaiLe = new Set([
		"lib/model.ts",
		"lib/builder-runtime.ts",
		"hooks/telemetry.ts",
	]);
	const viPham: string[] = [];
	for (const duong of cacTepAgent()) {
		const ten = relative(GOC_AGENT, duong);
		if (ngoaiLe.has(ten)) continue;
		duyet(cay(duong), (node) => {
			if (
				ts.isCallExpression(node) &&
				ts.isIdentifier(node.expression) &&
				node.expression.text === "readAgentModel"
			) {
				viPham.push(ten);
			}
		});
	}
	return [...new Set(viPham)];
}

function tenNhapTuModel(duong: string): string[] {
	const ten: string[] = [];
	duyet(cay(duong), (node) => {
		if (
			ts.isImportDeclaration(node) &&
			ts.isStringLiteral(node.moduleSpecifier) &&
			node.moduleSpecifier.text.endsWith("lib/model") &&
			node.importClause?.namedBindings &&
			ts.isNamedImports(node.importClause.namedBindings)
		) {
			for (const phanTu of node.importClause.namedBindings.elements) {
				ten.push(phanTu.name.text);
			}
		}
	});
	return ten;
}

beforeAll(async () => {
	caiDatCu = await db.appSetting.findUnique({
		where: { id: "app" },
		select: { agentModelId: true, agentModelContextWindow: true },
	});
	await db.user.create({
		data: {
			id: userId,
			name: "Model theo vai",
			email: `${userId}@example.test`,
		},
	});
	const agent = await db.agentDefinition.create({
		data: { name: "Model theo vai", status: "LIVE", createdById: userId },
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
			modelId: "test/model-x",
			modelContextWindowTokens: 1000,
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
	await writeAgentModel(
		db,
		caiDatCu?.agentModelId
			? {
					id: caiDatCu.agentModelId,
					contextWindowTokens:
						caiDatCu.agentModelContextWindow ??
						DEFAULT_AGENT_MODEL.contextWindowTokens,
				}
			: null,
	);
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

describe("doi-sau-khi-dung", () => {
	it("doi-sau-khi-dung: luot moi chay model cua Cai dat, ban giu model luc dung", async () => {
		await writeAgentModel(db, {
			id: "test/model-y",
			contextWindowTokens: 2000,
		});
		const run = await taoLuot();

		const thuocTinh = await dieuPhoi(run.id);

		expect(thuocTinh.modelId, "luot moi phai chay model cua Cai dat").toBe(
			"test/model-y",
		);
		expect(thuocTinh.modelContextWindowTokens).toBe("2000");
		expect(
			(await db.agentRun.findUniqueOrThrow({ where: { id: run.id } })).modelId,
		).toBe("test/model-y");
		expect(
			(await db.agentVersion.findUniqueOrThrow({ where: { id: versionId } }))
				.modelId,
		).toBe("test/model-x");
		expect(
			modelChoBoChay(nguCanh(thuocTinh)),
			"luot moi phai chay model cua Cai dat",
		).toEqual({ model: "test/model-y", modelContextWindowTokens: 2000 });
	});

	it("doi-sau-khi-dung: doi chung — khong doi Cai dat thi van model cu", async () => {
		await writeAgentModel(db, {
			id: "test/model-x",
			contextWindowTokens: 1000,
		});
		const run = await taoLuot();

		const thuocTinh = await dieuPhoi(run.id);

		expect(modelChoBoChay(nguCanh(thuocTinh))).toEqual({
			model: "test/model-x",
			modelContextWindowTokens: 1000,
		});
	});

	it("doi-sau-khi-dung: khong tep nao doc model cua ban de chon model chay", () => {
		expect(tepDocModelCuaBan(), "luot moi phai chay model cua Cai dat").toEqual(
			[],
		);
	});
});

describe("bon-phien", () => {
	it("bon-phien: bon phien cung mot bo giai, Cai dat dat X hoac de trong", async () => {
		let soO = 0;
		for (const caiDat of ["test/model-x", null] as const) {
			await writeAgentModel(
				db,
				caiDat ? { id: caiDat, contextWindowTokens: 1000 } : null,
			);
			const mongDoi = caiDat
				? { model: caiDat, modelContextWindowTokens: 1000 }
				: null;

			expect(await modelChoPhienGoc(nguCanh({ purpose: "research" }))).toEqual(
				mongDoi,
			);
			soO += 1;
			expect(
				await modelChoPhienGoc(nguCanh({ purpose: "team-agent" })),
			).toEqual(mongDoi);
			soO += 1;
			expect(await modelChoBoDung()).toEqual(mongDoi);
			soO += 1;
			await db.agentRun.updateMany({
				where: { agentId, status: { in: ["QUEUED", "RUNNING"] } },
				data: { status: "CANCELLED", finishedAt: new Date() },
			});
			const run = await taoLuot();
			const thuocTinh = await dieuPhoi(run.id);
			expect(modelChoBoChay(nguCanh(thuocTinh))).toEqual(mongDoi);
			expect(
				(await db.agentRun.findUniqueOrThrow({ where: { id: run.id } }))
					.modelId,
			).toBe(caiDat ?? DEFAULT_AGENT_MODEL.id);
			soO += 1;
		}
		expect(soO).toBe(8);
	});

	it("bon-phien: moi phien qua modelTheoVai", () => {
		const choPhep = new Set([
			"MODEL_GOC",
			"modelChoPhienGoc",
			"modelChoBoDung",
			"modelChoBoChay",
		]);
		for (const tep of [
			"agent.ts",
			"subagents/agent_builder/agent.ts",
			"subagents/agent_runner/agent.ts",
		]) {
			const ten = tenNhapTuModel(join(GOC_AGENT, tep));
			expect(ten.length, `moi phien qua modelTheoVai: ${tep}`).toBeGreaterThan(
				0,
			);
			expect(
				ten.filter((mot) => !choPhep.has(mot)),
				`moi phien qua modelTheoVai: ${tep}`,
			).toEqual([]);
		}
		expect(tepGoiReadAgentModel(), "moi phien qua modelTheoVai").toEqual([]);
	});
});
