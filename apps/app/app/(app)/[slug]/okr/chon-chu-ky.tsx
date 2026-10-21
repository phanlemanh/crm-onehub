"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	type PeriodGroup,
	type PeriodItem,
	PeriodSelect,
} from "@crm/ui/components/period-select";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import { okrMessages } from "@/lib/messages/okr";
import { canNhanLoai } from "@/lib/okr-chu-ky-nhan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import {
	giaiKy,
	giaiKyHoiY,
	kyMacDinhHoiY,
	kyTrongOChon,
	okrParsers,
} from "./okr-search-params";
import { tabTuDuong } from "./tab-okr";

export function useKyHoiY() {
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const [url] = useQueryStates(okrParsers);
	return {
		cycles,
		cycleId: giaiKyHoiY(url[SEARCH_PARAM.okr.ky], cycles.data ?? null),
	};
}

export function useChuKy() {
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const [url, datUrl] = useQueryStates(okrParsers);
	const ky = url[SEARCH_PARAM.okr.ky];
	const hoiY = tabTuDuong(usePathname()) === "hoi-y";
	const macDinh = cycles.data
		? hoiY
			? kyMacDinhHoiY(cycles.data)
			: cycles.data.currentId
		: null;
	const currentId = hoiY
		? giaiKyHoiY(ky, cycles.data ?? null)
		: giaiKy(ky, cycles.data ?? null);
	const haiMacDinhKhac =
		cycles.data !== undefined &&
		kyMacDinhHoiY(cycles.data) !== cycles.data.currentId;
	const datKy = (id: string) =>
		void datUrl({
			[SEARCH_PARAM.okr.ky]: id === macDinh && !haiMacDinhKhac ? null : id,
		});
	return { cycles, currentId, ky, datKy };
}

export function ChonChuKy() {
	const locale = useLocale();
	const m = okrMessages(locale);
	const { cycles, currentId, datKy } = useChuKy();
	const ds = kyTrongOChon(cycles.data?.cycles ?? []);
	if (ds.length === 0 || currentId === null) return null;
	const dangChay = cycles.data?.currentId ?? null;
	const nhan = (c: (typeof ds)[number]) =>
		canNhanLoai(c.name, m.loaiChuKy[c.kind], locale)
			? `${c.name} · ${m.loaiChuKy[c.kind]}`
			: c.name;
	const muc = (c: (typeof ds)[number]): PeriodItem => ({
		value: c.id,
		label: nhan(c),
		current: c.id === dangChay,
		closed: c.phase === "da-dong",
	});
	const theoNgay = (a: { startsOn: string }, b: { startsOn: string }) =>
		a.startsOn.localeCompare(b.startsOn);
	const nam = ds.filter((c) => c.kind === "nam").sort(theoNgay);
	const conCua = (id: string) =>
		ds.filter((c) => c.parentId === id).sort(theoNgay);
	const moCoi = ds
		.filter((c) => c.kind !== "nam" && !nam.some((n) => n.id === c.parentId))
		.sort(theoNgay);
	const groups: PeriodGroup[] = [
		...nam.map((n) => ({
			label: n.name,
			items: [muc(n), ...conCua(n.id).map(muc)],
		})),
		{ label: m.chuKy, items: moCoi.map(muc) },
	].filter((g) => g.items.length > 0);
	return (
		<PeriodSelect
			groups={groups}
			label={m.chuKy}
			onValueChange={datKy}
			triggerAttrs={{ "data-chon-chu-ky": "" }}
			value={currentId}
		/>
	);
}
