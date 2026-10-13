import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { giaiKy, loadOkrSearchParams } from "../okr-search-params";
import { ToanCanh } from "./toan-canh";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrMessages(await getLocale()).tieuDe["toan-canh"] };
}

export default function ToanCanhPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<PageShellContent>
			<Suspense fallback={<KhungXuong hinh="tong-quan" />}>
				<NoiDung searchParams={searchParams} />
			</Suspense>
		</PageShellContent>
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
	]);
	const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
	if (cycleId)
		await queryClient.prefetchQuery(
			trpc.okr.toanCanh.queryOptions({ cycleId }),
		);

	return (
		<HydrateClient>
			<ToanCanh />
		</HydrateClient>
	);
}
