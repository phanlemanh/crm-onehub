import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { settingsMessages } from "@/lib/messages/settings";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CurrencySettings } from "./currency-settings";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.tienTe };
}

export default function CurrenciesSettingsPage() {
	return (
		<Suspense fallback={<PageShellLoading />}>
			<CurrenciesSettingsPageShell />
		</Suspense>
	);
}

async function CurrenciesSettingsPageShell() {
	const t = settingsMessages(await getLocale());

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.tienTe.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.tienTe.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Currencies />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Currencies() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery(trpc.currency.settings.queryOptions());

	return (
		<HydrateClient>
			<div className="flex max-w-3xl flex-col gap-6">
				<CurrencySettings />
			</div>
		</HydrateClient>
	);
}
