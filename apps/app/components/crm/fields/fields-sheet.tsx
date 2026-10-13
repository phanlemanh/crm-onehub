"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import {
	type EntityKind,
	useFieldsSheet,
} from "@/components/crm/record-sheet/record-stack";
import { DetailSheet, DetailSheetHeader } from "@/components/detail-sheet";
import { useTRPC } from "@/lib/trpc/client";
import { FieldEditor } from "./field-editor";
import { entityTabs, fieldsCopy, subtitleFor } from "./fields-copy";
import { entityOf } from "./fields-entity";
import { FieldsList } from "./fields-list";
import { useLuuTruTruong } from "./use-luu-tru-truong";

function FieldsSheetBody({
	kind,
	field,
	onEntity,
	onEdit,
}: {
	kind: EntityKind;
	field: string | null;
	onEntity: (kind: EntityKind) => void;
	onEdit: (key: string | null) => void;
}) {
	const trpc = useTRPC();
	const locale = useLocale();
	const copy = fieldsCopy(locale);
	const entity = entityOf(kind);

	const query = useQuery(
		trpc.fields.list.queryOptions({ entity, includeArchived: true }),
	);
	const quyen = useQuery(trpc.fields.access.queryOptions());
	const khoa = quyen.data?.canManage !== true;
	const luuTru = useLuuTruTruong(entity);

	const editingKey = field && field !== "new" ? field : null;
	const editing = editingKey
		? query.data?.find((entry) => entry.key === editingKey)
		: undefined;

	const coverage = useQuery({
		...trpc.fields.coverage.queryOptions({ id: editing?.id ?? "" }),
		enabled: Boolean(editing?.agentFilled),
	});

	if (field && !khoa) {
		const entityLabel = entityTabs(locale).find(
			(tab) => tab.kind === kind,
		)?.label;
		const filled = coverage.data;

		return (
			<>
				<DetailSheetHeader
					title={editing?.label ?? (editingKey ? "" : copy.newField)}
					description={
						filled
							? copy.filledOf(
									entityLabel ?? "",
									String(filled.filled),
									String(filled.total),
								)
							: entityLabel
					}
					onBack={() => onEdit(null)}
				/>
				{editingKey && query.isPending ? (
					<div className="flex min-h-0 flex-1 items-center justify-center">
						<Spinner />
					</div>
				) : (
					<FieldEditor
						key={editing?.id ?? "new"}
						entity={entity}
						field={editing}
						onDone={() => onEdit(null)}
						onArchive={luuTru}
					/>
				)}
			</>
		);
	}

	return (
		<>
			<DetailSheetHeader
				title={copy.sheetTitle}
				description={subtitleFor(kind, locale)}
				note={
					<Tabs
						value={kind}
						onValueChange={(next) => onEntity(next as EntityKind)}
					>
						<TabsList>
							{entityTabs(locale).map((tab) => (
								<TabsTrigger key={tab.kind} value={tab.kind}>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				}
			/>
			<FieldsList
				entity={entity}
				khoa={khoa}
				onEdit={(key) => onEdit(key)}
				onNew={() => onEdit("new")}
				onArchive={luuTru}
			/>
		</>
	);
}

export function FieldsSheetHost() {
	const { entity, field, open, close, edit } = useFieldsSheet();

	return (
		<DetailSheet
			open={entity !== null}
			size="md"
			onOpenChange={(next) => {
				if (!next) close();
			}}
		>
			{entity ? (
				<FieldsSheetBody
					kind={entity}
					field={field}
					onEntity={open}
					onEdit={edit}
				/>
			) : null}
		</DetailSheet>
	);
}
