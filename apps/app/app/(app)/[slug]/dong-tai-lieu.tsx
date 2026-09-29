"use client";

import { Link } from "@crm/ui/components/link";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import NextLink from "next/link";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { nhacMessages } from "@/lib/messages/nhac";
import { duongChoDuyet } from "@/lib/tai-lieu-man";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const CELL = "px-3 py-2.5 align-middle";

export function DongTaiLieu({ so }: { so: number }) {
	const m = nhacMessages(useLocale());
	const url = useWorkspaceUrl();
	return (
		<SimpleTableRow data-can-de-y="tai-lieu-cho-duyet">
			<TableCell className={CELL} />
			<TableCell className={CELL}>
				<span className="flex min-w-0 gap-1">
					<span className="shrink-0">{m.khoTaiLieu}</span>
					<span aria-hidden>·</span>
					<Link asChild>
						<NextLink href={url(duongChoDuyet())}>
							{dien(m.banChoDuyet, { so })}
						</NextLink>
					</Link>
				</span>
			</TableCell>
			<TableCell className={CELL} />
		</SimpleTableRow>
	);
}
