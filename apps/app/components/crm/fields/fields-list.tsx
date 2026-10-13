"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import Renew from "@carbon/icons-react/es/Renew";
import Warning from "@carbon/icons-react/es/Warning";
import { fieldKeyFromLabel } from "@crm/db/fields-shape";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { Spinner } from "@crm/ui/components/spinner";
import type { Locale } from "@crm/ui/lib/locale";
import { FIELD_TEMPLATES } from "@crm/validation/field-templates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crmMessages } from "@/lib/messages/crm";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	fieldsCopy,
	fieldTypeLabel,
	optionCount,
	TYPE_KEY,
} from "./fields-copy";
import { type FieldEntity, kindOf } from "./fields-entity";
import { STANDARD_FIELDS } from "./standard-fields";
import type { TruongLuuTru } from "./use-luu-tru-truong";

type Field = RouterOutputs["fields"]["list"][number];

const ROW = "flex items-center gap-2.5 border-b px-5 py-2";

function summaryOf(field: Field, locale: Locale): string {
	const copy = fieldsCopy(locale);
	const parts: string[] = [];

	if (field.agentFilled) {
		parts.push(
			field.agentBrief ??
				(field.options.length > 0
					? optionCount(field.options.length, locale)
					: field.label),
		);
	} else {
		parts.push(copy.manualOnly);
		if (field.required) parts.push(crmMessages(locale).fields.required);
	}

	if (field.showOnTable) parts.push(copy.tableNote);
	if (field.showOnFilter) parts.push(copy.filterNote);

	return parts.join(" · ");
}

function reordered(fields: Field[], ids: string[]): Field[] {
	const live = fields.filter((field) => !field.archived);
	const byId = new Map(live.map((field) => [field.id, field]));
	const queue = ids
		.map((id) => byId.get(id))
		.filter((field): field is Field => field !== undefined);

	if (queue.length !== live.length) return fields;

	return fields.map((field) =>
		field.archived ? field : (queue.shift() ?? field),
	);
}

function DisclosureRow({
	title,
	note,
	children,
}: {
	title: string;
	note: string;
	children: React.ReactNode;
}) {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<button
					type="button"
					className="flex w-full items-center gap-2 border-b px-5 py-2.5 text-left"
				>
					<Icon
						icon={ChevronRight}
						className="shrink-0 text-muted-foreground"
					/>
					<span className="flex-1 font-medium text-foreground text-xs">
						{title}
					</span>
					<span className="shrink-0 text-muted-foreground text-xs">{note}</span>
				</button>
			</CollapsibleTrigger>
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	);
}

