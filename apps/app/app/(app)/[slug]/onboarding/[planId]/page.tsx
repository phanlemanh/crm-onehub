import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { HoSoKeHoach } from "./ho-so-ke-hoach";

export async function generateMetadata(): Promise<Metadata> {
	return { title: onboardingMessages(await getLocale()).title };
}

export default async function HoSoPage({
	params,
}: {
	params: Promise<{ planId: string }>;
}) {
	const { planId } = await params;
	const m = onboardingMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<HoSo planId={planId} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function HoSo({ planId }: { planId: string }) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.onboarding.listSteps.queryOptions({ planId }),
		),
		queryClient.prefetchQuery(
			trpc.onboarding.listEnrollments.queryOptions({ id: planId }),
		),
		queryClient.prefetchQuery(
			trpc.onboarding.planById.queryOptions({ id: planId }),
		),
	]);

	return (
		<HydrateClient>
			<HoSoKeHoach planId={planId} />
		</HydrateClient>
	);
}
