"use client";

import { Link } from "@crm/ui/components/link";
import { useLocale } from "@crm/ui/components/locale-provider";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { duAnMessages } from "@/lib/messages/du-an";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export function DongDuAnViec({
	duAn,
	onMo,
}: {
	duAn: { id: string; ten: string };
	onMo: (id: string) => void;
}) {
	const m = duAnMessages(useLocale()).viec;
	return (
		<span className="block truncate text-muted-foreground text-xs">
			<Link
				data-dong-du-an={duAn.id}
				href={`?${SEARCH_PARAM.viec.phamVi}=${encodeURIComponent(duAn.id)}`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					onMo(duAn.id);
				}}
				translate="no"
				variant="quiet"
			>
				{dien(m.duAn, { ten: duAn.ten })}
			</Link>
		</span>
	);
}
