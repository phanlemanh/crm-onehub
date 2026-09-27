import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import { ManDuyet } from "./man-duyet";

type Params = Promise<{ slug: string; id: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.duyet };
}

export default function DeXuatPage({ params }: { params: Params }) {
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

	const { id } = await params;
	const trpc = getServerTrpc();
	const dx = await nullIfMissing(
		getServerQueryClient().fetchQuery(
			trpc.taiLieu.proposal.queryOptions({ id }),
		),
	);
	if (!dx) notFound();

	const khoi = soSanh(dx.banGoc, dx.noiDung);

	return (
		<HydrateClient>
			<ManDuyet
				deXuat={{
					id: dx.id,
					slug: dx.slug,
					ten: dx.ten,
					taoBoi: dx.taoBoi.name,
					trangThai: dx.trangThai,
					lyDo: dx.lyDo,
					cu: dx.cu,
					duyetDuoc: dx.duyetDuoc,
					khoi,
					dai: suKienDoi(khoi),
				}}
				key={`${dx.id}-${dx.trangThai}-${dx.cu}`}
			/>
		</HydrateClient>
	);
}
