"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import {
	type DonChonOkr,
	khoaDon,
	parseAsDonOkr,
} from "@/app/(app)/[slug]/okr/okr-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";

const TIEN_TO = "hop";
const NGAN = "~";

export type NguonHop = { cycleId: string; unit: DonChonOkr };

export function khoaThuTuHop(cycleId: string, unit: DonChonOkr): string {
	return [TIEN_TO, cycleId, khoaDon(unit)].join(NGAN);
}

export function docThuTuHop(raw: string | null): NguonHop | null {
	if (!raw) return null;
	const [tienTo, cycleId, don, ...du] = raw.split(NGAN);
	if (tienTo !== TIEN_TO || !cycleId || !don || du.length > 0) return null;
	const unit = parseAsDonOkr.parse(don);
	return unit ? { cycleId, unit } : null;
}

export type DongThuTu = { keyResultId: string; objectiveId: string };

export function useThuTuHopTuan(keyResultId: string): DongThuTu[] | null {
	const trpc = useTRPC();
	const [raw] = useQueryState(SEARCH_PARAM.record.thuTu, parseAsString);
	const nguon = docThuTuHop(raw);
	const q = useQuery({
		...trpc.okr.hopTuan.queryOptions(
			nguon ?? { cycleId: "", unit: { loai: "goc" } },
		),
		enabled: nguon !== null,
	});
	if (!nguon || !q.data) return null;
	const ds = [...q.data.dangBan, ...q.data.conLai].map((d) => ({
		keyResultId: d.keyResultId,
		objectiveId: d.objectiveId,
	}));
	return ds.some((d) => d.keyResultId === keyResultId) ? ds : null;
}
