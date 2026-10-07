import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

type DbHoacTx = Db | Prisma.TransactionClient;

export const QUAN_HE_LICH_SU_MUC_TIEU = [
	"alignedBy",
	"comments",
	"nhinLai",
	"mangSangDi",
	"mangSangTu",
	"ghiNhan",
	"chuDeHoiY",
] as const;

export const QUAN_HE_DI_THEO_MUC_TIEU = [
	"participants",
	"keyResults",
	"alignments",
	"followers",
	"nguoiXem",
	"mucTieuTuMau",
] as const;

export const QUAN_HE_LICH_SU_KR = [
	"alignedBy",
	"checkIns",
	"comments",
	"soChup",
	"doiDich",
	"diemKr",
	"bangChung",
	"ghiNhan",
] as const;

export const QUAN_HE_DI_THEO_KR = ["nguonMay", "viecKr"] as const;

type QuanHeMucTieu = (typeof QUAN_HE_LICH_SU_MUC_TIEU)[number];
type QuanHeKr = (typeof QUAN_HE_LICH_SU_KR)[number];

export type LyDoLichSu =
	| "da-cong-bo"
	| `muc-tieu.${QuanHeMucTieu}`
	| `kr.${QuanHeKr}`;

const DEM_MUC_TIEU = {
	alignedBy: true,
	comments: true,
	mangSangDi: true,
	ghiNhan: true,
} as const satisfies Prisma.OkrObjectiveCountOutputTypeSelect;

const DEM_KR = {
	alignedBy: true,
	checkIns: true,
	comments: true,
	soChup: true,
	doiDich: true,
	bangChung: true,
	ghiNhan: true,
} as const satisfies Prisma.OkrKeyResultCountOutputTypeSelect;

type DongKr = {
	_count: Record<keyof typeof DEM_KR, number>;
	diemKr: { id: string } | null;
};

function lyDoKr(k: DongKr): LyDoLichSu | null {
	for (const q of QUAN_HE_LICH_SU_KR) {
		const co = q === "diemKr" ? k.diemKr !== null : k._count[q] > 0;
		if (co) return `kr.${q}`;
	}
	return null;
}

export async function lichSuMucTieu(
	tx: DbHoacTx,
	ids: string[],
): Promise<Map<string, LyDoLichSu | null>> {
	const ra = new Map<string, LyDoLichSu | null>();
	if (ids.length === 0) return ra;
	const dong = await tx.okrObjective.findMany({
		where: { id: { in: ids } },
		select: {
			id: true,
			publishedAt: true,
			_count: { select: DEM_MUC_TIEU },
			nhinLai: { select: { id: true } },
			mangSangTu: { select: { id: true } },
			chuDeHoiY: { select: { id: true } },
			keyResults: {
				select: {
					_count: { select: DEM_KR },
					diemKr: { select: { id: true } },
				},
			},
		},
	});
	for (const m of dong) {
		const motMucTieu = {
			alignedBy: m._count.alignedBy > 0,
			comments: m._count.comments > 0,
			nhinLai: m.nhinLai !== null,
			mangSangDi: m._count.mangSangDi > 0,
			mangSangTu: m.mangSangTu !== null,
			ghiNhan: m._count.ghiNhan > 0,
			chuDeHoiY: m.chuDeHoiY !== null,
		} satisfies Record<QuanHeMucTieu, boolean>;
		const quanHe = QUAN_HE_LICH_SU_MUC_TIEU.find((q) => motMucTieu[q]);
		const lyDo: LyDoLichSu | null =
			m.publishedAt !== null
				? "da-cong-bo"
				: quanHe !== undefined
					? `muc-tieu.${quanHe}`
					: (m.keyResults.map(lyDoKr).find((l) => l !== null) ?? null);
		ra.set(m.id, lyDo);
	}
	return ra;
}
