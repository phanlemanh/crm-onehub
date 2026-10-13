import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { giaiKy, loadOkrSearchParams } from "../../okr-search-params";
import { SucKhoe } from "./suc-khoe";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrToanCanhMessages(await getLocale()).toanCanh.suKhoe };
}

export default function SucKhoePage({
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
	const [cycles, access] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.fetchQuery(trpc.okr.access.queryOptions()).catch(() => null),
	]);
	const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
	if (access?.canManageProgram)
		await Promise.all([
			cycleId
				? queryClient.prefetchQuery(trpc.okr.sucKhoe.queryOptions({ cycleId }))
				: null,
			queryClient.prefetchQuery(trpc.okr.moCoi.queryOptions({})),
		]);

	return (
		<HydrateClient>
			<SucKhoe />
		</HydrateClient>
	);
}
