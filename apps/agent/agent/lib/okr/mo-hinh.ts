import type { createGateway } from "@ai-sdk/gateway";
import {
	middlewareZdr,
	tronTuyChon as tronChung,
	tuyChonZdr,
	xuongModelZdr,
} from "@crm/ai-okr";
import type { LanguageModel, LanguageModelMiddleware } from "ai";
import { TRO_LY_OKR } from "./config";

type ThamSoGoi = Parameters<
	NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

type ProviderOptions = NonNullable<ThamSoGoi["providerOptions"]>;

export const TUY_CHON_MO_HINH = tuyChonZdr(TRO_LY_OKR.tags);

export function tronTuyChon(cu: ProviderOptions | undefined): ProviderOptions {
	return tronChung(cu, TRO_LY_OKR.tags);
}

export const kepTranRaMoiLoiGoi: LanguageModelMiddleware = middlewareZdr({
	tags: TRO_LY_OKR.tags,
	tranRaMoiLoiGoi: TRO_LY_OKR.tranRaMoiLoiGoi,
});

export function moHinhTroLyOkr(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao?: typeof createGateway,
): LanguageModel {
	return xuongModelZdr({
		modelId: TRO_LY_OKR.model,
		tags: TRO_LY_OKR.tags,
		tranRaMoiLoiGoi: TRO_LY_OKR.tranRaMoiLoiGoi,
		khoa: env[TRO_LY_OKR.khoa.rieng],
		tao,
	});
}

export const MO_HINH_TRO_LY_OKR: LanguageModel = moHinhTroLyOkr();
