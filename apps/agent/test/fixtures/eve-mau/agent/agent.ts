import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

const CON = ["con_tro_ly", "con_runner", "con_builder", "con_khong_so"];

type GoiMau = { name: string; input: { message?: string } };

const KICH_BAN = new Map<string, GoiMau[]>([
	["ghi-dau", [{ name: "ghi_dau", input: {} }]],
	["phien-con", CON.map((name) => ({ name, input: { message: "mau" } }))],
	[
		"dai",
		[
			{
				name: "dai_mau",
				input: {
					message:
						"Write a 3000-word story about an invented river town, in English, with many chapters. Do not stop early.",
				},
			},
		],
	],
]);

export default defineAgent({
	modelContextWindowTokens: 128_000,
	model: mockModel({
		modelId: "mau-goc",
		provider: "mau",
		respond: ({ lastUserMessage, toolResults }) => {
			if (toolResults.length > 0) return "xong";
			const goi = KICH_BAN.get(lastUserMessage?.trim() ?? "");
			return goi ? { toolCalls: goi } : "xong";
		},
	}),
});
