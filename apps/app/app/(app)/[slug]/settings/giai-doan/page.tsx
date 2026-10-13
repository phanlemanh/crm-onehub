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
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.giaiDoan.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.giaiDoan.moTa}</PageShellDescription>
					<Suspense fallback={null}>
						<LyDo />
					</Suspense>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="danh-sach" />}>
					<GiaiDoan />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function napGiaiDoan() {
	await requireSession();
	await getServerQueryClient().prefetchQuery(
		getServerTrpc().giaiDoan.list.queryOptions(),
	);
}

async function LyDo() {
	await napGiaiDoan();
	return (
		<HydrateClient>
			<LyDoGiaiDoan />
		</HydrateClient>
	);
}

async function GiaiDoan() {
	await napGiaiDoan();
	return (
		<HydrateClient>
			<GiaiDoanSettings />
		</HydrateClient>
	);
}
