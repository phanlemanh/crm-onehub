"use client";

import Email from "@carbon/icons-react/es/Email";
import Partnership from "@carbon/icons-react/es/Partnership";
import Star from "@carbon/icons-react/es/Star";
import type { FieldValueJson } from "@crm/db/fields";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crm/ui/components/accordion";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { ForeignText } from "@crm/ui/components/foreign-text";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AgentPanel } from "@/components/crm/agent-panel";
import { InlineCompanyField } from "@/components/crm/company-picker";
import { contactName } from "@/components/crm/contact-name";
import { ContactEnrichmentAction } from "@/components/crm/enrichment-actions";
import { EnrichmentIndicator } from "@/components/crm/enrichment-status";
import {
	FactGroupLabel,
	FactProvenance,
	FactSuggestion,
} from "@/components/crm/facts";
import { FieldsCog, RecordFields } from "@/components/crm/fields/record-fields";
import {
	InlineField,
	InlineSelectField,
	savingValue,
} from "@/components/crm/inline-field";
import { OwnerCell } from "@/components/crm/owner-cell";
import { SoDienThoai } from "@/components/crm/so-dien-thoai";
import { ContactSocials } from "@/components/crm/social-links";
import { DealStageMenu } from "@/components/crm/stage-change";
import { Timeline } from "@/components/crm/timeline/timeline";
import { WebsiteActivity } from "@/components/crm/website-activity";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetProse,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import { LocalDateTime, LocalRelativeDate } from "@/components/local-date-time";
import {
	type FactReceipt,
	factsByField,
	giaTriHienTai,
	giaTriTruoc,
} from "@/lib/contact-facts";
import { ENRICHMENT_POLL_MS, isEnriching } from "@/lib/enrichment-status";
import {
	type RecordSheetMessages,
	recordSheetMessages,
} from "@/lib/messages/record-sheet";
import { savingField } from "@/lib/pending-field";
import { hasContactLinks } from "@/lib/social-links";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ContactPlans } from "./contact-plans";
import { DaiLuuTru, KhoaLuuTru, RecordActions } from "./record-actions";
import {
	BangDaLuuTru,
	DealAmount,
	DongDaLuuTru,
	lyDoLoi,
	MetaLine,
	RecordSheetFrame,
} from "./record-parts";
import { useOpenRecord, useRecordSheetView } from "./record-stack";

type Contact = RouterOutputs["contacts"]["byId"];

const NONE = "none";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	month: "short",
	day: "numeric",
	year: "numeric",
};

function dealColumns(m: RecordSheetMessages) {
	const d = m.contact.dealColumns;
	return [
		{ id: "deal", header: d.deal, width: "w-[32%]", className: "pl-5" },
		{ id: "role", header: d.role, width: "w-[16%]" },
		{ id: "stage", header: d.stage, width: "w-[22%]" },
		{
			id: "amount",
			header: d.amount,
			width: "w-[16%]",
			align: "right" as const,
		},
		{ id: "owner", header: d.owner, width: "w-[14%]" },
	];
}

