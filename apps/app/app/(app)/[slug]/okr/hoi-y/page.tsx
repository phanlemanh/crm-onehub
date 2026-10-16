import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DauTrangOkrTrang } from "../dau-trang-okr";
import { giaiKyHoiY, loadOkrSearchParams } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { HoiYMan } from "./hoi-y";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: tieuDeTrinhDuyet(await getLocale(), "hoi-y") };
}

export default function HoiYPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<>
			<DauTrangOkrTrang tab="hoi-y" />
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="tong-quan" />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</>
	);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();
	const thamSo = await loadOkrSearchParams(searchParams);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
	]);
	const cycleId = giaiKyHoiY(thamSo[SEARCH_PARAM.okr.ky], cycles);
	if (cycleId) {
		const hoiY = await queryClient
			.fetchQuery(trpc.okr.hoiY.queryOptions({ cycleId }))
			.catch(() => null);
		if (hoiY && hoiY.trangThai !== "da-cong-bo")
			await queryClient.prefetchQuery(
				trpc.okr.hoiYDoPhu.queryOptions({ hoiYId: hoiY.hoiY.id }),
			);
	}

	return (
		<HydrateClient>
			<HoiYMan />
		</HydrateClient>
	);
}
