import { homNayVN } from "@crm/validation/ngay-vn";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import type { RouterOutputs } from "@/lib/trpc/types";

type HopTuanOutput = RouterOutputs["okr"]["hopTuan"];

export type LyDoRong =
	| "chu-ky-chua-chay"
	| "chua-kr-cong-bo"
	| "chua-ai-cap-nhat"
	| null;

const PHA_CHUA_CHAY = "lap-ke-hoach" satisfies PhaChuKy;

export function lyDoRong(v: {
	hop: HopTuanOutput;
	chuKy: { phase: string; startsOn: string };
	homNay: Date;
}): LyDoRong {
	const { hop, chuKy, homNay } = v;
	const chuaCoCapNhat = hop.tongKr === 0 || hop.tuanDau;
	const chuaChay =
		chuKy.phase === PHA_CHUA_CHAY || homNayVN(homNay) < chuKy.startsOn;
	if (chuaChay && chuaCoCapNhat) return "chu-ky-chua-chay";
	if (hop.tongKr === 0) return "chua-kr-cong-bo";
	if (hop.tuanDau) return "chua-ai-cap-nhat";
	return null;
}
