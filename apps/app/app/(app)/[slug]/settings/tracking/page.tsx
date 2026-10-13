import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { theoDoiMessages } from "@/lib/messages/settings-theo-doi";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { TrackingSections } from "./tracking-sections";

export async function generateMetadata(): Promise<Metadata> {
	return { title: theoDoiMessages(await getLocale()).trang.tab };
}

export default async function TrackingSettingsPage() {
	const t = theoDoiMessages(await getLocale());

	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="the" />}>
					<Tracking />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Tracking() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	const settings = await queryClient.fetchQuery(
		trpc.tracking.settings.queryOptions(),
	);

	if (settings.canManage) {
		await queryClient.prefetchQuery(trpc.tracking.sources.queryOptions());
	}

	return (
		<HydrateClient>
			<div className="flex flex-col gap-6">
				<TrackingSections />
			</div>
		</HydrateClient>
	);
}
