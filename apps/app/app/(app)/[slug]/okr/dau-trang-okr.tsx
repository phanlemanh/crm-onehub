import { Skeleton } from "@crm/ui/components/skeleton";
import { Suspense } from "react";
import { okrBridgeConfigured } from "@/lib/agent-bridge";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChonChuKy } from "./chon-chu-ky";
import { DaiKy } from "./dai-ky";
import { DauTrangOkrHoiY } from "./dau-trang-hoi-y";
import { donDich } from "./don-dich";
import { LuoiDauTrangOkr } from "./luoi-dau-trang";
import {
	giaiKy,
	kyMacDinhHoiY,
	loadOkrSearchParams,
	locOkr,
} from "./okr-search-params";
import type { TabOkr } from "./tab-okr";
import { tieuDeKhu } from "./tieu-de-khu";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function DauTrangOkrTrang({
	tab,
	searchParams,
}: {
	tab: TabOkr;
	searchParams?: SearchParams;
}) {
	const locale = await getLocale();
	const m = okrMessages(locale);
	return (
		<Suspense
			fallback={
				<DauTrangOkrCho moTa={m.moTa[tab]} tieuDe={tieuDeKhu(locale)} />
			}
		>
			<DauTrangCoDuLieu searchParams={searchParams} tab={tab} />
		</Suspense>
	);
}

function DauTrangOkrCho({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	return (
		<LuoiDauTrangOkr
			hanhDong={
				<>
					<Skeleton className="h-7 w-24" />
					<Skeleton className="h-7 w-56" data-hang-cho="" />
				</>
			}
			moTa={moTa}
			thanhTab={<Skeleton className="h-9 w-full max-w-xl" />}
			tieuDe={tieuDe}
		/>
	);
}

async function DauTrangCoDuLieu({
	tab,
	searchParams,
}: {
	tab: TabOkr;
	searchParams?: SearchParams;
}) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		queryClient.prefetchQuery(trpc.workspace.get.queryOptions()),
	]);
	const kyHoiY = cycles ? kyMacDinhHoiY(cycles) : null;
	if (kyHoiY)
		await queryClient.prefetchQuery(
			trpc.okr.hoiYNhan.queryOptions({ cycleId: kyHoiY }),
		);
	if (tab === "theo-don-vi" && searchParams && cycles) {
		const thamSo = await loadOkrSearchParams(searchParams);
		const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
		if (cycleId)
			await queryClient.prefetchQuery(
				trpc.okr.danhSach.queryOptions({
					cycleId,
					unit: donDich(tab, thamSo[SEARCH_PARAM.okr.don], undefined).don,
					loc: locOkr(thamSo),
				}),
			);
	}

	return (
		<HydrateClient>
			<DauTrangOkrHoiY
				cauNoi={okrBridgeConfigured()}
				chonChuKy={<ChonChuKy />}
			/>
			<DaiKy />
		</HydrateClient>
	);
}
