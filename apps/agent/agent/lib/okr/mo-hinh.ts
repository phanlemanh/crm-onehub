import { createGateway } from "@ai-sdk/gateway";
import {
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

export function dungKepTran(tran: number): LanguageModelMiddleware {
	return {
		transformParams: async ({ params }) => ({
			...params,
			maxOutputTokens: Math.min(params.maxOutputTokens ?? tran, tran),
			providerOptions: tronTuyChon(params.providerOptions),
		}),
	};
}

export type MoHinhSong = Exclude<LanguageModel, string>;

export function dungMoHinh(
	kep: LanguageModelMiddleware,
	goc: MoHinhSong,
): MoHinhSong {
	return wrapLanguageModel({
		model: goc,
		middleware: kep,
		modelId: TRO_LY_OKR.model,
	});
}

export const kepTranRaMoiLoiGoi = dungKepTran(TRO_LY_OKR.tranRaMoiLoiGoi);

export const kepTranTomTat = dungKepTran(TRO_LY_OKR.tranRaTomTatMoiLoiGoi);

export function moHinhTroLyOkr(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao: typeof createGateway = createGateway,
	kep: LanguageModelMiddleware = kepTranRaMoiLoiGoi,
): MoHinhSong {
	const khoa = env[TRO_LY_OKR.khoa.rieng]?.trim();
	const nha = khoa ? tao({ apiKey: khoa }) : tao();
	return dungMoHinh(kep, nha(TRO_LY_OKR.model));
}

export const MO_HINH_TRO_LY_OKR: MoHinhSong = moHinhTroLyOkr();

export const MO_HINH_TOM_TAT: MoHinhSong = moHinhTroLyOkr(
	process.env,
	createGateway,
	kepTranTomTat,
);
