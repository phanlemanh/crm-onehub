import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DSL = {
	tep: join(resolve(import.meta.dir, "..", "evidence"), "do-suy-luan.json"),
	url: "https://ai-gateway.vercel.sh/v1/chat/completions",
	model: "zai/glm-5.3",
	cau: "A team wants a weekly digest of deals closing this month grouped by owner. List the three data fields you need and one risk. Answer in four short lines.",
	muc: ["low", "high"] as const,
};

async function goi(muc: (typeof DSL.muc)[number], khoa: string) {
	const res = await fetch(DSL.url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${khoa}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: DSL.model,
			messages: [{ role: "user", content: DSL.cau }],
			reasoning: { effort: muc },
		}),
	});
	const than = (await res.json().catch(() => null)) as {
		model?: string;
		usage?: {
			completion_tokens?: number;
			completion_tokens_details?: { reasoning_tokens?: number };
		};
	} | null;
	return {
		status: res.status,
		model: than?.model ?? null,
		token_ra: than?.usage?.completion_tokens ?? null,
		token_suy_luan:
			than?.usage?.completion_tokens_details?.reasoning_tokens ?? null,
	};
}

const khoa = process.env.AI_GATEWAY_API_KEY?.trim();
if (!khoa) {
	console.log("KHONG DO DUOC: thieu AI_GATEWAY_API_KEY");
	process.exit(2);
}
const muc: Record<string, Awaited<ReturnType<typeof goi>>> = {};
for (const m of DSL.muc) muc[m] = await goi(m, khoa);
const ra = {
	luc: new Date().toISOString(),
	model: DSL.model,
	cau: DSL.cau,
	muc,
};
mkdirSync(dirname(DSL.tep), { recursive: true });
writeFileSync(DSL.tep, `${JSON.stringify(ra, null, 2)}\n`);
console.log(JSON.stringify(ra));
