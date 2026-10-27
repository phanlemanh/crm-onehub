import { z } from "zod";
import type { DonChonOkr } from "./okr-tham-so";

const coId = z.object({ id: z.string() });

export const cayChonBo = z.object({
	divisions: z.array(coId.extend({ departments: z.array(coId) })),
	chuaXep: z.array(coId),
	people: z.array(coId.extend({ primaryDepartmentId: z.string().nullable() })),
});

export const quyenChonBo = z.object({
	canManageProgram: z.boolean(),
	headOf: z.object({
		divisions: z.array(z.string()),
		departments: z.array(z.string()),
	}),
});

export const nguoiXemBo = z.object({ id: z.string().min(1) });

export type CayChonBo = z.infer<typeof cayChonBo>;

export type QuyenChonBo = z.infer<typeof quyenChonBo>;

export type NguonBoHop = "dan" | "quan-tri" | "phong-ban-chinh" | "goc";

export type BoHopTuan = { don: DonChonOkr; nguon: NguonBoHop };

const GOC: DonChonOkr = { loai: "goc" };

const phongBanCua = (cay: CayChonBo | undefined): { id: string }[] => [
	...(cay?.divisions.flatMap((x) => x.departments) ?? []),
	...(cay?.chuaXep ?? []),
];

const viTri = (ds: readonly { id: string }[], id: string) => {
	const i = ds.findIndex((x) => x.id === id);
	return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};

const theoCay = (ds: readonly string[], cayDs: readonly { id: string }[]) =>
	ds
		.map((id, i) => ({ id, i }))
		.sort((a, b) => viTri(cayDs, a.id) - viTri(cayDs, b.id) || a.i - b.i)
		.map((x) => x.id);

export function thuTuDanTheoCay(
	headOf: QuyenChonBo["headOf"],
	cay: CayChonBo | undefined,
): DonChonOkr[] {
	return [
		...theoCay(headOf.divisions, cay?.divisions ?? []).map(
			(id): DonChonOkr => ({ loai: "bp", id }),
		),
		...theoCay(headOf.departments, phongBanCua(cay)).map(
			(id): DonChonOkr => ({ loai: "pb", id }),
		),
	];
}

const coTrongCay = (don: DonChonOkr, cay: CayChonBo) => {
	if (don.loai === "bp") return cay.divisions.some((x) => x.id === don.id);
	if (don.loai === "pb") return phongBanCua(cay).some((x) => x.id === don.id);
	return false;
};

export function boHopTuan(v: {
	access: QuyenChonBo;
	cay: CayChonBo;
	userId: string;
}): BoHopTuan {
	const [dau] = thuTuDanTheoCay(v.access.headOf, v.cay).filter((d) =>
		coTrongCay(d, v.cay),
	);
	if (dau) return { don: dau, nguon: "dan" };
	if (v.access.canManageProgram) return { don: GOC, nguon: "quan-tri" };
	const chinh =
		v.cay.people.find((n) => n.id === v.userId)?.primaryDepartmentId ?? null;
	if (chinh !== null && coTrongCay({ loai: "pb", id: chinh }, v.cay))
		return { don: { loai: "pb", id: chinh }, nguon: "phong-ban-chinh" };
	return { don: GOC, nguon: "goc" };
}
