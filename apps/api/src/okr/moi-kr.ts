import { tinhTrang } from "@crm/validation/okr-muc-tieu";
import type { MucTieuOutput } from "./okr.contracts";
import {
	type DongMoiKr,
	type LocMoiKr,
	type MoiKrOutput,
	TINH_TRANG_KR,
	type TinhTrangKr,
} from "./okr-moi-kr.contracts";
import { khoaCuaMucTieu } from "./toan-canh";
import type { TreeOutput } from "../to-chuc/to-chuc.contracts";

export const CAP_CONG_TY = ["onehub", "bo-phan", "phong-ban"] as const;

export type CayDonVi = {
	cha: ReadonlyMap<string, string>;
	ten: ReadonlyMap<string, string>;
};

export function cayDonVi(cay: TreeOutput): CayDonVi {
	const cha = new Map<string, string>();
	const ten = new Map<string, string>();
	for (const b of cay.divisions) {
		ten.set(`bp:${b.id}`, b.name);
		for (const p of b.departments) {
			ten.set(`pb:${p.id}`, p.name);
			cha.set(`pb:${p.id}`, `bp:${b.id}`);
		}
	}
	for (const p of cay.chuaXep) ten.set(`pb:${p.id}`, p.name);
	return { cha, ten };
}

export function tinhTrangKr(
	kr: { kind: string; progress: number },
	mt: { expected: number | null; kind: MucTieuOutput["kind"] },
): TinhTrangKr {
	if (kr.kind === "moc") return kr.progress >= 100 ? "moc-xong" : "moc-chua";
	return tinhTrang(kr.progress, mt.expected, mt.kind);
}

export function dongCuaMucTieu(mts: MucTieuOutput[]): DongMoiKr[] {
	return mts.flatMap((m) => {
		const khoa = khoaCuaMucTieu(m);
		if (khoa === null) return [];
		return m.keyResults.map((k) => ({
			keyResultId: k.id,
			tieuDe: k.title,
			objectiveId: m.id,
			mucTieu: m.title,
			donVi: { khoa, ten: m.unitName },
			nguoi: { id: k.owner.id, name: k.owner.name },
			progress: k.progress,
			expected: k.kind === "moc" ? null : m.expected,
			tinhTrang: tinhTrangKr(k, m),
		}));
	});
}

const khoaKhop = (d: DongMoiKr, cay: CayDonVi): string[] => {
	const cha = cay.cha.get(d.donVi.khoa);
	return cha ? [d.donVi.khoa, cha] : [d.donVi.khoa];
};

const khop = {
	tinhTrang: (d: DongMoiKr, loc: LocMoiKr) =>
		loc.tinhTrang.length === 0 || loc.tinhTrang.includes(d.tinhTrang),
	donVi: (d: DongMoiKr, loc: LocMoiKr, cay: CayDonVi) =>
		loc.donVi.length === 0 ||
		khoaKhop(d, cay).some((k) => loc.donVi.includes(k)),
	nguoi: (d: DongMoiKr, loc: LocMoiKr) =>
		loc.nguoi.length === 0 || loc.nguoi.includes(d.nguoi.id),
};

type Mat = keyof typeof khop;

const quaMat = (
	d: DongMoiKr,
	loc: LocMoiKr,
	cay: CayDonVi,
	bo: Mat | null,
): boolean =>
	(bo === "tinhTrang" || khop.tinhTrang(d, loc)) &&
	(bo === "donVi" || khop.donVi(d, loc, cay)) &&
	(bo === "nguoi" || khop.nguoi(d, loc));

function demCoTen(
	dong: DongMoiKr[],
	khoaCua: (d: DongMoiKr) => { value: string; name: string }[],
): { value: string; count: number; name: string }[] {
	const dem = new Map<string, { value: string; count: number; name: string }>();
	for (const d of dong)
		for (const k of khoaCua(d)) {
			const cu = dem.get(k.value);
			dem.set(k.value, { ...k, count: (cu?.count ?? 0) + 1 });
		}
	return [...dem.values()].sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export function locDongMoiKr(
	dong: DongMoiKr[],
	loc: LocMoiKr,
	cay: CayDonVi,
): MoiKrOutput {
	const hang = TINH_TRANG_KR.reduce<Record<string, number>>(
		(m, v, i) => ({ ...m, [v]: i }),
		{},
	);
	const rows = dong
		.filter((d) => quaMat(d, loc, cay, null))
		.map((d, i) => ({ d, i }))
		.sort(
			(a, b) =>
				(hang[a.d.tinhTrang] ?? 0) - (hang[b.d.tinhTrang] ?? 0) || a.i - b.i,
		)
		.map(({ d }) => d);
	const choTinhTrang = dong.filter((d) => quaMat(d, loc, cay, "tinhTrang"));
	return {
		rows,
		total: rows.length,
		facetCounts: {
			tinhTrang: TINH_TRANG_KR.map((value) => ({
				value,
				count: choTinhTrang.filter((d) => d.tinhTrang === value).length,
			})),
			donVi: demCoTen(
				dong.filter((d) => quaMat(d, loc, cay, "donVi")),
				(d) =>
					khoaKhop(d, cay).map((value) => ({
						value,
						name:
							value === d.donVi.khoa
								? d.donVi.ten
								: (cay.ten.get(value) ?? value),
					})),
			),
			nguoi: demCoTen(
				dong.filter((d) => quaMat(d, loc, cay, "nguoi")),
				(d) => [{ value: d.nguoi.id, name: d.nguoi.name }],
			),
		},
	};
}
