import {
	gateway,
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";
import { TRO_LY_OKR } from "./config";

export const kepTranRaMoiLoiGoi: LanguageModelMiddleware = {
	transformParams: async ({ params }) => ({
		...params,
		maxOutputTokens: Math.min(
			params.maxOutputTokens ?? TRO_LY_OKR.tranRaMoiLoiGoi,
			TRO_LY_OKR.tranRaMoiLoiGoi,
		),
	}),
};

export const MO_HINH_TRO_LY_OKR: LanguageModel = wrapLanguageModel({
	model: gateway(TRO_LY_OKR.model),
	middleware: kepTranRaMoiLoiGoi,
	modelId: TRO_LY_OKR.model,
});

export const TUY_CHON_MO_HINH = {
	providerOptions: {
		gateway: { zeroDataRetention: true, tags: [...TRO_LY_OKR.tags] },
		google: { thinkingConfig: { thinkingLevel: "low" } },
		vertex: { thinkingConfig: { thinkingLevel: "low" } },
	},
};
