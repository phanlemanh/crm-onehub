import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { CaiDatBreadcrumb } from "@/components/cai-dat-breadcrumb";
import { PageShell, PageShellHeader } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { campaignMessages } from "@/lib/messages/campaigns";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { CampaignDetail } from "./campaign-detail";
import {
	loadUncalled,
	MEMBERS_PARAM,
	memberInput,
	membersSearchParams,
} from "./members-search-params";

export async function generateMetadata(): Promise<Metadata> {
	return { title: campaignMessages(await getLocale()).title };
}

export default async function CampaignPage({
	params,
	searchParams,
}: PageProps<"/[slug]/campaigns/[campaignId]">) {
	const [{ slug }, locale] = await Promise.all([params, getLocale()]);
	const duongDan = (
		<CaiDatBreadcrumb
			cap={[
				{
					nhan: campaignMessages(locale).title,
					href: workspaceUrl(slug, "/campaigns"),
				},
			]}
		/>
	);
	return (
		<PageShell className="min-h-0">
			<Suspense
				fallback={
					<PageShellHeader breadcrumb={duongDan}>
						<div className="basis-full">
							<KhungXuong coTieuDe hinh="tong-quan" />
						</div>
					</PageShellHeader>
				}
			>
				<Campaign
					duongDan={duongDan}
					params={params}
					searchParams={searchParams}
				/>
			</Suspense>
		</PageShell>
	);
}

async function Campaign({
	params,
	searchParams,
	duongDan,
}: Pick<
	PageProps<"/[slug]/campaigns/[campaignId]">,
	"params" | "searchParams"
> & { duongDan: ReactNode }) {
	const [, { campaignId }, values, flags] = await Promise.all([
		requireSession(),
		params,
		membersSearchParams.load(searchParams),
		loadUncalled(searchParams),
	]);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.campaigns.byId.queryOptions({ id: campaignId }),
		),
		queryClient.prefetchQuery(
			trpc.campaigns.members.queryOptions(
				memberInput(
					campaignId,
					membersSearchParams.toInput(values),
					flags[MEMBERS_PARAM.uncalled],
				),
			),
		),
	]);

	return (
		<HydrateClient>
			<CampaignDetail duongDan={duongDan} id={campaignId} />
		</HydrateClient>
	);
}
