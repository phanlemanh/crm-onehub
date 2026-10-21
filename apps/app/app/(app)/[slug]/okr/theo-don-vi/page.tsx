import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DauTrangOkrTrang } from "../dau-trang-okr";
import { giaiKy, loadOkrSearchParams, locOkr } from "../okr-search-params";
import { duongSoDoTuBoOkr } from "../so-do/duong-so-do";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { KhungDangTaiDonVi } from "./hang-cong-cu";
import { TheoDonVi } from "./theo-don-vi";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ slug: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: tieuDeTrinhDuyet(await getLocale(), "theo-don-vi") };
}

export default function TheoDonViPage({
	params,
	searchParams,
}: {
	params?: Params;
	searchParams: SearchParams;
}) {
	return (
		<>
			{params ? (
				<Suspense fallback={null}>
					<ChuyenSoDoCu params={params} searchParams={searchParams} />
				</Suspense>
			) : null}
			<DauTrangOkrTrang searchParams={searchParams} tab="theo-don-vi" />
			<PageShellContent>
				<Suspense fallback={<KhungDangTaiDonVi />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</>
	);
}

async function ChuyenSoDoCu({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: SearchParams;
}): Promise<null> {
	const [{ slug }, thamSo] = await Promise.all([params, searchParams]);
	const dich = duongSoDoTuBoOkr(slug, thamSo);
	if (dich) redirect(dich);
	return null;
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
		]);
	}

	return (
		<HydrateClient>
			<TheoDonVi />
		</HydrateClient>
	);
}
