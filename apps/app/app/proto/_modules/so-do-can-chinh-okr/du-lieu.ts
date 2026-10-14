import type { FlowMapEdge, Node } from "@crm/ui/components/flow-map";
import type { StatusTone } from "@crm/ui/components/status-indicator";
import {
	CAY_DON_VI,
	type DonViMau,
	type KrMau,
	MT_CSKH_1,
	MT_ONEHUB_1,
	MT_VANHANH,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
	type NguoiMau,
} from "../ban-mau-okr/du-lieu";
import { tienDo, tinhTrang } from "../ban-mau-okr/phan-chung";

export const KICH_THUOC = {
	donVi: { width: 280, height: 152 },
	donViMo: { width: 320, height: 360 },
	mucTieu: { width: 288, height: 112 },
	kr: { width: 248, height: 92 },
} as const;

export type DemTinhTrang = Record<"success" | "warning" | "error", number>;

export type TomTatDonVi = {
	id: string;
	ten: string;
	truong: NguoiMau | null;
	laGoc: boolean;
	mucTieu: MucTieuMau[];
	soKr: number;
	tienDoTb: number | null;
	dem: DemTinhTrang;
	chuaCanChinh: number;
};

export type DuLieuNutDonVi = {
	donVi: TomTatDonVi;
	mo: boolean;
	canChuY: boolean;
};
export type DuLieuNutMucTieu = { mucTieu: MucTieuMau; laTam: boolean };
export type DuLieuNutKr = { kr: KrMau; mucTieu: MucTieuMau };

export type NutDonVi = Node<DuLieuNutDonVi, "don-vi">;
export type NutMucTieu = Node<DuLieuNutMucTieu, "muc-tieu">;
export type NutKr = Node<DuLieuNutKr, "kr">;

export type SoDo<N> = { nut: N[]; duong: FlowMapEdge[] };

function moiDonVi(goc: DonViMau): DonViMau[] {
	return [goc, ...goc.con.flatMap(moiDonVi)];
}

const DON_VI = moiDonVi(CAY_DON_VI);
const ID_THEO_TEN = new Map(DON_VI.map((d) => [d.ten, d.id]));
const CHA = new Map(
	DON_VI.flatMap((d) => d.con.map((c) => [c.id, d.id] as const)),
);

function dem(mucTieu: MucTieuMau[]): DemTinhTrang {
	const ket: DemTinhTrang = { success: 0, warning: 0, error: 0 };
	for (const mt of mucTieu) {
		for (const kr of mt.kr) {
			const tone: StatusTone = tinhTrang(tienDo(kr), mt.loai).tone;
			if (tone === "success" || tone === "warning" || tone === "error") {
				ket[tone] += 1;
			}
		}
	}
	return ket;
}

export function tomTat(d: DonViMau): TomTatDonVi {
	const mucTieu = MUC_TIEU_CUA_DON_VI.get(d.id) ?? [];
	const kr = mucTieu.flatMap((mt) => mt.kr);
	const laGoc = d.id === CAY_DON_VI.id;
	return {
		id: d.id,
		ten: d.ten,
		truong: d.truong,
		laGoc,
		mucTieu,
		soKr: kr.length,
		tienDoTb:
			kr.length === 0
				? null
				: Math.round(kr.reduce((t, k) => t + tienDo(k), 0) / kr.length),
		dem: dem(mucTieu),
		chuaCanChinh: laGoc
			? 0
			: mucTieu.filter((mt) => mt.gopVao.length === 0).length,
	};
}

export function canChuY(t: TomTatDonVi): boolean {
	return (
		t.chuaCanChinh > 0 ||
		(!t.laGoc && t.mucTieu.length === 0) ||
		t.truong === null ||
		t.dem.error > 0
	);
}

export function soDoDonVi(moId: string | null): SoDo<NutDonVi> {
	const nut: NutDonVi[] = DON_VI.map((d) => {
		const t = tomTat(d);
		const mo = d.id === moId;
		const kt = mo ? KICH_THUOC.donViMo : KICH_THUOC.donVi;
		return {
			id: d.id,
			type: "don-vi",
			position: { x: 0, y: 0 },
			width: kt.width,
			height: kt.height,
			data: { donVi: t, mo, canChuY: canChuY(t) },
		};
	});

	const cauTruc: FlowMapEdge[] = DON_VI.flatMap((d) =>
		d.con.map((c) => ({
			id: `${d.id}->${c.id}`,
			source: d.id,
			target: c.id,
			data: { kind: "structural" as const },
		})),
	);

	const gopThang = new Map<string, FlowMapEdge>();
	for (const d of DON_VI) {
		for (const mt of MUC_TIEU_CUA_DON_VI.get(d.id) ?? []) {
			for (const g of mt.gopVao) {
				const den = ID_THEO_TEN.get(g.donVi);
				if (den === undefined || den === CHA.get(d.id)) continue;
				const id = `${den}=>${d.id}`;
				gopThang.set(id, {
					id,
					source: den,
					target: d.id,
					data: { kind: "custom", label: "góp thẳng" },
				});
			}
		}
	}

	return { nut, duong: [...cauTruc, ...gopThang.values()] };
}

const krCua = (mt: MucTieuMau, ten: string): KrMau => {
	const kr = mt.kr.find((k) => k.ten === ten);
	if (!kr) throw new Error(`thiếu KR mẫu ${ten}`);
	return kr;
};

export const TAM = MT_CSKH_1;

export function soDoQuanhMucTieu(): SoDo<NutMucTieu | NutKr> {
	const krGop = krCua(MT_ONEHUB_1, "Cá nhân hoàn tất 30 ngày đầu");
	const mucTieu = (mt: MucTieuMau, laTam: boolean): NutMucTieu => ({
		id: mt.id,
		type: "muc-tieu",
		position: { x: 0, y: 0 },
		...KICH_THUOC.mucTieu,
		data: { mucTieu: mt, laTam },
	});
	const kr = (k: KrMau, mt: MucTieuMau): NutKr => ({
		id: k.id,
		type: "kr",
		position: { x: 0, y: 0 },
		...KICH_THUOC.kr,
		data: { kr: k, mucTieu: mt },
	});
	const noi = (
		source: string,
		target: string,
		label?: string,
	): FlowMapEdge => ({
		id: `${source}->${target}`,
		source,
		target,
		data: { kind: "structural", label },
	});

	return {
		nut: [
			mucTieu(MT_ONEHUB_1, false),
			kr(krGop, MT_ONEHUB_1),
			mucTieu(MT_VANHANH, false),
			mucTieu(TAM, true),
			...TAM.kr.map((k) => kr(k, TAM)),
		],
		duong: [
			noi(MT_ONEHUB_1.id, krGop.id),
			noi(krGop.id, MT_VANHANH.id, "góp vào KR"),
			noi(krGop.id, TAM.id, "góp vào KR"),
			noi(MT_VANHANH.id, TAM.id, "góp vào mục tiêu"),
			...TAM.kr.map((k) => noi(TAM.id, k.id)),
		],
	};
}

export type DongDanhSach = {
	id: string;
	ten: string;
	cap: number;
	t: TomTatDonVi;
};

export function danhSachDonVi(): DongDanhSach[] {
	const di = (d: DonViMau, cap: number): DongDanhSach[] => [
		{ id: d.id, ten: d.ten, cap, t: tomTat(d) },
		...d.con.flatMap((c) => di(c, cap + 1)),
	];
	return di(CAY_DON_VI, 0);
}
