import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";

export const KHONG_PHONG = "khong-phong";
export const KHONG_CON = "khong-con";

export type DongTatCa = {
	id: string;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	nguoiGui: { id: string; ten: string } | null;
	phongBan: { id: string; ten: string } | null;
	trangThai: { khoa: string; nhan: string; cau: string; nghia: NghiaTrangThai };
};

export type BoLocTatCa = {
	phongBan: string[];
	trangThaiTinHieu: string[];
	nguoiGui: string[];
};

export function giaTriLoc(d: DongTatCa): BoLocTatCa {
	return {
		phongBan: [d.phongBan?.id ?? KHONG_PHONG],
		trangThaiTinHieu: [d.trangThai.khoa],
		nguoiGui: [d.nguoiGui?.id ?? KHONG_CON],
	};
}

function khop(d: DongTatCa, loc: BoLocTatCa, bo?: keyof BoLocTatCa): boolean {
	const gt = giaTriLoc(d);
	return (Object.keys(loc) as (keyof BoLocTatCa)[]).every(
		(k) =>
			k === bo || loc[k].length === 0 || gt[k].some((v) => loc[k].includes(v)),
	);
}

export function locDong(dong: DongTatCa[], loc: BoLocTatCa): DongTatCa[] {
	return dong.filter((d) => khop(d, loc));
}

export function demTheoLoc(
	dong: DongTatCa[],
	loc: BoLocTatCa,
): Record<keyof BoLocTatCa, Record<string, number>> {
	const dem = { phongBan: {}, trangThaiTinHieu: {}, nguoiGui: {} } as Record<
		keyof BoLocTatCa,
		Record<string, number>
	>;
	for (const k of Object.keys(dem) as (keyof BoLocTatCa)[]) {
		for (const d of dong) {
			if (!khop(d, loc, k)) continue;
			for (const v of giaTriLoc(d)[k]) dem[k][v] = (dem[k][v] ?? 0) + 1;
		}
	}
	return dem;
}

export function tuyChonLoc(dong: DongTatCa[]) {
	const phong = new Map<string, string>();
	const trang = new Map<string, string>();
	const nguoi = new Map<string, string>();
	for (const d of dong) {
		if (d.phongBan) phong.set(d.phongBan.id, d.phongBan.ten);
		trang.set(d.trangThai.khoa, d.trangThai.nhan);
		if (d.nguoiGui) nguoi.set(d.nguoiGui.id, d.nguoiGui.ten);
	}
	const xep = (m: Map<string, string>) =>
		[...m.entries()]
			.sort(([, a], [, b]) => a.localeCompare(b, "vi"))
			.map(([value, label]) => ({ value, label }));
	return {
		phongBan: xep(phong),
		coKhongPhong: dong.some((d) => d.phongBan === null),
		trangThaiTinHieu: xep(trang),
		nguoiGui: xep(nguoi),
		coKhongCon: dong.some((d) => d.nguoiGui === null),
	};
}
