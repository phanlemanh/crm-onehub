import { gateway, type LanguageModel } from "ai";

export type ModelCoSan = Exclude<LanguageModel, string>;

export type TuyChonZdr = {
	tags: readonly string[];
	tranRaMoiLoiGoi: number;
};

export type XuongModelZdr = TuyChonZdr & {
	modelId: string;
};

export function bocModelZdr(
	model: ModelCoSan,
	_tuyChon: TuyChonZdr,
): LanguageModel {
	return model;
}

export function xuongModelZdr(v: XuongModelZdr): LanguageModel {
	return bocModelZdr(gateway(v.modelId), v);
}
