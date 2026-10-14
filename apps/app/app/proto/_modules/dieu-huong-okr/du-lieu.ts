import {
	CAY_DON_VI,
	type DonViMau,
	type KrMau,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
	NGUOI,
	type NguoiMau,
} from "../ban-mau-okr/du-lieu";
import { tienDo } from "../ban-mau-okr/phan-chung";
import { type TomTatDonVi, tomTat } from "../so-do-can-chinh-okr/du-lieu";

export const DUONG = "/proto/dieu-huong-okr";

export type DonViPhang = {
	id: string;
	ten: string;
	cap: DonViMau["cap"];
	truong: NguoiMau | null;
	chaId: string | null;
	duong: string[];
	con: string[];
	tt: TomTatDonVi;
};

function phang(
	d: DonViMau,
	chaId: string | null,
	duong: string[],
): DonViPhang[] {
	return [
		{
			id: d.id,
			ten: d.ten,
			cap: d.cap,
			truong: d.truong,
			chaId,
			duong,
			con: d.con.map((c) => c.id),
			tt: tomTat(d),
		},
		...d.con.flatMap((c) => phang(c, d.id, [...duong, d.ten])),
	];
}

export const DON_VI = phang(CAY_DON_VI, null, []);

export function donVi(id: string): DonViPhang {
	const d = DON_VI.find((x) => x.id === id);
	if (!d) throw new Error(`thiếu đơn vị mẫu ${id}`);
	return d;
}

export type NguoiXem = {
	nguoi: NguoiMau;
	danId: string | null;
	quanTri: boolean;
};

export const NGUOI_XEM = {
	thao: { nguoi: NGUOI.thao, danId: "cskh", quanTri: false },
	son: { nguoi: NGUOI.son, danId: "onehub", quanTri: true },
	nga: { nguoi: NGUOI.nga, danId: null, quanTri: false },
} satisfies Record<string, NguoiXem>;

export type MaNguoiXem = keyof typeof NGUOI_XEM;

export function suaDuoc(xem: NguoiXem, id: string): boolean {
	if (xem.quanTri) return true;
	for (
		let d: DonViPhang | null = donVi(id);
		d;
		d = d.chaId ? donVi(d.chaId) : null
	) {
		if (d.id === xem.danId) return true;
	}
	return false;
}

export function mucTieuCua(id: string): MucTieuMau[] {
	return MUC_TIEU_CUA_DON_VI.get(id) ?? [];
}

export function tienDoMucTieu(mt: MucTieuMau): number {
	return Math.round(
		mt.kr.reduce((t, k) => t + tienDo(k), 0) / Math.max(1, mt.kr.length),
	);
}

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
	return krCua(nguoi).filter((x) => x.kr.capNhatLuc !== "30/11");
}

export function duongTrang(state: string, donViId: string | null): string {
	return donViId
		? `${DUONG}?state=${state}&donVi=${donViId}`
		: `${DUONG}?state=${state}`;
}
