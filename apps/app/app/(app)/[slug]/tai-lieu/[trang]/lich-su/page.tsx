import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellFallback } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import { ManLichSu } from "./man-lich-su";

type Params = Promise<{ slug: string; trang: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuLichSuMessages(await getLocale()).lichSu.nut };
}

export default function LichSuTrangPage({ params }: { params: Params }) {
	return (
		<Suspense fallback={<PageShellFallback />}>
			<NoiDung params={params} />
		</Suspense>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();

	const { trang: slug } = await params;
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [trang] = await Promise.all([
		nullIfMissing(
			queryClient.fetchQuery(trpc.taiLieu.get.queryOptions({ slug })),
		),
		queryClient.prefetchQuery(trpc.taiLieu.lichSu.queryOptions({ slug })),
	]);
	if (!trang) notFound();

	return (
		<PageShell>
			<HydrateClient>
				<ManLichSu slug={trang.slug} ten={trang.ten} />
			</HydrateClient>
		</PageShell>
	);
}
