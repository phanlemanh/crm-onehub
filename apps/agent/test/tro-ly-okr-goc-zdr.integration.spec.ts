import { afterAll, describe, expect, test } from "bun:test";
import type * as gateway from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { writeAgentModel } from "@crm/db/settings";
import { SESSION_PURPOSES } from "@crm/validation/phien-tac-tu";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import {
	MODEL_GOC,
	modelChoBuocGoc,
	modelChoPhienGoc,
	modelTheoVai,
} from "../agent/lib/model";
import { TRO_LY_OKR } from "../agent/lib/okr/config";

const MODEL_KHAC = { id: "openai/gpt-x", contextWindowTokens: 200_000 };
const BIEN_KHOA = TRO_LY_OKR.khoa.rieng;
const PURPOSE_ZDR = ["kho", "okr"] as const;

const luaChonChuoi = z.object({
	model: z.string(),
	modelContextWindowTokens: z.number().int().positive().optional(),
	modelOptions: z
		.object({
			providerOptions: z.object({
				gateway: z.object({
					zeroDataRetention: z.boolean(),
					tags: z.array(z.string()).optional(),
				}),
			}),
		})
		.optional(),
});

type ChonPhien = (ctx: never) => Promise<unknown> | unknown;
type ChonBuoc = (
	ctx: never,
	tao: typeof gateway.createGateway,
	env: Record<string, string | undefined>,
) => unknown;

function phienGia(purpose: string) {
	return {
		session: {
			id: `goc-zdr-${purpose}`,
			auth: { current: { attributes: { purpose } }, initiator: null },
		},
	};
}

const phienThat: ChonPhien = (ctx) =>
	MODEL_GOC.events["session.started"]?.(
		{ type: "session.started" } as never,
		ctx,
	);

const buocThat: ChonBuoc = (ctx, tao, env) => modelChoBuocGoc(ctx, tao, env);

const phienCu: ChonPhien = (ctx) =>
	(ctx as ReturnType<typeof phienGia>).session.auth.current.attributes
		.purpose === "okr"
		? modelTheoVai("tro-ly")
		: modelChoPhienGoc(ctx);

const buocCu: ChonBuoc = (ctx, tao, env) =>
	(ctx as ReturnType<typeof phienGia>).session.auth.current.attributes
		.purpose === "okr"
		? null
		: modelChoBuocGoc(ctx, tao, env);

async function goiBuoc(
	chon: ChonBuoc,
	purpose: string,
	env: Record<string, string | undefined>,
) {
	const daGoi: Parameters<MockLanguageModelV4["doGenerate"]>[0][] = [];
	const khoa: (string | undefined)[] = [];
	const gia = new MockLanguageModelV4({
		doGenerate: async (vao) => {
			daGoi.push(vao);
			return {} as never;
		},
	});
	const tao = ((cauHinh?: { apiKey?: string }) => {
		khoa.push(cauHinh?.apiKey);
		return () => gia;
	}) as unknown as typeof gateway.createGateway;
	const ra = chon(phienGia(purpose) as never, tao, env) as {
		model: MockLanguageModelV4;
	} | null;
	await ra?.model.doGenerate({ prompt: [] });
	return { ra, goi: daGoi[0], khoa: khoa[0] };
}

async function kiemGoc(chonPhien: ChonPhien, chonBuoc: ChonBuoc) {
	const sai: string[] = [];
	await writeAgentModel(db, MODEL_KHAC);
	try {
		for (const p of SESSION_PURPOSES) {
			const coZdr = (PURPOSE_ZDR as readonly string[]).includes(p);
			const phien = await chonPhien(phienGia(p) as never);
			const chuoi = luaChonChuoi.safeParse(phien);
			if (phien != null && !chuoi.success)
				sai.push(`${p}: session.started tra model song, eve bo`);
			const zdrPhien =
				chuoi.success &&
				chuoi.data.modelOptions?.providerOptions.gateway.zeroDataRetention ===
					true;
			if (coZdr && !zdrPhien)
				sai.push(`phien goc ${p} khong mang ZDR o session`);
			if (!coZdr && (!chuoi.success || chuoi.data.model !== MODEL_KHAC.id))
				sai.push(`${p}: khong theo model Cai dat ${JSON.stringify(phien)}`);
			if (p === "okr" && chuoi.success && chuoi.data.model !== TRO_LY_OKR.model)
				sai.push(`phien goc okr sai model ${chuoi.data.model}`);
			for (const [ten, env] of [
				["rieng", { [BIEN_KHOA]: "khoa-gia-goc" }],
				["chung", {}],
			] as const) {
				const b = await goiBuoc(chonBuoc, p, env);
				if (!coZdr) {
					if (b.ra !== null) sai.push(`${p}: step.started lech (${ten})`);
					continue;
				}
				if (b.goi?.providerOptions?.gateway?.zeroDataRetention !== true)
					sai.push(`phien goc ${p} khong mang ZDR o step (${ten})`);
				if (p === "okr") {
					const the = b.goi?.providerOptions?.gateway?.tags as
						| string[]
						| undefined;
					if (!the?.includes(TRO_LY_OKR.tags[0]))
						sai.push(`phien goc okr thieu the (${ten})`);
					if ((ten === "rieng") !== (b.khoa === "khoa-gia-goc"))
						sai.push(`phien goc okr khoa sai (${ten})`);
				}
			}
		}
	} finally {
		await writeAgentModel(db, null);
	}
	console.log(`goc-zdr so purpose: ${SESSION_PURPOSES.length}`);
	return sai;
}

afterAll(async () => {
	await writeAgentModel(db, null);
});

describe("goc-zdr", () => {
	test("goc-zdr: phien goc okr va kho mang ZDR o session.started va step.started, purpose khac theo Cai dat", async () => {
		expect(SESSION_PURPOSES).toContain("okr");
		expect(await kiemGoc(phienThat, buocThat)).toEqual([]);
	});

	test("goc-zdr doi chung: ban cu de phien goc okr theo Cai dat bi bat", async () => {
		const sai = await kiemGoc(phienCu, buocCu);
		expect(sai).toContain("phien goc okr khong mang ZDR o session");
		expect(sai).toContain("phien goc okr khong mang ZDR o step (chung)");
	});
});
