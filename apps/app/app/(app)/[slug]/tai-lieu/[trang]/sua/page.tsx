import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { duongTrang } from "@/lib/tai-lieu-man";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import { ManSoan } from "../../man-soan";
import { loadSuaSearchParams } from "./sua-search-params";

type Params = Promise<{ slug: string; trang: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.sua };
}

export default function SuaTrangPage({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: SearchParams;
}) {
	return (
		<PageShell>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<NoiDung params={params} searchParams={searchParams} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: SearchParams;
}) {
	await requireSession();

	const { slug: workspace, trang: slug } = await params;
	const tuDeXuat = (await loadSuaSearchParams(searchParams))[
		SEARCH_PARAM.taiLieu.tuDeXuat
	];
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [trang, banMay] = await Promise.all([
		nullIfMissing(
			queryClient.fetchQuery(trpc.taiLieu.get.queryOptions({ slug })),
		),
		tuDeXuat
			? nullIfMissing(
					queryClient.fetchQuery(
						trpc.taiLieu.proposal.queryOptions({ id: tuDeXuat }),
					),
				)
			: null,
	]);
	if (!trang) notFound();
	if (tuDeXuat) {
		if (!banMay || banMay.slug !== trang.slug) notFound();
		return (
			<HydrateClient>
				<ManSoan
					key={banMay.id}
					vao={{
						kieu: "sua",
						slug: trang.slug,
						ten: banMay.ten,
						banGoc: banMay.noiDung,
						tuDeXuatId: banMay.id,
					}}
				/>
			</HydrateClient>
		);
	}
	if (trang.choLanDau?.dangCho === "duyet")
		redirect(workspaceUrl(workspace, duongTrang(trang.slug)));

	return (
		<HydrateClient>
			<ManSoan
				key={trang.phienBan?.so ?? 0}
				vao={{
					kieu: "sua",
					slug: trang.slug,
					ten: trang.ten,
					banGoc: trang.noiDung ?? "",
				}}
			/>
		</HydrateClient>
	);
}
