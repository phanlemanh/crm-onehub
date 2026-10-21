import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellFallback,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { DUONG_SO_DO } from "../../tab-okr";
import { QuanhMucTieuNoiDung } from "../quanh-muc-tieu";

type Params = Promise<{ slug: string; objectiveId: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrQuanhMessages(await getLocale()).tieuDe };
}

export default async function QuanhMucTieuPage({ params }: { params: Params }) {
	const locale = await getLocale();
	const m = okrQuanhMessages(locale);
	const t = okrVoKhuMessages(locale);
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={null}>
						<NutVeSoDo nhan={t.veSoDo} params={params} />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<PageShellFallback />}>
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

async function NutVeSoDo({ params, nhan }: { params: Params; nhan: string }) {
	const { slug } = await params;
	return (
		<Button asChild data-nut="ve-so-do" size="sm" variant="outline">
			<Link href={workspaceUrl(slug, DUONG_SO_DO)}>
				<Icon data-icon="inline-start" icon={ArrowLeft} />
				{nhan}
			</Link>
		</Button>
	);
}
