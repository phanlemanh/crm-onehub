import type { CaGopY } from "@crm/validation/okr-ca-gop-y";

export const COT_DONG_TONG_KET = {
	id: true,
	loai: true,
	keyResultId: true,
	truong: true,
	truoc: true,
	sau: true,
	maVanDe: true,
	lyDo: true,
	trangThai: true,
	maLoai: true,
} as const;

export type BanGhiTongKet<D> = {
	ca: Pick<CaGopY, "id" | "bo">;
	objectiveId: string;
	krs: readonly { id: string; title: string }[];
	capTrenKr: readonly string[];
	taskId: string;
	outcome: string | null;
	dong: readonly D[];
};

export function dongTongKet<D>(ban: BanGhiTongKet<D>): string {
	return `${JSON.stringify({
		ca: ban.ca.id,
		bo: ban.ca.bo,
		objectiveId: ban.objectiveId,
		krs: ban.krs,
		capTrenKr: ban.capTrenKr,
		taskId: ban.taskId,
		outcome: ban.outcome,
		dong: ban.dong,
	})}\n`;
}
