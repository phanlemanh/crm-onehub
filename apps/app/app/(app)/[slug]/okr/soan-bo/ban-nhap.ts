import type { DongKrNhap } from "./du-lieu-bo";

export type KrNhap = DongKrNhap & { khoa: string };

export type MtNhap = { khoa: string; ten: string };

export type BanNhap = {
	moi: readonly MtNhap[];
	kr: Readonly<Record<string, readonly KrNhap[]>>;
	tenCo: Readonly<Record<string, string>>;
	krCo: Readonly<Record<string, Partial<DongKrNhap>>>;
	boDi: readonly string[];
	focus: { khoa: string; lan: number } | null;
	dem: number;
};

export const KHOA_MT_DAU = "moi-0";

export const BAN_NHAP_DAU: BanNhap = {
	moi: [],
	kr: {},
	tenCo: {},
	krCo: {},
	boDi: [],
	focus: { khoa: KHOA_MT_DAU, lan: 0 },
	dem: 1,
};

const MT_DAU: MtNhap = { khoa: KHOA_MT_DAU, ten: "" };

export function mucTieuMoiHien(
	bn: BanNhap,
	boCoMucTieu: boolean,
): readonly MtNhap[] {
	if (bn.moi.length === 0 && !boCoMucTieu) return [MT_DAU];
	return bn.moi.filter((mt) => !daBoDi(bn, mt.khoa));
}

export function krCua(bn: BanNhap, khoaMt: string): readonly KrNhap[] {
	return (bn.kr[khoaMt] ?? []).filter((kr) => !daBoDi(bn, kr.khoa));
}

export function daBoDi(bn: BanNhap, khoa: string): boolean {
	return bn.boDi.includes(khoa);
}

export function boDong(bn: BanNhap, khoa: string): BanNhap {
	return daBoDi(bn, khoa) ? bn : { ...bn, boDi: [...bn.boDi, khoa] };
}

export function giuDong(bn: BanNhap, khoa: string): BanNhap {
	return { ...bn, boDi: bn.boDi.filter((k) => k !== khoa) };
}

export function suaTenCo(bn: BanNhap, id: string, ten: string): BanNhap {
	return { ...bn, tenCo: { ...bn.tenCo, [id]: ten } };
}

export function suaKrCo(
	bn: BanNhap,
	id: string,
	phan: Partial<DongKrNhap>,
): BanNhap {
	return { ...bn, krCo: { ...bn.krCo, [id]: { ...bn.krCo[id], ...phan } } };
}

const krTrong = (khoa: string): KrNhap => ({
	khoa,
	ten: "",
	khoi: "",
	dich: "",
	donVi: "",
	kieu: null,
	nguoi: null,
});

export function themMucTieu(bn: BanNhap): BanNhap {
	const khoa = `moi-${bn.dem}`;
	return {
		...bn,
		moi: [...bn.moi, { khoa, ten: "" }],
		focus: { khoa, lan: bn.dem },
		dem: bn.dem + 1,
	};
}

export function suaMucTieu(bn: BanNhap, khoa: string, ten: string): BanNhap {
	const coSan = bn.moi.some((mt) => mt.khoa === khoa);
	return {
		...bn,
		moi: coSan
			? bn.moi.map((mt) => (mt.khoa === khoa ? { ...mt, ten } : mt))
			: [...bn.moi, { khoa, ten }],
	};
}

export function themKr(bn: BanNhap, khoaMt: string, sau?: string): BanNhap {
	const khoa = `moi-${bn.dem}`;
	const cu = krCua(bn, khoaMt);
	const viTri = sau === undefined ? -1 : cu.findIndex((k) => k.khoa === sau);
	const moi =
		viTri < 0
			? [...cu, krTrong(khoa)]
			: [...cu.slice(0, viTri + 1), krTrong(khoa), ...cu.slice(viTri + 1)];
	return {
		...bn,
		kr: { ...bn.kr, [khoaMt]: moi },
		focus: { khoa, lan: bn.dem },
		dem: bn.dem + 1,
	};
}

export function suaKr(
	bn: BanNhap,
	khoaMt: string,
	khoaKr: string,
	phan: Partial<DongKrNhap>,
): BanNhap {
	return {
		...bn,
		kr: {
			...bn.kr,
			[khoaMt]: krCua(bn, khoaMt).map((k) =>
				k.khoa === khoaKr ? { ...k, ...phan } : k,
			),
		},
	};
}

export function datFocus(bn: BanNhap, khoa: string): BanNhap {
	return { ...bn, focus: { khoa, lan: bn.dem }, dem: bn.dem + 1 };
}

export function lanFocus(bn: BanNhap, khoa: string): number | null {
	return bn.focus?.khoa === khoa ? bn.focus.lan : null;
}
