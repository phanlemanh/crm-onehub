import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CaiDatDieuPhoi } from "./cai-dat-dieu-phoi";

export async function generateMetadata(): Promise<Metadata> {
	return { title: onboardingMessages(await getLocale()).settings.title };
}

export default async function CaiDatOnboardingPage() {
	const m = onboardingMessages(await getLocale());

	return (
		<PageShell width="wide" className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.settings.title}</PageShellTitle>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="the" />}>
					<CaiDat />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function CaiDat() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(trpc.onboarding.listTemplates.queryOptions()),
		queryClient.prefetchQuery(trpc.onboarding.listDepartments.queryOptions()),
		queryClient.prefetchQuery(trpc.onboarding.access.queryOptions()),
	]);

	return (
		<HydrateClient>
			<CaiDatDieuPhoi />
		</HydrateClient>
	);
}
