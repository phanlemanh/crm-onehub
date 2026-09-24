import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { HanhDongToChuc } from "./hanh-dong-dau-trang";
import { ToChuc } from "./to-chuc";

export async function generateMetadata(): Promise<Metadata> {
	return { title: toChucMessages(await getLocale()).title };
}

export default async function CaiDatToChucPage() {
	const m = toChucMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<HanhDongToChuc />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<CaiDat />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function CaiDat() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [, , workspace] = await Promise.all([
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		queryClient.prefetchQuery(trpc.org.access.queryOptions()),
		queryClient.fetchQuery(trpc.workspace.get.queryOptions()).catch(() => null),
	]);

	return (
		<HydrateClient>
			<ToChuc tenGoc={workspace?.name || undefined} />
		</HydrateClient>
	);
}
