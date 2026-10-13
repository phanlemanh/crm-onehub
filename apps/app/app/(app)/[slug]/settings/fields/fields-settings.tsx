"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import { FieldEditor } from "@/components/crm/fields/field-editor";
import { entityTabs } from "@/components/crm/fields/fields-copy";
import { entityOf } from "@/components/crm/fields/fields-entity";
import { FieldsList } from "@/components/crm/fields/fields-list";
import { useLuuTruTruong } from "@/components/crm/fields/use-luu-tru-truong";
import type { EntityKind } from "@/components/crm/record-sheet/record-stack";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { fieldsPageParams } from "./fields-search-params";

export function FieldsSettings({ kindBanDau }: { kindBanDau: EntityKind }) {
	const trpc = useTRPC();
	const locale = useLocale();
	const [values, setParams] = useQueryStates(fieldsPageParams);

	const kind = values[SEARCH_PARAM.fieldsPage.entity] ?? kindBanDau;
	const editingRaw = values[SEARCH_PARAM.fieldsPage.field];
	const entity = entityOf(kind);
	const tabs = useMemo(() => entityTabs(locale), [locale]);

	const onEntity = useCallback(
		(next: EntityKind) =>
			void setParams({
				[SEARCH_PARAM.fieldsPage.entity]: next,
				[SEARCH_PARAM.fieldsPage.field]: null,
			}),
		[setParams],
	);

	const onEdit = useCallback(
		(key: string | null) =>
			void setParams({ [SEARCH_PARAM.fieldsPage.field]: key }),
		[setParams],
	);

	const query = useQuery(
		trpc.fields.list.queryOptions({ entity, includeArchived: true }),
	);
	const quyen = useQuery(trpc.fields.access.queryOptions());
	const khoa = quyen.data?.canManage !== true;
	const luuTru = useLuuTruTruong(entity);

	const editingKey = editingRaw && editingRaw !== "new" ? editingRaw : null;
	const editing = editingKey
		? query.data?.find((entry) => entry.key === editingKey)
		: undefined;

	return (
		<div className="flex min-h-0 flex-col gap-6">
			<Tabs value={kind} onValueChange={(next) => onEntity(next as EntityKind)}>
				<TabsList>
					{tabs.map((tab) => (
						<TabsTrigger key={tab.kind} value={tab.kind}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{editingRaw && !khoa ? (
				editingKey && query.isPending ? (
					<div className="flex min-h-0 flex-1 items-center justify-center">
						<Spinner />
					</div>
				) : (
					// biome-ignore lint/a11y/noStaticElementInteractions: vùng chứa chỉ bắt Escape để đóng ô sửa, mọi điều khiển bên trong vẫn tự nhận bàn phím
					<div
						onKeyDown={(su) => {
							if (su.key !== "Escape") return;
							su.stopPropagation();
							onEdit(null);
						}}
					>
						<FieldEditor
							key={editing?.id ?? "new"}
							entity={entity}
							field={editing}
							onDone={() => onEdit(null)}
							onArchive={luuTru}
						/>
					</div>
				)
			) : (
				<FieldsList
					entity={entity}
					khoa={khoa}
					onEdit={(key) => onEdit(key)}
					onNew={() => onEdit("new")}
					onArchive={luuTru}
				/>
			)}
		</div>
	);
}
