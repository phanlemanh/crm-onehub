import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ChonChuKy } from "./chon-chu-ky";
import { DaiKy } from "./dai-ky";
import { DauTrangOkrHoiY } from "./dau-trang-hoi-y";
import { DauTrangOkrCho } from "./dau-trang-okr-cho";
import { NutHoiKara } from "./hoi/nut-hoi-kara";
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
			<DauTrangOkrHoiY
				chonChuKy={
					<>
						<NutHoiKara />
						<ChonChuKy />
					</>
				}
			/>
			<DaiKy />
		</HydrateClient>
	);
}
