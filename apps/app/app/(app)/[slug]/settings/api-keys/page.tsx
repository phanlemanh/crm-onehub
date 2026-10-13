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
import { khoaApiMessages } from "@/lib/messages/settings-khoa-api";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { apiKeysSearchParams } from "./api-keys-search-params";
import { ApiKeysTable } from "./api-keys-table";
import { CreateApiKeySheet } from "./create-api-key-sheet";

export async function generateMetadata(): Promise<Metadata> {
	return { title: khoaApiMessages(await getLocale()).trang.tieuDeTab };
}

export default async function ApiKeysSettingsPage({
	searchParams,
}: PageProps<"/[slug]/settings/api-keys">) {
	const t = khoaApiMessages(await getLocale());

	return (
		<PageShell width="wide" className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>

				<PageShellActions>
					<CreateApiKeySheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="bang" />}>
					<ApiKeys searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function ApiKeys({
	searchParams,
}: Pick<PageProps<"/[slug]/settings/api-keys">, "searchParams">) {
	await requireSession();

	const values = await apiKeysSearchParams.load(searchParams);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery(
		trpc.apiKeys.list.queryOptions(apiKeysSearchParams.toInput(values)),
	);

	return (
		<HydrateClient>
			<ApiKeysTable />
		</HydrateClient>
	);
}
