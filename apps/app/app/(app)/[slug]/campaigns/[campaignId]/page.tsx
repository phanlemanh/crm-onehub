import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
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
	return (
		<PageShell className="min-h-0">
			<PageShellHeader
				breadcrumb={
					<CaiDatBreadcrumb
						cap={[
							{
								nhan: campaignMessages(locale).title,
								href: workspaceUrl(slug, "/campaigns"),
							},
						]}
					/>
				}
			/>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<Campaign params={params} searchParams={searchParams} />
			</Suspense>
		</PageShell>
	);
}

async function Campaign({
	params,
	searchParams,
}: Pick<
	PageProps<"/[slug]/campaigns/[campaignId]">,
	"params" | "searchParams"
>) {
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
			<CampaignDetail id={campaignId} />
		</HydrateClient>
	);
}
