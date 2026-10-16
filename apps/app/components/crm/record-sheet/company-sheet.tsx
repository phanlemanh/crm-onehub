"use client";

import Add from "@carbon/icons-react/es/Add";
import Partnership from "@carbon/icons-react/es/Partnership";
import Star from "@carbon/icons-react/es/Star";
import StarFilled from "@carbon/icons-react/es/StarFilled";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
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
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AgentPanel } from "@/components/crm/agent-panel";
import { EnrichmentActions } from "@/components/crm/enrichment-actions";
import { EnrichmentIndicator } from "@/components/crm/enrichment-status";
import { FieldsCog, RecordFields } from "@/components/crm/fields/record-fields";
import {
	InlineField,
	InlineSelectField,
	savingValue,
} from "@/components/crm/inline-field";
import { OwnerCell } from "@/components/crm/owner-cell";
import { SoDienThoai } from "@/components/crm/so-dien-thoai";
import { CompanySocials } from "@/components/crm/social-links";
import { DealStageMenu } from "@/components/crm/stage-change";
import { Timeline } from "@/components/crm/timeline/timeline";
import { WebsiteActivity } from "@/components/crm/website-activity";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetMain,
	DetailSheetPending,
	DetailSheetProperties,
	DetailSheetRail,
	DetailSheetSection,
	DetailSheetSplit,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import { LocalDay } from "@/components/local-date-time";
import { ENRICHMENT_POLL_MS, isEnriching } from "@/lib/enrichment-status";
import { useGiaiDoan } from "@/lib/giai-doan";
import { crmMessages } from "@/lib/messages/crm";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import {
	type RecordSheetMessages,
	recordSheetMessages,
} from "@/lib/messages/record-sheet";
import { savingField } from "@/lib/pending-field";
import { hasCompanyLinks } from "@/lib/social-links";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { CompanyPlans } from "./company-plans";
import { QuickAddContact, QuickAddDeal } from "./quick-add";
import { DaiLuuTruBanGhi, RecordActions } from "./record-actions";
import {
	AddRow,
	BangDaLuuTru,
	CompanyAbout,
	DealAmount,
	DomainLink,
	DongDaLuuTru,
	lyDoLoi,
	MetaLine,
	RecordSheetFrame,
	tenCaNhan,
} from "./record-parts";
import { useOpenRecord, useRecordSheetView } from "./record-stack";

type Company = RouterOutputs["companies"]["byId"];
type CompanyDeal = Company["deals"][number];

const UNASSIGNED = "unassigned";

function pendingFields(company: Company, locale: Locale): string[] {
	const m = crmMessages(locale).missing;
	const missing: string[] = [];
	if (!company.industry) missing.push(m.industry);
	if (!company.description) missing.push(m.description);
	if (!hasCompanyLinks(company)) missing.push(m.socialLinks);
	return missing;
}

function companyConsequence(company: Company, m: RecordSheetMessages): string {
	const deals = company.deals.length + company.archivedDeals.length;
	const contacts = company.contacts.length + company.archivedContacts.length;
	const c = m.company;

	const gone =
		deals > 0
			? c.deleteDeals(deals === 1 ? c.oneDeal : c.manyDeals(String(deals)))
			: c.deleteNoDeals;

	const kept =
		contacts > 0
			? ` ${c.deleteContacts(
					contacts === 1 ? c.onePerson : c.manyPeople(String(contacts)),
				)}`
			: "";

	return gone + kept;
}

function contactColumns(m: RecordSheetMessages) {
	const c = m.company.contactColumns;
	return [
		{ id: "primary", srLabel: c.primary, width: "w-10", className: "pl-5" },
		{ id: "name", header: c.name, width: "w-[20%]" },
		{ id: "phone", header: c.phone, width: "w-32" },
		{ id: "title", header: c.title, width: "w-[12%]" },
		{ id: "email", header: c.email, width: "w-[12%]" },
		{ id: "owner", header: c.owner, width: "w-[11%]" },
	];
}

function dealColumns(m: RecordSheetMessages) {
	const d = m.company.dealColumns;
	return [
		{ id: "deal", header: d.deal, width: "w-[32%]", className: "pl-5" },
		{ id: "stage", header: d.stage, width: "w-[24%]" },
		{
			id: "amount",
			header: d.amount,
			width: "w-[16%]",
			align: "right" as const,
		},
		{ id: "close-date", header: d.closeDate, width: "w-[14%]" },
		{ id: "owner", header: d.owner, width: "w-[14%]" },
	];
}

function nextClose(deals: CompanyDeal[]): string | null {
	const dates = deals
		.map((deal) => deal.expectedCloseDate)
		.filter((date): date is string => date !== null)
		.sort();
	return dates[0] ?? null;
}

