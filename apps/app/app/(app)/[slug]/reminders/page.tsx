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
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import {
	KhoiDongTroLyOkr,
	KhoiKenh,
} from "../settings/notifications/khoi-kenh";
import { KhoiZalo } from "../settings/notifications/khoi-zalo";

export async function generateMetadata(): Promise<Metadata> {
	return { title: nhacQuaZaloMessages(await getLocale()).tieuDe };
}

export default async function NhacBuoiSangPage() {
	const t = nhacQuaZaloMessages(await getLocale());

	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="the" />}>
					<ThongBao />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function ThongBao() {
	await requireSession();
	const t = nhacQuaZaloMessages(await getLocale());
	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(getServerTrpc().zalo.cuaToi.queryOptions());

	return (
		<HydrateClient>
			<div className="flex flex-col gap-6">
				<section aria-labelledby="khoi-zalo" className="flex flex-col gap-3">
					<h2 id="khoi-zalo" className="font-medium text-sm">
						{t.khoiZalo.ten}
					</h2>
					<KhoiZalo />
				</section>
				<section
					aria-labelledby="khoi-kenh"
					className="flex flex-col gap-3 border-t pt-5"
				>
					<h2 id="khoi-kenh" className="font-medium text-sm">
						{t.kenh.tieuDe}
					</h2>
					<KhoiKenh />
				</section>
				<KhoiDongTroLyOkr />
			</div>
		</HydrateClient>
	);
}
