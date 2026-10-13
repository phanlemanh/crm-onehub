import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { chuTrangVaDonVi } from "../lua-chon-trang";
import { ManSoan } from "../man-soan";

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.moi };
}

export default function TrangMoiPage() {
	return (
		<PageShell>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<NoiDung />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung() {
	const session = await requireSession();
	const { chuTrang, donVi } = await chuTrangVaDonVi(session.user);

	return (
		<HydrateClient>
			<ManSoan vao={{ kieu: "moi", toiId: session.user.id, chuTrang, donVi }} />
		</HydrateClient>
	);
}
