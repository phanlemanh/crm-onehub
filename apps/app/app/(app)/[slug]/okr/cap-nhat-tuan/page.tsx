import type { LoiVao } from "@crm/validation/okr-cap-nhat";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import {
	getServerQueryClient,
	getServerTrpc,
	getServerTrpcClient,
} from "@/lib/trpc/server";
import { DauTrangOkrTrang } from "../dau-trang-okr";
import { loadOkrSearchParams } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { CapNhatTuan, DangTaiCapNhat } from "./cap-nhat-tuan";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: tieuDeTrinhDuyet(await getLocale(), "cap-nhat-tuan") };
}

export default function CapNhatTuanPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<>
			<DauTrangOkrTrang tab="cap-nhat-tuan" />
			<PageShellContent>
				<Suspense fallback={<DangTaiCapNhat />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</>
	);
}

async function moPhien(entry: LoiVao): Promise<string | null> {
	return getServerTrpcClient()
		.okr.moCapNhat.mutate({ entry })
		.then((kq) => kq.sessionId)
		.catch(() => null);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();

	const entry = (await loadOkrSearchParams(searchParams))[SEARCH_PARAM.okr.tu];
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const duLieu = await queryClient
		.fetchQuery(trpc.okr.capNhatTuan.queryOptions())
		.catch(() => null);
	const sessionId =
		duLieu !== null && duLieu.items.length > 0 ? await moPhien(entry) : null;

	return (
		<HydrateClient>
			<CapNhatTuan entry={entry} key={sessionId} sessionId={sessionId} />
		</HydrateClient>
	);
}
