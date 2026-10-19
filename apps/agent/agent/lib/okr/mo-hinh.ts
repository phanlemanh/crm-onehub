import { createGateway } from "@ai-sdk/gateway";
import {
	middlewareZdr,
	nhaGateway,
	tronTuyChon as tronChung,
	tuyChonZdr,
} from "@crm/ai-okr";
import {
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";
import { TRO_LY_OKR } from "./config";
import { MO_HINH_DANG_CHAY, type MucMoHinh } from "./mo-hinh-thu";

type ThamSoGoi = Parameters<
	NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

type ProviderOptions = NonNullable<ThamSoGoi["providerOptions"]>;

export const TUY_CHON_MO_HINH = tuyChonZdr(TRO_LY_OKR.tags);

export function tronTuyChon(cu: ProviderOptions | undefined): ProviderOptions {
	return tronChung(cu, TRO_LY_OKR.tags);
}

export function dungKepTran(tran: number): LanguageModelMiddleware {
	return middlewareZdr({ tags: TRO_LY_OKR.tags, tranRaMoiLoiGoi: tran });
}

export type MoHinhSong = Exclude<LanguageModel, string>;

export function dungMoHinh(
	kep: LanguageModelMiddleware,
	goc: MoHinhSong,
	ma: string = MO_HINH_DANG_CHAY.ma,
): MoHinhSong {
	return wrapLanguageModel({
		model: goc,
		middleware: kep,
		modelId: ma,
	});
}

export const kepTranRaMoiLoiGoi = dungKepTran(
	MO_HINH_DANG_CHAY.tranRaMoiLoiGoi,
);

export const kepTranTomTat = dungKepTran(TRO_LY_OKR.tranRaTomTatMoiLoiGoi);

export function moHinhTroLyOkr(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao: typeof createGateway = createGateway,
	kep?: LanguageModelMiddleware,
	muc: MucMoHinh = MO_HINH_DANG_CHAY,
): MoHinhSong {
	const nha = nhaGateway(env[TRO_LY_OKR.khoa.rieng], tao);
	const kepTran =
		kep ??
		(muc === MO_HINH_DANG_CHAY
			? kepTranRaMoiLoiGoi
			: dungKepTran(muc.tranRaMoiLoiGoi));
	return dungMoHinh(kepTran, nha(muc.ma), muc.ma);
}

export const MO_HINH_TRO_LY_OKR: MoHinhSong = moHinhTroLyOkr();

export const MO_HINH_TOM_TAT: MoHinhSong = moHinhTroLyOkr(
	process.env,
	createGateway,
	kepTranTomTat,
);