export function CompanySheet({ companyId }: { companyId: string }) {
	const locale = useLocale();
	const m = recordSheetMessages(locale);
	const trpc = useTRPC();
	const {
		tab,
		setTab,
		form: adding,
		setForm: setAdding,
	} = useRecordSheetView("overview");
	const giaiDoan = useGiaiDoan();

	const query = useQuery({
		...trpc.companies.byId.queryOptions({ id: companyId }),
		refetchInterval: (current) => {
			const record = current.state.data;
			return record && isEnriching(record.enrichmentStatus, record.queued)
				? ENRICHMENT_POLL_MS
				: false;
		},
	});

	const company = query.data;

	const location = company
		? [company.city, company.stateCode, company.country]
				.filter(Boolean)
				.join(", ")
		: null;

	const openDeals =
		company?.deals.filter((deal) => !giaiDoan.laDaDong(deal.stage)) ?? [];
	const openValueCents = openDeals.reduce(
		(total, deal) => total + (deal.baseAmountCents ?? 0),
		0,
	);
	const openUncounted = openDeals.filter(
		(deal) => deal.amountCents !== null && deal.baseAmountCents === null,
	).length;
	const closing = nextClose(openDeals);

	const tabs: DetailSheetTab[] = company
		? [
				{
					value: "overview",
					label: m.tabs.overview,
					content: <CompanyOverview company={company} />,
				},
				{
					value: "contacts",
					label: m.tabs.contacts,
					count: company.contacts.length,
					content: (
						<CompanyContacts
							company={company}
							adding={adding === "contact"}
							onAdd={() => setAdding("contact")}
							onDone={() => setAdding(null)}
						/>
					),
				},
				{
					value: "deals",
					label: m.tabs.deals,
					count: company.deals.length,
					content: (
						<CompanyDeals
							company={company}
							adding={adding === "deal"}
							onAdd={() => setAdding("deal")}
							onDone={() => setAdding(null)}
						/>
					),
				},
				...(company.soKeHoach > 0 || company.xuongCoKhuon
					? [
							{
								value: "plans",
								label: keHoachNoiMessages(locale).congTy.tab,
								count: company.soKeHoach,
								content: (
									<CompanyPlans
										companyId={company.id}
										companyName={company.name}
									/>
								),
							},
						]
					: []),
				{
					value: "activity",
					label: m.tabs.activity,
					content: <Timeline anchor={{ companyId: company.id }} />,
				},
				{
					value: "agent",
					label: m.tabs.agent,
					content: <AgentPanel record={{ kind: "company", id: company.id }} />,
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
			title={company?.name ?? m.company.fallbackTitle}
			description={
				company ? (
					<MetaLine
						lead={
							<DomainLink domain={company.domain} website={company.website} />
						}
						parts={[{ text: location }, { text: company.industry, lang: "en" }]}
					/>
				) : undefined
			}
			note={
				company && company.enrichmentStatus !== "COMPLETE" ? (
					<EnrichmentIndicator
						status={company.enrichmentStatus}
						queued={company.queued}
						title={company.enrichmentError}
					/>
				) : null
			}
			media={
				<EntityLogo
					src={company?.iconUrl ?? company?.logoUrl}
					darkSrc={company?.iconDarkUrl}
					tone={company?.iconTone as EntityLogoTone | null | undefined}
					name={company?.name ?? "?"}
					size="lg"
				/>
			}
			actions={
				company ? (
					<>
						<EnrichmentActions
							companyId={company.id}
							hasDomain={company.domain !== null}
						/>
						<RecordActions
							record={{ kind: "company", id: company.id }}
							name={company.name}
							consequence={companyConsequence(company, m)}
							archivedAt={company.archivedAt}
						/>
					</>
				) : null
			}
			stats={
				company ? (
					<>
						{company.archivedAt ? (
							<DaiLuuTruBanGhi
								record={{ kind: "company", id: company.id }}
								archivedAt={company.archivedAt}
							/>
						) : null}
						<DetailSheetStats>
							<DetailSheetStat label={m.company.openPipeline}>
								{openDeals.some((deal) => deal.amountCents !== null) ? (
									<span className="tabular-nums">
										{formatMoney(
											openValueCents,
											company.reportingCurrency,
											locale,
										)}
									</span>
								) : (
									<EmptyCellValue />
								)}
								{openUncounted > 0 ? (
									<span className="text-muted-foreground">
										{" "}
										{m.company.unconverted(String(openUncounted))}
									</span>
								) : null}
							</DetailSheetStat>
							<DetailSheetStat label={m.company.openDeals}>
								<span className="tabular-nums">{openDeals.length}</span>
							</DetailSheetStat>
							<DetailSheetStat label={m.company.nextClose}>
								{closing ? <LocalDay date={closing} /> : <EmptyCellValue />}
							</DetailSheetStat>
							<DetailSheetStat label={m.company.fields.owner}>
								<OwnerCell owner={company.owner} xuongDongDienThoai />
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

function CompanyOverview({ company }: { company: Company }) {
	const locale = useLocale();
	const m = recordSheetMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const users = useQuery(trpc.users.list.queryOptions());

	const update = useMutation(
		trpc.companies.update.mutationOptions({
			onSuccess: () => cache.company(company.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const save = (data: Record<string, string | null>) =>
		update.mutate({ id: company.id, data });

	const saveFields = (fields: Record<string, FieldValueJson>) =>
		update.mutate({ id: company.id, data: { fields } });

	const isSaving = savingField(update);
	const isSavingField = savingValue(update);

	return (
		<KhoaLuuTru khoa={company.archivedAt !== null}>
			<DetailSheetBody>
				<DetailSheetSplit>
					<DetailSheetMain>
						<CompanyAbout
							title={m.section.about}
							description={company.description}
						/>

						<WebsiteActivity companyId={company.id} />
					</DetailSheetMain>

					<DetailSheetRail>
						<DetailSheetSection
							title={m.company.details}
							action={
								company.archivedAt ? undefined : <FieldsCog kind="company" />
							}
						>
							<DetailSheetProperties columns={1}>
								<InlineField
									label={m.company.fields.name}
									value={company.name}
									saving={isSaving("name")}
									onSave={(name) => name && save({ name })}
								/>
								<InlineField
									label={m.company.fields.domain}
									value={company.domain}
									type="url"
									placeholder={m.company.domainPlaceholder}
									saving={isSaving("domain")}
									onSave={(domain) => save({ domain })}
								/>
								<InlineField
									label={m.company.fields.website}
									value={company.website}
									type="url"
									placeholder={m.company.websitePlaceholder}
									saving={isSaving("website")}
									onSave={(website) => save({ website })}
								/>
								<InlineField
									label={m.company.fields.phone}
									value={company.phone}
									type="tel"
									saving={isSaving("phone")}
									onSave={(phone) => save({ phone })}
								/>
								<InlineField
									label={m.company.fields.email}
									value={company.email}
									type="email"
									saving={isSaving("email")}
									onSave={(email) => save({ email })}
								/>
								<InlineField
									label={m.company.fields.city}
									value={company.city}
									saving={isSaving("city")}
									onSave={(city) => save({ city })}
								/>
								<InlineField
									label={m.company.fields.country}
									value={company.country}
									saving={isSaving("country")}
									onSave={(country) => save({ country })}
								/>
								<InlineSelectField
									label={m.company.fields.owner}
									value={company.owner?.id ?? UNASSIGNED}
									options={[
										{ value: UNASSIGNED, label: m.company.fields.unassigned },
										...(users.data ?? []).map((user) => ({
											value: user.id,
											label: user.name,
										})),
									]}
									emptyValue={UNASSIGNED}
									onSave={(ownerId) =>
										save({ ownerId: ownerId === UNASSIGNED ? null : ownerId })
									}
								/>
								<RecordFields
									fields={company.fields}
									saving={isSavingField}
									onSave={saveFields}
								/>
							</DetailSheetProperties>
						</DetailSheetSection>

						<DetailSheetPending
							fields={pendingFields(company, locale)}
							running={isEnriching(company.enrichmentStatus, company.queued)}
						/>

						{hasCompanyLinks(company) ? (
							<DetailSheetSection title={m.section.links}>
								<CompanySocials company={company} />
							</DetailSheetSection>
						) : null}
					</DetailSheetRail>
				</DetailSheetSplit>
			</DetailSheetBody>
		</KhoaLuuTru>
	);
}

function CompanyContacts({
	company,
	adding,
	onAdd,
	onDone,
}: {
	company: Company;
	adding: boolean;
	onAdd: () => void;
	onDone: () => void;
}) {
	const m = recordSheetMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();

	const setPrimary = useMutation(
		trpc.companies.setPrimaryContact.mutationOptions({
			onSuccess: () => cache.company(company.id),
			onError: (error) => toast.error(error.message),
		}),
	);

	const form = adding ? (
		<QuickAddContact
			companyId={company.id}
			ownerId={company.owner?.id ?? null}
			onDone={onDone}
		/>
	) : null;

	const daCat = company.archivedContacts.map((contact) => ({
		id: contact.id,
		name: tenCaNhan(contact),
		archivedAt: contact.archivedAt,
	}));

	if (company.contacts.length === 0) {
		return (
			<>
				{form}
				{adding ? null : (
					<DetailSheetEmpty
						icon={UserMultiple}
						title={m.company.noContactsTitle}
						description={m.company.noContactsBody(company.name)}
						action={
							<Button variant="outline" size="sm" onClick={onAdd}>
								<Icon icon={Add} data-icon="inline-start" />
								{m.company.addContact}
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
				{company.contacts.map((contact) => {
					const isPrimary = contact.id === company.primaryContactId;
					return (
						<SimpleTableRow
							key={contact.id}
							clickable
							onClick={() => openRecord({ kind: "contact", id: contact.id })}
						>
							<TableCell className="w-10 py-2.5 pl-5">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-pressed={isPrimary}
											disabled={isPrimary || setPrimary.isPending}
											onClick={(event) => {
												event.stopPropagation();
												setPrimary.mutate({
													companyId: company.id,
													contactId: contact.id,
												});
											}}
										>
											<Icon icon={isPrimary ? StarFilled : Star} />
											<span className="sr-only">
												{isPrimary
													? m.company.primaryContactBadge
													: m.company.makePrimary}
											</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{isPrimary
											? m.company.primaryContactBadge
											: m.company.makePrimary}
									</TooltipContent>
								</Tooltip>
							</TableCell>
							<TableCell className="truncate px-3 py-2.5 font-medium">
								<span className="flex min-w-0 items-center gap-2">
									<PersonAvatar
										src={contact.imageUrl}
										name={[contact.firstName, contact.lastName]
											.filter(Boolean)
											.join(" ")}
										email={contact.email}
										size="sm"
									/>
									<span className="truncate">
										{[contact.firstName, contact.lastName]
											.filter(Boolean)
											.join(" ")}
									</span>
								</span>
							</TableCell>
							<TableCell className="px-3 py-2.5">
								{contact.phone ? (
									<SoDienThoai so={contact.phone} />
								) : (
									<EmptyCellValue />
								)}
							</TableCell>
							<TableCell className="truncate px-3 py-2.5">
								{contact.title ?? <EmptyCellValue />}
							</TableCell>
							<TableCell className="truncate px-3 py-2.5 text-muted-foreground">
								{contact.email ?? <EmptyCellValue />}
							</TableCell>
							<TableCell className="px-3 py-2.5">
								<OwnerCell owner={contact.owner} />
							</TableCell>
						</SimpleTableRow>
					);
				})}

				<AddRow
					label={m.company.addContact}
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

function CompanyDeals({
	company,
	adding,
	onAdd,
	onDone,
}: {
	company: Company;
	adding: boolean;
	onAdd: () => void;
	onDone: () => void;
}) {
	const m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();

	const form = adding ? (
		<QuickAddDeal
			companyId={company.id}
			companyName={company.name}
			ownerId={company.owner?.id ?? null}
			onDone={onDone}
		/>
	) : null;

	if (company.deals.length === 0) {
		return (
			<>
				{form}
				{adding ? null : (
					<DetailSheetEmpty
						icon={Partnership}
						title={m.company.noDealsTitle}
						description={m.company.noDealsBody(company.name)}
						action={
							<Button variant="outline" size="sm" onClick={onAdd}>
								<Icon icon={Add} data-icon="inline-start" />
								{m.company.newDeal}
							</Button>
						}
					/>
				)}
				<BangDaLuuTru
					items={company.archivedDeals}
					columns={dealColumns(m)}
					kind="deal"
				/>
			</>
		);
	}

	return (
		<>
			{form}
			<SimpleTable variant="panel" columns={dealColumns(m)}>
				{company.deals.map((deal) => (
					<SimpleTableRow
						key={deal.id}
						clickable
						onClick={() => openRecord({ kind: "deal", id: deal.id })}
					>
						<TableCell className="truncate py-2.5 pr-3 pl-5 font-medium">
							{deal.name}
						</TableCell>
						<TableCell className="px-3 py-2.5">
							<DealStageMenu dealId={deal.id} stage={deal.stage} />
						</TableCell>
						<TableCell className="px-3 py-2.5 text-right">
							<DealAmount
								amountCents={deal.amountCents}
								currency={deal.currency}
							/>
						</TableCell>
						<TableCell className="px-3 py-2.5 text-muted-foreground">
							{deal.expectedCloseDate ? (
								<LocalDay date={deal.expectedCloseDate} />
							) : (
								<EmptyCellValue />
							)}
						</TableCell>
						<TableCell className="px-3 py-2.5">
							<OwnerCell owner={deal.owner} />
						</TableCell>
					</SimpleTableRow>
				))}

				<AddRow
					label={m.company.newDeal}
					columns={dealColumns(m).length}
					onClick={onAdd}
				/>
				<DongDaLuuTru
					items={company.archivedDeals}
					columns={dealColumns(m).length}
					kind="deal"
				/>
			</SimpleTable>
		</>
	);
}
