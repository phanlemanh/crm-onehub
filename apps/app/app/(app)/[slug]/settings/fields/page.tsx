import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FIELD_ENTITIES } from "@/components/crm/fields/fields-entity";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { settingsMessages } from "@/lib/messages/settings";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { kindFrom, loadFieldsPageParams } from "./fields-search-params";
import { FieldsSettings } from "./fields-settings";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.truong };
}

export default async function FieldsSettingsPage({
	searchParams,
}: PageProps<"/[slug]/settings/fields">) {
	const t = settingsMessages(await getLocale());

	return (
		<PageShell width="wide">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.truong.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.truong.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="danh-sach" />}>
					<Fields searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Fields({
	searchParams,
}: Pick<PageProps<"/[slug]/settings/fields">, "searchParams">) {
	await requireSession();

	const kind = kindFrom(await loadFieldsPageParams(searchParams));

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await Promise.all([
		queryClient.prefetchQuery(trpc.fields.access.queryOptions()),
		...FIELD_ENTITIES.map((entity) =>
			queryClient.prefetchQuery(
				trpc.fields.list.queryOptions({ entity, includeArchived: true }),
			),
		),
	]);

	return (
		<HydrateClient>
			<FieldsSettings kindBanDau={kind} />
		</HydrateClient>
	);
}