export function ContactSheet({ contactId }: { contactId: string }) {
	const m = recordSheetMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { tab, setTab } = useRecordSheetView("overview");

	const query = useQuery({
		...trpc.contacts.byId.queryOptions({ id: contactId }),
		refetchInterval: (current) => {
			const record = current.state.data;
			return record && isEnriching(record.enrichmentStatus, record.queued)
				? ENRICHMENT_POLL_MS
				: false;
		},
	});
	const contact = query.data;

	const setPrimary = useMutation(
		trpc.companies.setPrimaryContact.mutationOptions({
			onSuccess: async () => {
				await cache.contact(contactId);
				toast.success(m.company.primaryUpdated);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const tabs: DetailSheetTab[] = contact
		? [
				{
					value: "overview",
					label: m.tabs.overview,
					content: <ContactOverview contact={contact} />,
				},
				{
					value: "deals",
					label: m.tabs.deals,
					count: contact.deals.length,
					content: <ContactDeals contact={contact} />,
				},
				{
					value: "activity",
					label: m.tabs.activity,
					content: <Timeline anchor={{ contactId: contact.id }} />,
				},
				{
					value: "agent",
					label: m.tabs.agent,
					content: <AgentPanel record={{ kind: "contact", id: contact.id }} />,
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
			title={contact ? contactName(contact) : m.contact.fallbackTitle}
			description={
				contact ? (
					<MetaLine
						parts={[{ text: contact.title }, { text: contact.company?.name }]}
					/>
				) : undefined
			}
			note={
				contact ? (
					<>
						{contact.isPrimaryContact ? (
							<StatusIndicator
								tone="success"
								label={m.contact.primaryAt(
									contact.company?.name ?? m.contact.thisCompany,
								)}
							/>
						) : null}
						{contact.enrichmentStatus !== "COMPLETE" ? (
							<EnrichmentIndicator
								status={contact.enrichmentStatus}
								queued={contact.queued}
								title={contact.enrichmentError}
							/>
						) : null}
					</>
				) : null
			}
			media={
				<PersonAvatar
					src={contact?.imageUrl}
					name={contact ? contactName(contact) : "?"}
					email={contact?.email}
					size="lg"
				/>
			}
			actions={
				contact ? (
					<>
						<ContactEnrichmentAction contactId={contact.id} />
						{contact.email ? (
							<Button asChild variant="outline" size="sm">
								<a href={`mailto:${contact.email}`}>
									<Icon icon={Email} data-icon="inline-start" />
									<span className="hidden sm:inline">
										{m.contact.fields.email}
									</span>
								</a>
							</Button>
						) : null}
						{contact.company && !contact.isPrimaryContact ? (
							<Button
								variant="outline"
								size="sm"
								disabled={setPrimary.isPending}
								onClick={() =>
									setPrimary.mutate({
										companyId: contact.company?.id ?? "",
										contactId: contact.id,
									})
								}
							>
								<Icon icon={Star} data-icon="inline-start" />
								<span className="hidden sm:inline">
									{m.company.makePrimary}
								</span>
							</Button>
						) : null}
						<RecordActions
							record={{ kind: "contact", id: contact.id }}
							name={contactName(contact)}
							consequence={m.contact.deleteWarning}
							archivedAt={contact.archivedAt}
						/>
					</>
				) : null
			}
			stats={
				contact ? (
					<>
						{contact.archivedAt ? (
							<DaiLuuTru
								record={{ kind: "contact", id: contact.id }}
								archivedAt={contact.archivedAt}
							/>
						) : null}
						<DetailSheetStats>
							<DetailSheetStat label={m.contact.fields.company}>
								{contact.company ? (
									<CompanyStat company={contact.company} />
								) : (
									<EmptyCellValue />
								)}
							</DetailSheetStat>
							<DetailSheetStat label={m.contact.fields.email}>
								{contact.email ? (
									<a
										href={`mailto:${contact.email}`}
										className="underline-offset-2 hover:underline"
									>
										{contact.email}
									</a>
								) : (
									<EmptyCellValue />
								)}
							</DetailSheetStat>
							<DetailSheetStat label={m.contact.fields.phone}>
								{contact.phone ? (
									<SoDienThoai so={contact.phone} goi />
								) : (
									<EmptyCellValue />
								)}
							</DetailSheetStat>
							<DetailSheetStat label={m.contact.fields.owner}>
								<OwnerCell owner={contact.owner} />
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

function CompanyStat({
	company,
}: {
	company: NonNullable<Contact["company"]>;
}) {
	const openRecord = useOpenRecord();

	return (
		<button
			type="button"
			onClick={() => openRecord({ kind: "company", id: company.id })}
			className="flex min-w-0 max-w-full items-center gap-2 underline-offset-2 hover:underline"
		>
			<EntityLogo
				src={company.iconUrl}
				darkSrc={company.iconDarkUrl}
				tone={company.iconTone as EntityLogoTone | null | undefined}
				name={company.name}
				size="xs"
			/>
			<span className="truncate">{company.name}</span>
		</button>
	);
}

const AGENT_FIELDS = [
	"title",
	"linkedinUrl",
	"twitterUrl",
	"githubUrl",
] as const;

function ContactOverview({ contact: banDau }: { contact: Contact }) {
	const m = recordSheetMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const contact =
		useQuery(trpc.contacts.byId.queryOptions({ id: banDau.id })).data ?? banDau;
	const users = useQuery(trpc.users.list.queryOptions());

	const { applied, proposed } = factsByField(contact.facts);
	const [bienNhan, datBienNhan] = useState<Record<string, FactReceipt>>({});

	const agentProps = (field: string) => {
		const fact = applied.get(field);
		const receipt = bienNhan[field];
		const suggestion = receipt?.fact ?? proposed.get(field);
		return {
			provenance: fact ? <FactProvenance fact={fact} /> : undefined,
			suggestion: suggestion ? (
				<FactSuggestion
					fact={suggestion}
					contactId={contact.id}
					current={giaTriHienTai(contact, field)}
					truoc={giaTriTruoc(contact, field)}
					receipt={receipt}
					onReceipt={(next) =>
						datBienNhan((cu) => {
							const { [field]: _bo, ...con } = cu;
							return next ? { ...con, [field]: next } : con;
						})
					}
				/>
			) : undefined,
		};
	};

	const deXuatCho = AGENT_FIELDS.flatMap((field) => {
		const fact = proposed.get(field);
		return fact && !bienNhan[field] ? [fact] : [];
	});

	const update = useMutation(
		trpc.contacts.update.mutationOptions({
			onSuccess: () => cache.contact(contact.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const saveFields = (fields: Record<string, FieldValueJson>) =>
		update.mutate({ id: contact.id, data: { fields } });

	const isSavingField = savingValue(update);

	const save = (data: Record<string, string | null>) =>
		update.mutate({ id: contact.id, data });

	const isSaving = savingField(update);

	return (
		<KhoaLuuTru khoa={contact.archivedAt !== null}>
			<DetailSheetBody>
				<DetailSheetSection
					title={m.contact.details}
					action={
						<div className="flex items-center gap-2">
							<FactGroupLabel facts={deXuatCho} />
							{contact.archivedAt ? null : <FieldsCog kind="contact" />}
						</div>
					}
				>
					<DetailSheetProperties>
						<InlineField
							label={m.contact.fields.firstName}
							value={contact.firstName}
							saving={isSaving("firstName")}
							onSave={(firstName) => firstName && save({ firstName })}
						/>
						<InlineField
							label={m.contact.fields.lastName}
							value={contact.lastName}
							saving={isSaving("lastName")}
							onSave={(lastName) => save({ lastName })}
						/>
						<InlineField
							label={m.contact.fields.title}
							value={contact.title}
							placeholder={m.contact.fields.titlePlaceholder}
							saving={isSaving("title")}
							onSave={(title) => save({ title })}
							{...agentProps("title")}
						/>
						<InlineField
							label={m.contact.fields.email}
							value={contact.email}
							type="email"
							saving={isSaving("email")}
							onSave={(email) => save({ email })}
						/>
						<InlineField
							label={m.contact.fields.phone}
							value={contact.phone}
							type="tel"
							render={(phone) => <SoDienThoai so={phone} />}
							saving={isSaving("phone")}
							onSave={(phone) => save({ phone })}
						/>
						<InlineField
							label={m.contact.fields.linkedin}
							value={contact.linkedinUrl}
							type="url"
							saving={isSaving("linkedinUrl")}
							onSave={(linkedinUrl) => save({ linkedinUrl })}
							{...agentProps("linkedinUrl")}
						/>
						<InlineField
							label={m.contact.fields.x}
							value={contact.twitterUrl}
							type="url"
							saving={isSaving("twitterUrl")}
							onSave={(twitterUrl) => save({ twitterUrl })}
							{...agentProps("twitterUrl")}
						/>
						<InlineField
							label={m.contact.fields.github}
							value={contact.githubUrl}
							type="url"
							saving={isSaving("githubUrl")}
							onSave={(githubUrl) => save({ githubUrl })}
							{...agentProps("githubUrl")}
						/>
						<InlineCompanyField
							value={contact.company?.id ?? NONE}
							company={contact.company}
							saving={isSaving("companyId")}
							none={{ value: NONE, label: m.contact.fields.noCompany }}
							onSave={(companyId) =>
								save({ companyId: companyId === NONE ? null : companyId })
							}
						/>
						<InlineSelectField
							label={m.contact.fields.owner}
							value={contact.owner?.id ?? NONE}
							options={[
								{ value: NONE, label: m.contact.fields.unassigned },
								...(users.data ?? []).map((user) => ({
									value: user.id,
									label: user.name,
								})),
							]}
							onSave={(ownerId) =>
								save({ ownerId: ownerId === NONE ? null : ownerId })
							}
						/>
						<RecordFields
							fields={contact.fields}
							saving={isSavingField}
							onSave={saveFields}
						/>
					</DetailSheetProperties>
				</DetailSheetSection>

				<ContactPlans contactId={contact.id} />

				{contact.brief ? <Background brief={contact.brief} /> : null}

				<WeKnowThem
					relationship={contact.relationship}
					contactName={contactName(contact)}
				/>

				{hasContactLinks(contact) ? (
					<DetailSheetSection title={m.section.links}>
						<ContactSocials contact={contact} />
					</DetailSheetSection>
				) : null}

				<WebsiteActivity contactId={contact.id} />
			</DetailSheetBody>
		</KhoaLuuTru>
	);
}

function Background({ brief }: { brief: NonNullable<Contact["brief"]> }) {
	const m = recordSheetMessages(useLocale());
	const sections = brief.sections;
	const previous = sections.previousRoles ?? [];

	const lines = [
		{ label: m.contact.currentRole, value: sections.currentRole },
		{ label: m.contact.tenure, value: sections.tenure },
		{ label: m.contact.seniority, value: sections.seniority },
		{ label: m.contact.fn, value: sections.function },
		{ label: m.contact.based, value: sections.location },
	].filter((line) => Boolean(line.value));

	return (
		<DetailSheetSection
			title={m.section.background}
			action={
				<span className="text-muted-foreground text-xs">
					{brief.sourceUrl ? (
						<a
							href={brief.sourceUrl}
							target="_blank"
							rel="noreferrer noopener"
							className="underline-offset-2 hover:underline"
						>
							{m.contact.source}
						</a>
					) : null}
					{brief.sourceUrl ? " · " : null}
					<LocalDateTime date={brief.refreshedAt} options={DATE_OPTIONS} />
				</span>
			}
		>
			<DetailSheetProse>
				<ForeignText lang="en">{brief.narrative}</ForeignText>
			</DetailSheetProse>

			<DetailSheetProperties>
				{lines.map((line) => (
					<DetailSheetProperty key={line.label} label={line.label}>
						{line.value}
					</DetailSheetProperty>
				))}

				{previous.length > 0 ? (
					<DetailSheetProperty label={m.contact.previously} wide>
						<PreviousRoles roles={previous} />
					</DetailSheetProperty>
				) : null}
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}

function PreviousRoles({ roles }: { roles: string[] }) {
	const m = recordSheetMessages(useLocale());
	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="previous">
				<AccordionTrigger variant="subtle">
					{roles.length === 1
						? m.contact.oneRole
						: m.contact.roles(String(roles.length))}
				</AccordionTrigger>
				<AccordionContent>
					<ul className="space-y-1">
						{roles.map((role) => (
							<li key={role}>{role}</li>
						))}
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function WeKnowThem({
	relationship,
	contactName: name,
}: {
	relationship: Contact["relationship"];
	contactName: string;
}) {
	const m = recordSheetMessages(useLocale());
	const { emails, meetings, lastReplyAt, nextMeeting, colleagues } =
		relationship;

	if (emails === 0 && meetings === 0 && colleagues.length === 0) return null;

	const first = name.split(" ")[0] ?? name;

	return (
		<DetailSheetSection title={m.contact.weKnowThem}>
			<DetailSheetProperties>
				{emails > 0 ? (
					<DetailSheetProperty label={m.contact.emails}>
						<span className="tabular-nums">{emails}</span>
						<span className="text-muted-foreground">
							{" · "}
							{lastReplyAt ? (
								<>
									{m.contact.lastReply} <LocalRelativeDate date={lastReplyAt} />
								</>
							) : (
								m.contact.neverReplied(first)
							)}
						</span>
					</DetailSheetProperty>
				) : null}

				{meetings > 0 ? (
					<DetailSheetProperty label={m.contact.meetings}>
						<span className="tabular-nums">{meetings}</span>
					</DetailSheetProperty>
				) : null}

				{nextMeeting ? (
					<DetailSheetProperty label={m.contact.nextMeeting} wide>
						{nextMeeting.title ?? m.contact.meetingFallback}
						<span className="text-muted-foreground">
							{" · "}
							<LocalDateTime
								date={nextMeeting.startsAt}
								options={DATE_OPTIONS}
							/>
						</span>
					</DetailSheetProperty>
				) : null}

				{colleagues.length > 0 ? (
					<DetailSheetProperty label={m.contact.alsoHere} wide>
						<Colleagues colleagues={colleagues} />
					</DetailSheetProperty>
				) : null}
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}

function Colleagues({
	colleagues,
}: {
	colleagues: Contact["relationship"]["colleagues"];
}) {
	const _m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();

	return (
		<span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
			{colleagues.map((colleague) => (
				<button
					key={colleague.id}
					type="button"
					onClick={() => openRecord({ kind: "contact", id: colleague.id })}
					className="min-w-0 truncate underline-offset-2 hover:underline"
				>
					{colleague.name}
					{colleague.title ? (
						<span className="text-muted-foreground"> ({colleague.title})</span>
					) : null}
				</button>
			))}
		</span>
	);
}

function ContactDeals({ contact }: { contact: Contact }) {
	const m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();

	if (contact.deals.length === 0) {
		return (
			<>
				<DetailSheetEmpty
					icon={Partnership}
					title={m.contact.notOnDealsTitle}
					description={m.contact.notOnDealsBody(contactName(contact))}
				/>
				<BangDaLuuTru
					items={contact.archivedDeals}
					columns={dealColumns(m)}
					kind="deal"
				/>
			</>
		);
	}

	return (
		<SimpleTable variant="panel" columns={dealColumns(m)}>
			{contact.deals.map((deal) => (
				<SimpleTableRow
					key={deal.id}
					clickable
					onClick={() => openRecord({ kind: "deal", id: deal.id })}
				>
					<TableCell className="truncate py-2.5 pr-3 pl-5 font-medium">
						{deal.name}
					</TableCell>
					<TableCell className="truncate px-3 py-2.5 text-muted-foreground">
						{deal.role ?? <EmptyCellValue />}
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
					<TableCell className="px-3 py-2.5">
						<OwnerCell owner={deal.owner} />
					</TableCell>
				</SimpleTableRow>
			))}
			<DongDaLuuTru
				items={contact.archivedDeals}
				columns={dealColumns(m).length}
				kind="deal"
			/>
		</SimpleTable>
	);
}
