import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { workspaceUrl } from "@/lib/workspace-url";

export type ViTriKr = { donOkr: string; cycleId: string };

export const DUONG_BO_OKR = "/okr/bo-okr";
export const DUONG_CUA_TOI = "/okr";

export function dichKrTrongBo(
	slug: string,
	krId: string,
	viTri: ViTriKr | null,
): string {
	const record = `kr:${krId}`;
	if (viTri === null) {
		const thamSo = new URLSearchParams({
			[SEARCH_PARAM.record.stack]: record,
		});
		return `${workspaceUrl(slug, DUONG_CUA_TOI)}?${thamSo}`;
	}
	const thamSo = new URLSearchParams({
		[SEARCH_PARAM.okr.don]: viTri.donOkr,
		[SEARCH_PARAM.okr.ky]: viTri.cycleId,
		[SEARCH_PARAM.record.stack]: record,
	});
	return `${workspaceUrl(slug, DUONG_BO_OKR)}?${thamSo}`;
}

export async function giaiDichKr(
	slug: string,
	krId: string,
	hoi: (keyResultId: string) => Promise<ViTriKr | null>,
): Promise<string> {
	const viTri = await hoi(krId).catch(() => null);
	return dichKrTrongBo(slug, krId, viTri);
}
