export const TOM_GON = {
	soGhiChuCuoi: 2,
	tuanMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export type CapNhatTuan = {
	tuan: string;
	giaTri: number;
	tuTin: "cao" | "vua" | "thap";
	ghiChu: string;
};

export type KrKy = {
	ten: string;
	kieu: string;
	donVi: string;
	khoiDiem: number;
	dich: number;
	soChot: number;
	diem: number | null;
	lyDo: string;
	capNhat: CapNhatTuan[];
};

export type MucTieuKy = {
	ten: string;
	diem: number | null;
	dieuHocDuoc: string;
	kr: KrKy[];
};

const TEN_TU_TIN = { cao: "cao", vua: "vừa", thap: "thấp" } as const;

function tuanIm(cap: CapNhatTuan[]): number {
	const moc = cap
		.map((c) => new Date(`${c.tuan}T00:00:00Z`).getTime())
		.sort((a, b) => a - b);
	let im = 0;
	for (let i = 1; i < moc.length; i += 1) {
		const cach = Math.round(
			((moc[i] ?? 0) - (moc[i - 1] ?? 0)) / TOM_GON.tuanMs,
		);
		if (cach > 1) im += cach - 1;
	}
	return im;
}

export function tomGonKr(kr: KrKy): string {
	const dau = `${kr.ten} (${kr.kieu}, ${kr.donVi}): ${kr.khoiDiem} → ${kr.soChot}/${kr.dich}, ${kr.diem === null ? "chưa chấm" : `điểm ${kr.diem}`}`;
	if (kr.capNhat.length === 0) return `${dau}; không có Cập nhật tuần`;
	const theoTuan = [...kr.capNhat].sort((a, b) => a.tuan.localeCompare(b.tuan));
	const dauTin = theoTuan[0]?.tuTin ?? "vua";
	const cuoiTin = theoTuan[theoTuan.length - 1]?.tuTin ?? "vua";
	const ghiChu = theoTuan
		.filter((c) => c.ghiChu.trim() !== "")
		.slice(-TOM_GON.soGhiChuCuoi)
		.map((c) => `«${c.ghiChu.trim()}»`);
	const phan = [
		dau,
		`tự tin ${TEN_TU_TIN[dauTin]} → ${TEN_TU_TIN[cuoiTin]}`,
		`${theoTuan.length} cập nhật, im ${tuanIm(theoTuan)} tuần`,
		...(ghiChu.length ? [`ghi chú cuối: ${ghiChu.join(" · ")}`] : []),
		...(kr.lyDo.trim() ? [`lý do điểm: ${kr.lyDo.trim()}`] : []),
	];
	return phan.join("; ");
}

export function tomGonKy(input: { mucTieu: MucTieuKy[] }): string {
	return input.mucTieu
		.map((mt) =>
			[
				`Mục tiêu «${mt.ten}»: ${mt.diem === null ? "chưa chấm" : `điểm ${mt.diem}`}${mt.dieuHocDuoc.trim() ? `; học được: ${mt.dieuHocDuoc.trim()}` : ""}`,
				...mt.kr.map((k) => `  - ${tomGonKr(k)}`),
			].join("\n"),
		)
		.join("\n");
}
