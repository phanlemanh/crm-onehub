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
import { FieldsSettings } from "./fields-settings";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.truong };
}

export default async function FieldsSettingsPage() {
	const t = settingsMessages(await getLocale());

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.truong.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.truong.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Fields />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Fields() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery(
		trpc.fields.list.queryOptions({ entity: "COMPANY", includeArchived: true }),
	);

	return (
		<HydrateClient>
			<FieldsSettings />
		</HydrateClient>
	);
}
