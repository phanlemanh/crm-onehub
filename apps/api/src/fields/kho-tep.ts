import { type KhoTepTruong, khoTepTruongVercel } from "@crm/db/blob-tep-truong";

export const KHO_TEP = Symbol("KHO_TEP");

export const khoTepProvider = {
	provide: KHO_TEP,
	useFactory: (): KhoTepTruong => khoTepTruongVercel(),
};
