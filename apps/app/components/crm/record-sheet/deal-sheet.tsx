"use client";

import Add from "@carbon/icons-react/es/Add";
import Close from "@carbon/icons-react/es/Close";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { CURRENCIES, normalizeCurrency } from "@crm/db/currency";
import type { FieldValueJson } from "@crm/db/fields";
import { Button } from "@crm/ui/components/button";
import { KhoaLuuTru } from "@crm/ui/components/dai-luu-tru";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { formatMoney } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AgentPanel } from "@/components/crm/agent-panel";
import { InlineCompanyField } from "@/components/crm/company-picker";
import { contactName } from "@/components/crm/contact-name";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { FieldsCog, RecordFields } from "@/components/crm/fields/record-fields";
import {
	InlineDateField,
	InlineField,
	InlineMoneyField,
	InlineSelectField,
	InlineTextArea,
	InlineTextCell,
	savingValue,
} from "@/components/crm/inline-field";
import { OwnerCell } from "@/components/crm/owner-cell";
import { SoDienThoai } from "@/components/crm/so-dien-thoai";
import { DealStageMenu } from "@/components/crm/stage-change";
import { StageStepper } from "@/components/crm/stage-stepper";
import { Timeline } from "@/components/crm/timeline/timeline";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import {
	LocalDateTime,
	LocalDay,
	LocalRelativeTime,
} from "@/components/local-date-time";
import {
	type RecordSheetMessages,
	recordSheetMessages,
} from "@/lib/messages/record-sheet";
import { savingField } from "@/lib/pending-field";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { TheGoiYKeHoach } from "./goi-y-ke-hoach";
import { AttachDealContact } from "./quick-add";
import { DaiLuuTruBanGhi, RecordActions } from "./record-actions";
import {
	AddRow,
	BangDaLuuTru,
	DongDaLuuTru,
	lyDoLoi,
	RecordSheetFrame,
	tenCaNhan,
} from "./record-parts";
import { useOpenRecord, useRecordSheetView } from "./record-stack";

type Deal = RouterOutputs["deals"]["byId"];

const CURRENCY_OPTIONS = CURRENCIES.map((entry) => ({
	value: entry.code,
	label: `${entry.code} · ${entry.name}`,
}));

function dealCurrency(currency: string) {
	return normalizeCurrency(currency) || currency;
}

function currencyOptions(currency: string, m: RecordSheetMessages) {
	if (CURRENCY_OPTIONS.some((option) => option.value === currency)) {
		return CURRENCY_OPTIONS;
	}

	return [
		{ value: currency, label: m.deal.currencyGone(currency) },
		...CURRENCY_OPTIONS,
	];
}

function ReportedValue({ deal }: { deal: Deal }) {
	const locale = useLocale();
	const m = recordSheetMessages(locale);
	const currency = dealCurrency(deal.currency);

	if (currency === deal.reportingCurrency) return null;
	if (deal.amountCents === null) return null;

	return (
		<DetailSheetProperty label={m.deal.inCurrency(deal.reportingCurrency)}>
			{deal.baseAmountCents === null ? (
				<span className="text-muted-foreground">{m.deal.noRate(currency)}</span>
			) : (
				<span className="tabular-nums text-muted-foreground">
					≈ {formatMoney(deal.baseAmountCents, deal.reportingCurrency, locale)}
				</span>
			)}
		</DetailSheetProperty>
	);
}

function contactColumns(m: RecordSheetMessages) {
	const c = m.deal.contactColumns;
	return [
		{ id: "name", header: c.name, width: "w-[19%]", className: "pl-5" },
		{ id: "phone", header: c.phone, width: "w-32" },
		{ id: "role", header: c.role, width: "w-[12%]" },
		{ id: "title", header: c.title, width: "w-[12%]" },
		{ id: "email", header: c.email, width: "w-[12%]" },
		{ id: "remove", srLabel: c.remove, width: "w-10" },
	];
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	month: "short",
	day: "numeric",
	year: "numeric",
};

