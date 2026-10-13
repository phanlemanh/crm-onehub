import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { Skeleton } from "@crm/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { coHoiCuaVai } from "./co-hoi";
import { DanhSach } from "./danh-sach";
import { DongNguonTat, HanhDongTaiLieu } from "./dau-trang-tai-lieu";
import type { LuaChonTai } from "./hop-tai-nguon";
import { chuTrangVaDonVi, trangDangDung } from "./lua-chon-trang";
import { loadTaiLieuSearchParams } from "./tai-lieu-search-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.danhSach };
}

export default async function TaiLieuPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const m = taiLieuMessages(await getLocale());

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
					<Suspense fallback={null}>
						<DongNguon />
					</Suspense>
				</PageShellHeading>
				<PageShellActions>
					<Suspense
						fallback={<Skeleton className="h-8 w-80 max-w-full rounded-md" />}
					>
						<HanhDong searchParams={searchParams} />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>
			<Suspense fallback={<KhungXuong hinh="bang" />}>
				<NoiDung searchParams={searchParams} />
			</Suspense>
		</PageShell>
	);
}

async function thamSoTaiLieu(searchParams: SearchParams) {
	const thamSo = await loadTaiLieuSearchParams(searchParams);
	return {
		tab: thamSo[SEARCH_PARAM.taiLieu.tab],
		loai: thamSo[SEARCH_PARAM.taiLieu.loai],
		donVi: thamSo[SEARCH_PARAM.taiLieu.donVi],
		chu: thamSo[SEARCH_PARAM.taiLieu.chu],
		nhom: thamSo[SEARCH_PARAM.taiLieu.nhom],
		page: Math.max(1, thamSo[SEARCH_PARAM.list.page]),
	};
}

async function DongNguon() {
	await requireSession();
	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(
		getServerTrpc().taiLieuNguon.trangThai.queryOptions(),
	);
	return (
		<HydrateClient>
			<DongNguonTat />
		</HydrateClient>
	);
}

async function HanhDong({ searchParams }: { searchParams: SearchParams }) {
	const session = await requireSession();
	const loc = await thamSoTaiLieu(searchParams);
	const queryClient = getServerQueryClient();
	const [trangThai, chonNguoi] = await Promise.all([
		queryClient
			.fetchQuery(getServerTrpc().taiLieuNguon.trangThai.queryOptions())
			.catch(() => null),
		chuTrangVaDonVi(session.user),
	]);
	const luaChon: LuaChonTai = {
		toiId: session.user.id,
		...chonNguoi,
		trangDangDung: trangThai?.bat ? await trangDangDung() : [],
	};
	return (
		<HydrateClient>
			<HanhDongTaiLieu {...loc} luaChon={luaChon} />
		</HydrateClient>
	);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();

	const { tab, loai, donVi, chu, nhom, page } =
		await thamSoTaiLieu(searchParams);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [workspace] = await Promise.all([
		queryClient.fetchQuery(trpc.workspace.get.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(
			trpc.taiLieu.list.queryOptions({
				loai: loai ?? undefined,
				donViId: donVi ?? undefined,
				chuTrangId: chu ?? undefined,
				page,
			}),
		),
		queryClient.prefetchQuery(trpc.taiLieu.proposals.queryOptions()),
		tab === "trang"
			? queryClient.prefetchQuery(trpc.taiLieu.boLoc.queryOptions())
			: null,
		tab === "suc-khoe"
			? queryClient.prefetchQuery(trpc.taiLieu.sucKhoe.queryOptions())
			: null,
		tab === "cho-duyet"
			? queryClient.prefetchQuery(
					trpc.taiLieu.proposals.queryOptions({ nhom, page }),
				)
			: null,
		tab === "nguon"
			? queryClient.prefetchQuery(trpc.taiLieuNguon.list.queryOptions())
			: null,
	]);
	const coHoi = coHoiCuaVai(workspace?.viewerRole);

	return (
		<HydrateClient>
			<DanhSach
				chu={chu}
				coHoi={coHoi}
				donVi={donVi}
				loai={loai}
				nhom={nhom}
				page={page}
				tab={tab}
			/>
		</HydrateClient>
	);
}
