import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShellContent } from "@/components/page-shell";
import { okrBridgeConfigured } from "@/lib/agent-bridge";
import { getLocale } from "@/lib/locale/server";
import { okrSoanMessages } from "@/lib/messages/okr-soan";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DangMoTrangSoan, TrangSoan } from "../trang-soan";

type Params = Promise<{ slug: string; cuocSoanId: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrSoanMessages(await getLocale()).trang.tieuDe };
}

export default function SoanOkrPage({ params }: { params: Params }) {
	return (
		<PageShellContent className="min-h-0">
			<Suspense fallback={<DangMoTrangSoan />}>
				<NoiDung params={params} />
			</Suspense>
		</PageShellContent>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();
	const { cuocSoanId } = await params;
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient
			.prefetchQuery(trpc.okr.soanDanhSach.queryOptions({ cuocSoanId }))
			.catch(() => null),
		queryClient.prefetchQuery(trpc.okr.access.queryOptions()),
	]);
	return (
		<HydrateClient>
			<TrangSoan cuocSoanId={cuocSoanId} cauNoi={okrBridgeConfigured()} />
		</HydrateClient>
	);
}
