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
import { giaiKy, loadOkrSearchParams, locOkr } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { TheoDonVi } from "./theo-don-vi";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: tieuDeTrinhDuyet(await getLocale(), "theo-don-vi") };
}

export default function TheoDonViPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<>
			<DauTrangOkrTrang tab="theo-don-vi" />
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
		queryClient.prefetchQuery(trpc.workspace.get.queryOptions()),
	]);
	const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
	if (cycleId) {
		const unit = thamSo[SEARCH_PARAM.okr.don] ?? { loai: "goc" as const };
		await Promise.all([
			queryClient.prefetchQuery(trpc.okr.countByUnit.queryOptions({ cycleId })),
			queryClient.prefetchQuery(
				trpc.okr.danhSach.queryOptions({
					cycleId,
					unit,
					loc: locOkr(thamSo),
				}),
			),
			thamSo[SEARCH_PARAM.okr.xem] === "cay"
				? queryClient.prefetchQuery(
						trpc.okr.cayCanChinh.queryOptions({ cycleId }),
					)
				: Promise.resolve(),
		]);
	}

	return (
		<HydrateClient>
			<TheoDonVi />
		</HydrateClient>
	);
}
