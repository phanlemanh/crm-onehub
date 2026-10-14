import { Skeleton } from "@crm/ui/components/skeleton";
import type { Locale } from "@crm/ui/lib/locale";
import { Suspense } from "react";
import { CaiDatBreadcrumb } from "@/components/cai-dat-breadcrumb";
import { campaignMessages } from "@/lib/messages/campaigns";
import { workspaceUrl } from "@/lib/workspace-url";

export function DuongDanChienDichCho({
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
	return (
		<CaiDatBreadcrumb
			cap={[
				{
					nhan: campaignMessages(locale).title,
					href: workspaceUrl(slug, "/campaigns"),
				},
			]}
		/>
	);
}
