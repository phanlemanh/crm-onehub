import type {
	HangChoXem,
	LoTrinhChoXem,
	MocLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";

export type DemMoc = { conLai: number; tong: number };

export type MoHinhLoTrinh = {
	coMoHinh: boolean;
	mocCuaMa: ReadonlyMap<string, MocLoTrinh>;
	chuaHen: ReadonlySet<string>;
	mocHien: ReadonlySet<MocLoTrinh>;
	dem: ReadonlyMap<MocLoTrinh, DemMoc>;
};

export function coMoHinh(lo: LoTrinhChoXem): boolean {
	return (
		lo.moc.every((m) => m.hien !== null && m.con_lai !== null) &&
		lo.hang.every((h) => h.ten_hien_thi !== null)
	);
}

function theoKhoa(lo: LoTrinhChoXem): MoHinhLoTrinh {
	const mocCuaMa = new Map<string, MocLoTrinh>();
	const mocHien = new Set<MocLoTrinh>();
	const dem = new Map<MocLoTrinh, DemMoc>();
	for (const m of lo.moc) {
		if (m.hien) mocHien.add(m);
		for (const ma of m.viec_hien) if (!mocCuaMa.has(ma)) mocCuaMa.set(ma, m);
		dem.set(m, { conLai: m.con_lai ?? 0, tong: m.viec_hien.length });
	}
	return {
		coMoHinh: true,
		mocCuaMa,
		chuaHen: new Set(lo.chua_hen_moc),
		mocHien,
		dem,
	};
}

function theoLuatCu(lo: LoTrinhChoXem): MoHinhLoTrinh {
	const mocCuaMa = new Map<string, MocLoTrinh>();
	for (const m of lo.moc)
		for (const ma of m.hang) if (!mocCuaMa.has(ma)) mocCuaMa.set(ma, m);
	const mocHien = new Set<MocLoTrinh>();
	const chuaHen = new Set<string>();
	for (const h of lo.hang) {
		const m = mocCuaMa.get(h.ma);
		if (m) mocHien.add(m);
		else chuaHen.add(h.ma);
	}
	return { coMoHinh: false, mocCuaMa, chuaHen, mocHien, dem: new Map() };
}

export function moHinhCua(lo: LoTrinhChoXem): MoHinhLoTrinh {
	return coMoHinh(lo) ? theoKhoa(lo) : theoLuatCu(lo);
}

export function tenViec(h: Pick<HangChoXem, "ten_hien_thi" | "cau_giao">) {
	return h.ten_hien_thi ?? h.cau_giao;
}
