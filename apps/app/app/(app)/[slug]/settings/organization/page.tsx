import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import type * as React from "react";
import { Suspense } from "react";
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
import { toChucMessages } from "@/lib/messages/to-chuc";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DongChiDoc, HanhDongToChuc } from "./hanh-dong-dau-trang";
import { ToChuc } from "./to-chuc";

export async function generateMetadata(): Promise<Metadata> {
	return { title: toChucMessages(await getLocale()).title };
}

function DauTrang({
	tieuDe,
	moTa,
	ghiChu,
	hanhDong,
}: {
	tieuDe: string;
	moTa: string;
	ghiChu?: React.ReactNode;
	hanhDong?: React.ReactNode;
}) {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>{tieuDe}</PageShellTitle>
				<PageShellDescription>{moTa}</PageShellDescription>
				{ghiChu}
			</PageShellHeading>
			{hanhDong ? <PageShellActions>{hanhDong}</PageShellActions> : null}
		</PageShellHeader>
	);
}

export default async function CaiDatToChucPage() {
	const m = toChucMessages(await getLocale());

	return (
		<PageShell width="full">
			<Suspense
				fallback={
					<>
						<DauTrang tieuDe={m.title} moTa={m.moTa} />
						<KhungXuong hinh="the" />
					</>
				}
			>
				<CaiDat tieuDe={m.title} moTa={m.moTa} />
			</Suspense>
		</PageShell>
	);
}

async function CaiDat({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [, , workspace] = await Promise.all([
		queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		queryClient.prefetchQuery(trpc.org.access.queryOptions()),
		queryClient.fetchQuery(trpc.workspace.get.queryOptions()).catch(() => null),
	]);

	return (
		<HydrateClient>
			<DauTrang
				tieuDe={tieuDe}
				moTa={moTa}
				ghiChu={<DongChiDoc />}
				hanhDong={<HanhDongToChuc />}
			/>
			<PageShellContent>
				<ToChuc tenGoc={workspace?.name || undefined} />
			</PageShellContent>
		</HydrateClient>
	);
}
