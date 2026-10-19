"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { TrangThongBaoThan } from "@/components/thong-bao/trang-thong-bao";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { nhomTheoNgay } from "@/lib/thong-bao/dong";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceSlug } from "@/lib/use-workspace-url";
import { thongBaoParsers } from "./thong-bao-search-params";

export function DanhSachThongBaoTrang() {
	const locale = useLocale();
	const m = thongBaoMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const slug = useWorkspaceSlug();
	const [loc, setLoc] = useQueryState(
		SEARCH_PARAM.thongBao.loc,
		thongBaoParsers[SEARCH_PARAM.thongBao.loc],
	);
	const ds = useInfiniteQuery(
		trpc.thongBao.danhSach.infiniteQueryOptions(
			{ chiChuaDoc: loc === "chua-doc" },
			{ getNextPageParam: (trang) => trang.conTroSau ?? undefined },
		),
	);
	const moMot = useMutation(
		trpc.thongBao.moMot.mutationOptions({
			onSuccess: () => void cache.thongBao(),
		}),
	);
	const dong = ds.data?.pages.flatMap((trang) => trang.dong) ?? [];
	return (
		<TrangThongBaoThan
			coThem={ds.hasNextPage}
			dangThem={ds.isFetchingNextPage}
			loc={loc}
			nhom={nhomTheoNgay(
				dong,
				{ locale, slug, now: new Date() },
				m.chuong.homNay,
			)}
			onLoc={(moi) => void setLoc(moi)}
			onMo={(id) => moMot.mutate({ id })}
			onThuLai={() => void ds.refetch()}
			onXemThem={() => void ds.fetchNextPage()}
			trangThai={ds.isPending ? "cho-tai" : ds.isError ? "loi" : "xong"}
		/>
	);
}
