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
import type { LuaChonTai } from "./hop-tai-nguon";
import { chuTrangVaDonVi, trangDangDung } from "./lua-chon-trang";
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
	const session = await requireSession();

	const thamSo = await loadTaiLieuSearchParams(searchParams);
	const tab = thamSo[SEARCH_PARAM.taiLieu.tab];
	const loai = thamSo[SEARCH_PARAM.taiLieu.loai];
	const page = Math.max(1, thamSo[SEARCH_PARAM.list.page]);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [trangThai, chonNguoi] = await Promise.all([
		queryClient
			.fetchQuery(trpc.taiLieuNguon.trangThai.queryOptions())
			.catch(() => null),
		chuTrangVaDonVi(session.user),
		queryClient.prefetchQuery(
			trpc.taiLieu.list.queryOptions({ loai: loai ?? undefined, page }),
		),
		queryClient.prefetchQuery(trpc.taiLieu.proposals.queryOptions()),
		tab === "nguon"
			? queryClient.prefetchQuery(trpc.taiLieuNguon.list.queryOptions())
			: null,
	]);
	const luaChon: LuaChonTai = {
		toiId: session.user.id,
		...chonNguoi,
		trangDangDung: trangThai?.bat ? await trangDangDung() : [],
	};

	return (
		<HydrateClient>
			<DanhSach loai={loai} luaChon={luaChon} page={page} tab={tab} />
		</HydrateClient>
	);
}
