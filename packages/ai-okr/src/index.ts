import { gateway, type LanguageModel } from "ai";

export type XuongModelZdr = {
	model: string | LanguageModel;
	tags: readonly string[];
	tranRaMoiLoiGoi: number;
};

export function xuongModelZdr(v: XuongModelZdr): LanguageModel {
	return typeof v.model === "string" ? gateway(v.model) : v.model;
}
