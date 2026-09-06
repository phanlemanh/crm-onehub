"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
	type TheoDoiMessages,
	theoDoiMessages,
} from "@/lib/messages/settings-theo-doi";
import { useTRPC } from "@/lib/trpc/client";

const CELL = cn("px-3 py-2.5 align-middle");

function columns(t: TheoDoiMessages): SimpleTableColumn[] {
	return [
		{ id: "source", header: t.nguon.cot.nguon },
		{ id: "medium", header: t.nguon.cot.kenh, width: "w-32" },
		{
			id: "views",
			header: t.nguon.cot.luotXem,
			width: "w-28",
			align: "right",
		},
		{
			id: "contacts",
			header: t.nguon.cot.caNhan,
			width: "w-24",
			align: "right",
		},
	];
}

export function TrafficSources() {
	const t = theoDoiMessages(useLocale());
	const trpc = useTRPC();
	const sources = useQuery(trpc.tracking.sources.queryOptions());

	if (!sources.data) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.nguon.tieuDe}</CardTitle>
				<CardDescription>{t.nguon.moTa}</CardDescription>
			</CardHeader>

			{sources.data.length === 0 ? (
				<CardTableEmpty>{t.nguon.trong}</CardTableEmpty>
			) : (
				<SimpleTable columns={columns(t)}>
					{sources.data.map((row) => (
						<SimpleTableRow key={`${row.source}-${row.medium ?? ""}`}>
							<TableCell className={CELL}>
								<span translate="no">{row.source}</span>
							</TableCell>
							<TableCell className={`${CELL} text-muted-foreground`}>
								{row.medium ? <span translate="no">{row.medium}</span> : "—"}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{row.views.toLocaleString()}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{row.contacts.toLocaleString()}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}
		</Card>
	);
}
