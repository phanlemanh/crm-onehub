import { Skeleton } from "@crm/ui/components/skeleton";
import type * as React from "react";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChonChuKy } from "./chon-chu-ky";
import { DaiKy } from "./dai-ky";
import { DauTrangOkrHoiY } from "./dau-trang-hoi-y";
import { kyMacDinhHoiY } from "./okr-search-params";
import { KhungTrangOkr } from "./soan/khung-trang-okr";

export default function OkrLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<KhungTrangOkr>
			<Suspense fallback={<Skeleton className="h-8 w-48 max-w-full" />}>
				<DauTrang />
			</Suspense>
			{children}
		</KhungTrangOkr>
	);
}

async function DauTrang() {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		queryClient.prefetchQuery(trpc.workspace.get.queryOptions()),
	]);
	const kyHoiY = cycles ? kyMacDinhHoiY(cycles) : null;
	if (kyHoiY)
		await queryClient.prefetchQuery(
			trpc.okr.hoiYNhan.queryOptions({ cycleId: kyHoiY }),
		);

	return (
		<HydrateClient>
			<DauTrangOkrHoiY chonChuKy={<ChonChuKy />} />
			<DaiKy />
		</HydrateClient>
	);
}
