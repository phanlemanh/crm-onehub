import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { DuongDanTaiLieuCho } from "../duong-dan-tai-lieu";
import { chuTrangVaDonVi } from "../lua-chon-trang";
import { ManSoan } from "../man-soan";

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.moi };
}

export default async function TrangMoiPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const locale = await getLocale();
	const m = taiLieuMessages(locale).soan;
	return (
		<PageShell>
			<PageShellHeader
				breadcrumb={<DuongDanTaiLieuCho locale={locale} params={params} />}
			>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDeMoi}</PageShellTitle>
					<PageShellDescription>{m.moTaMoi}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<NoiDung />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung() {
	const session = await requireSession();
	const chon = await chuTrangVaDonVi(session.user);

	return (
		<HydrateClient>
			<ManSoan vao={{ kieu: "moi", toiId: session.user.id, ...chon }} />
		</HydrateClient>
	);
}
