import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellFallback } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../../../(agent-builder)/missing-record";
import { BanCu } from "./ban-cu";

type Params = Promise<{ slug: string; trang: string; so: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuLichSuMessages(await getLocale()).lichSu.nut };
}

export default function PhienBanCuPage({ params }: { params: Params }) {
	return (
		<Suspense fallback={<PageShellFallback />}>
			<NoiDung params={params} />
		</Suspense>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();

	const { trang: slug, so: soChu } = await params;
	const so = Number(soChu);
	if (!Number.isInteger(so) || so < 1) notFound();
	const trpc = getServerTrpc();
	const ban = await nullIfMissing(
		getServerQueryClient().fetchQuery(
			trpc.taiLieu.phienBan.queryOptions({ slug, so }),
		),
	);
	if (!ban) notFound();

	const khoi = soSanh(ban.dangDung.noiDung, ban.noiDung);

	return (
		<PageShell>
			<BanCu
				ban={{
					slug: ban.slug,
					tenTrang: ban.tenTrang,
					so: ban.so,
					noiDung: ban.noiDung,
					duyetLuc: ban.duyetLuc,
					nguoiDuyet: ban.nguoiDuyet.name,
					laBanDangDung: ban.laBanDangDung,
					daLuuTru: ban.daLuuTru,
					khoi,
					dai: suKienDoi(khoi),
				}}
			/>
		</PageShell>
	);
}
