import type { MoTaTruong } from "@/components/crm/fields/kieu-truong";
import type { Owner } from "@/components/crm/owner-cell";

export const KHOA_TRUONG_OKR = {
	ten: "title",
	viSao: "whyNow",
	nguoi: "ownerUserId",
} as const;

export type KhoaTruongOkr =
	(typeof KHOA_TRUONG_OKR)[keyof typeof KHOA_TRUONG_OKR];

export const DO_DAI_OKR = {
	ten: { min: 3, max: 200 },
	viSao: { max: 500 },
} as const;

export type NhanTruongOkr = {
	truongTen: string;
	truongViSao: string;
	truongNguoi: string;
	goiYViSao: string;
};

export type LuuTruongOkr = (khoa: KhoaTruongOkr, giaTri: string) => void;

type ChungTruong = {
	nhan: NhanTruongOkr;
	nguoiDung: Owner[] | undefined;
	luu: LuuTruongOkr;
	dangLuu: (khoa: KhoaTruongOkr) => boolean;
};

function oTen(ten: string, o: ChungTruong): MoTaTruong {
	return {
		khoa: KHOA_TRUONG_OKR.ten,
		nhan: o.nhan.truongTen,
		kieu: "TEXT",
		giaTri: ten,
		batBuoc: true,
		luu: (giaTri) => o.luu(KHOA_TRUONG_OKR.ten, String(giaTri ?? "")),
		dangLuu: o.dangLuu(KHOA_TRUONG_OKR.ten),
	};
}

function oNguoi(chu: Owner, o: ChungTruong): MoTaTruong {
	return {
		khoa: KHOA_TRUONG_OKR.nguoi,
		nhan: o.nhan.truongNguoi,
		kieu: "USER",
		giaTri: chu.id,
		batBuoc: true,
		nguoiDung: o.nguoiDung,
		nguoi: chu,
		luu: (giaTri) => o.luu(KHOA_TRUONG_OKR.nguoi, String(giaTri ?? "")),
		dangLuu: o.dangLuu(KHOA_TRUONG_OKR.nguoi),
	};
}

export function truongMucTieu(
	mt: { title: string; whyNow: string; owner: Owner },
	o: ChungTruong,
): MoTaTruong[] {
	return [
		oTen(mt.title, o),
		{
			khoa: KHOA_TRUONG_OKR.viSao,
			nhan: o.nhan.truongViSao,
			kieu: "LONG_TEXT",
			giaTri: mt.whyNow === "" ? null : mt.whyNow,
			goiY: o.nhan.goiYViSao,
			luu: (giaTri) => o.luu(KHOA_TRUONG_OKR.viSao, String(giaTri ?? "")),
			dangLuu: o.dangLuu(KHOA_TRUONG_OKR.viSao),
		},
		oNguoi(mt.owner, o),
	];
}

export function truongKr(
	kr: { title: string; owner: Owner },
	o: ChungTruong & { suaNguoi: boolean },
): MoTaTruong[] {
	return o.suaNguoi
		? [oTen(kr.title, o), oNguoi(kr.owner, o)]
		: [oTen(kr.title, o)];
}

export function loiDoDaiOkr(
	khoa: KhoaTruongOkr,
	giaTri: string,
): "ten" | "viSao" | null {
	const t = giaTri.trim();
	if (
		khoa === KHOA_TRUONG_OKR.ten &&
		(t.length < DO_DAI_OKR.ten.min || t.length > DO_DAI_OKR.ten.max)
	)
		return "ten";
	if (khoa === KHOA_TRUONG_OKR.viSao && t.length > DO_DAI_OKR.viSao.max)
		return "viSao";
	return null;
}