export function DealSheet({ dealId }: { dealId: string }) {
	const locale = useLocale();
	const m = recordSheetMessages(useLocale());
	const trpc = useTRPC();
	const openRecord = useOpenRecord();
	const {
		tab,
		setTab,
		form: adding,
		setForm: setAdding,
	} = useRecordSheetView("overview");

	const query = useQuery(trpc.deals.byId.queryOptions({ id: dealId }));
	const deal = query.data;

	const tabs: DetailSheetTab[] = deal
		? [
				{
					value: "overview",
					label: m.tabs.overview,
					content: <DealOverview deal={deal} />,
				},
				{
					value: "contacts",
					label: m.tabs.contacts,
					count: deal.contacts.length,
					content: (
						<DealContacts
							deal={deal}
							adding={adding === "contact"}
							onAdd={() => setAdding("contact")}
							onDone={() => setAdding(null)}
						/>
					),
				},
				{
					value: "activity",
					label: m.tabs.activity,
					content: <Timeline anchor={{ dealId: deal.id }} />,
				},
				{
					value: "agent",
					label: m.tabs.agent,
					content: <AgentPanel record={{ kind: "deal", id: deal.id }} />,
					keepMounted: true,
				},
			]
		: [];

	return (
		<RecordSheetFrame
			loading={query.isPending}
			error={query.error?.message ?? null}
			lyDo={lyDoLoi(query.error)}
			onRetry={() => void query.refetch()}
			title={deal?.name ?? m.deal.fallbackTitle}
			description={
				deal ? (
					<button
						type="button"
						onClick={() => openRecord({ kind: "company", id: deal.company.id })}
						className="text-foreground underline-offset-2 hover:underline"
					>
						{deal.company.name}
					</button>
				) : undefined
			}
			media={
				deal ? (
					<EntityLogo
						src={deal.company.iconUrl}
						darkSrc={deal.company.iconDarkUrl}
						tone={deal.company.iconTone as EntityLogoTone | null | undefined}
						name={deal.company.name}
						size="lg"
					/>
				) : null
			}
			actions={
				deal ? (
					<>
						{deal.archivedAt ? (
							<span data-giai-doan-tinh="" className="inline-flex items-center">
								<DealStageIndicator stage={deal.stage} />
							</span>
						) : (
							<DealStageMenu
								dealId={deal.id}
								stage={deal.stage}
								variant="control"
							/>
						)}
						<RecordActions
							record={{ kind: "deal", id: deal.id }}
							name={deal.name}
							consequence={m.deal.deleteWarning(
								deal.company.name,
								deal.contacts.length + deal.archivedContacts.length === 1
									? m.deal.person
									: m.deal.people,
							)}
							archivedAt={deal.archivedAt}
						/>
					</>
				) : null
			}
			stats={
				deal ? (
					<>
						{deal.archivedAt ? (
							<DaiLuuTruBanGhi
								record={{ kind: "deal", id: deal.id }}
								archivedAt={deal.archivedAt}
							/>
						) : (
							<TheGoiYKeHoach dealId={deal.id} />
						)}
						<DetailSheetStats>
							<DetailSheetStat label={m.deal.fields.amount}>
								{deal.amountCents === null ? (
									<EmptyCellValue />
								) : (
									<span className="tabular-nums">
										{formatMoney(
											deal.amountCents,
											dealCurrency(deal.currency),
											locale,
										)}
									</span>
								)}
							</DetailSheetStat>
							<DetailSheetStat label={m.deal.expectedClose}>
								{deal.expectedCloseDate ? (
									<LocalDay date={deal.expectedCloseDate} />
								) : (
									<EmptyCellValue />
								)}
							</DetailSheetStat>
							<DetailSheetStat label={m.deal.inStage}>
								<LocalRelativeTime date={deal.stageChangedAt} />
							</DetailSheetStat>
							<DetailSheetStat label={m.deal.fields.owner}>
								<OwnerCell owner={deal.owner} />
							</DetailSheetStat>
						</DetailSheetStats>
					</>
				) : null
			}
			tabs={tabs}
			tab={tab}
			onTabChange={setTab}
		/>
	);
}

