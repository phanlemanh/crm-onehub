import { createGateway } from "@ai-sdk/gateway";
import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import {
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";

export type ViecTaiLieu = "soan" | "hoi";

type MoiTruong = Readonly<Record<string, string | undefined>>;

export type NhanKhoa = "rieng" | "chung";

export function nhanKhoaTaiLieu(
	viec: ViecTaiLieu,
	env: MoiTruong = process.env,
): NhanKhoa {
	return env[TAI_LIEU_AGENT[viec].bienKhoaRieng]?.trim() ? "rieng" : "chung";
}

export function nhanKhoaMaySoan(env: MoiTruong = process.env): NhanKhoa {
	return nhanKhoaTaiLieu("soan", env);
}

function ganZdrCua(viec: ViecTaiLieu): LanguageModelMiddleware {
	return {
		transformParams: async ({ params }) => ({
			...params,
			providerOptions: {
				...params.providerOptions,
				gateway: {
					...params.providerOptions?.gateway,
					...TAI_LIEU_AGENT[viec].gateway,
				},
			},
		}),
	};
}

export const ganZdr: LanguageModelMiddleware = ganZdrCua("soan");

export type ModelMaySoan = {
	model: LanguageModel;
	modelContextWindowTokens: number;
};

export function modelTaiLieu(
	viec: ViecTaiLieu,
	env: MoiTruong = process.env,
	tao: typeof createGateway = createGateway,
): ModelMaySoan {
	const cauHinh = TAI_LIEU_AGENT[viec];
	const khoa = env[cauHinh.bienKhoaRieng]?.trim();
	const nha = khoa ? tao({ apiKey: khoa }) : tao();
	return {
		model: wrapLanguageModel({
			model: nha(cauHinh.maModel),
			middleware: ganZdrCua(viec),
			modelId: cauHinh.maModel,
		}),
		modelContextWindowTokens: DEFAULT_AGENT_MODEL.contextWindowTokens,
	};
}

export function modelMaySoan(
	env: MoiTruong = process.env,
	tao: typeof createGateway = createGateway,
): ModelMaySoan {
	return modelTaiLieu("soan", env, tao);
}
