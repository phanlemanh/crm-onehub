import { afterAll, afterEach, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { writeAgentModel } from "@crm/db/settings";
import type { Cache } from "cache-manager";
import type { ResearchKeyService } from "../src/agent/research-key.service";
import type { BackfillService } from "../src/backfill/backfill.service";
import {
	type CatalogModel,
	ModelCatalogService,
} from "../src/settings/model-catalog.service";
import { agentModelOutput } from "../src/settings/settings.contracts";
import { SettingsService } from "../src/settings/settings.service";
import { gieoThanhVien } from "./phien-thu";

const DA_CHON = "openai/gpt-x";
const TIEN_TO = `r1e-api-${Date.now().toString(36)}`;
const OWNER = `${TIEN_TO}-owner`;
const MEMBER = `${TIEN_TO}-member`;

const fetchGoc = globalThis.fetch;

function dongModel(id: string) {
	return {
		id,
		name: id,
		owned_by: id.split("/")[0],
		type: "language",
		tags: ["tool-use"],
		context_window: 200_000,
		pricing: null,
	};
}

type DanhMuc = "co" | "thieu" | "loi" | "mang" | "hong" | "rong";

function datFetch(danhMuc: DanhMuc) {
	globalThis.fetch = (async () => {
		if (danhMuc === "loi") return new Response("loi", { status: 503 });
		if (danhMuc === "mang") throw new TypeError("fetch failed");
		if (danhMuc === "hong") return Response.json({ models: [] });
		if (danhMuc === "rong") return Response.json({ data: [] });
		return Response.json({
			data: [dongModel(danhMuc === "co" ? DA_CHON : "khac/model-y")],
		});
	}) as unknown as typeof fetch;
}

function dichVu(): SettingsService {
	const kho = new Map<string, CatalogModel[]>();
	const cache = {
		get: async (k: string) => kho.get(k),
		set: async (k: string, v: CatalogModel[]) => {
			kho.set(k, v);
		},
	} as unknown as Cache;
	return new SettingsService(
		db,
		new ModelCatalogService(cache),
		{} as ResearchKeyService,
		{} as BackfillService,
	);
}

afterEach(() => {
	globalThis.fetch = fetchGoc;
});

afterAll(async () => {
	await writeAgentModel(db, null);
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});

describe("api-bi-go", () => {
	test("api-bi-go: ma tran 7 o x 2 nguoi goi viet truoc", async () => {
		await gieoThanhVien(OWNER, "owner");
		await gieoThanhVien(MEMBER, "member");
		const O = [
			{ ten: "da chon, co", chon: DA_CHON, danhMuc: "co", mong: false },
			{ ten: "da chon, thieu", chon: DA_CHON, danhMuc: "thieu", mong: true },
			{ ten: "mac dinh", chon: null, danhMuc: "thieu", mong: false },
			{ ten: "da chon, loi", chon: DA_CHON, danhMuc: "loi", mong: false },
			{ ten: "da chon, mang", chon: DA_CHON, danhMuc: "mang", mong: false },
			{ ten: "da chon, hong", chon: DA_CHON, danhMuc: "hong", mong: false },
			{ ten: "da chon, rong", chon: DA_CHON, danhMuc: "rong", mong: false },
		] as const;
		const lan = O.flatMap((o) => [OWNER, MEMBER].map((ai) => ({ o, ai })));
		expect(lan.length).toBe(14);
		const sai: string[] = [];
		for (const { o, ai } of lan) {
			await writeAgentModel(
				db,
				o.chon ? { id: o.chon, contextWindowTokens: 200_000 } : null,
			);
			datFetch(o.danhMuc);
			const ra = agentModelOutput.parse(await dichVu().agentModel(ai));
			if (ra.selectedMissing !== o.mong) {
				sai.push(
					o.danhMuc === "loi" ||
						o.danhMuc === "mang" ||
						o.danhMuc === "hong" ||
						o.danhMuc === "rong"
						? `api-bi-go: danh muc ${o.danhMuc} bao bi go`
						: `api-bi-go: ${o.ten} (${ai === OWNER ? "owner" : "member"}) tra ${ra.selectedMissing}`,
				);
			}
		}
		expect(sai).toEqual([]);
	});
});
