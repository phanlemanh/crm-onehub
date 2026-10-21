import type * as React from "react";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { kyMacDinhHoiY } from "./okr-search-params";
import { KhungTrangOkr } from "./soan/khung-trang-okr";
import { ThanhBenMucTieu, ThanhBenMucTieuCho } from "./thanh-ben-muc-tieu";

export default function OkrLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
			<Suspense fallback={<ThanhBenMucTieuCho />}>
				<ThanhBenCoDuLieu />
			</Suspense>
			<KhungTrangOkr>{children}</KhungTrangOkr>
		</div>
	);
}

async function ThanhBenCoDuLieu() {
	await requireSession();
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [cycles] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.cycles.queryOptions()).catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
	]);
	const kyHoiY = cycles ? kyMacDinhHoiY(cycles) : null;
	if (kyHoiY)
		await queryClient.prefetchQuery(
			trpc.okr.hoiYNhan.queryOptions({ cycleId: kyHoiY }),
		);

	return (
		<HydrateClient>
			<ThanhBenMucTieu />
		</HydrateClient>
	);
}
