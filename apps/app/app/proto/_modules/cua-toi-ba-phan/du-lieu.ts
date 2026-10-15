import {
	CAY_DON_VI,
	type DonViMau,
	type KrMau,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
	NGUOI,
	type NguoiMau,
} from "../ban-mau-okr/du-lieu";
import { tienDo, tinhTrang } from "../ban-mau-okr/phan-chung";

export type ToneDem = "success" | "warning" | "error";

export type TabOkr = "cua-toi" | "theo-don-vi" | "toan-canh" | "hoi-y";

export const TAB_MAU: { value: TabOkr; nhan: string; state: string }[] = [
	{ value: "cua-toi", nhan: "Của tôi", state: "ST-ctbp-can-cap-nhat" },
	{ value: "theo-don-vi", nhan: "Theo đơn vị", state: "ST-ctbp-can-cap-nhat" },
	{ value: "toan-canh", nhan: "Toàn cảnh", state: "ST-ctbp-can-cap-nhat" },
	{ value: "hoi-y", nhan: "Hỏi ý", state: "ST-ctbp-can-cap-nhat" },
];

export const TUAN_NAY = "30/11";

export type KrCuaNguoi = { kr: KrMau; mucTieu: MucTieuMau };

export function krCua(nguoi: NguoiMau): KrCuaNguoi[] {
	return [...MUC_TIEU_CUA_DON_VI.values()].flatMap((ds) =>
		ds.flatMap((mt) =>
			mt.kr
				.filter((k) => k.phuTrach.id === nguoi.id)
				.map((kr) => ({ kr, mucTieu: mt })),
		),
	);
}

export function canCapNhat(nguoi: NguoiMau): KrCuaNguoi[] {
	return krCua(nguoi).filter((x) => x.kr.capNhatLuc !== TUAN_NAY);
}

export function mucTieuThamGia(nguoi: NguoiMau): MucTieuMau[] {
	return [...MUC_TIEU_CUA_DON_VI.values()]
		.flat()
		.filter(
			(mt) =>
				mt.phuTrach.id === nguoi.id &&
				!mt.kr.some((k) => k.phuTrach.id === nguoi.id),
		);
}

function phang(d: DonViMau): DonViMau[] {
	return [d, ...d.con.flatMap(phang)];
}

const DON_VI = phang(CAY_DON_VI);

/** Đơn vị người này dẫn, theo thứ tự cây: bộ phận trước phòng ban. */
export function donViDan(nguoi: NguoiMau): DonViMau[] {
	const dan = DON_VI.filter(
		(d) => d.truong?.id === nguoi.id && d.cap !== "goc",
	);
	return [
		...dan.filter((d) => d.cap === "bo-phan"),
		...dan.filter((d) => d.cap === "phong-ban"),
	];
}

export type TomTat = {
	soMucTieu: number;
	soKr: number;
	tienDoTb: number;
	dem: Record<ToneDem, number>;
};

export function tomTat(id: string): TomTat {
	const ds = MUC_TIEU_CUA_DON_VI.get(id) ?? [];
	const krs = ds.flatMap((mt) => mt.kr.map((kr) => ({ kr, loai: mt.loai })));
	const dem = { success: 0, warning: 0, error: 0 } satisfies Record<
		ToneDem,
		number
	>;
	for (const { kr, loai } of krs) {
		const tone = tinhTrang(tienDo(kr), loai).tone;
		if (tone === "success" || tone === "warning" || tone === "error")
			dem[tone] += 1;
	}
	return {
		soMucTieu: ds.length,
		soKr: krs.length,
		tienDoTb: Math.round(
			krs.reduce((t, { kr }) => t + tienDo(kr), 0) / Math.max(1, krs.length),
		),
		dem,
	};
}

export const XEM = {
	thao: NGUOI.thao,
	khoa: NGUOI.khoa,
	nga: NGUOI.nga,
} as const;
