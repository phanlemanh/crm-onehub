"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { okrMessages } from "@/lib/messages/okr";
import { canNhanLoai } from "@/lib/okr-chu-ky-nhan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { giaiKy, okrParsers } from "./okr-search-params";

export function useChuKy() {
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const [url, datUrl] = useQueryStates(okrParsers);
	const ky = url[SEARCH_PARAM.okr.ky];
	const macDinh = cycles.data?.currentId ?? null;
	const currentId = giaiKy(ky, cycles.data ?? null);
	const datKy = (id: string) =>
		void datUrl({ [SEARCH_PARAM.okr.ky]: id === macDinh ? null : id });
	return { cycles, currentId, ky, datKy };
}

export function ChonChuKy() {
	const locale = useLocale();
	const m = okrMessages(locale);
	const { cycles, currentId, datKy } = useChuKy();
	const ds = cycles.data?.cycles ?? [];
	if (ds.length === 0 || currentId === null) return null;
	return (
		<Select value={currentId} onValueChange={datKy}>
			<SelectTrigger aria-label={m.chuKy} size="sm" data-chon-chu-ky>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align="end">
				{ds.map((c) => (
					<SelectItem key={c.id} value={c.id}>
						<span translate="no">{c.name}</span>
						{canNhanLoai(c.name, m.loaiChuKy[c.kind], locale) ? (
							<span className="text-muted-foreground">
								{m.loaiChuKy[c.kind]}
							</span>
						) : null}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
