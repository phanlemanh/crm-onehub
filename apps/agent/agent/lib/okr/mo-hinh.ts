import {
	gateway,
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";
import { TRO_LY_OKR } from "./config";

type ThamSoGoi = Parameters<
	NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

type ProviderOptions = NonNullable<ThamSoGoi["providerOptions"]>;

export const TUY_CHON_MO_HINH = {
	providerOptions: {
		gateway: { zeroDataRetention: true, tags: [...TRO_LY_OKR.tags] },
		google: { thinkingConfig: { thinkingLevel: "low" } },
		vertex: { thinkingConfig: { thinkingLevel: "low" } },
	},
} satisfies { providerOptions: ProviderOptions };

export function tronTuyChon(cu: ProviderOptions | undefined): ProviderOptions {
	const ep: ProviderOptions = TUY_CHON_MO_HINH.providerOptions;
	const khoa = new Set([...Object.keys(cu ?? {}), ...Object.keys(ep)]);
	return Object.fromEntries(
		[...khoa].map((k) => [k, { ...(cu?.[k] ?? {}), ...(ep[k] ?? {}) }]),
	);
}

export const kepTranRaMoiLoiGoi: LanguageModelMiddleware = {
	transformParams: async ({ params }) => ({
		...params,
		maxOutputTokens: Math.min(
			params.maxOutputTokens ?? TRO_LY_OKR.tranRaMoiLoiGoi,
			TRO_LY_OKR.tranRaMoiLoiGoi,
		),
		providerOptions: tronTuyChon(params.providerOptions),
	}),
};

export const MO_HINH_TRO_LY_OKR: LanguageModel = wrapLanguageModel({
	model: gateway(TRO_LY_OKR.model),
	middleware: kepTranRaMoiLoiGoi,
	modelId: TRO_LY_OKR.model,
});
