import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShellContent,
	PageShellDescription,
	PageShellFallback,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMoiKrMessages } from "@/lib/messages/okr-moi-kr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { giaiKy, loadOkrSearchParams } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { MoiKr } from "./moi-kr";
import { loadMoiKrSearchParams } from "./tham-so";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	return {
		title: tieuDeTrinhDuyet(locale, okrMoiKrMessages(locale).tieuDe),
	};
}

export default async function MoiKrPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const t = okrMoiKrMessages(await getLocale());
	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<PageShellFallback />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</>
	);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();
	const [thamSo, loc] = await Promise.all([
		loadOkrSearchParams(searchParams),
		loadMoiKrSearchParams(searchParams),
	]);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
	]);
	const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
	if (cycleId)
		await queryClient.prefetchQuery(
			trpc.okr.moiKr.queryOptions({
				cycleId,
				loc: {
					tinhTrang: loc[SEARCH_PARAM.okr.tinhTrangKr],
					donVi: loc[SEARCH_PARAM.okr.donViKr],
					nguoi: loc[SEARCH_PARAM.okr.nguoiKr],
				},
			}),
		);

	return (
		<HydrateClient>
			<MoiKr />
		</HydrateClient>
	);
}
