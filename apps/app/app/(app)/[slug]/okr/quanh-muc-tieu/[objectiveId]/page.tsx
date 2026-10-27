import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ManSoDo, ManSoDoCho } from "../../so-do/man-so-do";

type Params = Promise<{ slug: string; objectiveId: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrQuanhMessages(await getLocale()).tieuDe };
}

export default function QuanhMucTieuPage({ params }: { params: Params }) {
	return (
		<Suspense fallback={<ManSoDoCho coTam />}>
			<NoiDung params={params} />
		</Suspense>
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
			<ManSoDo tam={objectiveId} />
		</HydrateClient>
	);
}
