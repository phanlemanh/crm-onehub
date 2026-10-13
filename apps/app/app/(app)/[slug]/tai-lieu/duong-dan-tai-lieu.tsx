import type { Locale } from "@crm/ui/lib/locale";
import { CaiDatBreadcrumb } from "@/components/cai-dat-breadcrumb";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongDanhSach } from "@/lib/tai-lieu-man";
import { workspaceUrl } from "@/lib/workspace-url";

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
