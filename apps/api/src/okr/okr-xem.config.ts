const PHUT_MS = 60_000;
const NGAY_MS = 24 * 60 * PHUT_MS;

export const OKR_XEM = {
	loc: { toiDaMoiMat: 50 },
	thoiGian: { phutMs: PHUT_MS, ngayMs: NGAY_MS },
	moHopTuan: { gopMs: 30 * PHUT_MS },
	khoiCuaToi: { toiDa: 5 },
	capNhatGanDay: { coTrang: 20 },
	thongDiep: {
		chiQuanTri: "Chỉ quản trị xem được sức khoẻ chương trình.",
	},
} as const;
