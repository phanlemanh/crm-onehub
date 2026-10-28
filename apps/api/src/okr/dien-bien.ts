import { cuoiTrongTuan, type KrSo } from "@crm/db/okr-hop-tuan";
import { dauTuanVN, ngayVN } from "@crm/db/onboarding-nhac";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import type { KieuKr } from "@crm/validation/okr-kr";

export type DiemDienBien = {
	tuan: string;
	checkInId: string | null;
	giaTri: number | null;
	kyVong: number | null;
	tuTin: MucTuTin | null;
	ghiChu: string | null;
};

export type DiemMoiLan = {
	ngay: string;
	checkInId: string | null;
	giaTri: number | null;
	kyVong: number | null;
};

type KrDienBien = KrSo & { kieu: KieuKr; khoi: number; dich: number };

const LAM_TRON = 100;

function kyVongCua(
	kr: KrDienBien,
	tuan: string,
	kyVongTuan: (tuan: string) => number | null,
): number | null {
	const phan = kr.kieu === "moc" ? null : kyVongTuan(tuan);
	return phan === null
		? null
		: Math.round((kr.khoi + ((kr.dich - kr.khoi) * phan) / 100) * LAM_TRON) /
				LAM_TRON;
}

export function dienBienKr(
	kr: KrDienBien,
	tuanKy: string[],
	homNay: Date,
	kyVongTuan: (tuan: string) => number | null,
): DiemDienBien[] {
	const laMoc = kr.kieu === "moc";
	const tuanNay = dauTuanVN(homNay);
	return tuanKy.map((tuan) => {
		const lan = tuan > tuanNay ? null : cuoiTrongTuan(kr, tuan);
		return {
			tuan,
			checkInId: lan?.id ?? null,
			giaTri: laMoc || lan === null ? null : lan.giaTri,
			kyVong: kyVongCua(kr, tuan, kyVongTuan),
			tuTin: lan?.tuTin ?? null,
			ghiChu: lan && lan.ghiChu.trim() !== "" ? lan.ghiChu : null,
		};
	});
}

export function chuoiMoiLan(
	kr: KrDienBien,
	tuanKy: string[],
	homNay: Date,
	kyVongTuan: (tuan: string) => number | null,
): DiemMoiLan[] {
	const laMoc = kr.kieu === "moc";
	const tuanNay = dauTuanVN(homNay);
	return tuanKy.flatMap((tuan) => {
		const kyVong = kyVongCua(kr, tuan, kyVongTuan);
		const lan = tuan > tuanNay ? [] : kr.lan.filter((l) => l.tuan === tuan);
		if (lan.length === 0)
			return [{ ngay: tuan, checkInId: null, giaTri: null, kyVong }];
		return lan.map((l) => ({
			ngay: ngayVN(l.luc),
			checkInId: l.id ?? null,
			giaTri: laMoc ? null : l.giaTri,
			kyVong,
		}));
	});
}

export function tuanCapNhatDau(
	batDauKy: Date,
	congBo: Date | null,
	homNay: Date,
): string | null {
	if (congBo === null) return null;
	const muonNhat = Math.max(
		batDauKy.getTime(),
		congBo.getTime(),
		homNay.getTime(),
	);
	return dauTuanVN(new Date(muonNhat));
}
