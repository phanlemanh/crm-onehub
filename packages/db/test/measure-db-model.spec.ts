import { afterAll, describe, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
	createMeasureDatabase,
	FINGERPRINT_SOURCES,
	sourceFingerprint,
} from "../scripts/measure-db";
import { dropDatabase, withMaintenance } from "../scripts/test-db-admin";
import { PrismaClient } from "../src/generated/prisma/client";
import {
	MEASURE_DATABASE,
	measureDatabaseName,
	templateDatabaseName,
} from "../src/measure-database";
import { DEFAULT_AGENT_MODEL, readAgentModel } from "../src/settings";

const PACKAGE = resolve(import.meta.dirname, "..");
const SLOW_MS = 240_000;
const base = process.env.TEST_DATABASE_URL ?? "";
const id = (process.env.TEST_RUN_ID ?? Date.now().toString(36))
	.toLowerCase()
	.replace(/[^a-z0-9]/g, "");
const tree = `thk${id}model`;

function hong(dieuKien: boolean, thongDiep: string) {
	if (dieuKien) throw new Error(thongDiep);
}

async function oModelNguon(): Promise<unknown> {
	const client = new pg.Client({ connectionString: base });
	await client.connect();
	try {
		const rows = await client.query(
			`SELECT "agentModelId", "agentModelContextWindow" FROM "appSetting" ORDER BY id`,
		);
		return rows.rows;
	} finally {
		await client.end();
	}
}

afterAll(async () => {
	await withMaintenance(base, async (client) => {
		for (const ten of [measureDatabaseName(tree), templateDatabaseName(tree)])
			await dropDatabase(client, ten);
	});
});

describe("thk-kho-do", () => {
	it(
		"kho do moi mang o model do, ghi bang writeAgentModel, kho nguon khong doi",
		async () => {
			hong(
				MEASURE_DATABASE.agentModel.id === DEFAULT_AGENT_MODEL.id,
				"thk: model do van la glm fast",
			);
			const truoc = await oModelNguon();

			const url = await createMeasureDatabase({ base, tree });
			const kho = new PrismaClient({
				adapter: new PrismaPg({ connectionString: url }),
			});
			try {
				const model = await readAgentModel(kho);
				hong(
					model.isDefault ||
						model.id !== MEASURE_DATABASE.agentModel.id ||
						model.contextWindowTokens !==
							MEASURE_DATABASE.agentModel.contextWindowTokens,
					"thk: kho do khong mang model",
				);
			} finally {
				await kho.$disconnect();
			}

			const sau = await oModelNguon();
			hong(
				JSON.stringify(sau) !== JSON.stringify(truoc),
				"thk: kho nguon bi ghi",
			);
		},
		SLOW_MS,
	);

	it("buoc gieo goi writeAgentModel, khong ghi thang bang", () => {
		const nguon = readFileSync(
			join(PACKAGE, "scripts", "gieo-model-do.ts"),
			"utf8",
		);
		hong(
			!nguon.includes("writeAgentModel") ||
				!nguon.includes('from "../src/settings"') ||
				/\b(INSERT|UPDATE)\b/i.test(nguon),
			"thk: gieo khong qua writeAgentModel",
		);
	});

	it("van tay nguon theo ma model do", () => {
		const mot = sourceFingerprint(
			FINGERPRINT_SOURCES,
			"google/gemini-3.8-flash",
		);
		const hai = sourceFingerprint(
			FINGERPRINT_SOURCES,
			"anthropic/claude-haiku-5.5",
		);
		hong(mot === hai, "thk: van tay khong theo model do");
		hong(
			sourceFingerprint() !==
				sourceFingerprint(FINGERPRINT_SOURCES, MEASURE_DATABASE.agentModel.id),
			"thk: van tay khong theo model do (mac dinh)",
		);
	});
});
