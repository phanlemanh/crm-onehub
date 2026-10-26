import type { Metadata } from "next";
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
import { sanPhamMessages } from "@/lib/messages/san-pham";
import { settingsMessages } from "@/lib/messages/settings";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import {
	DongChiDoc,
	NutThemSanPham,
	SanPhamSettings,
} from "./san-pham-settings";

export async function generateMetadata(): Promise<Metadata> {
	return { title: settingsMessages(await getLocale()).tieuDeTab.sanPham };
}

async function nap() {
	await requireSession();
	await getServerQueryClient().prefetchQuery(
		getServerTrpc().sanPhamLoTrinh.danhSach.queryOptions(),
	);
}

async function ChiDoc() {
	await nap();
	return (
		<HydrateClient>
			<DongChiDoc />
		</HydrateClient>
	);
}

async function NutThem() {
	await nap();
	return (
		<HydrateClient>
			<NutThemSanPham />
		</HydrateClient>
	);
}

async function DanhSach() {
	await nap();
	return (
		<HydrateClient>
			<SanPhamSettings />
		</HydrateClient>
	);
}

export default async function SanPhamSettingsPage() {
	const t = sanPhamMessages(await getLocale()).trang;
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.moTa}</PageShellDescription>
					<Suspense fallback={null}>
						<ChiDoc />
					</Suspense>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={null}>
						<NutThem />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<PageShellFallback />}>
					<DanhSach />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}
