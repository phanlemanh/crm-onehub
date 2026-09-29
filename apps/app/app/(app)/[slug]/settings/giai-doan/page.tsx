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
import { GiaiDoanSettings, LyDoGiaiDoan } from "./giai-doan-settings";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.giaiDoan };
}

export default async function GiaiDoanSettingsPage() {
	const t = settingsMessages(await getLocale());

	return (
		<PageShell width="page">
			<Suspense fallback={<PageShellLoading />}>
				<GiaiDoan tieuDe={t.giaiDoan.tieuDe} moTa={t.giaiDoan.moTa} />
			</Suspense>
		</PageShell>
	);
}

async function GiaiDoan({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery(trpc.giaiDoan.list.queryOptions());

	return (
		<HydrateClient>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{tieuDe}</PageShellTitle>
					<PageShellDescription>{moTa}</PageShellDescription>
					<LyDoGiaiDoan />
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<GiaiDoanSettings />
			</PageShellContent>
		</HydrateClient>
	);
}
