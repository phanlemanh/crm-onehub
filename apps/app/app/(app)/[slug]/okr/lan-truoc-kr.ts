import { homNayVN } from "@crm/validation/ngay-vn";
import { type MucTuTin, mucCapNhat } from "@crm/validation/okr-cap-nhat";
import { soKr } from "@crm/validation/okr-kr";
import type { RouterOutputs } from "@/lib/trpc/types";

type VetDong = Pick<
	RouterOutputs["okr"]["objective"]["trail"][number],
	"action" | "keyResultId" | "at" | "after"
>;

type DiemGhiChu = { tuan: string; ghiChu: string | null };

export type LanTruocKr = {
	luc: string;
	giaTri: number | null;
	tuTin: MucTuTin | null;
};

const TUAN_VN = { soNgay: 7, luiVeThuHai: 6 } as const;

export function lanTruocTuVet(
	trail: readonly VetDong[],
	keyResultId: string,
): LanTruocKr | null {
	const cuoi = trail
		.filter(
			(v) => v.action === "cap-nhat-tuan" && v.keyResultId === keyResultId,
		)
		.reduce<VetDong | null>(
			(moi, v) => (moi === null || v.at >= moi.at ? v : moi),
			null,
		);
	if (cuoi === null) return null;
	const so = soKr.safeParse(cuoi.after?.currentValue);
	const tuTin = mucCapNhat.shape.confidence.safeParse(cuoi.after?.confidence);
	return {
		luc: cuoi.at,
		giaTri: so.success ? so.data : null,
		tuTin: tuTin.success ? tuTin.data : null,
	};
}

export function tuanVN(luc: string): string {
	const ngay = new Date(`${homNayVN(new Date(luc))}T00:00:00Z`);
	const lui = (ngay.getUTCDay() + TUAN_VN.luiVeThuHai) % TUAN_VN.soNgay;
	ngay.setUTCDate(ngay.getUTCDate() - lui);
	return ngay.toISOString().slice(0, 10);
}

export function ghiChuLanTruoc(
	diem: readonly DiemGhiChu[],
	luc: string,
): string | null {
	const tuan = tuanVN(luc);
	return diem.find((d) => d.tuan === tuan)?.ghiChu ?? null;
}
