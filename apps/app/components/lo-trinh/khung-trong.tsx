"use client";

import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

export function ChiTietDoi({ chu }: { chu: string }) {
	const m = loTrinhMessages(useLocale());
	return (
		<Collapsible data-lo-trinh-chi-tiet>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					{m.chiTiet}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<p className="px-3 py-2 text-muted-foreground text-xs" translate="no">
					{chu}
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function KhungTrong({
	ca,
	tieuDe,
	moTa,
	cauMay,
}: {
	ca: string;
	tieuDe: string;
	moTa: string;
	cauMay?: string;
}) {
	return (
		<Empty data-lo-trinh-trang={ca}>
			<EmptyHeader>
				<EmptyTitle>{tieuDe}</EmptyTitle>
				<EmptyDescription>{moTa}</EmptyDescription>
			</EmptyHeader>
			{cauMay ? (
				<EmptyContent>
					<ChiTietDoi chu={cauMay} />
				</EmptyContent>
			) : null}
		</Empty>
	);
}
