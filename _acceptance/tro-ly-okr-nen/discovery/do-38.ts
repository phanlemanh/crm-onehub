import { generateText } from "/Users/manhphan/dev/crm/.claude/worktrees/tro-ly-okr-nen/node_modules/.bun/ai@7.0.85+68a1e3a0c4588df3/node_modules/ai/dist/index.js";
import { appendFileSync } from "node:fs";

const OUT = "/private/tmp/claude-501/-Users-manhphan-dev-crm--claude-worktrees-eager-dijkstra-0a5b96/b7eb9b95-35ec-4b71-b706-975f956cb2c7/scratchpad/do-38/do-38.jsonl";
const MODEL = process.argv[3] ?? "google/gemini-3.8-flash";

const LUAT = Array.from({ length: 60 }, (_, i) =>
	`Luật ${i + 1}: Một Kết quả then chốt (KR) phải đo được bằng một con số có khởi điểm và đích; KR không được là một việc cần làm; Mục tiêu nói điều muốn đạt, không nói con số; mỗi Mục tiêu có từ hai tới năm KR; câu viết lại giữ nguyên mọi con số đã có trong dữ liệu đầu vào và không bịa số mới. Phòng ban mẫu số ${i + 1} dùng từ vựng: Chu kỳ, Mục tiêu, Kết quả then chốt, Căn chỉnh, Cập nhật tuần, Mức tự tin.`,
).join("\n");

const GOI_GIA = `Dữ liệu giả để thử. Mục tiêu: "Làm cho khách hàng thử nghiệm Zeta hài lòng hơn". Vì sao lúc này: "Quý này có đợt mở rộng thử nghiệm". KR1: "Tổ chức 3 buổi gặp khách" (khởi điểm 0, đích 3). KR2: "Tăng điểm hài lòng từ 6,1 lên 7,5". KR3: "Viết tài liệu hướng dẫn".`;

async function goi(nhan: string, opts: Record<string, unknown>, prompt: string) {
	const t0 = Date.now();
	try {
		const r = await generateText({ model: MODEL, prompt, maxRetries: 0, ...opts });
		const dong = { nhan, model: MODEL, ms: Date.now() - t0, ok: true, usage: r.usage, gateway: r.providerMetadata?.gateway ?? null };
		appendFileSync(OUT, `${JSON.stringify(dong)}\n`);
		const g = (r.providerMetadata?.gateway ?? {}) as Record<string, unknown>;
		console.log(nhan, "in", r.usage.inputTokens, "cache", r.usage.inputTokenDetails?.cacheReadTokens ?? r.usage.cachedInputTokens, "out", r.usage.outputTokens, "reason", r.usage.outputTokenDetails?.reasoningTokens ?? r.usage.reasoningTokens, "cost", g.cost, "ms", dong.ms);
		return dong;
	} catch (e) {
		const err = e as { name?: string; message?: string; statusCode?: number; responseBody?: string };
		const dong = { nhan, model: MODEL, ms: Date.now() - t0, ok: false, loi: { name: err.name, statusCode: err.statusCode, message: err.message?.slice(0, 600), body: err.responseBody?.slice(0, 600) } };
		appendFileSync(OUT, `${JSON.stringify(dong)}\n`);
		console.log(nhan, "LOI", JSON.stringify(dong.loi));
		return dong;
	}
}

const zdr = { gateway: { zeroDataRetention: true } };
const low = { google: { thinkingConfig: { thinkingLevel: "low" } }, vertex: { thinkingConfig: { thinkingLevel: "low" } } };
const HOI = `${LUAT}\n\n${GOI_GIA}\n\nHãy nêu một câu hỏi ngắn về KR chưa đo được. Trả lời một câu.`;
const CAU = `${GOI_GIA}\nVới từng KR, nói KR đó có đo được không và vì sao, mỗi KR một dòng.`;
const phep = process.argv[2];

if (phep === "zdr") {
	await goi("zdr", { providerOptions: zdr }, `${GOI_GIA}\nViết lại tên Mục tiêu cho rõ hơn, một câu.`);
}
if (phep === "cache") {
	for (const lan of [1, 2, 3]) await goi(`cache-${lan}`, { providerOptions: { ...zdr, ...low } }, HOI);
}
if (phep === "dai-mac-dinh") {
	for (const lan of [1, 2, 3]) await goi(`dai-mac-dinh-${lan}`, { providerOptions: zdr }, HOI);
}
if (phep === "suy-nghi") {
	for (let lan = 1; lan <= 4; lan++) {
		await goi(`mac-dinh-${lan}`, { providerOptions: zdr }, CAU);
		await goi(`level-low-${lan}`, { providerOptions: { ...zdr, ...low } }, CAU);
	}
}
