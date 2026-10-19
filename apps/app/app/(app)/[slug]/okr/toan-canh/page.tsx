import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { SectionHeading } from "@crm/ui/components/section-heading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DauTrangOkrTrang } from "../dau-trang-okr";
import { giaiKy, loadOkrSearchParams } from "../okr-search-params";
import { tieuDeTrinhDuyet } from "../tieu-de-khu";
import { SucKhoe } from "./suc-khoe/suc-khoe";
import { ToanCanh } from "./toan-canh";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: tieuDeTrinhDuyet(await getLocale(), "toan-canh") };
}

export default function ToanCanhPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	return (
		<>
			<DauTrangOkrTrang tab="toan-canh" />
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="tong-quan" />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</>
	);
}

async function NoiDung({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();
	const thamSo = await loadOkrSearchParams(searchParams);
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles, access, locale] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.fetchQuery(trpc.okr.access.queryOptions()).catch(() => null),
		getLocale(),
	]);
	const cycleId = giaiKy(thamSo[SEARCH_PARAM.okr.ky], cycles);
	const quanTri = access?.canManageProgram === true;
	await Promise.all([
		cycleId
			? queryClient.prefetchQuery(trpc.okr.toanCanh.queryOptions({ cycleId }))
			: null,
		quanTri && cycleId
			? queryClient.prefetchQuery(trpc.okr.sucKhoe.queryOptions({ cycleId }))
			: null,
		quanTri ? queryClient.prefetchQuery(trpc.okr.moCoi.queryOptions({})) : null,
	]);

	return (
		<HydrateClient>
			<ToanCanh />
			{quanTri ? (
				<section
					aria-labelledby="chuong-trinh-tieu-de"
					className="flex scroll-mt-6 flex-col gap-4"
					data-phan="chuong-trinh"
					id="chuong-trinh"
				>
					<SectionHeading id="chuong-trinh-tieu-de" level={2}>
						{okrVoKhuMessages(locale).chuongTrinh}
					</SectionHeading>
					<SucKhoe duongDan={false} />
				</section>
			) : null}
		</HydrateClient>
	);
}