function DealOverview({ deal }: { deal: Deal }) {
	const locale = useLocale();
	const m = recordSheetMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const users = useQuery(trpc.users.list.queryOptions());

	const update = useMutation(
		trpc.deals.update.mutationOptions({
			onSuccess: () => cache.deal(deal.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const saveFields = (fields: Record<string, FieldValueJson>) =>
		update.mutate({ id: deal.id, data: { fields } });

	const isSavingField = savingValue(update);

	const save = (data: Parameters<typeof update.mutate>[0]["data"]) =>
		update.mutate({ id: deal.id, data });

	const currency = dealCurrency(deal.currency);

	const isSaving = savingField(update);

	return (
		<KhoaLuuTru khoa={deal.archivedAt !== null}>
			<DetailSheetBody>
				<DetailSheetSection title={m.deal.stageSection}>
					<StageStepper dealId={deal.id} stage={deal.stage} />

					{deal.closedReason ? (
						<DetailSheetProperties>
							<DetailSheetProperty label={m.deal.closed}>
								{deal.closedAt ? (
									<LocalDateTime date={deal.closedAt} options={DATE_OPTIONS} />
								) : (
									<EmptyCellValue />
								)}
							</DetailSheetProperty>
							<DetailSheetProperty label={m.deal.reason} wide>
								{deal.closedReason}
							</DetailSheetProperty>
						</DetailSheetProperties>
					) : null}
				</DetailSheetSection>

				<DetailSheetSection
					title={m.deal.details}
					action={deal.archivedAt ? undefined : <FieldsCog kind="deal" />}
				>
					<DetailSheetProperties>
						<InlineField
							label={m.deal.fields.name}
							value={deal.name}
							saving={isSaving("name")}
							onSave={(name) => name && save({ name })}
						/>
						<InlineMoneyField
							label={m.deal.fields.amount}
							cents={deal.amountCents}
							currency={currency}
							saving={isSaving("amountCents")}
							onSave={(amountCents) => save({ amountCents })}
						/>
						<InlineSelectField
							label={m.deal.fields.currency}
							value={currency}
							options={currencyOptions(currency, m)}
							onSave={(currency) => save({ currency })}
						/>
						<ReportedValue deal={deal} />
						<InlineDateField
							label={m.deal.fields.closeDate}
							value={deal.expectedCloseDate}
							saving={isSaving("expectedCloseDate")}
							onSave={(next) => save({ expectedCloseDate: next || null })}
						/>
						<InlineCompanyField
							value={deal.company.id}
							company={deal.company}
							saving={isSaving("companyId")}
							onSave={(companyId) => save({ companyId })}
						/>
						<InlineSelectField
							label={m.deal.fields.owner}
							value={deal.owner.id}
							options={(users.data ?? []).map((user) => ({
								value: user.id,
								label: user.name,
							}))}
							onSave={(ownerId) => save({ ownerId })}
						/>
						<RecordFields
							fields={deal.fields}
							saving={isSavingField}
							onSave={saveFields}
						/>
					</DetailSheetProperties>
				</DetailSheetSection>

				<DetailSheetSection title={m.deal.description}>
					<InlineTextArea
						label={m.deal.description}
						value={deal.description}
						placeholder={
							deal.archivedAt
								? undefined
								: m.deal.descriptionHint(deal.company.name)
						}
						saving={isSaving("description")}
						onSave={(description) => save({ description })}
					/>
				</DetailSheetSection>

				<WhereItStands deal={deal} />
			</DetailSheetBody>
		</KhoaLuuTru>
	);
}

function WhereItStands({ deal }: { deal: Deal }) {
	const m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();

	return (
		<DetailSheetSection title={m.section.whereItStands}>
			<DetailSheetProperties>
				<DetailSheetProperty label={m.deal.opened}>
					<LocalDateTime date={deal.createdAt} options={DATE_OPTIONS} />
				</DetailSheetProperty>

				<DetailSheetProperty label={m.deal.inStageSince}>
					<LocalDateTime date={deal.stageChangedAt} options={DATE_OPTIONS} />
				</DetailSheetProperty>

				{deal.closedAt ? (
					<DetailSheetProperty label={m.deal.closed}>
						<LocalDateTime date={deal.closedAt} options={DATE_OPTIONS} />
					</DetailSheetProperty>
				) : null}

				{deal.closedReason ? (
					<DetailSheetProperty label={m.deal.reason} wide>
						{deal.closedReason}
					</DetailSheetProperty>
				) : null}

				<DetailSheetProperty label={m.section.onIt} wide>
					{deal.contacts.length === 0 ? (
						<span className="text-muted-foreground">
							{m.deal.nobodyAttached(deal.company.name)}
						</span>
					) : (
						<span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
							{deal.contacts.map((contact) => {
								const aside = contact.role ?? contact.title;
								return (
									<button
										key={contact.id}
										type="button"
										onClick={() =>
											openRecord({ kind: "contact", id: contact.id })
										}
										className="min-w-0 truncate underline-offset-2 hover:underline"
									>
										{contactName(contact)}
										{aside ? (
											<span className="text-muted-foreground"> ({aside})</span>
										) : null}
									</button>
								);
							})}
						</span>
					)}
				</DetailSheetProperty>
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}

function DealContacts({
	deal,
	adding,
	onAdd,
	onDone,
}: {
	deal: Deal;
	adding: boolean;
	onAdd: () => void;
	onDone: () => void;
}) {
	const m = recordSheetMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();

	const detach = useMutation(
		trpc.deals.detachContact.mutationOptions({
			onSuccess: () => cache.deal(deal.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const setRole = useMutation(
		trpc.deals.setContactRole.mutationOptions({
			onSuccess: () => cache.deal(deal.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const form = adding ? (
		<AttachDealContact
			dealId={deal.id}
			companyName={deal.company.name}
			onDone={onDone}
		/>
	) : null;

	const daCat = deal.archivedContacts.map((contact) => ({
		id: contact.id,
		name: tenCaNhan(contact),
		archivedAt: contact.archivedAt,
	}));

	if (deal.contacts.length === 0) {
		return (
			<>
				{form}
				{adding ? null : (
					<DetailSheetEmpty
						icon={UserMultiple}
						title={m.deal.noContactsTitle}
						description={m.deal.noContactsBody(deal.company.name)}
						action={
							<Button variant="outline" size="sm" onClick={onAdd}>
								<Icon icon={Add} data-icon="inline-start" />
								{m.deal.addContact}
							</Button>
						}
					/>
				)}
				<BangDaLuuTru
					items={daCat}
					columns={contactColumns(m)}
					kind="contact"
				/>
			</>
		);
	}

	return (
		<>
			{form}
			<SimpleTable variant="panel" columns={contactColumns(m)}>
				{deal.contacts.map((contact) => (
					<SimpleTableRow
						key={contact.id}
						clickable
						onClick={() => openRecord({ kind: "contact", id: contact.id })}
					>
						<TableCell className="truncate py-2.5 pr-3 pl-5 font-medium">
							<span className="flex min-w-0 items-center gap-2">
								<PersonAvatar
									src={contact.imageUrl}
									name={contactName(contact)}
									email={contact.email}
									size="sm"
								/>
								<span className="truncate">{contactName(contact)}</span>
							</span>
						</TableCell>
						<TableCell className="px-3 py-2.5">
							{contact.phone ? (
								<SoDienThoai so={contact.phone} />
							) : (
								<EmptyCellValue />
							)}
						</TableCell>
						<TableCell className="truncate px-1 py-2.5">
							<InlineTextCell
								label={m.deal.roleOnDeal(contactName(contact))}
								value={contact.role}
								placeholder={m.deal.championPlaceholder}
								saving={
									setRole.isPending &&
									setRole.variables?.contactId === contact.id
								}
								onSave={(role) =>
									setRole.mutate({
										dealId: deal.id,
										contactId: contact.id,
										role: role || null,
									})
								}
							/>
						</TableCell>
						<TableCell className="truncate px-3 py-2.5 text-muted-foreground">
							{contact.title ?? <EmptyCellValue />}
						</TableCell>
						<TableCell className="truncate px-3 py-2.5 text-muted-foreground">
							{contact.email ?? <EmptyCellValue />}
						</TableCell>
						<TableCell className="px-3 py-2.5">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon-xs"
										disabled={detach.isPending}
										onClick={(event) => {
											event.stopPropagation();
											detach.mutate({
												dealId: deal.id,
												contactId: contact.id,
											});
										}}
									>
										<Icon icon={Close} />
										<span className="sr-only">
											{m.deal.takeOffNamed(contactName(contact))}
										</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>{m.deal.takeOff}</TooltipContent>
							</Tooltip>
						</TableCell>
					</SimpleTableRow>
				))}

				<AddRow
					label={m.deal.addContact}
					columns={contactColumns(m).length}
					onClick={onAdd}
				/>
				<DongDaLuuTru
					items={daCat}
					columns={contactColumns(m).length}
					kind="contact"
				/>
			</SimpleTable>
		</>
	);
}
