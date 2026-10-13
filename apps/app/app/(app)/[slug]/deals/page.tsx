import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { dealMessages } from "@/lib/messages/deals";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CreateDealSheet } from "./create-deal-sheet";
import {
	dealBoardInputFrom,
	dealsSearchParams,
	loadDealsView,
	showsBoard,
} from "./deals-search-params";
import { DealsTable } from "./deals-table";

export async function generateMetadata(): Promise<Metadata> {
	return { title: dealMessages(await getLocale()).title };
}

export default async function DealsPage({
	searchParams,
}: PageProps<"/[slug]/deals">) {
	const m = dealMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.description}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<CreateDealSheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="bang" />}>
					<Deals searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Deals({
	searchParams,
}: Pick<PageProps<"/[slug]/deals">, "searchParams">) {
	const [, values, { view }] = await Promise.all([
		requireSession(),
		dealsSearchParams.load(searchParams),
		loadDealsView(searchParams),
	]);
	const input = dealsSearchParams.toInput(values);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(trpc.deals.list.queryOptions(input)),
		showsBoard(view, input.archived)
			? queryClient.prefetchQuery(
					trpc.deals.board.queryOptions(dealBoardInputFrom(input)),
				)
			: Promise.resolve(),
		queryClient.prefetchQuery(trpc.users.list.queryOptions()),
		queryClient.prefetchQuery(trpc.giaiDoan.list.queryOptions()),
		queryClient.prefetchQuery(trpc.companies.options.queryOptions({ q: "" })),
	]);

	return (
		<HydrateClient>
			<DealsTable />
		</HydrateClient>
	);
}
