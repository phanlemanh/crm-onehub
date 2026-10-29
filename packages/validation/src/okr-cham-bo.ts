import {
	type KetQuaKiem,
	type KrKiem,
	kiemOkr,
	MA_LUAT_OKR,
	type MaLuatOkr,
	OKR_KIEM,
} from "./okr-kiem";
import type { KieuKr } from "./okr-kr";

export const MA_LUAT_BO = [
	...MA_LUAT_OKR,
	"it-hon-2-kr",
	"nhieu-hon-5-kr",
	"kr-thieu-nguoi",
] as const;
export type MaLuatBo = (typeof MA_LUAT_BO)[number];
export type KrCham = {
	title: string;
	kind: KieuKr;
	startValue: number | null;
	targetValue: number | null;
	ownerUserId: string | null;
};
export type MucTieuCham = {
	title: string;
	whyNow: string;
	keyResults: KrCham[];
};
export type LoiBo = { ma: MaLuatBo; mucTieu: number; kr: number | null };
export type KetQuaCham = { dat: number; xet: number; loi: LoiBo[] };

export const CHAM_BO = { krToiThieu: 2, krToiDa: 5 } as const;

const co = (ds: readonly string[], x: string): boolean => ds.includes(x);

function doiSo(kr: KrCham): KrKiem {
	return {
		title: kr.title,
		kind: kr.kind,
		startValue: kr.startValue ?? 0,
		targetValue: kr.targetValue ?? kr.startValue ?? 0,
	};
}

function soLuatKr(kind: KieuKr): number {
	return [
		!co(OKR_KIEM.kieuKhongHoiViec, kind),
		!co(OKR_KIEM.kieuKhongHoiKhoiDiem, kind),
		co(OKR_KIEM.kieuHoiDichBangKhoi, kind),
		true,
	].filter(Boolean).length;
}

function loiSoLuong(n: number): MaLuatBo | null {
	if (n < CHAM_BO.krToiThieu) return "it-hon-2-kr";
	if (n > CHAM_BO.krToiDa) return "nhieu-hon-5-kr";
	return null;
}

const loiTuKiem = (k: KetQuaKiem, mucTieu: number): LoiBo => ({
	ma: k.ma satisfies MaLuatOkr,
	mucTieu,
	kr: k.krIndex,
});

function chamMucTieu(
	mt: MucTieuCham,
	mucTieu: number,
): Omit<KetQuaCham, "dat"> {
	const ds = mt.keyResults;
	const kiem = kiemOkr({
		title: mt.title,
		whyNow: mt.whyNow,
		keyResults: ds.map(doiSo),
	});
	const xetDoiTrong = ds.length >= OKR_KIEM.doiTrongToiThieuKr;
	const xet =
		1 +
		(xetDoiTrong ? 1 : 0) +
		ds.reduce((tong, k) => tong + soLuatKr(k.kind), 0);
	const soLuong = loiSoLuong(ds.length);
	const loi: LoiBo[] = [
		...(soLuong ? [{ ma: soLuong, mucTieu, kr: null }] : []),
		...ds.flatMap((k, i) => [
			...kiem.filter((x) => x.krIndex === i).map((x) => loiTuKiem(x, mucTieu)),
			...(k.ownerUserId
				? []
				: [{ ma: "kr-thieu-nguoi" as const, mucTieu, kr: i }]),
		]),
		...kiem.filter((x) => x.krIndex === null).map((x) => loiTuKiem(x, mucTieu)),
	];
	return { xet, loi };
}

export function chamBo(
	bo: MucTieuCham[],
	tuyChon?: { tatLuat?: readonly MaLuatBo[] },
): KetQuaCham {
	const tat: readonly string[] = tuyChon?.tatLuat ?? [];
	const tung = bo.map(chamMucTieu);
	const xet = tung.reduce((tong, k) => tong + k.xet, 0);
	const loi = tung.flatMap((k) => k.loi).filter((l) => !co(tat, l.ma));
	return { dat: xet - loi.length, xet, loi };
}
