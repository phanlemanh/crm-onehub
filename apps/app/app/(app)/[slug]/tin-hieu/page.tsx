import type { Metadata } from "next";
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
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import { getLocale } from "@/lib/locale/server";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { requireSession } from "@/lib/session";
import { docTrangThaiTinHieu } from "@/lib/tin-hieu/trang-thai";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { DanhSachTinHieuTrang } from "./danh-sach-tin-hieu-trang";
import { KhungChoTinHieu } from "./khung-cho";
import { NutGuiTrang } from "./nut-gui-trang";

export async function generateMetadata(): Promise<Metadata> {
	return { title: tinHieuMessages(await getLocale()).trang.tieuDe };
}

async function docBanVe(): Promise<string | null> {
	"use cache";
	return docTepLoTrinh();
}

async function NoiDung() {
	await requireSession();
	const m = tinHieuMessages(await getLocale());
	const queryClient = getServerQueryClient();
	const cuaToi = await queryClient.fetchQuery(
		getServerTrpc().tinHieu.cuaToi.queryOptions(),
	);
	const { banVe, trangThai } = docTrangThaiTinHieu(
		await docBanVe(),
		cuaToi.rows.map((r) => ({ ma: r.ma, daKeoVe: r.daKeoVe })),
		m,
	);
	return (
		<HydrateClient>
			<DanhSachTinHieuTrang
				banVeDocDuoc={banVe === "co"}
				trangThai={trangThai}
			/>
		</HydrateClient>
	);
}

export default async function TinHieuPage() {
	const m = tinHieuMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<NutGuiTrang />
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungChoTinHieu />}>
					<NoiDung />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}
