import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DanhMucTable } from "./danh-muc-table";
import {
	danhMucInput,
	danhMucSearchParams,
	loadOnboardingSearchParams,
} from "./onboarding-search-params";
import { DanhMucHanhDong } from "./tao-ke-hoach";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: onboardingMessages(await getLocale()).title };
}

export default async function OnboardingPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const m = onboardingMessages(await getLocale());

	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.title}</PageShellTitle>
					<PageShellDescription>{m.description}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<DanhMucHanhDong />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<KhungXuong hinh="bang" />}>
					<DanhMuc searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function DanhMuc({ searchParams }: { searchParams: SearchParams }) {
	await requireSession();

	const [list, ob] = await Promise.all([
		danhMucSearchParams.load(searchParams),
		loadOnboardingSearchParams(searchParams),
	]);
	const input = danhMucInput(danhMucSearchParams.toInput(list), ob);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(trpc.onboarding.manDanhMuc.queryOptions(input)),
		ob.cachXem === "bang-cot"
			? queryClient.prefetchQuery(
					trpc.onboarding.bangCot.queryOptions({
						...input,
						cachChia: ob.cachChia,
					}),
				)
			: Promise.resolve(),
		queryClient.prefetchQuery(trpc.onboarding.listDepartments.queryOptions()),
		queryClient.prefetchQuery(trpc.users.list.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DanhMucTable />
		</HydrateClient>
	);
}
