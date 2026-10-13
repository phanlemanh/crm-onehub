import { Skeleton } from "@crm/ui/components/skeleton";
import { Suspense } from "react";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChonChuKy } from "./chon-chu-ky";
import { DaiKy } from "./dai-ky";
import { DauTrangOkrHoiY } from "./dau-trang-hoi-y";
import { LuoiDauTrangOkr } from "./luoi-dau-trang";
import { kyMacDinhHoiY } from "./okr-search-params";
import type { TabOkr } from "./tab-okr";

export async function DauTrangOkrTrang({ tab }: { tab: TabOkr }) {
	const m = okrMessages(await getLocale());
	return (
		<Suspense
			fallback={<DauTrangOkrCho moTa={m.moTa[tab]} tieuDe={m.tieuDe[tab]} />}
		>
			<DauTrangCoDuLieu />
		</Suspense>
	);
}

function DauTrangOkrCho({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	return (
		<LuoiDauTrangOkr
			dau={
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{tieuDe}</PageShellTitle>
						<PageShellDescription>{moTa}</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
			}
			chonChuKy={<Skeleton className="h-8 w-40 rounded-md" />}
			thanhTab={<Skeleton className="h-9 w-full max-w-xl" />}
		/>
	);
}

async function DauTrangCoDuLieu() {
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
