import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import {
	getServerQueryClient,
	getServerTrpc,
	getServerTrpcClient,
} from "@/lib/trpc/server";
import { DashboardSummary } from "./dashboard-summary";
import {
	OverviewGreeting,
	OverviewGreetingFallback,
} from "./overview-greeting";
import {
	OverviewScopeToggle,
	OverviewScopeToggleFallback,
} from "./overview-scope";
import { loadOverviewSearchParams } from "./overview-search-params";
import { TongQuanChiOkr } from "./tong-quan-chi-okr";

export async function generateMetadata(): Promise<Metadata> {
	return { title: tongQuanMessages(await getLocale()).title };
}

export default async function OverviewPage({
	params,
	searchParams,
}: PageProps<"/[slug]">) {
	const [{ slug }, workspace] = await Promise.all([
		params,
		getServerTrpcClient().workspace.get.query(),
	]);

	if (laVaiChiOkr(toWorkspaceRole(workspace.viewerRole ?? "member"))) {
		return <TongQuanChiOkr slug={slug} />;
	}

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<Suspense fallback={<OverviewGreetingFallback />}>
						<OverviewGreeting />
					</Suspense>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={<OverviewScopeToggleFallback />}>
						<OverviewScopeToggle />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="tong-quan" />}>
					<Summary searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Summary({
	searchParams,
}: Pick<PageProps<"/[slug]">, "searchParams">) {
	const [, { scope }] = await Promise.all([
		requireSession(),
		loadOverviewSearchParams(searchParams),
	]);

	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			getServerTrpc().dashboard.summary.queryOptions({ scope }),
		),
		queryClient.prefetchQuery(getServerTrpc().giaiDoan.list.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DashboardSummary />
		</HydrateClient>
	);
}
