import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DangTaiDanhSach } from "./dang-tai";
import { DanhSach } from "./danh-sach";
import { loadTaiLieuSearchParams } from "./tai-lieu-search-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.danhSach };
}

export default function TaiLieuPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<PageShell>
			<Suspense fallback={<DangTaiDanhSach />}>
				<NoiDung searchParams={searchParams} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();

	const thamSo = await loadTaiLieuSearchParams(searchParams);
	const tab = thamSo[SEARCH_PARAM.taiLieu.tab];
	const loai = thamSo[SEARCH_PARAM.taiLieu.loai];
	const page = Math.max(1, thamSo[SEARCH_PARAM.list.page]);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.taiLieu.list.queryOptions({ loai: loai ?? undefined, page }),
		),
		queryClient.prefetchQuery(trpc.taiLieu.proposals.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DanhSach loai={loai} page={page} tab={tab} />
		</HydrateClient>
	);
}
