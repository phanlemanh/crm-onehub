export const CAM_TEN_CU = [
	"căn chỉnh",
	"hỏi ý",
	"cấp onehub",
	"toàn công ty",
	"toàn onehub",
] as const;

export type CumTenCu = (typeof CAM_TEN_CU)[number];

export type MucChu = {
	nguon: string;
	khoa: string;
	chu: string;
};

export type LoiTenCu = {
	nguon: string;
	khoa: string;
	cum: CumTenCu;
};

const chuan = (chu: string): string =>
	chu.normalize("NFC").toLocaleLowerCase("vi");

export function soatTenCu(muc: readonly MucChu[]): LoiTenCu[] {
	return muc.flatMap((m) => {
		const chu = chuan(m.chu);
		return CAM_TEN_CU.filter((cum) => chu.includes(cum)).map((cum) => ({
			nguon: m.nguon,
			khoa: m.khoa,
			cum,
		}));
	});
}

export function dongLoiTenCu(loi: LoiTenCu): string {
	return `${loi.nguon}#${loi.khoa}: ${loi.cum}`;
}

export function boDoanMa(van: string): string {
	return van.replace(/\\?`[^`\\]*\\?`/g, "");
}
