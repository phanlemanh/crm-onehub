import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { duongTrang } from "@/lib/tai-lieu-man";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import { ManSoan } from "../../man-soan";

type Params = Promise<{ slug: string; trang: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.sua };
}

export default function SuaTrangPage({ params }: { params: Params }) {
	return (
		<PageShell>
			<Suspense fallback={<PageShellLoading />}>
				<NoiDung params={params} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();

	const { slug: workspace, trang: slug } = await params;
	const trpc = getServerTrpc();
	const trang = await nullIfMissing(
		getServerQueryClient().fetchQuery(trpc.taiLieu.get.queryOptions({ slug })),
	);
	if (!trang) notFound();
	if (trang.noiDung === null)
		redirect(workspaceUrl(workspace, duongTrang(trang.slug)));

	return (
		<HydrateClient>
			<ManSoan
				key={trang.phienBan?.so ?? 0}
				vao={{
					kieu: "sua",
					slug: trang.slug,
					ten: trang.ten,
					banGoc: trang.noiDung,
				}}
			/>
		</HydrateClient>
	);
}
