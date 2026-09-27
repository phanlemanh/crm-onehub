import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const AGENT = join(GOC, "apps/agent");
const TEP_CONG_CU = join(AGENT, "agent/subagents/agent_runner/tools");
const MODELS = [
	"google/gemini-3.8-flash",
	"zai/glm-5.2-fast",
	"openai/gpt-5-mini",
];
const khuonCu = process.argv.includes("--khuon-cu");

if (!process.env.AI_GATEWAY_API_KEY) {
	console.log("thieu AI_GATEWAY_API_KEY");
	process.exit(2);
}

const yeuCauAgent = createRequire(join(AGENT, "package.json"));
const { z } = yeuCauAgent("zod") as typeof import("zod");
const yeuCauEve = createRequire(
	yeuCauAgent.resolve("eve/package.json"),
);
const { generateText, jsonSchema, tool } = yeuCauEve("ai") as typeof import("ai");

type KhuonChuan = {
	"~standard": { jsonSchema: { input: (o: { target: string }) => object } };
};

function chuyen(schema: unknown) {
	return jsonSchema(
		(schema as KhuonChuan)["~standard"].jsonSchema.input({ target: "draft-07" }),
	);
}

type CongCu = { description: string; inputSchema: unknown };

async function napCongCu(ten: string): Promise<CongCu> {
	return (await import(join(TEP_CONG_CU, `${ten}.ts`))).default as CongCu;
}

const finishRun = await napCongCu("finish_run");
const runner = (await import(join(AGENT, "agent/subagents/agent_runner/agent.ts")))
	.default as { outputSchema: unknown };

const tools: Record<string, ReturnType<typeof tool>> = {};
for (const ten of [
	"inspect_run",
	"query_crm",
	"read_crm_record",
	"create_crm_activity",
	"post_slack_message",
	"finish_run",
]) {
	const congCu = await napCongCu(ten);
	const khuon =
		khuonCu && ten === "finish_run"
			? z.object({
					summary: z.string(),
					result: z.record(z.string(), z.json()).nullish(),
				})
			: congCu.inputSchema;
	tools[ten] = tool({ description: congCu.description, inputSchema: chuyen(khuon) });
}
tools.final_output = tool({
	description: "Return the final structured output of this run.",
	inputSchema: chuyen(runner.outputSchema),
});

const docKetQua = (finishRun.inputSchema as z.ZodType).safeParse.bind(
	finishRun.inputSchema,
);

let loi = 0;
for (const model of khuonCu ? MODELS.slice(0, 1) : MODELS) {
	try {
		const phanHoi = await generateText({
			model,
			tools,
			toolChoice: { type: "tool", toolName: "finish_run" },
			maxOutputTokens: 400,
			prompt:
				'Nộp kết quả bằng công cụ finish_run: summary là "kiểm tra khuôn", result có đúng hai khoá: "kiemTra" là chữ "ok" và "soDem" là số 2.',
		});
		const goi = phanHoi.toolCalls[0];
		const doc = docKetQua(goi?.input) as {
			success: boolean;
			data?: { result?: Record<string, unknown> | null };
		};
		const ok =
			goi?.toolName === "finish_run" &&
			doc.success &&
			doc.data?.result?.kiemTra !== undefined &&
			doc.data?.result?.soDem !== undefined;
		console.log(
			`${model} ${ok ? "ok" : `loi: ${JSON.stringify(goi?.input ?? null).slice(0, 200)}`}`,
		);
		if (!ok) loi += 1;
	} catch (error) {
		const thongDiep = error instanceof Error ? error.message : String(error);
		if (khuonCu && thongDiep.includes("ref loops")) {
			console.log("khuon-cu: google tu choi nhu mong doi");
			process.exit(3);
		}
		console.log(`${model} loi: ${thongDiep.slice(0, 200)}`);
		loi += 1;
	}
}
process.exit(loi === 0 ? 0 : 1);
