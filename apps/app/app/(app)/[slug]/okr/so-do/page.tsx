import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { giaiKy, loadOkrSearchParams } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { ManSoDo, ManSoDoCho } from "./man-so-do";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	return {
		title: tieuDeTrinhDuyet(locale, okrVoKhuMessages(locale).soDo.tieuDe),
	};
}

export default function SoDoPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<Suspense fallback={<ManSoDoCho coTam={false} />}>
			<NoiDung searchParams={searchParams} />
		</Suspense>
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
			trpc.okr.soDoDonVi.queryOptions({ cycleId }),
		);

	return (
		<HydrateClient>
			<ManSoDo tam={null} />
		</HydrateClient>
	);
}
