import { OKR_NHAC } from "./okr-nhac";
import { type MucTuTin, TUAN_MS } from "./okr-tro-ly-danh-muc";
import { dauTuanVN, ngayVN, soNgayVN } from "./onboarding-nhac";

export type LanCapNhat = {
	id?: string;
	tuan: string;
	luc: Date;
	tuTin: MucTuTin;
	ghiChu: string;
	giaTri: number;
};

export type KrSo = {
	id: string;
	thuTu: number;
	khoaLuc: Date | null;
	lan: LanCapNhat[];
};

export type LyDoHop =
	| { loai: "tut"; tu: MucTuTin; den: MucTuTin; bac: number }
	| { loai: "im"; soNgay: number }
	| { loai: "ghi-chu"; ngay: string };

export type LoaiLyDo = LyDoHop["loai"];

const HANG_TU_TIN = { cao: 2, vua: 1, thap: 0 } as const satisfies Record<
	MucTuTin,
	number
>;

const NHOM_LY_DO = { tut: 0, im: 1, "ghi-chu": 2 } as const satisfies Record<
	LoaiLyDo,
	number
>;

export function congTuan(tuan: string, soTuan: number): string {
	return new Date(Date.parse(`${tuan}T00:00:00Z`) + soTuan * TUAN_MS)
		.toISOString()
		.slice(0, 10);
}

export function cacTuan(tu: Date, den: Date): string[] {
	const dau = dauTuanVN(tu);
	const cuoi = dauTuanVN(den);
	const ra: string[] = [];
	for (let t = dau; t <= cuoi; t = congTuan(t, 1)) ra.push(t);
	return ra;
}

export const moiNhat = (kr: KrSo): LanCapNhat | null => kr.lan.at(-1) ?? null;

export function cuoiTrongTuan(kr: KrSo, tuan: string): LanCapNhat | null {
	return kr.lan.filter((l) => l.tuan === tuan).at(-1) ?? null;
}

export function moiNhatDenTuan(kr: KrSo, tuan: string): LanCapNhat | null {
	return kr.lan.filter((l) => l.tuan <= tuan).at(-1) ?? null;
}

export function lyDoCua(kr: KrSo, homNay: Date): LyDoHop[] {
	const tuan = dauTuanVN(homNay);
	const ra: LyDoHop[] = [];
	const moi = moiNhat(kr);
	const truoc = kr.lan.filter((l) => l.tuan < tuan).at(-1);
	if (moi && truoc && moi.tuan === tuan) {
		const bac = HANG_TU_TIN[truoc.tuTin] - HANG_TU_TIN[moi.tuTin];
		if (bac > 0) ra.push({ loai: "tut", tu: truoc.tuTin, den: moi.tuTin, bac });
	}
	const moc = moi?.luc ?? kr.khoaLuc;
	if (moc) {
		const soNgay = soNgayVN(moc, homNay);
		if (soNgay >= OKR_NHAC.imNgay) ra.push({ loai: "im", soNgay });
	}
	const tuTuanTruoc = congTuan(tuan, -1);
	const ghi = [...kr.lan]
		.reverse()
		.find((l) => l.ghiChu.trim() !== "" && ngayVN(l.luc) >= tuTuanTruoc);
	if (ghi) ra.push({ loai: "ghi-chu", ngay: ngayVN(ghi.luc) });
	return ra;
}

const doManh = (l: LyDoHop): number => {
	switch (l.loai) {
		case "tut":
			return -l.bac;
		case "im":
			return -l.soNgay;
		case "ghi-chu":
			return -Date.parse(l.ngay);
	}
};

export type DongXep = { id: string; lyDo: LyDoHop[] };

export type XepHop = { dangBan: DongXep[]; conLai: DongXep[] };

export function xepHopTuan(krs: KrSo[], homNay: Date): XepHop {
	const co = krs.map((kr) => ({ kr, lyDo: lyDoCua(kr, homNay) }));
	const dangBan = co
		.filter((d) => d.lyDo.length > 0)
		.sort((a, b) => {
			const la = a.lyDo[0];
			const lb = b.lyDo[0];
			if (!la || !lb) return 0;
			return (
				NHOM_LY_DO[la.loai] - NHOM_LY_DO[lb.loai] ||
				doManh(la) - doManh(lb) ||
				a.kr.thuTu - b.kr.thuTu
			);
		});
	const conLai = co
		.filter((d) => d.lyDo.length === 0)
		.sort((a, b) => a.kr.thuTu - b.kr.thuTu);
	const gon = (d: { kr: KrSo; lyDo: LyDoHop[] }) => ({
		id: d.kr.id,
		lyDo: d.lyDo,
	});
	return { dangBan: dangBan.map(gon), conLai: conLai.map(gon) };
}

export type SoTuTin = Record<MucTuTin, number>;

export type SoTuanCuaNhom = {
	tuTin: SoTuTin;
	daCapNhat: number;
	dangBan: { loai: LoaiLyDo; soKr: number } | null;
	theoTuan: (number | null)[];
};

export function soTuanCuaNhom(
	krs: KrSo[],
	tuanKy: string[],
	homNay: Date,
): SoTuanCuaNhom {
	const tuan = dauTuanVN(homNay);
	const tuTin: SoTuTin = { cao: 0, vua: 0, thap: 0 };
	for (const kr of krs) {
		const m = moiNhat(kr);
		if (m) tuTin[m.tuTin] += 1;
	}
	const xep = xepHopTuan(krs, homNay);
	const dau = xep.dangBan[0]?.lyDo[0];
	const dangBan = dau
		? {
				loai: dau.loai,
				soKr: xep.dangBan.filter((d) => d.lyDo.some((l) => l.loai === dau.loai))
					.length,
			}
		: null;
	const theoTuan = tuanKy.map((t) => {
		if (t > tuan) return null;
		const cuoi = krs.flatMap((kr) => {
			const l = cuoiTrongTuan(kr, t);
			return l ? [l] : [];
		});
		if (cuoi.length === 0) return null;
		return Math.round(
			(cuoi.filter((l) => l.tuTin === "cao").length / cuoi.length) * 100,
		);
	});
	return {
		tuTin,
		daCapNhat: krs.filter((kr) => cuoiTrongTuan(kr, tuan) !== null).length,
		dangBan,
		theoTuan,
	};
}
