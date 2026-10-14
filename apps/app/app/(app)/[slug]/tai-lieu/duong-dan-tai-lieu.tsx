import { Skeleton } from "@crm/ui/components/skeleton";
import type { Locale } from "@crm/ui/lib/locale";
import { Suspense } from "react";
import { CaiDatBreadcrumb } from "@/components/cai-dat-breadcrumb";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongDanhSach } from "@/lib/tai-lieu-man";
import { workspaceUrl } from "@/lib/workspace-url";

export function DuongDanTaiLieuCho({
	params,
	locale,
}: {
	params: Promise<{ slug: string }>;
	locale: Locale;
}) {
	return (
		<Suspense fallback={<Skeleton className="h-5 w-20" />}>
			<DuongDanTuParams locale={locale} params={params} />
		</Suspense>
	);
}

async function DuongDanTuParams({
	params,
	locale,
}: {
	params: Promise<{ slug: string }>;
	locale: Locale;
}) {
	const { slug } = await params;
	return <DuongDanTaiLieu locale={locale} slug={slug} />;
}

export function DuongDanTaiLieu({
	slug,
	locale,
}: {
	slug: string;
	locale: Locale;
}) {
	return (
		<CaiDatBreadcrumb
			cap={[
				{
					nhan: taiLieuMessages(locale).tieuDe,
					href: workspaceUrl(slug, duongDanhSach()),
				},
			]}
		/>
	);
}
