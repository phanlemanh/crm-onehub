import { createGateway } from "@ai-sdk/gateway";
import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import {
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";

const SOAN = TAI_LIEU_AGENT.soan;

export type NhanKhoa = "rieng" | "chung";

export function nhanKhoaMaySoan(
	env: Readonly<Record<string, string | undefined>> = process.env,
): NhanKhoa {
	return env[SOAN.bienKhoaRieng]?.trim() ? "rieng" : "chung";
}

export const ganZdr: LanguageModelMiddleware = {
	transformParams: async ({ params }) => ({
		...params,
		providerOptions: {
			...params.providerOptions,
			gateway: { ...params.providerOptions?.gateway, ...SOAN.gateway },
		},
	}),
};

export type ModelMaySoan = {
	model: LanguageModel;
	modelContextWindowTokens: number;
};

export function modelMaySoan(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao: typeof createGateway = createGateway,
): ModelMaySoan {
	const khoa = env[SOAN.bienKhoaRieng]?.trim();
	const nha = khoa ? tao({ apiKey: khoa }) : tao();
	return {
		model: wrapLanguageModel({
			model: nha(SOAN.maModel),
			middleware: ganZdr,
			modelId: SOAN.maModel,
		}),
		modelContextWindowTokens: DEFAULT_AGENT_MODEL.contextWindowTokens,
	};
}
