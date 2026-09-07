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
import { settingsMessages } from "@/lib/messages/settings";
import { ssoMessages } from "@/lib/messages/settings-sso";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AddSsoProviderSheet } from "./add-sso-provider-sheet";
import { ssoSearchParams } from "./sso-search-params";
import { SsoTable } from "./sso-table";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).thanhBen.sso };
}

export default function SsoSettingsPage(
	props: PageProps<"/[slug]/settings/sso">,
) {
	return (
		<Suspense fallback={<PageShellLoading />}>
			<SsoSettingsPageShell {...props} />
		</Suspense>
	);
}

async function SsoSettingsPageShell({
	searchParams,
}: PageProps<"/[slug]/settings/sso">) {
	const locale = await getLocale();
	const t = ssoMessages(locale);

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>
						<span translate="no">{settingsMessages(locale).thanhBen.sso}</span>
					</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>

				<PageShellActions>
					<AddSsoProviderSheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<Providers searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Providers({
	searchParams,
}: Pick<PageProps<"/[slug]/settings/sso">, "searchParams">) {
	await requireSession();

	const values = await ssoSearchParams.load(searchParams);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await Promise.all([
		queryClient.prefetchQuery(trpc.sso.settings.queryOptions()),
		queryClient.prefetchQuery(
			trpc.sso.list.queryOptions(ssoSearchParams.toInput(values)),
		),
	]);

	return (
		<HydrateClient>
			<SsoTable />
		</HydrateClient>
	);
}
