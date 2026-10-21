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
import { Switch } from "@crm/ui/components/switch";
import type { Locale } from "@crm/ui/lib/locale";
import type {
	BoTriTruong,
	MucBoTriTruong,
} from "@crm/validation/bo-tri-truong";
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
	fieldTypeNgan,
	optionCount,
	TYPE_KEY,
} from "./fields-copy";
import { type FieldEntity, kindOf } from "./fields-entity";
import { kieuTruongChuan, nhanTruongChuan } from "./truong-chuan";
import { useBoTriTruong } from "./use-bo-tri-truong";
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

const STD = "std:";

function maHang(muc: MucBoTriTruong): string {
	return muc.kind === "standard" ? `${STD}${muc.key}` : muc.id;
}

function sapTheo(muc: BoTriTruong, ids: string[]): BoTriTruong {
	const theoMa = new Map(muc.map((m) => [maHang(m), m]));
	return ids
		.map((id) => theoMa.get(id))
		.filter((m): m is MucBoTriTruong => m !== undefined);
}

function nhanKieuChuan(
	entity: FieldEntity,
	key: string,
	locale: Locale,
): string {
	const kieu = kieuTruongChuan(entity, key);
	const m = crmMessages(locale).fields;
	if (kieu === "MONEY") return m.moneyNgan;
	if (kieu === "COMPANY") return m.companyNgan;
	return kieu ? fieldTypeNgan(TYPE_KEY[kieu], locale) : "";
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
	const m = crmMessages(locale);

	const listKey = trpc.fields.list.queryKey({ entity, includeArchived: true });
	const layoutKey = trpc.fields.layout.queryKey({ entity });

	const query = useQuery(
		trpc.fields.list.queryOptions({ entity, includeArchived: true }),
	);

	const all = query.data ?? [];
	const live = all.filter((field) => !field.archived);
	const archived = all.filter((field) => field.archived);
	const byId = new Map(live.map((field) => [field.id, field]));
	const boTri = useBoTriTruong(
		entity,
		live.map((field) => ({ id: field.id, key: field.key })),
	);
	const rows = boTri.muc.filter(
		(muc) => muc.kind === "standard" || byId.has(muc.id),
	);

	const settle = () => cache.fields(kindOf(entity));

	const reorder = useMutation(
		trpc.fields.reorder.mutationOptions({
			onError: () => toast.error(copy.orderFailed),
			onSettled: settle,
		}),
	);

	const setHidden = useMutation(
		trpc.fields.setStandardHidden.mutationOptions({ onSettled: settle }),
	);

	const showCustom = useMutation(
		trpc.fields.update.mutationOptions({ onSettled: settle }),
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

	const onReorder = (ids: string[]) => {
		const truoc = queryClient.getQueryData(layoutKey);
		const moi = sapTheo(rows, ids);
		if (moi.length !== rows.length) return;
		queryClient.setQueryData(layoutKey, moi);
		reorder.mutate(
			{
				entity,
				items: moi.map((muc) =>
					muc.kind === "standard" ? { standard: muc.key } : { custom: muc.id },
				),
			},
			{
				onError: () => queryClient.setQueryData(layoutKey, truoc),
			},
		);
	};

	const onToggle = (muc: MucBoTriTruong, nhan: string, hien: boolean) => {
		const bao = {
			onSuccess: () =>
				toast(hien ? copy.shownOnSheet(nhan) : copy.hiddenFromSheet(nhan)),
			onError: () => toast.error(m.truongKieu.chuaLuu(nhan)),
		};

		if (muc.kind === "standard") {
			const truoc = queryClient.getQueryData(layoutKey);
			queryClient.setQueryData(
				layoutKey,
				rows.map((r) =>
					r.kind === "standard" && r.key === muc.key
						? { ...r, hidden: !hien }
						: r,
				),
			);
			setHidden.mutate(
				{ entity, key: muc.key, hidden: !hien },
				{
					...bao,
					onError: () => {
						queryClient.setQueryData(layoutKey, truoc);
						bao.onError();
					},
				},
			);
			return;
		}

		const truoc = queryClient.getQueryData(listKey);
		if (truoc) {
			queryClient.setQueryData(
				listKey,
				truoc.map((field) =>
					field.id === muc.id ? { ...field, showOnSheet: hien } : field,
				),
			);
		}
		showCustom.mutate(
			{ id: muc.id, data: { showOnSheet: hien } },
			{
				...bao,
				onError: () => {
					queryClient.setQueryData(listKey, truoc);
					bao.onError();
				},
			},
		);
	};

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
						<div className="flex items-center justify-end gap-3 px-5 pt-3.5 pb-2">
							<span className="text-muted-foreground text-xs">
								{copy.dragNote}
							</span>
						</div>

						<SortableList ids={rows.map(maHang)} onReorder={onReorder}>
							{rows.map((muc) => {
								const field = muc.kind === "custom" ? byId.get(muc.id) : null;
								const nhan = field
									? field.label
									: nhanTruongChuan(entity, muc.key, locale);
								const batBuoc =
									muc.kind === "standard" ? muc.required : !!field?.required;
								const hien =
									muc.kind === "standard" ? !muc.hidden : !!field?.showOnSheet;
								const lyDoId = `${maHang(muc)}-ly-do`;

								return (
									<SortableItem
										key={maHang(muc)}
										id={maHang(muc)}
										label={nhan}
										className={ROW}
										disabled={khoa}
									>
										{field ? (
											<button
												type="button"
												disabled={khoa}
												onClick={() => onEdit(field.key)}
												className="flex min-w-0 flex-1 flex-col gap-px text-left"
												data-muc-keo={maHang(muc)}
											>
												<span className="w-full truncate font-medium text-foreground text-xs">
													{nhan}
												</span>
												<span className="w-full truncate text-muted-foreground text-xs">
													{summaryOf(field, locale)}
												</span>
											</button>
										) : (
											<div
												className="flex min-w-0 flex-1 flex-col gap-px"
												data-muc-keo={maHang(muc)}
											>
												<span className="w-full truncate font-medium text-foreground text-xs">
													{nhan}
												</span>
												<span className="w-full truncate text-muted-foreground text-xs">
													{batBuoc
														? `${copy.standardSummary} · ${m.fields.required}`
														: copy.standardSummary}
												</span>
											</div>
										)}

										<Badge
											variant="mono"
											className="min-w-18 shrink-0 justify-center"
											data-nhan-kieu={
												field ? field.type : kieuTruongChuan(entity, muc.key)
											}
										>
											{field
												? fieldTypeNgan(TYPE_KEY[field.type], locale)
												: nhanKieuChuan(entity, muc.key, locale)}
										</Badge>

										<Switch
											checked={batBuoc || hien}
											disabled={khoa || batBuoc}
											aria-label={copy.sheetSwitch(nhan)}
											aria-describedby={batBuoc ? lyDoId : undefined}
											onCheckedChange={(checked) =>
												onToggle(muc, nhan, checked)
											}
										/>
										{batBuoc ? (
											<span id={lyDoId} className="sr-only">
												{copy.requiredLocked}
											</span>
										) : null}

										{field ? (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon-xs"
														disabled={khoa}
													>
														<Icon icon={OverflowMenuVertical} />
														<span className="sr-only">
															{copy.moreFor(nhan)}
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
										) : (
											<span aria-hidden className="size-6 shrink-0" />
										)}
									</SortableItem>
								);
							})}
						</SortableList>

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
						) : null}

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
