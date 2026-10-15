import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { QuanhMucTieuNoiDung } from "../quanh-muc-tieu";

type Params = Promise<{ slug: string; objectiveId: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrQuanhMessages(await getLocale()).tieuDe };
}

export default async function QuanhMucTieuPage({ params }: { params: Params }) {
	const m = okrQuanhMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="the" />}>
					<NoiDung params={params} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();
	const { objectiveId } = await params;
	const trpc = getServerTrpc();
	await getServerQueryClient()
		.prefetchQuery(trpc.okr.quanhMucTieu.queryOptions({ objectiveId }))
		.catch(() => null);
	return (
		<HydrateClient>
			<QuanhMucTieuNoiDung objectiveId={objectiveId} />
		</HydrateClient>
	);
}
