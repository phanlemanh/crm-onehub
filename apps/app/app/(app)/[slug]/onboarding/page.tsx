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
import { onboardingMessages } from "@/lib/messages/onboarding";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DanhMucTable } from "./danh-muc-table";

export async function generateMetadata(): Promise<Metadata> {
	return { title: onboardingMessages(await getLocale()).title };
}

export default async function OnboardingPage() {
	const m = onboardingMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.description}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<DanhMuc />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function DanhMuc() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.onboarding.manDanhMuc.queryOptions({
				q: "",
				sort: "",
				dir: "asc",
				page: 1,
				pageSize: 25,
				status: "dang-chay",
			}),
		),
		queryClient.prefetchQuery(trpc.onboarding.listDepartments.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DanhMucTable />
		</HydrateClient>
	);
}
