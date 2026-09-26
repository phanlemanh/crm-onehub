import { dauTuanVN } from "@crm/db/onboarding-nhac";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import type { KieuKr } from "@crm/validation/okr-kr";
import { cuoiTrongTuan, type KrSo } from "./hop-tuan";

export type DiemDienBien = {
	tuan: string;
	giaTri: number | null;
	kyVong: number | null;
	tuTin: MucTuTin | null;
	ghiChu: string | null;
};

const LAM_TRON = 100;

export function dienBienKr(
	kr: KrSo & { kieu: KieuKr; khoi: number; dich: number },
	tuanKy: string[],
	homNay: Date,
	kyVongTuan: (tuan: string) => number | null,
): DiemDienBien[] {
	const laMoc = kr.kieu === "moc";
	const tuanNay = dauTuanVN(homNay);
	return tuanKy.map((tuan) => {
		const lan = tuan > tuanNay ? null : cuoiTrongTuan(kr, tuan);
		const phan = laMoc ? null : kyVongTuan(tuan);
		return {
			tuan,
			giaTri: laMoc || lan === null ? null : lan.giaTri,
			kyVong:
				phan === null
					? null
					: Math.round(
							(kr.khoi + ((kr.dich - kr.khoi) * phan) / 100) * LAM_TRON,
						) / LAM_TRON,
			tuTin: lan?.tuTin ?? null,
			ghiChu: lan && lan.ghiChu.trim() !== "" ? lan.ghiChu : null,
		};
	});
}
