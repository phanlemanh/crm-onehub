"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { okrHopTuanBoMessages } from "@/lib/messages/okr-hop-tuan-bo";
import { useHrefDanhSachBo } from "./theo-don-vi/vi-tri-bo";

export function XemMoiBo({ ky }: { ky: string | null }) {
	const m = okrHopTuanBoMessages(useLocale());
	const href = useHrefDanhSachBo(ky);
	return (
		<Button asChild size="sm" variant="outline">
			<Link data-nut="xem-moi-bo" href={href}>
				{m.donViCoKr.xemMoiBo}
			</Link>
		</Button>
	);
}
