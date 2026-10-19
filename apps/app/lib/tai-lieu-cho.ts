import type { LoaiDeXuat, TrangThaiDeXuat } from "@crm/validation/tai-lieu";

export type DongCho = {
	id: string;
	slug: string;
	trangThai: TrangThaiDeXuat;
	loai: LoaiDeXuat;
	cu: boolean;
};

export type BanChoCuaTrang = {
	soBanCho: number;
	deXuatChoId: string | null;
	loiBanCho: boolean;
};

export function banChoCuaTrang<T extends DongCho>(
	rows: readonly T[],
	slug: string,
): T[] {
	return rows.filter(
		(r) =>
			r.slug === slug &&
			r.trangThai === "CHO_DUYET" &&
			!r.cu &&
			r.loai === "NOI_DUNG",
	);
}

export function tomTatBanCho(
	coBanCho: boolean,
	cho: { rows: readonly DongCho[] } | null,
	slug: string,
): BanChoCuaTrang {
	if (cho === null) return { soBanCho: 0, deXuatChoId: null, loiBanCho: true };
	const cuaTrang = banChoCuaTrang(cho.rows, slug);
	return {
		soBanCho: coBanCho ? Math.max(1, cuaTrang.length) : cuaTrang.length,
		deXuatChoId: cuaTrang[0]?.id ?? null,
		loiBanCho: false,
	};
}
