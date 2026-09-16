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
import { thanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AllowancesTable } from "./allowances-table";
import { membersSearchParams } from "./members-search-params";
import { MembersTable } from "./members-table";

export async function generateMetadata(): Promise<Metadata> {
	return { title: thanhVienMessages(await getLocale()).trang.tieuDeTab };
}

export default async function MembersSettingsPage({
	searchParams,
}: PageProps<"/[slug]/settings/members">) {
	const t = thanhVienMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<Members searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Members({
	searchParams,
}: Pick<PageProps<"/[slug]/settings/members">, "searchParams">) {
	await requireSession();

	const values = await membersSearchParams.load(searchParams);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await Promise.all([
		queryClient.prefetchQuery(trpc.workspace.get.queryOptions()),
		queryClient.prefetchQuery(
			trpc.workspace.members.queryOptions(membersSearchParams.toInput(values)),
		),
	]);

	return (
		<HydrateClient>
			<div className="flex min-h-0 flex-col gap-8">
				<MembersTable />
				<AllowancesTable />
			</div>
		</HydrateClient>
	);
}
