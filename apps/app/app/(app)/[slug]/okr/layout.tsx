import { Skeleton } from "@crm/ui/components/skeleton";
import type * as React from "react";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChonChuKy } from "./chon-chu-ky";
import { DaiKy } from "./dai-ky";
import { DauTrangOkr } from "./thanh-tab";

export default function OkrLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<PageShell>
			<Suspense fallback={<Skeleton className="h-8 w-48 max-w-full" />}>
				<DauTrang />
			</Suspense>
			{children}
		</PageShell>
	);
}

async function DauTrang() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(trpc.okr.cycles.queryOptions()),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		queryClient.prefetchQuery(trpc.workspace.get.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DauTrangOkr chonChuKy={<ChonChuKy />} />
			<DaiKy />
		</HydrateClient>
	);
}
