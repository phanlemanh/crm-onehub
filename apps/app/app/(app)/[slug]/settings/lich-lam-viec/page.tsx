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
import { LichLamViec } from "./lich-lam-viec";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.lichLamViec };
}

export default async function LichLamViecPage() {
	const t = settingsMessages(await getLocale());
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.lichLamViec.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.lichLamViec.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="the" />}>
					<NoiDung />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function NoiDung() {
	await requireSession();
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(trpc.lichLamViec.get.queryOptions());
	return (
		<HydrateClient>
			<LichLamViec />
		</HydrateClient>
	);
}
