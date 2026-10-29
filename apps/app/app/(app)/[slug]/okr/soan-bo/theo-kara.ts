import type { TruongVietLai } from "@crm/validation/okr-tro-ly";

export type ChuTheoKara = {
	truong: TruongVietLai;
	giaTri: string;
	dau: boolean;
};

export type TheoKara = Readonly<Record<string, ChuTheoKara>>;

export type DocLaiKara = (id: string, chu: ChuTheoKara) => void;

const khoaCua = (id: string, truong: TruongVietLai) => `${truong}:${id}`;

export function ghiTheoKara(
	cu: TheoKara,
	id: string,
	chu: ChuTheoKara,
): TheoKara {
	return { ...cu, [khoaCua(id, chu.truong)]: chu };
}

export function docTheoKara(
	tk: TheoKara,
	id: string,
	truong: TruongVietLai,
): ChuTheoKara | null {
	return tk[khoaCua(id, truong)] ?? null;
}
