"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatCard } from "@crm/ui/components/stat-card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { okrMoiKrMessages } from "@/lib/messages/okr-moi-kr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { duongMoiKr, LOC_MOI_KR_RONG } from "../moi-kr/tham-so";
import { okrParsers } from "../okr-search-params";
import { DUONG_MUC } from "../tab-okr";

export function OKrTruot({ cycleId }: { cycleId: string }) {
	const t = okrMoiKrMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const [thamSo] = useQueryStates(okrParsers);
	const ds = useQuery(
		trpc.okr.moiKr.queryOptions({ cycleId, loc: LOC_MOI_KR_RONG }),
	);
	const so =
		ds.data?.facetCounts.tinhTrang.find((d) => d.value === "truot")?.count ?? 0;
	return (
		<StatCard
			asChild
			data-o="kr-truot"
			description={t.oTruotMoTa}
			label={t.oTruot}
			value={ds.isPending ? "—" : String(so)}
		>
			<Link
				href={duongMoiKr(url(DUONG_MUC["moi-kr"]), {
					ky: thamSo[SEARCH_PARAM.okr.ky],
					tinhTrang: ["truot"],
				})}
			/>
		</StatCard>
	);
}
