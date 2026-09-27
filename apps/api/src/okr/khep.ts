import type { Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import type { OkrProgram } from "@crm/validation/okr-chuong-trinh";
import { goiYDiem } from "@crm/validation/okr-khep";
import { kieuKr } from "@crm/validation/okr-kr";
import { BadRequestException } from "@nestjs/common";
import { khoaDonViDong, tenDonVi } from "./don-vi";
import { OKR } from "./okr-config";

const T = OKR.thongDiep.khep;

export const PHA_NHIN_LAI: readonly string[] = [
	"dang-chay",
	"cham-diem",
] satisfies PhaChuKy[];
export const PHA_CO_DIEM: readonly string[] = [
	"cham-diem",
	"da-dong",
] satisfies PhaChuKy[];

export type CuaSoRa = { id: string; tuNgay: string; denNgay: string };

export const ngayLuu = (s: string) => new Date(`${s}T00:00:00Z`);

export function hieuLucHomNay(homNay: string) {
	return {
		dongLuc: null,
		tuNgay: { lte: ngayLuu(homNay) },
		denNgay: { gte: ngayLuu(homNay) },
	} satisfies Prisma.OkrCuaSoRaWhereInput;
}

export function cuaSoRaRa(r: {
	id: string;
	tuNgay: Date;
	denNgay: Date;
}): CuaSoRa {
	return { id: r.id, tuNgay: ngayVN(r.tuNgay), denNgay: ngayVN(r.denNgay) };
}

export async function cuaSoHieuLuc(
	tx: Prisma.TransactionClient | Db,
	cycleId: string,
	homNay: string,
): Promise<CuaSoRa | null> {
	const r = await tx.okrCuaSoRa.findFirst({
		where: { cycleId, ...hieuLucHomNay(homNay) },
		orderBy: { tuNgay: "desc" },
	});
	return r ? cuaSoRaRa(r) : null;
}

export async function chotKyCham(
	tx: Prisma.TransactionClient,
	cycle: { id: string; endsOn: Date },
	ct: OkrProgram & { version: number },
	userId: string,
): Promise<number> {
	const congBo = { cycleId: cycle.id, status: "cong-bo" };
	const thieu = await tx.okrKeyResult.count({
		where: {
			source: "crm",
			objective: congBo,
			soChup: { none: { ngay: cycle.endsOn, nguon: "crm" } },
		},
	});
	if (thieu > 0) throw new BadRequestException(T.thieuSoNgayCuoi(thieu));
	const krs = await tx.okrKeyResult.findMany({
		where: { objective: congBo },
		select: {
			id: true,
			kind: true,
			startValue: true,
			targetValue: true,
			currentValue: true,
		},
	});
	await tx.okrDiemKr.createMany({
		data: krs.map((k) => ({
			keyResultId: k.id,
			cycleId: cycle.id,
			soChot: k.currentValue,
			diemGoiY: goiYDiem(
				kieuKr.parse(k.kind),
				Number(k.startValue),
				Number(k.targetValue),
				Number(k.currentValue),
			),
			thang: ct.scoreScale,
			trongSoBat: ct.weightsOn,
			phienBanChuongTrinh: ct.version,
		})),
	});
	await tx.okrCuaSoRa.updateMany({
		where: { cycleId: cycle.id, dongLuc: null },
		data: { dongLuc: new Date(), dongBoiUserId: userId },
	});
	return krs.length;
}

export type DongKy = {
	conLai: number;
	theoDonVi: { khoa: string; ten: string; conLai: number }[];
};

export async function kiemDongKy(
	tx: Prisma.TransactionClient | Db,
	cycleId: string,
): Promise<DongKy> {
	const dong = await tx.okrDiemKr.findMany({
		where: { cycleId, diem: null },
		select: {
			keyResult: {
				select: {
					objective: {
						select: {
							level: true,
							divisionId: true,
							departmentId: true,
							personUserId: true,
							division: { select: { name: true } },
							department: { select: { name: true } },
							person: { select: { name: true } },
						},
					},
				},
			},
		},
	});
	const theo = new Map<string, { khoa: string; ten: string; conLai: number }>();
	for (const { keyResult } of dong) {
		const khoa = khoaDonViDong(keyResult.objective);
		const cu = theo.get(khoa);
		if (cu) cu.conLai += 1;
		else
			theo.set(khoa, {
				khoa,
				ten: tenDonVi(keyResult.objective),
				conLai: 1,
			});
	}
	return {
		conLai: dong.length,
		theoDonVi: [...theo.values()].sort((a, b) => a.ten.localeCompare(b.ten)),
	};
}
