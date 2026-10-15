import { Button } from "@crm/ui/components/button";
import Link from "next/link";
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
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import { DUONG_NHAC_BUOI_SANG } from "@/lib/pham-vi-man";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { NutHoiKara } from "./okr/hoi/nut-hoi-kara";
import { KhoiKrCuaToi } from "./okr/khoi-kr-cua-toi";
import { ViecOkrCuaToi } from "./okr/viec-cua-toi";

export async function TongQuanChiOkr({ slug }: { slug: string }) {
	const taiViec = getServerQueryClient().prefetchQuery(
		getServerTrpc().okr.viecCuaToi.queryOptions(),
	);
	const m = tongQuanMessages(await getLocale());
	await taiViec;

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.greeting.title}</PageShellTitle>
					<PageShellDescription>{m.chiOkr.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<NutHoiKara />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				<HydrateClient>
					<ViecOkrCuaToi noi="tong-quan" khiHien="luon" anKhiLoi={false} />
					<KhoiKrCuaToi />
				</HydrateClient>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug, "/okr")}>{m.chiOkr.noiKhu}</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug, DUONG_NHAC_BUOI_SANG)}>
							{m.chiOkr.noiKenh}
						</Link>
					</Button>
				</div>
			</PageShellContent>
		</PageShell>
	);
}