export function FieldsList({
	entity,
	khoa,
	onEdit,
	onNew,
	onArchive,
}: {
	entity: FieldEntity;
	khoa: boolean;
	onEdit: (key: string) => void;
	onNew: () => void;
	onArchive: (field: TruongLuuTru) => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const queryClient = useQueryClient();
	const locale = useLocale();
	const copy = fieldsCopy(locale);

	const listKey = trpc.fields.list.queryKey({ entity, includeArchived: true });

	const query = useQuery(
		trpc.fields.list.queryOptions({ entity, includeArchived: true }),
	);

	const reorder = useMutation(
		trpc.fields.reorder.mutationOptions({
			onMutate: async ({ ids }) => {
				await queryClient.cancelQueries({ queryKey: listKey });
				const previous = queryClient.getQueryData(listKey);
				if (previous) {
					queryClient.setQueryData(listKey, reordered(previous, ids));
				}
				return { previous };
			},
			onError: (error, _input, context) => {
				if (context?.previous) {
					queryClient.setQueryData(listKey, context.previous);
				}
				toast.error(error.message);
			},
			onSettled: () => cache.fields(kindOf(entity)),
		}),
	);

	const restore = useMutation(
		trpc.fields.restore.mutationOptions({
			onSuccess: () => cache.fields(kindOf(entity)),
			onError: (error) => toast.error(error.message),
		}),
	);

	const addSuggested = useMutation(
		trpc.fields.create.mutationOptions({
			onSuccess: () => cache.fields(kindOf(entity)),
			onError: (error) => toast.error(error.message),
		}),
	);

	const all = query.data ?? [];
	const live = all.filter((field) => !field.archived);
	const archived = all.filter((field) => field.archived);
	const standard = STANDARD_FIELDS[entity];

	const existingKeys = new Set(all.map((field) => field.key));
	const suggestions = FIELD_TEMPLATES[entity].filter(
		(template) => !existingKeys.has(fieldKeyFromLabel(template.label)),
	);

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				{khoa ? (
					<p
						className="border-b px-5 py-2.5 text-muted-foreground text-xs"
						data-trang-thai="ST-truong-khong-quyen"
					>
						{copy.canQuyen}
					</p>
				) : null}
				<DisclosureRow
					title={copy.standardRow}
					note={`${standard.length} · ${copy.standardNote}`}
				>
					<ul className="border-b bg-muted/40 py-1">
						{standard.map((field) => (
							<li
								key={field}
								className="px-5 py-1 text-muted-foreground text-xs"
							>
								{field}
							</li>
						))}
					</ul>
				</DisclosureRow>

				{suggestions.length > 0 && (
					<DisclosureRow
						title={copy.suggestedRow}
						note={`${suggestions.length} · ${copy.suggestedNote}`}
					>
						<ul className="border-b bg-muted/40 py-1">
							{suggestions.map((template) => (
								<li
									key={template.label}
									className="flex items-center gap-2.5 px-5 py-1.5"
								>
									<span className="flex-1 truncate text-muted-foreground text-xs">
										{template.label}
										{template.options && template.options.length > 0
											? ` · ${template.options.join(", ")}`
											: ` · ${fieldTypeLabel(TYPE_KEY[template.type], locale)}`}
									</span>
									<Button
										variant="outline"
										size="xs"
										disabled={khoa || addSuggested.isPending}
										onClick={() =>
											addSuggested.mutate({
												entity,
												label: template.label,
												type: template.type,
												options: (template.options ?? []).map((label) => ({
													label,
												})),
												agentFilled:
													template.type !== "USER" &&
													template.type !== "NUMBER",
												required: false,
												showOnSheet: true,
												showOnTable: false,
												showOnFilter: false,
											})
										}
									>
										<Icon icon={Add} data-icon="inline-start" />
										{copy.add}
									</Button>
								</li>
							))}
						</ul>
					</DisclosureRow>
				)}

				{query.isPending ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner />
					</div>
				) : query.isError ? (
					<Empty className="flex-1">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={Warning} />
							</EmptyMedia>
							<EmptyTitle>{copy.errorTitle}</EmptyTitle>
							<EmptyDescription>{copy.errorBody}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								variant="outline"
								disabled={query.isFetching}
								onClick={() => query.refetch()}
							>
								<Icon icon={Renew} data-icon="inline-start" />
								{copy.retry}
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<>
						{live.length === 0 ? (
							<Empty className="flex-1">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Icon icon={Add} />
									</EmptyMedia>
									<EmptyTitle>{copy.emptyTitle}</EmptyTitle>
									<EmptyDescription>{copy.emptyBody}</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button disabled={khoa} onClick={onNew}>
										<Icon icon={Add} data-icon="inline-start" />
										{copy.newField}
									</Button>
								</EmptyContent>
							</Empty>
						) : (
							<>
								<div className="flex items-center justify-between gap-3 px-5 pt-3.5 pb-2">
									<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
										{copy.customGroup}
									</span>
									<span className="text-muted-foreground text-xs">
										{copy.dragNote}
									</span>
								</div>

								<SortableList
									ids={live.map((field) => field.id)}
									onReorder={(ids) => reorder.mutate({ entity, ids })}
								>
									{live.map((field) => (
										<SortableItem
											key={field.id}
											id={field.id}
											label={field.label}
											className={ROW}
											disabled={khoa}
										>
											<button
												type="button"
												disabled={khoa}
												onClick={() => onEdit(field.key)}
												className="flex min-w-0 flex-1 flex-col gap-px text-left"
											>
												<span className="w-full truncate font-medium text-foreground text-xs">
													{field.label}
												</span>
												<span className="w-full truncate text-muted-foreground text-xs">
													{summaryOf(field, locale)}
												</span>
											</button>

											<Badge
												variant="mono"
												className="w-18 shrink-0 justify-center"
											>
												{fieldTypeLabel(TYPE_KEY[field.type], locale)}
											</Badge>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon-xs"
														disabled={khoa}
													>
														<Icon icon={OverflowMenuVertical} />
														<span className="sr-only">
															{copy.moreFor(field.label)}
														</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onSelect={() => onEdit(field.key)}>
														{copy.edit}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem onSelect={() => onArchive(field)}>
														{copy.archive}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</SortableItem>
									))}
								</SortableList>
							</>
						)}

						{archived.length > 0 ? (
							<DisclosureRow
								title={copy.archivedRow}
								note={`${archived.length} · ${copy.archivedNote}`}
							>
								<ul className="border-b">
									{archived.map((field) => (
										<li
											key={field.id}
											className="flex items-center gap-2.5 px-5 py-2"
										>
											<span className="flex-1 truncate text-muted-foreground text-xs">
												{field.label}
											</span>
											<Button
												variant="outline"
												size="xs"
												disabled={khoa}
												onClick={() => restore.mutate({ id: field.id })}
											>
												{copy.restore}
											</Button>
										</li>
									))}
								</ul>
							</DisclosureRow>
						) : null}
					</>
				)}
			</div>

			{live.length > 0 ? (
				<div className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3">
					<Button disabled={khoa} onClick={onNew}>
						<Icon icon={Add} data-icon="inline-start" />
						{copy.newField}
					</Button>
					<span className="text-right text-muted-foreground text-xs">
						{copy.orderNote}
					</span>
				</div>
			) : null}
		</>
	);
}
